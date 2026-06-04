(function (window, document) {
  "use strict";

  var CELL_WIDTH = 192;
  var CELL_HEIGHT = 208;
  var MIN_X = 8;
  var HIT_PADDING = 8;
  var root = null;
  var x = MIN_X;
  var loopStarted = false;
  var isDestroyed = false;
  var isActive = false;
  var isHovered = false;
  var isDragging = false;
  var dragOffsetX = 0;
  var hasScrolledAfterLoad = false;
  var hasUserScrollIntent = false;
  var activeRunId = 0;
  var tapResumeTimer = 0;
  var spritePreload = null;
  var introObserver = null;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var hoverPointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

  function getScale() {
    if (window.innerWidth <= 640) {
      return .36;
    }

    if (window.innerWidth <= 980) {
      return .43;
    }

    return .52;
  }

  function getMaxX() {
    return Math.max(MIN_X, window.innerWidth - getHitWidth() - MIN_X);
  }

  function getHitWidth() {
    return (CELL_WIDTH * getScale()) + (HIT_PADDING * 2);
  }

  function getHitHeight() {
    return (CELL_HEIGHT * getScale()) + (HIT_PADDING * 2);
  }

  function setX(nextX) {
    x = Math.max(MIN_X, Math.min(nextX, getMaxX()));

    if (root) {
      root.style.setProperty("--pet-x", x.toFixed(1) + "px");
    }
  }

  function syncScale() {
    if (!root) {
      return;
    }

    root.style.setProperty("--pet-scale", getScale());
    root.style.setProperty("--pet-ground", window.innerWidth <= 640 ? "4px" : "10px");
    root.style.setProperty("--pet-hit-pad", HIT_PADDING + "px");
    root.style.setProperty("--pet-hit-width", getHitWidth().toFixed(1) + "px");
    root.style.setProperty("--pet-hit-height", getHitHeight().toFixed(1) + "px");
    setX(x);
  }

  function isIntroComplete() {
    return document.documentElement.classList.contains("is-intro-complete");
  }

  function syncRestoredScrollPosition() {
    if (!isIntroComplete()) {
      return;
    }

    if (window.scrollY > 32) {
      hasScrolledAfterLoad = true;
    }

    syncPetVisibilityFromScroll();
  }

  function scheduleRestoredScrollCheck() {
    window.setTimeout(syncRestoredScrollPosition, 0);
    window.setTimeout(syncRestoredScrollPosition, 180);
  }

  function watchIntroCompletion() {
    if (isIntroComplete()) {
      scheduleRestoredScrollCheck();
      return;
    }

    if ("MutationObserver" in window) {
      introObserver = new MutationObserver(function () {
        if (!isIntroComplete()) {
          return;
        }

        introObserver.disconnect();
        introObserver = null;
        scheduleRestoredScrollCheck();
      });

      introObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"]
      });
    }

    window.setTimeout(syncRestoredScrollPosition, 7000);
    window.setTimeout(syncRestoredScrollPosition, 9400);
  }

  function wait(duration) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, duration);
    });
  }

  function easeInOutQuad(progress) {
    if (progress < .5) {
      return 2 * progress * progress;
    }

    return 1 - Math.pow(-2 * progress + 2, 2) / 2;
  }

  function runTo(targetX, runId) {
    return new Promise(function (resolve) {
      var startX = x;
      var distance = Math.abs(targetX - startX);
      var duration = Math.max(2600, Math.min(7600, distance * 18));
      var startTime = 0;

      root.dataset.petDirection = targetX >= startX ? "right" : "left";
      root.dataset.petState = "run";

      function tick(timestamp) {
        var progress;

        if (isDestroyed || !isActive || runId !== activeRunId || prefersReducedMotion.matches) {
          resolve(false);
          return;
        }

        if (hoverPointerQuery.matches && root.matches(":hover")) {
          pauseForHover();
          resolve(false);
          return;
        }

        if (!startTime) {
          startTime = timestamp;
        }

        progress = Math.min(1, (timestamp - startTime) / duration);
        setX(startX + ((targetX - startX) * easeInOutQuad(progress)));

        if (progress < 1) {
          window.requestAnimationFrame(tick);
        } else {
          setX(targetX);
          resolve(true);
        }
      }

      window.requestAnimationFrame(tick);
    });
  }

  async function performAction(runId) {
    if (!isActive || runId !== activeRunId) {
      return false;
    }

    root.dataset.petState = "idle";
    await wait(620);

    if (!isActive || runId !== activeRunId) {
      return false;
    }

    root.dataset.petState = "act";
    await wait(1240);

    if (!isActive || runId !== activeRunId) {
      return false;
    }

    root.dataset.petState = "idle";
    await wait(540);
    return isActive && runId === activeRunId;
  }

  async function startLoop(shouldResetPosition, firstDelay) {
    var runId;

    if (loopStarted || !isActive || isHovered || prefersReducedMotion.matches) {
      return;
    }

    loopStarted = true;
    runId = activeRunId;

    if (shouldResetPosition) {
      setX(MIN_X);
      root.dataset.petDirection = "right";
    }

    root.dataset.petState = "idle";
    await wait(typeof firstDelay === "number" ? firstDelay : 900);

    while (!isDestroyed && isActive && !isHovered && runId === activeRunId && !prefersReducedMotion.matches) {
      if (!await runTo(getMaxX(), runId)) {
        break;
      }

      if (!await performAction(runId)) {
        break;
      }

      if (!await runTo(MIN_X, runId)) {
        break;
      }

      if (!await performAction(runId)) {
        break;
      }
    }

    if (runId === activeRunId) {
      loopStarted = false;
    }
  }

  function setPetActive(nextActive) {
    if (!root || isActive === nextActive) {
      return;
    }

    isActive = nextActive;
    activeRunId += 1;
    document.documentElement.classList.toggle("is-pet-active", nextActive);

    if (!nextActive) {
      window.clearTimeout(tapResumeTimer);
      isHovered = false;
      root.dataset.petState = "idle";
      loopStarted = false;
      return;
    }

    preloadSprite();
    startLoop(true, 320);
  }

  function shouldShowPetAfterScroll() {
    return hasScrolledAfterLoad && window.scrollY > 32;
  }

  function syncPetVisibilityFromScroll() {
    setPetActive(shouldShowPetAfterScroll());
  }

  function markScrollIntent(event) {
    var key = event && event.key;

    if (event && event.type === "wheel" && event.deltaY <= 0) {
      return;
    }

    if (key && ["ArrowDown", "PageDown", " ", "Spacebar", "End"].indexOf(key) === -1) {
      return;
    }

    hasUserScrollIntent = true;
  }

  function handleScroll() {
    if (!isIntroComplete()) {
      return;
    }

    if (!hasUserScrollIntent && window.scrollY <= 32) {
      return;
    }

    hasScrolledAfterLoad = true;
    syncPetVisibilityFromScroll();
  }

  function pauseForHover() {
    if (!isActive || isHovered || prefersReducedMotion.matches) {
      return;
    }

    window.clearTimeout(tapResumeTimer);
    isHovered = true;
    activeRunId += 1;
    loopStarted = false;
    root.dataset.petState = "act";
  }

  function pauseForInteraction(event) {
    if (isDragging) return;

    if (event && event.pointerType === "touch") {
      pauseForTap();
      return;
    }

    if (!hoverPointerQuery.matches) {
      pauseForTap();
      return;
    }

    pauseForHover();
  }

  function pauseForTap() {
    var tapRunId;

    if (!isActive || isDragging || prefersReducedMotion.matches) {
      return;
    }

    window.clearTimeout(tapResumeTimer);
    isHovered = true;
    activeRunId += 1;
    loopStarted = false;
    root.dataset.petState = "act";
    tapRunId = activeRunId;

    tapResumeTimer = window.setTimeout(function () {
      if (isActive && isHovered && activeRunId === tapRunId) {
        resumeAfterHover();
      }
    }, 1500);
  }

  function resumeAfterHover() {
    if (!isActive || !isHovered || isDragging || prefersReducedMotion.matches) {
      return;
    }

    window.clearTimeout(tapResumeTimer);
    isHovered = false;
    activeRunId += 1;
    root.dataset.petState = "idle";
    startLoop(false, 160);
  }

  function handleDragStart(event) {
    if (!isActive || !root) return;

    event.preventDefault();
    isDragging = true;
    window.clearTimeout(tapResumeTimer);
    isHovered = true;
    activeRunId += 1;
    loopStarted = false;

    var petScreenX = x;
    dragOffsetX = event.clientX - petScreenX;

    root.dataset.petState = "act";
    root.classList.add("is-dragging");
    root.setPointerCapture(event.pointerId);
  }

  function handleDragMove(event) {
    if (!isDragging) return;

    var newX = event.clientX - dragOffsetX;
    setX(newX);
  }

  function handleDragEnd(event) {
    if (!isDragging) return;

    isDragging = false;
    root.classList.remove("is-dragging");

    if (event && typeof event.pointerId === "number" && root.hasPointerCapture && root.hasPointerCapture(event.pointerId)) {
      root.releasePointerCapture(event.pointerId);
    }

    isHovered = false;
    activeRunId += 1;
    root.dataset.petState = "idle";
    startLoop(false, 800);
  }

  function handlePointerCaptureLost() {
    handleDragEnd();
  }

  function initScrollVisibility() {
    document.documentElement.classList.remove("is-pet-active", "is-purrpilot-active");
    setPetActive(false);
    window.addEventListener("wheel", markScrollIntent, { passive: true });
    window.addEventListener("touchmove", markScrollIntent, { passive: true });
    window.addEventListener("keydown", markScrollIntent);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pageshow", scheduleRestoredScrollCheck);
    window.addEventListener("load", scheduleRestoredScrollCheck, { once: true });
    watchIntroCompletion();
  }

  function markSpriteReady() {
    if (root) {
      root.classList.add("is-pet-sprite-ready");
    }
  }

  function preloadSprite() {
    var image;

    if (spritePreload || prefersReducedMotion.matches) {
      return spritePreload;
    }

    image = new Image();
    image.decoding = "async";

    if ("fetchPriority" in image) {
      image.fetchPriority = "low";
    }

    spritePreload = new Promise(function (resolve) {
      image.addEventListener("load", function () {
        if (image.decode) {
          image.decode().catch(function () {}).then(function () {
            markSpriteReady();
            resolve();
          });
          return;
        }

        markSpriteReady();
        resolve();
      }, { once: true });

      image.addEventListener("error", function () {
        markSpriteReady();
        resolve();
      }, { once: true });

      image.src = new URL("../assets/pet/spritesheet.webp", import.meta.url).href;
    });

    return spritePreload;
  }

  function scheduleSpritePreload() {
    var fallbackTimer = 0;
    var didSchedule = false;

    function load() {
      if (didSchedule) {
        return;
      }

      didSchedule = true;
      window.clearTimeout(fallbackTimer);
      preloadSprite();
    }

    window.addEventListener("jasonq:intro-start", load, { once: true });
    fallbackTimer = window.setTimeout(load, 2400);
  }

  function createPet() {
    var sprite;

    if (root) {
      return;
    }

    root = document.createElement("div");
    root.className = "pet-runner";
    root.dataset.petState = "idle";
    root.dataset.petDirection = "right";
    root.setAttribute("aria-hidden", "true");

    sprite = document.createElement("div");
    sprite.className = "pet-runner__sprite";
    root.appendChild(sprite);
    document.body.appendChild(root);
    root.addEventListener("pointerenter", pauseForInteraction);
    root.addEventListener("pointerover", pauseForInteraction);
    root.addEventListener("pointerdown", handleDragStart);
    root.addEventListener("pointermove", handleDragMove);
    root.addEventListener("pointerup", handleDragEnd);
    root.addEventListener("pointercancel", handleDragEnd);
    root.addEventListener("lostpointercapture", handlePointerCaptureLost);
    root.addEventListener("pointerleave", function (event) {
      if (!isDragging) resumeAfterHover();
    });
    root.addEventListener("mouseenter", pauseForInteraction);
    root.addEventListener("mouseover", pauseForInteraction);
    root.addEventListener("mouseleave", function () {
      if (!isDragging) resumeAfterHover();
    });

    syncScale();
    scheduleSpritePreload();
    initScrollVisibility();
  }

  function handleResize() {
    syncScale();
  }

  function handleMotionPreferenceChange() {
    if (!root) {
      return;
    }

    if (prefersReducedMotion.matches) {
      root.dataset.petState = "idle";
      setX(MIN_X);
      return;
    }

    loopStarted = false;
    startLoop(false, 160);
  }

  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("pointerup", handleDragEnd, { passive: true });
  window.addEventListener("pointercancel", handleDragEnd, { passive: true });
  window.addEventListener("blur", handleDragEnd);

  if (prefersReducedMotion.addEventListener) {
    prefersReducedMotion.addEventListener("change", handleMotionPreferenceChange);
  } else if (prefersReducedMotion.addListener) {
    prefersReducedMotion.addListener(handleMotionPreferenceChange);
  }

  window.addEventListener("pagehide", function () {
    isDestroyed = true;
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createPet, { once: true });
  } else {
    createPet();
  }
})(window, document);
