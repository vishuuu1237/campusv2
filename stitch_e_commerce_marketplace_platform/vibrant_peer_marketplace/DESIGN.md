---
name: Vibrant Peer Marketplace
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464554'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#5148d7'
  primary: '#2a14b4'
  on-primary: '#ffffff'
  primary-container: '#4338ca'
  on-primary-container: '#c1beff'
  inverse-primary: '#c3c0ff'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#00423c'
  on-tertiary: '#ffffff'
  tertiary-container: '#005c54'
  on-tertiary-container: '#69d6c9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#372abf'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-compact: 1rem
  margin: 2.5rem
  margin-compact: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system targets modern peer-to-peer commerce, connecting independent buyers and verified sellers through a clear, transparent, and energetic platform.

The design movement merges Modern Corporate utility with high-energy marketplace vibrancy:
- **Trustworthy & Authoritative:** Structured hierarchy, precise alignments, balanced typography, and deliberate contrast eliminate friction and build financial security.
- **Vibrant & Dynamic:** Expressive primary indigo paired with energetic amber accents inject life, high discoverability, and visual rhythm into listings and interactions.
- **Surface Crispness:** Neutral slate foundations and micro-borders ensure content legibility across dense commerce workflows while maintaining an open, contemporary desktop presence.

## Colors

The palette establishes an immediate balance of institutional safety and commercial vitality:

- **Primary (`#4338CA` - Royal Indigo):** Serves as the primary operational hue, driving core navigational anchors, main transactional triggers, verification badges, and primary interactive states.
- **Secondary (`#F59E0B` - Energetic Amber):** Highlights urgent marketplace events, promo callouts, star ratings, flash offers, and contextual counter-actions without breaking visual trust.
- **Tertiary (`#0D9488` - Deep Teal):** Handles positive financial balance displays, verified transaction confirmations, and secondary metrics.
- **Neutral (`#64748B` - Slate Neutral):** Underpins text hierarchy, ghost boundaries, dividers, and surface tiers. Backgrounds anchor in cool off-whites (`#F8FAFC` canvas, `#FFFFFF` surface), keeping visual fatigue minimal during extensive catalog browsing.

## Typography

The type scale bifurcates roles between expressive structure and utilitarian speed:

- **Display & Headlines (`Plus Jakarta Sans`):** Carries structural presence with rounded geometry and confident weights (`600`, `700`, `800`). Negative letter-spacing keeps marketplace collection headers, product titles, and hero prompts punchy and legible.
- **Body & Labels (`Inter`):** Delivers clean readability across dense listings, pricing tables, chat threads, transaction histories, and form fields.
- **Monospace accents (when displaying transaction IDs, escrow codes, or wallet keys):** Render via native tabular numerals within `Inter` using `font-feature-settings: "tnum" on, "cv05" on`.

## Layout & Spacing

The layout philosophy uses a disciplined 12-column responsive fluid grid designed specifically for desktop commerce throughput:

- **Desktop Standard (1280px - 1440px+):** 12 columns, `gutter: 1.5rem` (24px), max-width container capped at `1360px` with `margin: 2.5rem` (40px) outer clearance.
- **Compact Desktop / Small Screen (1024px - 1279px):** 12 columns, `gutter-compact: 1rem` (16px), `margin-compact: 1.5rem` (24px) outer margin.
- **Rhythm Scale:** Increments align strictly to an 8px base grid, utilizing `0.25rem` (4px) as a half-step for micro-alignments, tag internal padding, and badge clearances.
- **Commerce Arrangement:** Primary feed utilizes a 4-column card grid (spanning 3 columns each), filtering sidebars occupy a 3-column persistent sticky rail, and product detail canvases deploy an asymmetric 7-column gallery / 5-column purchase escrow pane.

## Elevation & Depth

Visual hierarchy combines low-contrast structural borders with soft, slate-tinted ambient drop shadows:

- **Base Ground:** Canvas sits at `#F8FAFC`. Base containers and listing panels sit on pure `#FFFFFF`.
- **Borders as Structure:** Every elevation layer utilizes a crisp `1px` border of `rgba(100, 116, 139, 0.12)` to maintain definition across varied monitor color gamuts.
- **Level 1 (Resting Cards & Filters):** `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Hovered Cards & Dropdowns):** `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Level 3 (Modals, Checkout Panels & Sticky Navbars):** `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.
- **Elevated Interactive Focus:** On keyboard navigation or input focus, shadows collapse in favor of an energetic `0 0 0 3px rgba(67, 56, 202, 0.2)` ring.

## Shapes

The interface adopts a balanced `Rounded` language (`roundedness: 2`), reflecting tactile approachability while remaining strictly geometric and clean:

- **Micro elements (Badges, Avatars, Checkboxes):** `0.375rem` (6px) to `0.5rem` (8px).
- **Controls & Form Inputs:** `0.5rem` (8px) corner radius.
- **Marketplace Cards & Surface Containers:** `0.75rem` (12px) to `1rem` (16px) corner radius (`rounded-lg`), delivering comfortable enclosure for high-resolution product imagery.
- **Status Tags & Pill Pills:** Pill radius `9999px` reserved exclusively for live presence tags, auction countdown chips, and trust metrics.

## Components

### Buttons
- **Primary:** Background `#4338CA`, foreground `#FFFFFF`, font `label-lg`, radius `0.5rem`. Hover shifts to `#3730A3` with subtle translateY(-1px).
- **Secondary / Action Accent:** Background `#F59E0B`, text `#78350F` or `#FFFFFF` (for high-urgency callouts like "Make Offer"). Hover `#D97706`.
- **Outline / Ghost:** Border `1px solid rgba(100, 116, 139, 0.25)`, background `transparent`, text `#0F172A`. Hover background `rgba(241, 245, 249, 0.7)`.

### Marketplace Listing Cards
- Built with a `#FFFFFF` surface, `1px solid rgba(100, 116, 139, 0.12)`, radius `0.75rem`, and Level 1 elevation.
- 1:1 or 4:3 aspect ratio image container at top with an overflow-hidden mask.
- Header row inside padding contains seller trust score (`label-sm`, tertiary teal highlight), item title in `headline-sm`, and bold indigo price in `headline-md`.

### Form Controls & Search Input
- **Global Search:** Prominent desktop input field (height 48px) with inset search icon, shortcut hint chip (`⌘K`), border `1px solid rgba(100, 116, 139, 0.2)`, background `#FFFFFF`. Active focus transitions border to `#4338CA` and applies a 3px primary ring.
- **Text Inputs & Dropdowns:** Minimum 40px height, placeholder text in `#94A3B8`, standard label positioned above in `label-md`.

### Chips & Filter Tags
- Height 32px, padding `0 12px`, radius `9999px`.
- Inactive: Background `#F1F5F9`, text `#475569`, border `1px solid transparent`.
- Active: Background `rgba(67, 56, 202, 0.08)`, text `#4338CA`, border `1px solid rgba(67, 56, 202, 0.3)`.

### Selection Controls (Checkboxes & Radios)
- Checkbox size `18px × 18px`, radius `4px`. Radio size `18px × 18px`, circular.
- Border `1.5px solid #94A3B8`. Checked state fills `#4338CA` with crisp white inner icon.

### Trust & Verification Badges
- Inline compact horizontal pill (`height: 22px`, `padding: 0 8px`) displaying an icon and `label-sm`.
- Escrow Secured / ID Verified uses soft teal tint (`bg: rgba(13, 148, 136, 0.1)`, `text: #0F766E`). Top Seller uses amber tint (`bg: rgba(245, 158, 11, 0.1)`, `text: #B45309`).