(function() {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function() {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function() {
            showSlide(activeIndex + 1);
        }, 5000);
    }

    function restartHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
        startHero();
    }

    if (prev) {
        prev.addEventListener('click', function() {
            showSlide(activeIndex - 1);
            restartHero();
        });
    }

    if (next) {
        next.addEventListener('click', function() {
            showSlide(activeIndex + 1);
            restartHero();
        });
    }

    dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            restartHero();
        });
    });

    showSlide(0);
    startHero();

    var backTop = document.querySelector('[data-back-top]');
    if (backTop) {
        window.addEventListener('scroll', function() {
            backTop.classList.toggle('is-visible', window.pageYOffset > 320);
        });
        backTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
})();
