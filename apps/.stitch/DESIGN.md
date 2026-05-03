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
---
name: Vanguard Brutalist Terminal (V1.0)
version: 1.0.0
author: Design Protocol Agent
aesthetic: Industrial High-Contrast Brutalism
---

## 1. Core Visual Philosophy
Este sistema de diseño rechaza la suavidad moderna. Se basa en la **honestidad estructural**: el diseño es el sistema operativo. No hay decoraciones superfluas; cada línea es funcional y cada color es una señal.

- **Rigid Grid:** Todo debe estar contenido en una cuadrícula visible.
- **Zero Softness:** Radio de borde (border-radius) estrictamente en 0px.
- **High Information Density:** Uso de tipografía monoespaciada o técnica para metadatos.
- **Aggressive Hierarchy:** Escalas tipográficas masivas contrastadas con micro-etiquetas.

## 2. Technical Token Specification (Tailwind Reference)

### Colors
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `surface` | `#f9f9f9` | Fondo principal clínico. |
| `brand-black` | `#000000` | Estructura, bordes, texto principal. |
| `brand-orange` | `#d73b19` | Acción crítica, estados activos, alertas. |
| `brand-gray` | `#cfc4c5` | Líneas de grid secundarias y guías de fondo. |

### Typography (Space Grotesk)
- **Display:** `text-8xl font-black uppercase tracking-tighter leading-[0.8]`
- **Headline:** `text-3xl font-black uppercase tracking-tight`
- **Label:** `text-[10px] font-bold uppercase tracking-[0.2em]`
- **Body:** `text-base font-normal tracking-tight`

## 3. Structural Rules & Layout Patterns

### The "Visible Skeleton" Rule
- Cada sección principal debe estar dividida por un borde de `border-2 border-black`.
- Los contenedores no usan sombras suaves; usan `box-shadow: 8px 8px 0px 0px #000000`.
- El fondo siempre debe incluir un patrón de cuadrícula de 40px (ver implementación CSS).

### Component Recipes

#### The Hard-Shadow Card
```html
<div class="border-2 border-black bg-white p-8 hard-shadow hover:-translate-x-1 hover:-translate-y-1 transition-all">
  <!-- Content -->
</div>
```

#### The Action Button (CTA)
```html
<button class="bg-brand-orange text-white border-2 border-black p-4 font-black uppercase text-sm hard-shadow-orange active:translate-x-1 active:translate-y-1 transition-all">
  INIT_PROTOCOL
</button>
```

#### The Metadata Badge
```html
<div class="inline-flex items-center gap-2 bg-black text-white px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
  <span class="w-2 h-2 bg-brand-orange"></span>
  SYSTEM_ACTIVE
</div>
```

## 4. Behavior & Interaction Rules

- **Hover States:** Los elementos interactivos deben desplazarse físicamente o invertir sus colores. No usar cambios de opacidad suaves.
- **Active States:** El click debe "hundir" el botón mediante `translate-x` y `translate-y`.
- **Icons:** Usar `lucide-react` con `strokeWidth={3}` (peso grueso). Nunca usar iconos rellenos suaves a menos que sean alertas críticas.
- **Motion:** Usar transiciones de `duration-75` o `duration-100`. Lo brutalista debe sentirse instantáneo y mecánico, no fluido y orgánico.

## 5. Agent Instructions for Implementation
Cuando un agente use este archivo, debe seguir este orden de operaciones:
1. **Grid Setup:** Definir el layout principal usando bordes negros sólidos.
2. **Typography First:** Aplicar `Space Grotesk` y asegurar que los encabezados sean masivos.
3. **Hard Border Policy:** Asegurar que todo `rounded-*` sea eliminado o puesto en `rounded-none`.
4. **Contrast Check:** Si un elemento es importante, debe ser Naranja o Negro Invertido.
5. **Add Noise/Utility:** Añadir etiquetas tipo "SYSTEM_LOG" o "CODE: 200" para reforzar la estética de terminal.

---
**RESTRICCIÓN CRÍTICA:** Queda prohibido el uso de sombras suaves (box-shadow con blur), degradados y bordes inferiores a 2px en elementos estructurales.
