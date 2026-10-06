/* Documentation articles: callouts (GitHub alert syntax) and scrollable table wrappers. */
(function () {
  'use strict';
  var body = document.querySelector('.doc-body');
  if (!body) return;

  var TYPES = {
    note: { label: 'Note', icon: 'info' },
    tip: { label: 'Tip', icon: 'light-bulb' },
    important: { label: 'Important', icon: 'note' },
    warning: { label: 'Warning', icon: 'alert' },
    caution: { label: 'Caution', icon: 'flame' }
  };

  function icon(name) {
    var base = (window.PORTAL && window.PORTAL.base) || '';
    return '<svg class="octicon" width="16" height="16" aria-hidden="true" focusable="false"><use href="' + base + '/assets/icons.svg#' + name + '"></use></svg>';
  }

  // > [!NOTE]  ->  styled callout
  Array.prototype.forEach.call(body.querySelectorAll('blockquote'), function (bq) {
    var p = bq.querySelector(':scope > p');
    if (!p) return;
    var first = p.firstChild;
    if (!first || first.nodeType !== 3) return;
    var m = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i.exec(first.nodeValue);
    if (!m) return;
    var type = m[1].toLowerCase(), t = TYPES[type];
    first.nodeValue = first.nodeValue.slice(m[0].length);
    if (!p.textContent.trim() && !p.querySelector('*')) p.remove();
    bq.classList.add('callout', 'callout-' + type);
    var title = document.createElement('div');
    title.className = 'callout-title';
    title.innerHTML = icon(t.icon) + '<span>' + t.label + '</span>';
    bq.insertBefore(title, bq.firstChild);
  });

  // wide tables scroll inside a rounded frame instead of breaking the page
  Array.prototype.forEach.call(body.querySelectorAll('table'), function (tb) {
    if (tb.parentNode.classList.contains('table-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    tb.parentNode.insertBefore(wrap, tb);
    wrap.appendChild(tb);
  });
})();
