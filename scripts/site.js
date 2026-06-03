var mediaSources = {
  "codezero-issue": {
    webm: new URL("../assets/media/codezero/issue-to-plan.webm", import.meta.url).href,
    mp4: new URL("../assets/media/codezero/issue-to-plan.mp4", import.meta.url).href
  },
  "codezero-pr": {
    webm: new URL("../assets/media/codezero/plan-to-pr.webm", import.meta.url).href,
    mp4: new URL("../assets/media/codezero/plan-to-pr.mp4", import.meta.url).href
  },
  "codezero-codegraph": {
    image: new URL("../assets/media/codezero/codegraph.webp", import.meta.url).href
  },
  "codezero-knowledge": {
    image: new URL("../assets/media/codezero/knowledge-graph.webp", import.meta.url).href
  },
  "codezero-config": {
    image: new URL("../assets/media/codezero/business-config.webp", import.meta.url).href
  },
  "codezero-repo-board": {
    image: new URL("../assets/media/codezero/repo-board.webp", import.meta.url).href
  },
  "codezero-home-board": {
    image: new URL("../assets/media/codezero/home-board.webp", import.meta.url).href
  },
  "purrpilot-dashboard": {
    webm: new URL("../assets/media/purrpilot/01-basic-dashboard.webm", import.meta.url).href,
    mp4: new URL("../assets/media/purrpilot/01-basic-dashboard.mp4", import.meta.url).href
  },
  "purrpilot-cards": {
    webm: new URL("../assets/media/purrpilot/02-session-media-weather.webm", import.meta.url).href,
    mp4: new URL("../assets/media/purrpilot/02-session-media-weather.mp4", import.meta.url).href
  },
  "purrpilot-skills": {
    webm: new URL("../assets/media/purrpilot/03-skill-exchange.webm", import.meta.url).href,
    mp4: new URL("../assets/media/purrpilot/03-skill-exchange.mp4", import.meta.url).href
  },
  "purrpilot-custom": {
    webm: new URL("../assets/media/purrpilot/04-pet-customization.webm", import.meta.url).href,
    mp4: new URL("../assets/media/purrpilot/04-pet-customization.mp4", import.meta.url).href
  },
  "purrpilot-quick": {
    webm: new URL("../assets/media/purrpilot/05-pet-quick-actions.webm", import.meta.url).href,
    mp4: new URL("../assets/media/purrpilot/05-pet-quick-actions.mp4", import.meta.url).href
  },
  "quickjump-demo": {
    webm: new URL("../assets/media/aichat/demo.webm", import.meta.url).href,
    mp4: new URL("../assets/media/aichat/demo.mp4", import.meta.url).href
  },
  "quickjump-platforms": {
    image: new URL("../assets/media/aichat/platforms.webp", import.meta.url).href
  },
  "dataclean-home": {
    image: new URL("../assets/media/data-clean/1920_1200_home.webp", import.meta.url).href
  },
  "dataclean-processing": {
    image: new URL("../assets/media/data-clean/1200_1200_processing.webp", import.meta.url).href
  },
  "dataclean-result": {
    image: new URL("../assets/media/data-clean/2006_1148_result_ui.webp", import.meta.url).href
  },
  "dataclean-report": {
    image: new URL("../assets/media/data-clean/1200_1200_report.webp", import.meta.url).href
  },
  "dataclean-minilm": {
    image: new URL("../assets/media/data-clean/1300_1100_minilm_result.webp", import.meta.url).href
  },
  "dataclean-t5": {
    image: new URL("../assets/media/data-clean/1300_1100_t5.webp", import.meta.url).href
  },
  "dataclean-architecture": {
    image: new URL("../assets/media/data-clean/6300_4060_arch.webp", import.meta.url).href
  }
};

var projectBackgroundSources = {
  purrpilot: new URL("../assets/project-backgrounds/purrpilot-sky-meadow.webp", import.meta.url).href
};

(function (window, document) {
  "use strict";

  var config = window.JasonQSiteConfig || {};
  var projectBackgroundPromises = {};

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

  function isVideoMedia(media) {
    return media.tagName && media.tagName.toLowerCase() === "video";
  }

  function canPlayWebm(video) {
    return !!(video.canPlayType && video.canPlayType("video/webm; codecs=\"vp9\"")) || !!(video.canPlayType && video.canPlayType("video/webm"));
  }

  function getMediaSource(media) {
    var mediaKey = media.getAttribute("data-demo-key");
    var sourceConfig = mediaSources[mediaKey];
    var source = media.getAttribute("data-demo-src");
    var fallbackSource = media.getAttribute("data-demo-fallback-src");

    if (sourceConfig) {
      if (isVideoMedia(media)) {
        return !canPlayWebm(media) && sourceConfig.mp4 ? sourceConfig.mp4 : sourceConfig.webm;
      }

      return sourceConfig.image || sourceConfig.src;
    }

    if (isVideoMedia(media) && fallbackSource && !canPlayWebm(media)) {
      return fallbackSource;
    }

    return source;
  }

  function isMediaLoaded(media) {
    var source = getMediaSource(media);

    return !!source && media.dataset.mediaLoaded === "true" && media.getAttribute("src") === source;
  }

  function loadMediaItem(media) {
    var source = getMediaSource(media);

    if (!source || isMediaLoaded(media)) {
      return Promise.resolve(false);
    }

    return new Promise(function (resolve) {
      function finish(isError) {
        media.dataset.mediaLoaded = isError ? "false" : "true";
        resolve(isError);
      }

      media.dataset.mediaLoaded = "loading";

      if (isVideoMedia(media)) {
        media.addEventListener("loadeddata", function () {
          if (media.getAttribute("src") !== source) {
            return;
          }

          finish(false);
        }, { once: true });

        media.addEventListener("error", function () {
          if (media.getAttribute("src") !== source) {
            return;
          }

          finish(true);
        }, { once: true });

        media.setAttribute("preload", "auto");
        media.setAttribute("src", source);
        media.load();

        if (media.play) {
          media.play().catch(function () {});
        }

        return;
      }

      media.setAttribute("loading", "eager");
      media.addEventListener("load", function () {
        if (media.getAttribute("src") !== source) {
          return;
        }

        finish(false);
      }, { once: true });

      media.addEventListener("error", function () {
        if (media.getAttribute("src") !== source) {
          return;
        }

        finish(true);
      }, { once: true });

      media.setAttribute("src", source);
    });
  }

  function loadShowcaseMedia(panel) {
    if (!panel) {
      return Promise.resolve(false);
    }

    var mediaItems = Array.prototype.slice.call(panel.querySelectorAll("[data-demo-key], [data-demo-src]"));

    if (!mediaItems.length) {
      return Promise.resolve(false);
    }

    if (mediaItems.every(isMediaLoaded)) {
      panel.classList.remove("is-media-loading", "is-media-error");
      panel.classList.add("is-media-loaded");
      return Promise.resolve(false);
    }

    panel.classList.remove("is-media-loaded", "is-media-error");
    panel.classList.add("is-media-loading");

    var hasError = false;
    var chain = Promise.resolve();

    mediaItems.forEach(function (media) {
      chain = chain.then(function () {
        return loadMediaItem(media);
      }).then(function (isError) {
        hasError = hasError || isError;
      });
    });

    return chain.then(function () {
      panel.classList.remove("is-media-loading");
      panel.classList.toggle("is-media-error", hasError);
      panel.classList.toggle("is-media-loaded", !hasError);

      return hasError;
    });
  }

  function preloadImageSource(source) {
    if (!source) {
      return Promise.resolve(false);
    }

    if (projectBackgroundPromises[source]) {
      return projectBackgroundPromises[source];
    }

    projectBackgroundPromises[source] = new Promise(function (resolve) {
      var image = new Image();

      image.decoding = "async";
      image.addEventListener("load", function () {
        resolve(false);
      }, { once: true });
      image.addEventListener("error", function () {
        resolve(true);
      }, { once: true });
      image.src = source;
    });

    return projectBackgroundPromises[source];
  }

  function getProjectBackgroundSource(section) {
    var projectId = section && section.getAttribute("data-project");

    return projectBackgroundSources[projectId];
  }

  function loadProjectBackground(section) {
    if (!section || !section.hasAttribute("data-lazy-project-bg")) {
      return Promise.resolve(false);
    }

    var source = getProjectBackgroundSource(section);

    if (!source) {
      section.classList.add("is-project-assets-ready");
      return Promise.resolve(false);
    }

    if (section.dataset.projectBackgroundLoaded === "true") {
      section.classList.add("is-project-assets-ready");
      return Promise.resolve(false);
    }

    return preloadImageSource(source).then(function (isError) {
      if (!isError) {
        section.dataset.projectBackgroundLoaded = "true";
        section.classList.add("is-project-assets-ready");
      }

      return isError;
    });
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

  function syncShowcaseMode(showcase, panel) {
    var mode = panel && panel.getAttribute("data-showcase-mode");
    var section = showcase.closest("[data-section]") || showcase;

    if (!mode) {
      return;
    }

    section.querySelectorAll("[data-showcase-mode-tab]").forEach(function (control) {
      var isActive = control.getAttribute("data-showcase-mode-tab") === mode;

      control.classList.toggle("is-mode-active", isActive);
      control.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    section.querySelectorAll("[data-showcase-mode-panel]").forEach(function (modePanel) {
      var isActive = modePanel.getAttribute("data-showcase-mode-panel") === mode;

      modePanel.hidden = !isActive;
      modePanel.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
  }

  function getProjectIndex(section) {
    var order = section && section.getAttribute("data-project-order");
    var parsed = parseInt(order, 10);

    return Number.isNaN(parsed) ? 999 : parsed;
  }

  function scheduleOrderedProjectAssetsPreload() {
    scheduleDuringIntro(function () {
      var projectSections = Array.prototype.slice.call(document.querySelectorAll('[data-section="project"]')).sort(function (left, right) {
        return getProjectIndex(left) - getProjectIndex(right);
      });
      var preloadChain = Promise.resolve();

      projectSections.forEach(function (section) {
        preloadChain = preloadChain.then(function () {
          return loadProjectBackground(section);
        });
      });

      projectSections.forEach(function (section) {
        var showcase = section.querySelector("[data-project-showcase]");

        if (!showcase) {
          return;
        }

        preloadChain = preloadChain.then(function () {
          return loadShowcaseMedia(showcase.querySelector("[data-showcase-panel].is-active") || showcase.querySelector("[data-showcase-panel]"));
        });
      });

      projectSections.forEach(function (section) {
        var showcase = section.querySelector("[data-project-showcase]");

        if (!showcase) {
          return;
        }

        Array.prototype.slice.call(showcase.querySelectorAll("[data-showcase-panel]")).forEach(function (panel) {
          preloadChain = preloadChain.then(function () {
            if (panel.classList.contains("is-active")) {
              return false;
            }

            return loadShowcaseMedia(panel);
          });
        });
      });
    }, 2400);
  }

  function initProjectShowcase() {
    var showcases = Array.prototype.slice.call(document.querySelectorAll("[data-project-showcase]"));

    showcases.forEach(function (showcase) {
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
        syncShowcaseMode(showcase, activePanel);

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
    });

    scheduleOrderedProjectAssetsPreload();
  }

  function init() {
    initLanguage();
    syncProjectSections(config.projects || []);
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
