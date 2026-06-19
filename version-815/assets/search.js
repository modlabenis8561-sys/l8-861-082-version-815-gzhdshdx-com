
(function () {
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var box = document.querySelector('[data-search-box]');
  var title = document.querySelector('[data-search-title]');
  var results = document.querySelector('[data-search-results]');
  if (box) {
    box.value = query;
  }
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function card(item) {
    var tags = (item.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<a class="movie-card" href="' + escapeHtml(item.href) + '" data-search="' + escapeHtml(item.text) + '">' +
      '<div class="card-poster"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><div class="poster-shade"></div><div class="poster-tag">搜索结果</div></div>' +
      '<div class="card-body"><div class="card-meta"><span>' + escapeHtml(item.meta) + '</span></div><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.line) + '</p><div class="tag-row">' + tags + '</div></div>' +
      '</a>';
  }
  if (!results || !title || !window.SEARCH_INDEX) {
    return;
  }
  var list = window.SEARCH_INDEX;
  if (query) {
    var lower = query.toLowerCase();
    list = list.filter(function (item) {
      return String(item.text || '').toLowerCase().indexOf(lower) !== -1;
    });
    title.textContent = '搜索结果：' + query;
  } else {
    list = list.slice(0, 48);
    title.textContent = '热门推荐';
  }
  if (!list.length) {
    results.innerHTML = '<div class="empty-state">没有匹配到相关影片</div>';
    return;
  }
  results.innerHTML = list.slice(0, 240).map(card).join('');
})();
