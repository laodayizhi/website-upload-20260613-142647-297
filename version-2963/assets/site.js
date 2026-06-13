(function () {
    var hlsLoadPromise = null;

    function queryAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        var search = document.querySelector('[data-nav-search]');
        if (!toggle || !nav || !search) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
            search.classList.toggle('open');
        });
    }

    function initSearchRedirects() {
        queryAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var target = './search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function getCardText(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
    }

    function initFilters() {
        queryAll('[data-filter-panel]').forEach(function (panel) {
            var scope = panel.getAttribute('data-filter-panel');
            var root = scope ? document.querySelector(scope) : document;
            if (!root) {
                return;
            }
            var cards = queryAll('.movie-card', root);
            var searchInput = panel.querySelector('[data-filter-search]');
            var typeSelect = panel.querySelector('[data-filter-type]');
            var regionSelect = panel.querySelector('[data-filter-region]');
            var yearSelect = panel.querySelector('[data-filter-year]');
            var resetButton = panel.querySelector('[data-filter-reset]');
            var noResult = document.querySelector('[data-no-result="' + scope + '"]');

            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : '';
            }

            function applyFilter() {
                var keyword = valueOf(searchInput);
                var type = valueOf(typeSelect);
                var region = valueOf(regionSelect);
                var year = valueOf(yearSelect);
                var visible = 0;
                cards.forEach(function (card) {
                    var cardText = getCardText(card);
                    var matchKeyword = !keyword || cardText.indexOf(keyword) !== -1;
                    var matchType = !type || (card.getAttribute('data-type') || '').toLowerCase() === type;
                    var matchRegion = !region || (card.getAttribute('data-region') || '').toLowerCase() === region;
                    var matchYear = !year || (card.getAttribute('data-year') || '').toLowerCase() === year;
                    var matched = matchKeyword && matchType && matchRegion && matchYear;
                    card.classList.toggle('hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (noResult) {
                    noResult.classList.toggle('show', visible === 0);
                }
            }

            [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', applyFilter);
                    element.addEventListener('change', applyFilter);
                }
            });

            if (resetButton) {
                resetButton.addEventListener('click', function () {
                    [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (element) {
                        if (element) {
                            element.value = '';
                        }
                    });
                    applyFilter();
                });
            }

            if (searchInput) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get('q');
                if (query) {
                    searchInput.value = query;
                }
            }
            applyFilter();
        });
    }

    function initSliders() {
        queryAll('[data-slider]').forEach(function (slider) {
            var slides = queryAll('[data-slide]', slider);
            var dots = queryAll('[data-slide-dot]', slider);
            var prev = slider.querySelector('[data-slide-prev]');
            var next = slider.querySelector('[data-slide-next]');
            if (!slides.length) {
                return;
            }
            var active = 0;
            var timer = null;

            function show(index) {
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, idx) {
                    slide.classList.toggle('active', idx === active);
                });
                dots.forEach(function (dot, idx) {
                    dot.classList.toggle('active', idx === active);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(active + 1);
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
                    show(active - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(active + 1);
                    start();
                });
            }
            dots.forEach(function (dot, idx) {
                dot.addEventListener('click', function () {
                    show(idx);
                    start();
                });
            });
            slider.addEventListener('mouseenter', stop);
            slider.addEventListener('mouseleave', start);
            show(0);
            start();
        });
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsLoadPromise) {
            return hlsLoadPromise;
        }
        hlsLoadPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error('hls unavailable'));
                }
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsLoadPromise;
    }

    function bindVideo(video) {
        if (!video || video.getAttribute('data-ready') === 'true') {
            return Promise.resolve();
        }
        var source = video.getAttribute('data-src');
        if (!source) {
            return Promise.resolve();
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.setAttribute('data-ready', 'true');
            video.load();
            return Promise.resolve();
        }
        return loadHlsLibrary().then(function (Hls) {
            if (Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video.hlsInstance = hls;
                video.setAttribute('data-ready', 'true');
            } else {
                video.src = source;
                video.setAttribute('data-ready', 'true');
                video.load();
            }
        }).catch(function () {
            video.src = source;
            video.setAttribute('data-ready', 'true');
            video.load();
        });
    }

    function initPlayers() {
        queryAll('.video-shell').forEach(function (shell) {
            var video = shell.querySelector('video[data-src]');
            var button = shell.querySelector('[data-play-button]');
            if (!video) {
                return;
            }
            bindVideo(video);

            function playVideo() {
                bindVideo(video).then(function () {
                    var promise = video.play();
                    if (promise && typeof promise.catch === 'function') {
                        promise.catch(function () {});
                    }
                });
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
            video.addEventListener('ended', function () {
                shell.classList.remove('is-playing');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initSearchRedirects();
        initFilters();
        initSliders();
        initPlayers();
    });
})();
