
(function () {
  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function renderCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="meta-pill">' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeHtml(item.url) + '">' +
        '<span class="poster-wrap">' +
          '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-fallback">' + escapeHtml(item.title) + '</span>' +
          '<span class="poster-badge">' + escapeHtml(item.year) + '</span>' +
        '</span>' +
      '</a>' +
      '<div class="card-body">' +
        '<a class="card-title" href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>' +
        '<p class="card-desc">' + escapeHtml(item.desc) + '</p>' +
        '<div class="card-meta">' +
          '<span>' + escapeHtml(item.region) + '</span>' +
          '<span>' + escapeHtml(item.type) + '</span>' +
          '<a href="' + escapeHtml(item.categoryUrl) + '">' + escapeHtml(item.category) + '</a>' +
        '</div>' +
        '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
    '</article>';
  }

  var form = document.querySelector('[data-search-page-form]');
  var input = document.querySelector('[data-search-page-input]');
  var results = document.querySelector('[data-search-results]');
  var empty = document.querySelector('[data-search-empty]');
  var items = window.SearchIndex || [];
  var params = new URLSearchParams(window.location.search);

  function search() {
    var query = (input && input.value || '').trim().toLowerCase();
    var matches = items.filter(function (item) {
      var haystack = [item.title, item.region, item.type, item.year, item.genre, item.category, (item.tags || []).join(' '), item.desc].join(' ').toLowerCase();
      return !query || haystack.indexOf(query) !== -1;
    }).slice(0, 120);

    if (results) {
      results.innerHTML = matches.map(renderCard).join('');
    }

    if (empty) {
      empty.hidden = matches.length !== 0;
    }
  }

  if (input && params.get('q')) {
    input.value = params.get('q');
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      search();
    });
  }

  if (input) {
    input.addEventListener('input', search);
  }

  search();
})();
