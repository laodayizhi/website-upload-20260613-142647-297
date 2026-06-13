(function() {
    var input = document.getElementById('searchInput');
    var categoryFilter = document.getElementById('categoryFilter');
    var yearFilter = document.getElementById('yearFilter');
    var clearButton = document.getElementById('clearSearch');
    var results = document.getElementById('searchResults');
    var movies = window.MOVIE_INDEX || [];

    if (!input || !categoryFilter || !yearFilter || !results) {
        return;
    }

    var years = Array.from(new Set(movies.map(function(movie) {
        return movie.year;
    }))).sort(function(a, b) {
        return Number(b) - Number(a);
    });

    years.forEach(function(year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });

    function movieCard(movie) {
        var tags = movie.tags.slice(0, 3).map(function(tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '    <a class="poster" href="' + escapeAttr(movie.url) + '">',
            '        <img src="./' + escapeAttr(movie.cover) + '" alt="' + escapeAttr(movie.title) + '" loading="lazy">',
            '        <span class="duration">' + escapeHtml(movie.duration) + '</span>',
            '        <span class="poster-play">▶</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <a class="movie-title" href="' + escapeAttr(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
            '        <div class="movie-meta">',
            '            <span>' + escapeHtml(movie.year) + '</span>',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '            <span>' + escapeHtml(movie.type) + '</span>',
            '        </div>',
            '        <p>' + escapeHtml(movie.description) + '</p>',
            '        <div class="tag-list">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>]/g, function(character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;'
            }[character];
        });
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/"/g, '&quot;');
    }

    function render() {
        var query = input.value.trim().toLowerCase();
        var category = categoryFilter.value;
        var year = yearFilter.value;
        var filtered = movies.filter(function(movie) {
            var text = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                movie.description,
                movie.tags.join(' ')
            ].join(' ').toLowerCase();
            var queryOk = !query || text.indexOf(query) !== -1;
            var categoryOk = !category || movie.category === category;
            var yearOk = !year || movie.year === year;
            return queryOk && categoryOk && yearOk;
        }).slice(0, 120);

        if (!filtered.length) {
            results.innerHTML = '<div class="story-card"><h2>没有找到匹配影片</h2><p>可以更换片名、地区、类型或年份继续搜索。</p></div>';
            return;
        }

        results.innerHTML = filtered.map(movieCard).join('');
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
        input.value = initialQuery;
    }

    input.addEventListener('input', render);
    categoryFilter.addEventListener('change', render);
    yearFilter.addEventListener('change', render);

    if (clearButton) {
        clearButton.addEventListener('click', function() {
            input.value = '';
            categoryFilter.value = '';
            yearFilter.value = '';
            render();
        });
    }

    render();
})();
