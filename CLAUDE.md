# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static marketing/lead-generation site for "Tlapky ven" — a dog-walking service run by Daniela Stoklasová (operated legally under ANIMAL PLANET s.r.o.). Single-page site, Czech language, vanilla HTML/CSS/JS with no build step, no package manager, and no framework.

`kontext.md` is the original client brief (positioning, tone of voice, required/forbidden content, section-by-section copy direction). Treat it as the source of truth for content decisions — in particular, section 17 lists facts that must never be invented (prices beyond what's already decided, operating hours, max travel distance beyond the printed surcharge table, certifications, insurance, references, etc.). Only add such facts if the user supplies them explicitly in conversation.

## Running locally

No build tooling. Serve the directory with any static file server and open it, e.g.:

```bash
python3 -m http.server 8765
```

Then visit `http://localhost:8765/`. Editing `index.html`, `css/style.css`, or `js/main.js` takes effect on reload — no compile/watch step.

## Architecture

**Files:**
- `index.html` — entire page, one-page site with anchor-linked sections (`#uvod`, `#jak-to-funguje`, `#sluzby`, `#o-mne`, `#pristup`, `#kde-vencim`, `#faq`, `#kontakt`, etc.)
- `css/style.css` — all styles, single file, organized by section with comment headers matching the HTML sections
- `js/main.js` — single IIFE containing independent feature blocks (mobile nav, scroll-spy, FAQ accordion, gallery lightbox); no module system, no dependencies
- `assets/images/` — optimized site images (paired `.jpg` + `.webp`, served via `<picture>`), already cropped/resized for their specific placement — don't reuse one image's asset for a different layout slot without re-cropping
- `assets/icons/favicon.svg`

**Design tokens:** all colors, spacing, radii, and shadows are CSS custom properties defined once in `:root` at the top of `css/style.css`. The palette is derived from the brand logo (warm monochromatic browns/tans — no green, no saturated red). When changing a color, change the token, not individual rules; grep for hardcoded `rgba(...)` literals before introducing a new color, since a few shadow/overlay values are intentionally-matched literals rather than token references.

**Content/legal constraints baked into the markup:**
- The contact section (`#kontakt`) is a direct `tel:` call-to-action, not a form — this was an explicit decision (no lead-capture form on this site).
- Footer shows both the public-facing person (Daniela Stoklasová) and the legal operator (ANIMAL PLANET s.r.o., IČO, registered address, obchodní rejstřík entry) — both must stay consistent with each other across header, footer, and copyright line if edited.
- Pricing: only the distance-based travel surcharge table (in the Služby section) is real/decided; base walk pricing is intentionally left as "cenu domluvíme podle..." and must not be invented.
- Tone of voice is formal "vykání" throughout, warm but not infantile, no em/en dashes in copy (replaced with commas or split sentences per prior edit), "pejskovi" preferred over "psovi" in body copy.

**Gallery lightbox pattern:** images that should be clickable-to-enlarge use a `<button class="gallery-trigger" data-full="..." data-full-webp="...">` wrapping a `<picture>`; `js/main.js` wires all `.gallery-trigger` elements to a single shared `#lightbox` overlay at the end of `<body>`. Follow this pattern when adding new enlargeable images rather than creating a one-off lightbox instance.
