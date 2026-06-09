(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            button.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
        });
    }

    function initHeaderSearch() {
        selectAll('[data-header-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input');
                var query = input ? input.value.trim() : '';
                var target = 'search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function initHeroSlider() {
        var slides = selectAll('.hero-slide');
        if (slides.length < 2) {
            return;
        }
        var dots = selectAll('.hero-dot');
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        show(0);
        restart();
    }

    function initSearchFilters() {
        var input = document.querySelector('[data-movie-search-input]');
        var genreSelect = document.querySelector('[data-genre-filter]');
        var yearSelect = document.querySelector('[data-year-filter]');
        var cards = selectAll('[data-movie-card]');
        var empty = document.querySelector('[data-empty-result]');
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            input.value = query;
        }

        function current(value) {
            return (value || '').trim().toLowerCase();
        }

        function apply() {
            var keyword = current(input.value);
            var genre = genreSelect ? current(genreSelect.value) : '';
            var year = yearSelect ? current(yearSelect.value) : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = current([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year')
                ].join(' '));
                var hitKeyword = !keyword || text.indexOf(keyword) !== -1;
                var hitGenre = !genre || current(card.getAttribute('data-genre')).indexOf(genre) !== -1;
                var hitYear = !year || current(card.getAttribute('data-year')) === year;
                var show = hitKeyword && hitGenre && hitYear;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        input.addEventListener('input', apply);
        if (genreSelect) {
            genreSelect.addEventListener('change', apply);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', apply);
        }
        apply();
    }

    function bindPlayer(source) {
        var video = document.querySelector('[data-player-video]');
        var cover = document.querySelector('[data-player-cover]');
        var button = document.querySelector('[data-player-button]');
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            video.controls = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            }, { once: true });
        }

        function start() {
            load();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }
        if (cover) {
            cover.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (!loaded) {
                start();
            }
        });
    }

    window.initMoviePlayer = bindPlayer;

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHeaderSearch();
        initHeroSlider();
        initSearchFilters();
    });
})();
