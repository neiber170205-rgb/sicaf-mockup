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
      refrescarVehiculos();
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
    var p = leerPedido(ped ? ped.options[ped.selectedIndex].text : "");

    if (!tra || !tra.value) return aviso("No hay vehículo que sirva para este pedido todavía.", "crit");

    var alistados = numero(alist && alist.value);
    if (alistados !== p.pares) {
      if (alist) alist.focus();
      return aviso("El pedido " + p.codigo + " es de " + p.pares + " pares y usted alistó " +
                   alistados + ". Mientras no coincidan, el despacho no cierra.", "crit");
    }

    var v = VEHICULOS.filter(function (x) { return x.placa === tra.value; })[0];
    if (!v) return aviso("Ese vehículo ya no está disponible.", "crit");
    if (libre(v) < p.pares) {
      return aviso("En el " + v.placa + " solo caben " + libre(v) + " pares más.", "crit");
    }

    var panel = panelPorTitulo("Órdenes de Despacho");
    if (!panel) return aviso("Despacho generado.", "ok");

    var codigo = siguienteCodigo(panel, "Despacho");
    var guia = nuevaGuia();
    var fila = nuevaFila(panel, "Despacho");
    ponerCelda(fila, "Despacho", "<b>" + codigo + "</b><div class=\"tiny\">" +
               p.codigo + " · ruta " + p.destino + "</div>");
    ponerCelda(fila, "Modelo", p.modelo + '<div class="tiny">' + p.pares + " pares</div>");
    ponerCelda(fila, "Guía", "<b>" + guia + "</b>" +
               '<div class="tiny">' + v.placa + " · " + v.cond + "</div>");
    ponerCelda(fila, "Fechas", "Sale " + hoy() + '<div class="tiny">Entrega por confirmar</div>');
    ponerCelda(fila, "Estado", '<span class="pill pill--warn">Alistando</span>');

    /* el vehículo queda cargado y sale a esa ruta */
    v.cargado += p.pares;
    if (v.estado === "Disponible") { v.estado = "En ruta"; v.ruta = p.destino; }
    refrescarVehiculos();

    recontar(panel, "despachos");
    sumarAlMenu("02-despachos.html", 1);
    aviso("Despacho " + codigo + " con guía " + guia + " · va en el " + v.placa + " (" +
          libre(v) + " pares libres) · ya se puede rastrear en Seguimiento.", "ok");
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
    sumarAlMenu("05-log-inversa.html", 1);
    if (cant) cant.value = "";
    aviso("Recolección " + codigo + " programada · lo que vuelve pasa primero por Control de Calidad.", "warn");
  }


  /* ---------------------------------------------------------------- 7-bis. Los vehículos

     Un despacho solo se le puede montar a un vehículo que:
       · no esté en el taller,
       · tenga espacio libre para los pares del pedido, y
       · esté en la base o ya vaya para esa misma ciudad.
     La lista del formulario se arma sola con esa regla.
  */

  var VEHICULOS = [
    { placa: "XYZ-123", tipo: "Camión NPR", cond: "Jorge Peña",       estado: "En ruta",          ruta: "Bogotá",      cargado: 320, cap: 400 },
    { placa: "ABC-987", tipo: "Furgón",     cond: "Luisa Mora",       estado: "En ruta",          ruta: "Cúcuta",      cargado: 210, cap: 250 },
    { placa: "GHI-302", tipo: "Camión NPR", cond: "Marta Villamizar", estado: "En ruta",          ruta: "Bucaramanga", cargado: 180, cap: 400 },
    { placa: "JKL-778", tipo: "Camioneta",  cond: "Andrés Parra",     estado: "En ruta",          ruta: "Pamplona",    cargado: 120, cap: 150 },
    { placa: "DEF-455", tipo: "Camioneta",  cond: "Hernán Ruiz",      estado: "Disponible",       ruta: "En base",     cargado: 0,   cap: 150 },
    { placa: "MNO-514", tipo: "Furgón",     cond: "Sin asignar",      estado: "En mantenimiento", ruta: "Taller",      cargado: 0,   cap: 250 }
  ];

  function libre(v) { return v.cap - v.cargado; }

  /* Del texto del pedido saco los pares y la ciudad: "PD-2026-088 · REF-1042 · 40 pares · Pamplona" */
  function leerPedido(texto) {
    var partes = (texto || "").split("·").map(function (t) { return t.trim(); });
    return {
      codigo: partes[0] || "",
      modelo: partes[1] || "",
      pares: numero(partes[2] || "0"),
      destino: partes[3] || ""
    };
  }

  function sirve(v, ped) {
    if (v.estado === "En mantenimiento") return false;
    if (libre(v) < ped.pares) return false;
    return v.estado === "Disponible" || v.ruta === ped.destino;
  }

  function refrescarVehiculos() {
    var sel = uno("#f-l-tra"), ped = uno("#f-l-ped");
    if (!sel || !ped) return;

    var p = leerPedido(ped.options[ped.selectedIndex].text);
    var pueden = VEHICULOS.filter(function (v) { return sirve(v, p); });

    sel.innerHTML = "";
    if (!pueden.length) {
      sel.appendChild(new Option("Ningún vehículo alcanza para " + p.pares + " pares a " + p.destino, ""));
      sel.disabled = true;
    } else {
      sel.disabled = false;
      pueden.forEach(function (v) {
        sel.appendChild(new Option(
          v.placa + " · " + v.tipo + " · " + v.cond + " · quedan " + libre(v) + " pares", v.placa));
      });
    }

    var pie = uno("#f-l-cap");
    if (!pie) {
      pie = document.createElement("p");
      pie.id = "f-l-cap";
      pie.className = "tiny";
      sel.closest(".field").appendChild(pie);
    }
    pie.innerHTML = pueden.length
      ? (pueden.length === 1
          ? "Solo un vehículo sirve para estos " + p.pares + " pares a " + p.destino + "."
          : "Sirven " + pueden.length + " vehículos para estos " + p.pares + " pares a " + p.destino + ".") +
        " Los que están en el taller, llenos o yendo para otro lado no salen en la lista."
      : '<span class="falta">Toca esperar a que se libere un vehículo o partir el pedido en dos despachos.</span>';

    var alist = uno("#f-l-alist");
    if (alist && !alist.value) alist.placeholder = "Deben ser " + p.pares + " pares";
  }

  /* El número de guía: va corrido desde la última que salió */
  var ULTIMA_GUIA = 88241;
  function nuevaGuia() { ULTIMA_GUIA += 1; return "GR-" + ULTIMA_GUIA; }

  /* ---------------------------------------------------------------- 7-ter. Rastrear una guía */

  var GUIAS = {
    "GR-88241": {
      ds: "DS-2026-057", fv: "FV-2026-042", cliente: "Calzado Norte",
      contenido: "400 pares · REF-1042", veh: "DEF-455 · Hernán Ruiz", destino: "Pamplona, Norte de Santander",
      salio: "23/09 09:05", eta: "23/09 13:40", estado: "En tránsito", pill: "warn",
      x: 31, y: 68, km: "62 km", pct: "38 %", hora: "13:40", senal: "4 min",
      geo: "7,8939° N · 72,5078° O · km 38 de la vía Pamplona · señal recibida hace 4 minutos"
    },
    "GR-88238": {
      ds: "DS-2026-056", fv: "FV-2026-041", cliente: "La Bota Fina",
      contenido: "260 pares · REF-1041", veh: "XYZ-123 · Jorge Peña", destino: "Bogotá, Cundinamarca",
      salio: "22/09 05:20", eta: "23/09 11:30", estado: "En reparto", pill: "warn",
      x: 74, y: 21, km: "9 km", pct: "91 %", hora: "11:30", senal: "2 min",
      geo: "4,7110° N · 74,0721° O · entrando a Bogotá por la autopista norte · señal recibida hace 2 minutos"
    },
    "GR-88229": {
      ds: "DS-2026-055", fv: "FV-2026-039", cliente: "Distribuidora Sur",
      contenido: "180 pares · REF-1043", veh: "GHI-302 · Marta Villamizar", destino: "Bucaramanga, Santander",
      salio: "23/09 06:10", eta: "23/09 14:20", estado: "En tránsito", pill: "warn",
      x: 50, y: 46, km: "24 km", pct: "78 %", hora: "14:20", senal: "6 min",
      geo: "6,9880° N · 73,0500° O · pasando Piedecuesta · señal recibida hace 6 minutos"
    },
    "GR-88190": {
      ds: "DS-2026-051", fv: "FV-2026-038", cliente: "La Bota Fina",
      contenido: "24 pares · REF-1041", veh: "JKL-778 · Andrés Parra", destino: "Bogotá, Cundinamarca",
      salio: "09/09 05:40", eta: "09/09 16:05", estado: "Entregado", pill: "ok",
      x: 80, y: 16, km: "0 km", pct: "100 %", hora: "16:05", senal: "entregada",
      geo: "4,6510° N · 74,0550° O · entregado en tienda, guía firmada · cerrado el 09/09"
    }
  };

  /* Por el número que sea: guía, despacho o factura */
  function buscarGuia(texto) {
    var q = (texto || "").trim().toUpperCase();
    if (GUIAS[q]) return q;
    for (var g in GUIAS) {
      if (GUIAS[g].ds === q || GUIAS[g].fv === q) return g;
    }
    return null;
  }

  function rastrear() {
    var campo = uno("#sg-guia");
    var g = buscarGuia(campo && campo.value);
    if (!g) return aviso("No hay ninguna guía con ese número. Pruebe con GR-88241, DS-2026-057 o FV-2026-042.", "crit");

    var d = GUIAS[g], ficha = uno("#sg-ficha");
    if (ficha) {
      uno(".gficha__g", ficha).textContent = g;
      var p = uno(".pill", ficha);
      p.className = "pill pill--" + d.pill;
      p.textContent = d.estado;
      var vs = todos("dd", ficha);
      [d.ds, d.fv, d.cliente, d.contenido, d.veh, d.destino, d.salio, d.eta]
        .forEach(function (t, i) { if (vs[i]) vs[i].textContent = t; });
      ficha.classList.add("es-nueva");
    }

    var veh = uno(".mapa .veh");
    if (veh) {
      veh.style.left = d.x + "%";
      veh.style.top = d.y + "%";
      uno("small", veh).textContent = g;
      uno("b", veh).textContent = d.veh.split("·")[0].trim();
    }
    var pie = uno(".mapa__pie");
    if (pie) pie.lastChild.textContent = " " + d.geo;

    var datos = todos(".gdatos b");
    [d.km, d.pct, d.hora, d.senal].forEach(function (t, i) { if (datos[i]) datos[i].textContent = t; });

    var sub = uno(".panel__head--oliva .sub");
    if (sub) sub.textContent = "Posición del vehículo que lleva la guía " + g;

    aviso("Guía " + g + " · " + d.estado.toLowerCase() + " · " + d.geo.split("·")[2].trim() + ".", d.pill);
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
    "recepcion": { a: "04-recepcion.html", dice: "Registre la llegada del proveedor con su número de guía." }
  };

  /* Lectura simulada del escáner: saca una guía de las que están en camino */
  function escanearGuia() {
    var pendientes = ["GR-77441", "GR-77446", "GR-88238"];
    var leida = pendientes[Math.floor(Math.random() * pendientes.length)];
    aviso("Guía " + leida + " leída por el escáner · confirme los bultos antes de dar entrada.", "ok");
    var campo = uno("#rp-guia");
    if (campo) { campo.value = leida; campo.focus(); return; }
    ir("04-recepcion.html", true);
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

  document.addEventListener("change", function (e) {
    if (e.target && e.target.id === "f-l-ped") refrescarVehiculos();
  });

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

    if (texto === "Rastrear") { e.preventDefault(); return rastrear(); }
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
      if (texto === "Devolución") sumarAlMenu("05-log-inversa.html", 1);
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
  refrescarVehiculos();
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
