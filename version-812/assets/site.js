(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero-carousel]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupFilters(scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var input = scope.querySelector('[data-card-filter]');
        var region = scope.querySelector('[data-region-filter]');
        var year = scope.querySelector('[data-year-filter]');
        var category = scope.querySelector('[data-category-filter]');

        if (!cards.length || (!input && !region && !year && !category)) {
            return;
        }

        function addOption(select, value) {
            if (!select || !value) {
                return;
            }

            var exists = Array.prototype.some.call(select.options, function (option) {
                return option.value === value;
            });

            if (!exists) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            }
        }

        var regions = [];
        var years = [];

        cards.forEach(function (card) {
            var regionValue = card.getAttribute('data-region') || '';
            var yearValue = card.getAttribute('data-year') || '';

            if (regionValue && regions.indexOf(regionValue) === -1) {
                regions.push(regionValue);
            }

            if (yearValue && years.indexOf(yearValue) === -1) {
                years.push(yearValue);
            }
        });

        regions.sort().forEach(function (value) {
            addOption(region, value);
        });

        years.sort(function (a, b) {
            return Number(b) - Number(a);
        }).forEach(function (value) {
            addOption(year, value);
        });

        function apply() {
            var keyword = normalize(input && input.value);
            var selectedRegion = normalize(region && region.value);
            var selectedYear = normalize(year && year.value);
            var selectedCategory = normalize(category && category.value);

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-type')
                ].join(' '));
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesRegion = !selectedRegion || normalize(card.getAttribute('data-region')) === selectedRegion;
                var matchesYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
                var matchesCategory = !selectedCategory || normalize(card.getAttribute('data-category')) === selectedCategory;

                card.classList.toggle('is-hidden', !(matchesKeyword && matchesRegion && matchesYear && matchesCategory));
            });
        }

        [input, region, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('main, .home-search-section, .section-shell')).forEach(setupFilters);

    function setupPlayer(player) {
        var stream = player.getAttribute('data-stream');
        var video = player.querySelector('video');
        var overlay = player.querySelector('.player-overlay');
        var ready = false;
        var loading = false;

        if (!stream || !video || !overlay) {
            return;
        }

        function prepare() {
            return new Promise(function (resolve) {
                if (ready) {
                    resolve();
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    ready = true;
                    resolve();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        ready = true;
                        resolve();
                    });
                    hls.on(window.Hls.Events.ERROR, function () {
                        if (!ready) {
                            video.src = stream;
                            ready = true;
                            resolve();
                        }
                    });
                    return;
                }

                video.src = stream;
                ready = true;
                resolve();
            });
        }

        function start() {
            if (loading) {
                return;
            }

            loading = true;
            prepare().then(function () {
                overlay.classList.add('is-hidden');
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                }
            }).finally(function () {
                loading = false;
            });
        }

        overlay.addEventListener('click', start);
        player.addEventListener('click', function (event) {
            if (event.target === player) {
                start();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
}());
