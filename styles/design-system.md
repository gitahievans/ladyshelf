---

**Color Tokens**

The palette should feel like warm earth meets luxury gold. Think Nairobi sunset, not European minimalism.

```
-- Brand Core
--color-obsidian: #1A1009       // near-black with warm undertone, primary text & bg
--color-mahogany: #3D1F0D       // deep rich brown, hero backgrounds
--color-bark: #7A4522           // mid brown, accents and hover states
--color-sand: #C9A87C           // warm gold-sand, primary accent
--color-gold: #D4A853           // true gold, CTAs, highlights, links
--color-ivory: #FAF6F0          // warm white, page backgrounds
--color-cream: #F2EAD8          // slightly deeper cream, card backgrounds

-- Semantic
--color-surface: #FAF6F0        // main page background
--color-surface-elevated: #F2EAD8  // cards, modals
--color-border: #E0D5C5         // subtle borders
--color-text-primary: #1A1009   // headings
--color-text-secondary: #5C3D1E // body, descriptions
--color-text-muted: #9C7E5F     // labels, captions, placeholders

-- Feedback
--color-success: #3A6B4A
--color-error: #8B2E2E
--color-warning: #C47F17
```

---

**Fonts** — two from Google Fonts

- **Cormorant Garamond** — headings, editorial moments, the "fashion magazine" voice. Elegant, high-contrast, feels expensive.
- **DM Sans** — body, UI, labels, buttons. Clean, modern, highly legible. Balances Cormorant's drama.

The pairing works like this: Cormorant carries the _feeling_, DM Sans carries the _information_.

---

**Typography Scale**

```
// Display — hero headlines, landing page statements
--text-display-2xl: 96px / line-height 1.0 / Cormorant Garamond 300
--text-display-xl:  72px / line-height 1.05 / Cormorant Garamond 300
--text-display-lg:  56px / line-height 1.1  / Cormorant Garamond 400

// Headings — section titles, page headers
--text-h1: 48px / line-height 1.15 / Cormorant Garamond 600
--text-h2: 36px / line-height 1.2  / Cormorant Garamond 600
--text-h3: 28px / line-height 1.25 / Cormorant Garamond 500
--text-h4: 22px / line-height 1.3  / Cormorant Garamond 500

// Body — DM Sans takes over here
--text-body-lg: 18px / line-height 1.6 / DM Sans 400
--text-body:    16px / line-height 1.6 / DM Sans 400
--text-body-sm: 14px / line-height 1.5 / DM Sans 400

// UI
--text-label:   13px / line-height 1.4 / DM Sans 500 / letter-spacing 0.08em UPPERCASE
--text-caption: 12px / line-height 1.4 / DM Sans 400
--text-price:   20px / line-height 1.2 / DM Sans 600   // prices deserve their own style
```

---

**Spacing Scale**

Base unit is `4px`. Everything is a multiple.

```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
--space-24:  96px
--space-32:  128px

// Section padding (landing page sections)
--section-padding-y: 96px (desktop) / 64px (mobile)
--section-padding-x: 80px (desktop) / 24px (mobile)

// Container max-width
--container-max: 1280px
```

---

**Component Primitives**

These are the raw building blocks before you write a single component:

**Buttons**

```
Primary:   bg gold (#D4A853), text obsidian, no border
           hover → bg bark (#7A4522), text ivory
           padding: 14px 32px, border-radius: 2px (sharp, not bubbly)

Secondary: bg transparent, border 1px gold, text gold
           hover → bg gold, text obsidian

Ghost:     bg transparent, no border, text sand, underline on hover

// All buttons: DM Sans 500, 13px, letter-spacing 0.1em, UPPERCASE
```

**Cards (Product)**

```
bg: cream (#F2EAD8)
border: 1px solid --color-border
border-radius: 4px
image aspect ratio: 3:4 (portrait — fashion standard)
hover: subtle lift → box-shadow: 0 8px 32px rgba(26,16,9,0.12)
       + image scales to 1.03
```

**Badges / Tags**

```
Category tag: bg mahogany, text ivory, 11px DM Sans 500, uppercase, letter-spacing 0.1em
Sale badge:   bg gold, text obsidian, same sizing
New badge:    bg obsidian, text ivory
```

**Inputs**

```
border: 1px solid --color-border
border-radius: 2px
focus: border-color gold, no box-shadow glow (keep it clean)
bg: ivory
padding: 12px 16px
font: DM Sans 400 16px text-secondary
```

**Navbar**

```
bg: obsidian (#1A1009) or transparent-over-hero that transitions to obsidian on scroll
text: ivory
active/hover: gold
height: 72px desktop / 60px mobile
```

---

**The overall feel in one sentence:** _Dark and warm at rest, gold when alive._ The obsidian and mahogany create weight and luxury, the gold draws the eye exactly where you want it, and the ivory/cream gives breathing room so it never feels heavy.
