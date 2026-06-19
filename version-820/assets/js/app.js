(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const showSlide = function (nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  const searchForms = Array.from(document.querySelectorAll('[data-search-form]'));

  searchForms.forEach(function (form) {
    const input = form.querySelector('[data-search-input]');
    const cardsRoot = document.querySelector(form.getAttribute('data-search-target')) || document;
    const cards = Array.from(cardsRoot.querySelectorAll('[data-movie-card]'));

    if (!input || !cards.length) {
      return;
    }

    const filter = function () {
      const keyword = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        const text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        card.classList.toggle('hidden-card', keyword.length > 0 && !text.includes(keyword));
      });
    };

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filter();
    });
    input.addEventListener('input', filter);
  });
})();
