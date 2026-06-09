(() => {
    const sliders = document.querySelectorAll('[data-slider]');

    sliders.forEach((slider) => {
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        const dots = Array.from(slider.querySelectorAll('.hero-dot'));
        let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
        let timer = null;

        const activate = (nextIndex) => {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, current) => {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach((dot, current) => {
                dot.classList.toggle('is-active', current === index);
            });
        };

        const start = () => {
            stop();
            timer = window.setInterval(() => activate(index + 1), 5200);
        };

        const stop = () => {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        dots.forEach((dot, current) => {
            dot.addEventListener('click', () => {
                activate(current);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);

        if (slides.length > 1) {
            start();
        }
    });

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const applyFilters = (scope) => {
        const searchInput = scope.querySelector('[data-page-search]');
        const regionSelect = scope.querySelector('[data-region-select]');
        const activeButton = scope.querySelector('[data-filter-bar] button.active');
        const searchTerm = normalize(searchInput ? searchInput.value : '');
        const regionValue = regionSelect ? regionSelect.value : 'all';
        const filterValue = activeButton ? activeButton.dataset.filterValue : 'all';
        const cards = scope.querySelectorAll('[data-card]');

        cards.forEach((card) => {
            const text = normalize(card.dataset.search);
            const type = card.dataset.type || '';
            const region = card.dataset.region || '';
            const typeMatched = filterValue === 'all' || type.includes(filterValue) || text.includes(normalize(filterValue));
            const regionMatched = regionValue === 'all' || region === regionValue;
            const searchMatched = !searchTerm || text.includes(searchTerm);
            card.classList.toggle('is-hidden', !(typeMatched && regionMatched && searchMatched));
        });
    };

    document.querySelectorAll('[data-search-scope]').forEach((scope) => {
        const searchInput = scope.querySelector('[data-page-search]');
        const regionSelect = scope.querySelector('[data-region-select]');
        const buttons = scope.querySelectorAll('[data-filter-bar] button');
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');

        if (query && searchInput) {
            searchInput.value = query;
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => applyFilters(scope));
        }

        if (regionSelect) {
            regionSelect.addEventListener('change', () => applyFilters(scope));
        }

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                buttons.forEach((item) => item.classList.remove('active'));
                button.classList.add('active');
                applyFilters(scope);
            });
        });

        applyFilters(scope);
    });
})();
