// Shared language engine for every Markus Viktor / Vitya site.
// Keep this file identical across the four site repositories.
//
// Copy lives in the markup as data attributes:
//   data-en / data-hu / data-pr            -> element text
//   data-aria-en / data-aria-hu / data-aria-pr -> aria-label
//   data-title-*, data-description-*       -> document title and meta description (on <body>)
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

function pick(dataset, prefix) {
  const suffix = language.charAt(0).toUpperCase() + language.slice(1);
  const key = prefix ? `${prefix}${suffix}` : language;
  const fallback = prefix ? `${prefix}En` : "en";
  return dataset[key] || dataset[fallback];
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

function setLanguage(nextLanguage) {
  language = LANGUAGES.includes(nextLanguage) ? nextLanguage : "en";
  document.documentElement.lang = HTML_LANG[language];
  storeLanguage(language);

  document.querySelectorAll("[data-en]").forEach((element) => {
    const copy = pick(element.dataset, "");
    if (copy) element.textContent = copy;
  });

  document.querySelectorAll("[data-aria-en]").forEach((element) => {
    const copy = pick(element.dataset, "aria");
    if (copy) element.setAttribute("aria-label", copy);
  });

  document.querySelectorAll("[data-lang]").forEach((button) => {
    const active = button.dataset.lang === language;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const title = pick(document.body.dataset, "title");
  const description = pick(document.body.dataset, "description");
  if (title) document.title = title;
  if (description) {
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }

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
