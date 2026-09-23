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
    var unitario = Math.round(numero(celda(previa, "Costo").textContent) /
                              Math.max(1, numero(celda(previa, "Cantidad").textContent)));

    var fila = nuevaFila(panel, "Registro");
    ponerCelda(fila, "Registro", "<b>" + codigo + "</b><div class=\"tiny\">" + hoy() + "</div>");
    ponerCelda(fila, "Origen", '<span class="chip chip--cobre">Inventario</span>');
    ponerCelda(fila, "Referencia", ref.value);
    ponerCelda(fila, "Cantidad", String(unidades));
    ponerCelda(fila, "Causa", causa.value.trim() + '<div class="tiny">Etapa de ' +
               etapa.value.toLowerCase() + "</div>");
    ponerCelda(fila, "Costo", pesos(unidades * unitario));
    ponerCelda(fila, "Responsable", "Andrés Suárez");

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
    if (texto === "Registrar merma")  { e.preventDefault(); return registrarMerma(); }
    if (texto === "Registrar ajuste") { e.preventDefault(); return registrarAjuste(); }
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
})();
