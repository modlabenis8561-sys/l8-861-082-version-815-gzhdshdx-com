(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === active);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupGlobalSearch() {
    var panels = selectAll('[data-global-search]');
    if (!panels.length || typeof SITE_SEARCH_DATA === 'undefined') {
      return;
    }

    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-search-input]');
      var results = panel.querySelector('[data-search-results]');
      if (!input || !results) {
        return;
      }

      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        results.textContent = '';
        if (!query) {
          results.hidden = true;
          return;
        }
        var matches = SITE_SEARCH_DATA.filter(function (item) {
          return item.title.toLowerCase().indexOf(query) > -1 ||
            item.region.toLowerCase().indexOf(query) > -1 ||
            item.type.toLowerCase().indexOf(query) > -1 ||
            item.genre.toLowerCase().indexOf(query) > -1 ||
            item.year.toLowerCase().indexOf(query) > -1;
        }).slice(0, 12);

        matches.forEach(function (item) {
          var link = document.createElement('a');
          var title = document.createElement('strong');
          var meta = document.createElement('span');
          link.className = 'search-result';
          link.href = item.url;
          title.textContent = item.title;
          meta.textContent = item.year + ' · ' + item.region + ' · ' + item.type;
          link.appendChild(title);
          link.appendChild(meta);
          results.appendChild(link);
        });
        results.hidden = matches.length === 0;
      });
    });
  }

  function setupCardFilter() {
    var input = document.querySelector('[data-card-search]');
    var buttons = selectAll('[data-filter-button]');
    var cards = selectAll('[data-card]');
    if (!cards.length) {
      return;
    }
    var current = 'all';

    function matchesFilter(card) {
      if (current === 'all') {
        return true;
      }
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-year') || ''
      ].join(' ');
      return current.split(' ').some(function (part) {
        return part && haystack.indexOf(part) > -1;
      });
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        card.hidden = !(matchesFilter(card) && (!query || text.indexOf(query) > -1));
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        current = button.getAttribute('data-filter-button') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });

    if (buttons[0]) {
      buttons[0].classList.add('active');
    }

    if (input) {
      input.addEventListener('input', apply);
    }
  }

  function setupPlayer() {
    var shell = document.querySelector('.player-shell');
    if (!shell) {
      return;
    }
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var stream = shell.getAttribute('data-stream');
    var hls = null;
    var started = false;

    if (!video || !stream) {
      return;
    }

    function attach() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener('click', attach);
    }

    video.addEventListener('click', function () {
      if (!started) {
        attach();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupGlobalSearch();
    setupCardFilter();
    setupPlayer();
  });
})();
