(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.hasAttribute('hidden');
      if (isOpen) {
        mobilePanel.removeAttribute('hidden');
      } else {
        mobilePanel.setAttribute('hidden', '');
      }
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      if (timer) {
        window.clearInterval(timer);
      }
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var filterInput = document.querySelector('.page-filter-input');
  var filterSelect = document.querySelector('.page-filter-select');
  var filterChips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));
  var emptyState = document.querySelector('.empty-state');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' '));
  }

  function applyFilter(extraValue) {
    var inputValue = filterInput ? filterInput.value : '';
    var selectValue = filterSelect ? filterSelect.value : '';
    var needle = normalize([inputValue, selectValue, extraValue || ''].join(' '));
    var visibleCount = 0;

    cards.forEach(function (card) {
      var matched = !needle || cardText(card).indexOf(needle) !== -1;
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  if (filterInput) {
    filterInput.value = query;
    filterInput.addEventListener('input', function () {
      filterChips.forEach(function (chip) {
        chip.classList.remove('active');
      });
      applyFilter('');
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', function () {
      applyFilter('');
    });
  }

  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var active = chip.classList.contains('active');
      filterChips.forEach(function (item) {
        item.classList.remove('active');
      });
      if (!active) {
        chip.classList.add('active');
        if (filterInput) {
          filterInput.value = chip.getAttribute('data-filter') || '';
        }
      } else if (filterInput) {
        filterInput.value = '';
      }
      applyFilter('');
    });
  });

  if (cards.length && query) {
    applyFilter('');
  }
})();
