(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initQuerySearch();
    initPlayers();
  });

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
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
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]'));
    scopes.forEach(function (scope) {
      var root = scope.parentElement || document;
      var input = scope.querySelector('[data-movie-search]');
      var clear = scope.querySelector('[data-filter-clear]');
      var empty = scope.querySelector('[data-filter-empty]');
      var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
      if (!input || !cards.length) {
        return;
      }

      function apply(value) {
        var query = normalize(value);
        var visible = 0;
        cards.forEach(function (card) {
          var blob = normalize(card.getAttribute('data-search') || card.textContent || '');
          var match = !query || blob.indexOf(query) !== -1;
          card.style.display = match ? '' : 'none';
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      input.addEventListener('input', function () {
        apply(input.value);
      });
      if (clear) {
        clear.addEventListener('click', function () {
          input.value = '';
          apply('');
          input.focus();
        });
      }
      scope.querySelectorAll('[data-filter-value]').forEach(function (button) {
        button.addEventListener('click', function () {
          input.value = button.getAttribute('data-filter-value') || '';
          apply(input.value);
        });
      });
    });
  }

  function initQuerySearch() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (!query) {
      return;
    }
    var input = document.querySelector('[data-movie-search]');
    if (input) {
      input.value = query;
      input.dispatchEvent(new Event('input'));
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('[data-video]');
      var button = player.querySelector('[data-play-button]');
      var status = player.querySelector('[data-player-status]');
      if (!video || !button) {
        return;
      }
      var hls = null;
      var loaded = false;

      function setStatus(text) {
        if (status) {
          status.textContent = text || '';
        }
      }

      function playVideo() {
        var src = video.getAttribute('data-src');
        if (!src) {
          setStatus('当前播放暂不可用，请稍后重试。');
          return;
        }
        button.classList.add('hidden');
        video.setAttribute('controls', 'controls');
        setStatus('正在加载高清播放内容…');

        if (loaded) {
          video.play().catch(function () {
            setStatus('请再次点击播放器开始播放。');
          });
          return;
        }
        loaded = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(function () {
              setStatus('');
            }).catch(function () {
              setStatus('请再次点击播放器开始播放。');
            });
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('当前播放暂不可用，请稍后重试。');
              if (hls) {
                hls.destroy();
                hls = null;
              }
              loaded = false;
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.addEventListener('loadedmetadata', function () {
            video.play().then(function () {
              setStatus('');
            }).catch(function () {
              setStatus('请再次点击播放器开始播放。');
            });
          }, { once: true });
          video.load();
        } else {
          video.src = src;
          video.play().catch(function () {
            setStatus('请使用支持 HLS 的浏览器播放。');
          });
        }
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('click', function () {
        if (!loaded) {
          playVideo();
        }
      });
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }
}());
