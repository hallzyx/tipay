---
name: Vanguard Brutalist Terminal
colors:
  surface: '#f9f9f9'
  on-surface: '#1b1b1b'
  primary: '#000000'
  on-primary: '#ffffff'
  secondary: '#b22200'
  secondary-container: '#d73b19'
  on-secondary-container: '#ffffff'
  outline: '#000000'
  background: '#f9f9f9'
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 120px
    fontWeight: '900'
    lineHeight: 100%
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 110%
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 110%
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 120%
  body-md:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 150%
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 100%
---

## Brand & Style

Este sistema de diseño, denominado **Vanguard Brutalist Terminal**, se inspira en interfaces industriales y terminales de alta seguridad. Su filosofía es la "honestidad estructural": no hay gradientes, no hay bordes redondeados y la jerarquía se establece mediante el peso visual masivo y el contraste extremo.

El estilo es crudo, técnico y autoritario. Utiliza el espacio negativo no como un vacío, sino como una herramienta de tensión para resaltar los elementos de datos y acción.

## Colors

La paleta es minimalista y de alta tensión:

- **Stark White (#F9F9F9):** El fondo clínico que simula papel técnico o una pantalla de alta luminosidad.
- **Absolute Black (#000000):** Se utiliza para la estructura, bordes de 2px y tipografía principal. Define el peso del diseño.
- **Industrial Orange (#D73B19):** El único color de acento. Se reserva para estados activos, llamadas a la acción (CTA) y alertas críticas.

## Typography

Utiliza **Space Grotesk** para toda la interfaz. 
- Los títulos deben ser masivos, a menudo en mayúsculas, con un interlineado (*leading*) muy cerrado para crear bloques de texto sólidos.
- Los metadatos y etiquetas utilizan pesos bold y trackers amplios para simular marcajes industriales.

## Layout & Spacing

- **Grid Visible:** El diseño se basa en una cuadrícula donde los bordes son visibles (2px solid black). Las secciones se dividen mediante líneas negras directas, eliminando la necesidad de sombras suaves.
- **Hard Margins:** No se utilizan "paddings" generosos para suavizar; se prefiere el alineamiento estricto a los bordes de la cuadrícula.
- **Sidebar Técnica:** Una barra lateral izquierda persistente para navegación jerárquica con iconos de trazo grueso.

## Elevation & Depth (Hard Shadows)

La profundidad no se crea con desenfoque (blur), sino con **Hard Shadows**:
- Sombras sólidas de color negro o naranja desplazadas exactamente a 4px o 8px.
- `box-shadow: 8px 8px 0px 0px #000000;` para tarjetas.
- `box-shadow: 4px 4px 0px 0px #d73b19;` para elementos secundarios o activos.

## Shapes

- **Sharp Corners:** Border-radius de **0px** en absolutamente todos los elementos. Cualquier redondeo rompe la estética industrial.
- **Borders:** Grosor consistente de **2px** para marcos generales y **1px** para divisiones internas de datos.

## Components

- **Buttons:** Bloques rectangulares con bordes negros pesados. Al hacer hover, cambian a naranja o invierten sus colores. Deben incluir una animación de "presión" (`active:translate-x-1 active:translate-y-1`).
- **Cards:** Contenedores con bordes negros y sombras desplazadas sólidas.
- **Progress Bars:** Simples bloques de color sólido dentro de marcos negros.
- **Status Indicators:** Pequeños cuadrados de color sólido (naranja para activo, negro para inactivo).
