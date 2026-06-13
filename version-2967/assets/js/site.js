(function () {
    'use strict';

    var hlsCallbacks = [];
    var hlsLoading = false;

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            document.body.classList.toggle('is-menu-open', panel.classList.contains('is-open'));
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
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
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function renderSearchResults(input, panel, results) {
        if (!panel) {
            return;
        }

        if (!input.value.trim()) {
            panel.innerHTML = '';
            panel.classList.remove('is-open');
            return;
        }

        if (!results.length) {
            panel.innerHTML = '<p class="search-empty">没有找到相关影片</p>';
            panel.classList.add('is-open');
            return;
        }

        panel.innerHTML = results.slice(0, 8).map(function (movie) {
            return [
                '<a class="search-result-item" href="' + movie.url + '">',
                '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">',
                '    <span>',
                '        <strong>' + escapeHtml(movie.title) + '</strong>',
                '        <span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.category + ' · ★ ' + movie.rating) + '</span>',
                '    </span>',
                '</a>'
            ].join('');
        }).join('');
        panel.classList.add('is-open');
    }

    function initGlobalSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
        var movies = window.MOVIE_SEARCH_INDEX || [];
        if (!forms.length || !movies.length) {
            return;
        }

        forms.forEach(function (form) {
            var input = form.querySelector('[data-search-input]');
            var panel = form.querySelector('[data-search-results]');
            if (!input || !panel) {
                return;
            }

            var currentResults = [];

            input.addEventListener('input', function () {
                var query = normalize(input.value);
                currentResults = movies.filter(function (movie) {
                    var haystack = normalize([
                        movie.title,
                        movie.category,
                        movie.year,
                        movie.region,
                        movie.type,
                        movie.genre,
                        (movie.tags || []).join(' '),
                        movie.oneLine
                    ].join(' '));
                    return haystack.indexOf(query) !== -1;
                });
                renderSearchResults(input, panel, currentResults);
            });

            input.addEventListener('focus', function () {
                if (input.value.trim()) {
                    renderSearchResults(input, panel, currentResults);
                }
            });

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                if (currentResults.length) {
                    window.location.href = currentResults[0].url;
                }
            });
        });

        document.addEventListener('click', function (event) {
            forms.forEach(function (form) {
                if (!form.contains(event.target)) {
                    var panel = form.querySelector('[data-search-results]');
                    if (panel) {
                        panel.classList.remove('is-open');
                    }
                }
            });
        });
    }

    function initListingFilters() {
        var toolbar = document.querySelector('[data-filter-toolbar]');
        var listing = document.querySelector('[data-listing]');
        if (!toolbar || !listing) {
            return;
        }

        var textInput = toolbar.querySelector('[data-filter-text]');
        var selects = Array.prototype.slice.call(toolbar.querySelectorAll('[data-filter-field]'));
        var reset = toolbar.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(listing.querySelectorAll('[data-movie-card]'));
        var empty = document.querySelector('[data-filter-empty]');

        function applyFilters() {
            var text = normalize(textInput ? textInput.value : '');
            var filters = {};
            selects.forEach(function (select) {
                filters[select.getAttribute('data-filter-field')] = normalize(select.value);
            });

            var visibleCount = 0;
            cards.forEach(function (card) {
                var searchable = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));

                var matchesText = !text || searchable.indexOf(text) !== -1;
                var matchesSelects = Object.keys(filters).every(function (field) {
                    var filterValue = filters[field];
                    if (!filterValue) {
                        return true;
                    }
                    return normalize(card.getAttribute('data-' + field)) === filterValue;
                });
                var visible = matchesText && matchesSelects;
                card.classList.toggle('is-hidden', !visible);
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.hidden = visibleCount > 0;
            }
        }

        if (textInput) {
            textInput.addEventListener('input', applyFilters);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });
        if (reset) {
            reset.addEventListener('click', function () {
                if (textInput) {
                    textInput.value = '';
                }
                selects.forEach(function (select) {
                    select.value = '';
                });
                applyFilters();
            });
        }
    }

    function loadHlsLibrary(callback) {
        if (window.Hls) {
            callback(true);
            return;
        }

        hlsCallbacks.push(callback);
        if (hlsLoading) {
            return;
        }

        hlsLoading = true;
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.onload = function () {
            hlsLoading = false;
            flushHlsCallbacks(true);
        };
        script.onerror = function () {
            hlsLoading = false;
            flushHlsCallbacks(false);
        };
        document.head.appendChild(script);
    }

    function flushHlsCallbacks(success) {
        var callbacks = hlsCallbacks.slice();
        hlsCallbacks = [];
        callbacks.forEach(function (callback) {
            callback(success);
        });
    }

    function playVideo(video, source, shell, status) {
        function mark(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function requestPlay() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    mark('浏览器阻止了自动播放，请再次点击播放器播放。');
                });
            }
        }

        if (!source) {
            mark('当前影片没有可用播放源。');
            return;
        }

        shell.classList.add('is-loading');
        mark('正在加载播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            shell.classList.add('is-playing');
            requestPlay();
            return;
        }

        loadHlsLibrary(function (loaded) {
            if (loaded && window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    shell.classList.add('is-playing');
                    mark('播放源已就绪。');
                    requestPlay();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        mark('播放源加载失败，请刷新后重试。');
                    }
                });
                video._hlsInstance = hls;
            } else {
                video.src = source;
                shell.classList.add('is-playing');
                mark('正在尝试使用浏览器原生能力播放。');
                requestPlay();
            }
        });
    }

    function initPlayers() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-player-start]'));
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var shell = button.closest('[data-player-shell]');
                if (!shell) {
                    return;
                }
                var video = shell.querySelector('video');
                var status = shell.querySelector('[data-player-status]');
                if (!video) {
                    return;
                }
                playVideo(video, video.getAttribute('data-src'), shell, status);
            });
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initGlobalSearch();
        initListingFilters();
        initPlayers();
    });
}());
