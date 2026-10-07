/* =====================================================================
   07-comercial/mockup/prototipo.js

   Hace que el mockup de Comercial RESPONDA: registrar y editar clientes,
   generar cotizaciones, facturar, consultar existencias, validar pedidos y
   filtrar, sin recargar la página.

   Mismo motor que el de 04-inventario, con lo propio de este módulo.
   Las cotizaciones tienen su parte: la lista (tarjetas, filtros, orden y
   páginas) en la sección 9, la nueva cotización (cliente, productos y
   totales) en la 10 y el detalle que se abre desde la lista en la 11.
   Facturación va en la 12 y Clientes (lista, ficha y formulario) en la 13.
   La 14 tiene los datos que comparten Existencias, Pedidos e Inicio: las
   bodegas, los pares que hay en cada una, los pedidos y lo que cada uno tiene
   apartado. La 15 es la pantalla de Existencias y la 16 la de Pedidos (la
   lista, el detalle y la ventana "Validar existencias").
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
  var PADRE = { "09-cotizacion-nueva.html": "09-cotizacion.html", "10-facturacion-nueva.html": "10-facturacion.html",
                "04-cliente-nuevo.html": "04-clientes.html" };

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

  var yendo = null;     // la pantalla que se está trayendo: un doble clic no la pide dos veces
  var turno = 0;        // cada navegación toma el suyo: si llega tarde la respuesta de una vieja, no se pinta
  var navegadoEn = 0;   // cuándo se cambió de pantalla (el segundo clic de un doble clic cae en la nueva)
  function ir(archivo, guardarEnHistorial) {
    if (archivo === actual || archivo === yendo || !pagina()) return;
    var mio = ++turno;
    cerrarDetalle();
    guardadas[actual] = Array.prototype.slice.call(pagina().childNodes);

    function terminar() {
      actual = archivo;
      yendo = null;
      navegadoEn = Date.now();
      marcarMenu();
      alEntrar();
      if (guardarEnHistorial) history.pushState({ pantalla: archivo }, "", archivo);
      window.scrollTo(0, 0);
      var p = pagina();
      p.scrollTop = 0;   // en pantalla ancha quien se desplaza es .page
      if (p.parentNode) p.parentNode.scrollTop = 0;
    }

    if (guardadas[archivo]) {
      yendo = null;
      pintar(guardadas[archivo]);
      terminar();
      return;
    }

    yendo = archivo;
    fetch(archivo)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        if (mio !== turno) return;   // mientras tanto se pidió otra pantalla: esta ya no
        var doc = new DOMParser().parseFromString(html, "text/html");
        var sub = uno(".subnav", doc);
        if (sub) sub.parentNode.removeChild(sub);
        todos("script", doc).forEach(function (s) { s.parentNode.removeChild(s); });
        pintar(Array.prototype.slice.call(doc.body.childNodes));
        if (doc.title) document.title = doc.title;
        terminar();
      })
      .catch(function () { yendo = null; location.href = archivo; });   // sin servidor, se navega normal
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;   // Ctrl+clic: otra pestaña, como siempre
    var href = a.getAttribute("href");
    if (!ES_PANTALLA.test(href)) return;
    e.preventDefault();
    ir(href, true);
  });

  document.addEventListener("click", function (e) {
    if (e.detail > 1 && Date.now() - navegadoEn < 600) { e.stopImmediatePropagation(); e.preventDefault(); }
  }, true);

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

  /* El número de la pestaña en el menú lateral */
  function ponerEnMenu(archivo, n) {
    todos(".nav__si").forEach(function (a) {
      var ct = a.getAttribute("href") === archivo ? uno(".ct", a) : null;
      if (ct) ct.textContent = n;
    });
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

  /* ---------------------------------------------------------------- 8. Un solo oyente para los botones */

  /* Las tres acciones rápidas del tablero de Inicio */
  var RAPIDAS = {
    "cotizacion": { a: "09-cotizacion-nueva.html", dice: "Arme la cotización: cliente, productos y totales." },
    "cliente": { a: "04-cliente-nuevo.html", dice: "Registre el cliente: identificación, contacto, entrega y crédito." },
    "pedido":  { a: "05-pedidos.html",  dice: "Cada pedido sale de una factura: regístrelo con «Nuevo pedido»." }
  };

  function generarReporte() {
    /* 07-reportes.html cambió: el reporte se arma en la ventana #rep-nuevo
       (ver la sección "07. Reportes" al final de este archivo). */
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

    if (texto === "Generar reporte")     { e.preventDefault(); return abrirNuevoReporte(); }
    if (b.closest("#rep-nuevo") && texto === "Guardar y descargar") { e.preventDefault(); return guardarReporte(); }
    if (b.closest("#rep-nuevo") && texto === "Cancelar")            { e.preventDefault(); return cerrarNuevoReporte(); }
    if (b.closest("#rep-det") && texto === "Descargar de nuevo")    { e.preventDefault(); return reDescargarReporte(); }

    if (texto === "Marcar atendida") {
      e.preventDefault();
      var noti = b.closest(".noti");
      if (noti) noti.classList.add("es-atendida");
      b.replaceWith(Object.assign(document.createElement("span"),
        { className: "pill pill--ok", textContent: "Atendida" }));
      contarPendientes(-1);
      return aviso("Pendiente marcado como atendido.", "ok");
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

    if (texto === "Ver en Logística") {
      e.preventDefault();
      return aviso("La devolución la gestiona Logística y Despacho · Comercial solo la consulta.", "warn");
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
     Cotizaciones (#dt-cot), Facturación (#dt-fac) y Clientes (#dt-cli) usan la misma tabla: las
     tarjetas filtran, el buscador, la caja de filtros con sus fichas, el orden
     por columna, los totales de lo filtrado y las páginas. Lo que cambia de una
     a otra va en TABLAS: sus estados, sus filtros, cómo se ordena cada columna,
     qué cuentan sus tarjetas y qué hace al abrirse. Lo que se busca, se filtra,
     el orden y la página en la que va se guardan en "vistas", una por tabla. */

  var TABLAS = {};
  var vistas = {};

  /* Empieza de la más nueva a la más vieja, salvo que la tabla diga otro orden (orden: [columna, 1 o -1]) */
  function vistaNueva(tam, conf) {
    var o = conf && conf.orden || ["fecha", -1];
    return { q: "", f: {}, orden: o[0], dir: o[1], pag: 1, tam: tam || 10 };
  }
  function vistaDe(id) { return vistas[id] || (vistas[id] = vistaNueva(10, TABLAS[id])); }
  /* La tabla de datos que está en pantalla (#dt-cot, #dt-fac o #dt-cli), o null */
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

  /* Filtros que sirven a todas las tablas; los propios de cada una van en su "filtros" */
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
    if (k === "codigo") return cola(conf.codigoDe ? conf.codigoDe(tr) : textoDe(tr, conf.codigo));
    if (conf.claves[k]) return conf.claves[k](tr);
    return sinTildes(textoDe(tr, conf.columnas[k] || k));
  }

  function comparar(conf, vista) {
    return function (a, b) {
      var x = claveOrden(a, vista.orden, conf), y = claveOrden(b, vista.orden, conf);
      if (x < y) return -vista.dir;
      if (x > y) return vista.dir;
      return cola(conf.codigoDe ? conf.codigoDe(b) : textoDe(b, conf.codigo)) -
             cola(conf.codigoDe ? conf.codigoDe(a) : textoDe(a, conf.codigo));   // empate: la más nueva arriba
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
    var totTodas = uno('[data-tot="todas"]', dt);
    if (totTodas) totTodas.textContent = pesos(suma());
    conf.estados.forEach(function (e) {
      var t = uno('[data-tot="' + e + '"]', dt);
      if (t) t.textContent = pesos(suma(e));
    });
    if (conf.totales) conf.totales(vistas_, dt);   // lo que la tabla suma además (Pedidos: pares y faltantes)
    var filtrada = vistas_.length !== filas.length, los = conf.masculino ? "los" : "las";
    pieza(dt, "de").textContent = !filtrada ? "de " + los + " " + filas.length + " " + conf.plural
      : vistas_.length === 1 ? (conf.masculino ? "del único" : "de la única") + " que cumple el filtro"
      : "de " + los + " " + vistas_.length + " que cumplen el filtro";

    // Cuántas se ven y el paginador
    pieza(dt, "info").innerHTML = vistas_.length
      ? "Mostrando <b>" + (desde + 1) + "&ndash;" + Math.min(hasta, vistas_.length) + "</b> de <b>" +
        vistas_.length + "</b> " + conf.unaOVarias + (filtrada ? " · hay " + filas.length + " en total" : "")
      : (conf.masculino ? "Ningún " : "Ninguna ") + conf.una + " cumple el filtro";
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
    if (conf.textos && conf.textos[k]) return conf.textos[k](v);
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
    todos("[data-grupo]").forEach(function (b) {   // las tarjetas y, en Pedidos, la ficha "sin validar"
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

  /* Al abrir una tabla: si es la primera vez, todo como viene en el HTML; si
     entró algo nuevo (una cotización o una factura recién hecha), se ve arriba,
     sin filtros y de la más nueva a la más vieja */
  function iniciarTabla(id) {
    var dt = uno("#" + id), conf = TABLAS[id];
    if (!dt.getAttribute("data-listo")) {
      dt.setAttribute("data-listo", "1");
      vistas[id] = vistaNueva(10, conf);
    }
    var vista = vistaDe(id);
    var hubo = conf.alEntrar(dt, uno("tbody", dt));
    if (hubo) {
      vistas[id] = vista = vistaNueva(vista.tam, conf);
      pieza(dt, "q").value = "";
    }
    pieza(dt, "tam").value = String(vista.tam);
    pintarLista(dt);
    // Lo que se acaba de crear o cambiar tiene que verse: si quedó en otra página, se va a esa
    var filas = todos("tr[data-estado]", uno("tbody", dt)), nueva = uno("tr.es-nueva", dt);
    if (hubo && nueva && filas.indexOf(nueva) >= vista.tam) {
      vista.pag = Math.floor(filas.indexOf(nueva) / vista.tam) + 1;
      pintarLista(dt);
    }
  }

  function ponerFiltro(dt, campo) {
    var vista = vistaDe(dt.id);
    vista.f[campo.getAttribute("data-f")] = campo.value;
    vista.pag = 1;
    pintarLista(dt);
  }

  /* Una tabla que se abre desde otra pantalla con sus filtros ya puestos ("Ver la
     factura" en Pedidos, "Ver los pedidos que esperan este modelo" en Existencias):
     sin búsqueda, en la primera página y con solo esos filtros */
  function ponerFiltros(id, filtros) {
    var dt = uno("#" + id), vista = vistaDe(id);
    vista.f = filtros;
    vista.q = "";
    vista.pag = 1;
    pieza(dt, "q").value = "";
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

    var kpi = e.target.closest("[data-grupo]");
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
        // lo más nuevo o lo más grande primero (y lo que la tabla diga, como el cupo de un cliente)
        vista.dir = (k === "fecha" || k === "valor" || k === "pares" || (TABLAS[dt.id].mayorPrimero || []).indexOf(k) >= 0) ? -1 : 1;
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
      '<td class="dt__cli" data-l="Cliente" title="' + esc(c.cliente.nombre + " · " + idDe(c.cliente)) + '">' +
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

  /* El cliente de una fila con su nombre y su documento de hoy: pudo cambiar en Clientes */
  function ponerClienteEnFila(tr, c) {
    var td = celda(tr, "Cliente");
    if (!td || !c) return;
    td.textContent = c.nombre;
    td.title = c.nombre + " · " + idDe(c);
  }

  function entrarACotizaciones(dt, cuerpo) {
    todos("tr[data-estado]", cuerpo).forEach(function (tr) {
      var h = HISTORIAL[textoDe(tr, "Cotización")];
      if (h && h.estado !== tr.getAttribute("data-estado")) ponerEstadoCot(tr, h);
      if (h) ponerClienteEnFila(tr, clientePor(h.cli));
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

  /* Las reglas de la cotización */
  var VIGENCIA = 15;        // días que vale una cotización
  var DESCUENTO_MAX = 8;    // % de descuento que se da sin autorización
  var CUPO_AVISO = 85;      // % del cupo en el que se avisa "cupo casi lleno"

  /* Quien entró al sistema. Sin inicio de sesión no se puede saber solo */
  var VENDEDOR = { nombre: "Valentina Rojas", codigo: "VEN-03", zona: "Cúcuta" };

  /* Los clientes de 04-clientes.html, con todo lo que se sabe de cada uno. Los
     campos salen de lo que pide la DIAN para la factura electrónica (Anexo técnico
     1.9) y de lo que usa Comercial para vender a crédito y despachar:
     - Identificación: tipoPersona (juridica / natural), tipoDoc (código DIAN: 31 NIT,
       13 cédula...), nit (el número como se muestra, con el DV si es NIT), nombre
       (la razón social, o nombres y apellidos de la persona natural) y "nombres"
       (los cuatro por separado, solo persona natural).
     - Contacto: contacto (la persona con quien se habla; la persona natural puede no
       dar otra y entonces es ella misma), cargo, telefono (celular), fijo, correo.
     - Ubicación: dane (código del municipio), ciudad, direccion, barrio.
     - Venta: canal, vendedor, pago ("Contado" o "Crédito N días"), cupo, saldo (lo
       que debe hoy) y "vencidas": sus facturas que ya pasaron la fecha de pago y no
       están pagas.
     - Facturación electrónica (a futuro): responsabilidades fiscales, tributo, el
       correo donde recibe la factura (correoFe) y si él mismo factura electrónicamente.
     - activo: false si ya no se le vende (no sale para cotizar).
     El de contado no tiene cupo: paga al recibir. */
  var CLIENTES = [
    { codigo: "CL-001", nombre: "Calzado El Dorado", tipoPersona: "juridica", tipoDoc: "31", nit: "830.112.991-6",
      desde: 2023, dane: "11001", ciudad: "Bogotá", direccion: "Cra. 13 # 63-40", barrio: "Chapinero",
      contacto: "Luis Gómez", cargo: "compras", telefono: "310 245 8871", fijo: "601 348 2210",
      correo: "compras@calzadoeldorado.com.co", canal: "Almacén", vendedor: "Andrés Quintero",
      pago: "Crédito 30 días", cupo: 12000000, saldo: 4800000, vencidas: [],
      responsabilidades: ["R-99-PN"], tributo: "01", correoFe: "facturas@calzadoeldorado.com.co", facturador: true },
    { codigo: "CL-002", nombre: "Distribuidora Tamanaco", tipoPersona: "juridica", tipoDoc: "31", nit: "900.221.334-8",
      desde: 2021, dane: "54001", ciudad: "Cúcuta", direccion: "Av. 0 # 11-52", barrio: "Centro",
      contacto: "Carmen Pabón", cargo: "gerente", telefono: "315 882 1043", fijo: "607 571 4420",
      correo: "pedidos@tamanaco.com.co", canal: "Distribuidor", vendedor: "Valentina Rojas",
      pago: "Crédito 60 días", cupo: 9000000, saldo: 8600000,
      vencidas: [{ factura: "FV-2026-0098", vence: "2026-09-12", total: 2150000 }],
      responsabilidades: ["O-47"], tributo: "01", correoFe: "facturacion@tamanaco.com.co", facturador: true,
      obs: "Recibe de lunes a viernes, de 7 a 11 de la mañana, en la bodega de la Av. 0." },
    { codigo: "CL-003", nombre: "Calzado Norte", tipoPersona: "juridica", tipoDoc: "31", nit: "830.112.998-7",
      desde: 2022, dane: "11001", ciudad: "Bogotá", direccion: "Calle 80 # 24-15", barrio: "Las Ferias",
      contacto: "Jorge Ramírez", cargo: "compras", telefono: "301 554 2290", fijo: "",
      correo: "compras@calzadonorte.com.co", canal: "Almacén", vendedor: "Andrés Quintero",
      pago: "Crédito 30 días", cupo: 15000000, saldo: 13200000, vencidas: [],
      responsabilidades: ["R-99-PN"], tributo: "01", correoFe: "compras@calzadonorte.com.co", facturador: true },
    { codigo: "CL-004", nombre: "Almacén La Bota Fina", tipoPersona: "juridica", tipoDoc: "31", nit: "901.455.210-1",
      desde: 2024, dane: "68001", ciudad: "Bucaramanga", direccion: "Cra. 15 # 34-21", barrio: "Centro",
      contacto: "Diana Serrano", cargo: "propietaria", telefono: "317 640 3318", fijo: "",
      correo: "ventas@labotafina.com.co", canal: "Almacén", vendedor: "Valentina Rojas",
      pago: "Contado", cupo: 0, saldo: 0, vencidas: [],
      responsabilidades: ["R-99-PN"], tributo: "01", correoFe: "ventas@labotafina.com.co", facturador: true },
    { codigo: "CL-005", nombre: "Comercial Los Andes", tipoPersona: "juridica", tipoDoc: "31", nit: "890.332.117-7",
      desde: 2019, dane: "68001", ciudad: "Bucaramanga", direccion: "Calle 36 # 19-40", barrio: "Cabecera del Llano",
      contacto: "Óscar Villamizar", cargo: "compras", telefono: "312 908 4476", fijo: "607 634 9012",
      correo: "compras@comerciallosandes.com.co", canal: "Cadena", vendedor: "Marcela Duarte",
      pago: "Crédito 60 días", cupo: 18000000, saldo: 15900000,
      vencidas: [{ factura: "FV-2026-0091", vence: "2026-09-04", total: 3480000 },
                 { factura: "FV-2026-0104", vence: "2026-09-22", total: 1920000 }],
      responsabilidades: ["O-15", "O-23"], tributo: "01", correoFe: "recepcionfe@comerciallosandes.com.co", facturador: true,
      obs: "Exige orden de compra en cada factura; sin ella la devuelven." },
    { codigo: "CL-006", nombre: "Almacén Sur", tipoPersona: "juridica", tipoDoc: "31", nit: "901.778.043-4",
      desde: 2025, dane: "68001", ciudad: "Bucaramanga", direccion: "Cra. 21 # 45-08", barrio: "La Concordia",
      contacto: "Paola Rueda", cargo: "administradora", telefono: "318 221 7765", fijo: "",
      correo: "compras@almacensur.com.co", canal: "Almacén", vendedor: "Andrés Quintero",
      pago: "Crédito 30 días", cupo: 7000000, saldo: 2480000, vencidas: [],
      responsabilidades: ["R-99-PN"], tributo: "01", correoFe: "compras@almacensur.com.co", facturador: true },
    { codigo: "CL-007", nombre: "Comercializadora Pamplona", tipoPersona: "juridica", tipoDoc: "31", nit: "900.664.812-8",
      desde: 2022, dane: "54518", ciudad: "Pamplona", direccion: "Calle 6 # 5-33", barrio: "El Carmen",
      contacto: "Hernán Jaimes", cargo: "gerente", telefono: "314 776 0091", fijo: "",
      correo: "gerencia@comercializadorapamplona.com.co", canal: "Distribuidor", vendedor: "Marcela Duarte",
      pago: "Crédito 30 días", cupo: 5000000, saldo: 5200000,
      vencidas: [{ factura: "FV-2026-0076", vence: "2026-07-20", total: 1640000 },
                 { factura: "FV-2026-0089", vence: "2026-08-01", total: 2310000 },
                 { factura: "FV-2026-0101", vence: "2026-08-19", total: 1250000 }],
      responsabilidades: ["R-99-PN"], tributo: "01", correoFe: "gerencia@comercializadorapamplona.com.co", facturador: true },
    { codigo: "CL-008", nombre: "Calzado del Oriente", tipoPersona: "juridica", tipoDoc: "31", nit: "901.220.556-5",
      desde: 2024, dane: "54498", ciudad: "Ocaña", direccion: "Calle 11 # 13-60", barrio: "Centro",
      contacto: "Yolanda Quintero", cargo: "propietaria", telefono: "316 430 5582", fijo: "",
      correo: "ventas@calzadodeloriente.com.co", canal: "Almacén", vendedor: "Valentina Rojas",
      pago: "Contado", cupo: 0, saldo: 0, vencidas: [],
      responsabilidades: ["R-99-PN"], tributo: "01", correoFe: "ventas@calzadodeloriente.com.co", facturador: true }
  ];

  /* Los tipos de documento, con su código de la DIAN para la factura electrónica (tabla
     13.2.1 del Anexo técnico 1.9). Los usa todo lo que muestra el documento de un cliente */
  var TIPOS_DOC = [
    { cod: "31", nombre: "NIT", sigla: "NIT" },
    { cod: "13", nombre: "Cédula de ciudadanía", sigla: "C.C." },
    { cod: "22", nombre: "Cédula de extranjería", sigla: "C.E." },
    { cod: "41", nombre: "Pasaporte", sigla: "Pasaporte" },
    { cod: "48", nombre: "Permiso por Protección Temporal (PPT)", sigla: "PPT" },
    { cod: "42", nombre: "Documento de identificación extranjero", sigla: "Doc. extranjero" },
    { cod: "50", nombre: "NIT de otro país", sigla: "NIT ext." }
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
    usuario: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    lapiz: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>' +
           '<path d="m15 5 4 4"/>',
    papelera: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>' +
              '<path d="M10 11v6"/><path d="M14 11v6"/>',
    zapato: '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/>' +
            '<path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/>' +
            '<path d="M16 17h4"/><path d="M4 13h4"/>',
    // Los de Existencias y Pedidos
    factura: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>' +
             '<path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
    etiqueta: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/>' +
              '<circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    portapapeles: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>' +
                  '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>' +
                  '<path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    ojo: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>' +
         '<circle cx="12" cy="12" r="3"/>',
    ubicacion: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>' +
               '<circle cx="12" cy="10" r="3"/>',
    cuadricula: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>' +
                '<rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    // "recargar" no está en comun/iconos.svg: es rotate-cw, del mismo juego de íconos (Lucide)
    recargar: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
    // Los botones de la ventana "Validar existencias": a Logística (camión) o a Producción (engranaje)
    camion: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/>' +
            '<path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>' +
            '<circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    engranaje: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 ' +
               '2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 ' +
               '2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>'
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
    // de contado: no tiene cupo que llenar; si todavía debe algo, es como pasarse del cupo
    if (!c.cupo) return c.saldo > 0 ? { texto: "Cupo excedido", tono: "crit" } : { texto: "Al día", tono: "ok" };
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

  function tipoDocDe(cod) { return TIPOS_DOC.filter(function (t) { return t.cod === cod; })[0] || TIPOS_DOC[0]; }
  /* Su documento como se lee: "NIT 900.221.334-8", "C.C. 1.090.441.203" */
  function idDe(c) { return tipoDocDe(c.tipoDoc).sigla + " " + c.nit; }
  /* Cuánto del cupo ya usó, en %; null si es de contado (no tiene cupo) */
  function usoDe(c) { return c.cupo ? Math.floor(100 * c.saldo / c.cupo) : null; }
  /* Con quién se habla, con su cargo: "Carmen Pabón · gerente". Si la persona natural
     no dio otro contacto, es ella misma (con su nombre de hoy) */
  function contactoDe(c) { return [c.contacto || c.nombre, c.cargo].filter(Boolean).join(" · "); }
  /* El correo, que puede partir el renglón después de la @ y de cada punto */
  function correoHtml(correo) { return esc(correo).replace(/([@.])/g, "$1<wbr>"); }
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
    var lista = buscarEn(activos(), uno("#cot-cli-q").value, function (c) {   // al inactivo ya no se le vende
      return c.nombre + " " + idDe(c) + " " + c.ciudad;
    });
    // Si no hay activos con eso pero sí un inactivo, se dice: no hay que registrarlo otra vez
    var inactivo = lista.length ? null : buscarEn(CLIENTES.filter(function (c) { return c.activo === false; }), uno("#cot-cli-q").value,
      function (c) { return c.nombre + " " + idDe(c) + " " + c.ciudad; })[0];
    caja.innerHTML = lista.length ? lista.map(function (c, i) {
      var e = estadoPrincipal(c);
      return '<button type="button" class="cot-res__i' + (i === 0 ? " is-on" : "") + '" role="option" data-cli="' + c.codigo + '">' +
        '<span class="avatar avatar--sm" aria-hidden="true">' + esc(iniciales(c.nombre)) + "</span>" +
        '<span class="cot-res__x"><b>' + esc(c.nombre) + "</b><small>" + esc(idDe(c)) + " · " + c.ciudad + "</small></span>" +
        '<span class="pill pill--' + e.tono + '">' + e.texto + "</span></button>";
    }).join("") : inactivo ? '<p class="cot-res__vacio">' + esc(inactivo.nombre) + ' está inactivo: para cotizarle, actívelo en ' +
                  '<a href="04-clientes.html">Clientes</a> (Editar cliente).</p>'
                : '<p class="cot-res__vacio">Ningún cliente tiene ese nombre, NIT o cédula. Si es nuevo, ' +
                  'regístrelo primero en <a href="04-cliente-nuevo.html">Nuevo cliente</a>.</p>';
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
    if (form.getAttribute("data-listo")) return pintarCotizacion();   // volvió a una que dejó a medias
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
    if (cliACotizar) {
      elegirCliente(cliACotizar);
      cliACotizar = null;
    }
    if (refACotizar) {   // "Cotizar este modelo" (Existencias): la vitrina se abre en ese modelo
      vit.ref = refACotizar;
      refACotizar = null;
    }
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
    var inactivo = !!cot.cliente && cot.cliente.activo === false;
    todos('[data-cot="abrir-productos"]').forEach(function (b) { b.disabled = inactivo; });
    cotizar.disabled = !cot.cliente || inactivo;
    var borrador = uno('[data-cot="borrador"]');
    borrador.hidden = nueva;
    borrador.disabled = !cot.cliente || inactivo || !t.renglones;
    var enviar = uno('[data-cot="enviar"]');
    enviar.hidden = nueva;
    enviar.disabled = !cot.cliente || inactivo || !t.renglones || t.sinCant > 0 || t.descAlto > 0;
    uno("#cot-msg").textContent = mensaje(t);
  }

  function mensaje(t) {
    if (!cot.cliente) return "Seleccione un cliente para poder cotizar.";
    if (cot.cliente.activo === false) return cot.cliente.nombre + " ya no está activo: actívelo en Clientes (Editar cliente) o cambie de cliente.";
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
    var libre = Math.max(0, c.cupo - c.saldo), uso = usoDe(c);
    // Arriba, lo que más pesa: si tiene facturas vencidas no está "Al día", aunque le quede cupo
    var estados = (c.activo === false ? '<span class="pill pill--off">Inactivo</span>' : "") +
                  (n ? '<span class="pill pill--crit">' + cuantas(n, "factura vencida", "facturas vencidas") + "</span>" : "") +
                  (!n || e.tono !== "ok" ? '<span class="pill pill--' + e.tono + '">' + e.texto + "</span>" : "");
    var alerta = "";
    if (c.activo === false) {
      // ya lo dice su aviso de vencidas o la píldora: no se le cotiza
    } else if (e.tono === "crit") {
      alerta = avisoHtml("crit", "Cupo excedido", "Debe " + pesos(c.saldo) + " con un cupo de " + pesos(c.cupo) +
                         ". Se le puede cotizar, pero Facturación la retiene hasta que pague.");
    } else if (e.tono === "warn") {
      alerta = avisoHtml("warn", "Cupo casi lleno", "Le quedan " + pesos(libre) +
                         " de cupo. Si la cotización pasa de ahí, Facturación la retiene hasta que pague.");
    }
    ficha.innerHTML =
      '<div class="cot-ficha__cab">' +
        '<div class="who"><span class="avatar" aria-hidden="true">' + esc(iniciales(c.nombre)) + "</span>" +
          "<div><b>" + esc(c.nombre) + "</b><small>" + esc(idDe(c)) + " · cliente desde " + c.desde + "</small></div></div>" +
        '<span class="cot-ficha__estados">' + estados + "</span>" +
        '<button class="btn btn--sm btn--ghost" type="button" data-cot="cambiar-cliente">Cambiar cliente</button>' +
      "</div>" +
      '<div class="cot-ficha__g">' +
        seccion("Contacto", kv("Persona", esc(contactoDe(c))) + kv("Teléfono", esc(c.telefono)) + kv("Correo", correoHtml(c.correo))) +
        seccion("Entrega", kv("Dirección", esc(c.direccion)) + (c.barrio ? kv("Barrio", esc(c.barrio)) : "") + kv("Ciudad", c.ciudad)) +
        seccion("Crédito", kv("Forma de pago", c.pago) +
                           (uso === null ? '<span class="tiny">De contado: no tiene cupo de crédito.</span>'
                             : kv("Cupo", pesos(c.cupo)) + kv("Debe hoy", pesos(c.saldo)) + kv("Disponible", pesos(libre)) +
                               '<div class="bar' + (e.tono === "ok" ? " bar--ok" : e.tono === "crit" ? " bar--crit" : "") +
                               '"><i style="width:' + Math.min(100, uso) + '%"></i></div>' +
                               '<span class="tiny">Usa el ' + uso + " % del cupo</span>") +
                           kv("Facturas vencidas", n ? '<span class="cot-mal">' + n + " · " + pesos(totalVencido(c)) + "</span>"
                                                     : '<span class="cot-bien">Ninguna</span>')) +
      "</div>" + vencidasHtml(c) + alerta;
    if (resumida) {
      uno("#cot-cli-mini").innerHTML =
        '<span class="avatar avatar--sm" aria-hidden="true">' + esc(iniciales(c.nombre)) + "</span>" +
        '<div class="cot-cli-mini__x"><div class="cot-cli-mini__n"><b>' + esc(c.nombre) + '</b><span class="cot-ficha__estados">' + estados + "</span></div>" +
          "<small>" + esc(idDe(c)) + " · " + c.ciudad + " · " + c.pago + (c.cupo ? " · disponible " + pesos(libre) : "") + "</small></div>" +
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
        "<p>" + (c.activo === false ? "Está inactivo: no se le cotiza, y no se le podrá facturar hasta que las pague."
                                     : "Se le puede cotizar, pero no se le podrá facturar hasta que las pague.") + "</p></div></div>" +
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
    // el de un cliente inactivo sale siempre, aunque todavía no haya productos
    uno("#cot-avisos").innerHTML = t.renglones || (cot.cliente && cot.cliente.activo === false) ? avisosCotizacion(t) : "";
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
    if (c && c.activo === false) {
      return avisoHtml("crit", c.nombre + " ya no está activo", "No se le puede cotizar. Para volver a venderle, actívelo en Clientes (Editar cliente).");
    }
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
                     "Salen en rojo en la lista. Se cotiza igual: al validar el pedido se aparta lo que haya y el resto lo fabrica Producción.");
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
    if (c && c.activo === false) return aviso(c.nombre + " ya no está activo: no se le puede cotizar.", "crit");
    if (!c) {
      uno("#cot-cli-q").focus();
      return aviso("Primero seleccione un cliente.", "crit");
    }
    uno("#cot-dlg-sub").textContent = cot.numero + " · " + c.nombre + (c.cupo ? " · cupo disponible " + pesos(Math.max(0, c.cupo - c.saldo)) : " · de contado");
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
            '<span class="is-cero">no hay</span><span class="is-mal" title="Se cotiza igual: al validar el pedido se aparta' +
            ' lo que haya y el resto lo fabrica Producción">pide más de lo que hay</span></div>' +
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
    if (cot.cliente.activo === false) return aviso(cot.cliente.nombre + " ya no está activo: no se le puede cotizar.", "crit");
    cot.numero = "CO-" + cot.fecha.getFullYear() + "-" + ("00" + (ultimaCot + 1)).slice(-3);
    cot.estado = "elaboracion";
    pintarCotizacion();
    aviso(cot.numero + " queda en elaboración para " + cot.cliente.nombre + ": ahora elija los productos.", "ok");
    abrirProductos();
  }

  function guardarCotizacion(estado) {
    var t = totales();
    if (!cot.cliente) return aviso("Seleccione un cliente.", "crit");
    if (cot.cliente.activo === false) return aviso(cot.cliente.nombre + " ya no está activo: no se le puede cotizar.", "crit");
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
    if (uno("#dt-fac") && facFiltro) {   // "Ver la factura" (Pedidos): la lista filtrada por esa factura
      ponerFiltros("dt-fac", { codigo: facFiltro });
      facFiltro = null;
    }
    if (uno("#fac-form")) iniciarFactura();
    if (uno("#dt-cli")) iniciarTabla("dt-cli");
    if (uno("#cli-form")) iniciarCliente();
    if (uno("#exi")) iniciarExistencias();
    if (uno("#dt-ped")) iniciarPedidos();
    if (uno("#dt-ent")) iniciarTabla("dt-ent");
    if (uno("#dt-rep")) iniciarTabla("dt-rep");
    ponerEnMenu(CLI_LISTA, activos().length);   // los clientes a los que se les vende
    // Las cotizaciones por facturar: lo que espera Facturación, en las dos pestañas
    var n = porFacturar().length;
    ponerEnMenu(LISTA, n);
    ponerEnMenu(FACTURAS, n);
    ponerEnMenu(PED_LISTA, porAtender());
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
     renglones de verdad (guardarCotizacion). CO-2026-005, 007 y 010 también
     traen sus renglones (renglonesDe): son los de sus pedidos, que esperan el
     color que no hay en bodega. Los pares y el valor son los mismos de su factura. */
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
                     lineas: renglonesDe("REF-1042", 3, { "Negro": [4, 8, 12, 12, 8, 4] }), descuentos: { "REF-1042": 3 },
                     pasos: { porfacturar: 0, facturada: 4 }, obs: "" },
    "CO-2026-006": { fecha: "2026-08-24", cli: "CL-006", vend: "Marcela Duarte", pares: 30, estado: "vencida", factura: "",
                     ref: "REF-1043", desc: 0, pasos: {}, obs: "Precio sostenido hasta la fecha de vigencia." },
    "CO-2026-007": { fecha: "2026-08-27", cli: "CL-001", vend: "Valentina Rojas", pares: 26, estado: "facturada", factura: "FV-2026-0139",
                     lineas: renglonesDe("REF-1042", 0, { "Negro": [2, 4, 6, 6, 5, 3] }), descuentos: { "REF-1042": 0 },
                     pasos: { porfacturar: 0, facturada: 3 }, obs: "" },
    "CO-2026-008": { fecha: "2026-09-01", cli: "CL-008", vend: "Andrés Quintero", pares: 36, estado: "facturada", factura: "FV-2026-0144",
                     ref: "REF-1044", desc: 5, pasos: { porfacturar: 0, facturada: 2 }, obs: "Pago de contado. Incluye el marcado de la plantilla." },
    "CO-2026-009": { fecha: "2026-09-03", cli: "CL-004", vend: "Marcela Duarte", pares: 20, estado: "vencida", factura: "",
                     ref: "REF-1043", desc: 0, pasos: {}, obs: "" },
    "CO-2026-010": { fecha: "2026-09-07", cli: "CL-003", vend: "Valentina Rojas", pares: 84, estado: "facturada", factura: "FV-2026-0152",
                     lineas: renglonesDe("REF-1042", 8, { "Negro": [6, 10, 14, 14, 10, 6], "Café": [2, 3, 4, 3, 2, 0], "Miel": [0, 2, 3, 3, 1, 1] }),
                     descuentos: { "REF-1042": 8 },
                     pasos: { porfacturar: 0, facturada: 4 }, obs: "Descuento del 8 % por volumen. Entrega en dos despachos." },
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

  /* Los renglones de una cotización a partir de los pares de cada color, con la
     forma de PRODUCTOS.colores: { "Negro": [4, 8, 12, 12, 8, 4] } da un renglón
     por cada talla que tiene pares, con el descuento del modelo */
  function renglonesDe(ref, desc, porColor) {
    var p = productoPor(ref), lineas = [];
    Object.keys(porColor).forEach(function (color) {
      porColor[color].forEach(function (pares, i) {
        if (pares > 0) lineas.push({ ref: ref, color: color, talla: p.tallas[i], cant: pares, desc: desc });
      });
    });
    return lineas;
  }

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
            esc(c.nombre) + " debe " + enLista(vs.map(function (v) {
              return sinPartir(v.factura) + " (" + pesos(v.total) + ", vencida hace " + sinPartir(cuantas(v.dias, "día", "días")) + ")";
            })) + ". Primero tiene que pagarlas.")
        : "");

    uno("#cot-det-ficha").innerHTML =
      seccion("Cliente", '<b class="cot-det__cli">' + esc(c.nombre) + '</b><span class="tiny">' + esc(idDe(c)) + " · " + c.ciudad + "</span>" +
                         kv("Contacto", esc(contactoDe(c))) + kv("Teléfono", esc(c.telefono)) + kv("Forma de pago", c.pago)) +
      seccion("Datos", kv("Fecha", fechaLarga(q.fecha)) + kv("Válida hasta", fechaLarga(q.vence)) +
                       kv("Vendedor", q.vendedor) +
                       // Al enviarla a Facturación, al cliente le llega el PDF: solo para que la conozca
                       (q.pasos.porfacturar !== undefined ? kv("PDF enviado a", correoHtml(c.correo)) : "") +
                       (q.factura ? kv("Factura", q.factura) : ""));

    uno("#cot-det-prod-sub").textContent = cuantas(refs.length, "modelo", "modelos") + " · " + cuantas(t.pares, "par", "pares");
    uno("#cot-det-lineas").innerHTML = refs.map(function (ref) { return itemCotizacionHtml(ref, q, true); }).join("");
    var obs = uno("#cot-det-obs");
    obs.textContent = q.obs || "Sin observaciones.";
    obs.classList.toggle("is-vacio", !q.obs);
    uno("#cot-det-tot").innerHTML = totalesHtml(t);
  }

  /* ---- El panel de detalle, el mismo para todas las tablas ----
     Cada tabla que abre un detalle dice aquí en qué panel (su id) y cómo se pinta
     lo de la fila. Cotizaciones y Clientes lo usan igual: se abre con un clic en la
     fila (o Enter sobre su primer botón) y se cierra con la ✕, con Esc o pulsando
     fuera; mientras está abierto, el Tab no se sale de él. */
  var DETALLES = {
    "dt-cot": { panel: "cot-det", pintar: function (tr) { pintarDetalle(detalleDe(tr)); } }
  };

  function panelAbierto() { return uno(".cot-det-fondo:not([hidden])"); }

  function abrirDetalle(tr) {
    var caja = uno("#" + DETALLES[tr.closest(".dt").id].panel);
    if (detalleDesde) detalleDesde.classList.remove("is-sel");
    detalleDesde = tr;
    tr.classList.add("is-sel");
    DETALLES[tr.closest(".dt").id].pintar(tr);
    caja.hidden = false;
    uno(".cot-det__cuerpo", caja).scrollTop = 0;
    uno(".cot-det", caja).focus();
  }

  function cerrarDetalle() {
    var caja = panelAbierto();
    if (!caja) return;
    caja.hidden = true;
    if (!detalleDesde) return;
    detalleDesde.classList.remove("is-sel");
    var b = uno(".dt__ver", detalleDesde);
    detalleDesde = null;
    if (b) b.focus();
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    var caja = panelAbierto();
    if (caja) {
      // Se cierra con la ✕ o pulsando fuera del panel
      // (el segundo clic de un doble clic en la fila, detail 2, no lo cierra)
      if ((e.target === caja && e.detail < 2) || e.target.closest('[data-det="cerrar"]')) cerrarDetalle();
      return;
    }
    var tr = e.target.closest(".dt tbody tr[data-estado]");
    if (!tr || !DETALLES[tr.closest(".dt").id] || e.target.closest("a, input, select")) return;
    if (String(window.getSelection && window.getSelection()).trim()) return;   // estaba copiando texto de la fila
    abrirDetalle(tr);
  });

  // Con el detalle abierto, Esc lo cierra y el Tab no se sale de él
  document.addEventListener("keydown", function (e) {
    var caja = panelAbierto();
    if (!caja) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      return cerrarDetalle();
    }
    if (e.key === "Tab") {
      var f = todos('button:not([disabled]), a[href], [tabindex="0"]', caja).filter(function (x) { return x.offsetParent; });
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      if (i < 0) f[e.shiftKey ? f.length - 1 : 0].focus();   // recién abierto: el foco está en el panel
      else f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
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
      '<td class="dt__cli" data-l="Cliente" title="' + esc(f.cliente.nombre + " · " + idDe(f.cliente)) + '">' +
        esc(f.cliente.nombre) + "</td>" +
      '<td data-l="Cotización">' + f.cotizacion + "</td>" +
      '<td data-l="Pago">' + f.pago + "</td>" +
      '<td class="num" data-l="Valor">' + pesos(f.valor) + "</td>" + vence +
      '<td data-l="Estado"><span class="pill pill--' + TONO_FAC[f.estado] + '">' + NOMBRE_FAC[f.estado] + "</span></td></tr>";
  }

  /* De quién es una factura: de la cotización que se facturó con ella, o del cliente que la debe */
  function clienteDeFactura(numero) {
    for (var n in HISTORIAL) if (HISTORIAL[n].factura === numero) return clientePor(HISTORIAL[n].cli);
    return CLIENTES.filter(function (c) { return c.vencidas.some(function (v) { return v.factura === numero; }); })[0];
  }

  function entrarAFacturas(dt, cuerpo) {
    todos("tr[data-estado]", cuerpo).forEach(function (tr) { ponerClienteEnFila(tr, clienteDeFactura(textoDe(tr, "Factura"))); });
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
    if (form.getAttribute("data-listo")) return pintarFactura();   // volvió a una que dejó a medias
    form.setAttribute("data-listo", "1");
    var dia = new Date();
    fac = { cot: null, pago: "", q: "", iq: "", fecha: dia };
    uno("#fac-fecha").textContent = fechaLarga(dia);
    uno("#fac-dia").textContent = DIAS[dia.getDay()] + " · la pone el sistema";
    // Quien entró al sistema: el mismo vendedor de Cotizaciones
    uno("#fac-vend-ini").textContent = iniciales(VENDEDOR.nombre);
    uno("#fac-vendedor").textContent = VENDEDOR.nombre;
    uno("#fac-vend-sub").textContent = VENDEDOR.codigo + " · zona " + VENDEDOR.zona;
    verResultados(uno("#fac-res"), false);
    uno("#fac-iq").value = "";
    pintarFactura();
  }

  /* Lo que se ve en el buscador del encabezado cuando ya hay una elegida */
  function etiquetaCot(q) { return q ? q.numero + " · " + q.cliente.nombre : ""; }

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

    // El encabezado: la cotización elegida en su buscador
    var campo = uno("#fac-q");
    if (document.activeElement !== campo) campo.value = etiquetaCot(q);
    uno('[data-fac="quitar-cot"]').hidden = !q;
    uno("#fac-cot-sub").textContent = q ? "De " + q.vendedor + " · " + plazoTexto(q.vence) + " · " + cuantas(r.t.pares, "par", "pares")
                                        : "Búsquela por número, cliente o NIT, o despliegue la lista";

    // Columna 1: el cliente de la cotización
    uno("#fac-cli").innerHTML = q ? clienteFacturaHtml(c, r)
      : '<div class="cot-vacio">' + icono("usuario", 30) + "<b>Todavía no hay cliente</b>" +
        "<p>Seleccione arriba la cotización que va a facturar y aquí sale su cliente, con todo lo que va en la factura.</p></div>";

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
        "<p>Seleccione arriba una cotización por facturar para traer su cliente, sus productos y sus totales.</p></div>"
      : vistos.length ? vistos.map(function (ref) { return itemCotizacionHtml(ref, q, true); }).join("")
      : '<p class="cot-vacio">Ningún producto de la factura coincide con la búsqueda.</p>';
    uno("#fac-obs").textContent = q ? (q.obs || "Sin observaciones.") : "—";
    uno("#fac-obs").classList.toggle("is-vacio", !q || !q.obs);

    // Columna 3: totales, total en letras, avisos, pago y Facturar
    var t = r.t || { bruto: 0, descuento: 0, iva: 0, total: 0, pares: 0, porIva: {}, sinIva: 0 };
    uno("#fac-tot").innerHTML = totalesHtml(t);
    uno("#fac-letras").innerHTML = "<b>Son:</b> " + enLetras(t.total);
    uno("#fac-pago").innerHTML = pagoHtml(r);
    uno("#fac-pago").disabled = !q || bloqueada;
    uno("#fac-avisos").innerHTML = avisosFacturaHtml(r);
    var facturar = uno('[data-fac="facturar"]');
    facturar.disabled = !listo;
    uno("#fac-msg").textContent = !q ? "Seleccione arriba la cotización que va a facturar."
      : bloqueada ? "No se puede facturar hasta que " + c.nombre + " pague sus facturas vencidas."
      : !fac.pago ? "Escoja el método de pago."
      : "Todo listo: al facturar, la factura toma su número y la cotización queda facturada.";
  }

  function plazoTexto(vence) {
    return diasHasta(vence) < 0 ? "ya venció" : "vence " + cuandoVence(vence);
  }

  /* "en 4 días", "mañana", "hoy"; si ya pasó, "venció ayer" o "venció hace 3 días" */
  function cuandoVence(vence) {
    var d = diasHasta(vence);
    return d > 1 ? "en " + d + " días" : d === 1 ? "mañana" : d === 0 ? "hoy"
      : d === -1 ? "venció ayer" : "venció hace " + -d + " días";
  }

  /* "hoy", "ayer" o "hace 10 días" */
  function cuandoSeHizo(fecha) {
    var d = -diasHasta(fecha);
    return d < 1 ? "hoy" : d === 1 ? "ayer" : "hace " + d + " días";
  }

  /* El cliente, con todo lo que va en la factura: la foto (sus iniciales)
     centrada, el nombre, su identificación y debajo lo demás */
  function clienteFacturaHtml(c, r) {
    var e = estadoCliente(c), n = r.vencidas.length;
    var estados = (c.activo === false ? '<span class="pill pill--off" title="Ya no se le vende: no sale para cotizar">Inactivo</span>' : "") +
                  (n ? '<span class="pill pill--crit">' + cuantas(n, "factura vencida", "facturas vencidas") + "</span>" : "") +
                  (!n || e.tono !== "ok" ? '<span class="pill pill--' + e.tono + '">' + e.texto + "</span>" : "");
    return '<div class="fac-cli">' +
      '<span class="avatar fac-cli__foto" aria-hidden="true">' + esc(iniciales(c.nombre)) + "</span>" +
      '<b class="fac-cli__nombre">' + esc(c.nombre) + "</b>" +
      '<span class="fac-cli__id"><span>' + tipoDocDe(c.tipoDoc).sigla + "</span> " + esc(c.nit) + "</span>" +
      '<span class="cot-ficha__estados">' + estados + "</span>" +
      '<div class="fac-cli__datos">' +
        seccion("Contacto", kv("Persona", esc(contactoDe(c))) + kv("Teléfono", esc(c.telefono)) + kv("Correo", correoHtml(c.correo))) +
        seccion("Entrega", kv("Dirección", esc(c.direccion)) + (c.barrio ? kv("Barrio", esc(c.barrio)) : "") + kv("Ciudad", c.ciudad)) +
        seccion("Crédito", kv("Forma de pago", c.pago) +
                           (r.tieneCredito ? kv("Cupo", pesos(c.cupo)) + kv("Debe hoy", pesos(c.saldo)) + kv("Disponible", pesos(r.libre)) : "")) +
      "</div></div>";
  }

  /* Las cotizaciones por facturar, en la lista del buscador del encabezado */
  function pintarOpciones() {
    var q = sinTildes(fac.q.trim()), pegado = q.replace(/[.\-]/g, "");
    var todas = porFacturar();
    var vistas_ = todas.filter(function (x) {
      if (!q) return true;
      var todo = sinTildes(x.numero + " " + x.cliente.nombre + " " + x.cliente.nit + " " + x.vendedor);
      return todo.indexOf(q) >= 0 || (pegado && todo.replace(/[.\-]/g, "").indexOf(pegado) >= 0);
    });
    var caja = uno("#fac-res");
    caja.innerHTML = !todas.length
      ? '<p class="cot-res__vacio">No hay cotizaciones por facturar. Cuando Ventas envíe una, aparece aquí.</p>'
      : !vistas_.length ? '<p class="cot-res__vacio">Ninguna cotización por facturar tiene ese número, cliente o NIT.</p>'
      : '<div class="fac-op fac-op--cab" aria-hidden="true"><span>Cotización</span><span>Cliente</span>' +
          "<span>Hecha</span><span>Vence</span><span>Total</span></div>" +
        vistas_.map(opcionCotizacion).join("");
    verResultados(caja, true);
  }

  /* Una cotización de la lista, por columnas: cada una con su dato y, debajo, el detalle.
     En la lista angosta las columnas se acomodan en renglones y cada fecha dice cuál es */
  function opcionCotizacion(x, i) {
    var t = totales(x), n = x.cliente.vencidas.length, on = x.numero === fac.cot, d = diasHasta(x.vence);
    var tono = d < 0 ? " is-crit" : d <= 2 ? " is-warn" : "";
    return '<button type="button" class="cot-res__i fac-op' + (i === 0 ? " is-on" : "") + (n ? " is-mal" : "") +
        (on ? " is-elegida" : "") + '" role="option" aria-selected="' + on + '" data-fac-cot="' + x.numero + '">' +
      '<span class="fac-op__num"><b>' + x.numero + (on ? icono("visto", 14) : "") + "</b>" +
        "<small>de " + nombreCorto(x.vendedor) + "</small></span>" +
      '<span class="fac-op__cli"><b title="' + esc(x.cliente.nombre) + '">' + esc(x.cliente.nombre) + "</b>" +
        "<small>" + esc(idDe(x.cliente)) + "</small></span>" +
      '<span class="fac-op__f fac-op__hecha"><span><span class="fac-op__l">Hecha </span>' + fechaCorta(x.fecha) + "</span>" +
        "<small>" + cuandoSeHizo(x.fecha) + "</small></span>" +
      '<span class="fac-op__f fac-op__vence"><span><span class="fac-op__l">Vence </span>' + fechaCorta(x.vence) + "</span>" +
        '<small class="fac-op__plazo' + tono + '">' + cuandoVence(x.vence) + "</small></span>" +
      '<span class="fac-op__tot"><b>' + pesos(t.total) + "</b><small>" + cuantas(t.pares, "par", "pares") + "</small></span>" +
      (n ? '<small class="fac-op__mal">' + icono("alerta", 13) + cuantas(n, "factura vencida", "facturas vencidas") +
           ": no se puede facturar hasta que pague</small>" : "") +
      "</button>";
  }

  /* Cierra la lista y deja en el buscador la elegida */
  function cerrarOpciones() {
    var caja = uno("#fac-res");
    if (!caja || caja.hidden) return;
    verResultados(caja, false);
    fac.q = "";
    uno("#fac-q").value = etiquetaCot(fac.cot ? cotizacionDe(fac.cot) : null);
    uno("#fac-q").placeholder = AYUDA_FAC_Q;
  }

  /* El método de pago: los de contado siempre; el crédito si el cliente lo tiene y le alcanza el cupo */
  function pagoHtml(r) {
    var h = '<legend class="cot-det__t">Método de pago</legend>';
    h += PAGOS.map(function (p) {
      return opcionPago(p.valor, p.valor, p.ayuda, "", false);
    }).join("");
    if (!r.q) return h + opcionPago("credito", "Crédito", "Según el plazo del cliente", "", true);
    if (!r.tieneCredito) return h + opcionPago("credito", "Crédito", esc(r.c.nombre) + " paga de contado", "", true);
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
        "<p>" + esc(r.c.nombre) + " tiene que pagarlas primero. La cotización sigue por facturar hasta que pague.</p></div></div>" +
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
    verResultados(uno("#fac-res"), false);
    fac.q = "";
    uno("#fac-q").value = etiquetaCot(cotizacionDe(numero));
    uno("#fac-q").placeholder = AYUDA_FAC_Q;
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
    if (e.target.id === "fac-q") return pintarOpciones();
    if (!e.target.closest(".fac-dato-cot")) cerrarOpciones();
    var b = e.target.closest("[data-fac]");
    if (!b) return;
    var que = b.getAttribute("data-fac");
    if (que === "quitar-cot") {
      fac.cot = null;
      fac.pago = "";
      fac.q = "";
      uno("#fac-q").value = "";
      pintarFactura();
      uno("#fac-q").focus();
      pintarOpciones();
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

  /* Al entrar al buscador se busca de cero: la elegida queda a la vista como
     texto de ayuda y vuelve al cerrar la lista sin escoger otra */
  var AYUDA_FAC_Q = "Buscar por número, cliente o NIT...";
  document.addEventListener("focusin", function (e) {
    if (!fac || e.target.id !== "fac-q" || !fac.cot) return;
    e.target.placeholder = etiquetaCot(cotizacionDe(fac.cot));
    e.target.value = "";
    fac.q = "";
  });

  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if (!fac || t.id !== "fac-q") return;
    var caja = uno("#fac-res");
    if (e.key === "Escape" && !caja.hidden) { e.preventDefault(); return cerrarOpciones(); }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Enter") return;
    e.preventDefault();
    if (caja.hidden) return pintarOpciones();
    var items = todos(".cot-res__i", caja);
    var i = items.indexOf(uno(".cot-res__i.is-on", caja));
    if (e.key === "Enter") {
      if (items[i < 0 ? 0 : i]) items[i < 0 ? 0 : i].click();
      return;
    }
    i = e.key === "ArrowDown" ? Math.min(items.length - 1, i + 1) : Math.max(0, i - 1);
    items.forEach(function (x, j) { x.classList.toggle("is-on", j === i); });
    if (items[i]) items[i].scrollIntoView({ block: "nearest" });
  });

  /* ---------------------------------------------------------------- 13. Clientes

     04-clientes.html es la lista de clientes, con la misma tabla de datos de
     Cotizaciones y Facturación: las tarjetas (al día, cupo casi lleno y con
     facturas vencidas) filtran, y un clic en un cliente abre su ficha a la
     derecha, con "Editar cliente" y "Cotizar". Las filas se pintan desde CLIENTES
     cada vez que se entra, porque lo que debe un cliente cambia en Facturación.
     04-cliente-nuevo.html registra un cliente o cambia uno que ya existe: el mismo
     formulario, con dos pestañas (los datos del cliente y lo de la factura
     electrónica, que es para más adelante). A la derecha, la ficha como va
     quedando, lo que falta y Guardar. El formulario ES el estado: se lee de los
     campos cada vez que algo cambia (en React sería un useState con todos). */

  var CLI_LISTA = "04-clientes.html";
  var CLI_NUEVO = "04-cliente-nuevo.html";
  var cliEditar = null;     // el cliente que se va a cambiar al abrir el formulario; null es uno nuevo
  var cliCambiados = [];    // los que se acaban de crear o cambiar: su fila sale resaltada
  var cliACotizar = null;   // el cliente con el que se abre la próxima cotización nueva
  var cliNuevo = false;     // se pidió un cliente nuevo ("Nuevo cliente" o la acción rápida de Inicio)
  var cliAntes = null;      // tributo y "factura electrónicamente" de antes de pasar solos a ZZ y No (documento sin NIT)
  var cliIntento = false;   // ya pulsó Guardar: desde ahí cada campo dice lo que le falta
  var CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  /* ---- Lo que solo usa Clientes ----
     Las listas del formulario (con los códigos de la DIAN para la factura electrónica,
     de la Caja de herramientas del Anexo técnico 1.9: 13.2.3 tipo de persona, 13.2.6.1
     responsabilidades y 13.2.6.2 tributos; los municipios, con su código DANE de la
     tabla 13.4.3), el estado de un cliente en su lista y el dígito de verificación. */
  var RESPONSABILIDADES = [
    { cod: "O-13", nombre: "Gran contribuyente" },
    { cod: "O-15", nombre: "Autorretenedor" },
    { cod: "O-23", nombre: "Agente de retención IVA" },
    { cod: "O-47", nombre: "Régimen simple de tributación" },
    { cod: "R-99-PN", nombre: "No aplica – Otros" }
  ];
  var TRIBUTOS = [
    { cod: "01", nombre: "IVA" },
    { cod: "04", nombre: "INC (impuesto al consumo)" },
    { cod: "ZA", nombre: "IVA e INC" },
    { cod: "ZZ", nombre: "No aplica" }
  ];
  var DEPARTAMENTOS = [
    { cod: "54", nombre: "Norte de Santander" },
    { cod: "68", nombre: "Santander" },
    { cod: "11", nombre: "Bogotá, D.C." },
    { cod: "05", nombre: "Antioquia" },
    { cod: "76", nombre: "Valle del Cauca" },
    { cod: "08", nombre: "Atlántico" }
  ];
  var MUNICIPIOS = [
    { dane: "54001", nombre: "Cúcuta" }, { dane: "54874", nombre: "Villa del Rosario" }, { dane: "54405", nombre: "Los Patios" },
    { dane: "54518", nombre: "Pamplona" }, { dane: "54498", nombre: "Ocaña" },
    { dane: "68001", nombre: "Bucaramanga" }, { dane: "68276", nombre: "Floridablanca" }, { dane: "68307", nombre: "Girón" },
    { dane: "68547", nombre: "Piedecuesta" },
    { dane: "11001", nombre: "Bogotá" },
    { dane: "05001", nombre: "Medellín" }, { dane: "76001", nombre: "Cali" }, { dane: "08001", nombre: "Barranquilla" }
  ];
  var CANALES = ["Almacén", "Distribuidor", "Cadena"];
  var VENDEDORES = ["Valentina Rojas", "Andrés Quintero", "Marcela Duarte"];
  var PLAZOS = [15, 30, 45, 60];   // días de crédito
  var PLAZO_LEY = 45;              // Ley 2024 de 2020, art. 3: plazo máximo de pago entre comerciantes

  /* El estado de un cliente en su lista: el que más pesa, en este orden */
  var ESTADOS_CLI = ["vencidas", "excedido", "casi", "aldia"];
  var NOMBRE_CLI = { vencidas: "Con facturas vencidas", excedido: "Cupo excedido", casi: "Cupo casi lleno",
                     aldia: "Al día", inactivo: "Inactivo", cupo: "Cupo lleno o excedido" };
  var CORTO_CLI = { excedido: "Excedido", casi: "Casi lleno", aldia: "Al día" };
  /* El estado es el de su cartera (lo que debe), esté activo o no: a un inactivo se le
     sigue cobrando. Que ya no se le vende es una marca aparte (c.activo === false) */
  function estadoDe(c) {
    if (c.vencidas.length) return "vencidas";
    return { "Cupo excedido": "excedido", "Cupo casi lleno": "casi" }[estadoCliente(c).texto] || "aldia";
  }

  /* El dígito de verificación (DV) del NIT, como lo calcula la DIAN: cada cifra, de
     derecha a izquierda, por su peso; se suma todo y se saca el residuo de dividir
     entre 11. Si es 0 o 1, ese es el DV; si no, 11 menos el residuo */
  var PESOS_DV = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  function dvNit(cifras) {
    var d = String(cifras).split("").reverse();
    if (!/^\d+$/.test(cifras) || d.length > PESOS_DV.length) return "";
    var r = d.reduce(function (s, c, i) { return s + Number(c) * PESOS_DV[i]; }, 0) % 11;
    return String(r < 2 ? r : 11 - r);
  }
  /* 900221334 → 900.221.334 (solo si son cifras: un pasaporte va tal cual) */
  function conPuntos(id) { return /^\d+$/.test(id) ? miles(id) : id; }
  /* Un dato largo (un correo) debajo de su nombre, con todo el ancho para él */
  function kvLargo(nombre, valor) { return '<div class="kv kv--largo"><span>' + nombre + "</span><b>" + valor + "</b></div>"; }
  /* El número sin puntos ni DV: lo que se escribe en el formulario */
  function cifrasDe(c) { return c.nit.split("-")[0].replace(/\./g, ""); }
  function municipioDe(dane) { return MUNICIPIOS.filter(function (m) { return m.dane === dane; })[0]; }
  function departamentoDe(dane) {
    return DEPARTAMENTOS.filter(function (d) { return d.cod === String(dane).slice(0, 2); })[0];
  }

  /* ---- La tabla de clientes ---- */

  TABLAS["dt-cli"] = {
    codigo: "Cliente", una: "cliente", plural: "clientes", unaOVarias: "cliente(s)", masculino: true,
    codigoDe: function (tr) { return tr.getAttribute("data-cli"); },
    orden: ["cliente", 1], mayorPrimero: ["cupo", "uso"],
    estados: ESTADOS_CLI, nombres: NOMBRE_CLI,
    nombreFiltro: {
      cliente: "Cliente", ciudad: "Ciudad", vendedor: "Vendedor", pago: "Forma de pago", estado: "Estado",
      valorMin: "Debe desde", valorMax: "Debe hasta"
    },
    filtros: {
      cliente: contiene("Cliente"),
      // la tarjeta "Cupo lleno o excedido" junta dos estados
      estado: function (tr, v) {
        var e = tr.getAttribute("data-estado");
        return v === "cupo" ? e === "casi" || e === "excedido" : v === "inactivo" ? tr.getAttribute("data-activo") === "no" : e === v;
      },
      ciudad: function (tr, v) { return textoDe(tr, "Ciudad") === v; },
      vendedor: function (tr, v) { return tr.getAttribute("data-vendedor") === v; },
      pago: function (tr, v) { return (textoDe(tr, "Pago") === "Contado") === (v === "Contado"); }
    },
    claves: {
      cupo: function (tr) { return numero(tr.getAttribute("data-cupo")); },
      uso: function (tr) { return numero(tr.getAttribute("data-uso")); },
      id: function (tr) { return numero(cifrasDe(clientePor(tr.getAttribute("data-cli")))); }   // como número, no como texto
    },
    columnas: { cliente: "Cliente", id: "Documento", ciudad: "Ciudad", pago: "Pago" },
    buscar: function (tr) {
      var c = clientePor(tr.getAttribute("data-cli"));
      return tr.textContent + " " + idDe(c) + " " + c.vendedor + " " + contactoDe(c) + " " + c.correo;
    },
    contar: contarClientes,
    alEntrar: entrarAClientes
  };

  function activos() { return CLIENTES.filter(function (c) { return c.activo !== false; }); }

  /* Las tarjetas cuentan TODOS los clientes, no solo los filtrados */
  function contarClientes(filas) {
    function de(e) { return filas.filter(function (tr) { return tr.getAttribute("data-estado") === e; }); }
    function clientes(lista) { return lista.map(function (tr) { return clientePor(tr.getAttribute("data-cli")); }); }
    var aldia = de("aldia"), contado = aldia.filter(function (tr) { return textoDe(tr, "Pago") === "Contado"; });
    var casi = de("casi").length, excedido = de("excedido").length;
    var inactivos = filas.filter(function (tr) { return tr.getAttribute("data-activo") === "no"; }).length;
    var cartera = filas.reduce(function (s, tr) { return s + valorDe(tr); }, 0);
    var vencido = clientes(de("vencidas")).reduce(function (s, c) { return s + totalVencido(c); }, 0);
    ponerKpi("todas", filas.length, pesos(cartera) + " por cobrar" + (inactivos ? " · " + cuantas(inactivos, "inactivo", "inactivos") : ""));
    ponerKpi("aldia", aldia.length, (aldia.length - contado.length) + " a crédito · " + contado.length + " de contado");
    ponerKpi("cupo", casi + excedido, !excedido ? CUPO_AVISO + " % o más del cupo"
      : [casi ? cuantas(casi, "casi lleno", "casi llenos") : "", cuantas(excedido, "excedido", "excedidos")].filter(Boolean).join(" · "));
    ponerKpi("vencidas", de("vencidas").length, pesos(vencido) + " vencido");
  }

  /* Cuánto del cupo ya usó: la barra y el porcentaje, en el color de su estado */
  function usoHtml(c) {
    var uso = usoDe(c);
    if (uso === null) return '<span class="dt__sinf">De contado</span>';
    var tono = { crit: " bar--crit", warn: "", ok: " bar--ok" }[estadoCliente(c).tono];
    return '<span class="cli-uso" title="Debe ' + pesos(c.saldo) + " de un cupo de " + pesos(c.cupo) + '">' +
           '<span class="bar' + tono + '"><i style="width:' + Math.min(uso, 100) + '%"></i></span><b>' + uso + " %</b></span>";
  }

  /* En la tabla va corto ("2 vencidas") para que quepa; el texto entero, en el title */
  /* El inactivo que no debe nada sale "Inactivo"; si debe, manda lo que debe (y el title dice las dos cosas) */
  function pillCliente(c, corto) {
    var e = estadoDe(c), p = estadoPrincipal(c), n = c.vencidas.length, inactivo = c.activo === false;
    if (inactivo && e === "aldia") return '<span class="pill pill--off" title="Inactivo · al día">Inactivo</span>';
    return '<span class="pill pill--' + p.tono + '" title="' + (inactivo ? "Inactivo · " : "") + p.texto + '">' +
           (!corto ? p.texto : n ? n + (n === 1 ? " vencida" : " vencidas") : CORTO_CLI[e]) + "</span>";
  }

  /* La fila de un cliente. La primera celda es un botón: así se abre su ficha con el teclado */
  function filaCliente(c) {
    var clases = [cliCambiados.indexOf(c.codigo) >= 0 ? "es-nueva" : "", c.activo === false ? "is-inactivo" : ""].filter(Boolean).join(" ");
    return "<tr" + (clases ? ' class="' + clases + '"' : "") + ' data-cli="' + c.codigo +
      '" data-estado="' + estadoDe(c) + '" data-activo="' + (c.activo === false ? "no" : "si") + '" data-vendedor="' + c.vendedor +
      '" data-valor="' + c.saldo + '" data-cupo="' + c.cupo +
      '" data-uso="' + (usoDe(c) === null ? -1 : usoDe(c)) + '">' +
      '<td class="dt__cli" data-l="Cliente"><button class="dt__ver" type="button" title="Ver la ficha de ' + esc(c.nombre) + '">' +
        esc(c.nombre) + "</button></td>" +
      '<td class="dt__fec" data-l="Documento" title="' + esc(idDe(c)) + '">' + esc(c.nit) + "</td>" +
      '<td data-l="Ciudad">' + c.ciudad + "</td>" +
      '<td data-l="Pago">' + c.pago + "</td>" +
      '<td class="num" data-l="Cupo">' + (c.cupo ? pesos(c.cupo) : '<span class="dt__sinf">—</span>') + "</td>" +
      '<td class="num" data-l="Debe hoy">' + pesos(c.saldo) + "</td>" +
      '<td data-l="Uso del cupo">' + usoHtml(c) + "</td>" +
      '<td data-l="Estado">' + pillCliente(c, true) + "</td></tr>";
  }

  /* Cada vez que se entra, las filas salen de CLIENTES: lo que debe cada uno pudo
     cambiar en Facturación. Si hay uno recién creado o cambiado, la vista vuelve
     a empezar (sin filtros) para que se vea */
  function entrarAClientes(dt, cuerpo) {
    todos("tr[data-estado]", cuerpo).forEach(function (tr) { cuerpo.removeChild(tr); });
    cuerpo.insertAdjacentHTML("afterbegin", CLIENTES.map(filaCliente).join(""));
    var ciudad = uno('[data-f="ciudad"]', dt), elegida = ciudad.value;
    var ciudades = CLIENTES.map(function (c) { return c.ciudad; }).filter(function (x, i, l) { return l.indexOf(x) === i; }).sort();
    ciudad.innerHTML = '<option value="">Todas</option>' + ciudades.map(function (x) { return opcion(x, x, elegida); }).join("");
    var hubo = cliCambiados.length > 0;
    cliCambiados = [];
    return hubo;
  }

  /* ---- La ficha de un cliente (el panel de la derecha) ---- */

  DETALLES["dt-cli"] = { panel: "cli-det", pintar: function (tr) { pintarFichaCliente(clientePor(tr.getAttribute("data-cli"))); } };

  /* Lo que pasa con el cliente, dicho con palabras. Las vencidas no: ya las dice su aviso, con la tabla */
  function textoCliente(c) {
    if (c.activo === false) return "<b>Ya no se le vende:</b> no sale para cotizar. Para volver a venderle, edítelo y márquelo como activo." +
                                   (c.saldo && !c.vencidas.length ? " Debe " + pesos(c.saldo) + "." : "");
    var libre = c.cupo - c.saldo;
    switch (estadoDe(c)) {
      case "vencidas": return "";
      case "excedido": return c.cupo ? "<b>Debe más que su cupo</b> (" + pesos(c.saldo) + " de " + pesos(c.cupo) +
                                       "). Se le cotiza, pero Facturación no le factura a crédito hasta que abone."
                                     : "<b>Debe " + pesos(c.saldo) + " y no tiene cupo de crédito.</b> Facturación no le factura a crédito hasta que pague.";
      case "casi": return "<b>Ya usó el " + usoDe(c) + " % de su cupo:</b> le quedan " + pesos(libre) + " para comprar a crédito.";
    }
    return c.cupo ? "<b>Al día:</b> puede comprar a crédito hasta " + pesos(libre) + " más, a " + plazoDe(c) + " días."
                  : "<b>Paga de contado:</b> no tiene cupo de crédito; paga cuando recibe la mercancía.";
  }

  /* El crédito en cuatro cifras y la barra de lo que ya usó */
  function creditoHtml(c) {
    if (!c.cupo) return c.saldo ? '<div class="cli-credito"><div class="cli-credito__i is-mal"><span>Debe hoy</span><b>' + pesos(c.saldo) + "</b></div></div>" : "";
    return '<div class="cli-credito">' +
      '<div class="cli-credito__i"><span>Cupo</span><b>' + pesos(c.cupo) + "</b></div>" +
      '<div class="cli-credito__i"><span>Debe hoy</span><b>' + pesos(c.saldo) + "</b></div>" +
      '<div class="cli-credito__i"><span>Disponible</span><b>' + pesos(Math.max(0, c.cupo - c.saldo)) + "</b></div>" +
      '<div class="cli-credito__i' + (c.vencidas.length ? " is-mal" : "") + '"><span>Vencido</span><b>' + pesos(totalVencido(c)) + "</b></div>" +
      '<div class="cli-credito__uso">' + usoHtml(c) + "<small>del cupo usado</small></div></div>";
  }

  function lugarDe(c) {
    var d = departamentoDe(c.dane);
    return c.ciudad + (d ? ", " + d.nombre : "");
  }
  function respDe(codigos) {
    return codigos.map(function (k) {
      var r = RESPONSABILIDADES.filter(function (x) { return x.cod === k; })[0];
      return '<span title="' + (r ? r.nombre : "") + '">' + k + "</span>";
    }).join(" · ");
  }
  function tributoDe(cod) {
    var t = TRIBUTOS.filter(function (x) { return x.cod === cod; })[0];
    return t ? cod + " · " + t.nombre : cod;
  }

  /* Todo lo que se sabe del cliente, por secciones (las mismas del formulario) */
  function fichaClienteHtml(c) {
    var natural = c.tipoPersona === "natural";
    var contacto = contactoDe(c).split(" · ");
    return seccion("Identificación",
        kv("Tipo de persona", natural ? "Natural" : "Jurídica") +
        kv("Documento", tipoDocDe(c.tipoDoc).nombre)) +
      seccion("Contacto",
        kv("Persona", esc(contacto[0]), esc(contacto[1] || "")) +
        kv("Celular", "+57 " + esc(c.telefono)) +
        (c.fijo ? kv("Teléfono fijo", "+57 " + esc(c.fijo)) : "") +
        kvLargo("Correo", correoHtml(c.correo))) +
      seccion("Ubicación y entrega",
        kv("Dirección", esc(c.direccion)) +
        (c.barrio ? kv("Barrio", esc(c.barrio)) : "") +
        kv("Municipio", lugarDe(c), "DANE " + c.dane)) +
      seccion("Venta y crédito",
        kv("Canal", c.canal) +
        kv("Vendedor", c.vendedor) +
        kv("Forma de pago", c.pago) +
        kv("Cliente desde", String(c.desde))) +
      seccion('Factura electrónica <span class="cli-futuro">A futuro</span>',
        kv("Responsabilidades", respDe(c.responsabilidades)) +
        kv("Tributo", tributoDe(c.tributo)) +
        kvLargo("Recibe la factura en", correoHtml(c.correoFe)) +
        kv("Factura electrónicamente", c.facturador ? "Sí" : "No")) +
      (c.obs ? seccion("Observaciones", '<p class="cli-obs">' + esc(c.obs) + "</p>") : "");
  }

  /* Arriba, como en Facturación: la foto centrada, el nombre, su documento y sus estados */
  function cabClienteHtml(c) {
    return '<div class="fac-cli cli-det__cab">' +
      '<span class="avatar fac-cli__foto" aria-hidden="true">' + esc(iniciales(c.nombre)) + "</span>" +
      '<b class="fac-cli__nombre">' + esc(c.nombre) + "</b>" +
      '<span class="fac-cli__id"><span>' + tipoDocDe(c.tipoDoc).sigla + "</span> " + esc(c.nit) + "</span>" +
      '<span class="cot-ficha__estados">' + (c.activo === false ? '<span class="pill pill--off">Inactivo</span>' : "") +
        (c.activo === false && estadoDe(c) === "aldia" ? "" : pillCliente(c)) + '<span class="pill pill--off">' + c.canal + "</span></span></div>";
  }

  function pintarFichaCliente(c) {
    var tono = c.activo === false && estadoDe(c) === "aldia" ? "off" : estadoPrincipal(c).tono, texto = textoCliente(c);
    var caja = uno("#cli-det");
    caja.setAttribute("data-cli", c.codigo);   // de quién es: Editar y Cotizar lo leen de aquí
    uno("#cli-det-t").textContent = "Ficha del cliente";
    uno("#cli-det-sub").textContent = c.ciudad + " · cliente desde " + c.desde;
    uno("#cli-det-cab").innerHTML = cabClienteHtml(c);
    var estado = uno("#cli-det-estado");
    estado.className = "cot-det__estado cot-det__estado--" + tono;
    estado.innerHTML = (texto ? '<p class="cli-det__texto">' + texto + "</p>" : "") + creditoHtml(c) + vencidasHtml(c);
    estado.hidden = !estado.innerHTML;
    uno("#cli-det-ficha").innerHTML = fichaClienteHtml(c);
    uno('#cli-det [data-cl="cotizar"]').disabled = c.activo === false;
  }

  /* "Editar cliente" y "Cotizar", desde la ficha */
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("#cli-det [data-cl]") : null;
    if (!b) return;
    var c = clientePor(uno("#cli-det").getAttribute("data-cli"));
    cerrarDetalle();
    if (b.getAttribute("data-cl") === "editar") {
      cliEditar = c.codigo;
      ir(CLI_NUEVO, true);
      return;
    }
    // Cotizar: se abre una cotización nueva con el cliente ya elegido, salvo que haya una a medias
    if (guardadas[NUEVA] && cot && cot.estado !== "nueva") {
      aviso("Termine primero la cotización " + cot.numero + ", que quedó a medias.", "warn");
      return ir(NUEVA, true);
    }
    cliACotizar = c.codigo;
    delete guardadas[NUEVA];
    ir(NUEVA, true);
  });

  /* ---- El formulario: 04-cliente-nuevo.html ---- */

  function opcion(valor, texto, elegida) {
    return '<option value="' + valor + '"' + (valor === elegida ? " selected" : "") + ">" + texto + "</option>";
  }

  /* Las listas salen de los mismos datos que usa la ficha */
  function llenarListas() {
    uno("#cl-tipodoc").innerHTML = TIPOS_DOC.map(function (t) { return opcion(t.cod, t.cod + " · " + t.nombre); }).join("");
    uno("#cl-depto").innerHTML = DEPARTAMENTOS.map(function (d) { return opcion(d.cod, d.nombre); }).join("");
    uno("#cl-canal").innerHTML = CANALES.map(function (x) { return opcion(x, x); }).join("");
    uno("#cl-vendedor").innerHTML = VENDEDORES.map(function (x) { return opcion(x, x); }).join("");
    uno("#cl-plazo").innerHTML = PLAZOS.map(function (d) { return opcion(String(d), d + " días"); }).join("");
    uno("#cl-tributo").innerHTML = TRIBUTOS.map(function (t) { return opcion(t.cod, t.cod + " · " + t.nombre); }).join("");
    uno("#cl-resp").innerHTML = RESPONSABILIDADES.map(function (r) {
      return '<label class="cli-chip"><input type="checkbox" name="cl-resp" value="' + r.cod + '">' +
             "<b>" + r.cod + "</b><span>" + r.nombre + "</span></label>";
    }).join("");
  }

  function llenarMunicipios(depto, elegido) {
    uno("#cl-muni").innerHTML = MUNICIPIOS.filter(function (m) { return m.dane.slice(0, 2) === depto; })
      .map(function (m) { return opcion(m.dane, m.nombre, elegido); }).join("");
  }

  function marcar(nombre, valor) {
    todos('[name="' + nombre + '"]').forEach(function (x) { x.checked = x.value === valor; });
  }
  function poner(id, v) { uno("#" + id).value = v == null ? "" : v; }

  /* Un cliente nuevo empieza así: persona jurídica con NIT, en Cúcuta, del vendedor
     que tiene la sesión, a crédito a 30 días */
  function clienteEnBlanco() {
    return { tipoPersona: "juridica", tipoDoc: "31", nit: "", nombre: "", contacto: "", cargo: "", telefono: "", fijo: "", correo: "",
             dane: "54001", direccion: "", barrio: "", canal: CANALES[0], vendedor: VENDEDOR.nombre, pago: "Crédito 30 días",
             cupo: 0, obs: "", activo: true, responsabilidades: ["R-99-PN"], tributo: "01", correoFe: "", facturador: true };
  }

  function cargarCliente(c) {
    var natural = c.tipoPersona === "natural";
    marcar("cl-persona", c.tipoPersona);
    poner("cl-tipodoc", c.tipoDoc);
    poner("cl-num", c.nit ? cifrasDe(c) : "");
    poner("cl-razon", natural ? "" : c.nombre);
    ["cl-nom1", "cl-nom2", "cl-ape1", "cl-ape2"].forEach(function (id, i) { poner(id, natural && c.nombres ? c.nombres[i] : ""); });
    poner("cl-contacto", c.contacto);
    poner("cl-cargo", c.cargo);
    poner("cl-cel", c.telefono);
    poner("cl-fijo", c.fijo);
    poner("cl-correo", c.correo);
    poner("cl-depto", c.dane.slice(0, 2));
    llenarMunicipios(c.dane.slice(0, 2), c.dane);
    poner("cl-dir", c.direccion);
    poner("cl-barrio", c.barrio);
    poner("cl-canal", c.canal);
    poner("cl-vendedor", c.vendedor);
    marcar("cl-pago", c.pago === "Contado" ? "contado" : "credito");
    poner("cl-plazo", String(plazoDe(c) || 30));
    poner("cl-cupo", c.cupo ? miles(c.cupo) : "");
    poner("cl-obs", c.obs);
    uno("#cl-datos").checked = !!c.datos;
    uno("#cl-activo").checked = c.activo !== false;
    todos('[name="cl-resp"]').forEach(function (x) { x.checked = c.responsabilidades.indexOf(x.value) >= 0; });
    poner("cl-tributo", c.tributo);
    uno("#cl-mismo").checked = !c.correoFe || c.correoFe === c.correo;
    poner("cl-correofe", c.correoFe);
    uno("#cl-facturador").checked = !!c.facturador;
  }

  /* Al entrar: el que se eligió con "Editar cliente", o uno nuevo con "Nuevo cliente".
     Si se vuelve (con el menú, Atrás o Adelante) al que quedó a medias, sigue como
     estaba. El historial del navegador guarda qué cliente se editaba: así F5 lo vuelve
     a abrir. En React, el código iría en la ruta (/clientes/CL-006/editar) */
  function iniciarCliente() {
    var form = uno("#cli-form"), antes = form.getAttribute("data-codigo") || "";
    // Con Atrás, Adelante o F5, el historial dice de quién es esta entrada. Al llegar desde
    // otra pantalla, el historial todavía es el de esa pantalla (ir() lo anota después)
    var entrada = history.state && history.state.pantalla === CLI_NUEVO ? history.state : null;
    var codigo = cliEditar || (cliNuevo ? "" : entrada ? entrada.cliente || "" : antes);
    var otro = !form.getAttribute("data-listo") || codigo !== antes;   // el mismo que dejó a medias: sigue como estaba
    if (otro && form.getAttribute("data-listo")) {
      if (!antes && aMedias()) aviso("Se descartó el cliente nuevo que había dejado a medias.", "warn");
      else if (antes && clientePor(antes) && cambiado(clientePor(antes))) {
        aviso("Se descartaron los cambios sin guardar de " + clientePor(antes).nombre + ".", "warn");
      }
    }
    cliEditar = null;
    cliNuevo = false;
    // Después de que ir() anote la pantalla en el historial, se le agrega el cliente
    setTimeout(function () {
      if (actual === CLI_NUEVO) history.replaceState({ pantalla: CLI_NUEVO, cliente: codigo || null }, "", CLI_NUEVO);
    }, 0);
    if (!otro) return pintarCliente();
    if (codigo && !clientePor(codigo)) codigo = "";
    form.setAttribute("data-listo", "1");
    form.setAttribute("data-codigo", codigo);
    form.removeAttribute("data-guardado");
    cliIntento = false;
    cliAntes = null;
    marcarCampos([]);
    var c = codigo ? clientePor(codigo) : clienteEnBlanco();
    llenarListas();
    cargarCliente(c);
    uno("#cl-t").textContent = codigo ? "Editar cliente" : "Nuevo cliente";
    uno("#cl-guardar-t").textContent = codigo ? "Guardar cambios" : "Guardar cliente";
    uno("#cl-activo-c").hidden = !codigo;
    var estado = uno("#cl-estado");
    estado.className = "pill " + (codigo ? "pill--ok" : "pill--off");
    estado.textContent = codigo ? "Cliente desde " + c.desde : "Sin guardar";
    verPestana("datos");
    pintarCliente();
  }

  /* Lo que se guarda de un cliente, como lo dice el formulario. Guardar lo copia al cliente,
     y los avisos de descarte lo comparan con lo guardado: así las dos listas no se separan */
  var CAMPOS_CLI = ["tipoPersona", "tipoDoc", "nit", "nombre", "nombres", "contacto", "cargo", "telefono", "fijo", "correo", "dane",
                    "direccion", "barrio", "canal", "vendedor", "pago", "cupo", "obs", "datos", "activo", "responsabilidades",
                    "tributo", "correoFe", "facturador"];
  function datosDe(f) {
    return {
      tipoPersona: f.tipoPersona, tipoDoc: f.tipoDoc, nit: nitDe(f), nombre: nombreDe(f), nombres: natural(f) ? f.nombres : null,
      contacto: f.contacto, cargo: f.cargo, telefono: f.cel, fijo: f.fijo, correo: f.correo, dane: f.dane, direccion: f.dir,
      barrio: f.barrio, canal: f.canal, vendedor: f.vendedor, pago: f.credito ? "Crédito " + f.plazo + " días" : "Contado",
      cupo: f.credito ? f.cupo : 0, obs: f.obs, datos: f.datos, activo: f.activo, responsabilidades: f.resp,
      tributo: f.tributo, correoFe: f.correoFe, facturador: f.facturador
    };
  }
  /* ¿Son distintos? (la autorización cuenta como sí o no: guardada lleva la fecha) */
  function distintos(a, b) {
    return CAMPOS_CLI.some(function (k) {
      var x = k === "datos" ? !!a[k] : a[k], y = k === "datos" ? !!b[k] : b[k];
      return JSON.stringify(x == null ? "" : x) !== JSON.stringify(y == null ? "" : y);
    });
  }
  /* ¿Lo que dice el formulario es distinto de lo guardado de ese cliente? */
  function cambiado(c) {
    var guardado = {};
    CAMPOS_CLI.forEach(function (k) { guardado[k] = c[k]; });
    guardado.activo = c.activo !== false;
    guardado.facturador = !!c.facturador;
    if (c.tipoPersona !== "natural") guardado.nombres = null;
    return distintos(datosDe(leerCliente()), guardado);
  }
  /* ¿El cliente nuevo tiene algo escrito? Se compara con uno en blanco */
  function aMedias() {
    var blanco = clienteEnBlanco();
    blanco.nombres = null;
    blanco.datos = false;
    blanco.correoFe = "";
    return distintos(datosDe(leerCliente()), blanco);
  }

  /* Lo que dice el formulario en este momento */
  function leerCliente() {
    function v(id) { return uno("#" + id).value.trim(); }
    var mismo = uno("#cl-mismo").checked;
    return {
      codigo: uno("#cli-form").getAttribute("data-codigo"),
      tipoPersona: uno('[name="cl-persona"]:checked').value, tipoDoc: v("cl-tipodoc"),
      num: numDe(v("cl-num"), v("cl-tipodoc")), guiones: (v("cl-num").match(/-/g) || []).length,
      dvEscrito: v("cl-tipodoc") === "31" && v("cl-num").indexOf("-") > 0 ? v("cl-num").split("-").pop().trim() : "",
      razon: v("cl-razon"), nombres: [v("cl-nom1"), v("cl-nom2"), v("cl-ape1"), v("cl-ape2")],
      contacto: v("cl-contacto"), cargo: v("cl-cargo"), cel: v("cl-cel"), fijo: v("cl-fijo"), correo: v("cl-correo"),
      dane: v("cl-muni"), dir: v("cl-dir"), barrio: v("cl-barrio"), canal: v("cl-canal"), vendedor: v("cl-vendedor"),
      credito: uno('[name="cl-pago"]:checked').value === "credito", plazo: numero(v("cl-plazo")), cupo: Number(pesosEscritos(v("cl-cupo"))),
      obs: v("cl-obs"), datos: uno("#cl-datos").checked, activo: uno("#cl-activo").checked,
      resp: todos('[name="cl-resp"]:checked').map(function (x) { return x.value; }),
      tributo: v("cl-tributo"), mismo: mismo, correoFe: mismo ? v("cl-correo") : v("cl-correofe"),
      facturador: uno("#cl-facturador").checked
    };
  }

  function natural(f) { return f.tipoPersona === "natural"; }
  /* El nombre que va en la factura: la razón social, o nombres y apellidos en uno solo */
  function nombreDe(f) { return natural(f) ? f.nombres.filter(Boolean).join(" ") : f.razon; }
  /* El número como se muestra: con puntos y, si es NIT, con su DV */
  function nitDe(f) {
    var dv = f.tipoDoc === "31" ? dvNit(f.num) : "";
    return conPuntos(f.num) + (dv ? "-" + dv : "");
  }
  /* El número sin puntos ni espacios (y sin el DV, si es un NIT pegado con él: 900.221.334-8).
     Solo el NIT lleva guion: en otro documento el guion se queda y el número sale mal */
  function numDe(texto, tipoDoc) {
    return (tipoDoc === "31" && texto.indexOf("-") > 0 ? texto.split("-")[0] : texto).replace(/[.\s]/g, "").toUpperCase();
  }
  function soloCifras(tipoDoc) { return ["31", "13", "22"].indexOf(tipoDoc) >= 0; }
  /* Una persona jurídica se identifica con NIT (o NIT de otro país); las cédulas son de personas */
  function deEmpresa(tipoDoc) { return tipoDoc === "31" || tipoDoc === "50"; }
  /* El NIT de una persona natural es su cédula con el DV: son el mismo documento */
  function mismoDocumento(c, f) {
    var tipos = [c.tipoDoc, f.tipoDoc].sort().join();
    return cifrasDe(c) === f.num && (c.tipoDoc === f.tipoDoc || tipos === "13,31");
  }
  function sinEspacios(t) { return t.replace(/\s/g, ""); }

  /* Lo que falta o está mal, en el orden del formulario. Cada uno dice en qué
     campo está, para llevar allá al pulsarlo */
  function faltasCliente(f) {
    var l = [];
    function falta(id, texto, mal) { l.push({ id: id, texto: texto, mal: mal || "" }); }
    var otro = CLIENTES.filter(function (c) { return c.codigo !== f.codigo && mismoDocumento(c, f); })[0];
    // un NIT con su DV pegado al final, sin guion: 9002213348 es el 900.221.334 con DV 8
    var conDv = f.tipoDoc === "31" && f.num.length > 5 && dvNit(f.num.slice(0, -1)) === f.num.slice(-1) &&
      CLIENTES.filter(function (c) { return c.codigo !== f.codigo && c.tipoDoc === "31" && cifrasDe(c) === f.num.slice(0, -1); })[0];
    var largo = soloCifras(f.tipoDoc) ? [6, 10] : [5, 20];
    if (!natural(f) && !deEmpresa(f.tipoDoc)) falta("cl-tipodoc", "Tipo de documento", "Una persona jurídica se identifica con NIT.");
    if (!f.num) falta("cl-num", "Número de identificación");
    else if (soloCifras(f.tipoDoc) && !/^\d+$/.test(f.num)) falta("cl-num", "Número de identificación",
      f.num.indexOf("-") < 0 ? "Lleva solo cifras, sin letras."
        : f.tipoDoc === "31" ? "Lleva solo cifras (el guion va solo antes del DV)." : "Lleva solo cifras (¿es un NIT con su DV? Elija NIT).");
    else if (f.tipoDoc === "31" && f.guiones > 1) falta("cl-num", "Número de identificación", "El NIT lleva un solo guion, antes del DV.");
    else if (!/^[A-Z0-9]+$/.test(f.num)) falta("cl-num", "Número de identificación", "Solo letras y cifras.");
    else if (f.num.charAt(0) === "0") falta("cl-num", "Número de identificación", "No empieza por cero.");
    else if (f.num.length < largo[0]) falta("cl-num", "Número de identificación", "Está muy corto: revíselo.");
    else if (f.num.length > largo[1]) falta("cl-num", "Número de identificación", "Está muy largo: son máximo " + largo[1] + (soloCifras(f.tipoDoc) ? " cifras." : " caracteres."));
    else if (f.dvEscrito && f.dvEscrito !== dvNit(f.num)) falta("cl-num", "Número de identificación", "El DV escrito (" + f.dvEscrito + ") no es el de ese NIT: es " + dvNit(f.num) + ".");
    else if (conDv) falta("cl-num", "Número de identificación", "Parece " + conDv.nit + " con el DV pegado (el DV va aparte): ya es de " + conDv.nombre + ".");
    else if (otro) falta("cl-num", "Número de identificación", "Ya es de " + otro.nombre +
                         (otro.activo === false ? " (inactivo: actívelo en su ficha con Editar cliente)." : "."));
    if (!natural(f) && !f.razon) falta("cl-razon", "Razón social");
    if (natural(f) && !f.nombres[0]) falta("cl-nom1", "Primer nombre");
    if (natural(f) && !f.nombres[2]) falta("cl-ape1", "Primer apellido");
    if (!natural(f) && !f.contacto) falta("cl-contacto", "Persona de contacto");
    if (!f.correo) falta("cl-correo", "Correo");
    else if (!CORREO.test(f.correo)) falta("cl-correo", "Correo", "No está bien escrito (nombre@empresa.com).");
    if (!f.cel) falta("cl-cel", "Celular");
    else if (!/^3\d{9}$/.test(sinEspacios(f.cel))) falta("cl-cel", "Celular", "Son 10 cifras y empieza por 3.");
    if (f.fijo && !/^60\d{8}$/.test(sinEspacios(f.fijo))) falta("cl-fijo", "Teléfono fijo", "Son 10 cifras y empieza por 60 (601, 607...).");
    if (!f.dir) falta("cl-dir", "Dirección");
    var debe = f.codigo ? clientePor(f.codigo).saldo : 0;
    if (!f.credito && debe) falta("cl-pago-contado", "Forma de pago", "Debe " + pesos(debe) + ", así que sigue a crédito hasta que pague.");
    if (f.credito && !f.cupo) falta("cl-cupo", "Cupo de crédito");
    if (natural(f) && !f.datos) falta("cl-datos", "Autorización de datos personales");
    if (f.tributo !== "ZZ" && f.tipoDoc !== "31") falta("cl-tributo", "Tributo", "Si es responsable de IVA o INC, se identifica con NIT (31).");
    if (!f.mismo && !f.correoFe) falta("cl-correofe", "Correo para la factura electrónica");
    else if (!f.mismo && !CORREO.test(f.correoFe)) falta("cl-correofe", "Correo para la factura electrónica", "No está bien escrito.");
    return l;
  }

  function enPestanaFe(id) { return !!uno("#" + id).closest("#cl-p-fe"); }

  function verPestana(cual) {
    todos("[data-cl-tab]").forEach(function (t) {
      var on = t.getAttribute("data-cl-tab") === cual;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      uno("#" + t.getAttribute("aria-controls")).hidden = !on;
    });
  }

  /* Lleva al campo: cambia de pestaña si hace falta y lo deja listo para escribir */
  function irACampo(id) {
    verPestana(enPestanaFe(id) ? "fe" : "datos");
    var campo = uno("#" + id);
    campo.scrollIntoView({ block: "center" });
    campo.focus();
  }

  /* El mensaje de error de cada campo, debajo de él (solo después de pulsar Guardar) */
  function marcarCampos(l) {
    todos("#cli-form .field[data-campo]").forEach(function (fl) {
      var f = l.filter(function (x) { return x.id === fl.getAttribute("data-campo"); })[0];
      var ctl = uno(".control", fl) || fl, err = uno(".err", fl);
      ctl.classList.toggle("bad", !!f);
      err.textContent = f ? (f.mal || "Falta: " + f.texto.toLowerCase() + ".") : "";
      err.hidden = !f;
    });
  }

  /* Lo que la factura electrónica tomará de la pestaña de datos, ya en sus códigos */
  function baseFeHtml(f) {
    var m = municipioDe(f.dane), d = departamentoDe(f.dane);
    return kv("Tipo de persona", natural(f) ? "2 · Natural" : "1 · Jurídica") +
      kv("Documento", f.tipoDoc + " · " + tipoDocDe(f.tipoDoc).nombre) +
      kv("Número", f.num ? esc(f.num) + (f.tipoDoc === "31" ? ' <span class="tiny">DV ' + dvNit(f.num) + "</span>" : "") : "—") +
      kv("Nombre en la factura", esc(nombreDe(f)) || "—") +
      kv("Municipio", m ? f.dane + " · " + m.nombre + (d ? ", " + d.nombre : "") + " · CO" : "—");
  }

  /* La ficha como va quedando, como la de Facturación: arriba la foto, el nombre y el
     documento (debajo va lo que falta); después sus datos */
  function vistaClienteHtml(f) {
    var nombre = nombreDe(f);
    return '<div class="fac-cli">' +
      '<span class="avatar fac-cli__foto" aria-hidden="true">' + (nombre ? esc(iniciales(nombre)) : "?") + "</span>" +
      '<b class="fac-cli__nombre' + (nombre ? "" : " is-vacio") + '">' + (esc(nombre) || "Sin nombre todavía") + "</b>" +
      '<span class="fac-cli__id"><span>' + tipoDocDe(f.tipoDoc).sigla + "</span> " + (f.num ? esc(nitDe(f)) : "—") + "</span>" +
      '<span class="cot-ficha__estados"><span class="pill pill--' + (f.activo ? "ok" : "off") + '">' +
        (f.activo ? (f.codigo ? "Activo" : "Nuevo") : "Inactivo") + '</span><span class="pill pill--off">' + f.canal + "</span></span></div>";
  }
  function vistaDatosHtml(f) {
    var nombre = nombreDe(f), m = municipioDe(f.dane);
    var persona = [f.contacto || (natural(f) ? nombre : ""), f.cargo].filter(Boolean).join(" · ");
    return '<div class="fac-cli__datos">' +
      seccion("Contacto", kv("Persona", esc(persona) || "—") + kv("Celular", f.cel ? "+57 " + esc(f.cel) : "—") +
                          kvLargo("Correo", f.correo ? correoHtml(f.correo) : "—")) +
      seccion("Entrega", kv("Dirección", esc(f.dir) || "—") + kv("Municipio", m ? m.nombre : "—")) +
      seccion("Venta", kv("Vendedor", f.vendedor) +
                       kv("Forma de pago", f.credito ? "Crédito " + f.plazo + " días" : "Contado") +
                       (f.credito ? kv("Cupo", f.cupo ? pesos(f.cupo) : "—") : "")) + "</div>";
  }

  /* Todo lo que depende de lo escrito se vuelve a dibujar */
  function pintarCliente() {
    var f = leerCliente(), l = faltasCliente(f);
    todos(".cli-si-juridica").forEach(function (x) { x.hidden = natural(f); });
    todos(".cli-si-natural").forEach(function (x) { x.hidden = !natural(f); });
    uno("#cl-dv-c").hidden = f.tipoDoc !== "31";
    uno("#cl-dv").value = f.tipoDoc === "31" ? dvNit(f.num) : "";
    todos(".cli-si-credito").forEach(function (x) { x.hidden = !f.credito; });
    uno("#cl-plazo-aviso").hidden = !(f.credito && f.plazo > PLAZO_LEY);
    var cupo = uno("#cl-cupo");
    uno("#cl-cupo-lee").textContent = cupo.value.trim() && cupo.value.trim() !== miles(f.cupo)
      ? "Se lee como " + pesos(f.cupo) + (f.cupo ? "" : ": escriba las cifras") : "Lo autoriza cartera";
    uno("#cl-dane").textContent = "Código DANE " + f.dane;
    uno("#cl-datos-o").hidden = !natural(f);
    var fe = uno("#cl-correofe");
    fe.disabled = f.mismo;
    if (f.mismo) fe.value = f.correo;
    uno("#cl-fe-base").innerHTML = baseFeHtml(f);
    uno("#cl-ficha").innerHTML = vistaClienteHtml(f);
    uno("#cl-ficha-datos").innerHTML = vistaDatosHtml(f);

    // Lo que falta: en la lista de la derecha y en cada pestaña
    uno("#cl-falta").innerHTML = l.length
      ? l.map(function (x) {
          return '<li><button type="button" data-cl-ir="' + x.id + '">' + icono("alerta", 14) + "<span>" + x.texto +
                 (x.mal ? "<small>" + esc(x.mal) + "</small>" : "") + "</span></button></li>";
        }).join("")
      : '<li class="is-listo">' + icono("visto", 14) + "<span>No falta nada: ya se puede guardar.</span></li>";
    uno("#cl-falta-t").textContent = l.length ? "Falta por llenar (" + l.length + ")" : "Todo listo";
    ["datos", "fe"].forEach(function (p) {
      var n = l.filter(function (x) { return (p === "fe") === enPestanaFe(x.id); }).length, ct = uno("#cl-tab-" + p + " .cli-tabs__n");
      ct.textContent = n;
      ct.hidden = !n;
    });
    if (cliIntento) marcarCampos(l);
    var pendientes = f.codigo && !f.activo ? porFacturar().filter(function (q) { return q.cliente.codigo === f.codigo; }).length : 0;
    var conVencidas = f.codigo && clientePor(f.codigo).vencidas.length;
    uno("#cl-msg").textContent = l.length
      ? "Llene o corrija lo que dice la lista; al pulsarlo lo lleva al campo."
      : pendientes ? "Ojo: tiene " + cuantas(pendientes, "cotización", "cotizaciones") + " por facturar; " +
                     (conVencidas ? "Facturación no podrá facturarla" + (pendientes > 1 ? "s" : "") + " mientras deba facturas vencidas."
                                  : "Facturación todavía puede facturarla" + (pendientes > 1 ? "s" : "") + ".")
      : f.codigo ? "Los cambios se ven en la lista y en la ficha del cliente." : "Al guardar entra a la lista de clientes, sin deuda.";
  }

  /* Las cifras de un valor en pesos, escrito o pegado como venga: "3.500.000,00",
     "3500000.00", "3,500,000.00", "5,000,000" o "$ 3.500.000 COP". El cupo no lleva
     centavos: una coma con 1 o 2 cifras al final son centavos, y un punto también, pero
     solo si hay comas de miles o si antes de él van más de 3 cifras seguidas. Así "12.34"
     (lo que queda al borrar una cifra de "12.345") se lee 1.234 y no 12. Mientras se
     escribe, debajo del campo dice cómo se está leyendo */
  function pesosEscritos(texto) {
    var t = texto.trim().replace(/[^\d.,]+$/, "");
    var coma = /,\d{1,2}$/.test(t);
    var punto = /\.\d{1,2}$/.test(t) && (t.indexOf(",") >= 0 || /^\D*\d{4,}\.\d{1,2}$/.test(t));
    if (coma || punto) t = t.replace(/[.,]\d{1,2}$/, "");
    return t.replace(/\D/g, "").slice(0, 13);
  }

  function siguienteCliente() {
    return siguiente(CLIENTES.reduce(function (a, c) { return cola(c.codigo) > cola(a.codigo) ? c : a; }).codigo);
  }

  function guardarCliente() {
    var form = uno("#cli-form");
    if (form.getAttribute("data-guardado")) return;   // doble clic: ya se guardó y va saliendo
    var f = leerCliente(), l = faltasCliente(f);
    cliIntento = true;
    pintarCliente();
    if (l.length) {
      irACampo(l[0].id);
      var primero = l[0].texto + (l[0].mal ? ": " + l[0].mal.charAt(0).toLowerCase() + l[0].mal.slice(1) : ".");
      return aviso(l.length === 1 ? (l[0].mal ? "Corrija " : "Falta: ") + primero.charAt(0).toLowerCase() + primero.slice(1)
                                  : "Hay " + l.length + " datos por llenar o corregir. El primero: " + primero.charAt(0).toLowerCase() + primero.slice(1), "crit");
    }
    form.setAttribute("data-guardado", "1");
    var c = f.codigo ? clientePor(f.codigo) : { codigo: siguienteCliente(), desde: new Date().getFullYear(), saldo: 0, vencidas: [] };
    var d = datosDe(f);   // la persona natural sin otro contacto: es ella misma (contactoDe)
    CAMPOS_CLI.forEach(function (k) { c[k] = d[k]; });
    c.ciudad = municipioDe(f.dane).nombre;
    c.datos = f.datos ? (c.datos || hoy()) : "";   // la fecha en que autorizó
    if (!f.codigo) CLIENTES.push(c);
    cliCambiados.push(c.codigo);
    cliIntento = false;
    cliAntes = null;
    ir(CLI_LISTA, true);
    delete guardadas[CLI_NUEVO];   // el próximo cliente empieza en blanco
    aviso(f.codigo ? "Cambios guardados: " + c.nombre + "."
                   : c.nombre + " queda registrado, sin deuda" + (c.cupo ? " y con un cupo de " + pesos(c.cupo) : " y de contado") + ".", "ok");
  }

  // "Nuevo cliente" pide uno en blanco aunque se estuviera editando otro. Se marca antes
  // de que el oyente de los enlaces navegue (fase de captura)
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    if (e.target.closest('[data-rapida="cliente"]')) cliNuevo = true;   // un botón: navega aunque lleve Ctrl
    else if (!(e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) && e.target.closest('a[href="' + CLI_NUEVO + '"]')) cliNuevo = true;
  }, true);

  // Cada cosa que se escribe o se elige vuelve a dibujar lo que depende de ella
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (!t.closest || !t.closest("#cli-form")) return;
    pintarCliente();
  });

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!t.closest || !t.closest("#cli-form")) return;
    if (t.id === "cl-cupo") {   // al salir del campo, el cupo queda escrito como se leyó
      var cifras = pesosEscritos(t.value);
      t.value = cifras ? miles(Number(cifras)) : "";
    }
    if (t.id === "cl-depto") llenarMunicipios(t.value);
    if (t.name === "cl-persona" && t.value === "juridica" && !deEmpresa(uno("#cl-tipodoc").value)) poner("cl-tipodoc", "31");
    // Sin NIT no es responsable de IVA ni factura electrónicamente: el tributo pasa solo a ZZ
    // y el interruptor a No; si regresa a NIT, vuelven a lo que tenían
    if (t.id === "cl-tipodoc" || t.name === "cl-persona") {
      var trib = uno("#cl-tributo"), fe = uno("#cl-facturador"), conNit = uno("#cl-tipodoc").value === "31";
      if (!conNit && trib.value !== "ZZ") {
        cliAntes = { tributo: trib.value, facturador: fe.checked };
        trib.value = "ZZ";
        fe.checked = false;
      } else if (conNit && cliAntes && trib.value === "ZZ") {
        trib.value = cliAntes.tributo;
        fe.checked = cliAntes.facturador;
        cliAntes = null;
      }
    }
    if (t.id === "cl-tributo" || t.id === "cl-facturador") cliAntes = null;   // lo eligió a mano
    if (t.name === "cl-resp") {
      // "R-99-PN" (no aplica) no va con las demás; y si no marca ninguna, queda esa
      var cajas = todos('[name="cl-resp"]');
      if (t.checked) cajas.forEach(function (x) { if (x !== t && (t.value === "R-99-PN" || x.value === "R-99-PN")) x.checked = false; });
      if (!cajas.some(function (x) { return x.checked; })) cajas.filter(function (x) { return x.value === "R-99-PN"; })[0].checked = true;
    }
    pintarCliente();
  });

  document.addEventListener("submit", function (e) {
    if (e.target.id !== "cli-form") return;
    e.preventDefault();
    guardarCliente();
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest("#cli-form")) return;
    var tab = e.target.closest("[data-cl-tab]");
    if (tab) return verPestana(tab.getAttribute("data-cl-tab"));
    var campo = e.target.closest("[data-cl-ir]");
    if (campo) return irACampo(campo.getAttribute("data-cl-ir"));
    if (e.target.closest('[data-cl="cancelar"]')) {
      cliIntento = false;
      cliAntes = null;
      ir(CLI_LISTA, true);
      delete guardadas[CLI_NUEVO];
    }
  });

  // Las pestañas también se cambian con las flechas, como pide su rol de "tablist"
  document.addEventListener("keydown", function (e) {
    var tab = e.target.closest ? e.target.closest("[data-cl-tab]") : null;
    if (!tab || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    e.preventDefault();
    var otra = tab.getAttribute("data-cl-tab") === "datos" ? "fe" : "datos";
    verPestana(otra);
    uno('[data-cl-tab="' + otra + '"]').focus();
  });

  /* ---------------------------------------------------------------- 14. Pedidos y existencias: los datos

     Lo que comparten Existencias, Pedidos e Inicio. Las reglas están en el README
     del módulo (RN-COM-10 a RN-COM-19).
     - BODEGAS_PT: las bodegas de producto terminado de Inventario.
     - EXISTENCIAS: los pares que Inventario tiene en cada bodega, por modelo y
       color: un número por talla, en el orden de PRODUCTOS.tallas (la misma forma
       de PRODUCTOS.colores). En el sistema de verdad llegan de la API de
       Inventario (04-inventario/api/saldo-terminado.php): Comercial no los guarda.
     - PEDIDOS: uno por cada factura que salió de una cotización. Cada renglón
       (modelo, color y talla) dice cuántos pares pide y cuántos tiene apartados.
       Lo apartado lo lleva Comercial: Inventario no tiene reservas.
     - Libre para vender = en bodega − apartado (RN-COM-12).
     - ENTRADAS_EJEMPLO: lo que Inventario recibe; lo aplica "Volver a leer el saldo".
     Comercial publica sus pedidos en CLAVE_PEDIDOS para Producción y Logística. */

  var BODEGAS_PT = [
    { codigo: "BOD-02", nombre: "Producto terminado", zona: "Bloque B · zona de despachos" },
    // La segunda bodega de producto terminado todavía no existe en Inventario: su código hay que acordarlo
    { codigo: "BOD-05", nombre: "Almacén de ventas", zona: "Bloque B · mostrador", ejemplo: true }
  ];

  /* BOD-02 cuadra con el saldo de Inventario: 78 pares de REF-1042 y 44 de REF-1043.
     De REF-1042 Negro no hay: es lo que Producción está haciendo. De REF-1044 tampoco:
     su lote (LT-2026-031) todavía no entra. BOD-05 tiene de REF-1042 la misma curva
     de CO-2026-015 */
  var EXISTENCIAS = {
    "BOD-02": {
      "REF-1042": { "Café": [4, 8, 12, 10, 6, 0], "Miel": [0, 6, 10, 12, 6, 4] },
      "REF-1043": { "Café": [3, 5, 6, 4, 2, 0], "Miel": [2, 3, 4, 3, 2, 0], "Negro": [0, 2, 3, 3, 2, 0] }
    },
    "BOD-05": {
      "REF-1042": { "Negro": [3, 6, 9, 8, 5, 2], "Café": [1, 4, 5, 4, 2, 0], "Miel": [0, 2, 4, 3, 1, 1] },
      "REF-1043": { "Café": [1, 2, 2, 2, 1, 0], "Negro": [0, 1, 1, 1, 1, 0] }
    }
  };

  /* Los pedidos de ejemplo, numerados en el orden de su factura. "fecha" es el día en
     que se registró (el de su factura) y "entrega", la fecha que se le prometió al
     cliente. Sus renglones son los de su cotización (lineasDePedido); "apartado" dice
     los pares que ya tiene apartados en su bodega, con la forma de EXISTENCIAS.
     Los "...El" son el día de cada paso del recorrido: se validaron sus existencias, se
     fue a Producción (solo si le faltaba algo), quedó listo, salió y se entregó.
     La factura FV-2026-0158 (CO-2026-015) todavía no tiene pedido: se registra en Pedidos. */
  var PEDIDOS = [
    // Estos tenían todo en bodega: no pasaron por Producción
    { codigo: "PD-2026-085", factura: "FV-2026-0112", cot: "CO-2026-001", fecha: "2026-08-06", entrega: "2026-08-19",
      bodega: "BOD-02", estado: "entregado", despacho: "DS-2026-047",
      validadoEl: "2026-08-06", listoEl: "2026-08-06", despachoEl: "2026-08-14", entregadoEl: "2026-08-19" },
    { codigo: "PD-2026-086", factura: "FV-2026-0118", cot: "CO-2026-002", fecha: "2026-08-08", entrega: "2026-08-20",
      bodega: "BOD-02", estado: "entregado", despacho: "DS-2026-049",
      validadoEl: "2026-08-08", listoEl: "2026-08-08", despachoEl: "2026-08-18", entregadoEl: "2026-08-20" },
    { codigo: "PD-2026-087", factura: "FV-2026-0127", cot: "CO-2026-004", fecha: "2026-08-17", entrega: "2026-10-01",
      bodega: "BOD-02", estado: "despacho", despacho: "DS-2026-052",
      validadoEl: "2026-08-17", produccionEl: "2026-08-17", listoEl: "2026-09-24", despachoEl: "2026-09-26" },
    // A estos les falta REF-1042 Negro o REF-1044, que en BOD-02 no hay: Producción los está haciendo
    { codigo: "PD-2026-088", factura: "FV-2026-0131", cot: "CO-2026-005", fecha: "2026-08-23", entrega: "2026-10-01",
      bodega: "BOD-02", estado: "en_produccion", validadoEl: "2026-08-23", produccionEl: "2026-08-23" },
    { codigo: "PD-2026-089", factura: "FV-2026-0139", cot: "CO-2026-007", fecha: "2026-08-30", entrega: "2026-10-06",
      bodega: "BOD-02", estado: "en_produccion", validadoEl: "2026-08-30", produccionEl: "2026-08-30" },
    { codigo: "PD-2026-090", factura: "FV-2026-0144", cot: "CO-2026-008", fecha: "2026-09-03", entrega: "2026-10-08",
      bodega: "BOD-02", estado: "en_produccion", validadoEl: "2026-09-03", produccionEl: "2026-09-03" },
    // El Café y el Miel sí estaban: quedaron apartados (24 pares). Faltan los 60 Negro
    { codigo: "PD-2026-091", factura: "FV-2026-0152", cot: "CO-2026-010", fecha: "2026-09-11", entrega: "2026-10-14",
      bodega: "BOD-02", estado: "en_produccion", validadoEl: "2026-09-11", produccionEl: "2026-09-11",
      apartado: { "REF-1042": { "Café": [2, 3, 4, 3, 2, 0], "Miel": [0, 2, 3, 3, 1, 1] } } }
  ];
  var ultimaPed = 94;   // el consecutivo más alto: PD-2026-092 a 094 ya los usan de ejemplo Logística y Producción

  var PED_LISTA = "05-pedidos.html";
  var pedFiltro = null;   // Pedidos se abre filtrado por un modelo y un estado: { ref, estado } (desde Existencias)
  var pedAbrir = null;    // el pedido cuyo detalle se abre al entrar a Pedidos

  /* Los pares de una talla en una tabla con la forma de EXISTENCIAS["BOD-02"]:
     tabla[ref][color] = pares por talla, en el orden de PRODUCTOS.tallas */
  function paresEn(tabla, ref, color, talla) {
    var fila = tabla && tabla[ref] && tabla[ref][color];
    return fila ? fila[productoPor(ref).tallas.indexOf(talla)] || 0 : 0;
  }

  /* Los renglones de un pedido: los de su cotización, cada uno con lo que tiene
     apartado. El que ya salió de la bodega (En despacho o Entregado) salió completo */
  function lineasDePedido(p) {
    var salio = p.estado === "despacho" || p.estado === "entregado";
    return cotizacionDe(p.cot).lineas.map(function (l) {
      return { ref: l.ref, color: l.color, talla: l.talla, cant: l.cant,
               apartado: salio ? l.cant : paresEn(p.apartado, l.ref, l.color, l.talla) };
    });
  }
  PEDIDOS.forEach(function (p) { p.lineas = lineasDePedido(p); });

  function enBodega(b, ref, color, talla) { return paresEn(EXISTENCIAS[b], ref, color, talla); }

  /* Los pedidos que apartan pares: los En producción y los Listos para despacho (RN-COM-12) */
  function aparta(p) { return p.estado === "en_produccion" || p.estado === "listo"; }

  /* Lo apartado para pedidos en una bodega, de un modelo, color y talla */
  function apartadoEn(b, ref, color, talla) {
    var s = 0;
    PEDIDOS.forEach(function (p) {
      if (p.bodega !== b || !aparta(p)) return;
      p.lineas.forEach(function (l) {
        if (l.ref === ref && l.color === color && l.talla === talla) s += l.apartado;
      });
    });
    return s;
  }

  /* Libre para vender = en bodega − apartado, nunca menos de 0 */
  function libreEn(b, ref, color, talla) {
    return Math.max(0, enBodega(b, ref, color, talla) - apartadoEn(b, ref, color, talla));
  }

  /* Lo que un pedido tiene apartado y lo que le falta, de un modelo o de todo el pedido */
  function apartadoDe(p, ref) {
    return p.lineas.reduce(function (s, l) { return s + (!ref || l.ref === ref ? l.apartado : 0); }, 0);
  }
  function faltanDe(p, ref) {
    return p.lineas.reduce(function (s, l) { return s + (!ref || l.ref === ref ? l.cant - l.apartado : 0); }, 0);
  }
  function clienteDePedido(p) { return clientePor(HISTORIAL[p.cot].cli); }
  /* De la factura más vieja a la más nueva */
  function porFactura(a, b) { return cola(a.factura) - cola(b.factura); }
  function pedidoPor(codigo) { return PEDIDOS.filter(function (p) { return p.codigo === codigo; })[0]; }
  /* Los que se registraron y todavía no se validan */
  function sinValidar() { return PEDIDOS.filter(function (p) { return p.estado === "registrado"; }); }

  /* Las facturas que salieron de una cotización y todavía no tienen pedido (RN-COM-10),
     de la más vieja a la más nueva. Las de antes del sistema no traen productos: no cuentan */
  function facturasSinPedido() {
    return Object.keys(HISTORIAL).map(function (n) { return HISTORIAL[n].factura; })
      .filter(function (f) { return f && !PEDIDOS.some(function (p) { return p.factura === f; }); })
      .sort(function (a, b) { return cola(a) - cola(b); });
  }

  /* Lo que le pide acción a Comercial en Pedidos (su número en el menú): las facturas
     sin pedido y los pedidos que todavía no se validan */
  function porAtender() { return facturasSinPedido().length + sinValidar().length; }

  /* "2026-08-19" → la fecha, a las 00:00 de aquí; null si no hay */
  function fechaDe(iso) { return iso ? new Date(iso + "T00:00") : null; }
  /* El día de hoy como "2026-09-29", en la hora de aquí (hoy() lo da en la hora universal) */
  function diaDeHoy() { return fechaIso(new Date()); }

  /* ---- Volver a validar los pedidos (RN-COM-15 y RN-COM-16) ----
     Se llama al cargar y cada vez que cambian las existencias:
     1. si Inventario reporta menos pares de los apartados, se le quitan al pedido
        más nuevo que los tenga; si estaba Listo para despacho, vuelve a En producción;
     2. lo libre se reparte entre los pedidos En producción, del de la factura más
        vieja al de la más nueva. Lo que ya está apartado no se le quita a nadie;
     3. el pedido que queda completo pasa solo a Listo para despacho.
     Devuelve lo que cambió, para decirlo en un aviso. Al cargar no cambia nada. */
  function revalidar() {
    var cambios = { listos: [], recibieron: [], vuelven: [] };
    quitarLoQueNoEsta(cambios);
    repartirLoLibre(cambios);
    publicarPedidos();
    return cambios;
  }

  function quitarLoQueNoEsta(cambios) {
    PEDIDOS.filter(aparta).sort(porFactura).reverse().forEach(function (p) {
      p.lineas.forEach(function (l) {
        var sobra = apartadoEn(p.bodega, l.ref, l.color, l.talla) - enBodega(p.bodega, l.ref, l.color, l.talla);
        if (sobra <= 0 || !l.apartado) return;
        l.apartado -= Math.min(sobra, l.apartado);
        if (p.estado === "listo") {
          p.estado = "en_produccion";
          p.novedad = "perdio";   // en Inicio sale un aviso urgente
          cambios.vuelven.push(p);
        }
      });
    });
  }

  function repartirLoLibre(cambios) {
    PEDIDOS.filter(function (p) { return p.estado === "en_produccion"; }).sort(porFactura).forEach(function (p) {
      var recibe = 0;
      p.lineas.forEach(function (l) {
        var toma = Math.min(l.cant - l.apartado, libreEn(p.bodega, l.ref, l.color, l.talla));
        if (toma > 0) {
          l.apartado += toma;
          recibe += toma;
        }
      });
      if (!faltanDe(p)) {
        p.estado = "listo";
        p.novedad = "listo";   // en Inicio sale el aviso de que quedó listo
        p.listoEl = diaDeHoy();
        cambios.listos.push(p);
      } else if (recibe) {
        cambios.recibieron.push({ pedido: p, pares: recibe });
      }
    });
  }

  /* ---- Lo que Comercial publica ----
     Para Producción, lo que les falta a los pedidos En producción; para Logística,
     los Listos para despacho. Usa los nombres que Logística ya lee (PedidoFacturado).
     En el sistema de verdad son sus APIs: 07-comercial/api/pedidos-por-fabricar.php
     y pedidos-listos.php. Comercial no la vuelve a leer: con F5 todo empieza de nuevo */
  var CLAVE_PEDIDOS = "sicaf_pedidos_comercial";

  function publicarPedidos() {
    try {
      localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify({ actualizado: new Date().toISOString(),
                                                           pedidos: PEDIDOS.map(pedidoParaPublicar) }));
    } catch (e) {
      // sin almacenamiento (una ventana privada, por ejemplo) el mockup sigue igual
    }
  }

  function pedidoParaPublicar(p) {
    var q = cotizacionDe(p.cot), c = q.cliente, t = totales(q);
    return {
      pedidoCodigo: p.codigo, facturaNumero: p.factura, cotizacion: p.cot,
      fechaFacturacion: fechaIso(sumarDias(q.fecha, q.pasos.facturada || 0)),
      cliente: c.nombre, nit: c.nit, destinoNodo: c.ciudad, direccion: c.direccion,
      entrega: p.entrega, bodega: p.bodega, estado: p.estado,
      cantidadPares: t.pares, totalFacturado: t.total, referencia: p.lineas[0].ref,
      lineas: p.lineas.map(function (l) {
        return { ref: l.ref, color: l.color, talla: l.talla, cant: l.cant, apartado: l.apartado };
      }),
      faltan: p.estado !== "en_produccion" ? [] : p.lineas.filter(function (l) { return l.cant > l.apartado; })
        .map(function (l) { return { ref: l.ref, color: l.color, talla: l.talla, pares: l.cant - l.apartado }; })
    };
  }

  /* ---- Lo que Inventario recibe (o da de baja) en producto terminado ----
     Uno por clic en "Volver a leer el saldo". Son los lotes de
     04-inventario/mockup/04-terminado.html. Una entrada trae sus pares por color y
     talla ("colores") o solo el total ("pares"), que se reparte como lo asignado
     (curvaDe). Una baja deja en 0 esa talla de esa bodega. */
  var ENTRADAS_EJEMPLO = [
    { lote: "LT-2026-031", bodega: "BOD-02", ref: "REF-1044", pares: 120 },
    { lote: "LT-2026-033", bodega: "BOD-02", ref: "REF-1042", colores: { "Negro": [6, 10, 14, 14, 10, 6] } },
    { baja: "daño", bodega: "BOD-02", ref: "REF-1044", color: "Negro", talla: 36 }
  ];
  var entradasLeidas = 0;   // cuántas de ENTRADAS_EJEMPLO ya entraron
  var saldoLeido = new Date();   // cuándo se leyó el saldo de Inventario (lo dicen Existencias y Pedidos)
  function horaDe(d) { return dos(d.getHours()) + ":" + dos(d.getMinutes()); }

  /* Suma (o resta, con n negativo) pares a una talla de una bodega */
  function sumarEnBodega(b, ref, color, talla, n) {
    if (!EXISTENCIAS[b]) EXISTENCIAS[b] = {};
    if (!EXISTENCIAS[b][ref]) EXISTENCIAS[b][ref] = {};
    if (!EXISTENCIAS[b][ref][color]) EXISTENCIAS[b][ref][color] = productoPor(ref).tallas.map(function () { return 0; });
    var fila = EXISTENCIAS[b][ref][color], i = productoPor(ref).tallas.indexOf(talla);
    fila[i] = Math.max(0, fila[i] + n);
  }

  /* Aplica la siguiente entrada y vuelve a validar los pedidos. Devuelve la entrada,
     los pares que movió y lo que cambió en los pedidos; null si ya no hay más */
  function aplicarEntrada() {
    saldoLeido = new Date();
    var e = ENTRADAS_EJEMPLO[entradasLeidas];
    if (!e) return null;
    entradasLeidas++;
    var pares = 0;
    if (e.baja) {
      pares = enBodega(e.bodega, e.ref, e.color, e.talla);
      sumarEnBodega(e.bodega, e.ref, e.color, e.talla, -pares);
    } else {
      var renglones = e.colores ? renglonesDe(e.ref, 0, e.colores) : curvaDe(productoPor(e.ref), e.pares, 0);
      renglones.forEach(function (l) {
        sumarEnBodega(e.bodega, l.ref, l.color, l.talla, l.cant);
        pares += l.cant;
      });
    }
    return { entrada: e, pares: pares, cambios: revalidar() };
  }

  /* El aviso de lo que pasó al leer el saldo: qué recibió (o dio de baja) Inventario y
     qué pedidos cambiaron. Si un pedido Listo perdió pares, el aviso sale en rojo */
  function avisoEntrada(r) {
    if (!r) return aviso("Inventario no tiene entradas nuevas: el saldo ya estaba al día.", "ok");
    var e = r.entrada, nombre = productoPor(e.ref).nombre, c = r.cambios;
    var texto = e.baja
      ? "Inventario dio de baja por " + e.baja + " " + cuantas(r.pares, "par", "pares") + " de " + nombre + " " + e.color +
        " talla " + e.talla + " en " + e.bodega + "."
      : "Inventario recibió " + e.lote + ": " + cuantas(r.pares, "par", "pares") + " de " + nombre + " en " + e.bodega + ".";
    c.listos.forEach(function (p) { texto += " " + p.codigo + " quedó listo para despacho."; });
    c.recibieron.forEach(function (x) {
      texto += " " + x.pedido.codigo + " recibió " + cuantas(x.pares, "par", "pares") + " y sigue en producción: faltan " +
               faltanDe(x.pedido) + ".";
    });
    c.vuelven.forEach(function (p) { texto += " " + p.codigo + " perdió pares apartados y volvió a En producción: revise con Inventario."; });
    aviso(texto, c.vuelven.length ? "crit" : "ok");
  }

  /* ---------------------------------------------------------------- 15. Existencias

     03-existencias.html responde "¿cuántos pares de este modelo, color y talla hay
     libres en esta bodega y, si aquí no hay, dónde sí?". Solo consulta: no crea
     productos ni le pide nada a Producción (RN-COM-17).
     Arriba se eligen el producto y la bodega. Abajo, en tres columnas: el catálogo
     como una tienda | el modelo en esa bodega, con la rejilla color × talla de lo
     libre | en qué otras bodegas hay y qué pedidos esperan ese modelo.
     Lo elegido vive en "exi" y todo se vuelve a dibujar desde él. No usa "cot" ni
     las funciones de la vitrina de la cotización, que la necesitan. */

  var TODAS = "todas";      // el valor de "Todas las bodegas"
  var exi = null;           // lo elegido: { ref, bodega, color, q, solo }
  var refACotizar = null;   // el modelo en el que se abre la vitrina de la próxima cotización ("Cotizar este modelo")
  var exiAbrir = null;      // el modelo y la bodega con que se abre Existencias: { ref, bodega } (desde un pedido)

  function iniciarExistencias() {
    if (!exi) exi = { ref: null, bodega: BODEGAS_PT[0].codigo, color: null, q: "", solo: false };
    if (exiAbrir) {   // "Ver existencias del modelo" (Pedidos): ese modelo en la bodega del pedido
      exi.ref = exiAbrir.ref;
      exi.bodega = exiAbrir.bodega;
      exi.color = null;
      exiAbrir = null;
    }
    uno("#exi-solo").checked = exi.solo;
    uno("#exi-q").value = exi.q;
    pintarExistencias();
  }

  /* ---- Lo que se suma de un modelo ---- */

  /* Las bodegas que se miran: la elegida, o todas */
  function bodegasDe(codigo) {
    return codigo === TODAS ? BODEGAS_PT.map(function (b) { return b.codigo; }) : [codigo];
  }

  /* Suma lo que dice "cuanto" (la función enBodega, apartadoEn o libreEn) de un modelo,
     en una bodega o en todas: de todos sus colores y tallas, de un color, o de un color y una talla */
  function sumar(cuanto, p, codigo, color, talla) {
    var s = 0;
    bodegasDe(codigo).forEach(function (b) {
      colores(p).forEach(function (c) {
        if (color && c !== color) return;
        p.tallas.forEach(function (t) {
          if (!talla || t === talla) s += cuanto(b, p.ref, c, t);
        });
      });
    });
    return s;
  }

  /* Las otras bodegas donde el modelo (o ese color, o ese color y esa talla) tiene pares libres */
  function otrasConPares(p, codigo, color, talla) {
    return BODEGAS_PT.filter(function (b) { return b.codigo !== codigo; })
      .map(function (b) { return { codigo: b.codigo, libres: sumar(libreEn, p, b.codigo, color, talla) }; })
      .filter(function (x) { return x.libres > 0; });
  }

  function bodegaPor(codigo) { return BODEGAS_PT.filter(function (b) { return b.codigo === codigo; })[0]; }
  /* "BOD-05 · Almacén de ventas (de ejemplo)" */
  function nombreBodega(b) { return b.codigo + " · " + b.nombre + (b.ejemplo ? " (de ejemplo)" : ""); }
  /* La bodega elegida dentro de una frase: "BOD-02" o "todas las bodegas" */
  function enQueBodega() { return exi.bodega === TODAS ? "todas las bodegas" : exi.bodega; }
  /* Lo que dice el buscador cuando ya hay un modelo elegido */
  function etiquetaModelo(p) { return p ? p.nombre + " · " + p.ref : ""; }

  /* El color del dibujo: el que se tocó o, si no, el primero que tiene pares libres aquí */
  function colorDeFoto(p) {
    if (exi.color && p.ref === exi.ref) return exi.color;
    return colores(p).filter(function (c) { return sumar(libreEn, p, exi.bodega, c) > 0; })[0] || colores(p)[0];
  }
  /* Por qué un modelo no se vende */
  function motivoExi(p) { return p.bloqueo === "descontinuado" ? "Descontinuado" : "No se vende: en diseño"; }

  /* Todo lo que depende de lo elegido */
  function pintarExistencias() {
    var p = exi.ref ? productoPor(exi.ref) : null;
    pintarBodegas(p);
    uno("#exi-hora").textContent = horaDe(saldoLeido);
    pintarCatalogoExi();
    pintarModeloExi(p);
    pintarOtrasBodegas(p);
  }

  /* El select de la bodega: con un modelo elegido, cada opción dice cuántos libres tiene */
  function pintarBodegas(p) {
    function libres(codigo) { return p ? " — " + cuantas(sumar(libreEn, p, codigo), "libre", "libres") : ""; }
    uno("#exi-bod").innerHTML = opcion(TODAS, "Todas las bodegas" + libres(TODAS), exi.bodega) +
      BODEGAS_PT.map(function (b) { return opcion(b.codigo, esc(nombreBodega(b)) + libres(b.codigo), exi.bodega); }).join("");
    var b = bodegaPor(exi.bodega);
    uno("#exi-bod-sub").textContent = b ? b.zona : "Se suman las " + BODEGAS_PT.length + " bodegas de producto terminado";
  }

  /* ---- Columna 1: el catálogo, como una tienda ---- */

  /* El buscador ES el catálogo: lo escrito (sin tildes, "ref1043" sirve) filtra las tarjetas */
  function pintarCatalogoExi() {
    var lista = buscarEn(PRODUCTOS, exi.q, function (p) { return p.nombre + " " + p.ref; })
      .filter(function (p) { return !exi.solo || (!p.bloqueo && sumar(libreEn, p, exi.bodega) > 0); });
    var vacio = exi.q.trim() ? "Ningún producto coincide con «" + esc(exi.q.trim()) + "»" + (exi.solo ? " entre los que tienen pares" : "") + "."
      : "Ningún modelo tiene pares libres en " + enQueBodega() + '. Quite "Solo los que tienen pares" para verlos todos.';
    uno("#exi-cat").innerHTML = lista.length ? lista.map(tarjetaExistencia).join("") : '<p class="cot-vacio">' + vacio + "</p>";
  }

  /* Una tarjeta: el dibujo, el nombre, la referencia y cuánto hay. La del modelo que no
     se vende sale apagada y dice por qué */
  function tarjetaExistencia(p) {
    if (p.bloqueo) {
      return '<div class="exi-card is-bloqueado" aria-disabled="true" title="' + esc(mayuscula(p.bloqueo)) + '">' + foto(p, "", "sm") +
        '<span class="exi-card__x"><b>' + esc(p.nombre) + '</b><span class="exi-card__ref">' + p.ref + "</span>" +
        '<span class="exi-card__hay">' + motivoExi(p) + "</span></span></div>";
    }
    var on = p.ref === exi.ref;
    return '<button type="button" class="exi-card' + (on ? " is-on" : "") + '" data-exi-ref="' + p.ref + '" aria-pressed="' + on + '">' +
      foto(p, colorDeFoto(p), "sm") +
      '<span class="exi-card__x"><b>' + esc(p.nombre) + '</b><span class="exi-card__ref">' + p.ref + " · " + esc(p.coleccion) + "</span>" +
        lineaExistencia(p) + "</span></button>";
  }

  /* Lo que dice cada tarjeta de lo que hay: "54 libres aquí · 60 en BOD-05",
     "Aquí no hay · 60 en BOD-05" (con su punto) o "Sin existencias en ninguna bodega" */
  function lineaExistencia(p) {
    var aqui = sumar(libreEn, p, exi.bodega), otras = otrasConPares(p, exi.bodega);
    var enOtras = otras.map(function (x) { return miles(x.libres) + " en " + x.codigo; }).join(" · ");
    var tono = "cero", texto = "Sin existencias en ninguna bodega";
    if (aqui && exi.bodega === TODAS) {
      tono = "ok";
      texto = cuantas(aqui, "libre", "libres") + " en " + cuantas(otras.length, "bodega", "bodegas");
    } else if (aqui) {
      tono = "ok";
      texto = cuantas(aqui, "libre", "libres") + " aquí" + (enOtras ? " · " + enOtras : "");
    } else if (enOtras) {
      tono = "otra";
      texto = "Aquí no hay · " + enOtras;
    }
    return '<span class="exi-card__hay exi-card__hay--' + tono + '">' + texto + "</span>";
  }

  /* ---- Columna 2: el modelo en la bodega elegida ---- */

  function pintarModeloExi(p) {
    uno("#exi-mod-t").innerHTML = icono("cuadricula", 18) + "<span>" + (p ? esc(p.nombre) + " en " + enQueBodega() : "Existencias del modelo") + "</span>";
    uno("#exi-acc").hidden = !p;
    if (!p) {
      uno("#exi-mod").innerHTML = '<div class="cot-vacio">' + icono("zapato", 30) + "<b>Seleccione un producto para ver sus existencias.</b>" +
        "<p>Búsquelo arriba por nombre o referencia, o tóquelo en el catálogo de la izquierda.</p></div>";
      return;
    }
    var esperan = pedidosQueEsperan(p).length, ped = uno('[data-exi="pedidos"]');
    ped.disabled = !esperan;
    ped.setAttribute("data-tip", esperan ? "Ver los pedidos que esperan este modelo" : "Ningún pedido espera este modelo");
    ped.setAttribute("aria-label", ped.getAttribute("data-tip"));
    uno("#exi-mod").innerHTML = fichaExiHtml(p) + cifrasHtml(p) + avisoOtraHtml(p) + rejillaHtml(p) + leyendaExiHtml();
  }

  /* La foto grande y las muestras de color: tocar un color solo cambia el dibujo */
  function fichaExiHtml(p) {
    var color = colorDeFoto(p);
    return '<div class="exi-ficha">' + foto(p, color, "exi") +
      '<div class="exi-ficha__x"><span class="vit__ref">' + p.ref + " · " + esc(p.coleccion) + "</span>" +
        "<h4>" + esc(p.nombre) + "</h4>" +
        '<span class="exi-ficha__d">' + mayuscula(tallasDe(p)) + " · " + cuantas(colores(p).length, "color", "colores") + "</span>" +
        '<div class="cot-colores" role="radiogroup" aria-label="Color del dibujo">' + colores(p).map(function (c) {
          var on = c === color;
          return '<button type="button" class="cot-color' + (on ? " is-on" : "") + '" role="radio" aria-checked="' + on + '"' +
            ' data-exi-color="' + esc(c) + '" title="Ver el dibujo en ' + esc(c) + '"><i style="background:' + piel(c) + '"></i>' +
            "<span>" + esc(c) + "</span></button>";
        }).join("") + "</div></div></div>";
  }

  /* Las tres cifras: lo que hay, lo apartado para pedidos (el tooltip dice de quién) y lo libre */
  function cifrasHtml(p) {
    var quien = quienAparta(p);
    return '<div class="exi-cifras">' +
      cifraHtml("En bodega", sumar(enBodega, p, exi.bodega), "lo que reporta Inventario", "") +
      cifraHtml("Apartado para pedidos", sumar(apartadoEn, p, exi.bodega),
                quien.length ? "en " + cuantas(quien.length, "pedido", "pedidos") : "ningún pedido",
                quien.map(function (x) { return x.codigo + ": " + x.pares; }).join(" · "), "warn") +
      cifraHtml("Libre para vender", sumar(libreEn, p, exi.bodega), "en bodega − apartado", "", "ok") + "</div>";
  }

  function cifraHtml(nombre, n, ayuda, titulo, tono) {
    return '<div class="exi-cifra' + (tono ? " exi-cifra--" + tono : "") + '"' + (titulo ? ' title="' + esc(titulo) + '"' : "") + ">" +
      "<span>" + nombre + "</span><b>" + miles(n) + "</b><small>" + ayuda + "</small></div>";
  }

  /* Los pedidos que tienen apartados pares del modelo en la bodega elegida, con cuántos */
  function quienAparta(p) {
    return PEDIDOS.filter(function (x) { return aparta(x) && bodegasDe(exi.bodega).indexOf(x.bodega) >= 0; })
      .map(function (x) { return { codigo: x.codigo, pares: apartadoDe(x, p.ref) }; })
      .filter(function (x) { return x.pares > 0; });
  }

  /* Si en la bodega elegida no hay un color (o unas tallas) que en otra sí, lo dice arriba de la rejilla */
  function avisoOtraHtml(p) {
    if (exi.bodega === TODAS) return "";
    return colores(p).map(function (c) {
      var tallas = p.tallas.filter(function (t) {
        return !libreEn(exi.bodega, p.ref, c, t) && otrasConPares(p, exi.bodega, c, t).length > 0;
      });
      if (!tallas.length) return "";
      var todo = !sumar(libreEn, p, exi.bodega, c);   // no hay nada de ese color, o solo faltan unas tallas
      var otras = BODEGAS_PT.filter(function (b) { return b.codigo !== exi.bodega; }).map(function (b) {
        var n = tallas.reduce(function (s, t) { return s + libreEn(b.codigo, p.ref, c, t); }, 0);
        return n ? "en " + b.codigo + " hay " + cuantas(n, "par libre", "pares libres") : "";
      }).filter(Boolean);
      return avisoHtml("warn", "En " + exi.bodega + " no hay " + esc(p.nombre) + " " + esc(c) +
          (todo ? "" : " en " + (tallas.length === 1 ? "talla " : "tallas ") + enLista(tallas.map(String))),
        mayuscula(enLista(otras)) + (todo ? "" : tallas.length === 1 ? " de esa talla" : " de esas tallas") +
          ". Para traerlos, Inventario hace el traslado.");
    }).join("");
  }

  /* La rejilla: una fila por color y una columna por talla. Cada celda dice los pares
     LIBRES con el punto de nivel(): verde si alcanza, ámbar si quedan pocos, gris si no
     hay. Si aquí no hay pero en otra bodega sí, lleva además un punto azul */
  function rejillaHtml(p) {
    var color = colorDeFoto(p);
    return '<div class="exi-rej" role="table" aria-label="Pares libres por color y talla" style="--tallas: ' + p.tallas.length + '">' +
      '<div class="exi-rej__f" role="row"><span class="exi-rej__cab exi-rej__color" role="columnheader">Color</span>' +
        p.tallas.map(function (t) { return '<span class="exi-rej__cab" role="columnheader">' + t + "</span>"; }).join("") + "</div>" +
      colores(p).map(function (c) {
        return '<div class="exi-rej__f' + (c === color ? " is-on" : "") + '" role="row">' +
          '<span class="exi-rej__color" role="rowheader"><i style="background:' + piel(c) + '"></i><b>' + esc(c) + "</b>" +
            "<small>" + cuantas(sumar(libreEn, p, exi.bodega, c), "libre", "libres") + "</small></span>" +
          p.tallas.map(function (t) { return celdaHtml(p, c, t); }).join("") + "</div>";
      }).join("") + "</div>";
  }

  function celdaHtml(p, color, talla) {
    var hay = sumar(libreEn, p, exi.bodega, color, talla);
    var otras = hay ? [] : otrasConPares(p, exi.bodega, color, talla);
    return '<span class="exi-celda exi-celda--' + nivel(hay) + '" role="cell" data-color="' + esc(color) + '" data-talla="' + talla +
      '" title="' + esc(tituloCelda(p, color, talla, hay, otras)) + '">' + hay +
      (otras.length ? '<i class="exi-otra" aria-hidden="true"></i>' : "") + "</span>";
  }

  /* El tooltip de una celda: de dónde sale el número o, si aquí no hay, dónde sí */
  function tituloCelda(p, color, talla, hay, otras) {
    if (otras.length) return "Aquí no hay; " + enLista(otras.map(function (x) { return "en " + x.codigo + " hay " + x.libres; }));
    if (exi.bodega === TODAS) {
      return BODEGAS_PT.map(function (b) { return b.codigo + ": " + libreEn(b.codigo, p.ref, color, talla); }).join(" · ");
    }
    return "En bodega " + enBodega(exi.bodega, p.ref, color, talla) + " · apartado " + apartadoEn(exi.bodega, p.ref, color, talla) +
           " · libre " + hay;
  }

  function leyendaExiHtml() {
    return '<div class="vit__leyenda exi-leyenda"><span class="is-ok">Alcanza (6 o más)</span><span class="is-poco">Quedan pocos</span>' +
      '<span class="is-cero">No hay</span>' + (exi.bodega === TODAS ? "" : '<span class="is-otra">Aquí no hay; en otra bodega sí</span>') + "</div>";
  }

  /* ---- Columna 3: en otras bodegas (siempre a la vista) ---- */

  function pintarOtrasBodegas(p) {
    uno("#exi-otras-t").innerHTML = icono("ubicacion", 18) + (exi.bodega === TODAS ? "Por bodega" : "En otras bodegas");
    var bodegas = BODEGAS_PT.filter(function (b) { return exi.bodega === TODAS || b.codigo !== exi.bodega; });
    if (!p) {
      uno("#exi-otras").innerHTML = '<p class="exi-otras__ayuda">Seleccione un producto para ver en qué otras bodegas hay. ' +
        "Por ahora, lo libre de cada una:</p>" + bodegas.map(bodegaSinModeloHtml).join("");
      return;
    }
    var total = sumar(libreEn, p, TODAS), con = otrasConPares(p, TODAS).length;
    uno("#exi-otras").innerHTML =
      '<p class="exi-total">' + (total ? "<b>" + miles(total) + "</b> " + (total === 1 ? "par libre" : "pares libres") + " de " +
        esc(p.nombre) + " en " + cuantas(con, "bodega", "bodegas") : "No hay pares libres de " + esc(p.nombre) + " en ninguna bodega") + "</p>" +
      bodegas.map(function (b) { return bodegaConModeloHtml(p, b); }).join("") + esperanHtml(p);
  }

  /* El título de una bodega: su nombre, dónde queda, cuántos libres tiene y el ojo para verla */
  function cabBodegaHtml(b, n) {
    var ver = b.codigo === exi.bodega ? "" :
      '<button type="button" class="cot-ico cot-ico--ver" data-exi-bod="' + b.codigo + '" data-tip="Ver esta bodega"' +
      ' aria-label="Ver ' + esc(nombreBodega(b)) + '">' + icono("ojo", 16) + "</button>";
    return '<header class="exi-bod__cab"><div><b>' + esc(nombreBodega(b)) + "</b><small>" + esc(b.zona) + "</small>" +
      '<span class="exi-bod__n' + (n ? "" : " is-cero") + '">' + cuantas(n, "libre", "libres") + "</span></div>" + ver + "</header>";
  }

  /* Una bodega con el modelo elegido: por color, las tallas que tienen pares libres */
  function bodegaConModeloHtml(p, b) {
    var filas = colores(p).filter(function (c) { return sumar(libreEn, p, b.codigo, c) > 0; }).map(function (c) {
      return '<div class="cot-item__color"><i style="background:' + piel(c) + '"></i><span>' + esc(c) + "</span>" +
        '<span class="vit__chips">' + p.tallas.filter(function (t) { return libreEn(b.codigo, p.ref, c, t) > 0; }).map(function (t) {
          return "<span>" + t + "<b>×" + libreEn(b.codigo, p.ref, c, t) + "</b></span>";
        }).join("") + "</span></div>";
    }).join("");
    return '<section class="exi-bod" data-bodega="' + b.codigo + '">' + cabBodegaHtml(b, sumar(libreEn, p, b.codigo)) +
      (filas || '<p class="exi-bod__nada">No tiene pares libres de este modelo.</p>') + "</section>";
  }

  /* Sin modelo elegido: lo libre de cada bodega, modelo por modelo */
  function bodegaSinModeloHtml(b) {
    var modelos = PRODUCTOS.filter(function (p) { return !p.bloqueo && sumar(libreEn, p, b.codigo) > 0; });
    var n = modelos.reduce(function (s, p) { return s + sumar(libreEn, p, b.codigo); }, 0);
    return '<section class="exi-bod" data-bodega="' + b.codigo + '">' + cabBodegaHtml(b, n) +
      (modelos.length ? '<ul class="exi-bod__modelos">' + modelos.map(function (p) {
        return '<li><button type="button" data-exi-ref="' + p.ref + '" title="Ver ' + esc(p.nombre) + '">' + esc(p.nombre) +
               '<span class="tiny">' + p.ref + "</span></button><b>" + miles(sumar(libreEn, p, b.codigo)) + "</b></li>";
      }).join("") + "</ul>" : '<p class="exi-bod__nada">No tiene pares libres.</p>') + "</section>";
  }

  /* Los pedidos En producción a los que les falta este modelo, del de la factura más
     vieja al de la más nueva: en ese orden reciben lo que entre (RN-COM-15) */
  function pedidosQueEsperan(p) {
    return PEDIDOS.filter(function (x) { return x.estado === "en_produccion" && faltanDe(x, p.ref) > 0; }).sort(porFactura);
  }

  function esperanHtml(p) {
    var l = pedidosQueEsperan(p);
    return '<section class="exi-esperan"><h4 class="cot-det__t">Pedidos que esperan este modelo</h4>' +
      (l.length ? l.map(function (x) {
        return '<button type="button" class="exi-esp" data-exi-ped="' + x.codigo + '" title="Ver el pedido ' + x.codigo + ' en Pedidos">' +
          "<b>" + x.codigo + "</b><span>faltan " + miles(faltanDe(x, p.ref)) + "</span>" +
          "<small>Entrega " + fechaCorta(new Date(x.entrega + "T00:00")) + " · " + esc(clienteDePedido(x).nombre) + "</small></button>";
      }).join("") : '<p class="exi-bod__nada">Ningún pedido espera este modelo.</p>') + "</section>";
  }

  /* ---- Lo que se hace en la pantalla ---- */

  /* Elegir un modelo: un clic en su tarjeta del catálogo */
  function elegirProductoExi(ref) {
    exi.ref = ref;
    exi.color = null;
    pintarExistencias();
    var tarjeta = uno('#exi-cat [data-exi-ref="' + ref + '"]');
    if (tarjeta) tarjeta.scrollIntoView({ block: "nearest" });
  }

  /* "Ver esta bodega": la elige en el encabezado */
  function verBodega(codigo) {
    exi.bodega = codigo;
    pintarExistencias();
    uno("#exi-bod").focus();
  }

  /* "Volver a leer el saldo": en el prototipo, Inventario recibe el siguiente lote de
     ENTRADAS_EJEMPLO y los pedidos se vuelven a validar. En el sistema de verdad es
     volver a pedirle el saldo a la API de Inventario */
  function leerSaldo() {
    avisoEntrada(aplicarEntrada());
    pintarExistencias();
  }

  /* "Cotizar este modelo": abre una cotización nueva y, al elegir los productos, la
     vitrina se abre en este modelo. Si hay una a medias, primero se termina esa */
  function cotizarModelo(p) {
    if (guardadas[NUEVA] && cot && cot.estado !== "nueva") {
      aviso("Termine primero la cotización " + cot.numero + ", que quedó a medias.", "warn");
      return ir(NUEVA, true);
    }
    refACotizar = p.ref;
    delete guardadas[NUEVA];
    aviso("Seleccione el cliente y pulse Cotizar: la lista de productos se abre en " + p.nombre + ".", "ok");
    ir(NUEVA, true);
  }

  /* "Ver los pedidos que esperan este modelo": Pedidos se abre filtrado por el modelo y En producción */
  function verPedidosDelModelo(p) {
    pedFiltro = { ref: p.ref, estado: "en_produccion" };
    ir(PED_LISTA, true);
  }

  document.addEventListener("click", function (e) {
    if (!exi || !e.target.closest || !uno("#exi")) return;
    var b, p = exi.ref ? productoPor(exi.ref) : null;
    if ((b = e.target.closest("[data-exi-ref]"))) return elegirProductoExi(b.getAttribute("data-exi-ref"));
    if ((b = e.target.closest("[data-exi-color]"))) {
      exi.color = b.getAttribute("data-exi-color");
      pintarExistencias();
      return uno('[data-exi-color="' + exi.color + '"]').focus();
    }
    if ((b = e.target.closest("[data-exi-bod]"))) return verBodega(b.getAttribute("data-exi-bod"));
    if ((b = e.target.closest("[data-exi-ped]"))) {
      pedAbrir = b.getAttribute("data-exi-ped");
      return ir(PED_LISTA, true);
    }
    var accion = e.target.closest("[data-exi]"), que = accion ? accion.getAttribute("data-exi") : "";
    if (que === "leer") leerSaldo();
    if (que === "cotizar" && p) cotizarModelo(p);
    if (que === "pedidos" && p) verPedidosDelModelo(p);
  });

  document.addEventListener("change", function (e) {
    if (!exi || !uno("#exi")) return;
    var t = e.target;
    if (t.id === "exi-bod") { exi.bodega = t.value; pintarExistencias(); }
    if (t.id === "exi-solo") { exi.solo = t.checked; pintarCatalogoExi(); }
  });

  /* Escribir en el buscador filtra el catálogo */
  document.addEventListener("input", function (e) {
    if (!exi || e.target.id !== "exi-q") return;
    exi.q = e.target.value;
    pintarCatalogoExi();
  });

  /* Enter elige el primer modelo que queda; Esc borra la búsqueda */
  document.addEventListener("keydown", function (e) {
    if (!exi || e.target.id !== "exi-q") return;
    if (e.key === "Escape" && exi.q) { e.preventDefault(); e.target.value = exi.q = ""; return pintarCatalogoExi(); }
    if (e.key !== "Enter") return;
    e.preventDefault();
    var primera = uno("#exi-cat button[data-exi-ref]");
    if (primera) elegirProductoExi(primera.getAttribute("data-exi-ref"));
  });

  /* ---------------------------------------------------------------- 16. Pedidos

     05-pedidos.html es la lista de pedidos, con la misma tabla de datos de
     Cotizaciones, Facturación y Clientes: las tarjetas filtran y un clic en un
     pedido abre su detalle a la derecha. Las filas se pintan desde PEDIDOS cada vez
     que se entra, porque un pedido también cambia en Existencias y en Nuevo pedido.
     La ventana "Validar existencias" decide a dónde va un pedido Registrado: si en la
     bodega está todo, a Logística (Listo para despacho); si falta algo, se aparta lo
     que hay y Producción fabrica el resto (En producción).
     Comercial no mueve etapas de planta ni despachos (RN-COM-17): el avance lo
     publica Producción y aquí solo se lee. */

  var ESTADOS_PED = ["registrado", "en_produccion", "listo", "despacho", "entregado"];
  var NOMBRE_PED = { registrado: "Registrado", en_produccion: "En producción", listo: "Listo para despacho",
                     despacho: "En despacho", entregado: "Entregado" };
  var TONO_PED = { registrado: "off", en_produccion: "warn", listo: "ok", despacho: "info", entregado: "off" };

  var EXI_PANTALLA = "03-existencias.html";
  var validarAlEntrar = null;   // el pedido cuya ventana "Validar existencias" se abre al entrar (lo pone Nuevo pedido)
  var pedCambiados = [];        // los que se acaban de validar o de cambiar: su fila sale resaltada
  var facFiltro = null;         // la factura con que se abre Facturación ("Ver la factura")
  var val = null;               // la ventana "Validar existencias" abierta: { pedido, bodega, soloFalta, firma }

  /* ---- El avance de planta: lo publica Producción ----
     Producción escribe el avance de cada pedido en "sicaf_etapas_pedidos":
     { "PD-2026-088": { op, etapa, pct, ... } }. Comercial solo lo lee: no escribe
     ahí. Si no hay nada publicado, usa lo que muestra 05-produccion/mockup/05-etapas.html */
  var CLAVE_ETAPAS = "sicaf_etapas_pedidos";
  var AVANCE_EJEMPLO = {
    "PD-2026-088": { op: "OP-2026-054", etapa: "Montaje", pct: 75 },
    "PD-2026-089": { op: "OP-2026-055", etapa: "Guarnición", pct: 50 },
    "PD-2026-091": { op: "OP-2026-056", etapa: "Corte", pct: 25 }
  };

  /* El avance de un pedido, o null si todavía no tiene orden de Producción. Una entrada
     sin "pct" es de las viejas que escribía Comercial: no se tiene en cuenta */
  function avanceDe(p) {
    var publicado = {};
    try {
      publicado = JSON.parse(localStorage.getItem(CLAVE_ETAPAS) || "{}") || {};
    } catch (e) {
      publicado = {};   // sin almacenamiento, o con algo que no se puede leer: queda el de ejemplo
    }
    var a = publicado[p.codigo];
    if (a && a.op && typeof a.pct === "number") return a;
    return AVANCE_EJEMPLO[p.codigo] || null;
  }
  /* "Montaje 75 %" y "OP-2026-054 · Montaje 75 %" */
  function etapaDe(a) { return a ? a.etapa + " " + a.pct + " %" : "sin orden todavía"; }
  function textoAvance(a) { return a ? a.op + " · " + etapaDe(a) : "Esperando orden de Producción"; }

  /* ---- La lista ---- */

  TABLAS["dt-ped"] = {
    codigo: "Pedido", una: "pedido", plural: "pedidos", unaOVarias: "pedido(s)", masculino: true,
    codigoDe: function (tr) { return tr.getAttribute("data-ped"); },
    orden: ["estado", 1],   // por estado, en el orden en que los vive un pedido; si empatan, el más nuevo arriba
    estados: ESTADOS_PED, nombres: NOMBRE_PED,
    nombreFiltro: {
      codigo: "Pedido", factura: "Factura", cliente: "Cliente", modelo: "Modelo", bodega: "Bodega", estado: "Estado",
      entregaDesde: "Entrega desde", entregaHasta: "Entrega hasta", valorMin: "Valor desde", valorMax: "Valor hasta"
    },
    filtros: {
      codigo: contiene("Pedido"),
      factura: contiene("Factura"),
      cliente: contiene("Cliente"),
      modelo: function (tr, v) { return tr.getAttribute("data-refs").split(" ").indexOf(v) >= 0; },
      bodega: function (tr, v) { return tr.getAttribute("data-bodega") === v; },
      entregaDesde: function (tr, v) { return tr.getAttribute("data-entrega") >= v; },
      entregaHasta: function (tr, v) { return tr.getAttribute("data-entrega") <= v; }
    },
    // Cómo se lee cada filtro en su ficha: el modelo por su nombre y las fechas cortas
    textos: {
      modelo: function (v) { return productoPor(v) ? productoPor(v).nombre : v; },
      entregaDesde: function (v) { return fechaCorta(fechaDe(v)); },
      entregaHasta: function (v) { return fechaCorta(fechaDe(v)); }
    },
    claves: {
      entrega: function (tr) { return tr.getAttribute("data-entrega"); },
      faltan: function (tr) { return numero(tr.getAttribute("data-faltan")); }
    },
    mayorPrimero: ["faltan"],
    columnas: { factura: "Factura", cliente: "Cliente", productos: "Productos" },
    buscar: function (tr) { return tr.textContent + " " + celda(tr, "Cliente").title + " " + tr.getAttribute("data-refs"); },
    contar: contarPedidos,
    totales: totalesPedidos,
    alEntrar: entrarAPedidos
  };

  /* Las tarjetas cuentan TODOS los pedidos, no solo los filtrados */
  function contarPedidos(filas) {
    function de(estado) { return filas.filter(function (tr) { return tr.getAttribute("data-estado") === estado; }); }
    function suma(lista, dato) { return lista.reduce(function (s, tr) { return s + numero(tr.getAttribute("data-" + dato)); }, 0); }
    var enProduccion = de("en_produccion"), listos = de("listo").length, registrados = de("registrado").length;
    ponerKpi("todas", filas.length, miles(suma(filas, "pares")) + " pares · " + pesos(suma(filas, "valor")));
    ponerKpi("en_produccion", enProduccion.length, "faltan " + cuantas(suma(enProduccion, "faltan"), "par", "pares"));
    ponerKpi("listo", listos, listos === 1 ? "espera a Logística" : "esperan a Logística");
    ponerKpi("despacho", de("despacho").length, cuantas(de("entregado").length, "entregado", "entregados"));
    // La ficha "1 sin validar" de la barra: solo si hay alguno Registrado
    var ficha = uno("#dt-ped-sinval");
    ficha.hidden = !registrados;
    uno("b", ficha).textContent = registrados;
    ponerEnMenu(PED_LISTA, porAtender());
  }

  /* Los totales de lo que deja ver el filtro: pedidos, pares y lo que falta (el valor lo pone pintarLista) */
  function totalesPedidos(filas, dt) {
    function suma(dato) { return filas.reduce(function (s, tr) { return s + numero(tr.getAttribute("data-" + dato)); }, 0); }
    uno('[data-tot="pedidos"]', dt).textContent = miles(filas.length);
    uno('[data-tot="pares"]', dt).textContent = miles(suma("pares"));
    uno('[data-tot="faltan"]', dt).textContent = miles(suma("faltan"));
  }

  /* Lo que le falta a un pedido. El Registrado todavía no se validó: no se cuenta */
  function faltanPedido(p) { return p.estado === "registrado" ? 0 : faltanDe(p); }
  function atrasado(p) { return p.estado !== "entregado" && diasHasta(fechaDe(p.entrega)) < 0; }

  /* La fila de un pedido. La primera celda es un botón: así se abre su detalle con el teclado */
  function filaPedido(p) {
    var q = cotizacionDe(p.cot), c = q.cliente, t = totales(q), refs = refsEnCotizacion(p);
    var clases = [pedCambiados.indexOf(p.codigo) >= 0 ? "es-nueva" : "", atrasado(p) ? "dt__tarde" : ""].filter(Boolean).join(" ");
    return "<tr" + (clases ? ' class="' + clases + '"' : "") + ' data-ped="' + p.codigo + '" data-estado="' + p.estado +
      '" data-fecha="' + p.fecha + '" data-entrega="' + p.entrega + '" data-valor="' + t.total + '" data-pares="' + t.pares +
      '" data-faltan="' + faltanPedido(p) + '" data-refs="' + refs.join(" ") + '" data-bodega="' + p.bodega + '">' +
      '<td data-l="Pedido"><button class="dt__ver" type="button" title="Ver el detalle de ' + p.codigo + '">' + p.codigo + "</button>" +
        '<span class="tiny">' + fechaCorta(fechaDe(p.fecha)) + "</span></td>" +
      '<td data-l="Factura"><b>' + p.factura + '</b><span class="tiny">' + p.cot + "</span></td>" +
      '<td class="dt__cli" data-l="Cliente" title="' + esc(c.nombre + " · " + idDe(c)) + '"><span>' + esc(c.nombre) + "</span>" +
        '<span class="tiny">' + esc(c.ciudad) + "</span></td>" +
      '<td class="ped-prod" data-l="Productos" title="' + esc(nombresDe(refs)) + '"><span>' + esc(productoPor(refs[0]).nombre) + "</span>" +
        '<span class="tiny">' + cuantas(t.pares, "par", "pares") +
        (refs.length > 1 ? " · +" + cuantas(refs.length - 1, "modelo", "modelos") : "") + "</span></td>" +
      '<td data-l="En bodega">' + enBodegaHtml(p) + "</td>" +
      '<td class="dt__fec" data-l="Entrega">' + fechaCorta(fechaDe(p.entrega)) + '<span class="tiny">' + cuandoEntrega(p) + "</span></td>" +
      '<td class="ped-estado" data-l="Estado"><span class="pill pill--' + TONO_PED[p.estado] + '">' + NOMBRE_PED[p.estado] + "</span>" +
        '<span class="tiny">' + esc(lineaEstado(p)) + "</span></td>" +
      '<td class="num" data-l="Valor">' + pesos(t.total) + "</td></tr>";
  }

  /* Los modelos de un pedido por su nombre: "Bota Andina y Mocasín Cúcuta" */
  function nombresDe(refs) { return enLista(refs.map(function (ref) { return productoPor(ref).nombre; })); }

  /* Lo que tiene apartado en su bodega: la barra con "24 de 84", o "Completo" */
  function enBodegaHtml(p) {
    if (p.estado === "registrado") return '<span class="dt__sinf">Sin validar</span><span class="tiny">' + p.bodega + "</span>";
    if (p.estado === "despacho" || p.estado === "entregado") {
      return '<span class="dt__sinf">Ya salió</span><span class="tiny">de ' + p.bodega + "</span>";
    }
    var hay = apartadoDe(p), pares = hay + faltanDe(p), completo = hay === pares;
    return '<span class="ped-bar"><span class="bar' + (completo ? " bar--ok" : "") + '"><i style="width:' +
      Math.round(100 * hay / pares) + '%"></i></span><b>' + (completo ? "Completo" : hay + " de " + pares) + "</b></span>" +
      '<span class="tiny">' + (completo ? "Sale de " : "") + p.bodega + "</span>";
  }

  /* "en 9 días", "mañana", "hoy" o, si ya pasó, "atrasado 2 días". El entregado dice si llegó a tiempo */
  function cuandoEntrega(p) {
    if (p.estado === "entregado") {
      var tarde = Math.round((fechaDe(p.entregadoEl) - fechaDe(p.entrega)) / 86400000);
      return tarde > 0 ? cuantas(tarde, "día", "días") + " tarde" : "a tiempo";
    }
    var d = diasHasta(fechaDe(p.entrega));
    if (d < 0) return '<span class="dt__flag dt__flag--solo">atrasado ' + cuantas(-d, "día", "días") + "</span>";
    return d === 0 ? "hoy" : d === 1 ? "mañana" : "en " + d + " días";
  }

  /* La línea de debajo del estado: el avance de planta, a quién espera o cuándo se entregó */
  function lineaEstado(p) {
    if (p.estado === "registrado") return "sin validar";
    if (p.estado === "en_produccion") return textoAvance(avanceDe(p));
    if (p.estado === "listo") return "Esperando a Logística";
    if (p.estado === "despacho") return p.despacho + " · en tránsito";
    return "el " + fechaCorta(fechaDe(p.entregadoEl));
  }

  /* Cada vez que se entra, las filas salen de PEDIDOS. Si hay uno recién validado (o
     recién registrado), la vista vuelve a empezar, sin filtros, para que se vea */
  function entrarAPedidos(dt, cuerpo) {
    todos("tr[data-estado]", cuerpo).forEach(function (tr) { cuerpo.removeChild(tr); });
    cuerpo.insertAdjacentHTML("afterbegin", PEDIDOS.map(filaPedido).join(""));
    var hubo = pedCambiados.length > 0 || !!validarAlEntrar;
    pedCambiados = [];
    return hubo;
  }

  function iniciarPedidos() {
    iniciarTabla("dt-ped");
    uno("#ped-hora").textContent = horaDe(saldoLeido);
    var n = facturasSinPedido().length;
    uno("#ped-sinpedido").textContent = n ? cuantas(n, "factura sin pedido", "facturas sin pedido") : "todas tienen pedido";
    if (pedFiltro) {   // "Ver los pedidos que esperan este modelo" (Existencias)
      ponerFiltros("dt-ped", { modelo: pedFiltro.ref, estado: pedFiltro.estado });
      pedFiltro = null;
    }
    var abrir = pedAbrir && uno('#dt-ped tr[data-ped="' + pedAbrir + '"]');
    pedAbrir = null;
    if (abrir) abrirDetalle(abrir);   // un pedido que espera un modelo (Existencias)
    if (validarAlEntrar) {            // recién registrado en Nuevo pedido: se validan sus existencias
      var codigo = validarAlEntrar;
      validarAlEntrar = null;
      abrirValidar(codigo);
    }
  }

  /* "Volver a leer el saldo": como en Existencias, Inventario recibe el siguiente lote
     de ENTRADAS_EJEMPLO y los pedidos se vuelven a validar. Los que cambiaron se resaltan */
  function leerSaldoPedidos() {
    var r = aplicarEntrada();
    avisoEntrada(r);
    if (r) {
      var c = r.cambios;
      pedCambiados = c.listos.concat(c.vuelven).concat(c.recibieron.map(function (x) { return x.pedido; }))
                             .map(function (p) { return p.codigo; });
    }
    iniciarPedidos();
  }

  /* ---------------------------------------------------------------- 06. Entregas

     06-entregas.html. Misma tabla de datos que Cotizaciones y Facturación: las
     tarjetas filtran por el estado del paquete, el buscador, la caja de filtros,
     el orden por columna, los totales y las páginas. Cada fila trae el estado
     que publica Logística: sin despachar (En producción o Listo para despacho),
     Despachado (en ruta) o Entregado. Comercial no mueve despachos (RN-COM-17):
     aquí solo se consultan. */

  var ENT_LISTA = "06-entregas.html";
  var ESTADOS_ENT = ["en_produccion", "listo", "despacho", "entregado"];

  TABLAS["dt-ent"] = {
    codigo: "Pedido", una: "pedido", plural: "pedidos", unaOVarias: "pedido(s)", masculino: true,
    orden: ["estado", 1],   // por estado, en el orden del pipeline; si empatan, el más nuevo arriba
    estados: ESTADOS_ENT, nombres: NOMBRE_PED,
    nombreFiltro: {
      codigo: "Pedido", cliente: "Cliente", estado: "Estado del paquete",
      desde: "Entrega desde", hasta: "Entrega hasta"
    },
    filtros: {
      codigo: contiene("Pedido"),
      cliente: contiene("Cliente")
    },
    textos: {
      estado: function (v) {
        return { en_produccion: "En producción · sin despachar", listo: "Listo para despacho · sin despachar",
                 despacho: "Despachado · en ruta", entregado: "Entregado" }[v] || v;
      }
    },
    claves: { entrega: function (tr) { return tr.getAttribute("data-fecha"); } },
    columnas: { cliente: "Cliente", factura: "Factura", despacho: "Despacho", entrega: "Entrega" },
    buscar: function (tr) { return tr.textContent + " " + celda(tr, "Cliente").title; },
    contar: contarEntregas,
    totales: totalesEntregas,
    alEntrar: function () { return false; }   // el estado lo publica Logística: las filas vienen en el HTML
  };

  /* Las tarjetas cuentan TODOS los pedidos, no solo los filtrados */
  function contarEntregas(filas) {
    function de(estado) { return filas.filter(function (tr) { return tr.getAttribute("data-estado") === estado; }); }
    function sumaPares(lista) { return lista.reduce(function (s, tr) { return s + numero(tr.getAttribute("data-pares")); }, 0); }
    var valor = filas.reduce(function (s, tr) { return s + valorDe(tr); }, 0);
    var enProduccion = de("en_produccion"), listos = de("listo"), enRuta = de("despacho"), entregados = de("entregado");
    ponerKpi("todas", filas.length, miles(sumaPares(filas)) + " pares · " + pesos(valor));
    ponerKpi("en_produccion", enProduccion.length, enProduccion.length ? "aún no se despachan" : "todos despachados");
    ponerKpi("despacho", enRuta.length, enRuta.length ? "en ruta" : "ninguno en ruta");
    ponerKpi("entregado", entregados.length, entregados.length ? "llegaron a tiempo" : "ninguno todavía");
    // La pestaña del menú: lo que Logística tiene entre manos (en ruta o esperando salir)
    ponerEnMenu(ENT_LISTA, listos.length + enRuta.length);
  }

  /* Los totales de lo que deja ver el filtro: pares, lo que ya salió de bodega y lo que falta por despachar */
  function totalesEntregas(filas, dt) {
    function sumaPares(estado) {
      return filas.reduce(function (s, tr) {
        return s + (!estado || tr.getAttribute("data-estado") === estado ? numero(tr.getAttribute("data-pares")) : 0);
      }, 0);
    }
    uno('[data-tot="pares"]', dt).textContent = miles(sumaPares());
    uno('[data-tot="despachados"]', dt).textContent = miles(sumaPares("despacho") + sumaPares("entregado"));
    uno('[data-tot="pendientes"]', dt).textContent = miles(sumaPares("en_produccion") + sumaPares("listo"));
  }

  /* ---------------------------------------------------------------- 07. Reportes

     07-reportes.html. Las tarjetas de arriba son los totalizados del tablero. Debajo,
     la misma tabla de datos de Cotizaciones y Facturación con los reportes generados.
     "Generar reporte" abre la ventana del nuevo reporte: tipo, periodo y formato, con
     su vista previa que se actualiza sola; al guardar se descarga el archivo (un CSV
     con las filas del periodo) y el reporte queda en la tabla. Un clic en un reporte
     abre su detalle a la derecha, con el botón para descargarlo de nuevo. */

  var repNuevas = [];   // los que se acaban de generar y todavía no están en la tabla

  /* Las filas de muestra de cada tipo de reporte: alimentan la vista previa y la descarga */
  var PREVIAS = {
    "Ventas por cliente y referencia": {
      cols: ["Cliente", "Pares", "Venta"],
      filas: [["Comercial Los Andes", "248", "$15.900.000"], ["Distribuidora Tamanaco", "212", "$14.380.000"],
              ["Calzado Norte", "186", "$12.640.000"]]
    },
    "Ventas por vendedor": {
      cols: ["Vendedor", "Cotizó", "Facturó", "Cierre"],
      filas: [["Andrés Quintero", "5", "4", "80 %"], ["Valentina Rojas", "8", "4", "50 %"],
              ["Marcela Duarte", "5", "0", "0 %"]]
    },
    "Cartera y cupos de crédito": {
      cols: ["Cliente", "Por cobrar", "Vencido", "Total"],
      filas: [["Comercial Los Andes", "$4.305.600", "$5.400.000", "$9.705.600"],
              ["Distribuidora Tamanaco", "$3.795.338", "$2.150.000", "$5.945.338"],
              ["Calzado El Dorado", "$4.646.355", "$0", "$4.646.355"]]
    },
    "Cotizaciones y tasa de cierre": {
      cols: ["Estado", "Cotizaciones", "Del total", "Valor"],
      filas: [["Facturadas", "8", "44 %", "$29.863.357"], ["Por facturar", "6", "33 %", "$16.071.671"],
              ["Vencidas", "3", "17 %", "$4.978.000"]]
    },
    "Estado de despachos y entregas": {
      cols: ["Pedido", "Cliente", "Entrega", "Estado del paquete"],
      filas: [["PD-2026-091", "Calzado Norte", "14-oct-2026", "En producción"],
              ["PD-2026-087", "Comercial Los Andes", "01-oct-2026", "Despachado · en ruta"],
              ["PD-2026-086", "Almacén La Bota Fina", "20-ago-2026", "Entregado"]]
    },
    "Devoluciones por motivo": {
      cols: ["Motivo", "Casos", "Pares", "Participación"],
      filas: [["Defecto de fabricación", "2", "12", "52 %"], ["Talla equivocada", "1", "6", "26 %"],
              ["Sobrante del pedido", "1", "3", "13 %"]]
    },
    "Pedidos pendientes de despacho": {
      cols: ["Pedido", "Cliente", "Entrega prometida", "Estado"],
      filas: [["PD-2026-088", "Distribuidora Tamanaco", "01-oct-2026", "En producción"],
              ["PD-2026-089", "Calzado El Dorado", "06-oct-2026", "En producción"],
              ["PD-2026-091", "Calzado Norte", "14-oct-2026", "En producción"]]
    }
  };

  function previaDe(tipo) { return PREVIAS[tipo] || PREVIAS["Ventas por cliente y referencia"]; }

  /* La muestra como tabla */
  function previaHtml(p) {
    return "<thead><tr>" + p.cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      p.filas.map(function (f) {
        return "<tr>" + f.map(function (celda, i) {
          return i === 0 ? '<td data-l="' + esc(p.cols[0]) + '"><b>' + esc(celda) + "</b></td>"
                         : '<td class="num" data-l="' + esc(p.cols[i]) + '">' + esc(celda) + "</td>";
        }).join("") + "</tr>";
      }).join("") + "</tbody>";
  }

  /* La descarga: un CSV con las filas del periodo */
  function descargarReporte(r) {
    var p = previaDe(r.tipo);
    var lineas = ["SICAF - Comercial y Ventas",
      "Reporte: " + r.tipo,
      "Periodo: " + r.desde + " a " + r.hasta,
      "Generado: " + r.fecha + " por Valentina Rojas (VEN-03)", ""]
      .concat([p.cols.join(";")], p.filas.map(function (f) { return f.join(";"); }));
    var blob = new Blob(["﻿" + lineas.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = r.codigo + "-" + sinTildes(r.tipo).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.parentNode.removeChild(a); }, 500);
  }

  TABLAS["dt-rep"] = {
    codigo: "Nº", una: "reporte", plural: "reportes", unaOVarias: "reporte(s)", masculino: true,
    estados: ["generado"], nombres: { generado: "Generado" },
    nombreFiltro: { codigo: "Nº", tipo: "Tipo", formato: "Formato", desde: "Generado desde", hasta: "Generado hasta" },
    filtros: {
      codigo: contiene("Nº"),
      tipo: function (tr, v) { return tr.getAttribute("data-tipo") === v; },
      formato: function (tr, v) { return tr.getAttribute("data-formato") === v; }
    },
    textos: {},
    claves: {},
    columnas: { tipo: "Reporte", periodo: "Periodo", formato: "Formato" },
    buscar: function (tr) { return tr.textContent; },
    contar: function () {},   // las tarjetas de arriba son los totalizados del tablero: no se tocan
    totales: totalesReportes,
    alEntrar: entrarAReportes
  };

  /* Los totales de lo filtrado: cuántos reportes y de cada formato */
  function totalesReportes(filas, dt) {
    function de(f) { return filas.filter(function (tr) { return tr.getAttribute("data-formato") === f; }).length; }
    uno('[data-tot="reportes"]', dt).textContent = miles(filas.length);
    uno('[data-tot="pdf"]', dt).textContent = de("PDF");
    uno('[data-tot="excel"]', dt).textContent = de("Excel");
    uno('[data-tot="csv"]', dt).textContent = de("CSV");
  }

  /* La fila de un reporte recién generado, igual a las que trae el HTML */
  function filaReporte(r) {
    var color = { "PDF": "vino", "Excel": "oliva", "CSV": "cobre" }[r.formato] || "vino";
    return '<tr class="es-nueva" data-estado="generado" data-fecha="' + r.fecha + '" data-tipo="' + esc(r.tipo) +
      '" data-desde="' + r.desde + '" data-hasta="' + r.hasta + '" data-formato="' + r.formato + '">' +
      '<td data-l="Nº"><button class="dt__ver" type="button" title="Ver el detalle">' + r.codigo + "</button></td>" +
      '<td class="dt__cli" data-l="Reporte">' + esc(r.tipo) + "</td>" +
      '<td class="tiny" data-l="Periodo">' + r.desde + " a " + r.hasta + "</td>" +
      '<td class="dt__fec" data-l="Fecha">' + fechaCorta(fechaDe(r.fecha)) + "</td>" +
      '<td data-l="Formato"><span class="chip chip--' + color + '">' + r.formato + "</span></td></tr>";
  }

  function entrarAReportes(dt, cuerpo) {
    var hubo = repNuevas.length > 0;
    if (hubo) {
      todos("tr.es-nueva", cuerpo).forEach(function (tr) { tr.classList.remove("es-nueva"); });
      while (repNuevas.length) cuerpo.insertAdjacentHTML("afterbegin", filaReporte(repNuevas.shift()));
    }
    return hubo;
  }

  /* ---- La ventana del nuevo reporte ---- */

  function pintarPreviaNueva() {
    uno("#rep-nv-previa").innerHTML = previaHtml(previaDe(uno("#rep-nv-tipo").value));
    uno("#rep-nv-nota").textContent = "Primeras filas del " + uno("#rep-nv-desde").value + " al " +
      uno("#rep-nv-hasta").value + ". El archivo completo trae todo el periodo.";
  }
  function abrirNuevoReporte() {
    pintarPreviaNueva();
    uno("#rep-nuevo").hidden = false;
    uno(".modal", uno("#rep-nuevo")).focus();
  }
  function cerrarNuevoReporte() { uno("#rep-nuevo").hidden = true; }

  function guardarReporte() {
    var tipo = uno("#rep-nv-tipo").value, desde = uno("#rep-nv-desde").value,
        hasta = uno("#rep-nv-hasta").value, formato = uno("#rep-nv-formato").value;
    if (!desde || !hasta || hasta < desde) {
      return aviso("Revise el periodo: la fecha Hasta no puede ser anterior a Desde.", "warn");
    }
    var codigos = todos('tbody tr[data-estado] td[data-l="Nº"]', uno("#dt-rep")).map(function (td) { return numero(cola(td.textContent)); });
    var codigo = "RC-" + ("0000" + (Math.max.apply(null, codigos.concat([0])) + 1)).slice(-4);
    var r = { codigo: codigo, tipo: tipo, desde: desde, hasta: hasta, formato: formato, fecha: hoy() };
    repNuevas.push(r);
    cerrarNuevoReporte();
    iniciarTabla("dt-rep");
    descargarReporte(r);
    aviso("Reporte " + codigo + " generado: se descargó y quedó en la tabla.", "ok");
  }

  document.addEventListener("change", function (e) {
    if (e.target.closest && e.target.closest("#rep-nuevo")) pintarPreviaNueva();
  });
  document.addEventListener("click", function (e) {
    if (e.target === uno("#rep-nuevo")) cerrarNuevoReporte();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && uno("#rep-nuevo") && !uno("#rep-nuevo").hidden) cerrarNuevoReporte();
  });

  /* ---- El detalle de un reporte (el panel de la derecha) ---- */

  DETALLES["dt-rep"] = { panel: "rep-det", pintar: pintarDetalleReporte };

  function pintarDetalleReporte(tr) {
    var tipo = tr.getAttribute("data-tipo"), desde = tr.getAttribute("data-desde"), hasta = tr.getAttribute("data-hasta");
    uno("#rep-det-t").textContent = "Reporte " + textoDe(tr, "Nº");
    uno("#rep-det-sub").textContent = tipo + " · " + desde + " a " + hasta;
    uno("#rep-det-datos").innerHTML =
      kv("Tipo", esc(tipo)) + kv("Periodo", desde + " a " + hasta) +
      kv("Generado el", fechaLarga(fechaDe(tr.getAttribute("data-fecha")))) +
      kv("Formato", tr.getAttribute("data-formato")) + kv("Generado por", "Valentina Rojas · VEN-03");
    uno("#rep-det-previa").innerHTML = previaHtml(previaDe(tipo));
  }

  /* El botón del pie del detalle: baja el archivo otra vez */
  function reDescargarReporte() {
    var tr = detalleDesde;
    if (!tr) return;
    descargarReporte({ codigo: textoDe(tr, "Nº"), tipo: tr.getAttribute("data-tipo"), desde: tr.getAttribute("data-desde"),
                       hasta: tr.getAttribute("data-hasta"), fecha: tr.getAttribute("data-fecha") });
    aviso("Reporte " + textoDe(tr, "Nº") + " descargado de nuevo.", "ok");
  }

  /* ---- El detalle de un pedido (el panel de la derecha) ---- */

  DETALLES["dt-ped"] = { panel: "ped-det", pintar: function (tr) { pintarDetallePedido(pedidoPor(tr.getAttribute("data-ped"))); } };

  /* El detalle de una entrega (06-entregas.html): el mismo panel que el del pedido,
     con el ojo en el despacho: el estado del paquete, el recorrido y, si ya salió,
     la guía y las fechas de salida y de entrega. */
  DETALLES["dt-ent"] = { panel: "ent-det", pintar: function (tr) { pintarDetalleEntrega(pedidoPor(textoDe(tr, "Pedido"))); } };

  function pintarDetalleEntrega(p) {
    var q = cotizacionDe(p.cot), c = q.cliente, t = totales(q), refs = refsEnCotizacion(p);
    var salio = p.estado === "despacho" || p.estado === "entregado";
    uno("#ent-det-t").textContent = "Entrega del pedido " + p.codigo;
    uno("#ent-det-sub").textContent = c.nombre + " · " + cuantas(t.pares, "par", "pares") + " · " + pesos(t.total);
    var estado = uno("#ent-det-estado");
    estado.className = "cot-det__estado cot-det__estado--" + tonoDetalle(p);
    estado.innerHTML = '<div class="cot-det__estado-cab"><span class="pill pill--' + TONO_PED[p.estado] + '">' + NOMBRE_PED[p.estado] +
      "</span><p>" + textoPedido(p) + "</p></div>" + recorridoPedidoHtml(p, q) + novedadHtml(p);
    uno("#ent-det-ficha").innerHTML = datosPedidoHtml(p, q) +
      (salio ? seccion("Despacho", kv("Guía", esc(p.despacho || "—")) +
        kv("Salió de la bodega", p.despachoEl ? fechaLarga(fechaDe(p.despachoEl)) : "—") +
        kv("Entregado el", p.entregadoEl ? fechaLarga(fechaDe(p.entregadoEl)) : "aún no llega")) : "");
    uno("#ent-det-avisos").innerHTML = vencidasPedidoHtml(p, c);
    uno("#ent-det-prod-sub").textContent = cuantas(refs.length, "modelo", "modelos") + " · " + cuantas(t.pares, "par", "pares");
    uno("#ent-det-lineas").innerHTML = refs.map(function (ref) { return itemPedidoHtml(p, ref, q); }).join("");
    uno("#ent-det-pie").innerHTML = piePedidoHtml(p, t);
  }

  /* El recorrido: un paso por caja del diagrama, con su fecha */
  var PASOS_PED = ["Facturado", "Pedido registrado", "Existencias validadas", "En producción", "Listo para despacho",
                   "En despacho", "Entregado"];
  var PASO_DE = { registrado: 1, en_produccion: 3, listo: 4, despacho: 5, entregado: 6 };   // en qué paso va cada estado

  function pintarDetallePedido(p) {
    var q = cotizacionDe(p.cot), c = q.cliente, t = totales(q), refs = refsEnCotizacion(p);
    uno("#ped-det").setAttribute("data-ped", p.codigo);   // de quién es: los íconos de la cabecera lo leen de aquí
    uno("#ped-det-t").textContent = "Pedido " + p.codigo;
    uno("#ped-det-sub").textContent = c.nombre + " · " + cuantas(t.pares, "par", "pares") + " · " + pesos(t.total);
    uno('#ped-det [data-pd="validar"]').hidden = p.estado !== "registrado";
    var estado = uno("#ped-det-estado");
    estado.className = "cot-det__estado cot-det__estado--" + tonoDetalle(p);
    estado.innerHTML = '<div class="cot-det__estado-cab"><span class="pill pill--' + TONO_PED[p.estado] + '">' + NOMBRE_PED[p.estado] +
      "</span><p>" + textoPedido(p) + "</p></div>" + recorridoPedidoHtml(p, q) + novedadHtml(p);
    uno("#ped-det-ficha").innerHTML = datosPedidoHtml(p, q);
    uno("#ped-det-avisos").innerHTML = vencidasPedidoHtml(p, c);
    uno("#ped-det-prod-sub").textContent = cuantas(refs.length, "modelo", "modelos") + " · " + cuantas(t.pares, "par", "pares");
    uno("#ped-det-lineas").innerHTML = refs.map(function (ref) { return itemPedidoHtml(p, ref, q); }).join("");
    uno("#ped-det-pie").innerHTML = piePedidoHtml(p, t);
  }

  /* El borde del estado, del color de su píldora. El que perdió pares apartados, en rojo */
  function tonoDetalle(p) {
    if (p.estado === "en_produccion" && p.novedad === "perdio") return "crit";
    return { registrado: "off", en_produccion: "warn", listo: "ok", despacho: "info", entregado: "ok" }[p.estado];
  }

  /* Qué pasa con el pedido y qué sigue, dicho con palabras */
  function textoPedido(p) {
    var hay = apartadoDe(p), falta = faltanDe(p), bodega = sinPartir(p.bodega);
    var entrega = sinPartir(fechaLarga(fechaDe(p.entrega)));
    if (p.estado === "registrado") {
      return "<b>Se registró el " + sinPartir(fechaLarga(fechaDe(p.fecha))) + " y todavía no se validan sus existencias.</b> " +
             "No aparta pares. Valídelas: si en la bodega está todo, va a Logística; si falta algo, Producción fabrica lo que falta.";
    }
    if (p.estado === "en_produccion") {
      var a = avanceDe(p);
      return "<b>" + (falta === 1 ? "Falta 1 par" : "Faltan " + miles(falta) + " pares") + " en " + bodega + ".</b> " +
        (a ? "Producción los hace en " + sinPartir(esc(a.op)) + " (" + esc(a.etapa) + ")."
           : "Todavía no tiene orden de Producción: lo que falta ya está publicado para que la hagan.") +
        (hay ? " Los otros " + miles(hay) + " ya están apartados." : "") +
        " Cuando Inventario los reciba, el pedido pasa solo a Listo para despacho.";
    }
    if (p.estado === "listo") {
      return "<b>Está completo en " + bodega + ": sus " + cuantas(hay, "par está apartado", "pares están apartados") + ".</b> " +
             "Logística ya lo ve para programar el despacho. La entrega es el " + entrega + ".";
    }
    if (p.estado === "despacho") {
      return "<b>Salió de " + bodega + " con " + sinPartir(p.despacho) + " y va en tránsito.</b> Se entrega a más tardar el " +
             entrega + ". El despacho lo lleva Logística; Comercial solo lo muestra.";
    }
    var tarde = Math.round((fechaDe(p.entregadoEl) - fechaDe(p.entrega)) / 86400000);
    return "<b>Se entregó el " + sinPartir(fechaLarga(fechaDe(p.entregadoEl))) + (tarde > 0 ? ", " + cuantas(tarde, "día", "días") +
           " después de lo prometido." : ", a tiempo.") + "</b> Aquí termina el recorrido. Una devolución se sigue en Entregas.";
  }

  /* "11-sep": la fecha sin el año, para que quepan los siete pasos */
  function diaYMes(d) { return dos(d.getDate()) + "-" + MESES[d.getMonth()].slice(0, 3); }

  /* El recorrido con la fecha de cada paso. "En producción" dice además la etapa que publica
     Producción; si el pedido tenía todo en bodega, dice que no hizo falta */
  function recorridoPedidoHtml(p, q) {
    var ahora = PASO_DE[p.estado], fin = p.estado === "entregado";
    var fechas = [sumarDias(q.fecha, q.pasos.facturada || 0), fechaDe(p.fecha), fechaDe(p.validadoEl), fechaDe(p.produccionEl),
                  fechaDe(p.listoEl), fechaDe(p.despachoEl), fechaDe(p.entregadoEl)];
    return '<ol class="cot-rec ped-rec" aria-label="Recorrido del pedido">' + PASOS_PED.map(function (nombre, i) {
      var salto = i === 3 && i < ahora && !p.produccionEl;
      var hecho = i < ahora || fin;
      var clase = salto ? "is-salto" : hecho ? "is-hecho" + (fin && i === ahora ? " is-fin" : "") : i === ahora ? "is-ahora" : "";
      var marca = salto ? "–" : hecho ? "✓" : i + 1;
      var dato = salto ? "no hizo falta" : i > ahora ? "pendiente" : fechas[i] ? diaYMes(fechas[i]) : "—";
      var etapa = i === 3 && i === ahora ? '<small class="ped-rec__etapa">' + esc(etapaDe(avanceDe(p))) + "</small>" : "";
      return '<li class="cot-rec__p' + (clase ? " " + clase : "") + '"' + (i === ahora ? ' aria-current="step"' : "") + ">" +
        '<span class="cot-rec__n" aria-hidden="true">' + marca + "</span><b>" + nombre + "</b><small>" + dato + "</small>" + etapa + "</li>";
    }).join("") + "</ol>";
  }

  /* Lo que cambió solo (revalidar): quedó listo cuando entró lo que faltaba, o perdió pares apartados */
  function novedadHtml(p) {
    if (p.novedad === "perdio" && p.estado === "en_produccion") {
      return avisoHtml("crit", "Perdió pares apartados", "Inventario reportó menos pares de los que tenía apartados (una baja o un " +
                       "ajuste) y volvió a En producción. Revise con Inventario qué pasó.");
    }
    if (p.novedad === "listo" && p.estado === "listo") {
      return avisoHtml("ok", "Quedó listo el " + fechaCorta(fechaDe(p.listoEl)), "Entraron a " + p.bodega + " los pares que le faltaban.");
    }
    return "";
  }

  /* El cliente y de dónde salió el pedido, en dos columnas */
  function datosPedidoHtml(p, q) {
    var c = q.cliente, b = bodegaPor(p.bodega);
    return seccion("Cliente y entrega", '<b class="cot-det__cli">' + esc(c.nombre) + '</b><span class="tiny">' + esc(idDe(c)) + " · " +
          esc(c.ciudad) + "</span>" + kv("Contacto", esc(contactoDe(c))) + kv("Teléfono", esc(c.telefono)) +
          kv("Dirección", esc(c.direccion)) + (c.barrio ? kv("Barrio", esc(c.barrio)) : "")) +
      seccion("Origen", kv("Factura", p.factura) + kv("Cotización", p.cot) + kv("Vendedor", esc(q.vendedor)) +
          kv("Registrado", fechaLarga(fechaDe(p.fecha))) + kv("Entrega", fechaLarga(fechaDe(p.entrega))) +
          kv("Bodega", esc(b ? nombreBodega(b) : p.bodega)) + (q.obs ? kvLargo("Observación", esc(q.obs)) : ""));
  }

  /* RN-COM-18: con facturas vencidas el pedido sigue (la factura ya está hecha), pero se le avisa a cartera */
  function vencidasPedidoHtml(p, c) {
    if (!c.vencidas.length || p.estado === "entregado") return "";
    return avisoHtml("warn", esc(c.nombre) + " tiene " + enLista(c.vencidas.map(function (v) { return v.factura; })) +
                     (c.vencidas.length === 1 ? " vencida" : " vencidas"), "El pedido sigue: la factura ya está hecha. Avise a cartera para que la cobre.");
  }

  /* Un modelo del pedido, como en el carrito: sus tallas por color. En rojo las que no
     están completas ("38 ×14 · faltan 14"); el tooltip dice lo pedido y lo apartado */
  function itemPedidoHtml(p, ref, q) {
    var r = resumenDe(ref, q), prod = r.p, renglones = p.lineas.filter(function (l) { return l.ref === ref; });
    var suyos = renglones.map(function (l) { return l.color; }).filter(function (x, i, l) { return l.indexOf(x) === i; });
    return '<article class="cot-item">' + foto(prod, suyos[0], "sm") +
      '<div class="cot-item__x"><div class="cot-item__cab"><div><b>' + esc(prod.nombre) + '</b><span class="tiny">' + ref + " · " +
        cuantas(r.pares, "par", "pares") + " · " + estadoModelo(p, ref) + "</span></div>" +
        '<div class="cot-item__der"><b class="cot-item__total">' + pesos(r.total) + "</b></div></div>" +
      suyos.map(function (color) {
        return '<div class="cot-item__color"><i style="background:' + piel(color) + '"></i><span>' + esc(color) + "</span>" +
          '<span class="vit__chips">' + renglones.filter(function (l) { return l.color === color; })
            .map(function (l) { return tallaPedidoHtml(p, l); }).join("") + "</span></div>";
      }).join("") + "</div></article>";
  }

  function estadoModelo(p, ref) {
    if (p.estado === "registrado") return "sin validar";
    if (!aparta(p)) return "salió completo";
    var falta = faltanDe(p, ref);
    return falta ? miles(apartadoDe(p, ref)) + " apartados · faltan " + miles(falta) : "todo apartado";
  }

  /* Una talla del pedido. Verde si ya tiene sus pares apartados; roja si le falta */
  function tallaPedidoHtml(p, l) {
    var falta = l.cant - l.apartado, validado = aparta(p);
    var titulo = !validado ? "Pedido " + l.cant + (p.estado === "registrado" ? " · sin validar" : " · salió de la bodega")
                           : "Pedido " + l.cant + " · apartado " + l.apartado + (falta ? " · falta " + falta : "");
    var clase = !validado ? "" : falta ? ' class="is-mal"' : ' class="is-bien"';
    return "<span" + clase + ' title="' + titulo + '">' + l.talla + "<b>×" + l.cant + "</b>" + (validado && falta ? " · faltan " + falta : "") + "</span>";
  }

  /* El pie del detalle, siempre a la vista: pares, apartados, lo que falta y el valor */
  function piePedidoHtml(p, t) {
    var hay = apartadoDe(p), falta = faltanDe(p), medio;
    if (p.estado === "registrado") medio = "<span>Apartados <b>0</b></span><span>Faltan <b>sin validar</b></span>";
    else if (!aparta(p)) medio = "<span>Salieron de " + p.bodega + " <b>" + miles(hay) + "</b></span><span>Faltan <b>0</b></span>";
    else medio = "<span>Apartados <b>" + miles(hay) + "</b></span><span" + (falta ? ' class="is-mal"' : "") + ">Faltan <b>" + miles(falta) + "</b></span>";
    return "<span>Pares pedidos <b>" + miles(t.pares) + "</b></span>" + medio + '<span class="ped-det__valor">Valor <b>' + pesos(t.total) + "</b></span>";
  }

  /* "Copiar mensaje para el cliente": dónde va su pedido, sin emojis, para pegarlo en el correo o el chat */
  function mensajeCliente(p) {
    var q = cotizacionDe(p.cot), t = totales(q), entrega = fechaLarga(fechaDe(p.entrega));
    return "Hola, " + contactoDe(q.cliente).split(" · ")[0] + ". Le escribimos de Comercial por su pedido " + p.codigo +
           " (factura " + p.factura + "): " + cuantas(t.pares, "par", "pares") + " de " + nombresDe(refsEnCotizacion(p)) + ". " +
           estadoParaCliente(p, entrega) + " Cualquier inquietud, con gusto le atendemos. " + VENDEDOR.nombre + ", Comercial.";
  }

  /* Dónde va el pedido, dicho para el cliente */
  function estadoParaCliente(p, entrega) {
    var hay = apartadoDe(p), falta = faltanDe(p);
    if (p.estado === "registrado") return "Lo estamos alistando: apenas revisemos las existencias le confirmamos el despacho.";
    if (p.estado === "en_produccion") {
      return (hay ? "Ya tenemos apartados " + cuantas(hay, "par", "pares") + " y los otros " + miles(falta) + " se están fabricando."
                  : "Sus pares se están fabricando.") + " La entrega sigue programada para el " + entrega + ".";
    }
    if (p.estado === "listo") return "Ya está completo y listo para despacho. La entrega está programada para el " + entrega + ".";
    if (p.estado === "despacho") return "Ya salió de nuestra bodega con el despacho " + p.despacho + " y le llega a más tardar el " + entrega + ".";
    return "Se le entregó el " + fechaLarga(fechaDe(p.entregadoEl)) + ". Gracias por su compra.";
  }

  function copiarMensaje(p) {
    var texto = mensajeCliente(p), nombre = clienteDePedido(p).nombre;
    function noSePudo() { aviso("El navegador no dejó copiar. El mensaje es: " + texto, "warn"); }
    if (!navigator.clipboard) return noSePudo();
    navigator.clipboard.writeText(texto).then(function () {
      aviso("Mensaje copiado: péguelo en el correo o el chat de " + nombre + ".", "ok");
    }, noSePudo);
  }

  /* Los íconos: "Volver a leer el saldo" (arriba) y los de la cabecera del detalle */
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-pd]") : null;
    if (!b) return;
    var que = b.getAttribute("data-pd");
    if (que === "leer") return leerSaldoPedidos();
    if (que === "nuevo") {   // la pantalla donde se elige la factura (05-pedido-nuevo.html) todavía se está haciendo
      return aviso("Nuevo pedido está en construcción: ahí se elegirá la factura sin pedido y se validarán sus existencias.", "warn");
    }
    var p = pedidoPor(uno("#ped-det").getAttribute("data-ped"));
    if (que === "copiar") return copiarMensaje(p);
    cerrarDetalle();
    if (que === "validar") return abrirValidar(p.codigo);
    if (que === "existencias") {   // Existencias se abre en su primer modelo y en su bodega
      exiAbrir = { ref: p.lineas[0].ref, bodega: p.bodega };
      return ir(EXI_PANTALLA, true);
    }
    if (que === "factura") {       // Facturación se abre filtrada por su factura
      facFiltro = p.factura;
      return ir(FACTURAS, true);
    }
  });

  /* ---- La ventana "Validar existencias" (RN-COM-13 y RN-COM-14) ----
     Se abre sola después de registrar un pedido (Nuevo pedido) o con su ícono en el
     detalle de un pedido Registrado. Arriba se elige la bodega de despacho; cada talla
     sale en verde si en esa bodega alcanza y en rojo si falta. El botón principal
     cambia solo: "Enviar a Logística" si está todo, o "Enviar a Producción · N pares"
     si falta algo: se aparta lo que hay y Producción fabrica el resto.
     Lo elegido vive en "val" y la ventana se vuelve a dibujar desde él. */

  /* Lo que hay para el pedido en una bodega, renglón por renglón: lo que toma de lo libre
     y lo que falta. La "firma" sirve para saber si algo cambió antes de guardar */
  function validacion(p, bodega) {
    var r = { bodega: bodega, pedidos: 0, hay: 0, faltan: 0, renglones: [] };
    p.lineas.forEach(function (l) {
      var toma = Math.min(l.cant, libreEn(bodega, l.ref, l.color, l.talla));
      r.renglones.push({ l: l, toma: toma, falta: l.cant - toma });
      r.pedidos += l.cant;
      r.hay += toma;
      r.faltan += l.cant - toma;
    });
    r.firma = bodega + ":" + r.renglones.map(function (x) { return x.toma; }).join(",");
    return r;
  }

  function abrirValidar(codigo) {
    var p = pedidoPor(codigo);
    if (!p || p.estado !== "registrado") return;
    val = { pedido: codigo, bodega: p.bodega, soloFalta: false, firma: "" };
    pintarValidar();
    uno("#ped-validar").hidden = false;
    uno("#ped-validar .modal").focus();
  }

  /* Cerrar sin decidir: el pedido sigue Registrado y no aparta nada */
  function cerrarValidar() {
    var p = pedidoPor(val.pedido);
    uno("#ped-validar").hidden = true;
    val = null;
    aviso(p.codigo + " sigue Registrado, sin validar: no aparta nada. Valídelo desde su detalle.", "warn");
    var fila = uno('#dt-ped tr[data-ped="' + p.codigo + '"] .dt__ver');
    if (fila) fila.focus();
  }

  function pintarValidar() {
    var p = pedidoPor(val.pedido), r = validacion(p, val.bodega);
    val.firma = r.firma;
    uno("#ped-val-t").textContent = "Validar existencias · " + p.codigo;
    uno("#ped-val-sub").textContent = clienteDePedido(p).nombre + " · " + cuantas(r.pedidos, "par", "pares") + " · entrega " +
                                      fechaCorta(fechaDe(p.entrega));
    uno("#ped-val-bod").innerHTML = BODEGAS_PT.map(function (b) {
      var x = validacion(p, b.codigo);
      return opcion(b.codigo, esc(nombreBodega(b)) + " — alcanza " + miles(x.hay) + " de " + miles(x.pedidos), val.bodega);
    }).join("");
    uno("#ped-val-zona").textContent = bodegaPor(val.bodega).zona;
    uno("#ped-val-solo").checked = val.soloFalta;
    uno("#ped-val-lineas").innerHTML = renglonesValidarHtml(p, r);
    uno("#ped-val-res").innerHTML = resumenValidarHtml(p, r);
    var enviar = uno('[data-val="enviar"]');
    enviar.className = "btn " + (r.faltan ? "btn--cobre" : "btn--oliva");
    enviar.innerHTML = r.faltan ? icono("engranaje", 18) + "Enviar a Producción · " + cuantas(r.faltan, "par", "pares")
                                : icono("camion", 18) + "Enviar a Logística";
    uno("#ped-val-msg").textContent = !r.faltan ? "Hay todo en " + r.bodega + ": se aparta completo y Logística lo ve de una vez."
      : r.hay ? "Se apartan los " + miles(r.hay) + " que hay en " + r.bodega + " y Producción fabrica los " + miles(r.faltan) + " que faltan."
      : "En " + r.bodega + " no hay nada de este pedido: Producción fabrica sus " + cuantas(r.faltan, "par", "pares") + ".";
  }

  /* Por modelo y color, una ficha por talla: verde si alcanza, roja si falta */
  function renglonesValidarHtml(p, r) {
    var html = refsEnCotizacion(p).map(function (ref) {
      var prod = productoPor(ref), delModelo = r.renglones.filter(function (x) { return x.l.ref === ref; });
      var vistos = delModelo.filter(function (x) { return !val.soloFalta || x.falta > 0; });
      if (!vistos.length) return "";
      var pide = delModelo.reduce(function (s, x) { return s + x.l.cant; }, 0);
      var hay = delModelo.reduce(function (s, x) { return s + x.toma; }, 0);
      var suyos = vistos.map(function (x) { return x.l.color; }).filter(function (c, i, l) { return l.indexOf(c) === i; });
      return '<article class="cot-item">' + foto(prod, suyos[0], "sm") +
        '<div class="cot-item__x"><div class="cot-item__cab"><div><b>' + esc(prod.nombre) + '</b><span class="tiny">' + ref +
          " · hay " + miles(hay) + " de " + miles(pide) + " en " + r.bodega + "</span></div></div>" +
        suyos.map(function (color) {
          return '<div class="cot-item__color"><i style="background:' + piel(color) + '"></i><span>' + esc(color) + "</span>" +
            '<span class="vit__chips">' + vistos.filter(function (x) { return x.l.color === color; })
              .map(function (x) { return tallaValidarHtml(x, r.bodega); }).join("") + "</span></div>";
        }).join("") + "</div></article>";
    }).join("");
    return html || '<div class="cot-vacio">' + icono("visto", 30) + "<b>No falta nada en " + r.bodega + ".</b>" +
      "<p>Quite “Solo lo que falta” para ver todas las tallas del pedido.</p></div>";
  }

  /* Una talla: "38 ×8" en verde, o "37 ×9 · faltan 9" en rojo, con el tooltip de dónde sí hay */
  function tallaValidarHtml(x, bodega) {
    var l = x.l;
    if (!x.falta) {
      return '<span class="is-bien" title="En ' + bodega + " hay " + cuantas(libreEn(bodega, l.ref, l.color, l.talla), "libre", "libres") + '">' +
             l.talla + "<b>×" + l.cant + "</b></span>";
    }
    var otras = BODEGAS_PT.filter(function (b) { return b.codigo !== bodega; })
      .map(function (b) { return { codigo: b.codigo, n: libreEn(b.codigo, l.ref, l.color, l.talla) }; })
      .filter(function (o) { return o.n > 0; })
      .map(function (o) { return "en " + o.codigo + " hay " + cuantas(o.n, "libre", "libres"); });
    var titulo = (x.toma ? "Aquí hay " + x.toma + " de " + l.cant + ". " : "") +
                 (otras.length ? mayuscula(enLista(otras)) : "No hay en ninguna otra bodega: lo fabrica Producción");
    return '<span class="is-mal" title="' + titulo + '">' + l.talla + "<b>×" + l.cant + "</b> · faltan " + x.falta + "</span>";
  }

  /* El resumen: pedidos, lo que hay y lo que falta, y qué hacer si falta algo */
  function resumenValidarHtml(p, r) {
    return '<div class="exi-cifras ped-cifras">' +
      cifraHtml("Pedidos", r.pedidos, "pares del pedido", "") +
      cifraHtml("Hay", r.hay, "en " + r.bodega, "", "ok") +
      cifraHtml("Faltan", r.faltan, r.faltan ? "los fabrica Producción" : "no falta nada", "", r.faltan ? "crit" : "") + "</div>" +
      avisoValidarHtml(p, r);
  }

  /* Si en esta bodega no está todo: usar otra que lo tenga, pedir un traslado o que lo haga Producción */
  function avisoValidarHtml(p, r) {
    if (!r.faltan) {
      return avisoHtml("ok", "Hay todo en " + r.bodega, "Al enviarlo se apartan sus " + cuantas(r.pedidos, "par", "pares") +
                       " y queda Listo para despacho: Logística lo ve de una vez.");
    }
    var otra = BODEGAS_PT.filter(function (b) { return b.codigo !== r.bodega && !validacion(p, b.codigo).faltan; })[0];
    if (otra) {
      return avisoHtml("ok", "En " + otra.codigo + " está todo el pedido", "Despáchelo desde allá: no hay que esperar a Producción.") +
        '<button class="btn btn--sm ped-usar" type="button" data-val-bod="' + otra.codigo + '">' + icono("ubicacion", 16) +
        "Usar " + otra.codigo + "</button>";
    }
    var sumando = p.lineas.every(function (l) {
      return BODEGAS_PT.reduce(function (s, b) { return s + libreEn(b.codigo, l.ref, l.color, l.talla); }, 0) >= l.cant;
    });
    if (sumando) {
      return avisoHtml("warn", "Sumando " + enLista(BODEGAS_PT.map(function (b) { return b.codigo; })) + " alcanza",
        "Pídale a Inventario un traslado (todavía no se hace desde Comercial). Si lo envía ahora, Producción fabrica lo que falta aquí.");
    }
    return avisoHtml("warn", "Lo que falta no está en ninguna bodega", "Producción lo fabrica. Cuando Inventario lo reciba, " +
                     "el pedido pasa solo a Listo para despacho.");
  }

  /* El botón principal. Antes de guardar vuelve a calcular: si mientras tanto cambiaron
     las existencias, no guarda y lo dice. Si no, aparta lo que hay en la bodega elegida */
  function confirmarValidacion() {
    var p = pedidoPor(val.pedido), r = validacion(p, val.bodega);
    if (r.firma !== val.firma) {
      pintarValidar();
      return aviso("Las existencias cambiaron: revise los renglones en rojo.", "crit");
    }
    p.bodega = r.bodega;
    r.renglones.forEach(function (x) { x.l.apartado = x.toma; });
    p.validadoEl = diaDeHoy();
    if (r.faltan) {
      p.estado = "en_produccion";
      p.produccionEl = diaDeHoy();
    } else {
      p.estado = "listo";
      p.listoEl = diaDeHoy();
    }
    publicarPedidos();   // Producción ve lo que falta; Logística, los listos
    uno("#ped-validar").hidden = true;
    val = null;
    pedCambiados = [p.codigo];
    iniciarPedidos();
    aviso(!r.faltan ? p.codigo + " quedó Listo para despacho: se apartaron sus " + cuantas(r.pedidos, "par", "pares") + " en " +
                      r.bodega + ". Logística ya lo ve."
      : p.codigo + " pasó a En producción: " + (r.hay ? "se apartaron " + cuantas(r.hay, "par", "pares") + " en " + r.bodega +
                   " y Producción fabrica los " + miles(r.faltan) + " que faltan." : "Producción fabrica sus " + cuantas(r.faltan, "par", "pares") + "."), "ok");
  }

  document.addEventListener("click", function (e) {
    if (!val || !e.target.closest) return;
    if (e.target.id === "ped-validar") return cerrarValidar();   // el fondo oscuro de la ventana
    var usar = e.target.closest("[data-val-bod]");
    if (usar) {   // "Usar BOD-05"
      val.bodega = usar.getAttribute("data-val-bod");
      pintarValidar();
      return uno("#ped-val-bod").focus();
    }
    var b = e.target.closest("[data-val]"), que = b ? b.getAttribute("data-val") : "";
    if (que === "cerrar") cerrarValidar();
    if (que === "enviar") confirmarValidacion();
  });

  document.addEventListener("change", function (e) {
    if (!val) return;
    if (e.target.id === "ped-val-bod") { val.bodega = e.target.value; pintarValidar(); }
    if (e.target.id === "ped-val-solo") { val.soloFalta = e.target.checked; pintarValidar(); }
  });

  // Esc cierra la ventana: el pedido sigue Registrado
  document.addEventListener("keydown", function (e) {
    if (val && e.key === "Escape") {
      e.preventDefault();
      cerrarValidar();
    }
  });

  /* ---------------------------------------------------------------- 17. Arranque */

  marcarMenu();
  // con F5, el historial todavía sabe qué cliente se estaba editando
  history.replaceState({ pantalla: actual, cliente: (history.state && history.state.cliente) || null }, "", actual);
  revalidar();   // publica los pedidos para Producción y Logística (al cargar no cambia ningún estado)
  alEntrar();
})();
