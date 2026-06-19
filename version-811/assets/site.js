(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", mobileNav.classList.contains("is-open"));
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]")).forEach(function (area) {
      var input = area.querySelector("[data-search-input]");
      var year = area.querySelector("[data-year-filter]");
      var list = area.parentElement.querySelector("[data-card-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedYear = !selectedYear || cardYear === selectedYear;
          card.style.display = matchedKeyword && matchedYear ? "" : "none";
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
    });
  });

  window.initPlayer = function (streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var actions = Array.prototype.slice.call(document.querySelectorAll("[data-play-action]"));
    var hls = null;
    var loaded = false;

    if (!video || !streamUrl) {
      return;
    }

    function bindStream() {
      if (loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      loaded = true;
    }

    function play(event) {
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      bindStream();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    actions.forEach(function (action) {
      action.addEventListener("click", play);
    });

    video.addEventListener("click", function () {
      if (!loaded) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
