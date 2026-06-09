(function () {
  var menuButton = document.querySelector('[data-mobile-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var previous = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  if (slides.length) {
    showSlide(0);
    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(currentSlide - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(currentSlide + 1);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  var filterForm = document.querySelector('[data-filter-form]');
  var cardGrid = document.querySelector('[data-card-grid]');
  if (filterForm && cardGrid) {
    var filterInput = filterForm.querySelector('[data-filter-input]');
    var regionSelect = filterForm.querySelector('[data-filter-region]');
    var typeSelect = filterForm.querySelector('[data-filter-type]');
    var yearSelect = filterForm.querySelector('[data-filter-year]');
    var noResults = document.querySelector('[data-no-results]');
    var cards = Array.prototype.slice.call(cardGrid.querySelectorAll('[data-movie-card]'));

    function applyFilters() {
      var keyword = normalizeText(filterInput && filterInput.value);
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalizeText(card.getAttribute('data-search'));
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          matched = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          matched = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle('is-visible', visible === 0);
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      filterForm.addEventListener(eventName, applyFilters);
    });
  }

  var globalSearchForms = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));
  globalSearchForms.forEach(function (form) {
    var input = form.querySelector('input');
    var panel = form.querySelector('[data-search-panel]');
    if (!input || !panel || !Array.isArray(window.SEARCH_MOVIES)) {
      return;
    }

    function renderSearch() {
      var keyword = normalizeText(input.value);
      if (!keyword) {
        panel.classList.remove('is-open');
        panel.innerHTML = '';
        return;
      }
      var items = window.SEARCH_MOVIES.filter(function (item) {
        return normalizeText(item.title + ' ' + item.region + ' ' + item.genre + ' ' + item.tags + ' ' + item.year).indexOf(keyword) !== -1;
      }).slice(0, 12);

      if (!items.length) {
        panel.innerHTML = '<div class="bg-white rounded-xl shadow-xl p-4 text-sm text-gray-600">没有找到匹配影片</div>';
        panel.classList.add('is-open');
        return;
      }

      panel.innerHTML = '<div class="bg-white rounded-xl shadow-xl overflow-hidden">' + items.map(function (item) {
        return '<a class="flex gap-3 p-3 hover:bg-gray-100 transition-colors" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + item.title + '" class="w-20 h-12 object-cover rounded-lg flex-shrink-0">' +
          '<span class="min-w-0"><strong class="block text-gray-900 line-clamp-1">' + item.title + '</strong>' +
          '<span class="block text-xs text-gray-500 line-clamp-1">' + item.region + ' · ' + item.year + ' · ' + item.genre + '</span></span></a>';
      }).join('') + '</div>';
      panel.classList.add('is-open');
    }

    input.addEventListener('input', renderSearch);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var firstLink = panel.querySelector('a');
      if (firstLink) {
        window.location.href = firstLink.getAttribute('href');
      }
    });
    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        panel.classList.remove('is-open');
      }
    });
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.querySelector('[data-player-video]');
  var button = document.querySelector('[data-player-button]');
  if (!video || !button || !streamUrl) {
    return;
  }

  var attached = false;
  var hlsInstance = null;

  function attachStream() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function startPlayback() {
    attachStream();
    video.controls = true;
    button.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
