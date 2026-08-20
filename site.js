// Shared language engine for every Markus Viktor / Vitya site.
// Keep this file identical across the four site repositories.
//
// Copy lives in the markup as data attributes:
//   data-en / data-hu / data-pr            -> element text
//   data-aria-en / data-aria-hu / data-aria-pr -> aria-label
//   data-title-*, data-description-*       -> document title and meta description (on <body>)
//   data-logo-pr (on <img>)                -> the pirate-mode version of a logo
// "pr" is Pirate English: the same information, told by someone with a parrot.
// Any missing translation falls back to English.
//
// The four sites live on four different origins, so localStorage cannot carry
// the choice between them. Links pointing at a sibling site therefore get a
// ?lang= parameter, and a page opened with that parameter adopts it before
// anything is rendered.
const LANGUAGES = ["en", "hu", "pr"];
const HTML_LANG = { en: "en", hu: "hu", pr: "en-x-pirate" };
const STORAGE_KEY = "vitya-language";
const LANG_PARAM = "lang";
const FAMILY_HOSTS = [
  "markusviktor.github.io",
  "vitya-labs.github.io",
  "vitya-games.github.io",
  "vitya-soft.github.io",
];

// Translations have different lengths, which would move the layout on every
// switch. Every translated element therefore reserves the height of its
// tallest translation, and elements sitting in a horizontal row (navigation,
// buttons, tags, inline labels) reserve the width of their widest one too.
const WIDTH_LOCKED = [
  ".topnav a",
  ".landing-nav a",
  ".footer-links a",
  ".landing-footer a",
  ".back",
  ".button",
  ".text-link",
  ".tag",
  ".hero-facts li",
  ".store-badge small",
  ".panel-top span",
  ".contact span",
  ".meta a",
  ".card p strong",
  ".project-teaser > *",
].join(", ");

function readStoredLanguage() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function storeLanguage(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch (error) {
    /* private mode: the choice simply does not persist */
  }
}

function requestedLanguage() {
  const value = new URLSearchParams(window.location.search).get(LANG_PARAM);
  return LANGUAGES.includes(value) ? value : null;
}

// Keep the address bar clean: the parameter is a handover, not part of the URL.
function stripLanguageParam() {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(LANG_PARAM)) return;
    url.searchParams.delete(LANG_PARAM);
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  } catch (error) {
    /* replaceState is unavailable (file://): the parameter simply stays */
  }
}

function detectLanguage() {
  const requested = requestedLanguage();
  if (requested) return requested;

  const stored = readStoredLanguage();
  if (LANGUAGES.includes(stored)) return stored;

  return (navigator.language || "en").toLowerCase().startsWith("hu") ? "hu" : "en";
}

let language = detectLanguage();

function pick(dataset, prefix, lang) {
  const suffix = lang.charAt(0).toUpperCase() + lang.slice(1);
  const key = prefix ? `${prefix}${suffix}` : lang;
  const fallback = prefix ? `${prefix}En` : "en";
  return dataset[key] || dataset[fallback];
}

function translatedElements() {
  return document.querySelectorAll("[data-en]");
}

function applyCopy(lang) {
  translatedElements().forEach((element) => {
    const copy = pick(element.dataset, "", lang);
    if (copy) element.textContent = copy;
  });

  document.querySelectorAll("[data-aria-en]").forEach((element) => {
    const copy = pick(element.dataset, "aria", lang);
    if (copy) element.setAttribute("aria-label", copy);
  });

  const title = pick(document.body.dataset, "title", lang);
  const description = pick(document.body.dataset, "description", lang);
  if (title) document.title = title;
  if (description) {
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }
}

function swapLogos() {
  document.querySelectorAll("img[data-logo-pr]").forEach((image) => {
    if (!image.dataset.logoDefault) image.dataset.logoDefault = image.getAttribute("src");
    const next = language === "pr" ? image.dataset.logoPr : image.dataset.logoDefault;
    if (image.getAttribute("src") !== next) image.setAttribute("src", next);
  });
}

function handOverLanguage() {
  document.querySelectorAll("a[href]").forEach((link) => {
    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return;
    }
    if (url.host === window.location.host || !FAMILY_HOSTS.includes(url.host)) return;
    url.searchParams.set(LANG_PARAM, language);
    link.href = url.toString();
  });
}

// Reserve the largest box each translated element needs in any language, so
// the page keeps its geometry when the language changes. Measurement writes
// every element first and reads afterwards, so each language costs one layout.
function isInline(element) {
  return window.getComputedStyle(element).display === "inline";
}

// An inline element cannot reserve a box of its own, so the nearest block
// around it (the paragraph holding a link, for example) is reserved instead.
function lockTargets() {
  const targets = [];
  translatedElements().forEach((element) => {
    let target = element;
    if (target.matches(WIDTH_LOCKED)) {
      // a link or label inside a line of text needs a box before it can hold one
      if (isInline(target)) target.style.display = "inline-block";
    } else {
      while (target && isInline(target)) target = target.parentElement;
    }
    if (target && target !== document.body && !targets.includes(target)) targets.push(target);
  });
  return targets;
}

function lockLayout() {
  const elements = lockTargets();
  if (!elements.length) return;

  elements.forEach((element) => {
    element.style.minWidth = "";
    element.style.minHeight = "";
  });

  // Two passes: the first reserves each box on its own, the second accounts
  // for the slightly different layout those reservations produce together.
  for (let pass = 0; pass < 2; pass += 1) {
    const widths = new Array(elements.length).fill(0);
    const heights = new Array(elements.length).fill(0);

    LANGUAGES.forEach((lang) => {
      applyCopy(lang);
      elements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        widths[index] = Math.max(widths[index], rect.width);
        heights[index] = Math.max(heights[index], rect.height);
      });
    });

    elements.forEach((element, index) => {
      element.style.minHeight = `${Math.ceil(heights[index])}px`;
      if (element.matches(WIDTH_LOCKED)) element.style.minWidth = `${Math.ceil(widths[index])}px`;
    });
  }

  applyCopy(language);
}

function setLanguage(nextLanguage) {
  language = LANGUAGES.includes(nextLanguage) ? nextLanguage : "en";
  document.documentElement.lang = HTML_LANG[language];
  storeLanguage(language);

  applyCopy(language);

  document.querySelectorAll("[data-lang]").forEach((button) => {
    const active = button.dataset.lang === language;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  swapLogos();
  handOverLanguage();
}

document.querySelectorAll("[data-lang]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

setLanguage(language);
stripLanguageParam();
lockLayout();

// Fonts and a resized viewport both change how the copy wraps, so the reserved
// boxes are measured again once they settle.
if (document.fonts && document.fonts.ready) document.fonts.ready.then(lockLayout);

let resizeTimer = 0;
let lockedWidth = window.innerWidth;
window.addEventListener("resize", () => {
  if (window.innerWidth === lockedWidth) return;
  lockedWidth = window.innerWidth;
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(lockLayout, 150);
});
