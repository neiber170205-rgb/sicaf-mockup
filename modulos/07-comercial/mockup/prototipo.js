/* =====================================================================
   07-comercial/mockup/prototipo.js

   Hace que el mockup de Comercial RESPONDA: registrar clientes, generar
   cotizaciones, convertirlas en pedido, confirmar, mandar a Logística,
   cambiar cupos, eliminar y filtrar, sin recargar la página.

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
  var actual = (location.pathname.split("/").pop() || "04-clientes.html");
  if (!ES_PANTALLA.test(actual)) actual = "04-clientes.html";
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
