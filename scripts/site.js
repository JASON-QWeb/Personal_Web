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

    syncShowcaseWindowTitles();
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

  function initScrollChrome() {
    var root = document.documentElement;
    var mobileQuery = window.matchMedia("(max-width: 640px)");
    var desktopQuery = window.matchMedia("(min-width: 641px)");
    var projectSections = Array.prototype.slice.call(document.querySelectorAll('[data-section="project"]'));
    var finalSection = projectSections[projectSections.length - 1];
    var lightProjectIds = {
      codezero: true,
      purrpilot: true,
      "table-data-clean": true
    };
    var ticking = false;

    function syncState() {
      var isMobileScrolled = mobileQuery.matches && window.scrollY > 18;
      var isFinalSectionActive = false;
      var activeProjectId = "";
      var headerProbeY = Math.min(84, window.innerHeight * .14);

      projectSections.some(function (section) {
        var rect = section.getBoundingClientRect();
        var isAtHeader = rect.top <= headerProbeY && rect.bottom > headerProbeY;

        if (isAtHeader) {
          activeProjectId = section.getAttribute("data-project") || "";
        }

        return isAtHeader;
      });

      if (desktopQuery.matches && finalSection) {
        var rect = finalSection.getBoundingClientRect();
        var page = document.documentElement;
        var isNearPageEnd = window.scrollY + window.innerHeight >= page.scrollHeight - 24;

        isFinalSectionActive = isNearPageEnd || (rect.top <= window.innerHeight * .52 && rect.bottom > window.innerHeight * .2);
      }

      root.classList.toggle("is-mobile-scrolled", isMobileScrolled);
      root.classList.toggle("is-final-section-active", isFinalSectionActive);
      root.classList.toggle("is-light-section-active", !!lightProjectIds[activeProjectId]);
      ticking = false;
    }

    function requestSync() {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(syncState);
    }

    syncState();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener("change", requestSync);
      desktopQuery.addEventListener("change", requestSync);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(requestSync);
      desktopQuery.addListener(requestSync);
    }
  }

  function loadShowcaseMedia(panel) {
    if (!panel) {
      return;
    }

    var images = Array.prototype.slice.call(panel.querySelectorAll("[data-demo-src]"));

    if (!images.length || images.every(function (image) {
      return image.dataset.mediaLoaded === "true";
    })) {
      return;
    }

    var pending = 0;
    var hasError = false;

    function completeImage(isError) {
      hasError = hasError || isError;
      pending -= 1;

      if (pending > 0) {
        return;
      }

      panel.classList.remove("is-media-loading");
      panel.classList.toggle("is-media-error", hasError);
      panel.classList.toggle("is-media-loaded", !hasError);
    }

    images.forEach(function (image) {
      var source = image.getAttribute("data-demo-src");

      if (!source || image.dataset.mediaLoaded === "true") {
        return;
      }

      pending += 1;
      image.setAttribute("loading", "eager");
      image.addEventListener("load", function () {
        image.dataset.mediaLoaded = "true";
        completeImage(false);
      }, { once: true });

      image.addEventListener("error", function () {
        completeImage(true);
      }, { once: true });

      image.setAttribute("src", source);
    });

    if (!pending) {
      return;
    }

    panel.classList.add("is-media-loading");
  }

  function scheduleAfterIntroStart(callback, timeoutMs) {
    var intro = config.intro || {};
    var loadedClass = intro.loadedClass || "is-loaded";
    var delay = typeof intro.projectPreloadDelayMs === "number" ? intro.projectPreloadDelayMs : 360;
    var didSchedule = false;

    function schedule() {
      if (didSchedule) {
        return;
      }

      didSchedule = true;

      window.setTimeout(function () {
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(callback, { timeout: timeoutMs || 2200 });
        } else {
          window.setTimeout(callback, 320);
        }
      }, delay);
    }

    if (document.documentElement.classList.contains(loadedClass)) {
      schedule();
      return;
    }

    window.addEventListener("jasonq:intro-start", schedule, { once: true });
  }

  function scheduleDuringIntro(callback, timeoutMs) {
    scheduleAfterIntroStart(callback, timeoutMs);
  }

  function updateShowcaseWindowTitle(showcase, panel) {
    var title = showcase.querySelector("[data-showcase-window-title]");
    var titleKey = panel && panel.getAttribute("data-showcase-title-key");
    var language = document.documentElement.dataset.language || (config.i18n && config.i18n.defaultLanguage);

    if (title && titleKey && config.i18n) {
      title.textContent = getTranslation(config.i18n, language, titleKey);
    }
  }

  function syncShowcaseWindowTitles() {
    document.querySelectorAll("[data-project-showcase]").forEach(function (showcase) {
      updateShowcaseWindowTitle(showcase, showcase.querySelector("[data-showcase-panel].is-active"));
    });
  }

  function scheduleShowcaseMediaPreload(showcase) {
    scheduleDuringIntro(function () {
      showcase.querySelectorAll("[data-showcase-panel]").forEach(loadShowcaseMedia);
    }, 2400);
  }

  function initLazyProjectBackgrounds() {
    scheduleDuringIntro(function () {
      document.querySelectorAll("[data-lazy-project-bg]").forEach(function (section) {
        section.classList.add("is-project-assets-ready");
      });
    }, 2200);
  }

  function initProjectShowcase() {
    document.querySelectorAll("[data-project-showcase]").forEach(function (showcase) {
      var section = showcase.closest("[data-section]");
      var controlsRoot = section || document;
      var controls = Array.prototype.slice.call(controlsRoot.querySelectorAll("[data-showcase-tab]"));
      var panels = Array.prototype.slice.call(showcase.querySelectorAll("[data-showcase-panel]"));

      function activateShowcase(targetId, shouldLoadMedia) {
        var activePanel = null;

        controls.forEach(function (control) {
          var isActive = control.getAttribute("data-showcase-tab") === targetId;

          control.classList.toggle("is-active", isActive);
          control.setAttribute("aria-pressed", isActive ? "true" : "false");
        });

        panels.forEach(function (panel) {
          var isActive = panel.getAttribute("data-showcase-panel") === targetId;

          panel.classList.toggle("is-active", isActive);
          panel.hidden = !isActive;
          panel.setAttribute("aria-hidden", isActive ? "false" : "true");

          if (isActive) {
            activePanel = panel;
          }
        });

        updateShowcaseWindowTitle(showcase, activePanel);

        if (shouldLoadMedia) {
          loadShowcaseMedia(activePanel);
        }
      }

      controls.forEach(function (control) {
        control.addEventListener("click", function () {
          activateShowcase(control.getAttribute("data-showcase-tab"), true);
        });
      });

      var activePanel = showcase.querySelector("[data-showcase-panel].is-active") || panels[0];

      if (activePanel) {
        activateShowcase(activePanel.getAttribute("data-showcase-panel"), false);
      }

      scheduleShowcaseMediaPreload(showcase);
    });
  }

  function init() {
    initLanguage();
    syncProjectSections(config.projects || []);
    initLazyProjectBackgrounds();
    initProjectShowcase();
    initScrollChrome();

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
