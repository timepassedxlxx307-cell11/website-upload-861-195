(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = qs('[data-mobile-toggle]');
        var nav = qs('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var root = qs('[data-hero-slider]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        var dots = qsa('[data-hero-dot]', root);
        var prev = qs('[data-hero-prev]', root);
        var next = qs('[data-hero-next]', root);
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
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
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function applyListState(container) {
        if (!container) {
            return;
        }
        var cards = qsa('.searchable-card', container);
        var empty = qs('[data-empty]', container);
        var visible = cards.some(function (card) {
            return card.style.display !== 'none';
        });
        if (empty) {
            empty.hidden = visible;
        }
    }

    function setupSearch() {
        qsa('[data-search-box]').forEach(function (input) {
            var container = qs(input.getAttribute('data-target'));
            if (!container) {
                return;
            }
            input.addEventListener('input', function () {
                var keyword = normalize(input.value);
                qsa('.searchable-card', container).forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.textContent
                    ].join(' '));
                    var matched = !keyword || haystack.indexOf(keyword) !== -1;
                    card.dataset.searchMatched = matched ? '1' : '0';
                    card.style.display = matched && card.dataset.filterMatched !== '0' ? '' : 'none';
                });
                applyListState(container);
            });
        });
    }

    function setupFilters() {
        qsa('[data-filter-group]').forEach(function (group) {
            var container = qs(group.getAttribute('data-target'));
            if (!container) {
                return;
            }
            qsa('[data-filter-value]', group).forEach(function (button) {
                button.addEventListener('click', function () {
                    var value = button.getAttribute('data-filter-value');
                    qsa('[data-filter-value]', group).forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    qsa('.searchable-card', container).forEach(function (card) {
                        var type = card.getAttribute('data-type') || '';
                        var matched = value === '全部' || type.indexOf(value) !== -1;
                        card.dataset.filterMatched = matched ? '1' : '0';
                        card.style.display = matched && card.dataset.searchMatched !== '0' ? '' : 'none';
                    });
                    applyListState(container);
                });
            });
        });
    }

    window.initVideoPlayer = function (videoId, coverId, streamUrl) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        if (!video || !streamUrl) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;
        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function play() {
            load();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupSearch();
        setupFilters();
    });
})();
