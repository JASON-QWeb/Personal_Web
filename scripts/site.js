(function (window, document) {
  "use strict";

  var config = window.JasonQSiteConfig || {};

  function isSupportedLanguage(language, languages) {
    return languages.indexOf(language) !== -1;
  }

  function normalizeLanguage(language, languages, defaultLanguage) {
    if (isSupportedLanguage(language, languages)) {
      return language;
    }

    if (/^zh/i.test(language || "") && isSupportedLanguage("zh-CN", languages)) {
      return "zh-CN";
    }

    return defaultLanguage;
  }

  function getTranslation(i18n, language, key) {
    var translations = i18n.translations || {};
    var current = translations[language] || {};
    var fallback = translations[i18n.defaultLanguage] || {};

    return current[key] || fallback[key] || "";
  }

  function applyTranslatedAttributes(element, i18n, language) {
    var rules = (element.getAttribute("data-i18n-attr") || "").split(";");

    rules.forEach(function (rule) {
      var parts = rule.split(":");
      var attrName = (parts[0] || "").trim();
      var key = (parts[1] || "").trim();
      var value = getTranslation(i18n, language, key);

      if (attrName && key && value) {
        element.setAttribute(attrName, value);
      }
    });
  }

  function applyLanguage(language) {
    var i18n = config.i18n;

    if (!i18n) {
      return;
    }

    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    document.title = getTranslation(i18n, language, "meta.title");

    var description = document.querySelector('meta[name="description"]');

    if (description) {
      description.setAttribute("content", getTranslation(i18n, language, "meta.description"));
    }

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      var value = getTranslation(i18n, language, element.getAttribute("data-i18n"));

      if (value) {
        element.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(function (element) {
      applyTranslatedAttributes(element, i18n, language);
    });
  }

  function initLanguage() {
    var i18n = config.i18n;

    if (!i18n) {
      return;
    }

    var languages = i18n.languages || [i18n.defaultLanguage];
    var defaultLanguage = i18n.defaultLanguage || languages[0];
    var initialLanguage = normalizeLanguage(defaultLanguage, languages, defaultLanguage);
    var languageToggle = document.querySelector("[data-lang-toggle]");

    applyLanguage(initialLanguage);

    if (!languageToggle) {
      return;
    }

    languageToggle.addEventListener("click", function () {
      var currentLanguage = document.documentElement.dataset.language || initialLanguage;
      var nextLanguage = currentLanguage === "zh-CN" ? "en" : "zh-CN";

      applyLanguage(nextLanguage);
    });
  }

  function syncProjectSections(projects) {
    projects.forEach(function (project) {
      var section = document.querySelector('[data-project="' + project.id + '"]');

      if (!section) {
        return;
      }

      section.dataset.projectOrder = project.order;
      section.dataset.projectTitle = project.title;
    });
  }

  function init() {
    initLanguage();
    syncProjectSections(config.projects || []);

    if (window.JasonQIntro && config.intro) {
      window.JasonQIntro.init(config.intro);
    }
  }

  window.addEventListener("pageshow", function (event) {
    if (event.persisted && window.JasonQIntro && config.intro) {
      window.JasonQIntro.init(config.intro);
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})(window, document);
