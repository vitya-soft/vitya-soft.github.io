# vitya-soft.github.io

Vitya Soft landing page for production systems.

## Featured system

- HOME — Home Operations & Maintenance Engine

Static HTML, CSS and JavaScript, ready for GitHub Pages.

## Languages

Every page is trilingual: English, Hungarian and — for fun — Pirate English.
Copy lives in `data-en` / `data-hu` / `data-pr` attributes (plus `data-title-*`,
`data-description-*` on `<body>` and `data-aria-*` for `aria-label`s), and the
switch in the header is driven by `site.js`. English is the fallback for any
missing translation, and `site.js` is kept byte-identical in all four site
repositories.

The four sites are four separate origins, so `localStorage` cannot carry the
chosen language between them. Links to a sibling site are rewritten to carry a
`?lang=` parameter, which the target page adopts on load and then removes from
the address bar.

Pirate English also swaps the artwork: an `<img>` carrying `data-logo-pr` shows
its pirate mascot in that language and returns to the original logo in English
and Hungarian.

Translations have different lengths, so `site.js` measures every translated
element in all three languages once the page has loaded and reserves the
largest box it needs — width for anything sitting in a horizontal row,
height for everything else. Switching languages therefore never moves the
layout. The measurement is repeated after the webfonts settle and after a
viewport resize.
