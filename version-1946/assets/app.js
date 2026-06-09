(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('#hero-carousel');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    const prev = carousel.querySelector('.hero-prev');
    const next = carousel.querySelector('.hero-next');
    let current = 0;
    let timer;

    const showSlide = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = () => {
      timer = window.setInterval(() => showSlide(current + 1), 5200);
    };

    const reset = () => {
      window.clearInterval(timer);
      start();
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        reset();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        showSlide(current - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        showSlide(current + 1);
        reset();
      });
    }

    start();
  }

  const localFilter = document.querySelector('.local-filter-input');

  if (localFilter) {
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    localFilter.addEventListener('input', () => {
      const keyword = localFilter.value.trim().toLowerCase();
      cards.forEach((card) => {
        const content = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.textContent
        ].join(' ').toLowerCase();
        card.style.display = content.includes(keyword) ? '' : 'none';
      });
    });
  }

  const searchInput = document.querySelector('#search-page-input');
  const searchResults = document.querySelector('#search-results');

  if (searchInput && searchResults && window.SEARCH_INDEX) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    searchInput.value = query;

    const cardHtml = (item) => `
      <article class="movie-card" data-title="${escapeHtml(item.title)}" data-region="${escapeHtml(item.region)}" data-type="${escapeHtml(item.type)}" data-year="${escapeHtml(item.year)}" data-genre="${escapeHtml(item.genre)}">
        <a class="poster-link" href="./${escapeHtml(item.url)}" aria-label="${escapeHtml(item.title)}">
          <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" loading="lazy">
          <span class="poster-shade"></span>
          <span class="poster-play">▶</span>
          <span class="type-pill">${escapeHtml(item.type)}</span>
        </a>
        <div class="movie-card-body">
          <h3><a href="./${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h3>
          <p>${escapeHtml(item.oneLine)}</p>
          <div class="movie-meta">
            <span>${escapeHtml(item.region)}</span>
            <span>${escapeHtml(item.year)}</span>
          </div>
        </div>
      </article>`;

    const render = () => {
      const keyword = searchInput.value.trim().toLowerCase();
      const source = window.SEARCH_INDEX;
      const items = keyword
        ? source.filter((item) => [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase().includes(keyword)).slice(0, 120)
        : source.slice(0, 30);
      searchResults.innerHTML = items.map(cardHtml).join('');
    };

    searchInput.addEventListener('input', render);
    render();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
