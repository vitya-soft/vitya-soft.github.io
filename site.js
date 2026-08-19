// Shared language engine for every Markus Viktor / Vitya site.
// Keep this file identical across the four site repositories.
//
// Copy lives in the markup as data attributes:
//   data-en / data-hu / data-pr            -> element text
//   data-aria-en / data-aria-hu / data-aria-pr -> aria-label
//   data-title-*, data-description-*       -> document title and meta description (on <body>)
// "pr" is Pirate English: the same information, told by someone with a parrot.
// Any missing translation falls back to English.
const LANGUAGES = ["en", "hu", "pr"];
const HTML_LANG = { en: "en", hu: "hu", pr: "en-x-pirate" };
const STORAGE_KEY = "vitya-language";

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

const storedLanguage = readStoredLanguage();
let language = LANGUAGES.includes(storedLanguage)
  ? storedLanguage
  : (navigator.language || "en").toLowerCase().startsWith("hu")
    ? "hu"
    : "en";

function pick(dataset, prefix) {
  const suffix = language.charAt(0).toUpperCase() + language.slice(1);
  const key = prefix ? `${prefix}${suffix}` : language;
  const fallback = prefix ? `${prefix}En` : "en";
  return dataset[key] || dataset[fallback];
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
}

document.querySelectorAll("[data-lang]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

setLanguage(language);
