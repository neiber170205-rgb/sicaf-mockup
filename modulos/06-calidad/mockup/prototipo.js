/* =====================================================================
   06-calidad/mockup/prototipo.js

   Hace que el mockup de Control de Calidad RESPONDA: filtra las tablas,
   registra inspecciones, no conformidades y auditorías, cambia estados y
   pasa de una pantalla a otra sin recargar.

   Mismo motor que el de 04-inventario, con los formularios de este módulo.
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
  var actual = (location.pathname.split("/").pop() || "01-proceso.html");
  if (!ES_PANTALLA.test(actual)) actual = "01-proceso.html";
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
    if (actual !== "01-proceso.html") { ir("01-proceso.html", true); setTimeout(abrir, 260); }
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

  /* ---------------------------------------------------------------- 7. Los formularios de Calidad */

  /* --- Registrar la inspección de un lote (05) --- */
  function registrarInspeccion() {
    var lote = uno("#f-q-lote"), conf = uno("#f-q-conf"), rep = uno("#f-q-rep"),
        des = uno("#f-q-des"), def_ = uno("#f-q-def");
    var conformes = numero(conf && conf.value);
    if (!conformes) { if (conf) conf.focus(); return aviso("Escriba cuántas unidades salieron conformes.", "crit"); }

    var panel = panelPorTitulo("Lotes Inspeccionados");
    if (!panel) return aviso("Inspección registrada.", "ok");

    var rechazadas = numero(rep && rep.value) + numero(des && des.value);
    var total = conformes + rechazadas;
    var porcentaje = Math.round(conformes * 1000 / total) / 10;
    var aprueba = porcentaje >= 95;

    var fila = nuevaFila(panel, "Lote");
    ponerCelda(fila, "Lote", "<b>" + (lote ? lote.value.split("·")[0].trim() : "LT-NUEVO") +
               "</b><div class=\"tiny\">" + hoy() + "</div>");
    ponerCelda(fila, "Und.", miles(total));
    ponerCelda(fila, "Conformidad", porcentaje.toString().replace(".", ",") + "&nbsp;%");
    ponerCelda(fila, "Defecto", def_ && def_.value ? def_.value : "Sin defecto");
    ponerCelda(fila, "Estado", '<span class="pill pill--' + (aprueba ? "ok" : "crit") + '">' +
               (aprueba ? "Aprobado" : "Rechazado") + "</span>");
    recontar(panel, "lotes");
    if (conf) conf.value = "";
    aviso(aprueba
      ? "Lote aprobado con " + porcentaje + " % de conformidad · Inventario recibe " + conformes + " unidades."
      : "Lote rechazado con " + porcentaje + " % de conformidad · abra la no conformidad.",
      aprueba ? "ok" : "crit");
  }

  /* --- Abrir una no conformidad (06) --- */
  function abrirNoConformidad() {
    var lote = uno("#nc-lote"), desv = uno("#nc-desv"), causa = uno("#nc-causa"), acc = uno("#nc-acc");
    if (desv && !desv.value.trim()) { desv.focus(); return aviso("Escriba cuál es la desviación.", "crit"); }

    var panel = panelPorTitulo("No Conformidades");
    if (!panel) return aviso("No conformidad abierta.", "ok");

    var codigo = siguienteCodigo(panel, "NC");
    var fila = nuevaFila(panel, "NC");
    ponerCelda(fila, "NC", "<b>" + codigo + "</b><div class=\"tiny\">" + hoy() + "</div>");
    ponerCelda(fila, "Lote", lote ? lote.value.split("·")[0].trim() : "—");
    ponerCelda(fila, "Desviación", desv ? desv.value.trim() : "");
    ponerCelda(fila, "Análisis", causa && causa.value ? causa.value : "Por analizar");
    ponerCelda(fila, "Acción correctiva", acc && acc.value ? acc.value : "Por definir");
    ponerCelda(fila, "Estado", '<span class="pill pill--crit">Abierta</span>');
    recontar(panel, "no conformidades");
    sumarAlMenu("06-no-conformidades.html", 1);
    if (desv) desv.value = "";
    aviso("No conformidad " + codigo + " abierta · Producción recibe el aviso.", "crit");
  }

  /* --- Registrar una auditoría (07) --- */
  function registrarAuditoria() {
    var tipo = uno("#au-tipo"), doc = uno("#au-doc"), res = uno("#au-res"), obs = uno("#au-obs");
    var panel = panelPorTitulo("Auditorías Realizadas");
    if (!panel) return aviso("Auditoría registrada.", "ok");

    var codigo = siguienteCodigo(panel, "Auditoría");
    var conforme = res && res.value.toLowerCase().indexOf("no conforme") < 0;
    var fila = nuevaFila(panel, "Auditoría");
    ponerCelda(fila, "Auditoría", "<b>" + codigo + "</b><div class=\"tiny\">" + hoy() + "</div>");
    ponerCelda(fila, "Tipo", tipo ? tipo.value : "");
    ponerCelda(fila, "Documento", doc ? doc.value : "");
    ponerCelda(fila, "Resultado", '<span class="pill pill--' + (conforme ? "ok" : "crit") + '">' +
               (res ? res.value : "Conforme") + "</span>");
    ponerCelda(fila, "Observación", obs && obs.value.trim() ? obs.value.trim() : "Sin observaciones");
    recontar(panel, "auditorías");
    if (obs) obs.value = "";
    aviso("Auditoría " + codigo + " registrada · " + (res ? res.value.toLowerCase() : "conforme") + ".", conforme ? "ok" : "crit");
  }

  /* ---------------------------------------------------------------- 8. Un solo oyente para los botones */

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button") : null;
    if (!b) return;
    var texto = b.textContent.trim();

    if (texto === "Registrar inspección")  { e.preventDefault(); return registrarInspeccion(); }
    if (texto === "Abrir no conformidad")  { e.preventDefault(); return abrirNoConformidad(); }
    if (texto === "Registrar auditoría")   { e.preventDefault(); return registrarAuditoria(); }
    if (texto === "Registrar medición") {
      e.preventDefault();
      var fm = b.closest("tr");
      if (fm) {
        var c = celda(fm, "Criterio a verificar");
        if (c) c.innerHTML = c.innerHTML + ' <span class="pill pill--ok">Verificado</span>';
        fm.classList.add("es-nueva");
      }
      b.disabled = true;
      return aviso("Medición registrada contra el estándar de la etapa.", "ok");
    }

    if (texto === "Marcar atendida") {
      e.preventDefault();
      var noti = b.closest(".noti");
      if (noti) noti.classList.add("es-atendida");
      b.replaceWith(Object.assign(document.createElement("span"),
        { className: "pill pill--ok", textContent: "Atendida" }));
      contarPendientes(-1);
      return aviso("Pendiente marcado como atendido.", "ok");
    }

    if (texto === "Inspeccionar") {
      e.preventDefault();
      var fi = b.closest("tr");
      var ei = celda(fi, "Estado");
      if (ei) ei.innerHTML = '<span class="pill pill--ok">Aprobado</span>';
      fi.classList.add("es-nueva");
      b.disabled = true;
      var lt = (fi.querySelector("b") || {}).textContent || "El lote";
      return aviso(lt + " aprobado · Inventario recibe el producto terminado.", "ok");
    }

    if (texto === "Abrir NC") { e.preventDefault(); return ir("06-no-conformidades.html", true); }

    if (texto === "Cerrar") {
      e.preventDefault();
      var fc = b.closest("tr");
      var ec = celda(fc, "Estado");
      if (ec) ec.innerHTML = '<span class="pill pill--off">Cerrada</span>';
      fc.classList.add("es-nueva");
      b.disabled = true;
      sumarAlMenu("06-no-conformidades.html", -1);
      return aviso("No conformidad cerrada con su acción correctiva.", "ok");
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
