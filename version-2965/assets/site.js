(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.site-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
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

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var keyword = filterRoot.querySelector('[data-filter-keyword]');
    var region = filterRoot.querySelector('[data-filter-region]');
    var type = filterRoot.querySelector('[data-filter-type]');
    var year = filterRoot.querySelector('[data-filter-year]');
    var clearButton = filterRoot.querySelector('[data-filter-clear]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.video-card'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var q = normalize(keyword && keyword.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-keywords'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var ok = true;

        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (r && cardRegion.indexOf(r) === -1) {
          ok = false;
        }
        if (t && cardType.indexOf(t) === -1) {
          ok = false;
        }
        if (y && cardYear !== y) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
      });
    }

    [keyword, region, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener('input', applyFilters);
        node.addEventListener('change', applyFilters);
      }
    });

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (keyword) {
          keyword.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        if (year) {
          year.value = '';
        }
        applyFilters();
      });
    }
  }

  var searchRoot = document.querySelector('[data-search-page]');

  if (searchRoot && window.SEARCH_INDEX) {
    var searchInput = searchRoot.querySelector('[data-search-input]');
    var results = searchRoot.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function renderSearch(query) {
      var q = String(query || '').toLowerCase().trim();
      var matches = window.SEARCH_INDEX.filter(function (item) {
        if (!q) {
          return false;
        }
        return item.search.indexOf(q) !== -1;
      }).slice(0, 80);

      if (!results) {
        return;
      }

      if (!q) {
        results.innerHTML = '';
        return;
      }

      if (!matches.length) {
        results.innerHTML = '<div class="search-page-box"><p>没有找到匹配影片。</p></div>';
        return;
      }

      results.innerHTML = matches.map(function (item) {
        return '<article class="search-result-card">'
          + '<a href="' + item.url + '"><img src="' + item.cover + '" alt="' + item.title + '" loading="lazy" onerror="this.classList.add(\'is-missing\');"></a>'
          + '<div>'
          + '<h2><a href="' + item.url + '">' + item.title + '</a></h2>'
          + '<p>' + item.meta + '</p>'
          + '<p>' + item.summary + '</p>'
          + '<a class="section-more" href="' + item.url + '">立即观看</a>'
          + '</div>'
          + '</article>';
      }).join('');
    }

    if (searchInput) {
      searchInput.value = initialQuery;
      searchInput.addEventListener('input', function () {
        renderSearch(searchInput.value);
      });
    }

    renderSearch(initialQuery);
  }
}());
