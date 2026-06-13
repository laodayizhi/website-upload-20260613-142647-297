(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupMenu() {
    var toggle = one('.menu-toggle');
    var menu = one('.mobile-nav');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var willOpen = menu.hasAttribute('hidden');
      if (willOpen) {
        menu.removeAttribute('hidden');
      } else {
        menu.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', String(willOpen));
    });
  }

  function setupHero() {
    var slider = one('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = all('.hero-slide', slider);
    var dots = all('.hero-dot', slider);
    var prev = one('.hero-control.prev', slider);
    var next = one('.hero-control.next', slider);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    var inputs = all('.page-filter');
    if (!inputs.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    inputs.forEach(function (input) {
      if (initial) {
        input.value = initial;
      }
      input.addEventListener('input', function () {
        applyFilter(input.value);
      });
    });

    all('.clear-filter').forEach(function (button) {
      button.addEventListener('click', function () {
        inputs.forEach(function (input) {
          input.value = '';
        });
        applyFilter('');
      });
    });

    applyFilter(initial);
  }

  function applyFilter(value) {
    var keyword = String(value || '').trim().toLowerCase();
    var cards = all('.searchable-card');
    var visible = 0;
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      var match = !keyword || text.indexOf(keyword) !== -1;
      card.hidden = !match;
      if (match) {
        visible += 1;
      }
    });
    all('.empty-state').forEach(function (node) {
      node.hidden = visible !== 0;
    });
  }

  window.initMoviePlayer = function (mediaUrl) {
    var video = one('#movieVideo');
    var layer = one('.play-layer');
    var playButton = one('.video-play-button');
    var started = false;
    var hls = null;

    if (!video || !mediaUrl) {
      return;
    }

    function start() {
      if (started) {
        return;
      }
      started = true;
      if (layer) {
        layer.classList.add('is-hidden');
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener('click', start);
    }
    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.preventDefault();
        start();
      });
    }
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
