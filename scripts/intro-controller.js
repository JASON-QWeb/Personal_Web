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
    window.dispatchEvent(new CustomEvent("jasonq:intro-start"));

    completionTimer = window.setTimeout(function () {
      root.classList.add(config.completeClass);
    }, config.totalDurationMs);
  }

  function getInitialImages(config) {
    var selectors = config.initialImageSelectors || [config.heroImageSelector];
    var images = [];

    selectors.forEach(function (selector) {
      if (!selector) {
        return;
      }

      document.querySelectorAll(selector).forEach(function (image) {
        if (images.indexOf(image) === -1) {
          images.push(image);
        }
      });
    });

    return images;
  }

  function waitForInitialImages(config, callback) {
    var images = getInitialImages(config);
    var remaining = images.length;
    var isDone = false;
    var fallback;

    function finish() {
      if (isDone) {
        return;
      }

      isDone = true;
      window.clearTimeout(fallback);
      window.setTimeout(callback, config.imageReadyDelayMs);
    }

    function settle() {
      remaining -= 1;

      if (remaining <= 0) {
        finish();
      }
    }

    if (!images.length) {
      callback();
      return;
    }

    fallback = window.setTimeout(finish, config.imageTimeoutMs);

    images.forEach(function (image) {
      if (image.complete) {
        settle();
        return;
      }

      image.addEventListener("load", settle, { once: true });
      image.addEventListener("error", settle, { once: true });
    });
  }

  window.JasonQIntro = {
    init: function init(config) {
      var root = document.documentElement;
      resetIntroState(root, config);

      if (config.waitForHeroImage === false) {
        window.requestAnimationFrame(function () {
          addLoadedState(root, config);
        });
        return;
      }

      waitForInitialImages(config, function () {
        addLoadedState(root, config);
      });
    }
  };
})(window, document);
