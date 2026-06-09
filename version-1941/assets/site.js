(() => {
    const menuButtons = document.querySelectorAll("[data-menu-button]");

    menuButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const target = document.getElementById(button.dataset.menuButton);
            if (target) {
                target.classList.toggle("is-open");
            }
        });
    });

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const previous = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let active = 0;
        let timer = null;

        const show = (index) => {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === active);
            });

            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        };

        const restart = () => {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(() => show(active + 1), 5000);
        };

        if (previous) {
            previous.addEventListener("click", () => {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                show(active + 1);
                restart();
            });
        }

        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                show(Number(dot.dataset.heroDot || 0));
                restart();
            });
        });

        show(0);
        restart();
    }

    const normalize = (value) => String(value || "").trim().toLowerCase();

    document.querySelectorAll("[data-filter-scope]").forEach((panel) => {
        const input = panel.querySelector("[data-search-input]");
        const selects = Array.from(panel.querySelectorAll("[data-filter-select]"));
        const clearButton = panel.querySelector("[data-clear-filters]");
        const grid = panel.nextElementSibling;

        if (!grid) {
            return;
        }

        const cards = Array.from(grid.querySelectorAll("[data-card]"));

        const apply = () => {
            const query = normalize(input ? input.value : "");
            const selected = new Map(selects.map((select) => [select.dataset.filterSelect, normalize(select.value)]));

            cards.forEach((card) => {
                const text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.dataset.category,
                ].join(" "));

                const matchedQuery = !query || text.includes(query);
                const matchedFilters = Array.from(selected.entries()).every(([key, value]) => {
                    if (!value) {
                        return true;
                    }

                    return normalize(card.dataset[key]).includes(value);
                });

                card.hidden = !(matchedQuery && matchedFilters);
            });
        };

        if (input) {
            input.addEventListener("input", apply);
        }

        selects.forEach((select) => select.addEventListener("change", apply));

        if (clearButton) {
            clearButton.addEventListener("click", () => {
                if (input) {
                    input.value = "";
                }

                selects.forEach((select) => {
                    select.value = "";
                });

                apply();
            });
        }
    });
})();
