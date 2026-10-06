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

  /* --- Pedir cotización (04) ---

     Se le pide un precio a uno o varios proveedores por los productos de una
     solicitud. Cada proveedor elegido genera su cotización "Pedida". Cuando el
     proveedor contesta, sus precios se cargan en "Respuesta del Proveedor" y la
     cotización queda "Respondida", lista para elegirla y ordenar.
  */

  var PROVEEDORES = {
    "PV-01": { nombre: "Curtiembre del Norte", cal: "4.8 / 5", dias: 5, ins: ["MP-01", "MP-03"] },
    "PV-02": { nombre: "Suelas Pacífico",      cal: "4.2 / 5", dias: 8, ins: ["MP-02", "MP-05", "MP-06"] },
    "PV-03": { nombre: "Insumos Textiles JR",  cal: "4.5 / 5", dias: 3, ins: ["MP-03", "MP-04", "MP-07", "MP-08"] }
  };
  var COD_INSUMO = {
    "Cuero vacuno graso": "MP-01", "Suela caucho 38-42": "MP-02", "Hilo poliéster 40": "MP-04", "Plantilla EVA": "MP-05",
    "Pegante de montaje": "MP-06", "Herraje ojalillo": "MP-07", "Cordón encerado 120 cm": "MP-08"
  };
  var PRODUCTOS_SOLICITUD = {
    "SC-2026-004": [["Cuero vacuno graso", "dm²", 960], ["Plantilla EVA", "par", 120], ["Cordón encerado 120 cm", "par", 210]],
    "SM-2026-002": [["Cordón encerado 120 cm", "par", 210]],
    "SM-2026-001": [["Plantilla EVA", "par", 120]]
  };

  /* Las cotizaciones y lo que cotizó cada proveedor: [insumo, unidad, cantidad, precio unitario] */
  var LLAVE_COT = "sicaf.cotizaciones";
  var COTS = {
    "CT-001": { sol: "SM-2026-001", prov: "PV-02", dias: 8, cal: 4, estado: "Respondida", items: [["Plantilla EVA", "par", 120, 2080]] },
    "CT-002": { sol: "SM-2026-001", prov: "PV-03", dias: 3, cal: 5, estado: "Respondida", items: [["Plantilla EVA", "par", 120, 2150]] },
    "CT-003": { sol: "SM-2026-002", prov: "PV-03", dias: 0, cal: 0, estado: "Pedida",     items: [["Cordón encerado 120 cm", "par", 210, 0]] }
  };
  try {
    var guardadasCot = JSON.parse(window.localStorage.getItem(LLAVE_COT));
    if (guardadasCot) for (var kc in guardadasCot) COTS[kc] = guardadasCot[kc];
  } catch (e) {}
  function guardarCots() { try { window.localStorage.setItem(LLAVE_COT, JSON.stringify(COTS)); } catch (e) {} }

  var cotElegida = "";   // la cotización que se eligió en la pantalla 04 para ordenar en la 06

  function sumarDias(n) { var d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  function valorDe(id, valor) { var c = uno("#" + id); if (c) c.value = valor; return c; }
  function textoDe(id, valor) { var c = uno("#" + id); if (c) c.textContent = valor; return c; }
  function totalDe(items) { return items.reduce(function (a, i) { return a + i[2] * i[3]; }, 0); }

  function renglonesDeCotizacion() { return todos("#ct-reng tbody tr"); }
  function productosDePedido() {
    return renglonesDeCotizacion().map(function (f) {
      var nombre = (uno("b", celda(f, "Insumo")) || {}).textContent || "";
      var unidad = ((uno(".tiny", celda(f, "Insumo")) || {}).textContent || "").replace("medido en", "").trim();
      return [nombre, unidad, numero(celda(f, "Cantidad").textContent), 0];
    });
  }
  function proveedoresElegidos() {
    return todos("#ct-prov-tabla input[data-pv]:checked").map(function (c) { return c.getAttribute("data-pv"); });
  }

  function recalcularCotizacion() {
    var prods = productosDePedido();
    var n = uno("#ct-cuantos");
    if (n) n.textContent = prods.length + (prods.length === 1 ? " producto" : " productos");
    /* qué proveedores cubren qué */
    todos("#ct-prov-tabla input[data-pv]").forEach(function (c) {
      var id = c.getAttribute("data-pv"), p = PROVEEDORES[id];
      var cubre = prods.filter(function (x) { return p.ins.indexOf(COD_INSUMO[x[0]]) >= 0; }).length;
      var td = uno("#ct-cubre-" + id);
      if (td) td.innerHTML = prods.length
        ? (cubre ? '<span class="chip chip--' + (cubre === prods.length ? "oliva" : "tinta") + '">' + cubre + " de " + prods.length + " productos</span>"
                 : '<span class="tiny">Ninguno de la lista</span>')
        : "—";
    });
    actualizarResumenCotizacion();
    return { filas: prods.length };
  }

  function actualizarResumenCotizacion() {
    if (!uno("#rs-sol")) return;
    var sol = uno("#ct-sol"), elegidos = proveedoresElegidos();
    textoDe("rs-sol", sol.value);
    textoDe("rs-prod", String(renglonesDeCotizacion().length));
    textoDe("rs-prov", elegidos.length ? elegidos.map(function (i) { return PROVEEDORES[i].nombre; }).join(", ") : "Ninguno");
    textoDe("rs-lim", (uno("#ct-limite") || {}).value || "—");
    textoDe("rs-ent", (uno("#ct-entrega") || {}).value || "—");
    textoDe("rs-pago", (uno("#ct-pago") || {}).value || "—");
    textoDe("ct-cuantos-pv", elegidos.length + (elegidos.length === 1 ? " elegido" : " elegidos"));
  }

  function filaDeCotizacion(nombre, unidad, cantidad) {
    var fila = document.createElement("tr");
    fila.innerHTML =
      '<td data-l="Insumo"><b>' + nombre + '</b><div class="tiny">medido en ' + unidad + "</div></td>" +
      '<td class="num" data-l="Cantidad">' + miles(cantidad) + "</td>" +
      '<td class="acts"><button class="btn btn--sm btn--ghost" type="button">Quitar</button></td>';
    return fila;
  }

  function cargarSolicitud() {
    var sol = uno("#ct-sol"), cuerpo = uno("#ct-reng tbody");
    if (!sol || !cuerpo) return;
    cuerpo.innerHTML = "";
    (PRODUCTOS_SOLICITUD[sol.value] || []).forEach(function (p) { cuerpo.appendChild(filaDeCotizacion(p[0], p[1], p[2])); });
    /* se marcan de una vez los proveedores que surten algo de la solicitud */
    var prods = productosDePedido();
    todos("#ct-prov-tabla input[data-pv]").forEach(function (c) {
      var p = PROVEEDORES[c.getAttribute("data-pv")];
      c.checked = prods.some(function (x) { return p.ins.indexOf(COD_INSUMO[x[0]]) >= 0; });
    });
    recalcularCotizacion();
  }

  function agregarProducto() {
    var ins = uno("#ct-ins"), cant = uno("#ct-cant");
    var unidades = numero(cant && cant.value);
    if (!unidades) { if (cant) cant.focus(); return aviso("Escriba cuánto necesita cotizar.", "crit"); }
    var partes = ins.value.split("|");
    var nombre = partes[0], unidad = partes[1] || "unidad";
    var repetida = productosDePedido().filter(function (x) { return x[0] === nombre; })[0];
    if (repetida) return aviso(nombre + " ya está en el pedido · quítelo primero si lo va a cambiar.", "warn");
    var fila = filaDeCotizacion(nombre, unidad, unidades);
    fila.className = "es-nueva";
    uno("#ct-reng tbody").appendChild(fila);
    cant.value = "";
    var r = recalcularCotizacion();
    aviso(nombre + " agregado · el pedido va en " + r.filas + (r.filas === 1 ? " producto." : " productos."), "ok");
  }

  function quitarProducto(boton) {
    var fila = boton.closest("tr");
    if (!fila) return;
    var esOrden = !!fila.closest("#oc-reng");
    var nombre = (uno("b", celda(fila, "Insumo")) || {}).textContent || "El producto";
    fila.remove();
    if (esOrden) recalcularOrden(); else recalcularCotizacion();
    aviso(nombre + (esOrden ? " se quitó de la orden." : " se quitó del pedido."), "warn");
  }

  function pedirCotizacion() {
    var sol = uno("#ct-sol"), limite = uno("#ct-limite"), entrega = uno("#ct-entrega");
    var prods = productosDePedido(), elegidos = proveedoresElegidos();
    if (!prods.length) return aviso("No hay productos para cotizar: agregue al menos uno.", "crit");
    if (!elegidos.length) return aviso("Elija al menos un proveedor al que pedirle la cotización.", "crit");
    if (!limite.value) { limite.focus(); return aviso("Indique hasta qué fecha el proveedor puede responder.", "crit"); }
    if (!entrega.value) { entrega.focus(); return aviso("Indique cuándo necesita recibir los materiales.", "crit"); }
    if (entrega.value < limite.value) { entrega.focus(); return aviso("La entrega no puede ser antes de la fecha límite de respuesta.", "crit"); }

    var panel = panelPorTitulo("Cotizaciones por Solicitud");
    if (!panel) return aviso("Cotización pedida.", "ok");
    var codSol = sol.value;
    var creadas = elegidos.map(function (id) {
      var codigo = siguienteCodigo(panel, "Cotización");
      var fila = nuevaFila(panel, "Cotización");
      ponerCelda(fila, "Cotización", "<b>" + codigo + '</b><div class="tiny">' + hoy() + "</div>");
      ponerCelda(fila, "Solicitud", codSol + '<div class="tiny">' + prods.length + " producto(s)</div>");
      ponerCelda(fila, "Proveedor", PROVEEDORES[id].nombre);
      ponerCelda(fila, "Precio", '—<div class="tiny">sin responder</div>');
      ponerCelda(fila, "Entrega", '—<div class="tiny">pide ' + entrega.value + "</div>");
      ponerCelda(fila, "Calidad", "—");
      ponerCelda(fila, "Estado", '<span class="pill pill--warn">Pedida</span>');
      ponerCelda(fila, "Acciones", '<div class="acts"><button class="btn btn--sm btn--ghost" type="button">Cargar respuesta</button></div>');
      COTS[codigo] = { sol: codSol, prov: id, dias: 0, cal: 0, estado: "Pedida", items: prods.map(function (p) { return p.slice(); }) };
      return codigo;
    });
    guardarCots();
    recontar(panel, "cotizaciones");
    llenarRespuestas(creadas[0]);
    valorDe("ct-obs", "");
    aviso("Se pidió cotización a " + elegidos.length + " proveedor(es) (" + creadas.join(", ") +
          ") · esperan respuesta hasta el " + limite.value + ".", "ok");
  }

  /* --- Respuesta del proveedor --- */

  function llenarRespuestas(elegida) {
    var sel = uno("#rp-cot");
    if (!sel) return;
    var pendientes = Object.keys(COTS).filter(function (k) { return COTS[k].estado === "Pedida"; }).sort();
    sel.innerHTML = pendientes.length
      ? pendientes.map(function (k) {
          return '<option value="' + k + '">' + k + " · " + PROVEEDORES[COTS[k].prov].nombre + " · " + COTS[k].sol + "</option>";
        }).join("")
      : '<option value="">No hay cotizaciones esperando respuesta</option>';
    if (elegida && COTS[elegida] && COTS[elegida].estado === "Pedida") sel.value = elegida;
    pintarRespuesta();
  }

  function pintarRespuesta() {
    var sel = uno("#rp-cot"), cuerpo = uno("#rp-reng tbody");
    if (!sel || !cuerpo) return;
    var c = COTS[sel.value];
    cuerpo.innerHTML = "";
    if (!c) { recalcularRespuesta(); return; }
    c.items.forEach(function (i) {
      var fila = document.createElement("tr");
      fila.innerHTML =
        '<td data-l="Insumo"><b>' + i[0] + '</b><div class="tiny">medido en ' + i[1] + "</div></td>" +
        '<td class="num" data-l="Cantidad">' + miles(i[2]) + "</td>" +
        '<td class="num" data-l="Precio unitario"><input class="rp-precio" type="number" min="1" placeholder="$" aria-label="Precio unitario de ' + i[0] + '"></td>' +
        '<td class="num" data-l="Subtotal">$0</td>';
      cuerpo.appendChild(fila);
    });
    valorDe("rp-dias", PROVEEDORES[c.prov].dias);
    recalcularRespuesta();
  }

  function recalcularRespuesta() {
    var total = 0;
    todos("#rp-reng tbody tr").forEach(function (f) {
      var p = numero((uno(".rp-precio", f) || {}).value), q = numero(celda(f, "Cantidad").textContent);
      celda(f, "Subtotal").textContent = pesos(p * q);
      total += p * q;
    });
    var t = uno("#rp-total");
    if (t) t.innerHTML = "<b>" + pesos(total) + "</b>";
    return total;
  }

  function guardarRespuesta() {
    var sel = uno("#rp-cot"), c = sel && COTS[sel.value];
    if (!c) return aviso("No hay una cotización esperando respuesta.", "warn");
    var precios = todos(".rp-precio");
    var falta = precios.filter(function (p) { return !numero(p.value); })[0];
    if (falta) { falta.focus(); return aviso("Escriba el precio unitario de cada producto.", "crit"); }
    var dias = numero((uno("#rp-dias") || {}).value);
    if (!dias) { uno("#rp-dias").focus(); return aviso("Escriba en cuántos días entrega el proveedor.", "crit"); }
    var codigo = sel.value;
    precios.forEach(function (p, i) { c.items[i][3] = numero(p.value); });
    c.dias = dias; c.cal = numero(uno("#rp-cal").value); c.estado = "Respondida";
    guardarCots();

    var panel = panelPorTitulo("Cotizaciones por Solicitud");
    var fila = panel && todos("tbody tr", tablaDe(panel)).filter(function (tr) { return codigoDeFila(tr, "Cotización") === codigo; })[0];
    var total = totalDe(c.items);
    if (fila) {
      ponerCelda(fila, "Precio", pesos(total) + '<div class="tiny">' + c.items.length + " producto(s)</div>");
      ponerCelda(fila, "Entrega", c.dias + '<div class="tiny">días</div>');
      ponerCelda(fila, "Calidad", c.cal + " / 5");
      ponerCelda(fila, "Estado", '<span class="pill pill--warn">Respondida</span>');
      ponerCelda(fila, "Acciones", '<div class="acts"><button class="btn btn--sm btn--oliva">Elegir y ordenar</button></div>');
      fila.classList.add("es-nueva");
    }
    llenarRespuestas();
    aviso(codigo + " respondida por " + PROVEEDORES[c.prov].nombre + ": " + pesos(total) +
          " en " + c.dias + " días · ya se puede elegir y ordenar.", "ok");
  }

  /* --- Nueva orden de compra (06) ---

     Una orden lleva varios productos con su precio acordado. Nace de una
     cotización elegida (trae proveedor, productos y precios) o se hace directa.
  */

  var TOPE_GERENTE = 2000000;

  function renglonesDeOrden() { return todos("#oc-reng tbody tr"); }

  function recalcularOrden() {
    var filas = renglonesDeOrden();
    var total = filas.reduce(function (suma, f) { return suma + numero(celda(f, "Subtotal").textContent); }, 0);
    var t = uno("#oc-total");
    if (t) t.innerHTML = "<b>" + pesos(total) + "</b>";
    var n = uno("#oc-cuantos");
    if (n) n.textContent = filas.length + (filas.length === 1 ? " producto" : " productos");
    actualizarResumenOrden(total, filas.length);
    return { filas: filas.length, total: total };
  }

  function actualizarResumenOrden(total, filas) {
    if (!uno("#rs-oc-num")) return;
    var prov = uno("#f-oc-prov"), cot = uno("#f-oc-cot");
    textoDe("rs-oc-num", (uno("#f-oc-num") || {}).value || "—");
    textoDe("rs-oc-prov", PROVEEDORES[prov.value] ? PROVEEDORES[prov.value].nombre : "—");
    textoDe("rs-oc-cot", cot.value || "Compra directa");
    textoDe("rs-oc-prod", String(filas));
    textoDe("rs-oc-ent", (uno("#f-oc-llega") || {}).value || "—");
    textoDe("rs-oc-pago", (uno("#f-oc-pago") || {}).value || "—");
    textoDe("rs-oc-total", pesos(total));
    var av = uno("#rs-oc-aviso");
    if (av) {
      var alto = total > TOPE_GERENTE;
      av.className = alto ? "aviso aviso--warn" : "aviso";
      var d = uno("div", av);
      if (d) d.innerHTML = alto
        ? "<b>Requiere aprobación del gerente</b><p>La orden supera $2.000.000: queda por aprobar.</p>"
        : "<b>Aprobación automática</b><p>Hasta $2.000.000 la orden se aprueba sola.</p>";
    }
  }

  function filaDeOrden(codigo, nombre, unidad, cantidad, precio) {
    var fila = document.createElement("tr");
    fila.innerHTML =
      '<td data-l="Insumo"><b>' + nombre + '</b><div class="tiny">' + codigo + " · medido en " + unidad + "</div></td>" +
      '<td class="num" data-l="Cantidad">' + miles(cantidad) + "</td>" +
      '<td class="num" data-l="Precio unitario">' + pesos(precio) + "</td>" +
      '<td class="num" data-l="Subtotal">' + pesos(cantidad * precio) + "</td>" +
      '<td class="acts"><button class="btn btn--sm btn--ghost" type="button">Quitar</button></td>';
    return fila;
  }

  function fechaDeEntrega() {
    var p = PROVEEDORES[(uno("#f-oc-prov") || {}).value];
    if (p) valorDe("f-oc-llega", sumarDias(p.dias));
  }

  /* Las cotizaciones que ya tienen precios son las que se pueden ordenar */
  function llenarCotizaciones(elegida) {
    var sel = uno("#f-oc-cot");
    if (!sel) return;
    var listas = Object.keys(COTS).filter(function (k) { return COTS[k].estado === "Respondida"; }).sort();
    sel.innerHTML = '<option value="">Compra directa · sin cotización</option>' + listas.map(function (k) {
      return '<option value="' + k + '">' + k + " · " + PROVEEDORES[COTS[k].prov].nombre + " · " + pesos(totalDe(COTS[k].items)) + "</option>";
    }).join("");
    if (elegida) sel.value = elegida;
  }

  function cargarCotizacion() {
    var sel = uno("#f-oc-cot"), cuerpo = uno("#oc-reng tbody");
    if (!sel || !cuerpo) return;
    var c = COTS[sel.value];
    if (!c) { recalcularOrden(); return; }
    valorDe("f-oc-prov", c.prov);
    fechaDeEntrega();
    cuerpo.innerHTML = "";
    c.items.forEach(function (i) {
      cuerpo.appendChild(filaDeOrden(COD_INSUMO[i[0]] || "MP", i[0], i[1], i[2], i[3]));
    });
    var r = recalcularOrden();
    aviso(sel.value + " cargada · " + PROVEEDORES[c.prov].nombre + ", " + pesos(r.total) + ".", "ok");
  }

  function agregarProductoOrden() {
    var ins = uno("#f-oc-ins"), cant = uno("#f-oc-cant"), pre = uno("#f-oc-pre");
    var unidades = numero(cant && cant.value), unitario = numero(pre && pre.value);
    if (!unidades) { if (cant) cant.focus(); return aviso("Escriba la cantidad que va a ordenar.", "crit"); }
    if (!unitario) { if (pre) pre.focus(); return aviso("Escriba el precio unitario acordado.", "crit"); }
    var partes = ins.value.split("|");
    var codigo = partes[0], nombre = partes[1], unidad = partes[2] || "unidad";
    var repetida = renglonesDeOrden().filter(function (f) {
      return (uno("b", celda(f, "Insumo")) || {}).textContent === nombre;
    })[0];
    if (repetida) return aviso(nombre + " ya está en la orden · quítelo primero si lo va a cambiar.", "warn");
    var fila = filaDeOrden(codigo, nombre, unidad, unidades, unitario);
    fila.className = "es-nueva";
    uno("#oc-reng tbody").appendChild(fila);
    cant.value = "";
    pre.value = "";
    var r = recalcularOrden();
    aviso(nombre + " agregado · la orden va en " + r.filas + (r.filas === 1 ? " producto" : " productos") +
          " por " + pesos(r.total) + ".", "ok");
  }

  function numeroDeOrden() {
    var panel = panelPorTitulo("Órdenes de Compra");
    return panel ? siguienteCodigo(panel, "Orden") : "OC-2026-0" + (ULTIMA_OC + 1);
  }

  function generarOrden() {
    var prov = uno("#f-oc-prov"), llega = uno("#f-oc-llega"), cot = uno("#f-oc-cot");
    var r = recalcularOrden();
    if (!r.filas) return aviso("La orden no tiene productos: agregue al menos uno.", "crit");
    if (!llega.value) { llega.focus(); return aviso("Indique la fecha de entrega esperada.", "crit"); }
    if (llega.value < hoy()) { llega.focus(); return aviso("La entrega esperada no puede ser una fecha pasada.", "crit"); }

    var panel = panelPorTitulo("Órdenes de Compra");
    if (!panel) return aviso("Orden generada.", "ok");

    var filas = renglonesDeOrden();
    var primera = filas[0];
    var nombre1 = (uno("b", celda(primera, "Insumo")) || {}).textContent || "";
    var detalle1 = (uno(".tiny", celda(primera, "Insumo")) || {}).textContent || "";
    var cod1 = detalle1.split("·")[0].trim();
    var unidad1 = (detalle1.split("medido en")[1] || "").trim();
    var cantidad1 = numero(celda(primera, "Cantidad").textContent);

    var codigo = numeroDeOrden();
    var porAprobar = r.total > TOPE_GERENTE;
    var fila = nuevaFila(panel, "Orden");
    ponerCelda(fila, "Orden", "<b>" + codigo + '</b><div class="tiny">' +
      PROVEEDORES[prov.value].nombre + " · " + (cot.value ? "desde " + cot.value : "manual") + "</div>");
    ponerCelda(fila, "Insumo", nombre1 + (filas.length > 1 ? " y " + (filas.length - 1) + " más" : "") +
      '<div class="tiny">' + cod1 + (filas.length > 1 ? " y otros" : "") + "</div>");
    ponerCelda(fila, "Recibido", filas.length > 1
      ? "0 de " + filas.length + '<div class="tiny">productos</div>'
      : "0 / " + miles(cantidad1) + '<div class="tiny">' + unidad1 + "</div>");
    ponerCelda(fila, "Monto", pesos(r.total));
    ponerCelda(fila, "Estado", '<span class="pill pill--warn">' + (porAprobar ? "Por aprobar" : "Aprobada") + "</span>");
    ponerCelda(fila, "Acciones", porAprobar
      ? '<span class="tiny">Espera al gerente</span>'
      : '<div class="acts"><button class="btn btn--sm btn--ghost" type="button">Enviar</button></div>');
    recontar(panel, "órdenes");
    sumarAlMenu("06-ordenes.html", 1);

    /* la pantalla queda lista para la siguiente orden */
    var usada = cot.value;
    uno("#oc-reng tbody").innerHTML = "";
    valorDe("f-oc-obs", "");
    valorDe("f-oc-cot", "");
    valorDe("f-oc-num", numeroDeOrden());
    fechaDeEntrega();
    recalcularOrden();
    aviso("Orden " + codigo + " generada por " + pesos(r.total) +
          (porAprobar ? " · supera $2.000.000, queda por aprobar por un gerente." : " · aprobada, lista para enviar."),
          porAprobar ? "warn" : "ok");
  }

  /* Deja listos los campos de las dos pantallas cada vez que se abren */
  function iniciarFormularios() {
    if (uno("#ct-sol")) {
      var lim = uno("#ct-limite"), ent = uno("#ct-entrega");
      if (lim && !lim.value) lim.value = sumarDias(3);
      if (ent && !ent.value) ent.value = sumarDias(10);
      if (lim) lim.min = hoy();
      if (ent) ent.min = hoy();
      if (!proveedoresElegidos().length && !uno("#ct-prov-tabla").dataset.listo) { cargarSolicitud(); uno("#ct-prov-tabla").dataset.listo = "1"; }
      recalcularCotizacion();
      llenarRespuestas();
    }
    if (uno("#f-oc-num")) {
      valorDe("f-oc-num", numeroDeOrden());
      valorDe("f-oc-fecha", hoy());
      var lle = uno("#f-oc-llega");
      if (lle) lle.min = hoy();
      llenarCotizaciones();
      if (cotElegida && COTS[cotElegida]) {
        llenarCotizaciones(cotElegida);
        cotElegida = "";
        cargarCotizacion();
      } else {
        if (lle && !lle.value) fechaDeEntrega();
        recalcularOrden();
      }
    }
  }

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!t || !t.id) { if (t && t.matches && t.matches("#ct-prov-tabla input")) actualizarResumenCotizacion(); return; }
    if (t.id === "ct-sol")     cargarSolicitud();
    if (t.id === "rp-cot")     pintarRespuesta();
    if (t.id === "f-oc-prov")  { fechaDeEntrega(); recalcularOrden(); }
    if (t.id === "f-oc-cot")   cargarCotizacion();
    if (t.id.indexOf("ct-") === 0) actualizarResumenCotizacion();
    if (t.id.indexOf("f-oc-") === 0) recalcularOrden();
  });
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains("rp-precio")) recalcularRespuesta();
  });
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t && t.matches && t.matches("#ct-prov-tabla input")) actualizarResumenCotizacion();
  });

  /* Las pantallas 04 y 06 comparten el botón "Agregar producto": cada una sabe cuál es el suyo */
  function agregarSegunPantalla(boton) {
    return boton.closest(".panel").querySelector("#oc-reng") ? agregarProductoOrden() : agregarProducto();
  }

  function cargarRespuesta(boton) {
    var fila = boton.closest("tr");
    var codigo = codigoDeFila(fila, "Cotización");
    llenarRespuestas(codigo);
    var p = panelPorTitulo("Respuesta del Proveedor");
    if (p && p.scrollIntoView) p.scrollIntoView({ behavior: "smooth", block: "start" });
    aviso(codigo + ": escriba los precios que contestó el proveedor.", "ok");
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
    if (texto === "Agregar producto") { e.preventDefault(); return agregarSegunPantalla(b); }
    if (texto === "Quitar" && b.closest("#ct-reng, #oc-reng")) { e.preventDefault(); return quitarProducto(b); }
    if (b.id === "ct-pedir")          { e.preventDefault(); return pedirCotizacion(); }
    if (b.id === "rp-guardar")        { e.preventDefault(); return guardarRespuesta(); }
    if (texto === "Cargar respuesta") { e.preventDefault(); return cargarRespuesta(b); }
    if (b.id === "oc-generar")        { e.preventDefault(); return generarOrden(); }
    if (texto === "Registrar novedad")    { e.preventDefault(); return registrarNovedad(); }
    if (texto === "Registrar recepción")  { e.preventDefault(); return registrarRecepcion(b); }

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
      aviso(cual + " " + destino.dice + ".", destino.aviso);
      if (texto === "Elegir y ordenar") {
        cotElegida = cual;
        setTimeout(function () { ir("06-ordenes.html", true); }, 800);
      }
      return;
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
  iniciarFormularios();
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
    iniciarFormularios();
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
