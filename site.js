const supportedLanguages = ["en", "hu"];
const storedLanguage = window.localStorage.getItem("vitya-language");
let language = supportedLanguages.includes(storedLanguage)
  ? storedLanguage
  : (navigator.language || "en").toLowerCase().startsWith("hu") ? "hu" : "en";

function setLanguage(nextLanguage) {
  language = supportedLanguages.includes(nextLanguage) ? nextLanguage : "en";
  document.documentElement.lang = language;
  window.localStorage.setItem("vitya-language", language);

  document.querySelectorAll("[data-en][data-hu]").forEach((element) => {
    element.textContent = element.dataset[language];
  });

  document.querySelectorAll("[data-lang]").forEach((button) => {
    const active = button.dataset.lang === language;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const title = document.body.dataset[`title${language === "hu" ? "Hu" : "En"}`];
  const description = document.body.dataset[`description${language === "hu" ? "Hu" : "En"}`];
  if (title) document.title = title;
  if (description) document.querySelector('meta[name="description"]')?.setAttribute("content", description);
}

document.querySelectorAll("[data-lang]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

setLanguage(language);
