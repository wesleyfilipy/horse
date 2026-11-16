(function () {
  var WATCH_THRESHOLD_SECONDS = 33 * 60;
  var WATCHED_SECONDS_KEY = "redhorse-wistia-watched-seconds";
  var OFFER_UNLOCKED_KEY = "alreadyElsDisplayed1980";
  var SAVE_INTERVAL_SECONDS = 5;

  function initialize() {
    var player = document.querySelector('wistia-player[media-id="r385khrnwa"]');
    if (!player) {
      throw new Error("The Wistia player for r385khrnwa was not found.");
    }

    var watchedSeconds = Math.min(
      WATCH_THRESHOLD_SECONDS,
      Math.max(0, Number(localStorage.getItem(WATCHED_SECONDS_KEY)) || 0)
    );
    var lastProgressAt = 0;
    var lastSavedSeconds = watchedSeconds;
    var offerUnlocked = localStorage.getItem(OFFER_UNLOCKED_KEY) === "true";

    function unlockOffer() {
      if (typeof window.runDelayedFunctions !== "function") {
        throw new Error("The sales offer reveal function was not loaded.");
      }

      var offerSection =
        document.getElementById("Oferta") ||
        document.querySelector(".atomicat-container-340b0e5");
      if (!offerSection) {
        throw new Error("The sales offer section was not found.");
      }

      if (!offerUnlocked) {
        offerUnlocked = true;
        localStorage.setItem(
          WATCHED_SECONDS_KEY,
          String(WATCH_THRESHOLD_SECONDS)
        );
      }

      window.runDelayedFunctions({ setDisplayed: OFFER_UNLOCKED_KEY });
      if (offerSection.id !== "Oferta") {
        offerSection.scrollIntoView({ behavior: "smooth" });
      }
    }

    if (offerUnlocked || watchedSeconds >= WATCH_THRESHOLD_SECONDS) {
      unlockOffer();
      return;
    }

    function resetProgressClock() {
      lastProgressAt = performance.now();
    }

    player.addEventListener("play", resetProgressClock);
    player.addEventListener("pause", resetProgressClock);
    player.addEventListener("time-update", function () {
      var now = performance.now();
      var elapsed = lastProgressAt
        ? Math.min((now - lastProgressAt) / 1000, 1.5)
        : 0;
      lastProgressAt = now;

      if (player.state !== "playing") {
        return;
      }

      watchedSeconds = Math.min(
        WATCH_THRESHOLD_SECONDS,
        watchedSeconds + elapsed
      );

      if (watchedSeconds - lastSavedSeconds >= SAVE_INTERVAL_SECONDS) {
        localStorage.setItem(WATCHED_SECONDS_KEY, String(watchedSeconds));
        lastSavedSeconds = watchedSeconds;
      }

      if (watchedSeconds >= WATCH_THRESHOLD_SECONDS) {
        unlockOffer();
      }
    });
  }

  function start() {
    customElements.whenDefined("wistia-player").then(initialize);
  }

  if (document.readyState === "loading" || document.readyState === "interactive") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
