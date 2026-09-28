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

  /* Alternar vistas del espacio de trabajo segmentado (Anti-Cabina de Avión) */
  function activarPestanaVista(vistaId) {
    var todasVistas = todos(".vista-seccion");
    if (!todasVistas.length) return;
    var tabTarget = uno('.ws-tab[data-vista="' + vistaId + '"]');
    if (tabTarget) {
      var contenedor = tabTarget.closest(".workspace-nav");
      if (contenedor) {
        todos(".ws-tab", contenedor).forEach(function (t) { t.classList.remove("is-active"); });
        tabTarget.classList.add("is-active");
      }
    }
    if (vistaId === "todas") {
      todasVistas.forEach(function (v) { v.hidden = false; });
    } else {
      todasVistas.forEach(function (v) {
        v.hidden = (v.id !== vistaId);
      });
    }
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
      actualizarMonitorDespacho();
      actualizarMonitorFlota();
      actualizarMonitorProyeccion();
      cargarCotizacionesPreventivas();
      sincronizarPedidosProduccion();
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

  var filaModalActiva = null;
  var filaModalProyActiva = null;

  /* Directorio maestro de conductores registrados (Personal oficial de Logística) */
  var CONDUCTORES_CATALOGO = [
    { id: "DRV-01", nombre: "Hernán Ruiz", cc: "1.090.441.203", lic: "C2 (Vence 2028)", tel: "312 455-8821", vehiculo: "DEF-455", estado: "Disponible" },
    { id: "DRV-02", nombre: "Jorge Peña", cc: "88.234.910", lic: "C3 (Vence 2027)", tel: "315 889-1200", vehiculo: "XYZ-123", estado: "En ruta" },
    { id: "DRV-03", nombre: "Luisa Mora", cc: "1.090.312.445", lic: "C2 (Vence 2029)", tel: "318 201-9944", vehiculo: "ABC-987", estado: "En ruta" },
    { id: "DRV-04", nombre: "Marta Villamizar", cc: "60.334.120", lic: "C3 (Vence 2027)", tel: "311 774-3209", vehiculo: "GHI-302", estado: "En ruta" },
    { id: "DRV-05", nombre: "Carlos Beltrán", cc: "1.093.882.114", lic: "C2 (Vence 2028)", tel: "314 552-3011", vehiculo: "Disponible", estado: "Disponible" }
  ];

  /* Cálculo automático de la fecha estimada de entrega (Temu / E-commerce style) */
  function actualizarEntregaEstimada() {
    var selRuta = uno("#f-l-ruta");
    var chkUrg = uno("#chk-despacho-urgente");
    var box = uno("#box-entrega-estimada");
    var txtVen = uno("#txt-entrega-ventana");
    var txtSub = uno("#txt-entrega-sub");
    var bgeDias = uno("#badge-entrega-dias");
    var fFecha = uno("#f-l-fecha");
    if (!txtVen) return;

    var esUrgente = chkUrg ? chkUrg.checked : false;
    var rutaVal = selRuta ? selRuta.value : "RUT-BGA";

    var meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    function formatearFecha(d) {
      return d.getDate() + " de " + meses[d.getMonth()];
    }

    var diasMin = 2, diasMax = 3;
    var ciudadNom = "Bucaramanga";

    if (rutaVal === "RUT-CUC") {
      diasMin = 0; diasMax = 1; ciudadNom = "Cúcuta Metropolitano";
    } else if (rutaVal === "RUT-PAM") {
      diasMin = 1; diasMax = 2; ciudadNom = "Pamplona";
    } else if (rutaVal === "RUT-BGA") {
      diasMin = 2; diasMax = 3; ciudadNom = "Bucaramanga";
    } else if (rutaVal === "RUT-BOG") {
      diasMin = 3; diasMax = 4; ciudadNom = "Bogotá";
    }

    if (esUrgente) {
      if (box) box.classList.add("is-urgente");
      var dUrg = new Date();
      if (diasMin > 0) dUrg.setDate(dUrg.getDate() + Math.max(1, diasMin - 1));
      txtVen.innerHTML = '⚡ Llegada Express Estimada: ' + (diasMin === 0 ? 'Mismo día (en 3 a 5 horas)' : formatearFecha(dUrg) + ' (Servicio Inmediato)');
      txtSub.textContent = 'Salida prioritaria autorizada por Logística · Transporte directo sin escalas de consolidación.';
      if (bgeDias) {
        bgeDias.textContent = '⚡ Prioridad Express (1-2 días)';
      }
      if (fFecha) fFecha.value = dUrg.toISOString().slice(0, 10);
    } else {
      if (box) box.classList.remove("is-urgente");
      var d1 = new Date();
      d1.setDate(d1.getDate() + diasMin);
      var d2 = new Date();
      d2.setDate(d2.getDate() + diasMax);

      txtVen.textContent = 'Llegada estimada al cliente: ' + d1.getDate() + ' al ' + formatearFecha(d2) + ' (' + diasMin + ' a ' + diasMax + ' días hábiles)';
      txtSub.textContent = 'Ventana estimada según tiempo de alistamiento en muelle y tránsito en el corredor ' + ciudadNom + '.';
      if (bgeDias) {
        bgeDias.textContent = 'En tiempo estándar (' + diasMin + '-' + diasMax + ' días)';
      }
      if (fFecha) fFecha.value = d2.toISOString().slice(0, 10);
    }
  }

  /* Sincronización automática de pedido cotizado con el formulario de despacho */
  function sincronizarPedidoDespacho() {
    var sel = uno("#f-l-ped");
    if (!sel) return;
    var opt = sel.options[sel.selectedIndex];
    if (!opt) return;

    var pares = numero(opt.getAttribute("data-pares") || 40);
    var cajas = opt.getAttribute("data-cajas") || Math.ceil(pares / 10);
    var destino = opt.getAttribute("data-destino") || "Bucaramanga";
    var lote = opt.getAttribute("data-lote") || "LOT-2026-B14";
    var ruta = opt.getAttribute("data-ruta") || "RUT-BGA";

    /* 1. Cantidad bloqueada (no editable por despacho para evitar discrepancias) */
    var inAlist = uno("#f-l-alist");
    if (inAlist) {
      inAlist.value = pares;
      inAlist.setAttribute("readonly", "readonly");
    }

    var txtCajas = uno("#f-l-cajas-txt");
    if (txtCajas) {
      txtCajas.textContent = "Empaque: " + cajas + " cajas corrugadas (" + Math.round(pares / cajas) + " pares/caja)";
    }

    var meta = uno("#f-l-ped-meta");
    if (meta) {
      meta.textContent = "Destino: " + destino + " · Lote: " + lote;
    }

    /* 2. Asignación automática de ruta según destino del pedido */
    var selRuta = uno("#f-l-ruta");
    if (selRuta) {
      todos("option", selRuta).forEach(function(o) {
        if (o.value === ruta || (o.getAttribute("data-ciudad") && o.getAttribute("data-ciudad").toLowerCase() === destino.toLowerCase())) {
          o.selected = true;
        }
      });
    }

    /* 3. Si despacho urgente está activo, buscar el vehículo más inmediato */
    var chkUrg = uno("#chk-despacho-urgente");
    if (chkUrg && chkUrg.checked) {
      asignarVehiculoMasInmediato(pares);
    }

    actualizarEntregaEstimada();
    actualizarMonitorDespacho();
  }

  /* Búsqueda de vehículo apto para transporte más inmediato (Despacho Urgente) */
  function asignarVehiculoMasInmediato(pares) {
    var selTra = uno("#f-l-tra");
    if (!selTra) return;
    var opcionElegida = null;
    todos("option", selTra).forEach(function(op) {
      var cap = numero(op.getAttribute("data-cap"));
      var est = op.getAttribute("data-estado");
      if (est === "disponible" && cap >= pares && !opcionElegida) {
        opcionElegida = op;
      }
    });
    if (opcionElegida) {
      opcionElegida.selected = true;
      sincronizarConductorSegunVehiculo();
      actualizarMonitorDespacho();
    }
  }

  /* Sincronización de conductor registrado según el vehículo seleccionado */
  function sincronizarConductorSegunVehiculo() {
    var selTra = uno("#f-l-tra");
    var selChofer = uno("#f-l-chofer-reg");
    var infoChofer = uno("#f-l-chofer-info");
    var infoTra = uno("#f-l-tra-info");
    if (!selTra || !selChofer) return;

    var vOp = selTra.options[selTra.selectedIndex];
    var placa = vOp ? vOp.value : "DEF-455";
    var cap = vOp ? vOp.getAttribute("data-cap") : "120";

    if (infoTra) infoTra.textContent = "Capacidad útil: " + cap + " pares · Furgón cerrado";

    var condFound = null;
    CONDUCTORES_CATALOGO.forEach(function(c) {
      if (c.vehiculo === placa) condFound = c;
    });

    if (condFound) {
      todos("option", selChofer).forEach(function(op) {
        if (op.value === condFound.id || op.textContent.indexOf(condFound.nombre) >= 0) {
          op.selected = true;
        }
      });
      if (infoChofer) infoChofer.textContent = "Licencia " + condFound.lic + " · Tel: " + condFound.tel;
    }
  }

  /* Alternar entre Flota Propia SICAF y Transportadora Externa */
  function alternarModalidadTransporte(modo) {
    var camposPropia = todos(".campo-flota-propia");
    var camposExterna = todos(".campo-transp-externa");
    var monitor = uno("#monitor-capacidad-flota");
    var btnPropia = uno("#btn-modo-propia");
    var btnExterna = uno("#btn-modo-externa");

    if (modo === "externa") {
      camposPropia.forEach(function(el) { el.style.display = "none"; });
      camposExterna.forEach(function(el) { el.style.display = "block"; });
      if (monitor) monitor.style.display = "none";
      if (btnPropia) btnPropia.classList.remove("is-active");
      if (btnExterna) btnExterna.classList.add("is-active");
      aviso("Modalidad cambiada a Transportadora Externa (Tercerizado).", "warn");
    } else {
      camposPropia.forEach(function(el) { el.style.display = "block"; });
      camposExterna.forEach(function(el) { el.style.display = "none"; });
      if (monitor) monitor.style.display = "block";
      if (btnPropia) btnPropia.classList.add("is-active");
      if (btnExterna) btnExterna.classList.remove("is-active");
      actualizarMonitorDespacho();
      aviso("Modalidad cambiada a Flota Propia SICAF.", "ok");
    }
    actualizarEntregaEstimada();
  }

  /* Generador y visualizador de Rótulo / Etiqueta de Embalaje Logístico */
  function mostrarRotuloEnvio(datos) {
    var modal = uno("#modal-etiqueta");
    if (!modal) return;

    var selPed = uno("#f-l-ped");
    var optPed = selPed ? selPed.options[selPed.selectedIndex] : null;

    var cliente = datos && datos.cliente ? datos.cliente : (optPed ? optPed.getAttribute("data-cliente") : "Calzado Bucaramanga S.A.S.");
    var destino = datos && datos.destino ? datos.destino : (optPed ? optPed.getAttribute("data-destino") : "Bucaramanga, Santander");
    var direccion = datos && datos.direccion ? datos.direccion : (optPed && optPed.getAttribute("data-direccion") ? optPed.getAttribute("data-direccion") : "Calle 35 # 18-42, Centro");
    var ref = datos && datos.ref ? datos.ref : (optPed ? optPed.getAttribute("data-ref") : "REF-1042 · Bota Andina Cuero");
    var pares = datos && datos.pares ? datos.pares : numero(uno("#f-l-alist") ? uno("#f-l-alist").value : 40);
    var cajas = Math.ceil(pares / 10);
    var lote = datos && datos.lote ? datos.lote : (optPed && optPed.getAttribute("data-lote") ? optPed.getAttribute("data-lote") : "LOT-2026-B14");
    var precinto = uno("#f-l-obs") && uno("#f-l-obs").value ? (uno("#f-l-obs").value.match(/#PRC-\d+/) || ["#PRC-8841"])[0] : "#PRC-8841";
    var fechaEmb = hoy();

    var esUrgente = uno("#chk-despacho-urgente") ? uno("#chk-despacho-urgente").checked : false;
    var modoExterna = uno("#btn-modo-externa") && uno("#btn-modo-externa").classList.contains("is-active");

    var transporteTxt = "";
    var guiaTxt = datos && datos.guia ? datos.guia : ("GR-" + (77443 + Math.floor(Math.random() * 50)));

    if (modoExterna) {
      var carrier = uno("#f-l-transp-ext") ? uno("#f-l-transp-ext").value : "Servientrega";
      var extGuia = uno("#f-l-guia-ext") && uno("#f-l-guia-ext").value ? uno("#f-l-guia-ext").value : "SRV-2026-904128";
      transporteTxt = "Transportadora Externa · " + carrier;
      guiaTxt = extGuia;
    } else {
      var selTra = uno("#f-l-tra");
      var selCho = uno("#f-l-chofer-reg");
      var placa = selTra ? selTra.value : "DEF-455";
      var choferNom = selCho ? (selCho.options[selCho.selectedIndex].getAttribute("data-nombre") || selCho.options[selCho.selectedIndex].text.split("·")[0].trim()) : "Hernán Ruiz";
      transporteTxt = "Flota Propia · " + placa + " (" + choferNom + ")";
    }

    if (uno("#lbl-destinatario")) uno("#lbl-destinatario").textContent = cliente;
    if (uno("#lbl-direccion")) uno("#lbl-direccion").textContent = direccion;
    if (uno("#lbl-ciudad")) uno("#lbl-ciudad").textContent = destino;
    if (uno("#lbl-ref-modelo")) uno("#lbl-ref-modelo").textContent = ref;
    if (uno("#lbl-total-pares")) uno("#lbl-total-pares").textContent = pares + " Pares (" + cajas + " Cajas)";
    if (uno("#lbl-lote-cod")) uno("#lbl-lote-cod").textContent = lote;
    if (uno("#lbl-precinto-cod")) uno("#lbl-precinto-cod").textContent = precinto;
    if (uno("#lbl-fecha-emb")) uno("#lbl-fecha-emb").textContent = fechaEmb;
    if (uno("#lbl-transporte-txt")) uno("#lbl-transporte-txt").textContent = transporteTxt;
    if (uno("#lbl-guia-txt")) uno("#lbl-guia-txt").textContent = guiaTxt;

    if (uno("#lbl-tag-prioridad")) {
      uno("#lbl-tag-prioridad").textContent = esUrgente ? "⚡ DESPACHO URGENTE / PRIORITARIO" : "DESPACHO ESTÁNDAR";
      uno("#lbl-tag-prioridad").style.color = esUrgente ? "var(--crit, #C5221F)" : "var(--vino-800, #5B141B)";
    }

    /* Curva de tallas proporcional según los pares */
    var curvaBody = uno("#lbl-curva-body");
    if (curvaBody) {
      var t36 = Math.max(0, Math.round(pares * 0.05));
      var t37 = Math.max(0, Math.round(pares * 0.1));
      var t38 = Math.max(1, Math.round(pares * 0.2));
      var t39 = Math.max(1, Math.round(pares * 0.25));
      var t40 = Math.max(1, Math.round(pares * 0.22));
      var t41 = Math.max(1, Math.round(pares * 0.12));
      var t42 = pares - (t36 + t37 + t38 + t39 + t40 + t41);
      if (t42 < 0) { t40 += t42; t42 = 0; }
      curvaBody.innerHTML = '<tr><td><b>Pares</b></td><td>' + t36 + '</td><td>' + t37 + '</td><td>' + t38 + '</td><td>' + t39 + '</td><td>' + t40 + '</td><td>' + t41 + '</td><td>' + t42 + '</td><td><b>' + pares + '</b></td></tr>';
    }

    if (uno("#lbl-barcode-cod")) {
      uno("#lbl-barcode-cod").textContent = "(01)7709991204(21)" + (optPed ? optPed.value : "PD-088") + "-" + guiaTxt;
    }

    modal.classList.add("is-open");
  }

  /* Monitor de capacidad en vivo para Despachos (RN-LOG-02) */
  function actualizarMonitorDespacho() {
    var ped = uno("#f-l-ped"), alist = uno("#f-l-alist"), tra = uno("#f-l-tra");
    var pctEl = uno("#ds-cap-pct"), progEl = uno("#ds-cap-prog"), msgEl = uno("#ds-cap-msg");
    if (!pctEl || !progEl || !msgEl) return;

    var pares = numero(alist ? alist.value : 0);
    var vehOp = tra ? tra.options[tra.selectedIndex] : null;
    var cap = vehOp ? numero(vehOp.getAttribute("data-cap")) : 120;
    var estado = vehOp ? vehOp.getAttribute("data-estado") : "disponible";
    var placa = vehOp ? vehOp.value : "DEF-455";

    if (estado === "mantenimiento") {
      pctEl.textContent = "Bloqueado · Taller";
      progEl.style.width = "100%";
      progEl.style.background = "var(--crit, #C5221F)";
      msgEl.style.color = "var(--crit, #C5221F)";
      msgEl.innerHTML = '<svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg><span>Vehículo en taller mecánico. Bloqueado por mantenimiento preventivo (RN-LOG-01).</span>';
      return;
    }

    if (pares > cap) {
      pctEl.textContent = Math.round((pares / cap) * 100) + "% (Sobrecupo)";
      progEl.style.width = "100%";
      progEl.style.background = "var(--crit, #C5221F)";
      msgEl.style.color = "var(--crit, #C5221F)";
      msgEl.innerHTML = '<svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg><span>Sobrecupo detectado: ' + pares + ' pares superan la capacidad útil de ' + cap + ' pares (' + placa + '). Asigne unidad mayor o fraccione el pedido (RN-LOG-02).</span>';
    } else {
      var pct = cap > 0 ? Math.min(100, Math.round((pares / cap) * 100)) : 0;
      pctEl.textContent = pct + "% ocupado";
      progEl.style.width = pct + "%";
      var color = pct > 85 ? "var(--cobre, #B45309)" : "var(--oliva-600, #4D7C0F)";
      progEl.style.background = color;
      msgEl.style.color = color;
      msgEl.innerHTML = '<svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg><span>Carga dentro de la capacidad autorizada: ' + pares + ' pares asignados de ' + cap + ' pares disponibles (' + placa + '). Apto para despacho.</span>';
    }
  }

  /* Monitor de capacidad en vivo para Flota (RN-LOG-02) */
  function actualizarMonitorFlota() {
    var veh = uno("#fl-prog-veh"), paresIn = uno("#fl-prog-pares");
    var pctEl = uno("#fl-cap-pct"), progEl = uno("#fl-cap-prog"), msgEl = uno("#fl-cap-msg");
    if (!pctEl || !progEl || !msgEl) return;

    var pares = numero(paresIn ? paresIn.value : 0);
    var vehOp = veh ? veh.options[veh.selectedIndex] : null;
    var cap = vehOp ? numero(vehOp.getAttribute("data-cap")) : 120;
    var estado = vehOp ? vehOp.getAttribute("data-estado") : "Disponible";
    var placa = vehOp ? vehOp.value : "DEF-455";

    if (estado === "En taller") {
      pctEl.textContent = "Bloqueado · Taller";
      progEl.style.width = "100%";
      progEl.style.background = "var(--crit, #C5221F)";
      msgEl.style.color = "var(--crit, #C5221F)";
      msgEl.innerHTML = '<svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg><span>Vehículo en taller mecánico. Bloqueado por mantenimiento preventivo (RN-LOG-01).</span>';
      return;
    }

    if (pares > cap) {
      pctEl.textContent = Math.round((pares / cap) * 100) + "% (Sobrecupo)";
      progEl.style.width = "100%";
      progEl.style.background = "var(--crit, #C5221F)";
      msgEl.style.color = "var(--crit, #C5221F)";
      msgEl.innerHTML = '<svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg><span>Sobrecupo: ' + pares + ' pares exceden la capacidad de ' + cap + ' pares (' + placa + '). Reasigne unidad mayor.</span>';
    } else {
      var pct = cap > 0 ? Math.min(100, Math.round((pares / cap) * 100)) : 0;
      pctEl.textContent = pct + "% ocupado";
      progEl.style.width = pct + "%";
      var color = pct > 85 ? "var(--cobre, #B45309)" : "var(--oliva-600, #4D7C0F)";
      progEl.style.background = color;
      msgEl.style.color = color;
      msgEl.innerHTML = '<svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg><span>Vehículo ' + placa + ' con ' + pares + ' pares asignados de ' + cap + ' de capacidad. Apto para salida.</span>';
    }
  }

  /* Monitor interactivo de capacidad y cubicaje proyectado para preventa Comercial */
  function actualizarMonitorProyeccion() {
    var vSel = uno("#mp-vehiculo");
    var cSel = uno("#mp-corredor");
    var pctEl = uno("#mp-cap-pct");
    var progEl = uno("#mp-cap-prog");
    var txtEl = uno("#mp-cap-txt");
    var tEl = uno("#mp-tiempo");
    var cEl = uno("#mp-costo");
    var vEl = uno("#mp-ventana");
    if (!vSel || !cSel) return;

    var vOp = vSel.options[vSel.selectedIndex];
    var cOp = cSel.options[cSel.selectedIndex];
    var cap = vOp ? numero(vOp.getAttribute("data-cap")) : 120;
    var placa = vOp ? vOp.value : "DEF-455";
    var tipoVeh = vOp ? vOp.getAttribute("data-tipo") : "Camioneta Furgón";

    var horas = cOp ? cOp.getAttribute("data-horas") : "6.0";
    var peajes = cOp ? numero(cOp.getAttribute("data-peajes")) : 42000;

    var pares = 55;
    if (filaModalProyActiva) {
      var btn = uno(".btn-proyectar", filaModalProyActiva) || uno("button", filaModalProyActiva);
      if (btn && btn.getAttribute("data-pares")) {
        pares = numero(btn.getAttribute("data-pares"));
      } else {
        var mCell = celda(filaModalProyActiva, "Modelo / Pares") || celda(filaModalProyActiva, "Modelo");
        if (mCell) pares = numero(mCell.textContent);
      }
    }

    var pct = cap > 0 ? ((pares / cap) * 100).toFixed(1) : "0.0";
    if (pctEl) pctEl.textContent = pct + "% ocupado";
    if (progEl) {
      progEl.style.width = Math.min(100, Math.round(pct)) + "%";
      progEl.style.background = pct > 100 ? "var(--crit, #C5221F)" : (pct > 75 ? "var(--cobre-600, #9C4121)" : "var(--oliva-600, #4D7C0F)");
    }
    if (txtEl) {
      if (pct > 100) {
        txtEl.textContent = "Sobrecupo proyectado: " + pares + " pares exceden la capacidad útil de " + cap + " pares (" + placa + "). Asigne camión NPR de 400 pares.";
      } else {
        txtEl.textContent = pares + " pares proyectados ocupan " + pct + "% de " + placa + " (" + cap + " pares). Capacidad holgada para consolidar con otras cotizaciones.";
      }
    }
    if (tEl) tEl.textContent = horas + " hrs";
    if (cEl) {
      var costoPar = pares > 0 ? Math.round((peajes + (parseFloat(horas) * 22000)) / pares) : 1850;
      cEl.textContent = pesos(costoPar) + " / par";
    }
    if (vEl) {
      vEl.textContent = parseFloat(horas) > 10 ? "+3 días" : "+2 días";
    }
  }

  /* Cargar cotizaciones preventivas enviadas por Comercial desde localStorage */
  function cargarCotizacionesPreventivas() {
    var tabla = uno("#tabla-proyecciones");
    if (!tabla) return;
    var cuerpo = uno("tbody", tabla);
    if (!cuerpo) return;

    var lista = [];
    try {
      lista = JSON.parse(localStorage.getItem("sicaf_cotizaciones_preventivas") || "[]");
    } catch (e) {}
    if (!lista.length) return;

    var existentes = todos("tr", cuerpo).map(function (tr) {
      var b = tr.querySelector("b");
      return b ? b.textContent.trim() : "";
    });

    lista.forEach(function (c) {
      if (existentes.indexOf(c.id) >= 0) return;
      var tr = document.createElement("tr");
      tr.className = "es-nueva";
      var esProy = c.estado === "Ruta Proyectada";
      var estadoHtml = esProy
        ? '<span class="pill pill--ok">Ruta Proyectada</span>'
        : '<span class="pill pill--warn">Por calcular</span>';
      var unidadHtml = c.unidad
        ? '<b>' + c.unidad + '</b><div class="tiny">' + (c.ocupacion || 'Proyectado') + '</div>'
        : '<span class="tiny" style="color:var(--tinta-3)">Sin asignar</span>';
      var btnTxt = esProy ? 'Revisar cálculo' : 'Calcular y proyectar';
      var btnClase = esProy ? 'btn btn--sm btn--ghost btn-proyectar' : 'btn btn--sm btn--oliva btn-proyectar';

      tr.innerHTML =
        '<td data-l="Cotización"><b>' + c.id + '</b><div class="tiny">Emitida en Comercial (' + (c.fecha || hoy()) + ')</div></td>' +
        '<td data-l="Cliente"><b>' + c.cliente + '</b><div class="tiny">' + (c.destino || 'Destino') + ' · Preventa</div></td>' +
        '<td data-l="Modelo"><b>' + (c.modelo || 'REF-1042') + '</b><div class="tiny">' + c.pares + ' pares cotizados</div></td>' +
        '<td data-l="Ruta"><b>' + (c.corredor || 'RUT-BGA') + '</b><div class="tiny">Estimado Preventa</div></td>' +
        '<td data-l="Unidad">' + unidadHtml + '</td>' +
        '<td data-l="Estado">' + estadoHtml + '</td>' +
        '<td data-l="Acciones">' +
          '<div class="acts">' +
            '<button type="button" class="' + btnClase + '" data-id="' + c.id + '" data-cliente="' + c.cliente + '" data-destino="' + c.destino + '" data-corredor="' + (c.corredor || 'RUT-BGA') + '" data-modelo="' + c.modelo + '" data-pares="' + c.pares + '">' + btnTxt + '</button>' +
            '<a class="btn btn--sm btn--ghost" href="../../07-comercial/mockup/02-ventas.html">Ver en Comercial</a>' +
          '</div>' +
        '</td>';
      cuerpo.insertBefore(tr, cuerpo.firstChild);
    });

    var badge = uno("#badge-proy-pendientes");
    if (badge) {
      badge.textContent = cuerpo.rows.length + " cotizaciones";
    }

    /* Comprobar si hay una alerta de cotización recién emitida desde Comercial */
    try {
      var alertaReciente = JSON.parse(localStorage.getItem("sicaf_alerta_nueva_cotizacion") || "null");
      if (alertaReciente) {
        var modalLlegada = uno("#modal-alerta-llegada-cotizacion");
        if (modalLlegada) {
          if (uno("#al-llegada-id")) uno("#al-llegada-id").textContent = alertaReciente.id;
          if (uno("#al-llegada-cli")) uno("#al-llegada-cli").textContent = alertaReciente.cliente + " · " + alertaReciente.destino;
          if (uno("#al-llegada-mod")) uno("#al-llegada-mod").textContent = alertaReciente.modelo + " · " + alertaReciente.pares + " pares";
          if (uno("#al-llegada-ruta")) uno("#al-llegada-ruta").textContent = alertaReciente.corredor;
          modalLlegada.dataset.id = alertaReciente.id;
          modalLlegada.dataset.cliente = alertaReciente.cliente;
          modalLlegada.dataset.destino = alertaReciente.destino;
          modalLlegada.dataset.modelo = alertaReciente.modelo;
          modalLlegada.dataset.pares = alertaReciente.pares;
          modalLlegada.dataset.corredor = alertaReciente.corredor.indexOf("RUT-") >= 0 ? alertaReciente.corredor.match(/RUT-[A-Z]+/)[0] : "RUT-BGA";
          modalLlegada.classList.add("is-open");
        }
        localStorage.removeItem("sicaf_alerta_nueva_cotizacion");
      }
    } catch (err) {}
  }

  /* Sincronizar estados de pedidos en fabricación enviados por Producción */
  function sincronizarPedidosProduccion() {
    var tabla = uno("#tabla-pedidos-produccion");
    if (!tabla) return;
    try {
      var etapasMap = JSON.parse(localStorage.getItem("sicaf_etapas_pedidos") || "{}");
      todos("tbody tr", tabla).forEach(function (tr) {
        var ordTd = celda(tr, "Orden / Pedido") || celda(tr, "Orden");
        if (!ordTd) return;
        var mPed = ordTd.textContent.match(/PD-\d{4}-\d+/);
        if (!mPed) return;
        var pedId = mPed[0];
        if (etapasMap[pedId]) {
          var info = etapasMap[pedId];
          var pct = info.pct || (info.paso === 4 ? 100 : (info.paso === 3 ? 75 : (info.paso === 2 ? 50 : 25)));
          var nombre = info.etapa || (pct === 100 ? "4. Embalaje" : (pct === 75 ? "3. Montaje" : (pct === 50 ? "2. Guarnición" : "1. Corte")));

          var tdEt = celda(tr, "Etapa en Planta") || celda(tr, "Etapa");
          var tdProg = celda(tr, "Progreso");
          var tdEst = celda(tr, "Estado Logístico") || celda(tr, "Estado");
          var tdAcc = celda(tr, "Acción") || celda(tr, "Acciones");

          if (tdEt) {
            tdEt.innerHTML = '<span class="pill pill--' + (pct === 100 ? "ok" : "warn") + '">' + nombre + '</span><div class="tiny" style="color:var(--tinta-3)">' + (pct === 100 ? "Cajas listas en muelle" : "En línea de proceso") + '</div>';
          }
          if (tdProg) {
            tdProg.innerHTML = '<div style="font-weight:700;color:' + (pct === 100 ? "var(--ok)" : "var(--cobre-600)") + '">' + pct + '%</div><div class="tiny">' + (pct === 100 ? "Listo en muelle" : "En fabricación") + '</div>';
          }
          if (tdEst) {
            if (pct === 100) {
              tdEst.innerHTML = '<span class="pill pill--ok">Embalado · Listo</span><div class="tiny" style="color:var(--ok)">Listo para cargar</div>';
            } else {
              tdEst.innerHTML = '<span class="pill pill--warn">En Fabricación</span><div class="tiny">Avance planta ' + pct + '%</div>';
            }
          }
          if (tdAcc && pct === 100) {
            var btnCargar = uno(".btn-cargar-despacho", tdAcc);
            if (!btnCargar) {
              var cliCel = celda(tr, "Cliente y Destino") || celda(tr, "Cliente");
              var cliNom = cliCel ? (cliCel.querySelector("b") || {}).textContent : "Cliente";
              var modCel = celda(tr, "Modelo / Pares") || celda(tr, "Modelo");
              var pares = modCel ? numero(modCel.textContent) : 48;
              tdAcc.innerHTML =
                '<div class="acts">' +
                  '<button type="button" class="btn btn--sm btn--oliva btn-cargar-despacho" data-pedido="' + pedId + '" data-cliente="' + cliNom + '" data-pares="' + pares + '" data-ref="Calzado Terminado" data-destino="Bucaramanga" data-ruta="RUT-BGA">Pasar a Despacho</button>' +
                '</div>';
            }
          }
        }
      });
    } catch (e) {}
  }

  function generarDespacho() {
    var ped = uno("#f-l-ped"), alist = uno("#f-l-alist"), tra = uno("#f-l-tra");
    var rutaSel = uno("#f-l-ruta"), fechaSel = uno("#f-l-fecha"), obsIn = uno("#f-l-obs");
    var pares = numero(alist ? alist.value : 0);

    if (!pares || pares <= 0) {
      if (alist) alist.focus();
      return aviso("Ingrese una cantidad válida de pares a despachar.", "crit");
    }

    var modoExterna = uno("#btn-modo-externa") && uno("#btn-modo-externa").classList.contains("is-active");
    var esUrgente = uno("#chk-despacho-urgente") ? uno("#chk-despacho-urgente").checked : false;

    var placa = "DEF-455";
    var chofer = "Hernán Ruiz";
    var guia = "";

    if (modoExterna) {
      var transpExt = uno("#f-l-transp-ext") ? uno("#f-l-transp-ext").value : "Servientrega";
      var guiaExt = uno("#f-l-guia-ext") && uno("#f-l-guia-ext").value.trim() ? uno("#f-l-guia-ext").value.trim() : "SRV-2026-904128";
      placa = transpExt;
      chofer = "Guía ext: " + guiaExt;
      guia = guiaExt;
    } else {
      var vehOp = tra ? tra.options[tra.selectedIndex] : null;
      var cap = vehOp ? numero(vehOp.getAttribute("data-cap")) : 120;
      var estadoVeh = vehOp ? vehOp.getAttribute("data-estado") : "disponible";
      placa = vehOp ? vehOp.value : "DEF-455";

      var selCho = uno("#f-l-chofer-reg");
      chofer = selCho ? (selCho.options[selCho.selectedIndex].getAttribute("data-nombre") || selCho.options[selCho.selectedIndex].text.split("·")[0].trim()) : "Hernán Ruiz";

      if (estadoVeh === "mantenimiento") {
        return aviso("No se puede despachar: el vehículo seleccionado está en taller mecánico (RN-LOG-01).", "crit");
      }

      if (pares > cap) {
        return aviso("Sobrecupo detectado (" + pares + " pares > " + cap + " pares). Reasigne unidad de mayor capacidad (RN-LOG-02).", "crit");
      }
      guia = "GR-" + (77442 + (uno("#tabla-despachos") ? (uno("tbody", uno("#tabla-despachos")) || {}).rows.length : 1));
    }

    var tabla = uno("#tabla-despachos") || (panelPorTitulo("Órdenes de Despacho y Guías Activas") && uno("table", panelPorTitulo("Órdenes de Despacho y Guías Activas")));
    if (!tabla) return aviso("Despacho generado.", "ok");

    var cuerpo = uno("tbody", tabla);
    var panel = tabla.closest(".panel");

    /* Consecutivo de Despacho DS-2026-06X */
    var codigo = siguienteCodigo(panel, "Despacho");
    if (!codigo || codigo.indexOf("DS-") === -1) {
      codigo = "DS-2026-061";
    }

    var pedOp = ped ? ped.options[ped.selectedIndex] : null;
    var cliente = pedOp ? (pedOp.getAttribute("data-cliente") || "Cliente General") : "Cliente";
    var destino = pedOp ? (pedOp.getAttribute("data-destino") || "Destino") : "Destino";
    var ref = pedOp ? (pedOp.getAttribute("data-ref") || "Calzado Terminado") : "Calzado";
    var ruta = rutaSel ? rutaSel.options[rutaSel.selectedIndex].text.split("·")[0].trim() : "Ruta Principal";
    var fechaComp = fechaSel && fechaSel.value ? fechaSel.value : hoy();
    var obs = obsIn && obsIn.value ? obsIn.value : "Alistamiento en muelle verificado";

    var cajas = Math.ceil(pares / 10);
    var badgeTransp = modoExterna
      ? '<span class="chip chip--cobre" style="font-size:10px;margin-top:3px">Transportadora Externa</span>'
      : '<span class="chip chip--oliva" style="font-size:10px;margin-top:3px">Flota Propia</span>';
    var badgeUrg = esUrgente ? '<span class="pill pill--crit" style="font-size:10.5px;margin-left:4px">⚡ Urgente</span>' : '';

    var tr = document.createElement("tr");
    tr.className = "es-nueva";
    tr.innerHTML =
      '<td data-l="Despacho"><b>' + codigo + '</b><div class="tiny">' + hoy() + ' · ' + obs + '</div>' + badgeTransp + '</td>' +
      '<td data-l="Cliente y Destino"><b>' + cliente + '</b><div class="tiny">' + destino + ' · ' + ruta + '</div></td>' +
      '<td data-l="Modelo / Pares"><b>' + ref + '</b><div class="tiny">' + pares + ' pares (' + cajas + ' cajas)</div></td>' +
      '<td data-l="Guía Remisión"><b>' + guia + '</b><div class="tiny">' + placa + ' · ' + chofer + '</div></td>' +
      '<td data-l="Fechas">Alista: ' + hoy() + '<div class="tiny" style="color:var(--oliva-700);font-weight:600">Compromiso: ' + fechaComp + '</div></td>' +
      '<td data-l="Estado"><span class="pill pill--warn">Alistando</span>' + badgeUrg + '</td>' +
      '<td data-l="Acciones">' +
        '<div class="acts">' +
          '<button type="button" class="btn btn--sm btn--ghost btn-rotulo-fila" data-despacho="' + codigo + '" data-cliente="' + cliente + '" data-destino="' + destino + '" data-ref="' + ref + '" data-pares="' + pares + '" data-guia="' + guia + '" title="Ver rótulo de envío">🏷️ Rótulo</button>' +
          '<button type="button" class="btn btn--sm btn--oliva" data-accion="entrega" data-despacho="' + codigo + '" data-cliente="' + cliente + '">Registrar entrega</button>' +
          '<button type="button" class="btn btn--sm btn--ghost" data-accion="devolucion" data-despacho="' + codigo + '">Novedad</button>' +
        '</div>' +
      '</td>';

    cuerpo.insertBefore(tr, cuerpo.firstChild);

    /* Actualizar contadores */
    var n = cuerpo.rows.length;
    var txtConteo = uno("#ds-conteo-txt");
    if (txtConteo) txtConteo.textContent = n + " despachos activos";
    var pie = uno(".tabla-pie", panel);
    if (pie) pie.textContent = "Mostrando " + n + " de " + n + " despachos · Guía emitida";

    /* Actualizar KPIs */
    var kPares = uno("#k-pares");
    if (kPares) kPares.textContent = numero(kPares.textContent) + pares;

    sumarAlMenu("02-despachos.html", 1);
    aviso("Despacho " + codigo + " y Guía " + guia + " emitidos · Rótulo de embalaje listo para imprimir.", "ok");
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

  function asignarFlota() {
    var veh = uno("#fl-prog-veh"), choferIn = uno("#fl-prog-chofer");
    var rutaSel = uno("#fl-prog-ruta"), paresIn = uno("#fl-prog-pares"), kmIn = uno("#fl-prog-km");

    var vehOp = veh ? veh.options[veh.selectedIndex] : null;
    var placa = vehOp ? vehOp.value : "DEF-455";
    var cap = vehOp ? numero(vehOp.getAttribute("data-cap")) : 120;
    var estado = vehOp ? vehOp.getAttribute("data-estado") : "Disponible";
    var pares = numero(paresIn ? paresIn.value : 0);
    var chofer = choferIn && choferIn.value.trim() ? choferIn.value.trim() : (vehOp ? vehOp.getAttribute("data-chofer") : "Conductor");
    var ruta = rutaSel ? rutaSel.value : "Corredor Nacional";
    var km = kmIn ? kmIn.value : "142500";

    if (estado === "En taller") {
      return aviso("Vehículo en taller mecánico. Bloqueado para salida (RN-LOG-01).", "crit");
    }

    if (pares > cap) {
      return aviso("Sobrecupo detectado (" + pares + " pares > " + cap + " pares). Reasigne unidad mayor (RN-LOG-02).", "crit");
    }

    /* Buscar fila del vehículo en la tabla de flota */
    var tabla = uno(".panel table");
    if (!tabla) return aviso("Flota asignada.", "ok");

    var filas = todos("tbody tr", tabla);
    var filaEncontrada = null;

    filas.forEach(function (tr) {
      var txt = tr.textContent;
      if (txt.indexOf(placa) >= 0) filaEncontrada = tr;
    });

    var pct = Math.min(100, Math.round((pares / cap) * 100));

    if (filaEncontrada) {
      ponerCelda(filaEncontrada, "Conductor", chofer);
      ponerCelda(filaEncontrada, "Estado", '<span class="pill pill--warn">En ruta</span>');
      ponerCelda(filaEncontrada, "Ruta", ruta);
      ponerCelda(filaEncontrada, "Ocupación",
        '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="tiny">' + pares + ' / ' + cap + ' pares</div>'
      );
      var tdAct = uno(".acts", filaEncontrada);
      if (tdAct) tdAct.innerHTML = '<button class="btn btn--sm btn--ghost">Cerrar ruta</button>';
      filaEncontrada.classList.add("es-nueva");
    }

    /* Actualizar KPIs */
    var kRuta = uno("#k-ruta");
    if (kRuta) kRuta.textContent = numero(kRuta.textContent) + 1;
    var kPares = uno("#k-pares");
    if (kPares) kPares.textContent = numero(kPares.textContent) + pares;

    aviso("Vehículo " + placa + " despachado a ruta hacia " + ruta + " con " + pares + " pares (Odómetro: " + km + " km).", "ok");
  }

  /* ---------------------------------------------------------------- 8. Un solo oyente para los botones */

  var ESTADOS = {
    "Procesar":          { pill: "ok",   texto: "Procesada", dice: "pasa a Control de Calidad",        tono: "ok" },
    "Asignar vehículo":  { pill: "warn", texto: "En tránsito", dice: "sale con el vehículo asignado",    tono: "ok" },
    "Registrar llegada": { pill: "ok",   texto: "Recibida",   dice: "llegó a la planta · falta la revisión de Calidad", tono: "ok" },
    "Validar a mano":    { pill: "ok",   texto: "Validado",   dice: "queda validado con la guía digitada", tono: "ok" },
    "Reclamar":          { pill: "warn", texto: "En reclamo", dice: "queda en reclamo · se avisó a Compras", tono: "warn" },
    "Programar":         { pill: "warn", texto: "Programada", dice: "queda programada para recoger",      tono: "warn" }
  };

  /* Las tres acciones rápidas del tablero de Inicio */
  var RAPIDAS = {
    "ruta":      { a: "02-despachos.html", dice: "Arme la orden: pedido facturado, capacidad y vehículo." },
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

  /* Listeners dinámicos en inputs para monitoreo de capacidad en tiempo real */
  document.addEventListener("input", function (e) {
    var id = e.target.id;
    if (id === "f-l-alist") actualizarMonitorDespacho();
    if (id === "fl-prog-pares") actualizarMonitorFlota();
  });

  document.addEventListener("change", function (e) {
    var id = e.target.id;
    if (id === "f-l-ped") {
      sincronizarPedidoDespacho();
    }
    if (id === "f-l-tra") {
      sincronizarConductorSegunVehiculo();
      actualizarMonitorDespacho();
    }
    if (id === "f-l-chofer-reg") {
      var opCh = e.target.options[e.target.selectedIndex];
      if (opCh && uno("#f-l-chofer-info")) {
        var lic = opCh.getAttribute("data-lic") || "C2 Vigente";
        var tel = opCh.getAttribute("data-tel") || "312 455-8821";
        uno("#f-l-chofer-info").textContent = "Licencia " + lic + " · Tel: " + tel;
      }
    }
    if (id === "f-l-ruta") {
      actualizarEntregaEstimada();
    }
    if (id === "chk-despacho-urgente") {
      var pedSel = uno("#f-l-ped");
      var paresUrg = pedSel ? numero(pedSel.options[pedSel.selectedIndex].getAttribute("data-pares")) : 40;
      if (e.target.checked) {
        asignarVehiculoMasInmediato(paresUrg);
        aviso("⚡ Prioridad express activada: Se asignó vehículo para salida inmediata.", "warn");
      }
      actualizarEntregaEstimada();
    }
    if (id === "f-l-transp-ext") {
      actualizarEntregaEstimada();
    }
    if (id === "mp-vehiculo" || id === "mp-corredor") actualizarMonitorProyeccion();
    if (id === "fl-prog-veh") {
      var veh = e.target;
      var opVeh = veh.options[veh.selectedIndex];
      if (opVeh) {
        var chofer = opVeh.getAttribute("data-chofer");
        var choferSel = uno("#fl-prog-chofer");
        if (chofer && choferSel) {
          todos("option", choferSel).forEach(function(o) {
            if (o.value === chofer || o.textContent.indexOf(chofer) >= 0) o.selected = true;
          });
        }
      }
      actualizarMonitorFlota();
    }
  });

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button") : null;
    if (!b) return;
    var texto = b.textContent.trim();
    var accion = b.getAttribute("data-accion");

    var rapida = b.getAttribute("data-rapida");
    if (rapida === "ocr") { e.preventDefault(); return escanearGuia(); }
    if (rapida && RAPIDAS[rapida]) {
      e.preventDefault();
      aviso(RAPIDAS[rapida].dice, "ok");
      return ir(RAPIDAS[rapida].a, true);
    }

    /* Modalidad de transporte: Flota Propia vs Externa */
    if (b.id === "btn-modo-propia" || b.getAttribute("data-modo") === "propia") {
      e.preventDefault();
      alternarModalidadTransporte("propia");
      return;
    }
    if (b.id === "btn-modo-externa" || b.getAttribute("data-modo") === "externa") {
      e.preventDefault();
      alternarModalidadTransporte("externa");
      return;
    }

    /* Rótulo / Etiqueta de Embalaje Logístico */
    if (b.id === "btn-abrir-rotulo") {
      e.preventDefault();
      mostrarRotuloEnvio(null);
      return;
    }
    if (b.classList.contains("btn-rotulo-fila")) {
      e.preventDefault();
      var despFila = b.closest("tr");
      var dCode = b.getAttribute("data-despacho") || (despFila ? (despFila.querySelector("b") || {}).textContent : "DS-2026-061");
      var dCli = b.getAttribute("data-cliente") || "Cliente";
      var dDest = b.getAttribute("data-destino") || "Destino";
      var dRef = b.getAttribute("data-ref") || "Calzado Terminado";
      var dPar = numero(b.getAttribute("data-pares") || 40);
      var dGuia = b.getAttribute("data-guia") || "GR-77443";
      mostrarRotuloEnvio({
        despacho: dCode,
        cliente: dCli,
        destino: dDest,
        ref: dRef,
        pares: dPar,
        guia: dGuia
      });
      return;
    }
    if (b.id === "btn-cerrar-rotulo" || b.id === "btn-cerrar-modal-etiqueta") {
      e.preventDefault();
      var mEtq = uno("#modal-etiqueta");
      if (mEtq) mEtq.classList.remove("is-open");
      return;
    }
    if (b.id === "btn-imprimir-rotulo") {
      e.preventDefault();
      window.print();
      return;
    }

    /* Ficha de conductor registrado */
    if (b.classList.contains("btn-ver-chofer")) {
      e.preventDefault();
      var chNom = b.getAttribute("data-nombre") || "Conductor";
      return aviso("Ficha laboral de " + chNom + ": ARL nivel 4, examen ocupacional vigente y sin infracciones de tránsito.", "ok");
    }

    /* Registrar nuevo vehículo en flota (05-flota.html) */
    if (b.id === "btn-guardar-nuevo-vehiculo") {
      e.preventDefault();
      var inPlaca = uno("#reg-v-placa");
      var selTipo = uno("#reg-v-tipo");
      var inCap = uno("#reg-v-cap");
      var inKm = uno("#reg-v-km");

      var placaVal = inPlaca ? inPlaca.value.trim().toUpperCase() : "";
      var tipoVal = selTipo ? selTipo.value : "Furgón";
      var capVal = numero(inCap ? inCap.value : 250);
      var kmVal = inKm ? inKm.value : "85000";

      if (!placaVal || placaVal.length < 5) {
        if (inPlaca) inPlaca.focus();
        return aviso("Ingrese una placa de vehículo válida (ej. KOP-882).", "crit");
      }
      if (capVal <= 0) {
        if (inCap) inCap.focus();
        return aviso("Ingrese una capacidad válida de pares.", "crit");
      }

      var tblVeh = uno("#tabla-vehiculos");
      if (tblVeh) {
        var tbodyV = uno("tbody", tblVeh);
        var trV = document.createElement("tr");
        trV.className = "es-nueva";
        trV.innerHTML =
          '<td data-l="Vehículo"><b>' + placaVal + '</b><div class="tiny">' + tipoVal + '</div></td>' +
          '<td data-l="Conductor"><b>Sin asignar</b><div class="tiny">Disponible</div></td>' +
          '<td data-l="Estado"><span class="pill pill--ok">Disponible</span></td>' +
          '<td data-l="Ruta">—</td>' +
          '<td style="min-width:120px" data-l="Ocupación"><div class="bar"><i style="width:0.0%"></i></div><div class="tiny">0 / ' + capVal + ' pares</div></td>' +
          '<td><div class="acts"><button class="btn btn--sm btn--ghost">Asignar ruta</button></div></td>';
        tbodyV.insertBefore(trV, tbodyV.firstChild);

        var countVeh = uno("#tab-count-vehiculos");
        if (countVeh) countVeh.textContent = tbodyV.rows.length + " unidades";
      }

      var selProgVeh = uno("#fl-prog-veh");
      if (selProgVeh) {
        var optV = document.createElement("option");
        optV.value = placaVal;
        optV.setAttribute("data-cap", capVal);
        optV.setAttribute("data-tipo", tipoVal);
        optV.setAttribute("data-estado", "Disponible");
        optV.textContent = placaVal + " · " + tipoVal + " · Cap: " + capVal + " pares · Disponible";
        selProgVeh.insertBefore(optV, selProgVeh.firstChild);
        optV.selected = true;
      }

      if (inPlaca) inPlaca.value = "";
      activarPestanaVista("panel-parque-automotor");
      return aviso("Vehículo " + placaVal + " (" + tipoVal + " · " + capVal + " pares) registrado con éxito.", "ok");
    }

    /* Registrar nuevo conductor en directorio (05-flota.html) */
    if (b.id === "btn-guardar-nuevo-conductor") {
      e.preventDefault();
      var inDNom = uno("#reg-d-nombre");
      var inDCC = uno("#reg-d-cc");
      var selDLic = uno("#reg-d-lic");
      var inDVence = uno("#reg-d-vence");
      var inDTel = uno("#reg-d-tel");

      var dNom = inDNom ? inDNom.value.trim() : "";
      var dCC = inDCC ? inDCC.value.trim() : "";
      var dLic = selDLic ? selDLic.value : "C2";
      var dVence = inDVence && inDVence.value ? inDVence.value : "2028-12-31";
      var dTel = inDTel ? inDTel.value.trim() : "310 000-0000";

      if (!dNom || dNom.length < 3) {
        if (inDNom) inDNom.focus();
        return aviso("Escriba el nombre completo del conductor.", "crit");
      }
      if (!dCC) {
        if (inDCC) inDCC.focus();
        return aviso("Escriba el número de cédula del conductor.", "crit");
      }

      var init = dNom.split(" ").map(function(w){return w[0];}).slice(0,2).join("").toUpperCase();

      CONDUCTORES_CATALOGO.push({
        id: "DRV-" + (CONDUCTORES_CATALOGO.length + 1),
        nombre: dNom,
        cc: dCC,
        lic: "Cat. " + dLic + " Vigente (" + dVence.slice(0,4) + ")",
        tel: dTel,
        vehiculo: "Disponible",
        estado: "Disponible"
      });

      var tblDrv = uno("#tabla-conductores");
      if (tblDrv) {
        var tbodyD = uno("tbody", tblDrv);
        var trD = document.createElement("tr");
        trD.className = "es-nueva";
        trD.innerHTML =
          '<td data-l="Empleado"><div class="driver-card"><div class="driver-card__avatar">' + init + '</div><div class="driver-card__info"><b>' + dNom + '</b><span>Conductor Logística</span></div></div></td>' +
          '<td data-l="Cédula"><b>CC ' + dCC + '</b></td>' +
          '<td data-l="Licencia"><span class="chip chip--oliva">Cat. ' + dLic + ' Vigente</span><div class="tiny">Vence: ' + dVence + '</div></td>' +
          '<td data-l="Contacto"><b>' + dTel + '</b></td>' +
          '<td data-l="Vehículo"><b>Disponible</b><div class="tiny">Sin unidad fija</div></td>' +
          '<td data-l="Estado"><span class="pill pill--ok">Disponible</span></td>' +
          '<td><div class="acts"><button type="button" class="btn btn--sm btn--ghost btn-ver-chofer" data-nombre="' + dNom + '">Ficha</button></div></td>';
        tbodyD.insertBefore(trD, tbodyD.firstChild);

        var countDrv = uno("#tab-count-conductores");
        if (countDrv) countDrv.textContent = tbodyD.rows.length + " empleados";
        var countPie = uno("#drv-conteo");
        if (countPie) countPie.textContent = tbodyD.rows.length + " conductores registrados";
      }

      var selChFlota = uno("#fl-prog-chofer");
      if (selChFlota) {
        var optCh = document.createElement("option");
        optCh.value = dNom;
        optCh.textContent = dNom + " · CC " + dCC + " · Lic. " + dLic;
        selChFlota.appendChild(optCh);
        optCh.selected = true;
      }
      var selChDesp = uno("#f-l-chofer-reg");
      if (selChDesp) {
        var optCh2 = document.createElement("option");
        optCh2.value = "DRV-" + CONDUCTORES_CATALOGO.length;
        optCh2.setAttribute("data-nombre", dNom);
        optCh2.setAttribute("data-lic", dLic + " (Vence " + dVence.slice(0,4) + ")");
        optCh2.setAttribute("data-tel", dTel);
        optCh2.textContent = dNom + " · CC " + dCC + " · Lic. " + dLic;
        selChDesp.appendChild(optCh2);
      }

      if (inDNom) inDNom.value = "";
      if (inDCC) inDCC.value = "";
      activarPestanaVista("panel-directorio-conductores");
      return aviso("Conductor " + dNom + " (CC " + dCC + " · Lic. " + dLic + ") registrado con éxito en el directorio.", "ok");
    }

    /* Selector de Espacio de Trabajo (Tabs / Vistas: Anti-Cabina de Avión) */
    var tabWs = b.closest(".ws-tab");
    if (tabWs) {
      e.preventDefault();
      var vId = tabWs.getAttribute("data-vista");
      if (vId) activarPestanaVista(vId);
      return;
    }

    /* Limpiar / Reestablecer formulario de despacho */
    if (b.id === "btn-limpiar-despacho") {
      e.preventDefault();
      var selP = uno("#f-l-ped");
      if (selP) selP.selectedIndex = 0;
      var inA = uno("#f-l-alist");
      if (inA) inA.value = 40;
      var selT = uno("#f-l-tra");
      if (selT) selT.selectedIndex = 0;
      var selR = uno("#f-l-ruta");
      if (selR) selR.selectedIndex = 0;
      var inO = uno("#f-l-obs");
      if (inO) inO.value = "";
      var chkU = uno("#chk-despacho-urgente");
      if (chkU) chkU.checked = false;
      alternarModalidadTransporte("propia");
      sincronizarPedidoDespacho();
      return aviso("Formulario de despacho reestablecido.", "ok");
    }

    var lleva = b.getAttribute("data-ir");
    if (lleva && ES_PANTALLA.test(lleva)) { e.preventDefault(); return ir(lleva, true); }

    /* Botones de formularios principales */
    if (texto === "Generar reporte" || b.id === "btn-generar-reporte") { e.preventDefault(); return generarReporte(); }
    if (texto === "Generar despacho" || texto === "Generar Despacho y Guía" || b.id === "btn-generar-despacho") { e.preventDefault(); return generarDespacho(); }
    if (texto === "Registrar recepción" || b.id === "btn-registrar-recepcion") { e.preventDefault(); return registrarRecepcion(); }
    if (texto === "Programar recolección" || b.id === "btn-programar-recoleccion") { e.preventDefault(); return programarRecoleccion(); }
    if (texto === "Programar y Despachar a Ruta" || b.id === "btn-asignar-flota") { e.preventDefault(); return asignarFlota(); }

    /* Modales: Apertura de Modal Entrega */
    if (accion === "entrega" || texto === "Registrar entrega" || b.classList.contains("btn-entregar")) {
      e.preventDefault();
      filaModalActiva = b.closest("tr");
      var modalEnt = uno("#modal-entrega");
      if (modalEnt) {
        var despCode = b.getAttribute("data-despacho") || (filaModalActiva ? (filaModalActiva.querySelector("b") || {}).textContent : "DS-2026-060");
        var clientTxt = b.getAttribute("data-cliente") || (filaModalActiva ? (celda(filaModalActiva, "Cliente y Destino") ? celda(filaModalActiva, "Cliente y Destino").querySelector("b").textContent : (celda(filaModalActiva, "Cliente") ? celda(filaModalActiva, "Cliente").querySelector("b").textContent : "Cliente")) : "Cliente");
        if (uno("#md-ent-despacho")) uno("#md-ent-despacho").value = despCode;
        if (uno("#md-ent-info")) uno("#md-ent-info").value = despCode + " · " + clientTxt;
        var rIn = uno("#md-ent-receptor") || uno("#md-ent-nombre");
        if (rIn) { rIn.value = ""; rIn.focus(); }
        modalEnt.classList.add("is-open");
      }
      return;
    }

    /* Modales: Confirmar Entrega */
    if (b.id === "btn-confirmar-entrega") {
      e.preventDefault();
      var rIn2 = uno("#md-ent-receptor") || uno("#md-ent-nombre");
      var receptor = rIn2 ? rIn2.value.trim() : "";
      if (!receptor) {
        if (rIn2) rIn2.focus();
        return aviso("El nombre y documento del receptor son obligatorios para cerrar la entrega (RN-LOG-04).", "crit");
      }
      if (filaModalActiva) {
        ponerCelda(filaModalActiva, "Estado", '<span class="pill pill--ok">Entregado</span>');
        ponerCelda(filaModalActiva, "Fechas", 'Entregado: ' + ahora() + '<div class="tiny">Receptor: ' + receptor + '</div>');
        var actCel = celda(filaModalActiva, "Acciones");
        if (actCel) actCel.innerHTML = '<span class="pill pill--ok">Listo para cobro</span>';
        filaModalActiva.classList.add("es-nueva");
      }
      var mEnt = uno("#modal-entrega");
      if (mEnt) mEnt.classList.remove("is-open");
      contarPendientes(-1);
      return aviso("Entrega legalizada por " + receptor + " · Notificación emitida a Comercial: 'Listo para Cobro' (RN-LOG-04).", "ok");
    }

    /* Modales: Cancelar / Cerrar Entrega */
    if (b.id === "btn-cancelar-modal-entrega" || b.id === "btn-cerrar-modal-ent" || b.id === "btn-cerrar-modal-entrega") {
      e.preventDefault();
      var mEnt2 = uno("#modal-entrega");
      if (mEnt2) mEnt2.classList.remove("is-open");
      return;
    }

    /* Modales: Alerta de llegada de cotización desde Comercial */
    if (b.id === "btn-cerrar-alerta-llegada" || b.id === "btn-x-alerta-llegada") {
      e.preventDefault();
      var mLlegada = uno("#modal-alerta-llegada-cotizacion");
      if (mLlegada) mLlegada.classList.remove("is-open");
      return;
    }

    if (b.id === "btn-abrir-proyeccion-desde-alerta") {
      e.preventDefault();
      var mLlegada2 = uno("#modal-alerta-llegada-cotizacion");
      if (mLlegada2) {
        mLlegada2.classList.remove("is-open");
        activarPestanaVista("panel-proyecciones");
        var cIdA = mLlegada2.dataset.id || (uno("#al-llegada-id") ? uno("#al-llegada-id").textContent : "CO-2026-011");
        var cCliA = mLlegada2.dataset.cliente || "Cliente";
        var cDestA = mLlegada2.dataset.destino || "Destino";
        var cModA = mLlegada2.dataset.modelo || "REF-1042";
        var cParA = mLlegada2.dataset.pares || "55";
        var cCorA = mLlegada2.dataset.corredor || "RUT-BGA";

        var tablaP = uno("#tabla-proyecciones");
        if (tablaP) {
          todos("tbody tr", tablaP).forEach(function (tr) {
            var bTr = tr.querySelector("b");
            if (bTr && bTr.textContent.indexOf(cIdA) >= 0) filaModalProyActiva = tr;
          });
        }

        var mProyA = uno("#modal-proyeccion");
        if (mProyA) {
          if (uno("#mp-cotizacion")) uno("#mp-cotizacion").textContent = cIdA;
          if (uno("#mp-info")) uno("#mp-info").textContent = cCliA + " · " + cModA + " · " + cParA + " pares · Destino: " + cDestA;
          if (uno("#mp-corredor")) uno("#mp-corredor").value = cCorA;
          actualizarMonitorProyeccion();
          mProyA.classList.add("is-open");
        }
      }
      return;
    }

    /* Modales: Proyección preventiva de transporte y rutas (Comercial) */
    if (b.classList.contains("btn-proyectar") || texto === "Calcular y proyectar" || texto === "Revisar cálculo") {
      e.preventDefault();
      filaModalProyActiva = b.closest("tr");
      var mProy = uno("#modal-proyeccion");
      if (mProy) {
        var cId = b.getAttribute("data-id") || (filaModalProyActiva ? (filaModalProyActiva.querySelector("b") || {}).textContent.trim() : "CO-2026-011");
        var cCli = b.getAttribute("data-cliente") || "Cliente";
        var cDest = b.getAttribute("data-destino") || "Destino";
        var cCor = b.getAttribute("data-corredor") || "RUT-BGA";
        var cMod = b.getAttribute("data-modelo") || "REF-1042";
        var cPar = b.getAttribute("data-pares") || "50";
        var cVeh = b.getAttribute("data-veh") || "DEF-455";

        if (uno("#mp-cotizacion")) uno("#mp-cotizacion").textContent = cId;
        if (uno("#mp-info")) uno("#mp-info").textContent = cCli + " · " + cMod + " · " + cPar + " pares · Destino: " + cDest;
        if (uno("#mp-corredor")) uno("#mp-corredor").value = cCor;
        if (uno("#mp-vehiculo")) uno("#mp-vehiculo").value = cVeh;

        actualizarMonitorProyeccion();
        mProy.classList.add("is-open");
      }
      return;
    }

    if (b.id === "btn-guardar-proyeccion") {
      e.preventDefault();
      var vSelG = uno("#mp-vehiculo");
      var cSelG = uno("#mp-corredor");
      var vOpG = vSelG ? vSelG.options[vSelG.selectedIndex] : null;
      var cOpG = cSelG ? cSelG.options[cSelG.selectedIndex] : null;
      var placaG = vOpG ? vOpG.value : "DEF-455";
      var tipoG = vOpG ? vOpG.getAttribute("data-tipo") : "Camioneta Furgón";
      var capG = vOpG ? numero(vOpG.getAttribute("data-cap")) : 120;
      var horasG = cOpG ? cOpG.getAttribute("data-horas") : "6.0";
      var rutaCodG = cOpG ? cOpG.value : "RUT-BGA";
      var cotIdG = uno("#mp-cotizacion") ? uno("#mp-cotizacion").textContent.trim() : "CO-2026-011";

      if (filaModalProyActiva) {
        var btnG = uno(".btn-proyectar", filaModalProyActiva) || uno("button", filaModalProyActiva);
        var paresG = btnG && btnG.getAttribute("data-pares") ? numero(btnG.getAttribute("data-pares")) : 55;
        var pctG = capG > 0 ? ((paresG / capG) * 100).toFixed(1) : "0.0";

        ponerCelda(filaModalProyActiva, "Ruta y Tiempo Est.", "<b>" + rutaCodG + "</b><div class=\"tiny\">" + horasG + " hrs · Proyectado</div>");
        ponerCelda(filaModalProyActiva, "Unidad Proyectada", "<b>" + placaG + "</b><div class=\"tiny\">" + pctG + "% ocupación (" + tipoG + ")</div>");
        ponerCelda(filaModalProyActiva, "Estado", '<span class="pill pill--ok">Ruta Proyectada</span>');
        var tdActsG = celda(filaModalProyActiva, "Acciones");
        if (tdActsG) {
          tdActsG.innerHTML =
            '<div class="acts">' +
              '<button type="button" class="btn btn--sm btn--ghost btn-proyectar" data-id="' + cotIdG + '" data-pares="' + paresG + '" data-veh="' + placaG + '" data-corredor="' + rutaCodG + '">Revisar cálculo</button>' +
              '<a class="btn btn--sm btn--ghost" href="../../07-comercial/mockup/02-ventas.html">Ver en Comercial</a>' +
            '</div>';
        }
        filaModalProyActiva.classList.add("es-nueva");
      }

      /* Guardar estado en localStorage para sincronizar con Comercial */
      try {
        var lCot = JSON.parse(localStorage.getItem("sicaf_cotizaciones_preventivas") || "[]");
        lCot.forEach(function(item) {
          if (item.id === cotIdG) {
            item.estado = "Ruta Proyectada";
            item.unidad = placaG;
            item.corredor = rutaCodG;
            item.tiempo = horasG;
          }
        });
        localStorage.setItem("sicaf_cotizaciones_preventivas", JSON.stringify(lCot));
      } catch(err) {}

      var mProyG = uno("#modal-proyeccion");
      if (mProyG) mProyG.classList.remove("is-open");
      return aviso("Proyección confirmada para " + cotIdG + ": " + placaG + " asignado en " + rutaCodG + " (" + horasG + " hrs). Preventa asegurada.", "ok");
    }

    if (b.id === "btn-cancelar-modal-proy" || b.id === "btn-cerrar-modal-proy") {
      e.preventDefault();
      var mProyC = uno("#modal-proyeccion");
      if (mProyC) mProyC.classList.remove("is-open");
      return;
    }

    /* Enlace Producción → Despacho: Cargar pedido terminado al formulario de despacho */
    if (b.classList.contains("btn-cargar-despacho") || texto === "Pasar a Despacho") {
      e.preventDefault();
      var pedCod = b.getAttribute("data-pedido") || "PD-2026-094";
      var pedCli = b.getAttribute("data-cliente") || "Calzado Bucaramanga";
      var pedPar = b.getAttribute("data-pares") || "40";
      var pedRef = b.getAttribute("data-ref") || "REF-1042 · Bota Andina";
      var pedRuta = b.getAttribute("data-ruta") || "RUT-BGA";

      var fPed = uno("#f-l-ped");
      if (fPed) {
        var existePed = false;
        todos("option", fPed).forEach(function(opt) {
          if (opt.value === pedCod) {
            opt.selected = true;
            existePed = true;
          }
        });
        if (!existePed) {
          var optNuevo = document.createElement("option");
          optNuevo.value = pedCod;
          optNuevo.selected = true;
          optNuevo.setAttribute("data-pares", pedPar);
          optNuevo.setAttribute("data-cliente", pedCli);
          optNuevo.setAttribute("data-ref", pedRef);
          optNuevo.setAttribute("data-ruta", pedRuta);
          optNuevo.textContent = pedCod + " · " + pedCli + " (" + pedPar + " pares)";
          fPed.insertBefore(optNuevo, fPed.firstChild);
        }
      }
      if (uno("#f-l-alist")) uno("#f-l-alist").value = pedPar;
      if (uno("#f-l-ruta")) uno("#f-l-ruta").value = pedRuta;
      if (uno("#f-l-obs")) uno("#f-l-obs").value = "Pedido terminado en Planta (Embalaje 100%) · Listo en muelle";
      actualizarMonitorDespacho();
      activarPestanaVista("panel-despachos");
      if (fPed) fPed.scrollIntoView({ behavior: "smooth", block: "center" });
      return aviso("Pedido " + pedCod + " (" + pedCli + " · " + pedPar + " pares) cargado en el formulario de despacho.", "ok");
    }

    /* Modales: Apertura de Modal Devolución */
    if (accion === "devolucion" || texto === "Novedad" || texto === "Devolución") {
      e.preventDefault();
      filaModalActiva = b.closest("tr");
      var modalDev = uno("#modal-devolucion");
      if (modalDev) {
        var cod = b.getAttribute("data-despacho") || (filaModalActiva ? (filaModalActiva.querySelector("b") || {}).textContent : "DS-2026-060");
        if (uno("#md-dev-info")) uno("#md-dev-info").value = cod;
        if (uno("#md-dev-obs")) uno("#md-dev-obs").value = "";
        modalDev.classList.add("is-open");
      }
      return;
    }

    /* Modales: Confirmar Devolución */
    if (b.id === "btn-confirmar-devolucion") {
      e.preventDefault();
      var motivo = uno("#md-dev-motivo") ? uno("#md-dev-motivo").value : "Rechazo de calzado";
      if (filaModalActiva) {
        ponerCelda(filaModalActiva, "Estado", '<span class="pill pill--crit">Devuelto</span>');
        var actCelDev = celda(filaModalActiva, "Acciones");
        if (actCelDev) actCelDev.innerHTML = '<span class="pill pill--crit">Nota Crédito</span>';
        filaModalActiva.classList.add("es-nueva");
      }
      var mDev = uno("#modal-devolucion");
      if (mDev) mDev.classList.remove("is-open");
      sumarAlMenu("04-log-inversa.html", 1);
      return aviso("Devolución por '" + motivo + "' registrada · Mercancía en cuarentena y alerta emitida para Nota Crédito (RN-LOG-05).", "crit");
    }

    /* Modales: Cancelar / Cerrar Devolución */
    if (b.id === "btn-cancelar-modal-dev" || b.id === "btn-cerrar-modal-dev") {
      e.preventDefault();
      var mDev2 = uno("#modal-devolucion");
      if (mDev2) mDev2.classList.remove("is-open");
      return;
    }

    /* Acciones en la tabla de Flota */
    if (texto === "Cerrar ruta") {
      e.preventDefault();
      var filaRuta = b.closest("tr");
      if (filaRuta) {
        ponerCelda(filaRuta, "Estado", '<span class="pill pill--ok">Disponible</span>');
        ponerCelda(filaRuta, "Ruta", "—");
        var vehB = filaRuta.querySelector("b");
        var placaNom = vehB ? vehB.textContent : "Vehículo";
        var capPares = (placaNom === "DEF-455" || placaNom === "MNO-214") ? 120 : (placaNom === "ABC-987" || placaNom === "JKL-778" ? 250 : 400);
        ponerCelda(filaRuta, "Ocupación", '<div class="bar"><i style="width:0.0%"></i></div><div class="tiny">0 / ' + capPares + ' pares</div>');
        var actsDiv = uno(".acts", filaRuta);
        if (actsDiv) actsDiv.innerHTML = '<button class="btn btn--sm btn--ghost">Asignar ruta</button>';
        filaRuta.classList.add("es-nueva");
        var kRutaC = uno("#k-ruta");
        if (kRutaC) kRutaC.textContent = Math.max(0, numero(kRutaC.textContent) - 1);
        return aviso("Ruta cerrada: " + placaNom + " liberado y listo para nueva asignación.", "ok");
      }
    }

    if (texto === "Dar de alta") {
      e.preventDefault();
      var filaAlta = b.closest("tr");
      if (filaAlta) {
        ponerCelda(filaAlta, "Estado", '<span class="pill pill--ok">Disponible</span>');
        var actsAlta = uno(".acts", filaAlta);
        if (actsAlta) actsAlta.innerHTML = '<button class="btn btn--sm btn--ghost">Asignar ruta</button>';
        filaAlta.classList.add("es-nueva");
        var vAlta = (filaAlta.querySelector("b") || {}).textContent || "Vehículo";
        return aviso(vAlta + " dado de alta del taller mecánico y habilitado para rodar.", "ok");
      }
    }

    if (texto === "Asignar ruta") {
      e.preventDefault();
      var filaAsig = b.closest("tr");
      if (filaAsig) {
        var vCod = (filaAsig.querySelector("b") || {}).textContent;
        var selV = uno("#fl-prog-veh");
        if (selV && vCod) {
          selV.value = vCod;
          var evt = new Event("change");
          selV.dispatchEvent(evt);
          selV.scrollIntoView({ behavior: "smooth", block: "center" });
          return aviso("Vehículo " + vCod + " seleccionado en el formulario superior.", "ok");
        }
      }
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

  /* Inicializar monitores y sincronizaciones si están presentes */
  sincronizarPedidoDespacho();
  sincronizarConductorSegunVehiculo();
  actualizarEntregaEstimada();
  actualizarMonitorDespacho();
  actualizarMonitorFlota();
  actualizarMonitorProyeccion();
  cargarCotizacionesPreventivas();
  sincronizarPedidosProduccion();

  /* Si hay campo de fecha en despachos y está vacío, prellenar con hoy + 2 días */
  var fFecha = uno("#f-l-fecha");
  if (fFecha && !fFecha.value) {
    var d2 = new Date();
    d2.setDate(d2.getDate() + 2);
    fFecha.value = d2.toISOString().slice(0, 10);
  }
})();

