---
name: Zen Minimalist High-Craft
colors:
  surface: '#131316'
  surface-dim: '#131316'
  surface-bright: '#39393c'
  surface-container-lowest: '#0e0e11'
  surface-container-low: '#1b1b1e'
  surface-container: '#1f1f22'
  surface-container-high: '#2a2a2d'
  surface-container-highest: '#353438'
  on-surface: '#e4e1e6'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#e4e1e6'
  inverse-on-surface: '#303033'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#4cd7f6'
  on-primary: '#003640'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#00687a'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#e79400'
  on-tertiary-container: '#563400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#131316'
  on-background: '#e4e1e6'
  surface-variant: '#353438'
typography:
  display:
    fontFamily: Geist
    fontSize: 3rem
    fontWeight: '600'
    lineHeight: 3.5rem
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: '500'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 1.125rem
    fontWeight: '500'
    lineHeight: 1.625rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.625rem
    letterSpacing: -0.005em
  body-md:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.125rem
    letterSpacing: 0.01em
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.04em
  label-metric:
    fontFamily: JetBrains Mono
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style
The brand personality is contemplative, precise, and uncompromisingly functional. Designed for high performers, thinkers, and operators orchestrating their daily habits, focus hours, and long-term goals, this design system acts as an unobtrusive digital sanctuary. The emotional response is one of clarity, mastery, and quiet competence—zero ambient anxiety, visual noise, or decorative friction.

The aesthetic draws on Japanese architectural minimalism fused with hyper-refined Swiss typographic precision:
- **Tonal Subtlety**: Deep zinc and obsidian surfaces rather than harsh pure blacks, allowing crisp architectural lines to organize information hierarchy.
- **Precision Delineation**: Strict micro-borders replace heavy dropshadows or muddy gradient layers, preserving spatial legibility.
- **Functional Luminescence**: Restrained jewel-tone accents (cyan-emerald for progression and amber for active streaks) glow with purpose against neutral graphite canvases.

## Colors
The palette relies on deep, layered achromatic zincs contrasted against pinpoint chromatic indicators:

- **Canvas & Surfaces**:
  - Base Background: `#09090b` (Deep obsidian zinc)
  - Card & Container Surface: `#121215` (Subtle lifted charcoal)
  - Elevated Popovers & Menus: `#18181b` (Refined zinc neutral)
- **Structural Borders**:
  - Subdued Outer Borders: `#1e1e24`
  - Active & Focused Borders: `#27272a`
  - Highlighted Structural Segments: `#3f3f46`
- **Text & Foreground**:
  - Primary Text: `#f4f4f5` (High-contrast soft white)
  - Secondary Text: `#a1a1aa` (Balanced silver)
  - Muted / Inactive Labels: `#71717a` (De-emphasized slate)
- **Signal Accents**:
  - Targets, Progress, & Telemetry: `#06b6d4` (Vibrant Cyan) blending to `#10b981` (Crisp Emerald)
  - Streaks, Temporal Urgency, & Active Momentum: `#f59e0b` (Warm Radiant Amber)

## Typography
Typographic discipline underpins the system’s craft. Geist delivers pure, clinical clarity with balanced aperture and natural tracking in prose and headers. Numeric telemetry, temporal durations, hotkey shortcuts, and streak counts switch into JetBrains Mono to anchor metrics cleanly on an invariant tabular grid.

- Keep heading tracking compressed (-0.02em to -0.04em) to deliver an authoritative, architectural presence.
- Never use bold font weights (`700`+) on long-form content; retain maximum weight at `600` for titles and metrics to avoid dense visual weight.
- Tabular figures must be enabled by default for all data visualization readouts.

## Layout & Spacing
The layout follows a disciplined 12-column structural grid system built on an 8pt architectural rhythm, with a strict 4pt baseline for micro-alignments:

- **Canvas & Containers**:
  - Fixed-width centered desktop layout capped at 1440px with dynamic flanking margins.
  - Breakpoints: Mobile (< 640px), Tablet (640px – 1024px), Desktop (> 1024px).
- **Responsive Behavior**:
  - Metrics cards align in a 4-column flow on desktop, folding to 2 columns on tablet, and single full-width stacks on mobile.
  - Sidebar navigation maintains a lean, fixed 240px width on desktop and collapses into a micro 64px icon-rail or off-canvas drawer on viewports below 1024px.

## Elevation & Depth
Depth is created through physical surface-luminance shifts and razor-sharp border boundaries rather than heavy diffusion shadows:

- **Surface Levels**:
  - `Level 0` (Canvas): `#09090b`
  - `Level 1` (Modular Cards / Panels): `#121215`, enclosed by a 1px border of `#1e1e24`.
  - `Level 2` (Floating Menus / Dialogs): `#18181b`, framed by a 1px border of `#27272a`.
- **Low-Contrast Outlines**: Ambient shadows are restricted to critical modals: `0 8px 32px -4px rgba(0, 0, 0, 0.6)`. Cards carry no drop shadows; spatial separation relies completely on line contrast between `#121215` and `#1e1e24`.
- **Active Glow**: When tracking active states (e.g., in-progress deep work sessions), apply an inner edge glow using `box-shadow: inset 0 0 0 1px rgba(6, 182, 212, 0.35)`.

## Shapes
The shape philosophy favors calibrated softness (`roundedness: 1`). Corner radii are tight, geometric, and intentionally minimal:

- Standard cards, interactive tiles, inputs, and modular panels utilize `0.25rem` (4px).
- Modals, large surface panels, and floating notification drawers scale up to `0.5rem` (8px).
- Never use pill or circular radii for actionable cards or buttons; pill forms (`9999px`) are strictly reserved for inline status indicators and streak badge indicators.

## Components

### Buttons
- **Primary**: Background `#f4f4f5`, text `#09090b`, weight `500`. Hover state gently dims to `#e4e4e7`.
- **Secondary**: Background `#18181b`, border 1px solid `#27272a`, text `#f4f4f5`. Hover triggers border transition to `#3f3f46`.
- **Ghost**: Zero background, text `#a1a1aa`, hovering transitions text to `#f4f4f5` and background to `#18181b`.

### Tabs (Architectural Style)
- Pure flush horizontal tab layouts. No capsule backings.
- Inactive tabs use `#71717a` text.
- Active tab features `#f4f4f5` text with a crisp 1.5px high-contrast cyan `#06b6d4` baseline underline snapping seamlessly to the container's bottom edge.

### Cards & Metric Modules
- Encased in `#121215` with a 1px border `#1e1e24`.
- Internal padding: `space-lg` (1.25rem).
- Title utilizes `body-sm` in `#71717a` uppercase tracking.
- Readout leverages `label-metric` in `#f4f4f5`.
- Footer indicators pair with micro trend indicators: emerald (`#10b981`) for positive trajectories, amber (`#f59e0b`) for active streaks.

### Streak Badges
- Inline compact chips using monospaced numbers.
- Background: `rgba(245, 158, 11, 0.08)`, border 1px solid `rgba(245, 158, 11, 0.25)`, text `#f59e0b`.
- Flame or tally indicators remain minimal, geometric single-line vectors.

### Inputs & Fields
- Dark inset backgrounds (`#0d0d10`), framed with 1px border `#27272a`.
- Active focus state sharpens the border to `#06b6d4` with zero outward ring spread.
- Text aligns at `body-md` in `#f4f4f5`, placeholder text set to `#52525b`.

### Checkboxes & Selection Controls
- Precision squares (16x16px) with 2px corner radius.
- Unchecked: 1px border `#3f3f46`, transparent fill.
- Checked: Fill `#10b981`, stroke `#09090b` checkmark, eliminating outer halo artifacts.