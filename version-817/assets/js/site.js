(function () {
  var movies = window.MovieSearchData || [];

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function matchMovie(movie, query) {
    var q = normalize(query);
    if (!q) {
      return true;
    }
    return normalize([
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.tags,
      movie.category,
      movie.oneLine
    ].join(" ")).indexOf(q) !== -1;
  }

  function imageErrorHandler(img) {
    img.addEventListener("error", function () {
      img.style.opacity = "0";
      var frame = img.closest(".poster-frame, .hero-poster, .rank-poster, .search-result-mini");
      if (frame) {
        frame.classList.add("is-missing");
      }
    });
  }

  function setupImages() {
    document.querySelectorAll("img[data-cover]").forEach(imageErrorHandler);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  function resultMini(movie) {
    return [
      "<a class=\"search-result-mini\" href=\"" + movie.url + "\">",
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" data-cover>",
      "<span><strong>" + escapeHtml(movie.title) + "</strong><span>" + escapeHtml(movie.year + " · " + movie.category) + "</span></span>",
      "</a>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupGlobalSearch() {
    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      var panel = form.querySelector("[data-search-panel]");
      if (!input || !panel) {
        return;
      }
      input.addEventListener("input", function () {
        var query = input.value;
        if (!query.trim()) {
          panel.classList.remove("open");
          panel.innerHTML = "";
          return;
        }
        var results = movies.filter(function (movie) {
          return matchMovie(movie, query);
        }).slice(0, 8);
        panel.innerHTML = results.map(resultMini).join("");
        panel.classList.toggle("open", results.length > 0);
        panel.querySelectorAll("img[data-cover]").forEach(imageErrorHandler);
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("open");
        }
      });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupPageFilter() {
    var keyword = document.querySelector("[data-page-filter]");
    var year = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length || (!keyword && !year)) {
      return;
    }
    function apply() {
      var query = normalize(keyword ? keyword.value : "");
      var selectedYear = year ? year.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type")
        ].join(" "));
        var cardYear = card.getAttribute("data-year") || "";
        var yearOk = !selectedYear || cardYear.indexOf(selectedYear) !== -1;
        if (selectedYear === "classic") {
          var numericYear = parseInt(cardYear, 10);
          yearOk = isNaN(numericYear) || numericYear < 2020;
        }
        var ok = haystack.indexOf(query) !== -1 && yearOk;
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }
    if (keyword) {
      keyword.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    apply();
  }

  function movieCardHtml(movie) {
    var tags = String(movie.tags || "").split(" ").filter(Boolean).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a href=\"" + movie.url + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "<div class=\"poster-frame\"><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" data-cover><span class=\"rating-badge\">" + escapeHtml(movie.rating) + "</span></div>",
      "<div class=\"movie-card-body\"><p class=\"movie-meta\">" + escapeHtml(movie.region + " · " + movie.type + " · " + movie.year) + "</p>",
      "<h3>" + escapeHtml(movie.title) + "</h3><p class=\"movie-one-line\">" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div></div>",
      "</a></article>"
    ].join("");
  }

  function setupSearchPage() {
    var input = document.querySelector("[data-search-page-input]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    if (!input || !results) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";
    function render() {
      var query = input.value;
      var filtered = movies.filter(function (movie) {
        return matchMovie(movie, query);
      }).slice(0, 240);
      results.innerHTML = filtered.map(movieCardHtml).join("");
      results.querySelectorAll("img[data-cover]").forEach(imageErrorHandler);
      if (empty) {
        empty.classList.toggle("show", filtered.length === 0);
      }
    }
    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    setupImages();
    setupMenu();
    setupGlobalSearch();
    setupHero();
    setupPageFilter();
    setupSearchPage();
  });
}());
