/* =====================================================================
   08-logistica/mockup/prototipo.js

   Hace que el mockup de Logística y Despacho RESPONDA: filtra las tablas,
   genera despachos, registra entregas y recepciones, programa recolecciones,
   asigna rutas y pasa de una pantalla a otra sin recargar.

   Mismo motor que el de 04-inventario, con lo propio de este módulo.
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
    var vistas = 0;
    filas.forEach(function (fila) {
      var t = fila.textContent.toLowerCase();
      var pasa = (!texto || t.indexOf(texto) >= 0) &&
                 palabras.every(function (p) { return t.indexOf(p) >= 0; });
      fila.style.display = pasa ? "" : "none";
      if (pasa) vistas++;
    });

    var pie = uno(".tabla-pie", cuerpo);
    if (pie) {
      if (!pie.dataset.original) pie.dataset.original = pie.textContent;
      pie.textContent = (texto || palabras.length)
        ? "Mostrando " + vistas + " de " + filas.length + " filas que coinciden con el filtro"
        : pie.dataset.original;
    }
    var vacio = uno(".sin-filas", cuerpo);
    if (!vacio) {
      vacio = document.createElement("p");
      vacio.className = "empty sin-filas";
      vacio.textContent = "Ninguna fila coincide con lo que buscó.";
      tabla.parentNode.appendChild(vacio);
    }
    vacio.style.display = vistas ? "none" : "";
  }

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.matches && t.matches('.tabla-tools input[type="search"]')) filtrar(t.closest(".tabla-tools"));
  });
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.matches && t.matches(".tabla-tools select")) filtrar(t.closest(".tabla-tools"));
  });

  /* ---------------------------------------------------------------- 4. Ir de una pantalla a otra */

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
      if (guardarEnHistorial) history.pushState({ pantalla: archivo }, "", archivo);
      window.scrollTo(0, 0);
      var p = pagina();
      if (p.parentNode) p.parentNode.scrollTop = 0;
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
    var n = uno(".avisos__n");
    if (n) {
      var v = Math.max(0, numero(n.textContent) + delta);
      n.textContent = v;
      n.style.display = v ? "" : "none";
    }
    var campana = uno(".bell__n");
    if (campana) {
      var c = Math.max(0, numero(campana.textContent) + delta);
      campana.textContent = c;
      campana.style.display = c ? "" : "none";
    }
  }

  /* La campana de la barra de arriba abre los pendientes de Inicio */
  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest(".bell")) return;
    e.preventDefault();
    function abrir() {
      var d = uno(".avisos");
      if (d) { d.open = true; d.scrollIntoView({ behavior: "smooth", block: "center" }); }
      else aviso("No hay pendientes sin atender.", "ok");
    }
    if (actual !== "01-inicio.html") { ir("01-inicio.html", true); setTimeout(abrir, 260); }
    else abrir();
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

  /* ---------------------------------------------------------------- 7. Los formularios de Logística */

  function generarDespacho() {
    var ped = uno("#f-l-ped"), alist = uno("#f-l-alist"), tra = uno("#f-l-tra");
    var panel = panelPorTitulo("Órdenes de Despacho");
    if (!panel) return aviso("Despacho generado.", "ok");

    var codigo = siguienteCodigo(panel, "Despacho");
    var fila = nuevaFila(panel, "Despacho");
    ponerCelda(fila, "Despacho", "<b>" + codigo + "</b><div class=\"tiny\">" +
               (ped ? ped.value.split("·")[0].trim() : "") + "</div>");
    ponerCelda(fila, "Guía", (tra ? tra.value : "Por asignar") +
               '<div class="tiny">Guía por generar</div>');
    ponerCelda(fila, "Fechas", "Alista " + (alist ? alist.value : hoy()) +
               '<div class="tiny">Entrega por confirmar</div>');
    ponerCelda(fila, "Estado", '<span class="pill pill--warn">Alistando</span>');
    recontar(panel, "despachos");
    sumarAlMenu("02-despachos.html", 1);
    aviso("Despacho " + codigo + " generado · Inventario descuenta los pares al salir de bodega.", "ok");
  }

  function registrarRecepcion() {
    var oc = uno("#rp-oc"), guia = uno("#rp-guia"), bul = uno("#rp-bul");
    if (guia && !guia.value.trim()) { guia.focus(); return aviso("Escriba el número de guía.", "crit"); }

    var panel = panelPorTitulo("Recepciones Registradas");
    if (!panel) return aviso("Recepción registrada.", "ok");

    var codigo = siguienteCodigo(panel, "Recepción");
    var fila = nuevaFila(panel, "Recepción");
    ponerCelda(fila, "Recepción", "<b>" + codigo + "</b><div class=\"tiny\">" + hoy() + "</div>");
    ponerCelda(fila, "Proveedor", oc ? oc.options[oc.selectedIndex].text : "");
    ponerCelda(fila, "Guía", (guia ? guia.value.trim() : "") +
               '<div class="tiny">' + (bul ? bul.value : "0") + " bulto(s)</div>");
    ponerCelda(fila, "Estado", '<span class="pill pill--ok">Recibida</span>');
    ponerCelda(fila, "Observación", "Sin novedad en la descarga");
    recontar(panel, "recepciones");
    if (guia) guia.value = "";
    aviso("Recepción " + codigo + " registrada · Inventario da la entrada a bodega.", "ok");
  }

  function programarRecoleccion() {
    var cl = uno("#rc-cl"), ref = uno("#rc-ref"), cant = uno("#rc-cant"), mot = uno("#rc-mot");
    var unidades = numero(cant && cant.value);
    if (!unidades) { if (cant) cant.focus(); return aviso("Escriba cuántos pares se recogen.", "crit"); }

    var panel = panelPorTitulo("Recolecciones");
    if (!panel) return aviso("Recolección programada.", "ok");

    var codigo = siguienteCodigo(panel, "Recolección");
    var fila = nuevaFila(panel, "Recolección");
    ponerCelda(fila, "Recolección", "<b>" + codigo + "</b><div class=\"tiny\">" + hoy() + "</div>");
    ponerCelda(fila, "Cliente", cl ? cl.value : "");
    ponerCelda(fila, "Referencia", (ref ? ref.value.split("·")[0].trim() : "") +
               '<div class="tiny">' + unidades + " par</div>");
    ponerCelda(fila, "Motivo", mot ? mot.value : "");
    ponerCelda(fila, "Destino", "Control de Calidad");
    ponerCelda(fila, "Estado", '<span class="pill pill--warn">Programada</span>');
    recontar(panel, "recolecciones");
    sumarAlMenu("04-log-inversa.html", 1);
    if (cant) cant.value = "";
    aviso("Recolección " + codigo + " programada · lo que vuelve pasa primero por Control de Calidad.", "warn");
  }

  /* ---------------------------------------------------------------- 8. Un solo oyente para los botones */

  var ESTADOS = {
    "Registrar entrega": { pill: "ok",   texto: "Entregado", dice: "queda entregado al cliente",       tono: "ok" },
    "Devolución":        { pill: "crit", texto: "Devuelto",  dice: "queda como devuelto · abra la recolección", tono: "crit" },
    "Procesar":          { pill: "ok",   texto: "Procesada", dice: "pasa a Control de Calidad",        tono: "ok" },
    "Asignar ruta":      { pill: "warn", texto: "En ruta",   dice: "sale a ruta",                       tono: "ok" },
    "Cerrar ruta":       { pill: "ok",   texto: "Disponible", dice: "vuelve a estar disponible",        tono: "ok" },
    "Asignar vehículo":  { pill: "warn", texto: "En tránsito", dice: "sale con el vehículo asignado",    tono: "ok" },
    "Dar de alta":       { pill: "ok",   texto: "Disponible", dice: "sale del taller y queda disponible", tono: "ok" },
    "Registrar llegada": { pill: "ok",   texto: "Recibida",   dice: "llegó a la planta · falta la revisión de Calidad", tono: "ok" },
    "Validar a mano":    { pill: "ok",   texto: "Validado",   dice: "queda validado con la guía digitada", tono: "ok" },
    "Reclamar":          { pill: "warn", texto: "En reclamo", dice: "queda en reclamo · se avisó a Compras", tono: "warn" },
    "Programar":         { pill: "warn", texto: "Programada", dice: "queda programada para recoger",      tono: "warn" }
  };

  /* Las tres acciones rápidas del tablero de Inicio */
  var RAPIDAS = {
    "ruta":      { a: "02-despachos.html", dice: "Arme la orden: pedido, cantidad alistada y vehículo." },
    "recepcion": { a: "03-recepcion.html", dice: "Registre la llegada del proveedor con su número de guía." }
  };

  /* Lectura simulada del escáner: saca una guía de las que están en camino */
  function escanearGuia() {
    var pendientes = ["GR-77441", "GR-77446", "GR-88238"];
    var leida = pendientes[Math.floor(Math.random() * pendientes.length)];
    aviso("Guía " + leida + " leída por el escáner · confirme los bultos antes de dar entrada.", "ok");
    var campo = uno("#rp-guia");
    if (campo) { campo.value = leida; campo.focus(); return; }
    ir("03-recepcion.html", true);
    setTimeout(function () {
      var c = uno("#rp-guia");
      if (c) { c.value = leida; c.focus(); }
    }, 420);
  }

  function generarReporte() {
    var tipo = uno("#rp-tipo"), desde = uno("#rp-desde"), hasta = uno("#rp-hasta"), fmt = uno("#rp-formato");
    var panel = panelPorTitulo("Reportes Generados");
    if (!panel) return aviso("Reporte generado.", "ok");

    var codigo = siguienteCodigo(panel, "Nº");
    var fila = nuevaFila(panel, "Nº");
    var color = { "PDF": "vino", "Excel": "oliva", "CSV": "cobre" }[fmt ? fmt.value : "PDF"] || "vino";
    ponerCelda(fila, "Nº", "<b>" + codigo + "</b>");
    ponerCelda(fila, "Reporte", tipo ? tipo.value : "Reporte del módulo");
    ponerCelda(fila, "Periodo", (desde ? desde.value : hoy()) + " a " + (hasta ? hasta.value : hoy()));
    ponerCelda(fila, "Fecha", hoy() + " " + new Date().toTimeString().slice(0, 5));
    ponerCelda(fila, "Formato", '<span class="chip chip--' + color + '">' + (fmt ? fmt.value : "PDF") + "</span>");
    recontar(panel, "reportes");
    aviso("Reporte " + codigo + " generado · queda en la lista para volver a descargarlo.", "ok");
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button") : null;
    if (!b) return;
    var texto = b.textContent.trim();

    var rapida = b.getAttribute("data-rapida");
    if (rapida === "ocr") { e.preventDefault(); return escanearGuia(); }
    if (rapida && RAPIDAS[rapida]) {
      e.preventDefault();
      aviso(RAPIDAS[rapida].dice, "ok");
      return ir(RAPIDAS[rapida].a, true);
    }

    /* Los botones de las alertas llevan a la pantalla donde se resuelven */
    var lleva = b.getAttribute("data-ir");
    if (lleva && ES_PANTALLA.test(lleva)) { e.preventDefault(); return ir(lleva, true); }

    if (texto === "Generar reporte")       { e.preventDefault(); return generarReporte(); }
    if (texto === "Generar despacho")      { e.preventDefault(); return generarDespacho(); }
    if (texto === "Registrar recepción")   { e.preventDefault(); return registrarRecepcion(); }
    if (texto === "Programar recolección") { e.preventDefault(); return programarRecoleccion(); }

    if (texto === "Marcar atendida") {
      e.preventDefault();
      var noti = b.closest(".noti");
      if (noti) noti.classList.add("es-atendida");
      b.replaceWith(Object.assign(document.createElement("span"),
        { className: "pill pill--ok", textContent: "Atendida" }));
      contarPendientes(-1);
      return aviso("Pendiente marcado como atendido.", "ok");
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
      var cual = (fila.querySelector("b") || {}).textContent || "El registro";
      if (texto === "Devolución") sumarAlMenu("04-log-inversa.html", 1);
      return aviso(cual + " " + destino.dice + ".", destino.tono);
    }

    if (b.classList.contains("iconbtn")) {
      e.preventDefault();
      return aviso((b.getAttribute("aria-label") || "Acción") +
                   ": disponible cuando el módulo esté programado.", "warn");
    }
  });

  /* ---------------------------------------------------------------- 9. Arranque */

  marcarMenu();
  history.replaceState({ pantalla: actual }, "", actual);
})();
