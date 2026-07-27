---
version: 1.0.0
name: United Motors Luxury System
description: A sophisticated dark-mode aesthetic utilizing amber accents and high-contrast typography to convey premium service and exclusivity.

colors:
  background: "#111111"
  surface: "#0a0a0a"
  primary: "#f59e0b"
  primaryHover: "#fbbf24"
  textMain: "#ffffff"
  textMuted: "#9ca3af"
  textDimmed: "#4b5563"
  border: "rgba(255, 255, 255, 0.05)"
  overlay: "rgba(17, 17, 17, 0.8)"

typography:
  display:
    family: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    weight: "900"
    lineHeight: "0.9"
    letterSpacing: "-0.05em"
    transform: "uppercase"
  heading:
    family: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    weight: "800"
    lineHeight: "1.2"
    transform: "uppercase"
  nav:
    family: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    weight: "700"
    size: "12px"
    letterSpacing: "0.2em"
    transform: "uppercase"
  body:
    family: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    weight: "400"
    size: "14px"
    lineHeight: "1.625"
  label:
    family: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    weight: "700"
    size: "10px"
    letterSpacing: "0.2em"
    transform: "uppercase"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "96px"
  container: "1400px"

rounded:
  none: "0px"
  sm: "2px"
  full: "999px"

components:
  header:
    position: "fixed"
    height: "96px"
    background: "rgba(17, 17, 17, 0.9)"
    blur: "md"
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
  hero:
    layout: "grid-12"
    minHeight: "800px"
    contentSpan: "5"
    imageSpan: "7"
    imageGrayscale: "20%"
  carCard:
    aspectRatio: "16/9"
    background: "rgba(255, 255, 255, 0.05)"
    overlayGradient: "linear-gradient(to bottom, transparent, #111111)"
    transition: "duration-700 hover:scale-105"
  buttonPrimary:
    background: "#f59e0b"
    color: "#000000"
    padding: "12px 24px"
    fontWeight: "bold"
  buttonOutline:
    border: "1px solid rgba(255, 255, 255, 0.2)"
    color: "#ffffff"
    hoverBackground: "#ffffff"
    hoverColor: "#000000"
  sidebar:
    position: "fixed"
    left: "32px"
    top: "50%"
    width: "auto"

motion:
  speed: "300ms"
  curve: "cubic-bezier(0.4, 0, 0.2, 1)"
  hover: "all 0.3s transition-colors"
---
## Overview
Aura United Motors is a noir-inspired visual system designed for high-end luxury rentals. It focuses on stark typography, minimal color palettes (primarily Black and Amber), and immersive high-contrast imagery.

## Colors
The palette is dominated by #111111 to provide a deep, premium backdrop. Amber-500 (#f59e0b) is used exclusively for actionable elements and brand highlights. Borders use subtle white alphas (5-10%) to define structure without breaking the dark immersion.

## Typography
Typography is characterized by high-impact, uppercase sans-serifs. Display text uses heavy weights (900) with negative tracking, while navigation and labels use smaller sizes (10-12px) with wide letter-spacing (0.2em) for a sophisticated editorial feel.

## Spacing
The system relies on a strict grid with 1400px maximum container width. Vertical spacing between sections is generous (96px) to allow the high-end subjects (vehicles) room to breathe.

## Layout
Layouts utilize a mix of standard grids and absolute positioning. A fixed social sidebar (left) and fixed header (top) create a frame for the scrollable content. Hero sections should feature a split-screen arrangement with background gradients bridging text and imagery.

## Elevation & Depth
Depth is achieved through layering rather than shadows. Large background text overlays (e.g., "01" page numbers), backdrop blurs on headers, and semi-transparent gradients on card imagery create a multi-dimensional environment.

## Shapes
This system uses a strict hard-edge aesthetic. All buttons, cards, and input fields must use a 0px border-radius (square corners) to maintain a mechanical, modern-industrial luxury feel.

## Components
- **Brand Block**: A square container with primary background and stacked tracking-heavy text.
- **Inventory Grid**: 3-column layout (desktop) with aspect-ratio-locked car cards.
- **Feature Collage**: Overlapping layout where images, colored boxes, and content blocks intersect with large negative space.
- **Form Fields**: Outlined inputs with subtle borders that transition to primary color on focus.

## Motion
Micro-interactions involve smooth color transitions for links and subtle scale-up transforms (1.05) for car imagery on hover. Scroll behavior must be smooth.

## Do's and Don'ts
- **Do**: Use grayscale or low-saturation photography with high contrast.
- **Do**: Maintain strict uppercase for all headers and UI labels.
- **Don't**: Use rounded corners on any primary UI components.
- **Don't**: Introduce secondary colors like blues or greens; stick to the Amber/Black/White core.

## Accessibility
Ensure all primary Amber-on-Black combinations meet WCAG AA contrast ratios. Use ARIA labels for icon-only buttons like social links and pagination chevrons. Maintain focus-visible states with the primary accent color.