(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function startHero() {
        var slides = qsa(".hero-slide");
        var dots = qsa(".hero-dot");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function loop() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                loop();
            });
        });
        show(0);
        loop();
    }

    function startNav() {
        var toggle = qs(".nav-toggle");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            document.body.classList.toggle("nav-open");
        });
    }

    function startFilters() {
        var cards = qsa(".movie-card");
        if (!cards.length) {
            return;
        }
        var input = qs(".filter-panel .filter-input");
        var typeSelect = qs('[data-filter="type"]');
        var yearSelect = qs('[data-filter="year"]');
        var empty = qs(".empty-state");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input && query) {
            input.value = query;
        }
        function apply() {
            var keyword = normalize(input ? input.value : "");
            var type = typeSelect ? typeSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var shown = 0;
            cards.forEach(function (card) {
                var matchesKeyword = !keyword || normalize(card.getAttribute("data-search")).indexOf(keyword) !== -1;
                var matchesType = !type || card.getAttribute("data-type") === type;
                var matchesYear = !year || card.getAttribute("data-year") === year;
                var visible = matchesKeyword && matchesType && matchesYear;
                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }
        [input, typeSelect, yearSelect].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });
        apply();
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movieVideo");
        var overlay = document.getElementById("playOverlay");
        if (!video || !streamUrl) {
            return;
        }
        var attached = false;
        var hls = null;
        function attach() {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                attached = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                attached = true;
                return;
            }
            video.src = streamUrl;
            attached = true;
        }
        function begin(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            attach();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener("click", begin);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("hidden");
            }
        });
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        startHero();
        startNav();
        startFilters();
    });
}());
