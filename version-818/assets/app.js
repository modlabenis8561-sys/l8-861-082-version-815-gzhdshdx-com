(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      body.classList.toggle('is-menu-open', panel.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(function (panelNode) {
    var search = panelNode.querySelector('[data-local-search]');
    var scope = panelNode.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty-state]');
    var filters = {
      type: 'all',
      year: 'all'
    };

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function apply() {
      var query = normalize(search ? search.value : '');
      var shown = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var type = card.getAttribute('data-type') || '';
        var year = card.getAttribute('data-year') || '';
        var matched = (!query || text.indexOf(query) !== -1) &&
          (filters.type === 'all' || filters.type === type) &&
          (filters.year === 'all' || filters.year === year);

        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          shown += 1;
        }
      });

      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    }

    if (search) {
      search.addEventListener('input', apply);
    }

    Array.prototype.slice.call(panelNode.querySelectorAll('[data-filter]')).forEach(function (button) {
      button.addEventListener('click', function () {
        var key = button.getAttribute('data-filter');
        var value = button.getAttribute('data-value') || 'all';
        filters[key] = value;

        Array.prototype.slice.call(panelNode.querySelectorAll('[data-filter="' + key + '"]')).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });

        apply();
      });
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && search) {
      search.value = q;
      apply();
    }
  });
})();
