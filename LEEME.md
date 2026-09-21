# SICAF — Sistema Integral de Gestión para Fábricas de Calzado

Prototipo funcional (HTML + CSS + JavaScript, sin frameworks ni dependencias).

## Cómo abrirlo en Visual Studio Code

1. Descomprime la carpeta `SICAF`.
2. En VS Code: **Archivo → Abrir carpeta…** y selecciona `SICAF`.
3. Abre `index.html` y pulsa **Go Live** (extensión *Live Server*), o simplemente
   haz doble clic en `index.html` para abrirlo en el navegador.

> Con Live Server ves los cambios al instante cada vez que guardas.

## Estructura del proyecto

```
SICAF/
├── index.html          → estructura de la página (login, barra lateral, encabezado)
├── css/
│   └── estilos.css     → paleta de color, tipografías, componentes, tablas
├── js/
│   └── app.js          → estado, lógica de los 9 módulos, permisos, notificaciones
├── img/
│   ├── logo-sicaf.png          → logotipo de la marca (PNG con transparencia)
│   ├── login-foto.jpg          → foto del panel de inicio de sesión
│   └── portada-encabezado.jpg  → ya no se usa (la portada quedó sin foto); se conserva
│                                  por si se quiere volver a ponerla
└── LEEME.md
```

## La ayuda y la versión están en el menú del usuario

La página ya no tiene pie. **Soporte**, **Manual de usuario**, **Políticas de seguridad**,
los datos de la sesión, el cierre de sesión y la versión viven en el menú que abre el chip
del usuario, arriba a la derecha. Se dibuja en `pintarMenuUsuario()` y se cierra al pulsar
fuera.

## Acceso

El inicio de sesión abre con el usuario administrador ya escrito; basta con pulsar **Ingresar**.

```
admin@sicaf.com  ·  admin2026      → acceso total (los 9 módulos)
```

Los demás encargados entran escribiendo su propio correo y la clave `sicaf2026`,
y solo ven su módulo:

```
erick@sicaf.com  → Logística     maria@sicaf.com → Inventario
luis@sicaf.com   → Calidad
```

Se puede escribir solo la parte antes de la `@` (por ejemplo `admin`).
Los usuarios y sus claves se administran desde el módulo **Admin. Usuarios**.

## Identidad visual

- Logotipo: marca de calzado en cobre + **SICAF** y el descriptor
  «Sistema integral de gestión para fábricas de calzado».
- Paleta cuero: vinotinto (`--vino-*`), cobre (`--cobre-*`), verde oliva (`--oliva-*`),
  arena y crema.
- Tipografías: **Poppins** (títulos, botones, menús) y **Lora** (textos y frases).
- Portada de cada módulo: solo el título y su frase, sin foto (la fotografía de calzado
  quedó en la pantalla de inicio de sesión).
- Iconos: **[Lucide](https://lucide.dev)** (licencia ISC). No se carga ninguna librería: el
  trazo de cada icono está copiado dentro del objeto `P` de `js/app.js` y `ico(nombre, tamaño)`
  lo envuelve en un `<svg>`. Para añadir uno, se copia su trazo de lucide.dev y se le pone
  nombre en esa tabla.
- Lema: «Calzado que impulsa tus metas» · «Gestión · Calidad · Resultados».

## La barra lateral se pliega

Junto al logotipo y el nombre **SICAF** hay un botón (icono `panel-left` de Lucide) que
**pliega la barra lateral** hasta dejar solo los iconos de los nueve módulos, y la vuelve a
abrir. Está ahí, y no en la barra superior, porque es la barra que se pliega: el botón queda
sobre lo que controla y la barra superior se deja entera para buscar y para la sesión.
Con la barra plegada, el nombre de cada módulo aparece al pasar el ratón por encima. Por
debajo de 900 px la barra ya es una fila de módulos y el botón se oculta.

## Dónde tocar cada cosa

| Quiero cambiar…                    | Archivo y punto de partida                          |
|------------------------------------|-----------------------------------------------------|
| Colores de la marca                | `css/estilos.css` → bloque `:root` (`--vino-*`, `--cobre-*`, `--oliva-*`) |
| Tipografías                        | `index.html` → enlace de Google Fonts · `css/estilos.css` → `--sans` y `--serif` |
| Logotipo, nombre y botón de plegar | `index.html` → bloque `.brand` · `css/estilos.css` → `.brand__*` y `body.side-min` |
| Iconos                             | `js/app.js` → objeto `P` (trazos de Lucide) y `ico()` |
| Alto de la barra superior          | `css/estilos.css` → `.top`, `.search input`, `.avatar`, `.bell` |
| Menú del usuario (ayuda y versión) | `js/app.js` → `pintarMenuUsuario()` · `.umenu*` en el CSS |
| Pantalla de inicio de sesión       | `js/app.js` → `renderLogin()` · `css/estilos.css` → `.login`, `.loginbox` |
| Textos, datos y reglas de negocio  | `js/app.js` → objeto `S` (estado inicial)            |
| Datos de Producción (órdenes, merma, tiempos, lotes) | `js/app.js` → tablas `OPS`, `MERMAS`, `TIEMPOS` y `LOTES`: una fila = un registro |
| Pantalla de un módulo              | `js/app.js` → objeto `V` (`V.inventario`, `V.compras`, …) |
| Acciones de los botones            | `js/app.js` → objeto `A` (se enlazan con `data-act`) |
| Permisos por rol                   | `js/app.js` → `puedeVer`, `puedeEscribir`, `puedeAprobar` |
| Notificaciones entre módulos       | `js/app.js` → `notificar()`, `misNotis()`, `pendientes()` |
| Tablas con buscador y filtros      | `js/app.js` → `datatable()` · `css/estilos.css` → bloque `.dt*` |
| Procesos de Producción (menú)      | `js/app.js` → `PROCESOS` y el `#nav` de `render()` · `.nav__sub` en el CSS |
| Encabezado y pasos de una pantalla | `js/app.js` → `PROC`, `PIPELINE` y `bannerProc()` · `.bnr*` en el CSS |
| Indicadores de un proceso          | `js/app.js` → `indProc()` y `kpisProc()` · `.kpi*` en el CSS |
| Panel principal de Producción      | `js/app.js` → `panelMosaico()` y `MOSAICO` · `.mos`, `.mtile`, `.minib`, `.colg`, `.gauge` |
| Gráficas de un proceso             | `js/app.js` → objeto `PANEL` y `graficasProc()` · `.grafs2` y `.gbar` |
| Lista de pendientes del módulo     | `js/app.js` → `panelMosaico()` (arreglo `pend`) · `.pend*` en el CSS |
| Color de cada paso del flujo       | `js/app.js` → `COL_FLUJO` · variables `--paso-1..9` en el CSS |
| Lienzo del proceso y sus nueve pasos | `js/app.js` → `PASOS`, `lienzoProceso()` y `detallePaso()` · `.wfc*` y `.pasod*` |

## Producción: procesos en el menú y tablas de datos

El módulo de **Producción** se divide en procesos. En vez de pestañas, cuelgan del
módulo en el menú lateral: la flecha `⌄` del ítem **Producción** despliega y contrae la
lista, y a la derecha de cada proceso aparece cuántos registros tiene pendientes.

| Proceso        | Qué muestra                                              | Pasos del flujo |
|----------------|----------------------------------------------------------|-----------------|
| Panel principal| Con lo que abre el módulo: el flujo, cómo va, los pendientes y una tarjeta por proceso | todos |
| Proceso        | Lienzo con los nueve pasos y el detalle del que se elija  | todos           |
| Órdenes        | Órdenes de trabajo con sus etapas y su avance             | 1 y 4           |
| Val. BOM       | Materiales por par contra las existencias de Inventario   | 2 y 3           |
| Etapas         | Una fila por cada etapa de cada orden                     | 5 y 6           |
| Pérdidas       | Merma con su causa, su etapa y su costo                   | 9               |
| Tiempos        | Horas y unidades que deja cada cierre de etapa            | 7               |
| Calidad        | Lotes enviados a inspección y su conformidad              | 8               |
| Productividad  | Rendimiento por operario (unidades por hora)              | —               |
| Costos         | Planeado según BOM contra el real más la merma            | —               |

Salvo las dos primeras, **cada proceso es una tabla de datos**: buscador propio, filtros,
encabezados que ordenan (una pulsación ascendente, otra descendente, otra sin orden),
menú para ocultar columnas, totales de lo filtrado, páginas y exportación a CSV.

Cada pantalla del módulo abre con el mismo encabezado (`bannerProc()`): qué es, para qué
sirve y la tira del flujo —Orden de producción › Verificar materiales › Corte › Guarnición
› Montaje › Terminado › Control de calidad— con los pasos que cubre esa pantalla en
vinotinto. Debajo van **cuatro tarjetas de indicadores del proceso** (`indProc()`), con el
mismo color y el mismo tamaño de siempre; las que traen filtro son botones: al pulsarlas
filtran su tabla y quedan marcadas con «· filtrando».

### La pantalla de Proceso

Es un **lienzo tipo diagrama**: los nueve pasos en zigzag (3 · 3 · 3) unidos por flechas,
sobre un fondo de puntos. Al pulsar un paso, a la derecha sale su detalle: qué se hace en
él, **cómo va hoy** (la cifra la calcula el sistema, no está escrita) y el botón que abre
su tabla.

La **ruta** (qué va después de qué, con sus flechas) vive en la pantalla de Proceso; el
panel responde la otra pregunta, cuánto hay en cada paso. En el **lienzo de Proceso** el
color es identidad: **cada paso tiene el
suyo** (`--paso-1` … `--paso-9` en el CSS): en reposo lo llevan su
número y su icono; al elegirlo, el nodo se rellena con él y la cabecera del detalle, el
acento y el botón toman el mismo color, así se ve de un vistazo qué paso se está leyendo.
Los nueve colores se eligieron con el validador de paletas y no son un capricho: separación
para daltonismo 9,7 y de visión normal 17,8 entre pasos vecinos (los mínimos son 8 y 15), y
texto blanco legible sobre los nueve (de 4,99:1 a 13,81:1). Si se cambia alguno, conviene
volver a comprobarlo. Los pasos están en el arreglo `PASOS` de `js/app.js`: para cambiar un texto o
añadir un paso se toca solo ese arreglo.

En las pantallas de Producción **no se repite la portada del módulo**: el menú lateral ya
dice dónde estamos, así que cada pantalla abre con su propio encabezado. Los avisos de
otros módulos, que antes salían en todas, viven ahora en el Panel principal.

### El panel principal es un mosaico, sin pestañas

Todo cabe en una pantalla (probado de 1280×720 en adelante):

- **A la izquierda**: el **flujo de producción como gráfica de columnas** —eje Y los pares,
  eje X los siete pasos en el orden del proceso, cada uno con su color—, así se ve de un
  vistazo dónde se acumula el trabajo. Al pasar el ratón por una columna sale un globo con
  su cantidad, del mismo color de la columna; al pulsarla se abre ese proceso. El techo del
  eje deja aire sobre la columna más alta para que el globo quepa dentro de la tarjeta. Debajo, los aros de «cuánto se produjo /
  se perdió / avanzó» y el **carrusel de los ocho procesos**: dos tarjetas a la vista, con
  su cifra principal y una mini-gráfica, y flechas que pasan de dos en dos (o los puntos,
  que saltan a un grupo). Al pulsar una tarjeta se abre ese proceso.
- **A la derecha**: la lista de **pendientes**, que ocupa todo el alto y se recorre dentro
  de su tarjeta. Su encabezado lleva un color propio —un ciruela que no se confunde ni con
  el vinotinto del menú lateral ni con el cobre de la tarjeta «Avance promedio»— y el icono
  de bandeja, distinto del triángulo de aviso que ya usa «En espera de material»
  (`.panel__head--pend` en el CSS).

Las dos gráficas grandes de cada proceso viven ahora **encima de su tabla**, en la pantalla
del proceso (`graficasProc()`): así la gráfica y los datos que la forman están juntos, y al
pulsar una barra **se filtra esa misma tabla** (queda la ficha del filtro y la barra
marcada). En pantallas de menos alto la tarjeta se queda con lo esencial —la cifra y dos
barras— y el resto se ve al abrir el proceso.

El módulo viene cargado con datos de demostración: **34 órdenes** repartidas por las cuatro
etapas, **24 registros de merma**, **43 tiempos**, **17 lotes** y **7 modelos** (cinco
aprobados). Están en las tablas `OPS`, `MERMAS`, `TIEMPOS` y `LOTES` de `js/app.js`: una
fila por registro y un ayudante que arma los objetos. Para tener más datos se escriben más
filas; la regla «recibido = procesado + merma» la arma sola `armarOP()`.
- **Los ocho procesos**: dos gráficas de barras a la izquierda y, al lado, **su tabla con
  buscador, paginador y desplazamiento propio**. El buscador está encima del encabezado y
  filtra por cualquier columna (también por las que no se muestran, como el pedido o la
  fecha); el pie deja elegir cuántas filas se ven.

**Al pulsar una barra se filtra por ese dato**: la barra queda marcada, las demás de esa
gráfica se apagan y la tabla de al lado muestra solo lo filtrado. El botón «Tabla completa»
abre el proceso con ese mismo filtro ya puesto en su tabla de datos.

De 901 px hacia arriba **la ventana no se desplaza: lo hace el área de contenido**
(`.page` con `overflow-y:auto`). Gracias a eso las tarjetas del panel ocupan el alto que
queda y traen su propio desplazamiento: la lista de pendientes y la tabla se recorren por
dentro sin mover el encabezado ni las pestañas.

Las gráficas se arman con `gbarras()` y su contenido está en el objeto `PANEL` de
`js/app.js`: cada proceso declara sus dos gráficas (`campo` = por dónde filtra) y las
columnas de su tabla corta. Para cambiar una gráfica solo se toca ese objeto.

Una tabla se arma con `datatable({...})` y se pinta como cualquier otro texto HTML:

```js
datatable({
  id:'p-merma',                       // identificador único: guarda su estado en S.dt
  titulo:'registros de merma',        // aparece al exportar
  filas:S.merma,                      // los datos, tal como están en el estado
  buscar:'Buscar por registro...',    // texto guía del buscador
  orden:{k:'fecha',dir:'desc'},       // orden con el que abre
  cols:[
    {k:'id',   t:'Registro', r:m=>'<b>'+m.id+'</b>'},   // r = cómo se dibuja la celda
    {k:'cant', t:'Cantidad', tipo:'num'},               // tipo: num, moneda, pct
    {k:'etapa',t:'Etapa',    oculta:true}               // empieza oculta
  ],
  filtros:[{k:'etapa',t:'Etapa',op:['Corte','Montaje']}],   // también tipo:'fechas' y tipo:'si'
  acciones:m=>'<button class="btn btn--sm">Ver</button>',   // última columna, fija a la derecha
  resumen:fs=>[{t:'Unidades',v:fs.length,tono:'crit'}]      // totales de TODO lo filtrado
})
```

Lo que el usuario buscó, filtró y ordenó vive en `S.dt[id]`, no en el HTML: así no se
pierde cuando la pantalla se vuelve a dibujar (que es lo que hace `render()` en cada clic).

## Adaptabilidad

- De 761 px hacia arriba las tablas se ven como tabla; por debajo cada fila se
  convierte en una ficha y cada dato conserva su rótulo (`rotularTablas()` en
  `js/app.js` copia el encabezado de la columna en cada celda).
- El mapa de flota de Logística se sustituye por una lista en pantallas pequeñas.
- La barra lateral pasa a ser una fila de módulos desplazable por debajo de 900 px;
  los procesos de Producción siguen en esa misma fila, detrás de su módulo.
- En la tabla de datos, el buscador, los filtros y las páginas se reacomodan, y la
  columna de acciones deja de estar fija a la derecha (cada fila ya es una ficha).
- Verificado sin desplazamiento horizontal entre 360 px y 1440 px.

## Notas

- Los datos viven en memoria: al recargar la página el sistema vuelve al estado inicial.
- Las tipografías (Poppins y Lora) se cargan desde Google Fonts, así que la primera
  carga necesita conexión a internet; sin ella el sistema funciona igual pero con
  tipografías del sistema.
