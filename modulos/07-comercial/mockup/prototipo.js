/* =====================================================================
   07-comercial/mockup/prototipo.js

   Hace que el mockup de Comercial RESPONDA: registrar clientes, generar
   cotizaciones, convertirlas en pedido, confirmar, mandar a Logística,
   cambiar cupos, eliminar y filtrar, sin recargar la página.

   Mismo motor que el de 04-inventario, con lo propio de este módulo.
   Las cotizaciones tienen su parte: la lista (tarjetas, filtros, orden y
   páginas) en la sección 9, la nueva cotización (cliente, productos y
   totales) en la 10 y el detalle que se abre desde la lista en la 11.
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
  var actual = (location.pathname.split("/").pop() || "04-clientes.html");
  if (!ES_PANTALLA.test(actual)) actual = "04-clientes.html";
  var guardadas = {};   // lo que el usuario ya cambió en cada pantalla

  /* Una pantalla sin pestaña propia deja marcada la pestaña de la que sale */
  var PADRE = { "09-cotizacion-nueva.html": "09-cotizacion.html", "10-facturacion-nueva.html": "10-facturacion.html" };

  function marcarMenu() {
    var marcada = PADRE[actual] || actual;
    todos(".nav__si").forEach(function (a) {
      a.classList.toggle("is-on", a.getAttribute("href") === marcada);
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
      alEntrar();
      if (guardarEnHistorial) history.pushState({ pantalla: archivo }, "", archivo);
      window.scrollTo(0, 0);
      var p = pagina();
      p.scrollTop = 0;   // en pantalla ancha quien se desplaza es .page
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
    if (actual !== "04-clientes.html") { ir("04-clientes.html", true); setTimeout(abrir, 260); }
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

  /* ---------------------------------------------------------------- 7. Los formularios de Comercial */

  function registrarCliente() {
    var nom = uno("#cn-nombre"), nit = uno("#cn-nit"), ciu = uno("#cn-ciudad"), cupo = uno("#cn-cupo");
    if (!nom.value.trim()) { nom.focus(); return aviso("Escriba el nombre del cliente.", "crit"); }
    if (!nit.value.trim()) { nit.focus(); return aviso("Escriba el NIT.", "crit"); }

    var panel = panelPorTitulo("Clientes y Cupo de Crédito");
    if (!panel) return aviso("Cliente registrado.", "ok");

    var codigo = siguienteCodigo(panel, "Cliente");
    var fila = nuevaFila(panel, "Cliente");
    ponerCelda(fila, "Cliente", "<b>" + codigo + '</b><div class="tiny">' + nit.value.trim() + "</div>");
    ponerCelda(fila, "Nombre", nom.value.trim() + '<div class="tiny">' + ciu.value + "</div>");
    ponerCelda(fila, "Cupo", pesos(numero(cupo.value)));
    ponerCelda(fila, "Saldo", "$0");
    ponerCelda(fila, "Estado", '<span class="pill pill--ok">Al día</span>');
    recontar(panel, "clientes");
    sumarAlMenu("04-clientes.html", 1);
    var creado = nom.value.trim();
    nom.value = ""; nit.value = ""; cupo.value = "";
    aviso(creado + " queda registrado como " + codigo + " · entra con saldo en cero.", "ok");
  }

  function generarCotizacion() {
    var cl = uno("#f-v-cl"), ref = uno("#f-v-ref"), cant = uno("#f-v-cant"), pre = uno("#f-v-precio");
    var pares = numero(cant.value), precio = numero(pre.value);
    if (!pares)  { cant.focus(); return aviso("Escriba cuántos pares cotiza.", "crit"); }
    if (!precio) { pre.focus();  return aviso("Escriba el precio por par.", "crit"); }

    var panel = panelPorTitulo("Cotizaciones Enviadas");
    if (!panel) return aviso("Cotización generada.", "ok");

    var codigo = siguienteCodigo(panel, "Cotización");
    var fila = nuevaFila(panel, "Cotización");
    ponerCelda(fila, "Cotización", "<b>" + codigo + '</b><div class="tiny">Vence en 15 días</div>');
    ponerCelda(fila, "Cliente", cl.options[cl.selectedIndex].text.split("·").pop().trim());
    ponerCelda(fila, "Modelo", ref.value + '<div class="tiny">' + miles(pares) + " pares</div>");
    ponerCelda(fila, "Valor", pesos(pares * precio));
    ponerCelda(fila, "Estado", '<span class="pill pill--warn">Enviada</span>');
    var acts = uno(".acts", fila);
    if (acts) acts.innerHTML = '<button class="btn btn--sm btn--oliva">Convertir en pedido</button>' +
                               '<button class="btn btn--sm btn--ghost">Eliminar</button>';
    recontar(panel, "cotizaciones");
    sumarAlMenu("02-ventas.html", 1);
    aviso("Cotización " + codigo + " generada por " + pesos(pares * precio) +
          " · no compromete existencia todavía.", "ok");
  }

  function eliminarFila(b) {
    var fila = b.closest("tr");
    if (!fila) return;
    if (!fila.classList.contains("va-a-borrarse")) {
      fila.classList.add("va-a-borrarse");
      b.textContent = "¿Seguro?";
      b.className = "btn btn--sm btn--cobre";
      clearTimeout(fila._t);
      fila._t = setTimeout(function () {
        fila.classList.remove("va-a-borrarse");
        b.textContent = "Eliminar";
        b.className = "btn btn--sm btn--ghost";
      }, 4000);
      return aviso("Pulse otra vez para eliminar. Se deshace solo en 4 segundos.", "warn");
    }
    var que = (fila.querySelector("b") || {}).textContent || "La fila";
    var panel = panelDe(fila);
    fila.parentNode.removeChild(fila);
    if (panel) recontar(panel, "filas");
    aviso(que + " eliminado.", "crit");
  }

  /* ---------------------------------------------------------------- 8. Un solo oyente para los botones */

  /* Las tres acciones rápidas del tablero de Inicio */
  var RAPIDAS = {
    "venta":   { a: "02-ventas.html",   dice: "Arme la cotización: cliente, referencia y cantidad." },
    "cliente": { a: "04-clientes.html", dice: "Registre el cliente con su NIT y el cupo que se le asigna." },
    "pedido":  { a: "05-pedidos.html",  dice: "Los pedidos salen de una cotización aceptada." }
  };

  function generarReporte() {
    var tipo = uno("#rc-tipo"), desde = uno("#rc-desde"), hasta = uno("#rc-hasta"), fmt = uno("#rc-formato");
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
    if (rapida && RAPIDAS[rapida]) {
      e.preventDefault();
      aviso(RAPIDAS[rapida].dice, "ok");
      return ir(RAPIDAS[rapida].a, true);
    }

    /* Los botones que llevan a otra pantalla del módulo */
    var lleva = b.getAttribute("data-ir");
    if (lleva && ES_PANTALLA.test(lleva)) { e.preventDefault(); return ir(lleva, true); }

    if (texto === "Generar reporte")     { e.preventDefault(); return generarReporte(); }
    if (texto === "Registrar cliente")   { e.preventDefault(); return registrarCliente(); }
    if (texto === "Generar cotización")  { e.preventDefault(); return generarCotizacion(); }
    if (texto === "Eliminar" || texto === "¿Seguro?") { e.preventDefault(); return eliminarFila(b); }

    if (texto === "Marcar atendida") {
      e.preventDefault();
      var noti = b.closest(".noti");
      if (noti) noti.classList.add("es-atendida");
      b.replaceWith(Object.assign(document.createElement("span"),
        { className: "pill pill--ok", textContent: "Atendida" }));
      contarPendientes(-1);
      return aviso("Pendiente marcado como atendido.", "ok");
    }

    /* cambiar el cupo de un cliente, ahí mismo en la tabla */
    if (texto === "Cambiar cupo") {
      e.preventDefault();
      var fc = b.closest("tr");
      var td = celda(fc, "Cupo");
      if (td.querySelector("input")) return;
      td.innerHTML = '<input class="control" type="number" value="' + numero(td.textContent) +
                     '" style="width:120px;padding:4px 8px" aria-label="Cupo de crédito">';
      td.querySelector("input").focus();
      b.textContent = "Guardar cupo";
      b.className = "btn btn--sm btn--oliva";
      return;
    }

    if (texto === "Guardar cupo") {
      e.preventDefault();
      var fg = b.closest("tr");
      var tdg = celda(fg, "Cupo");
      var caja = tdg.querySelector("input");
      if (!caja) return;
      var nuevo = numero(caja.value);
      var saldo = numero(celda(fg, "Saldo").textContent);
      tdg.textContent = pesos(nuevo);
      var est = celda(fg, "Estado");
      if (est) {
        est.innerHTML = saldo > nuevo
          ? '<span class="pill pill--crit">Cupo excedido</span>'
          : (saldo > nuevo * 0.8 ? '<span class="pill pill--warn">Cupo casi lleno</span>'
                                 : '<span class="pill pill--ok">Al día</span>');
      }
      fg.classList.add("es-nueva");
      b.textContent = "Cambiar cupo";
      b.className = "btn btn--sm btn--ghost";
      return aviso("Cupo actualizado a " + pesos(nuevo) + ".", "ok");
    }

    if (texto === "Convertir en pedido") {
      e.preventDefault();
      var fv = b.closest("tr");
      var cot = (fv.querySelector("b") || {}).textContent || "La cotización";
      var est2 = celda(fv, "Estado");
      if (est2) est2.innerHTML = '<span class="pill pill--ok">Convertida</span>';
      fv.classList.add("es-nueva");
      todos("button", fv).forEach(function (x) { x.disabled = true; });
      sumarAlMenu("02-ventas.html", -1);
      sumarAlMenu("05-pedidos.html", 1);
      aviso(cot + " se convirtió en pedido · confírmelo para reservar los pares.", "ok");
      return setTimeout(function () { ir("05-pedidos.html", true); }, 800);
    }

    if (texto === "Confirmar") {
      e.preventDefault();
      var fp = b.closest("tr");
      var ped = (fp.querySelector("b") || {}).textContent || "El pedido";
      var est3 = celda(fp, "Estado");
      if (est3) est3.innerHTML = '<span class="pill pill--ok">Confirmado</span>';
      fp.classList.add("es-nueva");
      b.textContent = "Enviar a Logística";
      b.className = "btn btn--sm btn--oliva";
      return aviso(ped + " confirmado · Inventario reserva los pares en bodega.", "ok");
    }

    if (texto === "Enviar a Logística") {
      e.preventDefault();
      var fl = b.closest("tr");
      var ped2 = (fl.querySelector("b") || {}).textContent || "El pedido";
      var est4 = celda(fl, "Estado");
      if (est4) est4.innerHTML = '<span class="pill pill--off">Despachado</span>';
      fl.classList.add("es-nueva");
      b.disabled = true;
      sumarAlMenu("05-pedidos.html", -1);
      sumarAlMenu("06-entregas.html", 1);
      return aviso(ped2 + " pasa a Logística · ellos generan la orden de despacho.", "ok");
    }

    if (texto === "Pedir a Producción") {
      e.preventDefault();
      var fr = b.closest("tr");
      var refr = (fr.querySelector("b") || {}).textContent || "La referencia";
      b.disabled = true;
      fr.classList.add("es-nueva");
      return aviso("Se le pidió a Producción abrir una orden para " + refr + ".", "warn");
    }

    if (texto === "Avisar a Logística") {
      e.preventDefault();
      var fd = b.closest("tr");
      var ed = celda(fd, "Estado");
      if (ed) ed.innerHTML = '<span class="pill pill--warn">Recolección pedida</span>';
      fd.classList.add("es-nueva");
      b.disabled = true;
      return aviso("Logística programa la recolección · lo que vuelve pasa por Control de Calidad.", "warn");
    }

    if (texto === "Renovar") {
      e.preventDefault();
      var fx = b.closest("tr");
      var ex = celda(fx, "Estado");
      if (ex) ex.innerHTML = '<span class="pill pill--warn">Enviada</span>';
      fx.classList.add("es-nueva");
      b.textContent = "Convertir en pedido";
      b.className = "btn btn--sm btn--oliva";
      return aviso("Cotización renovada por 15 días más.", "ok");
    }

    if (texto === "Ver en Logística") {
      e.preventDefault();
      return aviso("La devolución la gestiona Logística y Despacho · Comercial solo la consulta.", "warn");
    }

    if (texto === "Ver guía" || texto === "Ver soporte" || texto === "Ver entrega") {
      e.preventDefault();
      return ir("06-entregas.html", true);
    }

    if (b.classList.contains("iconbtn") && !b.hasAttribute("data-accion")) {
      e.preventDefault();
      return aviso((b.getAttribute("aria-label") || "Acción") +
                   ": disponible cuando el módulo esté programado.", "warn");
    }
  });

  /* ---------------------------------------------------------------- 9. Cotizaciones: la lista

     09-cotizacion.html usa la tabla de datos de Órdenes (05-produccion): las
     tarjetas filtran, el buscador, la caja de filtros con sus fichas, el orden
     por columna, los totales de lo filtrado y las páginas.
     Cada fila trae sus datos en atributos (data-estado, data-fecha, data-vence,
     data-pares y data-valor). En la pantalla de React esos datos llegan de la API. */

  var LISTA = "09-cotizacion.html";
  var NUEVA = "09-cotizacion-nueva.html";

  /* Los estados, en el orden en que los vive una cotización. El cliente no la
     acepta: al enviarla va a Facturación (a él le llega el PDF, solo para que la
     conozca) y queda Por facturar hasta que la facturen. Si pasa su fecha de
     validez sin facturarse, se vence. Cada estado con su nombre y el color de su píldora */
  var ESTADOS = ["borrador", "porfacturar", "facturada", "vencida"];
  var NOMBRE_ESTADO = { borrador: "Borrador", porfacturar: "Por facturar", facturada: "Facturada", vencida: "Vencida" };
  var TONO_ESTADO = { borrador: "off", porfacturar: "warn", facturada: "ok", vencida: "crit" };

  var NOMBRE_FILTRO_COT = {
    codigo: "Cotización", cliente: "Cliente", vendedor: "Vendedor", estado: "Estado",
    valorMin: "Valor desde", valorMax: "Valor hasta", desde: "Fecha desde", hasta: "Fecha hasta"
  };

  var cotNuevas = [];   // las que se acaban de crear y todavía no están en la tabla
  var ultimaCot = 18;   // el consecutivo más alto: CO-2026-018

  function esc(texto) {
    return String(texto).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  /* Para buscar sin fijarse en mayúsculas ni tildes: "Almacén" = "almacen" */
  function sinTildes(texto) {
    return String(texto).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  function cuantas(n, una, varias) { return miles(n) + " " + (n === 1 ? una : varias); }
  function nombreEstado(e) { return NOMBRE_ESTADO[e] || e; }
  function valorDe(tr) { return numero(tr.getAttribute("data-valor")); }
  function textoDe(tr, etiqueta) {
    var td = celda(tr, etiqueta);
    return td ? td.textContent.trim() : "";
  }
  /* En la tabla va "Valentina R." para que quepa; el nombre completo, en el title */
  function nombreCorto(nombre) {
    var p = nombre.split(/\s+/);
    return p.length > 1 ? p[0] + " " + p[p.length - 1].charAt(0) + "." : nombre;
  }
  function vendedorDe(tr) {
    var td = celda(tr, "Vendedor");
    return td ? td.title || td.textContent.trim() : "";
  }

  /* ---- El motor de las tablas de datos ----
     Cotizaciones (#dt-cot) y Facturación (#dt-fac) usan la misma tabla: las
     tarjetas filtran, el buscador, la caja de filtros con sus fichas, el orden
     por columna, los totales de lo filtrado y las páginas. Lo que cambia de una
     a otra va en TABLAS: sus estados, sus filtros, cómo se ordena cada columna,
     qué cuentan sus tarjetas y qué hace al abrirse. Lo que se busca, se filtra,
     el orden y la página en la que va se guardan en "vistas", una por tabla. */

  var TABLAS = {};
  var vistas = {};

  function vistaNueva(tam) { return { q: "", f: {}, orden: "fecha", dir: -1, pag: 1, tam: tam || 10 }; }
  function vistaDe(id) { return vistas[id] || (vistas[id] = vistaNueva()); }
  /* La tabla de datos que está en pantalla (#dt-cot o #dt-fac), o null */
  function tablaVisible() {
    for (var id in TABLAS) {
      var dt = uno("#" + id);
      if (dt) return dt;
    }
    return null;
  }
  function tablaDeEvento(nodo) {
    var dt = nodo.closest ? nodo.closest(".dt") : null;
    return dt && TABLAS[dt.id] ? dt : null;
  }
  /* Las piezas de cada tabla se llaman como ella: #dt-cot-q, #dt-cot-pag... */
  function pieza(dt, que) { return uno("#" + dt.id + "-" + que); }

  /* Filtros que sirven a las dos tablas; los propios de cada una van en su "filtros" */
  function contiene(columna) {
    return function (tr, v) { return sinTildes(textoDe(tr, columna)).indexOf(sinTildes(v.trim())) >= 0; };
  }
  var FILTROS = {
    estado: function (tr, v) { return tr.getAttribute("data-estado") === v; },
    valorMin: function (tr, v) { return valorDe(tr) >= numero(v); },
    valorMax: function (tr, v) { return valorDe(tr) <= numero(v); },
    desde: function (tr, v) { return tr.getAttribute("data-fecha") >= v; },
    hasta: function (tr, v) { return tr.getAttribute("data-fecha") <= v; }
  };

  function pasaFiltro(tr, conf, vista) {
    for (var k in vista.f) {
      var v = String(vista.f[k]);
      if (!v.trim()) continue;
      var filtro = conf.filtros[k] || FILTROS[k];
      if (filtro && !filtro(tr, v)) return false;
    }
    if (vista.q) {
      // mira toda la fila y lo que la tabla le sume (el NIT del cliente, el nombre completo del vendedor)
      var todo = sinTildes(conf.buscar(tr));
      var pegado = vista.q.replace(/[.\-]/g, "");
      if (todo.indexOf(vista.q) < 0 && (!pegado || todo.replace(/[.\-]/g, "").indexOf(pegado) < 0)) return false;
    }
    return true;
  }

  function claveOrden(tr, k, conf) {
    if (k === "pares" || k === "valor") return numero(tr.getAttribute("data-" + k));
    if (k === "fecha") return tr.getAttribute("data-fecha");
    if (k === "vence") return tr.getAttribute("data-vence") || "9999-12-31";   // sin fecha (una factura pagada) va al final
    if (k === "estado") return conf.estados.indexOf(tr.getAttribute("data-estado"));
    if (k === "codigo") return cola(textoDe(tr, conf.codigo));
    if (conf.claves[k]) return conf.claves[k](tr);
    return sinTildes(textoDe(tr, conf.columnas[k] || k));
  }

  function comparar(conf, vista) {
    return function (a, b) {
      var x = claveOrden(a, vista.orden, conf), y = claveOrden(b, vista.orden, conf);
      if (x < y) return -vista.dir;
      if (x > y) return vista.dir;
      return cola(textoDe(b, conf.codigo)) - cola(textoDe(a, conf.codigo));   // empate: la más nueva arriba
    };
  }

  function pintarLista(dt) {
    dt = dt || tablaVisible();
    if (!dt) return;
    var conf = TABLAS[dt.id], vista = vistaDe(dt.id);
    var cuerpo = uno("tbody", dt);
    var filas = todos("tr[data-estado]", cuerpo);
    var vistas_ = filas.filter(function (tr) { return pasaFiltro(tr, conf, vista); }).sort(comparar(conf, vista));

    // Las páginas: solo se ven las filas de la página en la que se está
    var paginas = Math.max(1, Math.ceil(vistas_.length / vista.tam));
    vista.pag = Math.min(Math.max(1, vista.pag), paginas);
    var desde = (vista.pag - 1) * vista.tam, hasta = desde + vista.tam;
    filas.forEach(function (tr) { tr.hidden = true; });
    vistas_.forEach(function (tr, i) {
      cuerpo.appendChild(tr);                  // el orden de las filas es el elegido
      tr.hidden = i < desde || i >= hasta;
    });
    var vacio = uno(".dt__vacio", cuerpo);
    cuerpo.appendChild(vacio);
    vacio.hidden = vistas_.length > 0;

    // Los totales de lo que deja ver el filtro: todo y cada estado
    function suma(estado) {
      return vistas_.reduce(function (s, tr) {
        return s + (!estado || tr.getAttribute("data-estado") === estado ? valorDe(tr) : 0);
      }, 0);
    }
    uno('[data-tot="todas"]', dt).textContent = pesos(suma());
    conf.estados.forEach(function (e) {
      var t = uno('[data-tot="' + e + '"]', dt);
      if (t) t.textContent = pesos(suma(e));
    });
    var filtrada = vistas_.length !== filas.length;
    pieza(dt, "de").textContent = !filtrada ? "de las " + filas.length + " " + conf.plural
      : vistas_.length === 1 ? "de la única que cumple el filtro"
      : "de las " + vistas_.length + " que cumplen el filtro";

    // Cuántas se ven y el paginador
    pieza(dt, "info").innerHTML = vistas_.length
      ? "Mostrando <b>" + (desde + 1) + "&ndash;" + Math.min(hasta, vistas_.length) + "</b> de <b>" +
        vistas_.length + "</b> " + conf.unaOVarias + (filtrada ? " · hay " + filas.length + " en total" : "")
      : "Ninguna " + conf.una + " cumple el filtro";
    var h = '<button class="dt__pag dt__pag--n" type="button" data-pag="-1" aria-label="Página anterior"' +
            (vista.pag === 1 ? " disabled" : "") + ">&lsaquo;</button>";
    for (var n = 1; n <= paginas; n++) {
      h += '<button class="dt__pag' + (n === vista.pag ? ' is-on" aria-current="page"' : '"') +
           ' type="button" data-pag="' + n + '">' + n + "</button>";
    }
    h += '<button class="dt__pag dt__pag--n" type="button" data-pag="+1" aria-label="Página siguiente"' +
         (vista.pag === paginas ? " disabled" : "") + ">&rsaquo;</button>";
    pieza(dt, "pag").innerHTML = h;

    // La columna por la que se ordena
    todos("thead th[data-k]", dt).forEach(function (th) {
      var on = th.getAttribute("data-k") === vista.orden;
      th.classList.toggle("is-on", on);
      if (on) th.setAttribute("aria-sort", vista.dir > 0 ? "ascending" : "descending");
      else th.removeAttribute("aria-sort");
      uno(".dt__ind", th).textContent = on ? (vista.dir > 0 ? "▲" : "▼") : "⇅";
    });

    pintarFiltros(dt, conf, vista);
    conf.contar(filas);
  }

  function textoFiltro(k, v, conf) {
    if (k === "estado") return conf.nombres[v] || v;
    if (k === "valorMin" || k === "valorMax") return pesos(numero(v));
    if (k === "desde" || k === "hasta") return fechaCorta(new Date(v + "T00:00"));
    return v.trim();
  }

  /* Las fichas de lo que filtra, el número del botón Filtros y las tarjetas marcadas */
  function pintarFiltros(dt, conf, vista) {
    var puestos = Object.keys(vista.f).filter(function (k) { return String(vista.f[k]).trim(); });
    pieza(dt, "fichas").innerHTML = puestos.map(function (k) {
      var nombre = conf.nombreFiltro[k];
      return '<span class="fil__chip">' + nombre + "<b>" + esc(textoFiltro(k, vista.f[k], conf)) + "</b>" +
             '<button type="button" data-quitar="' + k + '" title="Quitar el filtro de ' + nombre +
             '" aria-label="Quitar el filtro de ' + nombre + '">&times;</button></span>';
    }).join("");
    var n = uno(".fil__n", dt);
    n.textContent = puestos.length;
    n.hidden = !puestos.length;
    pieza(dt, "nfil").textContent = puestos.length
      ? cuantas(puestos.length, "filtro puesto", "filtros puestos") : "Sin filtros puestos";
    // La caja de filtros dice lo mismo que las fichas y las tarjetas
    todos("[data-f]", dt).forEach(function (campo) {
      var v = vista.f[campo.getAttribute("data-f")] || "";
      if (campo.value !== v) campo.value = v;
    });
    todos(".kpi--btn[data-grupo]").forEach(function (b) {
      var on = vista.f.estado === b.getAttribute("data-grupo");
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function ponerKpi(clave, n, detalle) {
    var k = uno('[data-kpi="' + clave + '"]') || uno('[data-grupo="' + clave + '"]');
    if (!k) return;
    uno(".kpi__n", k).textContent = miles(n);
    uno(".kpi__s", k).textContent = detalle;
  }

  /* El número de la pestaña en el menú lateral */
  function ponerEnMenu(archivo, n) {
    todos(".nav__si").forEach(function (a) {
      var ct = a.getAttribute("href") === archivo ? uno(".ct", a) : null;
      if (ct) ct.textContent = n;
    });
  }

  /* Al abrir una tabla: si es la primera vez, todo como viene en el HTML; si
     entró algo nuevo (una cotización o una factura recién hecha), se ve arriba,
     sin filtros y de la más nueva a la más vieja */
  function iniciarTabla(id) {
    var dt = uno("#" + id), conf = TABLAS[id];
    if (!dt.getAttribute("data-listo")) {
      dt.setAttribute("data-listo", "1");
      vistas[id] = vistaNueva();
    }
    var vista = vistaDe(id);
    if (conf.alEntrar(dt, uno("tbody", dt))) {
      vistas[id] = vista = vistaNueva(vista.tam);
      pieza(dt, "q").value = "";
    }
    pieza(dt, "tam").value = String(vista.tam);
    pintarLista(dt);
  }

  function ponerFiltro(dt, campo) {
    var vista = vistaDe(dt.id);
    vista.f[campo.getAttribute("data-f")] = campo.value;
    vista.pag = 1;
    pintarLista(dt);
  }

  document.addEventListener("input", function (e) {
    var t = e.target, dt = tablaDeEvento(t);
    if (!dt) return;
    if (t.id === dt.id + "-q") {
      var vista = vistaDe(dt.id);
      vista.q = sinTildes(t.value.trim());
      vista.pag = 1;
      pintarLista(dt);
    } else if (t.tagName === "INPUT" && t.hasAttribute("data-f")) {
      ponerFiltro(dt, t);
    }
  });

  document.addEventListener("change", function (e) {
    var t = e.target, dt = tablaDeEvento(t);
    if (!dt) return;
    if (t.tagName === "SELECT" && t.hasAttribute("data-f")) ponerFiltro(dt, t);
    if (t.id === dt.id + "-tam") {
      var vista = vistaDe(dt.id);
      vista.tam = numero(t.value) || 10;
      vista.pag = 1;
      pintarLista(dt);
    }
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    // La caja de filtros se cierra al pulsar fuera de ella
    todos("details.fil[open]").forEach(function (d) { if (!d.contains(e.target)) d.open = false; });

    var kpi = e.target.closest(".kpi--btn[data-grupo]");
    if (kpi) {                                   // un clic pone el filtro y otro lo quita
      var suya = tablaVisible();
      if (!suya) return;
      var v0 = vistaDe(suya.id), g = kpi.getAttribute("data-grupo");
      v0.f.estado = v0.f.estado === g ? "" : g;
      v0.pag = 1;
      return pintarLista(suya);
    }
    var dt = tablaDeEvento(e.target);
    if (!dt) return;
    var vista = vistaDe(dt.id);

    var orden = e.target.closest("th[data-k] .dt__orden");
    if (orden) {
      var k = orden.parentNode.getAttribute("data-k");
      if (vista.orden === k) vista.dir = -vista.dir;
      else {
        vista.orden = k;
        vista.dir = (k === "fecha" || k === "valor" || k === "pares") ? -1 : 1;   // lo más nuevo o lo más grande primero
      }
      vista.pag = 1;
      return pintarLista(dt);
    }
    var pag = e.target.closest("[data-pag]");
    if (pag) {
      var v = pag.getAttribute("data-pag");
      vista.pag = v === "-1" ? vista.pag - 1 : v === "+1" ? vista.pag + 1 : numero(v);
      return pintarLista(dt);
    }
    var quitar = e.target.closest("[data-quitar]");
    if (quitar) {
      var q = quitar.getAttribute("data-quitar");
      if (q === "todos") vista.f = {};
      else delete vista.f[q];
      vista.pag = 1;
      return pintarLista(dt);
    }
    var boton = e.target.closest(".dt__b");
    if (boton) aviso(boton.textContent.trim() + ": disponible cuando el módulo esté programado.", "warn");
  });

  /* ---- La tabla de Cotizaciones ---- */

  TABLAS["dt-cot"] = {
    codigo: "Cotización", una: "cotización", plural: "cotizaciones", unaOVarias: "cotización(es)",
    estados: ESTADOS, nombres: NOMBRE_ESTADO, nombreFiltro: NOMBRE_FILTRO_COT,
    filtros: {
      codigo: contiene("Cotización"),
      cliente: contiene("Cliente"),
      vendedor: function (tr, v) { return vendedorDe(tr) === v; }
    },
    claves: { vendedor: function (tr) { return sinTildes(vendedorDe(tr)); } },
    columnas: { cliente: "Cliente", factura: "Factura" },
    buscar: function (tr) { return tr.textContent + " " + celda(tr, "Cliente").title + " " + vendedorDe(tr); },
    contar: contarCotizaciones,
    alEntrar: entrarACotizaciones
  };

  /* Las tarjetas cuentan TODAS las cotizaciones, no solo las filtradas */
  function contarCotizaciones(filas) {
    function de(estado) {
      return filas.filter(function (tr) { return tr.getAttribute("data-estado") === estado; });
    }
    function valor(lista) { return lista.reduce(function (s, tr) { return s + valorDe(tr); }, 0); }
    var total = valor(filas);
    var porFacturar = de("porfacturar"), facturadas = de("facturada"), vencidas = de("vencida");
    var pares = filas.reduce(function (s, tr) { return s + numero(tr.getAttribute("data-pares")); }, 0);
    ponerKpi("todas", filas.length, miles(pares) + " pares cotizados");
    ponerKpi("porfacturar", porFacturar.length, pesos(valor(porFacturar)));
    ponerKpi("facturada", facturadas.length, pesos(valor(facturadas)) + " · " +
             (total ? Math.round(100 * valor(facturadas) / total) : 0) + " %");
    ponerKpi("vencida", vencidas.length, pesos(valor(vencidas)));
    ponerEnMenu(LISTA, porFacturar.length);
  }

  /* La fila de una cotización recién creada, igual a las que trae el HTML */
  function filaCotizacion(c) {
    return '<tr class="es-nueva" data-estado="' + c.estado + '" data-fecha="' + fechaIso(c.fecha) +
      '" data-vence="' + fechaIso(c.vence) + '" data-pares="' + c.pares + '" data-valor="' + c.valor + '">' +
      '<td data-l="Cotización"><button class="dt__ver" type="button" title="Ver el detalle">' + c.numero + "</button></td>" +
      '<td class="dt__fec" data-l="Fecha">' + fechaCorta(c.fecha) + "</td>" +
      '<td class="dt__cli" data-l="Cliente" title="' + esc(c.cliente.nombre) + " · NIT " + c.cliente.nit + '">' +
        esc(c.cliente.nombre) + "</td>" +
      '<td data-l="Vendedor" title="' + esc(c.vendedor) + '">' + esc(nombreCorto(c.vendedor)) + "</td>" +
      '<td class="num" data-l="Pares">' + miles(c.pares) + "</td>" +
      '<td class="num" data-l="Valor">' + pesos(c.valor) + "</td>" +
      '<td class="dt__fec" data-l="Vence" title="Vence el ' + fechaLarga(c.vence) + '">en ' + VIGENCIA + " días</td>" +
      '<td data-l="Factura"><span class="dt__sinf">—</span></td>' +
      '<td data-l="Estado"><span class="pill pill--' + TONO_ESTADO[c.estado] + '">' + nombreEstado(c.estado) + "</span></td></tr>";
  }

  /* Lo que cambió en otra pantalla (una cotización que se facturó en
     Facturación) se ve también en su fila: el estado, la factura y el Vence */
  function ponerEstadoCot(tr, h) {
    tr.setAttribute("data-estado", h.estado);
    ponerCelda(tr, "Estado", '<span class="pill pill--' + TONO_ESTADO[h.estado] + '">' + nombreEstado(h.estado) + "</span>");
    if (h.factura) ponerCelda(tr, "Factura", '<span class="chip chip--oliva">' + h.factura + "</span>");
    if (h.estado === "facturada" || h.estado === "vencida") {
      ponerCelda(tr, "Vence", '<span class="dt__sinf">—</span>');
      tr.classList.remove("dt__tarde");
    }
  }

  function entrarACotizaciones(dt, cuerpo) {
    todos("tr[data-estado]", cuerpo).forEach(function (tr) {
      var h = HISTORIAL[textoDe(tr, "Cotización")];
      if (h && h.estado !== tr.getAttribute("data-estado")) ponerEstadoCot(tr, h);
    });
    var hubo = cotNuevas.length > 0;
    if (hubo) {
      todos("tr.es-nueva", cuerpo).forEach(function (tr) { tr.classList.remove("es-nueva"); });
      while (cotNuevas.length) cuerpo.insertAdjacentHTML("afterbegin", filaCotizacion(cotNuevas.shift()));
    }
    todos("tr[data-estado]", cuerpo).forEach(function (tr) {
      ultimaCot = Math.max(ultimaCot, cola(textoDe(tr, "Cotización")));
    });
    return hubo;
  }

  /* ---------------------------------------------------------------- 10. Nueva cotización

     09-cotizacion-nueva.html. La fecha, la vigencia y el vendedor los pone el
     sistema; el vendedor busca y elige el cliente (sale su ficha completa) y con
     "Cotizar" la cotización toma su número, queda En elaboración y se abre la
     ventana para elegir los productos.
     Todo lo de la cotización vive en el objeto "cot", y las tablas y los totales
     se vuelven a dibujar desde él cada vez que algo cambia (en React, cot sería
     un useState). */

  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
               "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  /* Salen de Config. (08-config.html) */
  var VIGENCIA = 15;        // días que vale una cotización
  var DESCUENTO_MAX = 8;    // % de descuento que se da sin autorización
  var CUPO_AVISO = 85;      // % del cupo en el que se avisa "cupo casi lleno"

  /* Quien entró al sistema. Sin inicio de sesión no se puede saber solo */
  var VENDEDOR = { nombre: "Valentina Rojas", codigo: "VEN-03", zona: "Cúcuta" };

  /* Los clientes de 04-clientes.html, con todo lo que se sabe de cada uno.
     "vencidas" son sus facturas que ya pasaron la fecha de pago y no están pagas */
  var CLIENTES = [
    { codigo: "CL-001", nombre: "Calzado El Dorado", nit: "830.112.991-1", desde: 2023, ciudad: "Bogotá",
      direccion: "Cra. 13 # 63-40", barrio: "Chapinero", contacto: "Luis Gómez · compras", telefono: "310 245 8871",
      correo: "compras@calzadoeldorado.com.co", pago: "Crédito 30 días",
      cupo: 12000000, saldo: 4800000,
      vencidas: [] },
    { codigo: "CL-002", nombre: "Distribuidora Tamanaco", nit: "900.221.334-7", desde: 2021, ciudad: "Cúcuta",
      direccion: "Av. 0 # 11-52", barrio: "Centro", contacto: "Carmen Pabón · gerente", telefono: "315 882 1043",
      correo: "pedidos@tamanaco.com.co", pago: "Crédito 60 días",
      cupo: 9000000, saldo: 8600000,
      vencidas: [{ factura: "FV-2026-0098", vence: "2026-09-12", total: 2150000 }] },
    { codigo: "CL-003", nombre: "Calzado Norte", nit: "830.112.998-4", desde: 2022, ciudad: "Bogotá",
      direccion: "Calle 80 # 24-15", barrio: "Las Ferias", contacto: "Jorge Ramírez · compras", telefono: "301 554 2290",
      correo: "compras@calzadonorte.com.co", pago: "Crédito 30 días",
      cupo: 15000000, saldo: 3300000,
      vencidas: [] },
    { codigo: "CL-004", nombre: "Almacén La Bota Fina", nit: "901.455.210-2", desde: 2024, ciudad: "Bucaramanga",
      direccion: "Cra. 15 # 34-21", barrio: "Centro", contacto: "Diana Serrano · propietaria", telefono: "317 640 3318",
      correo: "ventas@labotafina.com.co", pago: "Contado",
      cupo: 6000000, saldo: 0,
      vencidas: [] },
    { codigo: "CL-005", nombre: "Comercial Los Andes", nit: "890.332.117-9", desde: 2019, ciudad: "Bucaramanga",
      direccion: "Calle 36 # 19-40", barrio: "Cabecera del Llano", contacto: "Óscar Villamizar · compras", telefono: "312 908 4476",
      correo: "compras@comerciallosandes.com.co", pago: "Crédito 60 días",
      cupo: 18000000, saldo: 15900000,
      vencidas: [{ factura: "FV-2026-0091", vence: "2026-09-04", total: 3480000 },
                 { factura: "FV-2026-0104", vence: "2026-09-22", total: 1920000 }] },
    { codigo: "CL-006", nombre: "Almacén Sur", nit: "901.778.043-5", desde: 2025, ciudad: "Bucaramanga",
      direccion: "Cra. 21 # 45-08", barrio: "La Concordia", contacto: "Paola Rueda · administradora", telefono: "318 221 7765",
      correo: "compras@almacensur.com.co", pago: "Crédito 30 días",
      cupo: 7000000, saldo: 2480000,
      vencidas: [] },
    { codigo: "CL-007", nombre: "Comercializadora Pamplona", nit: "900.664.812-3", desde: 2022, ciudad: "Pamplona",
      direccion: "Calle 6 # 5-33", barrio: "El Carmen", contacto: "Hernán Jaimes · gerente", telefono: "314 776 0091",
      correo: "gerencia@comercializadorapamplona.com.co", pago: "Crédito 30 días",
      cupo: 5000000, saldo: 5200000,
      vencidas: [{ factura: "FV-2026-0076", vence: "2026-07-20", total: 1640000 },
                 { factura: "FV-2026-0089", vence: "2026-08-01", total: 2310000 },
                 { factura: "FV-2026-0101", vence: "2026-08-19", total: 1250000 }] },
    { codigo: "CL-008", nombre: "Calzado del Oriente", nit: "901.220.556-8", desde: 2024, ciudad: "Ocaña",
      direccion: "Calle 11 # 13-60", barrio: "Centro", contacto: "Yolanda Quintero · propietaria", telefono: "316 430 5582",
      correo: "ventas@calzadodeloriente.com.co", pago: "Contado",
      cupo: 4000000, saldo: 0,
      vencidas: [] }
  ];

  /* Los modelos de Diseño (02-diseno) con el precio de lista de Comercial y los
     pares que Inventario le asignó al vendedor: un número por talla, en el orden
     de "tallas". Los que no están aprobados salen en la búsqueda, pero no se
     pueden cotizar. "desc" es un descuento que ya trae el producto. */
  var PRODUCTOS = [
    { ref: "REF-1042", nombre: "Bota Andina", forma: "bota", coleccion: "Otoño 2026", precio: 68500, iva: 19, desc: 0,
      tallas: [35, 36, 37, 38, 39, 40],
      colores: { "Negro": [4, 8, 12, 10, 6, 2], "Café": [2, 5, 7, 6, 3, 0], "Miel": [0, 3, 5, 4, 2, 1] } },
    { ref: "REF-1043", nombre: "Mocasín Cúcuta", forma: "mocasin", coleccion: "Otoño 2026", precio: 64000, iva: 19, desc: 5,
      tallas: [38, 39, 40, 41, 42, 43],
      colores: { "Café": [3, 6, 8, 7, 4, 1], "Miel": [2, 4, 5, 4, 2, 0], "Negro": [0, 2, 3, 3, 1, 0] } },
    { ref: "REF-1044", nombre: "Zapato Colegial Reforzado", forma: "colegial", coleccion: "Otoño 2026", precio: 65000, iva: 0, desc: 0,
      tallas: [34, 35, 36, 37, 38, 39],
      colores: { "Negro": [10, 14, 16, 12, 8, 4], "Café": [0, 4, 6, 4, 2, 0] } },
    { ref: "REF-1045", nombre: "Sandalia Verano", forma: "sandalia", bloqueo: "en diseño: todavía no se puede cotizar" },
    { ref: "REF-1046", nombre: "Botín Casual Cuero", forma: "bota", bloqueo: "la versión 2 espera la aprobación de Diseño" },
    { ref: "REF-0987", nombre: "Botín Clásico", forma: "bota", bloqueo: "descontinuado" }
  ];

  /* Los íconos que dibuja esta sección (los mismos de comun/iconos.svg) */
  var TRAZO = {
    cerrar: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    atras: '<path d="m15 18-6-6 6-6"/>',
    adelante: '<path d="m9 18 6-6-6-6"/>',
    lupa: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>',
    alerta: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    visto: '<path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"/><path d="m9 11 3 3L22 4"/>',
    lapiz: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>' +
           '<path d="m15 5 4 4"/>',
    papelera: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>' +
              '<path d="M10 11v6"/><path d="M14 11v6"/>',
    zapato: '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/>' +
            '<path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/>' +
            '<path d="M16 17h4"/><path d="M4 13h4"/>'
  };
  function icono(nombre, tam) {
    return '<svg class="ico" width="' + tam + '" height="' + tam + '" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
           ' stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + TRAZO[nombre] + "</svg>";
  }

  function dos(n) { return (n < 10 ? "0" : "") + n; }
  /* 23-septiembre-2026: el formato que pidió Ventas */
  function fechaLarga(d) { return dos(d.getDate()) + "-" + MESES[d.getMonth()] + "-" + d.getFullYear(); }
  /* 23-sep-2026: el mismo, corto, para las tablas */
  function fechaCorta(d) { return dos(d.getDate()) + "-" + MESES[d.getMonth()].slice(0, 3) + "-" + d.getFullYear(); }
  function fechaIso(d) { return d.getFullYear() + "-" + dos(d.getMonth() + 1) + "-" + dos(d.getDate()); }
  function sumarDias(d, n) {
    var otra = new Date(d.getTime());
    otra.setDate(otra.getDate() + n);
    return otra;
  }

  var cot = null;   // la cotización que se está armando

  function clientePor(codigo) { return CLIENTES.filter(function (c) { return c.codigo === codigo; })[0]; }
  function productoPor(ref) { return PRODUCTOS.filter(function (p) { return p.ref === ref; })[0]; }
  /* "Calzado El Dorado" → CD: la primera letra de la primera y de la última palabra */
  function iniciales(nombre) {
    var p = nombre.split(/\s+/);
    return (p[0].charAt(0) + p[p.length - 1].charAt(0)).toUpperCase();
  }
  function estadoCliente(c) {
    if (c.saldo > c.cupo) return { texto: "Cupo excedido", tono: "crit" };
    if (c.saldo >= c.cupo * CUPO_AVISO / 100) return { texto: "Cupo casi lleno", tono: "warn" };
    return { texto: "Al día", tono: "ok" };
  }
  /* El estado que más pesa, para la lista del buscador: primero las facturas vencidas */
  function estadoPrincipal(c) {
    return c.vencidas.length ? { texto: cuantas(c.vencidas.length, "factura vencida", "facturas vencidas"), tono: "crit" }
                             : estadoCliente(c);
  }
  /* Las facturas vencidas, con los días que lleva cada una sin pagarse */
  function vencidasDe(c) {
    var hoy = new Date();
    return c.vencidas.map(function (v) {
      var dia = new Date(v.vence + "T00:00");
      return { factura: v.factura, vence: dia, dias: Math.floor((hoy - dia) / 86400000), total: v.total };
    });
  }
  function totalVencido(c) { return c.vencidas.reduce(function (s, v) { return s + v.total; }, 0); }
  function entero(v) {
    var n = parseInt(v, 10);
    return isNaN(n) ? 0 : n;
  }
  function kv(nombre, valor, detalle) {
    return '<div class="kv"><span>' + nombre + (detalle ? ' <span class="tiny">' + detalle + "</span>" : "") +
           "</span><b>" + valor + "</b></div>";
  }
  function avisoHtml(tono, titulo, texto) {
    return '<div class="aviso aviso--' + tono + '">' + icono(tono === "ok" ? "visto" : "alerta", 20) +
           "<div><b>" + titulo + "</b><p>" + texto + "</p></div></div>";
  }

  /* Busca por cualquier pedazo del texto, sin tildes, y con el NIT o la
     referencia escritos con puntos y guiones o sin ellos: "830112", "ref1042" */
  function buscarEn(lista, q, texto) {
    q = sinTildes(q.trim());
    var pegado = q.replace(/[.\-\s]/g, "");
    return lista.filter(function (x) {
      var t = sinTildes(texto(x));
      return t.indexOf(q) >= 0 || (pegado && t.replace(/[.\-\s]/g, "").indexOf(pegado) >= 0);
    });
  }

  function verResultados(caja, ver) {
    caja.hidden = !ver;
    var campo = uno('[aria-controls="' + caja.id + '"]');
    if (campo) campo.setAttribute("aria-expanded", ver ? "true" : "false");
  }

  function pintarClientes() {
    var caja = uno("#cot-cli-res");
    var lista = buscarEn(CLIENTES, uno("#cot-cli-q").value, function (c) {
      return c.nombre + " " + c.nit + " " + c.codigo + " " + c.ciudad;
    });
    caja.innerHTML = lista.length ? lista.map(function (c, i) {
      var e = estadoPrincipal(c);
      return '<button type="button" class="cot-res__i' + (i === 0 ? " is-on" : "") + '" role="option" data-cli="' + c.codigo + '">' +
        '<span class="avatar avatar--sm" aria-hidden="true">' + iniciales(c.nombre) + "</span>" +
        '<span class="cot-res__x"><b>' + c.nombre + "</b><small>NIT " + c.nit + " · " + c.codigo + " · " + c.ciudad + "</small></span>" +
        '<span class="pill pill--' + e.tono + '">' + e.texto + "</span></button>";
    }).join("") : '<p class="cot-res__vacio">Ningún cliente tiene ese nombre, NIT o cédula. Si es nuevo, ' +
                  'regístrelo primero en <a href="04-clientes.html">Clientes</a>.</p>';
    verResultados(caja, true);
  }

  /* Todos los pares asignados de un producto, en todos sus colores y tallas */
  function asignado(p) {
    return Object.keys(p.colores).reduce(function (s, color) {
      return s + p.colores[color].reduce(function (a, n) { return a + n; }, 0);
    }, 0);
  }
  function disponible(p, color, talla) { return p.colores[color][p.tallas.indexOf(talla)] || 0; }

  /* Los totales de una cotización: la que se está armando (cot) o, en el
     detalle, una de la lista. Se suman modelo por modelo (resumenDe) */
  function totales(q) {
    q = q || cot;
    var t = { renglones: q.lineas.length, pares: 0, bruto: 0, descuento: 0, iva: 0, total: 0,
              sinIva: 0, porIva: {}, faltan: 0, descAlto: 0, sinCant: 0 };
    refsEnCotizacion(q).forEach(function (ref) {
      var r = resumenDe(ref, q);
      t.pares += r.pares;
      t.bruto += r.bruto;
      t.descuento += r.descuento;
      t.iva += r.iva;
      t.total += r.total;
      if (r.p.iva) {
        var x = t.porIva[r.p.iva] = t.porIva[r.p.iva] || { base: 0, iva: 0 };
        x.base += r.base;
        x.iva += r.iva;
      } else {
        t.sinIva += r.base;
      }
    });
    q.lineas.forEach(function (l) {
      if (l.cant > disponible(productoPor(l.ref), l.color, l.talla)) t.faltan++;
      if (l.desc > DESCUENTO_MAX) t.descAlto++;
      if (l.cant < 1) t.sinCant++;
    });
    return t;
  }

  function iniciarNueva() {
    var form = uno("#cot-form");
    if (form.getAttribute("data-listo")) return;   // volvió a una que dejó a medias
    form.setAttribute("data-listo", "1");
    var dia = new Date();
    cot = { numero: "", estado: "nueva", cliente: null, lineas: [], descuentos: {}, fecha: dia, verFicha: false };
    reiniciarVitrina();
    uno("#cot-fecha").textContent = fechaLarga(dia);
    uno("#cot-dia").textContent = DIAS[dia.getDay()] + " · la pone el sistema";
    uno("#cot-vence").textContent = fechaLarga(sumarDias(dia, VIGENCIA));
    uno("#cot-vendedor").textContent = VENDEDOR.nombre;
    uno("#cot-cli-q").value = "";
    uno("#cot-obs").value = "";
    pintarCotizacion();
  }

  /* Todo lo que depende de cot: número, estado, pasos, ficha, productos y botones */
  function pintarCotizacion() {
    var t = totales(), nueva = cot.estado === "nueva";
    var num = uno("#cot-num");
    num.textContent = cot.numero || "Se asigna al cotizar";
    num.classList.toggle("cot-dato--vacio", !cot.numero);
    var estado = uno("#cot-estado");
    estado.className = "pill pill--" + (nueva ? "off" : "warn");
    estado.textContent = nueva ? "Sin guardar" : "En elaboración";
    // Los pasos: 1 elegir el cliente, 2 poner los productos, 3 enviarla
    var paso = nueva ? 1 : (t.renglones ? 3 : 2);
    todos(".cot-cab .step").forEach(function (s, i) {
      s.classList.toggle("done", i + 1 < paso);
      s.classList.toggle("now", i + 1 === paso);
    });
    pintarFicha();
    uno("#cot-productos").hidden = nueva;
    pintarLineas(t);
    var cotizar = uno('[data-cot="cotizar"]');
    cotizar.hidden = !nueva;
    cotizar.disabled = !cot.cliente;
    var borrador = uno('[data-cot="borrador"]');
    borrador.hidden = nueva;
    borrador.disabled = !cot.cliente || !t.renglones;
    var enviar = uno('[data-cot="enviar"]');
    enviar.hidden = nueva;
    enviar.disabled = !cot.cliente || !t.renglones || t.sinCant > 0 || t.descAlto > 0;
    uno("#cot-msg").textContent = mensaje(t);
  }

  function mensaje(t) {
    if (!cot.cliente) return "Seleccione un cliente para poder cotizar.";
    if (cot.estado === "nueva") return "Todo listo: al cotizar, la cotización toma su número y se abre la lista de productos.";
    if (!t.renglones) return "Agregue al menos un producto para poder enviarla.";
    if (t.sinCant) return "Hay renglones sin cantidad: escríbala o quite el renglón.";
    if (t.descAlto) return "Hay descuentos de más del " + DESCUENTO_MAX + " %: guárdela como borrador hasta que el jefe comercial los autorice.";
    return "Revise los totales y envíela a Facturación (al cliente le llega el PDF), o guárdela como borrador para seguir después.";
  }

  function seccion(titulo, contenido) {
    return '<section class="cot-ficha__s"><h4>' + titulo + "</h4>" + contenido + "</section>";
  }

  /* La ficha: todo lo que se sabe del cliente elegido */
  function pintarFicha() {
    var c = cot.cliente, ficha = uno("#cot-ficha");
    // Al cotizar, la ficha se resume en una línea para dejarle el alto a los productos
    var resumida = !!c && cot.estado !== "nueva";
    uno("#cot-cli-mini").hidden = !resumida;
    if (!resumida) uno("#cot-cli-mini").innerHTML = "";
    uno("#cot-cliente .cot-busca").hidden = resumida;
    uno("#cot-cliente .cot-barra__ayuda").hidden = resumida;
    uno("#cot-cli-cuerpo").hidden = resumida && !cot.verFicha;
    ficha.classList.toggle("sin-cab", resumida);
    uno("#cot-ficha-vacia").hidden = !!c;
    ficha.hidden = !c;
    if (!c) return;
    var e = estadoCliente(c), n = c.vencidas.length;
    var libre = Math.max(0, c.cupo - c.saldo);
    var uso = Math.min(100, Math.round(100 * c.saldo / c.cupo));
    // Arriba, lo que más pesa: si tiene facturas vencidas no está "Al día", aunque le quede cupo
    var estados = (n ? '<span class="pill pill--crit">' + cuantas(n, "factura vencida", "facturas vencidas") + "</span>" : "") +
                  (!n || e.tono !== "ok" ? '<span class="pill pill--' + e.tono + '">' + e.texto + "</span>" : "");
    var alerta = "";
    if (e.tono === "crit") {
      alerta = avisoHtml("crit", "Cupo excedido", "Debe " + pesos(c.saldo) + " con un cupo de " + pesos(c.cupo) +
                         ". Se le puede cotizar, pero Facturación la retiene hasta que pague.");
    } else if (e.tono === "warn") {
      alerta = avisoHtml("warn", "Cupo casi lleno", "Le quedan " + pesos(libre) +
                         " de cupo. Si la cotización pasa de ahí, Facturación la retiene hasta que pague.");
    }
    ficha.innerHTML =
      '<div class="cot-ficha__cab">' +
        '<div class="who"><span class="avatar" aria-hidden="true">' + iniciales(c.nombre) + "</span>" +
          "<div><b>" + c.nombre + "</b><small>NIT " + c.nit + " · " + c.codigo + " · cliente desde " + c.desde + "</small></div></div>" +
        '<span class="cot-ficha__estados">' + estados + "</span>" +
        '<button class="btn btn--sm btn--ghost" type="button" data-cot="cambiar-cliente">Cambiar cliente</button>' +
      "</div>" +
      '<div class="cot-ficha__g">' +
        seccion("Contacto", kv("Persona", c.contacto) + kv("Teléfono", c.telefono) + kv("Correo", c.correo.replace("@", "@<wbr>"))) +
        seccion("Entrega", kv("Dirección", c.direccion) + kv("Barrio", c.barrio) + kv("Ciudad", c.ciudad)) +
        seccion("Crédito", kv("Forma de pago", c.pago) + kv("Cupo", pesos(c.cupo)) + kv("Debe hoy", pesos(c.saldo)) +
                           kv("Disponible", pesos(libre)) +
                           '<div class="bar' + (e.tono === "ok" ? " bar--ok" : e.tono === "crit" ? " bar--crit" : "") +
                           '"><i style="width:' + uso + '%"></i></div>' +
                           '<span class="tiny">Usa el ' + uso + " % del cupo</span>" +
                           kv("Facturas vencidas", n ? '<span class="cot-mal">' + n + " · " + pesos(totalVencido(c)) + "</span>"
                                                     : '<span class="cot-bien">Ninguna</span>')) +
      "</div>" + vencidasHtml(c) + alerta;
    if (resumida) {
      uno("#cot-cli-mini").innerHTML =
        '<span class="avatar avatar--sm" aria-hidden="true">' + iniciales(c.nombre) + "</span>" +
        '<div class="cot-cli-mini__x"><div class="cot-cli-mini__n"><b>' + c.nombre + '</b><span class="cot-ficha__estados">' + estados + "</span></div>" +
          "<small>NIT " + c.nit + " · " + c.ciudad + " · " + c.pago + " · disponible " + pesos(libre) + "</small></div>" +
        '<button class="btn btn--sm btn--ghost" type="button" data-cot="ver-ficha" aria-expanded="' + !!cot.verFicha + '" aria-controls="cot-cli-cuerpo">' +
          (cot.verFicha ? "Ocultar ficha" : "Ver ficha completa") + "</button>" +
        '<button class="btn btn--sm btn--ghost" type="button" data-cot="cambiar-cliente">Cambiar cliente</button>';
    }
  }

  /* Cuáles facturas vencieron, cuándo, hace cuánto y por cuánto. Con una sola
     vencida, en Facturación no se le podrá facturar hasta que pague */
  function vencidasHtml(c) {
    var vs = vencidasDe(c);
    if (!vs.length) return "";
    return '<div class="cot-vencidas">' +
      '<div class="cot-vencidas__cab">' + icono("alerta", 20) +
        "<div><b>" + cuantas(vs.length, "factura vencida", "facturas vencidas") + " por " + pesos(totalVencido(c)) + "</b>" +
        "<p>Se le puede cotizar, pero no se le podrá facturar hasta que las pague.</p></div></div>" +
      '<table class="cot-vencidas__t"><thead><tr><th>Factura</th><th>Venció el</th><th class="num">Hace</th><th class="num">Total</th></tr></thead><tbody>' +
      vs.map(function (v) {
        return '<tr><td data-l="Factura"><b>' + v.factura + '</b></td><td data-l="Venció el">' + fechaLarga(v.vence) + "</td>" +
          '<td class="num" data-l="Hace">' + cuantas(v.dias, "día", "días") + '</td><td class="num" data-l="Total">' + pesos(v.total) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  /* La lista de la pantalla, como el carrito: un bloque por modelo con sus colores
     y tallas, su desglose y su total. La lista se desplaza sola; el resumen de la
     derecha (totales, observaciones y avisos) queda siempre a la vista. */
  function pintarLineas(t) {
    var refs = refsEnCotizacion();
    uno("#cot-prod-sub").textContent = t.renglones
      ? cuantas(refs.length, "modelo", "modelos") + " · " + cuantas(t.pares, "par", "pares")
      : "Todavía no hay productos: agréguelos con el botón de la derecha";
    uno("#cot-lineas").innerHTML = refs.length ? refs.map(function (ref) { return itemCotizacionHtml(ref); }).join("")
      : '<div class="cot-vacio">' + icono("zapato", 30) + "<b>Todavía no hay productos en esta cotización</b>" +
        "<p>Abra el catálogo para elegir el modelo, el color y los pares de cada talla.</p>" +
        '<button class="btn btn--sm" type="button" data-cot="abrir-productos">Agregar productos</button></div>';

    uno("#cot-tot").innerHTML = totalesHtml(t);
    uno("#cot-avisos").innerHTML = t.renglones ? avisosCotizacion(t) : "";
  }

  /* Subtotal, descuentos, el IVA de cada tarifa (y sobre cuánto), lo que no lleva IVA y el total */
  function totalesHtml(t) {
    var filas = kv("Subtotal", pesos(t.bruto), cuantas(t.pares, "par", "pares")) +
                kv("Descuentos", t.descuento ? "−" + pesos(t.descuento) : "$0");
    Object.keys(t.porIva).forEach(function (r) {
      filas += kv("IVA " + r + " %", pesos(t.porIva[r].iva), "sobre " + pesos(t.porIva[r].base));
    });
    if (t.sinIva) filas += kv("Productos sin IVA", pesos(t.sinIva));
    return filas + '<div class="kv kv--t"><span>Total</span><b>' + pesos(t.total) + "</b></div>";
  }

  /* Los botones de un modelo: Cambiar (lápiz, azul) y Quitar (papelera, rojo).
     El tooltip sale de data-tip; aria-label dice lo mismo con el nombre del modelo,
     para el lector de pantalla. "cambiar" y "quitar" son el atributo que usa cada
     lugar: la pantalla (data-cot-cambiar) o el carrito de la ventana (data-abrir) */
  function botonesModeloHtml(p, cambiar, quitar) {
    return '<span class="cot-item__acc">' +
      '<button type="button" class="cot-ico cot-ico--cambiar" ' + cambiar + '="' + p.ref + '" data-tip="Cambiar color, tallas o descuento"' +
        ' aria-label="Cambiar ' + p.nombre + ': color, tallas o descuento">' + icono("lapiz", 16) + "</button>" +
      '<button type="button" class="cot-ico cot-ico--quitar" ' + quitar + '="' + p.ref + '" data-tip="Quitar de la cotización"' +
        ' aria-label="Quitar ' + p.nombre + ' de la cotización">' + icono("papelera", 16) + "</button></span>";
  }

  /* Un modelo de la cotización: sus tallas por color, lo que vale cada par, el
     descuento y el IVA (en % y en pesos) y su total. En el detalle de la lista
     (soloLeer) va sin Cambiar ni Quitar y sin lo que falta en bodega, que cambia
     día a día */
  function itemCotizacionHtml(ref, q, soloLeer) {
    var r = resumenDe(ref, q), p = r.p;
    return '<article class="cot-item">' + foto(p, Object.keys(r.colores)[0], "sm") +
      '<div class="cot-item__x">' +
        '<div class="cot-item__cab"><div><b>' + p.nombre + '</b><span class="tiny">' + p.ref + " · " +
          cuantas(r.pares, "par", "pares") + "</span></div>" +
          '<div class="cot-item__der"><b class="cot-item__total">' + pesos(r.total) + "</b>" +
            (soloLeer ? "" : botonesModeloHtml(p, "data-cot-cambiar", "data-cot-quitar")) + "</div></div>" +
        Object.keys(r.colores).map(function (color) {
          return '<div class="cot-item__color"><i style="background:' + piel(color) + '"></i><span>' + color + "</span>" +
            '<span class="vit__chips">' + r.colores[color].map(function (l) {
              var falta = soloLeer ? 0 : l.cant - disponible(p, color, l.talla);
              return "<span" + (falta > 0 ? ' class="is-mal" title="Faltan ' + falta + " de la talla " + l.talla + '"' : "") + ">" +
                l.talla + "<b>×" + l.cant + "</b>" + (falta > 0 ? " · faltan " + falta : "") + "</span>";
            }).join("") + "</span></div>";
        }).join("") +
        '<div class="cot-item__pie"><span class="cot-item__desglose">' +
          miles(r.pares) + " × " + pesos(p.precio) + " = <b>" + pesos(r.bruto) + "</b>" +
          " · " + (r.desc ? "Descuento " + r.desc + " % <b>−" + pesos(r.descuento) + "</b>" : "Sin descuento") +
          " · " + (p.iva ? "IVA " + p.iva + " % <b>" + pesos(r.iva) + "</b>" : "Sin IVA") + "</span></div>" +
      "</div></article>";
  }

  /* Lo que el vendedor tiene que saber antes de enviarla */
  function avisosCotizacion(t) {
    var c = cot.cliente, h = "";
    if (c && c.vencidas.length) {
      h += avisoHtml("crit", "El cliente tiene " + cuantas(c.vencidas.length, "factura vencida", "facturas vencidas") +
                     " por " + pesos(totalVencido(c)), "Se puede enviar a Facturación, pero allá no se le podrá facturar hasta que las pague.");
    }
    if (c) {
      var libre = Math.max(0, c.cupo - c.saldo);
      if (c.pago === "Contado") {
        h += avisoHtml("ok", "Paga de contado", "No usa cupo de crédito.");
      } else if (c.saldo > c.cupo) {
        h += avisoHtml("crit", "El cliente tiene el cupo excedido", "Facturación la retiene hasta que pague lo que debe.");
      } else if (t.total > libre) {
        h += avisoHtml("warn", "Pasa del cupo disponible por " + pesos(t.total - libre),
                       "Le quedan " + pesos(libre) + " de cupo: Facturación la retiene hasta que pague.");
      } else {
        h += avisoHtml("ok", "Cabe en el cupo del cliente",
                       "Le quedan " + pesos(libre) + " de cupo y la cotización suma " + pesos(t.total) + ".");
      }
    }
    if (t.faltan) {
      h += avisoHtml("warn", cuantas(t.faltan, "talla pide", "tallas piden") + " más pares de los que tiene asignados",
                     "Salen en rojo en la lista. Se cotiza igual: Inventario reserva lo que haya y el resto se le pide a Producción.");
    }
    // El descuento va por modelo: el aviso dice cuáles modelos se pasan
    var altos = refsEnCotizacion().filter(function (ref) { return descDe(ref) > DESCUENTO_MAX; })
                                  .map(function (ref) { return productoPor(ref).nombre; });
    if (altos.length) {
      h += avisoHtml("crit", (altos.length === 1 ? altos[0] + " tiene" : altos.length + " modelos tienen") +
                     " más del " + DESCUENTO_MAX + " % de descuento",
                     (altos.length > 1 ? altos.join(", ") + ". " : "") +
                     "Así no se puede enviar: guárdela como borrador hasta que el jefe comercial lo autorice, o baje el descuento.");
    }
    return h;
  }

  /* ---- La ventana "Seleccionar productos": vitrina y carrito ----

     A la izquierda el catálogo, con el dibujo de cada modelo. Al abrir uno se
     llena en tres pasos, cada uno en su tarjeta: el color del cuero, los pares
     de cada talla y el descuento con el total. A la derecha, el carrito con lo
     que ya lleva la cotización.
     Lo que se escribe va directo a cot.lineas (un renglón por producto, color y
     talla); el carrito, la lista de la pantalla y los totales salen de ahí. */

  var vit;   // lo que recuerda la ventana: el modelo abierto, su color y el filtro del catálogo

  function reiniciarVitrina() {
    vit = { ref: null, color: null, foto: 0, q: "", solo: false };
  }
  reiniciarVitrina();

  /* El dibujo de cada forma de zapato. Toma el color del cuero de --piel;
     en el sistema de verdad aquí va la foto que sube Diseño */
  var SILUETAS = {
    bota: '<ellipse class="sombra" cx="62" cy="67.6" rx="52" ry="3.4"/>' +
          '<path class="piel" d="M19 7h27a3 3 0 0 1 3 3v24c0 4 3 6.5 9 8.3l33 9.4c10 2.9 17 6.3 17 11.3v1H13V52c0-5 3-9 3-16V10a3 3 0 0 1 3-3z"/>' +
          '<path class="brillo" d="M21 11h5v26c0 5-2 9-2 14h-4c0-6 1-9 1-14z"/>' +
          '<path class="suela" d="M11 62h100c1.9 0 3.2 1.4 3.2 3.2s-1.3 3.2-3.2 3.2H14c-1.8 0-3-1.3-3-3z"/>' +
          '<path class="suela" d="M12 56h19v7H12z"/>' +
          '<path class="costura" d="M18 13.5h29M55 44.5c15 4.2 33 9 50 15.5"/>',
    mocasin: '<ellipse class="sombra" cx="62" cy="67.6" rx="52" ry="3.4"/>' +
          '<path class="piel" d="M15 44c0-6 5-10 12-10h32c6 0 11 1.6 17 3.6l20 6.4c9 2.9 15 7.6 15 13.4V64H12V53c0-4 1-6.6 3-9z"/>' +
          '<path class="brillo" d="M20 40c3-2 6-2.6 10-2.6h10c-4 1-8 3-10 6H18z"/>' +
          '<path class="suela" d="M10 62h102c1.8 0 3 1.2 3 2.7s-1.2 2.7-3 2.7H13c-1.8 0-3-1.2-3-2.7z"/>' +
          '<path class="costura" d="M58 36.5c14 0 28 4 38 10.5M56 41c13 .3 25 3.4 35 8.5"/>' +
          '<path class="suela" d="M50 38.2h13v3.2H50z"/>',
    colegial: '<ellipse class="sombra" cx="62" cy="68" rx="52" ry="3.4"/>' +
          '<path class="piel" d="M15 42c0-6 5-10 12-10h22c6 0 11 1.8 17 3.9l27 8.7c10 3.2 17 7.9 17 13.4V64H12V51c0-4 1-6.4 3-9z"/>' +
          '<path class="brillo" d="M20 38c3-2 6-2.6 10-2.6h8c-4 1-7 3-9 6H18z"/>' +
          '<path class="suela" d="M10 61h103a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z"/>' +
          '<path class="costura" d="M49 34c7 3.5 13 7.5 19 11.5M89 45c9 3 16 7.5 18 13.5"/>' +
          '<path class="cordon" d="M53 35.5l9-2.6M56.5 39l9-2.6M60 42.5l9-2.6"/>',
    sandalia: '<ellipse class="sombra" cx="62" cy="67.6" rx="52" ry="3.4"/>' +
          '<path class="suela" d="M11 61h101a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3z"/>' +
          '<path class="piel" d="M12 57h98c2.5 0 4 1.6 4 4H9c0-2.4 1.2-4 3-4z"/>' +
          '<path class="tira" d="M30 58c3-13 14-19 26-16 7 1.7 13 6.8 16 16M80 58c3-8 12-11 21-7"/>'
  };

  function piel(color) { return "var(--cuero-" + (color ? sinTildes(color) : "gris") + ")"; }
  function foto(p, color, tam) {
    return '<span class="cot-foto cot-foto--' + tam + '" style="--piel: ' + piel(p.bloqueo ? "" : color) + '">' +
           '<svg viewBox="0 0 120 72" aria-hidden="true">' + SILUETAS[p.forma] + "</svg></span>";
  }
  /* ---- Las fotos del modelo: varios ángulos, como en una tienda en línea ----
     En el sistema de verdad son las fotos que Diseño sube de cada modelo
     (02-diseno, "Imágenes y planos"). Aquí son dibujos, uno por ángulo, que
     toman el color del cuero elegido. */

  var VISTAS = [
    { nombre: "De lado", dibujo: "lado" },
    { nombre: "Lado de adentro", dibujo: "lado", espejo: true },
    { nombre: "Desde arriba", dibujo: "arriba" },
    { nombre: "La suela", dibujo: "suela" },
    { nombre: "Detalle del cuero", dibujo: "detalle" }
  ];

  /* El contorno del zapato visto desde arriba (la punta a la derecha) */
  var CONTORNO = "M16 36c0-9 7-14 17-14 15 0 28-2 43-4 20-2 34 5 34 18s-14 20-34 18c-15-2-28-4-43-4-10 0-17-5-17-14z";
  var ARRIBA = {
    bota: '<ellipse class="adentro" cx="34" cy="36" rx="17" ry="11"/><ellipse class="cana" cx="34" cy="36" rx="19.5" ry="13.2"/>' +
          '<path class="costura" d="M58 23c20-3 38 1 44 13-6 12-24 16-44 13"/>',
    mocasin: '<ellipse class="adentro" cx="35" cy="36" rx="15" ry="9"/><path class="banda" d="M53 27h5v18h-5z"/>' +
          '<path class="costura" d="M62 26c14-3 32-1 38 10-6 11-24 13-38 10"/>',
    colegial: '<ellipse class="adentro" cx="33" cy="36" rx="14" ry="9"/><path class="banda" d="M46 29h14v14H46z"/>' +
          '<path class="cordon" d="M47 30l12 12M47 42l12-12"/><path class="costura" d="M92 22c10 3 15 8 15 14s-5 11-15 14"/>',
    sandalia: '<rect class="banda" x="39" y="21" width="6" height="30" rx="3"/><rect class="banda" x="69" y="18" width="6" height="36" rx="3"/>'
  };
  var SUELA = '<path class="suela" d="' + CONTORNO + '"/>' +
    '<path class="huella" d="M88 24h14M84 30h22M84 36h24M84 42h22M88 48h14M22 29h14M20 35h18M20 41h18M22 47h14M46 23v26"/>' +
    '<text class="marca" x="66" y="38.5">SICAF</text>';
  var DETALLE = '<rect class="piel" x="8" y="6" width="104" height="60" rx="10"/>' +
    '<path class="brillo" d="M8 18c0-7 5-12 12-12h38C38 12 22 26 8 46z"/>' +
    '<rect class="costura" x="16" y="14" width="88" height="44" rx="6"/>' +
    '<rect class="banda" x="76" y="45" width="28" height="13" rx="3"/><text class="marca" x="90" y="53.8">SICAF</text>';

  function dibujo(p, i) {
    var v = VISTAS[i], sombra = '<ellipse class="sombra" cx="63" cy="66" rx="48" ry="3.2"/>';
    if (v.dibujo === "lado") return SILUETAS[p.forma];
    if (v.dibujo === "arriba") return sombra + '<path class="piel borde" d="' + CONTORNO + '"/>' + ARRIBA[p.forma];
    if (v.dibujo === "suela") return sombra + SUELA;
    return DETALLE;
  }

  /* Una foto: el ángulo i del modelo, en el color del cuero */
  function vistaHtml(p, color, i, clase) {
    return '<span class="cot-foto ' + clase + '" style="--piel: ' + piel(p.bloqueo ? "" : color) + '">' +
      '<svg viewBox="0 0 120 72" aria-hidden="true"' + (VISTAS[i].espejo ? ' class="es-espejo"' : "") + ">" +
      dibujo(p, i) + "</svg></span>";
  }

  function minisHtml(p) {
    return VISTAS.map(function (vista, j) {
      var on = j === vit.foto;
      return '<button type="button" class="gal__mini' + (on ? " is-on" : "") + '" data-foto="' + j + '" aria-label="Foto: ' +
        vista.nombre + '"' + (on ? ' aria-current="true"' : "") + ">" + vistaHtml(p, vit.color, j, "cot-foto--mini") + "</button>";
    }).join("");
  }

  /* La galería: miniaturas a la izquierda y la foto grande, con flechas para
     pasar una por una. Pasar el ratón por una miniatura la muestra; un clic en
     la foto grande la amplía. */
  function galeriaHtml(p) {
    var i = vit.foto;
    return '<div class="gal" aria-label="Fotos de ' + p.nombre + '">' +
      '<div class="gal__minis">' + minisHtml(p) + "</div>" +
      '<div class="gal__principal">' +
        '<button type="button" class="gal__ver" data-ampliar title="Ampliar la foto">' + vistaHtml(p, vit.color, i, "cot-foto--gal") + "</button>" +
        '<button type="button" class="gal__flecha gal__flecha--ant" data-foto-mover="-1" aria-label="Foto anterior">' + icono("atras", 18) + "</button>" +
        '<button type="button" class="gal__flecha gal__flecha--sig" data-foto-mover="1" aria-label="Foto siguiente">' + icono("adelante", 18) + "</button>" +
        '<span class="gal__cuenta">' + (i + 1) + " / " + VISTAS.length + " · " + VISTAS[i].nombre + "</span>" +
        '<span class="gal__lupa" aria-hidden="true">' + icono("lupa", 13) + "Ampliar</span>" +
      "</div></div>";
  }

  /* Las fotos en grande, encima de todo: flechas, miniaturas y acercar con un clic */
  function pintarCaja() {
    var p = productoPor(vit.ref), i = vit.foto;
    uno("#cot-galeria").innerHTML =
      '<div class="gal-caja__cab"><div><b id="cot-galeria-t">' + p.nombre + " · " + vit.color + "</b>" +
        "<span>" + VISTAS[i].nombre + " · foto " + (i + 1) + " de " + VISTAS.length + "</span></div>" +
        '<button type="button" class="gal-caja__x" data-galeria-cerrar aria-label="Cerrar las fotos">' + icono("cerrar", 22) + "</button></div>" +
      '<div class="gal-caja__escena">' +
        '<button type="button" class="gal__flecha gal__flecha--ant" data-foto-mover="-1" aria-label="Foto anterior">' + icono("atras", 26) + "</button>" +
        '<div class="gal-caja__foto" data-galeria-zoom title="Clic para acercar">' + vistaHtml(p, vit.color, i, "cot-foto--caja") + "</div>" +
        '<button type="button" class="gal__flecha gal__flecha--sig" data-foto-mover="1" aria-label="Foto siguiente">' + icono("adelante", 26) + "</button>" +
      "</div>" +
      '<div class="gal-caja__minis">' + minisHtml(p) + "</div>" +
      '<p class="gal-caja__ayuda">Haga clic en la foto para acercarla y mueva el ratón para recorrerla. ' +
        "Con las flechas del teclado pasa de foto; con Esc cierra.</p>";
  }

  function galeriaAbierta() {
    var caja = uno("#cot-galeria");
    return !!caja && !caja.hidden;
  }

  function abrirGaleria() {
    pintarCaja();
    uno("#cot-galeria").hidden = false;
    uno("#cot-galeria .gal-caja__x").focus();
  }

  function cerrarGaleria() {
    uno("#cot-galeria").hidden = true;
    var ver = uno("#cot-vit-cuerpo .gal__ver");
    if (ver) ver.focus();
  }

  /* Muestra la foto i en la galería y, si está abierta, en grande */
  function ponerFoto(i) {
    vit.foto = (i + VISTAS.length) % VISTAS.length;
    var gal = uno("#cot-vit-cuerpo .gal");
    if (gal) gal.outerHTML = galeriaHtml(productoPor(vit.ref));
    if (galeriaAbierta()) pintarCaja();
  }

  /* Las flechas: pasa a la foto de al lado y deja el foco en la misma flecha */
  function moverFoto(n, enGrande) {
    ponerFoto(vit.foto + n);
    var zona = uno(enGrande ? "#cot-galeria" : "#cot-vit-cuerpo .gal");
    var flecha = zona && uno('[data-foto-mover="' + n + '"]', zona);
    if (flecha) flecha.focus();
  }

  /* Acercar: la foto se agranda desde el punto donde está el ratón */
  function acercar(caja, e) {
    var r = caja.getBoundingClientRect();
    var x = Math.round(100 * (e.clientX - r.left) / r.width), y = Math.round(100 * (e.clientY - r.top) / r.height);
    if (VISTAS[vit.foto].espejo) x = 100 - x;   // la foto del otro lado está volteada
    caja.style.setProperty("--zx", x + "%");
    caja.style.setProperty("--zy", y + "%");
  }

  function colores(p) { return Object.keys(p.colores); }
  function paresDelColor(p, color) { return p.colores[color].reduce(function (a, n) { return a + n; }, 0); }
  function tallasDe(p) { return "tallas " + p.tallas[0] + " a " + p.tallas[p.tallas.length - 1]; }
  function mayuscula(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  /* El punto de cada talla: verde si alcanza, ámbar si quedan pocos, gris si no hay */
  function nivel(hay) { return hay === 0 ? "cero" : hay < 6 ? "poco" : "ok"; }
  function textoHay(hay, cant) { return cant > hay ? "faltan " + (cant - hay) : hay ? "hay " + hay : "no hay"; }
  function badgesHtml(p) {
    return '<span class="cot-badge' + (p.iva ? "" : " cot-badge--sin") + '">' + (p.iva ? "IVA " + p.iva + " %" : "Sin IVA") + "</span>" +
           (p.desc ? '<span class="cot-badge cot-badge--promo">' + p.desc + " % de descuento</span>" : "");
  }

  /* ---- Los renglones, vistos por producto, color y talla ---- */

  function lineaDe(ref, color, talla) {
    return cot.lineas.filter(function (l) { return l.ref === ref && l.color === color && l.talla === talla; })[0];
  }
  function cantidadDe(ref, color, talla) {
    var l = lineaDe(ref, color, talla);
    return l ? l.cant : 0;
  }
  function paresDe(ref, color) {
    return cot.lineas.reduce(function (s, l) { return s + (l.ref === ref && l.color === color ? l.cant : 0); }, 0);
  }
  function descDe(ref, q) {
    q = q || cot;
    return q.descuentos[ref] !== undefined ? q.descuentos[ref] : productoPor(ref).desc;
  }

  /* Escribe los pares de una talla; con 0 el renglón se quita. Los renglones
     quedan en el orden del catálogo (producto, color y talla) */
  function ponerCantidad(ref, color, talla, n) {
    var l = lineaDe(ref, color, talla);
    if (n > 0 && l) l.cant = n;
    else if (n > 0) cot.lineas.push({ ref: ref, color: color, talla: talla, cant: n, desc: descDe(ref) });
    else if (l) cot.lineas.splice(cot.lineas.indexOf(l), 1);
    cot.lineas.sort(function (a, b) {
      var pa = productoPor(a.ref), pb = productoPor(b.ref);
      return (PRODUCTOS.indexOf(pa) - PRODUCTOS.indexOf(pb)) ||
             (colores(pa).indexOf(a.color) - colores(pb).indexOf(b.color)) || (a.talla - b.talla);
    });
  }

  /* El descuento va por modelo: vale para todos sus colores y tallas */
  function ponerDescuento(ref, v) {
    cot.descuentos[ref] = v;
    cot.lineas.forEach(function (l) { if (l.ref === ref) l.desc = v; });
  }

  function quitarProducto(ref) {
    cot.lineas = cot.lineas.filter(function (l) { return l.ref !== ref; });
    if (vit.ref === ref) vit.ref = null;
  }

  /* Los modelos que ya tienen pares, en el orden del catálogo */
  function refsEnCotizacion(q) {
    var refs = [];
    (q || cot).lineas.forEach(function (l) { if (l.cant > 0 && refs.indexOf(l.ref) < 0) refs.push(l.ref); });
    return refs;
  }

  /* Todo lo de un modelo: pares, subtotal, descuento, IVA, total y sus tallas por color.
     Se calcula por modelo, como se muestra: los pares por el precio de lista; el
     descuento (que va por modelo) se resta primero y el IVA se cobra sobre lo que
     queda, que es lo que el cliente de verdad paga. Así los pesos cuadran con la lista. */
  function resumenDe(ref, q) {
    q = q || cot;
    var p = productoPor(ref), r = { p: p, pares: 0, colores: {}, desc: descDe(ref, q) };
    q.lineas.forEach(function (l) {
      if (l.ref !== ref || l.cant < 1) return;
      r.pares += l.cant;
      (r.colores[l.color] = r.colores[l.color] || []).push(l);
    });
    r.bruto = r.pares * p.precio;
    r.descuento = Math.round(r.bruto * r.desc / 100);
    r.base = r.bruto - r.descuento;
    r.iva = Math.round(r.base * p.iva / 100);
    r.total = r.base + r.iva;
    return r;
  }

  /* Una casilla por talla: el número, los pares que se piden y lo que hay */
  function tallaHtml(p, color, talla, j) {
    var hay = p.colores[color][j], cant = cantidadDe(p.ref, color, talla);
    return '<label class="cot-talla cot-talla--' + nivel(hay) + (cant ? " is-on" : "") + (cant > hay ? " is-mal" : "") + '">' +
      '<span class="cot-talla__n">Talla ' + talla + "</span>" +
      '<input class="cot-cant" type="number" min="0" step="1" inputmode="numeric" placeholder="0" value="' + (cant || "") + '"' +
        ' data-ref="' + p.ref + '" data-color="' + color + '" data-talla="' + talla + '" aria-label="Pares de talla ' + talla + ", " + color + '">' +
      '<span class="cot-talla__hay">' + textoHay(hay, cant) + "</span></label>";
  }

  /* Las muestras de color: dicen cuántos pares hay, o cuántos lleva ya la cotización */
  function coloresHtml(p, elegido) {
    return '<div class="cot-colores" role="radiogroup" aria-label="Color del cuero">' + colores(p).map(function (color) {
      var pedidos = paresDe(p.ref, color), on = color === elegido;
      return '<button type="button" class="cot-color' + (on ? " is-on" : "") + '" role="radio" aria-checked="' + on + '"' +
        ' data-vit-color="' + color + '"><i style="background:' + piel(color) + '"></i>' +
        "<span>" + color + "<small>" + (pedidos ? "<b>" + pedidos + " en la cotización</b>" : paresDelColor(p, color) + " disponibles") +
        "</small></span></button>";
    }).join("") + "</div>";
  }

  function filtrarCatalogo() {
    return buscarEn(PRODUCTOS, vit.q, function (p) { return p.nombre + " " + p.ref; })
      .filter(function (p) { return !vit.solo || (!p.bloqueo && asignado(p) > 0); });
  }

  /* ---- Abrir y cerrar la ventana ---- */

  function abrirProductos() {
    var c = cot.cliente;
    if (!c) {
      uno("#cot-cli-q").focus();
      return aviso("Primero seleccione un cliente.", "crit");
    }
    uno("#cot-dlg-sub").textContent = cot.numero + " · " + c.nombre + " · cupo disponible " + pesos(Math.max(0, c.cupo - c.saldo));
    uno("#cot-dlg").hidden = false;
    uno("#cot-vit-q").value = vit.q;
    uno("#cot-vit-solo").checked = vit.solo;
    pintarVitrina();
    uno("#cot-dlg .modal").focus();
  }

  function cerrarProductos() {
    uno("#cot-dlg").hidden = true;
    pintarCotizacion();
    // Vuelve al "Cambiar" del modelo desde el que se abrió, si sigue en la lista
    var desde = vit.desde && uno('[data-cot-cambiar="' + vit.desde + '"]');
    vit.desde = null;
    (desde || uno('[data-cot="abrir-productos"]')).focus();
  }

  /* El resumen del pie de la ventana: lo de toda la cotización */
  function pintarResumen() {
    var t = totales();
    uno("#cot-sum").innerHTML =
      "<span>" + cuantas(refsEnCotizacion().length, "modelo", "modelos") + " · <b>" + miles(t.pares) + "</b> " +
        (t.pares === 1 ? "par" : "pares") + "</span>" +
      "<span>Subtotal <b>" + pesos(t.bruto) + "</b></span>" +
      "<span>Descuento <b>" + (t.descuento ? "−" + pesos(t.descuento) : "$0") + "</b></span>" +
      "<span>IVA <b>" + pesos(t.iva) + "</b></span>" +
      '<span class="cot-sum__t">Total <b>' + pesos(t.total) + "</b></span>";
  }

  /* ---- El catálogo y el carrito ---- */

  function pintarVitrina() {
    pintarVitrinaCuerpo();
    pintarCarro();
    pintarResumen();
  }

  /* El catálogo o, si hay un modelo abierto, sus tres pasos */
  function pintarVitrinaCuerpo() {
    uno("#cot-vit-volver").hidden = !vit.ref;
    var cuerpo = uno("#cot-vit-cuerpo");
    if (vit.ref) {
      cuerpo.innerHTML = modeloHtml();
      return;
    }
    var lista = filtrarCatalogo();
    cuerpo.innerHTML = lista.length ? '<div class="vit__grid">' + lista.map(tarjetaHtml).join("") + "</div>"
      : '<p class="cot-vacio">Ningún modelo tiene ese nombre o esa referencia.</p>';
  }

  function tarjetaHtml(p) {
    if (p.bloqueo) {
      return '<div class="vit__card is-bloqueado" aria-disabled="true">' + foto(p, "", "card") +
        '<span class="vit__cuerpo"><b class="vit__nom">' + p.nombre + '</b><span class="vit__ref">' + p.ref + "</span>" +
        '<span class="vit__motivo">' + mayuscula(p.bloqueo) + "</span></span></div>";
    }
    var r = resumenDe(p.ref);
    return '<button type="button" class="vit__card' + (r.pares ? " is-en" : "") + '" data-abrir="' + p.ref + '">' +
      foto(p, Object.keys(r.colores)[0] || colores(p)[0], "card") +
      (r.pares ? '<span class="vit__en">' + icono("visto", 14) + cuantas(r.pares, "par", "pares") + " en la cotización</span>" : "") +
      '<span class="vit__cuerpo"><b class="vit__nom">' + p.nombre + "</b>" +
        '<span class="vit__ref">' + p.ref + " · " + tallasDe(p) + "</span>" +
        '<span class="vit__puntos">' + colores(p).map(function (c) {
          return '<i title="' + c + '" style="background:' + piel(c) + '"></i>';
        }).join("") + "</span>" +
        '<span class="vit__fila"><span class="vit__precio"><b>' + pesos(p.precio) + "</b> el par</span>" +
          '<span class="vit__badges">' + badgesHtml(p) + "</span></span>" +
        '<span class="vit__disp">' + miles(asignado(p)) + " pares disponibles</span></span></button>";
  }

  function pintarCarro() {
    var refs = refsEnCotizacion(), t = totales();
    uno("#cot-vit-carro").innerHTML = '<div class="vit__carro-cab"><b>Lo que lleva la cotización</b><span>' + cot.numero + "</span></div>" +
      (refs.length ? '<div class="vit__items">' + refs.map(itemCarroHtml).join("") + "</div>"
        : '<div class="vit__carro-vacio">' + icono("zapato", 30) +
          "<p>Todavía no hay productos. Abra un modelo del catálogo y escriba cuántos pares quiere de cada talla.</p></div>") +
      '<div class="vit__carro-pie">' +
        kv("Subtotal", pesos(t.bruto), cuantas(t.pares, "par", "pares")) +
        kv("Descuentos", t.descuento ? "−" + pesos(t.descuento) : "$0") +
        kv("IVA", pesos(t.iva)) +
        '<div class="kv kv--t"><span>Total</span><b>' + pesos(t.total) + "</b></div></div>";
  }

  function itemCarroHtml(ref) {
    var r = resumenDe(ref), p = r.p;
    return '<article class="vit__item' + (vit.ref === ref ? " is-abierto" : "") + '">' +
      foto(p, Object.keys(r.colores)[0], "sm") +
      '<div class="vit__item-x"><div class="vit__item-cab"><b>' + p.nombre + "</b><b>" + pesos(r.total) + "</b></div>" +
      Object.keys(r.colores).map(function (color) {
        return '<div class="vit__item-color"><i style="background:' + piel(color) + '"></i>' + color +
          '<span class="vit__chips">' + r.colores[color].map(function (l) {
            return "<span>" + l.talla + "<b>×" + l.cant + "</b></span>";
          }).join("") + "</span></div>";
      }).join("") +
      '<div class="vit__item-pie"><span class="tiny">' + miles(r.pares) + " × " + pesos(p.precio) +
        (r.desc ? " · −" + r.desc + " %" : "") + " · " + (p.iva ? "IVA " + p.iva + " %" : "sin IVA") + "</span>" +
        botonesModeloHtml(p, "data-abrir", "data-quitar-producto") + "</div>" +
      "</div></article>";
  }

  /* ---- El modelo abierto: su ficha y tres pasos, cada uno en su tarjeta ---- */

  /* Una tarjeta de paso: el número (✓ cuando ya está), el título, la ayuda y,
     a la derecha, lo que se eligió en ese paso */
  function pasoHtml(n, titulo, ayuda, estado, cuerpo) {
    return '<section class="vit__paso' + (estado.listo ? " is-listo" : "") + '" data-paso="' + n + '">' +
      '<header class="vit__paso-cab"><span class="vit__paso-n" aria-hidden="true">' + (estado.listo ? "✓" : n) + "</span>" +
        '<div class="vit__paso-t"><h5>' + titulo + "</h5><small>" + ayuda + "</small></div>" +
        '<span class="vit__paso-estado' + (estado.on ? " is-on" : "") + (estado.mal ? " is-mal" : "") + '" data-v="estado">' +
          estado.html + "</span></header>" +
      '<div class="vit__paso-cuerpo">' + cuerpo + "</div></section>";
  }

  /* Lo que dice cada paso a la derecha de su título */
  function estadoPaso(n, p, r) {
    if (n === 1) {
      return { listo: true, on: true, html: '<i style="background:' + piel(vit.color) + '"></i>' + vit.color };
    }
    if (n === 2) {
      var enColor = paresDe(p.ref, vit.color);
      return { listo: enColor > 0, on: enColor > 0, html: enColor ? cuantas(enColor, "par", "pares") : "Sin pares todavía" };
    }
    return { listo: false, on: r.desc > 0, mal: r.desc > DESCUENTO_MAX,
             html: r.desc ? r.desc + " % · −" + pesos(r.descuento) : "Sin descuento" };
  }

  /* Los botones de ayuda del paso 2: copiar las cantidades de otro color o borrar las de este */
  function atajosHtml(p) {
    var enColor = paresDe(p.ref, vit.color);
    var otro = colores(p).filter(function (c) { return c !== vit.color && paresDe(p.ref, c) > 0; })[0];
    return (otro && !enColor ? '<button type="button" class="btn btn--sm btn--ghost" data-vit-copiar="' + otro + '">Copiar las del ' + otro + "</button>" : "") +
           (enColor ? '<button type="button" class="btn btn--sm btn--ghost vit__borrar" data-vit-limpiar>Borrar las del ' + vit.color + "</button>" : "");
  }

  /* Dos columnas para que todo quepa sin desplazarse: a la izquierda las fotos,
     los datos y el color; a la derecha las tallas, el descuento y el total */
  function modeloHtml() {
    var p = productoPor(vit.ref), r = resumenDe(p.ref);
    if (!vit.color) vit.color = Object.keys(r.colores)[0] || colores(p)[0];
    return '<div class="vit__modelo">' +
      '<div class="vit__col">' +
        '<section class="vit__ficha">' + galeriaHtml(p) +
          '<div class="vit__ficha-x"><span class="vit__ref">' + p.ref + " · colección " + p.coleccion + "</span>" +
            "<h4>" + p.nombre + "</h4>" +
            '<div class="vit__fila"><span class="vit__precio vit__precio--lg"><b>' + pesos(p.precio) + "</b> el par</span>" +
              '<span class="vit__badges">' + badgesHtml(p) + "</span></div>" +
            '<span class="vit__ficha-datos">' + mayuscula(tallasDe(p)) + " · " + colores(p).length + " colores · " +
              miles(asignado(p)) + " pares disponibles</span></div></section>" +
        pasoHtml(1, "Color del cuero", "Toque un color para elegirlo.", estadoPaso(1, p, r),
          coloresHtml(p, vit.color)) +
      "</div>" +
      '<div class="vit__col">' +
        pasoHtml(2, "Pares por talla en " + vit.color, "Escriba cuántos pares quiere de cada talla.",
          estadoPaso(2, p, r),
          '<div class="cot-tallas" style="grid-template-columns: repeat(' + p.tallas.length + ', minmax(0, 1fr))">' +
            p.tallas.map(function (t, j) { return tallaHtml(p, vit.color, t, j); }).join("") + "</div>" +
          '<div class="vit__leyenda"><span class="is-ok">alcanza</span><span class="is-poco">quedan pocos</span>' +
            '<span class="is-cero">no hay</span><span class="is-mal" title="Se cotiza igual: se reserva lo que haya' +
            ' y el resto se le pide a Producción">pide más de lo que hay</span></div>' +
          '<div class="vit__atajos"><span>Poner</span><input class="dt__in" id="cot-vit-n" type="number" min="1" step="1" value="2"' +
            ' aria-label="Pares para cada talla"><span>en cada talla</span>' +
            '<button type="button" class="btn btn--sm btn--ghost" data-vit-llenar>Llenar</button>' +
            '<span class="vit__atajos-mas" data-v="atajos">' + atajosHtml(p) + "</span></div>") +
        pasoHtml(3, "Descuento y total", "Vale para todo el modelo; hasta " + DESCUENTO_MAX + " % sin autorización.",
          estadoPaso(3, p, r),
          totalModeloHtml(p, r) +
          '<div class="vit__modelo-fin"><button type="button" class="btn btn--sm" data-volver-catalogo>' + icono("visto", 16) +
            "Listo con " + p.nombre + "</button></div>") +
      "</div></div>";
  }

  /* El total del modelo: pares × precio, descuento (se escribe ahí mismo), IVA y total */
  function totalModeloHtml(p, r) {
    return '<div class="cot-desglose vit__total">' +
      '<span><b data-v="pares">' + cuantas(r.pares, "par", "pares") + "</b> × " + pesos(p.precio) + ' = <b data-v="bruto">' +
        pesos(r.bruto) + "</b></span>" +
      '<label class="vit__desc" for="cot-vit-desc">Descuento <span class="cot-pct"><input class="dt__in cot-desc' +
        (r.desc > DESCUENTO_MAX ? " is-mal" : "") + '" id="cot-vit-desc" type="number" min="0" max="100" step="1" value="' + r.desc +
        '" data-ref="' + p.ref + '"> %</span> <b data-v="descuento">' + (r.descuento ? "−" + pesos(r.descuento) : "$0") + "</b></label>" +
      "<span>" + (p.iva ? "IVA " + p.iva + ' % <b data-v="iva">' + pesos(r.iva) + "</b>" : "Sin IVA") + "</span>" +
      '<span class="cot-desglose__t">Total <b data-v="total">' + pesos(r.total) + "</b></span></div>";
  }

  /* Después de escribir pares o descuento: cambia lo que depende de eso, sin
     volver a dibujar la casilla en la que el vendedor está escribiendo */
  function refrescarModelo() {
    var modelo = uno("#cot-vit-cuerpo .vit__modelo");
    if (modelo) {
      var p = productoPor(vit.ref), r = resumenDe(p.ref);
      uno(".cot-colores", modelo).outerHTML = coloresHtml(p, vit.color);
      [1, 2, 3].forEach(function (n) {
        var paso = uno('.vit__paso[data-paso="' + n + '"]', modelo), e = estadoPaso(n, p, r);
        var estado = uno('[data-v="estado"]', paso);
        paso.classList.toggle("is-listo", e.listo);
        uno(".vit__paso-n", paso).textContent = e.listo ? "✓" : n;
        estado.innerHTML = e.html;
        estado.classList.toggle("is-on", !!e.on);
        estado.classList.toggle("is-mal", !!e.mal);
      });
      uno('[data-v="atajos"]', modelo).innerHTML = atajosHtml(p);
      var total = uno(".vit__total", modelo), iva = uno('[data-v="iva"]', total);
      uno('[data-v="pares"]', total).textContent = cuantas(r.pares, "par", "pares");
      uno('[data-v="bruto"]', total).textContent = pesos(r.bruto);
      uno('[data-v="descuento"]', total).textContent = r.descuento ? "−" + pesos(r.descuento) : "$0";
      if (iva) iva.textContent = pesos(r.iva);
      uno('[data-v="total"]', total).textContent = pesos(r.total);
    }
    pintarCarro();
    pintarResumen();
  }

  function abrirModelo(ref) {
    vit.ref = ref;
    vit.foto = 0;
    vit.color = Object.keys(resumenDe(ref).colores)[0] || colores(productoPor(ref))[0];
    pintarVitrinaCuerpo();
    pintarCarro();
    uno(".vit__main").scrollTop = 0;
    uno("#cot-vit-cuerpo .cot-cant").focus();
  }

  function cerrarModelo() {
    vit.ref = null;
    vit.color = null;
    pintarVitrinaCuerpo();
    pintarCarro();
    uno(".vit__main").scrollTop = 0;   // el catálogo desde arriba: se ve el sello del que se acaba de llenar
  }

  function elegirColor(color) {
    vit.color = color;
    pintarVitrinaCuerpo();
    uno("#cot-vit-cuerpo .cot-cant").focus();
  }

  /* "Poner N pares en cada talla" del color abierto; con 0 las borra */
  function llenarColor(n) {
    var p = productoPor(vit.ref);
    p.tallas.forEach(function (t) { ponerCantidad(p.ref, vit.color, t, n); });
    pintarVitrinaCuerpo();
    refrescarModelo();
  }

  /* La misma curva de tallas en otro color: lo más común en un pedido */
  function copiarColor(desde) {
    var p = productoPor(vit.ref);
    p.tallas.forEach(function (t) { ponerCantidad(p.ref, vit.color, t, cantidadDe(p.ref, desde, t)); });
    pintarVitrinaCuerpo();
    refrescarModelo();
    aviso("Se copiaron las cantidades del " + desde + " al " + vit.color + ".", "ok");
  }

  function escribirPares(campo) {
    var ref = campo.getAttribute("data-ref"), color = campo.getAttribute("data-color");
    var talla = entero(campo.getAttribute("data-talla")), n = Math.max(0, entero(campo.value));
    var hay = disponible(productoPor(ref), color, talla);
    ponerCantidad(ref, color, talla, n);
    var caja = campo.closest(".cot-talla");
    caja.classList.toggle("is-on", n > 0);
    caja.classList.toggle("is-mal", n > hay);
    uno(".cot-talla__hay", caja).textContent = textoHay(hay, n);
    refrescarModelo();
  }

  function escribirDescuento(campo) {
    var v = Math.min(100, Math.max(0, entero(campo.value)));
    ponerDescuento(campo.getAttribute("data-ref"), v);
    campo.classList.toggle("is-mal", v > DESCUENTO_MAX);
    refrescarModelo();
  }

  /* Los clics de la vitrina. Devuelve true si el clic era suyo */
  function clicVitrina(e) {
    var b;
    if (e.target.id === "cot-galeria" || e.target.closest("[data-galeria-cerrar]")) { cerrarGaleria(); return true; }
    if ((b = e.target.closest("[data-galeria-zoom]"))) {
      acercar(b, e);
      b.classList.toggle("is-zoom");
      return true;
    }
    if (e.target.closest("[data-ampliar]")) { abrirGaleria(); return true; }
    if ((b = e.target.closest("[data-foto-mover]"))) {
      moverFoto(entero(b.getAttribute("data-foto-mover")), !!b.closest("#cot-galeria"));
      return true;
    }
    if ((b = e.target.closest("[data-foto]"))) { ponerFoto(entero(b.getAttribute("data-foto"))); return true; }
    if ((b = e.target.closest("[data-abrir]"))) { abrirModelo(b.getAttribute("data-abrir")); return true; }
    if (e.target.closest("[data-volver-catalogo]")) { cerrarModelo(); return true; }
    if ((b = e.target.closest("[data-vit-color]"))) { elegirColor(b.getAttribute("data-vit-color")); return true; }
    if (e.target.closest("[data-vit-llenar]")) { llenarColor(Math.max(0, entero(uno("#cot-vit-n").value))); return true; }
    if (e.target.closest("[data-vit-limpiar]")) { llenarColor(0); return true; }
    if ((b = e.target.closest("[data-vit-copiar]"))) { copiarColor(b.getAttribute("data-vit-copiar")); return true; }
    if ((b = e.target.closest("[data-quitar-producto]"))) {
      quitarProducto(b.getAttribute("data-quitar-producto"));
      pintarVitrina();
      return true;
    }
    return false;
  }

  /* ---- Cotizar, guardar, enviar y cancelar ---- */

  function elegirCliente(codigo) {
    cot.cliente = clientePor(codigo);
    uno("#cot-cli-q").value = cot.cliente.nombre;
    verResultados(uno("#cot-cli-res"), false);
    pintarCotizacion();
    if (cot.estado === "nueva") uno('[data-cot="cotizar"]').focus();
  }

  function cambiarCliente() {
    cot.cliente = null;
    var q = uno("#cot-cli-q");
    q.value = "";
    pintarCotizacion();
    q.focus();
  }

  /* El botón principal: la cotización toma su número, cambia de estado y se abre la ventana de productos */
  function cotizar() {
    if (!cot.cliente) {
      uno("#cot-cli-q").focus();
      return aviso("Primero seleccione un cliente.", "crit");
    }
    cot.numero = "CO-" + cot.fecha.getFullYear() + "-" + ("00" + (ultimaCot + 1)).slice(-3);
    cot.estado = "elaboracion";
    pintarCotizacion();
    aviso(cot.numero + " queda en elaboración para " + cot.cliente.nombre + ": ahora elija los productos.", "ok");
    abrirProductos();
  }

  function guardarCotizacion(estado) {
    var t = totales();
    if (!cot.cliente) return aviso("Seleccione un cliente.", "crit");
    if (!t.renglones) return aviso("Agregue al menos un producto.", "crit");
    if (t.sinCant) return aviso("Hay renglones sin cantidad: escríbala o quite el renglón.", "crit");
    if (estado === "porfacturar" && t.descAlto) {
      return aviso("Con descuentos de más del " + DESCUENTO_MAX + " % solo se puede guardar como borrador.", "crit");
    }
    var vence = sumarDias(cot.fecha, VIGENCIA);
    cotNuevas.push({ numero: cot.numero, estado: estado, fecha: cot.fecha, vence: vence, cliente: cot.cliente,
                     vendedor: VENDEDOR.nombre, pares: t.pares, valor: t.total });
    // Todo lo de la cotización, para su detalle en la lista y para Facturación
    HISTORIAL[cot.numero] = {
      fecha: fechaIso(cot.fecha), cli: cot.cliente.codigo, vend: VENDEDOR.nombre, pares: t.pares, estado: estado, factura: "",
      lineas: cot.lineas.map(function (l) { return { ref: l.ref, color: l.color, talla: l.talla, cant: l.cant, desc: l.desc }; }),
      descuentos: JSON.parse(JSON.stringify(cot.descuentos)),
      obs: uno("#cot-obs").value.trim(),
      pasos: estado === "porfacturar" ? { porfacturar: 0 } : {}
    };
    ultimaCot = Math.max(ultimaCot, cola(cot.numero));
    aviso(estado === "porfacturar"
      ? cot.numero + " enviada a Facturación por " + pesos(t.total) + ". Al cliente le llegó el PDF a " + cot.cliente.correo + "."
      : cot.numero + " guardada como borrador: queda en la lista y todavía no va a Facturación.", "ok");
    salirDeNueva();
  }

  function salirDeNueva() {
    cot = null;
    ir(LISTA, true);
    delete guardadas[NUEVA];   // la próxima "Crear cotización" empieza en blanco
  }

  /* Cancelar pide confirmación si ya hay algo escrito: se pulsa dos veces */
  function cancelar(b) {
    var algo = cot.cliente || cot.lineas.length;
    if (algo && !b.getAttribute("data-seguro")) {
      b.setAttribute("data-seguro", "1");
      b.textContent = "¿Descartarla?";
      clearTimeout(b._t);
      b._t = setTimeout(function () {
        b.removeAttribute("data-seguro");
        b.textContent = "Cancelar";
      }, 4000);
      return aviso("Pulse otra vez para descartar la cotización. Se deshace solo en 4 segundos.", "warn");
    }
    if (algo) aviso((cot.numero || "La cotización") + " se descartó: no quedó guardada.", "crit");
    salirDeNueva();
  }

  document.addEventListener("click", function (e) {
    if (!cot || !e.target.closest) return;
    // Las listas de resultados se cierran al pulsar fuera de su buscador
    todos(".cot-res").forEach(function (caja) {
      if (!caja.hidden && !caja.parentNode.contains(e.target)) verResultados(caja, false);
    });
    if (e.target.id === "cot-dlg") return cerrarProductos();      // el fondo oscuro de la ventana

    var cli = e.target.closest("#cot-cli-res [data-cli]");
    if (cli) return elegirCliente(cli.getAttribute("data-cli"));
    if (clicVitrina(e)) return;
    // Cambiar abre la ventana con ese modelo abierto; Quitar lo saca de la cotización
    var modelo = e.target.closest("[data-cot-cambiar]");
    if (modelo) {
      vit.desde = modelo.getAttribute("data-cot-cambiar");
      abrirProductos();
      return abrirModelo(vit.desde);
    }
    var fuera = e.target.closest("[data-cot-quitar]");
    if (fuera) {
      var ref = fuera.getAttribute("data-cot-quitar");
      quitarProducto(ref);
      pintarCotizacion();
      uno('[data-cot="abrir-productos"]').focus();
      return aviso(productoPor(ref).nombre + " se quitó de la cotización.", "warn");
    }
    var b = e.target.closest("[data-cot]");
    if (!b) return;
    var que = b.getAttribute("data-cot");
    if (que === "ver-ficha") {
      cot.verFicha = !cot.verFicha;
      pintarFicha();
      uno('#cot-cli-mini [data-cot="ver-ficha"]').focus();   // la línea se volvió a dibujar
    }
    if (que === "cotizar") cotizar();
    if (que === "cambiar-cliente") cambiarCliente();
    if (que === "abrir-productos") abrirProductos();
    if (que === "cerrar-productos") cerrarProductos();
    if (que === "enviar") guardarCotizacion("porfacturar");
    if (que === "borrador") guardarCotizacion("borrador");
    if (que === "cancelar") cancelar(b);
  });

  document.addEventListener("focusin", function (e) {
    if (!cot) return;
    if (e.target.id === "cot-cli-q") pintarClientes();
  });

  document.addEventListener("input", function (e) {
    if (!cot) return;
    var t = e.target;
    if (t.id === "cot-cli-q") pintarClientes();
    if (t.classList.contains("cot-cant")) escribirPares(t);
    if (t.classList.contains("cot-desc")) escribirDescuento(t);
    if (t.id === "cot-vit-q") { vit.q = t.value; vit.ref = null; vit.color = null; pintarVitrinaCuerpo(); pintarCarro(); }
  });

  document.addEventListener("change", function (e) {
    if (!cot) return;
    var t = e.target;
    if (t.id === "cot-vit-solo") { vit.solo = t.checked; vit.ref = null; vit.color = null; pintarVitrinaCuerpo(); pintarCarro(); }
  });

  /* Como en una tienda: pasar el ratón por una miniatura muestra esa foto */
  document.addEventListener("mouseover", function (e) {
    var mini = cot && e.target.closest ? e.target.closest("#cot-vit-cuerpo .gal__mini") : null;
    if (mini && !mini.classList.contains("is-on")) ponerFoto(entero(mini.getAttribute("data-foto")));
  });

  /* Con la foto acercada, el ratón la recorre */
  document.addEventListener("mousemove", function (e) {
    var caja = e.target.closest ? e.target.closest(".gal-caja__foto.is-zoom") : null;
    if (caja) acercar(caja, e);
  });

  /* El teclado: flechas y Enter en los buscadores, Escape cierra lo que esté abierto */
  document.addEventListener("keydown", function (e) {
    var t = e.target;
    // Con las fotos en grande, las flechas pasan de foto y Esc cierra solo las fotos
    if (cot && galeriaAbierta()) {
      if (e.key === "Escape") { e.preventDefault(); return cerrarGaleria(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); return moverFoto(-1, true); }
      if (e.key === "ArrowRight") { e.preventDefault(); return moverFoto(1, true); }
      return;
    }
    if (cot && t.id === "cot-cli-q") {
      var caja = uno("#" + t.getAttribute("aria-controls"));
      if (e.key === "Escape" && !caja.hidden) return verResultados(caja, false);
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
        e.preventDefault();
        if (caja.hidden) return pintarClientes();
        var items = todos(".cot-res__i:not(:disabled)", caja);
        var i = items.indexOf(uno(".cot-res__i.is-on", caja));
        if (e.key === "Enter") {
          var elegido = items[i < 0 ? 0 : i];
          if (elegido) elegido.click();
          return;
        }
        i = e.key === "ArrowDown" ? Math.min(items.length - 1, i + 1) : Math.max(0, i - 1);
        items.forEach(function (x, j) { x.classList.toggle("is-on", j === i); });
        if (items[i]) items[i].scrollIntoView({ block: "nearest" });
        return;
      }
    }
    if (e.key === "Escape") {
      var dlg = uno("#cot-dlg");
      if (cot && dlg && !dlg.hidden) cerrarProductos();
      todos("details.fil[open]").forEach(function (d) { d.open = false; });
    }
  });

  /* Lo que necesita cada pantalla al abrirse, también al volver a ella */
  function alEntrar() {
    if (uno("#dt-cot")) iniciarTabla("dt-cot");
    if (uno("#cot-form")) iniciarNueva();
    if (uno("#dt-fac")) iniciarTabla("dt-fac");
    if (uno("#fac-form")) iniciarFactura();
    // Las cotizaciones por facturar: lo que espera Facturación, en las dos pestañas
    var n = porFacturar().length;
    ponerEnMenu(LISTA, n);
    ponerEnMenu(FACTURAS, n);
  }

  /* ---------------------------------------------------------------- 11. El detalle de una cotización

     En 09-cotizacion.html, un clic en cualquier fila (o Enter sobre su número)
     abre a la derecha el detalle de esa cotización, esté en el estado que esté:
     el estado dicho con palabras y su recorrido, el cliente, los datos, los
     productos como en el carrito, las observaciones y los totales. Solo se lee.
     La fila trae lo que se ve en la tabla; lo demás está en HISTORIAL. En React
     todo llega de la API al abrir el detalle (GET /cotizaciones/{numero}). */

  /* Todo lo de cada cotización: lo que muestra la tabla (fecha, cliente, vendedor,
     pares, estado y factura) y lo que no. Es la fuente de los datos: el detalle
     y Facturación leen de aquí, y lo que cambie en una pantalla (una que se
     facturó) se ve en las demás. "pasos" son los días después de su fecha en
     que se envió a Facturación y en que se facturó. Las de
     ejemplo traen un solo modelo y sus tallas se reparten con la curva de lo
     asignado (curvaDe); las que se crean en "Nueva cotización" guardan aquí sus
     renglones de verdad (guardarCotizacion). */
  var HISTORIAL = {
    "CO-2026-001": { fecha: "2026-08-03", cli: "CL-003", vend: "Andrés Quintero", pares: 60, estado: "facturada", factura: "FV-2026-0112",
                     ref: "REF-1042", desc: 5, pasos: { porfacturar: 0, facturada: 3 }, obs: "Entrega en Bogotá en 10 días hábiles." },
    "CO-2026-002": { fecha: "2026-08-06", cli: "CL-004", vend: "Valentina Rojas", pares: 24, estado: "facturada", factura: "FV-2026-0118",
                     ref: "REF-1043", desc: 0, pasos: { porfacturar: 0, facturada: 2 }, obs: "Pago de contado contra entrega." },
    "CO-2026-003": { fecha: "2026-08-10", cli: "CL-007", vend: "Marcela Duarte", pares: 18, estado: "vencida", factura: "",
                     ref: "REF-1044", desc: 0, pasos: { porfacturar: 0 }, obs: "Para el surtido escolar de enero.",
                     motivo: "Facturación no la pudo facturar: el cliente tenía facturas vencidas y no las pagó a tiempo." },
    "CO-2026-004": { fecha: "2026-08-14", cli: "CL-005", vend: "Valentina Rojas", pares: 72, estado: "facturada", factura: "FV-2026-0127",
                     ref: "REF-1044", desc: 8, pasos: { porfacturar: 0, facturada: 3 }, obs: "Descuento del 8 % por volumen." },
    "CO-2026-005": { fecha: "2026-08-19", cli: "CL-002", vend: "Andrés Quintero", pares: 48, estado: "facturada", factura: "FV-2026-0131",
                     ref: "REF-1042", desc: 3, pasos: { porfacturar: 0, facturada: 4 }, obs: "" },
    "CO-2026-006": { fecha: "2026-08-24", cli: "CL-006", vend: "Marcela Duarte", pares: 30, estado: "vencida", factura: "",
                     ref: "REF-1043", desc: 0, pasos: {}, obs: "Precio sostenido hasta la fecha de vigencia." },
    "CO-2026-007": { fecha: "2026-08-27", cli: "CL-001", vend: "Valentina Rojas", pares: 26, estado: "facturada", factura: "FV-2026-0139",
                     ref: "REF-1042", desc: 0, pasos: { porfacturar: 0, facturada: 3 }, obs: "" },
    "CO-2026-008": { fecha: "2026-09-01", cli: "CL-008", vend: "Andrés Quintero", pares: 36, estado: "facturada", factura: "FV-2026-0144",
                     ref: "REF-1044", desc: 5, pasos: { porfacturar: 0, facturada: 2 }, obs: "Pago de contado. Incluye el marcado de la plantilla." },
    "CO-2026-009": { fecha: "2026-09-03", cli: "CL-004", vend: "Marcela Duarte", pares: 20, estado: "vencida", factura: "",
                     ref: "REF-1043", desc: 0, pasos: {}, obs: "" },
    "CO-2026-010": { fecha: "2026-09-07", cli: "CL-003", vend: "Valentina Rojas", pares: 84, estado: "facturada", factura: "FV-2026-0152",
                     ref: "REF-1042", desc: 8, pasos: { porfacturar: 0, facturada: 4 }, obs: "Descuento del 8 % por volumen. Entrega en dos despachos." },
    "CO-2026-011": { fecha: "2026-09-09", cli: "CL-005", vend: "Marcela Duarte", pares: 40, estado: "porfacturar", factura: "",
                     ref: "REF-1043", desc: 5, pasos: { porfacturar: 0 }, obs: "Entrega en 8 días hábiles después de facturada." },
    "CO-2026-012": { fecha: "2026-09-11", cli: "CL-002", vend: "Valentina Rojas", pares: 35, estado: "porfacturar", factura: "",
                     ref: "REF-1042", desc: 0, pasos: { porfacturar: 0 }, obs: "Entrega en Cúcuta, en la bodega del cliente." },
    "CO-2026-013": { fecha: "2026-09-14", cli: "CL-006", vend: "Andrés Quintero", pares: 40, estado: "porfacturar", factura: "",
                     ref: "REF-1044", desc: 5, pasos: { porfacturar: 1 }, obs: "Surtido escolar: entrega antes del 30 de septiembre." },
    "CO-2026-014": { fecha: "2026-09-15", cli: "CL-007", vend: "Valentina Rojas", pares: 12, estado: "porfacturar", factura: "",
                     ref: "REF-1043", desc: 0, pasos: { porfacturar: 0 }, obs: "" },
    "CO-2026-015": { fecha: "2026-09-17", cli: "CL-001", vend: "Andrés Quintero", pares: 60, estado: "facturada", factura: "FV-2026-0158",
                     ref: "REF-1042", desc: 5, pasos: { porfacturar: 0, facturada: 3 }, obs: "Entrega en 8 días hábiles después de facturada." },
    "CO-2026-016": { fecha: "2026-09-21", cli: "CL-008", vend: "Valentina Rojas", pares: 55, estado: "porfacturar", factura: "",
                     ref: "REF-1044", desc: 3, pasos: { porfacturar: 0 }, obs: "Pago de contado contra entrega en Ocaña." },
    "CO-2026-017": { fecha: "2026-09-22", cli: "CL-003", vend: "Marcela Duarte", pares: 48, estado: "porfacturar", factura: "",
                     ref: "REF-1043", desc: 5, pasos: { porfacturar: 0 }, obs: "" },
    "CO-2026-018": { fecha: "2026-09-23", cli: "CL-004", vend: "Valentina Rojas", pares: 18, estado: "borrador", factura: "",
                     ref: "REF-1042", desc: 0, pasos: {}, obs: "Falta confirmar las tallas con la clienta." }
  };

  var detalleDesde = null;   // la fila que abrió el detalle, para devolverle el foco

  /* Reparte los pares de una cotización de ejemplo como viene lo asignado: más
     pares en las tallas y en los colores que más hay. Con menos de 30 pares va
     en un color; con menos de 60, en dos; si no, en tres */
  function curvaDe(p, pares, desc) {
    var usar = colores(p).slice().sort(function (a, b) { return paresDelColor(p, b) - paresDelColor(p, a); })
                         .slice(0, pares < 30 ? 1 : pares < 60 ? 2 : 3);
    var celdas = [];
    colores(p).forEach(function (color) {
      if (usar.indexOf(color) < 0) return;
      p.colores[color].forEach(function (hay, i) {
        if (hay > 0) celdas.push({ color: color, talla: p.tallas[i], peso: hay });
      });
    });
    var peso = celdas.reduce(function (s, x) { return s + x.peso; }, 0), puestos = 0;
    celdas.forEach(function (x) {
      x.exacto = pares * x.peso / peso;
      x.cant = Math.floor(x.exacto);
      puestos += x.cant;
    });
    // Los pares que sobran del redondeo van a las tallas a las que más les faltó
    celdas.slice().sort(function (a, b) { return (b.exacto - b.cant) - (a.exacto - a.cant); })
          .slice(0, pares - puestos).forEach(function (x) { x.cant++; });
    return celdas.filter(function (x) { return x.cant > 0; }).map(function (x) {
      return { ref: p.ref, color: x.color, talla: x.talla, cant: x.cant, desc: desc };
    });
  }

  /* Una cotización armada desde HISTORIAL, con la misma forma que "cot" */
  function cotizacionDe(numero) {
    var h = HISTORIAL[numero];
    if (!h) return null;
    var fecha = new Date(h.fecha + "T00:00");
    var q = {
      numero: numero,
      estado: h.estado,
      fecha: fecha,
      vence: sumarDias(fecha, VIGENCIA),
      cliente: clientePor(h.cli),
      vendedor: h.vend,
      factura: h.factura || "",
      obs: h.obs || "",
      motivo: h.motivo || "",
      pasos: h.pasos || {},
      lineas: h.lineas,
      descuentos: JSON.parse(JSON.stringify(h.descuentos || {}))
    };
    if (!q.lineas) {                      // una de ejemplo: un modelo, con su curva
      q.lineas = curvaDe(productoPor(h.ref), h.pares, h.desc);
      q.descuentos[h.ref] = h.desc;
    }
    return q;
  }

  /* La de una fila de la tabla */
  function detalleDe(tr) { return cotizacionDe(textoDe(tr, "Cotización")); }

  /* Días que faltan para una fecha: 0 es hoy, negativo si ya pasó */
  function diasHasta(d) {
    var hoy0 = new Date();
    hoy0.setHours(0, 0, 0, 0);
    return Math.round((d - hoy0) / 86400000);
  }
  /* "A", "A y B", "A, B y C" */
  function enLista(cosas) {
    return cosas.length < 2 ? cosas.join("") : cosas.slice(0, -1).join(", ") + " y " + cosas[cosas.length - 1];
  }

  /* Una fecha o un código que no se parte al final del renglón */
  function sinPartir(texto) { return '<span class="cot-det__nw">' + texto + "</span>"; }

  /* El estado dicho con palabras: qué pasó, cuándo y qué sigue */
  function textoEstado(q) {
    var p = q.pasos, falta = diasHasta(q.vence), vence = sinPartir(fechaLarga(q.vence));
    var el = function (dias) { return sinPartir(fechaLarga(sumarDias(q.fecha, dias || 0))); };
    var plazo = falta > 1 ? "quedan " + falta + " días" : falta === 1 ? "vence mañana" : falta === 0 ? "vence hoy" : "ya venció";
    return {
      borrador: "<b>Todavía no se ha enviado a Facturación.</b> Se guardó como borrador el " + el(0) +
                " y vale hasta el " + vence + " (" + plazo + ").",
      porfacturar: "<b>Está en Facturación desde el " + el(p.porfacturar) + ".</b> Falta facturarla antes del " + vence +
                   " (" + plazo + ")." + (falta <= 1 ? " Si no se factura, se vence." : ""),
      facturada: "<b>Se facturó el " + el(p.facturada) + " con la factura " + sinPartir(q.factura) + ".</b> Ya es una venta.",
      vencida: p.porfacturar !== undefined
        ? "<b>Venció el " + vence + " sin facturarse.</b> " + (q.motivo ? q.motivo + " " : "") + "Para retomarla hay que hacer una nueva."
        : "<b>Venció el " + vence + " sin enviarse a Facturación:</b> se quedó en borrador. Para retomarla hay que hacer una nueva."
    }[q.estado];
  }

  /* El recorrido: Borrador → Por facturar → Facturada, con la fecha de cada paso.
     Si se venció, el camino termina ahí (en borrador o ya en Facturación) */
  function recorridoHtml(q) {
    var p = q.pasos, enviada = p.porfacturar !== undefined;
    var pasos = q.estado !== "vencida" ? ["borrador", "porfacturar", "facturada"]
              : enviada ? ["borrador", "porfacturar", "vencida"] : ["borrador", "vencida"];
    return '<ol class="cot-rec" aria-label="Recorrido de la cotización">' + pasos.map(function (e, i) {
      var fecha = e === "borrador" ? q.fecha : e === "vencida" ? q.vence
                : p[e] !== undefined ? sumarDias(q.fecha, p[e]) : null;
      var ahora = e === q.estado;
      var clase = e === "vencida" ? "is-mal" : e === "facturada" && ahora ? "is-hecho is-fin"
                : ahora ? "is-ahora" : fecha ? "is-hecho" : "";
      var marca = e === "vencida" ? "!" : (fecha && !ahora) || e === "facturada" && ahora ? "✓" : i + 1;
      return '<li class="cot-rec__p' + (clase ? " " + clase : "") + '"' + (ahora ? ' aria-current="step"' : "") + ">" +
        '<span class="cot-rec__n" aria-hidden="true">' + marca + "</span>" +
        "<b>" + nombreEstado(e) + "</b><small>" + (fecha ? fechaCorta(fecha) : "pendiente") + "</small></li>";
    }).join("") + "</ol>";
  }

  function pintarDetalle(q) {
    var t = totales(q), refs = refsEnCotizacion(q), c = q.cliente, vs = vencidasDe(c);
    uno("#cot-det-t").textContent = "Cotización " + q.numero;
    uno("#cot-det-sub").textContent = c.nombre + " · " + cuantas(t.pares, "par", "pares") + " · " + pesos(t.total);

    // El estado: la píldora, qué pasó y qué sigue, el recorrido y, si todavía no se ha
    // facturado, la regla de Facturación: nada de facturar con facturas vencidas
    var estado = uno("#cot-det-estado");
    estado.className = "cot-det__estado cot-det__estado--" + TONO_ESTADO[q.estado];
    estado.innerHTML = '<div class="cot-det__estado-cab"><span class="pill pill--' + TONO_ESTADO[q.estado] + '">' +
        nombreEstado(q.estado) + "</span><p>" + textoEstado(q) + "</p></div>" + recorridoHtml(q) +
      (["borrador", "porfacturar"].indexOf(q.estado) >= 0 && vs.length
        ? avisoHtml("crit", "Facturación no la puede facturar mientras el cliente tenga facturas vencidas",
            c.nombre + " debe " + enLista(vs.map(function (v) {
              return sinPartir(v.factura) + " (" + pesos(v.total) + ", vencida hace " + sinPartir(cuantas(v.dias, "día", "días")) + ")";
            })) + ". Primero tiene que pagarlas.")
        : "");

    uno("#cot-det-ficha").innerHTML =
      seccion("Cliente", '<b class="cot-det__cli">' + c.nombre + '</b><span class="tiny">NIT ' + c.nit + " · " + c.ciudad + "</span>" +
                         kv("Contacto", c.contacto) + kv("Teléfono", c.telefono) + kv("Forma de pago", c.pago)) +
      seccion("Datos", kv("Fecha", fechaLarga(q.fecha)) + kv("Válida hasta", fechaLarga(q.vence)) +
                       kv("Vendedor", q.vendedor) +
                       // Al enviarla a Facturación, al cliente le llega el PDF: solo para que la conozca
                       (q.pasos.porfacturar !== undefined ? kv("PDF enviado a", c.correo.replace("@", "@<wbr>")) : "") +
                       (q.factura ? kv("Factura", q.factura) : ""));

    uno("#cot-det-prod-sub").textContent = cuantas(refs.length, "modelo", "modelos") + " · " + cuantas(t.pares, "par", "pares");
    uno("#cot-det-lineas").innerHTML = refs.map(function (ref) { return itemCotizacionHtml(ref, q, true); }).join("");
    var obs = uno("#cot-det-obs");
    obs.textContent = q.obs || "Sin observaciones.";
    obs.classList.toggle("is-vacio", !q.obs);
    uno("#cot-det-tot").innerHTML = totalesHtml(t);
  }

  function detalleAbierto() {
    var caja = uno("#cot-det");
    return !!caja && !caja.hidden;
  }

  function abrirDetalle(tr) {
    var caja = uno("#cot-det");
    if (detalleDesde) detalleDesde.classList.remove("is-sel");
    detalleDesde = tr;
    tr.classList.add("is-sel");
    pintarDetalle(detalleDe(tr));
    caja.hidden = false;
    uno(".cot-det__cuerpo", caja).scrollTop = 0;
    uno(".cot-det", caja).focus();
  }

  function cerrarDetalle() {
    if (!detalleAbierto()) return;
    uno("#cot-det").hidden = true;
    if (!detalleDesde) return;
    detalleDesde.classList.remove("is-sel");
    var b = uno(".dt__ver", detalleDesde);
    detalleDesde = null;
    if (b) b.focus();
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest || !uno("#cot-det")) return;
    if (detalleAbierto()) {
      // Se cierra con la ✕ o pulsando fuera del panel
      if (e.target === uno("#cot-det") || e.target.closest('[data-det="cerrar"]')) cerrarDetalle();
      return;
    }
    var tr = e.target.closest("#dt-cot tbody tr[data-estado]");
    if (!tr || e.target.closest("a, input, select")) return;
    if (String(window.getSelection && window.getSelection()).trim()) return;   // estaba copiando texto de la fila
    abrirDetalle(tr);
  });

  // Con el detalle abierto, Esc lo cierra y el Tab no se sale de él
  document.addEventListener("keydown", function (e) {
    if (!detalleAbierto()) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      return cerrarDetalle();
    }
    if (e.key === "Tab") {
      var f = todos('[data-det="cerrar"], .cot-det__cuerpo', uno("#cot-det"));
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
    }
  }, true);

  /* ---------------------------------------------------------------- 12. Facturación

     10-facturacion.html es la lista de facturas: la misma tabla de datos de
     Cotizaciones, con sus tarjetas (por cobrar, pagadas y vencidas).
     10-facturacion-nueva.html hace una factura: se elige una cotización por
     facturar, se trae todo su detalle (cliente y productos), se escoge el método
     de pago y se factura. En tres columnas, como una caja registradora.
     REGLA: a un cliente con facturas vencidas no se le factura hasta que pague;
     la pantalla dice cuáles, cuándo vencieron, hace cuánto y por cuánto.
     Al facturar, la cotización queda Facturada con el número de su factura. */

  var FACTURAS = "10-facturacion.html";
  var FAC_NUEVA = "10-facturacion-nueva.html";

  /* Los estados de una factura: se cobra (a crédito), se paga o se vence */
  var ESTADOS_FAC = ["porcobrar", "vencida", "pagada"];
  var NOMBRE_FAC = { porcobrar: "Por cobrar", vencida: "Vencida", pagada: "Pagada" };
  var TONO_FAC = { porcobrar: "warn", vencida: "crit", pagada: "ok" };

  /* Quien entró al sistema en Facturación. Sin inicio de sesión no se puede saber solo */
  var FACTURADOR = { nombre: "Laura Méndez", codigo: "FAC-01" };

  /* Los métodos de pago de contado; el crédito depende del cliente */
  var PAGOS = [
    { valor: "Efectivo", ayuda: "Paga ahora, en caja" },
    { valor: "Transferencia", ayuda: "Paga ahora, a la cuenta de la empresa" },
    { valor: "Tarjeta", ayuda: "Débito o crédito, con datáfono" }
  ];

  var facNuevas = [];   // las que se acaban de hacer y todavía no están en la tabla
  var ultimaFac = 158;  // el consecutivo más alto: FV-2026-0158
  var fac = null;       // la factura que se está haciendo

  /* ---- La tabla de facturas ---- */

  TABLAS["dt-fac"] = {
    codigo: "Factura", una: "factura", plural: "facturas", unaOVarias: "factura(s)",
    estados: ESTADOS_FAC, nombres: NOMBRE_FAC,
    nombreFiltro: {
      codigo: "Factura", cliente: "Cliente", cotizacion: "Cotización", pago: "Pago", estado: "Estado",
      valorMin: "Valor desde", valorMax: "Valor hasta", desde: "Fecha desde", hasta: "Fecha hasta"
    },
    filtros: {
      codigo: contiene("Factura"),
      cliente: contiene("Cliente"),
      cotizacion: contiene("Cotización"),
      pago: function (tr, v) { return textoDe(tr, "Pago") === v; }
    },
    claves: {},
    columnas: { cliente: "Cliente", cotizacion: "Cotización", pago: "Pago" },
    buscar: function (tr) { return tr.textContent + " " + celda(tr, "Cliente").title; },
    contar: contarFacturas,
    alEntrar: entrarAFacturas
  };

  /* Las tarjetas cuentan TODAS las facturas, no solo las filtradas */
  function contarFacturas(filas) {
    function de(estado) {
      return filas.filter(function (tr) { return tr.getAttribute("data-estado") === estado; });
    }
    function valor(lista) { return lista.reduce(function (s, tr) { return s + valorDe(tr); }, 0); }
    var total = valor(filas), porCobrar = de("porcobrar"), pagadas = de("pagada"), vencidas = de("vencida");
    var deudores = [];
    vencidas.forEach(function (tr) {
      var c = textoDe(tr, "Cliente");
      if (deudores.indexOf(c) < 0) deudores.push(c);
    });
    ponerKpi("todas", filas.length, pesos(total) + " facturado");
    ponerKpi("porcobrar", porCobrar.length, pesos(valor(porCobrar)));
    ponerKpi("pagada", pagadas.length, pesos(valor(pagadas)) + " · " + (total ? Math.round(100 * valor(pagadas) / total) : 0) + " %");
    ponerKpi("vencida", vencidas.length, pesos(valor(vencidas)) + (deudores.length ? " · " + cuantas(deudores.length, "cliente", "clientes") : ""));
  }

  /* La fila de una factura recién hecha, igual a las que trae el HTML */
  function filaFactura(f) {
    var vence = f.vence
      ? '<td class="dt__fec" data-l="Vence" title="Vence el ' + fechaLarga(f.vence) + '">en ' + diasHasta(f.vence) + " días</td>"
      : '<td class="dt__fec" data-l="Vence"><span class="dt__sinf">—</span></td>';
    return '<tr class="es-nueva" data-estado="' + f.estado + '" data-fecha="' + fechaIso(f.fecha) +
      '" data-vence="' + (f.vence ? fechaIso(f.vence) : "") + '" data-valor="' + f.valor + '">' +
      '<td data-l="Factura"><b>' + f.numero + "</b></td>" +
      '<td class="dt__fec" data-l="Fecha">' + fechaCorta(f.fecha) + "</td>" +
      '<td class="dt__cli" data-l="Cliente" title="' + esc(f.cliente.nombre) + " · NIT " + f.cliente.nit + '">' +
        esc(f.cliente.nombre) + "</td>" +
      '<td data-l="Cotización">' + f.cotizacion + "</td>" +
      '<td data-l="Pago">' + f.pago + "</td>" +
      '<td class="num" data-l="Valor">' + pesos(f.valor) + "</td>" + vence +
      '<td data-l="Estado"><span class="pill pill--' + TONO_FAC[f.estado] + '">' + NOMBRE_FAC[f.estado] + "</span></td></tr>";
  }

  function entrarAFacturas(dt, cuerpo) {
    var hubo = facNuevas.length > 0;
    if (hubo) {
      todos("tr.es-nueva", cuerpo).forEach(function (tr) { tr.classList.remove("es-nueva"); });
      while (facNuevas.length) cuerpo.insertAdjacentHTML("afterbegin", filaFactura(facNuevas.shift()));
    }
    todos("tr[data-estado]", cuerpo).forEach(function (tr) {
      ultimaFac = Math.max(ultimaFac, cola(textoDe(tr, "Factura")));
    });
    return hubo;
  }

  /* ---- El total en letras, como va en la factura ----
     2.470.000 → "Dos millones cuatrocientos setenta mil pesos" */

  var UNIDADES = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez",
                  "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
                  "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis",
                  "veintisiete", "veintiocho", "veintinueve"];
  var DECENAS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  var CENTENAS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos",
                  "setecientos", "ochocientos", "novecientos"];

  /* De 1 a 999 */
  function hastaMil(n) {
    if (n === 100) return "cien";
    var c = Math.floor(n / 100), r = n % 100, t = [];
    if (c) t.push(CENTENAS[c]);
    if (r >= 30) t.push(DECENAS[Math.floor(r / 10)] + (r % 10 ? " y " + UNIDADES[r % 10] : ""));
    else if (r) t.push(UNIDADES[r]);
    return t.join(" ");
  }
  /* "uno" se acorta antes de mil, de millones y de pesos: veintiún mil, treinta y un pesos */
  function acortar(t) { return t.replace(/veintiuno$/, "veintiún").replace(/uno$/, "un"); }

  function enLetras(n) {
    n = Math.round(n);
    if (n === 0) return "Cero pesos";
    var millones = Math.floor(n / 1000000), miles_ = Math.floor(n / 1000) % 1000, resto = n % 1000, t = [];
    if (millones === 1) t.push("un millón");
    else if (millones) {
      var mm = Math.floor(millones / 1000), mr = millones % 1000;
      t.push((mm ? (mm === 1 ? "mil" : acortar(hastaMil(mm)) + " mil") + (mr ? " " : "") : "") +
             (mr ? acortar(hastaMil(mr)) : "") + " millones");
    }
    if (miles_) t.push(miles_ === 1 ? "mil" : acortar(hastaMil(miles_)) + " mil");
    if (resto) t.push(acortar(hastaMil(resto)));
    var texto = t.join(" ") + (millones && !miles_ && !resto ? " de" : "") + (n === 1 ? " peso" : " pesos");
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  /* ---- Nueva factura ---- */

  /* Las cotizaciones que esperan factura, la que vence primero arriba */
  function porFacturar() {
    return Object.keys(HISTORIAL).filter(function (n) { return HISTORIAL[n].estado === "porfacturar"; })
      .map(cotizacionDe)
      .sort(function (a, b) { return (a.vence - b.vence) || (cola(a.numero) - cola(b.numero)); });
  }

  function plazoDe(c) {
    var m = /(\d+)\s*días/.exec(c.pago);
    return m ? numero(m[1]) : 0;
  }

  /* Lo que decide si se puede facturar y cómo se paga */
  function estadoFactura() {
    var q = fac.cot ? cotizacionDe(fac.cot) : null;
    var r = { q: q, t: q ? totales(q) : null, c: q ? q.cliente : null };
    if (!q) return r;
    r.vencidas = vencidasDe(r.c);
    r.libre = Math.max(0, r.c.cupo - r.c.saldo);
    r.plazo = plazoDe(r.c);
    r.tieneCredito = r.plazo > 0;
    r.pasaCupo = r.t.total > r.libre;
    return r;
  }

  function iniciarFactura() {
    var form = uno("#fac-form");
    if (form.getAttribute("data-listo")) return;   // volvió a una que dejó a medias
    form.setAttribute("data-listo", "1");
    var dia = new Date();
    fac = { cot: null, pago: "", q: "", iq: "", fecha: dia };
    uno("#fac-fecha").textContent = fechaLarga(dia);
    uno("#fac-dia").textContent = DIAS[dia.getDay()] + " · la pone el sistema";
    uno("#fac-quien").textContent = FACTURADOR.nombre;
    uno("#fac-q").value = "";
    uno("#fac-iq").value = "";
    pintarFactura();
  }

  function pintarFactura() {
    var r = estadoFactura(), q = r.q, c = r.c;
    var bloqueada = !!q && r.vencidas.length > 0;
    var listo = !!q && !bloqueada && !!fac.pago;

    // El estado y los pasos: 1 elegir la cotización, 2 el pago, 3 facturar
    var estado = uno("#fac-estado");
    estado.className = "pill pill--" + (bloqueada ? "crit" : "off");
    estado.textContent = bloqueada ? "No se puede facturar" : "Sin facturar";
    var paso = !q ? 1 : (!fac.pago || bloqueada) ? 2 : 3;
    todos(".cot-cab .step").forEach(function (s, i) {
      s.classList.toggle("done", i + 1 < paso);
      s.classList.toggle("now", i + 1 === paso);
    });

    // Los datos de arriba
    var num = uno("#fac-num");
    num.textContent = "Se asigna al facturar";
    uno("#fac-cot").textContent = q ? q.numero : "Sin elegir";
    uno("#fac-cot").classList.toggle("cot-dato--vacio", !q);
    uno("#fac-cot-sub").textContent = q ? "de " + q.vendedor + " · " + plazoTexto(q.vence) : "Elíjala a la izquierda";

    // Columna 1: el cliente y las cotizaciones por facturar
    uno("#fac-cot-ayuda").textContent = q ? "La que se va a facturar" : "Seleccione la cotización que va a facturar";
    uno("#fac-cli").innerHTML = q ? clienteFacturaHtml(c, r) : "";
    uno("#fac-cli").hidden = !q;
    pintarOpciones();

    // Columna 2: los productos
    var refs = q ? refsEnCotizacion(q) : [];
    uno("#fac-items-sub").textContent = q ? cuantas(refs.length, "modelo", "modelos") + " · " + cuantas(r.t.pares, "par", "pares")
                                          : "Items: 0";
    var iq = sinTildes(fac.iq.trim());
    var vistos = refs.filter(function (ref) {
      if (!iq) return true;
      var p = productoPor(ref);
      return sinTildes(p.nombre + " " + p.ref + " " + Object.keys(resumenDe(ref, q).colores).join(" ")).indexOf(iq) >= 0;
    });
    uno("#fac-lineas").innerHTML = !q
      ? '<div class="cot-vacio">' + icono("zapato", 30) + "<b>Todavía no hay productos</b>" +
        "<p>Seleccione una cotización por facturar para traer su cliente, sus productos y sus totales.</p></div>"
      : vistos.length ? vistos.map(function (ref) { return itemCotizacionHtml(ref, q, true); }).join("")
      : '<p class="cot-vacio">Ningún producto de la factura coincide con la búsqueda.</p>';
    uno("#fac-obs").textContent = q ? (q.obs || "Sin observaciones.") : "—";
    uno("#fac-obs").classList.toggle("is-vacio", !q || !q.obs);

    // Columna 3: totales, total en letras, pago, avisos y Facturar
    var t = r.t || { bruto: 0, descuento: 0, iva: 0, total: 0, pares: 0, porIva: {}, sinIva: 0 };
    uno("#fac-tot").innerHTML = totalesHtml(t);
    uno("#fac-letras").innerHTML = "<b>Son:</b> " + enLetras(t.total);
    uno("#fac-pago").innerHTML = pagoHtml(r);
    uno("#fac-pago").disabled = !q || bloqueada;
    uno("#fac-avisos").innerHTML = avisosFacturaHtml(r);
    var facturar = uno('[data-fac="facturar"]');
    facturar.disabled = !listo;
    uno("#fac-msg").textContent = !q ? "Seleccione la cotización que va a facturar."
      : bloqueada ? "No se puede facturar hasta que " + c.nombre + " pague sus facturas vencidas."
      : !fac.pago ? "Escoja el método de pago."
      : "Todo listo: al facturar, la factura toma su número y la cotización queda facturada.";
  }

  function plazoTexto(vence) {
    var d = diasHasta(vence);
    return d > 1 ? "vence en " + d + " días" : d === 1 ? "vence mañana" : d === 0 ? "vence hoy" : "ya venció";
  }

  /* El cliente, con todo lo que va en la factura */
  function clienteFacturaHtml(c, r) {
    var e = estadoCliente(c), n = r.vencidas.length;
    var estados = (n ? '<span class="pill pill--crit">' + cuantas(n, "factura vencida", "facturas vencidas") + "</span>" : "") +
                  (!n || e.tono !== "ok" ? '<span class="pill pill--' + e.tono + '">' + e.texto + "</span>" : "");
    return '<div class="fac-cli">' +
      '<span class="avatar" aria-hidden="true">' + iniciales(c.nombre) + "</span>" +
      '<div class="fac-cli__x">' +
        "<b>" + c.nombre + "</b>" +
        "<span><b>NIT:</b> " + c.nit + "</span>" +
        "<span><b>Dir:</b> " + c.direccion + " · " + c.barrio + " · " + c.ciudad + "</span>" +
        "<span><b>Correo:</b> " + c.correo.replace("@", "@<wbr>") + "</span>" +
        "<span><b>Tel:</b> " + c.telefono + " · " + c.contacto + "</span>" +
        '<span class="fac-cli__credito">' + c.pago + (r.tieneCredito ? " · disponible " + pesos(r.libre) : "") + "</span>" +
        '<span class="cot-ficha__estados">' + estados + "</span>" +
      "</div>" +
      '<button class="fac-cli__quitar" type="button" data-fac="quitar-cot" aria-label="Quitar la cotización elegida" title="Quitar la cotización elegida">' +
        icono("cerrar", 16) + "</button></div>";
  }

  /* Las cotizaciones por facturar, como tarjetas para elegir */
  function pintarOpciones() {
    var q = sinTildes(fac.q.trim()), pegado = q.replace(/[.\-]/g, "");
    var todas = porFacturar();
    var vistas_ = todas.filter(function (x) {
      if (!q) return true;
      var todo = sinTildes(x.numero + " " + x.cliente.nombre + " " + x.cliente.nit + " " + x.vendedor);
      return todo.indexOf(q) >= 0 || (pegado && todo.replace(/[.\-]/g, "").indexOf(pegado) >= 0);
    });
    uno("#fac-lista").innerHTML = !todas.length
      ? '<p class="cot-vacio">No hay cotizaciones por facturar. Cuando Ventas envíe una, aparece aquí.</p>'
      : !vistas_.length ? '<p class="cot-vacio">Ninguna cotización por facturar coincide con la búsqueda.</p>'
      : vistas_.map(function (x) {
          var t = totales(x), n = x.cliente.vencidas.length, on = x.numero === fac.cot;
          return '<button type="button" class="fac-op' + (on ? " is-on" : "") + (n ? " is-mal" : "") + '" role="option" aria-selected="' + on + '"' +
            ' data-fac-cot="' + x.numero + '">' +
            '<span class="fac-op__cab"><b>' + x.numero + '</b><b class="fac-op__total">' + pesos(t.total) + "</b></span>" +
            '<span class="fac-op__cli">' + x.cliente.nombre + " · " + cuantas(t.pares, "par", "pares") + "</span>" +
            '<span class="fac-op__pie">' + nombreCorto(x.vendedor) + " · " + plazoTexto(x.vence) + "</span>" +
            (n ? '<span class="fac-op__mal">' + icono("alerta", 14) + cuantas(n, "factura vencida", "facturas vencidas") +
                 ": no se puede facturar</span>" : "") +
            "</button>";
        }).join("");
  }

  /* El método de pago: los de contado siempre; el crédito si el cliente lo tiene y le alcanza el cupo */
  function pagoHtml(r) {
    var h = '<legend class="cot-det__t">Método de pago</legend>';
    h += PAGOS.map(function (p) {
      return opcionPago(p.valor, p.valor, p.ayuda, "", false);
    }).join("");
    if (!r.q) return h + opcionPago("credito", "Crédito", "Según el plazo del cliente", "", true);
    if (!r.tieneCredito) return h + opcionPago("credito", "Crédito", r.c.nombre + " paga de contado", "", true);
    if (r.pasaCupo) {
      return h + opcionPago("credito", r.c.pago, "Pasa del cupo disponible por " + pesos(r.t.total - r.libre) +
                            ": cóbrela de contado o espere a que el cliente abone", "is-mal", true);
    }
    var vence = sumarDias(fac.fecha, r.plazo);
    return h + opcionPago("credito", r.c.pago, "Paga a más tardar el " + fechaLarga(vence) + " · usa " + pesos(r.t.total) +
                          " de los " + pesos(r.libre) + " del cupo", "", false);
  }

  function opcionPago(valor, titulo, ayuda, clase, apagada) {
    var on = fac.pago === valor && !apagada;
    return '<label class="fac-pago__op' + (valor === "credito" ? " fac-pago__op--ancha" : "") + (apagada ? " is-off" : "") +
      (clase ? " " + clase : "") + (on ? " is-on" : "") + '">' +
      '<input type="radio" name="fac-pago" value="' + valor + '"' + (on ? " checked" : "") + (apagada ? " disabled" : "") + ">" +
      "<span><b>" + titulo + "</b><small>" + ayuda + "</small></span></label>";
  }

  /* La regla de Facturación: con facturas vencidas no se factura. Dice cuáles,
     cuándo vencieron, hace cuánto y por cuánto */
  function avisosFacturaHtml(r) {
    if (!r.q || !r.vencidas.length) return "";
    return '<div class="cot-vencidas">' +
      '<div class="cot-vencidas__cab">' + icono("alerta", 20) +
        "<div><b>No se puede facturar: " + cuantas(r.vencidas.length, "factura vencida", "facturas vencidas") +
        " por " + pesos(totalVencido(r.c)) + "</b>" +
        "<p>" + r.c.nombre + " tiene que pagarlas primero. La cotización sigue por facturar hasta que pague.</p></div></div>" +
      // En la columna angosta va como lista: cada factura con su total, cuándo venció y hace cuánto
      '<ul class="fac-venc">' + r.vencidas.map(function (v) {
        return '<li><span class="fac-venc__cab"><b>' + v.factura + "</b><b>" + pesos(v.total) + "</b></span>" +
          "<span>Venció el " + fechaLarga(v.vence) + " · hace " + cuantas(v.dias, "día", "días") + "</span></li>";
      }).join("") + "</ul></div>";
  }

  /* Elegir otra cotización empieza de nuevo el pago y la búsqueda de productos */
  function elegirCotizacion(numero) {
    if (fac.cot !== numero) {
      fac.cot = numero;
      fac.pago = "";
      fac.iq = "";
      uno("#fac-iq").value = "";
    }
    pintarFactura();
  }

  /* Facturar: la factura toma su número, la cotización queda facturada y se vuelve a la lista */
  function facturar() {
    var r = estadoFactura();
    if (!r.q) return aviso("Seleccione la cotización que va a facturar.", "crit");
    if (r.vencidas.length) return aviso("No se puede facturar: " + r.c.nombre + " tiene facturas vencidas.", "crit");
    if (!fac.pago) return aviso("Escoja el método de pago.", "crit");
    var credito = fac.pago === "credito";
    if (credito && (!r.tieneCredito || r.pasaCupo)) return aviso("Ese cliente no puede pagar esta factura a crédito.", "crit");
    var hoy0 = new Date(fac.fecha.getTime());
    hoy0.setHours(0, 0, 0, 0);
    ultimaFac += 1;
    var numeroFac = "FV-2026-" + ("000" + ultimaFac).slice(-4);
    var vence = credito ? sumarDias(hoy0, r.plazo) : null;
    facNuevas.push({ numero: numeroFac, fecha: hoy0, cliente: r.c, cotizacion: r.q.numero,
                     pago: credito ? r.c.pago : fac.pago, vence: vence, valor: r.t.total,
                     estado: credito ? "porcobrar" : "pagada" });
    // A crédito, el cliente queda debiendo: le baja el cupo disponible
    if (credito) r.c.saldo += r.t.total;
    // La cotización queda facturada: se ve en su lista y en su detalle
    var h = HISTORIAL[r.q.numero];
    h.estado = "facturada";
    h.factura = numeroFac;
    h.pasos = JSON.parse(JSON.stringify(h.pasos || {}));
    h.pasos.facturada = Math.round((hoy0 - new Date(h.fecha + "T00:00")) / 86400000);
    aviso(numeroFac + " facturada a " + r.c.nombre + " por " + pesos(r.t.total) + " · " +
          (credito ? "a crédito, vence el " + fechaLarga(vence) : "pagada con " + fac.pago.toLowerCase()) +
          ". La cotización " + r.q.numero + " quedó facturada.", "ok");
    fac = null;
    ir(FACTURAS, true);
    delete guardadas[FAC_NUEVA];   // la próxima "Nueva factura" empieza en blanco
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest || !fac || !uno("#fac-form")) return;
    var op = e.target.closest("[data-fac-cot]");
    if (op) return elegirCotizacion(op.getAttribute("data-fac-cot"));
    var b = e.target.closest("[data-fac]");
    if (!b) return;
    var que = b.getAttribute("data-fac");
    if (que === "quitar-cot") {
      fac.cot = null;
      fac.pago = "";
      pintarFactura();
      uno("#fac-q").focus();
    }
    if (que === "facturar") facturar();
    if (que === "cancelar") {
      fac = null;
      ir(FACTURAS, true);
      delete guardadas[FAC_NUEVA];
    }
  });

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!fac || t.name !== "fac-pago") return;
    fac.pago = t.value;
    pintarFactura();
    var el = uno('input[name="fac-pago"][value="' + fac.pago + '"]');
    if (el) el.focus();
  });

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (!fac) return;
    if (t.id === "fac-q") { fac.q = t.value; pintarOpciones(); }
    if (t.id === "fac-iq") { fac.iq = t.value; pintarFactura(); uno("#fac-iq").focus(); }
  });

  /* ---------------------------------------------------------------- 13. Arranque */

  marcarMenu();
  history.replaceState({ pantalla: actual }, "", actual);
  alEntrar();
})();
