
(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  selectAll('img[data-fallback]').forEach(function (img) {
    img.addEventListener('error', function () {
      var shell = img.closest('.poster-wrap, .compact-poster, .ranking-poster, .detail-poster, .hero-mini, .hero-slide');
      if (shell) {
        shell.classList.add('is-fallback');
      }
    }, { once: true });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
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
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  selectAll('[data-filter-form]').forEach(function (form) {
    var keyword = form.querySelector('[data-filter-keyword]');
    var year = form.querySelector('[data-filter-year]');
    var type = form.querySelector('[data-filter-type]');
    var section = form.closest('.content-section');
    var cards = selectAll('[data-card]', section);
    var empty = section.querySelector('[data-empty-state]');

    function applyFilter() {
      var q = (keyword && keyword.value || '').trim().toLowerCase();
      var y = year && year.value || '';
      var t = type && type.value || '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var ok = (!q || haystack.indexOf(q) !== -1) && (!y || card.getAttribute('data-year') === y) && (!t || card.getAttribute('data-type') === t);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keyword, year, type].forEach(function (item) {
      if (item) {
        item.addEventListener('input', applyFilter);
        item.addEventListener('change', applyFilter);
      }
    });
  });
})();
