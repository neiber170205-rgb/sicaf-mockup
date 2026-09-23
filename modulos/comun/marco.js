/* =====================================================================
   SICAF/comun/marco.js  (lo mantiene SOLO el integrador; se cambia por PR)

   Arma el MARCO de todas las pantallas de SICAF, igual al mockup general:
   el menú lateral (la marca, los módulos y el botón que lo pliega) y la
   barra superior (buscador, modo, chip del usuario y campana).
   Tu pantalla de React queda en el centro: tú no tienes que hacer nada de esto.

   Cada pantalla lo carga en su web/index.html, justo después de <div id="root">:
       <body data-modulo="05-produccion">
         <div id="root"></div>
         <script src="/SICAF/comun/marco.js" vite-ignore></script>

   El botón de la marca pliega y despliega el menú, la tecla "/" lleva al
   buscador y el chip del usuario abre su desplegable (ahí está lo que antes
   era la barra del pie: soporte, manual, políticas y la versión).
   El buscador, la campana y las opciones del desplegable son del diseño:
   todavía no buscan ni abren nada (eso llega cuando haya sesión).

   En el mockup general cada módulo se ve dentro de un marco (iframe) que se
   llama "sicaf-general". Ahí el menú y la barra de arriba los pone el general,
   así que este archivo solo acomoda la pantalla y le avisa al general en qué
   pantalla está (ver la sección 4).

   Si este archivo falla, tu pantalla sigue funcionando, solo que sin el marco.
   Cómo se usa: comun/README.md
   ===================================================================== */
(function () {
  /* ---------- 1. PARÁMETROS: lo único que se cambia ---------- */
  var SICAF = {
    nombre: "SICAF",
    nombreLargo: "Sistema Integral de Gestión para Fábricas de Calzado",
    lema: "Gestión · Calidad · Resultados",
    logo: "img/logo-sicaf.png",          // dentro de comun/. También es el ícono de la pestaña del navegador
    version: "v1.0.0",                   // la que se ve al pie del desplegable del usuario
    // El chip de la barra superior y la cabecera de su desplegable
    usuario: { nombre: "Admin Principal", correo: "admin@sicaf.com",
               modo: "Modo Administrador", rol: "Administrador · los nueve módulos" },
    alertas: 9,                          // el número rojo de la campana (0 = sin número)
    // El menú lateral: la carpeta de cada módulo, el nombre que se ve y su ícono (de comun/iconos.svg).
    // "primera" es la pantalla con la que abre su mockup (en las pantallas de React se abre su app/).
    modulos: [
      { carpeta: "01-dashboard", primera: "01-inicio.html",  nombre: "Dashboard General",    icono: "cuadricula",  color: "#FFFFFF" },
      { carpeta: "02-diseno", primera: "01-modelos.html",     nombre: "Diseño",               icono: "lapiz",       color: "var(--cobre-400)" },
      { carpeta: "03-compras", primera: "01-necesidad.html",  nombre: "Compras",              icono: "carrito",     color: "#F2E3DE" },
      { carpeta: "04-inventario", primera: "01-inicio.html", nombre: "Inventario",           icono: "caja",        color: "var(--cobre-400)" },
      { carpeta: "05-produccion", primera: "01-panel-principal.html", nombre: "Producción",           icono: "engranaje",   color: "#F2E3DE" },
      { carpeta: "06-calidad", primera: "01-proceso.html",    nombre: "Control de Calidad",   icono: "casilla-llena", color: "#5CBB7B" },
      { carpeta: "07-comercial", primera: "01-inicio.html",  nombre: "Comercial",            icono: "barras",      color: "var(--cobre-400)" },
      { carpeta: "08-logistica", primera: "01-inicio.html",  nombre: "Logística y Despacho", icono: "camion",      color: "var(--cobre-400)" },
      { carpeta: "09-admin", primera: "01-inicio.html",      nombre: "Admin. Usuarios",      icono: "usuario-mas", color: "#FFFFFF" }
    ]
  };

  /* ---------- 2. De aquí para abajo no hace falta cambiar nada ---------- */

  // La carpeta comun/ se calcula desde este mismo archivo: .../SICAF/comun/
  var script = document.currentScript;
  var comun = script ? new URL(".", script.src).href : "/SICAF/comun/";
  var raiz = new URL("..", comun).href;

  function esc(texto) {
    return String(texto).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* El trazo de cada icono, el mismo de comun/iconos.svg (Lucide 1.47, licencia ISC).
     Va aqui dentro para que los iconos se vean tambien con doble clic (file://),
     donde el navegador no deja leer un .svg de otra carpeta. */
  var TRAZOS = {
    "alerta": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"/> <path d=\"M12 9v4\"/> <path d=\"M12 17h.01\"/>",
    "bandeja": "<polyline points=\"22 12 16 12 14 15 10 15 8 12 2 12\"/> <path d=\"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\"/>",
    "barras": "<path d=\"M3 3v16a2 2 0 0 0 2 2h16\"/> <path d=\"M18 17V9\"/> <path d=\"M13 17V5\"/> <path d=\"M8 17v-3\"/>",
    "barras-lleno": "<path d=\"M3 3v16a2 2 0 0 0 2 2h16\"/> <path d=\"M18 17V9\"/> <path d=\"M13 17V5\"/> <path d=\"M8 17v-3\"/>",
    "base-datos": "<ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\"/> <path d=\"M3 5v14a9 3 0 0 0 18 0V5\"/> <path d=\"M3 12a9 3 0 0 0 18 0\"/>",
    "billete": "<rect width=\"20\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\"/> <circle cx=\"12\" cy=\"12\" r=\"2\"/> <path d=\"M6 12h.01M18 12h.01\"/>",
    "buscar": "<path d=\"m21 21-4.34-4.34\"/> <circle cx=\"11\" cy=\"11\" r=\"8\"/>",
    "caja": "<path d=\"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z\"/> <path d=\"M12 22V12\"/> <polyline points=\"3.29 7 12 12 20.71 7\"/> <path d=\"m7.5 4.27 9 5.15\"/>",
    "caja-llena": "<path d=\"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z\"/> <path d=\"M12 22V12\"/> <polyline points=\"3.29 7 12 12 20.71 7\"/> <path d=\"m7.5 4.27 9 5.15\"/>",
    "camion": "<path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\"/> <path d=\"M15 18H9\"/> <path d=\"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14\"/> <circle cx=\"17\" cy=\"18\" r=\"2\"/> <circle cx=\"7\" cy=\"18\" r=\"2\"/>",
    "camion-lleno": "<path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\"/> <path d=\"M15 18H9\"/> <path d=\"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14\"/> <circle cx=\"17\" cy=\"18\" r=\"2\"/> <circle cx=\"7\" cy=\"18\" r=\"2\"/>",
    "campana": "<path d=\"M10.268 21a2 2 0 0 0 3.464 0\"/> <path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\"/>",
    "candado": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/> <path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>",
    "carrito": "<path d=\"m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18\"/> <path d=\"M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25\"/> <circle cx=\"18\" cy=\"20\" r=\"2\"/> <circle cx=\"8\" cy=\"20\" r=\"2\"/>",
    "casilla-llena": "<path d=\"M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344\"/> <path d=\"m9 11 3 3L22 4\"/>",
    "cerrar": "<path d=\"M18 6 6 18\"/> <path d=\"m6 6 12 12\"/>",
    "correo": "<path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\"/> <rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\"/>",
    "cuadricula": "<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\"/> <rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\"/> <rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\"/> <rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\"/>",
    "descargar": "<path d=\"M12 15V3\"/> <path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/> <path d=\"m7 10 5 5 5-5\"/>",
    "desplegar": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/> <path d=\"M9 3v18\"/> <path d=\"m14 9 3 3-3 3\"/>",
    "editar": "<path d=\"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\"/> <path d=\"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z\"/>",
    "engranaje": "<path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\"/> <circle cx=\"12\" cy=\"12\" r=\"3\"/>",
    "engranaje-lleno": "<path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\"/> <circle cx=\"12\" cy=\"12\" r=\"3\"/>",
    "entrar": "<path d=\"m10 17 5-5-5-5\"/> <path d=\"M15 12H3\"/> <path d=\"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4\"/>",
    "escudo": "<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"/>",
    "etiqueta": "<path d=\"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z\"/> <circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/>",
    "flecha-abajo": "<path d=\"m6 9 6 6 6-6\"/>",
    "flecha-arriba": "<path d=\"m5 12 7-7 7 7\"/> <path d=\"M12 19V5\"/>",
    "frasco": "<path d=\"M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2\"/> <path d=\"M6.453 15h11.094\"/> <path d=\"M8.5 2h7\"/>",
    "info": "<circle cx=\"12\" cy=\"12\" r=\"10\"/> <path d=\"M12 16v-4\"/> <path d=\"M12 8h.01\"/>",
    "lapiz": "<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/> <path d=\"m15 5 4 4\"/>",
    "lapiz-lleno": "<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/> <path d=\"m15 5 4 4\"/>",
    "lista": "<path d=\"M3 5h.01\"/> <path d=\"M3 12h.01\"/> <path d=\"M3 19h.01\"/> <path d=\"M8 5h13\"/> <path d=\"M8 12h13\"/> <path d=\"M8 19h13\"/>",
    "mas": "<path d=\"M5 12h14\"/> <path d=\"M12 5v14\"/>",
    "ojo": "<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"/> <circle cx=\"12\" cy=\"12\" r=\"3\"/>",
    "ojo-tachado": "<path d=\"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49\"/> <path d=\"M14.084 14.158a3 3 0 0 1-4.242-4.242\"/> <path d=\"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143\"/> <path d=\"m2 2 20 20\"/>",
    "plegar": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/> <path d=\"M9 3v18\"/> <path d=\"m16 15-3-3 3-3\"/>",
    "portapapeles": "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\"/> <path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/> <path d=\"M12 11h4\"/> <path d=\"M12 16h4\"/> <path d=\"M8 11h.01\"/> <path d=\"M8 16h.01\"/>",
    "puntos": "<circle cx=\"12\" cy=\"12\" r=\"1\"/> <circle cx=\"12\" cy=\"5\" r=\"1\"/> <circle cx=\"12\" cy=\"19\" r=\"1\"/>",
    "reloj": "<line x1=\"10\" x2=\"14\" y1=\"2\" y2=\"2\"/> <line x1=\"12\" x2=\"15\" y1=\"14\" y2=\"11\"/> <circle cx=\"12\" cy=\"14\" r=\"8\"/>",
    "ruta": "<circle cx=\"6\" cy=\"19\" r=\"3\"/> <path d=\"M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15\"/> <circle cx=\"18\" cy=\"5\" r=\"3\"/>",
    "usuario": "<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/> <circle cx=\"12\" cy=\"7\" r=\"4\"/>",
    "usuario-lleno": "<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/> <circle cx=\"12\" cy=\"7\" r=\"4\"/>",
    "usuario-mas": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/> <circle cx=\"9\" cy=\"7\" r=\"4\"/> <line x1=\"19\" x2=\"19\" y1=\"8\" y2=\"14\"/> <line x1=\"22\" x2=\"16\" y1=\"11\" y2=\"11\"/>",
    "usuarios": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/> <path d=\"M16 3.128a4 4 0 0 1 0 7.744\"/> <path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/> <circle cx=\"9\" cy=\"7\" r=\"4\"/>",
    "usuarios-lleno": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/> <path d=\"M16 3.128a4 4 0 0 1 0 7.744\"/> <path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/> <circle cx=\"9\" cy=\"7\" r=\"4\"/>",
    "visto": "<path d=\"M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344\"/> <path d=\"m9 11 3 3L22 4\"/>",
    "zapato": "<path d=\"M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z\"/> <path d=\"M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z\"/> <path d=\"M16 17h4\"/> <path d=\"M4 13h4\"/>"
  };

  function icono(nombre, tamano, color) {
    return '<svg class="ico" width="' + tamano + '" height="' + tamano + '" viewBox="0 0 24 24"'
      + ' fill="none" stroke="currentColor" stroke-width="' + (tamano < 18 ? 2.1 : 1.9) + '"'
      + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'
      + (color ? ' style="color:' + color + '"' : "") + ">"
      + (TRAZOS[nombre] || TRAZOS.info) + "</svg>";
  }

  /* Lo mismo para los iconos que la pantalla ya escribio con <use href="...iconos.svg#nombre">:
     se les pinta el trazo dentro, y asi tampoco dependen de poder leer el archivo. */
  function dibujarIconos(donde) {
    var usos = donde.querySelectorAll('use[href*="iconos.svg#"], use[*|href*="iconos.svg#"]');
    for (var i = 0; i < usos.length; i++) {
      var uso = usos[i];
      var ref = uso.getAttribute("href") || uso.getAttribute("xlink:href") || "";
      var trazo = TRAZOS[ref.split("#")[1]];
      if (!trazo) continue;
      var svg = uso.ownerSVGElement;
      if (!svg) continue;
      var alto = parseFloat(svg.getAttribute("height")) || 20;
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", alto < 18 ? 2.1 : 1.9);
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      svg.innerHTML = trazo;
    }
  }

  // Qué módulo es esta pantalla: lo dice <body data-modulo="05-produccion">
  var carpetaActual = document.body.getAttribute("data-modulo") || "";
  var actual = null;
  for (var i = 0; i < SICAF.modulos.length; i++) {
    if (SICAF.modulos[i].carpeta === carpetaActual) actual = SICAF.modulos[i];
  }
  // Un texto propio para las páginas que no son módulos: <body data-titulo="...">
  var titulo = document.body.getAttribute("data-titulo") || "";
  var donde = actual ? actual.nombre : (titulo || SICAF.nombre);
  // Una pantalla de React trae <div id="root">; un mockup, no
  var root = document.getElementById("root");

  // Ícono de la pestaña del navegador
  if (!document.querySelector('link[rel~="icon"]')) {
    var favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.href = comun + SICAF.logo;
    document.head.appendChild(favicon);
  }

  /* Las pantallas del módulo: la fila de pestañas que ya trae la pantalla
     (<nav class="subnav">) se convierte en el sub-menú que cuelga del módulo,
     igual que en el mockup general. Si la pantalla no la trae, no hay sub-menú. */
  var pestanas = document.querySelector(".subnav");
  var pantallas = pestanas ? [].slice.call(pestanas.querySelectorAll("a")) : [];
  if (pestanas) pestanas.parentNode.removeChild(pestanas);

  // Un ítem del sub-menú, hecho con una de esas pestañas
  function itemSub(a) {
    return '<a class="nav__si' + (a.className.indexOf("is-on") >= 0 ? " is-on" : "") + '"'
      + ' href="' + a.getAttribute("href") + '">'
      + icono(a.getAttribute("data-ico") || "puntos", 16)
      + "<span>" + esc(a.textContent.trim()) + "</span>"
      + (a.getAttribute("data-ct") ? '<span class="ct">' + esc(a.getAttribute("data-ct")) + "</span>" : "")
      + "</a>";
  }

  // Dentro del mockup general el marco ya lo pone el general (sección 4)
  if (window.name === "sicaf-general") {
    dentroDelGeneral();
    return;
  }

  // El desplegable del chip del usuario: aquí vive lo que antes era la barra del pie.
  var usuario = SICAF.usuario;
  function opcion(ic, texto) {
    return '<button class="umenu__i" type="button" role="menuitem">'
      + icono(ic, 17) + "<span>" + esc(texto) + "</span></button>";
  }
  var desplegable =
    '<div class="umenu__h"><span class="avatar avatar--sm">' + esc(usuario.nombre.charAt(0)) + "</span>"
    + "<div><b>" + esc(usuario.nombre) + "</b><small>" + esc(usuario.correo) + "</small></div></div>"
    + '<div class="umenu__rol">' + icono("candado", 15) + esc(usuario.rol) + "</div>"
    + '<div class="umenu__g">'
    + opcion("usuario", "Detalles de la sesión")
    + opcion("info", "Soporte")
    + opcion("portapapeles", "Manual de usuario")
    + opcion("candado", "Políticas de seguridad")
    + "</div>"
    + '<div class="umenu__g">' + opcion("entrar", "Cerrar sesión") + "</div>"
    + '<div class="umenu__pie"><b>' + esc(SICAF.nombre) + "</b><span>" + esc(SICAF.version) + "</span></div>";

  var menu = SICAF.modulos.map(function (m) {
    var esActual = m === actual;
    var esInicio = m.carpeta === SICAF.modulos[0].carpeta;   // el Dashboard va marcado siempre
    // Desde una pantalla de React se va a la app del módulo; desde un mockup, a su mockup
    var destino = raiz + m.carpeta + (root ? "/app/" : "/mockup/" + m.primera);
    var item = '<a class="nav__item' + (esActual ? " is-current" : esInicio ? " is-home" : "") + '"'
      + ' href="' + (esActual ? "./" : destino) + '"'
      + ' title="' + esc(m.nombre) + '"'
      + (esActual ? ' aria-current="page"' : "") + ">"
      + icono(m.icono, 22, esActual ? "" : m.color) + "<span>" + esc(m.nombre) + "</span></a>";
    if (!esActual || !pantallas.length) return item;
    // El módulo en el que estás se abre y muestra sus pantallas
    var sub = pantallas.map(itemSub).join("");
    return '<div class="nav__grupo is-open is-activo">'
      + '<div class="nav__fila is-current">' + item
      + '<button class="nav__caret" type="button" aria-expanded="true" aria-controls="nav-sub"'
      + ' title="Contraer las pantallas">' + icono("flecha-abajo", 18) + "</button>"
      + "</div>"
      + '<div class="nav__sub" id="nav-sub">' + sub + "</div></div>";
  }).join("");

  var app = document.createElement("div");
  app.className = "app";
  app.innerHTML =
    '<aside class="side">'
    + '<div class="brand" title="' + esc(SICAF.nombreLargo) + '">'
    + '<span class="brand__mark"><img src="' + comun + SICAF.logo + '" alt="' + esc(SICAF.nombre) + '"></span>'
    + '<b class="brand__txt">' + esc(SICAF.nombre) + "</b>"
    + '<button class="brand__plegar" type="button" title="Plegar el menú lateral"'
    + ' aria-label="Plegar el menú lateral" aria-expanded="true">' + icono("plegar", 19) + "</button>"
    + "</div>"
    + '<nav class="nav" aria-label="Módulos de ' + esc(SICAF.nombre) + '">' + menu + "</nav>"
    + '<div class="side__foot"><div><div class="side__rule"></div><small>' + esc(SICAF.lema) + "</small></div></div>"
    + "</aside>"
    + '<div class="main">'
    + '<header class="top">'
    + '<div class="search">' + icono("buscar", 20)
    + '<input type="search" autocomplete="off" placeholder="Buscar en ' + esc(donde) + '..."'
    + ' aria-label="Buscar en ' + esc(SICAF.nombre) + '"><kbd class="search__k">/</kbd></div>'
    + '<div class="top__right">'
    + '<span class="modo">' + esc(SICAF.usuario.modo) + "</span>"
    + '<span class="vdiv"></span>'
    + '<div class="userwrap"><button class="userbtn" type="button" aria-label="Sesión activa"'
    + ' aria-haspopup="true" aria-expanded="false" aria-controls="umenu">'
    + '<span class="avatar">' + esc(usuario.nombre.charAt(0)) + "</span>"
    + "<b>" + esc(usuario.nombre) + "</b>" + icono("flecha-abajo", 20) + "</button>"
    + '<div class="umenu" id="umenu" role="menu" hidden>' + desplegable + "</div></div>"
    + '<span class="vdiv"></span>'
    + '<button class="bell" type="button" aria-label="Alertas">' + icono("campana", 20)
    + (SICAF.alertas ? '<span class="bell__n">' + esc(SICAF.alertas) + "</span>" : "") + "</button>"
    + "</div>"
    + "</header>"
    + "</div>";

  var principal = app.querySelector(".main");

  if (root) {
    // Pantalla de React: el <div id="root"> pasa a ser el centro del marco.
    root.classList.add("page");
    root.parentNode.insertBefore(app, root);
    principal.appendChild(root);
  } else {
    // Página sin React (un mockup o un .php): todo lo que tenga el <body> pasa al centro.
    var page = document.createElement("main");
    page.className = "page";
    while (document.body.firstChild) page.appendChild(document.body.firstChild);
    principal.appendChild(page);
    document.body.appendChild(app);
  }

  /* ---------- 3. Lo único que se mueve: plegar el menú, el desplegable y la tecla "/" ---------- */
  var chip = app.querySelector(".userbtn");
  var umenu = app.querySelector("#umenu");
  function verMenu(abierto) {
    umenu.hidden = !abierto;
    chip.setAttribute("aria-expanded", abierto ? "true" : "false");
  }
  chip.addEventListener("click", function (e) {
    e.stopPropagation();
    verMenu(umenu.hidden);
  });
  document.addEventListener("click", function (e) {
    if (!umenu.hidden && !umenu.contains(e.target)) verMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !umenu.hidden) { verMenu(false); chip.focus(); }
  });

  var plegar = app.querySelector(".brand__plegar");
  plegar.addEventListener("click", function () {
    var plegado = document.body.classList.toggle("side-min");
    plegar.innerHTML = icono(plegado ? "desplegar" : "plegar", 19);
    plegar.title = plegado ? "Desplegar el menú lateral" : "Plegar el menú lateral";
    plegar.setAttribute("aria-label", plegar.title);
    plegar.setAttribute("aria-expanded", plegado ? "false" : "true");
  });

  var caret = app.querySelector(".nav__caret");
  if (caret) {
    var grupo = app.querySelector(".nav__grupo");
    var sub = app.querySelector(".nav__sub");
    caret.addEventListener("click", function () {
      var abierto = grupo.classList.toggle("is-open");
      sub.classList.toggle("is-cerrado", !abierto);
      sub.style.maxHeight = abierto ? "" : "0";
      caret.setAttribute("aria-expanded", abierto ? "true" : "false");
      caret.title = abierto ? "Contraer las pantallas" : "Desplegar las pantallas";
    });
  }

  // Los iconos que la pantalla escribió con <use href="...iconos.svg#...">
  dibujarIconos(document);

  var buscador = app.querySelector(".search input");
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.ctrlKey || e.altKey || e.metaKey) return;
    var donde = document.activeElement;
    if (donde && /^(INPUT|TEXTAREA|SELECT)$/.test(donde.tagName)) return;
    e.preventDefault();
    buscador.focus();
  });

  /* ---------- 4. Dentro del mockup general ----------
     El general muestra esta pantalla en un marco (iframe) llamado "sicaf-general", y el menú
     lateral y la barra de arriba los pone él. El marco ocupa TODA la ventana, por debajo de ese
     menú y esa barra: así la pantalla mide lo mismo que cuando se abre sola (sus @media y sus
     medidas en vw miran la ventana). Aquí se arma el marco de siempre, pero con el menú y la
     barra vacíos, del tamaño exacto de los del general (él avisa cuánto miden).
     También se le avisa al general en qué pantalla va y qué número tiene cada ítem del
     sub-menú, para que dibuje el suyo igual. El estilos.css y el prototipo.js del módulo
     funcionan sin cambiar nada. */
  function dentroDelGeneral() {
    var general = window.parent;
    function avisar(datos) { general.postMessage(datos, "*"); }

    // El marco de siempre: el hueco del menú lateral, el de la barra de arriba y la pantalla
    var app = document.createElement("div");
    app.className = "app";
    var huecoMenu = document.createElement("div");
    var principal = document.createElement("div");
    principal.className = "main";
    var huecoBarra = document.createElement("div");
    huecoBarra.style.flex = "0 0 auto";
    var page = document.createElement("main");
    page.className = "page";
    while (document.body.firstChild) page.appendChild(document.body.firstChild);
    principal.appendChild(huecoBarra);
    principal.appendChild(page);
    app.appendChild(huecoMenu);
    app.appendChild(principal);
    document.body.appendChild(app);
    // El fondo del menú lateral no se pinta aquí: lo tapa el del general, del ancho que tenga
    document.body.style.background = "var(--arena)";

    // Hasta saber cuánto miden el menú y la barra del general, la pantalla no se ve
    function acomodar(izquierda, arriba) {
      app.style.gridTemplateColumns = izquierda + "px minmax(0, 1fr)";
      huecoBarra.style.height = arriba + "px";
      document.body.style.visibility = "";
    }
    document.body.style.visibility = "hidden";
    setTimeout(function () { document.body.style.visibility = ""; }, 500);

    // El sub-menú existe, pero escondido: prototipo.js marca ahí la pantalla y cambia sus números
    var sub = document.createElement("nav");
    sub.className = "nav";
    sub.hidden = true;
    sub.innerHTML = pantallas.map(itemSub).join("");
    document.body.appendChild(sub);
    dibujarIconos(document);

    function contar() {
      var items = [].slice.call(sub.querySelectorAll(".nav__si"));
      var on = items.filter(function (a) { return a.classList.contains("is-on"); })[0];
      avisar({
        sicaf: "pantalla",
        carpeta: carpetaActual,
        pantalla: on ? on.getAttribute("href") : location.pathname.split("/").pop(),
        numeros: items.map(function (a) {
          var ct = a.querySelector(".ct");
          return { pantalla: a.getAttribute("href"), ct: ct ? ct.textContent : "" };
        })
      });
    }
    new MutationObserver(contar).observe(sub, { subtree: true, childList: true, characterData: true, attributes: true });
    contar();

    // Lo que pide el general: acomodar el hueco de su menú y su barra, cambiar de pantalla (se
    // pulsa el enlace escondido, como en el marco normal) o mostrar una fila de su buscador
    window.addEventListener("message", function (e) {
      if (e.source !== general || !e.data) return;
      if (e.data.sicaf === "hueco") acomodar(e.data.izquierda, e.data.arriba);
      if (e.data.sicaf === "ir") {
        var a = [].slice.call(sub.querySelectorAll("a")).filter(function (x) {
          return x.getAttribute("href") === e.data.pantalla;
        })[0];
        if (a) a.click();
      }
      if (e.data.sicaf === "mostrar") mostrar(e.data.texto);
    });

    function mostrar(texto) {
      var fila = [].slice.call(page.querySelectorAll("tbody tr")).filter(function (tr) {
        return tr.offsetParent && tr.textContent.indexOf(texto) >= 0;
      })[0];
      if (!fila) return;
      fila.scrollIntoView({ block: "center", behavior: "smooth" });
      fila.style.outline = "2px solid var(--cobre-500)";
      fila.style.outlineOffset = "-2px";
      setTimeout(function () { fila.style.outline = ""; fila.style.outlineOffset = ""; }, 2600);
    }

    // Un enlace a otro módulo lo abre el general, con su menú y sus permisos
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || a.href.indexOf(raiz) !== 0) return;
      var partes = a.href.slice(raiz.length).split(/[?#]/)[0].split("/");
      if (partes.length !== 3 || partes[1] !== "mockup" || partes[0] === carpetaActual) return;
      e.preventDefault();
      e.stopPropagation();
      avisar({ sicaf: "modulo", carpeta: partes[0], pantalla: partes[2] });
    }, true);

    // La tecla "/" lleva al buscador del general, y un clic aquí cierra lo que el general tenga abierto
    document.addEventListener("keydown", function (e) {
      if (e.key !== "/" || e.ctrlKey || e.altKey || e.metaKey) return;
      var donde = document.activeElement;
      if (donde && /^(INPUT|TEXTAREA|SELECT)$/.test(donde.tagName)) return;
      e.preventDefault();
      avisar({ sicaf: "buscar" });
    });
    document.addEventListener("pointerdown", function () { avisar({ sicaf: "clic" }); });

    // Sin historial por pantalla: el botón Atrás del navegador movería un marco que no se ve
    history.pushState = function (estado, nombre, url) { history.replaceState(estado, nombre, url); };
  }
})();
