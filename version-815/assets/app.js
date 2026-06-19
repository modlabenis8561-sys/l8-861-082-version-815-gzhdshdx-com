
(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(i);
        start();
      });
    });
    start();
  });

  document.querySelectorAll('[data-filter]').forEach(function (section) {
    var input = section.querySelector('[data-filter-input]');
    var buttons = Array.prototype.slice.call(section.querySelectorAll('[data-filter-term]'));
    var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
    var empty = section.querySelector('[data-empty]');
    var activeTerm = 'all';
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visibleCount = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var termOk = activeTerm === 'all' || text.indexOf(activeTerm.toLowerCase()) !== -1;
        var queryOk = !query || text.indexOf(query) !== -1;
        var visible = termOk && queryOk;
        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });
      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeTerm = button.getAttribute('data-filter-term') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
  });
})();
