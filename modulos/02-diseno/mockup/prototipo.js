/* =====================================================================
   02-diseno/mockup/prototipo.js

   Hace que el mockup de Diseño RESPONDA: crear modelos, cargar y cambiar
   la imagen o el plano, agregar materiales a la ficha, crear versiones,
   eliminar filas y filtrar las tablas, sin recargar la página.

   Mismo motor que el de 04-inventario, con lo propio de este módulo.
   Los datos y los archivos viven en la pantalla: con F5 vuelve todo a
   como estaba y nada se sube a ningún servidor.
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
  var actual = (location.pathname.split("/").pop() || "01-modelos.html");
  if (!ES_PANTALLA.test(actual)) actual = "01-modelos.html";
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
    if (actual !== "01-modelos.html") { ir("01-modelos.html", true); setTimeout(abrir, 260); }
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

  /* ---------------------------------------------------------------- 7. Cargar un archivo

     El archivo NO se sube a ningún lado: el navegador lo muestra desde el disco
     del usuario con URL.createObjectURL. Es un prototipo. */

  function pesoBonito(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
    return (Math.round(bytes / 1024 / 102.4) / 10).toString().replace(".", ",") + " MB";
  }

  function mostrarArchivo(caja, archivo) {
    var vista = uno(".subir__v", caja);
    var img = uno(".subir__img", vista);
    var nombre = uno(".subir__n", vista);
    var peso = uno(".subir__p", vista);

    if (caja._url) URL.revokeObjectURL(caja._url);
    if (archivo.type.indexOf("image/") === 0) {
      caja._url = URL.createObjectURL(archivo);
      img.src = caja._url;
      img.hidden = false;
    } else {
      img.hidden = true;               // un PDF no se previsualiza: basta el nombre
    }
    nombre.textContent = archivo.name;
    peso.textContent = (archivo.type || "archivo") + " · " + pesoBonito(archivo.size);
    vista.hidden = false;
    caja.classList.add("tiene-archivo");
  }

  function quitarArchivo(caja) {
    var entrada = uno(".subir__i", caja);
    if (caja._url) { URL.revokeObjectURL(caja._url); caja._url = null; }
    if (entrada) entrada.value = "";
    uno(".subir__v", caja).hidden = true;
    caja.classList.remove("tiene-archivo");
  }

  document.addEventListener("change", function (e) {
    if (!e.target.matches || !e.target.matches(".subir__i")) return;
    var caja = e.target.closest(".subir");
    var archivo = e.target.files && e.target.files[0];
    if (!archivo) return;
    if (archivo.size > 5 * 1024 * 1024) {
      e.target.value = "";
      return aviso("El archivo pesa " + pesoBonito(archivo.size) + " y el tope son 5 MB.", "crit");
    }
    mostrarArchivo(caja, archivo);
    aviso("Archivo cargado: " + archivo.name + " (" + pesoBonito(archivo.size) + ").", "ok");
  });

  /* Arrastrar y soltar sobre la zona */
  document.addEventListener("dragover", function (e) {
    var caja = e.target.closest ? e.target.closest(".subir") : null;
    if (caja) { e.preventDefault(); caja.classList.add("es-nueva"); }
  });
  document.addEventListener("dragleave", function (e) {
    var caja = e.target.closest ? e.target.closest(".subir") : null;
    if (caja) caja.classList.remove("es-nueva");
  });
  document.addEventListener("drop", function (e) {
    var caja = e.target.closest ? e.target.closest(".subir") : null;
    if (!caja) return;
    e.preventDefault();
    caja.classList.remove("es-nueva");
    var archivo = e.dataTransfer.files && e.dataTransfer.files[0];
    if (archivo) { mostrarArchivo(caja, archivo); aviso("Archivo cargado: " + archivo.name + ".", "ok"); }
  });

  /* ---------------------------------------------------------------- 8. Crear, cambiar y eliminar */

  function crearModelo() {
    var ref = uno("#nm-ref"), nom = uno("#nm-nombre"), col = uno("#nm-coleccion"),
        costo = uno("#nm-costo");
    if (!ref.value.trim())  { ref.focus();  return aviso("Escriba la referencia del modelo.", "crit"); }
    if (!nom.value.trim())  { nom.focus();  return aviso("Escriba el nombre del modelo.", "crit"); }

    var panel = panelPorTitulo("Modelos en Borrador");
    if (!panel) return aviso("Modelo creado.", "ok");

    var fila = nuevaFila(panel, null);
    ponerCelda(fila, "Referencia", "<b>" + ref.value.trim().toUpperCase() + "</b>");
    ponerCelda(fila, "Modelo", nom.value.trim() + '<div class="tiny">' + col.value + "</div>");
    ponerCelda(fila, "Creado", hoy());
    ponerCelda(fila, "Falta", "Ficha técnica, imagen y aprobación");
    ponerCelda(fila, "Estado", '<span class="pill pill--warn">En diseño</span>');
    recontar(panel, "modelos en borrador");
    sumarAlMenu("01-modelos.html", 1);
    var creada = ref.value.trim().toUpperCase();
    ref.value = ""; nom.value = "";
    if (costo) costo.value = "";
    aviso("Modelo " + creada + " creado · queda en diseño hasta que tenga ficha y aprobación.", "ok");
  }

  function agregarMaterial() {
    var ins = uno("#fm-insumo"), cant = uno("#fm-cant"), costo = uno("#fm-costo");
    var cantidad = parseFloat(String(cant.value).replace(",", "."));
    var unitario = numero(costo.value);
    if (!cantidad) { cant.focus(); return aviso("Escriba cuánto lleva un par.", "crit"); }
    if (!unitario) { costo.focus(); return aviso("Escriba el costo unitario del insumo.", "crit"); }

    var panel = panelPorTitulo("Ficha Técnica · REF-1042");
    if (!panel) return aviso("Material agregado.", "ok");

    var partes = ins.options[ins.selectedIndex].text.split("·");
    var fila = nuevaFila(panel, null);
    ponerCelda(fila, "Insumo", "<b>" + partes[0].trim() + '</b><div class="tiny">' +
               (partes[1] || "").trim() + "</div>");
    ponerCelda(fila, "Cant./par", String(cantidad).replace(".", ","));
    ponerCelda(fila, "Costo", pesos(unitario));
    ponerCelda(fila, "Subtotal", pesos(Math.round(cantidad * unitario)));
    recontar(panel, "materiales");
    cant.value = ""; costo.value = "";
    aviso("Material agregado a la ficha · el costo del par sube " +
          pesos(Math.round(cantidad * unitario)) + ". Cree una versión para dejarlo en firme.", "warn");
  }

  function subirArchivo() {
    var caja = uno(".subir.tiene-archivo");
    if (!caja) return aviso("Primero cargue la imagen o el plano.", "crit");
    var ref = uno("#im-ref"), tipo = uno("#im-tipo");
    var nombre = uno(".subir__n", caja).textContent;
    var peso = uno(".subir__p", caja).textContent;

    var panel = panelPorTitulo("Imágenes y Planos Cargados");
    if (!panel) return aviso("Archivo subido.", "ok");

    var codigo = ref.options[ref.selectedIndex].text.split("·")[0].trim();
    var modelo = (ref.options[ref.selectedIndex].text.split("·")[1] || "").trim();
    var fila = nuevaFila(panel, null);
    ponerCelda(fila, "Referencia", "<b>" + codigo + '</b><div class="tiny">' + modelo + "</div>");
    ponerCelda(fila, "Archivo", nombre + '<div class="tiny">' + tipo.value + "</div>");
    ponerCelda(fila, "Peso", peso.split("·").pop().trim());
    ponerCelda(fila, "Cargado", hoy());
    ponerCelda(fila, "Estado", '<span class="pill pill--ok">Vigente</span>');
    var acts = uno(".acts", fila);
    if (acts) acts.innerHTML = '<button class="btn btn--sm btn--ghost">Cambiar</button>' +
                               '<button class="btn btn--sm btn--ghost">Eliminar</button>';
    recontar(panel, "archivos");
    quitarArchivo(caja);
    aviso(nombre + " queda asociado a " + codigo + " como " + tipo.value.toLowerCase() + ".", "ok");
  }

  function crearVersion() {
    var ref = uno("#vn-ref"), motivo = uno("#vn-motivo");
    if (!motivo.value.trim()) { motivo.focus(); return aviso("Escriba qué cambió en esta versión.", "crit"); }

    var panel = panelPorTitulo("Versiones de los Modelos");
    if (!panel) return aviso("Versión creada.", "ok");

    var codigo = ref.options[ref.selectedIndex].text.split("·")[0].trim();
    /* la versión que sigue, mirando las que ya tiene esa referencia */
    var mayor = 0;
    todos("tbody tr", tablaDe(panel)).forEach(function (tr) {
      if (tr.textContent.indexOf(codigo) < 0) return;
      var v = celda(tr, "Versión");
      if (v) mayor = Math.max(mayor, numero(v.textContent));
    });

    var fila = nuevaFila(panel, null);
    ponerCelda(fila, "Referencia", "<b>" + codigo + "</b>");
    ponerCelda(fila, "Versión", "<b>v" + (mayor + 1) + "</b>");
    ponerCelda(fila, "Fecha", hoy());
    ponerCelda(fila, "Qué cambió", motivo.value.trim());
    ponerCelda(fila, "Estado", '<span class="pill pill--warn">En revisión</span>');
    var acts = uno(".acts", fila);
    if (acts) acts.innerHTML = '<button class="btn btn--sm btn--oliva">Aprobar</button>';
    recontar(panel, "versiones");
    sumarAlMenu("05-versiones.html", 1);
    motivo.value = "";
    aviso("Versión v" + (mayor + 1) + " de " + codigo + " creada · queda en revisión.", "ok");
  }

  /* Eliminar pide confirmación en el mismo botón, sin ventanas del navegador */
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

  /* ---------------------------------------------------------------- 9. Un solo oyente para los botones */

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button") : null;
    if (!b) return;
    var texto = b.textContent.trim();

    if (b.classList.contains("subir__v") || b.closest(".subir__v")) {
      if (texto === "Quitar") {
        e.preventDefault();
        quitarArchivo(b.closest(".subir"));
        return aviso("Archivo quitado.", "warn");
      }
    }

    if (texto === "Crear modelo")     { e.preventDefault(); return crearModelo(); }
    if (texto === "Agregar material") { e.preventDefault(); return agregarMaterial(); }
    if (texto === "Subir archivo")    { e.preventDefault(); return subirArchivo(); }
    if (texto === "Crear versión")    { e.preventDefault(); return crearVersion(); }
    if (texto === "Eliminar" || texto === "¿Seguro?") { e.preventDefault(); return eliminarFila(b); }

    if (texto === "Abrir ficha") { e.preventDefault(); return ir("03-ficha.html", true); }
    if (texto === "Ver cambios") { e.preventDefault(); return ir("05-versiones.html", true); }

    /* cambiar el archivo de una fila: abre el buscador del sistema */
    if (texto === "Cambiar" && b.closest("tr") && celda(b.closest("tr"), "Archivo")) {
      e.preventDefault();
      var fila = b.closest("tr");
      var entrada = document.createElement("input");
      entrada.type = "file";
      entrada.accept = "image/*,.pdf";
      entrada.addEventListener("change", function () {
        var archivo = entrada.files && entrada.files[0];
        if (!archivo) return;
        var tipo = celda(fila, "Archivo").querySelector(".tiny");
        ponerCelda(fila, "Archivo", archivo.name + '<div class="tiny">' +
                   (tipo ? tipo.textContent : "Archivo") + "</div>");
        ponerCelda(fila, "Peso", (archivo.type || "archivo").split("/").pop().toUpperCase() +
                   " · " + pesoBonito(archivo.size));
        ponerCelda(fila, "Cargado", hoy());
        ponerCelda(fila, "Estado", '<span class="pill pill--ok">Vigente</span>');
        fila.classList.add("es-nueva");
        aviso("Archivo cambiado por " + archivo.name + ".", "ok");
      });
      entrada.click();
      return;
    }

    /* cambiar la cantidad de un material de la ficha */
    if (texto === "Cambiar" && b.closest("tr") && celda(b.closest("tr"), "Cant./par")) {
      e.preventDefault();
      var fm = b.closest("tr");
      var td = celda(fm, "Cant./par");
      if (td.querySelector("input")) return;
      var actual = td.textContent.trim().split(/\s+/)[0];
      td.innerHTML = '<input class="control" type="text" value="' + actual +
                     '" style="width:86px;padding:4px 8px" aria-label="Cantidad por par">';
      var caja = td.querySelector("input");
      caja.focus();
      caja.select();
      b.textContent = "Guardar";
      b.className = "btn btn--sm btn--oliva";
      return;
    }

    if (texto === "Guardar" && b.closest("tr")) {
      e.preventDefault();
      var fg = b.closest("tr");
      var tdg = celda(fg, "Cant./par");
      var cajag = tdg.querySelector("input");
      if (!cajag) return;
      var valor = parseFloat(String(cajag.value).replace(",", ".")) || 0;
      var unitario = numero(celda(fg, "Costo").textContent);
      var unidad = (celda(fg, "Cant./par").getAttribute("data-uni") || "");
      tdg.innerHTML = String(valor).replace(".", ",") + (unidad ? ' <span class="tiny">' + unidad + "</span>" : "");
      ponerCelda(fg, "Subtotal", pesos(Math.round(valor * unitario)));
      fg.classList.add("es-nueva");
      b.textContent = "Cambiar";
      b.className = "btn btn--sm btn--ghost";
      return aviso("Cantidad actualizada · recuerde crear una versión para dejarlo en firme.", "warn");
    }

    if (texto === "Aprobar") {
      e.preventDefault();
      var fa = b.closest("tr");
      var ea = celda(fa, "Estado");
      if (ea) ea.innerHTML = '<span class="pill pill--ok">Aprobada</span>';
      fa.classList.add("es-nueva");
      b.disabled = true;
      sumarAlMenu("05-versiones.html", -1);
      return aviso("Versión aprobada · Producción ya puede abrir órdenes con ella.", "ok");
    }

    if (texto === "Subir imagen") { e.preventDefault(); return ir("04-imagenes.html", true); }

    if (b.classList.contains("iconbtn")) {
      e.preventDefault();
      return aviso((b.getAttribute("aria-label") || "Acción") +
                   ": disponible cuando el módulo esté programado.", "warn");
    }
  });

  /* ---------------------------------------------------------------- 10. Arranque */

  marcarMenu();
  history.replaceState({ pantalla: actual }, "", actual);
})();
