(function() {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var navToggle = $('[data-mobile-toggle]');
    var mobileNav = $('[data-mobile-nav]');
    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = $('[data-hero]');
    if (hero) {
        var slides = $all('[data-hero-slide]', hero);
        var dots = $all('[data-hero-dot]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        var prev = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        if (prev) {
            prev.addEventListener('click', function() {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener('click', function() {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterMovies() {
        var input = $('[data-movie-filter]');
        var yearSelect = $('[data-year-filter]');
        var cards = $all('[data-movie-card]');
        var empty = $('[data-empty-state]');
        var keyword = normalize(input ? input.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;

        cards.forEach(function(card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-keywords')
            ].join(' '));
            var passKeyword = !keyword || text.indexOf(keyword) !== -1;
            var passYear = !year || card.getAttribute('data-year') === year;
            var shouldShow = passKeyword && passYear;
            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    function sortMovies() {
        var select = $('[data-sort-select]');
        var grid = $('[data-sort-grid]');
        if (!select || !grid) {
            return;
        }
        var cards = $all('[data-movie-card]', grid);
        var mode = select.value;
        var sorted = cards.slice();
        sorted.sort(function(a, b) {
            var ay = parseInt(a.getAttribute('data-year'), 10) || 0;
            var by = parseInt(b.getAttribute('data-year'), 10) || 0;
            var at = a.getAttribute('data-title') || '';
            var bt = b.getAttribute('data-title') || '';
            if (mode === 'year-desc') {
                return by - ay || at.localeCompare(bt, 'zh-Hans-CN');
            }
            if (mode === 'year-asc') {
                return ay - by || at.localeCompare(bt, 'zh-Hans-CN');
            }
            if (mode === 'title-asc') {
                return at.localeCompare(bt, 'zh-Hans-CN');
            }
            return 0;
        });
        sorted.forEach(function(card) {
            grid.appendChild(card);
        });
        filterMovies();
    }

    var filterInput = $('[data-movie-filter]');
    var yearFilter = $('[data-year-filter]');
    var sortSelect = $('[data-sort-select]');
    if (filterInput) {
        if (document.body.hasAttribute('data-search-page') || $('[data-search-page]')) {
            var query = new URLSearchParams(window.location.search).get('q');
            if (query) {
                filterInput.value = query;
            }
        }
        filterInput.addEventListener('input', filterMovies);
        filterMovies();
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', filterMovies);
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', sortMovies);
    }

    window.initMoviePlayer = function(movieStream) {
        var video = document.getElementById('movieVideo');
        var overlay = document.getElementById('playOverlay');
        if (!video || !overlay || !movieStream) {
            return;
        }
        var hls = null;
        var ready = false;

        function attach() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = movieStream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(movieStream);
                hls.attachMedia(video);
            } else {
                video.src = movieStream;
            }
            video.controls = true;
        }

        function play() {
            attach();
            overlay.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function() {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function() {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('beforeunload', function() {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
