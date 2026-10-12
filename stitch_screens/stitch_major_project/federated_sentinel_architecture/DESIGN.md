---
name: Federated Sentinel Architecture
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e5'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f1fe'
  surface-container: '#f0ecf9'
  surface-container-high: '#ebe6f3'
  surface-container-highest: '#e5e0ed'
  on-surface: '#1c1b23'
  on-surface-variant: '#474555'
  inverse-surface: '#312f39'
  inverse-on-surface: '#f3effb'
  outline: '#787586'
  outline-variant: '#c8c4d7'
  surface-tint: '#5844d9'
  primary: '#543fd5'
  on-primary: '#ffffff'
  primary-container: '#6d5bef'
  on-primary-container: '#fcf8ff'
  inverse-primary: '#c6bfff'
  secondary: '#605695'
  on-secondary: '#ffffff'
  secondary-container: '#c4b8ff'
  on-secondary-container: '#504684'
  tertiary: '#8d4800'
  on-tertiary: '#ffffff'
  tertiary-container: '#b15c00'
  on-tertiary-container: '#fff8f5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4dfff'
  primary-fixed-dim: '#c6bfff'
  on-primary-fixed: '#170065'
  on-primary-fixed-variant: '#4025c1'
  secondary-fixed: '#e6deff'
  secondary-fixed-dim: '#cabeff'
  on-secondary-fixed: '#1c0f4e'
  on-secondary-fixed-variant: '#483e7b'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb781'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703800'
  background: '#fcf8ff'
  on-background: '#1c1b23'
  surface-variant: '#e5e0ed'
typography:
  display-lg:
    fontFamily: Bebas Neue
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Bebas Neue
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Bebas Neue
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Bebas Neue
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Bebas Neue
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Comfortaa
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Comfortaa
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Comfortaa
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-mono-lg:
    fontFamily: Metrophobic
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-mono-md:
    fontFamily: Metrophobic
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
  label-mono-sm:
    fontFamily: Metrophobic
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

### Brand Personality & Philosophy
This design system defines a high-assurance, enterprise-grade federated cybersecurity and fraud intelligence ecosystem. Designed for risk analysts, ML engineers, and institutional banking officers, it communicates mathematical integrity, uncompromising privacy preservation, and rapid situational awareness. 

The aesthetic is bold, engineered, and intentional:
- **Zero Decorative Noise:** Elimination of consumer SaaS clichés—no oversaturated neon gradients, no gratuitous glow effects, and no bloated, pill-heavy surfaces.
- **Architectural Precision:** Interfaces favor tight geometric balance, high information density, structural 1px low-contrast dividers, and deliberate micro-typography.
- **Human Verification Clarity:** Because critical algorithmic decisions trigger downstream institutional action, interactive states, verification flows, and risk tiers are rendered with unmistakable functional authority.

### Design Movement: Modern Technical Constructivism
The system blends bold technical constructivism with contemporary UI architecture:
- Deep purple (`#6D5BEF`) serves as the active vector of focus and primary brand signifier, deployed sparingly to command attention.
- Translucent lavender tints (`#C4B8FF`) designate analytical context, mathematical model bounds (such as differential privacy $\epsilon$ radii), and non-punitive system notices.
- Deep violet-toned near-black typography (`#2D2A3A`) anchors all reading paths, ensuring zero glare while preserving optimal contrast against sterile crisp backgrounds (`#FFFFFF`, `#F9F9FB`, `#F3F2F8`).

## Colors

### Hierarchy & Deployment Guidelines

#### Core Chromatic Roles
- **Primary (`#6D5BEF`):** Used exclusively for high-intent affirmative actions (e.g., model deployment, manual block execution), selected navigation states, primary data trends in charts, and active pagination. It must never be applied to large non-interactive backgrounds.
- **Secondary / Lavender Highlight (`#C4B8FF`):** Employed as an informational accent, hover aura on interactive surfaces, boundary fills in privacy distributions, and secondary metric bars.
- **Neutral / Deep Ink (`#2D2A3A`):** The primary color anchor for all headlines, critical data values, and structural framing.

#### Neutral Canvas & Structural Surfaces
To prevent optical fatigue during prolonged surveillance shifts, backgrounds transition across three tightly calibrated tones:
- **`#FFFFFF` (Surface Base):** Canvas for analytical tables, metric cards, modal dialogs, and form inputs.
- **`#F9F9FB` (Surface Subtle):** Main application shell background behind data tables and structural card containers.
- **`#F3F2F8` (Surface Muted):** Table headers, inactive tab rails, disabled fields, and badge backings.

#### Borders & Dividers
- **`#EAE8F2` (Border Subtle):** Standard internal component borders, table row dividers, and input borders.
- **`#E2E0EC` (Border Strong):** Card container outlines, active card states, structural grid borders, and focused elements.

#### Functional & Semantic Status Tokens
These functional markers supersede brand colors when displaying risk conditions and distributed node health:
- **Low Risk / Active Node Sync (`#10B981`):** Indicates stable federated gradient aggregation, normal edge latency, or validated identity.
- **Review Queue / Amber Guard (`#F59E0B`):** Flags borderline model inference probabilities, partition sync delays, or accounts awaiting operator triage.
- **Anomaly High / Fraud Alert (`#EF4444`):** Flags catastrophic risk alerts, out-of-distribution model drifts, connection dropped states, and fraud locks.

## Typography

### Structural Pairings
- **Primary Headline Typeface (`Bebas Neue`):** Chosen for its commanding, high-impact presence and stark geometric cadence across major dashboard titles.
- **Body Typeface (`Comfortaa`):** Applied systematically to all general reading paths, data values, descriptions, and operational text, offering a smooth, modern rounded aesthetic.
- **Technical Label Typeface (`Metrophobic`):** Applied systematically to all raw data metrics, epsilon parameters ($\epsilon$), differential privacy budgets, hashes, ISO timestamps, client identification tokens, and transactional currency amounts. Enables fast vertical visual scanning across columnar tables.

### Rules of Application
1. **Numeric Exclusivity:** All dynamic numerals in tables, dashboard metric cards, charts, and telemetry readouts must use the tabular label family.
2. **Text Case & Hierarchy:** Structural headers use sentence case. Status badges, table headers, and parameter indicators use uppercase label styles (`label-mono-sm`) with a tracking value of `+0.02em`.
3. **Contrast Governance:** High-importance labels (e.g. Risk Probability, Client ID) strictly use `#2D2A3A`. Secondary labels, subtitles, and standard timestamps must use `#9795A5`.

## Layout & Spacing

### Layout Grid Architecture
- **Fluid Structural Grid:** The platform adopts a 12-column layout grid inside main content canvases, maintaining fixed 240px or collapsed 64px structural sidebars.
- **Breakpoints:**
  - `mobile`: `< 768px` (single column, full-bleed data cards, horizontal scrolling for data tables).
  - `tablet`: `768px - 1199px` (stacked metric tiles, two-column form partitions, standard 16px gutter).
  - `desktop`: `≥ 1200px` (full enterprise density, 12-column operational layout, 24px gutter).

### Spacing Philosophy
Interfaces maintain high informational density while avoiding visual clutter through intentional micro-spacing:
- **`space-xs` (4px):** Internal element spacing inside badges, icon-to-text gaps, inline metric tag margins.
- **`space-sm` (8px):** Form control inner padding, table row vertical padding, tight button horizontal padding.
- **`space-md` (12px):** Default input field padding, metric card inner horizontal padding, list item separation.
- **`space-lg` (20px):** Card surface interior padding, flyout panel margins, alert panel internal buffers.
- **`space-xl` (32px):** Section division on marketing pages and major analytical workspace partitions.

## Elevation & Depth

Visual depth is achieved through surgical contrast boundaries and low-opacity atmospheric drop shadows rather than heavy layering:

### 1. Structural Outlines (Primary Separation)
Depth is driven by structural 1px borders (`#EAE8F2` on base surfaces, `#E2E0EC` on floating or prominent containers). Layered surfaces rely on border definition rather than drop shadows to keep data views crisp.

### 2. Ambient Shadow Tokens
Where overlapping elevation is mandatory (e.g., contextual menus, analyst flyouts, floating modals, dragged queue items):
- **Level 1 (Card Baseline):** `0 1px 3px rgba(45, 42, 58, 0.04), 0 1px 2px rgba(45, 42, 58, 0.02)`
- **Level 2 (Dropdown / Popover):** `0 4px 12px rgba(45, 42, 58, 0.06), 0 1px 3px rgba(45, 42, 58, 0.04)`
- **Level 3 (Modal / Security Alert Flyout):** `0 12px 32px rgba(45, 42, 58, 0.08), 0 2px 6px rgba(45, 42, 58, 0.04)`

### 3. Glassmorphic Lavender Tinting
Used exclusively for security alert notices and edge node health callouts:
- Background: `rgba(196, 184, 255, 0.12)`
- Border: `1px solid rgba(109, 91, 239, 0.24)`
- Backdrop Blur: `8px`
This treatment creates instant focal urgency without the alarming footprint of a solid red banner.

## Shapes

### Form Factor & Geometry
The shape language features prominent, pill-like high roundedness (`roundedness: 3`), providing an approachable yet distinctive boundary feel across all interactive controls:
- **Default Elements (`1rem` / 16px):** Form controls, inputs, operational buttons, small status badges, and inline code tags.
- **Container Elements (`2rem` / 32px):** Metric summary cards, analytical table enclosures, modal canvases, security alerts, and node telemetry graphs.
- **Special Radius Exception (`3rem` Max):** High-level application split-screen panels and landing hero cards.

The system embraces substantial curving on functional surfaces to soften heavy enterprise data interfaces.

## Components

### Buttons
- **Primary Action:** Solid `#6D5BEF` background, white text (`#FFFFFF`), `16px` border radius (`rounded-lg`), `0 8px 16px` padding. Transitions on hover to `#5C4AD9` with an ultra-subtle outer ring: `box-shadow: 0 0 0 3px rgba(196, 184, 255, 0.35)`.
- **Secondary / Ghost:** Transparent background, `1px solid #E2E0EC` border, `#2D2A3A` text. Hover state shifts to `#F3F2F8` background with `#6D5BEF` text and border.
- **Destructive Action:** Solid crimson `#EF4444` with `#FFFFFF` text for permanent fraud blocks or client isolation.

### Form Inputs & Checkboxes
- **Input Fields:** `#FFFFFF` background, `1px solid #EAE8F2` border, `16px` radius. Active focus transitions border to `#6D5BEF` and applies a `0 0 0 3px rgba(109, 91, 239, 0.15)` focus ring.
- **Labels:** Displayed directly above the field in `label-mono-md` using `#9795A5`. Floating labels are discouraged in analyst-density views to minimize vertical reflow.
- **Checkboxes & Radios:** `16px × 16px` boxes with `4px` radius. When checked, fill with `#6D5BEF` displaying a sharp white stroke checkmark.

### High-Density Data Tables
- **Header:** Background `#F3F2F8` with a sticky position. Header typography set to `label-mono-sm` in `#9795A5`, tracked uppercase.
- **Rows:** Alternating rows use `#FFFFFF` and `#F9F9FB`. Row height is clamped at `44px` for high-density analysis. Hovering a row applies a light purple tint (`rgba(109, 91, 239, 0.04)`).
- **Metric Cells:** All numbers, IP addresses, partition indices, and model confidence scores render in `Metrophobic`.

### Risk & Status Badges
- **Structure:** `12px` radius, inline-flex, centered alignment, vertical padding `2px`, horizontal padding `8px`.
- **Low Risk / Synced:** Background `rgba(16, 185, 129, 0.1)`, Text `#065F46`, Left `6px` status dot `#10B981`.
- **Review / Pending:** Background `rgba(245, 158, 11, 0.12)`, Text `#92400E`, Left status dot `#F59E0B`.
- **High Anomaly:** Background `rgba(239, 68, 68, 0.12)`, Text `#991B1B`, Left status dot `#EF4444`.

### Security Verification Alerts
- Used within Client and Employee consoles to resolve fraud stops.
- Card built with `32px` radius, background `rgba(196, 184, 255, 0.12)`, and a prominent `1px solid rgba(109, 91, 239, 0.3)`.
- Contains explicit dual human interaction controls: a primary Deep Purple button ("Confirm Identity / Override") paired with a secondary Neutral button ("Confirm Fraudulent").

### Federated Telemetry Readouts (Epsilon $\epsilon$ Slider / Indicators)
- Custom track in `#E2E0EC` with active range highlighted in `#6D5BEF`.
- Dynamic display badge positioned alongside the track featuring real-time differential privacy consumption ($\epsilon = 0.45$) styled in `label-mono-md`.