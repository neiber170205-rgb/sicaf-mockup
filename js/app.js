/* =====================================================================
   SICAF — Sistema Integral de Gestión para Fábricas de Calzado
   Prototipo funcional. La lógica de cada módulo sigue el documento
   "Lógica funcional por módulo — SICAF".
   ===================================================================== */

/* ---------- Iconografía ---------- */
/* Iconos de Lucide (ISC, lucide.dev) v1.47: el trazo de cada uno, tal cual.
   El nombre de la izquierda es el que usa el prototipo; ico(nombre, tamaño) los dibuja. */
const P = {
  grid:"<rect width='7' height='7' x='3' y='3' rx='1'/> <rect width='7' height='7' x='14' y='3' rx='1'/> <rect width='7' height='7' x='14' y='14' rx='1'/> <rect width='7' height='7' x='3' y='14' rx='1'/>",
  pencil:"<path d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/> <path d='m15 5 4 4'/>",
  cart:"<path d='m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18'/> <path d='M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25'/> <circle cx='18' cy='20' r='2'/> <circle cx='8' cy='20' r='2'/>",
  box:"<path d='M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z'/> <path d='M12 22V12'/> <polyline points='3.29 7 12 12 20.71 7'/> <path d='m7.5 4.27 9 5.15'/>",
  gear:"<path d='M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915'/> <circle cx='12' cy='12' r='3'/>",
  check:"<path d='M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344'/> <path d='m9 11 3 3L22 4'/>",
  bars:"<path d='M3 3v16a2 2 0 0 0 2 2h16'/> <path d='M18 17V9'/> <path d='M13 17V5'/> <path d='M8 17v-3'/>",
  truck:"<path d='M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2'/> <path d='M15 18H9'/> <path d='M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14'/> <circle cx='17' cy='18' r='2'/> <circle cx='7' cy='18' r='2'/>",
  userplus:"<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/> <circle cx='9' cy='7' r='4'/> <line x1='19' x2='19' y1='8' y2='14'/> <line x1='22' x2='16' y1='11' y2='11'/>",
  user:"<path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/> <circle cx='12' cy='7' r='4'/>",
  users:"<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/> <path d='M16 3.128a4 4 0 0 1 0 7.744'/> <path d='M22 21v-2a4 4 0 0 0-3-3.87'/> <circle cx='9' cy='7' r='4'/>",
  search:"<path d='m21 21-4.34-4.34'/> <circle cx='11' cy='11' r='8'/>",
  bell:"<path d='M10.268 21a2 2 0 0 0 3.464 0'/> <path d='M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326'/>",
  down:"<path d='M12 15V3'/> <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/> <path d='m7 10 5 5 5-5'/>",
  edit:"<path d='M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/> <path d='M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z'/>",
  dots:"<circle cx='12' cy='12' r='1'/> <circle cx='12' cy='5' r='1'/> <circle cx='12' cy='19' r='1'/>",
  lock:"<rect width='18' height='11' x='3' y='11' rx='2' ry='2'/> <path d='M7 11V7a5 5 0 0 1 10 0v4'/>",
  mail:"<path d='m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7'/> <rect x='2' y='4' width='20' height='16' rx='2'/>",
  chev:"<path d='m6 9 6 6 6-6'/>",
  info:"<circle cx='12' cy='12' r='10'/> <path d='M12 16v-4'/> <path d='M12 8h.01'/>",
  alert:"<path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3'/> <path d='M12 9v4'/> <path d='M12 17h.01'/>",
  x:"<path d='M18 6 6 18'/> <path d='m6 6 12 12'/>",
  plus:"<path d='M5 12h14'/> <path d='M12 5v14'/>",
  shoe:"<path d='M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z'/> <path d='M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z'/> <path d='M16 17h4'/> <path d='M4 13h4'/>",
  arrow:"<path d='m5 12 7-7 7 7'/> <path d='M12 19V5'/>",
  clip:"<rect width='8' height='4' x='8' y='2' rx='1' ry='1'/> <path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/> <path d='M12 11h4'/> <path d='M12 16h4'/> <path d='M8 11h.01'/> <path d='M8 16h.01'/>",
  ruta:"<circle cx='6' cy='19' r='3'/> <path d='M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15'/> <circle cx='18' cy='5' r='3'/>",
  flask:"<path d='M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2'/> <path d='M6.453 15h11.094'/> <path d='M8.5 2h7'/>",
  tag:"<path d='M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z'/> <circle cx='7.5' cy='7.5' r='.5' fill='currentColor'/>",
  entrar:"<path d='m10 17 5-5-5-5'/> <path d='M15 12H3'/> <path d='M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4'/>",
  eye:"<path d='M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0'/> <circle cx='12' cy='12' r='3'/>",
  bandeja:"<polyline points='22 12 16 12 14 15 10 15 8 12 2 12'/> <path d='M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'/>",
  reloj:"<line x1='10' x2='14' y1='2' y2='2'/> <line x1='12' x2='15' y1='14' y2='11'/> <circle cx='12' cy='14' r='8'/>",
  eyeoff:"<path d='M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49'/> <path d='M14.084 14.158a3 3 0 0 1-4.242-4.242'/> <path d='M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143'/> <path d='m2 2 20 20'/>",
  plegar:"<rect width='18' height='18' x='3' y='3' rx='2'/> <path d='M9 3v18'/> <path d='m16 15-3-3 3-3'/>",
  desplegar:"<rect width='18' height='18' x='3' y='3' rx='2'/> <path d='M9 3v18'/> <path d='m14 9 3 3-3 3'/>",
  funnel:"<path d='M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z'/>"
};
/* Dibuja un icono: ico('gear',20). Todos vienen de Lucide, así que basta con
   envolver su trazo en el <svg>; el color lo hereda del texto (currentColor). */
function ico(n,s){s=s||20;
 return '<svg class="ico" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
 +' stroke-width="'+(s<18?2.1:1.9)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
 +(P[n]||P.info)+'</svg>';}

/* ---------- Utilidades ---------- */
const $=s=>document.querySelector(s);
const n0=n=>Math.round(n).toLocaleString('es-CO');
const n2=n=>(Math.round(n*100)/100).toLocaleString('es-CO',{maximumFractionDigits:2});
const cop=n=>'$'+n0(n);
const hoy=()=>new Date('2026-09-15T10:20:00').toISOString().slice(0,10);
const ahora=()=>'2026-09-15 '+new Date().toTimeString().slice(0,5);
const norm=t=>String(t??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uid=p=>p+'-'+String(Math.floor(Math.random()*9000+1000));

/* ---------- Catálogo de módulos ----------
   c = su carpeta en SICAF. Menos Producción, cada uno se ve con su propio mockup
   (ver MOCKUPS DE LOS MÓDULOS, más abajo). */
const MODS=[
 {id:'dashboard',  n:'Dashboard General', ic:'grid',     c:'01-dashboard'},
 {id:'diseno',     n:'Diseño',            ic:'pencil',   c:'02-diseno'},
 {id:'compras',    n:'Compras',           ic:'cart',     c:'03-compras'},
 {id:'inventario', n:'Inventario',        ic:'box',      c:'04-inventario'},
 {id:'produccion', n:'Producción',        ic:'gear',     c:'05-produccion'},
 {id:'calidad',    n:'Control de Calidad', ic:'check',   c:'06-calidad'},
 {id:'comercial',  n:'Comercial',         ic:'bars',     c:'07-comercial'},
 {id:'logistica',  n:'Logística y Despacho', ic:'truck', c:'08-logistica'},
 {id:'usuarios',   n:'Admin. Usuarios',   ic:'userplus', c:'09-admin'}
];
const AREA_CHIP={diseno:'vino',compras:'vino',inventario:'cobre',produccion:'tinta',calidad:'oliva',comercial:'cobre',logistica:'cobre',usuarios:'vino',dashboard:'tinta'};
const modName=id=>(MODS.find(m=>m.id===id)||{n:id}).n;
const CORTO={logistica:'Logística',calidad:'Calidad',usuarios:'Usuarios',dashboard:'Dashboard'};
const modCorto=id=>CORTO[id]||modName(id);
const modIcon=id=>(MODS.find(m=>m.id===id)||{ic:'grid'}).ic;

/* =====================================================================
   ESTADO — datos de arranque (fábrica en operación, 15/09/2026)
   ===================================================================== */
const S={
 vista:'usuarios', tab:{}, q:'',
 dt:{}, menuProd:true, foco:null, sideMin:false, menuUser:false, pasoSel:1, mosPag:0,   /* tablas de datos, sub-menu de Produccion y foco a devolver */
 pant:{}, cts:{}, menuMod:{},   /* mockups de los módulos: pantalla abierta, números de su sub-menú y si está plegado */
 user:null, intentos:0,
 /* Prototipo: la clave se guarda en claro solo para la demostración.
    En Laravel se almacena cifrada con el algoritmo de hash del framework. */
 claves:{'admin@sicaf.com':'admin2026'}, claveDefecto:'sicaf2026',
 UMBRAL_CALIDAD:90,

 usuarios:[
  {id:1,nombre:'Erick Cuevas',correo:'erick@sicaf.com',area:'logistica',rol:'supervisor',estado:'Activo',alta:'2026-09-11'},
  {id:2,nombre:'María Rodríguez',correo:'maria@sicaf.com',area:'inventario',rol:'gerente',estado:'Activo',alta:'2026-09-11'},
  {id:3,nombre:'Luis Fernando',correo:'luis@sicaf.com',area:'calidad',rol:'operario',estado:'Activo',alta:'2026-09-12'}
 ],
 bitacora:[
  {f:'2026-09-12 08:41',u:'Admin Principal',a:'Creación de acceso',d:'Luis Fernando · Control de Calidad · Operario'},
  {f:'2026-09-11 16:05',u:'Admin Principal',a:'Creación de acceso',d:'María Rodríguez · Inventario · Gerente'},
  {f:'2026-09-11 15:58',u:'Admin Principal',a:'Creación de acceso',d:'Erick Cuevas · Logística y Despacho · Supervisor'}
 ],
 alertas:[], notis:[], seqNoti:0,
 /* --- Merma y maquinaria --- */
 merma:[
  {id:'ME-001',fecha:'2026-09-13',origen:'produccion',doc:'OP-2026-030',ref:'REF-1042',cant:2,causa:'Corte fuera de molde',etapa:'Corte',resp:'Admin Principal'},
  {id:'ME-002',fecha:'2026-09-12',origen:'calidad',doc:'LT-2026-028',ref:'REF-1043',cant:2,causa:'Pegue de suela defectuoso',etapa:'Montaje',resp:'Admin Principal'}
 ], seqMerma:2,
 maquinas:[
  {id:'MQ-01',nom:'Troqueladora hidráulica',area:'Corte',estado:'operativa',horas:1840,ultimo:'2026-08-20',prox:'2026-10-20',falla:''},
  {id:'MQ-02',nom:'Máquina de guarnición plana',area:'Guarnición',estado:'operativa',horas:2310,ultimo:'2026-09-01',prox:'2026-11-01',falla:''},
  {id:'MQ-03',nom:'Prensa de montaje',area:'Montaje',estado:'averiada',horas:3120,ultimo:'2026-07-15',prox:'2026-09-15',falla:'Fuga en el pistón derecho'},
  {id:'MQ-04',nom:'Horno reactivador',area:'Terminado',estado:'mantenimiento',horas:980,ultimo:'2026-09-14',prox:'2026-09-16',falla:''}
 ],
 tiempos:[
  {op:'OP-2026-031',etapa:'Corte',operario:'Carlos Ruiz',horas:6,und:120,fecha:'2026-09-13'},
  {op:'OP-2026-031',etapa:'Guarnición',operario:'Ana Suárez',horas:9,und:118,fecha:'2026-09-14'}
 ],
 operarios:['Carlos Ruiz','Ana Suárez','Marta Vélez','Luis Fernando'],


 insumos:[
  {cod:'MP-01',nom:'Cuero vacuno graso',un:'dm²',min:800,costo:1450},
  {cod:'MP-02',nom:'Suela de caucho 36-43',un:'par',min:150,costo:9800},
  {cod:'MP-03',nom:'Forro textil',un:'m',min:120,costo:3200},
  {cod:'MP-04',nom:'Hilo poliéster 40',un:'cono',min:20,costo:6500},
  {cod:'MP-05',nom:'Plantilla EVA',un:'par',min:200,costo:2100},
  {cod:'MP-06',nom:'Pegante poliuretano',un:'kg',min:15,costo:18500},
  {cod:'MP-07',nom:'Ojalete metálico',un:'un',min:2000,costo:45},
  {cod:'MP-08',nom:'Cordón encerado 120 cm',un:'par',min:300,costo:1200}
 ],
 mov:[], seqMov:0,

 modelos:[
  {ref:'REF-1042',nom:'Bota Andina',temp:'Otoño 2026',ver:2,estado:'aprobado',curva:'36-43',
   bom:[['MP-01',14],['MP-02',1],['MP-03',0.4],['MP-04',0.05],['MP-05',1],['MP-06',0.08],['MP-07',12],['MP-08',1]],
   archivos:[{id:'AR-001',nombre:'plano-corte-bota-andina-v2.pdf',peso:'1,8 MB',tipo:'plano',fecha:'2026-09-12',resp:'Admin Principal'},
             {id:'AR-002',nombre:'ficha-tecnica-REF-1042.pdf',peso:'640 KB',tipo:'plano',fecha:'2026-09-12',resp:'Admin Principal'},
             {id:'AR-003',nombre:'muestra-color-cuero.jpg',peso:'220 KB',tipo:'imagen',fecha:'2026-09-13',resp:'Admin Principal'},
             {id:'AR-000',nombre:'plano-corte-bota-andina-v1.pdf',peso:'1,7 MB',tipo:'plano',fecha:'2026-09-11',resp:'Admin Principal',anulado:true}]},
  {ref:'REF-1043',nom:'Mocasín Cúcuta',temp:'Otoño 2026',ver:1,estado:'aprobado',curva:'36-42',
   bom:[['MP-01',11],['MP-02',1],['MP-03',0.3],['MP-04',0.04],['MP-05',1],['MP-06',0.06]],
   archivos:[{id:'AR-004',nombre:'plano-mocasin-cucuta.pdf',peso:'1,2 MB',tipo:'plano',fecha:'2026-09-13',resp:'Admin Principal'}]},
  {ref:'REF-1051',nom:'Zapatilla Urbana',temp:'Verano 2027',ver:1,estado:'borrador',curva:'35-43',
   bom:[['MP-01',8],['MP-02',1],['MP-03',0.5],['MP-04',0.05],['MP-05',1],['MP-08',1]]},
  {ref:'REF-1044',nom:'Zapato Colegial Reforzado',temp:'Escolar 2026',ver:3,estado:'aprobado',curva:'34-40',
   bom:[['MP-01',10],['MP-02',1],['MP-03',0.35],['MP-04',0.04],['MP-05',1],['MP-06',0.07],['MP-08',1]],archivos:[]},
  {ref:'REF-1045',nom:'Sandalia Verano',temp:'Verano 2026',ver:1,estado:'aprobado',curva:'35-41',
   bom:[['MP-01',7],['MP-02',1],['MP-04',0.03],['MP-05',1],['MP-06',0.05]],archivos:[]},
  {ref:'REF-1046',nom:'Botín Casual Cuero',temp:'Otoño 2026',ver:2,estado:'aprobado',curva:'36-43',
   bom:[['MP-01',13],['MP-02',1],['MP-03',0.45],['MP-04',0.05],['MP-05',1],['MP-06',0.09],['MP-07',10],['MP-08',1]],archivos:[]},
  {ref:'REF-0987',nom:'Botín Clásico',temp:'Invierno 2025',ver:3,estado:'descontinuado',curva:'37-42',
   bom:[['MP-01',13],['MP-02',1],['MP-06',0.09]]}
 ],

 proveedores:[
  {id:'PV-01',nom:'Curtiembre del Norte',calif:4.8,dias:5,insumos:['MP-01','MP-03']},
  {id:'PV-02',nom:'Suelas Pacífico',calif:4.2,dias:8,insumos:['MP-02','MP-05','MP-06']},
  {id:'PV-03',nom:'Insumos Textiles JR',calif:4.5,dias:3,insumos:['MP-03','MP-04','MP-07','MP-08']}
 ],
 oc:[
  {id:'OC-2026-014',prov:'PV-01',cod:'MP-01',cant:1200,precio:1420,estado:'enviada',recibido:0,origen:'manual',fecha:'2026-09-12'},
  {id:'OC-2026-015',prov:'PV-03',cod:'MP-07',cant:4000,precio:44,estado:'aprobada',recibido:0,origen:'automática',fecha:'2026-09-13'}
 ], solicitudes:[], seqSol:0,

 op:[
  {id:'OP-2026-031',ref:'REF-1042',cant:120,compromiso:'2026-09-22',estado:'en proceso',etapa:2,
   etapas:[{n:'Corte',rec:120,proc:120,perd:0,cerrada:true},{n:'Guarnición',rec:120,proc:118,perd:2,cerrada:true},{n:'Montaje',rec:118,proc:0,perd:0,cerrada:false},{n:'Terminado',rec:0,proc:0,perd:0,cerrada:false}],
   liberada:true,pedido:'PD-2026-089'},
  {id:'OP-2026-032',ref:'REF-1043',cant:90,compromiso:'2026-09-25',estado:'en espera',etapa:0,
   etapas:[{n:'Corte',rec:0,proc:0,perd:0,cerrada:false},{n:'Guarnición',rec:0,proc:0,perd:0,cerrada:false},{n:'Montaje',rec:0,proc:0,perd:0,cerrada:false},{n:'Terminado',rec:0,proc:0,perd:0,cerrada:false}],
   liberada:false,pedido:''}
 ], seqOP:32,

 lotes:[
  {id:'LT-2026-030',op:'OP-2026-030',ref:'REF-1042',cant:64,estado:'pendiente',conf:0,repro:0,desc:0,tipo:'',defecto:'',etapaOrigen:'',fecha:'2026-09-15'},
  {id:'LT-2026-029',op:'OP-2026-030',ref:'REF-1042',cant:80,estado:'aprobado',conf:78,repro:2,desc:0,tipo:'muestreo',defecto:'Costura',etapaOrigen:'Guarnición',fecha:'2026-09-13'},
  {id:'LT-2026-028',op:'OP-2026-029',ref:'REF-1043',cant:60,estado:'rechazado',conf:49,repro:9,desc:2,tipo:'total',defecto:'Pegue de suela',etapaOrigen:'Montaje',fecha:'2026-09-12'}
 ], seqLote:30
};

/* =====================================================================
   DATOS DE DEMOSTRACIÓN DE PRODUCCIÓN
   Están escritos como tablas compactas (una fila = un registro) y abajo
   se arman los objetos que usa el sistema. Para agregar datos basta con
   escribir una fila más: no hay que tocar ninguna pantalla.
   ===================================================================== */

/* Órdenes de trabajo.
   [código, modelo, pares, compromiso, estado, etapa en curso, merma, etapa de la merma, pedido]
   etapa: 0 Corte · 1 Guarnición · 2 Montaje · 3 Terminado · 4 las cuatro cerradas */
const OPS=[
 ['OP-2026-018','REF-1042',180,'2026-07-24','cerrada',   4, 4,0,''],
 ['OP-2026-019','REF-1043',150,'2026-07-29','cerrada',   4, 3,1,''],
 ['OP-2026-020','REF-1044',240,'2026-08-03','cerrada',   4, 6,0,'PD-2026-081'],
 ['OP-2026-021','REF-1046',120,'2026-08-07','cerrada',   4, 2,2,''],
 ['OP-2026-022','REF-1045',200,'2026-08-12','cerrada',   4, 5,0,''],
 ['OP-2026-023','REF-1042',160,'2026-08-18','cerrada',   4, 3,1,'PD-2026-084'],
 ['OP-2026-026','REF-1044',210,'2026-08-26','cerrada',   4, 4,3,''],
 ['OP-2026-027','REF-1045',140,'2026-08-31','cerrada',   4, 2,0,''],
 ['OP-2026-029','REF-1043',190,'2026-09-04','cerrada',   4, 5,2,'PD-2026-086'],
 ['OP-2026-030','REF-1042',220,'2026-09-09','cerrada',   4, 4,0,''],
 ['OP-2026-024','REF-1046',210,'2026-09-12','en proceso',3, 4,1,''],
 ['OP-2026-025','REF-1042',160,'2026-09-19','en proceso',3, 2,0,'PD-2026-087'],
 ['OP-2026-028','REF-1044',180,'2026-09-21','en proceso',3, 3,2,''],
 ['OP-2026-033','REF-1045',140,'2026-09-23','en proceso',3, 2,1,''],
 ['OP-2026-031','REF-1042',120,'2026-09-22','en proceso',2, 2,1,'PD-2026-089'],
 ['OP-2026-034','REF-1046',240,'2026-09-24','en proceso',2, 5,0,''],
 ['OP-2026-035','REF-1043',170,'2026-09-14','en proceso',2, 3,1,''],
 ['OP-2026-036','REF-1044',150,'2026-09-28','en proceso',2, 2,0,'PD-2026-088'],
 ['OP-2026-037','REF-1042',200,'2026-09-29','en proceso',2, 4,1,''],
 ['OP-2026-038','REF-1045',160,'2026-09-30','en proceso',1, 3,0,''],
 ['OP-2026-039','REF-1046',210,'2026-10-02','en proceso',1, 4,0,''],
 ['OP-2026-040','REF-1042',140,'2026-10-03','en proceso',1, 2,0,''],
 ['OP-2026-041','REF-1043',180,'2026-10-05','en proceso',1, 3,0,''],
 ['OP-2026-042','REF-1044',190,'2026-10-07','en proceso',1, 4,0,'PD-2026-091'],
 ['OP-2026-043','REF-1042',180,'2026-09-11','en proceso',0, 0,0,''],
 ['OP-2026-044','REF-1046',240,'2026-10-10','en proceso',0, 0,0,''],
 ['OP-2026-045','REF-1045',150,'2026-10-12','en proceso',0, 0,0,''],
 ['OP-2026-046','REF-1044',200,'2026-10-14','en proceso',0, 0,0,''],
 ['OP-2026-047','REF-1043',120,'2026-10-15','en proceso',0, 0,0,''],
 ['OP-2026-032','REF-1043', 90,'2026-09-25','en espera',  0, 0,0,''],
 ['OP-2026-048','REF-1046',180,'2026-10-17','en espera',  0, 0,0,''],
 ['OP-2026-049','REF-1044',150,'2026-10-19','en espera',  0, 0,0,''],
 ['OP-2026-050','REF-1042',240,'2026-10-21','pendiente',  0, 0,0,'PD-2026-090'],
 ['OP-2026-051','REF-1045',160,'2026-10-23','pendiente',  0, 0,0,'']
];
/* Arma una orden a partir de su fila. Regla del módulo: lo que entra a una
   etapa es lo que salió de la anterior, y recibido = procesado + merma. */
function armarOP(f){
 const [id,ref,cant,compromiso,estado,etapa,merma,em,pedido]=f;
 const NOM=['Corte','Guarnición','Montaje','Terminado'];
 const liberada=estado==='en proceso'||estado==='cerrada';
 let entra=liberada?cant:0;
 const etapas=NOM.map((n,i)=>{
  if(!liberada||i>etapa)return {n,rec:0,proc:0,perd:0,cerrada:false};
  const cerrada=i<etapa;
  const perd=cerrada&&i===em?merma:0;
  const e={n,rec:entra,proc:cerrada?entra-perd:0,perd,cerrada};
  if(cerrada)entra=entra-perd;
  return e;
 });
 return {id,ref,cant,compromiso,estado,etapa:Math.min(etapa,3),etapas,liberada,pedido};
}
S.op=OPS.map(armarOP); S.seqOP=51;

/* Merma de planta. [código, fecha, orden, modelo, unidades, causa, etapa] */
const MERMAS=[
 ['ME-001','2026-09-13','OP-2026-030','REF-1042',2,'Corte fuera de molde','Corte'],
 ['ME-003','2026-07-26','OP-2026-018','REF-1042',4,'Corte fuera de molde','Corte'],
 ['ME-004','2026-07-30','OP-2026-019','REF-1043',3,'Costura defectuosa','Guarnición'],
 ['ME-005','2026-08-04','OP-2026-020','REF-1044',6,'Material rayado','Corte'],
 ['ME-006','2026-08-08','OP-2026-021','REF-1046',2,'Pegue de suela defectuoso','Montaje'],
 ['ME-007','2026-08-13','OP-2026-022','REF-1045',5,'Corte fuera de molde','Corte'],
 ['ME-008','2026-08-19','OP-2026-023','REF-1042',3,'Costura defectuosa','Guarnición'],
 ['ME-009','2026-08-27','OP-2026-026','REF-1044',4,'Quemado en reactivado','Terminado'],
 ['ME-010','2026-09-01','OP-2026-027','REF-1045',2,'Material rayado','Corte'],
 ['ME-011','2026-09-05','OP-2026-029','REF-1043',5,'Pegue de suela defectuoso','Montaje'],
 ['ME-012','2026-09-10','OP-2026-030','REF-1042',2,'Horma equivocada','Montaje'],
 ['ME-013','2026-09-11','OP-2026-024','REF-1046',4,'Costura defectuosa','Guarnición'],
 ['ME-014','2026-09-12','OP-2026-025','REF-1042',2,'Corte fuera de molde','Corte'],
 ['ME-015','2026-09-13','OP-2026-028','REF-1044',3,'Pegue de suela defectuoso','Montaje'],
 ['ME-016','2026-09-14','OP-2026-033','REF-1045',2,'Costura defectuosa','Guarnición'],
 ['ME-017','2026-09-14','OP-2026-031','REF-1042',2,'Costura defectuosa','Guarnición'],
 ['ME-018','2026-09-15','OP-2026-034','REF-1046',5,'Corte fuera de molde','Corte'],
 ['ME-019','2026-09-15','OP-2026-035','REF-1043',3,'Costura defectuosa','Guarnición'],
 ['ME-020','2026-09-15','OP-2026-036','REF-1044',2,'Material rayado','Corte'],
 ['ME-021','2026-09-15','OP-2026-037','REF-1042',4,'Costura defectuosa','Guarnición'],
 ['ME-022','2026-09-15','OP-2026-038','REF-1045',3,'Corte fuera de molde','Corte'],
 ['ME-023','2026-09-15','OP-2026-039','REF-1046',4,'Corte fuera de molde','Corte'],
 ['ME-024','2026-09-15','OP-2026-042','REF-1044',4,'Corte fuera de molde','Corte'],
 ['ME-025','2026-09-15','OP-2026-041','REF-1043',3,'Talla fuera de curva','Corte']
];
S.merma=MERMAS.map(m=>({id:m[0],fecha:m[1],origen:'produccion',doc:m[2],ref:m[3],cant:m[4],
 causa:m[5],etapa:m[6],resp:'Admin Principal'}))
 /* La merma que detecta Calidad se registra desde su módulo, no desde planta */
 .concat([{id:'ME-002',fecha:'2026-09-12',origen:'calidad',doc:'LT-2026-028',ref:'REF-1043',cant:2,
   causa:'Pegue de suela defectuoso',etapa:'Montaje',resp:'Admin Principal'}]);
S.seqMerma=25;

/* Tiempos de planta. [orden, etapa, operario, horas, unidades, fecha] */
const TIEMPOS=[
 ['OP-2026-029','Corte','Carlos Ruiz',9,190,'2026-08-28'],
 ['OP-2026-029','Guarnición','Ana Suárez',14,190,'2026-08-31'],
 ['OP-2026-029','Montaje','Jorge Mendoza',12,185,'2026-09-02'],
 ['OP-2026-029','Terminado','Paula Ortiz',8,185,'2026-09-04'],
 ['OP-2026-030','Corte','Diego Peña',10,220,'2026-09-01'],
 ['OP-2026-030','Guarnición','Marta Vélez',16,216,'2026-09-04'],
 ['OP-2026-030','Montaje','Jorge Mendoza',13,216,'2026-09-07'],
 ['OP-2026-030','Terminado','Sofía Ramírez',9,216,'2026-09-09'],
 ['OP-2026-024','Corte','Carlos Ruiz',11,210,'2026-09-08'],
 ['OP-2026-024','Guarnición','Ana Suárez',15,206,'2026-09-11'],
 ['OP-2026-024','Montaje','Luis Fernando',14,206,'2026-09-14'],
 ['OP-2026-025','Corte','Diego Peña',8,160,'2026-09-09'],
 ['OP-2026-025','Guarnición','Marta Vélez',12,158,'2026-09-12'],
 ['OP-2026-025','Montaje','Jorge Mendoza',11,158,'2026-09-15'],
 ['OP-2026-028','Corte','Carlos Ruiz',9,180,'2026-09-10'],
 ['OP-2026-028','Guarnición','Sofía Ramírez',13,180,'2026-09-13'],
 ['OP-2026-028','Montaje','Luis Fernando',12,177,'2026-09-15'],
 ['OP-2026-033','Corte','Diego Peña',7,140,'2026-09-11'],
 ['OP-2026-033','Guarnición','Ana Suárez',11,138,'2026-09-14'],
 ['OP-2026-033','Montaje','Jorge Mendoza',10,138,'2026-09-15'],
 ['OP-2026-031','Corte','Carlos Ruiz',6,120,'2026-09-13'],
 ['OP-2026-031','Guarnición','Ana Suárez',9,118,'2026-09-14'],
 ['OP-2026-034','Corte','Diego Peña',12,240,'2026-09-12'],
 ['OP-2026-034','Guarnición','Marta Vélez',17,235,'2026-09-15'],
 ['OP-2026-035','Corte','Carlos Ruiz',8,170,'2026-09-12'],
 ['OP-2026-035','Guarnición','Sofía Ramírez',12,167,'2026-09-15'],
 ['OP-2026-036','Corte','Diego Peña',7,150,'2026-09-13'],
 ['OP-2026-036','Guarnición','Ana Suárez',11,150,'2026-09-15'],
 ['OP-2026-037','Corte','Carlos Ruiz',10,200,'2026-09-13'],
 ['OP-2026-037','Guarnición','Marta Vélez',14,196,'2026-09-15'],
 ['OP-2026-038','Corte','Diego Peña',8,160,'2026-09-14'],
 ['OP-2026-039','Corte','Carlos Ruiz',11,210,'2026-09-14'],
 ['OP-2026-040','Corte','Luis Fernando',7,140,'2026-09-14'],
 ['OP-2026-041','Corte','Diego Peña',9,180,'2026-09-15'],
 ['OP-2026-042','Corte','Carlos Ruiz',10,190,'2026-09-15'],
 ['OP-2026-018','Corte','Paula Ortiz',9,180,'2026-07-20'],
 ['OP-2026-018','Guarnición','Marta Vélez',13,176,'2026-07-22'],
 ['OP-2026-020','Corte','Diego Peña',12,240,'2026-07-30'],
 ['OP-2026-020','Guarnición','Sofía Ramírez',17,234,'2026-08-01'],
 ['OP-2026-022','Corte','Paula Ortiz',10,200,'2026-08-08'],
 ['OP-2026-022','Montaje','Luis Fernando',13,195,'2026-08-11'],
 ['OP-2026-026','Terminado','Sofía Ramírez',9,206,'2026-08-26'],
 ['OP-2026-027','Terminado','Paula Ortiz',7,138,'2026-08-31']
];
S.tiempos=TIEMPOS.map(t=>({op:t[0],etapa:t[1],operario:t[2],horas:t[3],und:t[4],fecha:t[5]}));
S.operarios=['Carlos Ruiz','Ana Suárez','Marta Vélez','Luis Fernando','Diego Peña','Sofía Ramírez','Jorge Mendoza','Paula Ortiz'];

/* Lotes enviados a Calidad.
   [código, orden, modelo, pares, estado, conformes, reproceso, descartados, tipo, defecto, etapa, fecha] */
const LOTES=[
 ['LT-2026-030','OP-2026-030','REF-1042',64,'pendiente',  0,0,0,'','','','2026-09-15'],
 ['LT-2026-031','OP-2026-030','REF-1042',72,'pendiente',  0,0,0,'','','','2026-09-15'],
 ['LT-2026-032','OP-2026-029','REF-1043',60,'pendiente',  0,0,0,'','','','2026-09-14'],
 ['LT-2026-033','OP-2026-026','REF-1044',80,'pendiente',  0,0,0,'','','','2026-09-14'],
 ['LT-2026-034','OP-2026-027','REF-1045',68,'pendiente',  0,0,0,'','','','2026-09-13'],
 ['LT-2026-029','OP-2026-030','REF-1042',80,'aprobado',  78,2,0,'muestreo','Costura','Guarnición','2026-09-13'],
 ['LT-2026-028','OP-2026-029','REF-1043',60,'rechazado', 49,9,2,'total','Pegue de suela','Montaje','2026-09-12'],
 ['LT-2026-027','OP-2026-029','REF-1043',70,'aprobado',  68,2,0,'muestreo','Costura','Guarnición','2026-09-10'],
 ['LT-2026-026','OP-2026-026','REF-1044',90,'aprobado',  88,1,1,'muestreo','Acabado','Terminado','2026-09-06'],
 ['LT-2026-025','OP-2026-026','REF-1044',75,'rechazado', 62,11,2,'total','Pegue de suela','Montaje','2026-09-03'],
 ['LT-2026-024','OP-2026-027','REF-1045',72,'aprobado',  71,1,0,'muestreo','Simetría','Montaje','2026-09-01'],
 ['LT-2026-023','OP-2026-023','REF-1042',85,'aprobado',  83,2,0,'muestreo','Costura','Guarnición','2026-08-24'],
 ['LT-2026-022','OP-2026-022','REF-1045',95,'aprobado',  93,1,1,'muestreo','Acabado','Terminado','2026-08-19'],
 ['LT-2026-021','OP-2026-021','REF-1046',60,'rechazado', 51,7,2,'total','Numeración','Terminado','2026-08-14'],
 ['LT-2026-020','OP-2026-020','REF-1044',120,'aprobado',118,2,0,'muestreo','Costura','Guarnición','2026-08-09'],
 ['LT-2026-019','OP-2026-019','REF-1043',75,'aprobado',  74,1,0,'muestreo','Simetría','Montaje','2026-08-02'],
 ['LT-2026-018','OP-2026-018','REF-1042',90,'aprobado',  88,2,0,'muestreo','Acabado','Terminado','2026-07-27']
];
S.lotes=LOTES.map(l=>({id:l[0],op:l[1],ref:l[2],cant:l[3],estado:l[4],conf:l[5],repro:l[6],desc:l[7],
 tipo:l[8],defecto:l[9],etapaOrigen:l[10],fecha:l[11]}));
S.seqLote=34;

/* =====================================================================
   INVENTARIO — el saldo nunca se edita: se recalcula desde movimientos
   ===================================================================== */
function insumo(cod){return S.insumos.find(i=>i.cod===cod)||{cod,nom:cod,un:'un',min:0,costo:0};}
function saldo(cod){return S.mov.filter(m=>m.cod===cod)
  .reduce((a,m)=>a+(m.tipo==='entrada'?m.cant:m.tipo==='salida'?-m.cant:m.cant),0);}
function mover(cod,tipo,cant,doc,motivo){
  S.mov.push({id:'MV-'+String(++S.seqMov).padStart(4,'0'),cod,tipo,cant,fecha:hoy(),doc:doc||'—',resp:S.user?S.user.nombre:'Sistema',motivo:motivo||''});
}
function salida(cod,cant,doc){mover(cod,'salida',cant,doc);revisarMinimo(cod);}
/* Producto terminado: se maneja como existencia con código PT-<ref> */
const PT=ref=>'PT-'+ref;
function revisarMinimo(cod){
  const i=S.insumos.find(x=>x.cod===cod); if(!i) return;
  const s=saldo(cod), ya=S.alertas.find(a=>a.cod===cod&&a.tipo==='stock');
  if(s<i.min && !ya){
    S.alertas.push({tipo:'stock',area:'inventario',nivel:'warn',cod,t:'Existencia bajo el mínimo',d:i.nom+' ('+cod+'): '+n2(s)+' '+i.un+' frente a un mínimo de '+n0(i.min)+'. Compras fue notificado.'});
    const sol=solicitarCompra(cod,'automática');
    notificar('inventario','compras','urgente','Reposición requerida: '+i.nom,
      'El saldo bajó a '+n2(s)+' '+i.un+' frente a un mínimo de '+n0(i.min)+'. '+(sol?'Solicitud '+sol.id+' por '+n0(sol.cant)+' '+i.un+', pendiente de convertir en orden de compra.':'Ya existe una solicitud abierta.'),sol?sol.id:cod);
  }
  if(s>=i.min && ya){S.alertas=S.alertas.filter(a=>a!==ya);
   S.solicitudes.forEach(x=>{if(x.cod===cod&&x.estado==='pendiente'&&x.origen==='automática'){x.estado='anulada';x.motivoAnula='El saldo volvió por encima del mínimo.';}});}
}
/* Una solicitud de material NO es todavía una orden de compra:
   queda pendiente hasta que Compras la convierte en orden. */
function solicitarCompra(cod,origen,cantSug,motivo,de,ref){
  if(S.solicitudes.some(x=>x.cod===cod&&x.estado==='pendiente')) return null;   /* evita duplicar la misma petición */
  if(origen==='automática'&&S.oc.some(o=>o.cod===cod&&['solicitada','aprobada','enviada','parcial'].includes(o.estado))) return null;
  const i=insumo(cod), prov=sugerirProveedor(cod);
  const cant=Math.ceil(cantSug||Math.max(i.min*1.5-saldo(cod),i.min*0.5));
  const sol={id:'SM-2026-'+String(++S.seqSol).padStart(3,'0'),de:de||'inventario',cod,cant,
   motivo:motivo||'Saldo por debajo del stock mínimo',urgencia:origen==='automática'?'alta':'normal',
   origen,estado:'pendiente',fecha:hoy(),resp:S.user?S.user.nombre:'Sistema',prov:prov.id,oc:'',ref:ref||''};
  S.solicitudes.unshift(sol); return sol;
}
/* Sugerencia de proveedor: calificación, luego tiempo de entrega */
function sugerirProveedor(cod){
  const c=S.proveedores.filter(p=>p.insumos.includes(cod));
  const l=(c.length?c:S.proveedores).slice().sort((a,b)=>b.calif-a.calif||a.dias-b.dias);
  return l[0];
}
/* Saldos iniciales (entradas históricas) */
[['MP-01',2400,1450],['MP-02',420,9800],['MP-03',260,3200],['MP-04',34,6500],
 ['MP-05',180,2100],['MP-06',22,18500],['MP-07',5600,45],['MP-08',240,1200]]
 .forEach(([c,q,p])=>{mover(c,'entrada',q,'Saldo inicial');insumo(c).costo=p;});
mover(PT('REF-1042'),'entrada',78,'LT-2026-029');
mover(PT('REF-1043'),'entrada',44,'Saldo inicial');
S.arranque=true; S.insumos.forEach(i=>revisarMinimo(i.cod)); S.arranque=false;
S.arranque=true;
S.insumos.forEach(()=>{});
notificar('produccion','calidad','aviso','Lote LT-2026-030 listo para inspección','64 pares de REF-1042 terminados en OP-2026-030 esperan acta de inspección.','LT-2026-030');
notificar('calidad','produccion','urgente','Lote LT-2026-028 rechazado','81,67 % de conformidad, por debajo del umbral de 90 %. Defecto principal: pegue de suela, etapa Montaje.','OP-2026-029');
notificar('comercial','logistica','aviso','Pedido PD-2026-088 listo para despacho','40 pares de REF-1042 para Calzado El Dorado (Bogotá). Hay existencias en bodega.','PD-2026-088');
notificar('diseno','produccion','info','Modelo REF-1043 aprobado','Mocasín Cúcuta versión 1 ya puede entrar en órdenes de producción.','REF-1043');
notificar('compras','inventario','aviso','Recepción pendiente OC-2026-014','Curtiembre del Norte despachó 1.200 dm² de cuero vacuno graso. Registre la recepción cuando llegue a bodega.','OC-2026-014');
notificar('calidad','inventario','info','Ingreso de producto terminado LT-2026-029','78 pares conformes de REF-1042 ingresaron a bodega (97,5 % de conformidad).','LT-2026-029');
notificar('logistica','comercial','info','Despacho DS-2026-055 en tránsito','18 pares de REF-1042 para Distribuidora Tamanaco salieron con la guía GR-88231.','DS-2026-055');
S.arranque=false;
S.alertas.push({tipo:'calidad',area:'calidad',nivel:'crit',t:'Lote rechazado en Control de Calidad',d:'LT-2026-028 (REF-1043) alcanzó 81,7 % de conformidad, por debajo del umbral de '+S.UMBRAL_CALIDAD+' %. Defecto principal: pegue de suela, etapa Montaje.'});

/* =====================================================================
   COSTOS Y AGREGACIONES
   ===================================================================== */
function costoPar(ref){const m=S.modelos.find(x=>x.ref===ref);return m?m.bom.reduce((a,[c,q])=>a+q*insumo(c).costo,0):0;}
function faltantes(ref,cant){const m=S.modelos.find(x=>x.ref===ref);if(!m)return[];
  return m.bom.map(([c,q])=>({cod:c,req:q*cant,hay:saldo(c)})).filter(x=>x.hay<x.req);}
/* inv = true cuando subir es malo (faltantes, defectos, devoluciones) */
function delta(act,ant,inv){const d=ant?Math.round((act-ant)/ant*100):0;
  let cls=d>0?'up':d<0?'down':'flat'; if(inv&&d)cls=d>0?'down':'up';
  return{cls,txt:(d>0?'↑ ':d<0?'↓ ':'↑ ')+Math.abs(d)+'%'};}


/* =====================================================================
   NOTIFICACIONES ENTRE MÓDULOS
   Cada operación avisa al área que debe actuar. La notificación viaja
   con su origen, su destino, el documento que la provoca y su urgencia.
   ===================================================================== */
const NIVEL={urgente:'crit',aviso:'warn',info:'ok'};
function notificar(de,para,nivel,t,d,ref){
 const n={id:'NT-'+String(++S.seqNoti).padStart(3,'0'),de,para,nivel,t,d,ref:ref||'',
   fecha:S.arranque?'2026-09-15 08:00':ahora(),leida:false};
 S.notis.unshift(n);
 if(!S.arranque){
  log('Notificación a '+modName(para),t+(ref?' · '+ref:''));
  const mia=S.user&&S.user.area===para;
  if(mia||(S.user&&S.user.rol==='admin'&&nivel!=='info'))
   toast(nivel==='urgente'?'bad':nivel==='info'?'ok':'',(mia?'Para usted: ':'Para '+modName(para)+': ')+t,d);
 }
 return n;
}
const misNotis=()=>S.notis.filter(n=>S.user&&(S.user.rol==='admin'||n.para===S.user.area||n.de===S.user.area));
const pendientes=mod=>S.notis.filter(n=>!n.leida&&n.para===mod);
const sinLeer=()=>S.notis.filter(n=>!n.leida&&(S.user.rol==='admin'||n.para===S.user.area)).length;

/* =====================================================================
   SESIÓN — autenticación e ingreso al sistema
   ===================================================================== */
const ADMIN={id:0,nombre:'Admin Principal',correo:'admin@sicaf.com',rol:'admin',area:'todas',estado:'Activo'};
const cuentas=()=>[ADMIN].concat(S.usuarios);
function clave(correo){return S.claves[correo]||S.claveDefecto;}
function autenticar(correo,pass){
 const t=correo.trim().toLowerCase();
 const u=cuentas().find(x=>x.correo===t||x.correo.split('@')[0]===t);
 if(!u) return{err:'Las credenciales no corresponden a ningún acceso registrado.'};
 if(u.estado!=='Activo') return{err:'Este acceso está desactivado. Solicite su reactivación al administrador.'};
 if(clave(u.correo)!==pass) return{err:'La contraseña no coincide con el acceso indicado.'};
 return{u};
}

/* =====================================================================
   PERMISOS — validados antes de ejecutar cualquier operación
   ===================================================================== */
/* Regla: solo el administrador tiene acceso transversal.
   Cualquier otro usuario ve su Dashboard y ÚNICAMENTE el módulo de su área;
   el de Logística no ve Inventario, el de Inventario no ve Producción, etc. */
function puedeVer(mod){const u=S.user;
  if(u.rol==='admin')return true;
  if(mod==='usuarios')return false;               // solo el administrador
  if(mod==='dashboard')return true;               // panel propio, filtrado a su área
  return u.area===mod;
}
function puedeEscribir(mod){const u=S.user;
  if(u.rol==='admin')return true;
  if(mod==='usuarios'||mod==='dashboard')return false;
  return u.area===mod;}
function exigir(cond,msg){if(!cond){toast('bad','Operación no autorizada',msg);return false}return true;}
function log(a,d){S.bitacora.unshift({f:ahora(),u:S.user?S.user.nombre:'Sistema',a,d});}

/* =====================================================================
   AVISOS
   ===================================================================== */
function toast(tipo,tit,txt){
  const el=document.createElement('div');
  el.className='toast '+(tipo==='ok'?'toast--ok':tipo==='bad'?'toast--bad':'');
  el.innerHTML=ico(tipo==='bad'?'alert':tipo==='ok'?'check':'info',18)+'<div><b>'+esc(tit)+'</b>'+(txt?'<p>'+esc(txt)+'</p>':'')+'</div>';
  $('#toasts').appendChild(el);
  setTimeout(()=>{el.style.opacity='0';el.style.transition='opacity .3s';setTimeout(()=>el.remove(),320)},4200);
}

/* =====================================================================
   COMPONENTES DE PRESENTACIÓN
   ===================================================================== */
function hero(t,s){return '<section class="hero"><div><h1>'+t+'</h1><p>'+s+'</p></div></section>';}
/* Tarjeta de indicador. Con "act" se vuelve un botón que filtra su tabla. */
function kpi(v,n,l,d,act){const dd=d||{cls:'flat',txt:'↑ 0%'};
 const e=act&&S.dt[act.dt], on=!!(e&&String(e.f[act.f])===String(act.v));
 const tag=act?'button':'article';
 return '<'+tag+' class="kpi kpi--'+v+(act?' kpi--btn':'')+(on?' is-on':'')+'"'
 +(act?' data-act="kpi-f" data-dt="'+act.dt+'" data-f="'+esc(act.f)+'" data-v="'+esc(act.v)+'"'
   +' aria-pressed="'+(on?'true':'false')+'" title="'+(on?'Quitar el filtro':'Filtrar la tabla')+': '+esc(l[1])+'"':'')
 +'><span class="kpi__tile">'+ico(n,30)+'</span><div><div class="kpi__n">'+l[0]+'</div><div class="kpi__l">'+l[1]+'</div></div>'
 +'<span class="kpi__d '+dd.cls+'">'+dd.txt+'</span></'+tag+'>';}
function panel(tone,ic,tit,sub,body,accion,subR){
 return '<section class="panel"><header class="panel__head panel__head--'+tone+'">'+ico(ic,30)
 +'<div><h2>'+tit+'</h2>'+(sub?'<div class="sub">'+sub+'</div>':'')+'</div>'
 +(subR?'<div class="sub sub--r">'+subR+'</div>':'')+(accion||'')+'</header>'+body+'</section>';}
function tabla(cols,filas,vacio){
 if(!filas.length)return '<div class="empty">'+(vacio||'Sin registros para mostrar.')+'</div>';
 return '<div class="scroll-x"><table><thead><tr>'+cols.map(c=>'<th'+(c[1]==='num'?' class="num"':'')+'>'+c[0]+'</th>').join('')
 +'</tr></thead><tbody>'+filas.join('')+'</tbody></table></div>';}
function chip(mod){return '<span class="chip chip--'+(AREA_CHIP[mod]||'tinta')+'">'+ico(modIcon(mod),16)+esc(modName(mod))+'</span>';}
function pill(estado){
 const m={'Activo':'ok','Inactivo':'off','aprobado':'ok','conforme':'ok','entregado':'ok','cerrada':'ok','recibida':'ok','facturado':'ok','listo':'ok',
  'en proceso':'warn','en espera':'warn','en tránsito':'warn','parcial':'warn','solicitada':'warn','borrador':'warn','pendiente':'warn','alistado':'warn','cotizado':'warn','confirmado':'warn','en producción':'warn','aprobada':'warn','enviada':'warn',
  'rechazado':'crit','descontinuado':'off','despachado':'ok','anulada':'off',
  'completo':'ok','sin stock':'crit','sin demanda':'off'};
 return '<span class="pill pill--'+(m[estado]||'off')+'">'+esc(estado[0].toUpperCase()+estado.slice(1))+'</span>';}
function nota(txt){return '<div class="nota"><span class="dot">'+ico('info',18)+'</span><p><b>Nota:</b> '+txt+'</p><span class="firma">Calzado que<br>impulsa tus metas</span></div>';}
function barra(p,cls){return '<div class="bar '+(cls||'')+'"><i style="width:'+Math.max(0,Math.min(100,p))+'%"></i></div>';}

const secc=(mod,def)=>S.tab[mod]||def;

/* =====================================================================
   TABLA DE DATOS — buscador, filtros, orden, columnas, páginas y CSV
   Es la tabla del módulo de Producción del mockup de Logística (SICAF_S),
   escrita con las piezas de este prototipo.
   Cada tabla guarda su estado en S.dt[id] (qué buscó, qué filtró, cómo
   ordenó y en qué página va), porque al pulsar cualquier botón la pantalla
   se vuelve a dibujar entera. DT guarda la última configuración de cada
   tabla para que las acciones sepan con qué columnas y filas trabajar.

   Configuración:
     {id, filas, cols, filtros, acciones, resumen, boton, orden, tam,
      buscar, vacio, sinDatos, csv, titulo, clase,
      caja, inicial, nuevo, exportar, tams, resumenT, info}
     caja: los filtros en un botón que despliega · inicial: filtros ya puestos
     nuevo: {act,t,ic} el botón de crear · exportar: 'Excel' · tams: [10,25,50]
     resumenT(filas,e) e info(desde,cuantas,filas,e): los textos del pie
   Columna: {k, t, tipo:'num'|'moneda'|'pct'|'fecha', v:fila=>valor,
             r:fila=>html, oculta, orden:false, busca:false, ancho,
             th:'clases', td:fila=>'clases', tt:fila=>'texto al pasar el ratón'}
   Filtro:  {k, t, tipo:'select'|'fechas'|'numeros'|'texto'|'si', op:[...], v, m:(fila,val)=>bool,
             todos:'Todas', sinTodos, ancho:2, ph}
   ===================================================================== */
const DT={};                 /* configuración de cada tabla, por id */
const DT_TAMS=[5,10,25,50];  /* filas por página que ofrece el pie */

/* Estado inicial: búsqueda, filtros (los de cfg.inicial ya puestos), orden,
   página, columnas ocultas y si la caja de filtros está abierta. */
function dtEstado(id,cfg){
 if(!S.dt[id])S.dt[id]={q:'',f:Object.assign({},cfg.inicial),col:cfg.orden?cfg.orden.k:'',dir:cfg.orden?cfg.orden.dir:'',
  pag:1,tam:cfg.tam||10,ocultas:cfg.cols.filter(c=>c.oculta).map(c=>c.k),cols:false,caja:false};
 return S.dt[id];
}
/* Un filtro está puesto si tiene valor (en un rango, basta con uno de sus dos lados) */
const dtRango=fl=>fl.tipo==='fechas'||fl.tipo==='numeros';
const dtPuesto=(fl,v)=>!(v===undefined||v===null||v===''||v===false||(dtRango(fl)&&!v.de&&!v.a));
/* Valor crudo de una celda: con él se ordena, se busca y se exporta. */
const dtValor=(c,f)=>c.v?c.v(f):f[c.k];
const dtTexto=(c,f)=>{const x=dtValor(c,f);return x===null||x===undefined?'':String(x)};
const dtNum=c=>c.tipo==='num'||c.tipo==='moneda'||c.tipo==='pct';
const dtOps=fl=>(typeof fl.op==='function'?fl.op():fl.op)||[];
const dtOpV=o=>o&&o.v!==undefined?o.v:o;
const dtOpT=o=>o&&o.t!==undefined?o.t:o;
/* Valor con formato, para las columnas que no traen su propio dibujo (r). */
function dtFmt(c,f){
 const x=dtValor(c,f);
 if(x===null||x===undefined||x==='')return '<span class="muted">—</span>';
 if(c.tipo==='num')return n0(x);
 if(c.tipo==='moneda')return cop(x);
 if(c.tipo==='pct')return n2(x)+' %';
 return esc(String(x));
}
/* Filas que quedan tras la búsqueda y los filtros, ya ordenadas. */
function dtFilas(cfg,e){
 let filas=cfg.filas.slice();
 const q=norm(e.q).trim();
 if(q)filas=filas.filter(f=>cfg.cols.some(c=>c.busca!==false&&norm(dtTexto(c,f)).includes(q)));
 (cfg.filtros||[]).forEach(fl=>{
  const v=e.f[fl.k];
  if(!dtPuesto(fl,v))return;
  const col={k:fl.k,v:fl.v};
  if(fl.tipo==='fechas'){
   filas=filas.filter(f=>{const x=dtTexto(col,f);return (!v.de||x>=v.de)&&(!v.a||x<=v.a)});
  }else if(fl.tipo==='numeros'){
   filas=filas.filter(f=>{const x=Number(dtValor(col,f));return (!v.de||x>=Number(v.de))&&(!v.a||x<=Number(v.a))});
  }else if(fl.tipo==='texto'){
   filas=filas.filter(f=>norm(dtTexto(col,f)).includes(norm(v).trim()));
  }else if(fl.tipo==='si'){
   filas=filas.filter(f=>fl.m(f));
  }else{
   filas=filas.filter(f=>fl.m?fl.m(f,v):dtTexto(col,f)===String(v));
  }
 });
 if(e.col){
  const c=cfg.cols.find(x=>x.k===e.col), signo=e.dir==='desc'?-1:1;
  if(c)filas.sort((a,b)=>{
   const x=dtValor(c,a), y=dtValor(c,b);
   if(typeof x==='number'&&typeof y==='number')return (x-y)*signo;
   return String(x===null||x===undefined?'':x)
    .localeCompare(String(y===null||y===undefined?'':y),'es',{numeric:true,sensitivity:'base'})*signo;
  });
 }
 return filas;
}
/* Números de página que se dibujan: 1 … 4 5 6 … 12 */
function dtPaginas(pag,total){
 if(total<=7)return Array.from({length:total},(x,i)=>i+1);
 let a=Math.max(2,pag-1), b=Math.min(total-1,pag+1);
 if(pag<=3){a=2;b=4}
 if(pag>=total-2){a=total-3;b=total-1}
 const out=[1];
 if(a>2)out.push('…');
 for(let i=a;i<=b;i++)out.push(i);
 if(b<total-1)out.push('…');
 out.push(total);
 return out;
}
/* Rótulo de un filtro activo, para la ficha que se puede quitar. */
function dtChipTxt(fl,v){
 if(fl.tipo==='numeros')return v.de&&v.a?v.de+' a '+v.a:v.de?'desde '+v.de:'hasta '+v.a;
 if(dtRango(fl))return (v.de||'…')+' a '+(v.a||'…');
 if(fl.tipo==='si')return 'Sí';
 if(fl.tipo==='texto')return String(v);
 const o=dtOps(fl).find(x=>String(dtOpV(x))===String(v));
 return String(o===undefined?v:o.c||dtOpT(o));   /* c: el rótulo corto de la ficha, si la opción lo trae */
}
/* Con cfg.caja los filtros no van en una fila: van en un botón "Filtros" que
   despliega una condición por columna, y lo que está filtrando queda a la vista
   en fichas con su cruz (la pantalla de Órdenes de Producción). */
function cajaFiltros(cfg,e,d){
 const puestos=cfg.filtros.filter(fl=>dtPuesto(fl,e.f[fl.k]));
 const campo=fl=>{
  const v=e.f[fl.k], dch=' data-ch="dt-filtro'+d+' data-f="'+fl.k+'"';
  let control;
  if(dtRango(fl)){
   const r=v||{}, tipo=fl.tipo==='fechas'?'date':'number';
   control='<span class="fil__r"><input class="dt__in" type="'+tipo+'" value="'+esc(r.de||'')+'"'+dch
     +' data-lado="de" aria-label="'+esc(fl.t)+' desde"><span class="fil__rs">–</span>'
    +'<input class="dt__in" type="'+tipo+'" value="'+esc(r.a||'')+'"'+dch+' data-lado="a" aria-label="'+esc(fl.t)+' hasta"></span>';
  }else if(fl.tipo==='texto'){
   control='<input id="dt-'+cfg.id+'-f-'+fl.k+'" class="dt__in" type="text" value="'+esc(v||'')+'" placeholder="'+esc(fl.ph||'')+'"'
    +dch+' aria-label="'+esc(fl.t)+'">';
  }else{
   control='<select id="dt-'+cfg.id+'-f-'+fl.k+'" class="dt__in"'+dch+' aria-label="'+esc(fl.t)+'">'
    +(fl.sinTodos?'':'<option value="">'+esc(fl.todos||'Todos')+'</option>')
    +dtOps(fl).map(o=>'<option value="'+esc(dtOpV(o))+'"'+(String(dtOpV(o))===String(v===undefined?'':v)?' selected':'')+'>'
      +esc(dtOpT(o))+'</option>').join('')+'</select>';
  }
  return '<div class="fil__c'+(fl.ancho===2?' fil__c--2':'')+'"><span class="fil__l">'+esc(fl.t)+'</span>'+control+'</div>';
 };
 return '<details class="fil"'+(e.caja?' open':'')+'>'
  +'<summary class="fil__b" title="Filtrar la tabla por cualquier columna" data-act="dt-caja'+d+'>'+ico('funnel',15)+'Filtros'
   +(puestos.length?'<span class="fil__n">'+puestos.length+'</span>':'')+'</summary>'
  +'<div class="fil__caja" role="group" aria-label="Filtros de la tabla"><div class="fil__t">Una condición por columna</div>'
   +cfg.filtros.map(campo).join('')
   +'<div class="fil__pie"><span class="tiny">'+(puestos.length===1?'1 filtro puesto'
     :puestos.length?puestos.length+' filtros puestos':'Ningún filtro puesto')+'</span>'
   +(puestos.length?'<a class="fil__x" href="#" data-act="dt-limpiar'+d+'>Borrar todos</a>':'')+'</div>'
  +'</div></details>'
  +(puestos.length?'<span class="fil__act" aria-label="Filtros puestos">'+puestos.map(fl=>'<span class="fil__chip">'+esc(fl.t)
    +'<b>'+esc(dtChipTxt(fl,e.f[fl.k]))+'</b><a href="#" data-act="dt-quitar'+d+' data-f="'+esc(fl.k)+'"'
    +' title="Quitar el filtro de '+esc(fl.t)+'" aria-label="Quitar el filtro de '+esc(fl.t)+'">&times;</a></span>').join('')+'</span>':'');
}

/* Dibuja la tabla completa. */
function datatable(cfg){
 const id=cfg.id, e=dtEstado(id,cfg);
 DT[id]=cfg;
 const filas=dtFilas(cfg,e);
 const paginas=Math.max(1,Math.ceil(filas.length/e.tam));
 if(e.pag>paginas)e.pag=paginas;
 const desde=(e.pag-1)*e.tam, pagina=filas.slice(desde,desde+e.tam);
 const cols=cfg.cols.filter(c=>!e.ocultas.includes(c.k));
 const d='" data-dt="'+id+'"';

 /* 1. Barra superior: buscador y botones */
 const menuCols='<div class="dt__pop"><div class="dt__pop-h">Columnas visibles</div><div class="dt__pop-l">'
  +cfg.cols.map(c=>'<label class="dt__check"><input type="checkbox" data-ch="dt-col'+d+' data-col="'+esc(c.k)+'"'
    +(e.ocultas.includes(c.k)?'':' checked')+'><span>'+esc(c.t)+'</span></label>').join('')
  +'</div></div>';
 const exp=cfg.exportar||'CSV';
 const barra='<div class="dt__bar">'
  +'<div class="dt__q">'+ico('search',18)
   +'<input id="dt-'+id+'-q" type="text" value="'+esc(e.q)+'" autocomplete="off"'
   +' placeholder="'+esc(cfg.buscar||'Buscar en la tabla...')+'" aria-label="Buscar en la tabla" data-in="dt-q'+d+'>'
   +(e.q?'<button class="dt__qx" data-act="dt-qx'+d+' aria-label="Limpiar la búsqueda">'+ico('x',14)+'</button>':'')
  +'</div>'
  +(cfg.caja?cajaFiltros(cfg,e,d):'')
  +'<div class="dt__acts">'
   +(cfg.nuevo?'<button class="btn btn--sm" data-act="'+cfg.nuevo.act+'" title="'+esc(cfg.nuevo.title||cfg.nuevo.t)+'">'
     +ico(cfg.nuevo.ic||'plus',16)+esc(cfg.nuevo.t)+'</button>':'')
   +'<button class="dt__b'+(e.cols?' is-on':'')+'" data-act="dt-cols'+d+' aria-expanded="'+(e.cols?'true':'false')
    +'" title="Mostrar u ocultar columnas">'+ico('grid',16)+'<span>Columnas</span></button>'
   +'<button class="dt__b" data-act="dt-csv'+d+' title="Exportar a '+exp+' lo que ve en pantalla">'+ico('down',16)+'<span>Exportar '+exp+'</span></button>'
   +(cfg.boton?'<button class="dt__b dt__b--fuerte" data-act="'+cfg.boton.act+'">'+ico(cfg.boton.ic||'plus',16)+'<span>'+esc(cfg.boton.t)+'</span></button>':'')
   +(e.cols?menuCols:'')
  +'</div></div>';

 /* 2. Fila de filtros (con cfg.caja van en su caja desplegable, en la barra) */
 const filtros=!cfg.caja&&(cfg.filtros||[]).length?'<div class="dt__filtros" role="group" aria-label="Filtros de la tabla">'
  +'<span class="dt__filtros-t">'+ico('search',13)+'Filtros</span>'
  +cfg.filtros.map(fl=>{
   const v=e.f[fl.k], fid='dt-'+id+'-f-'+fl.k;
   if(fl.tipo==='fechas'){
    const r=v||{};
    return '<div class="dt__f"><span class="dt__f-l">'+esc(fl.t)+'</span><div class="dt__rango">'
     +'<input type="date" class="dt__in'+(r.de?' is-on':'')+'" value="'+esc(r.de||'')+'" data-ch="dt-filtro'+d
      +' data-f="'+fl.k+'" data-lado="de" aria-label="'+esc(fl.t)+' desde" title="Desde">'
     +'<span class="dt__rango-s">–</span>'
     +'<input type="date" class="dt__in'+(r.a?' is-on':'')+'" value="'+esc(r.a||'')+'" data-ch="dt-filtro'+d
      +' data-f="'+fl.k+'" data-lado="a" aria-label="'+esc(fl.t)+' hasta" title="Hasta">'
     +'</div></div>';
   }
   if(fl.tipo==='si')
    return '<div class="dt__f"><span class="dt__f-l">&nbsp;</span>'
     +'<label class="dt__si'+(v?' is-on':'')+'"><input type="checkbox" data-ch="dt-filtro'+d+' data-f="'+fl.k+'"'
     +(v?' checked':'')+'><span class="dt__si-p"><i></i></span><span>'+esc(fl.t)+'</span></label></div>';
   return '<div class="dt__f"><label class="dt__f-l" for="'+fid+'">'+esc(fl.t)+'</label>'
    +'<select id="'+fid+'" class="dt__in'+(v?' is-on':'')+'" data-ch="dt-filtro'+d+' data-f="'+fl.k+'">'
    +'<option value="">Todos</option>'
    +dtOps(fl).map(o=>'<option value="'+esc(dtOpV(o))+'"'+(String(dtOpV(o))===String(v||'')?' selected':'')+'>'
      +esc(dtOpT(o))+'</option>').join('')+'</select></div>';
  }).join('')+'</div>':'';

 /* 3. Fichas de lo que está filtrando ahora mismo */
 const fichas=[];
 if(e.q)fichas.push({k:'__q',t:'Búsqueda: '+e.q});
 (cfg.filtros||[]).forEach(fl=>{
  const v=e.f[fl.k];
  if(v===undefined||v===null||v===''||v===false)return;
  if(fl.tipo==='fechas'&&!v.de&&!v.a)return;
  fichas.push({k:fl.k,t:fl.t+': '+dtChipTxt(fl,v)});
 });
 const chips=!cfg.caja&&fichas.length?'<div class="dt__chips"><span class="dt__chips-t">Filtros activos</span>'
  +fichas.map(x=>'<span class="dt__chip">'+esc(x.t)
    +'<button data-act="dt-quitar'+d+' data-f="'+esc(x.k)+'" aria-label="Quitar '+esc(x.t)+'">'+ico('x',12)+'</button></span>').join('')
  +'<button class="dt__link" data-act="dt-limpiar'+d+'>Limpiar todo</button></div>':'';

 /* 4. La tabla: encabezado que ordena y filas de la página */
 const th=cols.map(c=>{
  const on=e.col===c.k, dir=on?e.dir:'';
  const cls=(dtNum(c)?'num ':'')+(c.th?c.th+' ':'')+(on?'is-on ':'')+(c.orden===false?'dt__th--txt':'');
  return '<th'+(cls.trim()?' class="'+cls.trim()+'"':'')+(c.ancho?' style="width:'+c.ancho+'"':'')
   +(on?' aria-sort="'+(dir==='desc'?'descending':'ascending')+'"':'')+'>'
   +(c.orden===false?esc(c.t)
     :'<button class="dt__orden" data-act="dt-orden'+d+' data-col="'+esc(c.k)+'" title="Ordenar por '+esc(c.t)+'">'
      +'<span>'+esc(c.t)+'</span><i class="dt__ind">'+(on?(dir==='desc'?'▼':'▲'):'⇅')+'</i></button>')
   +'</th>';
 }).join('')+(cfg.acciones?'<th class="num dt__th--txt">'+esc(cfg.accionesT||'Acciones')+'</th>':'');

 const cuerpo=pagina.length
  ? pagina.map(f=>{
     const cl=cfg.clase?cfg.clase(f):'';
     return '<tr'+(cl?' class="'+cl+'"':'')+'>'
      +cols.map(c=>{
        /* c.td: clases propias de la celda · c.tt: su texto al pasar el ratón */
        const tc=[dtNum(c)?'num':'',c.td?c.td(f):''].filter(Boolean).join(' ');
        return '<td'+(tc?' class="'+tc+'"':'')+(c.tt?' title="'+esc(c.tt(f))+'"':'')+'>'+(c.r?c.r(f):dtFmt(c,f))+'</td>';
       }).join('')
      +(cfg.acciones?'<td><div class="acts">'+cfg.acciones(f)+'</div></td>':'')+'</tr>';
    }).join('')
  : '<tr class="dt__vacio"><td colspan="'+(cols.length+(cfg.acciones?1:0))+'">'
    +'<div class="dt__vacio-c"><span>'+ico(cfg.filas.length?'search':'clip',30)+'</span><b>'
    +esc(cfg.filas.length?(cfg.vacio||'Ningún registro coincide con la búsqueda o los filtros.')
                         :(cfg.sinDatos||'Todavía no hay registros para mostrar.'))+'</b>'
    +(cfg.filas.length?'<button class="dt__link" data-act="dt-limpiar'+d+'>Quitar los filtros</button>':'')
    +'</div></td></tr>';

 /* 5. Totales de TODAS las filas filtradas, no solo de la página */
 const res=cfg.resumen?cfg.resumen(filas):null;
 const resumen=res&&res.length?'<div class="dt__res"><span class="dt__res-t">Totales'
   +'<em>'+(cfg.resumenT?cfg.resumenT(filas,e):'de los '+n0(filas.length)+' registro(s) filtrados')+'</em></span>'
   +res.map(r=>'<span class="dt__res-i'+(r.tono?' dt__res-i--'+r.tono:'')+'"><b>'+esc(r.t)+'</b><span>'+r.v+'</span></span>').join('')
   +'</div>':'';

 /* 6. Pie: cuántas filas se ven, tamaño de página y paginador */
 const info=cfg.info?cfg.info(desde,pagina.length,filas,e):filas.length
  ? 'Mostrando <b>'+n0(desde+1)+'–'+n0(desde+pagina.length)+'</b> de <b>'+n0(filas.length)+'</b> registro(s)'
    +(filas.length!==cfg.filas.length?' <span class="muted">(de '+n0(cfg.filas.length)+' en total)</span>':'')
  : 'Sin registros que mostrar'+(cfg.filas.length?' <span class="muted">(de '+n0(cfg.filas.length)+' en total)</span>':'');
 const pag=n=>'<button class="dt__pag'+(n===e.pag?' is-on':'')+'" data-act="dt-pag'+d+' data-p="'+n+'"'
  +(n===e.pag?' aria-current="page"':'')+'>'+n+'</button>';
 const salto=(n,txt,off)=>'<button class="dt__pag dt__pag--n" data-act="dt-pag'+d+' data-p="'+n+'"'
  +(off?' disabled':'')+' aria-label="'+txt+'">'+txt+'</button>';
 const pie='<div class="dt__pie"><div class="dt__info" aria-live="polite">'+info+'</div>'
  +'<div class="dt__pieR"><label class="dt__tam" for="dt-'+id+'-tam">Filas por página'
   +'<select id="dt-'+id+'-tam" class="dt__in" data-ch="dt-tam'+d+'>'
   +[...new Set((cfg.tams||DT_TAMS).concat(e.tam))].sort((a,b)=>a-b)
     .map(n=>'<option value="'+n+'"'+(n===e.tam?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'
  +'<nav class="dt__pager" aria-label="Paginación">'
   +salto(e.pag-1,'‹',e.pag<=1)
   +dtPaginas(e.pag,paginas).map(n=>n==='…'?'<span class="dt__elip">…</span>':pag(n)).join('')
   +salto(e.pag+1,'›',e.pag>=paginas)
  +'</nav></div></div>';

 return '<div class="dt'+(cfg.acciones?' dt--acc':'')+'" id="dt-'+id+'">'+barra+filtros+chips
  +'<div class="dt__scroll"><table>'
  +'<thead><tr>'+th+'</tr></thead><tbody>'+cuerpo+'</tbody></table></div>'
  +resumen+pie+'</div>';
}
/* Descarga un archivo de texto (el CSV que exporta la tabla). */
function descargar(nombre,texto){
 const a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob(['﻿'+texto],{type:'text/csv;charset=utf-8'}));
 a.download=nombre; a.click(); URL.revokeObjectURL(a.href);
}

/* ---------- Bandeja de notificaciones ---------- */
function notiItem(n,conAcciones){
 const puede=puedeVer(n.para)||puedeVer(n.de);
 return '<article class="noti noti--'+NIVEL[n.nivel]+(n.leida?' is-read':'')+'">'
 +'<span class="noti__ic">'+ico(n.nivel==='urgente'?'alert':n.nivel==='aviso'?'info':'check',18)+'</span>'
 +'<div class="noti__b"><div class="noti__ruta">'+chip(n.de)+ico('arrow',14)+chip(n.para)+(n.ref?'<span class="noti__ref">'+esc(n.ref)+'</span>':'')+'</div>'
 +'<b>'+esc(n.t)+'</b><p>'+esc(n.d)+'</p>'
 +'<div class="noti__pie"><span class="tiny">'+n.fecha+'</span>'
 +(conAcciones&&!n.leida?'<span class="acts">'
   +(puede&&n.para!==S.vista?'<button class="btn btn--sm btn--ghost" data-act="noti-ir" data-id="'+n.id+'">Abrir '+esc(modName(n.para))+'</button>':'')
   +'<button class="btn btn--sm btn--oliva" data-act="noti-leida" data-id="'+n.id+'">Marcar atendida</button></span>':'')
 +'</div></div></article>';
}

/* ---------- Modal ---------- */
let modalOK=null;
function modal(tit,body,okTxt,onOK,tone){
 modalOK=onOK;
 $('#modalHost').innerHTML='<div class="overlay" data-act="cerrar-modal"><div class="modal" role="dialog" aria-modal="true" aria-label="'+esc(tit)+'" data-stop>'
 +'<header class="modal__head"><h3>'+esc(tit)+'</h3><button data-act="cerrar-modal" aria-label="Cerrar">'+ico('x',22)+'</button></header>'
 +'<div class="modal__body">'+body+'</div>'
 +(okTxt?'<div class="modal__foot"><button class="btn btn--ghost btn--sm" data-act="cerrar-modal">Cancelar</button><button class="btn btn--sm '+(tone||'')+'" data-act="modal-ok">'+esc(okTxt)+'</button></div>':'')
 +'</div></div>';
 const f=$('#modalHost input,#modalHost select,#modalHost textarea'); if(f)f.focus();
}
function cerrarModal(){$('#modalHost').innerHTML='';modalOK=null;}

/* ---------- Fila de indicadores de Producción ---------- */
const KPIROW={
 produccion(){const act=S.op.filter(o=>o.estado!=='cerrada'),
  espera=S.op.filter(o=>o.estado==='en espera').length,
  enProc=act.reduce((a,o)=>a+o.cant,0),
  avg=act.length?act.reduce((a,o)=>a+avance(o),0)/act.length:0;
  return kpi('arena','gear',[act.length,'Órdenes en curso'],delta(act.length,21))
   +kpi('rosa','alert',[espera,'En espera de material'],delta(espera,4,true))
   +kpi('oliva','box',[n0(enProc),'Pares programados'],delta(enProc,3860))
   +kpi('cobre','bars',[n0(avg)+' %','Avance promedio'],delta(avg,31));}
};

/* =====================================================================
   VISTAS POR MÓDULO
   Aquí solo se dibuja Producción. Los demás módulos se ven con su propio
   mockup (ver MOCKUPS DE LOS MÓDULOS, más abajo).
   ===================================================================== */
const V={};

/* ---------- 5. PRODUCCIÓN ---------- */
const costoMerma=m=>{const mod=S.modelos.find(x=>x.ref===m.ref);return mod?m.cant*costoPar(m.ref):m.cant*(insumo(m.ref).costo||0);};
function avance(o){return o.etapas.reduce((a,e)=>a+(e.cerrada?1:0),0)/o.etapas.length*100;}
/* Ayudantes que comparten las pantallas de Producción */
const modelo=ref=>S.modelos.find(x=>x.ref===ref)||{nom:''};
const atrasada=o=>o.estado!=='cerrada'&&o.compromiso<hoy();
const perdidas=o=>o.etapas.reduce((a,e)=>a+e.perd,0);
const procesados=o=>{const c=o.etapas.filter(e=>e.cerrada);return c.length?c[c.length-1].proc:0};
/* Los seis procesos del módulo. Se dibujan en el menú lateral como
   sub-menú desplegable (el contador aparece a la derecha del nombre). */
/* =====================================================================
   PANEL DEL MÓDULO DE PRODUCCIÓN
   Una pestaña por proceso; cada una cabe en la pantalla: dos gráficas de
   sus estadísticas y, al lado, la tabla con los registros que las forman.
   Al pulsar una barra se filtra por ese dato (y el filtro viaja a la
   tabla completa del proceso).
   ===================================================================== */
const COL_GRAF=['var(--cobre-600)','var(--vino-600)','var(--oliva-600)','var(--cobre-400)','var(--rosa-300)','var(--tinta-3)'];
const COL_ESTADO={'en proceso':'var(--warn)','en espera':'var(--crit)','cerrada':'var(--ok)','pendiente':'var(--warn)',
 'aprobado':'var(--ok)','rechazado':'var(--crit)','completo':'var(--ok)','parcial':'var(--warn)',
 'sin stock':'var(--crit)','sin demanda':'var(--tinta-3)'};
const colorDe=(t,i)=>COL_ESTADO[t]||COL_GRAF[i%COL_GRAF.length];

/* Datos que comparten el panel y las tablas del módulo */
function regsEtapas(){
 const r=[];
 S.op.forEach(o=>o.etapas.forEach((e,ix)=>r.push({
  id:o.id+' · '+e.n, op:o.id, ref:o.ref, etapa:e.n, orden:ix+1,
  rec:e.rec, proc:e.proc, perd:e.perd,
  estado:e.cerrada?'cerrada':(o.liberada&&o.estado==='en proceso'&&o.etapa===ix?'en proceso':'pendiente'),
  maquina:(S.maquinas.find(m=>m.area===e.n)||{nom:'Sin máquina asignada'}).nom
 })));
 return r;
}
function costosFilas(){
 return S.op.map(o=>{
  const plan=costoPar(o.ref)*o.cant;
  const merma=S.merma.filter(m=>m.doc===o.id).reduce((a,m)=>a+costoMerma(m),0);
  const real=(o.liberada?plan:0)+merma;
  return {id:o.id,ref:o.ref,nom:modelo(o.ref).nom,cant:o.cant,estado:o.estado,plan,merma,real,
   unit:o.cant?real/o.cant:0};
 });
}
function operariosFilas(){
 const por={};
 S.tiempos.forEach(x=>{const o=por[x.operario]=por[x.operario]||{h:0,u:0,n:0};o.h+=x.horas;o.u+=x.und;o.n++;});
 return Object.keys(por).map(nom=>({nom,h:por[nom].h,u:por[nom].u,n:por[nom].n,
  rend:por[nom].h?por[nom].u/por[nom].h:0}));
}
/* Suma agrupando por un campo: devuelve [{t,v}] ordenado de mayor a menor */
function agrupar(filas,campo,valor,orden){
 const m={};
 filas.forEach(f=>{const k=String(campo(f));m[k]=(m[k]||0)+(valor?valor(f):1)});
 const out=Object.keys(m).map(k=>({t:k,v:m[k]}));
 return orden===false?out:out.sort((a,b)=>b.v-a.v);
}

/* Gráfica de barras: cada barra es un botón que filtra por su valor */
function gbarras(g,fl,dt){
 const tot=g.datos.reduce((a,d)=>a+d.v,0);
 g.datos=g.datos.slice(0,8);            /* ocho barras como máximo */
 const max=Math.max(1,...g.datos.map(d=>d.v));
 return '<article class="graf"><header class="graf__h">'+ico(g.ic||'bars',17)+'<b>'+esc(g.t)+'</b>'
  +'<span class="graf__t">'+(g.tot!==undefined?g.tot:(g.fmt?g.fmt(tot):n0(tot)+(g.u?' '+g.u:'')))+'</span></header>'
  +'<div class="gbar">'+(g.datos.length?g.datos.map((d,i)=>{
    /* Solo se apaga el resto de barras de la gráfica donde se pulsó */
    const mia=!!(fl&&fl.c===g.campo), on=!!(mia&&String(fl.v)===String(d.t));
    return '<button class="gbar__i'+(on?' is-on':'')+(mia&&!on?' is-off':'')+'"'
     +' data-act="graf-f" data-dt="'+dt+'" data-c="'+esc(g.campo)+'" data-v="'+esc(d.t)+'"'
     +' title="'+(on?'Quitar el filtro de ':'Filtrar por ')+esc(d.t)+'">'
     +'<span class="gbar__t">'+esc(d.n||d.t)+'</span>'
     +'<span class="gbar__b"><i style="width:'+Math.max(2,d.v/max*100)+'%;background:'+(d.c||colorDe(d.t,i))+'"></i></span>'
     +'<b>'+(g.fmt?g.fmt(d.v):n0(d.v))+'</b></button>';
   }).join(''):'<p class="tiny" style="padding:8px 2px">Sin datos todavía.</p>')+'</div></article>';
}

/* Las dos gráficas de cada proceso. Se dibujan encima de su tabla y, al pulsar
   una barra, filtran esa misma tabla. */
const PANEL={
 ordenes(){
  const est=[...new Set(S.op.map(o=>o.estado))];
  return {
   g1:{t:'Órdenes por estado',ic:'clip',u:'orden(es)',campo:'estado',
    datos:est.map(e=>({t:e,v:S.op.filter(o=>o.estado===e).length}))},
   g2:{t:'Pares por modelo',ic:'box',u:'pares',campo:'ref',
    datos:agrupar(S.op,o=>o.ref,o=>o.cant).map(d=>({t:d.t,v:d.v,n:d.t+' · '+modelo(d.t).nom}))}};
 },
 bom(){
  const l=lineasBOM(), dem=l.filter(x=>x.req>0);
  const peores=(dem.length?dem:l).slice().sort((a,b)=>a.cobertura-b.cobertura).slice(0,8);
  return {
   g1:{t:'Líneas por cobertura',ic:'box',u:'línea(s)',campo:'estado',datos:agrupar(l,x=>x.estado)},
   g2:{t:'Insumos con menor cobertura',ic:'alert',campo:'cod',fmt:v=>n0(v)+' %',
    tot:n0(l.filter(x=>x.falta>0).length)+' sin cobertura',
    datos:peores.map(x=>({t:x.cod,v:Math.round(x.cobertura),n:x.cod+' · '+x.insumo,
      c:x.cobertura>=100?'var(--ok)':x.cobertura?'var(--warn)':'var(--crit)'}))}};
 },
 etapas(){
  const r=regsEtapas();
  return {
   g1:{t:'Pares procesados por etapa',ic:'gear',u:'pares',campo:'etapa',
    datos:agrupar(r,x=>x.etapa,x=>x.proc,false)},
   g2:{t:'Etapas por estado',ic:'check',u:'etapa(s)',campo:'estado',datos:agrupar(r,x=>x.estado)}};
 },
 merma(){
  const m=S.merma.filter(x=>x.origen==='produccion');
  return {
   g1:{t:'Merma por etapa',ic:'gear',u:'und.',campo:'etapa',
    datos:agrupar(m,x=>x.etapa||'—',x=>x.cant).map(d=>({t:d.t,v:d.v,c:'var(--crit)'}))},
   g2:{t:'Merma por causa',ic:'alert',u:'und.',campo:'causa',datos:agrupar(m,x=>x.causa,x=>x.cant)}};
 },
 tiempos(){
  return {
   g1:{t:'Horas por etapa',ic:'gear',u:'h',campo:'etapa',fmt:v=>n2(v),
    datos:agrupar(S.tiempos,x=>x.etapa,x=>x.horas,false)},
   g2:{t:'Unidades por operario',ic:'users',u:'und.',campo:'operario',
    datos:agrupar(S.tiempos,x=>x.operario,x=>x.und)}};
 },
 calidad(){
  const conf=l=>l.cant?l.conf/l.cant*100:0;
  return {
   g1:{t:'Lotes por estado',ic:'flask',u:'lote(s)',campo:'estado',datos:agrupar(S.lotes,l=>l.estado)},
   g2:{t:'Conformidad por lote',ic:'check',campo:'id',fmt:v=>n2(v)+' %',
    tot:'umbral '+S.UMBRAL_CALIDAD+' %',
    datos:S.lotes.filter(l=>l.estado!=='pendiente').map(l=>({t:l.id,v:conf(l),
      c:conf(l)>=S.UMBRAL_CALIDAD?'var(--ok)':'var(--crit)'}))}};
 },
 prod(){
  const g=operariosFilas();
  return {
   g1:{t:'Unidades por operario',ic:'users',u:'und.',campo:'nom',datos:agrupar(g,x=>x.nom,x=>x.u)},
   g2:{t:'Rendimiento por operario',ic:'bars',campo:'nom',fmt:v=>n2(v)+' und/h',
    tot:n2(g.reduce((a,x)=>a+x.h,0)?g.reduce((a,x)=>a+x.u,0)/g.reduce((a,x)=>a+x.h,0):0)+' und/h',
    datos:g.map(x=>({t:x.nom,v:x.rend,c:'var(--oliva-600)'})).sort((a,b)=>b.v-a.v)}};
 },
 costos(){
  const c=costosFilas();
  return {
   g1:{t:'Costo real por orden',ic:'tag',campo:'id',fmt:v=>cop(v),
    tot:cop(c.reduce((a,x)=>a+x.real,0)),
    datos:c.map(x=>({t:x.id,v:x.real})).sort((a,b)=>b.v-a.v)},
   g2:{t:'Costo de material por par',ic:'box',campo:'ref',fmt:v=>cop(v),tot:'según la BOM',
    datos:S.modelos.filter(m=>c.some(x=>x.ref===m.ref)).map(m=>({t:m.ref,v:costoPar(m.ref),n:m.ref+' · '+m.nom}))}};
 }
};
/* Las dos gráficas de un proceso, con el filtro que tenga puesta su tabla */
function graficasProc(sub){
 if(!PANEL[sub])return '';
 const P=PANEL[sub](), tid=TID[sub], e=S.dt[tid];
 const activo=c=>e&&e.f[c]!==undefined&&e.f[c]!==''&&e.f[c]!==false?{c,v:e.f[c]}:null;
 return '<div class="grafs2">'+gbarras(P.g1,activo(P.g1.campo),tid)+gbarras(P.g2,activo(P.g2.campo),tid)+'</div>';
}

/* MOSAICO DEL PANEL — una tarjeta por proceso con su cifra y su mini-gráfica */
const MOSAICO=[
 {id:'ordenes',ic:'clip',t:'Órdenes',
  n:()=>n0(S.op.filter(o=>o.estado!=='cerrada').length),s:()=>'en curso de '+n0(S.op.length),
  g:()=>agrupar(S.op,o=>o.estado)},
 {id:'bom',ic:'box',t:'Val. BOM',
  n:()=>n0(lineasBOM().filter(l=>l.falta>0).length),s:()=>'sin cobertura de '+n0(lineasBOM().length),
  g:()=>agrupar(lineasBOM(),l=>l.estado)},
 {id:'etapas',ic:'gear',t:'Etapas',
  n:()=>n0(S.op.reduce((a,o)=>a+procesados(o),0)),s:()=>'pares procesados',
  g:()=>agrupar(regsEtapas(),x=>x.etapa,x=>x.proc,false)},
 {id:'merma',ic:'alert',t:'Pérdidas',
  n:()=>n0(S.merma.filter(m=>m.origen==='produccion').reduce((a,m)=>a+m.cant,0)),s:()=>'unidades perdidas',
  g:()=>agrupar(S.merma.filter(m=>m.origen==='produccion'),m=>m.causa,m=>m.cant)},
 {id:'tiempos',ic:'reloj',t:'Tiempos',
  n:()=>n2(S.tiempos.reduce((a,x)=>a+x.horas,0)),s:()=>'horas registradas',
  g:()=>agrupar(S.tiempos,x=>x.etapa,x=>x.horas,false)},
 {id:'calidad',ic:'flask',t:'Calidad',
  n:()=>{const c=S.lotes.filter(l=>l.estado!=='pendiente');
   const u=c.reduce((a,l)=>a+l.cant,0);return n2(u?c.reduce((a,l)=>a+l.conf,0)/u*100:0)+' %'},
  s:()=>'de conformidad',
  g:()=>agrupar(S.lotes,l=>l.estado)},
 {id:'prod',ic:'users',t:'Productividad',
  n:()=>{const g=operariosFilas(),h=g.reduce((a,x)=>a+x.h,0);
   return n2(h?g.reduce((a,x)=>a+x.u,0)/h:0)},s:()=>'unidades por hora',
  g:()=>agrupar(operariosFilas(),x=>x.nom,x=>x.u)},
 {id:'costos',ic:'tag',t:'Costos',
  n:()=>cop(costosFilas().reduce((a,x)=>a+x.real,0)),s:()=>'de costo real',
  g:()=>costosFilas().map(x=>({t:x.id,v:x.real})).sort((a,b)=>b.v-a.v)}
];
/* Mini-gráfica de la tarjeta: cuatro barras, sin ejes ni números de más */
function minibarras(datos){
 const d=datos.slice(0,3), max=Math.max(1,...d.map(x=>x.v));
 return '<span class="minib">'+d.map((x,i)=>'<span class="minib__i">'
   +'<span class="minib__t">'+esc(x.t)+'</span>'
   +'<span class="minib__b"><i style="width:'+Math.max(3,x.v/max*100)+'%;background:'+(x.c||colorDe(x.t,i))+'"></i></span>'
   +'<b>'+n0(x.v)+'</b></span>').join('')+'</span>';
}
/* El panel: indicadores, el flujo, cómo va, los pendientes y las ocho tarjetas */
function panelMosaico(){
 const planeado=S.op.reduce((a,o)=>a+o.cant,0);
 const proc=S.op.reduce((a,o)=>a+procesados(o),0);
 const perd=S.op.reduce((a,o)=>a+perdidas(o),0);
 const enCurso=S.op.filter(o=>o.estado!=='cerrada');
 const avg=enCurso.length?enCurso.reduce((a,o)=>a+avance(o),0)/enCurso.length:0;
 const tasa=proc+perd?perd/(proc+perd)*100:0;
 const ETA=['Corte','Guarnición','Montaje','Terminado'];
 const paso=(filas,u1,uN)=>({p:filas.reduce((a,x)=>a+x.cant,0),n:filas.length,
  ud:filas.length===1?u1:uN});
 const enPaso=[
  paso(S.op.filter(o=>!o.liberada&&o.estado!=='en espera'),'orden','órdenes'),
  paso(S.op.filter(o=>o.estado==='en espera'),'orden','órdenes'),
  ...ETA.map(n=>paso(S.op.filter(o=>o.liberada&&o.estado==='en proceso'&&o.etapas[o.etapa]&&o.etapas[o.etapa].n===n),'orden','órdenes')),
  paso(S.lotes.filter(l=>l.estado==='pendiente'),'lote','lotes')
 ];
 const aro=(p,txt,sub,cls)=>'<div class="gauge__w"><div class="gauge '+(cls||'')+'" style="--p:'+Math.max(0,Math.min(100,p))+'"><i>'+txt+'</i></div><b>'+esc(sub)+'</b></div>';
 /* El flujo, en zigzag y con el color de cada paso */
 const PASO_TAB=['ordenes','bom','etapas','etapas','etapas','etapas','calidad'];
 /* Gráfica de columnas: cantidad (eje Y) por paso del proceso (eje X).
    El eje X va en el orden del proceso, así que de izquierda a derecha se lee el
    flujo; cada paso lleva su color y la columna más alta se rotula. */
 const COL_FLUJO=['var(--paso-1)','var(--paso-2)','var(--paso-3)','var(--paso-4)',
  'var(--paso-5)','var(--paso-6)','var(--paso-8)'];
 const maxP=Math.max(1,...enPaso.map(x=>x.p));
 /* El techo deja aire sobre la columna más alta (así cabe su globo) y es
    múltiplo de 300, para que las tres marcas del eje sean redondas. */
 const techo=Math.max(300,Math.ceil(maxP*1.15/300)*300);
 const marcas=[techo,Math.round(techo*2/3),Math.round(techo/3),0];
 const cols=enPaso.map((x,i)=>{
  const top=x.p===maxP&&x.p>0;
  return '<button class="colg__b'+(top?' is-top':'')+'" style="--c:'+COL_FLUJO[i]+'"'
   +' data-act="ir-tab" data-mod="produccion" data-tab="'+PASO_TAB[i]+'"'
   +' title="'+esc(PIPELINE[i])+': '+n0(x.p)+' pares en '+n0(x.n)+' '+x.ud
   +(top?' · es donde más trabajo hay':'')+'">'
   +'<span class="colg__t"><i style="height:'+Math.max(1,x.p/techo*100)+'%">'
    +'<em class="colg__tip">'+n0(x.p)+' pares<small>'+n0(x.n)+' '+x.ud+'</small></em></i></span>'
   +'<span class="colg__x">'+esc(PIPELINE_CORTO[i])+'</span></button>';
 }).join('');
 const flujo='<div class="colg">'
  +'<div class="colg__y">'+marcas.map(m=>'<span>'+n0(m)+'</span>').join('')+'</div>'
  +'<div class="colg__p"><span class="colg__g">'
   +marcas.map((m,i)=>'<i style="bottom:'+(100-i*33.34)+'%"></i>').join('')
  +'</span>'+cols+'</div></div>';

 /* Todo lo que espera una decisión, registro por registro */
 const pend=[];
 const npend=pendientes('produccion').length;
 if(npend)pend.push({n:'info',ic:'bell',t:n0(npend)+' aviso(s) de otros módulos',
  d:'Diseño, Compras o Calidad necesitan algo de Producción.',act:'alertas'});
 S.op.filter(o=>o.estado==='en espera').forEach(o=>pend.push({n:'warn',ic:'alert',
  t:o.id+' en espera de material',d:n0(o.cant)+' pares de '+o.ref+' · Compras ya fue notificado',ir:'ordenes'}));
 lineasBOM().filter(l=>l.falta>0).sort((a,b)=>a.cobertura-b.cobertura).forEach(l=>pend.push({n:'crit',ic:'box',
  t:'Falta '+l.insumo+' para '+l.ref,d:'Faltan '+n2(l.falta)+' '+l.un+' · cobertura '+n0(l.cobertura)+' %',ir:'bom'}));
 S.op.filter(atrasada).forEach(o=>pend.push({n:'crit',ic:'clip',t:o.id+' fuera de fecha',
  d:'Compromiso '+o.compromiso+' · '+n0(avance(o))+' % de avance',ir:'ordenes'}));
 S.maquinas.filter(m=>m.estado!=='operativa').forEach(m=>pend.push({n:m.estado==='averiada'?'crit':'warn',ic:'gear',
  t:m.nom+' · '+m.estado,d:'Etapa '+m.area+(m.falla?' · '+m.falla:' · vuelve el '+m.prox),ir:'etapas'}));
 S.lotes.filter(l=>l.estado==='pendiente').forEach(l=>pend.push({n:'info',ic:'flask',
  t:l.id+' esperando inspección',d:n0(l.cant)+' pares de '+l.ref+' · orden '+l.op,ir:'calidad'}));
 if(tasa>3)pend.push({n:'warn',ic:'alert',t:'La merma va en '+n2(tasa)+' %',
  d:'Por encima de la meta del módulo, que es 3 %.',ir:'merma'});
 const lista=pend.length?pend.map(x=>'<button class="pend__i pend__i--'+x.n+'"'
   +(x.act?' data-act="'+x.act+'"':' data-act="ir-tab" data-mod="produccion" data-tab="'+x.ir+'"')+'>'
   +'<span class="pend__ic">'+ico(x.ic,17)+'</span>'
   +'<span class="pend__x"><b>'+esc(x.t)+'</b><small>'+esc(x.d)+'</small></span>'
   +'<span class="pend__v">'+ico('chev',16)+'</span></button>').join('')
  :'<div class="aviso aviso--ok">'+ico('check',20)+'<div><b>Producción al día</b><p>Ningún proceso tiene pendientes que necesiten una decisión.</p></div></div>';

 /* Las ocho tarjetas, de dos en dos, en un carrusel */
 const tile=m=>'<button class="mtile" data-act="ir-tab" data-mod="produccion" data-tab="'+m.id+'">'
  +'<span class="mtile__h">'+ico(m.ic,16)+esc(m.t)+'</span>'
  +'<span class="mtile__n">'+m.n()+'</span><span class="mtile__s">'+esc(m.s())+'</span>'
  +minibarras(m.g())
  +'<span class="mtile__ir">Ver el proceso'+ico('arrow',13)+'</span></button>';
 const pags=[];
 for(let i=0;i<MOSAICO.length;i+=2)pags.push(MOSAICO.slice(i,i+2));
 const pag=Math.max(0,Math.min(pags.length-1,S.mosPag||0));
 const carrusel='<article class="graf mosli"><header class="graf__h">'+ico('grid',17)+'<b>Los ocho procesos</b>'
  +'<span class="graf__t">'+(pag+1)+' de '+pags.length+'</span>'
  +'<button class="mosli__b" data-act="mos-pag" data-p="-1" aria-label="Procesos anteriores"'
   +(pag===0?' disabled':'')+'>'+ico('chev',17)+'</button>'
  +'<button class="mosli__b mosli__b--sig" data-act="mos-pag" data-p="1" aria-label="Siguientes procesos"'
   +(pag===pags.length-1?' disabled':'')+'>'+ico('chev',17)+'</button></header>'
  +'<div class="mosli__v"><div class="mosli__t" id="mosTrack" style="transform:translateX(-'+(pag*100)+'%)">'
   +pags.map(g=>'<div class="mosli__p">'+g.map(tile).join('')+'</div>').join('')
  +'</div></div>'
  +'<div class="mosli__d">'+pags.map((g,i)=>'<button class="mosli__pt'+(i===pag?' is-on':'')+'"'
    +' data-act="mos-ir" data-p="'+i+'" aria-label="Procesos '+(i+1)+'"></button>').join('')+'</div>'
  +'</article>';

 return '<div class="kpis">'+KPIROW.produccion()+'</div>'
  +'<div class="mos">'
   +'<div class="mos__col">'
    +'<article class="graf graf--flujo"><header class="graf__h">'+ico('ruta',17)+'<b>Flujo de producción</b>'
     +'<span class="graf__t">pares en cada paso</span></header>'+flujo+'</article>'
    +'<article class="graf"><header class="graf__h">'+ico('bars',17)+'<b>Cómo va la producción</b>'
     +'<span class="graf__t">'+n0(planeado)+' pares planeados</span></header>'
     +'<div class="gauges">'
      +aro(planeado?proc/planeado*100:0,n0(planeado?proc/planeado*100:0)+' %','Cuánto se produjo','gauge--ok')
      +aro(tasa,n2(tasa)+' %','Cuánto se perdió',tasa>3?'gauge--crit':'')
      +aro(avg,n0(avg)+' %','Avance de las órdenes')
     +'</div></article>'
    +carrusel
   +'</div>'
   +'<section class="panel pend__card"><header class="panel__head panel__head--pend">'+ico('bandeja',20)
    +'<div><h2>Pendientes del módulo</h2><div class="sub">Lo que necesita una decisión hoy</div></div>'
    +'<span class="ghostbtn" style="pointer-events:none">'+n0(pend.length)+'</span></header>'
    +'<div class="panel__body pend">'+lista+'</div></section>'
  +'</div>';
}

/* Los nueve pasos del proceso de Producción. Cada uno dice qué se hace, a qué
   tabla lleva y cómo va hoy (la cifra sale del estado, no está escrita). */
const PASOS=[
 {ic:'clip',t:'Generación de orden',ir:'ordenes',irT:'Órdenes',
  l:['Registrar producto y meta','Pedido comercial o proyección de stock','Estado: pendiente'],
  hoy:()=>n0(S.op.length)+' órdenes registradas · '+n0(S.op.filter(o=>!o.liberada).length)+' sin liberar'},
 {ic:'search',t:'Validación y BOM',ir:'bom',irT:'Val. BOM',
  l:['Validar la lista de materiales','Verificar campos completos','Habilitar la verificación'],
  hoy:()=>n0(lineasBOM().length)+' líneas de BOM · '+n0(S.modelos.filter(m=>m.estado==='aprobado').length)+' modelos aprobados'},
 {ic:'box',t:'Existencias de insumos',ir:'bom',irT:'Val. BOM',
  l:['Comparar contra Inventario','Si falta: solicitud a Compras','Estado: pendiente de materiales'],
  hoy:()=>{const f=lineasBOM().filter(l=>l.falta>0).length;
   return f?n0(f)+' insumo(s) sin cobertura':'Todos los insumos con cobertura'}},
 {ic:'lock',t:'Liberación de la orden',ir:'ordenes',irT:'Órdenes',
  l:['Confirmar stock disponible','Registrar la reserva en Inventario','Estado: liberada'],
  hoy:()=>n0(S.op.filter(o=>o.liberada).length)+' liberadas · '+n0(S.op.filter(o=>o.estado==='en espera').length)+' en espera'},
 {ic:'gear',t:'Ejecución por etapas',ir:'etapas',irT:'Etapas',
  l:['Corte → Guarnición','Montaje → Terminado','Asignar operario y fecha'],
  hoy:()=>n0(S.op.filter(o=>o.estado==='en proceso').length)+' órdenes en planta'},
 {ic:'bars',t:'Control de cantidades',ir:'etapas',irT:'Etapas',
  l:['Recibido = procesado + merma','Bloquear sobreproducción','Cerrar etapa para avanzar'],
  hoy:()=>n0(S.op.reduce((a,o)=>a+procesados(o),0))+' pares procesados · '+n0(S.op.reduce((a,o)=>a+perdidas(o),0))+' de merma'},
 {ic:'clip',t:'Cierre y avance',ir:'tiempos',irT:'Tiempos',
  l:['Calcular el avance real','Comparar real contra planeado','Estado: terminada'],
  hoy:()=>{const a=S.op.filter(o=>o.estado!=='cerrada');
   return n2(S.tiempos.reduce((x,t)=>x+t.horas,0))+' h registradas · avance '
    +n0(a.length?a.reduce((x,o)=>x+avance(o),0)/a.length:0)+' %'}},
 {ic:'check',t:'Envío a calidad',ir:'calidad',irT:'Calidad',
  l:['Validar las cuatro etapas cerradas','Pasar el lote a inspección','Estado: pendiente de calidad'],
  hoy:()=>n0(S.lotes.filter(l=>l.estado==='pendiente').length)+' lote(s) esperando inspección'},
 {ic:'alert',t:'Pérdidas y reproceso',ir:'merma',irT:'Pérdidas',
  l:['Registrar la causa de la merma','Rechazo: envío a reproceso','Anular, nunca eliminar'],
  hoy:()=>{const m=S.merma.filter(x=>x.origen==='produccion');
   return n0(m.reduce((a,x)=>a+x.cant,0))+' unidades perdidas · '+cop(m.reduce((a,x)=>a+costoMerma(x),0))}}
];

/* Lienzo del proceso: nueve nodos en zigzag (3 · 3 · 3) unidos por flechas.
   Al pulsar uno se muestra su detalle al lado; el nodo no navega solo. */
function lienzoProceso(){
 const sel=S.pasoSel||1;
 const nodo=i=>{
  const p=PASOS[i];
  return '<button class="wfc__n'+(i+1===sel?' is-sel':'')+'" style="--pc:var(--paso-'+(i+1)+')"'
   +' data-act="paso" data-p="'+(i+1)+'" aria-pressed="'+(i+1===sel?'true':'false')+'">'
   +'<span class="wfc__num">'+(i+1)+'</span>'+ico(p.ic,20)
   +'<b>'+esc(p.t)+'</b></button>';
 };
 const fila=(ini,rev)=>{
  let h='';
  for(let i=ini;i<ini+3;i++){
   if(i>ini)h+='<i class="wfc__l" aria-hidden="true"></i>';
   h+=nodo(i);
  }
  return '<div class="wfc__f'+(rev?' wfc__f--rev':'')+'">'+h+'</div>';
 };
 const baja=lado=>'<div class="wfc__baja wfc__baja--'+lado+'" aria-hidden="true"><i class="wfc__v"></i></div>';
 return '<div class="wfc">'+fila(0,false)+baja('der')+fila(3,true)+baja('izq')+fila(6,false)+'</div>';
}
/* Detalle del paso elegido: qué hace, cómo va hoy y a qué tabla lleva */
function detallePaso(){
 const i=(S.pasoSel||1)-1, p=PASOS[i];
 return '<section class="panel pasod" style="--pc:var(--paso-'+(i+1)+')">'
  +'<header class="panel__head panel__head--paso">'
  +ico(p.ic,24)+'<div><h2>'+esc(p.t)+'</h2><div class="sub">Paso '+(i+1)+' de 9 · se registra en '+esc(p.irT)+'</div></div></header>'
  +'<div class="panel__body pasod__b">'
   +'<ul class="pasod__l">'+p.l.map(x=>'<li>'+ico('check',15)+esc(x)+'</li>').join('')+'</ul>'
   +'<div class="pasod__hoy"><span>Cómo va hoy</span><b>'+p.hoy()+'</b></div>'
   +'<button class="btn btn--sm" data-act="ir-tab" data-mod="produccion" data-tab="'+p.ir+'">'
    +ico('arrow',17)+'Ver '+esc(p.irT)+'</button>'
   +'<p class="tiny">Pulse otro nodo del lienzo para ver su detalle. Las flechas marcan el orden: un paso no empieza hasta que el anterior queda cerrado.</p>'
  +'</div></section>';
}

/* Pasos del flujo de producción: el encabezado de cada proceso resalta los suyos
   (es la tira "Orden de producción › Verificar materiales › Corte ›…" del mockup
   de Logística). */
const PIPELINE=['Orden de producción','Verificar materiales','Corte','Guarnición','Montaje','Terminado','Control de calidad'];
const PIPELINE_CORTO=['Orden','Materiales','Corte','Guarnición','Montaje','Terminado','Calidad'];
/* Título, explicación y pasos que cubre cada proceso del módulo */
const PROC={
 proceso:{ic:'ruta',t:'Proceso de Producción',pasos:[0,1,2,3,4,5,6],
  d:'Los nueve pasos del módulo, de la generación de la orden al envío a calidad. Cada tarjeta abre la tabla donde se registra.'},
 panel:{ic:'bars',t:'Panel de Producción',pasos:[]},
 ordenes:{ic:'clip',t:'Órdenes de producción',pasos:[0,1],
  d:'Pasos 1 a 4: se genera la orden, se valida la BOM y las existencias, y se libera reservando los insumos en Inventario.'},
 bom:{ic:'box',t:'Validación de BOM y existencias',pasos:[1],
  d:'Pasos 2 y 3: lo que consume un par contra lo que hay en bodega; lo que falte se le pide a Compras.'},
 etapas:{ic:'gear',t:'Etapas de planta',pasos:[2,3,4,5],
  d:'Pasos 5 y 6: la orden recorre las cuatro etapas en secuencia con la regla recibido = procesado + merma.'},
 merma:{ic:'alert',t:'Pérdidas y reproceso',pasos:[2,3,4,5],
  d:'Paso 9: toda merma se registra con su causa, su etapa y su costo. Nada se elimina: se anula.'},
 tiempos:{ic:'reloj',t:'Tiempos por etapa',pasos:[2,3,4,5],
  d:'Paso 7: al cerrar cada etapa quedan sus horas y sus unidades, y con ellas se calcula el avance real.'},
 calidad:{ic:'flask',t:'Lotes enviados a calidad',pasos:[6],
  d:'Paso 8: con las cuatro etapas cerradas el lote pasa a inspección y Control de Calidad decide si se aprueba.'},
 prod:{ic:'users',t:'Productividad por operario',pasos:[2,3,4,5],
  d:'Unidades procesadas frente a horas registradas en las etapas de planta.'},
 costos:{ic:'tag',t:'Costos y trazabilidad',pasos:[0,1,2,3,4,5,6],
  d:'Costo planeado según la BOM contra el consumo real más la merma, orden por orden.'}
};
/* Encabezado de la pantalla: qué es, para qué sirve y qué pasos del flujo cubre */
function bannerProc(id){
 const c=PROC[id]; if(!c)return '';
 return '<section class="bnr'+(c.pasos.length?'':' bnr--min')+'"><div class="bnr__m">'
  +'<h2 class="bnr__t">'+ico(c.ic,24)+esc(c.t)+'<span class="bnr__f">'+ico('clip',13)+hoy()+'</span></h2>'
  +'<p class="bnr__d">'+esc(c.d)+'</p></div>'
  +(c.pasos.length?'<div class="bnr__pasos" aria-label="Pasos del flujo que cubre esta pantalla">'
   +PIPELINE.map((p,i)=>'<span class="bnr__p'+(c.pasos.indexOf(i)>=0?' is-on':'')+'"><b>'+(i+1)+'</b>'+esc(p)+'</span>')
     .join('<span class="bnr__sep" aria-hidden="true">›</span>')
  +'</div>':'')+'</section>';
}
/* Indicadores del proceso: las mismas tarjetas de color de siempre, pero con las
   cifras de esta pantalla. Si la tarjeta trae filtro (f), al pulsarla filtra la tabla. */
const TONOS_KPI=['arena','rosa','oliva','cobre'];
function kpisProc(tabla,lista){
 return '<div class="kpis">'+lista.map((k,i)=>
   kpi(TONOS_KPI[i%4],k.ic,[k.v,k.t],{cls:'sub',txt:k.s||''},k.f?{dt:tabla,f:k.f[0],v:k.f[1]}:null)
  ).join('')+'</div>';
}
/* Dónde vive la tabla de cada proceso (para que sus tarjetas la filtren) */
const TID={ordenes:'p-ordenes',bom:'p-bom',etapas:'p-etapas',merma:'p-merma',
 tiempos:'p-tiempos',calidad:'p-calidad',prod:'p-operarios',costos:'p-costos'};
/* Los cuatro indicadores de cada proceso. Devuelve null en las pantallas que
   usan los indicadores generales del módulo (el panel y el flujo). */
function indProc(t){
 const enCurso=S.op.filter(o=>o.estado!=='cerrada');
 const espera=S.op.filter(o=>o.estado==='en espera').length;
 const avg=enCurso.length?enCurso.reduce((a,o)=>a+avance(o),0)/enCurso.length:0;
 const proc=S.op.reduce((a,o)=>a+procesados(o),0);
 const perd=S.op.reduce((a,o)=>a+perdidas(o),0);
 const mias=S.merma.filter(m=>m.origen==='produccion');
 const horas=S.tiempos.reduce((a,x)=>a+x.horas,0), unds=S.tiempos.reduce((a,x)=>a+x.und,0);
 const ETA=['Corte','Guarnición','Montaje','Terminado'];
 if(t==='ordenes')return [
  {ic:'clip',t:'Órdenes registradas',v:n0(S.op.length),s:n0(enCurso.length)+' en curso'},
  {ic:'alert',t:'En espera de material',v:n0(espera),s:'Compras ya fue notificado',f:['estado','en espera']},
  {ic:'gear',t:'En planta',v:n0(S.op.filter(o=>o.estado==='en proceso').length),
   s:'Avance promedio '+n0(avg)+' %',f:['estado','en proceso']},
  {ic:'box',t:'Pares programados',v:n0(S.op.reduce((a,o)=>a+o.cant,0)),s:n0(proc)+' pares procesados'}];
 if(t==='bom'){
  const bl=lineasBOM(), dem=bl.filter(l=>l.req>0), sin=bl.filter(l=>l.falta>0);
  const cob=dem.length?dem.reduce((a,l)=>a+l.cobertura,0)/dem.length:100;
  return [
   {ic:'box',t:'Líneas de BOM',v:n0(bl.length),s:n0(S.modelos.length)+' modelos con lista'},
   {ic:'search',t:'Líneas con demanda',v:n0(dem.length),s:'De las órdenes por liberar'},
   {ic:'alert',t:'Sin cobertura',v:n0(sin.length),s:'No alcanzan para liberar',f:['soloFalta','true']},
   {ic:'bars',t:'Cobertura promedio',v:n0(cob)+' %',s:'Sobre las líneas con demanda'}];
 }
 if(t==='etapas'){
  const tot=S.op.length*ETA.length;
  const cer=S.op.reduce((a,o)=>a+o.etapas.filter(e=>e.cerrada).length,0);
  const enP=S.op.filter(o=>o.liberada&&o.estado==='en proceso').length;
  return [
   {ic:'check',t:'Etapas cerradas',v:n0(cer)+' de '+n0(tot),s:'En todas las órdenes',f:['estado','cerrada']},
   {ic:'gear',t:'Etapas en proceso',v:n0(enP),s:'Esperando su registro',f:['estado','en proceso']},
   {ic:'box',t:'Pares procesados',v:n0(proc),s:'Suma de las etapas cerradas'},
   {ic:'alert',t:'Merma en planta',v:n0(perd),s:n2(proc+perd?perd/(proc+perd)*100:0)+' % de lo procesado'}];
 }
 if(t==='merma'){
  const peor=ETA.map(e=>({e,n:mias.filter(m=>m.etapa===e).reduce((a,m)=>a+m.cant,0)
    +S.op.reduce((a,o)=>{const x=o.etapas.find(y=>y.n===e);return a+(x?x.perd:0)},0)}))
   .sort((a,b)=>b.n-a.n)[0]||{e:'—',n:0};
  return [
   {ic:'alert',t:'Registros de merma',v:n0(mias.length),s:'Los originados en producción'},
   {ic:'box',t:'Unidades perdidas',v:n0(mias.reduce((a,m)=>a+m.cant,0)),s:'Cada una con su causa'},
   {ic:'tag',t:'Costo de la merma',v:cop(mias.reduce((a,m)=>a+costoMerma(m),0)),s:'Valorado con la BOM del modelo'},
   {ic:'gear',t:'Etapa con más merma',v:n0(peor.n),s:peor.e,f:peor.n?['etapa',peor.e]:null}];
 }
 if(t==='tiempos')return [
  {ic:'clip',t:'Registros de tiempo',v:n0(S.tiempos.length),s:'Uno por etapa cerrada'},
  {ic:'bars',t:'Horas registradas',v:n2(horas),s:'En las etapas de planta'},
  {ic:'check',t:'Unidades procesadas',v:n0(unds),s:'En esas mismas horas'},
  {ic:'users',t:'Rendimiento',v:n2(horas?unds/horas:0),s:'unidades por hora'}];
 if(t==='calidad'){
  const pend=S.lotes.filter(l=>l.estado==='pendiente'), apr=S.lotes.filter(l=>l.estado==='aprobado');
  const cerr=S.lotes.filter(l=>l.estado!=='pendiente');
  const u=cerr.reduce((a,l)=>a+l.cant,0), c=cerr.reduce((a,l)=>a+l.conf,0);
  return [
   {ic:'flask',t:'Lotes por inspeccionar',v:n0(pend.length),s:'Enviados por producción',f:['estado','pendiente']},
   {ic:'check',t:'Lotes aprobados',v:n0(apr.length),s:n0(apr.reduce((a,l)=>a+l.conf,0))+' pares conformes',f:['estado','aprobado']},
   {ic:'x',t:'Lotes rechazados',v:n0(S.lotes.filter(l=>l.estado==='rechazado').length),s:'Vuelven a reproceso',f:['estado','rechazado']},
   {ic:'bars',t:'Conformidad',v:n2(u?c/u*100:0)+' %',s:'Umbral del sistema: '+S.UMBRAL_CALIDAD+' %'}];
 }
 if(t==='prod'){
  const gente=[...new Set(S.tiempos.map(x=>x.operario))];
  return [
   {ic:'users',t:'Operarios con registro',v:n0(gente.length),s:'De '+S.operarios.length+' en la planta'},
   {ic:'clip',t:'Horas registradas',v:n2(horas),s:'En las etapas cerradas'},
   {ic:'check',t:'Unidades procesadas',v:n0(unds),s:'Suma de todos los operarios'},
   {ic:'bars',t:'Rendimiento medio',v:n2(horas?unds/horas:0),s:'unidades por hora'}];
 }
 if(t==='costos'){
  const plan=S.op.reduce((a,o)=>a+costoPar(o.ref)*o.cant,0);
  const mer=S.op.reduce((a,o)=>a+S.merma.filter(m=>m.doc===o.id).reduce((b,m)=>b+costoMerma(m),0),0);
  const real=S.op.reduce((a,o)=>a+(o.liberada?costoPar(o.ref)*o.cant:0)
    +S.merma.filter(m=>m.doc===o.id).reduce((b,m)=>b+costoMerma(m),0),0);
  const pares=S.op.filter(o=>o.liberada).reduce((a,o)=>a+o.cant,0);
  return [
   {ic:'tag',t:'Costo planeado',v:cop(plan),s:'Según la BOM de cada modelo'},
   {ic:'alert',t:'Costo de la merma',v:cop(mer),s:'Material perdido en planta'},
   {ic:'bars',t:'Costo real',v:cop(real),s:'Liberado más merma'},
   {ic:'box',t:'Costo por par',v:cop(pares?real/pares:0),s:'Promedio de lo liberado'}];
 }
 return null;
}

const PROCESOS=[
 {id:'panel',n:'Panel principal',ic:'grid'},
 {id:'proceso',n:'Proceso',ic:'ruta'},
 {id:'ordenes',n:'Órdenes',ic:'clip',ct:()=>S.op.filter(o=>o.estado!=='cerrada').length},
 {id:'bom',n:'Val. BOM',ic:'box',ct:()=>lineasBOM().filter(l=>l.falta>0).length},
 {id:'etapas',n:'Etapas',ic:'gear'},
 {id:'merma',n:'Pérdidas',ic:'alert',ct:()=>S.merma.filter(m=>m.origen==='produccion').length},
 {id:'tiempos',n:'Tiempos',ic:'reloj'},
 {id:'calidad',n:'Calidad',ic:'flask',ct:()=>S.lotes.filter(l=>l.estado==='pendiente').length},
 {id:'prod',n:'Productividad',ic:'users'},
 {id:'costos',n:'Costos',ic:'tag'}
];
/* Una fila por cada insumo de cada modelo: lo que consume un par, lo que hay en
   Inventario y lo que piden las órdenes que todavía no se liberan. */
function lineasBOM(){
 const lineas=[];
 S.modelos.forEach(m=>m.bom.forEach(([c,q])=>{
  const i=insumo(c), hay=saldo(c);
  const ops=S.op.filter(o=>o.ref===m.ref&&!o.liberada&&o.estado!=='cerrada');
  const req=ops.reduce((a,o)=>a+o.cant,0)*q;
  lineas.push({id:m.ref+' · '+c,ref:m.ref,modelo:m.nom,ver:m.ver,estadoM:m.estado,
   cod:c,insumo:i.nom,un:i.un,porPar:q,hay,min:i.min,bajo:hay<i.min,
   ops:ops.length,req,falta:Math.max(0,req-hay),
   cobertura:req?Math.min(100,hay/req*100):100,
   estado:!req?'sin demanda':hay>=req?'completo':hay>0?'parcial':'sin stock',
   costoUn:i.costo,costoPar:q*i.costo});
 }));
 return lineas;
}
V.produccion=()=>{
 const t=secc('produccion','panel');
 const espera=S.op.filter(o=>o.estado==='en espera').length;
 const edit=puedeEscribir('produccion');
 const ETAPAS=['Corte','Guarnición','Montaje','Terminado'];
 let cuerpo='';

 /* --- Panel principal: una pestaña por proceso, sin scroll --- */
 if(t==='panel'){
  cuerpo = '<header class="phead"><h2 class="phead__t">'+ico(PROC.panel.ic,20)+esc(PROC.panel.t)
   +'<span class="phead__f">'+ico('clip',13)+hoy()+'</span></h2>'
   +'<p class="phead__d">Cómo va el módulo y las ocho tarjetas de sus procesos. '
   +'Pulse una tarjeta para ver su tabla y sus gráficas completas.</p></header>'
   + panelMosaico();
 }

 /* --- El proceso, como un lienzo de nueve pasos --- */
 if(t==='proceso'){
  cuerpo = '<header class="phead"><h2 class="phead__t">'+ico('ruta',20)+'Proceso de Producción'
   +'<span class="phead__f">'+ico('clip',13)+hoy()+'</span></h2>'
   +'<p class="phead__d">Los nueve pasos del módulo, del pedido al envío a calidad. '
   +'Pulse un paso para ver qué se hace en él y abrir su tabla.</p></header>'
   +'<div class="lienzo">'+lienzoProceso()+detallePaso()+'</div>';
 }

 /* --- Órdenes de trabajo: la tabla es la pantalla ---
    Una fila por orden, de una línea: las cuatro etapas son cuatro columnas de
    números, y la escalera que forman es la regla del módulo (lo que entra a una
    etapa es lo que salió de la anterior; si baja, la diferencia es merma).
    Abre con las órdenes en curso, las atrasadas arriba. */
 if(t==='ordenes'){
  /* Dónde va la orden en cada etapa: 'paso' ya salió de ella, 'hoy' está en ella, 'no' todavía no llega */
  const enEtapa=(o,ix)=>o.etapas[ix].cerrada?'paso':o.liberada&&o.estado!=='cerrada'&&ix===o.etapa?'hoy':'no';
  const enCurso=o=>o.estado!=='cerrada';
  const nomMod=o=>o.ref+' · '+modelo(o.ref).nom;
  const tablaOP=datatable({
   id:'p-ordenes', titulo:'órdenes de producción', csv:'ordenes_produccion', exportar:'Excel',
   buscar:'Buscar por orden, modelo, estado o pedido...',
   filas:S.op, orden:{k:'compromiso',dir:'asc'}, inicial:{estado:'en curso'}, tams:[10,25,50], caja:true,
   nuevo:{act:'p-nueva',t:'Nueva orden',ic:'plus',title:'Crear una orden de producción'},
   clase:o=>atrasada(o)?'dt__tarde':'',
   cols:[
    {k:'id',t:'Orden',ancho:'190px',v:o=>o.id+' '+(o.pedido||''),
     r:o=>'<b>'+esc(o.id)+'</b>'+(o.pedido?' <span class="dt__ori">'+esc(o.pedido)+'</span>':'')},
    {k:'ref',t:'Modelo',th:'dt__thmod',v:nomMod,td:()=>'dt__mod',tt:nomMod},
    {k:'cant',t:'Pares',tipo:'num',ancho:'76px'}]
   .concat(ETAPAS.map((n,ix)=>({k:'e'+ix,t:n,tipo:'num',orden:false,busca:false,th:'dt__et',
     v:o=>{const s=enEtapa(o,ix);return s==='no'?null:s==='paso'?o.etapas[ix].proc:o.etapas[ix].rec},
     td:o=>{const s=enEtapa(o,ix);return 'dt__et'+(s==='hoy'?' dt__et--hoy':s==='no'?' dt__et--no':'')},
     r:o=>{const s=enEtapa(o,ix);return s==='no'?'—':n0(s==='paso'?o.etapas[ix].proc:o.etapas[ix].rec)}})))
   .concat([
    {k:'compromiso',t:'Compromiso',ancho:'136px',td:()=>'dt__fec',
     r:o=>esc(o.compromiso)+(atrasada(o)?' <span class="dt__flag">tarde</span>':'')},
    {k:'estado',t:'Estado',ancho:'122px',r:o=>pill(o.estado)},
    {k:'avance',t:'Avance',tipo:'pct',oculta:true,v:o=>Math.round(avance(o))},
    {k:'etapa',t:'Etapa actual',oculta:true,
     v:o=>o.estado==='cerrada'?'Cerrada':(o.etapas[o.etapa]?o.etapas[o.etapa].n:'—')},
    {k:'proc',t:'Pares procesados',tipo:'num',oculta:true,v:procesados},
    {k:'perd',t:'Merma',tipo:'num',oculta:true,v:perdidas},
    {k:'costo',t:'Costo planeado',tipo:'moneda',oculta:true,v:o=>costoPar(o.ref)*o.cant}
   ]),
   filtros:[
    {k:'id',t:'Orden',tipo:'texto',ph:'OP-2026-...'},
    {k:'ref',t:'Modelo',op:[...new Set(S.op.map(o=>o.ref))].sort().map(r=>({v:r,t:r+' · '+modelo(r).nom}))},
    {k:'cant',t:'Pares',tipo:'numeros'},
    {k:'estado',t:'Estado',sinTodos:true,m:(o,v)=>v==='en curso'?enCurso(o):o.estado===v,
     op:[{v:'en curso',t:'En curso ('+n0(S.op.filter(enCurso).length)+')',c:'En curso'},{v:'',t:'Todos ('+n0(S.op.length)+')'},
      {v:'en proceso',t:'En proceso'},{v:'en espera',t:'En espera'},{v:'pendiente',t:'Pendiente'},{v:'cerrada',t:'Cerrada'}]}]
   .concat(ETAPAS.map((n,ix)=>({k:'e'+ix,t:n,todos:'Todas',m:(o,v)=>enEtapa(o,ix)===v,
     op:[{v:'hoy',t:'Está en esta etapa'},{v:'paso',t:'Ya pasó por aquí'},{v:'no',t:'Todavía no llega'}]})))
   .concat([{k:'compromiso',t:'Compromiso',tipo:'fechas',ancho:2}]),
   resumen:fs=>[
    {t:'Pares programados',v:n0(fs.reduce((a,o)=>a+o.cant,0))},
    {t:'Pares liberados',v:n0(fs.filter(o=>o.liberada).reduce((a,o)=>a+o.cant,0)),tono:'ok'},
    {t:'Merma (pares)',v:n0(fs.reduce((a,o)=>a+perdidas(o),0)),tono:'crit'},
    {t:'Órdenes sin liberar',v:n0(fs.filter(o=>!o.liberada).length),tono:'warn'}
   ],
   /* Con el filtro "En curso" puesto, los textos del pie lo dicen */
   resumenT:(fs,e)=>{const tarde=fs.filter(atrasada).length;
    return 'de las '+n0(fs.length)+(e.f.estado==='en curso'?' en curso':fs.length===S.op.length?' órdenes':' filtradas')
     +' · '+n0(tarde)+(tarde===1?' atrasada':' atrasadas');},
   info:(desde,n,fs,e)=>fs.length
    ?'Mostrando <b>'+n0(desde+1)+'–'+n0(desde+n)+'</b> de <b>'+n0(fs.length)+'</b> orden(es)'
     +(e.f.estado==='en curso'?' en curso':fs.length!==S.op.length?' <span class="muted">(de '+n0(S.op.length)+' en total)</span>':'')
    :'Ninguna orden coincide <span class="muted">(de '+n0(S.op.length)+' en total)</span>',
   sinDatos:'Todavía no hay órdenes de producción registradas.'
  });
  const notaOrd=S.notaOrd?'':'<div class="nota nota--info nota--lado"><span class="dot">'+ico('info',18)+'</span>'
   +'<p><b>Nota:</b> Cada columna de etapa son los pares que <b>salieron</b> de ella. La casilla resaltada es la etapa '
   +'<b>en curso</b>, y ahí el número es lo que <b>entró</b>: todavía no ha salido nada. Si los números bajan de una '
   +'columna a la siguiente, la diferencia es merma.</p>'
   +'<button class="nota__x" data-act="p-nota" title="Quitar la nota" aria-label="Quitar la nota">&times;</button></div>';
  /* Sin el encabezado de pasos ni las gráficas: el título, la nota, sus cuatro indicadores y la tabla */
  return '<header class="phead phead--fila"><h2 class="phead__t">'+ico('ruta',20)+'Órdenes de producción</h2>'+notaOrd+'</header>'
   +kpisProc(TID.ordenes,indProc('ordenes'))
   +'<section class="panel panel--tabla"><div class="panel__body panel__body--flush">'+tablaOP+'</div></section>';
 }

 /* --- Validación de BOM contra existencias --- */
 if(t==='bom'){
  const lineas=lineasBOM();
  const sinCobertura=lineas.filter(l=>l.falta>0);
  const tablaBom=datatable({
   id:'p-bom', titulo:'validación de BOM y existencias', csv:'bom_existencias',
   buscar:'Buscar por modelo, insumo o código...',
   filas:lineas, orden:{k:'cobertura',dir:'asc'},
   clase:l=>l.falta>0?'dt__tarde':(l.estadoM==='descontinuado'?'dt__off':''),
   cols:[
    {k:'ref',t:'Modelo',v:l=>l.ref+' '+l.modelo,
     r:l=>'<b>'+esc(l.ref)+'</b><div class="tiny">'+esc(l.modelo)+' · v'+l.ver+'</div>'},
    {k:'cod',t:'Insumo',v:l=>l.cod+' '+l.insumo,
     r:l=>esc(l.insumo)+'<div class="tiny">'+esc(l.cod)+'</div>'},
    {k:'porPar',t:'Por par',tipo:'num',r:l=>'<b>'+n2(l.porPar)+'</b><div class="tiny">'+esc(l.un)+'</div>'},
    {k:'hay',t:'Disponible',tipo:'num',
     r:l=>n2(l.hay)+'<div class="tiny">'+esc(l.un)+'</div>'
      +(l.bajo?'<div class="tiny dt__flag">'+ico('alert',13)+'Bajo el mínimo</div>':'')},
    {k:'req',t:'Requerido',tipo:'num',
     r:l=>l.req?n2(l.req)+'<div class="tiny">'+l.ops+' orden(es) por liberar</div>'
               :'<span class="muted">Sin demanda</span>'},
    {k:'cobertura',t:'Cobertura',ancho:'132px',v:l=>Math.round(l.cobertura),
     r:l=>l.req?barra(l.cobertura,l.cobertura>=100?'bar--ok':l.cobertura?'':'bar--crit')
      +'<div class="tiny">'+n0(l.cobertura)+' % de lo requerido</div>'
      :'<span class="muted">Sin demanda</span>'},
    {k:'estado',t:'Estado',r:l=>pill(l.estado)},
    {k:'estadoM',t:'Estado BOM',oculta:true,r:l=>pill(l.estadoM)},
    {k:'falta',t:'Faltante',tipo:'num',oculta:true,r:l=>l.falta?'<b class="dt__mal">'+n2(l.falta)+'</b>':'0'},
    {k:'costoUn',t:'Costo unitario',tipo:'moneda',oculta:true},
    {k:'costoPar',t:'Costo por par',tipo:'moneda',oculta:true},
    {k:'min',t:'Stock mínimo',tipo:'num',oculta:true}
   ],
   filtros:[
    {k:'ref',t:'Modelo',op:S.modelos.map(m=>({v:m.ref,t:m.ref+' · '+m.nom}))},
    {k:'cod',t:'Insumo',op:S.insumos.map(i=>({v:i.cod,t:i.cod+' · '+i.nom}))},
    {k:'estado',t:'Cobertura',op:['completo','parcial','sin stock','sin demanda']},
    {k:'estadoM',t:'Estado BOM',op:['aprobado','borrador','descontinuado']},
    {k:'soloFalta',t:'Solo faltantes',tipo:'si',m:l=>l.falta>0},
    {k:'soloBajo',t:'Bajo el mínimo',tipo:'si',m:l=>l.bajo}
   ],
   acciones:l=>l.falta>0&&edit
     ?'<button class="btn btn--sm btn--ghost" data-act="p-bom-sol" data-cod="'+l.cod+'" data-ref="'+l.ref+'" data-falta="'+l.falta+'">Solicitar</button>'
     :'<span class="tiny">—</span>',
   resumen:fs=>[
    {t:'Líneas de BOM',v:n0(fs.length)},
    {t:'Con demanda',v:n0(fs.filter(l=>l.req>0).length)},
    {t:'Líneas con faltante',v:n0(fs.filter(l=>l.falta>0).length),tono:'crit'},
    {t:'Costo de material por par',v:cop(fs.reduce((a,l)=>a+l.costoPar,0))}
   ],
   sinDatos:'Ningún modelo tiene lista de materiales cargada.'
  });
  cuerpo = (sinCobertura.length?'<div class="aviso aviso--warn">'+ico('alert',20)
     +'<div><b>'+sinCobertura.length+' línea(s) de BOM sin cobertura</b><p>Las órdenes de esos modelos no se pueden liberar hasta que Compras reponga el insumo.</p></div></div>':'')
   + panel('vino','box','Validación de BOM y Existencias','Pasos 2 y 3: lo que consume un par contra lo que hay en Inventario',
     '<div class="panel__body panel__body--flush">'+tablaBom
     + nota('La demanda sale de las órdenes que todavía no se liberan. Si la cobertura no llega al 100 %, la orden queda en espera y se genera la solicitud a Compras.')+'</div>');
 }

 /* --- Etapas en planta --- */
 if(t==='etapas'){
  const cols=ETAPAS.map(nom=>{
   const enEtapa=S.op.filter(o=>o.liberada&&o.estado==='en proceso'&&o.etapas[o.etapa]&&o.etapas[o.etapa].n===nom);
   const proc=S.op.reduce((a,o)=>{const e=o.etapas.find(x=>x.n===nom);return a+(e?e.proc:0)},0);
   const perd=S.op.reduce((a,o)=>{const e=o.etapas.find(x=>x.n===nom);return a+(e?e.perd:0)},0);
   const maq=S.maquinas.filter(m=>m.area===nom);
   return '<article class="paso'+(maq.some(m=>m.estado==='averiada')?' paso--warn':'')+'"><header><span class="paso__n">'+(ETAPAS.indexOf(nom)+1)+'</span>'+ico('gear',16)+'<b>'+nom+'</b></header>'
   +'<div class="kv"><span>Órdenes en la etapa</span><b>'+enEtapa.length+'</b></div>'
   +'<div class="kv"><span>Unidades procesadas</span><b>'+n0(proc)+'</b></div>'
   +'<div class="kv"><span>Merma acumulada</span><b>'+n0(perd)+'</b></div>'
   +'<div class="tiny" style="margin-top:8px">'+(maq.length?maq.map(m=>esc(m.nom)+' · '+m.estado).join('<br>'):'Sin máquina asignada')+'</div>'
   +(enEtapa.length&&edit?'<button class="btn btn--sm btn--oliva" style="margin-top:10px;width:100%" data-act="p-etapa" data-id="'+enEtapa[0].id+'">Registrar '+nom+'</button>':'')
   +'</article>';
  }).join('');
  /* Una fila por cada etapa de cada orden: así se ve el paso a paso de la planta */
  const regs=regsEtapas();
  const tablaEt=datatable({
   id:'p-etapas', titulo:'ejecución por etapa', csv:'etapas_planta',
   buscar:'Buscar por orden, etapa o estado...',
   filas:regs, orden:{k:'op',dir:'asc'}, tam:10,
   cols:[
    {k:'op',t:'Orden',r:r=>'<b>'+esc(r.op)+'</b><div class="tiny">'+esc(r.ref)+'</div>'},
    {k:'etapa',t:'Etapa',v:r=>r.orden+' '+r.etapa,
     r:r=>'<span class="paso__n paso__n--sm">'+r.orden+'</span> '+esc(r.etapa)},
    {k:'estado',t:'Estado',r:r=>pill(r.estado)},
    {k:'rec',t:'Recibido',tipo:'num'},
    {k:'proc',t:'Procesado',tipo:'num'},
    {k:'perd',t:'Merma',tipo:'num',r:r=>r.perd?'<b class="dt__mal">'+n0(r.perd)+'</b>':'0'},
    {k:'rend',t:'Rendimiento',tipo:'pct',v:r=>r.rec?r.proc/r.rec*100:0,
     r:r=>r.rec?n2(r.proc/r.rec*100)+' %':'<span class="muted">—</span>'},
    {k:'maquina',t:'Máquina',oculta:true}
   ],
   filtros:[
    {k:'etapa',t:'Etapa',op:ETAPAS},
    {k:'op',t:'Orden',op:S.op.map(o=>o.id)},
    {k:'estado',t:'Estado',op:['cerrada','en proceso','pendiente']},
    {k:'conMerma',t:'Solo con merma',tipo:'si',m:r=>r.perd>0}
   ],
   acciones:r=>r.estado==='en proceso'&&edit
     ?'<button class="btn btn--sm btn--oliva" data-act="p-etapa" data-id="'+r.op+'">Registrar</button>'
     :'<span class="tiny">—</span>',
   resumen:fs=>[
    {t:'Recibido',v:n0(fs.reduce((a,r)=>a+r.rec,0))},
    {t:'Procesado',v:n0(fs.reduce((a,r)=>a+r.proc,0)),tono:'ok'},
    {t:'Merma',v:n0(fs.reduce((a,r)=>a+r.perd,0)),tono:'crit'},
    {t:'Etapas cerradas',v:n0(fs.filter(r=>r.estado==='cerrada').length)}
   ],
   sinDatos:'Ninguna orden tiene etapas registradas todavía.'
  });
  cuerpo = panel('vino','gear','Etapas en Planta','Paso 5 y 6: ejecución secuencial y control de cantidades',
    '<div class="panel__body"><div class="pasos">'+cols+'</div>'
    +'<p class="tiny" style="margin-top:12px">La regla de control es <b>recibido = procesado + merma</b>: el sistema bloquea cualquier cifra que supere las unidades recibidas en la etapa.</p></div>')
   + panel('oliva','clip','Ejecución Etapa por Etapa','Cada orden con sus cuatro etapas, su cantidad y su rendimiento',
     '<div class="panel__body panel__body--flush">'+tablaEt+'</div>');
 }

 /* --- Pérdidas / merma --- */
 if(t==='merma'){
  const mias=S.merma.filter(m=>m.origen==='produccion');
  const total=mias.reduce((a,m)=>a+costoMerma(m),0);
  const porEtapa=ETAPAS.map(e=>({e,n:mias.filter(m=>m.etapa===e).reduce((a,m)=>a+m.cant,0)}));
  const max=Math.max(1,...porEtapa.map(x=>x.n));
  const tablaMerma=datatable({
   id:'p-merma', titulo:'registros de merma', csv:'perdidas_produccion',
   buscar:'Buscar por registro, orden, causa o etapa...',
   filas:mias, orden:{k:'fecha',dir:'desc'},
   cols:[
    {k:'id',t:'Registro',r:m=>'<b>'+esc(m.id)+'</b><div class="tiny">'+esc(m.fecha)+'</div>'},
    {k:'doc',t:'Documento'},
    {k:'ref',t:'Referencia',r:m=>esc(m.ref)+'<div class="tiny">'+esc(m.etapa||'—')+'</div>'},
    {k:'etapa',t:'Etapa',oculta:true},
    {k:'cant',t:'Cantidad',tipo:'num'},
    {k:'causa',t:'Causa'},
    {k:'costo',t:'Costo',tipo:'moneda',v:m=>costoMerma(m)},
    {k:'resp',t:'Responsable',r:m=>'<span class="muted">'+esc(m.resp)+'</span>'},
    {k:'fecha',t:'Fecha',oculta:true}
   ],
   filtros:[
    {k:'etapa',t:'Etapa',op:ETAPAS},
    {k:'causa',t:'Causa',op:[...new Set(mias.map(m=>m.causa))]},
    {k:'doc',t:'Orden',op:[...new Set(mias.map(m=>m.doc))]},
    {k:'fecha',t:'Fecha',tipo:'fechas'}
   ],
   resumen:fs=>[
    {t:'Unidades perdidas',v:n0(fs.reduce((a,m)=>a+m.cant,0)),tono:'crit'},
    {t:'Costo de la merma',v:cop(fs.reduce((a,m)=>a+costoMerma(m),0)),tono:'crit'},
    {t:'Registros',v:n0(fs.length)}
   ],
   sinDatos:'Sin merma registrada en producción.'
  });
  cuerpo = panel('vino','alert','Pérdidas por Etapa','Paso 9: toda merma se registra con su causa',
    '<div class="panel__body">'+porEtapa.map(x=>'<div style="margin-bottom:11px"><div style="display:flex;justify-content:space-between;font-size:13px"><span>'+x.e+'</span><b>'+n0(x.n)+' und.</b></div>'+barra(x.n/max*100,x.n?'bar--crit':'')+'</div>').join('')
    +'<p class="tiny">Costo acumulado de la merma de producción: <b>'+cop(total)+'</b>.</p></div>')
   + panel('oliva','clip','Registro de Merma','Cada pérdida queda asociada a su orden y a su etapa',
     '<div class="panel__body panel__body--flush">'+tablaMerma+'</div>');
 }

 /* --- Productividad por operario --- */
 if(t==='prod'){
  const gente=operariosFilas();
  const tablaGente=datatable({
   id:'p-operarios', titulo:'productividad por operario', csv:'productividad_operarios',
   buscar:'Buscar operario...', filas:gente, orden:{k:'rend',dir:'desc'}, tam:5,
   filtros:[{k:'nom',t:'Operario',op:gente.map(g=>g.nom)}],
   cols:[
    {k:'nom',t:'Operario',r:g=>'<div class="who"><span class="avatar avatar--sm">'+esc(g.nom[0])+'</span><div><b>'+esc(g.nom)+'</b><small>'+g.n+' etapa(s) registrada(s)</small></div></div>'},
    {k:'h',t:'Horas',tipo:'num',r:g=>n2(g.h)+'<div class="tiny">horas</div>'},
    {k:'u',t:'Unidades',tipo:'num',r:g=>n0(g.u)+'<div class="tiny">unidades</div>'},
    {k:'rend',t:'Rendimiento',tipo:'num',r:g=>'<b>'+n2(g.rend)+'</b><div class="tiny">und/hora</div>'}
   ],
   resumen:fs=>[
    {t:'Horas registradas',v:n2(fs.reduce((a,g)=>a+g.h,0))},
    {t:'Unidades procesadas',v:n0(fs.reduce((a,g)=>a+g.u,0)),tono:'ok'},
    {t:'Rendimiento medio',v:n2(fs.reduce((a,g)=>a+g.h,0)?fs.reduce((a,g)=>a+g.u,0)/fs.reduce((a,g)=>a+g.h,0):0)+' und/h'}
   ],
   sinDatos:'Aún no hay tiempos registrados.'
  });
  cuerpo = panel('vino','users','Productividad por Operario','Unidades procesadas frente a horas registradas',
    '<div class="panel__body panel__body--flush">'+tablaGente+'</div>');
 }

 /* --- Tiempos por etapa --- */
 if(t==='tiempos'){
  const tablaTiempos=datatable({
   id:'p-tiempos', titulo:'tiempos por etapa', csv:'tiempos_etapas',
   buscar:'Buscar por orden, etapa u operario...',
   filas:S.tiempos, orden:{k:'fecha',dir:'desc'},
   cols:[
    {k:'op',t:'Orden',r:x=>'<b>'+esc(x.op)+'</b>'},
    {k:'etapa',t:'Etapa'},
    {k:'operario',t:'Operario'},
    {k:'horas',t:'Horas',tipo:'num',r:x=>n2(x.horas)},
    {k:'und',t:'Unidades',tipo:'num'},
    {k:'rend',t:'Und/hora',tipo:'num',oculta:true,v:x=>x.horas?x.und/x.horas:0,r:x=>n2(x.horas?x.und/x.horas:0)},
    {k:'fecha',t:'Fecha',r:x=>'<span class="tiny">'+esc(x.fecha)+'</span>'}
   ],
   filtros:[
    {k:'etapa',t:'Etapa',op:ETAPAS},
    {k:'operario',t:'Operario',op:[...new Set(S.tiempos.map(x=>x.operario))]},
    {k:'op',t:'Orden',op:[...new Set(S.tiempos.map(x=>x.op))]},
    {k:'fecha',t:'Fecha',tipo:'fechas'}
   ],
   resumen:fs=>[
    {t:'Horas',v:n2(fs.reduce((a,x)=>a+x.horas,0))},
    {t:'Unidades',v:n0(fs.reduce((a,x)=>a+x.und,0)),tono:'ok'},
    {t:'Registros',v:n0(fs.length)}
   ],
   sinDatos:'Los tiempos se registran al cerrar cada etapa de la orden.'
  });
  cuerpo = panel('vino','bars','Tiempos por Etapa','Paso 7: cada cierre de etapa deja sus horas y sus unidades',
     '<div class="panel__body panel__body--flush">'+tablaTiempos
     + nota('Con estas horas se calcula el rendimiento por operario y se compara el avance real contra el planeado.')+'</div>');
 }

 /* --- Lotes enviados a calidad --- */
 if(t==='calidad'){
  const conf=l=>l.cant?l.conf/l.cant*100:0;
  const pend=S.lotes.filter(l=>l.estado==='pendiente');
  const tablaLotes=datatable({
   id:'p-calidad', titulo:'lotes enviados a calidad', csv:'lotes_calidad',
   buscar:'Buscar por lote, orden o modelo...',
   filas:S.lotes, orden:{k:'fecha',dir:'desc'},
   clase:l=>l.estado==='rechazado'?'dt__tarde':'',
   cols:[
    {k:'id',t:'Lote',r:l=>'<b>'+esc(l.id)+'</b><div class="tiny">'+esc(l.fecha)+'</div>'},
    {k:'op',t:'Orden'},
    {k:'ref',t:'Modelo',v:l=>l.ref+' '+modelo(l.ref).nom,
     r:l=>esc(l.ref)+'<div class="tiny">'+esc(modelo(l.ref).nom)+'</div>'},
    {k:'cant',t:'Pares',tipo:'num'},
    {k:'estado',t:'Estado',r:l=>pill(l.estado)},
    {k:'conf',t:'Conformes',tipo:'num'},
    {k:'repro',t:'Reproceso',tipo:'num',r:l=>l.repro?'<b class="dt__mal">'+n0(l.repro)+'</b>':'0'},
    {k:'pct',t:'Conformidad',ancho:'140px',v:l=>Math.round(conf(l)),
     r:l=>l.estado==='pendiente'?'<span class="muted">Por inspeccionar</span>'
       :barra(conf(l),conf(l)>=S.UMBRAL_CALIDAD?'bar--ok':'bar--crit')
        +'<div class="tiny">'+n2(conf(l))+' % · umbral '+S.UMBRAL_CALIDAD+' %</div>'},
    {k:'desc',t:'Descartados',tipo:'num',oculta:true},
    {k:'defecto',t:'Defecto principal',oculta:true},
    {k:'etapaOrigen',t:'Etapa de origen',oculta:true},
    {k:'tipo',t:'Tipo de inspección',oculta:true},
    {k:'fecha',t:'Fecha',oculta:true}
   ],
   filtros:[
    {k:'estado',t:'Estado',op:[...new Set(S.lotes.map(l=>l.estado))]},
    {k:'op',t:'Orden',op:[...new Set(S.lotes.map(l=>l.op))]},
    {k:'ref',t:'Modelo',op:S.modelos.map(m=>({v:m.ref,t:m.ref+' · '+m.nom}))},
    {k:'id',t:'Lote',op:S.lotes.map(l=>l.id)},
    {k:'fecha',t:'Fecha',tipo:'fechas'},
    {k:'soloRepro',t:'Solo con reproceso',tipo:'si',m:l=>l.repro>0}
   ],
   acciones:l=>'<button class="btn btn--sm btn--ghost" data-act="ir-pant" data-mod="calidad" data-pant="05-terminado.html" data-fila="'+l.id+'">'
     +(l.estado==='pendiente'?'Inspeccionar':'Ver acta')+'</button>',
   resumen:fs=>{
    const cerr=fs.filter(l=>l.estado!=='pendiente');
    const u=cerr.reduce((a,l)=>a+l.cant,0), k=cerr.reduce((a,l)=>a+l.conf,0);
    return [
     {t:'Pares enviados',v:n0(fs.reduce((a,l)=>a+l.cant,0))},
     {t:'Conformes',v:n0(k),tono:'ok'},
     {t:'En reproceso',v:n0(fs.reduce((a,l)=>a+l.repro,0)),tono:'crit'},
     {t:'Conformidad',v:n2(u?k/u*100:0)+' %',tono:u&&k/u*100>=S.UMBRAL_CALIDAD?'ok':'warn'}
    ];
   },
   sinDatos:'Ninguna orden ha cerrado sus cuatro etapas todavía.'
  });
  cuerpo = (pend.length?'<div class="aviso aviso--warn">'+ico('info',20)
     +'<div><b>'+pend.length+' lote(s) esperando inspección</b><p>Control de Calidad ya fue notificado; mientras tanto el lote no entra a inventario de producto terminado.</p></div></div>':'')
   + panel('oliva','flask','Lotes Enviados a Calidad','Paso 8: la orden termina cuando sus cuatro etapas están cerradas',
     '<div class="panel__body panel__body--flush">'+tablaLotes
     + nota('Producción solo envía el lote. El acta de inspección y el porcentaje de conformidad los registra Control de Calidad, que devuelve a reproceso lo que no cumple.')+'</div>');
 }

 /* --- Costos y trazabilidad --- */
 if(t==='costos'){
  const filas=costosFilas();
  const tablaCostos=datatable({
   id:'p-costos', titulo:'costos por orden', csv:'costos_produccion',
   buscar:'Buscar por orden o modelo...', filas, orden:{k:'real',dir:'desc'},
   cols:[
    {k:'id',t:'Orden',r:c=>'<b>'+esc(c.id)+'</b><div class="tiny">'+esc(c.ref)+' · '+esc(c.nom)+'</div>'},
    {k:'cant',t:'Pares',tipo:'num'},
    {k:'plan',t:'Costo planeado',tipo:'moneda'},
    {k:'merma',t:'Costo de merma',tipo:'moneda',r:c=>c.merma?'<b class="dt__mal">'+cop(c.merma)+'</b>':cop(0)},
    {k:'real',t:'Costo real',tipo:'moneda',r:c=>'<b>'+cop(c.real)+'</b>'},
    {k:'unit',t:'Unitario',tipo:'moneda',r:c=>cop(c.unit)+'<div class="tiny">por par</div>'},
    {k:'estado',t:'Estado',oculta:true,r:c=>pill(c.estado)}
   ],
   filtros:[
    {k:'id',t:'Orden',op:filas.map(c=>c.id)},
    {k:'estado',t:'Estado',op:[...new Set(filas.map(c=>c.estado))]},
    {k:'ref',t:'Modelo',op:S.modelos.map(m=>({v:m.ref,t:m.ref+' · '+m.nom}))}
   ],
   resumen:fs=>[
    {t:'Costo planeado',v:cop(fs.reduce((a,c)=>a+c.plan,0))},
    {t:'Costo de merma',v:cop(fs.reduce((a,c)=>a+c.merma,0)),tono:'crit'},
    {t:'Costo real',v:cop(fs.reduce((a,c)=>a+c.real,0)),tono:'ok'},
    {t:'Pares',v:n0(fs.reduce((a,c)=>a+c.cant,0))}
   ],
   sinDatos:'Sin órdenes para costear.'
  });
  cuerpo = panel('oliva','tag','Costos y Trazabilidad','Planeado según BOM contra consumo real más merma',
   '<div class="panel__body panel__body--flush">'+tablaCostos
   + nota('Cada orden conserva su trazabilidad: modelo, versión de BOM, insumos descontados, operarios y merma con su causa.')+'</div>');
 }

 /* Cada proceso muestra su encabezado con los pasos que cubre y sus cuatro
    indicadores; el panel y el flujo usan los indicadores generales del módulo. */
 const ind=indProc(t);
 /* En Producción manda el encabezado de cada pantalla: la portada del módulo
    sobra, porque el menú lateral ya dice en dónde estamos. */
 if(t==='panel'||t==='proceso')return cuerpo;
 return bannerProc(t)+kpisProc(TID[t],ind)+graficasProc(t)
 +(espera?'<div class="aviso aviso--warn">'+ico('alert',20)+'<div><b>'+espera+' orden(es) en espera de material</b><p>Compras ya fue notificado con la solicitud correspondiente.</p></div></div>':'')
 +cuerpo;
};

/* =====================================================================
   ACCIONES
   ===================================================================== */
const A={};

/* --- Producción --- */
A['p-crear']=()=>{
 if(!exigir(puedeEscribir('produccion'),'No tiene permiso de escritura en Producción.'))return;
 const ref=$('#f-op-ref').value,cant=+$('#f-op-cant').value,fec=$('#f-op-fec').value;
 if(!(cant>0))return toast('bad','Cantidad no válida','Indique cuántos pares se van a fabricar.');
 const op={id:'OP-2026-'+String(++S.seqOP).padStart(3,'0'),ref,cant,compromiso:fec,estado:'en espera',etapa:0,
  etapas:['Corte','Guarnición','Montaje','Terminado'].map(n=>({n,rec:0,proc:0,perd:0,cerrada:false})),liberada:false,pedido:''};
 S.op.unshift(op);log('Creación de orden de producción',op.id+' · '+ref+' · '+cant+' pares');
 liberar(op);cerrarModal();render();
};
/* La ventana de "Nueva orden" (Órdenes): el formulario que antes iba en su propio panel */
A['p-nueva']=()=>{
 const aprob=S.modelos.filter(m=>m.estado==='aprobado');
 modalOK=null;
 $('#modalHost').innerHTML='<div class="overlay ord-nueva" data-act="cerrar-modal">'
  +'<div class="modal" role="dialog" aria-modal="true" aria-labelledby="nueva-t" data-stop>'
  +'<div class="modal__head">'+ico('plus',22)+'<h3 id="nueva-t">Nueva orden de producción</h3>'
   +'<button class="ord-x" data-act="cerrar-modal" aria-label="Cerrar">'+ico('x',20)+'</button></div>'
  +'<div class="modal__body"><div class="row2">'
   +'<div class="field"><label for="f-op-ref">Modelo aprobado</label><div class="control">'+ico('pencil',20)+'<select id="f-op-ref">'
    +aprob.map(m=>'<option value="'+m.ref+'">'+m.ref+' · '+esc(m.nom)+'</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="f-op-cant">Cantidad (pares)</label><div class="control">'+ico('plus',20)+'<input id="f-op-cant" type="number" min="1" value="60"></div></div>'
   +'<div class="field"><label for="f-op-fec">Fecha compromiso</label><div class="control">'+ico('clip',20)+'<input id="f-op-fec" type="date" value="2026-09-30" style="padding-left:44px"></div></div>'
  +'</div><p class="tiny">Antes de liberar, el sistema valida la BOM y compara contra Inventario. Si falta insumo, la orden queda en espera y se genera la solicitud a Compras.</p></div>'
  +'<div class="modal__foot"><button class="btn btn--ghost" data-act="cerrar-modal">Cancelar</button>'
   +'<button class="btn" data-act="p-crear">'+ico('gear',19)+'Crear orden</button></div>'
  +'</div></div>';
 $('#f-op-ref').focus();
};
/* La nota azul de Órdenes se quita con su cruz y no vuelve hasta recargar */
A['p-nota']=()=>{S.notaOrd=true;render();};
A['p-liberar']=el=>{liberar(S.op.find(o=>o.id===el.dataset.id));render()};
function liberar(op){
 const f=faltantes(op.ref,op.cant);
 if(f.length){
  op.estado='en espera';
  const ocs=f.map(x=>solicitarCompra(x.cod,'automática',Math.ceil(x.req-x.hay),
    'Falta material para la orden '+op.id+' ('+n0(op.cant)+' pares de '+op.ref+')','produccion',op.id)).filter(Boolean);
  const detalle=f.map(x=>insumo(x.cod).nom+' ('+n2(x.req-x.hay)+' '+insumo(x.cod).un+')').join(', ');
  notificar('produccion','compras','urgente','Material faltante para '+op.id,
    'Para producir '+n0(op.cant)+' pares de '+op.ref+' falta: '+detalle+'.'+(ocs.length?' Solicitudes de material generadas: '+ocs.map(o=>o.id).join(', ')+'.':''),op.id);
  toast('bad',op.id+' en espera de material','Falta '+detalle+'. Compras fue notificado.');
  return false;
 }
 const m=S.modelos.find(x=>x.ref===op.ref);
 m.bom.forEach(([c,q])=>salida(c,q*op.cant,op.id));
 op.liberada=true;op.estado='en proceso';op.etapa=0;op.etapas[0].rec=op.cant;
 log('Liberación de orden',op.id+' · descuento de insumos según BOM');
 notificar('produccion','inventario','info','Salida de insumos por '+op.id,
   'Se descontaron los materiales de '+m.bom.length+' referencias según la BOM de '+op.ref+' para '+n0(op.cant)+' pares.',op.id);
 toast('ok',op.id+' liberada','Insumos descontados del inventario según la BOM. Etapa activa: Corte.');
 return true;
}
/* Val. BOM: pide a Compras el insumo que no alcanza para las órdenes por liberar */
A['p-bom-sol']=el=>{
 if(!exigir(puedeEscribir('produccion'),'No tiene permiso de escritura en Producción.'))return;
 const cod=el.dataset.cod, ref=el.dataset.ref, falta=Number(el.dataset.falta), i=insumo(cod);
 const sol=solicitarCompra(cod,'manual',Math.ceil(falta),
   'Faltante de material para producir '+ref,'produccion',ref);
 if(!sol)return toast('bad','Ya hay una solicitud','El insumo '+i.nom+' ya tiene una solicitud pendiente con Compras.');
 log('Solicitud de material',cod+' · '+n2(falta)+' '+i.un+' para '+ref);
 notificar('produccion','compras','urgente','Faltante de '+i.nom,
   'Para las órdenes pendientes de '+ref+' faltan '+n2(falta)+' '+i.un+' de '+i.nom+'. Solicitud '+sol.id+'.',sol.id);
 toast('ok','Solicitud enviada a Compras',sol.id+' · '+i.nom+' · '+n0(sol.cant)+' '+i.un+'.');
 render();
};
A['p-etapa']=el=>{
 const op=S.op.find(o=>o.id===el.dataset.id),e=op.etapas[op.etapa];
 modal('Etapa '+e.n+' — '+op.id,
  '<p class="muted">Unidades recibidas en esta etapa: <b>'+n0(e.rec)+'</b></p>'
  +'<div class="row2" style="margin-top:14px">'
  +'<div class="field"><label for="e-proc">Cantidad procesada</label><div class="control">'+ico('check',20)+'<input id="e-proc" type="number" min="0" max="'+e.rec+'" value="'+e.rec+'"></div></div>'
  +'<div class="field"><label for="e-perd">Unidades perdidas</label><div class="control">'+ico('x',20)+'<input id="e-perd" type="number" min="0" value="0"></div></div></div>'
  +'<p class="tiny">La etapa siguiente solo puede iniciarse cuando esta quede cerrada.</p>',
  'Cerrar etapa',()=>{
   const pr=+$('#e-proc').value,pe=+$('#e-perd').value;
   if(pr+pe>e.rec)return toast('bad','Cantidades incoherentes','Procesadas y perdidas no pueden superar las '+n0(e.rec)+' unidades recibidas.');
   e.proc=pr;e.perd=pe;e.cerrada=true;
   log('Cierre de etapa',op.id+' · '+e.n+' · '+pr+' procesadas, '+pe+' perdidas');
   if(op.etapa<op.etapas.length-1){op.etapa++;op.etapas[op.etapa].rec=pr;cerrarModal();
    toast('ok','Etapa '+e.n+' cerrada','Pasan '+n0(pr)+' unidades a '+op.etapas[op.etapa].n+'.');}
   else{
    op.estado='cerrada';
    const lote={id:'LT-2026-'+String(++S.seqLote).padStart(3,'0'),op:op.id,ref:op.ref,cant:pr,estado:'pendiente',conf:0,repro:0,desc:0,tipo:'',defecto:'',etapaOrigen:'',fecha:hoy()};
    S.lotes.unshift(lote);log('Lote enviado a calidad',lote.id+' · '+pr+' pares');
    notificar('produccion','calidad','aviso','Lote '+lote.id+' listo para inspección',
      n0(pr)+' pares de '+op.ref+' terminados en '+op.id+' esperan acta de inspección.',lote.id);
    cerrarModal();toast('ok','Orden terminada','El lote '+lote.id+' pasó a Control de Calidad, no directamente a producto terminado.');
   }
   render();
  },'btn--oliva');
};

/* --- Sesión --- */
A['entrar']=()=>{
 const correo=$('#l-mail').value, pass=$('#l-pass').value;
 const r=autenticar(correo,pass);
 if(r.err){
  S.intentos++;
  $('#l-err').innerHTML=ico('alert',16)+'<span>'+esc(r.err)+'</span>';
  $('#c-mail-l').classList.add('bad');$('#c-pass-l').classList.add('bad');
  log('Intento de acceso fallido',(correo||'sin correo')+' · intento '+S.intentos);
  return;
 }
 S.user=r.u; S.intentos=0; S.q='';
 S.vista=r.u.rol==='admin'?'usuarios':puedeVer(r.u.area)?r.u.area:'dashboard';
 log('Inicio de sesión',r.u.nombre+' · '+(r.u.rol==='admin'?'administrador':r.u.rol+' de '+modName(r.u.area)));
 render();
 toast('ok','Bienvenido, '+r.u.nombre.split(' ')[0],r.u.rol==='admin'?'Acceso administrador: los nueve módulos habilitados.':'Rol '+r.u.rol+'. Solo tiene habilitado el módulo de '+modName(r.u.area)+'.');
};
A['ver-pass']=el=>{const i=$('#l-pass');i.type=i.type==='password'?'text':'password';
 el.innerHTML=ico(i.type==='password'?'eye':'eyeoff',18);i.focus();};
A['usar-cred']=el=>{$('#l-mail').value=el.dataset.mail;$('#l-pass').value=el.dataset.pass;
 $('#l-err').innerHTML='';$('#c-mail-l').classList.remove('bad');$('#c-pass-l').classList.remove('bad');$('#l-pass').focus();};
/* El chip del usuario abre su menú (versión, ayuda y cierre de sesión) */
A['sesion']=()=>{S.menuUser=!S.menuUser;render();};
A['salir']=()=>{
 log('Cierre de sesión',S.user.nombre);
 S.user=null;S.q='';S.menuUser=false;render();
 toast('ok','Sesión cerrada','Vuelva a ingresar con sus credenciales.');
};
A['sesion-det']=()=>{
 const u=S.user;
 S.menuUser=false;render();
 modal('Sesión activa',
  '<div style="display:flex;gap:14px;align-items:center"><span class="avatar">'+esc(u.nombre[0])+'</span>'
  +'<div><b style="font-size:18px">'+esc(u.nombre)+'</b><div class="tiny">'+esc(u.correo)+'</div></div></div>'
  +'<div class="kv" style="margin-top:16px"><span>Nivel de permisos</span><b>'+(u.rol==='admin'?'Administrador':u.rol[0].toUpperCase()+u.rol.slice(1))+'</b></div>'
  +'<div class="kv"><span>Módulos habilitados</span><b>'+(u.rol==='admin'?'Los nueve módulos':'Dashboard · '+modName(u.area))+'</b></div>'
  +'<div class="aviso aviso--warn" style="margin-top:16px">'+ico('lock',20)+'<div><b>Control de acceso en el servidor</b><p>'+(u.rol==='admin'?'Como administrador ve los nueve módulos. ':'Los departamentos ajenos al suyo no se muestran ni pueden ejecutarse. ')+'El permiso se verifica antes de cada operación, no basta con ocultar el botón.</p></div></div>',
  'Cerrar sesión',()=>{cerrarModal();A['salir']();});
};
A['recordar']=()=>modal('¿Olvidó su contraseña?',
 '<p>Las contraseñas no se consultan: el administrador genera una nueva desde <b>Admin. Usuarios</b> y queda registrada en la bitácora de auditoría con su responsable y su fecha.</p>'
 +'<p class="tiny" style="margin-top:12px">Un usuario nunca se elimina para resolver un problema de acceso: se desactiva y se reactiva, conservando su historial de operaciones.</p>');


/* --- Transversales --- */
A['alertas']=()=>{
 const mias=misNotis(), sin=mias.filter(n=>!n.leida);
 modal('Notificaciones entre módulos',
  '<p class="muted">'+(S.user.rol==='admin'
    ?'Como administrador ve el tráfico completo entre los nueve módulos.'
    :'Recibe lo que otras áreas necesitan de '+esc(modName(S.user.area))+' y el eco de lo que usted envía.')+'</p>'
  +(sin.length?'<div class="linkline" style="text-align:right;margin:6px 0 0"><button data-act="noti-todas">Marcar todas como atendidas</button></div>':'')
  +'<div class="notis" style="margin-top:12px">'
  +(mias.length?mias.slice(0,14).map(n=>notiItem(n,n.para===S.user.area||S.user.rol==='admin')).join('')
    :'<div class="aviso aviso--ok">'+ico('check',20)+'<div><b>Sin notificaciones</b><p>Ningún módulo requiere una acción de su área.</p></div></div>')
  +'</div>');
};
A['noti-leida']=el=>{const n=S.notis.find(x=>x.id===el.dataset.id);if(n){n.leida=true;log('Notificación atendida',n.t+(n.ref?' · '+n.ref:''));}
 const ab=$('#modalHost .modal'); cerrarModal(); render(); if(ab)A['alertas']();};
A['noti-todas']=()=>{misNotis().forEach(n=>{if(n.para===S.user.area||S.user.rol==='admin')n.leida=true});
 cerrarModal();toast('ok','Bandeja al día','Las notificaciones quedaron marcadas como atendidas.');render();};
A['noti-ir']=el=>{const n=S.notis.find(x=>x.id===el.dataset.id);
 if(!puedeVer(n.para))return toast('bad','Módulo no habilitado','Su rol no tiene acceso a '+modName(n.para)+'.');
 cerrarModal();S.vista=n.para;S.q='';render();};
A['info']=el=>{
 const t={soporte:['Soporte','<p>Mesa de ayuda interna de la fábrica, extensión 120. Los incidentes se registran con el usuario responsable y la fecha, y quedan asociados al módulo donde ocurrieron.</p>'],
  manual:['Manual de usuario','<p>El flujo del sistema sigue la cadena productiva:</p><p style="margin-top:8px" class="muted">Diseño → Compras → Inventario → Producción → Control de Calidad → Comercial → Logística.</p><p style="margin-top:10px">Dashboard y Administración de Usuarios son módulos transversales: el primero solo consulta, el segundo condiciona el acceso a todos los demás.</p><p style="margin-top:10px"><b>Notificaciones:</b> cuando una operación necesita algo de otra área, el sistema avisa al responsable. Inventario avisa a Compras al cruzar el mínimo; Producción avisa a Compras si falta material y a Calidad cuando termina un lote; Calidad devuelve a Producción lo rechazado e informa a Inventario lo conforme; Comercial dispara Producción o Logística según haya existencias; Logística informa a Inventario cada salida y remite a Calidad las devoluciones por defecto.</p>'],
  seguridad:['Políticas de seguridad','<ul style="margin:0;padding-left:18px"><li>Cada usuario se asocia a un área y a un rol: gerente, supervisor u operario.</li><li>Solo el administrador tiene acceso transversal. Un usuario de Logística no puede ver Inventario, ni uno de Inventario ver Producción: cada quien entra únicamente a su departamento.</li><li>La validación de permisos ocurre en el servidor, antes de ejecutar la operación; ocultar un botón no es control de acceso.</li><li>Ningún registro se elimina: se anula o se desactiva, conservando la trazabilidad.</li><li>Toda operación queda asociada al usuario que la ejecutó y a la fecha en que ocurrió.</li><li>Un documento no avanza de estado si el anterior no fue cerrado.</li></ul>']}[el.dataset.tema];
 modal(t[0],t[1]);
};
/* --- Tabla de datos: buscar, filtrar, ordenar, paginar y exportar --- */
A['dt-q']=el=>{const e=S.dt[el.dataset.dt];e.q=el.value;e.pag=1;
 S.foco={id:el.id,pos:el.selectionStart};render();};
A['dt-qx']=el=>{const e=S.dt[el.dataset.dt];e.q='';e.pag=1;render();};
/* Cada pulsación en el encabezado gira: ascendente → descendente → sin orden */
A['dt-orden']=el=>{const e=S.dt[el.dataset.dt], k=el.dataset.col;
 if(e.col!==k){e.col=k;e.dir='asc';}
 else if(e.dir==='asc')e.dir='desc';
 else {e.col='';e.dir='';}
 render();};
A['dt-pag']=el=>{S.dt[el.dataset.dt].pag=Number(el.dataset.p);render();};
A['dt-tam']=el=>{const e=S.dt[el.dataset.dt];e.tam=Number(el.value);e.pag=1;render();};
A['dt-filtro']=el=>{const e=S.dt[el.dataset.dt], k=el.dataset.f;
 if(el.type==='checkbox')e.f[k]=el.checked;
 else if(el.dataset.lado){const v=Object.assign({},e.f[k]);v[el.dataset.lado]=el.value;e.f[k]=v;}
 else e.f[k]=el.value;
 e.pag=1;render();};
A['dt-quitar']=el=>{const e=S.dt[el.dataset.dt], k=el.dataset.f;
 if(k==='__q')e.q=''; else delete e.f[k];
 e.pag=1;render();};
A['dt-limpiar']=el=>{const e=S.dt[el.dataset.dt];e.q='';e.f={};e.pag=1;render();};
/* El botón "Filtros" abre y cierra su caja (se guarda aquí porque la pantalla se redibuja) */
A['dt-caja']=el=>{const e=S.dt[el.dataset.dt];e.caja=!e.caja;render();};
A['dt-cols']=el=>{const e=S.dt[el.dataset.dt];e.cols=!e.cols;render();};
A['dt-col']=el=>{const e=S.dt[el.dataset.dt], k=el.dataset.col;
 if(el.checked)e.ocultas=e.ocultas.filter(x=>x!==k);
 else if(!e.ocultas.includes(k))e.ocultas.push(k);
 render();};
/* Exporta las filas filtradas y ordenadas, con las columnas visibles. */
A['dt-csv']=el=>{
 const id=el.dataset.dt, cfg=DT[id], e=S.dt[id];
 const cols=cfg.cols.filter(c=>!e.ocultas.includes(c.k));
 const filas=dtFilas(cfg,e);
 const celda=t=>/[;"\n]/.test(t)?'"'+t.replace(/"/g,'""')+'"':t;
 const csv=cols.map(c=>celda(c.t)).join(';')+'\n'
  +filas.map(f=>cols.map(c=>celda(dtTexto(c,f))).join(';')).join('\n');
 modal('Exportar '+(cfg.titulo||'registros')+' a CSV',
  '<p class="muted" style="margin-bottom:12px">'+n0(filas.length)+' registro(s) con los filtros, el orden y las columnas que ve en pantalla. '
  +'El separador es punto y coma, así lo abren Excel y LibreOffice sin configurar nada.</p>'
  +'<pre class="csv">'+esc(csv)+'</pre>',
  'Descargar CSV',()=>{descargar((cfg.csv||id)+'.csv',csv);cerrarModal();
   toast('ok','Archivo generado',n0(filas.length)+' registro(s) de '+(cfg.titulo||id)+'.');});
};

/* Elige un paso del lienzo del proceso y muestra su detalle al lado */
A['paso']=el=>{S.pasoSel=Number(el.dataset.p);render();};

/* Carrusel de las tarjetas de proceso: pasa de dos en dos sin redibujar la
   pantalla, para que el movimiento se vea. */
function moverMosaico(n){
 const tr=$('#mosTrack'); if(!tr)return;
 const total=Math.ceil(MOSAICO.length/2);
 S.mosPag=Math.max(0,Math.min(total-1,n));
 tr.style.transform='translateX(-'+(S.mosPag*100)+'%)';
 const c=tr.closest('.mosli');
 c.querySelectorAll('.mosli__pt').forEach((b,i)=>b.classList.toggle('is-on',i===S.mosPag));
 const b1=c.querySelector('[data-p="-1"]'), b2=c.querySelector('[data-p="1"]');
 if(b1)b1.disabled=S.mosPag===0;
 if(b2)b2.disabled=S.mosPag===total-1;
 const t=c.querySelector('.graf__t'); if(t)t.textContent=(S.mosPag+1)+' de '+total;
}
A['mos-pag']=el=>moverMosaico((S.mosPag||0)+Number(el.dataset.p));
A['mos-ir']=el=>moverMosaico(Number(el.dataset.p));

/* Pulsar una barra de la gráfica filtra su tabla; pulsarla otra vez lo quita */
A['graf-f']=el=>{
 const e=S.dt[el.dataset.dt]; if(!e)return;
 const c=el.dataset.c, v=el.dataset.v;
 if(String(e.f[c])===String(v))delete e.f[c]; else e.f[c]=v;
 e.pag=1;render();
};

/* La tarjeta de indicador filtra (o deja de filtrar) la tabla de su proceso */
A['kpi-f']=el=>{
 const e=S.dt[el.dataset.dt]; if(!e)return;
 const f=el.dataset.f, v=el.dataset.v==='true'?true:el.dataset.v;
 if(String(e.f[f])===String(v))delete e.f[f]; else e.f[f]=v;
 e.pag=1;render();
};

/* --- Menú lateral: procesos de Producción y pantallas de los demás módulos --- */
/* Abre o cierra el sub-menú sin volver a dibujar la pantalla, para que la
   altura se pueda animar (igual que el mockup de Logística). */
function animarSub(el,sub,abierto,titulo){
 const grupo=el.closest('.nav__grupo');
 if(grupo)grupo.classList.toggle('is-open',abierto);
 el.setAttribute('aria-expanded',abierto?'true':'false');
 el.title=titulo;
 clearTimeout(sub.timerAlto);
 sub.style.maxHeight=sub.scrollHeight+'px';  /* altura de partida */
 void sub.offsetHeight;                      /* fuerza el redibujado */
 sub.classList.toggle('is-cerrado',!abierto);
 sub.style.maxHeight=abierto?sub.scrollHeight+'px':'0px';
 if(abierto)sub.timerAlto=setTimeout(()=>{if(!sub.classList.contains('is-cerrado'))sub.style.maxHeight=''},260);
}
A['menu-prod']=el=>{
 const sub=$('#nav-sub-produccion'); if(!sub)return;
 S.menuProd=!S.menuProd;
 animarSub(el,sub,S.menuProd,S.menuProd?'Contraer los procesos':'Desplegar los procesos');
};
A['menu-mod']=el=>{
 const mod=el.dataset.mod, sub=$('#nav-sub-'+mod); if(!sub)return;
 const abierto=S.menuMod[mod]===false;
 S.menuMod[mod]=abierto;
 animarSub(el,sub,abierto,abierto?'Contraer las pantallas':'Desplegar las pantallas');
};
/* Una pantalla del mockup de un módulo (ítem de su sub-menú o un botón que salta a ella,
   con data-fila si además debe resaltar una fila) */
A['ir-pant']=el=>irPantalla(el.dataset.mod,el.dataset.pant,el.dataset.fila);
/* Entra a un módulo por uno de sus procesos (ítem del sub-menú, tarjeta del
   flujo o botón que salta a otro módulo). */
A['ir-tab']=el=>{
 const mod=el.dataset.mod;
 if(!puedeVer(mod))return toast('bad','Módulo no habilitado','Su rol no tiene acceso a '+modName(mod)+'.');
 S.vista=mod;S.tab[mod]=el.dataset.tab;S.q='';render();
 const p=$('.page'); if(p)p.scrollIntoView({behavior:'smooth',block:'start'});
};

/* Pliega el menú lateral a una franja de iconos (y lo vuelve a abrir) */
A['plegar']=()=>{S.sideMin=!S.sideMin;render();};
A['ir']=el=>{S.vista=el.dataset.mod;S.q='';render();};
A['q-limpiar']=()=>{S.q='';$('#q').value='';pintarSugerencias();render();$('#q').focus();};
A['q-ir']=el=>{
 const mod=el.dataset.mod, fila=el.dataset.fila;
 if(!puedeVer(mod))return toast('bad','Módulo no habilitado','Su rol no tiene acceso a '+modName(mod)+'.');
 S.q=''; $('#q').value=''; pintarSugerencias();
 /* En un módulo con mockup se abre la pantalla de la fila y la fila queda resaltada un momento */
 if(MOCK[mod])irPantalla(mod,el.dataset.pant,fila);
 else {S.vista=mod; render();}
 toast('ok','Abriendo '+modName(mod),fila||'');
};
A['cerrar-modal']=()=>cerrarModal();
A['modal-ok']=()=>{if(modalOK)modalOK()};


/* =====================================================================
   MOCKUPS DE LOS MÓDULOS
   Menos Producción, cada módulo se ve con SU mockup (NN-modulo/mockup/),
   tal cual: las mismas pantallas, su estilos.css y su prototipo.js. Las
   copias están en modulos/ y las pone ahí integrador/juntar-mockups.mjs,
   que escribe también modulos/modulos.js con las pantallas de cada módulo
   (para el menú lateral) y las filas de sus tablas (para el buscador).

   Cada módulo se muestra en un marco (iframe) llamado "sicaf-general": con
   ese nombre comun/marco.js no dibuja su menú ni su barra de arriba (los pone
   este archivo) y avisa por mensajes en qué pantalla va. El marco se crea la
   primera vez que se abre el módulo y queda vivo: al volver, lo que el
   usuario cambió ahí sigue igual. Con F5 todo vuelve a empezar.
   ===================================================================== */
const MOCK={};     /* id del módulo -> {carpeta, primera, pantallas, filas} de su mockup */
(window.SICAF_MOCKUPS||[]).forEach(m=>{const mod=MODS.find(x=>x.c===m.carpeta);if(mod)MOCK[mod.id]=m;});
const MARCOS={};   /* id del módulo -> su <iframe> */
const LISTO={};    /* el marco ya avisó en qué pantalla está */
const MOSTRAR={};  /* la fila que el buscador pidió resaltar cuando llegue a su pantalla */
/* Pantallas del mockup de Producción -> su proceso en este archivo (para los enlaces de otros módulos) */
const PROD_PANT={'01-panel-principal.html':'panel','02-proceso.html':'proceso','03-ordenes.html':'ordenes',
 '04-val-bom.html':'bom','05-etapas.html':'etapas','06-perdidas.html':'merma','07-tiempos.html':'tiempos',
 '08-calidad.html':'calidad','09-productividad.html':'prod','10-costos.html':'costos'};
const rutaMockup=(mod,pant)=>'modulos/'+MOCK[mod].carpeta+'/mockup/'+pant;

function marcoDe(mod,pant){
 if(!MARCOS[mod]){
  const f=document.createElement('iframe');
  f.className='marco'; f.name='sicaf-general'; f.title=modName(mod);
  f.src=rutaMockup(mod,pant||S.pant[mod]||MOCK[mod].primera);
  $('#marcos').appendChild(f); MARCOS[mod]=f;
 }
 return MARCOS[mod];
}
/* Si el módulo abierto tiene mockup, se ve su marco en lugar de #app */
function mostrarMarcos(){
 const mk=!!MOCK[S.vista];
 $('#app').hidden=mk; $('#marcos').hidden=!mk;
 if(mk)marcoDe(S.vista);
 Object.keys(MARCOS).forEach(k=>{MARCOS[k].hidden=k!==S.vista;});
 acomodarMarcos();
}
/* El marco ocupa toda la ventana: se le dice cuánto miden el menú lateral y la barra de
   arriba, para que su pantalla empiece justo donde termina cada uno (.marcos en el CSS). */
function acomodarMarcos(){
 const c=$('#marcos'); if(!c||c.hidden)return;
 const r=c.getBoundingClientRect(), h={sicaf:'hueco',izquierda:r.left,arriba:r.top};
 Object.keys(MARCOS).forEach(k=>{if(MARCOS[k].contentWindow)MARCOS[k].contentWindow.postMessage(h,'*');});
}
window.addEventListener('resize',acomodarMarcos);
if(window.ResizeObserver){const ro=new ResizeObserver(acomodarMarcos);ro.observe($('.side'));ro.observe($('.top'));}
/* Abre una pantalla del mockup de un módulo. Con "fila", la busca en la pantalla y la resalta. */
function irPantalla(mod,pant,fila){
 if(!puedeVer(mod))return toast('bad','Módulo no habilitado','Su rol no tiene acceso a '+modName(mod)+'.');
 if(!MOCK[mod]){S.vista=mod;S.q='';render();return;}   /* sin modulos/modulos.js: lo dice sinMockup() */
 if(!MOCK[mod].pantallas.some(p=>p.archivo===pant))pant=S.pant[mod]||MOCK[mod].primera;
 const nuevo=!MARCOS[mod], f=marcoDe(mod,pant);
 MOSTRAR[mod]=fila?{pant,fila}:null;
 if(!nuevo){
  if(!LISTO[mod])f.src=rutaMockup(mod,pant);
  else if(S.pant[mod]!==pant)f.contentWindow.postMessage({sicaf:'ir',pantalla:pant},'*');
  else if(fila){f.contentWindow.postMessage({sicaf:'mostrar',texto:fila},'*');MOSTRAR[mod]=null;}
 }
 S.vista=mod; S.pant[mod]=pant; S.q='';
 render();
}
/* Lo que avisa cada marco (comun/marco.js, sección 4) */
window.addEventListener('message',e=>{
 const d=e.data; if(!d||typeof d.sicaf!=='string')return;
 const mod=Object.keys(MARCOS).find(k=>MARCOS[k].contentWindow===e.source); if(!mod)return;
 if(d.sicaf==='pantalla'){           /* en qué pantalla va y qué número tiene cada ítem de su sub-menú */
  LISTO[mod]=true; S.pant[mod]=d.pantalla; S.cts[mod]={};
  (d.numeros||[]).forEach(x=>{S.cts[mod][x.pantalla]=x.ct;});
  const m=MOSTRAR[mod];
  if(m&&m.pant===d.pantalla){e.source.postMessage({sicaf:'mostrar',texto:m.fila},'*');MOSTRAR[mod]=null;}
  if(S.user)pintarMenu();
  acomodarMarcos();
 }
 if(d.sicaf==='modulo'){             /* un enlace a otro módulo */
  const dest=MODS.find(x=>x.c===d.carpeta); if(!dest)return;
  if(MOCK[dest.id])irPantalla(dest.id,d.pantalla);
  else A['ir-tab']({dataset:{mod:dest.id,tab:PROD_PANT[d.pantalla]||'panel'}});
 }
 if(d.sicaf==='buscar')$('#q').focus();
 if(d.sicaf==='clic'){               /* un clic dentro del marco cierra lo que esté abierto aquí */
  if(S.menuUser){S.menuUser=false;pintarMenuUsuario();}
  const s=$('#sug'); if(s&&!s.hidden)s.hidden=true;
 }
});
/* Si falta modulos/modulos.js, el módulo lo dice en vez de quedar en blanco */
function sinMockup(){
 return hero(esc(modName(S.vista)),'Esta pantalla sale del mockup del módulo.')
  +'<div class="aviso aviso--warn">'+ico('alert',20)+'<div><b>Falta juntar los mockups</b>'
  +'<p>Corra <code>node integrador/juntar-mockups.mjs</code> desde la carpeta de SICAF.</p></div></div>';
}


/* =====================================================================
   BUSCADOR GLOBAL — recorre los módulos habilitados para el usuario
   ===================================================================== */
function buscarGlobal(q){
 const t=norm(q).trim(); if(t.length<2)return [];
 const hit=(...campos)=>campos.some(c=>norm(c).includes(t));
 const R=[];
 const peso=(ref,titulo)=>{const r=norm(ref),ti=norm(titulo);
   return r===t||ti===t?4:r.startsWith(t)||ti.startsWith(t)?3:r.includes(t)?2:1;};
 const add=(mod,ref,titulo,detalle,pant,fila,noti)=>{if(puedeVer(mod))R.push({mod,ref,titulo,detalle,pant,fila,p:peso(ref,titulo)-(noti?1.5:0)});};
 /* Los módulos con mockup: las filas de las tablas de sus pantallas, tal como se ven en ellas */
 Object.keys(MOCK).forEach(mod=>MOCK[mod].filas.forEach(f=>{
  if(!hit(f.t,f.d))return;
  const pn=MOCK[mod].pantallas.find(x=>x.archivo===f.p);
  add(mod,'',f.t,(pn?pn.nombre+' · ':'')+f.d,f.p,f.t);
 }));
 /* Producción: sus órdenes de trabajo */
 S.op.forEach(o=>{if(hit(o.id,o.ref,o.estado))
   add('produccion',o.id,'Orden '+o.id,o.ref+' · '+n0(o.cant)+' pares · '+o.estado);});
 S.notis.forEach(n=>{if(hit(n.t,n.d,n.ref)&&(S.user.rol==='admin'||n.para===S.user.area||n.de===S.user.area))
   add(n.para,n.ref,n.t,'Notificación de '+modName(n.de)+' · '+(n.leida?'atendida':'pendiente'),'','',true);});
 const vistos=new Set();
 return R.filter(r=>{const k=r.mod+'|'+r.titulo+'|'+r.detalle; if(vistos.has(k))return false; vistos.add(k); return true;})
   .sort((a,b)=>b.p-a.p);
}
function pintarSugerencias(){
 const cont=$('#sug'), inp=$('#q'); if(!cont)return;
 const q=S.q.trim();
 $('#searchX').hidden=!q; $('#searchK').hidden=!!q;
 if(q.length<2){cont.hidden=true;cont.innerHTML='';inp.setAttribute('aria-expanded','false');return;}
 const res=buscarGlobal(q);
 let html='';
 if(!res.length){
  html='<div class="sug__v">'+ico('search',20)+'<div style="margin-top:6px">Sin coincidencias en los módulos habilitados para usted.</div></div>';
 }else{
  const grupos={}, orden=[];
  res.forEach(r=>{if(!grupos[r.mod]){grupos[r.mod]=[];orden.push(r.mod);}grupos[r.mod].push(r)});
  html=orden.map(id=>MODS.find(m=>m.id===id)).map(m=>
   '<div class="sug__t">'+esc(m.n)+' · '+grupos[m.id].length+'</div>'
   +grupos[m.id].slice(0,5).map(r=>'<button class="sug__i" data-act="q-ir" data-mod="'+r.mod+'"'
     +(r.pant?' data-pant="'+esc(r.pant)+'"':'')+(r.fila?' data-fila="'+esc(r.fila)+'"':'')+'>'
     +ico(m.ic,20)+'<span><b>'+esc(r.titulo)+'</b><small>'+esc(r.detalle)+'</small></span>'
     +(r.ref?'<span class="chip chip--tinta">'+esc(r.ref)+'</span>':'')+'</button>').join('')
  ).join('');
 }
 cont.innerHTML=html; cont.hidden=false; inp.setAttribute('aria-expanded','true');
}

/* =====================================================================
   RENDER Y EVENTOS
   ===================================================================== */
const PLACEHOLDER={usuarios:'Buscar empleado o rol...',dashboard:'Buscar indicador...',diseno:'Buscar modelo o referencia...',compras:'Buscar orden o insumo...',inventario:'Buscar insumo...',produccion:'Buscar orden...',calidad:'Buscar lote o defecto...',comercial:'Buscar pedido o cliente...',logistica:'Buscar despacho o ruta...'};
function renderLogin(){
 $('#login').innerHTML=
  '<aside class="login__brand">'
   +'<div class="lb__head"><div class="lb__logo"><img src="'+IMG_MARCA+'" alt="" width="68" height="52"><b>SICAF</b></div>'
    +'<p>Sistema integral de gestión<br>para fábricas de calzado</p><i></i></div>'
   +'<div class="lb__foto" style="background-image:url(\''+IMG_FOTO+'\')" role="img" aria-label="Calzado terminado sobre la mesa de trabajo"></div>'
   +'<div class="lb__banda">'
    +'<svg class="lb__onda" viewBox="0 0 600 48" preserveAspectRatio="none" aria-hidden="true">'
     +'<path d="M0 30 C 110 2, 210 46, 330 26 C 430 9, 520 30, 600 20 L600 48 L0 48 Z" fill="#D8B888"/>'
     +'<path d="M0 38 C 110 12, 210 52, 330 34 C 430 18, 520 38, 600 29 L600 48 L0 48 Z" fill="#5A1016"/></svg>'
    +'<div class="lb__items"><span>'+ico('gear',24)+'Gestión</span><i></i>'
     +'<span>'+ico('check',24)+'Calidad</span><i></i><span>'+ico('bars',24)+'Resultados</span></div>'
    +'<div class="lb__lema">Calzado que impulsa tus metas</div>'
   +'</div></aside>'
  +'<div class="login__form"><span class="onda"></span><div class="loginwrap"><div class="loginbox">'
  +'<p class="loginbox__hola">Bienvenido(a)</p>'
  +'<h1>Inicia sesión</h1>'
  +'<p class="loginbox__sub">Accede al sistema SICAF para gestionar toda la información de la fábrica.</p>'
  +'<div class="campo" id="c-mail-l"><span class="campo__ic">'+ico('user',20)+'</span>'
   +'<input id="l-mail" type="text" autocomplete="username" placeholder="Usuario" aria-label="Usuario" value="'+ADMIN.correo+'"></div>'
  +'<div class="campo" id="c-pass-l"><span class="campo__ic">'+ico('lock',20)+'</span>'
   +'<input id="l-pass" type="password" autocomplete="current-password" placeholder="Contraseña" aria-label="Contraseña" value="'+clave(ADMIN.correo)+'">'
   +'<button class="campo__ojo" data-act="ver-pass" aria-label="Mostrar u ocultar la contraseña">'+ico('eye',18)+'</button></div>'
  +'<div class="err" id="l-err" role="alert"></div>'
  +'<button class="btn" data-act="entrar">'+ico('entrar',22)+'Ingresar</button>'
  +'<div class="loginbox__div">SICAF</div>'
  +'</div></div></div>';
 $('#login').hidden=false; $('#app-shell').hidden=true;
 const m=$('#l-mail'); if(m)m.focus();
}
/* Menú del usuario: quién es, la ayuda del sistema, la versión y la salida.
   Aquí viven los enlaces que antes estaban en el pie de la página. */
function pintarMenuUsuario(){
 const m=$('#umenu'), b=$('.userbtn');
 if(!m||!S.user)return;
 m.hidden=!S.menuUser;
 if(b)b.setAttribute('aria-expanded',S.menuUser?'true':'false');
 if(!S.menuUser){m.innerHTML='';return}
 const u=S.user;
 const item=(act,tema,ic,txt)=>'<button class="umenu__i" role="menuitem" data-act="'+act+'"'
  +(tema?' data-tema="'+tema+'"':'')+'>'+ico(ic,17)+'<span>'+txt+'</span></button>';
 m.innerHTML='<div class="umenu__h"><span class="avatar avatar--sm">'+esc(u.nombre[0])+'</span>'
  +'<div><b>'+esc(u.nombre)+'</b><small>'+esc(u.correo)+'</small></div></div>'
  +'<div class="umenu__rol">'+ico('lock',15)+(u.rol==='admin'?'Administrador · los nueve módulos'
    :u.rol[0].toUpperCase()+u.rol.slice(1)+' · '+esc(modName(u.area)))+'</div>'
  +'<div class="umenu__g">'
   +item('sesion-det','','user','Detalles de la sesión')
   +item('info','soporte','info','Soporte')
   +item('info','manual','clip','Manual de usuario')
   +item('info','seguridad','lock','Políticas de seguridad')
  +'</div>'
  +'<div class="umenu__g">'+item('salir','','entrar','Cerrar sesión')+'</div>'
  +'<div class="umenu__pie"><b>SICAF</b><span>v1.0.0</span></div>';
}

/* Copia el encabezado de cada columna en sus celdas: en móvil la tabla se
   muestra como fichas y cada dato conserva su rótulo. */
function rotularTablas(){
 document.querySelectorAll('#app table').forEach(t=>{
  const th=[...t.querySelectorAll('thead th')].map(e=>e.textContent.trim());
  if(!th.length)return;
  t.querySelectorAll('tbody tr').forEach(tr=>{
   [...tr.children].forEach((td,i)=>{ if(th[i]&&!td.hasAttribute('data-l'))td.setAttribute('data-l',th[i]); });
  });
 });
}
/* El menú lateral: los nueve módulos. De Producción cuelgan sus procesos; del
   módulo abierto, las pantallas de su mockup (igual que en comun/marco.js). */
const TINTE={dashboard:'#FFFFFF',diseno:'var(--cobre-400)',compras:'#F2E3DE',inventario:'var(--cobre-400)',produccion:'#F2E3DE',calidad:'#5CBB7B',comercial:'var(--cobre-400)',logistica:'var(--cobre-400)',usuarios:'#FFFFFF'};
function pintarMenu(){
 $('#nav').innerHTML=MODS.map(m=>{
  const ver=puedeVer(m.id), cur=S.vista===m.id;
  const item='<button class="nav__item'+(cur?' is-current':m.id==='dashboard'?' is-home':'')+'" data-act="ir" data-mod="'+m.id+'"'+(ver?'':' disabled')+' style="'+(ver?'':'opacity:.35;')+'" title="'+esc(m.n)+'" aria-current="'+(cur?'page':'false')+'">'
   +'<span style="color:'+(cur?'#fff':TINTE[m.id])+';display:flex">'+ico(m.ic,22)+'</span><span>'+m.n+'</span>'+(ver?'':'<span class="nav__lock">'+ico('lock',16)+'</span>')+'</button>';
  if(m.id!=='produccion'){
   if(!cur||!MOCK[m.id])return item;
   const abierto=S.menuMod[m.id]!==false, cts=S.cts[m.id]||{}, on=S.pant[m.id]||MOCK[m.id].primera;
   return '<div class="nav__grupo'+(abierto?' is-open':'')+' is-activo">'
    +'<div class="nav__fila is-current">'+item
     +'<button class="nav__caret" data-act="menu-mod" data-mod="'+m.id+'" aria-expanded="'+(abierto?'true':'false')+'"'
     +' aria-controls="nav-sub-'+m.id+'" title="'+(abierto?'Contraer las pantallas':'Desplegar las pantallas')+'">'+ico('chev',18)+'</button>'
    +'</div>'
    +'<div class="nav__sub'+(abierto?'':' is-cerrado')+'" id="nav-sub-'+m.id+'"'+(abierto?'':' style="max-height:0"')+'>'
    +MOCK[m.id].pantallas.map(p=>{
      const n=p.archivo in cts?cts[p.archivo]:p.ct;
      return '<button class="nav__si'+(p.archivo===on?' is-on':'')+'" data-act="ir-pant" data-mod="'+m.id+'" data-pant="'+esc(p.archivo)+'">'
       +p.ico+'<span>'+esc(p.nombre)+'</span>'+(n?'<span class="ct">'+esc(n)+'</span>':'')+'</button>';
     }).join('')
    +'</div></div>';
  }
  /* Producción se divide en procesos: cuelgan del módulo en un sub-menú desplegable */
  if(!ver)return item;
  const tab=secc('produccion','panel');   /* la pantalla con la que abre el módulo */
  return '<div class="nav__grupo'+(S.menuProd?' is-open':'')+(cur?' is-activo':'')+'">'
   +'<div class="nav__fila'+(cur?' is-current':'')+'">'+item
    +'<button class="nav__caret" data-act="menu-prod" aria-expanded="'+(S.menuProd?'true':'false')+'"'
    +' aria-controls="nav-sub-produccion" title="'+(S.menuProd?'Contraer los procesos':'Desplegar los procesos')+'">'+ico('chev',18)+'</button>'
   +'</div>'
   +'<div class="nav__sub'+(S.menuProd?'':' is-cerrado')+'" id="nav-sub-produccion"'+(S.menuProd?'':' style="max-height:0"')+'>'
   +PROCESOS.map(pr=>{
     const n=pr.ct?pr.ct():0;
     return '<button class="nav__si'+(cur&&tab===pr.id?' is-on':'')+'" data-act="ir-tab" data-mod="produccion" data-tab="'+pr.id+'">'
      +ico(pr.ic,16)+'<span>'+pr.n+'</span>'+(n?'<span class="ct">'+n+'</span>':'')+'</button>';
    }).join('')
   +'</div></div>';
 }).join('');
}
function render(){
 if(!S.user){renderLogin();return}
 $('#login').hidden=true; $('#login').innerHTML=''; $('#app-shell').hidden=false;
 if(!puedeVer(S.vista))S.vista='dashboard';
 /* Menú lateral plegado: la clase la lee el CSS para encoger la columna */
 document.body.classList.toggle('side-min',S.sideMin);
 const bp=$('#btnPlegar');
 if(bp){
  bp.innerHTML=ico(S.sideMin?'desplegar':'plegar',19);
  bp.title=S.sideMin?'Desplegar el menú lateral':'Plegar el menú lateral';
  bp.setAttribute('aria-label',bp.title);
  bp.setAttribute('aria-expanded',S.sideMin?'false':'true');
 }
 pintarMenu();
 /* Producción se dibuja aquí; los demás módulos, con su mockup en su marco */
 if(!MOCK[S.vista])$('#app').innerHTML=(V[S.vista]||sinMockup)();
 mostrarMarcos();
 pintarMenuUsuario();
 $('#userNom').textContent=S.user.nombre;
 $('#userAv').textContent=S.user.nombre[0];
 $('#modo').textContent=S.user.rol==='admin'?'Modo Administrador':'Modo '+S.user.rol[0].toUpperCase()+S.user.rol.slice(1);
 const nAl=sinLeer();
 $('#bellN').textContent=nAl;
 $('#bellN').style.display=nAl?'grid':'none';
 $('#q').placeholder=S.user&&S.user.rol==='admin'?'Buscar modelo, insumo, orden, lote, pedido o empleado...':'Buscar en '+modName(S.user.area)+' y en su bandeja...';
 if($('#q').value!==S.q)$('#q').value=S.q;
 pintarSugerencias();
 rotularTablas();
 /* La pantalla se dibuja entera en cada acción: hay que devolver el cursor
    al buscador de la tabla para poder seguir escribiendo. */
 if(S.foco){
  const c=document.getElementById(S.foco.id);
  if(c){c.focus(); if(c.type==='text'&&S.foco.pos!==null)c.setSelectionRange(S.foco.pos,S.foco.pos);}
  S.foco=null;
 }
}
document.addEventListener('click',e=>{
 /* Un clic fuera cierra el menú de columnas y la caja de filtros de cualquier tabla */
 let cerrar=false;
 if(!e.target.closest('.dt__pop')&&!e.target.closest('[data-act="dt-cols"]'))
  Object.keys(S.dt).forEach(k=>{if(S.dt[k].cols){S.dt[k].cols=false;cerrar=true}});
 if(!e.target.closest('.fil'))
  Object.keys(S.dt).forEach(k=>{if(S.dt[k].caja){S.dt[k].caja=false;cerrar=true}});
 if(S.menuUser&&!e.target.closest('.userwrap')){S.menuUser=false;cerrar=true}
 const t=e.target.closest('[data-act]');
 if(!t){if(cerrar)render();return}
 const a=t.dataset.act;
 if(a==='cerrar-modal'&&t.classList.contains('overlay')&&e.target!==t)return;
 if(A[a]){e.preventDefault();A[a](t);}
 if(cerrar&&($('.dt__pop')||$('details.fil[open]')))render();
});
/* Los controles que responden al cambio (listas, fechas, casillas) usan data-ch;
   los que responden a cada tecla (buscador de la tabla), data-in. */
document.addEventListener('change',e=>{
 const t=e.target.closest('[data-ch]');
 if(t&&A[t.dataset.ch]){A[t.dataset.ch](t);return;}
});
document.addEventListener('input',e=>{
 const t=e.target.closest('[data-in]');
 if(t&&A[t.dataset.in])A[t.dataset.in](t);
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){
  cerrarModal();
  const abiertas=Object.keys(S.dt).filter(k=>S.dt[k].caja);   /* Escape también cierra la caja de filtros */
  if(abiertas.length){abiertas.forEach(k=>{S.dt[k].caja=false});render();}
 }
 if(e.key==='Enter'&&!S.user&&$('#l-mail')&&(e.target.id==='l-mail'||e.target.id==='l-pass')){e.preventDefault();A['entrar']();}
});
$('#q').addEventListener('input',e=>{S.q=e.target.value;pintarSugerencias();render();});
$('#q').addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.stopPropagation();if(S.q){A['q-limpiar']();}else e.target.blur();}
 if(e.key==='Enter'){const p=$('#sug .sug__i'); if(p){e.preventDefault();p.click();}}
 if(e.key==='ArrowDown'){const p=$('#sug .sug__i'); if(p){e.preventDefault();p.focus();}}
});
document.addEventListener('click',e=>{if(!e.target.closest('#search')){const c=$('#sug'); if(c&&!c.hidden){c.hidden=true;}}});
document.addEventListener('keydown',e=>{
 if(e.key==='/'&&!/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)&&S.user){e.preventDefault();$('#q').focus();}
});

S.sel={};
const IMG_FOTO='img/login-foto.jpg';
const IMG_MARCA='img/logo-sicaf.png';
$('#brandMark').innerHTML='<img src="'+IMG_MARCA+'" alt="" width="44" height="34">';
$('#searchIco').innerHTML=ico('search',20);
$('#chev').innerHTML=ico('chev',20);
$('#bellIco').innerHTML=ico('bell',24);
render();
