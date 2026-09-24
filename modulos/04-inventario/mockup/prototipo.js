/* =====================================================================
   04-inventario/mockup/prototipo.js

   Hace que el mockup de Inventario RESPONDA: filtra las tablas, registra
   movimientos, cambia estados y pasa de una pantalla a otra sin recargar.

   Es del módulo 04-inventario y solo se usa en esta carpeta. No toca
   comun/ ni ninguna otra carpeta. Se carga DESPUÉS de comun/marco.js,
   con la última línea de cada pantalla.

   Los datos viven en la pantalla, no en una base: al recargar el
   navegador (F5) todo vuelve a como estaba. Es un prototipo, no el
   programa.
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
  var PANTALLA_ALERTAS = "01-inicio.html";

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


  /* ---------------------------------------------------------------- Pendientes de la lista

     Cada aviso lleva a la pantalla donde se resuelve y queda marcado como atendido. */

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

  /* ---------------------------------------------------------------- 7. Registrar movimientos */

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

  /* Solo el número del final de un código: OC-2026-014 -> 14, ME-001 -> 1.
     Sin esto, dos códigos del mismo año se leen igual y el consecutivo se repite. */
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
    var mayor = codigos.reduce(function (a, b) { return cola(b) > cola(a) ? b : a; });
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

  /* --- Merma (05) --- */
  function registrarMerma() {
    var ref = uno("#mr-ref"), cant = uno("#mr-cant"), etapa = uno("#mr-etapa"), causa = uno("#mr-causa");
    var unidades = numero(cant.value);
    if (!unidades || unidades < 1) { cant.focus(); return aviso("Escriba una cantidad mayor que cero.", "crit"); }
    if (!causa.value.trim()) { causa.focus(); return aviso("Escriba la causa de la merma.", "crit"); }

    var panel = panelPorTitulo("Merma Registrada");
    if (!panel) return aviso("Merma registrada.", "ok");

    var previa = uno("tbody tr", tablaDe(panel));
    var codigo = siguienteCodigo(panel, "Registro");
    var unitario = Math.round(numero(celda(previa, "Costo").textContent) /
                              Math.max(1, numero(celda(previa, "Cantidad").textContent)));

    var fila = nuevaFila(panel, "Registro");
    ponerCelda(fila, "Registro", "<b>" + codigo + "</b><div class=\"tiny\">" + hoy() + "</div>");
    ponerCelda(fila, "Origen", '<span class="chip chip--cobre">Inventario</span>');
    ponerCelda(fila, "Referencia", ref.value);
    ponerCelda(fila, "Cantidad", String(unidades));
    ponerCelda(fila, "Causa", causa.value.trim() + '<div class="tiny">Etapa de ' +
               etapa.value.toLowerCase() + "</div>");
    ponerCelda(fila, "Costo", pesos(unidades * unitario));
    ponerCelda(fila, "Responsable", "Andrés Suárez");

    /* los totales del pie de la tabla */
    var tfoot = uno("tfoot tr", tablaDe(panel));
    if (tfoot) {
      var tds = todos("td", tfoot);
      tds.forEach(function (td) {
        if (td.classList.contains("num")) {
          td.textContent = td.textContent.indexOf("$") >= 0
            ? pesos(numero(td.textContent) + unidades * unitario)
            : miles(numero(td.textContent) + unidades);
        }
      });
      var primero = tds[0];
      if (primero) primero.innerHTML = primero.innerHTML.replace(/<b>\d+/, "<b>" +
        uno("tbody", tablaDe(panel)).rows.length);
    }
    recontar(panel, "registros");
    sumarAlMenu("05-merma.html", 1);
    causa.value = "";
    cant.value = "1";
    aviso("Merma " + codigo + " registrada: " + unidades + " un de " + ref.value + ".", "ok");
  }

  /* --- Ajuste por conteo físico (02) --- */
  function registrarAjuste() {
    var ins = uno("#f-aj-ins"), cant = uno("#f-aj-cant"), just = uno("#f-aj-just");
    var contado = numero(cant.value);
    if (!cant.value.trim()) { cant.focus(); return aviso("Escriba la cantidad contada.", "crit"); }
    if (!just.value.trim()) { just.focus(); return aviso("El ajuste necesita una justificación.", "crit"); }

    var panel = panelPorTitulo("Saldos por Referencia");
    if (!panel) return aviso("Ajuste registrado.", "ok");

    var clave = ins.value.split("·")[0].trim().toLowerCase();
    var fila = todos("tbody tr", tablaDe(panel)).filter(function (tr) {
      return tr.textContent.toLowerCase().indexOf(clave) >= 0;
    })[0];
    if (!fila) return aviso("No encontré esa referencia en la tabla.", "crit");

    var tdSaldo = celda(fila, "Saldo");
    var antes = numero(tdSaldo.textContent);
    var unidad = (tdSaldo.textContent.match(/[a-zA-Zá-úÁ-Ú²]+\s*$/) || [""])[0].trim();
    tdSaldo.innerHTML = "<b>" + miles(contado) + "</b>" + (unidad ? '<div class="tiny">' + unidad + "</div>" : "");

    var minimo = numero(celda(fila, "Mínimo").textContent);
    var tdEstado = celda(fila, "Estado");
    if (tdEstado) {
      tdEstado.innerHTML = contado < minimo
        ? '<span class="pill pill--crit">Bajo el mínimo</span>'
        : '<span class="pill pill--ok">Suficiente</span>';
    }
    fila.classList.add("es-nueva");
    aviso("Saldo de " + clave.toUpperCase() + " ajustado de " + miles(antes) + " a " +
          miles(contado) + " (" + (contado - antes >= 0 ? "+" : "") + miles(contado - antes) + ").", "ok");
    just.value = "";
  }

  /* --- Solicitud de material a Compras (02) --- */
  function enviarSolicitud() {
    var ins = uno("#sm-ins"), cant = uno("#sm-cant"), urg = uno("#sm-urg"), mot = uno("#sm-mot");
    var unidades = numero(cant.value);
    if (!unidades) { cant.focus(); return aviso("Escriba cuánto material necesita.", "crit"); }

    var panel = panelPorTitulo("Solicitudes Enviadas a Compras");
    if (!panel) return aviso("Solicitud enviada.", "ok");

    var codigo = siguienteCodigo(panel, "Solicitud");
    var fila = nuevaFila(panel, "Solicitud");
    ponerCelda(fila, "Solicitud", "<b>" + codigo + "</b><div class=\"tiny\">" + hoy() + "</div>");
    ponerCelda(fila, "Insumo", ins.value);
    ponerCelda(fila, "Cantidad", miles(unidades));
    ponerCelda(fila, "Urgencia", '<span class="pill pill--' +
      (urg.value.toLowerCase().indexOf("alta") >= 0 ? "crit" : "warn") + '">' + urg.value + "</span>");
    ponerCelda(fila, "Estado", '<span class="pill pill--warn">Enviada</span>');
    if (mot) mot.value = "";
    recontar(panel, "solicitudes");
    aviso("Solicitud " + codigo + " enviada a Compras.", "ok");
  }

  /* --- Asignar rol de bodega (08) --- */
  function asignarRol() {
    var usuario = uno("#us-usuario"), rol = uno("#us-rol"), bodega = uno("#us-bodega");
    var panel = panelPorTitulo("Usuarios de Bodega");
    if (!panel) return aviso("Rol asignado.", "ok");

    var nombre = usuario.value.split("·")[0].trim();
    var fila = todos("tbody tr", tablaDe(panel)).filter(function (tr) {
      return tr.textContent.indexOf(nombre) >= 0;
    })[0];
    if (!fila) fila = nuevaFila(panel);

    ponerCelda(fila, "Usuario", "<b>" + nombre + "</b><div class=\"tiny\">" +
      (usuario.value.split("·")[1] || "").trim() + "</div>");
    ponerCelda(fila, "Rol en bodega", '<span class="chip chip--vino">' + rol.value + "</span>");
    ponerCelda(fila, "Bodega asignada", bodega.value);
    ponerCelda(fila, "Estado", '<span class="pill pill--ok">Activo</span>');
    fila.classList.add("es-nueva");
    recontar(panel, "usuarios");
    aviso(nombre + " queda como " + rol.value.toLowerCase() + " en " + bodega.value + ".", "ok");
  }

  /* --- Generar reporte (09) --- */
  function generarReporte() {
    var tipo = uno("#rp-tipo"), desde = uno("#rp-desde"), hasta = uno("#rp-hasta"), fmt = uno("#rp-formato");
    if (desde.value && hasta.value && desde.value > hasta.value) {
      return aviso("La fecha inicial no puede ser posterior a la final.", "crit");
    }
    var panel = panelPorTitulo("Reportes Generados");
    if (!panel) return aviso("Reporte generado.", "ok");

    var codigo = siguienteCodigo(panel, "Nº");
    var fila = nuevaFila(panel, "Nº");
    ponerCelda(fila, "Nº", "<b>" + codigo + "</b>");
    ponerCelda(fila, "Reporte", tipo.value);
    ponerCelda(fila, "Periodo", desde.value + " a " + hasta.value);
    ponerCelda(fila, "Generado por", "Andrés Suárez");
    ponerCelda(fila, "Fecha", ahora());
    ponerCelda(fila, "Formato", '<span class="chip chip--vino">' + fmt.value + "</span>");
    recontar(panel, "reportes");
    aviso("Reporte " + codigo + " generado en " + fmt.value + ".", "ok");
  }

  /* ---------------------------------------------------------------- 8. Estados */

  var ESTADOS = {
    "Reportar avería": { pill: "crit", texto: "Averiada", aviso: "crit",
      novedad: "Avería reportada el {fecha} por Andrés Suárez. La etapa queda detenida y Producción recibe el aviso." },
    "Dar por reparada": { pill: "ok", texto: "Operativa", aviso: "ok",
      novedad: "Reparada el {fecha}. La máquina vuelve a producción." },
    "Mantenimiento": { pill: "warn", texto: "Mantenimiento", aviso: "warn",
      novedad: "Mantenimiento abierto el {fecha}. La máquina no se usa mientras dure." },
    "Programar mantenimiento": { pill: "warn", texto: "Mantenimiento", aviso: "warn",
      novedad: "Mantenimiento programado el {fecha}. La máquina no se usa mientras dure." },
    "Finalizar mantenimiento": { pill: "ok", texto: "Operativa", aviso: "ok",
      novedad: "Mantenimiento cerrado el {fecha}. La máquina vuelve a producción." }
  };

  function ponerEstado(codigo, destino) {
    /* en la tabla de abajo */
    todos("tbody tr", pagina()).forEach(function (tr) {
      var c = celda(tr, "Máquina");
      if (!c || c.textContent.indexOf(codigo) < 0) return;
      var e = celda(tr, "Estado");
      if (e) e.innerHTML = '<span class="pill pill--' + destino.pill + '">' + destino.texto + "</span>";
    });
    /* en la tarjeta de la planta y en su ficha */
    var tarjeta = uno('label[for="sel-' + codigo.toLowerCase() + '"]');
    if (tarjeta) {
      tarjeta.className = "maq maq--" + destino.pill;
      var p = uno(".pill", tarjeta);
      if (p) p.className = "pill pill--" + destino.pill, p.textContent = destino.texto;
    }
    var ficha = uno(".ficha--" + codigo.toLowerCase());
    if (ficha) {
      var pf = uno(".ficha__cab .pill", ficha);
      if (pf) { pf.className = "pill pill--" + destino.pill; pf.textContent = destino.texto; }
      /* la novedad de la ficha tiene que contar lo mismo que dice el estado */
      var caja = uno(".aviso", ficha);
      if (caja) {
        caja.className = "aviso aviso--" + (destino.pill === "off" ? "warn" : destino.pill);
        var titulo = uno("b", caja), texto = uno("p", caja);
        if (titulo) titulo.textContent = destino.pill === "crit" ? "Qué está fallando" : "Qué está pasando";
        if (texto) texto.textContent = destino.novedad.replace("{fecha}", ahora());
      }
    }
  }

  function codigoDeMaquina(boton) {
    var fila = boton.closest("tr");
    if (fila && celda(fila, "Máquina")) return celda(fila, "Máquina").textContent.trim().split(/\s+/)[0];
    var ficha = boton.closest(".ficha");
    if (ficha) return (ficha.className.match(/ficha--(mq-\d+)/) || [])[1].toUpperCase();
    return null;
  }

  /* ---------------------------------------------------------------- 9. Un solo oyente para los botones */

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button") : null;
    if (!b) return;
    var texto = b.textContent.trim();

    /* --- accesos rápidos de Inicio --- */
    var rapida = e.target.closest(".rapida");
    if (rapida) {
      e.preventDefault();
      var destino = { "+ Entrada": "02-m-prima.html", "+ Producción": "03-en-proceso.html",
                      "+ Avería": "06-maquinaria.html", "+ Merma": "05-merma.html" };
      var clave = (uno("b", rapida) || {}).textContent;
      return ir(destino[clave] || "01-inicio.html", true);
    }

    /* --- formularios --- */
    if (texto === "Registrar merma")  { e.preventDefault(); return registrarMerma(); }
    if (texto === "Registrar ajuste") { e.preventDefault(); return registrarAjuste(); }
    if (texto === "Enviar solicitud") { e.preventDefault(); return enviarSolicitud(); }
    if (texto === "Asignar rol")      { e.preventDefault(); return asignarRol(); }
    if (texto === "Generar reporte")  { e.preventDefault(); return generarReporte(); }
    if (texto === "Guardar parámetros") {
      e.preventDefault();
      return aviso("Parámetros guardados. La valorización se recalculará con " +
                   uno("#cf-valoracion").value.toLowerCase() + ".", "ok");
    }

    /* --- pendientes --- */
    if (texto === "Marcar atendida") {
      e.preventDefault();
      var noti = b.closest(".noti");
      noti.classList.add("es-atendida");
      b.replaceWith(Object.assign(document.createElement("span"),
        { className: "pill pill--ok", textContent: "Atendida" }));
      contarPendientes(-1);
      return aviso("Pendiente marcado como atendido.", "ok");
    }

    /* --- maquinaria --- */
    if (ESTADOS[texto]) {
      e.preventDefault();
      var cod = codigoDeMaquina(b);
      if (!cod) return;
      ponerEstado(cod, ESTADOS[texto]);
      return aviso(cod + " queda como " + ESTADOS[texto].texto.toLowerCase() + ".", ESTADOS[texto].aviso);
    }
    if (texto === "Ver historial") {
      e.preventDefault();
      return ir("07-kardex.html", true);
    }

    /* --- avisos automáticos de Config. --- */
    if (texto === "Desactivar" || texto === "Activar") {
      e.preventDefault();
      var tr = b.closest("tr");
      var est = celda(tr, "Estado");
      var prender = texto === "Activar";
      if (est) est.innerHTML = '<span class="pill pill--' + (prender ? "ok" : "off") + '">' +
        (prender ? "Activo" : "Inactivo") + "</span>";
      b.textContent = prender ? "Desactivar" : "Activar";
      b.className = "btn btn--sm " + (prender ? "btn--ghost" : "btn--oliva");
      return aviso("Aviso " + (prender ? "activado" : "desactivado") + ".", prender ? "ok" : "warn");
    }

    /* --- anular una solicitud --- */
    if (texto === "Anular") {
      e.preventDefault();
      var f = b.closest("tr");
      var ce = celda(f, "Estado");
      if (ce) ce.innerHTML = '<span class="pill pill--off">Anulada</span>';
      b.disabled = true;
      return aviso("Solicitud anulada.", "warn");
    }

    /* --- los botones de solo ícono --- */
    if (b.classList.contains("iconbtn")) {
      e.preventDefault();
      return aviso((b.getAttribute("aria-label") || "Acción") + ": disponible cuando el módulo esté programado.", "warn");
    }
  });

  /* ---------------------------------------------------------------- 10. Arranque */

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

  /* ---------------------------------------------------------------- Las bodegas

     Qué hay adentro, y meter o sacar. El saldo, el estado de la fila, la
     ocupación de la bodega y la lista de movimientos se mueven todos juntos.
  */

  function filaDe(codigo) {
    return todos("#dt-04-adentro tbody tr").filter(function (f) {
      return (celda(f, "Código") || {}).textContent === codigo;
    })[0];
  }

  function refrescarArticulos() {
    var bod = uno("#mb-bod"), art = uno("#mb-art");
    if (!bod || !art) return;
    var elegido = art.value;
    art.innerHTML = "";
    todos("#dt-04-adentro tbody tr").forEach(function (f) {
      if (f.getAttribute("data-bodega") !== bod.value) return;
      var cod = (celda(f, "Código") || {}).textContent;
      var que = (celda(f, "Qué es") || {}).textContent;
      var hay = uno(".hay", f).textContent;
      art.appendChild(new Option(cod + " · " + que + " · hay " + hay + " " +
                                 f.getAttribute("data-unidad"), cod));
    });
    if (elegido && art.querySelector('option[value="' + elegido + '"]')) art.value = elegido;
  }

  function pintarEstado(fila) {
    var hay = numero(uno(".hay", fila).textContent);
    var minTxt = uno(".min", fila).textContent.trim();
    var min = minTxt === "—" ? 0 : numero(minTxt);
    var txt = "Suficiente", tono = "ok";
    if (min && hay < min) { txt = "Bajo el mínimo"; tono = "crit"; }
    else if (min && hay < min * 1.6) { txt = "Cerca del mínimo"; tono = "warn"; }
    var p = uno(".pill", celda(fila, "Cómo está"));
    p.className = "pill pill--" + tono;
    p.textContent = txt;
  }

  /* La tarjeta de la bodega vuelve a contar lo suyo */
  function refrescarBodega(bod) {
    var filas = todos("#dt-04-adentro tbody tr").filter(function (f) {
      return f.getAttribute("data-bodega") === bod;
    });
    var faltan = filas.filter(function (f) {
      return uno(".pill", f).textContent !== "Suficiente";
    }).length;

    var tarjeta = todos(".bod").filter(function (t) {
      return uno("b", t).textContent.indexOf(bod) === 0;
    })[0];
    if (!tarjeta) return;

    var p = uno(".pill", tarjeta);
    p.className = "pill pill--" + (faltan ? (faltan > 1 ? "crit" : "warn") : "ok");
    p.textContent = faltan ? "Hay que abastecer" : "Al día";

    var pie = uno(".tiny", uno(".bod__o", tarjeta));
    pie.textContent = pie.textContent.replace(/\d+ referencias/, filas.length + " referencias");
  }

  function moverBodega() {
    var bod = uno("#mb-bod"), art = uno("#mb-art"), tipo = uno("#mb-tipo"),
        cant = uno("#mb-cant"), mot = uno("#mb-mot");
    if (!art || !art.value) return aviso("Esa bodega no tiene artículos.", "warn");

    var cuanto = numero(cant.value);
    if (!cuanto) { cant.focus(); return aviso("Escriba cuánto va a mover.", "crit"); }

    var fila = filaDe(art.value);
    if (!fila) return aviso("No encuentro ese artículo.", "crit");

    var hay = numero(uno(".hay", fila).textContent);
    var unidad = fila.getAttribute("data-unidad");
    var sale = tipo.value === "Salida";
    if (sale && cuanto > hay) {
      cant.focus();
      return aviso("En " + bod.value + " solo hay " + miles(hay) + " " + unidad +
                   " de " + art.value + ". No se puede sacar más.", "crit");
    }

    var queda = sale ? hay - cuanto : hay + cuanto;
    uno(".hay", fila).textContent = miles(queda);
    pintarEstado(fila);
    fila.classList.add("es-nueva");
    refrescarBodega(bod.value);
    refrescarArticulos();

    /* queda en la lista de movimientos */
    var panel = panelPorTitulo("Últimos Movimientos");
    if (panel) {
      var codigo = siguienteCodigo(panel, "Mov.");
      var f = nuevaFila(panel, "Mov.");
      ponerCelda(f, "Mov.", "<b>" + codigo + "</b>");
      ponerCelda(f, "Referencia", art.value + '<div class="tiny">' + bod.value + "</div>");
      ponerCelda(f, "Tipo", '<span class="chip chip--' + (sale ? "cobre" : "oliva") + '">' +
                            tipo.value + "</span>");
      ponerCelda(f, "Cantidad", miles(cuanto));
      ponerCelda(f, "Documento", mot.value);
      ponerCelda(f, "Fecha", hoy());
      recontar(panel, "movimientos");
    }

    cant.value = "";
    aviso((sale ? "Salieron " : "Entraron ") + miles(cuanto) + " " + unidad + " de " +
          art.value + " · en " + bod.value + " quedan " + miles(queda) + " " + unidad + ".",
          sale ? "warn" : "ok");
  }

  /* Editar una fila sin salir de la tabla */
  function editarFila(fila, boton) {
    var min = uno(".min", fila), donde = uno(".donde", fila);
    if (boton.textContent.trim() === "Editar") {
      min.innerHTML = '<input class="edit" type="text" value="' + min.textContent.trim() + '" size="5">';
      donde.innerHTML = '<input class="edit" type="text" value="' + donde.textContent.trim() + '" size="5">';
      boton.textContent = "Guardar";
      boton.classList.remove("btn--ghost");
      uno("input", min).focus();
      return;
    }
    min.textContent = uno("input", min).value.trim() || "—";
    donde.textContent = uno("input", donde).value.trim() || "—";
    boton.textContent = "Editar";
    boton.classList.add("btn--ghost");
    pintarEstado(fila);
    refrescarBodega(fila.getAttribute("data-bodega"));
    aviso("Guardado: " + (celda(fila, "Código") || {}).textContent + " queda con mínimo " +
          min.textContent + " en el estante " + donde.textContent + ".", "ok");
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button") : null;
    if (!b) return;
    var fila = b.closest("#dt-04-adentro tbody tr");
    var texto = b.textContent.trim();

    if (fila && (texto === "Meter" || texto === "Sacar")) {
      e.preventDefault();
      var bod = uno("#mb-bod"), art = uno("#mb-art"), tipo = uno("#mb-tipo");
      bod.value = fila.getAttribute("data-bodega");
      refrescarArticulos();
      art.value = (celda(fila, "Código") || {}).textContent;
      tipo.value = texto === "Meter" ? "Entrada" : "Salida";
      var p = uno("#p-mover");
      p.scrollIntoView({ behavior: "smooth", block: "center" });
      p.classList.add("es-nueva");
      setTimeout(function () { uno("#mb-cant").focus(); }, 320);
      return;
    }

    if (fila && (texto === "Editar" || texto === "Guardar")) {
      e.preventDefault();
      return editarFila(fila, b);
    }

    if (texto === "Registrar movimiento") { e.preventDefault(); return moverBodega(); }
  });

  document.addEventListener("change", function (e) {
    if (!e.target) return;
    if (e.target.id === "mb-bod") refrescarArticulos();
    /* el motivo más común según lo que se vaya a hacer */
    if (e.target.id === "mb-tipo") {
      var mot = uno("#mb-mot");
      if (mot) mot.value = e.target.value === "Salida" ? "Entrega a producción" : "Compra recibida";
    }
  });

  /* Pulsar una tarjeta de bodega deja la tabla solo con lo de esa bodega */
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest(".bod") : null;
    if (!t) return;
    var cod = uno("b", t).textContent.split("·")[0].trim();
    var caja = uno("#dt-04-adentro input[type=\"search\"]");
    if (!caja) return;
    var estaba = t.classList.contains("is-on");
    todos(".bod").forEach(function (x) { x.classList.remove("is-on"); });
    caja.value = estaba ? "" : cod;
    if (!estaba) t.classList.add("is-on");
    filtrar(uno("#dt-04-adentro"));
    aviso(estaba ? "Se quitó el filtro." : "Solo lo que hay en " + cod + ".", "ok");
  });

  refrescarArticulos();


  /* ---------------------------------------------------------------- El carrusel de bodegas */

  function irABodega(n) {
    var tira = uno("#bod-tira");
    if (!tira) return;
    var paginas = todos(".mosli__p", tira);
    n = Math.max(0, Math.min(n, paginas.length - 1));
    tira.style.transform = "translateX(-" + (n * 100) + "%)";
    tira.dataset.pos = n;

    var cuenta = uno("#bod-cuenta");
    if (cuenta) cuenta.textContent = (n + 1) + " de " + paginas.length;
    todos("#bodegas .mosli__pt").forEach(function (p, i) {
      p.classList.toggle("is-on", i === n);
    });
    var atras = uno('#bodegas [data-paso="-1"]'), sig = uno('#bodegas [data-paso="1"]');
    if (atras) atras.disabled = n === 0;
    if (sig) sig.disabled = n === paginas.length - 1;
  }

  function verBodega(cod) {
    var caja = uno('#dt-04-adentro input[type="search"]');
    if (!caja) return;
    caja.value = cod;
    filtrar(uno("#dt-04-adentro"));
    var dt = uno("#dt-04-adentro");
    dt.scrollIntoView({ behavior: "smooth", block: "start" });
    aviso("La tabla quedó solo con lo que hay en " + cod + ".", "ok");
  }

  /* La solicitud de compra sale para esa bodega, con lo que le falta */
  var ULTIMA_SC = 18;
  function pedirParaBodega(cod) {
    var filas = todos("#dt-04-abastecer tbody tr").filter(function (f) {
      return (celda(f, "Bodega") || {}).textContent.trim() === cod &&
             uno(".pill", f).textContent !== "Suficiente" &&
             !f.classList.contains("es-pedida");
    });
    if (!filas.length) return aviso("En " + cod + " no hay nada pendiente por pedir.", "warn");

    ULTIMA_SC += 1;
    var codigo = "SC-2026-0" + ULTIMA_SC;
    var cuantos = 0;
    filas.forEach(function (f) {
      var p = uno(".pill", f);
      p.className = "pill pill--warn";
      p.textContent = "Pedido a Compras";
      var boton = uno(".btn", f);
      if (boton) {
        boton.textContent = "Pedido";
        boton.disabled = true;
        boton.classList.add("btn--ghost");
      }
      f.classList.add("es-pedida", "es-nueva");
      cuantos += 1;
    });

    var panel = panelPorTitulo("Últimos Movimientos");
    if (panel) {
      var f = nuevaFila(panel, "Mov.");
      ponerCelda(f, "Mov.", "<b>" + codigo + "</b>");
      ponerCelda(f, "Referencia", cod + '<div class="tiny">' + cuantos + " artículo(s)</div>");
      ponerCelda(f, "Tipo", '<span class="chip chip--vino">Solicitud</span>');
      ponerCelda(f, "Cantidad", cuantos);
      ponerCelda(f, "Documento", "Solicitud a Compras");
      ponerCelda(f, "Fecha", hoy());
      recontar(panel, "movimientos");
    }

    anotarSolicitud(codigo, cod, filas);
    sumarAlMenu("02-m-prima.html", 1);
    aviso("Solicitud " + codigo + " enviada a Compras por " + cuantos +
          " artículo(s) de " + cod + ".", "ok");
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button") : null;
    if (!b) return;

    if (b.hasAttribute("data-paso")) {
      e.preventDefault();
      var tira = uno("#bod-tira");
      return irABodega(numero(tira.dataset.pos || "0") + Number(b.getAttribute("data-paso")));
    }
    if (b.classList.contains("mosli__pt")) {
      e.preventDefault();
      return irABodega(todos("#bodegas .mosli__pt").indexOf(b));
    }
    if (b.hasAttribute("data-ver"))   { e.preventDefault(); return verBodega(b.getAttribute("data-ver")); }
    if (b.hasAttribute("data-pedir")) { e.preventDefault(); return pedirParaBodega(b.getAttribute("data-pedir")); }

    /* el botón de cada fila de «Qué hay que abastecer» */
    var fila = b.closest("#dt-04-abastecer tbody tr");
    if (fila && b.textContent.trim() === "Pedir a Compras") {
      e.preventDefault();
      return pedirParaBodega((celda(fila, "Bodega") || {}).textContent.trim());
    }
  });

  irABodega(0);
  setTimeout(recibirDeCompras, 400);

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

  /* ---------------------------------------------------------------- El flujo de la compra

     Una solicitud pasa por: Nueva → Recibida → Cotizada → Aprobada → En orden →
     Recibida en bodega. El estado queda guardado en el navegador, así que uno
     puede cambiar de módulo y el proceso sigue donde iba.
  */

  var LLAVE = "sicaf.solicitudes";

  function leerFlujo() {
    try { return JSON.parse(window.localStorage.getItem(LLAVE)) || []; }
    catch (e) { return window.SICAF_FLUJO || []; }
  }

  function guardarFlujo(lista) {
    window.SICAF_FLUJO = lista;
    try { window.localStorage.setItem(LLAVE, JSON.stringify(lista)); } catch (e) {}
  }

  function cambiarSolicitud(id, cambios) {
    var lista = leerFlujo();
    lista.forEach(function (s) {
      if (s.id === id) { for (var k in cambios) s[k] = cambios[k]; }
    });
    guardarFlujo(lista);
  }

  /* Inventario arma la solicitud y la deja en el flujo */
  function anotarSolicitud(codigo, cod, filas) {
    var insumos = filas.map(function (f) {
      var td = celda(f, "Insumo");
      var proveedor = (uno(".tiny", td) || {}).textContent || "";
      var titulo = td.textContent.replace(proveedor, "").trim();
      var falta = numero((celda(f, "Falta") || {}).textContent);
      var minimo = numero((celda(f, "Mínimo") || {}).textContent);
      return {
        cod: titulo.split("·")[0].trim(),
        que: titulo.split("·").slice(1).join("·").trim(),
        /* si no está por debajo del mínimo pero anda cerca, se pide medio mínimo */
        falta: falta || Math.max(1, Math.round(minimo * 0.5)),
        proveedor: proveedor
      };
    });
    var lista = leerFlujo();
    lista.unshift({
      id: codigo, bodega: cod, insumos: insumos,
      estado: "Nueva", fecha: hoy(), oc: null
    });
    guardarFlujo(lista);
  }

  /* Lo que Compras ya despachó entra a la bodega y sube el saldo */
  function recibirDeCompras() {
    var lista = leerFlujo(), hubo = 0, cuantos = 0;
    lista.forEach(function (s) {
      if (s.estado !== "Despachada") return;
      s.insumos.forEach(function (i) {
        var fila = todos("#dt-04-adentro tbody tr").filter(function (f) {
          return (celda(f, "Código") || {}).textContent === i.cod;
        })[0];
        if (!fila) return;
        var hay = numero(uno(".hay", fila).textContent);
        uno(".hay", fila).textContent = miles(hay + i.falta);
        pintarEstado(fila);
        fila.classList.add("es-nueva");
        cuantos += 1;

        var abastecer = todos("#dt-04-abastecer tbody tr").filter(function (f) {
          return (celda(f, "Insumo") || {}).textContent.indexOf(i.cod) === 0;
        })[0];
        if (abastecer) {
          var p = uno(".pill", abastecer);
          p.className = "pill pill--ok";
          p.textContent = "Suficiente";
          var falta = celda(abastecer, "Falta");
          if (falta) { falta.textContent = "—"; falta.className = "num muted"; }
          abastecer.classList.remove("es-pedida");
          abastecer.classList.add("es-nueva");
          var boton = uno(".btn", abastecer);
          if (boton) { boton.textContent = "Pedir a Compras"; boton.disabled = false; boton.classList.add("btn--ghost"); }
        }
      });
      refrescarBodega(s.bodega);

      var panel = panelPorTitulo("Últimos Movimientos");
      if (panel) {
        var f = nuevaFila(panel, "Mov.");
        ponerCelda(f, "Mov.", "<b>" + (s.oc || s.id) + "</b>");
        ponerCelda(f, "Referencia", s.bodega + '<div class="tiny">de Compras</div>');
        ponerCelda(f, "Tipo", '<span class="chip chip--oliva">Entrada</span>');
        ponerCelda(f, "Cantidad", s.insumos.length);
        ponerCelda(f, "Documento", "Recepción de la " + (s.oc || s.id));
        ponerCelda(f, "Fecha", hoy());
        recontar(panel, "movimientos");
      }
      s.estado = "Cerrada";
      hubo += 1;
    });
    if (!hubo) return;
    guardarFlujo(lista);
    refrescarArticulos();
    aviso("Llegó lo que pidió: " + cuantos + " artículo(s) entraron a bodega y el saldo ya subió.", "ok");
  }

})();
