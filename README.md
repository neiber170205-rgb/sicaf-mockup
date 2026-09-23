# SICAF · Prototipo

**Sistema Integral de Gestión para Fábricas de Calzado** — proyecto de la FESC.

👉 **Míralo funcionando: https://neiber170205-rgb.github.io/sicaf-mockup/**

Esto es el **prototipo**: el dibujo de cómo se va a ver y comportar el sistema, hecho antes de programarlo,
para ponernos de acuerdo con la docente y entre nosotros. Son nueve módulos —Dashboard, Diseño, Compras,
Inventario, Producción, Control de Calidad, Comercial, Logística y Despacho, y Administración de
usuarios— con datos de demostración que cambian al pulsar.

## Cómo entrar

| Usuario | Contraseña | Qué ve |
|---|---|---|
| `admin@sicaf.com` | `admin2026` | Todo el sistema |
| `maria@sicaf.com` | `sicaf2026` | Dashboard e Inventario |
| `luis@sicaf.com` | `sicaf2026` | Dashboard y Control de Calidad |
| `erick@sicaf.com` | `sicaf2026` | Dashboard y Logística y Despacho |

> Son claves de mentira, escritas dentro del prototipo para que cualquiera pueda entrar a mirarlo.
> El sistema real no las usa ni se parece: allí las contraseñas van cifradas y en la base de datos.

## Qué es y qué no es

- **Sí**: las pantallas, el recorrido entre ellas, las reglas de negocio y los datos que se ven.
- **No**: no hay servidor ni base de datos. Todo ocurre en el navegador y se pierde al recargar.

No hace falta instalar nada: es HTML, CSS y JavaScript sin librerías. Para verlo en tu computador basta
con abrir `index.html`.

## Qué hay adentro

| Archivo | Qué tiene |
|---|---|
| `index.html` | El esqueleto: el menú lateral, la barra de arriba y el hueco donde se dibuja cada pantalla |
| `js/app.js` | Todo lo demás: los datos, la sesión, el módulo de Producción y cómo se muestra cada módulo |
| `modulos/` | El mockup de cada módulo (menos Producción), tal cual lo dibujó su responsable en su carpeta del proyecto |
| `css/estilos.css` | El diseño: los colores de la marca, las letras y cada pieza |
| `LEEME.md` | La documentación técnica: cómo está armado y dónde se toca cada cosa |

Los íconos son de [Lucide](https://lucide.dev) (licencia ISC). La letra, Poppins, de Google Fonts: en SICAF no se usa letra con serifa.

---

Este repositorio es un espejo público de la carpeta `mockup-general/` del proyecto SICAF, para que la
docente pueda ver el prototipo sin instalar nada. El código del sistema se trabaja aparte.
