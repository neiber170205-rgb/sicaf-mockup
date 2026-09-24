/* =====================================================================
   09-admin/mockup/prototipo.js

   Hace que el mockup de Admin. Usuarios RESPONDA: filtra las tablas, crea
   usuarios, cambia roles, suspende y reactiva accesos, corre respaldos y
   pasa de una pantalla a otra sin recargar.

   Mismo motor que el de los demás módulos, con lo propio de este.
   Los datos viven en la pantalla: con F5 vuelve todo a como estaba.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- 1. Ayudas */

  function uno(sel, ctx) { return (ctx || document).querySelector(sel); }
  function todos(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function numero(texto) {
    var n = parseInt(String(texto).replace(/[^\d-]/g, ""), 10);
    return isNaN(n) ? 0 : n;
  }
  function miles(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  function pesos(n) { return "$" + miles(n); }
  function hoy() { return new Date().toISOString().slice(0, 10); }
  function ahora() {
    var d = new Date();
    return hoy() + " " + String(d.getHours()).padStart(2, "0") + ":" +
           String(d.getMinutes()).padStart(2, "0");
  }
  /* El siguiente número de un consecutivo: MR-0004 -> MR-0005 */
  function siguiente(codigo) {
    var m = String(codigo).match(/^(.*?)(\d+)$/);
    if (!m) return codigo;
    var n = String(parseInt(m[2], 10) + 1);
    while (n.length < m[2].length) n = "0" + n;
    return m[1] + n;
  }
  function pagina() { return uno(".page"); }
  function panelDe(nodo) { return nodo.closest(".panel"); }
  function tablaDe(panel) { return uno("table", panel); }
  /* La celda de una fila, buscada por el rótulo que ya trae el mockup */
  function celda(fila, etiqueta) { return uno('[data-l="' + etiqueta + '"]', fila); }
  function ponerCelda(fila, etiqueta, html) {
    var td = celda(fila, etiqueta);
    if (td) td.innerHTML = html;
    return td;
  }

  /* ---------------------------------------------------------------- 2. Aviso flotante */

  var flash;
  function aviso(texto, tono) {
    if (!flash) {
      flash = document.createElement("div");
      flash.className = "flash";
      flash.setAttribute("role", "status");
      document.body.appendChild(flash);
    }
    flash.className = "flash flash--" + (tono || "ok") + " is-on";
    flash.textContent = texto;
    clearTimeout(flash._t);
    flash._t = setTimeout(function () { flash.classList.remove("is-on"); }, 3200);
  }

  /* ---------------------------------------------------------------- 3. Filtros de las tablas */

  function filtrar(tools) {
    var cuerpo = tools.parentNode;
    var tabla = uno("table", cuerpo);
    if (!tabla) return;

    var caja = uno('input[type="search"]', tools);
    var sel = uno("select", tools);
    var texto = caja ? caja.value.trim().toLowerCase() : "";
    var palabras = [];
    if (sel && sel.selectedIndex > 0) {
      palabras = sel.value.toLowerCase().split(/\s+/).filter(function (p) { return p.length > 3; });
    }

    var filas = todos("tbody tr", tabla);
    filas.forEach(function (fila) {
      var t = fila.textContent.toLowerCase();
      var pasa = (!texto || t.indexOf(texto) >= 0) &&
                 palabras.every(function (p) { return t.indexOf(p) >= 0; });
      fila.dataset.pasa = pasa ? "si" : "no";
    });

    var vacio = uno(".sin-filas", cuerpo);
    if (!vacio) {
      vacio = document.createElement("p");
      vacio.className = "empty sin-filas";
      vacio.textContent = "Ninguna fila coincide con lo que buscó.";
      tabla.parentNode.appendChild(vacio);
    }

    var dt = tools.classList.contains("dt") ? tools : tabla.closest(".dt");
    if (dt) { dt.dataset.pag = 1; dtPintar(dt); return; }

    /* tablas viejas, sin el bloque .dt */
    var vistas = 0;
    filas.forEach(function (f) {
      var pasa = f.dataset.pasa !== "no";
      f.style.display = pasa ? "" : "none";
      if (pasa) vistas++;
    });
    vacio.style.display = vistas ? "none" : "";
    var pie = uno(".tabla-pie", cuerpo);
    if (pie) {
      if (!pie.dataset.original) pie.dataset.original = pie.textContent;
      pie.textContent = (texto || palabras.length)
        ? "Mostrando " + vistas + " de " + filas.length + " filas que coinciden con el filtro"
        : pie.dataset.original;
    }
  }

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.matches && t.matches('.tabla-tools input[type="search"], .dt input[type="search"]'))
      filtrar(t.closest(".tabla-tools, .dt"));
  });
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.matches && t.matches(".tabla-tools select, .dt__filtros select"))
      filtrar(t.closest(".tabla-tools, .dt"));
  });

  /* ---------------------------------------------------------------- 4. Ir de una pantalla a otra */

  var PRIMERA = "01-inicio.html";
  var ES_PANTALLA = /^\d\d-[a-z-]+\.html$/;
  var actual = (location.pathname.split("/").pop() || "01-inicio.html");
  if (!ES_PANTALLA.test(actual)) actual = "01-inicio.html";
  var guardadas = {};   // lo que el usuario ya cambió en cada pantalla

  function marcarMenu() {
    todos(".nav__si").forEach(function (a) {
      a.classList.toggle("is-on", a.getAttribute("href") === actual);
    });
  }

  function pintar(nodos) {
    var p = pagina();
    while (p.firstChild) p.removeChild(p.firstChild);
    nodos.forEach(function (n) { p.appendChild(n); });
  }

  function ir(archivo, guardarEnHistorial) {
    if (archivo === actual || !pagina()) return;
    guardadas[actual] = Array.prototype.slice.call(pagina().childNodes);

    function terminar() {
      actual = archivo;
      marcarMenu();
  setTimeout(dtArrancar, 0);
      if (guardarEnHistorial) history.pushState({ pantalla: archivo }, "", archivo);
      window.scrollTo(0, 0);
      var p = pagina();
      if (p.parentNode) p.parentNode.scrollTop = 0;
      dtArrancar();
    }

    if (guardadas[archivo]) {
      pintar(guardadas[archivo]);
      terminar();
      return;
    }

    fetch(archivo)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var sub = uno(".subnav", doc);
        if (sub) sub.parentNode.removeChild(sub);
        todos("script", doc).forEach(function (s) { s.parentNode.removeChild(s); });
        pintar(Array.prototype.slice.call(doc.body.childNodes));
        if (doc.title) document.title = doc.title;
        terminar();
      })
      .catch(function () { location.href = archivo; });   // sin servidor, se navega normal
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href");
    if (!ES_PANTALLA.test(href)) return;
    e.preventDefault();
    ir(href, true);
  });

  window.addEventListener("popstate", function (e) {
    var destino = (e.state && e.state.pantalla) || (location.pathname.split("/").pop());
    if (ES_PANTALLA.test(destino)) ir(destino, false);
  });

  /* ---------------------------------------------------------------- 5. El contador de la campana */

  function contarPendientes(delta) {
    var campana = uno(".bell__n");
    if (campana) {
      var c = Math.max(0, numero(campana.textContent) + delta);
      campana.textContent = c;
      campana.style.display = c ? "" : "none";
    }
  }

  /* La campanita lleva a donde este módulo tiene sus alertas.
     Si el módulo no maneja alertas, la campanita se queda sin número. */
  var PANTALLA_ALERTAS = null;

  if (!PANTALLA_ALERTAS) {
    var globo = uno(".bell__n");
    if (globo) globo.style.display = "none";
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest(".bell")) return;
    e.preventDefault();

    function mostrar() {
      var panel = todos(".panel").filter(function (x) {
        var h = uno("h2", x);
        return h && /alerta|novedad|pendiente/i.test(h.textContent);
      })[0];
      if (panel) {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
        panel.classList.add("es-nueva");
        return;
      }
      aviso("Este módulo no maneja alertas propias.", "ok");
    }

    if (PANTALLA_ALERTAS && actual !== PANTALLA_ALERTAS) {
      ir(PANTALLA_ALERTAS, true);
      setTimeout(mostrar, 280);
    } else {
      mostrar();
    }
  });


  /* ---------------------------------------------------------------- Pendientes de la lista */

  document.addEventListener("click", function (e) {
    var item = e.target.closest ? e.target.closest(".pend__i") : null;
    if (!item) return;
    e.preventDefault();
    if (!item.classList.contains("es-atendida")) {
      item.classList.add("es-atendida");
      contarPendientes(-1);
    }
    var destino = item.getAttribute("data-ir");
    if (destino && ES_PANTALLA.test(destino)) ir(destino, true);
  });

  /* ---------------------------------------------------------------- 6. Contadores del menú */

  function sumarAlMenu(archivo, delta) {
    var a = todos(".nav__si").filter(function (x) { return x.getAttribute("href") === archivo; })[0];
    if (!a) return;
    var ct = uno(".ct", a);
    if (!ct) {
      ct = document.createElement("span");
      ct.className = "ct";
      ct.textContent = "0";
      a.appendChild(ct);
    }
    ct.textContent = Math.max(0, numero(ct.textContent) + delta);
  }

  function panelPorTitulo(titulo) {
    return todos(".panel", pagina()).filter(function (p) {
      var h = uno("h2", p);
      return h && h.textContent.trim() === titulo;
    })[0];
  }

  /* Agrega una fila copiando la primera (así conserva la forma de la tabla).
     Si la tabla está de la más reciente a la más vieja, entra arriba; si no, abajo. */
  function nuevaFila(panel, etiqueta) {
    var cuerpo = uno("tbody", tablaDe(panel));
    var fila = cuerpo.rows[0].cloneNode(true);
    fila.classList.add("es-nueva");
    fila.style.display = "";
    var arriba = true;
    if (etiqueta && cuerpo.rows.length > 1) {
      arriba = cola(codigoDeFila(cuerpo.rows[0], etiqueta)) >=
               cola(codigoDeFila(cuerpo.rows[cuerpo.rows.length - 1], etiqueta));
    }
    if (arriba) cuerpo.insertBefore(fila, cuerpo.rows[0]);
    else cuerpo.appendChild(fila);
    return fila;
  }

  function codigoDeFila(fila, etiqueta) {
    var td = celda(fila, etiqueta);
    if (!td) return "";
    /* El código va en el <b> de la celda. Si se lee el textContent completo se
       pega con el texto pequeño de abajo (CL-003 + el NIT) y el consecutivo sale mal. */
    var fuerte = td.querySelector("b");
    return (fuerte ? fuerte.textContent : td.textContent).trim().split(/\s+/)[0];
  }

  function cola(codigo) {
    var m = String(codigo).match(/(\d+)\s*$/);
    return m ? parseInt(m[1], 10) : 0;
  }

  /* El consecutivo que sigue, mirando TODAS las filas y no solo la primera */
  function siguienteCodigo(panel, etiqueta) {
    var codigos = todos("tbody tr", tablaDe(panel)).map(function (tr) {
      return codigoDeFila(tr, etiqueta);
    }).filter(Boolean);
    if (!codigos.length) return "NUEVO-1";
    var mayor = codigos.reduce(function (a, b) {
      return cola(b) > cola(a) ? b : a;
    });
    return siguiente(mayor);
  }

  function recontar(panel, sufijo) {
    var cuerpo = uno("tbody", tablaDe(panel));
    var pie = uno(".tabla-pie", panel);
    var n = cuerpo.rows.length;
    if (pie) {
      pie.dataset.original = "Mostrando " + n + " de " + n + " " + sufijo + " · actualizado " + ahora();
      pie.textContent = pie.dataset.original;
    }
    return n;
  }


  /* ---------------------------------------------------------------- 7. Lo propio de Administración */

  function crearUsuario() {
    var nombre = uno("#us-nombre"), correo = uno("#us-correo");
    var area = uno("#us-area"), rol = uno("#us-rol");
    if (!nombre || !nombre.value.trim()) { if (nombre) nombre.focus(); return aviso("Escriba el nombre del empleado.", "crit"); }
    if (!correo || !correo.value.trim()) { correo.focus(); return aviso("Escriba el correo con el que va a entrar.", "crit"); }

    var panel = panelPorTitulo("Usuarios del Sistema");
    if (!panel) return aviso("Usuario creado.", "ok");

    var codigo = siguienteCodigo(panel, "Código");
    var fila = nuevaFila(panel, "Código");
    var quien = nombre.value.trim();
    var puesto = rol ? rol.value : "Operario";
    var color = { "Gerente": "vino", "Supervisor": "cobre", "Operario": "oliva", "Auditor": "arena" }[puesto] || "oliva";

    ponerCelda(fila, "Usuario", '<div class="who"><span class="avatar avatar--sm" style="background:var(--vino-600)">' +
               quien.charAt(0).toUpperCase() + "</span><div><b>" + quien + "</b><small>" +
               correo.value.trim() + "</small></div></div>");
    ponerCelda(fila, "Código", "<b>" + codigo + "</b>");
    ponerCelda(fila, "Módulo", '<span class="chip chip--oliva">' + (area ? area.value : "") + "</span>");
    ponerCelda(fila, "Rol", '<span class="chip chip--' + color + '">' + puesto + "</span>");
    ponerCelda(fila, "Último ingreso", "Nunca ha entrado");
    ponerCelda(fila, "Estado", '<span class="pill pill--warn">Clave temporal</span>');
    recontar(panel, "usuarios");
    sumarAlMenu("02-usuarios.html", 1);
    nombre.value = "";
    correo.value = "";
    aviso(quien + " queda creado como " + codigo + " · entra con clave temporal y la cambia la primera vez.", "ok");
  }

  function respaldarAhora() {
    var panel = panelPorTitulo("Respaldos Hechos");
    if (!panel) return aviso("Respaldo hecho.", "ok");
    var fila = nuevaFila(panel, "");
    var f = new Date();
    var hora = f.toTimeString().slice(0, 5);
    ponerCelda(fila, "Fecha", "<b>" + hoy() + '</b><div class="tiny">' + hora + "</div>");
    ponerCelda(fila, "Tipo", "A mano");
    ponerCelda(fila, "Tamaño", "1,4 GB");
    ponerCelda(fila, "Estado", '<span class="pill pill--ok">Completo</span>');
    ponerCelda(fila, "Archivo", hoy().replace(/-/g, "") + "-" + hora.replace(":", "") + ".bak");
    recontar(panel, "respaldos");
    aviso("Respaldo hecho a mano · queda marcado aparte del automático.", "ok");
  }

  var ESTADOS = {
    "Suspender":  { pill: "crit", texto: "Suspendido", dice: "queda suspendido · conserva su historial en la bitácora", tono: "warn" },
    "Reactivar":  { pill: "ok",   texto: "Activo",     dice: "vuelve a tener acceso a su módulo",  tono: "ok" },
    "Reintentar": { pill: "ok",   texto: "Completo",   dice: "corrió bien esta vez",               tono: "ok", menos: "06-respaldos.html" },
    "Restaurar":  { pill: "warn", texto: "Restaurando", dice: "devuelve TODO el sistema a esa fecha", tono: "warn" }
  };

  var RAPIDAS = {
    "usuario":  { a: "02-usuarios.html",  dice: "Llene el nombre, el correo, el módulo y el rol." },
    "rol":      { a: "03-roles.html",     dice: "Revise quién hace y quién autoriza cada acción delicada." },
    "respaldo": { a: "06-respaldos.html", dice: "Desde aquí se corre el respaldo a mano." }
  };

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button") : null;
    if (!b) return;
    var texto = b.textContent.trim();

    var rapida = b.getAttribute("data-rapida");
    if (rapida && RAPIDAS[rapida]) {
      e.preventDefault();
      aviso(RAPIDAS[rapida].dice, "ok");
      return ir(RAPIDAS[rapida].a, true);
    }

    var lleva = b.getAttribute("data-ir");
    if (lleva && ES_PANTALLA.test(lleva)) { e.preventDefault(); return ir(lleva, true); }

    if (texto === "Crear usuario")      { e.preventDefault(); return crearUsuario(); }
    if (texto === "Hacer respaldo ahora") { e.preventDefault(); return respaldarAhora(); }

    if (texto === "Cambiar rol") {
      e.preventDefault();
      var f = b.closest("tr");
      if (!f) return;
      var td = celda(f, "Rol");
      if (!td) return;
      var actual2 = td.textContent.trim();
      var orden = ["Operario", "Supervisor", "Gerente", "Auditor"];
      var sigue = orden[(orden.indexOf(actual2) + 1) % orden.length];
      var color = { "Gerente": "vino", "Supervisor": "cobre", "Operario": "oliva", "Auditor": "arena" }[sigue];
      td.innerHTML = '<span class="chip chip--' + color + '">' + sigue + "</span>";
      f.classList.add("es-nueva");
      var quien = (f.querySelector("b") || {}).textContent || "El usuario";
      return aviso(quien + " pasa de " + actual2 + " a " + sigue + " · queda en la bitácora.", "warn");
    }

    if (texto === "Editar permisos") {
      e.preventDefault();
      return aviso("Los permisos del rol se editan casilla por casilla en el sistema real.", "warn");
    }
    if (texto === "Cambiar") {
      e.preventDefault();
      return aviso("En el sistema real esto abre el campo para escribir el valor nuevo.", "warn");
    }

    if (ESTADOS[texto]) {
      e.preventDefault();
      var destino = ESTADOS[texto];
      var fila = b.closest("tr");
      if (!fila) return;
      var est = celda(fila, "Estado");
      if (est) est.innerHTML = '<span class="pill pill--' + destino.pill + '">' + destino.texto + "</span>";
      fila.classList.add("es-nueva");
      b.disabled = true;
      if (destino.menos) sumarAlMenu(destino.menos, -1);
      var cual = (fila.querySelector("b") || {}).textContent || "El registro";
      return aviso(cual + " " + destino.dice + ".", destino.tono);
    }
  });

  /* ---------------------------------------------------------------- 8. Arranque */

  marcarMenu();
  history.replaceState({ pantalla: actual }, "", actual);


  /* ---------------------------------------------------------------- Las tarjetas de indicador

     Cada tarjeta es un botón: unas llevan a la pantalla donde vive ese número,
     otras filtran la tabla de abajo. */

  document.addEventListener("click", function (e) {
    var k = e.target.closest ? e.target.closest("[data-kpi]") : null;
    if (!k) return;
    e.preventDefault();

    var orden = k.getAttribute("data-kpi");
    var dice = k.getAttribute("data-dice") || "";

    if (orden.indexOf("url:") === 0) { location.href = orden.slice(4); return; }

    if (orden.indexOf("ir:") === 0) {
      aviso("Le abro " + dice + ".", "ok");
      return ir(orden.slice(3), true);
    }

    if (orden.indexOf("ver:") === 0) {
      var titulo = orden.slice(4).toLowerCase();
      var panel = todos(".panel").filter(function (x) {
        var h = uno("h2", x);
        return h && h.textContent.trim().toLowerCase() === titulo;
      })[0];
      if (!panel) return aviso("Esa parte no está en esta pantalla.", "warn");
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      panel.classList.add("es-nueva");
      return;
    }

    if (orden.indexOf("filtro:") === 0) {
      var termino = orden.slice(7);
      var dt = uno(".dt");
      var caja = dt && uno('input[type="search"]', dt);
      if (!caja) return aviso("Aquí no hay tabla que filtrar.", "warn");

      var estaba = k.classList.contains("is-on");
      todos("[data-kpi]").forEach(function (x) {
        x.classList.remove("is-on");
        x.setAttribute("aria-pressed", "false");
      });
      caja.value = estaba ? "" : termino;
      if (!estaba) { k.classList.add("is-on"); k.setAttribute("aria-pressed", "true"); }
      filtrar(dt);
      dt.scrollIntoView({ behavior: "smooth", block: "start" });
      return aviso(estaba ? "Se quitó el filtro: vuelve a verse todo."
                          : "Tabla filtrada: " + dice + ".", "ok");
    }
  });

  /* ---------------------------------------------------------------- La tabla de datos, viva

     Ordenar por columna, pasar páginas, cambiar cuántas filas se ven, esconder
     columnas y bajar lo que está en pantalla. Todo sobre el mismo bloque .dt.
  */

  function dtTabla(dt) { return uno("table", dt); }
  function dtFilas(dt) { return todos("tbody tr", dtTabla(dt)); }

  /* Las que pasan el filtro; si nunca se filtró, pasan todas */
  function dtPasan(dt) {
    return dtFilas(dt).filter(function (f) { return f.dataset.pasa !== "no"; });
  }

  function dtTam(dt) {
    var s = uno(".dt__tam select", dt);
    return s ? numero(s.value) || 10 : 10;
  }

  /* Reparte las filas en páginas y reescribe el pie */
  function dtPintar(dt) {
    var pasan = dtPasan(dt), tam = dtTam(dt);
    var paginas = Math.max(1, Math.ceil(pasan.length / tam));
    var pag = Math.min(Math.max(1, numero(dt.dataset.pag || "1")), paginas);
    dt.dataset.pag = pag;

    dtFilas(dt).forEach(function (f) { f.style.display = "none"; });
    var desde = (pag - 1) * tam;
    pasan.slice(desde, desde + tam).forEach(function (f) { f.style.display = ""; });

    var info = uno(".dt__info", dt);
    if (info) {
      info.innerHTML = pasan.length
        ? "Mostrando <b>" + (desde + 1) + "–" + Math.min(desde + tam, pasan.length) +
          "</b> de <b>" + pasan.length + "</b> registro(s)"
        : "Ninguna fila coincide con lo que buscó.";
    }

    var pager = uno(".dt__pager", dt);
    if (pager) {
      var h = ['<button class="dt__pag dt__pag--n" ' + (pag === 1 ? "disabled " : "") +
               'data-pag="' + (pag - 1) + '" aria-label="‹">‹</button>'];
      var primera = Math.max(1, Math.min(pag - 2, paginas - 4));
      for (var i = primera; i <= Math.min(paginas, primera + 4); i++) {
        h.push('<button class="dt__pag' + (i === pag ? " is-on" : "") + '" data-pag="' + i + '"' +
               (i === pag ? ' aria-current="page"' : "") + ">" + i + "</button>");
      }
      h.push('<button class="dt__pag dt__pag--n" ' + (pag === paginas ? "disabled " : "") +
             'data-pag="' + (pag + 1) + '" aria-label="›">›</button>');
      pager.innerHTML = h.join("");
    }

    var vacio = uno(".sin-filas", dt);
    if (vacio) vacio.style.display = pasan.length ? "none" : "";
  }

  /* Ordenar por la columna que se pulse */
  function dtOrdenar(dt, indice, boton) {
    var cuerpo = uno("tbody", dtTabla(dt));
    var filas = dtFilas(dt);
    var arriba = boton.dataset.dir !== "asc";
    todos(".dt__orden", dt).forEach(function (o) {
      if (o !== boton) { o.dataset.dir = ""; uno(".dt__ind", o).textContent = "⇅"; }
      o.closest("th").classList.remove("is-on");
      o.closest("th").removeAttribute("aria-sort");
    });
    boton.dataset.dir = arriba ? "asc" : "des";
    uno(".dt__ind", boton).textContent = arriba ? "▲" : "▼";
    boton.closest("th").classList.add("is-on");
    boton.closest("th").setAttribute("aria-sort", arriba ? "ascending" : "descending");

    function valor(f) {
      var c = f.cells[indice];
      return c ? c.textContent.replace(/\s+/g, " ").trim() : "";
    }
    var numerico = filas.every(function (f) {
      var t = valor(f).replace(/[$\s.]/g, "").replace(",", ".");
      return t === "" || t === "—" || !isNaN(parseFloat(t));
    });

    filas.sort(function (a, b) {
      var x = valor(a), y = valor(b);
      if (numerico) {
        x = parseFloat(x.replace(/[$\s.]/g, "").replace(",", ".")) || 0;
        y = parseFloat(y.replace(/[$\s.]/g, "").replace(",", ".")) || 0;
        return arriba ? x - y : y - x;
      }
      return arriba ? x.localeCompare(y, "es") : y.localeCompare(x, "es");
    });
    filas.forEach(function (f) { cuerpo.appendChild(f); });
    dt.dataset.pag = 1;
    dtPintar(dt);
  }

  /* Esconder o mostrar columnas */
  function dtColumnas(dt, boton) {
    var caja = uno(".dt__cols", dt);
    if (caja) {
      caja.remove();
      boton.setAttribute("aria-expanded", "false");
      return;
    }
    caja = document.createElement("div");
    caja.className = "dt__cols";
    var th = todos("thead th", dtTabla(dt));
    caja.innerHTML = th.map(function (c, i) {
      var nombre = c.textContent.replace(/[⇅▲▼]/g, "").trim();
      if (!nombre) return "";
      return '<label><input type="checkbox" data-col="' + i + '"' +
             (c.style.display === "none" ? "" : " checked") + "> " + nombre + "</label>";
    }).join("");
    boton.closest(".dt__acts").appendChild(caja);
    boton.setAttribute("aria-expanded", "true");
  }

  function dtVerColumna(dt, indice, ver) {
    var t = dtTabla(dt);
    todos("tr", t).forEach(function (f) {
      var c = f.cells[indice];
      if (c) c.style.display = ver ? "" : "none";
    });
  }

  /* Bajar a un archivo lo que se ve en pantalla */
  function dtExportar(dt) {
    var t = dtTabla(dt);
    var cab = todos("thead th", t).filter(function (c) { return c.style.display !== "none"; })
      .map(function (c) { return c.textContent.replace(/[⇅▲▼]/g, "").trim(); });
    var lineas = [cab];
    dtPasan(dt).forEach(function (f) {
      lineas.push(todos("td", f).filter(function (c) { return c.style.display !== "none"; })
        .map(function (c) { return c.textContent.replace(/\s+/g, " ").trim(); }));
    });
    var texto = lineas.map(function (l) {
      return l.map(function (v) { return '"' + v.replace(/"/g, '""') + '"'; }).join(";");
    }).join("\n");

    var nombre = "sicaf-" + (dt.id || "tabla") + "-" + hoy() + ".csv";
    try {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob(["﻿" + texto], { type: "text/csv;charset=utf-8" }));
      a.download = nombre;
      document.body.appendChild(a);
      a.click();
      a.remove();
      aviso("Reporte bajado: " + nombre + " · " + (lineas.length - 1) + " fila(s). Se abre con Excel.", "ok");
    } catch (x) {
      aviso("Aquí el navegador no deja bajar archivos. En el sistema real saldría " +
            nombre + " con " + (lineas.length - 1) + " fila(s).", "warn");
    }
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t.closest) return;

    var orden = t.closest(".dt__orden");
    if (orden) {
      e.preventDefault();
      var th = orden.closest("th");
      return dtOrdenar(orden.closest(".dt"), todos("thead th", th.closest("table")).indexOf(th), orden);
    }

    var pag = t.closest(".dt__pag");
    if (pag && !pag.disabled) {
      e.preventDefault();
      var dt = pag.closest(".dt");
      dt.dataset.pag = pag.getAttribute("data-pag");
      dtPintar(dt);
      dtTabla(dt).scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    var b = t.closest(".dt__b");
    if (b) {
      e.preventDefault();
      var dt2 = b.closest(".dt");
      if (b.textContent.indexOf("Columnas") >= 0) return dtColumnas(dt2, b);
      return dtExportar(dt2);
    }
  });

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!t.closest) return;
    if (t.matches(".dt__tam select")) {
      var dt = t.closest(".dt");
      dt.dataset.pag = 1;
      return dtPintar(dt);
    }
    if (t.matches(".dt__cols input")) {
      var dt2 = t.closest(".dt");
      return dtVerColumna(dt2, numero(t.getAttribute("data-col")), t.checked);
    }
  });

  /* Al entrar, y cada vez que se cambia de pantalla, las tablas se reparten en páginas */
  function dtArrancar() { todos(".dt").forEach(dtPintar); }

})();
