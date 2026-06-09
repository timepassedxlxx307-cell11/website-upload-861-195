(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        var slider = document.querySelector(".hero-slider");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dots button"));
            var prev = slider.querySelector(".hero-arrow.prev");
            var next = slider.querySelector(".hero-arrow.next");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

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
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
            });
            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var regionSelect = document.querySelector("[data-region-filter]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search], .movie-row[data-search]"));
        var noResult = document.querySelector(".no-result");

        function getQueryParam(name) {
            var params = new URLSearchParams(window.location.search);
            return params.get(name) || "";
        }

        if (filterInput) {
            var initial = getQueryParam("q");
            if (initial) {
                filterInput.value = initial;
            }
        }

        function applyFilter() {
            var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
            var region = regionSelect ? regionSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var cardRegion = card.getAttribute("data-region") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var ok = (!keyword || haystack.indexOf(keyword) !== -1) && (!region || cardRegion === region) && (!year || cardYear === year);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (noResult) {
                noResult.classList.toggle("is-visible", visible === 0);
            }
        }

        if (filterInput || regionSelect || yearSelect) {
            if (filterInput) {
                filterInput.addEventListener("input", applyFilter);
            }
            if (regionSelect) {
                regionSelect.addEventListener("change", applyFilter);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", applyFilter);
            }
            applyFilter();
        }
    });
})();
