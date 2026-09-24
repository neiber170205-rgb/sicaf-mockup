/* =====================================================================
   03-compras/mockup/prototipo.js

   Hace que el mockup de Compras RESPONDA: filtra las tablas, registra
   cotizaciones, órdenes, recepciones y novedades, cambia estados y pasa
   de una pantalla a otra sin recargar.

   Mismo motor que el de 04-inventario, con los formularios de este módulo.
   Se carga DESPUÉS de comun/marco.js, con la última línea de cada pantalla.

   Los datos viven en la pantalla, no en una base: al recargar el navegador
   (F5) todo vuelve a como estaba. Es un prototipo, no el programa.
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

  var PRIMERA = "01-necesidad.html";
  var ES_PANTALLA = /^\d\d-[a-z-]+\.html$/;
  var actual = (location.pathname.split("/").pop() || "01-necesidad.html");
  if (!ES_PANTALLA.test(actual)) actual = "01-necesidad.html";
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
      setTimeout(pintarFlujo, 120);
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
  var PANTALLA_ALERTAS = "09-novedades.html";

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

  /* ---------------------------------------------------------------- 7. Los formularios de Compras */

  /* --- Registrar cotización (03) ---

     Una cotización lleva varios productos: primero se arman los renglones con
     "Agregar producto" y al final se registra todo junto.
  */

  function renglonesDeCotizacion() { return todos("#ct-reng tbody tr"); }

  function recalcularCotizacion() {
    var filas = renglonesDeCotizacion();
    var total = filas.reduce(function (suma, f) {
      return suma + numero(celda(f, "Subtotal").textContent);
    }, 0);
    var t = uno("#ct-total");
    if (t) t.innerHTML = "<b>" + pesos(total) + "</b>";
    var n = uno("#ct-cuantos");
    if (n) n.textContent = filas.length + (filas.length === 1 ? " producto" : " productos");
    return { filas: filas.length, total: total };
  }

  function agregarProducto() {
    var ins = uno("#ct-ins"), cant = uno("#ct-cant"), pre = uno("#ct-pre");
    var unidades = numero(cant && cant.value), unitario = numero(pre && pre.value);
    if (!unidades) { if (cant) cant.focus(); return aviso("Escriba cuánto cotizó el proveedor.", "crit"); }
    if (!unitario) { if (pre) pre.focus(); return aviso("Escriba el precio unitario.", "crit"); }

    var partes = ins.value.split("|");
    var nombre = partes[0], unidad = partes[1] || "unidad";
    var cuerpo = uno("#ct-reng tbody");

    var repetida = renglonesDeCotizacion().filter(function (f) {
      return (uno("b", celda(f, "Insumo")) || {}).textContent === nombre;
    })[0];
    if (repetida) {
      return aviso(nombre + " ya está en la cotización · quítelo primero si lo va a cambiar.", "warn");
    }

    var fila = document.createElement("tr");
    fila.className = "es-nueva";
    fila.innerHTML =
      '<td data-l="Insumo"><b>' + nombre + '</b><div class="tiny">medido en ' + unidad + "</div></td>" +
      '<td class="num" data-l="Cantidad">' + miles(unidades) + "</td>" +
      '<td class="num" data-l="Precio unitario">' + pesos(unitario) + "</td>" +
      '<td class="num" data-l="Subtotal">' + pesos(unidades * unitario) + "</td>" +
      '<td class="acts"><button class="btn btn--sm btn--ghost" type="button">Quitar</button></td>';
    cuerpo.appendChild(fila);

    cant.value = "";
    pre.value = "";
    var r = recalcularCotizacion();
    aviso(nombre + " agregado · la cotización va en " + r.filas + " productos por " + pesos(r.total) + ".", "ok");
  }

  function quitarProducto(boton) {
    var fila = boton.closest("tr");
    if (!fila) return;
    var nombre = (uno("b", celda(fila, "Insumo")) || {}).textContent || "El producto";
    fila.remove();
    recalcularCotizacion();
    aviso(nombre + " se quitó de la cotización.", "warn");
  }

  function registrarCotizacion() {
    var sol = uno("#ct-sol"), prov = uno("#ct-prov"), dias = uno("#ct-dias"), cal = uno("#ct-cal");
    var r = recalcularCotizacion();
    if (!r.filas) return aviso("La cotización no tiene productos: agregue al menos uno.", "crit");

    var panel = panelPorTitulo("Cotizaciones por Solicitud");
    if (!panel) return aviso("Cotización registrada.", "ok");

    var codigo = siguienteCodigo(panel, "Cotización");
    var fila = nuevaFila(panel, "Cotización");
    ponerCelda(fila, "Cotización", "<b>" + codigo + '</b><div class="tiny">' + hoy() + "</div>");
    ponerCelda(fila, "Solicitud", sol.value.split("·")[0].trim() +
               '<div class="tiny">' + r.filas + " producto(s)</div>");
    ponerCelda(fila, "Proveedor", prov.options[prov.selectedIndex].text);
    ponerCelda(fila, "Precio", pesos(r.total));
    ponerCelda(fila, "Entrega", dias.value + " días");
    ponerCelda(fila, "Calidad", cal.value);
    ponerCelda(fila, "Estado", '<span class="pill pill--warn">En estudio</span>');
    recontar(panel, "cotizaciones");
    aviso("Cotización " + codigo + " registrada con " + r.filas + " producto(s) por " + pesos(r.total) +
          " · queda en estudio hasta que Contabilidad la apruebe.", "ok");
  }

  /* --- Nueva orden de compra (04) --- */
  function generarOrden() {
    var ins = uno("#f-oc-ins"), prov = uno("#f-oc-prov"), cant = uno("#f-oc-cant"), pre = uno("#f-oc-pre");
    var unidades = numero(cant.value), unitario = numero(pre.value);
    if (!unidades) { cant.focus(); return aviso("Escriba la cantidad que va a ordenar.", "crit"); }
    if (!unitario) { pre.focus(); return aviso("Escriba el precio unitario acordado.", "crit"); }

    var panel = panelPorTitulo("Órdenes de Compra");
    if (!panel) return aviso("Orden generada.", "ok");

    var codigo = siguienteCodigo(panel, "Orden");
    var fila = nuevaFila(panel, "Orden");
    ponerCelda(fila, "Orden", "<b>" + codigo + "</b><div class=\"tiny\">" +
      prov.options[prov.selectedIndex].text + " · manual</div>");
    ponerCelda(fila, "Insumo", ins.value);
    ponerCelda(fila, "Recibido", "0 / " + miles(unidades));
    ponerCelda(fila, "Monto", pesos(unidades * unitario));
    ponerCelda(fila, "Estado", '<span class="pill pill--warn">Aprobada</span>');
    recontar(panel, "órdenes");
    sumarAlMenu("04-ordenes.html", 1);
    cant.value = "";
    aviso("Orden " + codigo + " generada: " + miles(unidades) + " un por " + pesos(unidades * unitario) + ".", "ok");
  }

  /* --- Registrar novedad (06) --- */
  function registrarNovedad() {
    var oc = uno("#nv-oc"), tipo = uno("#nv-tipo"), det = uno("#nv-det"), acc = uno("#nv-acc");
    if (!det.value.trim()) { det.focus(); return aviso("Escriba en qué consiste la novedad.", "crit"); }

    var panel = panelPorTitulo("Novedades con Proveedores");
    if (!panel) return aviso("Novedad registrada.", "ok");

    var codigo = siguienteCodigo(panel, "Novedad");
    var fila = nuevaFila(panel, "Novedad");
    ponerCelda(fila, "Novedad", "<b>" + codigo + "</b><div class=\"tiny\">" + hoy() + "</div>");
    ponerCelda(fila, "Orden", oc.value.split("·")[0].trim());
    ponerCelda(fila, "Tipo", '<span class="chip chip--cobre">' + tipo.value + "</span>");
    ponerCelda(fila, "Detalle", det.value.trim());
    ponerCelda(fila, "Acción", acc ? acc.value : "Por definir");
    ponerCelda(fila, "Estado", '<span class="pill pill--warn">Abierta</span>');
    recontar(panel, "novedades");
    sumarAlMenu("06-novedades.html", 1);
    det.value = "";
    aviso("Novedad " + codigo + " abierta sobre la orden " + oc.value.split("·")[0].trim() + ".", "warn");
  }

  /* --- Registrar la recepción de una orden (05) --- */
  function registrarRecepcion(boton) {
    var fila = boton.closest("tr");
    var orden = celda(fila, "Orden").textContent.trim().split(/\s+/)[0];
    var insumo = celda(fila, "Insumo").textContent.trim();
    var pend = celda(fila, "Pendiente");
    var cantidad = pend ? pend.textContent.trim() : "";

    var est = celda(fila, "Estado");
    if (est) est.innerHTML = '<span class="pill pill--ok">Recibida</span>';
    if (pend) pend.innerHTML = '<span class="muted">0</span>';
    fila.classList.add("es-nueva");
    boton.disabled = true;

    /* la tabla de abajo deja constancia */
    var panel = panelPorTitulo("Recepciones Registradas");
    if (panel && uno("tbody tr", tablaDe(panel))) {
      var nueva = nuevaFila(panel, null);
      var etiquetas = todos("td", nueva).map(function (td) { return td.getAttribute("data-l"); });
      if (etiquetas.indexOf("Orden") >= 0) ponerCelda(nueva, "Orden", "<b>" + orden + "</b>");
      if (etiquetas.indexOf("Insumo") >= 0) ponerCelda(nueva, "Insumo", insumo);
      if (etiquetas.indexOf("Fecha") >= 0) ponerCelda(nueva, "Fecha", hoy());
    }
    aviso("Recepción de " + orden + " registrada: " + cantidad +
          ". Inventario da la entrada a bodega.", "ok");
  }

  /* ---------------------------------------------------------------- 8. Estados */

  var ESTADOS = {
    "Enviar":            { pill: "warn", texto: "Enviada",   aviso: "ok",
                           dice: "queda enviada al proveedor" },
    "Recibir":           { pill: "ok",   texto: "Recibida",  aviso: "ok",
                           dice: "queda recibida" },
    "Elegir y ordenar":  { pill: "ok",   texto: "Aceptada",  aviso: "ok",
                           dice: "queda aceptada y pasa a orden de compra" },
    "Generar orden":     { pill: "ok",   texto: "Convertida", aviso: "ok",
                           dice: "queda convertida en orden de compra" },
    "Cerrar":            { pill: "off",  texto: "Cerrada",   aviso: "ok",
                           dice: "queda cerrada" }
  };

  /* ---------------------------------------------------------------- 9. Un solo oyente para los botones */

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button") : null;
    if (!b) return;
    var texto = b.textContent.trim();

    /* --- formularios --- */
    if (texto === "Agregar producto") { e.preventDefault(); return agregarProducto(); }
    if (texto === "Quitar")           { e.preventDefault(); return quitarProducto(b); }
    if (texto === "Registrar cotización") { e.preventDefault(); return registrarCotizacion(); }
    if (texto === "Registrar novedad")    { e.preventDefault(); return registrarNovedad(); }
    if (texto === "Registrar recepción")  { e.preventDefault(); return registrarRecepcion(b); }
    if (texto === "Generar orden" && b.closest(".panel__body--form")) {
      e.preventDefault(); return generarOrden();
    }

    /* --- pendientes --- */
    if (texto === "Marcar atendida") {
      e.preventDefault();
      var noti = b.closest(".noti");
      if (noti) noti.classList.add("es-atendida");
      b.replaceWith(Object.assign(document.createElement("span"),
        { className: "pill pill--ok", textContent: "Atendida" }));
      contarPendientes(-1);
      return aviso("Pendiente marcado como atendido.", "ok");
    }

    /* --- estados dentro de una tabla --- */
    if (ESTADOS[texto]) {
      e.preventDefault();
      var destino = ESTADOS[texto];
      var fila = b.closest("tr");
      if (!fila) return;
      var est = celda(fila, "Estado");
      if (est) est.innerHTML = '<span class="pill pill--' + destino.pill + '">' + destino.texto + "</span>";
      fila.classList.add("es-nueva");
      b.disabled = true;
      var cual = (fila.querySelector("b") || {}).textContent || "El registro";
      return aviso(cual + " " + destino.dice + ".", destino.aviso);
    }

    /* --- paso 1: de un insumo bajo el mínimo sale la solicitud --- */
    if (texto === "Crear solicitud") {
      e.preventDefault();
      var f1 = b.closest("tr");
      var cod = (f1.querySelector("b") || {}).textContent || "el insumo";
      var pedir = celda(f1, "Sugerido");
      var e1 = celda(f1, "Estado");
      if (e1) e1.innerHTML = '<span class="pill pill--warn">Solicitada</span>';
      f1.classList.add("es-nueva");
      b.disabled = true;
      aviso("Solicitud creada para " + cod + " · " + (pedir ? pedir.textContent.trim() : "") +
            " unidades. Pasa al paso 2.", "ok");
      return setTimeout(function () { ir("02-solicitudes.html", true); }, 700);
    }

    /* --- paso 5: aprobar o rechazar --- */
    if (texto === "Aprobar" || texto === "Rechazar") {
      e.preventDefault();
      var f5 = b.closest("tr");
      var ok = texto === "Aprobar";
      var e5 = celda(f5, "Estado");
      if (e5) e5.innerHTML = '<span class="pill pill--' + (ok ? "ok" : "crit") + '">' +
        (ok ? "Aprobada" : "Rechazada") + "</span>";
      f5.classList.add("es-nueva");
      todos("button", f5).forEach(function (x) { x.disabled = true; });
      var sol = (f5.querySelector("b") || {}).textContent || "La solicitud";
      return aviso(ok ? sol + " aprobada · se genera la orden de compra."
                      : sol + " rechazada · vuelve a Inventario con el motivo.",
                   ok ? "ok" : "crit");
    }

    /* --- paso 8: avisarle a Inventario --- */
    if (texto === "Avisar a Inventario") {
      e.preventDefault();
      var f8 = b.closest("tr");
      var orden8 = (f8.querySelector("b") || {}).textContent || "La orden";
      var mv = celda(f8, "Movimiento en Inventario");
      if (mv) mv.innerHTML = "<b>MV-0011</b><div class=\"tiny\">" + hoy() + "</div>";
      var e8 = celda(f8, "Estado");
      if (e8) e8.innerHTML = '<span class="pill pill--ok">Confirmada</span>';
      f8.classList.add("es-nueva");
      b.disabled = true;
      return aviso("Inventario registró la entrada de " + orden8 +
                   " · movimiento MV-0011 en el kárdex.", "ok");
    }

    if (texto === "Ver en kárdex" || texto === "Abrir novedad") {
      e.preventDefault();
      return texto === "Abrir novedad" ? ir("09-novedades.html", true)
                                       : aviso("El kárdex vive en Inventario: se consulta por su API.", "warn");
    }

    if (texto === "Calificar") {
      e.preventDefault();
      return aviso("Calificar al proveedor: disponible cuando el módulo esté programado.", "warn");
    }

    if (b.classList.contains("iconbtn")) {
      e.preventDefault();
      return aviso((b.getAttribute("aria-label") || "Acción") +
                   ": disponible cuando el módulo esté programado.", "warn");
    }
  });

  /* ---------------------------------------------------------------- 10. Arranque */

  marcarMenu();
  setTimeout(pintarFlujo, 300);
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

  /* Compras: lo que llega de Inventario aparece en la pantalla que toca */

  function pintarSolicitudes() {
    var panel = panelPorTitulo("Solicitudes de Material Recibidas");
    if (!panel) return;
    var lista = leerFlujo(), hubo = 0;
    lista.forEach(function (s) {
      if (s.estado !== "Nueva") return;
      if (uno('[data-sc="' + s.id + '"]')) return;
      var fila = nuevaFila(panel, "Solicitud");
      fila.setAttribute("data-sc", s.id);
      var que = s.insumos.map(function (i) { return i.cod; }).join(", ");
      ponerCelda(fila, "Solicitud", "<b>" + s.id + "</b><div class=\"tiny\">" + s.fecha + "</div>");
      ponerCelda(fila, "Origen", "Inventario<div class=\"tiny\">" + s.bodega + "</div>");
      ponerCelda(fila, "Insumo", que);
      ponerCelda(fila, "Cantidad", s.insumos.reduce(function (a, i) { return a + i.falta; }, 0));
      ponerCelda(fila, "Urgencia", '<span class="pill pill--crit">Urgente</span>');
      ponerCelda(fila, "Proveedor sugerido", s.insumos[0] ? s.insumos[0].proveedor : "Por definir");
      ponerCelda(fila, "Estado", '<span class="pill pill--warn">Por cotizar</span>');
      ponerCelda(fila, "Acciones", '<div class="acts"><button class="btn btn--sm" type="button">Cotizar</button></div>');
      cambiarSolicitud(s.id, { estado: "Recibida" });
      hubo += 1;
    });
    if (hubo) {
      recontar(panel, "solicitudes");
      aviso(hubo + " solicitud(es) nueva(s) de Inventario. Están de primeras, por cotizar.", "warn");
    }
  }

  function pintarPorAprobar() {
    var panel = panelPorTitulo("Compras por Aprobar");
    if (!panel) return;
    var hubo = 0;
    leerFlujo().forEach(function (s) {
      if (s.estado !== "Cotizada") return;
      if (uno('[data-sc="' + s.id + '"]')) return;
      var fila = nuevaFila(panel, "Solicitud");
      fila.setAttribute("data-sc", s.id);
      ponerCelda(fila, "Solicitud", "<b>" + s.id + "</b><div class=\"tiny\">" + s.bodega + "</div>");
      ponerCelda(fila, "Insumo", s.insumos.map(function (i) { return i.cod; }).join(", "));
      ponerCelda(fila, "Proveedor elegido", s.insumos[0] ? s.insumos[0].proveedor : "Por definir");
      ponerCelda(fila, "Monto", pesos(s.monto || 0));
      ponerCelda(fila, "Quién aprueba", (s.monto || 0) > 5000000 ? "Gerencia" : "Jefe de Compras");
      ponerCelda(fila, "Estado", '<span class="pill pill--warn">En estudio</span>');
      var acc = celda(fila, "Acciones");
      if (acc) acc.innerHTML = '<div class="acts"><button class="btn btn--sm" type="button">Aprobar</button>' +
                               '<button class="btn btn--sm btn--ghost" type="button">Rechazar</button></div>';
      hubo += 1;
    });
    if (hubo) {
      recontar(panel, "compras");
      aviso(hubo + " cotización(es) esperando aprobación.", "warn");
    }
  }

  function pintarOrdenes() {
    var panel = panelPorTitulo("Órdenes de Compra");
    if (!panel) return;
    var hubo = 0;
    leerFlujo().forEach(function (s) {
      if (s.estado !== "Aprobada" || !s.oc) return;
      if (uno('[data-oc="' + s.oc + '"]')) return;
      var fila = nuevaFila(panel, "Orden");
      fila.setAttribute("data-oc", s.oc);
      fila.setAttribute("data-sc", s.id);
      ponerCelda(fila, "Orden", "<b>" + s.oc + "</b><div class=\"tiny\">de la " + s.id + "</div>");
      ponerCelda(fila, "Insumo", s.insumos.map(function (i) { return i.cod; }).join(", "));
      ponerCelda(fila, "Recibido", "0 de " + s.insumos.length);
      ponerCelda(fila, "Monto", pesos(s.monto || 0));
      ponerCelda(fila, "Estado", '<span class="pill pill--warn">Enviada al proveedor</span>');
      var acc = celda(fila, "Acciones");
      if (acc) acc.innerHTML = '<div class="acts"><button class="btn btn--sm" type="button">Dar entrada</button></div>';
      hubo += 1;
    });
    if (hubo) { recontar(panel, "órdenes"); aviso(hubo + " orden(es) de compra nueva(s).", "ok"); }
  }

  /* Los tres botones que mueven el proceso */
  var ULTIMA_OC = 21;

  function cotizarSolicitud(fila) {
    var id = fila.getAttribute("data-sc");
    var monto = 0;
    leerFlujo().forEach(function (s) {
      if (s.id !== id) return;
      s.insumos.forEach(function (i) { monto += (i.falta || 1) * 14500; });
    });
    cambiarSolicitud(id, { estado: "Cotizada", monto: monto });
    var p = uno(".pill", celda(fila, "Estado"));
    p.className = "pill pill--ok";
    p.textContent = "Cotizada";
    var b = uno(".btn", fila);
    if (b) { b.textContent = "Cotizada"; b.disabled = true; b.classList.add("btn--ghost"); }
    fila.classList.add("es-nueva");
    sumarAlMenu("05-aprobacion.html", 1);
    aviso("Cotización de la " + id + " por " + pesos(monto) +
          " · pasa a aprobación, en Aprobación la ve esperando.", "ok");
  }

  function decidirSolicitud(fila, aprueba) {
    var id = fila.getAttribute("data-sc");
    var p = uno(".pill", celda(fila, "Estado"));
    var acc = celda(fila, "Acciones");
    if (!aprueba) {
      cambiarSolicitud(id, { estado: "Rechazada" });
      p.className = "pill pill--crit";
      p.textContent = "Rechazada";
      if (acc) acc.innerHTML = '<span class="tiny muted">Vuelve a Inventario</span>';
      return aviso("La " + id + " quedó rechazada. Inventario tiene que volver a pedirla.", "crit");
    }
    ULTIMA_OC += 1;
    var oc = "OC-2026-0" + ULTIMA_OC;
    cambiarSolicitud(id, { estado: "Aprobada", oc: oc });
    p.className = "pill pill--ok";
    p.textContent = "Aprobada";
    if (acc) acc.innerHTML = '<span class="tiny">Quedó la <b>' + oc + "</b></span>";
    fila.classList.add("es-nueva");
    sumarAlMenu("06-ordenes.html", 1);
    aviso("Aprobada: se generó la orden " + oc + " para la " + id +
          " · en Órdenes de Compra ya aparece.", "ok");
  }

  function darEntrada(fila) {
    var id = fila.getAttribute("data-sc"), oc = fila.getAttribute("data-oc");
    cambiarSolicitud(id, { estado: "Despachada" });
    var p = uno(".pill", celda(fila, "Estado"));
    p.className = "pill pill--ok";
    p.textContent = "Recibida";
    var rec = celda(fila, "Recibido");
    if (rec) rec.textContent = rec.textContent.replace(/^\d+/, rec.textContent.split(" de ")[1] || "1");
    var acc = celda(fila, "Acciones");
    if (acc) acc.innerHTML = '<span class="tiny">Va para Inventario</span>';
    fila.classList.add("es-nueva");
    aviso("La " + oc + " quedó recibida · al entrar a Inventario el saldo de la bodega sube solo.", "ok");
  }

  function pintarFlujo() {
    pintarSolicitudes();
    pintarPorAprobar();
    pintarOrdenes();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button") : null;
    if (!b) return;
    var fila = b.closest("tr[data-sc]");
    if (!fila) return;
    var texto = b.textContent.trim();
    if (texto === "Cotizar")  { e.preventDefault(); return cotizarSolicitud(fila); }
    if (texto === "Aprobar")  { e.preventDefault(); return decidirSolicitud(fila, true); }
    if (texto === "Rechazar") { e.preventDefault(); return decidirSolicitud(fila, false); }
    if (texto === "Dar entrada") { e.preventDefault(); return darEntrada(fila); }
  });

})();
