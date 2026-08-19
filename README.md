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
