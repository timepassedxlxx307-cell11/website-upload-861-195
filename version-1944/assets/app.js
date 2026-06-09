const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

ready(() => {
  initMobileMenu();
  initHeroCarousel();
  initFilters();
  initPlayer();
  initImageFallbacks();
});

function initMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", () => {
    panel.classList.toggle("open");
  });
}

function initHeroCarousel() {
  const carousel = document.querySelector("[data-hero-carousel]");

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
  const prev = carousel.querySelector("[data-hero-prev]");
  const next = carousel.querySelector("[data-hero-next]");
  let current = 0;
  let timer = null;

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === current);
    });
  };

  const restart = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => goTo(current + 1), 5200);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      goTo(index);
      restart();
    });
  });

  prev?.addEventListener("click", () => {
    goTo(current - 1);
    restart();
  });

  next?.addEventListener("click", () => {
    goTo(current + 1);
    restart();
  });

  goTo(0);
  restart();
}

function initFilters() {
  const cardLists = Array.from(document.querySelectorAll("[data-card-list]"));
  const tableLists = Array.from(document.querySelectorAll("[data-table-list]"));

  if (!cardLists.length && !tableLists.length) {
    return;
  }

  const input = document.querySelector("[data-filter-input]");
  const selects = Array.from(document.querySelectorAll("[data-filter-select]"));
  const reset = document.querySelector("[data-filter-reset]");
  const count = document.querySelector("[data-filter-count]");
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  if (input && initialQuery) {
    input.value = initialQuery;
  }

  const getText = (element) => {
    const dataText = [
      element.dataset.title,
      element.dataset.year,
      element.dataset.region,
      element.dataset.type,
      element.dataset.genre,
      element.dataset.category,
      element.textContent,
    ];
    return dataText.filter(Boolean).join(" ").toLowerCase();
  };

  const apply = () => {
    const keyword = (input?.value || "").trim().toLowerCase();
    const filters = new Map();

    selects.forEach((select) => {
      filters.set(select.dataset.filterSelect, select.value);
    });

    let visible = 0;
    let total = 0;

    const check = (element) => {
      total += 1;
      const text = getText(element);
      const matchKeyword = !keyword || text.includes(keyword);
      const matchSelects = Array.from(filters.entries()).every(([key, value]) => {
        if (!value) {
          return true;
        }
        return (element.dataset[key] || "").includes(value);
      });
      const show = matchKeyword && matchSelects;
      element.classList.toggle("hidden-by-filter", !show);
      if (show) {
        visible += 1;
      }
    };

    cardLists.forEach((list) => {
      Array.from(list.children).forEach(check);
    });

    tableLists.forEach((table) => {
      Array.from(table.querySelectorAll("tbody tr")).forEach(check);
    });

    if (count) {
      count.textContent = `当前显示 ${visible} / ${total} 条内容`;
    }
  };

  input?.addEventListener("input", apply);
  selects.forEach((select) => select.addEventListener("change", apply));
  reset?.addEventListener("click", () => {
    if (input) {
      input.value = "";
    }
    selects.forEach((select) => {
      select.value = "";
    });
    apply();
  });

  apply();
}

async function initPlayer() {
  const shell = document.querySelector("[data-player-shell]");
  const video = document.querySelector("[data-player]");
  const button = document.querySelector("[data-player-button]");
  const message = document.querySelector("[data-player-message]");

  if (!shell || !video || !button) {
    return;
  }

  let started = false;
  let hlsInstance = null;
  const source = video.dataset.src;

  const setMessage = (text) => {
    if (message) {
      message.textContent = text;
    }
  };

  const play = async () => {
    if (!started) {
      started = true;
      setMessage("正在加载播放源...");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        try {
          const module = await import("./hls-vendor-bbsaiqh1.js");
          const Hls = module.H;

          if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          } else {
            throw new Error("当前浏览器不支持 HLS 播放");
          }
        } catch (error) {
          started = false;
          setMessage(error.message || "播放组件加载失败");
          return;
        }
      }

      video.controls = true;
      button.classList.add("hidden");
    }

    try {
      await video.play();
      setMessage("播放中");
    } catch (error) {
      setMessage("浏览器阻止了自动播放，请再次点击播放器开始播放。 ");
    }
  };

  button.addEventListener("click", play);
  video.addEventListener("click", () => {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });

  window.addEventListener("beforeunload", () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

function initImageFallbacks() {
  const images = Array.from(document.querySelectorAll("img"));

  images.forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("is-missing");
    });
  });
}
