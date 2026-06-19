(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function initImages() {
    document.addEventListener("error", function (event) {
      var target = event.target;
      if (target && target.tagName === "IMG") {
        target.classList.add("image-failed");
      }
    }, true);
  }

  function initMenu() {
    var toggle = document.getElementById("mobile-toggle");
    var panel = document.getElementById("mobile-menu");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input], [data-filter-year], [data-filter-region], [data-filter-type], [data-filter-category]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length || !inputs.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    var firstInput = document.querySelector("[data-search-input]");
    if (q && firstInput) {
      firstInput.value = q;
    }

    function apply() {
      var keyword = text(firstInput ? firstInput.value : "");
      var yearSelect = document.querySelector("[data-filter-year]");
      var regionSelect = document.querySelector("[data-filter-region]");
      var typeSelect = document.querySelector("[data-filter-type]");
      var categorySelect = document.querySelector("[data-filter-category]");
      var year = yearSelect ? yearSelect.value : "";
      var region = regionSelect ? text(regionSelect.value) : "";
      var type = typeSelect ? text(typeSelect.value) : "";
      var category = categorySelect ? categorySelect.value : "";

      cards.forEach(function (card) {
        var haystack = text([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || card.getAttribute("data-year") === year;
        var matchedRegion = !region || text(card.getAttribute("data-region")).indexOf(region) !== -1;
        var matchedType = !type || text(card.getAttribute("data-type")).indexOf(type) !== -1;
        var matchedCategory = !category || card.getAttribute("data-category") === category;
        card.classList.toggle("hidden-card", !(matchedKeyword && matchedYear && matchedRegion && matchedType && matchedCategory));
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", apply);
      input.addEventListener("change", apply);
    });
    apply();
  }

  window.setupPlayer = function (videoId, coverId, streamUrl) {
    ready(function () {
      var video = document.getElementById(videoId);
      var cover = document.getElementById(coverId);
      if (!video || !streamUrl) {
        return;
      }
      var loaded = false;
      var hlsInstance = null;

      function loadAndPlay() {
        if (!loaded) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
          } else {
            video.src = streamUrl;
          }
          video.controls = true;
          loaded = true;
        }
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", loadAndPlay);
      }
      video.addEventListener("click", function () {
        if (!loaded) {
          loadAndPlay();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(function () {
    initImages();
    initMenu();
    initHero();
    initFilters();
  });
})();
