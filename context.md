# context.md — Wahi Fashion Brand & UX Context

> This file tells you WHY decisions were made.
> Read this before building any UI. It is the difference between generic and Wahi.

---

## The Brand

**Wahi Fashion** is a premium women's fashion boutique located on Lumumba Drive, Roysambu, Nairobi, Kenya. Founded to serve a gap in the Nairobi market — a woman who wants quality without breaking the bank, and style that speaks to her full lifestyle.

**Tagline:** _More than fashion. A lifestyle._
**Secondary voice:** _You are what you wear._
**Brand promise:** Premium fashion meets accessibility. Luxurious, personal, always on trend.

---

## The Customer

She is not one-dimensional. She is the same woman who:

- Walks into a boardroom at 8am in a structured blazer
- Meets friends for brunch in a linen dress on Saturday
- Celebrates in a velvet jumpsuit on Friday night
- Wears her ankara with quiet, unshakeable pride

She is educated, employed, confident, and has taste. She does not want to be talked down to. She wants to be seen. She is the main character of her own story and she dresses accordingly.

**She does not dress for the job she has. She dresses for the story she is writing.**

---

## The Emotional Goals of the Website

When a visitor lands on the Wahi Fashion site, she should feel:

1. **Desire** — she should want what she sees immediately
2. **Recognition** — this site was built for her, not a generic "African woman"
3. **Trust** — this is a real, premium brand, not a market stall with a website
4. **Ease** — finding what she wants should feel effortless, not like work
5. **Pride** — the African identity on this site should feel celebrated, not tokenized

The site should make her want to stay longer. Every scroll should reveal something worth stopping for.

---

## Visual Identity

### Mood

Dark and warm at rest. Gold when alive.

The palette — obsidian, mahogany, bark, sand, gold, ivory, cream — evokes:

- The warmth of Nairobi sunset
- The richness of African earth tones
- The sophistication of luxury editorial fashion
- NOT European minimalism. NOT generic "African print" stereotypes.

### Typography Personality

- **Cormorant Garamond** carries the _feeling_: editorial, expensive, confident, feminine
- **DM Sans** carries the _information_: clear, modern, never in the way

Headlines should feel like a fashion magazine. Body copy should be effortless to read.

### Photography Direction (for mock data context)

All product images are fashion-forward, well-lit, and feature Black women. The photography is editorial in quality. When building image containers, always honour the 3:4 portrait ratio for products — this is a fashion industry standard and it makes products look premium.

---

## UX Philosophy

### "Evokes Desire" Principle

Every UI decision should be evaluated against: _does this make her want the product more?_

- Large, portrait product images. Never tiny thumbnails.
- Generous whitespace that lets the product breathe.
- Gold accents draw the eye exactly where the action is (CTAs, prices, highlights).
- Smooth, confident animations — nothing jumpy or cheap-feeling.

### "Stay Longer" Principle

The site should reward exploration.

- The landing page should flow like a magazine editorial, not a homepage checklist.
- Product cards should hint at depth — a subtle hover reveals more.
- Related products on the detail page should feel curated, not algorithmic.
- The brand story section should feel like it was written by a human who cares, not a marketing team.

### Mobile-First is Non-Negotiable

The primary customer browses on her phone. The mobile experience is the experience. Desktop is an enhancement, not the base.

- Touch targets minimum 44px
- Bottom navigation patterns for mobile where appropriate
- Swipeable carousels, not pagination
- Filter/sort as bottom sheets on mobile, sidebar on desktop

### The Checkout Must Be Frictionless

She should be able to go from product detail to order confirmed in as few taps as possible.

- Guest checkout must be offered prominently — not hidden
- M-Pesa as the primary payment option (this is Kenya)
- Delivery address uses Kenyan counties and towns
- Order confirmation should feel like a moment worth celebrating

---

## Content Voice & Tone

When you write any copy in the UI (button labels, empty states, error messages, placeholder text) — write in the Wahi voice:

- **Confident, not arrogant**
- **Warm, not casual**
- **Editorial, not corporate**
- **Direct, not verbose**

### Examples

| Context            | Generic (Wrong)      | Wahi Voice (Right)                                |
| ------------------ | -------------------- | ------------------------------------------------- |
| Empty cart         | "Your cart is empty" | "Your cart is ready for something great."         |
| Add to cart button | "Add to Cart"        | "Add to Bag"                                      |
| Out of stock       | "Out of stock"       | "Sold out — more coming soon."                    |
| Search no results  | "No results found"   | "Nothing found for that. Try a different search." |
| Loading products   | "Loading..."         | "Curating your selection..."                      |
| Register CTA       | "Create Account"     | "Join Wahi"                                       |
| Login              | "Login"              | "Welcome Back"                                    |
| Order confirmed    | "Order placed"       | "Order confirmed. It's on its way to you."        |

---

## What This Site Is NOT

- Not a marketplace. This is a single-brand boutique.
- Not a generic WooCommerce template. Every page should feel intentional.
- Not minimalist-sterile. Warmth and richness are features, not bugs.
- Not trying to look like Zara or H&M. Wahi has its own identity.
- Not an afterthought on mobile. Mobile is the primary experience.

---

## Cultural Context

Wahi Fashion celebrates African heritage without exoticizing it. The traditional African wear category is presented with the same editorial respect as the office wear or party wear categories. There is no hierarchy of culture here — the kitenge wrap skirt and the power blazer sit side by side as equals.

The gold accents, earth tones, and editorial photography all draw from the richness of East African visual culture. This should feel like it could only come from Nairobi — not like an African theme applied to a Western template.
