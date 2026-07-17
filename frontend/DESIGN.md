---
name: HomeBudget
description: A trustworthy, clean, and friendly design system designed to reduce financial stress and bring clarity.
colors:
  primary: "#343434"
  neutral-bg: "#ffffff"
  border: "#ebebeb"
  muted: "#f7f7f7"
  destructive: "#dc2626"
typography:
  display:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 10px"
  button-secondary:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
  card:
    backgroundColor: "#ffffff"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
---

# Design System: HomeBudget

## 1. Overview

**Creative North Star: "The Calm Ledger"**

The Calm Ledger is a visual framework designed to bring clarity, peace of mind, and grounding stability to personal finance. Financial management can often feel overwhelming; this system rejects the typical high-stress visual tropes of trading platforms and cluttered banking portals. Instead, it relies on generous white space, clear typographical contrast, and structured neutral containers to create an atmosphere of order and simplicity.

By focusing on a restrained palette and clean borders, the interface becomes an open canvas where numbers are easy to read and understand. Micro-interactions and focus states are subtle and reassuring, encouraging users to check in on their financial health without friction.

**Key Characteristics:**
- Restrained color application to highlight actionable areas.
- Strong, grounding sans-serif typography for maximum readability.
- Consistent 1px borders and flat surfaces to create clean divisions.
- Intentional focus rings and subtle hover feedback to build trust.

## 2. Colors

A highly restrained, high-contrast neutral palette designed for absolute clarity and focus.

### Primary
- **Charcoal Primary** (#343434 / oklch(0.205 0 0)): Used for major text headings, primary buttons, and solid active states. It provides a grounding contrast that reads as soft black.

### Neutral
- **Pure Chalk Background** (#ffffff / oklch(1 0 0)): The main canvas background and card surface color, providing a clean, bright, and distraction-free workspace.
- **Off-White Muted** (#f7f7f7 / oklch(0.97 0 0)): Used for secondary backgrounds, muted button variants, and zebra striping.
- **Slate Gray Border** (#ebebeb / oklch(0.922 0 0)): Used for 1px layout lines, grid borders, and disabled element boundaries.

### Destructive
- **Crimson Destructive** (#dc2626 / oklch(0.577 0.245 27.325)): Used sparingly to draw immediate attention to critical errors or deletion pathways.

### Named Rules
**The 10% Accent Rule.** Colored accents (like validation success states or error flags) must occupy less than 10% of any viewport. Neutral grays and white space must carry the layout, making any color callout highly functional.

## 3. Typography

**Display Font:** Geist Variable (with sans-serif fallback)
**Body Font:** Geist Variable (with sans-serif fallback)

**Character:** A modern, geometric sans-serif pairing that offers crisp rendering and absolute technical reliability, feeling both friendly and expert.

### Hierarchy
- **Display** (Bold (700), clamp(2.5rem, 7vw, 4.5rem), 1.1): Used for large hero text or landing headings.
- **Headline** (SemiBold (600), 1.875rem, 1.2): Used for main section headers and page-level titles.
- **Title** (Medium (500), 1.25rem, 1.3): Used for card headings and modal titles.
- **Body** (Regular (400), 0.875rem, 1.5): Used for general reading and form labels. Line length is capped at 65–75 characters (65-75ch) for comfortable scanning.
- **Label** (Medium (500), 0.75rem, 1.2): Used for auxiliary data, timestamps, buttons, and form helpers.

### Named Rules
**The Balance Rule.** Display and headline components must use `text-wrap: balance` to prevent awkward orphaned words and maintain even layout heights on multi-line text block boundaries.

## 4. Elevation

The Calm Ledger is built on a flat, layered elevation model. It explicitly rejects heavy floating dropshadows in favor of clear 1px borders, subtle background tint shifts, and flat container divisions to distinguish stacking order.

### Named Rules
**The Flat-By-Default Rule.** All cards, inputs, and layout blocks are flat at rest. A shadow (using a soft, low-intensity diffuse glow `#000000/0.05`) is only allowed on temporary floating surfaces (such as dropdowns or tooltips) or as an active response to focus states.

## 5. Components

Compact components, subtle rounded corners, and clear focus states that respond gently to user interaction.

### Buttons
- **Shape:** Gently curved corners (8px / `rounded-md` / `var(--radius-md)`).
- **Primary:** Charcoal Primary background with white text. Internal padding of 8px vertical and 10px horizontal (`px-2.5 py-2`).
- **Hover / Focus:** Hover reduces opacity slightly or shifts color to a lighter tone. Focus state triggers a 3px ring (`ring-ring/50`) with an explicit border.
- **Secondary / Muted:** Off-White Muted background with Charcoal Primary text. Used for secondary actions.

### Cards / Containers
- **Corner Style:** Rounded corners (12px / `rounded-lg` / `var(--radius-lg)`).
- **Background:** Pure Chalk Background (#ffffff).
- **Shadow Strategy:** Flat by default, outlined with a 1px border (#ebebeb).
- **Internal Padding:** 16px padding on all sides (`p-4`).

### Inputs / Fields
- **Style:** Transparent background, 1px border (#ebebeb), and rounded corners (8px / `rounded-md`).
- **Focus:** Triggers a colored border shift and a 3px outline glow (`focus-visible:ring-ring/50`).
- **Error:** Uses Crimson Destructive border (#dc2626) with a light tinted error background.

### Navigation
- **Style:** High-contrast bar, simple icons, horizontal or vertical layout with clear active indicators (e.g., text color shift or subtle underline).

## 6. Do's and Don'ts

### Do:
- **Do** cap body line length to 65–75ch for comfortable reading.
- **Do** use `text-wrap: balance` on all page headers to maintain layout symmetry.
- **Do** ensure contrast of body text is at least 4.5:1 against the neutral background.
- **Do** use native dialogs or explicit stacking contexts for dropdowns and overlays.

### Don't:
- **Don't** use border-left or border-right greater than 1px as a colored accent stripe.
- **Don't** use text gradients (using `background-clip: text`) for page headings.
- **Don't** use glassmorphic blur effects as a default styling layer for cards.
- **Don't** use the hero-metric template (huge number, small label, gradient details) for financial summaries.
- **Don't** create identical card grids with icon + heading + paragraph repeated endlessly.
- **Don't** add tiny tracked uppercase eyebrows above every page section.
- **Don't** add sequential numbering section indicators (e.g., 01, 02) to standard dashboards.
- **Don't** use dark mode with purple gradients, neon accents, or glassmorphism.
