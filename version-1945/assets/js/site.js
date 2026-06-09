(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  var searchButton = document.querySelector("[data-search-toggle]");
  var searchPanel = document.querySelector("[data-search-panel]");
  var globalSearch = document.querySelector("[data-global-search]");
  var globalResults = document.querySelector("[data-search-results]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  if (searchButton && searchPanel) {
    searchButton.addEventListener("click", function () {
      searchPanel.classList.toggle("is-open");
      if (searchPanel.classList.contains("is-open") && globalSearch) {
        globalSearch.focus();
      }
    });
  }

  function renderSearchResults(query) {
    if (!globalResults) {
      return;
    }

    var keyword = query.trim().toLowerCase();
    if (keyword.length < 1) {
      globalResults.classList.remove("is-open");
      globalResults.innerHTML = "";
      return;
    }

    var data = window.movieSearchData || [];
    var matches = data.filter(function (item) {
      return item.searchText.indexOf(keyword) !== -1;
    }).slice(0, 12);

    globalResults.innerHTML = matches.map(function (item) {
      return [
        '<a class="search-result-item" href="' + item.link + '">',
        '<img src="' + item.cover + '" alt="' + item.title + '">',
        '<span><strong>' + item.title + '</strong><span>' + item.meta + '</span></span>',
        '</a>'
      ].join("");
    }).join("");
    globalResults.classList.toggle("is-open", matches.length > 0);
  }

  if (globalSearch) {
    globalSearch.addEventListener("input", function () {
      renderSearchResults(globalSearch.value);
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var localSearch = document.querySelector("[data-local-search]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var typeFilter = document.querySelector("[data-type-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var keyword = localSearch ? localSearch.value.trim().toLowerCase() : "";
    var year = yearFilter ? yearFilter.value : "";
    var type = typeFilter ? typeFilter.value : "";

    cards.forEach(function (card) {
      var text = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-tags") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-genre") || "",
        card.getAttribute("data-type") || ""
      ].join(" ").toLowerCase();
      var yearValue = card.getAttribute("data-year") || "";
      var typeValue = card.getAttribute("data-type") || "";
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }
      if (year && yearValue !== year) {
        matched = false;
      }
      if (type && typeValue !== type) {
        matched = false;
      }
      card.classList.toggle("hidden-card", !matched);
    });
  }

  [localSearch, yearFilter, typeFilter].forEach(function (control) {
    if (control) {
      control.addEventListener("input", filterCards);
      control.addEventListener("change", filterCards);
    }
  });
})();
