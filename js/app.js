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
  desplegar:"<rect width='18' height='18' x='3' y='3' rx='2'/> <path d='M9 3v18'/> <path d='m14 9 3 3-3 3'/>"
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

/* ---------- Catálogo de módulos ---------- */
const MODS=[
 {id:'dashboard',  n:'Dashboard General', ic:'grid'},
 {id:'diseno',     n:'Diseño',            ic:'pencil'},
 {id:'compras',    n:'Compras',           ic:'cart'},
 {id:'inventario', n:'Inventario',        ic:'box'},
 {id:'produccion', n:'Producción',        ic:'gear'},
 {id:'calidad',    n:'Control de Calidad', ic:'check'},
 {id:'comercial',  n:'Comercial',         ic:'bars'},
 {id:'logistica',  n:'Logística y Despacho', ic:'truck'},
 {id:'usuarios',   n:'Admin. Usuarios',   ic:'userplus'}
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
 user:null, intentos:0,
 /* Prototipo: la clave se guarda en claro solo para la demostración.
    En Laravel se almacena cifrada con el algoritmo de hash del framework. */
 claves:{'admin@sicaf.com':'admin2026'}, claveDefecto:'sicaf2026',
 TOPE_GERENCIA:2000000,
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
 /* --- Merma, maquinaria, cotizaciones, novedades, calidad y flota --- */
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
 cotiz:[
  {id:'CT-001',sol:'SM-2026-001',prov:'PV-02',precio:2080,dias:8,calidad:4,estado:'registrada',fecha:'2026-09-15'},
  {id:'CT-002',sol:'SM-2026-001',prov:'PV-03',precio:2150,dias:3,calidad:5,estado:'registrada',fecha:'2026-09-15'}
 ], seqCot:2,
 novedades:[
  {id:'NV-001',oc:'OC-2026-014',tipo:'retraso',detalle:'El proveedor informa dos días de demora por transporte.',estado:'abierta',accion:'Coordinar nueva fecha de entrega',fecha:'2026-09-14'}
 ], seqNov:1,
 estandares:[
  {crit:'Costura',param:'12 puntadas por pulgada ±1',herr:'Regla de puntadas',etapa:'Guarnición'},
  {crit:'Pegue de suela',param:'Resistencia ≥ 35 N/cm',herr:'Dinamómetro',etapa:'Montaje'},
  {crit:'Simetría',param:'Diferencia ≤ 2 mm entre pares',herr:'Calibrador',etapa:'Montaje'},
  {crit:'Acabado',param:'Sin manchas ni rayones visibles',herr:'Inspección visual',etapa:'Terminado'},
  {crit:'Numeración',param:'Talla impresa coincide con la horma',herr:'Verificación documental',etapa:'Terminado'},
  {crit:'Presentación',param:'Par completo, cordones y caja correctos',herr:'Lista de chequeo',etapa:'Empaque'}
 ],
 nc:[
  {id:'NC-001',lote:'LT-2026-028',desv:'Pegue de suela por debajo de 35 N/cm',metodo:'5 porqués',causa:'Temperatura del horno reactivador fuera de rango',accion:'Calibrar horno y repetir prueba de resistencia',estado:'abierta',fecha:'2026-09-12',resp:'Admin Principal'}
 ], seqNC:1,
 auditorias:[
  {id:'AU-001',tipo:'Empaque y despacho',doc:'DS-2026-054',resultado:'conforme',obs:'Documentación completa y carga íntegra.',fecha:'2026-09-12'}
 ], seqAud:1,
 flota:[
  {placa:'XYZ-123',tipo:'Camión NPR',cond:'Jorge Peña',estado:'en ruta',ruta:'Bogotá',cap:400,carga:182,x:62,y:38},
  {placa:'ABC-987',tipo:'Furgón',cond:'Luisa Mora',estado:'en ruta',ruta:'Cúcuta',cap:250,carga:96,x:30,y:64},
  {placa:'DEF-455',tipo:'Camioneta',cond:'Hernán Ruiz',estado:'disponible',ruta:'—',cap:120,carga:0,x:16,y:22}
 ],
 recol:[
  {id:'RC-2026-011',cl:'CL-01',ref:'REF-1043',cant:6,motivo:'Talla equivocada',estado:'programada',fecha:'2026-09-16',destino:'inventario'}
 ], seqRec:11,
 recep:[
  {id:'IN-042',oc:'OC-2026-014',prov:'PV-01',guia:'GR-77421',estado:'validado',fecha:'2026-09-15',obs:'Guía leída por OCR sin diferencias.'}
 ], seqRecep:42,
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
 ], seqOC:15, solicitudes:[], seqSol:0,

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
 ], seqLote:30, seqArch:4,

 clientes:[
  {id:'CL-01',nom:'Calzado El Dorado',ciudad:'Bogotá',cupo:25000000,saldo:8400000,cond:'30 días'},
  {id:'CL-02',nom:'Distribuidora Tamanaco',ciudad:'Cúcuta',cupo:12000000,saldo:11100000,cond:'Contado'},
  {id:'CL-03',nom:'Almacén La Horma',ciudad:'Bucaramanga',cupo:18000000,saldo:2600000,cond:'60 días'}
 ],
 precios:{'REF-1042':182000,'REF-1043':154000,'REF-1051':139000,'REF-0987':168000},
 pedidos:[
  {id:'PD-2026-088',cl:'CL-01',ref:'REF-1042',cant:40,estado:'listo',valor:7280000,fecha:'2026-09-11'},
  {id:'PD-2026-089',cl:'CL-03',ref:'REF-1042',cant:120,estado:'en producción',valor:21840000,fecha:'2026-09-12'},
  {id:'PD-2026-090',cl:'CL-02',ref:'REF-1043',cant:25,estado:'cotizado',valor:3850000,fecha:'2026-09-14'}
 ], seqPD:90,

 despachos:[
  {id:'DS-2026-054',pedido:'PD-2026-087',cl:'CL-01',ref:'REF-1043',cant:30,ruta:'Bogotá',estado:'entregado',compromiso:'2026-09-12',real:'2026-09-12',guia:'GR-88214'},
  {id:'DS-2026-055',pedido:'PD-2026-086',cl:'CL-02',ref:'REF-1042',cant:18,ruta:'Cúcuta',estado:'en tránsito',compromiso:'2026-09-16',real:'',guia:'GR-88231'}
 ], seqDS:55,

 prod:[{s:'S33',u:410},{s:'S34',u:365},{s:'S35',u:480},{s:'S36',u:520},{s:'S37',u:455},{s:'S38',u:238}],
 prev:{usuarios:3,supervisores:1,gerentes:1,operarios:1}
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

/* Pares terminados y aprobados por semana (los usa el Dashboard) */
S.prod=[{s:'S31',u:690},{s:'S32',u:745},{s:'S33',u:820},{s:'S34',u:760},
 {s:'S35',u:905},{s:'S36',u:840},{s:'S37',u:880},{s:'S38',u:612}];

/* =====================================================================
   INVENTARIO — el saldo nunca se edita: se recalcula desde movimientos
   ===================================================================== */
function insumo(cod){return S.insumos.find(i=>i.cod===cod)||{cod,nom:cod,un:'un',min:0,costo:0};}
function saldo(cod){return S.mov.filter(m=>m.cod===cod)
  .reduce((a,m)=>a+(m.tipo==='entrada'?m.cant:m.tipo==='salida'?-m.cant:m.cant),0);}
function mover(cod,tipo,cant,doc,motivo){
  S.mov.push({id:'MV-'+String(++S.seqMov).padStart(4,'0'),cod,tipo,cant,fecha:hoy(),doc:doc||'—',resp:S.user?S.user.nombre:'Sistema',motivo:motivo||''});
}
/* Entrada con recálculo de costo promedio ponderado */
function entrada(cod,cant,costoUnit,doc){
  const i=insumo(cod), sAnt=saldo(cod);
  if(costoUnit>0&&sAnt+cant>0) i.costo=(sAnt*i.costo+cant*costoUnit)/(sAnt+cant);
  mover(cod,'entrada',cant,doc);
  revisarMinimo(cod);
}
function salida(cod,cant,doc){mover(cod,'salida',cant,doc);revisarMinimo(cod);}
/* Producto terminado: se maneja como existencia con código PT-<ref> */
const PT=ref=>'PT-'+ref;
function saldoPT(ref){return saldo(PT(ref));}
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
const solPendientes=()=>S.solicitudes.filter(x=>x.estado==='pendiente');
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
function kpiUsuarios(){const a=S.usuarios.filter(u=>u.estado==='Activo');
  return{act:a.length,sup:a.filter(u=>u.rol==='supervisor').length,ger:a.filter(u=>u.rol==='gerente').length,ope:a.filter(u=>u.rol==='operario').length};}
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
function puedeAprobar(mod,monto){const u=S.user;
  if(u.rol==='admin')return true;
  if(u.area!==mod)return false;                   // nadie aprueba fuera de su área
  if(u.rol==='gerente')return true;
  if(u.rol==='supervisor')return !monto||monto<=S.TOPE_GERENCIA;
  return false;}
/* Alertas: cada una pertenece al módulo que la originó */
function alertasVisibles(){const u=S.user;
  return u.rol==='admin'?S.alertas:S.alertas.filter(a=>a.area===u.area);}
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
/* Mapa esquemático de la flota: planta, destinos y vehículos en ruta. */
function mapaFlota(nRuta){
 const PL={x:14,y:76};
 const sitios=[...new Set(S.flota.filter(f=>f.estado==='en ruta').map(f=>f.ruta)
   .concat(S.despachos.filter(d=>d.estado!=='entregado').map(d=>d.ruta)))].filter(r=>r&&r!=='—').slice(0,4);
 const rejilla=[{x:74,y:26},{x:80,y:62},{x:48,y:16},{x:60,y:86}];
 const dest=sitios.map((n,i)=>({n:n,x:rejilla[i%4].x,y:rejilla[i%4].y}));
 const curva=d=>'M '+PL.x+' '+PL.y+' Q '+((PL.x+d.x)/2)+' '+(Math.min(PL.y,d.y)-14)+' '+d.x+' '+d.y;
 const svg='<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'
  +dest.map(d=>'<path d="'+curva(d)+'" fill="none" stroke="#C9B49C" stroke-width="1.6" stroke-dasharray="3 3"'
    +' vector-effect="non-scaling-stroke"/>').join('')
  +'</svg>';
 const nodos='<span class="nodo nodo--pl" style="left:'+PL.x+'%;top:'+PL.y+'%"><i></i><b>Planta</b></span>'
  +dest.map(d=>'<span class="nodo" style="left:'+d.x+'%;top:'+d.y+'%"><i></i><b>'+esc(d.n)+'</b></span>').join('');
 /* punto sobre la curva de su ruta, para que el vehículo viaje por la línea */
 const enCurva=(d,t)=>{const cx=(PL.x+d.x)/2, cy=Math.min(PL.y,d.y)-14, u=1-t;
  return {x:u*u*PL.x+2*u*t*cx+t*t*d.x, y:u*u*PL.y+2*u*t*cy+t*t*d.y};};
 let k=0,j=0;
 const marca=f=>{
  const enR=f.estado==='en ruta';
  const d=dest.find(x=>x.n===f.ruta);
  const q=enR&&d?enCurva(d,.52+(k++%3)*.12):{x:30+(j++)*14,y:95};
  const lado=q.x<26?'veh--der':(q.x>72?'veh--izq':'');
  return '<span class="veh'+(enR?' veh--ruta':'')+(lado?' '+lado:'')
   +'" style="left:'+q.x.toFixed(1)+'%;top:'+q.y.toFixed(1)+'%">'
   +'<b>'+esc(f.placa)+'</b><small>'+esc(enR?f.ruta:(f.estado.charAt(0).toUpperCase()+f.estado.slice(1)))+'</small></span>';};
 const lista='<ul class="flotalista">'+S.flota.map(f=>'<li><span class="ic">'+ico('truck',18)+'</span>'
   +'<span><b>'+esc(f.placa)+'</b><small>'+esc(f.tipo)+' · '+esc(f.cond)+'</small></span>'
   +pill(f.estado==='en ruta'?'en tránsito':'disponible')
   +'<em>'+esc(f.estado==='en ruta'?f.ruta:'En base')+'</em></li>').join('')+'</ul>';
 return '<div class="mapa"><div class="mapa__g"></div>'+svg+nodos+S.flota.map(marca).join('')
  +'<span class="mapa__pie">'+ico('ruta',14)+'Geolocalización en vivo · '+nRuta+' vehículo(s) en ruta</span></div>'
  +lista;
}
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
function filtro(arr,campos){const q=norm(S.q).trim();if(!q)return arr;
 return arr.filter(o=>campos.some(c=>norm(o[c]).includes(q)));}

/* ---------- Subnavegación por módulo ---------- */
function subnav(mod,items){
 const act=S.tab[mod]||items[0].id;
 return '<nav class="subnav" aria-label="Secciones de '+esc(modName(mod))+'">'+items.map(t=>
  '<button class="subnav__i'+(t.id===act?' is-on':'')+'" data-act="tab" data-mod="'+mod+'" data-tab="'+t.id+'">'
  +ico(t.ic,17)+'<span>'+t.n+'</span>'+(t.ct?'<span class="ct">'+t.ct+'</span>':'')+'</button>').join('')+'</nav>';
}
const secc=(mod,def)=>S.tab[mod]||def;
function rapidas(lista){
 return '<div class="rapidas">'+lista.map(r=>'<button class="rapida" data-act="'+r.act+'"'+(r.d?' data-mod="'+r.d+'"':'')+'>'
  +'<span class="ic">'+ico(r.ic,20)+'</span><span><b>'+esc(r.t)+'</b><small>'+esc(r.s)+'</small></span></button>').join('')+'</div>';
}

/* ---------- Lógica del proceso por módulo ---------- */
function procesoPasos(tono,tit,sub,pasos,mod){
 return panel(tono,'ruta',tit,sub,'<div class="panel__body"><div class="pasos">'+pasos.map((p,i)=>
  '<article class="paso'+(p.v?' paso--'+p.v:'')+'"><header><span class="paso__n">'+(i+1)+'</span>'+ico(p.ic,16)+'<b>'+esc(p.t)+'</b></header>'
  +'<ul>'+p.l.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'
  /* Si el paso tiene tabla, la tarjeta lleva a ella (como el mockup de Logística) */
  +(p.ir?'<button class="paso__ir" data-act="ir-tab" data-mod="'+mod+'" data-tab="'+p.ir+'">'
    +'Ver '+esc(p.irT)+ico('arrow',14)+'</button>':'')
  +'</article>').join('')+'</div></div>');
}

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
      buscar, vacio, sinDatos, csv, titulo, clase}
   Columna: {k, t, tipo:'num'|'moneda'|'pct'|'fecha', v:fila=>valor,
             r:fila=>html, oculta, orden:false, busca:false, ancho}
   Filtro:  {k, t, tipo:'select'|'fechas'|'si', op:[...], v, m:(fila,val)=>bool}
   ===================================================================== */
const DT={};                 /* configuración de cada tabla, por id */
const DT_TAMS=[5,10,25,50];  /* filas por página que ofrece el pie */

/* Estado inicial: búsqueda, filtros, orden, página y columnas ocultas. */
function dtEstado(id,cfg){
 if(!S.dt[id])S.dt[id]={q:'',f:{},col:cfg.orden?cfg.orden.k:'',dir:cfg.orden?cfg.orden.dir:'',
  pag:1,tam:cfg.tam||10,ocultas:cfg.cols.filter(c=>c.oculta).map(c=>c.k),cols:false};
 return S.dt[id];
}
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
  if(v===undefined||v===null||v===''||v===false)return;
  const col={k:fl.k,v:fl.v};
  if(fl.tipo==='fechas'){
   if(!v.de&&!v.a)return;
   filas=filas.filter(f=>{const x=dtTexto(col,f);return (!v.de||x>=v.de)&&(!v.a||x<=v.a)});
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
 if(fl.tipo==='fechas')return (v.de||'…')+' a '+(v.a||'…');
 if(fl.tipo==='si')return 'Sí';
 const o=dtOps(fl).find(x=>String(dtOpV(x))===String(v));
 return String(o!==undefined?dtOpT(o):v);
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
 const barra='<div class="dt__bar">'
  +'<div class="dt__q">'+ico('search',18)
   +'<input id="dt-'+id+'-q" type="text" value="'+esc(e.q)+'" autocomplete="off"'
   +' placeholder="'+esc(cfg.buscar||'Buscar en la tabla...')+'" aria-label="Buscar en la tabla" data-in="dt-q'+d+'>'
   +(e.q?'<button class="dt__qx" data-act="dt-qx'+d+' aria-label="Limpiar la búsqueda">'+ico('x',14)+'</button>':'')
  +'</div>'
  +'<div class="dt__acts">'
   +'<button class="dt__b'+(e.cols?' is-on':'')+'" data-act="dt-cols'+d+' aria-expanded="'+(e.cols?'true':'false')
    +'" title="Mostrar u ocultar columnas">'+ico('grid',16)+'<span>Columnas</span></button>'
   +'<button class="dt__b" data-act="dt-csv'+d+' title="Exportar a CSV lo que ve en pantalla">'+ico('down',16)+'<span>Exportar CSV</span></button>'
   +(cfg.boton?'<button class="dt__b dt__b--fuerte" data-act="'+cfg.boton.act+'">'+ico(cfg.boton.ic||'plus',16)+'<span>'+esc(cfg.boton.t)+'</span></button>':'')
   +(e.cols?menuCols:'')
  +'</div></div>';

 /* 2. Fila de filtros */
 const filtros=(cfg.filtros||[]).length?'<div class="dt__filtros" role="group" aria-label="Filtros de la tabla">'
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
 const chips=fichas.length?'<div class="dt__chips"><span class="dt__chips-t">Filtros activos</span>'
  +fichas.map(x=>'<span class="dt__chip">'+esc(x.t)
    +'<button data-act="dt-quitar'+d+' data-f="'+esc(x.k)+'" aria-label="Quitar '+esc(x.t)+'">'+ico('x',12)+'</button></span>').join('')
  +'<button class="dt__link" data-act="dt-limpiar'+d+'>Limpiar todo</button></div>':'';

 /* 4. La tabla: encabezado que ordena y filas de la página */
 const th=cols.map(c=>{
  const on=e.col===c.k, dir=on?e.dir:'';
  const cls=(dtNum(c)?'num ':'')+(on?'is-on ':'')+(c.orden===false?'dt__th--txt':'');
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
      +cols.map(c=>'<td'+(dtNum(c)?' class="num"':'')+'>'+(c.r?c.r(f):dtFmt(c,f))+'</td>').join('')
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
   +'<em>de los '+n0(filas.length)+' registro(s) filtrados</em></span>'
   +res.map(r=>'<span class="dt__res-i'+(r.tono?' dt__res-i--'+r.tono:'')+'"><b>'+esc(r.t)+'</b><span>'+r.v+'</span></span>').join('')
   +'</div>':'';

 /* 6. Pie: cuántas filas se ven, tamaño de página y paginador */
 const info=filas.length
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
   +[...new Set(DT_TAMS.concat(e.tam))].sort((a,b)=>a-b)
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

/* ---------- Solicitudes de material ---------- */
const URG={alta:'<span class="pill pill--crit">Alta</span>',normal:'<span class="pill pill--warn">Normal</span>'};
function filaSolicitud(x,paraCompras){
 const i=insumo(x.cod), p=(S.proveedores.find(v=>v.id===x.prov)||{}).nom||'—';
 const acc=[];
 acc.push('<button class="iconbtn" data-act="s-ver" data-id="'+x.id+'" aria-label="Ver solicitud">'+ico('clip',16)+'</button>');
 if(x.estado==='pendiente'&&paraCompras&&puedeEscribir('compras'))
   acc.push('<button class="btn btn--sm btn--oliva" data-act="s-generar" data-id="'+x.id+'">Generar orden</button>');
 if(x.estado==='pendiente'&&!paraCompras&&puedeEscribir(x.de))
   acc.push('<button class="btn btn--sm btn--ghost" data-act="s-anular" data-id="'+x.id+'">Anular</button>');
 return '<tr><td><b>'+x.id+'</b><div class="tiny">'+x.fecha+' · '+x.origen+'</div></td>'
 +'<td>'+chip(x.de)+'<div class="tiny">'+esc(x.resp)+'</div></td>'
 +'<td>'+esc(i.nom)+'<div class="tiny">'+x.cod+(x.ref?' · '+x.ref:'')+'</div></td>'
 +'<td class="num"><b>'+n0(x.cant)+'</b> <span class="tiny">'+i.un+'</span></td>'
 +'<td>'+(URG[x.urgencia]||'')+'</td>'
 +'<td class="muted">'+esc(p)+'</td>'
 +'<td>'+(x.estado==='atendida'?'<span class="pill pill--ok">Atendida</span><div class="tiny">'+x.oc+'</div>'
        :x.estado==='anulada'?'<span class="pill pill--off">Anulada</span>'
        :'<span class="pill pill--warn">Pendiente</span>')+'</td>'
 +'<td><div class="acts">'+acc.join('')+'</div></td></tr>';
}
function panelSolicitudes(mod){
 const paraCompras=mod==='compras';
 const lista=(paraCompras?S.solicitudes:S.solicitudes.filter(x=>x.de===mod));
 const filas=lista.slice(0,12).map(x=>filaSolicitud(x,paraCompras)).join('');
 const pend=lista.filter(x=>x.estado==='pendiente').length;
 return panel(paraCompras?'cobre':'oliva','clip',
   paraCompras?'Solicitudes de Material Recibidas':'Solicitudes Enviadas a Compras',
   paraCompras?'Inventario y Producción piden; Compras convierte en orden de compra'
              :'Cada solicitud queda visible hasta que Compras genera la orden',
   '<div class="panel__body panel__body--flush">'
   + tabla([['Solicitud'],['Origen'],['Insumo'],['Cantidad','num'],['Urgencia'],['Proveedor sugerido'],['Estado'],['Acciones']],
       filas?[filas]:[], paraCompras?'Ninguna área ha solicitado material.':'Su área no ha enviado solicitudes.')
   + (paraCompras?nota(pend?pend+' solicitud'+(pend===1?'':'es')+' pendiente'+(pend===1?'':'s')+' de convertir en orden de compra.'
        :'Todas las solicitudes recibidas fueron atendidas o anuladas.'):'')
   +'</div>',
   pend?'<span class="ghostbtn" style="pointer-events:none">'+pend+' pendiente'+(pend===1?'':'s')+'</span>':'');
}
function formSolicitud(mod){
 const opsIns=S.insumos.map(i=>'<option value="'+i.cod+'">'+i.nom+' ('+i.cod+' · saldo '+n2(saldo(i.cod))+' '+i.un+')</option>').join('');
 const ops=mod==='produccion'
  ? '<div class="field"><label for="sm-op">Orden de producción</label><div class="control">'+ico('gear',20)+'<select id="sm-op"><option value="">— Sin orden asociada —</option>'
    +S.op.filter(o=>o.estado!=='cerrada').map(o=>'<option value="'+o.id+'">'+o.id+' · '+o.ref+'</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
  : '';
 return panel('vino','cart','Nueva Solicitud de Material','Pide a Compras lo que su área necesita',
  '<div class="panel__body panel__body--form">'
  +'<div class="field"><label for="sm-ins">Insumo</label><div class="control">'+ico('box',20)+'<select id="sm-ins">'+opsIns+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
  +'<div class="field"><label for="sm-cant">Cantidad requerida</label><div class="control">'+ico('plus',20)+'<input id="sm-cant" type="number" min="1" placeholder="Ej. 500"></div></div>'
  +'<div class="field"><label for="sm-urg">Urgencia</label><div class="control">'+ico('alert',20)+'<select id="sm-urg"><option value="normal">Normal</option><option value="alta">Alta · detiene la operación</option></select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
  +ops
  +'<div class="field"><label for="sm-mot">Motivo</label><div class="control">'+ico('clip',20)+'<input id="sm-mot" placeholder="Ej. Consumo mayor al previsto en corte"></div></div>'
  +'<button class="btn" data-act="s-crear" data-de="'+mod+'">'+ico('cart',20)+'Enviar solicitud</button>'
  +'<p class="tiny">La solicitud llega a Compras como notificación y queda en su lista hasta que la conviertan en orden de compra. Ninguna se elimina: se anula con su motivo.</p></div>');
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
function bandeja(mod){
 if(!S.user)return '';
 const p=pendientes(mod).filter(()=>S.user.rol==='admin'||S.user.area===mod);
 if(!p.length)return '';
 return '<section class="panel bandeja"><header class="panel__head panel__head--cobre">'+ico('bell',26)
 +'<div><h2>Pendientes de '+esc(modName(mod))+'</h2><div class="sub">Otros módulos necesitan una acción de esta área</div></div>'
 +'<span class="ghostbtn" style="pointer-events:none">'+p.length+(p.length===1?' aviso':' avisos')+'</span></header>'
 +'<div class="panel__body"><div class="notis">'+p.map(n=>notiItem(n,true)).join('')+'</div></div></section>';
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

/* ---------- Fila de indicadores por módulo (la reutiliza el Dashboard) ---------- */
const KPIROW={
 usuarios(){const k=kpiUsuarios();
  return kpi('arena','user',[k.act,'Usuarios Activos'],delta(k.act,S.prev.usuarios))
   +kpi('rosa','users',[k.sup,'Supervisores'],delta(k.sup,S.prev.supervisores))
   +kpi('oliva','gear',[k.ger,'Gerentes'],delta(k.ger,S.prev.gerentes))
   +kpi('cobre','bars',[k.ope,'Operarios'],delta(k.ope,S.prev.operarios));},
 dashboard(){const opAct=S.op.filter(o=>o.estado!=='cerrada').length,
  prodSem=S.prod[S.prod.length-1].u, prodAnt=S.prod[S.prod.length-2].u,
  bajo=S.insumos.filter(i=>saldo(i.cod)<i.min).length,
  pend=S.pedidos.filter(p=>p.estado==='listo').length+S.despachos.filter(d=>d.estado==='alistado').length;
  return kpi('arena','gear',[opAct,'Órdenes Activas'],delta(opAct,21))
   +kpi('rosa','bars',[n0(prodSem),'Pares esta semana'],delta(prodSem,prodAnt))
   +kpi('oliva','box',[bajo,'Existencias bajo mínimo'],delta(bajo,1,true))
   +kpi('cobre','truck',[pend,'Pedidos por despachar'],delta(pend,1));},
 diseno(){const apr=S.modelos.filter(x=>x.estado==='aprobado').length,
  vers=S.modelos.reduce((a,x)=>a+x.ver,0), costos=S.modelos.map(x=>costoPar(x.ref));
  return kpi('arena','pencil',[S.modelos.length,'Modelos registrados'],delta(S.modelos.length,4))
   +kpi('rosa','check',[apr,'Modelos aprobados'],delta(apr,2))
   +kpi('oliva','clip',[vers,'Versiones vigentes'],delta(vers,6))
   +kpi('cobre','tag',[cop(costos.reduce((a,b)=>a+b,0)/costos.length),'Costo promedio/par'],delta(1,1));},
 compras(){const ab=S.oc.filter(o=>!['cerrada','anulada'].includes(o.estado)),
  monto=ab.reduce((a,o)=>a+o.cant*o.precio,0), autos=S.oc.filter(o=>o.origen==='automática').length;
  return kpi('arena','cart',[ab.length,'Órdenes abiertas'],delta(ab.length,2))
   +kpi('rosa','alert',[solPendientes().length,'Solicitudes pendientes'],delta(solPendientes().length,1,true))
   +kpi('oliva','truck',[S.proveedores.length,'Proveedores activos'],delta(3,3))
   +kpi('cobre','tag',[cop(monto),'Monto comprometido'],delta(monto,1500000));},
 inventario(){const bajo=S.insumos.filter(i=>saldo(i.cod)<i.min),
  valor=S.insumos.reduce((a,i)=>a+saldo(i.cod)*i.costo,0),
  pt=S.modelos.reduce((a,m)=>a+saldoPT(m.ref),0);
  return kpi('arena','box',[S.insumos.length,'Referencias de insumo'],delta(8,8))
   +kpi('rosa','alert',[bajo.length,'Bajo stock mínimo'],delta(bajo.length,1,true))
   +kpi('oliva','check',[n0(pt),'Pares terminados'],delta(pt,110))
   +kpi('cobre','tag',[cop(valor),'Valorización'],delta(valor,9800000));},
 produccion(){const act=S.op.filter(o=>o.estado!=='cerrada'),
  espera=S.op.filter(o=>o.estado==='en espera').length,
  enProc=act.reduce((a,o)=>a+o.cant,0),
  avg=act.length?act.reduce((a,o)=>a+avance(o),0)/act.length:0;
  return kpi('arena','gear',[act.length,'Órdenes en curso'],delta(act.length,21))
   +kpi('rosa','alert',[espera,'En espera de material'],delta(espera,4,true))
   +kpi('oliva','box',[n0(enProc),'Pares programados'],delta(enProc,3860))
   +kpi('cobre','bars',[n0(avg)+' %','Avance promedio'],delta(avg,31));},
 calidad(){const pend=S.lotes.filter(l=>l.estado==='pendiente'), cerr=S.lotes.filter(l=>l.estado!=='pendiente'),
  totU=cerr.reduce((a,l)=>a+l.cant,0), totC=cerr.reduce((a,l)=>a+l.conf,0), idx=totU?totC/totU*100:0,
  repro=cerr.reduce((a,l)=>a+l.repro,0), costoNC=cerr.reduce((a,l)=>a+l.desc*costoPar(l.ref),0);
  return kpi('arena','flask',[pend.length,'Lotes por inspeccionar'],delta(pend.length,4,true))
   +kpi('rosa','check',[n2(idx)+' %','Índice de conformidad'],delta(idx,92))
   +kpi('oliva','edit',[repro,'Unidades en reproceso'],delta(repro,38,true))
   +kpi('cobre','alert',[cop(costoNC),'Costo de la no calidad'],delta(costoNC,280000,true));},
 comercial(){const act=S.pedidos.filter(p=>!['despachado','facturado'].includes(p.estado)),
  valor=act.reduce((a,p)=>a+p.valor,0), cot=S.pedidos.filter(p=>p.estado==='cotizado').length;
  return kpi('arena','bars',[act.length,'Pedidos activos'],delta(act.length,3))
   +kpi('rosa','clip',[cot,'Cotizaciones abiertas'],delta(cot,1))
   +kpi('oliva','user',[S.clientes.length,'Clientes registrados'],delta(3,3))
   +kpi('cobre','tag',[cop(valor),'Valor en pedidos'],delta(valor,28000000));},
 logistica(){const act=S.despachos.filter(d=>d.estado!=='entregado'),
  trans=S.despachos.filter(d=>d.estado==='en tránsito').length,
  ent=S.despachos.filter(d=>d.estado==='entregado'),
  cump=ent.length?ent.filter(d=>d.real<=d.compromiso).length/ent.length*100:0,
  dev=S.despachos.filter(d=>d.dev).length;
  return kpi('arena','truck',[act.length,'Despachos activos'],delta(act.length,1))
   +kpi('rosa','ruta',[trans,'En tránsito'],delta(trans,1))
   +kpi('oliva','check',[n0(cump)+' %','Cumplimiento de entregas'],delta(cump,95))
   +kpi('cobre','arrow',[dev,'Devoluciones'],delta(dev,1,true));}
};
function kpis(mod){return '<div class="kpis">'+(KPIROW[mod]||KPIROW.dashboard)()+'</div>'+bandeja(mod);}

/* =====================================================================
   VISTAS POR MÓDULO
   ===================================================================== */
const V={};

/* ---------- 9. ADMINISTRACIÓN DE USUARIOS ---------- */
V.usuarios=()=>{
 const k=kpiUsuarios();
 const opsArea=MODS.filter(m=>m.id!=='dashboard').map(m=>'<option value="'+m.id+'">'+m.n+'</option>').join('');
 const lista=S.usuarios.filter(u=>{const q=norm(S.q).trim();return !q||[u.nombre,u.correo,u.rol,modName(u.area),u.estado].some(c=>norm(c).includes(q));}).map(u=>
  '<tr><td><div class="who"><span class="avatar avatar--sm" style="background:'+(u.rol==='gerente'?'var(--cobre-600)':u.rol==='supervisor'?'var(--vino-600)':'var(--oliva-800)')+'">'+esc(u.nombre[0])+'</span>'
  +'<div><b>'+esc(u.nombre)+'</b><small>'+esc(u.correo)+'</small></div></div></td>'
  +'<td>'+chip(u.area)+'</td><td class="muted">'+u.rol[0].toUpperCase()+u.rol.slice(1)+'</td>'
  +'<td>'+pill(u.estado)+'</td>'
  +'<td><div class="acts"><button class="iconbtn" data-act="u-editar" data-id="'+u.id+'" title="Editar acceso" aria-label="Editar acceso de '+esc(u.nombre)+'">'+ico('edit',18)+'</button>'
  +'<button class="iconbtn" data-act="u-menu" data-id="'+u.id+'" title="Más acciones" aria-label="Más acciones">'+ico('dots',18)+'</button></div></td></tr>').join('');

 const form=`<div class="panel__body">
  <div class="field"><label for="f-nom">Nombre del Empleado</label>
    <div class="control" id="c-nom">${ico('user',20)}<input id="f-nom" placeholder="Ej. Carlos Mendoza" autocomplete="off"></div></div>
  <div class="field"><label for="f-mail">Correo de Acceso</label>
    <div class="control" id="c-mail">${ico('mail',20)}<input id="f-mail" type="email" placeholder="carlos@sicaf.com" autocomplete="off"></div></div>
  <div class="field"><label for="f-area">Departamento (Módulo Permitido)</label>
    <div class="control" id="c-area">${ico('grid',20)}<select id="f-area"><option value="">-- Seleccionar Área --</option>${opsArea}</select>${'<span class="ico chev">'+ico('chev',20)+'</span>'}</div></div>
  <div class="field"><label for="f-rol">Nivel de Permisos</label>
    <div class="control">${ico('lock',20)}<select id="f-rol">
      <option value="operario">Operario (Solo lectura/escritura básica)</option>
      <option value="supervisor">Supervisor (Aprueba y corrige su área)</option>
      <option value="gerente">Gerente (Acceso transversal y autorizaciones)</option></select><span class="ico chev">${ico('chev',20)}</span></div></div>
  <button class="btn btn--full" data-act="u-crear">${ico('userplus',22)}Crear Usuario</button></div>`;

 return hero('Admin. Usuarios','Controla quién tiene acceso a cada departamento de la fábrica.')
 +kpis('usuarios')+'<div class="grid2">'
 + panel('vino','userplus','Nuevo Acceso','',form,'','Registra un nuevo usuario<br>en el sistema')
 + panel('oliva','users','Usuarios Activos en el Sistema','Visualiza los empleados registrados y sus permisos',
    '<div class="panel__body panel__body--flush">'
    + tabla([['Empleado'],['Área Asignada'],['Rol'],['Estado'],['Acciones']],lista?[lista]:[],'Ningún usuario coincide con la búsqueda.')
    + nota('Los permisos se asignan según el área de trabajo y el nivel de responsabilidad: cada empleado entra solo a su departamento.')+'</div>',
    '<button class="ghostbtn" data-act="u-exportar">'+ico('down',18)+'Exportar</button>')
 +'</div>'
 + panel('cobre','clip','Bitácora de Auditoría','Toda acción administrativa queda registrada con su responsable',
   '<div class="panel__body panel__body--flush">'+tabla([['Fecha'],['Responsable'],['Acción'],['Detalle']],
     S.bitacora.slice(0,8).map(b=>'<tr><td class="muted" style="white-space:nowrap">'+b.f+'</td><td><b>'+esc(b.u)+'</b></td><td>'+esc(b.a)+'</td><td class="muted">'+esc(b.d)+'</td></tr>'))+'</div>');
};

/* ---------- 1. DASHBOARD GENERAL ---------- */
V.dashboard=()=>{
 const opAct=S.op.filter(o=>o.estado!=='cerrada').length;
 const prodSem=S.prod[S.prod.length-1].u, prodAnt=S.prod[S.prod.length-2].u;
 const bajo=S.insumos.filter(i=>saldo(i.cod)<i.min).length;
 const pend=S.pedidos.filter(p=>p.estado==='listo').length+S.despachos.filter(d=>d.estado==='alistado').length;
 const max=Math.max(...S.prod.map(p=>p.u));
 const graf='<div class="chart">'+S.prod.map(p=>'<div class="col"><b>'+n0(p.u)+'</b><i style="height:'+(p.u/max*100)+'%'+(p===S.prod[S.prod.length-1]?';background:var(--cobre-700)':'')+'"></i><span>'+p.s+'</span></div>').join('')+'</div>'
  +'<p class="tiny" style="margin-top:10px">Pares terminados por semana. La semana 38 está en curso (corte al 15/09/2026).</p>';
 const AV=alertasVisibles();
 const avisos=AV.length?AV.map(a=>'<div class="aviso aviso--'+a.nivel+'">'+ico(a.nivel==='crit'?'alert':'info',20)+'<div><b>'+esc(a.t)+'</b><p>'+esc(a.d)+'</p></div></div>').join('')
   :'<div class="aviso aviso--ok">'+ico('check',20)+'<div><b>Sin alertas activas</b><p>Ningún indicador de su área cruzó su umbral en el periodo.</p></div></div>';
 const cadena=[
  ['diseno','Modelos aprobados',S.modelos.filter(m=>m.estado==='aprobado').length+' de '+S.modelos.length],
  ['compras','Órdenes de compra abiertas',S.oc.filter(o=>!['cerrada','anulada'].includes(o.estado)).length],
  ['inventario','Valor del inventario',cop(S.insumos.reduce((a,i)=>a+saldo(i.cod)*i.costo,0))],
  ['produccion','Órdenes en curso',opAct+' · '+S.op.filter(o=>o.estado==='en espera').length+' en espera'],
  ['calidad','Índice de conformidad',(()=>{const l=S.lotes.filter(x=>x.estado!=='pendiente');const t=l.reduce((a,x)=>a+x.cant,0),c=l.reduce((a,x)=>a+x.conf,0);return t?n2(c/t*100)+' %':'—';})()],
  ['comercial','Pedidos activos',S.pedidos.filter(p=>!['despachado','facturado'].includes(p.estado)).length],
  ['logistica','Cumplimiento de entregas',(()=>{const e=S.despachos.filter(d=>d.estado==='entregado');return e.length?n0(e.filter(d=>d.real<=d.compromiso).length/e.length*100)+' %':'—';})()]
 ].filter(r=>puedeVer(r[0]));
 const admin=S.user.rol==='admin', mia=S.user.area;
 return hero('Dashboard General',admin
   ?'Estado consolidado de la fábrica para '+esc(S.user.nombre)+'.'
   :'Indicadores de '+esc(modName(mia))+'. Su rol no habilita la consulta de otros departamentos.')
 +kpis(admin?'dashboard':mia)+'<div class="grid2">'
 + panel('vino','alert','Alertas del Sistema','Generadas automáticamente por los módulos','<div class="panel__body">'+avisos+'</div>')
 + (admin
    ? panel('oliva','bars','Tendencia de Producción','Unidades terminadas y aprobadas por calidad','<div class="panel__body">'+graf+'</div>')
    : panel('oliva',modIcon(mia),modName(mia),'Su módulo de trabajo',
       '<div class="panel__body"><p class="muted" style="margin-bottom:14px">Usted opera únicamente en este departamento. Los indicadores de producción, inventario y ventas del resto de la fábrica no están habilitados para su rol.</p>'
       +'<button class="btn btn--oliva" data-act="ir" data-mod="'+mia+'">'+ico(modIcon(mia),20)+'Abrir '+esc(modName(mia))+'</button>'
       +'<p class="tiny" style="margin-top:14px">Si necesita información de otro departamento, solicítela al administrador del sistema.</p></div>'))
 +'</div>'
 + panel('vino','bell','Flujo de Notificaciones','Cada operación avisa al área que debe actuar',
   '<div class="panel__body"><div class="notis">'
   +(misNotis().length?misNotis().slice(0,6).map(n=>notiItem(n,false)).join('')
     :'<div class="aviso aviso--ok">'+ico('check',20)+'<div><b>Sin movimientos recientes</b><p>Ningún módulo ha necesitado avisar a otro.</p></div></div>')
   +'</div></div>')
 + panel('cobre','ruta',admin?'Estado de la Cadena Productiva':'Su Departamento','El panel solo consulta: ningún indicador escribe en los módulos',
   '<div class="panel__body panel__body--flush">'+tabla([['Módulo'],['Indicador'],['Valor','num']],
     cadena.map(r=>'<tr><td>'+chip(r[0])+'</td><td class="muted">'+r[1]+'</td><td class="num"><b>'+r[2]+'</b></td></tr>'))
   + nota(admin?'El Dashboard consume datos de todos los módulos y no escribe en ninguno.'
     :'Solo el administrador tiene acceso transversal: usted consulta únicamente los indicadores de '+esc(modName(mia))+'.')+'</div>');
};

/* ---------- 2. DISEÑO ---------- */
V.diseno=()=>{
 S.sel.diseno=S.sel.diseno||'REF-1042';
 const m=S.modelos.find(x=>x.ref===S.sel.diseno)||S.modelos[0];
 const edit=puedeEscribir('diseno');
 const arch=(m.archivos||[]);
 const vivos=arch.filter(a=>!a.anulado);

 /* --- Catálogo (ancho completo) --- */
 const lista=filtro(S.modelos,['ref','nom','temp','estado']).map(x=>{
  const na=(x.archivos||[]).filter(a=>!a.anulado).length;
  return '<tr'+(x.ref===m.ref?' style="background:#FFF7EE"':'')+'>'
  +'<td><b>'+x.ref+'</b><div class="tiny">versión '+x.ver+'</div></td>'
  +'<td>'+esc(x.nom)+'<div class="tiny">'+esc(x.temp)+' · curva '+x.curva+'</div></td>'
  +'<td>'+pill(x.estado)+'</td>'
  +'<td class="num">'+x.bom.length+'</td>'
  +'<td class="num"><b>'+cop(costoPar(x.ref))+'</b></td>'
  +'<td>'+(na?'<span class="chip chip--cobre">'+ico('clip',15)+na+'</span>':'<span class="tiny">Sin planos</span>')+'</td>'
  +'<td><div class="acts"><button class="btn btn--sm '+(x.ref===m.ref?'btn--cobre':'btn--ghost')+'" data-act="d-ver" data-ref="'+x.ref+'">'+(x.ref===m.ref?'En ficha':'Abrir')+'</button></div></td></tr>';
 }).join('');

 /* --- Ficha técnica en tres franjas horizontales --- */
 const datos='<div class="ficha__col">'
  +'<h4 class="ficha__t">'+ico('clip',18)+'Datos del modelo</h4>'
  +'<div class="kv"><span>Referencia</span><b>'+m.ref+'</b></div>'
  +'<div class="kv"><span>Versión</span><b>v'+m.ver+'</b></div>'
  +'<div class="kv"><span>Modelo</span><b>'+esc(m.nom)+'</b></div>'
  +'<div class="kv"><span>Temporada</span><b>'+esc(m.temp)+'</b></div>'
  +'<div class="kv"><span>Curva de tallas</span><b>'+m.curva+'</b></div>'
  +'<div class="kv"><span>Estado</span><span>'+pill(m.estado)+'</span></div>'
  +'<div class="costo"><span>Costo estimado por par</span><b>'+cop(costoPar(m.ref))+'</b></div>'
  +(edit?'<div class="ficha__acc">'
    +(m.estado==='borrador'?'<button class="btn btn--sm btn--oliva" data-act="d-aprobar" data-ref="'+m.ref+'">'+ico('check',17)+'Aprobar</button>':'')
    +'<button class="btn btn--sm btn--ghost" data-act="d-editar" data-ref="'+m.ref+'">'+ico('edit',17)+'Editar</button>'
    +(m.estado!=='borrador'?'<button class="btn btn--sm btn--ghost" data-act="d-version" data-ref="'+m.ref+'">'+ico('plus',17)+'Nueva versión</button>':'')
    +(m.estado!=='descontinuado'?'<button class="btn btn--sm btn--ghost" data-act="d-descontinuar" data-ref="'+m.ref+'">'+ico('x',17)+'Descontinuar</button>':'')
    +'</div>':'')
  +'<p class="tiny" style="margin-top:12px">Un modelo aprobado no se sobrescribe: al editarlo el sistema crea una versión nueva y conserva la anterior por trazabilidad.</p>'
  +'</div>';

 const bomFilas=m.bom.length?m.bom.map(([c,q],ix)=>{const i=insumo(c);
   return '<tr><td>'+esc(i.nom)+'<div class="tiny">'+c+'</div></td>'
   +'<td class="num">'+n2(q)+' <span class="tiny">'+i.un+'</span></td>'
   +'<td class="num muted">'+cop(i.costo)+'</td>'
   +'<td class="num"><b>'+cop(q*i.costo)+'</b></td>'
   +(edit?'<td><div class="acts"><button class="iconbtn" data-act="d-quitar-mat" data-ix="'+ix+'" aria-label="Quitar material">'+ico('x',16)+'</button></div></td>':'')+'</tr>';
  }).join(''):'';
 const bom='<div class="ficha__col">'
  +'<h4 class="ficha__t">'+ico('box',18)+'Lista de materiales (BOM)</h4>'
  +(bomFilas
    ?'<div class="scroll-x"><table><thead><tr><th>Insumo</th><th class="num">Cant./par</th><th class="num">Costo</th><th class="num">Subtotal</th>'+(edit?'<th></th>':'')+'</tr></thead><tbody>'+bomFilas+'</tbody></table></div>'
    :'<div class="empty">Este modelo aún no tiene materiales. Agréguelos para poder costearlo.</div>')
  +(edit?'<button class="btn btn--sm btn--ghost" style="margin-top:12px" data-act="d-agregar-mat">'+ico('plus',17)+'Agregar material</button>':'')
  +'<p class="tiny" style="margin-top:10px">De esta lista dependen Compras, Inventario y Producción.</p>'
  +'</div>';

 const archHtml=vivos.length||arch.length
  ? arch.map(a=>'<div class="archivo'+(a.anulado?' is-off':'')+'">'
     +(a.url?'<img class="mini" src="'+a.url+'" alt="">':'<span class="mini">'+ico(a.tipo==='imagen'?'tag':'clip',20)+'</span>')
     +'<span class="archivo__d"><b>'+esc(a.nombre)+'</b><small>'+a.peso+' · '+a.fecha+' · '+esc(a.resp)+'</small></span>'
     +(a.anulado?'<span class="pill pill--off">Anulado</span>'
       :'<span class="acts"><button class="iconbtn" data-act="d-ver-archivo" data-id="'+a.id+'" aria-label="Ver archivo">'+ico('eye',16)+'</button>'
        +(edit?'<button class="iconbtn" data-act="d-anular-archivo" data-id="'+a.id+'" aria-label="Anular archivo">'+ico('x',16)+'</button>':'')+'</span>')
     +'</div>').join('')
  : '<div class="empty" style="padding:14px">Sin planos ni fichas cargadas todavía.</div>';
 const planos='<div class="ficha__col">'
  +'<h4 class="ficha__t">'+ico('clip',18)+'Planos y archivos <span class="tiny">('+vivos.length+' vigentes)</span></h4>'
  +(edit?'<label class="drop" id="dropPlanos" for="f-planos">'
    +ico('down',26)+'<b>Arrastre los planos aquí</b>'
    +'<span class="tiny">o haga clic para elegirlos · PDF, DWG, DXF, AI, PNG o JPG</span>'
    +'<input type="file" id="f-planos" multiple accept=".pdf,.dwg,.dxf,.ai,.svg,.png,.jpg,.jpeg,.webp" hidden></label>':'')
  +'<div class="archivos">'+archHtml+'</div>'
  +'<p class="tiny" style="margin-top:10px">Los archivos quedan asociados a la versión '+m.ver+' del modelo. Ninguno se elimina: se anula y permanece en el historial.</p>'
  +'</div>';

 return hero('Diseño','Modelos, versiones, planos y lista de materiales que alimenta toda la cadena.')
 +kpis('diseno')
 + panel('oliva','pencil','Catálogo de Modelos','Solo un modelo aprobado puede entrar a una orden de producción',
    '<div class="panel__body panel__body--flush">'
    + tabla([['Referencia'],['Modelo'],['Estado'],['Mat.','num'],['Costo/par','num'],['Planos'],['']],lista?[lista]:[])
    + nota('La BOM es el corazón del módulo: de ella dependen Compras, Inventario y Producción.')+'</div>',
    edit?'<button class="ghostbtn" data-act="d-nuevo">'+ico('plus',18)+'Nuevo modelo</button>':'')
 + panel('vino','clip','Ficha Técnica · '+m.ref,esc(m.nom)+' · versión '+m.ver+' · '+esc(m.temp),
    '<div class="panel__body"><div class="ficha">'+datos+bom+planos+'</div></div>')
 + (edit?'<button class="fab" data-act="d-atajo" aria-label="Crear o editar modelo" title="Crear o editar modelo">'+ico('pencil',26)+'</button>':'');
};

/* ---------- 3. COMPRAS ---------- */
V.compras=()=>{
 const t=secc('compras','proceso');
 const abiertas=S.oc.filter(o=>!['cerrada','anulada'].includes(o.estado));
 const pend=solPendientes().length;
 const edit=puedeEscribir('compras');
 let cuerpo='';

 /* --- 1. Lógica del proceso (los nueve pasos) --- */
 if(t==='proceso'){
  cuerpo = procesoPasos('cobre','Proceso de Compras','Del hallazgo de la necesidad al ingreso en bodega',[
   {ic:'search',t:'Detectar necesidad',l:['Revisar inventario','Verificar stock mínimo','Generar solicitud si aplica']},
   {ic:'clip',t:'Crear solicitud',l:['Registrar material','Indicar cantidad, fecha y motivo','Estado: pendiente']},
   {ic:'users',t:'Seleccionar proveedor',l:['Consultar proveedores','Comparar precio, calidad y tiempo','Elegir proveedor']},
   {ic:'tag',t:'Cotización',l:['Registrar cotización','Comparar opciones','Seleccionar la mejor']},
   {ic:'check',t:'Aprobar compra',l:['Revisar solicitud','Aprobar o rechazar','Generar orden si se aprueba'],v:'ok'},
   {ic:'cart',t:'Orden de compra',l:['Registrar orden','Proveedor, materiales, cantidades, precios y fecha','Enviar al proveedor']},
   {ic:'truck',t:'Recibir materiales',l:['Verificar cantidad','Revisar calidad','Confirmar y registrar recepción']},
   {ic:'box',t:'Actualizar inventario',l:['Sumar cantidades','Cambiar estado de la orden','Confirmar en el sistema']},
   {ic:'alert',t:'Si hay problemas',l:['Registrar novedad','Solicitar corrección o cambio','Coordinar con el proveedor'],v:'warn'}
  ])
  + panel('vino','clip','Estado del Proceso','Dónde está hoy cada documento de compra','<div class="panel__body">'
    +'<div class="kv"><span>Solicitudes pendientes de convertir</span><b>'+pend+'</b></div>'
    +'<div class="kv"><span>Cotizaciones registradas</span><b>'+S.cotiz.length+'</b></div>'
    +'<div class="kv"><span>Órdenes por aprobar</span><b>'+S.oc.filter(o=>o.estado==='solicitada').length+'</b></div>'
    +'<div class="kv"><span>Órdenes enviadas al proveedor</span><b>'+S.oc.filter(o=>['enviada','parcial'].includes(o.estado)).length+'</b></div>'
    +'<div class="kv"><span>Novedades abiertas</span><b>'+S.novedades.filter(n=>n.estado==='abierta').length+'</b></div>'
    +'</div>');
 }

 /* --- 2. Solicitudes recibidas --- */
 if(t==='solicitudes') cuerpo = panelSolicitudes('compras');

 /* --- 3-4. Cotizaciones --- */
 if(t==='cotiz'){
  const filas=filtro(S.cotiz,['id','sol','estado']).map(c=>{
   const p=S.proveedores.find(v=>v.id===c.prov)||{nom:'—'}, sol=S.solicitudes.find(x=>x.id===c.sol);
   const i=sol?insumo(sol.cod):{nom:'—',un:''};
   return '<tr><td><b>'+c.id+'</b><div class="tiny">'+c.fecha+'</div></td>'
   +'<td>'+c.sol+'<div class="tiny">'+esc(i.nom)+'</div></td>'
   +'<td>'+esc(p.nom)+'</td>'
   +'<td class="num">'+cop(c.precio)+'<div class="tiny">por '+esc(i.un||'un')+'</div></td>'
   +'<td class="num">'+c.dias+'<div class="tiny">días</div></td>'
   +'<td class="num">'+c.calidad+' / 5</td>'
   +'<td>'+(c.estado==='elegida'?'<span class="pill pill--ok">Elegida</span>':'<span class="pill pill--warn">Registrada</span>')+'</td>'
   +'<td><div class="acts">'+(c.estado==='registrada'&&edit&&sol&&sol.estado==='pendiente'
      ?'<button class="btn btn--sm btn--oliva" data-act="c-elegir" data-id="'+c.id+'">Elegir y ordenar</button>':'<span class="tiny">—</span>')+'</div></td></tr>';
  }).join('');
  const sols=S.solicitudes.filter(x=>x.estado==='pendiente');
  const form='<div class="panel__body panel__body--form">'
   +'<div class="field"><label for="ct-sol">Solicitud</label><div class="control">'+ico('clip',20)+'<select id="ct-sol">'
    +(sols.map(x=>'<option value="'+x.id+'">'+x.id+' · '+insumo(x.cod).nom+' · '+n0(x.cant)+' '+insumo(x.cod).un+'</option>').join('')||'<option value="">— Sin solicitudes pendientes —</option>')
    +'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="ct-prov">Proveedor</label><div class="control">'+ico('truck',20)+'<select id="ct-prov">'
    +S.proveedores.map(p=>'<option value="'+p.id+'">'+p.nom+'</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="ct-pre">Precio unitario</label><div class="control">'+ico('tag',20)+'<input id="ct-pre" type="number" min="1" placeholder="Ej. 2080"></div></div>'
   +'<div class="field"><label for="ct-dias">Días de entrega</label><div class="control">'+ico('clip',20)+'<input id="ct-dias" type="number" min="1" value="5"></div></div>'
   +'<div class="field"><label for="ct-cal">Calidad ofrecida</label><div class="control">'+ico('check',20)+'<select id="ct-cal"><option value="5">5 · excelente</option><option value="4" selected>4 · buena</option><option value="3">3 · aceptable</option></select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<button class="btn" data-act="c-cotizar" '+(sols.length?'':'disabled')+'>'+ico('tag',19)+'Registrar cotización</button>'
   +'<p class="tiny">Se comparan precio, tiempo de entrega y calidad. Al elegir una cotización el sistema genera la orden de compra con ese proveedor.</p></div>';
  cuerpo = panel('vino','tag','Registrar Cotización','Paso 4: comparar opciones antes de ordenar',form)
   + panel('oliva','clip','Cotizaciones por Solicitud','La elegida se convierte en orden de compra',
     '<div class="panel__body panel__body--flush">'+tabla([['Cotización'],['Solicitud'],['Proveedor'],['Precio','num'],['Entrega','num'],['Calidad','num'],['Estado'],['Acciones']],
       filas?[filas]:[],'Aún no se han registrado cotizaciones.')+'</div>');
 }

 /* --- 5-6. Órdenes de compra --- */
 if(t==='ordenes'){
  const filas=filtro(S.oc,['id','cod','estado','origen']).map(o=>{
   const i=insumo(o.cod), p=S.proveedores.find(x=>x.id===o.prov)||{nom:'—'}, tot=o.cant*o.precio;
   const acc=[];
   if(o.estado==='solicitada')acc.push('<button class="btn btn--sm btn--ghost" data-act="c-aprobar" data-id="'+o.id+'">Aprobar</button>');
   if(o.estado==='aprobada')acc.push('<button class="btn btn--sm btn--ghost" data-act="c-enviar" data-id="'+o.id+'">Enviar</button>');
   if(['enviada','parcial'].includes(o.estado))acc.push('<button class="btn btn--sm btn--oliva" data-act="c-recibir" data-id="'+o.id+'">Recibir</button>');
   return '<tr><td><b>'+o.id+'</b><div class="tiny">'+esc(p.nom)+' · '+(o.sol?'desde '+o.sol:o.origen)+'</div></td>'
   +'<td>'+esc(i.nom)+'<div class="tiny">'+o.cod+'</div></td>'
   +'<td class="num">'+n0(o.recibido)+' / '+n0(o.cant)+'<div class="tiny">'+i.un+'</div></td>'
   +'<td class="num">'+cop(tot)+(tot>S.TOPE_GERENCIA?'<div class="tiny" style="color:var(--warn)">Requiere gerencia</div>':'')+'</td>'
   +'<td>'+pill(o.estado)+'</td><td><div class="acts">'+(acc.join('')||'<span class="tiny">—</span>')+'</div></td></tr>';
  }).join('');
  const opsIns=S.insumos.map(i=>'<option value="'+i.cod+'">'+i.nom+' ('+i.cod+')</option>').join('');
  const form='<div class="panel__body panel__body--form">'
   +'<div class="field"><label for="f-oc-ins">Insumo</label><div class="control">'+ico('box',20)+'<select id="f-oc-ins" data-act="oc-ins">'+opsIns+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="f-oc-prov">Proveedor sugerido</label><div class="control">'+ico('truck',20)+'<select id="f-oc-prov">'+S.proveedores.map(p=>'<option value="'+p.id+'">'+p.nom+' · '+p.calif+'★ · '+p.dias+' días</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="f-oc-cant">Cantidad</label><div class="control">'+ico('plus',20)+'<input id="f-oc-cant" type="number" min="1" value="500"></div></div>'
   +'<div class="field"><label for="f-oc-pre">Precio unitario</label><div class="control">'+ico('tag',20)+'<input id="f-oc-pre" type="number" min="1" value="1450"></div></div>'
   +'<button class="btn" data-act="c-crear">'+ico('cart',19)+'Generar orden</button>'
   +'<p class="tiny">El proveedor se sugiere por calificación histórica y tiempo de entrega. Las órdenes que superen '+cop(S.TOPE_GERENCIA)+' solo pueden ser aprobadas por un usuario con rol de gerente.</p></div>';
  cuerpo = panel('vino','cart','Nueva Orden de Compra','Directa, o generada desde una solicitud de material',form)
   + panel('oliva','clip','Órdenes de Compra','Solicitada → aprobada → enviada → recibida → cerrada',
     '<div class="panel__body panel__body--flush">'+tabla([['Orden'],['Insumo'],['Recibido','num'],['Monto','num'],['Estado'],['Acciones']],filas?[filas]:[])
     + nota('Toda recepción confirmada incrementa el inventario y recalcula el costo promedio del insumo.')+'</div>');
 }

 /* --- 7-8. Recepciones --- */
 if(t==='recep'){
  const porRecibir=S.oc.filter(o=>['enviada','parcial'].includes(o.estado)).map(o=>{
   const i=insumo(o.cod), p=S.proveedores.find(x=>x.id===o.prov)||{nom:'—'};
   return '<tr><td><b>'+o.id+'</b><div class="tiny">'+esc(p.nom)+'</div></td>'
   +'<td>'+esc(i.nom)+'<div class="tiny">'+o.cod+'</div></td>'
   +'<td class="num">'+n0(o.cant-o.recibido)+' '+i.un+'</td>'
   +'<td>'+pill(o.estado)+'</td>'
   +'<td><div class="acts"><button class="btn btn--sm btn--oliva" data-act="c-recibir" data-id="'+o.id+'">Registrar recepción</button></div></td></tr>';
  }).join('');
  const hist=S.mov.filter(m=>/^OC-/.test(m.doc)).slice().reverse().slice(0,10).map(m=>
   '<tr><td><b>'+m.doc+'</b></td><td>'+m.cod+'<div class="tiny">'+esc(insumo(m.cod).nom)+'</div></td>'
   +'<td class="num">'+n2(m.cant)+' '+insumo(m.cod).un+'</td><td class="muted">'+esc(m.resp)+'</td><td class="tiny">'+m.fecha+'</td></tr>').join('');
  cuerpo = panel('vino','truck','Pendientes de Recepción','Verificar cantidad y calidad antes de confirmar',
    '<div class="panel__body panel__body--flush">'+tabla([['Orden'],['Insumo'],['Pendiente','num'],['Estado'],['Acciones']],porRecibir?[porRecibir]:[],'No hay órdenes en camino.')
    + nota('Si la cantidad difiere de la solicitada, la orden queda como entrega parcial y permanece abierta.')+'</div>')
   + panel('oliva','clip','Recepciones Registradas','Cada ingreso quedó como movimiento de inventario',
     '<div class="panel__body panel__body--flush">'+tabla([['Orden'],['Insumo'],['Cantidad','num'],['Responsable'],['Fecha']],hist?[hist]:[],'Todavía no se ha recibido material.')+'</div>');
 }

 /* --- 9. Novedades --- */
 if(t==='novedades'){
  const filas=filtro(S.novedades,['id','oc','tipo','estado']).map(n=>
   '<tr><td><b>'+n.id+'</b><div class="tiny">'+n.fecha+'</div></td>'
   +'<td>'+esc(n.oc)+'</td>'
   +'<td><span class="chip chip--cobre">'+esc(n.tipo)+'</span></td>'
   +'<td>'+esc(n.detalle)+'</td>'
   +'<td class="muted">'+esc(n.accion)+'</td>'
   +'<td>'+(n.estado==='cerrada'?'<span class="pill pill--ok">Cerrada</span>':'<span class="pill pill--crit">Abierta</span>')+'</td>'
   +'<td><div class="acts">'+(n.estado==='abierta'&&edit?'<button class="btn btn--sm btn--ghost" data-act="c-cerrar-nov" data-id="'+n.id+'">Cerrar</button>':'<span class="tiny">—</span>')+'</div></td></tr>').join('');
  const form='<div class="panel__body panel__body--form">'
   +'<div class="field"><label for="nv-oc">Orden de compra</label><div class="control">'+ico('cart',20)+'<select id="nv-oc">'
    +(S.oc.map(o=>'<option value="'+o.id+'">'+o.id+' · '+insumo(o.cod).nom+'</option>').join('')||'<option value="">—</option>')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="nv-tipo">Tipo de novedad</label><div class="control">'+ico('alert',20)+'<select id="nv-tipo"><option value="retraso">Retraso en la entrega</option><option value="faltante">Faltante de cantidad</option><option value="calidad">Material no conforme</option><option value="precio">Diferencia de precio</option></select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="nv-det">Detalle</label><div class="control">'+ico('clip',20)+'<input id="nv-det" placeholder="Qué ocurrió con la orden"></div></div>'
   +'<div class="field"><label for="nv-acc">Acción a coordinar</label><div class="control">'+ico('ruta',20)+'<input id="nv-acc" placeholder="Ej. Solicitar cambio del material"></div></div>'
   +'<button class="btn" data-act="c-novedad">'+ico('alert',19)+'Registrar novedad</button>'
   +'<p class="tiny">La novedad se notifica al área afectada y queda abierta hasta que se coordine la corrección con el proveedor.</p></div>';
  cuerpo = panel('vino','alert','Registrar Novedad','Paso 9: cuando la entrega no sale como se pidió',form)
   + panel('oliva','clip','Novedades con Proveedores','Ninguna se elimina: se cierra cuando queda resuelta',
     '<div class="panel__body panel__body--flush">'+tabla([['Novedad'],['Orden'],['Tipo'],['Detalle'],['Acción'],['Estado'],['']],filas?[filas]:[],'Sin novedades registradas.')+'</div>');
 }

 /* --- Proveedores --- */
 if(t==='prov'){
  const filas=filtro(S.proveedores,['id','nom']).map(p=>{
   const ocs=S.oc.filter(o=>o.prov===p.id);
   return '<tr><td><b>'+esc(p.nom)+'</b><div class="tiny">'+p.id+'</div></td>'
   +'<td class="num">'+p.calif+' / 5</td><td class="num">'+p.dias+'<div class="tiny">días</div></td>'
   +'<td>'+p.insumos.map(c=>'<span class="chip chip--tinta" style="margin:2px 3px 2px 0">'+c+'</span>').join('')+'</td>'
   +'<td class="num">'+ocs.length+'</td>'
   +'<td><div class="acts">'+(edit?'<button class="btn btn--sm btn--ghost" data-act="c-calificar" data-id="'+p.id+'">Calificar</button>':'<span class="tiny">—</span>')+'</div></td></tr>';
  }).join('');
  cuerpo = panel('oliva','users','Proveedores','La calificación y el tiempo de entrega deciden la sugerencia automática',
   '<div class="panel__body panel__body--flush">'+tabla([['Proveedor'],['Calificación','num'],['Entrega','num'],['Insumos que surte'],['Órdenes','num'],['']],filas?[filas]:[])
   + nota('El sistema sugiere primero al proveedor mejor calificado y, en empate, al de menor tiempo de entrega.')+'</div>');
 }

 return hero('Compras y Abastecimiento','Necesidad, solicitud, cotización, orden, recepción y novedades.')
 +kpis('compras')
 +subnav('compras',[
   {id:'proceso',n:'Proceso',ic:'ruta'},
   {id:'solicitudes',n:'Solicitudes',ic:'clip',ct:pend||''},
   {id:'cotiz',n:'Cotizaciones',ic:'tag',ct:S.cotiz.filter(c=>c.estado==='registrada').length||''},
   {id:'ordenes',n:'Órdenes',ic:'cart',ct:abiertas.length||''},
   {id:'recep',n:'Recepción',ic:'truck',ct:S.oc.filter(o=>['enviada','parcial'].includes(o.estado)).length||''},
   {id:'novedades',n:'Novedades',ic:'alert',ct:S.novedades.filter(n=>n.estado==='abierta').length||''},
   {id:'prov',n:'Proveedores',ic:'users'}
  ])
 +cuerpo;
};

/* ---------- 4. INVENTARIO ---------- */
const costoMerma=m=>{const mod=S.modelos.find(x=>x.ref===m.ref);return mod?m.cant*costoPar(m.ref):m.cant*(insumo(m.ref).costo||0);};
V.inventario=()=>{
 const t=secc('inventario','inicio');
 const bajos=S.insumos.filter(i=>saldo(i.cod)<i.min);
 const valor=S.insumos.reduce((a,i)=>a+saldo(i.cod)*i.costo,0);
 const pt=S.modelos.reduce((a,m)=>a+saldoPT(m.ref),0);
 const avs=S.maquinas.filter(m=>m.estado!=='operativa');
 const edit=puedeEscribir('inventario');
 let cuerpo='';

 if(t==='inicio'){
  const ent=S.mov.filter(m=>m.tipo==='entrada').reduce((a,m)=>a+m.cant,0);
  const sal=S.mov.filter(m=>m.tipo==='salida').reduce((a,m)=>a+m.cant,0);
  const aju=S.mov.filter(m=>m.tipo==='ajuste').length;
  const mx=Math.max(ent,sal,1);
  const graf='<div class="chart">'
   +[['Entradas',ent,'var(--oliva-600)'],['Salidas',sal,'var(--vino-600)'],['Ajustes',aju,'var(--cobre-600)']]
     .map(([n,v,c])=>'<div class="col"><b>'+n0(v)+'</b><i style="height:'+Math.max(6,(v/mx*100))+'%;background:'+c+'"></i><span>'+n+'</span></div>').join('')
   +'</div><p class="tiny" style="margin-top:8px">Unidades movidas por tipo de transacción desde el saldo inicial.</p>';
  const nivel=S.insumos.map(i=>{const s2=saldo(i.cod),p=Math.min(160,s2/i.min*100);
   return '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12.5px">'
   +'<span>'+esc(i.nom)+'</span><b>'+n2(s2)+' / '+n0(i.min)+' '+i.un+'</b></div>'
   +barra(p/1.6,s2>=i.min?'bar--ok':'bar--crit')+'</div>';}).join('')
   +'<p class="tiny">Saldo frente al stock mínimo de cada referencia. La barra llena equivale al 160 % del mínimo.</p>';
  const ult=S.mov.slice(-6).reverse().map(m=>'<tr><td><b>'+m.id+'</b></td><td>'+m.cod+'</td>'
   +'<td>'+(m.tipo==='entrada'?'<span class="chip chip--oliva">Entrada</span>':m.tipo==='salida'?'<span class="chip chip--vino">Salida</span>':'<span class="chip chip--cobre">Ajuste</span>')+'</td>'
   +'<td class="num">'+n2(m.cant)+'</td><td class="muted">'+esc(m.doc)+'</td><td class="tiny">'+m.fecha+'</td></tr>').join('');
  const al=[].concat(
    bajos.map(i=>'<div class="aviso aviso--warn">'+ico('alert',18)+'<div><b>Stock bajo · '+esc(i.nom)+'</b><p>'+n2(saldo(i.cod))+' '+i.un+' frente a un mínimo de '+n0(i.min)+'.</p></div></div>'),
    avs.map(m=>'<div class="aviso aviso--'+(m.estado==='averiada'?'crit':'warn')+'">'+ico(m.estado==='averiada'?'alert':'gear',18)
      +'<div><b>'+(m.estado==='averiada'?'Avería · ':'Mantenimiento · ')+esc(m.nom)+'</b><p>'+esc(m.falla||('Programado para el '+m.prox))+'</p></div></div>'));
  cuerpo = (edit?panel('cobre','arrow','Acciones Rápidas','Registre un movimiento sin salir del panel',
     '<div class="panel__body">'+rapidas([
      {act:'i-entrada',ic:'down',t:'+ Entrada',s:'Ingreso directo a bodega'},
      {act:'ir',d:'produccion',ic:'gear',t:'+ Producción',s:'Abrir órdenes de trabajo'},
      {act:'i-averia',ic:'alert',t:'+ Avería',s:'Reportar una máquina detenida'},
      {act:'i-merma',ic:'x',t:'+ Merma',s:'Registrar material perdido'}])+'</div>'):'')
   +'<div class="grid2 grid2--even">'
   + panel('oliva','bars','Gráfico de Movimientos','Entradas, salidas y ajustes acumulados','<div class="panel__body">'+graf+'</div>')
   + panel('vino','box','Existencias frente al Mínimo','Nivel de cada referencia de materia prima','<div class="panel__body">'+nivel+'</div>')
   +'</div>'
   + panel('vino','alert','Alertas','Stock bajo, averías y mantenimiento',
      '<div class="panel__body">'+(al.length?al.join(''):'<div class="aviso aviso--ok">'+ico('check',18)+'<div><b>Sin alertas</b><p>Ninguna referencia ni máquina requiere atención.</p></div></div>')+'</div>')
   + panel('oliva','clip','Últimos Movimientos','Trazabilidad inmediata del inventario',
      '<div class="panel__body panel__body--flush">'+tabla([['Mov.'],['Referencia'],['Tipo'],['Cantidad','num'],['Documento'],['Fecha']],ult?[ult]:[])+'</div>');
 }

 if(t==='mprima'){
  const filas=filtro(S.insumos,['cod','nom']).map(i=>{const s2=saldo(i.cod),b=s2<i.min;
   return '<tr><td><b>'+i.cod+'</b><div class="tiny">'+esc(i.nom)+'</div></td>'
   +'<td class="num"><b>'+n2(s2)+'</b> <span class="tiny">'+i.un+'</span></td>'
   +'<td class="num muted">'+n0(i.min)+'</td>'
   +'<td class="num">'+cop(s2*i.costo)+'<div class="tiny">'+cop(i.costo)+' / '+i.un+'</div></td>'
   +'<td>'+(b?'<span class="pill pill--warn">Bajo mínimo</span>':'<span class="pill pill--ok">Suficiente</span>')+'</td>'
   +'<td><div class="acts"><button class="iconbtn" data-act="i-kardex" data-cod="'+i.cod+'" aria-label="Ver kárdex">'+ico('clip',16)+'</button>'
   +(b&&edit?'<button class="iconbtn" data-act="i-reponer" data-cod="'+i.cod+'" aria-label="Solicitar reposición">'+ico('cart',16)+'</button>':'')+'</div></td></tr>';}).join('');
  const form='<div class="panel__body panel__body--form">'
   +'<div class="field"><label for="f-aj-ins">Referencia</label><div class="control">'+ico('box',20)+'<select id="f-aj-ins">'+S.insumos.map(i=>'<option value="'+i.cod+'">'+i.cod+' · '+i.nom+'</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="f-aj-cant">Cantidad contada</label><div class="control">'+ico('plus',20)+'<input id="f-aj-cant" type="number" min="0" placeholder="Ej. 2380"></div></div>'
   +'<div class="field"><label for="f-aj-just">Justificación (obligatoria)</label><div class="control">'+ico('clip',20)+'<input id="f-aj-just" placeholder="Ej. Conteo físico del 15/09"></div></div>'
   +'<button class="btn" data-act="i-ajustar">'+ico('edit',19)+'Registrar ajuste</button>'
   +'<p class="tiny">El saldo nunca se edita: el ajuste se guarda como movimiento con su responsable y su justificación.</p></div>';
  cuerpo = panel('oliva','box','Saldos por Referencia','El saldo se recalcula a partir de los movimientos registrados',
     '<div class="panel__body panel__body--flush">'+tabla([['Insumo'],['Saldo','num'],['Mínimo','num'],['Valorización','num'],['Estado'],['Acciones']],filas?[filas]:[])
     + nota('Al cruzar el mínimo hacia abajo, el módulo genera la alerta y notifica a Compras.')+'</div>')
   + (edit?panel('vino','edit','Ajuste por Conteo Físico','Requiere justificación y queda auditado',form):'')
   + (edit?formSolicitud('inventario'):'') + panelSolicitudes('inventario');
 }

 if(t==='proceso'){
  const filas=S.op.filter(o=>o.estado==='en proceso').map(o=>{
   const e=o.etapas[o.etapa]||o.etapas[0];
   return '<tr><td><b>'+o.id+'</b><div class="tiny">'+o.ref+'</div></td>'
   +'<td>'+esc(e.n)+'</td><td class="num">'+n0(e.rec)+'</td>'
   +'<td class="num">'+n0(o.etapas.reduce((a,x)=>a+x.perd,0))+'</td>'
   +'<td style="min-width:110px">'+barra(avance(o))+'<div class="tiny">'+n0(avance(o))+' % de avance</div></td></tr>';}).join('');
  cuerpo = panel('cobre','gear','Producto en Proceso','Unidades que salieron de bodega y aún no vuelven como terminado',
    '<div class="panel__body panel__body--flush">'
    + tabla([['Orden'],['Etapa actual'],['Unidades','num'],['Merma','num'],['Avance']],filas?[filas]:[],'Ninguna orden en planta en este momento.')
    + nota('El producto en proceso es la tercera existencia del módulo: ya no es materia prima y todavía no es producto terminado.')+'</div>');
 }

 if(t==='terminado'){
  const filas=S.modelos.filter(m=>saldoPT(m.ref)>0).map(m=>'<tr><td><b>'+m.ref+'</b><div class="tiny">versión '+m.ver+'</div></td>'
   +'<td>'+esc(m.nom)+'<div class="tiny">'+esc(m.temp)+'</div></td>'
   +'<td class="num"><b>'+n0(saldoPT(m.ref))+'</b> <span class="tiny">pares</span></td>'
   +'<td class="num muted">'+cop(costoPar(m.ref))+'</td>'
   +'<td class="num"><b>'+cop(saldoPT(m.ref)*costoPar(m.ref))+'</b></td></tr>').join('');
  cuerpo = panel('cobre','check','Producto Terminado','Existencias disponibles para Comercial y Logística',
    '<div class="panel__body panel__body--flush">'+tabla([['Referencia'],['Modelo'],['Disponible','num'],['Costo/par','num'],['Valor en bodega','num']],filas?[filas]:[],'Aún no hay producto terminado en bodega.')+'</div>');
 }

 if(t==='merma'){
  const total=S.merma.reduce((a,m)=>a+costoMerma(m),0);
  const filas=filtro(S.merma,['id','ref','causa','etapa','origen']).map(m=>'<tr><td><b>'+m.id+'</b><div class="tiny">'+m.fecha+'</div></td>'
   +'<td>'+chip(m.origen)+'<div class="tiny">'+esc(m.doc)+'</div></td>'
   +'<td>'+esc(m.ref)+'<div class="tiny">'+esc(m.etapa||'—')+'</div></td>'
   +'<td class="num">'+n0(m.cant)+'</td><td>'+esc(m.causa)+'</td>'
   +'<td class="num">'+cop(costoMerma(m))+'</td><td class="muted">'+esc(m.resp)+'</td></tr>').join('');
  const form='<div class="panel__body panel__body--form">'
   +'<div class="field"><label for="mr-ref">Referencia</label><div class="control">'+ico('box',20)+'<select id="mr-ref">'
     +S.modelos.map(m=>'<option value="'+m.ref+'">'+m.ref+' · '+m.nom+'</option>').join('')
     +S.insumos.map(i=>'<option value="'+i.cod+'">'+i.cod+' · '+i.nom+'</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="mr-cant">Cantidad perdida</label><div class="control">'+ico('x',20)+'<input id="mr-cant" type="number" min="1" value="1"></div></div>'
   +'<div class="field"><label for="mr-etapa">Etapa</label><div class="control">'+ico('gear',20)+'<select id="mr-etapa"><option>Corte</option><option>Guarnición</option><option>Montaje</option><option>Terminado</option><option>Bodega</option></select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="mr-causa">Causa</label><div class="control">'+ico('clip',20)+'<input id="mr-causa" placeholder="Ej. Corte fuera de molde"></div></div>'
   +'<button class="btn" data-act="i-merma-guardar">'+ico('x',19)+'Registrar merma</button>'
   +'<p class="tiny">La merma descuenta la existencia y queda valorizada: alimenta el costo de la no calidad y el análisis de causas.</p></div>';
  cuerpo = (edit?panel('vino','x','Registro de Merma','Material perdido, con su causa y su etapa',form):'')
   + panel('oliva','clip','Merma Registrada','Cada pérdida conserva responsable, documento y causa',
     '<div class="panel__body panel__body--flush">'
     + tabla([['Registro'],['Origen'],['Referencia'],['Cantidad','num'],['Causa'],['Costo','num'],['Responsable']],filas?[filas]:[],'Sin merma registrada.')
     + nota('Costo acumulado de la merma: '+cop(total)+'. Ningún registro se elimina: se anula conservando la trazabilidad.')+'</div>');
 }

 if(t==='maquinaria'){
  const filas=filtro(S.maquinas,['id','nom','area','estado']).map(m=>'<tr><td><b>'+m.id+'</b><div class="tiny">'+esc(m.area)+'</div></td>'
   +'<td>'+esc(m.nom)+(m.falla?'<div class="tiny" style="color:var(--crit)">'+esc(m.falla)+'</div>':'')+'</td>'
   +'<td class="num">'+n0(m.horas)+' h</td>'
   +'<td class="tiny">Último '+m.ultimo+'<br>Próximo '+m.prox+'</td>'
   +'<td>'+(m.estado==='operativa'?'<span class="pill pill--ok">Operativa</span>':m.estado==='averiada'?'<span class="pill pill--crit">Averiada</span>':'<span class="pill pill--warn">Mantenimiento</span>')+'</td>'
   +'<td><div class="acts">'+(edit?(m.estado==='operativa'
      ?'<button class="btn btn--sm btn--ghost" data-act="i-averia" data-id="'+m.id+'">Reportar avería</button>'
      :'<button class="btn btn--sm btn--oliva" data-act="i-reparar" data-id="'+m.id+'">Dar por reparada</button>')
      +'<button class="btn btn--sm btn--ghost" data-act="i-mant" data-id="'+m.id+'">Mantenimiento</button>':'<span class="tiny">—</span>')+'</div></td></tr>').join('');
  cuerpo = panel('cobre','gear','Maquinaria de Planta','Estado, horas de uso y programa de mantenimiento',
    '<div class="panel__body panel__body--flush">'
    + tabla([['Máquina'],['Descripción'],['Horas','num'],['Mantenimiento'],['Estado'],['Acciones']],filas?[filas]:[])
    + nota('Una máquina averiada detiene su etapa: Producción recibe la notificación para reprogramar.')+'</div>');
 }

 if(t==='kardex'){
  const kx=S.mov.slice(-18).reverse().map(m=>'<tr><td><b>'+m.id+'</b></td><td>'+m.cod+'</td>'
   +'<td>'+(m.tipo==='entrada'?'<span class="chip chip--oliva">Entrada</span>':m.tipo==='salida'?'<span class="chip chip--vino">Salida</span>':'<span class="chip chip--cobre">Ajuste</span>')+'</td>'
   +'<td class="num">'+n2(m.cant)+'</td><td class="muted">'+esc(m.doc)+'</td>'
   +'<td class="muted">'+esc(m.resp)+'</td><td class="tiny">'+m.fecha+'</td></tr>').join('');
  cuerpo = panel('vino','clip','Kárdex de Movimientos','El saldo se recalcula a partir de estos registros',
    '<div class="panel__body panel__body--flush">'+tabla([['Mov.'],['Referencia'],['Tipo'],['Cantidad','num'],['Documento'],['Responsable'],['Fecha']],kx?[kx]:[])+'</div>');
 }

 return hero('Inventario','Materia prima, producto en proceso, terminado, merma y maquinaria.')
 +kpis('inventario')
 +subnav('inventario',[
   {id:'inicio',n:'Inicio',ic:'grid'},
   {id:'mprima',n:'M. Prima',ic:'box',ct:bajos.length||''},
   {id:'proceso',n:'En proceso',ic:'gear'},
   {id:'terminado',n:'Terminado',ic:'check'},
   {id:'merma',n:'Merma',ic:'x',ct:S.merma.length||''},
   {id:'maquinaria',n:'Maquinaria',ic:'gear',ct:avs.length||''},
   {id:'kardex',n:'Kárdex',ic:'clip'}])
 +cuerpo;
};

/* ---------- 5. PRODUCCIÓN ---------- */
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

 /* --- Órdenes de trabajo --- */
 if(t==='ordenes'){
  const aprob=S.modelos.filter(m=>m.estado==='aprobado');
  const form='<div class="panel__body panel__body--form">'
   +'<div class="field"><label for="f-op-ref">Modelo aprobado</label><div class="control">'+ico('pencil',20)+'<select id="f-op-ref">'+aprob.map(m=>'<option value="'+m.ref+'">'+m.ref+' · '+m.nom+'</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="f-op-cant">Cantidad (pares)</label><div class="control">'+ico('plus',20)+'<input id="f-op-cant" type="number" min="1" value="60"></div></div>'
   +'<div class="field"><label for="f-op-fec">Fecha compromiso</label><div class="control">'+ico('clip',20)+'<input id="f-op-fec" type="date" value="2026-09-30" style="padding-left:44px"></div></div>'
   +'<button class="btn" data-act="p-crear">'+ico('gear',19)+'Crear orden</button>'
   +'<p class="tiny">Antes de liberar, el sistema valida la BOM y compara contra Inventario. Si falta insumo, la orden queda en espera y se genera la solicitud a Compras.</p></div>';
  const tablaOP=datatable({
   id:'p-ordenes', titulo:'órdenes de producción', csv:'ordenes_produccion',
   buscar:'Buscar por orden, modelo, estado o pedido...',
   filas:S.op, orden:{k:'compromiso',dir:'asc'},
   clase:o=>atrasada(o)?'dt__tarde':'',
   cols:[
    {k:'id',t:'Orden',ancho:'160px',
     r:o=>'<b>'+esc(o.id)+'</b><div class="tiny">'+(o.pedido?'Pedido '+esc(o.pedido):'Reposición de stock')+'</div>'},
    {k:'ref',t:'Modelo',v:o=>o.ref+' '+modelo(o.ref).nom,
     r:o=>esc(o.ref)+'<div class="tiny">'+esc(modelo(o.ref).nom)+'</div>'},
    {k:'cant',t:'Pares',tipo:'num'},
    {k:'etapas',t:'Etapas',orden:false,busca:false,ancho:'224px',
     v:o=>o.etapas.map(e=>e.n+' '+e.proc).join(' · '),
     r:o=>'<div class="steps">'+o.etapas.map((e,ix)=>'<span class="step '+(e.cerrada?'done':ix===o.etapa&&o.liberada?'now':'')+'">'+e.n+'<br>'+n0(e.proc)+'</span>').join('')+'</div>'},
    {k:'avance',t:'Avance',ancho:'132px',v:o=>Math.round(avance(o)),
     r:o=>barra(avance(o),avance(o)>=100?'bar--ok':'')+'<div class="tiny">'+n0(avance(o))+' % del plan</div>'},
    {k:'compromiso',t:'Compromiso',ancho:'138px',
     r:o=>esc(o.compromiso)+(atrasada(o)?'<div class="tiny dt__flag">'+ico('alert',13)+'Fuera de fecha</div>':'')},
    {k:'estado',t:'Estado',r:o=>pill(o.estado)},
    {k:'etapa',t:'Etapa actual',oculta:true,
     v:o=>o.estado==='cerrada'?'Cerrada':(o.etapas[o.etapa]?o.etapas[o.etapa].n:'—')},
    {k:'proc',t:'Pares procesados',tipo:'num',oculta:true,v:procesados},
    {k:'perd',t:'Merma',tipo:'num',oculta:true,v:perdidas},
    {k:'costo',t:'Costo planeado',tipo:'moneda',oculta:true,v:o=>costoPar(o.ref)*o.cant}
   ],
   filtros:[
    {k:'estado',t:'Estado',op:[...new Set(S.op.map(o=>o.estado))]},
    {k:'ref',t:'Modelo',op:S.modelos.map(m=>({v:m.ref,t:m.ref+' · '+m.nom}))},
    {k:'compromiso',t:'Compromiso',tipo:'fechas'},
    {k:'tarde',t:'Solo atrasadas',tipo:'si',m:atrasada}
   ],
   acciones:o=>!o.liberada
     ?'<button class="btn btn--sm btn--ghost" data-act="p-liberar" data-id="'+o.id+'">Liberar</button>'
     :o.estado==='cerrada'?'<span class="tiny">Enviada a calidad</span>'
     :'<button class="btn btn--sm btn--oliva" data-act="p-etapa" data-id="'+o.id+'">Registrar</button>',
   resumen:fs=>[
    {t:'Pares programados',v:n0(fs.reduce((a,o)=>a+o.cant,0))},
    {t:'Pares procesados',v:n0(fs.reduce((a,o)=>a+procesados(o),0)),tono:'ok'},
    {t:'Merma (pares)',v:n0(fs.reduce((a,o)=>a+perdidas(o),0)),tono:'crit'},
    {t:'En espera de material',v:n0(fs.filter(o=>o.estado==='en espera').length),tono:'warn'}
   ],
   sinDatos:'Todavía no hay órdenes de producción registradas.'
  });
  cuerpo = panel('vino','gear','Nueva Orden de Producción','Pasos 1 a 4: generación, validación, existencias y liberación',form)
   + panel('oliva','ruta','Órdenes en Curso','Una etapa solo inicia cuando la anterior fue cerrada',
     '<div class="panel__body panel__body--flush">'+tablaOP
     + nota('Al liberar la orden se reservan y descuentan los insumos del inventario según la BOM.')+'</div>');
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
   acciones:l=>'<button class="btn btn--sm btn--ghost" data-act="ir-tab" data-mod="calidad" data-tab="pt">'
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

/* ---------- 6. CONTROL DE CALIDAD ---------- */
V.calidad=()=>{
 const t=secc('calidad','proceso');
 const pend=S.lotes.filter(l=>l.estado==='pendiente');
 const cerr=S.lotes.filter(l=>l.estado!=='pendiente');
 const abiertas=S.nc.filter(n=>n.estado!=='cerrada');
 const edit=puedeEscribir('calidad');
 let cuerpo='';

 /* --- Lógica del proceso --- */
 if(t==='proceso'){
  cuerpo = procesoPasos('cobre','Proceso de Control de Calidad','De la materia prima que entra al certificado que sale',[
   {ic:'search',t:'Recepción e inspección inicial',l:['Verificar materiales recibidos','Tomar muestra (AQL si aplica)','Revisar empaque y etiquetas']},
   {ic:'clip',t:'Definir estándares',l:['Consultar la ficha técnica','Establecer parámetros de aceptación','Indicar herramienta de medición']},
   {ic:'gear',t:'Inspección en proceso',l:['Monitorear puntos críticos','Registrar mediciones intermedias','Verificar condiciones de producción']},
   {ic:'flask',t:'Pruebas de producto terminado',l:['Pruebas funcionales y mecánicas','Registrar resultados','Evaluar contra el estándar']},
   {ic:'check',t:'Liberar producto',l:['Revisar el informe de inspección','Aprobar o rechazar el lote','Generar certificado de calidad'],v:'ok'},
   {ic:'box',t:'Auditoría de empaque y despacho',l:['Inspección de empaque','Verificar documentación de envío','Confirmar integridad de la carga']},
   {ic:'alert',t:'Gestionar no conformidades',l:['Identificar la desviación','Segregar el lote afectado','Abrir el registro de no conformidad'],v:'warn'},
   {ic:'ruta',t:'Análisis de causa raíz',l:['Investigar el origen','Ishikawa o cinco porqués','Definir la acción correctiva']},
   {ic:'x',t:'Si hay no conformidad',l:['Detener la producción afectada','Notificar a proveedores y producción','Monitorear la acción correctiva'],v:'warn'}
  ]);
 }

 /* --- 1. Materia prima --- */
 if(t==='mp'){
  const filas=S.recep.map(r=>{
   const p=S.proveedores.find(v=>v.id===r.prov)||{nom:'—'};
   return '<tr><td><b>'+r.id+'</b><div class="tiny">'+r.fecha+'</div></td>'
   +'<td>'+esc(r.oc)+'<div class="tiny">'+esc(p.nom)+'</div></td>'
   +'<td class="muted">'+esc(r.guia)+'</td>'
   +'<td>'+(r.estado==='validado'?'<span class="pill pill--ok">Validado</span>':r.estado==='rechazado'?'<span class="pill pill--crit">Rechazado</span>':'<span class="pill pill--warn">Por inspeccionar</span>')+'</td>'
   +'<td class="muted">'+esc(r.obs||'—')+'</td>'
   +'<td><div class="acts">'+(r.estado!=='validado'&&edit?'<button class="btn btn--sm btn--oliva" data-act="q-mp" data-id="'+r.id+'">Inspeccionar</button>':'<span class="tiny">—</span>')+'</div></td></tr>';
  }).join('');
  cuerpo = panel('vino','box','Inspección de Materia Prima','Paso 1: nada entra a bodega sin revisión de muestra y empaque',
   '<div class="panel__body panel__body--flush">'+tabla([['Recepción'],['Orden'],['Guía'],['Estado'],['Observación'],['']],filas?[filas]:[],'No hay recepciones de proveedor pendientes.')
   + nota('El muestreo AQL se aplica según el tamaño del lote; si la muestra falla, la recepción se rechaza y Compras abre una novedad con el proveedor.')+'</div>');
 }

 /* --- 2. Estándares --- */
 if(t==='est'){
  const filas=S.estandares.map(e=>'<tr><td><b>'+esc(e.crit)+'</b></td><td>'+esc(e.param)+'</td><td class="muted">'+esc(e.herr)+'</td><td>'+chip('produccion').replace('Producción',esc(e.etapa))+'</td></tr>').join('');
  cuerpo = panel('oliva','clip','Estándares de Calidad','Paso 2: parámetro de aceptación y herramienta de medición por criterio',
   '<div class="panel__body panel__body--flush">'+tabla([['Criterio'],['Parámetro de aceptación'],['Herramienta'],['Etapa']],filas?[filas]:[])
   + nota('Los estándares salen de la ficha técnica del modelo y son la referencia de toda inspección.')+'</div>');
 }

 /* --- 3. En proceso --- */
 if(t==='proc'){
  const filas=S.op.filter(o=>o.liberada).map(o=>{
   const e=o.etapas[o.etapa]||o.etapas[o.etapas.length-1];
   const est=S.estandares.find(x=>x.etapa===e.n);
   return '<tr><td><b>'+o.id+'</b><div class="tiny">'+o.ref+'</div></td>'
   +'<td>'+esc(e.n)+'</td>'
   +'<td class="num">'+n0(e.rec)+'</td><td class="num">'+n0(e.proc)+'</td><td class="num">'+n0(e.perd)+'</td>'
   +'<td class="muted">'+(est?esc(est.crit)+': '+esc(est.param):'—')+'</td>'
   +'<td><div class="acts">'+(edit?'<button class="btn btn--sm btn--ghost" data-act="q-medicion" data-id="'+o.id+'">Registrar medición</button>':'<span class="tiny">—</span>')+'</div></td></tr>';
  }).join('');
  cuerpo = panel('vino','gear','Inspección en Proceso','Paso 3: puntos críticos y mediciones intermedias',
   '<div class="panel__body panel__body--flush">'+tabla([['Orden'],['Etapa actual'],['Recibido','num'],['Procesado','num'],['Merma','num'],['Criterio a verificar'],['']],filas?[filas]:[],'No hay órdenes liberadas en planta.')+'</div>');
 }

 /* --- 4-5. Producto terminado --- */
 if(t==='pt'){
  const filas=filtro(S.lotes,['id','ref','estado','defecto']).map(l=>{
   const c=l.cant?l.conf/l.cant*100:0;
   return '<tr><td><b>'+l.id+'</b><div class="tiny">'+l.op+' · '+l.ref+'</div></td>'
   +'<td class="num">'+n0(l.cant)+'</td>'
   +'<td style="min-width:132px">'+(l.estado==='pendiente'?'<span class="tiny">Sin inspeccionar</span>'
     :barra(c,c>=S.UMBRAL_CALIDAD?'bar--ok':'bar--crit')+'<div class="tiny">'+n2(c)+' % · C '+l.conf+' · R '+l.repro+' · D '+l.desc+'</div>')+'</td>'
   +'<td>'+(l.defecto?esc(l.defecto)+'<div class="tiny">'+esc(l.etapaOrigen)+'</div>':'<span class="tiny">—</span>')+'</td>'
   +'<td>'+pill(l.estado)+'</td>'
   +'<td><div class="acts">'+(l.estado==='pendiente'?'<button class="btn btn--sm btn--oliva" data-act="q-inspeccionar" data-id="'+l.id+'">Inspeccionar</button>'
      :l.estado==='aprobado'?'<button class="iconbtn" data-act="q-certificado" data-id="'+l.id+'" aria-label="Certificado">'+ico('clip',16)+'</button>'
      :'<button class="btn btn--sm btn--ghost" data-act="q-nc-nueva" data-id="'+l.id+'">Abrir NC</button>')+'</div></td></tr>';
  }).join('');
  const opsLote=pend.map(l=>'<option value="'+l.id+'">'+l.id+' · '+l.ref+' · '+l.cant+' pares</option>').join('');
  const form='<div class="panel__body panel__body--form">'
   +(pend.length?'':'<div class="aviso aviso--ok">'+ico('check',20)+'<div><b>Sin lotes pendientes</b><p>Cierre la etapa de terminado de una orden en Producción para generar un lote.</p></div></div>')
   +'<div class="field"><label for="f-q-lote">Lote</label><div class="control">'+ico('box',20)+'<select id="f-q-lote">'+(opsLote||'<option value="">— Sin lotes pendientes —</option>')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="f-q-tipo">Tipo de inspección</label><div class="control">'+ico('search',20)+'<select id="f-q-tipo"><option value="total">Total</option><option value="muestreo">Por muestreo (AQL)</option></select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="f-q-conf">Conformes</label><div class="control">'+ico('check',20)+'<input id="f-q-conf" type="number" min="0" value="0"></div></div>'
   +'<div class="field"><label for="f-q-rep">Reproceso</label><div class="control">'+ico('edit',20)+'<input id="f-q-rep" type="number" min="0" value="0"></div></div>'
   +'<div class="field"><label for="f-q-des">Descarte</label><div class="control">'+ico('x',20)+'<input id="f-q-des" type="number" min="0" value="0"></div></div>'
   +'<div class="field"><label for="f-q-def">Defecto principal</label><div class="control">'+ico('alert',20)+'<select id="f-q-def">'+S.estandares.map(e=>'<option>'+e.crit+'</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="f-q-eta">Etapa de origen</label><div class="control">'+ico('gear',20)+'<select id="f-q-eta"><option>Corte</option><option>Guarnición</option><option>Montaje</option><option>Terminado</option></select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<button class="btn" data-act="q-registrar" '+(pend.length?'':'disabled')+'>'+ico('check',19)+'Registrar inspección</button>'
   +'<p class="tiny">Umbral de aceptación: '+S.UMBRAL_CALIDAD+' % de conformidad. Por debajo, el lote se rechaza, se notifica a Producción y se abre una no conformidad.</p></div>';
  cuerpo = panel('vino','flask','Pruebas de Producto Terminado','Pasos 4 y 5: evaluar contra el estándar y liberar',form)
   + panel('oliva','check','Lotes Inspeccionados','El lote aprobado genera certificado de calidad',
     '<div class="panel__body panel__body--flush">'+tabla([['Lote'],['Und.','num'],['Conformidad'],['Defecto'],['Estado'],['Acciones']],filas?[filas]:[])
     + nota('Conforme ingresa a producto terminado, reproceso regresa a su etapa y descarte se registra como merma con su costo.')+'</div>');
 }

 /* --- 7-8. No conformidades --- */
 if(t==='nc'){
  const filas=filtro(S.nc,['id','lote','desv','estado']).map(n=>
   '<tr><td><b>'+n.id+'</b><div class="tiny">'+n.fecha+'</div></td>'
   +'<td>'+esc(n.lote)+'</td><td>'+esc(n.desv)+'</td>'
   +'<td><span class="chip chip--cobre">'+esc(n.metodo)+'</span><div class="tiny">'+esc(n.causa||'Causa por definir')+'</div></td>'
   +'<td class="muted">'+esc(n.accion||'—')+'</td>'
   +'<td>'+(n.estado==='cerrada'?'<span class="pill pill--ok">Cerrada</span>':n.estado==='en análisis'?'<span class="pill pill--warn">En análisis</span>':'<span class="pill pill--crit">Abierta</span>')+'</td>'
   +'<td><div class="acts">'+(n.estado!=='cerrada'&&edit?'<button class="btn btn--sm btn--oliva" data-act="q-nc-cerrar" data-id="'+n.id+'">Cerrar</button>':'<span class="tiny">'+esc(n.resp)+'</span>')+'</div></td></tr>').join('');
  const form='<div class="panel__body panel__body--form">'
   +'<div class="field"><label for="nc-lote">Lote o documento</label><div class="control">'+ico('box',20)+'<select id="nc-lote">'+S.lotes.map(l=>'<option value="'+l.id+'">'+l.id+' · '+l.ref+'</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="nc-desv">Desviación detectada</label><div class="control">'+ico('alert',20)+'<input id="nc-desv" placeholder="Ej. Adherencia por debajo de 35 N/cm"></div></div>'
   +'<div class="field"><label for="nc-met">Método de análisis</label><div class="control">'+ico('ruta',20)+'<select id="nc-met"><option>5 porqués</option><option>Ishikawa</option><option>Pareto</option></select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="nc-causa">Causa raíz</label><div class="control">'+ico('search',20)+'<input id="nc-causa" placeholder="Origen real del problema"></div></div>'
   +'<div class="field"><label for="nc-acc">Acción correctiva</label><div class="control">'+ico('check',20)+'<input id="nc-acc" placeholder="Qué se hará para evitar que se repita"></div></div>'
   +'<button class="btn" data-act="q-nc">'+ico('alert',19)+'Abrir no conformidad</button>'
   +'<p class="tiny">Al abrir una NC se segrega el lote afectado, se detiene la producción implicada y se notifica a Producción y a Compras según el origen.</p></div>';
  cuerpo = panel('vino','alert','Registro de No Conformidad','Pasos 7 a 9: desviación, causa raíz y acción correctiva',form)
   + panel('oliva','clip','No Conformidades','Se monitorean hasta verificar la acción correctiva',
     '<div class="panel__body panel__body--flush">'+tabla([['NC'],['Lote'],['Desviación'],['Análisis'],['Acción correctiva'],['Estado'],['']],filas?[filas]:[],'Sin no conformidades registradas.')+'</div>');
 }

 /* --- 6. Auditorías --- */
 if(t==='aud'){
  const filas=S.auditorias.map(a=>'<tr><td><b>'+a.id+'</b><div class="tiny">'+a.fecha+'</div></td>'
   +'<td>'+esc(a.tipo)+'</td><td>'+esc(a.doc)+'</td>'
   +'<td>'+(a.resultado==='conforme'?'<span class="pill pill--ok">Conforme</span>':'<span class="pill pill--crit">No conforme</span>')+'</td>'
   +'<td class="muted">'+esc(a.obs)+'</td></tr>').join('');
  const form='<div class="panel__body panel__body--form">'
   +'<div class="field"><label for="au-tipo">Tipo de auditoría</label><div class="control">'+ico('clip',20)+'<select id="au-tipo"><option>Empaque y despacho</option><option>Proceso en planta</option><option>Materia prima</option></select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="au-doc">Documento auditado</label><div class="control">'+ico('truck',20)+'<select id="au-doc">'+S.despachos.map(d=>'<option value="'+d.id+'">'+d.id+' · '+d.ref+'</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="au-res">Resultado</label><div class="control">'+ico('check',20)+'<select id="au-res"><option value="conforme">Conforme</option><option value="no conforme">No conforme</option></select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="au-obs">Observación</label><div class="control">'+ico('edit',20)+'<input id="au-obs" placeholder="Hallazgo de la inspección"></div></div>'
   +'<button class="btn" data-act="q-auditar">'+ico('check',19)+'Registrar auditoría</button>'
   +'<p class="tiny">Se verifica el empaque, la documentación de envío y la integridad de la carga antes de que salga de la fábrica.</p></div>';
  cuerpo = panel('vino','clip','Auditoría de Empaque y Despacho','Paso 6: última revisión antes de que el producto salga',form)
   + panel('oliva','check','Auditorías Realizadas','',
     '<div class="panel__body panel__body--flush">'+tabla([['Auditoría'],['Tipo'],['Documento'],['Resultado'],['Observación']],filas?[filas]:[])+'</div>');
 }

 return hero('Control de Calidad','Materia prima, proceso, producto terminado y no conformidades.')
 +kpis('calidad')
 +subnav('calidad',[
   {id:'proceso',n:'Proceso',ic:'ruta'},
   {id:'mp',n:'Materia prima',ic:'box',ct:S.recep.filter(r=>r.estado!=='validado').length||''},
   {id:'est',n:'Estándares',ic:'clip'},
   {id:'proc',n:'En proceso',ic:'gear'},
   {id:'pt',n:'Terminado',ic:'flask',ct:pend.length||''},
   {id:'nc',n:'No conformidades',ic:'alert',ct:abiertas.length||''},
   {id:'aud',n:'Auditorías',ic:'check'}
  ])
 +cuerpo;
};

/* ---------- 7. COMERCIAL ---------- */
V.comercial=()=>{
 const act=S.pedidos.filter(p=>!['despachado','facturado'].includes(p.estado));
 const valor=act.reduce((a,p)=>a+p.valor,0);
 const cupo=S.clientes.reduce((a,c)=>a+c.saldo,0)/S.clientes.reduce((a,c)=>a+c.cupo,0)*100;
 const cot=S.pedidos.filter(p=>p.estado==='cotizado').length;
 const filas=filtro(S.pedidos,['id','ref','estado']).map(p=>{
  const c=S.clientes.find(x=>x.id===p.cl)||{nom:'—'};
  const acc=p.estado==='cotizado'?'<button class="btn btn--sm btn--oliva" data-act="v-confirmar" data-id="'+p.id+'">Confirmar</button>'
   :p.estado==='listo'?'<span class="chip chip--cobre">'+ico('truck',16)+'En Logística</span>'
   :'<span class="tiny">'+p.fecha+'</span>';
  return '<tr><td><b>'+p.id+'</b><div class="tiny">'+esc(c.nom)+' · '+esc(c.ciudad||'')+'</div></td>'
  +'<td>'+p.ref+'<div class="tiny">'+n0(p.cant)+' pares</div></td>'
  +'<td class="num">'+cop(p.valor)+'</td><td>'+pill(p.estado)+'</td>'
  +'<td><div class="acts">'+acc+'</div></td></tr>';
 }).join('');
 const cli=S.clientes.map(c=>'<tr><td><b>'+esc(c.nom)+'</b><div class="tiny">'+esc(c.ciudad)+' · '+esc(c.cond)+'</div></td>'
  +'<td class="num">'+cop(c.cupo)+'</td><td class="num">'+cop(c.saldo)+'</td>'
  +'<td style="min-width:120px">'+barra(c.saldo/c.cupo*100,c.saldo/c.cupo>.85?'bar--crit':'bar--ok')+'<div class="tiny">'+n0(c.saldo/c.cupo*100)+' % del cupo</div></td></tr>').join('');
 const aprob=S.modelos.filter(m=>m.estado==='aprobado');
 const form=`<div class="panel__body panel__body--form">
  <div class="field"><label for="f-v-cl">Cliente</label><div class="control">${ico('user',20)}<select id="f-v-cl">${S.clientes.map(c=>'<option value="'+c.id+'">'+c.nom+' · cupo '+cop(c.cupo-c.saldo)+'</option>').join('')}</select><span class="ico chev">${ico('chev',20)}</span></div></div>
  <div class="field"><label for="f-v-ref">Modelo (lista de precios vigente)</label><div class="control">${ico('tag',20)}<select id="f-v-ref">${aprob.map(m=>'<option value="'+m.ref+'">'+m.ref+' · '+m.nom+' · '+cop(S.precios[m.ref])+'</option>').join('')}</select><span class="ico chev">${ico('chev',20)}</span></div></div>
  <div class="field"><label for="f-v-cant">Cantidad (pares)</label><div class="control">${ico('plus',20)}<input id="f-v-cant" type="number" min="1" value="30"></div></div>
  <button class="btn btn--full" data-act="v-cotizar">${ico('bars',22)}Generar Cotización</button>
  <p class="tiny" style="margin-top:10px">Descuento automático por volumen: 5 % desde 50 pares y 8 % desde 100. Al confirmar, el sistema valida cupo de crédito y disponibilidad.</p></div>`;
 return hero('Comercial','Clientes, cotizaciones y pedidos de venta.')
 +kpis('comercial')
 + panel('vino','bars','Nueva Cotización','Al aceptarse se convierte en pedido sin redigitar',form)
 + panel('oliva','clip','Pedidos y Cotizaciones','Cotizado → confirmado → en producción → listo → despachado → facturado',
   '<div class="panel__body panel__body--flush">'+tabla([['Pedido'],['Modelo'],['Valor','num'],['Estado'],['Acciones']],filas?[filas]:[])
   + nota('Si hay existencias el pedido pasa a Logística; si no, genera automáticamente la orden de producción.'))
 +'</div>'
 + panel('cobre','user','Clientes y Cupo de Crédito','El pedido no se confirma si el cliente excede su cupo',
   '<div class="panel__body panel__body--flush">'+tabla([['Cliente'],['Cupo','num'],['Saldo','num'],['Uso']],cli?[cli]:[])+'</div>');
};

/* ---------- 8. LOGÍSTICA Y DESPACHO ---------- */
V.logistica=()=>{
 const t=secc('logistica','inicio');
 const act=S.despachos.filter(d=>d.estado!=='entregado');
 const enRuta=S.flota.filter(f=>f.estado==='en ruta');
 const edit=puedeEscribir('logistica');
 let cuerpo='';

 /* --- Inicio: mapa, movimientos y alertas --- */
 if(t==='inicio'){
  const paquetes=S.despachos.filter(d=>d.estado!=='entregado').reduce((a,d)=>a+d.cant,0);
  const mapa=mapaFlota(enRuta.length);
  const movs=S.despachos.slice(0,3).map(d=>'<tr><td><b>'+d.id+'</b><div class="tiny">'+esc(d.ruta)+'</div></td><td>'+pill(d.estado)+'</td></tr>').join('')
   +S.recep.slice(0,2).map(r=>'<tr><td><b>'+r.id+'</b><div class="tiny">Recepción '+esc(r.guia)+'</div></td><td><span class="pill pill--ok">Validado</span></td></tr>').join('');
  const alertas=[];
  S.despachos.filter(d=>d.estado==='en tránsito'&&d.compromiso<hoy()).forEach(d=>alertas.push(['crit','Retraso en ruta '+d.ruta,d.id+' comprometido para el '+d.compromiso+'.']));
  S.recol.filter(r=>r.estado==='programada').forEach(r=>alertas.push(['warn','Recolección programada',r.id+' · '+esc(r.motivo)+'.']));
  S.recep.filter(r=>r.estado!=='validado').forEach(r=>alertas.push(['warn','Recepción por validar',r.id+' · guía '+r.guia+'.']));
  if(!alertas.length)alertas.push(['ok','Operación sin novedades','Ninguna ruta presenta retrasos ni pendientes.']);
  cuerpo = panel('cobre','ruta','Operación en Curso','Vehículos, paquetes y pendientes del día',
    '<div class="panel__body">'+mapa
    +'</div>',
    '<button class="ghostbtn" data-act="l-ocr">'+ico('search',18)+'Escanear guía</button>')
   + '<div class="grid2 grid2--even">'
   + panel('vino','clip','Últimos Movimientos','Despachos y recepciones recientes',
     '<div class="panel__body panel__body--flush">'+tabla([['Documento'],['Estado']],movs?[movs]:[])+'</div>')
   + panel('oliva','alert','Alertas Críticas','Retrasos, recolecciones y guías por validar',
     '<div class="panel__body">'+alertas.map(a=>'<div class="aviso aviso--'+a[0]+'">'+ico(a[0]==='crit'?'alert':a[0]==='ok'?'check':'info',20)+'<div><b>'+esc(a[1])+'</b><p>'+esc(a[2])+'</p></div></div>').join('')+'</div>')
   + '</div>';
 }

 /* --- Despachos --- */
 if(t==='desp'){
  const filas=filtro(S.despachos,['id','cl','ref','estado','ruta']).map(d=>{
   const c=S.clientes.find(x=>x.id===d.cl)||{nom:'—'};
   const acc=d.estado==='alistado'?'<button class="btn btn--sm btn--oliva" data-act="l-despachar" data-id="'+d.id+'">Confirmar</button>'
    :d.estado==='despachado'?'<button class="btn btn--sm btn--ghost" data-act="l-transito" data-id="'+d.id+'">En tránsito</button>'
    :d.estado==='en tránsito'?'<button class="btn btn--sm btn--ghost" data-act="l-entregar" data-id="'+d.id+'">Registrar entrega</button>'
    :'<button class="btn btn--sm btn--ghost" data-act="l-devolucion" data-id="'+d.id+'">Devolución</button>';
   return '<tr><td><b>'+d.id+'</b><div class="tiny">'+esc(c.nom)+' · ruta '+esc(d.ruta)+'</div></td>'
   +'<td>'+d.ref+'<div class="tiny">'+n0(d.cant)+' pares</div></td>'
   +'<td class="muted">'+(d.guia||'—')+'</td>'
   +'<td class="tiny" style="line-height:1.5">Comp. '+d.compromiso+(d.real?'<br>Ent. '+d.real:'')+'</td>'
   +'<td>'+pill(d.estado)+(d.dev?'<div class="tiny" style="color:var(--warn)">Con devolución</div>':'')+'</td>'
   +'<td><div class="acts">'+acc+'</div></td></tr>';
  }).join('');
  const listos=S.pedidos.filter(p=>p.estado==='listo');
  const form='<div class="panel__body panel__body--form">'
   +(listos.length?'':'<div class="aviso aviso--warn">'+ico('info',20)+'<div><b>Sin pedidos listos</b><p>Confirme un pedido con existencias en Comercial para generar el alistamiento.</p></div></div>')
   +'<div class="field"><label for="f-l-ped">Pedido listo</label><div class="control">'+ico('clip',20)+'<select id="f-l-ped">'+(listos.map(p=>'<option value="'+p.id+'">'+p.id+' · '+p.ref+' · '+p.cant+' pares</option>').join('')||'<option value="">— Sin pedidos listos —</option>')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="f-l-alist">Cantidad alistada</label><div class="control">'+ico('box',20)+'<input id="f-l-alist" type="number" min="0" placeholder="Debe coincidir con el pedido"></div></div>'
   +'<div class="field"><label for="f-l-tra">Vehículo</label><div class="control">'+ico('truck',20)+'<select id="f-l-tra">'+S.flota.map(f=>'<option value="'+f.placa+'">'+f.placa+' · '+f.tipo+' · '+f.cond+'</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<button class="btn" data-act="l-crear" '+(listos.length?'':'disabled')+'>'+ico('truck',19)+'Generar despacho</button>'
   +'<p class="tiny">Si las referencias y cantidades empacadas no coinciden con el pedido, el despacho no puede cerrarse.</p></div>';
  cuerpo = panel('vino','truck','Orden de Despacho','Alistamiento verificado y asignación de vehículo',form)
   + panel('oliva','ruta','Órdenes de Despacho','Alistado → despachado → en tránsito → entregado',
     '<div class="panel__body panel__body--flush">'+tabla([['Despacho'],['Modelo'],['Guía'],['Fechas'],['Estado'],['Acciones']],filas?[filas]:[])
     + nota('Al confirmar el despacho se descuenta el producto terminado del inventario y se genera la guía de remisión.')+'</div>');
 }

 /* --- Recepción de proveedores --- */
 if(t==='recep'){
  const filas=S.recep.map(r=>{
   const p=S.proveedores.find(v=>v.id===r.prov)||{nom:'—'};
   return '<tr><td><b>'+r.id+'</b><div class="tiny">'+r.fecha+'</div></td>'
   +'<td>'+esc(p.nom)+'<div class="tiny">'+esc(r.oc)+'</div></td>'
   +'<td class="muted">'+esc(r.guia)+'</td>'
   +'<td>'+(r.estado==='validado'?'<span class="pill pill--ok">Validado</span>':r.estado==='rechazado'?'<span class="pill pill--crit">Rechazado</span>':'<span class="pill pill--warn">Por validar</span>')+'</td>'
   +'<td class="muted">'+esc(r.obs||'—')+'</td>'
   +'<td><div class="acts">'+(r.estado==='por validar'&&edit?'<button class="btn btn--sm btn--oliva" data-act="l-validar" data-id="'+r.id+'">Validar</button>':'<span class="tiny">—</span>')+'</div></td></tr>';
  }).join('');
  const form='<div class="panel__body panel__body--form">'
   +'<div class="field"><label for="rp-oc">Orden de compra</label><div class="control">'+ico('cart',20)+'<select id="rp-oc">'+(S.oc.filter(o=>['enviada','parcial'].includes(o.estado)).map(o=>'<option value="'+o.id+'">'+o.id+' · '+insumo(o.cod).nom+'</option>').join('')||'<option value="">— Sin órdenes en camino —</option>')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="rp-guia">Guía del transportador</label><div class="control">'+ico('clip',20)+'<input id="rp-guia" placeholder="Ej. GR-77431"></div></div>'
   +'<div class="field"><label for="rp-bul">Bultos recibidos</label><div class="control">'+ico('box',20)+'<input id="rp-bul" type="number" min="1" value="1"></div></div>'
   +'<button class="btn" data-act="l-recep">'+ico('down',19)+'Registrar recepción</button>'
   +'<p class="tiny">La guía puede leerse con el escáner OCR; si el número no coincide con la orden, la recepción queda por validar y se avisa a Compras.</p></div>';
  cuerpo = panel('vino','down','Recepción de Proveedores','Puerta de entrada de los materiales a la fábrica',form)
   + panel('oliva','clip','Recepciones Registradas','Calidad inspecciona la materia prima antes del ingreso',
     '<div class="panel__body panel__body--flush">'+tabla([['Recepción'],['Proveedor'],['Guía'],['Estado'],['Observación'],['']],filas?[filas]:[])+'</div>');
 }

 /* --- Logística inversa --- */
 if(t==='inv'){
  const filas=S.recol.map(r=>{
   const c=S.clientes.find(x=>x.id===r.cl)||{nom:'—'};
   return '<tr><td><b>'+r.id+'</b><div class="tiny">'+r.fecha+'</div></td>'
   +'<td>'+esc(c.nom)+'</td><td>'+esc(r.ref)+'<div class="tiny">'+n0(r.cant)+' pares</div></td>'
   +'<td>'+esc(r.motivo)+'</td>'
   +'<td><span class="chip chip--'+(r.destino==='calidad'?'oliva':'cobre')+'">'+(r.destino==='calidad'?'A calidad':'A inventario')+'</span></td>'
   +'<td>'+(r.estado==='cerrada'?'<span class="pill pill--ok">Cerrada</span>':'<span class="pill pill--warn">Programada</span>')+'</td>'
   +'<td><div class="acts">'+(r.estado==='programada'&&edit?'<button class="btn btn--sm btn--oliva" data-act="l-recoger" data-id="'+r.id+'">Procesar</button>':'<span class="tiny">—</span>')+'</div></td></tr>';
  }).join('');
  const form='<div class="panel__body panel__body--form">'
   +'<div class="field"><label for="rc-cl">Cliente</label><div class="control">'+ico('user',20)+'<select id="rc-cl">'+S.clientes.map(c=>'<option value="'+c.id+'">'+c.nom+'</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="rc-ref">Referencia</label><div class="control">'+ico('box',20)+'<select id="rc-ref">'+S.modelos.map(m=>'<option value="'+m.ref+'">'+m.ref+' · '+m.nom+'</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<div class="field"><label for="rc-cant">Pares a recoger</label><div class="control">'+ico('plus',20)+'<input id="rc-cant" type="number" min="1" value="1"></div></div>'
   +'<div class="field"><label for="rc-mot">Motivo</label><div class="control">'+ico('alert',20)+'<select id="rc-mot"><option value="Talla equivocada">Talla o referencia equivocada</option><option value="Defecto de fabricación">Defecto de fabricación</option><option value="Sobrante del pedido">Sobrante del pedido</option></select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
   +'<button class="btn" data-act="l-recol">'+ico('arrow',19)+'Programar recolección</button>'
   +'<p class="tiny">El motivo define el destino: en buen estado reingresa a bodega; por defecto de fabricación se remite a Control de Calidad.</p></div>';
  cuerpo = panel('vino','arrow','Logística Inversa','Recolecciones y devoluciones de clientes',form)
   + panel('oliva','clip','Recolecciones','Cada una termina en inventario o en calidad',
     '<div class="panel__body panel__body--flush">'+tabla([['Recolección'],['Cliente'],['Referencia'],['Motivo'],['Destino'],['Estado'],['']],filas?[filas]:[],'Sin recolecciones programadas.')+'</div>');
 }

 /* --- Flota --- */
 if(t==='flota'){
  const filas=S.flota.map(f=>'<tr><td><b>'+esc(f.placa)+'</b><div class="tiny">'+esc(f.tipo)+'</div></td>'
   +'<td>'+esc(f.cond)+'</td>'
   +'<td>'+(f.estado==='en ruta'?'<span class="pill pill--warn">En ruta</span>':'<span class="pill pill--ok">Disponible</span>')+'</td>'
   +'<td>'+esc(f.ruta)+'</td>'
   +'<td style="min-width:120px">'+barra(f.carga/f.cap*100,f.carga/f.cap>.85?'bar--crit':'')+'<div class="tiny">'+n0(f.carga)+' / '+n0(f.cap)+' pares</div></td>'
   +'<td><div class="acts">'+(edit?'<button class="btn btn--sm btn--ghost" data-act="l-flota" data-id="'+f.placa+'">'+(f.estado==='en ruta'?'Cerrar ruta':'Asignar ruta')+'</button>':'<span class="tiny">—</span>')+'</div></td></tr>').join('');
  cuerpo = panel('oliva','truck','Flota','Vehículos, conductores y ocupación de carga',
   '<div class="panel__body panel__body--flush">'+tabla([['Vehículo'],['Conductor'],['Estado'],['Ruta'],['Ocupación'],['']],filas?[filas]:[])
   + nota('La ocupación se calcula sobre la capacidad del vehículo; al cerrar la ruta queda disponible para el siguiente despacho.')+'</div>');
 }

 return hero('Logística y Despacho','Rutas, recepción de proveedores, logística inversa y flota.')
 +kpis('logistica')
 +subnav('logistica',[
   {id:'inicio',n:'Inicio',ic:'grid'},
   {id:'desp',n:'Despachos',ic:'truck',ct:act.length||''},
   {id:'recep',n:'Recepción',ic:'down',ct:S.recep.filter(r=>r.estado!=='validado').length||''},
   {id:'inv',n:'Log. inversa',ic:'arrow',ct:S.recol.filter(r=>r.estado==='programada').length||''},
   {id:'flota',n:'Flota',ic:'ruta',ct:enRuta.length||''}
  ])
 +cuerpo;
};

/* =====================================================================
   ACCIONES
   ===================================================================== */
const A={};

/* --- Usuarios --- */
A['u-crear']=()=>{
 if(!exigir(puedeEscribir('usuarios'),'Solo el administrador gestiona los accesos del sistema.'))return;
 const nom=$('#f-nom').value.trim(), mail=$('#f-mail').value.trim().toLowerCase(),
       area=$('#f-area').value, rol=$('#f-rol').value;
 ['c-nom','c-mail','c-area'].forEach(i=>$('#'+i).classList.remove('bad'));
 if(nom.length<3){$('#c-nom').classList.add('bad');return toast('bad','Nombre incompleto','Escriba el nombre y el apellido del empleado.')}
 if(!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(mail)){$('#c-mail').classList.add('bad');return toast('bad','Correo no válido','Use un correo con formato válido, por ejemplo carlos@sicaf.com.')}
 if(S.usuarios.some(u=>u.correo===mail)){$('#c-mail').classList.add('bad');return toast('bad','Correo ya registrado','Cada acceso debe tener un correo único.')}
 if(!area){$('#c-area').classList.add('bad');return toast('bad','Falta el área','Cada usuario se asocia obligatoriamente a un módulo permitido.')}
 S.usuarios.push({id:Date.now(),nombre:nom,correo:mail,area,rol,estado:'Activo',alta:hoy()});
 log('Creación de acceso',nom+' · '+modName(area)+' · '+rol[0].toUpperCase()+rol.slice(1));
 notificar('usuarios',area,'info','Nuevo acceso en su área',
   nom+' fue habilitado como '+rol+' en '+modName(area)+'.',mail);
 toast('ok','Acceso creado',nom+' entra con '+mail+' y la contraseña inicial '+S.claveDefecto+'. Verá únicamente '+modName(area)+'.');
 render();
};
A['u-editar']=el=>{
 const u=S.usuarios.find(x=>x.id==el.dataset.id);
 modal('Editar acceso — '+u.nombre,
  '<div class="field"><label for="e-area">Departamento (módulo permitido)</label><div class="control">'+ico('grid',20)+'<select id="e-area">'
  +MODS.filter(m=>m.id!=='dashboard').map(m=>'<option value="'+m.id+'"'+(m.id===u.area?' selected':'')+'>'+m.n+'</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
  +'<div class="field"><label for="e-rol">Nivel de permisos</label><div class="control">'+ico('lock',20)+'<select id="e-rol">'
  +['operario','supervisor','gerente'].map(r=>'<option value="'+r+'"'+(r===u.rol?' selected':'')+'>'+r[0].toUpperCase()+r.slice(1)+'</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
  +'<p class="tiny">Alta: '+u.alta+'. El cambio queda registrado en la bitácora con su responsable y su fecha.</p>',
  'Guardar cambios',()=>{
   const a=$('#e-area').value,r=$('#e-rol').value;
   log('Modificación de acceso',u.nombre+': '+modName(u.area)+'/'+u.rol+' → '+modName(a)+'/'+r);
   u.area=a;u.rol=r;cerrarModal();toast('ok','Acceso actualizado',u.nombre+' ahora opera en '+modName(a)+' como '+r+'.');render();
  });
};
A['u-menu']=el=>{
 const u=S.usuarios.find(x=>x.id==el.dataset.id), off=u.estado==='Activo';
 modal(u.nombre,'<p>'+esc(u.correo)+' · '+esc(modName(u.area))+' · '+u.rol+'</p>'
  +'<div class="aviso aviso--warn" style="margin-top:14px">'+ico('info',20)+'<div><b>Un usuario no se elimina</b><p>Se desactiva, conservando el historial de las operaciones que realizó.</p></div></div>',
  off?'Desactivar acceso':'Reactivar acceso',()=>{
   u.estado=off?'Inactivo':'Activo';
   log(off?'Desactivación de acceso':'Reactivación de acceso',u.nombre+' · '+modName(u.area));
   cerrarModal();toast('ok',off?'Acceso desactivado':'Acceso reactivado',u.nombre+' · el historial se conserva.');render();
  });
};
A['u-exportar']=()=>{
 const csv='nombre;correo;area;rol;estado;alta\n'+S.usuarios.map(u=>[u.nombre,u.correo,modName(u.area),u.rol,u.estado,u.alta].join(';')).join('\n');
 modal('Exportar padrón de usuarios','<p class="muted" style="margin-bottom:12px">Archivo delimitado, legible por cualquier herramienta ofimática.</p><pre class="csv">'+esc(csv)+'</pre>',
  'Copiar al portapapeles',()=>{navigator.clipboard&&navigator.clipboard.writeText(csv);cerrarModal();toast('ok','Padrón copiado',S.usuarios.length+' registros listos para pegar en la hoja de cálculo.');});
 log('Exportación de padrón',S.usuarios.length+' registros');
};

/* --- Diseño --- */
A['d-ver']=el=>{S.sel.diseno=el.dataset.ref;render();
 const f=document.querySelector('.ficha'); if(f)f.scrollIntoView({behavior:'smooth',block:'center'});};
A['d-aprobar']=el=>{
 if(!exigir(puedeAprobar('diseno'),'Se requiere rol de supervisor o gerente en Diseño.'))return;
 const m=S.modelos.find(x=>x.ref===el.dataset.ref);
 if(!m.bom.length)return toast('bad','Modelo sin materiales','Agregue la lista de materiales antes de aprobar el modelo.');
 m.estado='aprobado';
 log('Aprobación de modelo',m.ref+' v'+m.ver);
 notificar('diseno','produccion','info','Modelo '+m.ref+' aprobado',
   esc(m.nom)+' versión '+m.ver+' ya puede entrar en órdenes de producción. Costo estimado: '+cop(costoPar(m.ref))+' por par.',m.ref);
 toast('ok','Modelo aprobado',m.ref+' ya puede entrar en órdenes de producción.');render();
};
A['d-version']=el=>{
 if(!exigir(puedeEscribir('diseno'),'No tiene permiso de escritura en Diseño.'))return;
 const m=S.modelos.find(x=>x.ref===el.dataset.ref);m.ver++;m.estado='borrador';
 log('Nueva versión de modelo',m.ref+' → v'+m.ver);
 toast('ok','Versión '+m.ver+' creada','La versión anterior se conserva por trazabilidad. El modelo vuelve a estado borrador.');render();
};
A['d-descontinuar']=el=>{
 if(!exigir(puedeAprobar('diseno'),'Se requiere rol de supervisor o gerente en Diseño.'))return;
 const m=S.modelos.find(x=>x.ref===el.dataset.ref);m.estado='descontinuado';
 log('Descontinuación de modelo',m.ref);toast('ok','Modelo descontinuado',m.ref+' ya no estará disponible para nuevas órdenes.');render();
};
/* Crear modelo */
A['d-nuevo']=()=>{
 if(!exigir(puedeEscribir('diseno'),'No tiene permiso de escritura en Diseño.'))return;
 const ref='REF-'+(1051+S.modelos.length);
 modal('Nuevo modelo',
  '<p class="muted">El modelo nace en estado <b>borrador</b>: podrá cargarle planos y materiales antes de aprobarlo.</p>'
  +'<div class="row2" style="margin-top:14px">'
  +'<div class="field"><label for="nm-ref">Referencia</label><div class="control">'+ico('tag',20)+'<input id="nm-ref" value="'+ref+'"></div></div>'
  +'<div class="field"><label for="nm-temp">Temporada</label><div class="control">'+ico('clip',20)+'<input id="nm-temp" value="Verano 2027"></div></div></div>'
  +'<div class="field"><label for="nm-nom">Nombre del modelo</label><div class="control">'+ico('pencil',20)+'<input id="nm-nom" placeholder="Ej. Botín Pamplona"></div></div>'
  +'<div class="field"><label for="nm-curva">Curva de tallas</label><div class="control">'+ico('bars',20)+'<input id="nm-curva" value="36-43"></div></div>',
  'Crear modelo',()=>{
   const r=$('#nm-ref').value.trim().toUpperCase(), n=$('#nm-nom').value.trim();
   if(n.length<3)return toast('bad','Falta el nombre','Escriba el nombre del modelo.');
   if(S.modelos.some(x=>x.ref===r))return toast('bad','Referencia repetida','Cada modelo recibe una referencia única.');
   S.modelos.unshift({ref:r,nom:n,temp:$('#nm-temp').value.trim(),ver:1,estado:'borrador',curva:$('#nm-curva').value.trim(),bom:[],archivos:[]});
   S.sel.diseno=r;log('Creación de modelo',r+' · '+n);
   cerrarModal();toast('ok','Modelo '+r+' creado','Cargue sus planos y su lista de materiales para poder costearlo.');render();
  },'btn--oliva');
};
/* Editar modelo (si está aprobado, genera versión nueva) */
A['d-editar']=el=>{
 if(!exigir(puedeEscribir('diseno'),'No tiene permiso de escritura en Diseño.'))return;
 const m=S.modelos.find(x=>x.ref===el.dataset.ref)||S.modelos.find(x=>x.ref===S.sel.diseno);
 modal('Editar '+m.ref,
  (m.estado==='aprobado'?'<div class="aviso aviso--warn">'+ico('info',20)+'<div><b>Este modelo está aprobado</b><p>Al guardar, el sistema creará la versión '+(m.ver+1)+' y conservará la anterior. El modelo volverá a borrador.</p></div></div>':'')
  +'<div class="field"><label for="ed-nom">Nombre del modelo</label><div class="control">'+ico('pencil',20)+'<input id="ed-nom" value="'+esc(m.nom)+'"></div></div>'
  +'<div class="row2">'
  +'<div class="field"><label for="ed-temp">Temporada</label><div class="control">'+ico('clip',20)+'<input id="ed-temp" value="'+esc(m.temp)+'"></div></div>'
  +'<div class="field"><label for="ed-curva">Curva de tallas</label><div class="control">'+ico('bars',20)+'<input id="ed-curva" value="'+esc(m.curva)+'"></div></div></div>',
  'Guardar cambios',()=>{
   const n=$('#ed-nom').value.trim();
   if(n.length<3)return toast('bad','Falta el nombre','El modelo debe conservar un nombre.');
   const antes=m.nom+' · '+m.temp+' · '+m.curva;
   m.nom=n;m.temp=$('#ed-temp').value.trim();m.curva=$('#ed-curva').value.trim();
   let msg='Cambios guardados en '+m.ref+'.';
   if(m.estado==='aprobado'){m.ver++;m.estado='borrador';msg='Se creó la versión '+m.ver+'; la anterior queda en el historial.';}
   log('Modificación de modelo',m.ref+': '+antes+' → '+m.nom+' · '+m.temp+' · '+m.curva);
   cerrarModal();toast('ok','Modelo actualizado',msg);render();
  });
};
/* Materiales de la BOM */
A['d-agregar-mat']=()=>{
 const m=S.modelos.find(x=>x.ref===S.sel.diseno);
 if(!exigir(puedeEscribir('diseno'),'No tiene permiso de escritura en Diseño.'))return;
 if(m.estado==='aprobado')return toast('bad','Modelo aprobado','Cree una nueva versión antes de modificar la lista de materiales.');
 modal('Agregar material a '+m.ref,
  '<div class="field"><label for="mt-ins">Insumo</label><div class="control">'+ico('box',20)+'<select id="mt-ins">'
  +S.insumos.map(i=>'<option value="'+i.cod+'">'+i.nom+' ('+i.cod+' · '+i.un+')</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
  +'<div class="field"><label for="mt-cant">Cantidad por par</label><div class="control">'+ico('plus',20)+'<input id="mt-cant" type="number" min="0.01" step="0.01" value="1"></div></div>'
  +'<p class="tiny">El costo se toma del último valor registrado en Inventario.</p>',
  'Agregar',()=>{
   const c=$('#mt-ins').value,q=+$('#mt-cant').value;
   if(!(q>0))return toast('bad','Cantidad no válida','Indique cuánto consume un par.');
   const ix=m.bom.findIndex(b=>b[0]===c);
   if(ix>=0)m.bom[ix][1]=q; else m.bom.push([c,q]);
   log('Modificación de BOM',m.ref+' · '+c+' · '+n2(q)+' '+insumo(c).un+'/par');
   cerrarModal();toast('ok','Material agregado','Costo por par actualizado: '+cop(costoPar(m.ref))+'.');render();
  },'btn--oliva');
};
A['d-quitar-mat']=el=>{
 const m=S.modelos.find(x=>x.ref===S.sel.diseno);
 if(m.estado==='aprobado')return toast('bad','Modelo aprobado','Cree una nueva versión antes de modificar la lista de materiales.');
 const [c]=m.bom[+el.dataset.ix];
 m.bom.splice(+el.dataset.ix,1);
 log('Modificación de BOM',m.ref+' · retirado '+c);
 toast('ok','Material retirado','Nuevo costo por par: '+cop(costoPar(m.ref))+'.');render();
};
/* Planos y archivos */
function pesoTxt(b){return b>1048576?(b/1048576).toFixed(1).replace('.',',')+' MB':Math.max(1,Math.round(b/1024))+' KB';}
function subirPlanos(files){
 const m=S.modelos.find(x=>x.ref===S.sel.diseno);
 if(!puedeEscribir('diseno'))return toast('bad','Operación no autorizada','No tiene permiso de escritura en Diseño.');
 if(!files||!files.length)return;
 m.archivos=m.archivos||[];
 let n=0;
 [...files].forEach(f=>{
  if(f.size>12*1048576){toast('bad','Archivo muy pesado',f.name+' supera los 12 MB permitidos.');return;}
  const img=/^image\//.test(f.type);
  m.archivos.unshift({id:'AR-'+String(++S.seqArch).padStart(3,'0'),nombre:f.name,peso:pesoTxt(f.size),
   tipo:img?'imagen':'plano',fecha:hoy(),resp:S.user.nombre,url:img?URL.createObjectURL(f):''});
  n++;
 });
 if(n){log('Carga de planos',m.ref+' v'+m.ver+' · '+n+' archivo(s)');
  toast('ok',n+(n===1?' archivo cargado':' archivos cargados'),'Quedan asociados a '+m.ref+' versión '+m.ver+'.');render();}
}
A['d-ver-archivo']=el=>{
 const m=S.modelos.find(x=>x.ref===S.sel.diseno), a=(m.archivos||[]).find(x=>x.id===el.dataset.id);
 modal(a.nombre,
  (a.url?'<img src="'+a.url+'" alt="'+esc(a.nombre)+'" style="width:100%;border-radius:var(--r-m);border:1px solid var(--linea)">'
   :'<div class="aviso aviso--warn">'+ico('info',20)+'<div><b>Vista previa no disponible</b><p>Los planos en PDF o CAD se abren con el visor del equipo; el prototipo solo conserva el registro del archivo.</p></div></div>')
  +'<div class="kv" style="margin-top:14px"><span>Modelo</span><b>'+m.ref+' · versión '+m.ver+'</b></div>'
  +'<div class="kv"><span>Tamaño</span><b>'+a.peso+'</b></div>'
  +'<div class="kv"><span>Cargado</span><b>'+a.fecha+' · '+esc(a.resp)+'</b></div>');
};
A['d-anular-archivo']=el=>{
 const m=S.modelos.find(x=>x.ref===S.sel.diseno), a=(m.archivos||[]).find(x=>x.id===el.dataset.id);
 modal('Anular '+a.nombre,
  '<div class="aviso aviso--warn">'+ico('info',20)+'<div><b>El archivo no se elimina</b><p>Queda marcado como anulado y permanece en el historial del modelo, con su responsable y su fecha.</p></div></div>',
  'Anular archivo',()=>{a.anulado=true;log('Anulación de archivo',m.ref+' · '+a.nombre);
   cerrarModal();toast('ok','Archivo anulado','Permanece en el historial de '+m.ref+'.');render();});
};
/* Burbuja de atajo */
A['d-atajo']=()=>{
 const m=S.modelos.find(x=>x.ref===S.sel.diseno);
 modal('¿Qué desea hacer?',
  '<div class="stack">'
  +'<button class="atajo" data-act="d-nuevo"><span class="ic">'+ico('plus',22)+'</span><span><b>Crear un modelo nuevo</b><small>Referencia, temporada y curva de tallas</small></span></button>'
  +'<button class="atajo" data-act="d-editar" data-ref="'+m.ref+'"><span class="ic">'+ico('edit',22)+'</span><span><b>Editar '+m.ref+'</b><small>'+esc(m.nom)+' · versión '+m.ver+'</small></span></button>'
  +'<button class="atajo" data-act="d-agregar-mat"><span class="ic">'+ico('box',22)+'</span><span><b>Agregar material a la BOM</b><small>Actualiza el costeo por par</small></span></button>'
  +'<button class="atajo" data-act="d-subir"><span class="ic">'+ico('down',22)+'</span><span><b>Cargar planos o fichas</b><small>PDF, DWG, DXF, AI, PNG o JPG</small></span></button>'
  +'</div>');
};
A['d-subir']=()=>{cerrarModal();const i=$('#f-planos');
 if(i)i.click(); else toast('bad','Zona de carga no disponible','Abra el módulo de Diseño para cargar planos.');};


/* --- Solicitudes de material --- */
A['s-crear']=el=>{ /* una solicitud manual sí puede convivir con una orden en tránsito */
 const de=el.dataset.de;
 if(!exigir(puedeEscribir(de),'No tiene permiso de escritura en '+modName(de)+'.'))return;
 const cod=$('#sm-ins').value, cant=+$('#sm-cant').value, urg=$('#sm-urg').value, mot=$('#sm-mot').value.trim();
 const op=$('#sm-op')?$('#sm-op').value:'';
 if(!(cant>0))return toast('bad','Cantidad no válida','Indique cuánto material necesita.');
 if(mot.length<5)return toast('bad','Falta el motivo','Explique por qué se requiere el material: queda en el documento.');
 const sol=solicitarCompra(cod,'manual',cant,mot,de,op);
 if(!sol)return toast('bad','Ya hay una solicitud abierta','Compras tiene una solicitud u orden en curso para este insumo.');
 sol.urgencia=urg;
 log('Solicitud de material',sol.id+' · '+cod+' · '+n0(cant)+' '+insumo(cod).un);
 notificar(de,'compras',urg==='alta'?'urgente':'aviso','Solicitud de material '+sol.id,
  n0(cant)+' '+insumo(cod).un+' de '+insumo(cod).nom+'. Motivo: '+mot+(op?' · Orden '+op:''),sol.id);
 toast('ok','Solicitud '+sol.id+' enviada','Compras la verá en su lista de solicitudes recibidas.');
 render();
};
A['s-ver']=el=>{
 const x=S.solicitudes.find(v=>v.id===el.dataset.id), i=insumo(x.cod);
 const p=(S.proveedores.find(v=>v.id===x.prov)||{});
 modal('Solicitud de material '+x.id,
  '<div class="kv"><span>Estado</span><span>'+(x.estado==='atendida'?'<span class="pill pill--ok">Atendida con '+x.oc+'</span>':x.estado==='anulada'?'<span class="pill pill--off">Anulada</span>':'<span class="pill pill--warn">Pendiente</span>')+'</span></div>'
  +'<div class="kv"><span>Área solicitante</span><b>'+esc(modName(x.de))+'</b></div>'
  +'<div class="kv"><span>Responsable</span><b>'+esc(x.resp)+'</b></div>'
  +'<div class="kv"><span>Fecha</span><b>'+x.fecha+'</b></div>'
  +'<div class="kv"><span>Origen</span><b>'+x.origen+'</b></div>'
  +'<div class="kv"><span>Insumo</span><b>'+esc(i.nom)+' ('+x.cod+')</b></div>'
  +'<div class="kv"><span>Cantidad</span><b>'+n0(x.cant)+' '+i.un+'</b></div>'
  +'<div class="kv"><span>Urgencia</span><span>'+(URG[x.urgencia]||'')+'</span></div>'
  +'<div class="kv"><span>Proveedor sugerido</span><b>'+esc(p.nom||'—')+(p.calif?' · '+p.calif+'★ · '+p.dias+' días':'')+'</b></div>'
  +(x.ref?'<div class="kv"><span>Documento asociado</span><b>'+esc(x.ref)+'</b></div>':'')
  +'<div style="margin-top:14px"><b style="color:var(--vino-600)">Motivo</b><p class="muted">'+esc(x.motivo)+'</p></div>'
  +(x.motivoAnula?'<div style="margin-top:10px"><b style="color:var(--crit)">Anulación</b><p class="muted">'+esc(x.motivoAnula)+'</p></div>':'')
  +'<p class="tiny" style="margin-top:14px">Costo estimado con el último valor registrado: '+cop(x.cant*i.costo)+'.</p>');
};
A['s-generar']=el=>{
 const x=S.solicitudes.find(v=>v.id===el.dataset.id), i=insumo(x.cod);
 if(!exigir(puedeEscribir('compras'),'Solo Compras convierte una solicitud en orden.'))return;
 modal('Generar orden de compra desde '+x.id,
  '<p class="muted">'+esc(modName(x.de))+' solicitó '+n0(x.cant)+' '+i.un+' de '+esc(i.nom)+'.<br>Motivo: '+esc(x.motivo)+'</p>'
  +'<div class="field" style="margin-top:14px"><label for="g-prov">Proveedor</label><div class="control">'+ico('truck',20)+'<select id="g-prov">'
  +S.proveedores.map(p=>'<option value="'+p.id+'"'+(p.id===x.prov?' selected':'')+'>'+p.nom+' · '+p.calif+'★ · '+p.dias+' días</option>').join('')
  +'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
  +'<div class="row2">'
  +'<div class="field"><label for="g-cant">Cantidad a comprar</label><div class="control">'+ico('plus',20)+'<input id="g-cant" type="number" min="1" value="'+x.cant+'"></div></div>'
  +'<div class="field"><label for="g-pre">Precio unitario</label><div class="control">'+ico('tag',20)+'<input id="g-pre" type="number" min="1" value="'+Math.round(i.costo)+'"></div></div></div>'
  +'<p class="tiny">La orden nace en estado solicitada. Si supera '+cop(S.TOPE_GERENCIA)+' requerirá aprobación de un gerente.</p>',
  'Generar orden',()=>{
   const cant=+$('#g-cant').value, precio=+$('#g-pre').value;
   if(!(cant>0&&precio>0))return toast('bad','Datos incompletos','Cantidad y precio deben ser mayores que cero.');
   const oc={id:'OC-2026-'+String(++S.seqOC).padStart(3,'0'),prov:$('#g-prov').value,cod:x.cod,cant,precio,
     estado:'solicitada',recibido:0,origen:x.origen,fecha:hoy(),sol:x.id};
   S.oc.unshift(oc); x.estado='atendida'; x.oc=oc.id;
   log('Solicitud atendida',x.id+' → '+oc.id+' · '+cop(cant*precio));
   notificar('compras',x.de,'info','Solicitud '+x.id+' atendida',
     'Se generó la orden de compra '+oc.id+' por '+n0(cant)+' '+i.un+' de '+i.nom+' con '+(S.proveedores.find(p=>p.id===oc.prov)||{}).nom+'.',oc.id);
   if(cant*precio>S.TOPE_GERENCIA)
     notificar('compras','compras','urgente','Aprobación de gerencia pendiente',
      oc.id+' por '+cop(cant*precio)+' supera el tope de '+cop(S.TOPE_GERENCIA)+'.',oc.id);
   cerrarModal();toast('ok','Orden '+oc.id+' generada','La solicitud '+x.id+' quedó atendida.');render();
  },'btn--oliva');
};
A['s-anular']=el=>{
 const x=S.solicitudes.find(v=>v.id===el.dataset.id);
 modal('Anular solicitud '+x.id,
  '<div class="aviso aviso--warn">'+ico('info',20)+'<div><b>La solicitud no se elimina</b><p>Queda anulada con su motivo y su responsable, y permanece en el historial.</p></div></div>'
  +'<div class="field" style="margin-top:14px"><label for="an-mot">Motivo de la anulación</label><div class="control">'+ico('clip',20)+'<input id="an-mot" placeholder="Ej. El consumo se cubrió con el saldo existente"></div></div>',
  'Anular solicitud',()=>{
   const m=$('#an-mot').value.trim();
   if(m.length<5)return toast('bad','Falta el motivo','Explique por qué se anula la solicitud.');
   x.estado='anulada'; x.motivoAnula=m;
   log('Anulación de solicitud',x.id+' · '+m);
   notificar(x.de,'compras','info','Solicitud '+x.id+' anulada',m,x.id);
   cerrarModal();toast('ok','Solicitud anulada','Permanece en el historial de '+modName(x.de)+'.');render();
  });
};

/* --- Compras --- */
A['oc-ins']=el=>{
 const p=sugerirProveedor(el.value);$('#f-oc-prov').value=p.id;$('#f-oc-pre').value=Math.round(insumo(el.value).costo);
};
A['c-crear']=()=>{
 if(!exigir(puedeEscribir('compras'),'No tiene permiso de escritura en Compras.'))return;
 const cod=$('#f-oc-ins').value,cant=+$('#f-oc-cant').value,precio=+$('#f-oc-pre').value;
 if(!(cant>0&&precio>0))return toast('bad','Datos incompletos','Cantidad y precio unitario deben ser mayores que cero.');
 const oc={id:'OC-2026-'+String(++S.seqOC).padStart(3,'0'),prov:$('#f-oc-prov').value,cod,cant,precio,estado:'solicitada',recibido:0,origen:'manual',fecha:hoy()};
 S.oc.unshift(oc);log('Solicitud de compra',oc.id+' · '+cod+' · '+cop(cant*precio));
 if(cant*precio>S.TOPE_GERENCIA)
  notificar('compras','compras','urgente','Aprobación de gerencia pendiente',
   oc.id+' por '+cop(cant*precio)+' supera el tope de '+cop(S.TOPE_GERENCIA)+': requiere un usuario con rol de gerente.',oc.id);
 toast('ok','Orden '+oc.id+' creada',cant*precio>S.TOPE_GERENCIA?'Supera '+cop(S.TOPE_GERENCIA)+': requiere aprobación de un gerente.':'Lista para aprobación.');
 render();
};
A['c-aprobar']=el=>{
 const o=S.oc.find(x=>x.id===el.dataset.id),tot=o.cant*o.precio;
 if(!exigir(puedeAprobar('compras',tot),'La orden supera '+cop(S.TOPE_GERENCIA)+' y solo un gerente puede aprobarla.'))return;
 o.estado='aprobada';log('Aprobación de orden de compra',o.id+' · '+cop(tot));toast('ok','Orden aprobada',o.id+' pasó a estado aprobada.');render();
};
A['c-enviar']=el=>{const o=S.oc.find(x=>x.id===el.dataset.id);o.estado='enviada';
 log('Envío de orden de compra',o.id);toast('ok','Orden enviada',o.id+' fue enviada a '+(S.proveedores.find(p=>p.id===o.prov)||{}).nom+'.');render();};
A['c-recibir']=el=>{
 const o=S.oc.find(x=>x.id===el.dataset.id),i=insumo(o.cod),falta=o.cant-o.recibido;
 modal('Recepción de '+o.id,
  '<p class="muted">'+esc(i.nom)+' ('+o.cod+') · pendiente '+n0(falta)+' '+i.un+'</p>'
  +'<div class="field" style="margin-top:14px"><label for="r-cant">Cantidad realmente recibida</label><div class="control">'+ico('box',20)+'<input id="r-cant" type="number" min="0" max="'+falta+'" value="'+falta+'"></div></div>'
  +'<div class="field"><label for="r-pre">Costo unitario facturado</label><div class="control">'+ico('tag',20)+'<input id="r-pre" type="number" min="0" value="'+o.precio+'"></div></div>'
  +'<p class="tiny">Si la cantidad difiere de la solicitada, la orden se marca como entrega parcial y permanece abierta.</p>',
  'Confirmar recepción',()=>{
   const c=+$('#r-cant').value,p=+$('#r-pre').value;
   if(!(c>0))return toast('bad','Cantidad no válida','Registre una cantidad mayor que cero.');
   entrada(o.cod,c,p,o.id);o.recibido+=c;
   o.estado=o.recibido>=o.cant?'recibida':'parcial';
   if(o.estado==='recibida')o.estado='cerrada';
   log('Recepción de insumo',o.id+' · '+n0(c)+' '+i.un+' · costo prom. '+cop(insumo(o.cod).costo));
   notificar('compras','inventario','info','Ingreso por recepción '+o.id,
     n0(c)+' '+i.un+' de '+i.nom+' ingresaron a bodega. Nuevo costo promedio: '+cop(insumo(o.cod).costo)+'.',o.id);
   const esperan=S.op.filter(x=>x.estado==='en espera'&&(S.modelos.find(y=>y.ref===x.ref)||{bom:[]}).bom.some(b=>b[0]===o.cod));
   esperan.forEach(x=>notificar('compras','produccion',faltantes(x.ref,x.cant).length?'aviso':'urgente',
     (faltantes(x.ref,x.cant).length?'Recepción parcial para ':'Material completo para ')+x.id,
     faltantes(x.ref,x.cant).length
       ? 'Llegó '+i.nom+', pero '+x.id+' aún espera: '+faltantes(x.ref,x.cant).map(z=>insumo(z.cod).nom).join(', ')+'.'
       : 'Ya hay existencias para liberar '+x.id+' ('+n0(x.cant)+' pares de '+x.ref+').',x.id));
   cerrarModal();
   toast('ok','Recepción registrada',n0(c)+' '+i.un+' ingresaron al inventario. Nuevo costo promedio: '+cop(insumo(o.cod).costo)+'.');
   render();
  },'btn--oliva');
};

/* --- Inventario --- */
A['i-kardex']=el=>{
 const cod=el.dataset.cod,i=insumo(cod),ms=S.mov.filter(m=>m.cod===cod).slice().reverse();
 modal('Kárdex — '+i.nom,'<p class="muted">Saldo actual: <b>'+n2(saldo(cod))+' '+i.un+'</b> · costo promedio '+cop(i.costo)+'</p>'
  +'<div class="scroll-x" style="margin-top:12px"><table><thead><tr><th>Mov.</th><th>Tipo</th><th class="num">Cantidad</th><th>Documento</th><th>Responsable</th></tr></thead><tbody>'
  +ms.map(m=>'<tr><td>'+m.id+'</td><td>'+m.tipo+'</td><td class="num">'+n2(m.cant)+'</td><td class="muted">'+esc(m.doc)+'</td><td class="tiny">'+esc(m.resp)+'</td></tr>').join('')
  +'</tbody></table></div>');
};
A['i-reponer']=el=>{
 if(!exigir(puedeEscribir('inventario'),'No tiene permiso de escritura en Inventario.'))return;
 const sol=solicitarCompra(el.dataset.cod,'manual',0,'Reposición solicitada desde Inventario','inventario');
 if(sol){log('Solicitud de material',sol.id+' · '+sol.cod);
  notificar('inventario','compras','aviso','Solicitud de material '+sol.id,
    n0(sol.cant)+' '+insumo(sol.cod).un+' de '+insumo(sol.cod).nom+'. Proveedor sugerido: '+(S.proveedores.find(p=>p.id===sol.prov)||{}).nom+'.',sol.id);
  toast('ok','Solicitud '+sol.id+' enviada a Compras','Queda pendiente hasta que Compras genere la orden.');}
 else toast('','Ya existe una solicitud abierta','Compras ya tiene una solicitud u orden en curso para este insumo.');
 render();
};
A['i-ajustar']=()=>{
 if(!exigir(puedeEscribir('inventario'),'No tiene permiso de escritura en Inventario.'))return;
 const cod=$('#f-aj-ins').value,fis=$('#f-aj-cant').value,just=$('#f-aj-just').value.trim();
 if(fis===''||isNaN(+fis))return toast('bad','Falta la cantidad','Registre la cantidad contada físicamente.');
 if(just.length<10)return toast('bad','Justificación obligatoria','Los ajustes por inventario físico exigen justificación.');
 const dif=+fis-saldo(cod);
 if(!dif)return toast('','Sin diferencia','El conteo coincide con el saldo del sistema.');
 mover(cod,'ajuste',dif,'Conteo físico',just);revisarMinimo(cod);
 log('Ajuste de inventario',cod+' · '+(dif>0?'+':'')+n2(dif)+' · '+just);
 toast('ok','Ajuste registrado','Diferencia de '+(dif>0?'+':'')+n2(dif)+' '+insumo(cod).un+' guardada como movimiento, no como edición del saldo.');
 render();
};

/* --- Producción --- */
A['p-crear']=()=>{
 if(!exigir(puedeEscribir('produccion'),'No tiene permiso de escritura en Producción.'))return;
 const ref=$('#f-op-ref').value,cant=+$('#f-op-cant').value,fec=$('#f-op-fec').value;
 if(!(cant>0))return toast('bad','Cantidad no válida','Indique cuántos pares se van a fabricar.');
 const op={id:'OP-2026-'+String(++S.seqOP).padStart(3,'0'),ref,cant,compromiso:fec,estado:'en espera',etapa:0,
  etapas:['Corte','Guarnición','Montaje','Terminado'].map(n=>({n,rec:0,proc:0,perd:0,cerrada:false})),liberada:false,pedido:''};
 S.op.unshift(op);log('Creación de orden de producción',op.id+' · '+ref+' · '+cant+' pares');
 liberar(op);render();
};
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

/* --- Calidad --- */
A['q-inspeccionar']=el=>{const l=S.lotes.find(x=>x.id===el.dataset.id);
 S.q='';const s=$('#f-q-lote');if(s){s.value=l.id;$('#f-q-conf').focus();}
 toast('','Lote '+l.id+' seleccionado','Registre el resultado de la inspección en el formulario.');};
A['q-registrar']=()=>{
 if(!exigir(puedeEscribir('calidad'),'No tiene permiso de escritura en Control de Calidad.'))return;
 const id=$('#f-q-lote').value,l=S.lotes.find(x=>x.id===id);
 if(!l)return toast('bad','Sin lote','No hay lotes pendientes de inspección.');
 const c=+$('#f-q-conf').value,r=+$('#f-q-rep').value,d=+$('#f-q-des').value;
 if(c+r+d===0)return toast('bad','Sin resultados','Clasifique las unidades revisadas en conforme, reproceso o descarte.');
 if(c+r+d>l.cant)return toast('bad','Cantidades incoherentes','El lote tiene '+n0(l.cant)+' unidades; la suma clasificada las supera.');
 l.conf=c;l.repro=r;l.desc=d;l.tipo=$('#f-q-tipo').value;l.defecto=$('#f-q-def').value;l.etapaOrigen=$('#f-q-eta').value;l.fecha=hoy();
 const pct=c/l.cant*100;
 if(pct>=S.UMBRAL_CALIDAD){
  l.estado='aprobado';mover(PT(l.ref),'entrada',c,l.id);
  if(r){const op=S.op.find(o=>o.id===l.op);if(op){op.estado='en proceso';const ix=op.etapas.findIndex(e=>e.n===l.etapaOrigen);if(ix>=0){op.etapa=ix;op.etapas[ix].cerrada=false;op.etapas[ix].rec=r;}}}
  log('Acta de inspección',l.id+' · '+n2(pct)+' % conformidad · aprobado');
  notificar('calidad','inventario','info','Ingreso de producto terminado '+l.id,
    n0(c)+' pares conformes de '+l.ref+' ingresan a bodega ('+n2(pct)+' % de conformidad).',l.id);
  if(r)notificar('calidad','produccion','aviso','Reproceso de '+n0(r)+' pares · '+l.id,
    'Regresan a la etapa de '+l.etapaOrigen+' por '+l.defecto.toLowerCase()+'.',l.op);
  toast('ok','Lote '+l.id+' aprobado',n0(c)+' pares ingresaron a producto terminado'+(r?'; '+n0(r)+' regresan a '+l.etapaOrigen+' por reproceso.':'.'));
 }else{
  l.estado='rechazado';
  S.alertas.push({tipo:'calidad',area:'calidad',nivel:'crit',t:'Lote rechazado en Control de Calidad',d:l.id+' ('+l.ref+') alcanzó '+n2(pct)+' % de conformidad, por debajo del umbral de '+S.UMBRAL_CALIDAD+' %. Defecto principal: '+l.defecto.toLowerCase()+', etapa '+l.etapaOrigen+'.'});
  log('Acta de inspección',l.id+' · '+n2(pct)+' % conformidad · rechazado');
  notificar('calidad','produccion','urgente','Lote '+l.id+' rechazado',
    n2(pct)+' % de conformidad, por debajo del umbral de '+S.UMBRAL_CALIDAD+' %. Defecto principal: '+l.defecto.toLowerCase()+', etapa '+l.etapaOrigen+'.',l.op);
  toast('bad','Lote '+l.id+' rechazado',n2(pct)+' % de conformidad, por debajo del umbral. Se notificó al supervisor de producción.');
 }
 if(d)log('Costo de no calidad',l.id+' · '+n0(d)+' pares descartados · '+cop(d*costoPar(l.ref)));
 render();
};

/* --- Comercial --- */
A['v-cotizar']=()=>{
 if(!exigir(puedeEscribir('comercial'),'No tiene permiso de escritura en Comercial.'))return;
 const cl=$('#f-v-cl').value,ref=$('#f-v-ref').value,cant=+$('#f-v-cant').value;
 if(!(cant>0))return toast('bad','Cantidad no válida','Indique cuántos pares cotiza.');
 const desc=cant>=100?.08:cant>=50?.05:0;
 const valor=Math.round(S.precios[ref]*cant*(1-desc));
 const p={id:'PD-2026-'+String(++S.seqPD).padStart(3,'0'),cl,ref,cant,estado:'cotizado',valor,fecha:hoy()};
 S.pedidos.unshift(p);log('Cotización generada',p.id+' · '+ref+' · '+cop(valor));
 toast('ok','Cotización '+p.id,cop(valor)+(desc?' con '+(desc*100)+' % de descuento por volumen.':'.'));
 render();
};
A['v-confirmar']=el=>{
 const p=S.pedidos.find(x=>x.id===el.dataset.id),c=S.clientes.find(x=>x.id===p.cl);
 if(!exigir(puedeEscribir('comercial'),'No tiene permiso de escritura en Comercial.'))return;
 if(c.saldo+p.valor>c.cupo)
  return toast('bad','Cupo de crédito excedido',c.nom+' dispone de '+cop(c.cupo-c.saldo)+' y el pedido asciende a '+cop(p.valor)+'.');
 c.saldo+=p.valor;
 const disp=saldoPT(p.ref);
 if(disp>=p.cant){
  p.estado='listo';log('Pedido confirmado',p.id+' · con existencias · pasa a Logística');
  notificar('comercial','logistica','aviso','Pedido '+p.id+' listo para despacho',
    n0(p.cant)+' pares de '+p.ref+' para '+c.nom+' ('+c.ciudad+'). Hay existencias en bodega.',p.id);
  toast('ok','Pedido '+p.id+' confirmado','Hay '+n0(disp)+' pares disponibles: pasa directo a Logística.');
 }else{
  p.estado='en producción';
  const op={id:'OP-2026-'+String(++S.seqOP).padStart(3,'0'),ref:p.ref,cant:p.cant-disp,compromiso:'2026-10-05',estado:'en espera',etapa:0,
   etapas:['Corte','Guarnición','Montaje','Terminado'].map(n=>({n,rec:0,proc:0,perd:0,cerrada:false})),liberada:false,pedido:p.id};
  S.op.unshift(op);log('Orden de producción automática',op.id+' · originada por '+p.id);
  notificar('comercial','produccion','urgente','Orden '+op.id+' por pedido '+p.id,
    'Faltan '+n0(p.cant-disp)+' pares de '+p.ref+' para cumplir el pedido de '+c.nom+'.',op.id);
  toast('ok','Pedido '+p.id+' confirmado','Sin existencias suficientes: se generó la orden de producción '+op.id+'.');
  liberar(op);
 }
 render();
};

/* --- Logística --- */
A['l-crear']=()=>{
 if(!exigir(puedeEscribir('logistica'),'No tiene permiso de escritura en Logística.'))return;
 const pid=$('#f-l-ped').value,p=S.pedidos.find(x=>x.id===pid);
 if(!p)return toast('bad','Sin pedido','No hay pedidos listos para alistar.');
 const al=+$('#f-l-alist').value;
 if(al!==p.cant)return toast('bad','Alistamiento no coincide','El pedido exige '+n0(p.cant)+' pares y se alistaron '+n0(al||0)+'. El despacho no puede cerrarse.');
 const c=S.clientes.find(x=>x.id===p.cl);
 const d={id:'DS-2026-'+String(++S.seqDS).padStart(3,'0'),pedido:p.id,cl:p.cl,ref:p.ref,cant:p.cant,ruta:c.ciudad,estado:'alistado',compromiso:'2026-09-20',real:'',guia:''};
 S.despachos.unshift(d);log('Orden de despacho',d.id+' · '+p.id+' · ruta '+c.ciudad);
 notificar('logistica','comercial','info','Despacho '+d.id+' alistado',
   'El pedido '+p.id+' de '+c.nom+' quedó alistado y verificado para la ruta '+c.ciudad+'.',d.id);
 toast('ok','Despacho '+d.id+' alistado','Agrupado en la ruta '+c.ciudad+' con '+$('#f-l-tra').value+'.');
 render();
};
A['l-despachar']=el=>{
 const d=S.despachos.find(x=>x.id===el.dataset.id);
 if(saldoPT(d.ref)<d.cant)return toast('bad','Sin producto terminado','Disponible: '+n0(saldoPT(d.ref))+' pares frente a '+n0(d.cant)+' requeridos.');
 mover(PT(d.ref),'salida',d.cant,d.id);
 d.estado='despachado';d.guia='GR-'+Math.floor(Math.random()*9000+80000);
 const p=S.pedidos.find(x=>x.id===d.pedido);if(p)p.estado='despachado';
 log('Confirmación de despacho',d.id+' · guía '+d.guia+' · '+n0(d.cant)+' pares descontados');
 notificar('logistica','inventario','info','Salida de producto terminado '+d.id,
   n0(d.cant)+' pares de '+d.ref+' salieron de bodega con la guía '+d.guia+'.',d.id);
 toast('ok','Despacho confirmado','Guía '+d.guia+'. Se descontaron '+n0(d.cant)+' pares del producto terminado.');
 render();
};
A['l-transito']=el=>{const d=S.despachos.find(x=>x.id===el.dataset.id);d.estado='en tránsito';
 log('Estado de despacho',d.id+' · en tránsito');toast('ok','En tránsito',d.id+' salió hacia '+d.ruta+'.');render();};
A['l-entregar']=el=>{const d=S.despachos.find(x=>x.id===el.dataset.id);d.estado='entregado';d.real=hoy();
 const ok=d.real<=d.compromiso;
 log('Entrega registrada',d.id+' · '+(ok?'a tiempo':'fuera de compromiso'));
 toast(ok?'ok':'','Entrega registrada',d.id+(ok?' se entregó dentro de la fecha comprometida.':' se entregó después de la fecha comprometida.'));render();};
A['l-devolucion']=el=>{
 const d=S.despachos.find(x=>x.id===el.dataset.id);
 modal('Devolución — '+d.id,
  '<p class="muted">'+d.ref+' · '+n0(d.cant)+' pares · ruta '+esc(d.ruta)+'</p>'
  +'<div class="field" style="margin-top:14px"><label for="dv-cant">Pares devueltos</label><div class="control">'+ico('box',20)+'<input id="dv-cant" type="number" min="1" max="'+d.cant+'" value="1"></div></div>'
  +'<div class="field"><label for="dv-mot">Motivo</label><div class="control">'+ico('alert',20)+'<select id="dv-mot"><option value="ok">Error de referencia o talla (producto en buen estado)</option><option value="def">Defecto de fabricación</option></select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
  +'<p class="tiny">Según el motivo, el sistema reingresa la mercancía al inventario o la remite a Control de Calidad.</p>',
  'Registrar devolución',()=>{
   const q=+$('#dv-cant').value,m=$('#dv-mot').value;d.dev=true;
   if(m==='ok'){mover(PT(d.ref),'entrada',q,'Devolución '+d.id);
    toast('ok','Devolución reingresada',n0(q)+' pares volvieron a producto terminado.');}
   else{const lote={id:'LT-2026-'+String(++S.seqLote).padStart(3,'0'),op:'Devolución '+d.id,ref:d.ref,cant:q,estado:'pendiente',conf:0,repro:0,desc:0,tipo:'',defecto:'',etapaOrigen:'',fecha:hoy()};
    S.lotes.unshift(lote);toast('ok','Devolución remitida a calidad','Se creó el lote '+lote.id+' para inspección.');}
   log('Devolución registrada',d.id+' · '+q+' pares · '+(m==='ok'?'reingreso':'a calidad'));
   if(m==='ok')notificar('logistica','inventario','aviso','Reingreso por devolución '+d.id,
     n0(q)+' pares de '+d.ref+' vuelven a producto terminado en buen estado.',d.id);
   else notificar('logistica','calidad','urgente','Devolución por defecto '+d.id,
     n0(q)+' pares de '+d.ref+' devueltos por el cliente requieren inspección.',d.id);
   cerrarModal();render();
  });
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


/* ===================== ACCIONES DE LOS MÓDULOS AMPLIADOS ===================== */
/* --- Inventario: merma, averías y mantenimiento --- */
A['i-merma-guardar']=()=>{
 if(!exigir(puedeEscribir('inventario'),'No tiene permiso de escritura en Inventario.'))return;
 const ref=$('#mr-ref').value, cant=+$('#mr-cant').value, causa=$('#mr-causa').value.trim(), etapa=$('#mr-etapa').value;
 if(!(cant>0))return toast('bad','Cantidad no válida','Indique cuántas unidades se perdieron.');
 if(causa.length<4)return toast('bad','Falta la causa','Toda merma se registra con su causa.');
 const m={id:'ME-'+String(++S.seqMerma).padStart(3,'0'),fecha:hoy(),origen:'inventario',doc:'Ajuste de bodega',
  ref,cant,causa,etapa,resp:S.user.nombre};
 S.merma.unshift(m);
 if(S.insumos.some(i=>i.cod===ref)) mover(ref,'salida',cant,'Merma '+m.id,causa);
 else if(saldoPT(ref)>=cant) mover(PT(ref),'salida',cant,'Merma '+m.id,causa);
 log('Registro de merma',m.id+' · '+ref+' · '+n0(cant)+' · '+causa);
 notificar('inventario','calidad','aviso','Merma registrada '+m.id,
  n0(cant)+' unidad(es) de '+ref+' dadas de baja en '+etapa+'. Causa: '+causa+'.',m.id);
 toast('ok','Merma '+m.id+' registrada','Se descontó del saldo y quedó con su causa y responsable.');
 render();
};
A['i-averia']=el=>{
 if(!exigir(puedeEscribir('inventario'),'No tiene permiso de escritura en Inventario.'))return;
 const sel=el.dataset.id?S.maquinas.find(m=>m.id===el.dataset.id):null;
 modal('Reportar avería',
  '<div class="field"><label for="av-maq">Máquina</label><div class="control">'+ico('gear',20)+'<select id="av-maq">'
  +S.maquinas.map(m=>'<option value="'+m.id+'"'+(sel&&sel.id===m.id?' selected':'')+'>'+m.id+' · '+m.nom+' ('+m.area+')</option>').join('')
  +'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
  +'<div class="field"><label for="av-falla">Falla detectada</label><div class="control">'+ico('alert',20)+'<input id="av-falla" placeholder="Ej. Fuga en el pistón derecho"></div></div>'
  +'<p class="tiny">La máquina queda fuera de servicio y se avisa a Producción y a Control de Calidad, porque afecta la etapa donde opera.</p>',
  'Reportar avería',()=>{
   const m=S.maquinas.find(x=>x.id===$('#av-maq').value), f=$('#av-falla').value.trim();
   if(f.length<5)return toast('bad','Falta la descripción','Describa la falla detectada.');
   m.estado='averiada'; m.falla=f;
   log('Avería de maquinaria',m.id+' · '+f);
   notificar('inventario','produccion','urgente','Máquina detenida: '+m.nom,
     'La etapa de '+m.area+' opera sin '+m.nom+'. Falla: '+f+'.',m.id);
   cerrarModal();toast('bad',m.nom+' fuera de servicio','Producción fue notificada.');render();
  });
};
A['i-reparar']=el=>{
 const m=S.maquinas.find(x=>x.id===el.dataset.id);
 modal('Cerrar avería de '+m.nom,
  '<p class="muted">Falla reportada: '+esc(m.falla||'—')+'</p>'
  +'<div class="field" style="margin-top:14px"><label for="rp-obs">Trabajo realizado</label><div class="control">'+ico('clip',20)+'<input id="rp-obs" placeholder="Ej. Cambio de sello y calibración"></div></div>',
  'Poner en operación',()=>{
   const o=$('#rp-obs').value.trim();
   if(o.length<4)return toast('bad','Falta el detalle','Describa el trabajo realizado.');
   m.estado='operativa'; m.falla=''; m.ultimo=hoy();
   log('Reparación de maquinaria',m.id+' · '+o);
   notificar('inventario','produccion','info',m.nom+' en operación','La etapa de '+m.area+' vuelve a contar con la máquina. '+o+'.',m.id);
   cerrarModal();toast('ok',m.nom+' operativa','La etapa de '+m.area+' puede continuar.');render();
  },'btn--oliva');
};
A['i-mant']=el=>{
 const m=S.maquinas.find(x=>x.id===el.dataset.id);
 modal('Programar mantenimiento de '+m.nom,
  '<div class="kv"><span>Último mantenimiento</span><b>'+m.ultimo+'</b></div>'
  +'<div class="kv"><span>Horas acumuladas</span><b>'+n0(m.horas)+' h</b></div>'
  +'<div class="field" style="margin-top:14px"><label for="mt-fec">Próxima fecha</label><div class="control">'+ico('clip',20)+'<input id="mt-fec" type="date" value="'+m.prox+'" style="padding-left:44px"></div></div>',
  'Programar',()=>{
   m.prox=$('#mt-fec').value; m.estado='mantenimiento';
   log('Mantenimiento programado',m.id+' · '+m.prox);
   notificar('inventario','produccion','aviso','Mantenimiento programado: '+m.nom,
     'La máquina de '+m.area+' estará fuera de servicio el '+m.prox+'.',m.id);
   cerrarModal();toast('ok','Mantenimiento programado',m.nom+' queda agendada para el '+m.prox+'.');render();
  });
};

/* --- Compras: cotizaciones, novedades y proveedores --- */
A['c-cotizar']=()=>{
 if(!exigir(puedeEscribir('compras'),'No tiene permiso de escritura en Compras.'))return;
 const sol=$('#ct-sol').value, precio=+$('#ct-pre').value, dias=+$('#ct-dias').value, cal=+$('#ct-cal').value;
 if(!sol)return toast('bad','Sin solicitud','No hay solicitudes pendientes de cotizar.');
 if(!(precio>0&&dias>0))return toast('bad','Datos incompletos','Registre precio y días de entrega.');
 const c={id:'CT-'+String(++S.seqCot).padStart(3,'0'),sol,prov:$('#ct-prov').value,precio,dias,calidad:cal,estado:'registrada',fecha:hoy()};
 S.cotiz.unshift(c);
 log('Cotización registrada',c.id+' · '+sol+' · '+cop(precio));
 toast('ok','Cotización '+c.id+' registrada','Compare las opciones y elija la mejor para generar la orden.');
 render();
};
A['c-elegir']=el=>{
 const c=S.cotiz.find(x=>x.id===el.dataset.id), sol=S.solicitudes.find(x=>x.id===c.sol);
 if(!sol||sol.estado!=='pendiente')return toast('bad','Solicitud no disponible','La solicitud ya fue atendida o anulada.');
 const i=insumo(sol.cod), tot=sol.cant*c.precio;
 if(!exigir(puedeAprobar('compras',tot),'La orden supera '+cop(S.TOPE_GERENCIA)+' y solo un gerente puede aprobarla.'))return;
 const oc={id:'OC-2026-'+String(++S.seqOC).padStart(3,'0'),prov:c.prov,cod:sol.cod,cant:sol.cant,precio:c.precio,
  estado:'solicitada',recibido:0,origen:sol.origen,fecha:hoy(),sol:sol.id,cot:c.id};
 S.oc.unshift(oc); sol.estado='atendida'; sol.oc=oc.id;
 S.cotiz.filter(x=>x.sol===sol.id).forEach(x=>x.estado=x.id===c.id?'elegida':'descartada');
 log('Cotización elegida',c.id+' → '+oc.id+' · '+cop(tot));
 notificar('compras',sol.de,'info','Solicitud '+sol.id+' atendida',
  'Se eligió la cotización de '+(S.proveedores.find(p=>p.id===c.prov)||{}).nom+' y se generó la orden '+oc.id+'.',oc.id);
 toast('ok','Orden '+oc.id+' generada','Cotización '+c.id+' elegida por precio, entrega y calidad.');
 render();
};
A['c-novedad']=()=>{
 if(!exigir(puedeEscribir('compras'),'No tiene permiso de escritura en Compras.'))return;
 const oc=$('#nv-oc').value, tipo=$('#nv-tipo').value, det=$('#nv-det').value.trim(), acc=$('#nv-acc').value.trim();
 if(det.length<5||acc.length<5)return toast('bad','Datos incompletos','Describa la novedad y la acción a coordinar.');
 const n={id:'NV-'+String(++S.seqNov).padStart(3,'0'),oc,tipo,detalle:det,accion:acc,estado:'abierta',fecha:hoy()};
 S.novedades.unshift(n);
 log('Novedad con proveedor',n.id+' · '+oc+' · '+tipo);
 notificar('compras',tipo==='calidad'?'calidad':'inventario',tipo==='calidad'?'urgente':'aviso','Novedad '+n.id+' en '+oc,det+' Acción: '+acc+'.',n.id);
 toast('ok','Novedad '+n.id+' registrada','Queda abierta hasta coordinar la corrección con el proveedor.');
 render();
};
A['c-cerrar-nov']=el=>{
 const n=S.novedades.find(x=>x.id===el.dataset.id);
 modal('Cerrar novedad '+n.id,
  '<p class="muted">'+esc(n.detalle)+'</p>'
  +'<div class="field" style="margin-top:14px"><label for="cn-res">Cómo se resolvió</label><div class="control">'+ico('check',20)+'<input id="cn-res" placeholder="Ej. El proveedor repuso el faltante"></div></div>',
  'Cerrar novedad',()=>{
   const r=$('#cn-res').value.trim();
   if(r.length<5)return toast('bad','Falta el cierre','Explique cómo se resolvió.');
   n.estado='cerrada'; n.accion=r;
   log('Novedad cerrada',n.id+' · '+r);
   cerrarModal();toast('ok','Novedad cerrada','Queda en el historial de la orden '+n.oc+'.');render();
  },'btn--oliva');
};
A['c-calificar']=el=>{
 const p=S.proveedores.find(x=>x.id===el.dataset.id);
 modal('Calificar a '+p.nom,
  '<div class="kv"><span>Calificación actual</span><b>'+p.calif+' / 5</b></div>'
  +'<div class="kv"><span>Tiempo de entrega</span><b>'+p.dias+' días</b></div>'
  +'<div class="field" style="margin-top:14px"><label for="cf-val">Nueva calificación</label><div class="control">'+ico('check',20)+'<select id="cf-val"><option value="5">5 · excelente</option><option value="4.5">4,5</option><option value="4">4 · buena</option><option value="3.5">3,5</option><option value="3">3 · aceptable</option><option value="2">2 · deficiente</option></select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
  +'<p class="tiny">La calificación decide a quién sugiere el sistema en la próxima solicitud automática.</p>',
  'Guardar calificación',()=>{
   p.calif=+$('#cf-val').value;
   log('Calificación de proveedor',p.nom+' → '+p.calif);
   cerrarModal();toast('ok','Proveedor calificado',p.nom+' quedó en '+p.calif+' / 5.');render();
  });
};

/* --- Calidad: materia prima, mediciones, NC, auditorías y certificado --- */
A['q-mp']=el=>{
 const r=S.recep.find(x=>x.id===el.dataset.id);
 modal('Inspección de materia prima · '+r.id,
  '<p class="muted">Orden '+esc(r.oc)+' · guía '+esc(r.guia)+'</p>'
  +'<div class="field" style="margin-top:14px"><label for="mp-res">Resultado de la muestra</label><div class="control">'+ico('flask',20)+'<select id="mp-res"><option value="validado">Conforme · liberar para ingreso</option><option value="rechazado">No conforme · rechazar</option></select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
  +'<div class="field"><label for="mp-obs">Observación</label><div class="control">'+ico('clip',20)+'<input id="mp-obs" placeholder="Ej. Empaque íntegro, etiquetas correctas"></div></div>',
  'Registrar inspección',()=>{
   const res=$('#mp-res').value, obs=$('#mp-obs').value.trim()||'Sin observaciones';
   r.estado=res; r.obs=obs;
   log('Inspección de materia prima',r.id+' · '+res+' · '+obs);
   if(res==='validado'){
    notificar('calidad','inventario','info','Material liberado '+r.id,'La muestra cumple el estándar: puede ingresar a bodega. '+obs,r.id);
    toast('ok','Material liberado','Inventario puede registrar el ingreso.');
   }else{
    notificar('calidad','compras','urgente','Material rechazado '+r.id,'La muestra no cumple el estándar. '+obs+' Abra la novedad con el proveedor.',r.id);
    toast('bad','Material rechazado','Compras fue notificado para abrir la novedad.');
   }
   cerrarModal();render();
  },'btn--oliva');
};
A['q-medicion']=el=>{
 const o=S.op.find(x=>x.id===el.dataset.id), e=o.etapas[o.etapa]||o.etapas[0];
 const est=S.estandares.find(x=>x.etapa===e.n)||{crit:'Criterio',param:'—',herr:'—'};
 modal('Medición en proceso · '+o.id,
  '<div class="kv"><span>Etapa</span><b>'+esc(e.n)+'</b></div>'
  +'<div class="kv"><span>Criterio</span><b>'+esc(est.crit)+'</b></div>'
  +'<div class="kv"><span>Parámetro</span><b>'+esc(est.param)+'</b></div>'
  +'<div class="kv"><span>Herramienta</span><b>'+esc(est.herr)+'</b></div>'
  +'<div class="field" style="margin-top:14px"><label for="md-res">Resultado</label><div class="control">'+ico('flask',20)+'<select id="md-res"><option value="dentro">Dentro del parámetro</option><option value="fuera">Fuera del parámetro</option></select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
  +'<div class="field"><label for="md-obs">Medición registrada</label><div class="control">'+ico('clip',20)+'<input id="md-obs" placeholder="Ej. 11 puntadas por pulgada"></div></div>',
  'Registrar medición',()=>{
   const res=$('#md-res').value, obs=$('#md-obs').value.trim()||'—';
   log('Medición en proceso',o.id+' · '+e.n+' · '+res+' · '+obs);
   if(res==='fuera'){
    notificar('calidad','produccion','urgente','Medición fuera de parámetro · '+o.id,
      est.crit+' en '+e.n+': '+obs+'. Estándar: '+est.param+'.',o.id);
    toast('bad','Fuera del parámetro','Producción fue notificada para corregir antes de continuar.');
   }else toast('ok','Medición conforme',est.crit+' dentro del estándar en '+e.n+'.');
   cerrarModal();render();
  },'btn--oliva');
};
A['q-nc']=()=>{
 if(!exigir(puedeEscribir('calidad'),'No tiene permiso de escritura en Control de Calidad.'))return;
 const lote=$('#nc-lote').value, desv=$('#nc-desv').value.trim(), met=$('#nc-met').value,
       causa=$('#nc-causa').value.trim(), acc=$('#nc-acc').value.trim();
 if(desv.length<5)return toast('bad','Falta la desviación','Describa qué se salió del estándar.');
 const n={id:'NC-'+String(++S.seqNC).padStart(3,'0'),lote,desv,metodo:met,causa,accion:acc,
  estado:causa?'en análisis':'abierta',fecha:hoy(),resp:S.user.nombre};
 S.nc.unshift(n);
 const l=S.lotes.find(x=>x.id===lote);
 log('No conformidad abierta',n.id+' · '+lote+' · '+desv);
 notificar('calidad','produccion','urgente','No conformidad '+n.id,
  'Lote '+lote+(l?' ('+l.ref+')':'')+': '+desv+'. Método de análisis: '+met+'.',n.id);
 toast('bad','No conformidad '+n.id+' abierta','El lote queda segregado y Producción fue notificada.');
 render();
};
A['q-nc-nueva']=el=>{S.tab.calidad='nc';render();
 setTimeout(()=>{const s=$('#nc-lote'); if(s){s.value=el.dataset.id;$('#nc-desv').focus();}},60);
 toast('','Lote '+el.dataset.id+' seleccionado','Complete la desviación y la causa raíz.');};
A['q-nc-cerrar']=el=>{
 const n=S.nc.find(x=>x.id===el.dataset.id);
 modal('Cerrar no conformidad '+n.id,
  '<div class="kv"><span>Desviación</span><b>'+esc(n.desv)+'</b></div>'
  +'<div class="field" style="margin-top:14px"><label for="nc-ver">Verificación de la acción correctiva</label><div class="control">'+ico('check',20)+'<input id="nc-ver" placeholder="Ej. Horno calibrado y prueba repetida conforme"></div></div>'
  +'<p class="tiny">Una NC solo se cierra cuando se verifica que la acción correctiva funcionó.</p>',
  'Cerrar NC',()=>{
   const v=$('#nc-ver').value.trim();
   if(v.length<5)return toast('bad','Falta la verificación','Registre cómo se comprobó la acción correctiva.');
   n.estado='cerrada'; n.accion=(n.accion?n.accion+' · ':'')+v;
   log('No conformidad cerrada',n.id+' · '+v);
   notificar('calidad','produccion','info','No conformidad '+n.id+' cerrada',v,n.id);
   cerrarModal();toast('ok','NC cerrada','Queda en el historial con su causa raíz y su verificación.');render();
  },'btn--oliva');
};
A['q-certificado']=el=>{
 const l=S.lotes.find(x=>x.id===el.dataset.id), m=S.modelos.find(x=>x.ref===l.ref)||{nom:''};
 const pct=l.cant?l.conf/l.cant*100:0;
 modal('Certificado de calidad · '+l.id,
  '<div class="nota" style="margin:0 0 14px"><span class="dot">'+ico('check',18)+'</span><p><b>Lote liberado.</b> Cumple los estándares definidos para el modelo.</p><span class="firma">Calzado que<br>impulsa tus metas</span></div>'
  +'<div class="kv"><span>Lote</span><b>'+l.id+'</b></div>'
  +'<div class="kv"><span>Modelo</span><b>'+l.ref+' · '+esc(m.nom)+'</b></div>'
  +'<div class="kv"><span>Orden de producción</span><b>'+esc(l.op)+'</b></div>'
  +'<div class="kv"><span>Unidades del lote</span><b>'+n0(l.cant)+'</b></div>'
  +'<div class="kv"><span>Conformes</span><b>'+n0(l.conf)+'</b></div>'
  +'<div class="kv"><span>Índice de conformidad</span><b>'+n2(pct)+' %</b></div>'
  +'<div class="kv"><span>Tipo de inspección</span><b>'+esc(l.tipo||'—')+'</b></div>'
  +'<div class="kv"><span>Fecha de liberación</span><b>'+l.fecha+'</b></div>'
  +'<p class="tiny" style="margin-top:12px">Documento generado por SICAF v1.0.0. La trazabilidad completa del lote queda en la bitácora del sistema.</p>');
};
A['q-auditar']=()=>{
 if(!exigir(puedeEscribir('calidad'),'No tiene permiso de escritura en Control de Calidad.'))return;
 const tipo=$('#au-tipo').value, doc=$('#au-doc').value, res=$('#au-res').value, obs=$('#au-obs').value.trim();
 if(obs.length<5)return toast('bad','Falta la observación','Registre el hallazgo de la auditoría.');
 const a={id:'AU-'+String(++S.seqAud).padStart(3,'0'),tipo,doc,resultado:res,obs,fecha:hoy()};
 S.auditorias.unshift(a);
 log('Auditoría registrada',a.id+' · '+tipo+' · '+res);
 if(res!=='conforme') notificar('calidad','logistica','urgente','Auditoría no conforme '+a.id,
   'El despacho '+doc+' no puede salir: '+obs+'.',a.id);
 else notificar('calidad','logistica','info','Auditoría conforme '+a.id,'El despacho '+doc+' queda habilitado para salir. '+obs,a.id);
 toast(res==='conforme'?'ok':'bad','Auditoría '+a.id+' registrada',res==='conforme'?'Despacho habilitado.':'Logística fue notificada.');
 render();
};

/* --- Logística: recepción, OCR, logística inversa y flota --- */
A['l-recep']=()=>{
 if(!exigir(puedeEscribir('logistica'),'No tiene permiso de escritura en Logística.'))return;
 const oc=$('#rp-oc').value, guia=$('#rp-guia').value.trim(), bultos=+$('#rp-bul').value;
 if(!oc)return toast('bad','Sin orden','No hay órdenes de compra en camino.');
 if(guia.length<4)return toast('bad','Falta la guía','Registre el número de guía del transportador.');
 const o=S.oc.find(x=>x.id===oc);
 const r={id:'IN-'+String(++S.seqRecep).padStart(3,'0'),oc,prov:o.prov,guia,bultos,estado:'por validar',fecha:hoy(),obs:'Pendiente de inspección de calidad.'};
 S.recep.unshift(r);
 log('Recepción de proveedor',r.id+' · '+oc+' · guía '+guia);
 notificar('logistica','calidad','aviso','Material recibido '+r.id,
  'Llegó la orden '+oc+' con guía '+guia+' ('+n0(bultos)+' bultos). Requiere inspección de materia prima.',r.id);
 toast('ok','Recepción '+r.id+' registrada','Calidad debe inspeccionar antes del ingreso a bodega.');
 render();
};
A['l-validar']=el=>{
 const r=S.recep.find(x=>x.id===el.dataset.id);
 r.estado='validado'; r.obs='Guía y bultos verificados en muelle.';
 log('Recepción validada',r.id);
 notificar('logistica','compras','info','Recepción '+r.id+' validada','Guía '+r.guia+' verificada. Compras puede registrar el ingreso de la orden '+r.oc+'.',r.id);
 toast('ok','Recepción validada','Compras puede registrar el ingreso al inventario.');render();
};
A['l-ocr']=()=>{
 modal('Escaneo OCR de guía',
  '<p class="muted">Lectura automática del número de guía y del destinatario impresos en el rótulo.</p>'
  +'<div class="field" style="margin-top:14px"><label for="oc-guia">Número leído</label><div class="control">'+ico('search',20)+'<input id="oc-guia" placeholder="GR-88231"></div></div>'
  +'<p class="tiny">El sistema compara el número contra los despachos y las recepciones registradas; si no coincide, se marca como error de lectura.</p>',
  'Validar lectura',()=>{
   const g=$('#oc-guia').value.trim().toUpperCase();
   const d=S.despachos.find(x=>(x.guia||'').toUpperCase()===g);
   const r=S.recep.find(x=>(x.guia||'').toUpperCase()===g);
   cerrarModal();
   if(d){toast('ok','Guía '+g+' reconocida','Despacho '+d.id+' · '+d.estado+' · ruta '+d.ruta+'.');log('Escaneo OCR',g+' → '+d.id);}
   else if(r){toast('ok','Guía '+g+' reconocida','Recepción '+r.id+' de la orden '+r.oc+'.');log('Escaneo OCR',g+' → '+r.id);}
   else{toast('bad','Error de lectura','La guía '+g+' no corresponde a ningún documento registrado.');log('Error de OCR',g);}
  },'btn--oliva');
};
A['l-recol']=()=>{
 if(!exigir(puedeEscribir('logistica'),'No tiene permiso de escritura en Logística.'))return;
 const cl=$('#rc-cl').value, ref=$('#rc-ref').value, cant=+$('#rc-cant').value, mot=$('#rc-mot').value;
 if(!(cant>0))return toast('bad','Cantidad no válida','Indique cuántos pares se recogen.');
 const destino=mot==='Defecto de fabricación'?'calidad':'inventario';
 const r={id:'RC-2026-'+String(++S.seqRec).padStart(3,'0'),cl,ref,cant,motivo:mot,estado:'programada',fecha:hoy(),destino};
 S.recol.unshift(r);
 log('Recolección programada',r.id+' · '+ref+' · '+mot);
 notificar('logistica',destino,'aviso','Recolección programada '+r.id,
  n0(cant)+' pares de '+ref+' por '+mot.toLowerCase()+'. Destino: '+modName(destino)+'.',r.id);
 toast('ok','Recolección '+r.id+' programada','Se avisó a '+modName(destino)+'.');
 render();
};
A['l-recoger']=el=>{
 const r=S.recol.find(x=>x.id===el.dataset.id);
 r.estado='cerrada';
 if(r.destino==='inventario'){
  mover(PT(r.ref),'entrada',r.cant,'Recolección '+r.id);
  notificar('logistica','inventario','info','Reingreso por recolección '+r.id,n0(r.cant)+' pares de '+r.ref+' vuelven a producto terminado.',r.id);
  toast('ok','Recolección procesada',n0(r.cant)+' pares reingresaron a bodega.');
 }else{
  const lote={id:'LT-2026-'+String(++S.seqLote).padStart(3,'0'),op:'Recolección '+r.id,ref:r.ref,cant:r.cant,
   estado:'pendiente',conf:0,repro:0,desc:0,tipo:'',defecto:'',etapaOrigen:'',fecha:hoy()};
  S.lotes.unshift(lote);
  notificar('logistica','calidad','urgente','Devolución para inspección '+r.id,
   n0(r.cant)+' pares de '+r.ref+' devueltos por defecto. Se creó el lote '+lote.id+'.',lote.id);
  toast('ok','Recolección procesada','Se creó el lote '+lote.id+' para inspección.');
 }
 log('Recolección procesada',r.id+' → '+r.destino);
 render();
};
A['l-flota']=el=>{
 const f=S.flota.find(x=>x.placa===el.dataset.id);
 if(f.estado==='en ruta'){
  f.estado='disponible'; f.ruta='—'; f.carga=0;
  log('Cierre de ruta',f.placa);
  toast('ok','Ruta cerrada',f.placa+' queda disponible para el siguiente despacho.');render();return;
 }
 modal('Asignar ruta a '+f.placa,
  '<div class="kv"><span>Conductor</span><b>'+esc(f.cond)+'</b></div>'
  +'<div class="kv"><span>Capacidad</span><b>'+n0(f.cap)+' pares</b></div>'
  +'<div class="field" style="margin-top:14px"><label for="fl-ruta">Ruta</label><div class="control">'+ico('ruta',20)+'<select id="fl-ruta">'
   +[...new Set(S.clientes.map(c=>c.ciudad))].map(c=>'<option>'+c+'</option>').join('')+'</select><span class="ico chev">'+ico('chev',20)+'</span></div></div>'
  +'<div class="field"><label for="fl-carga">Pares cargados</label><div class="control">'+ico('box',20)+'<input id="fl-carga" type="number" min="1" max="'+f.cap+'" value="'+Math.round(f.cap/2)+'"></div></div>',
  'Asignar',()=>{
   const c=+$('#fl-carga').value;
   if(c>f.cap)return toast('bad','Excede la capacidad',f.placa+' admite '+n0(f.cap)+' pares.');
   f.estado='en ruta'; f.ruta=$('#fl-ruta').value; f.carga=c;
   f.x=Math.round(20+Math.random()*60); f.y=Math.round(20+Math.random()*55);
   log('Ruta asignada',f.placa+' → '+f.ruta+' · '+c+' pares');
   cerrarModal();toast('ok','Ruta asignada',f.placa+' salió hacia '+f.ruta+'.');render();
  },'btn--oliva');
};

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

/* --- Menú lateral: procesos de Producción --- */
/* Abre o cierra el sub-menú sin volver a dibujar la pantalla, para que la
   altura se pueda animar (igual que el mockup de Logística). */
A['menu-prod']=el=>{
 const sub=$('#nav-sub-produccion'); if(!sub)return;
 S.menuProd=!S.menuProd;
 const grupo=el.closest('.nav__grupo');
 if(grupo)grupo.classList.toggle('is-open',S.menuProd);
 el.setAttribute('aria-expanded',S.menuProd?'true':'false');
 el.title=S.menuProd?'Contraer los procesos':'Desplegar los procesos';
 clearTimeout(sub.timerAlto);
 sub.style.maxHeight=sub.scrollHeight+'px';  /* altura de partida */
 void sub.offsetHeight;                      /* fuerza el redibujado */
 sub.classList.toggle('is-cerrado',!S.menuProd);
 sub.style.maxHeight=S.menuProd?sub.scrollHeight+'px':'0px';
 if(S.menuProd)sub.timerAlto=setTimeout(()=>{if(S.menuProd)sub.style.maxHeight=''},260);
};
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
A['tab']=el=>{S.tab[el.dataset.mod]=el.dataset.tab;S.q='';render();
 const p=document.querySelector('.subnav'); if(p)p.scrollIntoView({behavior:'smooth',block:'nearest'});};
A['q-limpiar']=()=>{S.q='';$('#q').value='';pintarSugerencias();render();$('#q').focus();};
A['q-ir']=el=>{
 const mod=el.dataset.mod, sel=el.dataset.sel;
 if(!puedeVer(mod))return toast('bad','Módulo no habilitado','Su rol no tiene acceso a '+modName(mod)+'.');
 if(mod==='diseno'&&sel)S.sel.diseno=sel;
 S.vista=mod; S.q=''; $('#q').value=''; pintarSugerencias(); render();
 toast('ok','Abriendo '+modName(mod),sel?'Referencia '+sel:'');
};
A['cerrar-modal']=()=>cerrarModal();
A['modal-ok']=()=>{if(modalOK)modalOK()};


/* =====================================================================
   BUSCADOR GLOBAL — recorre los módulos habilitados para el usuario
   ===================================================================== */
function buscarGlobal(q){
 const t=norm(q).trim(); if(t.length<2)return [];
 const hit=(...campos)=>campos.some(c=>norm(c).includes(t));
 const R=[];
 const peso=(ref,titulo)=>{const r=norm(ref),ti=norm(titulo);
   return r===t||ti===t?4:r.startsWith(t)||ti.startsWith(t)?3:r.includes(t)?2:1;};
 const add=(mod,ref,titulo,detalle,sel,noti)=>{if(puedeVer(mod))R.push({mod,ref,titulo,detalle,sel,p:peso(ref,titulo)-(noti?1.5:0)});};
 S.modelos.forEach(m=>{if(hit(m.ref,m.nom,m.temp,m.estado))
   add('diseno',m.ref,m.nom,m.ref+' · v'+m.ver+' · '+m.temp+' · '+m.estado,m.ref);});
 S.insumos.forEach(i=>{if(hit(i.cod,i.nom))
   add('inventario',i.cod,i.nom,i.cod+' · saldo '+n2(saldo(i.cod))+' '+i.un+(saldo(i.cod)<i.min?' · bajo mínimo':''));});
 S.oc.forEach(o=>{const p=(S.proveedores.find(x=>x.id===o.prov)||{}).nom||'';
  if(hit(o.id,o.cod,insumo(o.cod).nom,p,o.estado))
   add('compras',o.id,'Orden '+o.id,insumo(o.cod).nom+' · '+p+' · '+o.estado);});
 S.solicitudes.forEach(x=>{if(hit(x.id,x.cod,insumo(x.cod).nom,x.motivo,x.estado))
   add('compras',x.id,'Solicitud '+x.id,modName(x.de)+' · '+insumo(x.cod).nom+' · '+n0(x.cant)+' '+insumo(x.cod).un+' · '+x.estado);});
 S.proveedores.forEach(p=>{if(hit(p.nom,p.id))
   add('compras',p.id,p.nom,'Proveedor · calificación '+p.calif+' · '+p.dias+' días');});
 S.op.forEach(o=>{if(hit(o.id,o.ref,o.estado))
   add('produccion',o.id,'Orden '+o.id,o.ref+' · '+n0(o.cant)+' pares · '+o.estado);});
 S.lotes.forEach(l=>{if(hit(l.id,l.ref,l.estado,l.defecto,l.op))
   add('calidad',l.id,'Lote '+l.id,l.ref+' · '+n0(l.cant)+' pares · '+l.estado+(l.defecto?' · '+l.defecto:''));});
 S.pedidos.forEach(p=>{const c=(S.clientes.find(x=>x.id===p.cl)||{}).nom||'';
  if(hit(p.id,p.ref,c,p.estado))
   add('comercial',p.id,'Pedido '+p.id,c+' · '+p.ref+' · '+p.estado);});
 S.clientes.forEach(c=>{if(hit(c.nom,c.ciudad))
   add('comercial',c.id,c.nom,'Cliente · '+c.ciudad+' · cupo disponible '+cop(c.cupo-c.saldo));});
 S.despachos.forEach(d=>{const c=(S.clientes.find(x=>x.id===d.cl)||{}).nom||'';
  if(hit(d.id,d.guia,d.ruta,c,d.ref,d.estado))
   add('logistica',d.id,'Despacho '+d.id,c+' · '+(d.guia||'sin guía')+' · '+d.estado);});
 S.usuarios.forEach(u=>{if(hit(u.nombre,u.correo,u.rol,modName(u.area)))
   add('usuarios',u.correo,u.nombre,u.correo+' · '+modName(u.area)+' · '+u.rol);});
 S.notis.forEach(n=>{if(hit(n.t,n.d,n.ref)&&(S.user.rol==='admin'||n.para===S.user.area||n.de===S.user.area))
   add(n.para,n.ref,n.t,'Notificación de '+modName(n.de)+' · '+(n.leida?'atendida':'pendiente'),'',true);});
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
   +grupos[m.id].slice(0,5).map(r=>'<button class="sug__i" data-act="q-ir" data-mod="'+r.mod+'" data-sel="'+esc(r.sel||'')+'">'
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
 const TINTE={dashboard:'#FFFFFF',diseno:'var(--cobre-400)',compras:'#F2E3DE',inventario:'var(--cobre-400)',produccion:'#F2E3DE',calidad:'#5CBB7B',comercial:'var(--cobre-400)',logistica:'var(--cobre-400)',usuarios:'#FFFFFF'};
 $('#nav').innerHTML=MODS.map(m=>{
  const ver=puedeVer(m.id), cur=S.vista===m.id;
  const item='<button class="nav__item'+(cur?' is-current':m.id==='dashboard'?' is-home':'')+'" data-act="ir" data-mod="'+m.id+'"'+(ver?'':' disabled')+' style="'+(ver?'':'opacity:.35;')+'" title="'+esc(m.n)+'" aria-current="'+(cur?'page':'false')+'">'
   +'<span style="color:'+(cur?'#fff':TINTE[m.id])+';display:flex">'+ico(m.ic,22)+'</span><span>'+m.n+'</span>'+(ver?'':'<span class="nav__lock">'+ico('lock',16)+'</span>')+'</button>';
  /* Producción se divide en procesos: cuelgan del módulo en un sub-menú desplegable */
  if(m.id!=='produccion'||!ver)return item;
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
 $('#app').innerHTML=(V[S.vista]||V.dashboard)();
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
 /* Un clic fuera cierra el menú de columnas de cualquier tabla */
 let cerrar=false;
 if(!e.target.closest('.dt__pop')&&!e.target.closest('[data-act="dt-cols"]'))
  Object.keys(S.dt).forEach(k=>{if(S.dt[k].cols){S.dt[k].cols=false;cerrar=true}});
 if(S.menuUser&&!e.target.closest('.userwrap')){S.menuUser=false;cerrar=true}
 const t=e.target.closest('[data-act]');
 if(!t){if(cerrar)render();return}
 const a=t.dataset.act;
 if(a==='cerrar-modal'&&t.classList.contains('overlay')&&e.target!==t)return;
 if(A[a]){e.preventDefault();A[a](t);}
 if(cerrar&&$('.dt__pop'))render();
});
/* Los controles que responden al cambio (listas, fechas, casillas) usan data-ch;
   los que responden a cada tecla (buscador de la tabla), data-in. */
document.addEventListener('change',e=>{
 const t=e.target.closest('[data-ch]');
 if(t&&A[t.dataset.ch]){A[t.dataset.ch](t);return;}
 if(e.target.id==='f-planos'){subirPlanos(e.target.files);e.target.value='';}
});
document.addEventListener('input',e=>{
 const t=e.target.closest('[data-in]');
 if(t&&A[t.dataset.in])A[t.dataset.in](t);
});
['dragenter','dragover'].forEach(ev=>document.addEventListener(ev,e=>{
 const d=e.target.closest&&e.target.closest('.drop'); if(d){e.preventDefault();d.classList.add('is-over');}}));
document.addEventListener('dragleave',e=>{const d=e.target.closest&&e.target.closest('.drop');if(d)d.classList.remove('is-over');});
document.addEventListener('drop',e=>{
 const d=e.target.closest&&e.target.closest('.drop');
 if(d){e.preventDefault();d.classList.remove('is-over');subirPlanos(e.dataTransfer.files);}});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape')cerrarModal();
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
