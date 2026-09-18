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
│   └── portada-encabezado.jpg  → foto del encabezado de cada módulo
└── LEEME.md
```

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
- Lema: «Calzado que impulsa tus metas» · «Gestión · Calidad · Resultados».

## Dónde tocar cada cosa

| Quiero cambiar…                    | Archivo y punto de partida                          |
|------------------------------------|-----------------------------------------------------|
| Colores de la marca                | `css/estilos.css` → bloque `:root` (`--vino-*`, `--cobre-*`, `--oliva-*`) |
| Tipografías                        | `index.html` → enlace de Google Fonts · `css/estilos.css` → `--sans` y `--serif` |
| Logotipo y descriptor              | `index.html` → bloque `.brand` · `css/estilos.css` → `.brand__*` |
| Pantalla de inicio de sesión       | `js/app.js` → `renderLogin()` · `css/estilos.css` → `.login`, `.loginbox` |
| Textos, datos y reglas de negocio  | `js/app.js` → objeto `S` (estado inicial)            |
| Pantalla de un módulo              | `js/app.js` → objeto `V` (`V.inventario`, `V.compras`, …) |
| Acciones de los botones            | `js/app.js` → objeto `A` (se enlazan con `data-act`) |
| Permisos por rol                   | `js/app.js` → `puedeVer`, `puedeEscribir`, `puedeAprobar` |
| Notificaciones entre módulos       | `js/app.js` → `notificar()`, `misNotis()`, `pendientes()` |

## Adaptabilidad

- De 761 px hacia arriba las tablas se ven como tabla; por debajo cada fila se
  convierte en una ficha y cada dato conserva su rótulo (`rotularTablas()` en
  `js/app.js` copia el encabezado de la columna en cada celda).
- El mapa de flota de Logística se sustituye por una lista en pantallas pequeñas.
- La barra lateral pasa a ser una fila de módulos desplazable por debajo de 900 px.
- Verificado sin desplazamiento horizontal entre 360 px y 1440 px.

## Notas

- Los datos viven en memoria: al recargar la página el sistema vuelve al estado inicial.
- Las tipografías (Poppins y Lora) se cargan desde Google Fonts, así que la primera
  carga necesita conexión a internet; sin ella el sistema funciona igual pero con
  tipografías del sistema.
