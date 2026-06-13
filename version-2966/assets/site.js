(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var navToggle = document.querySelector('[data-nav-toggle]');
        var navPanel = document.querySelector('[data-nav-panel]');
        if (navToggle && navPanel) {
            navToggle.addEventListener('click', function () {
                navPanel.classList.toggle('open');
            });
        }

        document.addEventListener('error', function (event) {
            if (event.target && event.target.tagName === 'IMG') {
                event.target.classList.add('image-missing');
            }
        }, true);

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var index = 0;
            var timer;

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

            function schedule() {
                clearInterval(timer);
                timer = setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                    schedule();
                });
            });

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    schedule();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    schedule();
                });
            }

            show(0);
            schedule();
        });

        var searchRoot = document.querySelector('[data-search-page]');
        if (searchRoot) {
            var input = searchRoot.querySelector('[data-search-input]');
            var cards = Array.prototype.slice.call(searchRoot.querySelectorAll('[data-movie-card]'));
            var empty = searchRoot.querySelector('[data-empty-result]');
            var params = new URLSearchParams(window.location.search);
            var initial = params.get('q') || '';
            if (input && initial) {
                input.value = initial;
            }

            function normalize(value) {
                return String(value || '').toLowerCase().replace(/\s+/g, '');
            }

            function applySearch() {
                var value = normalize(input ? input.value : '');
                var hasVisible = false;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year')
                    ].join(' '));
                    var visible = !value || haystack.indexOf(value) !== -1;
                    card.style.display = visible ? '' : 'none';
                    if (visible) {
                        hasVisible = true;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', !hasVisible);
                }
            }

            if (input) {
                input.addEventListener('input', applySearch);
            }
            applySearch();
        }
    });
})();
