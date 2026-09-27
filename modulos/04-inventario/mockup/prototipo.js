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
    guardarPronto();   // todo lo que da aviso cambió algo: se guarda en el navegador
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
    /* todos los filtros de la barra cuentan (bodega, tipo, estado...) */
    var sels = todos(".dt__filtros select", tools);
    if (!sels.length && sel) sels = [sel];
    sels.forEach(function (x) {
      if (x.selectedIndex > 0) {
        palabras = palabras.concat(x.value.toLowerCase().split(/\s+/).filter(function (p) { return p.length > 3; }));
      }
    });

    var soloFalta = uno(".dt__si input", tools);   // «Solo lo que falta»: esconde lo que está bien
    var filas = todos("tbody tr", tabla);
    filas.forEach(function (fila) {
      var t = fila.textContent.toLowerCase();
      var pasa = (!texto || t.indexOf(texto) >= 0) &&
                 palabras.every(function (p) { return t.indexOf(p) >= 0; }) &&
                 (!soloFalta || !soloFalta.checked || !uno(".pill--ok", fila));
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
    if (t.matches && t.matches(".tabla-tools select, .dt__filtros select, .dt__si input"))
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
    guardarTodo();
    guardadas[actual] = Array.prototype.slice.call(pagina().childNodes);

    function terminar() {
      actual = archivo;
      marcarMenu();
      if (guardarEnHistorial) history.pushState({ pantalla: archivo }, "", archivo);
      window.scrollTo(0, 0);
      var p = pagina();
      if (p.parentNode) p.parentNode.scrollTop = 0;
      alPintar();
    }

    if (guardadas[archivo]) {
      pintar(guardadas[archivo]);
      terminar();
      return;
    }

    /* si esa pantalla ya se había trabajado, se trae como quedó */
    var hecha = GUARDADO.pantallas && GUARDADO.pantallas[archivo];
    if (hecha) {
      var caja = document.createElement("div");
      caja.innerHTML = hecha;
      pintar(Array.prototype.slice.call(caja.childNodes));
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

  /* Con "fijo", el número queda en ese valor (0 lo esconde) */
  function sumarAlMenu(archivo, delta, fijo) {
    var a = todos(".nav__si").filter(function (x) { return x.getAttribute("href") === archivo; })[0];
    if (!a) return;
    var ct = uno(".ct", a);
    if (!ct) {
      ct = document.createElement("span");
      ct.className = "ct";
      ct.textContent = "0";
      a.appendChild(ct);
    }
    ct.textContent = fijo === undefined ? Math.max(0, numero(ct.textContent) + delta) : fijo;
    ct.style.display = ct.textContent === "0" ? "none" : "";
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
    /* el costo de una unidad de ESA referencia (no el de la fila de arriba) */
    var unitario = COSTO_UNIDAD[ref.value] || Math.round(numero(celda(previa, "Costo").textContent) /
                              Math.max(1, numero(celda(previa, "Cantidad").textContent)));

    var fila = nuevaFila(panel, "Registro");
    ponerCelda(fila, "Registro", "<b>" + codigo + "</b><div class=\"tiny\">" + HOY + "</div>");
    ponerCelda(fila, "Origen", '<span class="chip chip--cobre">Inventario</span><div class="tiny">Bodega</div>');
    ponerCelda(fila, "Referencia", ref.value + '<div class="tiny">' + etapa.value + "</div>");
    ponerCelda(fila, "Cantidad", String(unidades));
    ponerCelda(fila, "Causa", causa.value.trim());
    ponerCelda(fila, "Costo", pesos(unidades * unitario));
    ponerCelda(fila, "Responsable", "Jefe de bodega");

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
    if (texto === "Registrar merma")  { e.preventDefault(); return mermaConTope(); }
    if (texto === "Registrar ajuste") { e.preventDefault(); return ajustarConteo(); }
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

  /* La lista de «Artículo» se arma en articulosParaMover (más abajo): al meter,
     deja elegir cualquier material del catálogo */
  function refrescarArticulos() { articulosParaMover(); }

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

    var fila = tipo.value === "Entrada" ? asegurarFila(art.value, bod.value) : null;
    fila = fila || todos("#dt-04-adentro tbody tr").filter(function (f) {
      return f.getAttribute("data-bodega") === bod.value && (celda(f, "Código") || {}).textContent === art.value;
    })[0];
    if (!fila) return aviso("No encuentro ese artículo en " + bod.value + ".", "crit");

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
    moverStock(bod.value, art.value, sale ? -cuanto : cuanto,
               { mv: nuevoMB(), tipo: sale ? "Salida" : "Entrada", doc: (mot.value || "Movimiento") + " · desde Inicio" });
    anotarKardex(art.value, (celda(fila, "Qué es") || {}).textContent || "", sale ? "Salida" : "Entrada",
                 sale ? -cuanto : cuanto, unidad, queda, mot.value || "Movimiento", bod.value);
    pintarAlmacen();
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
      refrescarPick(art);
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
    if (e.target.id === "mb-bod" || e.target.id === "mb-tipo") refrescarArticulos();
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


  /* =====================================================================
     LA LÓGICA DE NEGOCIO DE INVENTARIO (docs/1-logica-de-negocio)

     Aquí viven las reglas RN-INV-01 a RN-INV-07 tal como las pide el
     documento. Cada función dice qué regla cumple. Los saldos se guardan
     en SALDO para que todas las pantallas cuenten lo mismo.
     ===================================================================== */

  var HOY = "2026-09-23";   // la fecha del mockup (la misma del encabezado)

  /* Lo que hay de cada referencia. Materia prima en su unidad; las REF en
     unidades (en planta + en bodega de producto terminado). */
  var SALDO = {
    "MP-01": 2400, "MP-02": 420, "MP-03": 260, "MP-04": 34,
    "MP-05": 180, "MP-06": 22, "MP-07": 5600, "MP-08": 240,
    "REF-1042": 868, "REF-1043": 508, "REF-1044": 711, "REF-1045": 445,
    "REF-1046": 887, "REF-1051": 0, "REF-0987": 0
  };
  var DETALLE = {
    "REF-1042": "790 en planta y 78 en bodega", "REF-1043": "464 en planta y 44 en bodega",
    "REF-1044": "711 en planta", "REF-1045": "445 en planta", "REF-1046": "887 en planta",
    "REF-1051": "no hay unidades en planta ni en bodega",
    "REF-0987": "modelo descontinuado: no hay unidades"
  };
  /* Lo que vale una unidad de cada referencia (para valorizar la merma) */
  var COSTO_UNIDAD = {
    "MP-01": 1450, "MP-02": 9800, "MP-03": 3200, "MP-04": 6500, "MP-05": 2100, "MP-06": 18500,
    "MP-07": 45, "MP-08": 1200, "REF-1042": 37025, "REF-1043": 30180, "REF-1044": 30275,
    "REF-1045": 23170, "REF-1046": 35830, "REF-1051": 31500, "REF-0987": 29800
  };
  var NUM_MOV = 10;          // el último MV del kárdex
  var PARA_KARDEX = [];      // movimientos que esperan a que se abra el kárdex

  /* RN-INV-02: el estado sale del saldo frente al mínimo */
  function estadoDe(saldo, minimo) {
    if (saldo < minimo) return { tono: "crit", texto: "Bajo el mínimo" };
    if (saldo < minimo * 1.6) return { tono: "warn", texto: "Cerca del mínimo" };
    return { tono: "ok", texto: "Suficiente" };
  }

  function decimal(n) { return String(Math.round(n * 10) / 10).replace(".", ","); }

  /* Todo lo que cambia un saldo queda en el kárdex (paso 9 del proceso) */
  function anotarKardex(ref, nombre, tipo, cantidad, unidad, saldo, documento, bodega) {
    NUM_MOV += 1;
    PARA_KARDEX.push({
      mv: "MV-" + String(NUM_MOV).padStart(4, "0"), ref: ref, nombre: nombre, tipo: tipo,
      cant: cantidad, unidad: unidad, saldo: saldo, doc: documento,
      bod: bodega || (ref.indexOf("REF-") === 0 ? "Planta" : bodegaDe(ref))
    });
    if (actual === "07-kardex.html") vaciarKardex();
  }

  function vaciarKardex() {
    var panel = panelPorTitulo("Kárdex de Movimientos");
    if (!panel || !PARA_KARDEX.length) return;
    var CHIP = { Entrada: "oliva", Salida: "cobre", Ajuste: "tinta", Merma: "vino" };
    PARA_KARDEX.forEach(function (m) {
      var f = nuevaFila(panel, "Mov.");
      var signo = m.cant > 0 ? "+" : "";
      ponerCelda(f, "Mov.", '<b class="nw">' + m.mv + "</b>");
      ponerCelda(f, "Referencia", "<b>" + m.ref + '</b><div class="tiny">' + m.nombre + "</div>");
      ponerCelda(f, "Bodega", '<b class="nw">' + (m.bod || "—") + "</b>");
      ponerCelda(f, "Tipo", '<span class="chip chip--' + (CHIP[m.tipo] || "tinta") + '">' + m.tipo + "</span>");
      ponerCelda(f, "Cantidad", '<span class="mov mov--' + (m.cant >= 0 ? "mas" : "menos") + '">' +
                 signo + miles(m.cant) + '</span><div class="tiny">' + m.unidad + "</div>");
      ponerCelda(f, "Saldo", "<b>" + miles(m.saldo) + "</b>");
      ponerCelda(f, "Documento", m.doc);
      ponerCelda(f, "Responsable", "Jefe de bodega");
      ponerCelda(f, "Fecha", HOY);
    });
    var n = PARA_KARDEX.length;
    PARA_KARDEX = [];
    /* los totales: cuántos movimientos hay de cada tipo */
    var cuenta = { Entrada: 0, Salida: 0, Ajuste: 0, Merma: 0 }, filasK = todos("tbody tr", panel);
    filasK.forEach(function (f) { var t = (celda(f, "Tipo") || {}).textContent.trim(); if (t in cuenta) cuenta[t]++; });
    var res = uno(".dt__res", panel);
    if (res) res.innerHTML = '<span class="dt__res-t">Totales<em>de los ' + filasK.length + " registro(s)</em></span>" +
      Object.keys(cuenta).filter(function (k) { return cuenta[k]; }).map(function (k) {
        var t = { Entrada: "ok", Salida: "warn", Ajuste: "", Merma: "crit" }[k];
        return '<span class="dt__res-i' + (t ? " dt__res-i--" + t : "") + '"><b>' + k + "</b><span>" + cuenta[k] + "</span></span>";
      }).join("");
    var pieK = uno("tfoot tr td", panel);
    if (pieK) pieK.innerHTML = "<b>" + filasK.length + ' movimientos</b> <span class="tiny">' + cuenta.Entrada + " entradas · " +
      cuenta.Salida + " salidas · " + cuenta.Ajuste + " ajustes · " + cuenta.Merma + " mermas</span>";
    var dt = uno(".dt", panel);
    if (dt) { dt.dataset.pag = 1; dtPintar(dt); }
    aviso("El kárdex tiene " + n + " movimiento(s) nuevo(s) de esta sesión.", "ok");
  }

  /* ---------------------------------------------------------------- M. Prima (02) */

  function filaMP(ref) { return uno('tr[data-ref="' + ref + '"][data-min]'); }

  /* Vuelve a pintar una fila de M. Prima con lo que tiene en sus data- */
  function pintarMP(fila) {
    var saldo = numero(fila.dataset.saldo), minimo = numero(fila.dataset.min),
        costo = numero(fila.dataset.costo), u = fila.dataset.unidad;
    var est = estadoDe(saldo, minimo);
    ponerCelda(fila, "Saldo", "<b>" + miles(saldo) + '</b> <span class="tiny">' + u + "</span>");
    ponerCelda(fila, "Costo prom.", "$" + miles(costo) + '<div class="tiny">por ' + u + "</div>");
    ponerCelda(fila, "Cuánto vale", "<b>" + pesos(saldo * costo) + "</b>");
    ponerCelda(fila, "Estado", '<span class="pill pill--' + est.tono + '">' + est.texto +
               '</span><div class="tiny">' + decimal(saldo / minimo) + " × el mínimo</div>");
    var acts = uno(".acts", fila);
    if (acts) {
      var pedir = uno('[data-acc="pedir"]', acts);
      if (est.tono === "crit" && !pedir) {
        acts.insertAdjacentHTML("beforeend", '<button class="btn btn--sm btn--cobre" data-acc="pedir">Pedir</button>');
      }
      if (est.tono !== "crit" && pedir) pedir.remove();
    }
    fila.classList.add("es-nueva");
    recalcularMP(fila.closest(".panel"));
  }

  /* Totales de la tabla: cuántas en cada estado y lo que vale todo */
  function recalcularMP(panel) {
    if (!panel) return;
    var filas = todos("tbody tr[data-ref]", panel);
    var c = { crit: 0, warn: 0, ok: 0 }, total = 0;
    filas.forEach(function (f) {
      var s = numero(f.dataset.saldo);
      c[estadoDe(s, numero(f.dataset.min)).tono]++;
      total += s * numero(f.dataset.costo);
    });
    var res = todos(".dt__res-i span", panel);
    if (res.length >= 3) { res[0].textContent = c.crit; res[1].textContent = c.warn; res[2].textContent = c.ok; }
    var pie = uno("tfoot tr", panel);
    if (pie) {
      pie.cells[0].innerHTML = "<b>" + filas.length + ' referencias</b> <span class="tiny">' +
        c.crit + " bajo el mínimo · " + c.warn + " cerca</span>";
      pie.cells[2].innerHTML = "<b>" + pesos(total) + "</b>";
    }
    var sw = uno(".dt__si span:last-child", panel);
    if (sw) sw.textContent = "Solo lo que falta (" + (c.crit + c.warn) + ")";
    sumarAlMenu("02-m-prima.html", 0, c.crit);
  }

  /* RN-INV-03: cada entrada recalcula el costo promedio ponderado */
  function costoPromedio(saldo, costo, entra, costoEntra) {
    var total = saldo + entra;
    if (total <= 0) return costoEntra;               // si el saldo total es 0, no se divide
    return Math.round((saldo * costo + entra * costoEntra) / total);
  }

  function explicarEntrada() {
    var caja = uno("#ec-formula");
    if (!caja) return;
    var ref = uno("#ec-ins").value, fila = filaMP(ref);
    var q = numero(uno("#ec-cant").value), cq = numero(uno("#ec-costo").value);
    if (!fila) return;
    var s = numero(fila.dataset.saldo), c = numero(fila.dataset.costo), u = fila.dataset.unidad;
    if (!q || !cq) {
      caja.innerHTML = "Hoy: <b>" + miles(s) + " " + u + "</b> a <b>" + pesos(c) + "</b> cada uno. " +
        "Escriba la cantidad y el costo para ver el costo nuevo antes de guardar.";
      return;
    }
    var nuevo = costoPromedio(s, c, q, cq);
    caja.innerHTML =
      '<span class="calc__l">(' + miles(s) + " × " + pesos(c) + ") + (" + miles(q) + " × " + pesos(cq) + ")</span>" +
      '<span class="calc__l calc__l--div">' + miles(s + q) + " " + u + "</span>" +
      '<span class="calc__r">= <b>' + pesos(nuevo) + " por " + u + "</b> · saldo nuevo " +
      miles(s + q) + " " + u + " · vale " + pesos((s + q) * nuevo) + "</span>";
  }

  function registrarEntrada() {
    var ref = uno("#ec-ins").value, cant = uno("#ec-cant"), cost = uno("#ec-costo"), doc = uno("#ec-doc");
    var q = numero(cant.value), cq = numero(cost.value);
    /* RN-INV-07: toda cantidad es mayor que cero */
    if (!q || q < 1) { cant.focus(); return aviso("Escriba una cantidad mayor que cero.", "crit"); }
    if (!cq || cq < 1) { cost.focus(); return aviso("El costo unitario tiene que ser mayor que cero.", "crit"); }
    if (!doc.value.trim()) { doc.focus(); return aviso("Escriba el documento de la compra (la OC).", "crit"); }
    var fila = filaMP(ref);
    if (!fila) return aviso("No encontré " + ref + " en la tabla.", "crit");
    var s = numero(fila.dataset.saldo), c = numero(fila.dataset.costo);
    var nuevo = costoPromedio(s, c, q, cq);
    fila.dataset.saldo = s + q;
    fila.dataset.costo = nuevo;
    moverStock(bodegaDe(ref), ref, q, { mv: nuevoMB(), tipo: "Entrada", doc: "Orden de compra (OC) · " + doc.value.trim() });
    SALDO[ref] = s + q;
    COSTO_UNIDAD[ref] = nuevo;
    pintarMP(fila);
    anotarKardex(ref, uno(".tiny", fila).textContent, "Entrada", q, fila.dataset.unidad, s + q, doc.value.trim());
    aviso("Entraron " + miles(q) + " " + fila.dataset.unidad + " de " + ref + ". Costo promedio: " +
          pesos(c) + " → " + pesos(nuevo) + ".", "ok");
    cant.value = ""; cost.value = ""; doc.value = "";
    explicarEntrada();
  }

  /* RN-INV-04: el saldo no se edita; el ajuste es un movimiento con justificación */
  function ajustarConteo() {
    var ins = uno("#f-aj-ins"), cant = uno("#f-aj-cant"), just = uno("#f-aj-just");
    if (!cant.value.trim()) { cant.focus(); return aviso("Escriba la cantidad contada.", "crit"); }
    if (!just.value.trim()) { just.focus(); return aviso("El ajuste necesita una justificación.", "crit"); }
    var contado = numero(cant.value);
    if (contado < 0) { cant.focus(); return aviso("La cantidad contada no puede ser negativa.", "crit"); }
    var ref = ins.value.split("·")[0].trim(), fila = filaMP(ref);
    if (!fila) return aviso("No encontré esa referencia en la tabla.", "crit");
    var antes = numero(fila.dataset.saldo), dif = contado - antes;
    if (!dif) return aviso("El conteo cuadra con el saldo: no hace falta ajuste.", "ok");
    fila.dataset.saldo = contado;
    moverStock(bodegaDe(ref), ref, dif, { mv: nuevoMB(), tipo: dif > 0 ? "Entrada" : "Salida",
                                         doc: "Ajuste por conteo · " + just.value.trim() });
    SALDO[ref] = contado;
    pintarMP(fila);
    anotarKardex(ref, uno(".tiny", fila).textContent, "Ajuste", dif, fila.dataset.unidad, contado, just.value.trim());
    aviso("Saldo de " + ref + " ajustado de " + miles(antes) + " a " + miles(contado) +
          " (" + (dif > 0 ? "+" : "") + miles(dif) + "). Quedó en el kárdex con su justificación.", "ok");
    just.value = ""; cant.value = "";
  }

  /* Los botones de cada fila de M. Prima llenan el formulario que toca */
  function accionMP(b) {
    var fila = b.closest("tr"), ref = fila.dataset.ref, acc = b.dataset.acc;
    var destino = { entrada: ["#p-entrada", "#ec-ins", "#ec-cant"],
                    ajustar: [null, "#f-aj-ins", "#f-aj-cant"],
                    pedir: [null, "#sm-ins", "#sm-cant"] }[acc];
    var sel = uno(destino[1]);
    if (!sel) return;
    sel.value = ref;
    refrescarPick(sel);
    var panel = destino[0] ? uno(destino[0]) : panelDe(sel);
    panel.scrollIntoView({ behavior: "smooth", block: "center" });
    panel.classList.remove("es-nueva"); void panel.offsetWidth; panel.classList.add("es-nueva");
    if (acc === "pedir") {
      var falta = Math.max(1, numero(fila.dataset.min) * 2 - numero(fila.dataset.saldo));
      uno("#sm-cant").value = falta;
      aviso("Le propongo pedir " + miles(falta) + " " + fila.dataset.unidad + " para quedar en el doble del mínimo.", "ok");
    }
    if (acc === "entrada") explicarEntrada();
    setTimeout(function () { var c = uno(destino[2]); if (c) c.focus(); }, 320);
  }

  /* ---------------------------------------------------------------- Merma (05) */

  function mostrarExistencia() {
    var caja = uno("#mr-hay"), sel = uno("#mr-ref");
    if (!caja || !sel) return;
    var ref = sel.value, hay = SALDO[ref] || 0;
    var nombre = sel.options[sel.selectedIndex].textContent;
    caja.innerHTML = nombre + ": <b>" + miles(hay) + "</b> " + (ref.indexOf("MP-") === 0 ? "en bodega" :
      "unidades (" + (DETALLE[ref] || "en planta y en bodega") + ")") +
      ". " + (hay ? "No se puede registrar una merma mayor." : "No se puede registrar merma de algo que no hay.");
    caja.parentNode.classList.toggle("calc--crit", !hay);
  }

  /* RN-INV-05: la merma exige cantidad, etapa y causa, y no supera la existencia */
  function mermaConTope() {
    var ref = uno("#mr-ref"), cant = uno("#mr-cant"), causa = uno("#mr-causa");
    var unidades = numero(cant.value);
    if (!unidades || unidades < 1) { cant.focus(); return aviso("Escriba una cantidad mayor que cero.", "crit"); }
    if (!causa.value.trim()) { causa.focus(); return aviso("Escriba la causa de la merma.", "crit"); }
    var hay = SALDO[ref.value] || 0;
    if (unidades > hay) {
      cant.focus();
      return aviso("Solo hay " + miles(hay) + " unidades de " + ref.value +
                   ": no se puede perder más de lo que hay.", "crit");
    }
    if (ref.value.indexOf("MP-") === 0) {
      moverStock(bodegaDe(ref.value), ref.value, -unidades, { mv: nuevoMB(), tipo: "Salida", doc: "Merma · " + causa.value.trim() });
    }
    SALDO[ref.value] = hay - unidades;
    var nombre = ref.options[ref.selectedIndex].textContent.split("·").slice(1).join("·").trim();
    registrarMerma();   // la de siempre: agrega la fila y suma los totales
    var dtm = uno(".dt", panelPorTitulo("Merma Registrada") || document.createElement("div"));
    if (dtm) { dtm.dataset.pag = 1; dtPintar(dtm); }
    anotarKardex(ref.value, nombre, "Merma", -unidades, ref.value.indexOf("MP-") === 0 ? "" : "un",
                 hay - unidades, "Merma en " + uno("#mr-etapa").value.toLowerCase());
    mostrarExistencia();
  }

  /* ---------------------------------------------------------------- Terminado (04) */

  /* RN-INV-06: solo entra producto terminado de lotes que Calidad marcó conformes */
  function recibirLote(b) {
    var tr = b.closest("tr"), d = tr.dataset;
    if (d.dictamen !== "Conforme") {
      tr.classList.add("es-rechazo");
      return aviso("El lote " + d.lote + " es no conforme: no puede entrar a BOD-02. Vuelve a Producción para reproceso.", "crit");
    }
    var pares = numero(d.pares), costo = numero(d.costo);
    var panel = panelPorTitulo("Producto Terminado");
    var fila = panel && todos("tbody tr", panel).filter(function (f) {
      return (celda(f, "Referencia") || {}).textContent.indexOf(d.ref) >= 0;
    })[0];
    var total;
    if (fila) {
      total = numero(uno("b", celda(fila, "Disponible")).textContent) + pares;
      var c0 = numero(celda(fila, "Costo/par").textContent);
      var cn = costoPromedio(total - pares, c0, pares, costo);
      ponerCelda(fila, "Disponible", "<b>" + miles(total) + '</b> <span class="tiny">pares</span>');
      ponerCelda(fila, "Costo/par", pesos(cn));
      ponerCelda(fila, "Valor en bodega", "<b>" + pesos(total * cn) + "</b>");
      fila.classList.add("es-nueva");
    } else if (panel) {
      fila = nuevaFila(panel);
      total = pares;
      ponerCelda(fila, "Referencia", "<b>" + d.ref + '</b><div class="tiny">versión 1</div>');
      ponerCelda(fila, "Modelo", d.modelo + '<div class="tiny">Otoño 2026</div>');
      ponerCelda(fila, "Disponible", "<b>" + miles(pares) + '</b> <span class="tiny">pares</span>');
      ponerCelda(fila, "Costo/par", pesos(costo));
      ponerCelda(fila, "Valor en bodega", "<b>" + pesos(pares * costo) + "</b>");
    }
    if (panel) totalesTerminado(panel);
    SALDO[d.ref] = (SALDO[d.ref] || 0);   // el lote ya estaba contado en planta: solo cambia de lugar
    moverStock("BOD-02", "PT-" + d.ref, pares, { mv: nuevoMB(), tipo: "Entrada", doc: "Lote de Calidad · " + d.lote, quien: "Control de Calidad" });
    anotarKardex("PT-" + d.ref, d.modelo, "Entrada", pares, "pares", total, d.lote + " · conforme", "BOD-02");
    tr.remove();
    var quedan = todos("#p-lotes tbody tr").length;
    var n = uno("#lotes-n");
    if (n) n.textContent = quedan ? quedan + " por recibir" : "Todo recibido";
    aviso("Entraron " + pares + " pares de " + d.ref + " a BOD-02. Quedó la entrada en el kárdex.", "ok");
  }

  function totalesTerminado(panel) {
    var filas = todos("tbody tr", panel), pares = 0, valor = 0;
    filas.forEach(function (f) {
      pares += numero(uno("b", celda(f, "Disponible")).textContent);
      valor += numero(celda(f, "Valor en bodega").textContent);
    });
    var pie = uno("tfoot tr", panel);
    if (pie) {
      pie.cells[0].innerHTML = "<b>" + filas.length + ' referencias</b> <span class="tiny">Bodega BOD-02 · producto terminado</span>';
      pie.cells[1].textContent = miles(pares);
      pie.cells[2].innerHTML = pesos(Math.round(valor / Math.max(1, pares))) + '<div class="tiny">promedio</div>';
      pie.cells[3].textContent = pesos(valor);
    }
    var res = todos(".dt__res-i span", panel);
    if (res.length) res[res.length - 1].textContent = pesos(valor);
    var em = uno(".dt__res-t em", panel);
    if (em) em.textContent = "de los " + filas.length + " registro(s)";
    var dt = uno(".dt", panel);
    if (dt) dtPintar(dt);
  }

  /* ---------------------------------------------------------------- Maquinaria (06)

     Las máquinas se leen de la lista escondida del HTML (.mq-datos) y se
     pintan tres veces: la tarjeta, la ficha y la fila de la tabla. Todo
     cambio pasa por MAQ y se vuelve a pintar, así nunca quedan distintas. */

  var MAQ = null, MQ_SEL = "MQ-01", MQ_FILTRO = "todos";
  var ESTADO_MQ = {
    libre:         { tono: "info", texto: "Libre",         dice: "No se está usando ahora, pero está lista para trabajar." },
    operativa:     { tono: "ok",   texto: "Operativa",     dice: "Trabajando en una orden, con su operario." },
    averiada:      { tono: "crit", texto: "Averiada",      dice: "Está dañada: detiene su etapa y Producción recibe el aviso." },
    mantenimiento: { tono: "warn", texto: "Mantenimiento", dice: "La están revisando o reparando. No se usa mientras dure." },
    desuso:        { tono: "off",  texto: "En desuso",     dice: "Ya no se usa: quedó guardada o se va a dar de baja." },
    descartado:    { tono: "off",  texto: "Descartado",    dice: "Salió de la planta: ya no cuenta en el inventario de equipos." }
  };
  var MOTIVO_DESCARTE = ["Se vendió", "Se botó (chatarra)", "Se donó", "Se devolvió al proveedor", "Se registró por error"];
  /* Desde cada estado, a dónde puede pasar y qué se pide */
  var PASA_A = {
    libre:         [["asignar", "operativa", "Asignar una orden", "Pide orden y operario"],
                    ["averia", "averiada", "Reportar daño", "Qué se dañó, cuándo y qué necesita"],
                    ["mantener", "mantenimiento", "Enviar a mantenimiento", "Revisión preventiva"],
                    ["baja", "desuso", "Dejar en desuso", "Pide el motivo"]],
    operativa:     [["liberar", "libre", "Terminó la orden", "Queda libre para otra"],
                    ["averia", "averiada", "Reportar daño", "Qué se dañó, cuándo y qué necesita"],
                    ["mantener", "mantenimiento", "Enviar a mantenimiento", "Suspende la orden"]],
    averiada:      [["mantener", "mantenimiento", "Enviar a reparación", "Pasa a mantenimiento"],
                    ["baja", "desuso", "No tiene arreglo", "Queda en desuso"]],
    mantenimiento: [["finalizar", "libre", "Terminar mantenimiento", "Queda libre y se reinicia el conteo"]],
    desuso:        [["reactivar", "libre", "Volver a usar", "Queda libre"]],
    descartado:    [["restaurar", "libre", "Restaurar", "Vuelve al inventario como libre"]]
  };
  var NECESITA = ["Arreglo", "Cambio de pieza", "Cambio del equipo", "Mantenimiento", "Afilado o ajuste"];
  var MOTIVO_DESUSO = ["Reemplazada por otra", "Sin repuestos", "Ya no se necesita", "Dañada sin arreglo", "Guardada por temporada"];
  var ETAPAS_MQ = ["Corte", "Guarnición", "Montaje", "Terminado"];
  var ORDENES = ["OP-2026-031", "OP-2026-028", "OP-2026-029", "OP-2026-034", "OP-2026-035",
                 "OP-2026-038", "OP-2026-043", "OP-2026-044"];
  var OPERARIOS = ["Luisa Mendoza", "Édgar Pabón", "Marcela Ortiz", "Jorge Rincón", "Técnico externo"];

  /* ---- Los dibujos de cada tipo de equipo (SVG hecho a mano) */
  var EQUIPOS = [
    ["troqueladora", "Troqueladora", "maquina"], ["coser", "Máquina de coser", "maquina"],
    ["prensa", "Prensa", "maquina"], ["horno", "Horno reactivador", "maquina"],
    ["pulidora", "Pulidora", "maquina"], ["pistola", "Pistola de pegante", "herramienta"],
    ["cuchilla", "Cuchillas de corte", "herramienta"], ["horma", "Hormas", "herramienta"]
  ];
  var DIBUJO = {
    troqueladora: '<rect class="c" x="8" y="76" width="104" height="6" rx="3"/><rect class="b" x="22" y="58" width="76" height="18" rx="3"/>' +
      '<rect class="c" x="16" y="52" width="88" height="7" rx="2"/><rect class="b" x="26" y="12" width="12" height="42" rx="2"/>' +
      '<rect class="d" x="22" y="8" width="70" height="12" rx="4"/><rect class="a" x="62" y="20" width="18" height="15" rx="3"/>' +
      '<rect class="b" x="68" y="35" width="6" height="8"/><rect class="a" x="54" y="43" width="34" height="6" rx="2"/>' +
      '<path class="e" d="M58 52q5-4 13 0t13 0v0H58z"/><circle class="e" cx="31" cy="66" r="3"/>',
    coser: '<rect class="c" x="8" y="62" width="104" height="7" rx="3"/><rect class="b" x="18" y="69" width="6" height="15"/><rect class="b" x="96" y="69" width="6" height="15"/>' +
      '<path class="a" d="M26 62V32q0-12 12-12h46q12 0 12 12v12H84V33H40v29z"/><rect class="d" x="82" y="44" width="8" height="10" rx="1"/>' +
      '<path class="l" d="M86 54v7"/><circle class="b" cx="100" cy="30" r="8"/><circle class="c" cx="100" cy="30" r="3"/>' +
      '<rect class="e" x="52" y="11" width="8" height="10" rx="2"/><path class="l" d="M56 11V6"/>',
    prensa: '<rect class="c" x="8" y="76" width="104" height="6" rx="3"/><rect class="b" x="14" y="68" width="92" height="9" rx="2"/>' +
      '<rect class="b" x="18" y="10" width="14" height="60" rx="2"/><rect class="d" x="18" y="8" width="74" height="13" rx="4"/>' +
      '<rect class="a" x="62" y="21" width="18" height="17" rx="3"/><rect class="b" x="68" y="38" width="6" height="10"/>' +
      '<rect class="a" x="54" y="48" width="34" height="6" rx="2"/><path class="e" d="M50 66q3-9 19-9 14 0 19 5 3 4-3 4z"/>',
    horno: '<rect class="c" x="8" y="76" width="104" height="6" rx="3"/><rect class="b" x="16" y="24" width="88" height="52" rx="7"/>' +
      '<rect class="d" x="24" y="32" width="56" height="36" rx="4"/><rect class="a" x="29" y="48" width="46" height="15" rx="3" opacity=".9"/>' +
      '<rect class="c" x="84" y="32" width="14" height="36" rx="3"/><circle class="a" cx="91" cy="41" r="3"/><circle class="e" cx="91" cy="52" r="3"/>' +
      '<path class="l" d="M38 18q5-5 0-10M52 18q5-5 0-10M66 18q5-5 0-10"/>',
    pulidora: '<rect class="c" x="8" y="76" width="104" height="6" rx="3"/><rect class="b" x="40" y="62" width="40" height="14" rx="3"/>' +
      '<rect class="d" x="44" y="36" width="32" height="28" rx="6"/><rect class="b" x="18" y="46" width="84" height="5" rx="2"/>' +
      '<circle class="a" cx="20" cy="48" r="14"/><circle class="a" cx="100" cy="48" r="14"/><circle class="c" cx="20" cy="48" r="4"/>' +
      '<circle class="c" cx="100" cy="48" r="4"/><rect class="e" x="54" y="42" width="12" height="4" rx="2"/>',
    pistola: '<rect class="c" x="8" y="76" width="104" height="6" rx="3"/><rect class="e" x="4" y="32" width="20" height="8" rx="3"/>' +
      '<path class="a" d="M22 24h58q12 0 12 12v2q0 12-12 12H60l-7 26H38l5-26H22z"/><rect class="d" x="92" y="32" width="18" height="8" rx="2"/>' +
      '<path class="d" d="M110 36l6 2-6 2z"/><path class="b" d="M58 50q-2 10 4 14"/><rect class="c" x="30" y="30" width="36" height="6" rx="3"/>',
    cuchilla: '<rect class="c" x="8" y="76" width="104" height="6" rx="3"/>' +
      '<path class="c" d="M14 64L70 18l10 9-54 46z" stroke="var(--tinta-3)" stroke-width="1.5"/><rect class="a" x="70" y="10" width="30" height="12" rx="4" transform="rotate(40 85 16)"/>' +
      '<path class="c" d="M34 70L84 30l9 8-48 38z" stroke="var(--tinta-3)" stroke-width="1.5"/><rect class="d" x="84" y="24" width="26" height="11" rx="4" transform="rotate(40 97 29)"/>',
    horma: '<rect class="c" x="8" y="76" width="104" height="6" rx="3"/><rect class="b" x="56" y="54" width="8" height="22"/>' +
      '<path class="a" d="M14 54q0-18 22-24 16-4 30-2 26 4 40 16 6 6 0 12H22q-8 0-8-2z"/><path class="e" d="M30 36q14-6 30-4" fill="none" stroke="var(--papel)" stroke-width="2" opacity=".6"/>' +
      '<ellipse class="d" cx="44" cy="30" rx="10" ry="4"/>'
  };
  function dibujo(key, clase) {
    return '<svg class="eq ' + (clase || "") + '" viewBox="0 0 120 88" aria-hidden="true">' + (DIBUJO[key] || DIBUJO.troqueladora) + "</svg>";
  }
  function nombreEquipo(key) { var e = EQUIPOS.filter(function (x) { return x[0] === key; })[0]; return e ? e[1] : "Equipo"; }
  function esHerramienta(m) { return (EQUIPOS.filter(function (x) { return x[0] === m.img; })[0] || [])[2] === "herramienta"; }

  function sumarDias(fecha, dias) {
    var d = new Date(fecha + "T12:00:00");
    d.setDate(d.getDate() + dias);
    return d.toISOString().slice(0, 10);
  }
  function diasEntre(a, b) {
    return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000);
  }
  function proximo(m) { return sumarDias(m.ultimo, numero(m.cada)); }
  function faltan(m) { return diasEntre(HOY, proximo(m)); }
  function esc(t) { return String(t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  function leerMaquinas() {
    if (MAQ) return;
    var lista = todos(".mq-datos li");
    if (!lista.length) return;
    MAQ = lista.map(function (li) {
      var m = {};
      for (var k in li.dataset) m[k] = li.dataset[k];
      try { m.hist = JSON.parse(m.hist || "[]"); } catch (x) { m.hist = []; }
      return m;
    });
  }
  function maq(cod) { return MAQ.filter(function (m) { return m.cod === cod; })[0]; }
  function anotarHist(m, texto, tono) { m.hist = m.hist || []; m.hist.unshift({ f: HOY, t: texto, tono: tono || "info" }); }

  function textoMant(m) {
    if (m.estado === "desuso" || m.estado === "descartado") return { tono: "off", texto: "No aplica" };
    var f = faltan(m);
    if (f < 0) return { tono: "crit", texto: "Vencido hace " + (-f) + " día" + (f === -1 ? "" : "s") };
    if (f <= 15) return { tono: "warn", texto: "Faltan " + f + " día" + (f === 1 ? "" : "s") };
    return { tono: "ok", texto: "Faltan " + f + " días" };
  }

  /* Lo que le pasa, en una línea: el daño, el desuso o el mantenimiento */
  function queLePasa(m) {
    if (m.estado === "averiada") return "Se dañó: " + (m.dano || "sin detalle") + " · el " + (m.fechadano || "—") + " · necesita " + (m.necesita || "revisión").toLowerCase();
    if (m.estado === "desuso") return "En desuso desde el " + (m.fechadesuso || "—") + " · " + (m.motivo || "sin motivo").toLowerCase();
    if (m.estado === "descartado") return "Descartado el " + (m.fechadescarte || "—") + " · " + (m.motivodescarte || "").toLowerCase();
    if (m.estado === "mantenimiento") return "En mantenimiento desde el " + (m.fechamant || m.ultimo);
    if (m.estado === "libre") return "No se está usando · lista para trabajar";
    return "Trabajando en " + (m.orden || "una orden") + (m.operario ? " con " + m.operario : "");
  }

  function tarjetaMQ(m) {
    var e = ESTADO_MQ[m.estado], mt = textoMant(m);
    var usado = Math.min(100, Math.max(4, Math.round(diasEntre(m.ultimo, HOY) * 100 / Math.max(1, numero(m.cada)))));
    return '<button type="button" class="mq-card mq-card--' + e.tono + (m.cod === MQ_SEL ? " is-on" : "") +
      '" data-mq-ver="' + m.cod + '" aria-pressed="' + (m.cod === MQ_SEL) + '">' +
      '<span class="mq-card__img">' + dibujo(m.img) +
        '<span class="pill pill--' + e.tono + '">' + e.texto + "</span>" +
        '<span class="mq-card__tipo">' + (esHerramienta(m) ? "Herramienta" : "Máquina") + "</span></span>" +
      '<span class="mq-card__cuerpo"><span class="mq-card__cod">' + m.cod + '</span><span class="mq-card__n">' + esc(m.nombre) + "</span>" +
      '<span class="mq-card__et">' + m.etapa + " · " + nombreEquipo(m.img) + "</span>" +
      '<span class="mq-card__pasa mq-card__pasa--' + e.tono + '">' + esc(queLePasa(m)) + "</span>" +
      (m.estado === "desuso" ? "" : '<span class="mq-card__m"><span class="bar bar--' + (mt.tono === "ok" ? "ok" : "crit") + '"><i style="width:' + usado + '%"></i></span>' +
        '<span class="tiny">Mantenimiento: ' + mt.texto.toLowerCase() + "</span></span>") +
      "</span></button>";
  }

  function fichaMQ(m) {
    var e = ESTADO_MQ[m.estado], mt = textoMant(m);
    var kv = [
      ["Tipo", nombreEquipo(m.img) + (esHerramienta(m) ? " (herramienta)" : " (máquina)")],
      ["Etapa", m.etapa],
      ["Orden en curso", m.orden ? m.orden + (m.estado === "averiada" ? " · suspendida" : "") : "Sin orden"],
      ["Operario", m.operario || "Sin asignar"],
      ["Turno", m.turno === "1" ? "Turno 1 · 06:00 – 14:00" : m.turno === "2" ? "Turno 2 · 14:00 – 22:00" : "Sin turno"],
      ["Horas acumuladas", miles(numero(m.horas)) + " h"],
      ["Último mantenimiento", m.ultimo],
      ["Próximo mantenimiento", m.estado === "desuso" ? "No aplica" : proximo(m) + ' <span class="pill pill--' + mt.tono + '">' + mt.texto + "</span>"]
    ].map(function (x) { return '<div class="kv"><span>' + x[0] + "</span><b>" + x[1] + "</b></div>"; }).join("");

    var dano = "";
    if (m.estado === "averiada") {
      dano = '<div class="mq-dano mq-dano--crit"><div><span>Qué se dañó</span><b>' + esc(m.dano || "—") + "</b></div>" +
        "<div><span>Cuándo</span><b>" + (m.fechadano || "—") + (m.fechadano ? " · hace " + diasEntre(m.fechadano, HOY) + " días" : "") + "</b></div>" +
        '<div><span>Qué necesita</span><b class="mq-nec">' + esc(m.necesita || "Revisión") + "</b></div></div>";
    } else if (m.estado === "desuso") {
      dano = '<div class="mq-dano mq-dano--off"><div><span>Desde</span><b>' + (m.fechadesuso || "—") + "</b></div>" +
        "<div><span>Motivo</span><b>" + esc(m.motivo || "—") + "</b></div><div><span>Uso</span><b>No cuenta para la producción</b></div></div>";
    }

    var ciclo = ["libre", "operativa", "averiada", "mantenimiento", "desuso"].concat(m.estado === "descartado" ? ["descartado"] : []).map(function (k) {
      var s = ESTADO_MQ[k];
      return '<span class="mq-ciclo__e mq-ciclo__e--' + s.tono + (k === m.estado ? " is-on" : "") + '">' +
        (k === m.estado ? "Ahora: " : "") + s.texto + "</span>";
    }).join('<span class="mq-ciclo__fl" aria-hidden="true">·</span>');

    var acciones = PASA_A[m.estado].map(function (a) {
      var s = ESTADO_MQ[a[1]];
      return '<button type="button" class="mq-acc mq-acc--' + s.tono + '" data-mq-accion="' + a[0] + '">' +
        "<b>" + a[2] + "</b><span>→ " + s.texto + " · " + a[3] + "</span></button>";
    }).join("");

    var hist = (m.hist || []).slice(0, 6).map(function (h) {
      return '<li class="mq-h mq-h--' + h.tono + '"><span class="mq-h__f">' + h.f + "</span><span>" + esc(h.t) + "</span></li>";
    }).join("") || '<li class="empty">Sin novedades registradas.</li>';

    var titulo = m.estado === "averiada" ? "Qué está fallando" : "Qué está pasando";
    var tonoAviso = e.tono === "off" || e.tono === "info" ? "ok" : e.tono;
    return '<article class="mq-ficha" data-cod="' + m.cod + '">' +
      '<header class="mq-ficha__cab"><span class="mq-ficha__img mq-ficha__img--' + e.tono + '">' + dibujo(m.img) + "</span>" +
      "<div><h3>" + m.cod + " · " + esc(m.nombre) + '</h3><span class="tiny">' + nombreEquipo(m.img) + " · etapa de " + m.etapa.toLowerCase() + "</span>" +
      '<div class="mq-ficha__pills"><span class="pill pill--' + e.tono + '">' + e.texto + "</span></div></div>" +
      '<button type="button" class="btn btn--sm btn--ghost" data-mq-accion="editar">' +
      '<svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg> Editar</button>' +
      (m.estado === "descartado" ? "" : '<button type="button" class="btn btn--sm btn--ghost mq-descartar" data-mq-accion="descartar">Descartar</button>') + "</header>" +
      '<div class="aviso aviso--' + tonoAviso + '"><div><b>' + titulo + "</b><p>" + esc(m.nota || queLePasa(m)) + "</p></div></div>" + dano +
      '<div class="mq-ficha__grid">' +
      '<section class="mq-bloque"><h4>Ficha</h4>' + kv + "</section>" +
      '<section class="mq-bloque"><h4>Qué le puede pasar ahora</h4>' +
      '<div class="mq-ciclo">' + ciclo + "</div>" +
      '<p class="mq-dice"><b>' + e.texto + ":</b> " + e.dice + "</p>" +
      '<div class="mq-acciones">' + acciones + "</div></section>" +
      '<section class="mq-bloque mq-bloque--hist"><h4>Historial</h4><ul class="mq-hist">' + hist + "</ul></section>" +
      "</div></article>";
  }

  function filaMQ(m) {
    var e = ESTADO_MQ[m.estado], mt = textoMant(m);
    return "<tr data-cod=\"" + m.cod + "\">" +
      '<td data-l="Equipo"><span class="mq-fila"><span class="mq-mini">' + dibujo(m.img) + "</span><span><b>" + m.cod + '</b><div class="tiny">' + esc(m.nombre) + "</div></span></span></td>" +
      '<td data-l="Tipo">' + (esHerramienta(m) ? "Herramienta" : "Máquina") + "</td>" +
      '<td data-l="Etapa"><span class="etapa etapa--' + (ETAPAS_MQ.indexOf(m.etapa) + 1) + '">' + m.etapa + "</span></td>" +
      '<td data-l="Estado"><span class="pill pill--' + e.tono + '">' + e.texto + "</span></td>" +
      '<td data-l="Qué le pasa">' + esc(queLePasa(m)) + "</td>" +
      '<td data-l="Mantenimiento"><span class="nw">' + (m.estado === "desuso" ? "—" : proximo(m)) + '</span><div class="tiny mq-mt--' + mt.tono + '">' + mt.texto + "</div></td>" +
      '<td data-l="Acciones"><div class="acts">' +
      '<button type="button" class="btn btn--sm btn--ghost" data-mq-ver="' + m.cod + '">Ver</button>' +
      '<button type="button" class="btn btn--sm" data-mq-editar="' + m.cod + '">Editar</button></div></td></tr>';
  }

  function pasaFiltro(m) {
    if (MQ_FILTRO === "maquina") return m.estado !== "descartado" && !esHerramienta(m);
    if (MQ_FILTRO === "herramienta") return m.estado !== "descartado" && esHerramienta(m);
    if (MQ_FILTRO === "problema") return m.estado === "averiada" || m.estado === "mantenimiento" || (m.estado !== "desuso" && faltan(m) < 0);
    if (MQ_FILTRO === "desuso") return m.estado === "desuso";
    if (MQ_FILTRO === "descartado") return m.estado === "descartado";
    return m.estado !== "descartado" && (MQ_FILTRO === "todos" || true);
  }

  function pintarMaquinas() {
    leerMaquinas();
    var mapa = uno("#mq-mapa");
    if (!MAQ || !mapa) return;
    if (!MAQ.length) { mapa.innerHTML = '<button type="button" class="mq-nuevo" data-mq="nueva"><span>+</span><b>Agregar equipo</b><small>Máquina o herramienta</small></button>'; uno("#mq-ficha").innerHTML = ""; return; }
    if (!maq(MQ_SEL)) MQ_SEL = MAQ[0].cod;
    var c = { todos: 0, maquina: 0, herramienta: 0, problema: 0, desuso: 0, descartado: 0 };
    MAQ.forEach(function (m) {
      if (m.estado === "descartado") { c.descartado++; return; }
      c.todos++;
      c[esHerramienta(m) ? "herramienta" : "maquina"]++;
      if (m.estado === "averiada" || m.estado === "mantenimiento" || (m.estado !== "desuso" && faltan(m) < 0)) c.problema++;
      if (m.estado === "desuso") c.desuso++;
    });
    var tabs = uno("#mq-tabs");
    if (tabs) tabs.innerHTML = [["todos", "Todos"], ["maquina", "Máquinas"], ["herramienta", "Herramientas"], ["problema", "Con problemas"], ["desuso", "En desuso"], ["descartado", "Descartados"]]
      .map(function (t) { return '<button type="button" class="' + (MQ_FILTRO === t[0] ? "is-on" : "") + '" data-mq-filtro="' + t[0] + '">' + t[1] + " <span>" + c[t[0]] + "</span></button>"; }).join("");
    var vis = MAQ.filter(pasaFiltro);
    mapa.innerHTML = (vis.length ? vis.map(tarjetaMQ).join("") : '<p class="empty">No hay equipos en este grupo.</p>') +
      (MQ_FILTRO === "descartado" ? "" : '<button type="button" class="mq-nuevo" data-mq="nueva"><span>+</span><b>Agregar equipo</b><small>Máquina o herramienta</small></button>');
    uno("#mq-ficha").innerHTML = fichaMQ(maq(MQ_SEL));
    var cuerpo = uno("#mq-filas");
    if (cuerpo) {
      cuerpo.innerHTML = MAQ.map(filaMQ).join("");
      var k = {};
      MAQ.forEach(function (m) { k[m.estado] = (k[m.estado] || 0) + 1; });
      uno("#mq-resumen").innerHTML = "<b>" + MAQ.length + ' equipos</b> <span class="tiny">' +
        ["operativa", "libre", "averiada", "mantenimiento", "desuso", "descartado"].filter(function (x) { return k[x]; })
          .map(function (x) { return k[x] + " " + ESTADO_MQ[x].texto.toLowerCase(); }).join(" · ") + "</span>";
      var dt = cuerpo.closest(".dt");
      if (uno('input[type="search"]', dt).value || uno("select", dt).selectedIndex) filtrar(dt);
      else dtPintar(dt);
    }
    var problemas = MAQ.filter(function (m) { return m.estado === "averiada" || (m.estado !== "desuso" && faltan(m) < 0); }).length;
    sumarAlMenu("06-maquinaria.html", 0, problemas);
  }

  /* Cambios de estado directos (los que no piden datos) */
  function cambiarEstadoMQ(accion) {
    var m = maq(MQ_SEL), antes = ESTADO_MQ[m.estado].texto;
    if (accion === "asignar" || accion === "averia" || accion === "baja") return abrirEditor(m.cod, accion);
    if (accion === "editar") return abrirEditor(m.cod);
    if (accion === "descartar") return abrirDescarte(m.cod);
    if (accion === "restaurar") {
      anotarHist(m, "Se restauró: volvió al inventario de equipos.", "ok");
      m.estado = "libre"; m.motivodescarte = ""; m.fechadescarte = ""; m.orden = ""; m.operario = ""; m.turno = "";
      MQ_FILTRO = "todos";
    }
    if (accion === "liberar") {
      anotarHist(m, "Terminó la orden " + (m.orden || "") + ". Quedó libre.", "info");
      m.estado = "libre"; m.nota = ""; m.orden = ""; m.operario = ""; m.turno = "";
    }
    if (accion === "mantener") {
      anotarHist(m, (m.estado === "averiada" ? "Enviada a reparación: " + (m.dano || "daño") : "Enviada a mantenimiento") + (m.orden ? ". Orden " + m.orden + " suspendida" : "") + ".", "warn");
      m.estado = "mantenimiento"; m.fechamant = HOY; m.operario = "Técnico de planta"; m.orden = ""; m.nota = "";
    }
    if (accion === "finalizar") {
      anotarHist(m, "Mantenimiento terminado" + (m.dano ? ": se arregló " + m.dano : "") + ". Próximo el " + sumarDias(HOY, numero(m.cada)) + ".", "ok");
      m.estado = "libre"; m.ultimo = HOY; m.operario = ""; m.orden = ""; m.turno = ""; m.dano = ""; m.fechadano = ""; m.necesita = ""; m.nota = "";
    }
    if (accion === "reactivar") {
      anotarHist(m, "Se volvió a poner en uso.", "ok");
      m.estado = "libre"; m.motivo = ""; m.fechadesuso = ""; m.ultimo = HOY; m.nota = "";
    }
    pintarMaquinas();
    aviso(m.cod + ": " + antes + " → " + ESTADO_MQ[m.estado].texto + ". " + ESTADO_MQ[m.estado].dice,
          ESTADO_MQ[m.estado].tono === "off" || ESTADO_MQ[m.estado].tono === "info" ? "ok" : ESTADO_MQ[m.estado].tono);
  }

  /* ---- El editor guiado */

  function opciones(lista, valor, vacio) {
    return (vacio ? '<option value="">' + vacio + "</option>" : "") + lista.map(function (x) {
      var v = x.push ? x[0] : x, t = x.push ? x[1] : x;
      return '<option value="' + esc(v) + '"' + (v === valor ? " selected" : "") + ">" + esc(t) + "</option>";
    }).join("");
  }

  function campo(id, etiqueta, control, ayuda) {
    return '<div class="field mq-campo" id="c-' + id + '"><label for="' + id + '">' + etiqueta + "</label>" +
      '<div class="control mq-control">' + control + "</div>" +
      (ayuda ? '<p class="ayuda" id="' + id + '-ayuda">' + ayuda + "</p>" : "") + "</div>";
  }

  function abrirEditor(cod, preset) {
    var nueva = !cod;
    var m = nueva ? { cod: "EQ-" + String(MAQ.length + 1).padStart(2, "0"), nombre: "", etapa: "Corte", img: "troqueladora",
                      estado: "libre", orden: "", operario: "", turno: "", horas: "0", ultimo: HOY, cada: "60", nota: "", hist: [] } : maq(cod);
    var estado = preset === "asignar" ? "operativa" : preset === "averia" ? "averiada" : preset === "baja" ? "desuso" : m.estado;
    var capa = document.createElement("div");
    capa.className = "overlay mq-over";
    var tiles = EQUIPOS.map(function (x) {
      return '<label class="mq-tile"><input type="radio" name="ed-img" value="' + x[0] + '"' + (x[0] === (m.img || "troqueladora") ? " checked" : "") + ">" +
        dibujo(x[0]) + "<span>" + x[1] + "</span></label>";
    }).join("");
    capa.innerHTML =
      '<div class="modal mq-modal" role="dialog" aria-modal="true" aria-labelledby="mq-ed-t">' +
      '<div class="modal__head"><h3 id="mq-ed-t">' + (nueva ? "Agregar equipo " : "Editar ") + m.cod + "</h3>" +
      '<button type="button" data-mq-cerrar aria-label="Cerrar">✕</button></div>' +
      '<div class="modal__body mq-ed" data-cod="' + m.cod + '" data-nueva="' + nueva + '">' +
      '<div class="mq-ed__form">' +
      '<fieldset class="mq-paso"><legend><span>1</span> Qué es</legend>' +
      '<div class="mq-tiles" role="radiogroup" aria-label="Tipo de equipo">' + tiles + "</div>" +
      campo("ed-nombre", "Nombre", '<input id="ed-nombre" maxlength="60" value="' + esc(m.nombre) + '" placeholder="Ej. Cosedora de poste">', "Como lo llaman en planta. Mínimo 4 letras.") +
      campo("ed-etapa", "Etapa donde trabaja", '<select id="ed-etapa">' + opciones(ETAPAS_MQ, m.etapa) + "</select>", "Si se daña, esta es la etapa que se detiene.") +
      "</fieldset>" +
      '<fieldset class="mq-paso"><legend><span>2</span> Cómo está</legend>' +
      campo("ed-estado", "Estado", '<select id="ed-estado">' +
            opciones(["libre", "operativa", "averiada", "mantenimiento", "desuso"].map(function (k) { return [k, ESTADO_MQ[k].texto]; }), estado) + "</select>",
            ESTADO_MQ[estado].dice) +
      '<div class="mq-si" data-si="operativa">' +
      campo("ed-orden", "Orden en curso", '<select id="ed-orden">' + opciones(ORDENES, m.orden, "Sin orden") + "</select>", "") +
      campo("ed-operario", "Operario", '<select id="ed-operario">' + opciones(OPERARIOS, m.operario, "Sin asignar") + "</select>", "") +
      campo("ed-turno", "Turno", '<select id="ed-turno">' + opciones([["1", "Turno 1 · 06:00 – 14:00"], ["2", "Turno 2 · 14:00 – 22:00"]], m.turno, "Sin turno") + "</select>", "") +
      "</div>" +
      '<div class="mq-si" data-si="averiada">' +
      campo("ed-dano", "Qué se dañó", '<input id="ed-dano" maxlength="80" value="' + esc(m.dano || "") + '" placeholder="Ej. Pistón derecho: bota aceite">', "La pieza o la parte, y cómo se nota el daño.") +
      '<div class="mq-fila2">' +
      campo("ed-fechadano", "Cuándo se dañó", '<input id="ed-fechadano" type="date" max="' + HOY + '" value="' + (m.fechadano || HOY) + '">', "") +
      campo("ed-necesita", "Qué necesita", '<select id="ed-necesita">' + opciones(NECESITA, m.necesita || "Arreglo") + "</select>", "") +
      "</div></div>" +
      '<div class="mq-si" data-si="desuso">' +
      '<div class="mq-fila2">' +
      campo("ed-motivo", "Por qué queda en desuso", '<select id="ed-motivo">' + opciones(MOTIVO_DESUSO, m.motivo || MOTIVO_DESUSO[0]) + "</select>", "") +
      campo("ed-fechadesuso", "Desde cuándo", '<input id="ed-fechadesuso" type="date" max="' + HOY + '" value="' + (m.fechadesuso || HOY) + '">', "") +
      "</div></div>" +
      "</fieldset>" +
      '<fieldset class="mq-paso" id="ed-paso-mant"><legend><span>3</span> Mantenimiento</legend>' +
      '<div class="mq-fila2">' +
      campo("ed-ultimo", "Último mantenimiento", '<input id="ed-ultimo" type="date" value="' + m.ultimo + '" max="' + HOY + '">', "") +
      campo("ed-cada", "Cada cuántos días", '<input id="ed-cada" type="number" min="7" max="365" value="' + m.cada + '">', "Entre 7 y 365.") +
      "</div>" +
      '<div class="mq-prox" id="ed-prox"></div>' +
      "</fieldset></div>" +
      '<aside class="mq-ed__lado"><span class="mq-ed__t">Así va a quedar</span><div id="ed-previa"></div>' +
      '<span class="mq-ed__t">Lo que se revisa antes de guardar</span><ul class="mq-checks" id="ed-checks"></ul></aside>' +
      "</div>" +
      '<div class="modal__foot"><button type="button" class="btn btn--ghost" data-mq-cerrar>Cancelar</button>' +
      '<button type="button" class="btn" id="ed-guardar">Guardar cambios</button></div></div>';
    document.body.appendChild(capa);
    revisarEditor();
    var foco = preset === "averia" ? "#ed-dano" : preset === "asignar" ? "#ed-orden" : preset === "baja" ? "#ed-motivo" : "#ed-nombre";
    setTimeout(function () { var f = uno(foco, capa); if (f) f.focus(); }, 60);
  }

  function valoresEditor() {
    var img = uno('input[name="ed-img"]:checked');
    return {
      img: img ? img.value : "troqueladora",
      nombre: uno("#ed-nombre").value.trim(), etapa: uno("#ed-etapa").value, estado: uno("#ed-estado").value,
      orden: uno("#ed-orden").value, operario: uno("#ed-operario").value, turno: uno("#ed-turno").value,
      dano: uno("#ed-dano").value.trim(), fechadano: uno("#ed-fechadano").value, necesita: uno("#ed-necesita").value,
      motivo: uno("#ed-motivo").value, fechadesuso: uno("#ed-fechadesuso").value,
      ultimo: uno("#ed-ultimo").value, cada: uno("#ed-cada").value
    };
  }

  function revisarEditor() {
    var ed = uno(".mq-ed");
    if (!ed) return;
    var v = valoresEditor(), cod = ed.dataset.cod;
    todos(".mq-si", ed).forEach(function (x) { x.hidden = x.getAttribute("data-si") !== v.estado; });
    uno("#ed-paso-mant").hidden = v.estado === "desuso";
    var ay = uno("#ed-estado-ayuda");
    if (ay) ay.textContent = ESTADO_MQ[v.estado].dice;
    var cada = numero(v.cada), prox = v.ultimo && cada ? sumarDias(v.ultimo, cada) : "";
    var falta = prox ? diasEntre(HOY, prox) : null;
    uno("#ed-prox").innerHTML = prox
      ? 'Próximo mantenimiento: <b>' + prox + "</b> <span class=\"tiny\">(" + v.ultimo + " + " + cada + " días) · " +
        (falta < 0 ? "ya está vencido" : "faltan " + falta + " días") + "</span>"
      : "Escriba la fecha y cada cuántos días para calcular el próximo.";
    var checks = [
      [v.nombre.length >= 4, "Tiene nombre (mínimo 4 letras)"],
      [v.estado !== "operativa" || (v.orden && v.operario && v.turno), "Si está operativa: orden, operario y turno"],
      [v.estado !== "averiada" || (v.dano.length >= 5 && v.fechadano && v.fechadano <= HOY), "Si se dañó: qué se dañó y cuándo"],
      [v.estado !== "desuso" || (v.motivo && v.fechadesuso), "Si queda en desuso: motivo y fecha"],
      [v.estado === "desuso" || (!!v.ultimo && v.ultimo <= HOY && cada >= 7 && cada <= 365), "Mantenimiento: fecha pasada y entre 7 y 365 días"]
    ];
    var ok = checks.every(function (c) { return c[0]; });
    uno("#ed-checks").innerHTML = checks.map(function (c) {
      return '<li class="' + (c[0] ? "si" : "no") + '"><span>' + (c[0] ? "✓" : "✕") + "</span>" + c[1] + "</li>";
    }).join("");
    uno("#ed-guardar").disabled = !ok;
    var previa = { cod: cod, nombre: v.nombre || "Sin nombre", etapa: v.etapa, estado: v.estado, img: v.img,
                   orden: v.orden, operario: v.operario, dano: v.dano, fechadano: v.fechadano, necesita: v.necesita,
                   motivo: v.motivo, fechadesuso: v.fechadesuso, ultimo: v.ultimo || HOY, cada: String(cada || 60) };
    var guardada = MQ_SEL; MQ_SEL = "";
    uno("#ed-previa").innerHTML = tarjetaMQ(previa).replace("<button", "<div").replace(/<\/button>$/, "</div>");
    MQ_SEL = guardada;
  }

  function guardarEditor() {
    var ed = uno(".mq-ed"), v = valoresEditor(), nueva = ed.dataset.nueva === "true";
    var m = nueva ? { cod: ed.dataset.cod, horas: "0", hist: [] } : maq(ed.dataset.cod);
    var antes = m.estado;
    ["img", "nombre", "etapa", "estado", "ultimo"].forEach(function (k) { m[k] = v[k]; });
    m.cada = String(numero(v.cada) || 60);
    m.orden = v.estado === "operativa" ? v.orden : ""; m.operario = v.estado === "operativa" ? v.operario : (v.estado === "mantenimiento" ? m.operario : "");
    m.turno = v.estado === "operativa" ? v.turno : "";
    if (v.estado === "averiada") { m.dano = v.dano; m.fechadano = v.fechadano; m.necesita = v.necesita; }
    if (v.estado === "desuso") { m.motivo = v.motivo; m.fechadesuso = v.fechadesuso; }
    if (v.estado === "mantenimiento" && antes !== "mantenimiento") m.fechamant = HOY;
    m.nota = "";
    if (nueva) { anotarHist(m, "Se agregó al inventario de equipos.", "info"); MAQ.push(m); }
    if (antes !== v.estado || nueva) {
      if (v.estado === "averiada") anotarHist(m, "Se dañó: " + v.dano + " (el " + v.fechadano + "). Necesita " + v.necesita.toLowerCase() + ".", "crit");
      else if (v.estado === "desuso") anotarHist(m, "Quedó en desuso: " + v.motivo.toLowerCase() + ".", "off");
      else if (v.estado === "operativa") anotarHist(m, "Empezó la orden " + v.orden + " con " + v.operario + ".", "ok");
      else if (!nueva) anotarHist(m, "Pasó a " + ESTADO_MQ[v.estado].texto.toLowerCase() + ".", "info");
    } else if (!nueva) anotarHist(m, "Se editaron sus datos.", "info");
    MQ_SEL = m.cod;
    cerrarEditor();
    pintarMaquinas();
    aviso(nueva ? m.cod + " agregado." : "Se guardaron los cambios de " + m.cod +
          (antes !== m.estado ? " (" + ESTADO_MQ[antes].texto + " → " + ESTADO_MQ[m.estado].texto + ")." : "."), "ok");
  }

  function cerrarEditor() { var c = uno(".mq-over"); if (c) c.remove(); }

  /* Descartar: el equipo sale de la planta. Queda en «Descartados» con su motivo
     (se puede restaurar). Si se registró por error, se borra de la lista. */
  function abrirDescarte(cod) {
    var m = maq(cod);
    var capa = document.createElement("div");
    capa.className = "overlay mq-over";
    capa.innerHTML = '<div class="modal mq-desc" role="dialog" aria-modal="true" aria-labelledby="mq-desc-t">' +
      '<div class="modal__head"><h3 id="mq-desc-t">Descartar ' + m.cod + "</h3>" +
      '<button type="button" data-mq-cerrar aria-label="Cerrar">✕</button></div>' +
      '<div class="modal__body mq-desc__b"><div class="mq-desc__eq">' + dibujo(m.img) + "<div><b>" + esc(m.nombre) + '</b><span class="tiny">' +
      nombreEquipo(m.img) + " · " + m.etapa + " · " + ESTADO_MQ[m.estado].texto + "</span></div></div>" +
      campo("ds-motivo", "Por qué se descarta", '<select id="ds-motivo">' + opciones(MOTIVO_DESCARTE, MOTIVO_DESCARTE[0]) + "</select>",
            "Si se registró por error, se borra de la lista. Si no, queda en «Descartados» y se puede restaurar.") +
      campo("ds-fecha", "Fecha", '<input id="ds-fecha" type="date" max="' + HOY + '" value="' + HOY + '">', "") +
      campo("ds-nota", "Nota (opcional)", '<input id="ds-nota" maxlength="100" placeholder="Ej. Se vendió a Calzado El Roble">', "") +
      (m.orden ? '<div class="aviso aviso--warn"><div><b>Tiene una orden en curso</b><p>La orden ' + m.orden + " queda sin equipo: Producción recibe el aviso.</p></div></div>" : "") +
      "</div>" +
      '<div class="modal__foot"><button type="button" class="btn btn--ghost" data-mq-cerrar>Cancelar</button>' +
      '<button type="button" class="btn mq-desc__ok" id="ds-ok">Descartar equipo</button></div></div>';
    document.body.appendChild(capa);
    setTimeout(function () { uno("#ds-motivo").focus(); }, 60);
  }
  function confirmarDescarte() {
    var cod = uno("#mq-desc-t").textContent.replace("Descartar ", ""), m = maq(cod);
    var motivo = uno("#ds-motivo").value, fecha = uno("#ds-fecha").value || HOY, nota = uno("#ds-nota").value.trim();
    cerrarEditor();
    if (motivo === "Se registró por error") {
      MAQ = MAQ.filter(function (x) { return x.cod !== cod; });
      MQ_SEL = MAQ.length ? MAQ[0].cod : "";
      pintarMaquinas();
      return aviso(cod + " se borró de la lista (se había registrado por error).", "warn");
    }
    anotarHist(m, "Descartado: " + motivo.toLowerCase() + (nota ? " · " + nota : "") + ".", "off");
    m.estado = "descartado"; m.motivodescarte = motivo; m.fechadescarte = fecha;
    m.orden = ""; m.operario = ""; m.turno = ""; m.nota = nota;
    var otro = MAQ.filter(function (x) { return x.estado !== "descartado"; })[0];
    if (otro && MQ_FILTRO !== "descartado") MQ_SEL = otro.cod;
    pintarMaquinas();
    aviso(cod + " descartado: " + motivo.toLowerCase() + ". Queda en la pestaña «Descartados» por si hay que restaurarlo.", "warn");
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    var ver = t.closest("[data-mq-ver]");
    if (ver && !t.closest(".mq-ed__lado")) {
      e.preventDefault();
      MQ_SEL = ver.getAttribute("data-mq-ver");
      pintarMaquinas();
      if (ver.closest("table")) uno("#mq-ficha").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    var fl = t.closest("[data-mq-filtro]");
    if (fl) { e.preventDefault(); MQ_FILTRO = fl.getAttribute("data-mq-filtro"); return pintarMaquinas(); }
    var ed = t.closest("[data-mq-editar]");
    if (ed) { e.preventDefault(); MQ_SEL = ed.getAttribute("data-mq-editar"); pintarMaquinas(); return abrirEditor(MQ_SEL); }
    var acc = t.closest("[data-mq-accion]");
    if (acc) { e.preventDefault(); return cambiarEstadoMQ(acc.getAttribute("data-mq-accion")); }
    if (t.closest('[data-mq="nueva"]')) { e.preventDefault(); return abrirEditor(null); }
    if (t.closest("[data-mq-cerrar]") || t.classList.contains("mq-over")) { e.preventDefault(); return cerrarEditor(); }
    if (t.closest("#ed-guardar")) { e.preventDefault(); return guardarEditor(); }
    if (t.closest("#ds-ok")) { e.preventDefault(); return confirmarDescarte(); }

    /* M. Prima, Terminado y los formularios nuevos */
    var b = t.closest("button");
    if (!b) return;
    if (b.dataset.acc === "recibir-lote") { e.preventDefault(); return recibirLote(b); }
    if (b.dataset.acc && b.dataset.acc !== "pedir" && b.closest("tr[data-ref]")) { e.preventDefault(); return accionMP(b); }
    if (b.textContent.trim() === "Registrar entrada") { e.preventDefault(); return registrarEntrada(); }
  }, true);

  document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrarEditor(); });
  document.addEventListener("input", function (e) {
    if (e.target.closest && e.target.closest(".mq-ed")) revisarEditor();
    if (e.target.id === "ec-cant" || e.target.id === "ec-costo") explicarEntrada();
  });
  document.addEventListener("change", function (e) {
    if (e.target.closest && e.target.closest(".mq-ed")) revisarEditor();
    if (e.target.id === "ec-ins") explicarEntrada();
    if (e.target.id === "mr-ref") mostrarExistencia();
  });

  /* Si un saldo cambió en otra pantalla, esta se pone al día */
  function sincronizarMP() {
    todos("tr[data-ref][data-min]").forEach(function (f) {
      var r = f.dataset.ref;
      if (SALDO[r] !== undefined && SALDO[r] !== numero(f.dataset.saldo)) { f.dataset.saldo = SALDO[r]; pintarMP(f); }
    });
  }
  function sincronizarInicio() {
    if (!uno("#dt-04-adentro")) return;
    /* si en Bodegas entró un material nuevo, Inicio le abre su fila */
    Object.keys(STOCK).forEach(function (b) {
      Object.keys(STOCK[b]).forEach(function (c) { if (material(c)) asegurarFila(c, b); });
    });
    todos("#dt-04-adentro tbody tr").forEach(function (f) {
      var r = (celda(f, "Código") || {}).textContent, b = f.getAttribute("data-bodega"), hay = uno(".hay", f);
      var v = (STOCK[b] || {})[r];
      if (hay && v !== undefined && v !== numero(hay.textContent)) {
        hay.textContent = miles(v); pintarEstado(f); refrescarBodega(b);
      }
    });
  }



  /* ---------------------------------------------------------------- Solicitud de material (formulario completo)

     «Pedir para esta bodega», «Pedir a Compras» y «Pedir» de M. Prima abren
     este formulario. Se pueden pedir varios materiales a la vez: el tipo, cuál,
     el color, la medida y la cantidad. Viene lleno con lo que le falta a la bodega. */

  var TIPOS = [
    { k: "cuero", t: "Cuero y pieles", medida: "Calibre", opciones: ["1,2 – 1,4 mm", "1,4 – 1,6 mm", "1,6 – 1,8 mm", "1,8 – 2,0 mm"],
      colores: ["Negro", "Café", "Miel", "Vino", "Blanco", "Natural"], prov: "Curtiembre Los Andes" },
    { k: "suela", t: "Suelas", medida: "Talla", opciones: ["Surtido 36 – 43", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
      colores: ["Negro", "Café", "Miel", "Blanco", "Natural"], prov: "Suelas Pacífico" },
    { k: "forro", t: "Forros y textiles", medida: "Ancho del rollo", opciones: ["1,40 m", "1,50 m", "Por dm²"],
      colores: ["Beige", "Negro", "Café", "Gris", "Blanco"], prov: "Insumos Textiles JR" },
    { k: "hilo", t: "Hilos", medida: "Grosor", opciones: ["Calibre 40", "Calibre 60", "Calibre 20"],
      colores: ["Negro", "Café", "Miel", "Blanco", "Beige"], prov: "Insumos Textiles JR" },
    { k: "plantilla", t: "Plantillas", medida: "Talla", opciones: ["Surtido 36 – 43", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"],
      colores: ["Natural", "Negro", "Gris"], prov: "Suelas Pacífico" },
    { k: "quimico", t: "Pegantes y químicos", medida: "Presentación", opciones: ["Galón", "Caneca de 5 kg", "Litro"],
      colores: [], prov: "Químicos del Norte" },
    { k: "herraje", t: "Herrajes y cierres", medida: "Medida", opciones: ["Pequeño (8 mm)", "Mediano (10 mm)", "Grande (12 mm)", "15 cm", "20 cm"],
      colores: ["Plata", "Oro viejo", "Negro", "Cobre"], prov: "Herrajes Cúcuta" },
    { k: "cordon", t: "Cordones", medida: "Largo", opciones: ["90 cm", "120 cm", "150 cm"],
      colores: ["Negro", "Café", "Blanco", "Miel"], prov: "Insumos Textiles JR" },
    { k: "terminado", t: "Producto terminado", medida: "Talla", opciones: ["Curva completa 36 – 43", "35 – 40 (dama)", "38 – 44 (caballero)"],
      colores: ["Negro", "Café", "Miel", "Vino"], prov: "Producción (orden interna)" },
    { k: "otro", t: "Otro material", medida: "Medida o presentación", opciones: [], colores: ["Negro", "Café", "Blanco", "No aplica"], prov: "" }
  ];

  var CATALOGO = [
    ["MP-01", "Cuero vacuno graso", "cuero", "dm²", 1450], ["MP-09", "Cuero napa", "cuero", "dm²", 1680],
    ["MP-10", "Gamuza", "cuero", "dm²", 1520], ["MP-11", "Charol sintético", "cuero", "dm²", 980],
    ["MP-02", "Suela de caucho 36-43", "suela", "par", 9800], ["MP-12", "Suela TR", "suela", "par", 8600],
    ["MP-13", "Suela de cuero", "suela", "par", 14500],
    ["MP-03", "Forro textil", "forro", "m", 3200], ["MP-14", "Forro de badana", "forro", "dm²", 420],
    ["MP-04", "Hilo poliéster 40", "hilo", "cono", 6500], ["MP-15", "Hilo nylon 60", "hilo", "cono", 7200],
    ["MP-05", "Plantilla EVA", "plantilla", "par", 2100], ["MP-16", "Plantilla de látex", "plantilla", "par", 3900],
    ["MP-06", "Pegante poliuretano", "quimico", "kg", 18500], ["MP-17", "Solvente limpiador", "quimico", "l", 12000],
    ["MP-18", "Tinta para cantos", "quimico", "l", 21000],
    ["MP-07", "Ojalete metálico", "herraje", "un", 45], ["MP-19", "Hebilla metálica", "herraje", "un", 650],
    ["MP-20", "Cremallera", "herraje", "un", 1300],
    ["MP-08", "Cordón encerado", "cordon", "par", 1200], ["MP-21", "Cordón plano", "cordon", "par", 900],
    ["PT-REF-1042", "Bota Andina", "terminado", "par", 37025], ["PT-REF-1043", "Mocasín Cúcuta", "terminado", "par", 30180],
    ["PT-REF-1044", "Zapato Colegial Reforzado", "terminado", "par", 30275], ["PT-REF-1045", "Sandalia Verano", "terminado", "par", 23170],
    ["PT-REF-1046", "Botín Casual Cuero", "terminado", "par", 35830]
  ];
  var BODEGAS = [["BOD-01", "BOD-01 · Principal"], ["BOD-02", "BOD-02 · Producto terminado"],
                 ["BOD-03", "BOD-03 · Merma y reproceso"], ["BOD-04", "BOD-04 · Insumos y químicos"]];
  var PROVEEDORES = ["Curtiembre Los Andes", "Suelas Pacífico", "Insumos Textiles JR", "Químicos del Norte",
                     "Herrajes Cúcuta", "Producción (orden interna)"];

  function tipo(k) { return TIPOS.filter(function (t) { return t.k === k; })[0]; }
  function material(cod) { return CATALOGO.filter(function (m) { return m[0] === cod; })[0]; }

  /* Lo que hay de un código en una bodega (de la tabla de Inicio, si está a la vista) */
  function hayEn(cod, bod) {
    var f = todos("#dt-04-adentro tbody tr").filter(function (x) {
      return x.getAttribute("data-bodega") === bod && (celda(x, "Código") || {}).textContent === cod;
    })[0];
    if (f) return { hay: numero(uno(".hay", f).textContent), min: numero(uno(".min", f).textContent) };
    var mp = uno('tr[data-ref="' + cod + '"][data-min]');
    if (mp) return { hay: numero(mp.dataset.saldo), min: numero(mp.dataset.min) };
    return null;
  }

  function renglonHTML(n, r) {
    r = r || {};
    var t = tipo(r.tipo || "cuero");
    var mats = CATALOGO.filter(function (m) { return m[2] === t.k; });
    var matOpts = mats.map(function (m) {
      return '<option value="' + m[0] + '"' + (m[0] === r.cod ? " selected" : "") + ">" + m[0] + " · " + m[1] + "</option>";
    }).join("") + '<option value="otro"' + (r.cod === "otro" || t.k === "otro" ? " selected" : "") + ">Otro (escribirlo)</option>";
    var colores = t.colores.length ? t.colores : ["No aplica"];
    var medidas = t.opciones.length ? t.opciones : null;
    return '<div class="sol-r" data-n="' + n + '">' +
      '<span class="sol-r__n">' + n + "</span>" +
      '<div class="sol-r__g">' +
      '<label class="sol-f"><span>Tipo de material</span><select data-c="tipo">' +
        TIPOS.map(function (x) { return '<option value="' + x.k + '"' + (x.k === t.k ? " selected" : "") + ">" + x.t + "</option>"; }).join("") +
      "</select></label>" +
      '<label class="sol-f sol-f--ancho"><span>Material o referencia</span><select data-c="cod">' + matOpts + "</select></label>" +
      '<label class="sol-f sol-f--ancho sol-otro"' + (r.cod === "otro" || t.k === "otro" ? "" : " hidden") + '><span>¿Cuál? (escríbalo)</span>' +
        '<input data-c="nombre" maxlength="60" placeholder="Ej. Contrafuerte termoadherible" value="' + esc(r.nombre || "") + '"></label>' +
      '<label class="sol-f"><span>Color</span><select data-c="color">' +
        colores.map(function (c) { return "<option" + (c === r.color ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select></label>" +
      '<label class="sol-f"><span>' + t.medida + "</span>" +
        (medidas ? '<select data-c="medida">' + medidas.map(function (c) { return "<option" + (c === r.medida ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select>"
                 : '<input data-c="medida" maxlength="30" placeholder="Ej. 2 mm" value="' + esc(r.medida || "") + '">') + "</label>" +
      '<label class="sol-f sol-f--cant"><span>Cantidad</span><span class="sol-cant"><input data-c="cant" type="number" min="1" value="' + (r.cant || "") + '" placeholder="0">' +
        '<b data-c="unidad">' + (r.cod && material(r.cod) ? material(r.cod)[3] : "un") + "</b></span></label>" +
      "</div>" +
      '<span class="sol-cap" hidden><i></i></span>' +
      '<p class="sol-r__info" data-c="info"></p>' +
      '<button type="button" class="sol-r__x" data-sol="quitar" aria-label="Quitar este material">✕</button>' +
      "</div>";
  }

  /* Cambia el tipo: se rehacen las opciones de ese renglón */
  function cambiarTipo(r) {
    var n = r.getAttribute("data-n"), k = uno('[data-c="tipo"]', r).value;
    var primero = CATALOGO.filter(function (m) { return m[2] === k; })[0];
    var nuevo = document.createElement("div");
    nuevo.innerHTML = renglonHTML(n, { tipo: k, cod: primero ? primero[0] : "otro" });
    r.replaceWith(nuevo.firstChild);
  }



  /* ---- Pedidos a Compras: historial, capacidad de cada bodega y edición

     PEDIDOS guarda cada pedido que Inventario registra. Inventario solo
     registra: la compra la hace Compras y la entrega Logística. Un pedido se
     puede editar o anular, y se pueden hacer varios para el mismo material. */

  var PEDIDOS = [
    { id: "SM-2026-002", fecha: "2026-09-15", bod: "BOD-04", urg: "Alta", para: "2026-09-25", prov: "Insumos Textiles JR",
      obs: "Generado solo: el cordón quedó bajo el mínimo.", estado: "Registrado", editado: "",
      items: [{ k: "cordon", cod: "MP-08", nombre: "Cordón encerado", color: "Negro", medida: "120 cm", cant: 210, unidad: "par" }] },
    { id: "SM-2026-001", fecha: "2026-09-15", bod: "BOD-01", urg: "Alta", para: "2026-09-25", prov: "Suelas Pacífico",
      obs: "Generado solo: la plantilla quedó bajo el mínimo.", estado: "Registrado", editado: "",
      items: [{ k: "plantilla", cod: "MP-05", nombre: "Plantilla EVA", color: "Natural", medida: "Surtido 36 – 43", cant: 120, unidad: "par" }] }
  ];
  var PD_EDITANDO = null, IR_A_PEDIDOS = false;

  /* Lo máximo que cabe de cada material en cada bodega (el espacio de su estante) */
  var CAPACIDAD = {
    "BOD-01": { "MP-01": 4000, "MP-02": 800, "MP-03": 500, "MP-05": 500 },
    "BOD-02": { "PT-REF-1042": 200, "PT-REF-1043": 150 },
    "BOD-03": { "ME-01": 100, "ME-02": 100, "ME-03": 50 },
    "BOD-04": { "MP-04": 80, "MP-06": 50, "MP-07": 12000, "MP-08": 700 }
  };
  var CAP_POR_UNIDAD = { "dm²": 3000, "par": 400, "m": 400, "cono": 60, "kg": 40, "un": 8000, "l": 40 };
  function capDe(b, c) {
    var v = (CAPACIDAD[b] || {})[c];
    if (v) return v;
    var m = material(c);
    return m ? CAP_POR_UNIDAD[m[3]] || 500 : 0;
  }
  /* Lo que ya está pedido y todavía no llega (sin contar un pedido que se esté editando) */
  function pedidoDe(b, c, sinEste) {
    var t = 0;
    PEDIDOS.forEach(function (p) {
      if (p.bod !== b || p.estado === "Anulado" || p.id === sinEste) return;
      p.items.forEach(function (it) { if (it.cod === c) t += it.cant; });
    });
    return t;
  }
  function hayEnBodega(b, c) { return ((typeof STOCK !== "undefined" && STOCK[b]) || {})[c] || 0; }
  function sugerido(b, c) {
    var mn = minDe(b, c), hay = hayEnBodega(b, c), ped = pedidoDe(b, c);
    var falta = mn ? mn * 2 - hay - ped : 0;
    return Math.max(0, Math.min(falta, capDe(b, c) - hay - ped));
  }

  function revisarSolicitud() {
    var caja = uno(".sol");
    if (!caja) return;
    todos('.sol-r select[data-c="cod"]', caja).forEach(function (x) {
      if (!x.classList.contains("pick-oculto")) mejorarSelect(x); else refrescarPick(x);
    });
    var bod = uno("#sol-bod").value, total = 0, ok = true, n = 0;
    var suma = {};   // si el mismo material va en dos renglones, cuentan juntos para la capacidad
    todos(".sol-r", caja).forEach(function (r) {
      var cod = uno('[data-c="cod"]', r).value;
      suma[cod] = (suma[cod] || 0) + numero(uno('[data-c="cant"]', r).value);
    });
    todos(".sol-r", caja).forEach(function (r, i) {
      r.setAttribute("data-n", i + 1);
      uno(".sol-r__n", r).textContent = i + 1;
      var cod = uno('[data-c="cod"]', r).value, m = material(cod);
      uno(".sol-otro", r).hidden = cod !== "otro";
      var cant = numero(uno('[data-c="cant"]', r).value);
      var nombre = uno('[data-c="nombre"]', r).value.trim();
      uno('[data-c="unidad"]', r).textContent = m ? m[3] : "un";
      var info = uno('[data-c="info"]', r), txt = "", falta = [], lleno = 0;
      var barra = uno(".sol-cap", r);
      if (m) {
        var hay = hayEnBodega(bod, cod), ped = pedidoDe(bod, cod, PD_EDITANDO), cap = capDe(bod, cod);
        var queda = hay + ped + suma[cod];
        lleno = Math.round(queda * 100 / cap);
        txt = "En " + bod + " hay " + miles(hay) + " " + m[3] + (ped ? " · ya pedido y por llegar " + miles(ped) : "") +
              " · caben " + miles(cap) + " · con este pedido quedaría en " + miles(queda) + " (" + lleno + " %)";
        if (cant) total += cant * m[4];
        if (queda > cap) falta.push("bajar la cantidad: sobrepasa la capacidad de " + bod + " en " + miles(queda - cap) + " " + m[3] +
                                    " (máximo " + miles(Math.max(0, cap - hay - ped - (suma[cod] - cant))) + ")");
      } else txt = "Material nuevo: Compras lo cotiza y Logística le busca lugar.";
      if (!cant) falta.unshift("escribir la cantidad");
      if (cod === "otro" && nombre.length < 3) falta.unshift("escribir el nombre del material");
      if (falta.length) { ok = false; txt = "Falta " + falta.join(" y ") + ". " + txt; }
      info.textContent = txt;
      if (barra) {
        barra.hidden = !m;
        uno("i", barra).style.width = Math.min(100, lleno) + "%";
        barra.classList.toggle("sol-cap--lleno", lleno > 100);
        barra.classList.toggle("sol-cap--casi", lleno > 85 && lleno <= 100);
      }
      r.classList.toggle("sol-r--falta", !!falta.length);
      n++;
    });
    var fecha = uno("#sol-fecha").value;
    var fechaOk = fecha && fecha >= HOY;
    if (!fechaOk) ok = false;
    if (!n) ok = false;
    uno("#sol-fecha-ayuda").textContent = fechaOk ? "Compras tiene " + diasEntre(HOY, fecha) + " día(s) para traerlo." : "Elija una fecha de hoy en adelante.";
    uno("#sol-resumen").innerHTML = "<b>" + n + " material(es)</b> · valor aproximado <b>" + pesos(total) + "</b>" +
      (ok ? "" : ' · <span class="sol-falta">revise lo marcado en rojo</span>');
    uno("#sol-enviar").disabled = !ok;
  }

  function abrirSolicitud(bod, renglones, titulo, editar) {
    cerrarSolicitud();
    var p = editar ? PEDIDOS.filter(function (x) { return x.id === editar; })[0] : null;
    PD_EDITANDO = p ? p.id : null;
    if (p) renglones = p.items.map(function (it) {
      return { tipo: it.k, cod: material(it.cod) ? it.cod : "otro", nombre: material(it.cod) ? "" : it.nombre,
               color: it.color, medida: it.medida, cant: it.cant };
    });
    if (!renglones || !renglones.length) renglones = [{ tipo: "cuero", cod: "MP-01" }];
    var codigo = p ? p.id : "SC-2026-0" + (ULTIMA_SC + 1);
    var capa = document.createElement("div");
    capa.className = "overlay sol-over";
    capa.innerHTML =
      '<div class="modal sol-modal" role="dialog" aria-modal="true" aria-labelledby="sol-t">' +
      '<div class="modal__head"><div><h3 id="sol-t">' + (p ? "Editar el pedido " + p.id : "Pedido de material a Compras") + "</h3>" +
      '<span class="sol-sub">' + codigo + (p ? " · registrado el " + p.fecha : "") + (titulo ? " · " + titulo : "") + "</span></div>" +
      '<button type="button" data-sol="cerrar" aria-label="Cerrar">✕</button></div>' +
      '<div class="modal__body sol">' +
      '<div class="sol-gen">' +
      '<label class="sol-f"><span>Bodega que lo recibe</span><select id="sol-bod">' +
        BODEGAS.map(function (b) { return '<option value="' + b[0] + '"' + (b[0] === (p ? p.bod : bod) ? " selected" : "") + ">" + b[1] + "</option>"; }).join("") + "</select></label>" +
      '<label class="sol-f"><span>Urgencia</span><select id="sol-urg">' + ["Normal", "Alta", "Urgente"].map(function (u) {
        return "<option" + (p && p.urg === u ? " selected" : "") + ">" + u + "</option>"; }).join("") + "</select></label>" +
      '<label class="sol-f"><span>Para cuándo se necesita</span><input id="sol-fecha" type="date" min="' + HOY + '" value="' +
        (p && p.para >= HOY ? p.para : sumarDias(HOY, 7)) + '">' +
        '<small class="ayuda" id="sol-fecha-ayuda"></small></label>' +
      '<label class="sol-f"><span>Proveedor sugerido</span><select id="sol-prov"><option value="">Que Compras decida</option>' +
        PROVEEDORES.map(function (x) { return "<option" + (p && p.prov === x ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select></label>" +
      "</div>" +
      '<h4 class="sol-h">Lo que se pide</h4>' +
      '<div class="sol-lista" id="sol-lista">' + renglones.map(function (r, i) { return renglonHTML(i + 1, r); }).join("") + "</div>" +
      '<button type="button" class="btn btn--sm btn--ghost sol-mas" data-sol="agregar">+ Agregar otro material</button>' +
      '<label class="sol-f sol-f--full"><span>Observaciones para Compras</span>' +
        '<textarea id="sol-obs" rows="2" maxlength="300" placeholder="Ej. El cuero debe venir del mismo lote para que el color no cambie">' + esc(p ? p.obs : "") + "</textarea></label>" +
      "</div>" +
      '<div class="modal__foot sol-pie"><span class="sol-res" id="sol-resumen"></span>' +
      '<button type="button" class="btn btn--ghost" data-sol="cerrar">Cancelar</button>' +
      '<button type="button" class="btn" id="sol-enviar">' + (p ? "Guardar cambios" : "Registrar pedido") + "</button></div></div>";
    document.body.appendChild(capa);
    if (!p) { var prov = tipo(renglones[0].tipo || "cuero").prov; if (prov) uno("#sol-prov").value = prov; }
    revisarSolicitud();
    setTimeout(function () { var c = uno('.sol-r [data-c="cant"]'); if (c) c.focus(); }, 60);
  }

  function faltantesDe(bod) {
    return Object.keys(STOCK[bod] || {}).filter(function (c) {
      var mn = minDe(bod, c);
      return mn && hayEnBodega(bod, c) < mn * 1.6 && material(c);
    }).map(function (c) {
      return { tipo: material(c)[2], cod: c, cant: sugerido(bod, c) || "" };
    });
  }

  function enviarSolicitudCompleta() {
    var bod = uno("#sol-bod").value, urg = uno("#sol-urg").value, fecha = uno("#sol-fecha").value;
    var prov = uno("#sol-prov").value, obs = uno("#sol-obs").value.trim();
    var items = todos(".sol-r").map(function (r) {
      var cod = uno('[data-c="cod"]', r).value, m = material(cod), k = uno('[data-c="tipo"]', r).value;
      return { k: k, cod: m ? cod : "NUEVO", nombre: m ? m[1] : uno('[data-c="nombre"]', r).value.trim(),
               color: uno('[data-c="color"]', r).value, medida: uno('[data-c="medida"]', r).value,
               cant: numero(uno('[data-c="cant"]', r).value), unidad: m ? m[3] : "un" };
    });
    var p, nuevo = !PD_EDITANDO;
    if (nuevo) {
      ULTIMA_SC += 1;
      p = { id: "SC-2026-0" + ULTIMA_SC, fecha: HOY, estado: "Registrado", editado: "" };
      PEDIDOS.unshift(p);
    } else {
      p = PEDIDOS.filter(function (x) { return x.id === PD_EDITANDO; })[0];
      p.estado = "Editado"; p.editado = HOY;
    }
    p.bod = bod; p.urg = urg; p.para = fecha; p.prov = prov; p.obs = obs; p.items = items;

    if (nuevo) {
      var panel = panelPorTitulo("Últimos Movimientos");
      if (panel) {
        var f = nuevaFila(panel, "Mov.");
        ponerCelda(f, "Mov.", "<b>" + p.id + "</b>");
        ponerCelda(f, "Referencia", bod + '<div class="tiny">' + items.length + " material(es)</div>");
        ponerCelda(f, "Tipo", '<span class="chip chip--vino">Pedido</span>');
        ponerCelda(f, "Cantidad", items.length);
        ponerCelda(f, "Documento", "Pedido a Compras · " + urg);
        ponerCelda(f, "Fecha", HOY);
        recontar(panel, "movimientos");
      }
      var ps = panelPorTitulo("Solicitudes Enviadas a Compras");
      if (ps) {
        var s = nuevaFila(ps, "Solicitud");
        ponerCelda(s, "Solicitud", "<b>" + p.id + '</b><div class="tiny">' + HOY + " · para el " + fecha + "</div>");
        ponerCelda(s, "Origen", '<span class="chip chip--cobre">Inventario</span><div class="tiny">' + bod + "</div>");
        ponerCelda(s, "Insumo", esc(items[0].nombre) + '<div class="tiny">' + items[0].cod + " · " + items[0].color + " · " + items[0].medida +
                   (items.length > 1 ? " · y " + (items.length - 1) + " más" : "") + "</div>");
        ponerCelda(s, "Cantidad", "<b>" + miles(items[0].cant) + '</b> <span class="tiny">' + items[0].unidad + "</span>");
        ponerCelda(s, "Urgencia", '<span class="pill pill--' + (urg === "Normal" ? "off" : urg === "Alta" ? "warn" : "crit") + '">' + urg + "</span>");
        ponerCelda(s, "Proveedor sugerido", esc(prov || "Que Compras decida"));
        ponerCelda(s, "Estado", '<span class="pill pill--warn">Registrado</span>');
        var dts = uno(".dt", ps);
        if (dts) { dts.dataset.pag = 1; dtPintar(dts); }
      }
    }
    /* el flujo que lee Compras (el mismo de siempre) */
    var lista = leerFlujo().filter(function (x) { return x.id !== p.id; });
    lista.unshift({ id: p.id, bodega: bod, estado: "Nueva", fecha: p.fecha, oc: null, urgencia: urg, para: fecha,
                    observaciones: obs, insumos: items.map(function (it) {
                      return { cod: it.cod, que: it.nombre, falta: it.cant, proveedor: prov, color: it.color, medida: it.medida };
                    }) });
    guardarFlujo(lista);
    PD_EDITANDO = null;
    cerrarSolicitud();
    marcarPedidosInicio();
    pintarPedidos();
    pintarAlmacen();
    aviso(nuevo ? "Pedido " + p.id + " registrado: " + items.length + " material(es) para " + bod + ", urgencia " + urg.toLowerCase() +
                  ", para el " + fecha + ". Lo ve en Bodegas → Pedidos a Compras."
                : "Pedido " + p.id + " editado. Quedó con " + items.length + " material(es).", "ok");
  }

  /* En «Qué hay que abastecer» (Inicio): la fila dice lo que ya está pedido, sin bloquearse */
  function marcarPedidosInicio() {
    todos("#dt-04-abastecer tbody tr").forEach(function (f) {
      var b = (celda(f, "Bodega") || {}).textContent.trim();
      var c = ((celda(f, "Insumo") || {}).textContent || "").trim().split(/[\s·]+/)[0];
      var ped = pedidoDe(b, c), est = celda(f, "Cómo está"), boton = uno(".btn", f);
      if (boton) {
        boton.disabled = false;
        boton.textContent = ped ? "Pedir más" : "Pedir a Compras";
        boton.classList.toggle("btn--ghost", !!ped || !uno(".pill--crit", f));
      }
      if (est) {
        var p = uno(".pill", est);
        if (p && p.textContent === "Pedido a Compras") {           // lo que dejó la versión anterior
          var h = hayEnBodega(b, c), mn = minDe(b, c), e = mn ? estadoDe(h, mn) : { tono: "ok", texto: "Suficiente" };
          p.className = "pill pill--" + e.tono; p.textContent = e.texto;
        }
        var nota = uno(".pd-nota", est);
        var m = material(c);
        if (ped) {
          if (!nota) { nota = document.createElement("div"); nota.className = "tiny pd-nota"; est.appendChild(nota); }
          nota.textContent = "Pedido: " + miles(ped) + " " + (m ? m[3] : "") + " por llegar";
        } else if (nota) nota.remove();
      }
      f.classList.remove("es-pedida");
    });
  }

  function pintarPedidos() {
    var cuerpo = uno("#pd-filas");
    if (!cuerpo) return;
    cuerpo.innerHTML = PEDIDOS.map(function (p) {
      var tono = p.estado === "Anulado" ? "off" : p.estado === "Editado" ? "warn" : "ok";
      var lista = p.items.map(function (it) {
        return '<li><b>' + miles(it.cant) + " " + it.unidad + "</b> · " + (it.cod === "NUEVO" ? "" : it.cod + " ") + esc(it.nombre) +
          ' <span class="tiny">· ' + esc(it.color) + " · " + esc(it.medida) + "</span></li>";
      }).join("");
      return '<tr class="' + (p.estado === "Anulado" ? "pd-anulado" : "") + '"><td data-l="Pedido"><b class="nw">' + p.id + '</b><div class="tiny nw">' + p.fecha + "</div></td>" +
        '<td data-l="Bodega"><b class="nw">' + p.bod + '</b><div class="tiny">' + NOMBRE_BOD[p.bod] + "</div></td>" +
        '<td data-l="Qué se pidió"><ul class="pd-items">' + lista + "</ul>" +
          (p.prov ? '<div class="tiny">Proveedor: ' + esc(p.prov) + "</div>" : "") +
          (p.obs ? '<div class="tiny">Nota: ' + esc(p.obs) + "</div>" : "") + "</td>" +
        '<td data-l="Urgencia"><span class="pill pill--' + (p.urg === "Normal" ? "off" : p.urg === "Alta" ? "warn" : "crit") + '">' + p.urg + "</span></td>" +
        '<td data-l="Para cuándo"><span class="nw">' + p.para + "</span></td>" +
        '<td data-l="Estado"><span class="pill pill--' + tono + '">' + p.estado + "</span>" +
          (p.editado ? '<div class="tiny nw">el ' + p.editado + "</div>" : "") + "</td>" +
        '<td data-l="Acciones"><div class="acts">' +
          (p.estado === "Anulado" ? '<button type="button" class="btn btn--sm btn--ghost" data-pd="copiar" data-id="' + p.id + '">Pedir de nuevo</button>'
            : '<button type="button" class="btn btn--sm" data-pd="editar" data-id="' + p.id + '">Editar</button>' +
              '<button type="button" class="btn btn--sm btn--ghost" data-pd="anular" data-id="' + p.id + '">Anular</button>') +
        "</div></td></tr>";
    }).join("");
    var c = { Registrado: 0, Editado: 0, Anulado: 0 };
    PEDIDOS.forEach(function (p) { c[p.estado]++; });
    uno("#pd-res").innerHTML = '<span class="dt__res-t">Totales<em>de los ' + PEDIDOS.length + " pedido(s)</em></span>" +
      '<span class="dt__res-i dt__res-i--ok"><b>Registrados</b><span>' + c.Registrado + "</span></span>" +
      '<span class="dt__res-i dt__res-i--warn"><b>Editados</b><span>' + c.Editado + "</span></span>" +
      '<span class="dt__res-i"><b>Anulados</b><span>' + c.Anulado + "</span></span>";
    var dt = uno("#dt-04-pedidos");
    if (uno('input[type="search"]', dt).value || todos(".dt__filtros select", dt).some(function (s) { return s.selectedIndex > 0; })) filtrar(dt);
    else dtPintar(dt);
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-pd]") : null;
    if (!b) {
      if (e.target.closest && e.target.closest("[data-ir-pedidos]")) IR_A_PEDIDOS = true;
      return;
    }
    e.preventDefault();
    e.stopPropagation();   // «Anular» de aquí no es el «Anular» de las solicitudes viejas
    var acc = b.getAttribute("data-pd"), id = b.getAttribute("data-id");
    var p = PEDIDOS.filter(function (x) { return x.id === id; })[0];
    if (acc === "nuevo") return abrirSolicitud(typeof BG_SEL !== "undefined" ? BG_SEL : "BOD-01", faltantesDe(BG_SEL), "nuevo pedido");
    if (acc === "editar") return abrirSolicitud(p.bod, null, "cambie lo que necesite", p.id);
    if (acc === "copiar") {
      return abrirSolicitud(p.bod, p.items.map(function (it) {
        return { tipo: it.k, cod: material(it.cod) ? it.cod : "otro", nombre: material(it.cod) ? "" : it.nombre, color: it.color, medida: it.medida, cant: it.cant };
      }), "copia de " + p.id);
    }
    if (acc === "anular") {
      if (!b.classList.contains("is-seguro")) {
        b.classList.add("is-seguro"); b.textContent = "¿Anular? Pulse otra vez";
        setTimeout(function () { if (b.isConnected) { b.classList.remove("is-seguro"); b.textContent = "Anular"; } }, 4000);
        return;
      }
      p.estado = "Anulado"; p.editado = HOY;
      guardarFlujo(leerFlujo().map(function (x) { if (x.id === p.id) x.estado = "Anulada"; return x; }));
      pintarPedidos(); marcarPedidosInicio();
      return aviso("Pedido " + p.id + " anulado. No se borra: queda en el historial.", "warn");
    }
  }, true);

  function cerrarSolicitud() { var c = uno(".sol-over"); if (c) c.remove(); }



  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t.closest) return;
    var b = t.closest("button");
    /* los botones que abren el formulario */
    if (b && b.hasAttribute("data-pedir")) {
      e.preventDefault(); e.stopPropagation();
      var bod = b.getAttribute("data-pedir");
      var falt = faltantesDe(bod);
      return abrirSolicitud(bod, falt, falt.length ? "viene con lo que le falta a " + bod : "para " + bod);
    }
    var filaAb = b && b.closest("#dt-04-abastecer tbody tr");
    if (filaAb && /^Pedir/.test(b.textContent.trim())) {
      e.preventDefault(); e.stopPropagation();
      var bodA = (celda(filaAb, "Bodega") || {}).textContent.trim();
      var cod = (celda(filaAb, "Insumo") || {}).textContent.trim().split(/[\s·]+/)[0];
      var m = material(cod);
      return abrirSolicitud(bodA, [{ tipo: m ? m[2] : "otro", cod: m ? cod : "otro",
        cant: sugerido(bodA, cod) || "" }], cod + " para " + bodA);
    }
    if (b && b.dataset.acc === "pedir" && b.closest("tr[data-ref]")) {
      e.preventDefault(); e.stopPropagation();
      var fr = b.closest("tr"), mm = material(fr.dataset.ref);
      var bmp = bodegaDe(fr.dataset.ref);
      return abrirSolicitud(bmp, [{ tipo: mm ? mm[2] : "otro", cod: fr.dataset.ref,
        cant: sugerido(bmp, fr.dataset.ref) || "" }], fr.dataset.ref + " para " + bmp);
    }
    if (!t.closest(".sol-over")) return;
    if (t.classList.contains("sol-over") || t.closest('[data-sol="cerrar"]')) { e.preventDefault(); return cerrarSolicitud(); }
    if (t.closest('[data-sol="agregar"]')) {
      e.preventDefault();
      var lista = uno("#sol-lista"), caja = document.createElement("div");
      caja.innerHTML = renglonHTML(todos(".sol-r").length + 1, { tipo: "cuero", cod: "MP-01" });
      lista.appendChild(caja.firstChild);
      revisarSolicitud();
      return uno('.sol-r:last-child [data-c="tipo"]').focus();
    }
    if (t.closest('[data-sol="quitar"]')) {
      e.preventDefault();
      t.closest(".sol-r").remove();
      return revisarSolicitud();
    }
    if (t.closest("#sol-enviar")) { e.preventDefault(); return enviarSolicitudCompleta(); }
  }, true);

  document.addEventListener("change", function (e) {
    if (!e.target.closest || !e.target.closest(".sol")) return;
    if (e.target.getAttribute("data-c") === "tipo") {
      cambiarTipo(e.target.closest(".sol-r"));
      var k = e.target.value, p = tipo(k).prov;
      if (p && todos(".sol-r").length === 1) uno("#sol-prov").value = p;
    }
    revisarSolicitud();
  });
  document.addEventListener("input", function (e) {
    if (e.target.closest && e.target.closest(".sol")) revisarSolicitud();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrarSolicitud(); });

  /* «Meter o sacar»: al meter se puede elegir cualquier material del catálogo,
     no solo lo que ya hay en la bodega */
  function articulosParaMover() {
    var bod = uno("#mb-bod"), art = uno("#mb-art"), tipoMov = uno("#mb-tipo");
    if (!bod || !art) return;
    var elegido = art.value;
    art.innerHTML = "";
    var aqui = document.createElement("optgroup");
    aqui.label = "Lo que hay en " + bod.value;
    var codsAqui = [];
    todos("#dt-04-adentro tbody tr").forEach(function (f) {
      if (f.getAttribute("data-bodega") !== bod.value) return;
      var cod = (celda(f, "Código") || {}).textContent;
      codsAqui.push(cod);
      aqui.appendChild(new Option(cod + " · " + (celda(f, "Qué es") || {}).textContent + " · hay " +
                                  uno(".hay", f).textContent + " " + f.getAttribute("data-unidad"), cod));
    });
    if (codsAqui.length) art.appendChild(aqui);
    if (tipoMov && tipoMov.value === "Entrada" && TIPOS) {
      TIPOS.forEach(function (t) {
        var g = document.createElement("optgroup");
        g.label = t.t + " (del catálogo)";
        CATALOGO.forEach(function (m) {
          if (m[2] === t.k && codsAqui.indexOf(m[0]) < 0) g.appendChild(new Option(m[0] + " · " + m[1] + " · " + m[3], m[0]));
        });
        if (g.children.length) art.appendChild(g);
      });
    }
    if (elegido && art.querySelector('option[value="' + elegido + '"]')) art.value = elegido;
  }

  /* Si se mete un material que la bodega no tenía, se le abre su fila */
  function asegurarFila(cod, bod) {
    var f = todos("#dt-04-adentro tbody tr").filter(function (x) {
      return x.getAttribute("data-bodega") === bod && (celda(x, "Código") || {}).textContent === cod;
    })[0];
    if (f) return f;
    var m = material(cod), cuerpo = uno("#dt-04-adentro tbody");
    if (!m || !cuerpo) return null;
    var base = todos("tr", cuerpo).filter(function (x) { return x.getAttribute("data-bodega") === bod; })[0] || cuerpo.rows[0];
    f = base.cloneNode(true);
    f.setAttribute("data-bodega", bod);
    f.setAttribute("data-unidad", m[3]);
    ponerCelda(f, "Código", cod);
    ponerCelda(f, "Qué es", m[1]);
    uno(".hay", f).textContent = "0";
    var u = uno('[data-l="Hay"] .tiny', f); if (u) u.textContent = m[3];
    uno(".min", f).textContent = "—";
    uno(".donde", f).textContent = "Por ubicar";
    f.style.display = "";
    cuerpo.insertBefore(f, base.nextSibling);
    return f;
  }


  /* ---------------------------------------------------------------- Entradas y salidas por bodega (11)

     STOCK guarda cuánto hay de cada material EN CADA BODEGA. MOVS es el
     registro de todo lo que entra, sale o se traslada. Todas las pantallas
     que mueven material (Inicio, Bodegas, M. Prima) pasan por moverStock. */

  var NOMBRE_BOD = { "BOD-01": "Principal", "BOD-02": "Producto terminado",
                     "BOD-03": "Merma y reproceso", "BOD-04": "Insumos y químicos" };
  var STOCK = {
    "BOD-01": { "MP-01": 2400, "MP-02": 420, "MP-03": 260, "MP-05": 180 },
    "BOD-02": { "PT-REF-1042": 78, "PT-REF-1043": 44 },
    "BOD-03": { "ME-01": 38, "ME-02": 41, "ME-03": 12 },
    "BOD-04": { "MP-04": 34, "MP-06": 22, "MP-07": 5600, "MP-08": 240 }
  };
  /* El mínimo es de cada bodega: un material que llega a otra bodega no trae su mínimo */
  var MINIMOS = { "BOD-01": { "MP-01": 800, "MP-02": 150, "MP-03": 120, "MP-05": 200 },
                  "BOD-02": { "PT-REF-1042": 40, "PT-REF-1043": 30 },
                  "BOD-04": { "MP-04": 20, "MP-06": 15, "MP-07": 2000, "MP-08": 300 } };
  function minDe(b, c) { return (MINIMOS[b] || {})[c] || 0; }
  var EXTRA = { "ME-01": ["Cuero con manchas", "dm²"], "ME-02": ["Pares para reproceso", "par"], "ME-03": ["Suela defectuosa", "par"] };
  var MOVS = null, NUM_BG = 0, BG_SEL = "BOD-01";

  function infoMat(cod) {
    var m = material(cod);
    if (m) return { nombre: m[1], unidad: m[3] };
    if (EXTRA[cod]) return { nombre: EXTRA[cod][0], unidad: EXTRA[cod][1] };
    return { nombre: cod, unidad: "un" };
  }
  function bodegaDe(cod) {
    for (var b in STOCK) if (STOCK[b][cod] !== undefined) return b;
    return cod.indexOf("PT-") === 0 ? "BOD-02" : "BOD-01";
  }

  /* El registro arranca con el saldo inicial de cada bodega (2026-09-15) */
  function movsIniciales() {
    var l = [];
    Object.keys(STOCK).forEach(function (b) {
      Object.keys(STOCK[b]).forEach(function (cod) {
        NUM_BG += 1;
        l.push({ mv: "MB-" + String(NUM_BG).padStart(4, "0"), fecha: "2026-09-15", bod: b, tipo: "Entrada",
                 cod: cod, cant: STOCK[b][cod], queda: STOCK[b][cod], doc: "Saldo inicial", quien: "Sistema", obs: "" });
      });
    });
    return l.reverse();
  }
  function asegurarMovs() { if (!MOVS) MOVS = movsIniciales(); }

  /* Mueve material en una bodega y deja el registro. Devuelve lo que queda, o null si no alcanza (RN-INV-01). */
  function moverStock(bod, cod, delta, datos) {
    asegurarMovs();
    STOCK[bod] = STOCK[bod] || {};
    var hay = STOCK[bod][cod] || 0;
    if (hay + delta < 0) return null;
    STOCK[bod][cod] = hay + delta;
    if (SALDO[cod] !== undefined) {
      var total = 0;
      for (var b in STOCK) total += STOCK[b][cod] || 0;
      SALDO[cod] = total;
    }
    if (datos) {
      MOVS.unshift({ mv: datos.mv, fecha: HOY, bod: bod, tipo: datos.tipo, cod: cod, cant: delta,
                     queda: STOCK[bod][cod], doc: datos.doc || "", quien: datos.quien || "Jefe de bodega", obs: datos.obs || "" });
    }
    return STOCK[bod][cod];
  }
  function nuevoMB() { asegurarMovs(); NUM_BG += 1; return "MB-" + String(NUM_BG).padStart(4, "0"); }

  /* ---- La pantalla */

  var DOCS = {
    Entrada: ["Orden de compra (OC)", "Devolución de producción", "Lote de Calidad", "Devolución del cliente", "Ajuste por conteo"],
    Salida: ["Orden de producción (OP)", "Pedido de cliente", "Devolución al proveedor", "Baja por daño"],
    Traslado: ["Remisión interna"]
  };

  function tipoMov() { var r = uno('input[name="bg-tipo"]:checked'); return r ? r.value : "Entrada"; }

  function opcionesBodega(sel, valor, excepto) {
    sel.innerHTML = Object.keys(NOMBRE_BOD).filter(function (b) { return b !== excepto; }).map(function (b) {
      return '<option value="' + b + '"' + (b === valor ? " selected" : "") + ">" + b + " · " + NOMBRE_BOD[b] + "</option>";
    }).join("");
  }

  function opcionesMaterial() {
    var t = tipoMov(), bod = uno("#bg-bod").value, sel = uno("#bg-mat"), antes = sel.value;
    var aqui = Object.keys(STOCK[bod] || {});
    var h = '<optgroup label="Lo que hay en ' + bod + '">' + aqui.map(function (c) {
      var i = infoMat(c);
      return '<option value="' + c + '">' + c + " · " + i.nombre + " · hay " + miles(STOCK[bod][c]) + " " + i.unidad + "</option>";
    }).join("") + "</optgroup>";
    if (t === "Entrada") {
      TIPOS.forEach(function (tp) {
        var ms = CATALOGO.filter(function (m) { return m[2] === tp.k && aqui.indexOf(m[0]) < 0; });
        if (ms.length) h += '<optgroup label="' + tp.t + ' (del catálogo)">' + ms.map(function (m) {
          return '<option value="' + m[0] + '">' + m[0] + " · " + m[1] + " · " + m[3] + "</option>";
        }).join("") + "</optgroup>";
      });
    }
    sel.innerHTML = h;
    if (antes && sel.querySelector('option[value="' + antes + '"]')) sel.value = antes;
  }

  function prepararFormulario() {
    var t = tipoMov();
    uno("#bg-bod-l").textContent = t === "Traslado" ? "Bodega de donde sale" : t === "Salida" ? "Bodega de donde sale" : "Bodega que lo recibe";
    uno("#bg-dest-c").hidden = t !== "Traslado";
    opcionesBodega(uno("#bg-dest"), uno("#bg-dest").value, uno("#bg-bod").value);
    uno("#bg-doc").innerHTML = DOCS[t].map(function (d) { return "<option>" + d + "</option>"; }).join("");
    uno("#bg-quien-l").textContent = t === "Entrada" ? "Quién lo entrega" : "Quién lo recibe";
    opcionesMaterial();
    cuentaBodega();
  }

  function cuentaBodega() {
    var caja = uno("#bg-cuenta");
    if (!caja) return;
    var t = tipoMov(), bod = uno("#bg-bod").value, cod = uno("#bg-mat").value, q = numero(uno("#bg-cant").value);
    var i = infoMat(cod || ""), hay = (STOCK[bod] || {})[cod] || 0;
    uno("#bg-uni").textContent = i.unidad;
    var calc = uno("#bg-calc"), ok = true, txt;
    if (!cod) { txt = "Elija el material."; ok = false; }
    else if (!q) { txt = "En " + bod + " hay <b>" + miles(hay) + " " + i.unidad + "</b> de " + i.nombre + ". Escriba la cantidad."; ok = false; }
    else if (t === "Entrada") {
      txt = bod + ": " + miles(hay) + " + " + miles(q) + " = <b>" + miles(hay + q) + " " + i.unidad + "</b> de " + i.nombre;
    } else if (q > hay) {
      txt = "En " + bod + " solo hay <b>" + miles(hay) + " " + i.unidad + "</b>. No se puede sacar " + miles(q) + " (RN-INV-01).";
      ok = false;
    } else if (t === "Salida") {
      txt = bod + ": " + miles(hay) + " − " + miles(q) + " = <b>" + miles(hay - q) + " " + i.unidad + "</b> de " + i.nombre;
    } else {
      var dest = uno("#bg-dest").value, hayD = (STOCK[dest] || {})[cod] || 0;
      txt = bod + ": " + miles(hay) + " − " + miles(q) + " = <b>" + miles(hay - q) + "</b> · " +
            dest + ": " + miles(hayD) + " + " + miles(q) + " = <b>" + miles(hayD + q) + " " + i.unidad + "</b>";
    }
    caja.innerHTML = txt;
    calc.classList.toggle("calc--crit", !ok && q > 0);
    uno("#bg-guardar").disabled = !ok;
  }

  function registrarBodega() {
    var t = tipoMov(), bod = uno("#bg-bod").value, cod = uno("#bg-mat").value, cant = uno("#bg-cant");
    var q = numero(cant.value), i = infoMat(cod);
    if (!q || q < 1) { cant.focus(); return aviso("Escriba una cantidad mayor que cero.", "crit"); }
    var num = uno("#bg-num").value.trim();
    var doc = uno("#bg-doc").value + (num ? " · " + num : "");
    var datos = { tipo: t, doc: doc, quien: uno("#bg-quien").value, obs: uno("#bg-obs").value.trim() };
    datos.mv = nuevoMB();
    if (t === "Entrada") {
      var q1 = moverStock(bod, cod, q, datos);
      anotarKardex(cod, i.nombre, "Entrada", q, i.unidad, q1, doc, bod);
      aviso("Entraron " + miles(q) + " " + i.unidad + " de " + cod + " a " + bod + ". Ahora hay " + miles(q1) + ".", "ok");
    } else if (t === "Salida") {
      var q2 = moverStock(bod, cod, -q, datos);
      if (q2 === null) return aviso("En " + bod + " solo hay " + miles(STOCK[bod][cod] || 0) + " " + i.unidad + " de " + cod + ". No se puede sacar más.", "crit");
      anotarKardex(cod, i.nombre, "Salida", -q, i.unidad, q2, doc, bod);
      aviso("Salieron " + miles(q) + " " + i.unidad + " de " + cod + " de " + bod + ". Quedan " + miles(q2) + ".", "warn");
    } else {
      var dest = uno("#bg-dest").value;
      if (dest === bod) return aviso("La bodega que recibe tiene que ser otra.", "crit");
      var s = moverStock(bod, cod, -q, datos);
      if (s === null) return aviso("En " + bod + " solo hay " + miles(STOCK[bod][cod] || 0) + " " + i.unidad + ". No se puede trasladar más.", "crit");
      var e = moverStock(dest, cod, q, { mv: datos.mv, tipo: t, doc: doc + " · desde " + bod, quien: datos.quien, obs: datos.obs });
      MOVS[1].doc = doc + " · hacia " + dest;
      anotarKardex(cod, i.nombre, "Salida", -q, i.unidad, s, "Traslado a " + dest, bod);
      anotarKardex(cod, i.nombre, "Entrada", q, i.unidad, e, "Traslado desde " + bod, dest);
      aviso("Se trasladaron " + miles(q) + " " + i.unidad + " de " + cod + ": " + bod + " → " + dest + ".", "ok");
    }
    cant.value = ""; uno("#bg-num").value = ""; uno("#bg-obs").value = "";
    BG_SEL = bod;
    pintarBodegas();
  }

  function tarjetaBodega(b) {
    asegurarMovs();
    var cods = Object.keys(STOCK[b] || {});
    var bajos = cods.filter(function (c) { return minDe(b, c) && STOCK[b][c] < minDe(b, c); }).length;
    var mios = MOVS.filter(function (m) { return m.bod === b; });
    var ent = mios.filter(function (m) { return m.cant > 0 && m.doc !== "Saldo inicial"; }).length;
    var sal = mios.filter(function (m) { return m.cant < 0; }).length;
    var ult = mios[0];
    var pds = PEDIDOS.filter(function (p) { return p.bod === b && p.estado !== "Anulado"; }).length;
    var tono = bajos ? "crit" : "ok";
    return '<button type="button" class="bg-card bg-card--' + tono + (b === BG_SEL ? " is-on" : "") + '" data-bg-ver="' + b + '">' +
      '<span class="bg-card__img">' + dibujoBodega(b) +
      '<span class="pill pill--' + tono + '">' + (bajos ? bajos + " bajo el mínimo" : "Al día") + "</span></span>" +
      '<span class="bg-card__cuerpo">' +
      '<span class="bg-card__cod">' + b + "</span><span class=\"bg-card__n\">" + NOMBRE_BOD[b] + "</span>" +
      '<span class="bg-card__num"><span><b>' + cods.length + "</b> material" + (cods.length === 1 ? "" : "es") + "</span><span class=\"bg-card__e\"><b>" + ent +
      "</b> entrada" + (ent === 1 ? "" : "s") + "</span><span class=\"bg-card__s\"><b>" + sal + "</b> salida" + (sal === 1 ? "" : "s") + "</span><span class=\"bg-card__p\"><b>" + pds + "</b> pedido" + (pds === 1 ? "" : "s") + "</span></span>" +
      '<span class="tiny">Último: ' + (ult ? ult.tipo.toLowerCase() + " de " + ult.cod + " · " + ult.fecha : "sin movimientos") + "</span></span></button>";
  }

  /* Dibujo de cada bodega (mismo estilo que los de las máquinas) */
  var DIBUJO_BOD = {
    /* Principal: estantería con rollos de cuero y cajas */
    "BOD-01": '<rect class="c" x="6" y="80" width="108" height="5" rx="2.5"/>' +
      '<rect class="b" x="14" y="10" width="5" height="70"/><rect class="b" x="101" y="10" width="5" height="70"/>' +
      '<rect class="d" x="14" y="30" width="92" height="3"/><rect class="d" x="14" y="54" width="92" height="3"/><rect class="d" x="14" y="77" width="92" height="3"/>' +
      '<circle class="a" cx="30" cy="22" r="8"/><circle class="c" cx="30" cy="22" r="3"/><circle class="e" cx="48" cy="22" r="8"/><circle class="c" cx="48" cy="22" r="3"/>' +
      '<circle class="a" cx="66" cy="22" r="8"/><circle class="c" cx="66" cy="22" r="3"/><rect class="b" x="78" y="16" width="20" height="14" rx="1.5"/>' +
      '<rect class="a" x="22" y="40" width="22" height="14" rx="1.5"/><rect class="c" x="30" y="40" width="6" height="5"/>' +
      '<rect class="e" x="48" y="42" width="18" height="12" rx="1.5"/><rect class="a" x="70" y="38" width="26" height="16" rx="1.5"/><rect class="c" x="80" y="38" width="6" height="5"/>' +
      '<rect class="b" x="22" y="64" width="30" height="13" rx="1.5"/><rect class="a" x="56" y="61" width="20" height="16" rx="1.5"/><rect class="e" x="80" y="66" width="18" height="11" rx="1.5"/>',
    /* Producto terminado: cajas de zapatos apiladas y un zapato */
    "BOD-02": '<rect class="c" x="6" y="80" width="108" height="5" rx="2.5"/>' +
      '<rect class="a" x="12" y="62" width="40" height="18" rx="2"/><rect class="d" x="12" y="62" width="40" height="5" rx="2"/><rect class="c" x="26" y="70" width="12" height="5" rx="1"/>' +
      '<rect class="e" x="16" y="44" width="36" height="18" rx="2"/><rect class="d" x="16" y="44" width="36" height="5" rx="2"/><rect class="c" x="28" y="52" width="12" height="5" rx="1"/>' +
      '<rect class="a" x="20" y="26" width="30" height="18" rx="2"/><rect class="d" x="20" y="26" width="30" height="5" rx="2"/><rect class="c" x="29" y="34" width="12" height="5" rx="1"/>' +
      '<path class="d" d="M58 80v-6q0-4 4-6l10-4q4-8 10-14h10q2 8 0 14 10 2 16 6 4 3 4 10z"/>' +
      '<path class="e" d="M62 68l10-4q4-8 10-14h10q2 8 0 14 10 2 16 6-12 2-24 0-12-2-22-2z" opacity=".9"/>' +
      '<path class="l" d="M80 56l6 2M78 60l6 2" stroke="var(--papel)"/>',
    /* Merma y reproceso: caneca con retazos y flechas de reciclaje */
    "BOD-03": '<rect class="c" x="6" y="80" width="108" height="5" rx="2.5"/>' +
      '<path class="b" d="M22 38h50l-5 42H27z"/><rect class="d" x="18" y="32" width="58" height="7" rx="3"/>' +
      '<path class="l" d="M36 46v26M47 46v26M58 46v26" stroke="var(--papel)" opacity=".7"/>' +
      '<path class="a" d="M26 32l6-12 8 4-3 8z"/><path class="e" d="M40 32l4-16 10 2-2 14z"/><path class="a" d="M56 32l8-10 6 6-4 4z"/>' +
      '<path class="l" d="M84 34a14 14 0 0 1 22 6" stroke="var(--oliva-600,#5a6b2e)" stroke-width="3"/><path d="M104 32l3 9-9-1z" fill="var(--oliva-600,#5a6b2e)"/>' +
      '<path class="l" d="M106 52a14 14 0 0 1-22 6" stroke="var(--oliva-600,#5a6b2e)" stroke-width="3"/><path d="M86 62l-3-9 9 1z" fill="var(--oliva-600,#5a6b2e)"/>',
    /* Insumos y químicos: canecas, galones y frascos */
    "BOD-04": '<rect class="c" x="6" y="80" width="108" height="5" rx="2.5"/>' +
      '<rect class="a" x="12" y="36" width="30" height="44" rx="4"/><rect class="d" x="12" y="44" width="30" height="3"/><rect class="d" x="12" y="68" width="30" height="3"/><rect class="d" x="18" y="32" width="18" height="5" rx="2"/>' +
      '<path class="e" d="M48 50h24v30H48z"/><path class="e" d="M52 44h12l8 6H48z"/><rect class="d" x="54" y="40" width="7" height="5" rx="1"/><rect class="c" x="52" y="58" width="16" height="10" rx="1"/>' +
      '<path class="b" d="M80 58h14v22H80z"/><rect class="d" x="83" y="52" width="8" height="6" rx="1"/><rect class="c" x="82" y="64" width="10" height="7" rx="1"/>' +
      '<path class="a" d="M98 62h12v18H98z"/><rect class="d" x="101" y="57" width="6" height="5" rx="1"/>' +
      '<circle class="c" cx="104" cy="70" r="3"/>'
  };
  function dibujoBodega(b) {
    return '<svg class="eq" viewBox="0 0 120 88" aria-hidden="true">' + (DIBUJO_BOD[b] || DIBUJO_BOD["BOD-01"]) + "</svg>";
  }

  function pintarBodegas() {
    var tarjetas = uno("#bg-tarjetas");
    if (!tarjetas) return;
    asegurarMovs();
    tarjetas.innerHTML = Object.keys(NOMBRE_BOD).map(tarjetaBodega).join("");

    /* lo que hay en la bodega elegida */
    uno("#bg-hay-t").textContent = "Lo que hay en " + BG_SEL + " · " + NOMBRE_BOD[BG_SEL];
    uno("#bg-hay").innerHTML = Object.keys(STOCK[BG_SEL] || {}).map(function (c) {
      var i = infoMat(c), hay = STOCK[BG_SEL][c], mn = minDe(BG_SEL, c);
      var est = mn ? estadoDe(hay, mn) : { tono: "off", texto: "Sin mínimo" };
      var ent = 0, sal = 0;
      MOVS.forEach(function (m) { if (m.bod === BG_SEL && m.cod === c && m.doc !== "Saldo inicial") { if (m.cant > 0) ent += m.cant; else sal -= m.cant; } });
      return '<tr><td data-l="Material"><b>' + c + '</b><div class="tiny">' + i.nombre + "</div></td>" +
        '<td class="num" data-l="Hay"><b>' + miles(hay) + '</b> <span class="tiny">' + i.unidad + "</span></td>" +
        '<td class="num muted" data-l="Mínimo">' + (mn ? miles(mn) : "—") + "</td>" +
        '<td data-l="Estado"><span class="pill pill--' + est.tono + '">' + est.texto + "</span></td>" +
        '<td class="num" data-l="Entró"><span class="mov mov--mas">' + (ent ? "+" + miles(ent) : "—") + "</span></td>" +
        '<td class="num" data-l="Salió"><span class="mov mov--menos">' + (sal ? "−" + miles(sal) : "—") + "</span></td></tr>";
    }).join("");

    /* el registro */
    var CH = { Entrada: "oliva", Salida: "cobre", Traslado: "vino" };
    uno("#bg-filas").innerHTML = MOVS.map(function (m) {
      var i = infoMat(m.cod);
      return "<tr><td data-l=\"Mov.\"><b class=\"nw\">" + m.mv + '</b><div class="tiny">' + m.fecha + "</div></td>" +
        '<td data-l="Bodega"><b class="nw">' + m.bod + '</b><div class="tiny">' + NOMBRE_BOD[m.bod] + "</div></td>" +
        '<td data-l="Tipo"><span class="chip chip--' + CH[m.tipo] + '">' + (m.tipo === "Traslado" ? (m.cant < 0 ? "Traslado · sale" : "Traslado · entra") : m.tipo) + "</span></td>" +
        '<td data-l="Material"><b>' + m.cod + '</b><div class="tiny">' + i.nombre + "</div></td>" +
        '<td class="num" data-l="Cantidad"><span class="mov mov--' + (m.cant < 0 ? "menos" : "mas") + '">' + (m.cant > 0 ? "+" : "−") +
          miles(Math.abs(m.cant)) + '</span><div class="tiny">' + i.unidad + "</div></td>" +
        '<td class="num" data-l="Queda"><b>' + miles(m.queda) + "</b></td>" +
        '<td data-l="Documento">' + esc(m.doc) + (m.obs ? '<div class="tiny">' + esc(m.obs) + "</div>" : "") + "</td>" +
        '<td class="muted" data-l="Quién">' + esc(m.quien) + "</td></tr>";
    }).join("");
    var c = { Entrada: 0, Salida: 0, Traslado: 0 };
    MOVS.forEach(function (m) { if (m.doc !== "Saldo inicial") c[m.tipo]++; });
    uno("#bg-res").innerHTML = '<span class="dt__res-t">Totales<em>de los ' + MOVS.length + " registro(s)</em></span>" +
      '<span class="dt__res-i dt__res-i--ok"><b>Entradas</b><span>' + c.Entrada + "</span></span>" +
      '<span class="dt__res-i dt__res-i--warn"><b>Salidas</b><span>' + c.Salida + "</span></span>" +
      '<span class="dt__res-i"><b>Traslados</b><span>' + (c.Traslado / 2) + "</span></span>";
    var dt = uno("#dt-04-registro-bodegas");
    if (uno('input[type="search"]', dt).value || todos("select", uno(".dt__filtros", dt)).some(function (s) { return s.selectedIndex > 0; })) filtrar(dt);
    else dtPintar(dt);

    if (uno("#bg-bod").value !== BG_SEL && !uno("#bg-bod").dataset.tocado) uno("#bg-bod").value = BG_SEL;
    opcionesMaterial();
    cuentaBodega();
  }

  function iniciarBodegas() {
    if (!uno("#bg-tarjetas")) return;
    asegurarMovs();
    if (!uno("#bg-bod").options.length) { opcionesBodega(uno("#bg-bod"), BG_SEL); opcionesBodega(uno("#bg-dest"), "BOD-02", BG_SEL); }
    prepararFormulario();
    pintarBodegas();
    pintarPedidos();
    if (IR_A_PEDIDOS) {
      IR_A_PEDIDOS = false;
      setTimeout(function () { var x = uno("#p-pedidos"); if (x) x.scrollIntoView({ behavior: "smooth", block: "start" }); }, 150);
    }
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    var v = t.closest("[data-bg-ver]");
    if (v) {
      e.preventDefault();
      BG_SEL = v.getAttribute("data-bg-ver");
      uno("#bg-bod").value = BG_SEL;
      var f = uno("#bg-f-bod"); f.value = BG_SEL; filtrar(uno("#dt-04-registro-bodegas"));
      var fp = uno("#pd-f-bod"); if (fp) { fp.value = BG_SEL; filtrar(uno("#dt-04-pedidos")); }
      prepararFormulario();
      pintarBodegas();
      return aviso("Mostrando solo " + BG_SEL + " · " + NOMBRE_BOD[BG_SEL] + ". Para ver todas, elija «Todas las bodegas» en el filtro.", "ok");
    }
    if (t.closest("#bg-guardar")) { e.preventDefault(); return registrarBodega(); }
  });
  document.addEventListener("change", function (e) {
    var id = e.target.id;
    if (e.target.name === "bg-tipo" || id === "bg-bod") {
      if (id === "bg-bod") { BG_SEL = e.target.value; pintarBodegas(); }
      return prepararFormulario();
    }
    if (id === "bg-mat" || id === "bg-dest") cuentaBodega();
  });
  document.addEventListener("input", function (e) { if (e.target.id === "bg-cant") cuentaBodega(); });



  /* ---------------------------------------------------------------- Almacenamiento y movimientos (Inicio)

     Los anillos dicen cuánto está ocupada cada bodega (lo que hay frente a lo
     que cabe, más lo pedido que viene en camino). Las barras, lo que entró y
     salió cada mes. Se filtra por bodega y por entradas o salidas. */

  var ALM = { bod: "", ver: "ambos" };
  var MESES = [["2026-04", "Abr", "Abril"], ["2026-05", "May", "Mayo"], ["2026-06", "Jun", "Junio"],
               ["2026-07", "Jul", "Julio"], ["2026-08", "Ago", "Agosto"], ["2026-09", "Sep", "Septiembre"]];
  /* Lo que entró y salió cada mes, en unidades, por bodega (histórico del mockup) */
  var HISTORIA = {
    "BOD-01": { e: [1890, 2160, 1845, 2295, 2430, 1755], s: [1755, 2025, 1935, 2160, 2340, 1620] },
    "BOD-02": { e: [420, 480, 410, 510, 540, 390],       s: [390, 450, 430, 480, 520, 360] },
    "BOD-03": { e: [210, 240, 205, 255, 270, 195],       s: [195, 225, 215, 240, 260, 180] },
    "BOD-04": { e: [1680, 1920, 1640, 2040, 2160, 1560], s: [1560, 1800, 1720, 1920, 2080, 1440] }
  };

  function ocupacion(b, c) {
    var cap = capDe(b, c) || 1;
    return { hay: Math.min(100, hayEnBodega(b, c) * 100 / cap), ped: pedidoDe(b, c) * 100 / cap };
  }
  function ocupacionBodega(b) {
    var cods = Object.keys(STOCK[b] || {});
    if (!cods.length) return { hay: 0, ped: 0, n: 0 };
    var h = 0, p = 0;
    cods.forEach(function (c) { var o = ocupacion(b, c); h += o.hay; p += o.ped; });
    return { hay: h / cods.length, ped: p / cods.length, n: cods.length };
  }

  function tipBodega(b) {
    var o = ocupacionBodega(b), cods = Object.keys(STOCK[b] || {});
    var bajos = cods.filter(function (c) { return minDe(b, c) && STOCK[b][c] < minDe(b, c); }).length;
    var peds = PEDIDOS.filter(function (x) { return x.bod === b && x.estado !== "Anulado"; }).length;
    return "<b>" + b + " · " + NOMBRE_BOD[b] + "</b>" + Math.round(o.hay) + " % ocupado · " + cods.length + " materiales<br>" +
      (bajos ? bajos + " bajo el mínimo" : "Nada bajo el mínimo") + " · " + peds + " pedido" + (peds === 1 ? "" : "s") + " en camino";
  }
  function anillo(pct, ped, titulo, sub, datoBod, grande, tip) {
    var h = Math.round(pct), p = Math.min(100 - h, Math.round(ped));
    var tono = h >= 90 ? "var(--crit)" : h >= 70 ? "var(--warn)" : "var(--ok)";
    return '<button type="button" class="ring' + (grande ? " ring--gral" : "") + '"' + (datoBod ? ' data-alm-bod="' + datoBod + '"' : "") +
      ' data-tip="' + esc(tip || "<b>" + titulo + "</b>" + h + " % ocupado") + '">' +
      '<span class="ring__c" style="--h:' + h + ";--p:" + p + ";--tono:" + tono + '"><b>' + h + " %</b></span>" +
      '<span class="ring__t">' + titulo + '</span><span class="ring__s">' + sub + "</span></button>";
  }

  /* Lo de este mes que se registró en el prototipo también cuenta */
  function movsDelMes(b, tipo) {
    if (!MOVS) return 0;
    return MOVS.reduce(function (a, m) {
      if (m.doc === "Saldo inicial" || m.fecha.slice(0, 7) !== "2026-09" || (b && m.bod !== b)) return a;
      if (tipo === "e" && m.cant > 0) return a + m.cant;
      if (tipo === "s" && m.cant < 0) return a - m.cant;
      return a;
    }, 0);
  }
  function serie(b, tipo) {
    var bods = b ? [b] : Object.keys(HISTORIA);
    return MESES.map(function (m, i) {
      var v = bods.reduce(function (a, x) { return a + HISTORIA[x][tipo][i]; }, 0);
      return i === MESES.length - 1 ? v + movsDelMes(b, tipo) : v;
    });
  }
  function techo(v) {
    var paso = Math.pow(10, Math.floor(Math.log10(Math.max(v, 10))));
    var n = Math.ceil(v / paso) * paso;
    if (n / paso > 5 && n % (paso * 2)) n += paso;
    return n || 10;
  }

  function pintarAlmacen() {
    ocultarTip();
    var caja = uno("#alm");
    if (!caja || typeof STOCK === "undefined") return;
    asegurarMovs();
    todos("[data-alm-bod]", uno(".alm__h", caja)).forEach(function (x) { x.classList.toggle("is-on", x.getAttribute("data-alm-bod") === ALM.bod); });
    todos("[data-alm-ver]", caja).forEach(function (x) { x.classList.toggle("is-on", x.getAttribute("data-alm-ver") === ALM.ver); });

    /* anillos */
    var rings;
    if (!ALM.bod) {
      var todas = Object.keys(NOMBRE_BOD), sh = 0, sp = 0, sn = 0;
      todas.forEach(function (b) { var o = ocupacionBodega(b); sh += o.hay * o.n; sp += o.ped * o.n; sn += o.n; });
      var bajosT = 0, pedsT = PEDIDOS.filter(function (x) { return x.estado !== "Anulado"; }).length;
      todas.forEach(function (b) { Object.keys(STOCK[b] || {}).forEach(function (c) { if (minDe(b, c) && STOCK[b][c] < minDe(b, c)) bajosT++; }); });
      rings = anillo(sh / sn, sp / sn, "General", sn + " materiales", "", true,
                     "<b>Todo el almacén</b>" + Math.round(sh / sn) + " % ocupado · " + sn + " materiales en 4 bodegas<br>" +
                     bajosT + " bajo el mínimo · " + pedsT + " pedidos en camino") +
        todas.map(function (b) {
          var o = ocupacionBodega(b);
          return anillo(o.hay, o.ped, b, NOMBRE_BOD[b], b, false, tipBodega(b) + "<br><i>Pulse para verla sola</i>");
        }).join("");
      uno("#alm-anillos-t").textContent = "Cuánto está ocupada cada bodega · pulse una para verla sola";
    } else {
      var o = ocupacionBodega(ALM.bod);
      rings = anillo(o.hay, o.ped, ALM.bod, NOMBRE_BOD[ALM.bod] + " · volver a todas", "*", true,
                     tipBodega(ALM.bod) + "<br><i>Pulse para volver a todas</i>") +
        Object.keys(STOCK[ALM.bod] || {}).map(function (c) {
          var x = ocupacion(ALM.bod, c), i = infoMat(c), mn = minDe(ALM.bod, c), pd = pedidoDe(ALM.bod, c);
          var hay = hayEnBodega(ALM.bod, c), est = mn ? estadoDe(hay, mn).texto : "Sin mínimo";
          return anillo(x.hay, x.ped, c, i.nombre + " · " + miles(hay) + " de " + miles(capDe(ALM.bod, c)) + " " + i.unidad, "", false,
                        "<b>" + c + " · " + i.nombre + "</b>Hay " + miles(hay) + " de " + miles(capDe(ALM.bod, c)) + " " + i.unidad +
                        "<br>" + est + (mn ? " (mínimo " + miles(mn) + ")" : "") + (pd ? " · pedido " + miles(pd) : ""));
        }).join("");
      uno("#alm-anillos-t").textContent = "Cuánto ocupa cada material en " + ALM.bod + " · " + NOMBRE_BOD[ALM.bod];
    }
    uno("#alm-rings").innerHTML = rings;

    /* barras por mes */
    var ent = serie(ALM.bod, "e"), sal = serie(ALM.bod, "s");
    var verE = ALM.ver !== "salidas", verS = ALM.ver !== "entradas";
    var max = techo(Math.max.apply(null, (verE ? ent : []).concat(verS ? sal : [])));
    var marcas = [1, .75, .5, .25, 0].map(function (f) { return '<span style="bottom:' + f * 100 + '%"><em>' + miles(Math.round(max * f)) + "</em></span>"; }).join("");
    var cols = MESES.map(function (m, i) {
      function barra(v, k, nombre) {
        return '<span class="barra barra--' + k + '" style="height:' + (v * 100 / max).toFixed(1) + '%">' +
          '<em>' + miles(v) + "</em></span>";
      }
      var bal = ent[i] - sal[i];
      var tip = "<b>" + m[2] + " · " + (ALM.bod || "todas las bodegas") + "</b>" +
        (verE ? "Entraron " + miles(ent[i]) : "") + (verE && verS ? " · " : "") + (verS ? "Salieron " + miles(sal[i]) : "") +
        (verE && verS ? "<br>Balance " + (bal >= 0 ? "+" : "−") + miles(Math.abs(bal)) : "") +
        (i === MESES.length - 1 ? "<br><i>Va hasta hoy</i>" : "");
      return '<div class="alm__mes' + (i === MESES.length - 1 ? " alm__mes--hoy" : "") + '" data-tip="' + esc(tip) + '"><div class="alm__par">' +
        (verE ? barra(ent[i], "e", "entraron") : "") + (verS ? barra(sal[i], "s", "salieron") : "") +
        '</div><span class="alm__x">' + m[1] + (i === MESES.length - 1 ? " · va" : "") + "</span></div>";
    }).join("");
    uno("#alm-barras").innerHTML = '<div class="alm__ejes">' + marcas + "</div>" + '<div class="alm__cols">' + cols + "</div>";

    var te = ent.reduce(function (a, b) { return a + b; }, 0), ts = sal.reduce(function (a, b) { return a + b; }, 0);
    uno("#alm-resumen").innerHTML =
      (verE ? '<span class="alm__dato alm__dato--e"><i></i><b>' + miles(te) + "</b> entraron</span>" : "") +
      (verS ? '<span class="alm__dato alm__dato--s"><i></i><b>' + miles(ts) + "</b> salieron</span>" : "") +
      (verE && verS ? '<span class="alm__dato"><b>' + (te - ts >= 0 ? "+" : "−") + miles(Math.abs(te - ts)) + "</b> quedaron</span>" : "") +
      '<span class="alm__dato alm__dato--nota">unidades · abril a septiembre · ' + (ALM.bod ? ALM.bod : "las cuatro bodegas") + "</span>";

    uno("#alm-tabla").innerHTML = "<thead><tr><th>Mes</th>" + (verE ? '<th class="num">Entraron</th>' : "") + (verS ? '<th class="num">Salieron</th>' : "") +
      (verE && verS ? '<th class="num">Balance</th>' : "") + "</tr></thead><tbody>" + MESES.map(function (m, i) {
        return '<tr><td data-l="Mes">' + m[2] + "</td>" + (verE ? '<td class="num" data-l="Entraron">' + miles(ent[i]) + "</td>" : "") +
          (verS ? '<td class="num" data-l="Salieron">' + miles(sal[i]) + "</td>" : "") +
          (verE && verS ? '<td class="num" data-l="Balance">' + (ent[i] - sal[i] >= 0 ? "+" : "−") + miles(Math.abs(ent[i] - sal[i])) + "</td>" : "") + "</tr>";
      }).join("") + "</tbody>";
    pintarResumenInicio();
  }

  /* El resumen corto al pasar el cursor por un anillo o un mes */
  var TIP;
  function mostrarTip(el, x, y) {
    if (!TIP) { TIP = document.createElement("div"); TIP.className = "alm-tip"; TIP.setAttribute("role", "tooltip"); document.body.appendChild(TIP); }
    TIP.innerHTML = el.getAttribute("data-tip");
    TIP.classList.add("is-on");
    var w = TIP.offsetWidth, h = TIP.offsetHeight;
    var left = Math.min(Math.max(8, x - w / 2), window.innerWidth - w - 8);
    var top = y - h - 14 < 8 ? y + 18 : y - h - 14;
    TIP.style.left = left + "px"; TIP.style.top = top + "px";
  }
  function ocultarTip() { if (TIP) TIP.classList.remove("is-on"); }
  document.addEventListener("mousemove", function (e) {
    var el = e.target.closest ? e.target.closest("#alm [data-tip]") : null;
    if (el) mostrarTip(el, e.clientX, e.clientY); else ocultarTip();
  });
  document.addEventListener("focusin", function (e) {
    var el = e.target.closest ? e.target.closest("#alm [data-tip]") : null;
    if (!el) return ocultarTip();
    var r = el.getBoundingClientRect();
    mostrarTip(el, r.left + r.width / 2, r.top);
  });
  document.addEventListener("scroll", ocultarTip, true);

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t || !t.closest("#alm")) return;
    var b = t.closest("[data-alm-bod]"), v = t.closest("[data-alm-ver]");
    if (b) { e.preventDefault(); ALM.bod = b.getAttribute("data-alm-bod").replace("*", ""); return pintarAlmacen(); }
    if (v) { e.preventDefault(); ALM.ver = v.getAttribute("data-alm-ver"); return pintarAlmacen(); }
  });


  /* ---------------------------------------------------------------- Inicio: lo corto

     Inicio solo resume: lo que hay que pedir, las alertas y los últimos
     movimientos. El detalle vive en su pantalla (Bodegas, M. Prima, Maquinaria). */

  var MAQ_ALERTA = [["MQ-03", "Prensa de montaje", "averiada", "Se dañó: pistón derecho · necesita arreglo"],
                    ["MQ-04", "Horno reactivador", "mantenimiento", "En mantenimiento preventivo"]];

  function porPedir() {
    var l = [];
    Object.keys(STOCK).forEach(function (b) {
      Object.keys(STOCK[b]).forEach(function (c) {
        var mn = minDe(b, c), hay = STOCK[b][c];
        if (mn && hay < mn * 1.6) l.push({ b: b, c: c, hay: hay, mn: mn, ped: pedidoDe(b, c), est: estadoDe(hay, mn) });
      });
    });
    return l.sort(function (x, y) { return x.hay / x.mn - y.hay / y.mn; });
  }

  function pintarResumenInicio() {
    var ul = uno("#ini-pedir");
    if (!ul) return;
    asegurarMovs();
    var lista = porPedir();
    ul.innerHTML = lista.length ? lista.map(function (x) {
      var i = infoMat(x.c), pct = Math.min(100, Math.round(x.hay * 50 / x.mn));
      return '<article class="pp pp--' + x.est.tono + '">' +
        '<header class="pp__h"><span class="pp__cod">' + x.c + '</span><span class="pill pill--' + x.est.tono + '">' + x.est.texto + "</span></header>" +
        '<b class="pp__n">' + esc(i.nombre) + '</b><span class="pp__b">' + x.b + " · " + NOMBRE_BOD[x.b] + "</span>" +
        '<span class="ini-bar ini-bar--' + x.est.tono + '"><i style="width:' + pct + '%"></i><em style="left:50%"></em></span>' +
        '<span class="pp__num"><span>Hay <b>' + miles(x.hay) + " " + i.unidad + "</b></span><span>Mínimo <b>" + miles(x.mn) + "</b></span>" +
          (x.ped ? '<span class="ini-ped">En camino <b>' + miles(x.ped) + "</b></span>" : "") + "</span>" +
        '<button type="button" class="btn btn--sm' + (x.ped ? " btn--ghost" : "") + '" data-pedir-cod="' + x.c + '" data-bod="' + x.b + '">' +
          (x.ped ? "Pedir más" : "Pedir") + "</button></article>";
    }).join("") : '<p class="empty">Todo está por encima del mínimo.</p>';

    /* alertas */
    var al = [];
    lista.filter(function (x) { return x.est.tono === "crit"; }).forEach(function (x) {
      al.push(["crit", "Bajo el mínimo · " + infoMat(x.c).nombre, miles(x.hay) + " de " + miles(x.mn) + " en " + x.b + (x.ped ? " · ya pedido" : " · sin pedir"), "11-bodegas.html"]);
    });
    var maqs = MAQ ? MAQ.filter(function (m) { return m.estado === "averiada" || m.estado === "mantenimiento" || faltan(m) < 0; })
                        .map(function (m) {
                          return [m.cod, m.nombre, m.estado, m.estado === "averiada" ? "Se dañó: " + (m.dano || "sin detalle") + " · necesita " + (m.necesita || "revisión").toLowerCase() : faltan(m) < 0 ? "Mantenimiento vencido" : "En mantenimiento"];
                        })
                   : MAQ_ALERTA;
    maqs.forEach(function (m) {
      al.push([m[2] === "averiada" ? "crit" : "warn", (m[2] === "averiada" ? "Avería · " : "Máquina · ") + m[1], m[0] + " · " + m[3], "06-maquinaria.html"]);
    });
    var urg = PEDIDOS.filter(function (p) { return p.estado !== "Anulado" && p.urg === "Urgente"; }).length;
    if (urg) al.push(["warn", "Pedidos urgentes", urg + " pedido(s) urgente(s) esperando a Compras", "11-bodegas.html"]);
    uno("#ini-alertas").innerHTML = al.length ? al.map(function (a) {
      return '<li><a class="ini-al ini-al--' + a[0] + '" href="' + a[3] + '"><span class="ini-al__p"></span><span><b>' + esc(a[1]) +
        '</b><span class="tiny">' + esc(a[2]) + "</span></span></a></li>";
    }).join("") : '<li class="empty">Sin alertas.</li>';

    /* últimos movimientos */
    var ms = MOVS.filter(function (m) { return m.doc !== "Saldo inicial"; });
    if (!ms.length) ms = MOVS;
    var CH = { Entrada: "oliva", Salida: "cobre", Traslado: "vino" };
    uno("#ini-movs").innerHTML = ms.slice(0, 4).map(function (m) {
      var i = infoMat(m.cod), sale = m.cant < 0;
      return '<li class="ini-mv"><span class="ini-mv__ic ini-mv__ic--' + (sale ? "s" : "e") + '" title="' + m.tipo + '">' + (sale ? "↑" : "↓") + "</span>" +
        '<span class="ini-mv__q"><b>' + esc(i.nombre) + '</b><span class="tiny">' + m.cod + " · " + m.bod + " · " + esc(m.doc) + "</span></span>" +
        '<span class="ini-mv__c"><span class="mov mov--' + (sale ? "menos" : "mas") + '">' + (sale ? "−" : "+") + miles(Math.abs(m.cant)) + " " + i.unidad +
        '</span><span class="tiny">' + m.fecha + "</span></span></li>";
    }).join("");
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-pedir-cod]") : null;
    if (!b) return;
    e.preventDefault();
    var c = b.getAttribute("data-pedir-cod"), bod = b.getAttribute("data-bod"), m = material(c);
    abrirSolicitud(bod, [{ tipo: m ? m[2] : "otro", cod: m ? c : "otro", cant: sugerido(bod, c) || "" }], c + " para " + bod);
  });

  /* ---------------------------------------------------------------- Selector de material (bonito y con buscador)

     La lista nativa del navegador con grupos se ve fea y no deja buscar.
     Este selector se pone encima del <select> (que sigue ahí, escondido, y es
     el que guarda el valor): muestra cada material con su código, su nombre y
     cuánto hay, deja buscar escribiendo y filtrar por tipo. */

  var PICK_ABIERTO = null;

  function partesOpcion(o) {
    var t = o.textContent.split(" · ");
    if (t.length === 1 || !/^[A-Z]{2,}-[\w-]+$/.test(t[0])) return { cod: "", nombre: o.textContent, meta: "", hay: false };
    var meta = t.length > 2 ? t.slice(2).join(" · ") : "";
    return { cod: t[0], nombre: t[1] || "", meta: meta, hay: /^hay /.test(meta) };
  }

  function etiquetaPick(sel) {
    var o = sel.options[sel.selectedIndex];
    if (!o) return '<span class="pick__vacio">Elija un material</span>';
    var p = partesOpcion(o);
    return (p.cod ? '<span class="pick__cod">' + esc(p.cod) + "</span>" : "") + '<span class="pick__nom">' + esc(p.nombre) + "</span>" +
      (p.meta ? '<span class="pick__meta' + (p.hay ? " pick__meta--hay" : "") + '">' + esc(p.meta) + "</span>" : "");
  }

  function mejorarSelect(sel) {
    if (!sel) return;
    var viejo = sel.parentNode.querySelector(":scope > .pick");
    if (viejo) viejo.remove();
    sel.classList.add("pick-oculto");
    var chev = sel.parentNode.querySelector(":scope > .chev");
    if (chev) chev.style.display = "none";
    var caja = document.createElement("div");
    caja.className = "pick";
    caja.innerHTML = '<button type="button" class="pick__btn" aria-haspopup="listbox" aria-expanded="false">' +
      '<span class="pick__val">' + etiquetaPick(sel) + '</span><span class="pick__chev" aria-hidden="true">▾</span></button>';
    sel.parentNode.insertBefore(caja, sel.nextSibling);
    caja._sel = sel;
    if (!sel._obs && window.MutationObserver) {
      sel._obs = new MutationObserver(function () { refrescarPick(sel); });
      sel._obs.observe(sel, { childList: true, subtree: true });
    }
  }
  function refrescarPick(sel) {
    var caja = sel.parentNode && sel.parentNode.querySelector(":scope > .pick");
    if (caja) uno(".pick__val", caja).innerHTML = etiquetaPick(sel);
  }

  function abrirPick(caja) {
    cerrarPick();
    var sel = caja._sel || caja.parentNode.querySelector("select");
    var grupos = [];
    Array.prototype.forEach.call(sel.children, function (h) {
      if (h.tagName === "OPTGROUP") grupos.push({ t: h.label, ops: Array.prototype.slice.call(h.children) });
      else { if (!grupos.length || grupos[grupos.length - 1].t) grupos.push({ t: "", ops: [] }); grupos[grupos.length - 1].ops.push(h); }
    });
    var chips = grupos.map(function (g, i) {
      return g.t ? '<button type="button" class="pick__chip" data-g="' + i + '">' + esc(g.t.replace(" (del catálogo)", "")) + "</button>" : "";
    }).join("");
    if (grupos.filter(function (g) { return g.t; }).length < 2) chips = "";
    var pop = document.createElement("div");
    pop.className = "pick__pop";
    pop.setAttribute("role", "listbox");
    pop.innerHTML = '<div class="pick__busca"><input type="search" placeholder="Buscar por código o nombre…" aria-label="Buscar material"></div>' +
      (chips ? '<div class="pick__chips"><button type="button" class="pick__chip is-on" data-g="todos">Todos</button>' + chips + "</div>" : "") +
      '<div class="pick__lista">' + grupos.map(function (g, i) {
        return '<div class="pick__grupo" data-g="' + i + '">' + (g.t ? '<div class="pick__gt">' + esc(g.t.replace(" (del catálogo)", "")) +
          (/^Lo que hay/.test(g.t) ? "" : ' <span>del catálogo</span>') + "</div>" : "") +
          g.ops.map(function (o) {
            var p = partesOpcion(o);
            return '<button type="button" class="pick__op' + (o.value === sel.value ? " is-on" : "") + '" data-v="' + esc(o.value) + '" role="option">' +
              (p.cod ? '<span class="pick__cod">' + esc(p.cod) + "</span>" : "") + '<span class="pick__nom">' + esc(p.nombre) + "</span>" +
              (p.meta ? '<span class="pick__meta' + (p.hay ? " pick__meta--hay" : "") + '">' + esc(p.meta) + "</span>" : "") + "</button>";
          }).join("") + "</div>";
      }).join("") + '<p class="pick__nada" hidden>Ningún material coincide.</p></div>';
    document.body.appendChild(pop);
    pop._caja = caja;
    PICK_ABIERTO = pop;
    uno(".pick__btn", caja).setAttribute("aria-expanded", "true");
    ubicarPick();
    var on = uno(".pick__op.is-on", pop);
    if (on) on.scrollIntoView({ block: "nearest" });
    setTimeout(function () { uno("input", pop).focus(); }, 20);
  }
  function ubicarPick() {
    if (!PICK_ABIERTO) return;
    var r = uno(".pick__btn", PICK_ABIERTO._caja).getBoundingClientRect();
    var ancho = Math.max(r.width, 320), alto = Math.min(380, window.innerHeight - 24);
    var arriba = r.bottom + 6 + alto > window.innerHeight && r.top > window.innerHeight - r.bottom;
    PICK_ABIERTO.style.width = Math.min(ancho, window.innerWidth - 24) + "px";
    PICK_ABIERTO.style.left = Math.max(12, Math.min(r.left, window.innerWidth - ancho - 12)) + "px";
    PICK_ABIERTO.style.maxHeight = (arriba ? r.top - 12 : window.innerHeight - r.bottom - 18) + "px";
    PICK_ABIERTO.style.top = arriba ? "" : r.bottom + 6 + "px";
    PICK_ABIERTO.style.bottom = arriba ? window.innerHeight - r.top + 6 + "px" : "";
  }
  function cerrarPick() {
    if (!PICK_ABIERTO) return;
    var b = uno(".pick__btn", PICK_ABIERTO._caja);
    if (b) b.setAttribute("aria-expanded", "false");
    PICK_ABIERTO.remove();
    PICK_ABIERTO = null;
  }
  function elegirPick(op) {
    var caja = PICK_ABIERTO._caja, sel = caja._sel || caja.parentNode.querySelector("select");
    sel.value = op.getAttribute("data-v");
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    refrescarPick(sel);
    cerrarPick();
    uno(".pick__btn", caja).focus();
  }
  function filtrarPick() {
    var pop = PICK_ABIERTO, q = uno("input", pop).value.trim().toLowerCase();
    var chip = uno(".pick__chip.is-on", pop), g = chip ? chip.getAttribute("data-g") : "todos";
    var vistos = 0;
    todos(".pick__grupo", pop).forEach(function (gr) {
      var n = 0;
      var enGrupo = g === "todos" || gr.getAttribute("data-g") === g;
      todos(".pick__op", gr).forEach(function (o) {
        var ver = enGrupo && (!q || o.textContent.toLowerCase().indexOf(q) >= 0);
        o.hidden = !ver; if (ver) n++;
      });
      gr.hidden = !n; vistos += n;
    });
    uno(".pick__nada", pop).hidden = !!vistos;
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t.closest) return;
    var btn = t.closest(".pick__btn");
    if (btn) { e.preventDefault(); var c = btn.closest(".pick"); return PICK_ABIERTO && PICK_ABIERTO._caja === c ? cerrarPick() : abrirPick(c); }
    if (!PICK_ABIERTO) return;
    var op = t.closest(".pick__op");
    if (op && PICK_ABIERTO.contains(op)) { e.preventDefault(); return elegirPick(op); }
    var chip = t.closest(".pick__chip");
    if (chip && PICK_ABIERTO.contains(chip)) {
      e.preventDefault();
      todos(".pick__chip", PICK_ABIERTO).forEach(function (x) { x.classList.toggle("is-on", x === chip); });
      return filtrarPick();
    }
    if (!PICK_ABIERTO.contains(t)) cerrarPick();
  });
  document.addEventListener("input", function (e) { if (PICK_ABIERTO && PICK_ABIERTO.contains(e.target)) filtrarPick(); });
  document.addEventListener("change", function (e) { if (e.target.classList && e.target.classList.contains("pick-oculto")) refrescarPick(e.target); });
  document.addEventListener("keydown", function (e) {
    if (!PICK_ABIERTO) return;
    var ops = todos(".pick__op", PICK_ABIERTO).filter(function (o) { return !o.hidden; });
    var i = ops.indexOf(document.activeElement);
    if (e.key === "Escape") { e.preventDefault(); var c = PICK_ABIERTO._caja; cerrarPick(); uno(".pick__btn", c).focus(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); (ops[i + 1] || ops[0]).focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); (ops[i - 1] || ops[ops.length - 1]).focus(); }
    else if (e.key === "Enter" && document.activeElement.tagName === "INPUT" && ops[0]) { e.preventDefault(); elegirPick(ops[0]); }
  });
  window.addEventListener("resize", ubicarPick);
  document.addEventListener("scroll", function (e) {
    if (PICK_ABIERTO && !PICK_ABIERTO.contains(e.target)) cerrarPick();
  }, true);

  /* Todas las listas de materiales o referencias llevan buscador */
  var CON_BUSCADOR = "#bg-mat, #mb-art, #mr-ref, #f-aj-ins, #sm-ins, #ec-ins";
  function mejorarSelectores() { todos(CON_BUSCADOR).forEach(mejorarSelect); }

  /* ---------------------------------------------------------------- Lo que se guarda en el navegador

     Todo lo que el usuario hace queda guardado en este navegador (localStorage):
     cómo quedó cada pantalla y los datos de la lógica (saldos, máquinas, kárdex).
     Al recargar sigue igual. El botón «Datos de ejemplo» vuelve todo al inicio.
     Es solo del navegador de quien lo usa: otra persona ve los datos de ejemplo. */

  var LLAVE_INV = "sicaf.inventario.v7";   // al cambiar las pantallas se sube el número y se arranca limpio
  var GUARDADO = (function () {
    try { return JSON.parse(window.localStorage.getItem(LLAVE_INV)) || {}; } catch (e) { return {}; }
  })();

  function guardarTodo() {
    try {
      GUARDADO.pantallas = GUARDADO.pantallas || {};
      if (pagina()) GUARDADO.pantallas[actual] = pagina().innerHTML;
      var menu = {};
      todos(".nav__si").forEach(function (a) {
        var ct = uno(".ct", a);
        if (ct) menu[a.getAttribute("href")] = ct.textContent;
      });
      GUARDADO.estado = { SALDO: SALDO, NUM_MOV: NUM_MOV, PARA_KARDEX: PARA_KARDEX,
                          MAQ: MAQ, MQ_SEL: MQ_SEL, COSTO_UNIDAD: COSTO_UNIDAD, ULTIMA_SC: ULTIMA_SC,
                          STOCK: STOCK, MOVS: MOVS, NUM_BG: NUM_BG, BG_SEL: BG_SEL, PEDIDOS: PEDIDOS, menu: menu };
      window.localStorage.setItem(LLAVE_INV, JSON.stringify(GUARDADO));
      marcarGuardado(true);
    } catch (e) { marcarGuardado(false); }
  }
  var _guardar;
  function guardarPronto() { clearTimeout(_guardar); _guardar = setTimeout(guardarTodo, 60); }

  function recuperarEstado() {
    var e = GUARDADO.estado;
    if (!e) return;
    if (e.SALDO) SALDO = e.SALDO;
    if (e.NUM_MOV) NUM_MOV = e.NUM_MOV;
    if (e.PARA_KARDEX) PARA_KARDEX = e.PARA_KARDEX;
    if (e.MAQ) MAQ = e.MAQ;
    if (e.MQ_SEL) MQ_SEL = e.MQ_SEL;
    if (e.COSTO_UNIDAD) COSTO_UNIDAD = e.COSTO_UNIDAD;
    if (e.ULTIMA_SC) ULTIMA_SC = e.ULTIMA_SC;
    if (e.STOCK) STOCK = e.STOCK;
    if (e.MOVS) MOVS = e.MOVS;
    if (e.NUM_BG) NUM_BG = e.NUM_BG;
    if (e.BG_SEL) BG_SEL = e.BG_SEL;
    if (e.PEDIDOS) PEDIDOS = e.PEDIDOS;
    if (e.menu) {
      for (var href in e.menu) {
        var a = todos(".nav__si").filter(function (x) { return x.getAttribute("href") === href; })[0];
        if (a) sumarAlMenu(href, 0, e.menu[href]);
      }
    }
  }

  /* La cajita del encabezado: dice que se guarda y deja volver a los datos de ejemplo */
  function ponerCajaGuardado() {
    var cab = uno(".phead", pagina());
    if (!cab || uno(".guardado", cab)) return;
    cab.insertAdjacentHTML("beforeend",
      '<div class="guardado"><span class="guardado__t" id="guardado-t">Se guarda en este navegador</span>' +
      '<button type="button" class="btn btn--sm btn--ghost" data-reiniciar>Datos de ejemplo</button></div>');
  }
  function marcarGuardado(ok) {
    var t = uno("#guardado-t");
    if (t) t.textContent = ok ? "Guardado en este navegador · " + ahora().slice(11) : "Este navegador no deja guardar";
  }

  var _reiniciar;
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-reiniciar]") : null;
    if (!b) return;
    e.preventDefault();
    if (!b.classList.contains("is-seguro")) {
      b.classList.add("is-seguro");
      b.textContent = "¿Borrar todo? Pulse otra vez";
      clearTimeout(_reiniciar);
      _reiniciar = setTimeout(function () { b.classList.remove("is-seguro"); b.textContent = "Datos de ejemplo"; }, 4000);
      return;
    }
    try { window.localStorage.removeItem(LLAVE_INV); } catch (x) {}
    clearTimeout(_guardar);
    window.removeEventListener("pagehide", guardarTodo);
    location.reload();
  });
  window.addEventListener("pagehide", guardarTodo);

  /* Al abrir: los datos guardados y, si esta pantalla ya se trabajó, como quedó */
  recuperarEstado();
  if (GUARDADO.pantallas && GUARDADO.pantallas[actual] && pagina()) {
    pagina().innerHTML = GUARDADO.pantallas[actual];
  }

  /* Lo que se hace cada vez que se pinta una pantalla */
  function alPintar() {
    cerrarPick();
    ponerCajaGuardado();
    if (GUARDADO.estado) marcarGuardado(true);
    dtArrancar();
    if (actual === "06-maquinaria.html") pintarMaquinas();
    if (actual === "02-m-prima.html") { sincronizarMP(); explicarEntrada(); }
    if (actual === "01-inicio.html") { sincronizarInicio(); refrescarArticulos(); marcarPedidosInicio(); pintarAlmacen(); }
    if (actual === "05-merma.html") mostrarExistencia();
    if (actual === "07-kardex.html") vaciarKardex();
    if (actual === "11-bodegas.html") iniciarBodegas();
    mejorarSelectores();
  }
  alPintar();

})();
