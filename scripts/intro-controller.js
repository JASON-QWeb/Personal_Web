(function (window, document) {
  "use strict";

  var completionTimer = 0;

  function resetIntroState(root, config) {
    window.clearTimeout(completionTimer);
    root.classList.remove(config.loadedClass, config.completeClass);
    root.offsetWidth;
  }

  function addLoadedState(root, config) {
    root.classList.add(config.loadedClass);

    completionTimer = window.setTimeout(function () {
      root.classList.add(config.completeClass);
    }, config.totalDurationMs);
  }

  function waitForHeroImage(heroImage, config, callback) {
    if (!heroImage) {
      callback();
      return;
    }

    if (heroImage.complete) {
      window.setTimeout(callback, config.imageReadyDelayMs);
      return;
    }

    var fallback = window.setTimeout(callback, config.imageTimeoutMs);

    heroImage.addEventListener("load", function () {
      window.clearTimeout(fallback);
      window.setTimeout(callback, config.imageReadyDelayMs);
    }, { once: true });

    heroImage.addEventListener("error", function () {
      window.clearTimeout(fallback);
      callback();
    }, { once: true });
  }

  window.JasonQIntro = {
    init: function init(config) {
      var root = document.documentElement;
      var heroImage = document.querySelector(config.heroImageSelector);

      resetIntroState(root, config);

      if (config.waitForHeroImage === false) {
        window.requestAnimationFrame(function () {
          addLoadedState(root, config);
        });
        return;
      }

      waitForHeroImage(heroImage, config, function () {
        addLoadedState(root, config);
      });
    }
  };
})(window, document);
