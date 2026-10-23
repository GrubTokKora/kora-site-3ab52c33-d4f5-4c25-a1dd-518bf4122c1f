# Curry and Grill — design notes

Family-run Indian restaurant, 722 W National Rd, Vandalia OH. Rebuilt from the Wix site currysgrill.com (2026-10).

## Palette
- Maroon `#8F1402` — brand colour from the original site: hero, page heroes, CTA bands, buttons, prices, eyebrows.
- Espresso `#2B1411` — top bar, buffet and reviews bands, call cards, footer.
- Brass `#B8862F` / soft brass `#D9B878` — hairlines, stars, quote marks, step numbers. Never small body text on cream.
- Cream `#FFFCF4` page ground, parchment `#F4E8D2` alternate bands, ink `#241A17`, muted `#6A5E58`.
- Logo red `#ED1C24` is reserved for the original logo file; the site uses maroon/cream recolours of the namaste-lady PNG.

## Type
- Headings: DM Serif Display (single weight 400 + italic; `font-synthesis: none` so no rule can fake a bold).
- Body: DM Sans.
- Accent: none as a separate family. The wordmark "Curry & Grill" and short accent lines ("Namaste",
  "Tuesday to Sunday") use DM Serif Display Italic.
- History (2026-10-23, owner's picks from rendered comparisons): Bodoni Moda + Pinyon Script (hairlines too thin,
  script too ornate) -> Fraunces (letterforms too curvy) -> DM Serif Display + DM Sans.
- Fonts are self-hosted by Kora through the `<!-- kora:fonts -->` region; no Google Fonts links.

## Composition
- Mughal-arch photo frames (`--arch`) on one image per section, a brass outline offset behind the hero arch.
- Menu typography: dotted leaders between dish name and price, brass rules after section titles.
- Square buttons (2px radius), uppercase tracked labels.
- Subtle dot texture on maroon bands; no gradients, no glassmorphism.

## Content rules
- Facts come from the original site, the Google Business Profile and the owner's own photos only. No invented policies (walk-ins, high chairs, gift-card terms).
- Reservations, gift cards and online orders are information pages with phone CTAs (Wix apps replaced; owner decision 2026-10-23).
- Reviews are verbatim Google reviews, author as first name + initial.
- The menu lives in Kora config `menus`; `menus.html` carries an empty `kora:data:menu layout="tabs"` region filled at deploy.

## Motion
- `.rv` reveal (fade + 22px rise) via IntersectionObserver; disabled for reduced motion.
- Mobile menu: full-screen clip-path wipe below the sticky header.
