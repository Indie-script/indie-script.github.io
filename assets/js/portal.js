/* Indie Script developer portal - behaviour.
   Everything here is progressive enhancement: pages are readable and navigable without it.
   Sections: helpers, theme, menus + drawer, markdown, table of contents, source viewer,
   catalog, command palette, GitHub data, keyboard shortcuts. */
(function () {
  'use strict';

  var doc = document, root = doc.documentElement, body = doc.body;
  var P = window.PORTAL || { repo: '', branch: 'main', base: '' };
  var ICONS = (P.base || '') + '/assets/icons.svg';

  /* ---------- helpers ---------- */
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function on(el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function icon(name, size, cls) {
    size = size || 16;
    return '<svg class="octicon' + (cls ? ' ' + cls : '') + '" width="' + size + '" height="' + size + '" aria-hidden="true" focusable="false"><use href="' + ICONS + '#' + name + '"></use></svg>';
  }
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  function typing(e) {
    var t = e.target;
    return !!(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)));
  }
  function debounce(fn, ms) { var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms); }; }

  var toastTimer;
  function toast(msg) {
    var el = $('#toast'); if (!el) return;
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.hidden = true; }, 1800);
  }
  function copyText(text, okMsg) {
    function done() { toast(okMsg || 'Copied'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(done, fallback);
    }
    return fallback();
    function fallback() {
      var ta = doc.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      body.appendChild(ta); ta.select();
      try { doc.execCommand('copy'); done(); } catch (e) { toast('Copy failed'); }
      body.removeChild(ta);
    }
  }
  function relTime(dateStr) {
    var d = new Date(dateStr), diff = (d.getTime() - Date.now()) / 1000;
    if (isNaN(diff)) return '';
    var units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    var rtf = (window.Intl && Intl.RelativeTimeFormat) ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }) : null;
    for (var i = 0; i < units.length; i++) {
      if (Math.abs(diff) >= units[i][1]) {
        var n = Math.round(diff / units[i][1]);
        return rtf ? rtf.format(n, units[i][0]) : Math.abs(n) + ' ' + units[i][0] + (Math.abs(n) === 1 ? '' : 's') + ' ago';
      }
    }
    return 'just now';
  }
  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(n < 10240 ? 2 : 1).replace(/\.?0+$/, '') + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  }

  $$('[data-reltime]').forEach(function (t) {
    var iso = t.getAttribute('datetime'); if (!iso) return;
    t.title = new Date(iso).toLocaleString(); var r = relTime(iso); if (r) t.textContent = r;
  });
  $$('[data-num]').forEach(function (el) {
    var n = parseInt(el.textContent, 10); if (!isNaN(n)) el.textContent = n.toLocaleString('en-US');
  });

  /* ---------- theme ---------- */
  var THEMES = ['light', 'dark', 'dimmed'];
  var mqDark = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function themePref() { var t = store.get('theme'); return THEMES.indexOf(t) >= 0 ? t : 'auto'; }
  function applyTheme(pref) {
    var t = pref === 'auto' ? (mqDark && mqDark.matches ? 'dark' : 'light') : pref;
    root.setAttribute('data-theme', t);
    $$('[data-theme-set]').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-theme-set') === pref)); });
  }
  function setTheme(pref) {
    if (pref === 'auto') store.del('theme'); else store.set('theme', pref);
    applyTheme(pref);
  }
  function cycleTheme() {
    var order = ['light', 'dark', 'dimmed', 'auto'], next = order[(order.indexOf(themePref()) + 1) % order.length];
    setTheme(next);
    toast('Theme: ' + (next === 'auto' ? 'sync with system' : next));
  }
  applyTheme(themePref());
  if (mqDark) on(mqDark, 'change', function () { if (themePref() === 'auto') applyTheme('auto'); });
  $$('[data-theme-set]').forEach(function (b) {
    on(b, 'click', function () { setTheme(b.getAttribute('data-theme-set')); var d = b.closest('details'); if (d) d.open = false; });
  });

  /* ---------- menus, drawer ---------- */
  on(doc, 'click', function (e) {
    $$('details[data-dropdown][open]').forEach(function (d) { if (!d.contains(e.target)) d.open = false; });
    $$('.topnav-item.open').forEach(function (it) { if (!it.contains(e.target)) it.classList.remove('open'); });
  });
  $$('.topnav-item > button.topnav-link').forEach(function (btn) {
    on(btn, 'click', function () {
      var it = btn.parentNode, was = it.classList.contains('open');
      $$('.topnav-item.open').forEach(function (o) { o.classList.remove('open'); });
      if (!was) it.classList.add('open');
      btn.setAttribute('aria-expanded', String(!was));
    });
  });

  var backdrop = $('.drawer-backdrop');
  function drawer(open) {
    body.classList.toggle('drawer-open', open);
    if (backdrop) backdrop.hidden = !open;
    if (open) { var f = $('[data-nav-filter]'); if (f && window.innerWidth > 1011) f.focus(); }
  }
  $$('[data-drawer-open]').forEach(function (b) { on(b, 'click', function () { drawer(!body.classList.contains('drawer-open')); }); });
  $$('[data-drawer-close]').forEach(function (b) { on(b, 'click', function () { drawer(false); }); });

  // sidebar filter
  (function () {
    var input = $('[data-nav-filter]'), side = $('#sidebar');
    if (!input || !side) return;
    var groups = $$('details.side-group', side), initial = groups.map(function (g) { return g.open; });
    var empty = $('.side-empty', side);
    on(input, 'input', function () {
      var q = input.value.trim().toLowerCase(), any = false;
      groups.forEach(function (g, i) {
        var hit = 0;
        $$('li', g).forEach(function (li) {
          var m = !q || li.textContent.toLowerCase().indexOf(q) >= 0;
          li.hidden = !m; if (m) hit++;
        });
        g.hidden = !!q && hit === 0;
        g.open = q ? hit > 0 : (initial[i] || !!$('.current', g));
        if (hit) any = true;
      });
      $$('.side-root, .side-heading', side).forEach(function (el) { el.hidden = !!q; });
      if (empty) empty.hidden = !q || any;
    });
    on(input, 'keydown', function (e) {
      if (e.key === 'Enter') { var first = $$('li:not([hidden]) a.side-link', side).filter(function (a) { return !a.closest('details').hidden; })[0]; if (first) location.href = first.href; }
      if (e.key === 'Escape') { input.value = ''; input.dispatchEvent(new Event('input')); input.blur(); }
    });
  })();

  // mark the current entry in "more in this category"
  $$('[data-related] a').forEach(function (a) {
    if (a.pathname === location.pathname) { a.classList.add('current'); a.setAttribute('aria-current', 'page'); }
  });

  /* ---------- syntax highlighting ---------- */
  var HL = window.hljs || null;
  if (HL) {
    try {
      HL.registerLanguage('pinescript', function (h) {
        return {
          name: 'Pine Script',
          aliases: ['pine', 'pinescript3', 'pinescript4', 'pinescript5', 'pinescript6'],
          keywords: {
            keyword: 'if else for to by while switch var varip import export method type as in and or not return break continue enum',
            literal: 'true false na',
            type: 'int float bool string color label line box table array matrix map series simple const'
          },
          contains: [
            { className: 'meta', begin: /\/\/\s*@[A-Za-z_]+.*/ },
            h.C_LINE_COMMENT_MODE,
            h.QUOTE_STRING_MODE,
            h.APOS_STRING_MODE,
            { className: 'number', begin: /#[0-9a-fA-F]{6,8}\b/ },
            h.C_NUMBER_MODE,
            { className: 'built_in', begin: /\b(?:ta|math|str|color|request|array|matrix|map|strategy|input|syminfo|timeframe|barstate|session|ticker|chart|runtime|label|line|box|table|plot|shape|location|size|display|format|position|text|xloc|yloc|extend|hline|currency|alert|linefill|polyline|log)\.[A-Za-z_]\w*/ },
            { className: 'title.function', begin: /\b(?!(?:if|for|while|switch|and|or|not)\b)[A-Za-z_]\w*(?=\s*\()/ }
          ]
        };
      });
      HL.registerAliases(['indie', 'indie4', 'indie5'], { languageName: 'python' });
    } catch (e) {}
  }
  function guessLang(text) {
    if (/indie:lang_version|from indie\b|@indicator\(|\bMainContext\b/.test(text)) return 'python';
    if (/\/\/\s*@version|\bta\.[a-z]+\(|\bplotshape\(|^\s*(indicator|study|strategy)\(/m.test(text)) return 'pinescript';
    return '';
  }
  function highlight(text, lang) {
    if (lang === 'indie') lang = 'python';
    if (lang === 'pine') lang = 'pinescript';
    if (!lang || lang === 'plaintext' || lang === 'text') lang = guessLang(text);
    if (HL && lang && HL.getLanguage(lang)) {
      try { return { html: HL.highlight(text, { language: lang, ignoreIllegals: true }).value, lang: lang }; } catch (e) {}
    }
    return { html: esc(text), lang: lang || '' };
  }
  var LANG_NAMES = { python: 'Indie / Python', pinescript: 'Pine Script', javascript: 'JavaScript', json: 'JSON', bash: 'Shell', shell: 'Shell', yaml: 'YAML', plaintext: 'Text' };

  function enhanceCode(scope) {
    $$('pre', scope).forEach(function (pre) {
      if (pre.closest('.codeblock') || pre.closest('.code-table')) return;
      var code = $('code', pre) || pre;
      var holder = pre.closest('[class*="language-"]');
      var m = /language-([\w+#.-]+)/.exec(code.className) || (holder ? /language-([\w+#.-]+)/.exec(holder.className) : null);
      var text = code.textContent.replace(/\n$/, '');
      var res = highlight(text, m ? m[1].toLowerCase() : '');
      code.innerHTML = res.html;
      if (pre.closest('.codewin')) return;
      var wrap = doc.createElement('div'); wrap.className = 'codeblock';
      var bar = doc.createElement('div'); bar.className = 'codeblock-bar';
      var isIndie = res.lang === 'python' && /indie/i.test(text);
      var name = isIndie ? 'Indie' : (LANG_NAMES[res.lang] || (res.lang === 'python' ? 'Python' : res.lang) || 'Text');
      var dot = res.lang === 'pinescript' ? 'dot-pine' : (res.lang === 'python' ? 'dot-indie' : '');
      bar.innerHTML = '<span class="codeblock-lang"><span class="dot ' + dot + '"></span>' + esc(name) + '</span>' +
        '<button type="button" class="codeblock-copy" aria-label="Copy code">' + icon('copy') + '<span>Copy</span></button>';
      var outer = pre.closest('.highlighter-rouge') || pre;
      outer.parentNode.insertBefore(wrap, outer);
      wrap.appendChild(bar); wrap.appendChild(outer);
      var btn = $('.codeblock-copy', bar);
      on(btn, 'click', function () {
        copyText(text, 'Code copied');
        btn.classList.add('done'); btn.innerHTML = icon('check') + '<span>Copied</span>';
        setTimeout(function () { btn.classList.remove('done'); btn.innerHTML = icon('copy') + '<span>Copy</span>'; }, 1600);
      });
    });
  }

  /* ---------- markdown: anchors, images, code ---------- */
  var content = $('[data-content]');
  var headings = [];
  if (content) {
    var used = {};
    $$('h1, h2, h3, h4', content).forEach(function (h, i) {
      if (!h.id) {
        var slug = h.textContent.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || ('section-' + i);
        while (used[slug] || doc.getElementById(slug)) slug += '-' + i;
        h.id = slug;
      }
      used[h.id] = 1;
      var a = doc.createElement('a');
      a.className = 'anchor'; a.href = '#' + h.id; a.setAttribute('aria-label', 'Link to this section');
      a.innerHTML = icon('link');
      h.insertBefore(a, h.firstChild);
      headings.push(h);
    });
    enhanceCode(content);

    var lightbox = $('#lightbox');
    if (lightbox) {
      var lbImg = $('img', lightbox);
      $$('img', content).forEach(function (img) {
        if (img.closest('a')) return;
        on(img, 'click', function () { lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt || ''; lightbox.hidden = false; });
      });
      on(lightbox, 'click', function () { lightbox.hidden = true; lbImg.removeAttribute('src'); });
    }
  }
  $$('.codewin').forEach(function (w) {
    enhanceCode(w);
    var tabs = $$('[data-codewin-tab]', w), panes = $$('[data-codewin-pane]', w);
    tabs.forEach(function (t) {
      on(t, 'click', function () {
        var id = t.getAttribute('data-codewin-tab');
        tabs.forEach(function (x) { x.classList.toggle('selected', x === t); x.setAttribute('aria-selected', String(x === t)); });
        panes.forEach(function (p) { p.hidden = p.getAttribute('data-codewin-pane') !== id; });
      });
    });
  });

  /* ---------- table of contents + scroll spy ---------- */
  var tocLinks = [], tocHeads = [];
  (function () {
    var navs = $$('.toc');
    if (!content || !navs.length) return;
    var list = headings.slice();
    if (list.length && list[0].tagName === 'H1' && list[0] === content.firstElementChild) list.shift();
    list = list.filter(function (h) { return h.tagName !== 'H4'; });
    function level(h) { return parseInt(h.tagName.charAt(1), 10); }
    while (list.length > 45) {
      var deepest = Math.max.apply(null, list.map(level)), top = Math.min.apply(null, list.map(level));
      if (deepest === top) break;
      list = list.filter(function (h) { return level(h) < deepest; });
    }
    if (list.length < 2) return;
    var min = Math.min.apply(null, list.map(level));
    var html = '<ul>' + list.map(function (h) {
      var rel = Math.min(level(h) - min, 2);
      var text = h.textContent.trim();
      return '<li class="toc-h' + (rel + 2) + '"><a href="#' + esc(h.id) + '">' + esc(text) + '</a></li>';
    }).join('') + '</ul>';
    navs.forEach(function (n) { n.innerHTML = html; });
    var rail = $('[data-toc-rail]'), inline = $('[data-toc-inline]');
    if (rail) rail.hidden = false;
    if (inline) { inline.hidden = false; $$('a', inline).forEach(function (a) { on(a, 'click', function () { inline.open = false; }); }); }
    tocHeads = list;
    tocLinks = navs.map(function (n) { return $$('a', n); });

    var ticking = false;
    function spy() {
      ticking = false;
      var y = 96, idx = -1;
      for (var i = 0; i < tocHeads.length; i++) { if (tocHeads[i].getBoundingClientRect().top <= y) idx = i; else break; }
      tocLinks.forEach(function (links) {
        links.forEach(function (a, i) {
          var act = i === idx;
          if (act !== a.classList.contains('active')) {
            a.classList.toggle('active', act);
            if (act && a.closest('.rail')) { var r = a.closest('.rail'); var ar = a.getBoundingClientRect(), rr = r.getBoundingClientRect(); if (ar.top < rr.top + 40 || ar.bottom > rr.bottom - 40) r.scrollTop += ar.top - rr.top - rr.height / 2; }
          }
        });
      });
    }
    on(window, 'scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
    spy();
  })();
  function jumpSection(dir) {
    if (!tocHeads.length) return;
    var y = 100, cur = -1;
    for (var i = 0; i < tocHeads.length; i++) { if (tocHeads[i].getBoundingClientRect().top <= y) cur = i; }
    var next = Math.max(0, Math.min(tocHeads.length - 1, cur + dir));
    if (dir > 0 && cur === -1) next = 0;
    tocHeads[next].scrollIntoView({ block: 'start' });
    history.replaceState(null, '', '#' + tocHeads[next].id);
  }

  // reading progress
  (function () {
    var bar = $('.progress span'); if (!bar) return;
    var tick = false;
    function upd() { tick = false; var max = root.scrollHeight - window.innerHeight; bar.style.width = (max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0) + '%'; }
    on(window, 'scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  })();

  // wide layout
  function toggleWide() {
    var w = root.getAttribute('data-wide') === '1';
    if (w) { root.removeAttribute('data-wide'); store.del('wide'); } else { root.setAttribute('data-wide', '1'); store.set('wide', '1'); }
    $$('[data-wide-toggle]').forEach(function (b) { b.setAttribute('aria-pressed', String(!w)); });
  }
  $$('[data-wide-toggle]').forEach(function (b) { b.setAttribute('aria-pressed', String(root.getAttribute('data-wide') === '1')); on(b, 'click', toggleWide); });

  /* ---------- source viewer (indicator pages) ---------- */
  var viewer = null;
  (function () {
    var el = $('[data-viewer]'); if (!el) return;
    var tabs = $$('.viewer-tab', el); if (!tabs.length) return;
    var folder = decodeURIComponent(location.pathname.replace(/\/$/, '').split('/').pop() || '');
    var files = tabs.map(function (t, i) {
      return { i: i, tab: t, src: t.getAttribute('data-src'), name: t.getAttribute('data-name'), lang: t.getAttribute('data-lang'), ver: parseInt(t.getAttribute('data-ver'), 10) || 0, label: t.getAttribute('data-label'), text: null, promise: null };
    });
    // short tab labels: language + whatever distinguishes the file from its siblings
    var seen = {};
    files.forEach(function (f) { seen[f.label] = (seen[f.label] || 0) + 1; });
    files.forEach(function (f) {
      var base = f.name.replace(/\.(indie|pinescript)\.?\d*$/i, '');
      var extra = base.toLowerCase().indexOf(folder.toLowerCase()) === 0 ? base.slice(folder.length).trim() : (seen[f.label] > 1 ? base : '');
      extra = extra.replace(/^[\s._-]+/, '');
      f.short = f.label + (extra ? ' \u00b7 ' + extra : '');
      $('.viewer-tab-text', f.tab).textContent = f.short;
      f.tab.title = f.name;
    });
    var panes = $$('[data-pane]', el).map(function (p) {
      return { el: p, select: $('[data-pane-select]', p), info: $('[data-pane-info]', p), code: $('[data-pane-code]', p), file: -1 };
    });
    panes.forEach(function (p, pi) {
      p.select.innerHTML = files.map(function (f) { return '<option value="' + f.i + '">' + esc(f.name) + '</option>'; }).join('');
      on(p.select, 'change', function () { show(pi, parseInt(p.select.value, 10), true); });
    });
    var rows = $$('[data-file-open]');
    var state = { split: false, hl: null };

    function load(f) {
      if (!f.promise) {
        f.promise = fetch(f.src).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (t) {
          f.text = t.replace(/\r\n?/g, '\n');
          f.bytes = (window.Blob ? new Blob([t]).size : t.length);
          var sz = $('[data-file-size="' + f.i + '"]'); if (sz) sz.textContent = fmtBytes(f.bytes);
          return f;
        });
      }
      return f.promise;
    }
    function splitLines(html) {
      var lines = [], open = [], cur = '', re = /(<span[^>]*>)|(<\/span>)|(\n)|([^<\n]+)/g, m;
      while ((m = re.exec(html))) {
        if (m[1]) { open.push(m[1]); cur += m[1]; }
        else if (m[2]) { open.pop(); cur += m[2]; }
        else if (m[3]) { lines.push(cur + new Array(open.length + 1).join('</span>')); cur = open.join(''); }
        else { cur += m[4]; }
      }
      lines.push(cur + new Array(open.length + 1).join('</span>'));
      return lines;
    }
    function render(p, f) {
      var text = f.text.replace(/\n$/, '');
      if (!f.text.trim()) {
        p.code.innerHTML = '<div class="pane-empty">' + icon('file', 24) + '<p>This file is empty.</p></div>';
        p.info.textContent = f.short + ' \u00b7 0 B';
        return;
      }
      var lines = splitLines(highlight(text, f.lang).html);
      var sloc = text.split('\n').filter(function (l) { return l.trim(); }).length;
      p.code.innerHTML = '<table class="code-table"><tbody>' + lines.map(function (l, n) {
        return '<tr><td class="ln" data-ln="' + (n + 1) + '"></td><td class="lc">' + (l || '\n') + '</td></tr>';
      }).join('') + '</tbody></table>';
      p.info.textContent = lines.length + ' lines (' + sloc + ' loc) \u00b7 ' + fmtBytes(f.bytes);
      p.code.scrollTop = 0;
      if (p === panes[0]) applyHl();
    }
    function show(pi, fi, user) {
      var p = panes[pi], f = files[fi]; if (!f) return;
      p.file = fi; p.select.value = String(fi);
      if (pi === 0) {
        files.forEach(function (x) { x.tab.classList.toggle('selected', x === f); x.tab.setAttribute('aria-selected', String(x === f)); });
        rows.forEach(function (r) { r.closest('.filerow').classList.toggle('active', parseInt(r.getAttribute('data-file-open'), 10) === fi); });
        var raw = $('[data-viewer-raw]', el); if (raw) { raw.href = f.src; raw.setAttribute('download', f.name); }
        if (user) { state.hl = null; setHash(); }
      }
      p.code.innerHTML = '<div class="pane-empty">Loading\u2026</div>';
      load(f).then(function () { if (p.file === fi) render(p, f); }, function () {
        if (p.file === fi) p.code.innerHTML = '<div class="pane-empty">Could not load the file. <a href="' + esc(f.src) + '">Open it directly</a>.</div>';
      });
    }
    function setHash() {
      var f = files[panes[0].file]; if (!f) return;
      var h = '#file=' + encodeURIComponent(f.name);
      if (state.hl) h += '&L' + state.hl[0] + (state.hl[1] !== state.hl[0] ? '-L' + state.hl[1] : '');
      history.replaceState(null, '', h);
    }
    function applyHl() {
      var trs = $$('tr', panes[0].code);
      trs.forEach(function (tr, n) { tr.classList.toggle('hl', !!state.hl && n + 1 >= state.hl[0] && n + 1 <= state.hl[1]); });
    }
    function readHash() {
      var m = /[#&]file=([^&]+)/.exec(location.hash); if (!m) return false;
      var name = decodeURIComponent(m[1]), idx = -1;
      files.forEach(function (f) { if (f.name === name) idx = f.i; });
      if (idx < 0) return false;
      var l = /&L(\d+)(?:-L(\d+))?/.exec(location.hash);
      state.hl = l ? [parseInt(l[1], 10), parseInt(l[2] || l[1], 10)] : null;
      show(0, idx, false);
      load(files[idx]).then(function () {
        el.scrollIntoView({ block: 'start' });
        if (state.hl) { var tr = $$('tr', panes[0].code)[state.hl[0] - 1]; if (tr) panes[0].code.scrollTop = Math.max(0, tr.offsetTop - 60); }
      });
      return true;
    }
    function primary() {
      var best = files[0];
      files.forEach(function (f) { if (f.lang === 'indie' && (best.lang !== 'indie' || f.ver >= best.ver)) best = f; });
      return best.i;
    }
    function counterpart(fi) {
      var f = files[fi], other = null;
      files.forEach(function (x) { if (x.lang !== f.lang && (!other || x.ver >= other.ver)) other = x; });
      if (!other) other = files[(fi + 1) % files.length];
      return other.i;
    }
    function setSplit(v) {
      state.split = v; el.classList.toggle('split', v); panes[1].el.hidden = !v;
      $('[data-viewer-split]', el).setAttribute('aria-pressed', String(v));
      if (v) show(1, counterpart(panes[0].file), false);
    }
    function setFull(v) {
      el.classList.toggle('full', v); body.classList.toggle('viewer-full', v);
      $('[data-viewer-full]', el).setAttribute('aria-pressed', String(v));
    }

    tabs.forEach(function (t, i) { on(t, 'click', function () { show(0, i, true); }); });
    rows.forEach(function (r) {
      on(r, 'click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault(); show(0, parseInt(r.getAttribute('data-file-open'), 10), true); el.scrollIntoView({ block: 'nearest' });
      });
    });
    on($('[data-viewer-split]', el), 'click', function () { setSplit(!state.split); });
    on($('[data-viewer-full]', el), 'click', function () { setFull(!el.classList.contains('full')); });
    on($('[data-viewer-wrap]', el), 'click', function (e) { var w = el.classList.toggle('wrap'); e.currentTarget.setAttribute('aria-pressed', String(w)); });
    on($('[data-viewer-copy]', el), 'click', function () { var f = files[panes[0].file]; if (f && f.text != null) copyText(f.text, 'File copied'); });
    on(panes[0].code, 'click', function (e) {
      var td = e.target.closest ? e.target.closest('td.ln') : null; if (!td) return;
      var n = parseInt(td.getAttribute('data-ln'), 10);
      state.hl = (e.shiftKey && state.hl) ? [Math.min(state.hl[0], n), Math.max(state.hl[0], n)] : [n, n];
      applyHl(); setHash();
    });
    on(window, 'hashchange', readHash);

    el.hidden = false;
    if (files.length < 2) $('[data-viewer-split]', el).hidden = true;
    if (!readHash()) show(0, primary(), false);
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 600); };
    idle(function () { files.forEach(function (f) { load(f).catch(function () {}); }); });

    viewer = {
      step: function (d) { show(0, (panes[0].file + d + files.length) % files.length, true); },
      split: function () { if (files.length > 1) setSplit(!state.split); },
      full: function () { setFull(!el.classList.contains('full')); },
      copy: function () { $('[data-viewer-copy]', el).click(); },
      isFull: function () { return el.classList.contains('full'); },
      exitFull: function () { setFull(false); }
    };
  })();

  /* ---------- catalog ---------- */
  (function () {
    var cat = $('[data-catalog]'); if (!cat) return;
    var rows = $$('[data-row]', cat); if (!rows.length) return;
    var q = $('[data-catalog-q]'), langBox = $('[data-catalog-lang]'), viewBox = $('[data-catalog-view]');
    var count = $('[data-catalog-count]'), empty = $('[data-catalog-empty]', cat);
    var secs = $$('[data-catsec]', cat), flat = $('[data-flat]', cat);
    var st = { q: '', lang: '', view: 'grouped' };
    rows.forEach(function (r, i) { r._home = r.parentNode; r._order = i; });
    var sorted = rows.slice().sort(function (a, b) { return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name')); });

    function langOk(r) {
      if (!st.lang) return true;
      var toks = (r.getAttribute('data-langs') || '').split(/\s+/);
      return toks.some(function (t) { return st.lang === 'pine' ? t.indexOf('pine') === 0 : t === st.lang; });
    }
    function apply() {
      var shown = 0;
      rows.forEach(function (r) {
        var ok = (!st.q || r.getAttribute('data-name').indexOf(st.q) >= 0 || r.textContent.toLowerCase().indexOf(st.q) >= 0) && langOk(r);
        r.hidden = !ok; if (ok) shown++;
      });
      secs.forEach(function (s) {
        var n = $$('[data-row]:not([hidden])', s).length, c = $('[data-catsec-count]', s);
        s.hidden = st.view === 'flat' || n === 0; if (c) c.textContent = n;
      });
      if (flat) flat.hidden = st.view !== 'flat' || shown === 0;
      if (empty) empty.hidden = shown > 0;
      if (count) count.textContent = shown === rows.length ? rows.length + ' indicators' : shown + ' of ' + rows.length;
    }
    function setView(v) {
      st.view = v;
      cat.classList.toggle('is-flat', v === 'flat');
      if (flat) {
        var ul = $('ul', flat);
        if (v === 'flat') sorted.forEach(function (r) { ul.appendChild(r); });
        else rows.forEach(function (r) { r._home.appendChild(r); });
      }
      apply();
    }
    function seg(box, attr, cb) {
      if (!box) return;
      var btns = $$('button', box);
      btns.forEach(function (b) { on(b, 'click', function () { btns.forEach(function (x) { x.classList.toggle('selected', x === b); }); cb(b.getAttribute(attr)); }); });
    }
    on(q, 'input', debounce(function () { st.q = q.value.trim().toLowerCase(); apply(); }, 80));
    seg(langBox, 'data-lang', function (v) { st.lang = v; apply(); });
    seg(viewBox, 'data-view', setView);
    apply();
  })();

  /* ---------- command palette ---------- */
  var palette = (function () {
    var el = $('#palette'); if (!el) return null;
    var input = $('#palette-q', el), list = $('#palette-results', el), chips = $$('[data-scope]', el);
    var SCOPES = ['all', 'doc', 'indicator', 'file', 'command'];
    var GROUPS = { doc: 'Docs', indicator: 'Indicators', category: 'Categories', file: 'Source files', command: 'Commands', nav: 'Jump to' };
    var ICON = { doc: 'book', indicator: 'file-directory-fill', category: 'apps', file: 'file-code', command: 'terminal', nav: 'arrow-right' };
    var st = { scope: 'all', items: [], active: 0, index: null, loading: false, lastFocus: null };
    var base = P.base || '';

    var commands = [
      { k: 'command', t: 'Theme: light', run: function () { setTheme('light'); } },
      { k: 'command', t: 'Theme: dark', run: function () { setTheme('dark'); } },
      { k: 'command', t: 'Theme: dark dimmed', run: function () { setTheme('dimmed'); } },
      { k: 'command', t: 'Theme: sync with system', run: function () { setTheme('auto'); } },
      { k: 'command', t: 'Toggle wide layout', hint: 'w', run: toggleWide },
      { k: 'command', t: 'Copy link to this page', run: function () { copyText(location.href, 'Link copied'); } },
      { k: 'command', t: 'Show keyboard shortcuts', hint: '?', run: function () { modal(true); } },
      { k: 'command', t: 'Open GitHub repository', u: 'https://github.com/' + P.repo },
      { k: 'command', t: 'Report an issue', u: 'https://github.com/' + P.repo + '/issues/new' },
      { k: 'command', t: 'Back to top', run: function () { window.scrollTo(0, 0); } }
    ];
    var nav = [
      { k: 'nav', t: 'Overview', u: base + '/', i: 'home' },
      { k: 'nav', t: 'All indicators', u: base + '/indicators/', i: 'package' }
    ];

    function build(data) {
      var items = [];
      (data.docs || []).forEach(function (d) { items.push({ k: 'doc', t: d.l || d.t, s: d.l ? d.t : '', u: d.u, x: d.x || '' }); });
      (data.indicators || []).forEach(function (d) { items.push({ k: 'indicator', t: d.t, s: d.c + (d.l && d.l !== d.t ? ' \u00b7 ' + d.l : ''), u: d.u, x: d.x || '' }); });
      (data.categories || []).forEach(function (d) { items.push({ k: 'category', t: d.t, s: d.n + ' indicator' + (d.n === 1 ? '' : 's'), u: d.u, i: d.i }); });
      (data.files || []).forEach(function (d) { items.push({ k: 'file', t: d.n, s: d.d + ' \u00b7 ' + d.g, u: d.u ? d.u + '#file=' + encodeURIComponent(d.n) : d.p }); });
      items.forEach(function (it) { it.tl = it.t.toLowerCase(); it.sl = (it.s || '').toLowerCase(); it.xl = (it.x || '').toLowerCase(); });
      return items;
    }
    function ensureIndex() {
      if (st.index || st.loading) return;
      st.loading = true;
      fetch(el.getAttribute('data-index')).then(function (r) { return r.json(); }).then(function (d) { st.index = build(d); st.loading = false; search(); }, function () { st.loading = false; st.index = []; search(); });
    }
    function mark(text, toks) {
      var out = esc(text);
      toks.forEach(function (t) {
        if (!t) return;
        out = out.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/&/g, '&amp;').replace(/</g, '&lt;') + ')(?![^<]*>)', 'ig'), '<mark>$1</mark>');
      });
      return out;
    }
    function snippet(x, xl, tok) {
      var i = xl.indexOf(tok); if (i < 0) return '';
      var a = Math.max(0, i - 40), b = Math.min(x.length, i + tok.length + 70);
      return (a > 0 ? '\u2026' : '') + x.slice(a, b).trim() + (b < x.length ? '\u2026' : '');
    }
    function search() {
      var raw = input.value, scope = st.scope;
      if (raw.charAt(0) === '>') { raw = raw.slice(1); scope = 'command'; }
      var toks = raw.trim().toLowerCase().split(/\s+/).filter(Boolean);
      var pool = [];
      commands.forEach(function (c) { c.tl = c.t.toLowerCase(); c.sl = ''; c.xl = ''; });
      nav.forEach(function (c) { c.tl = c.t.toLowerCase(); c.sl = ''; c.xl = ''; });
      if (scope === 'command') pool = commands;
      else pool = (st.index || []).filter(function (it) { return scope === 'all' || it.k === scope || (scope === 'indicator' && it.k === 'category'); });
      var res = [];
      if (!toks.length) {
        if (scope === 'command') res = commands.slice();
        else if (scope === 'all') res = nav.concat((st.index || []).filter(function (it) { return it.k === 'doc' || it.k === 'category'; })).concat(commands.slice(0, 5));
        else res = pool.slice(0, 60);
      } else {
        if (scope === 'all') pool = pool.concat(nav, commands);
        pool.forEach(function (it) {
          var score = 0, snip = '';
          for (var i = 0; i < toks.length; i++) {
            var t = toks[i], p = it.tl.indexOf(t);
            if (p === 0) score += 100;
            else if (p > 0 && /[\s\-_./(]/.test(it.tl.charAt(p - 1))) score += 70;
            else if (p > 0) score += 45;
            else if (it.sl.indexOf(t) >= 0) score += 25;
            else if (it.xl && it.xl.indexOf(t) >= 0) { score += 6; if (!snip) snip = snippet(it.x, it.xl, t); }
            else return;
          }
          if (it.k === 'doc' || it.k === 'indicator') score += 3;
          res.push({ it: it, score: score, snip: snip });
        });
        res.sort(function (a, b) { return b.score - a.score || a.it.t.length - b.it.t.length; });
        res = res.slice(0, 50).map(function (r) { var o = Object.create(r.it); o.snip = r.snip; return o; });
      }
      // group in order of first appearance, keep groups contiguous
      var order = [], by = {};
      res.forEach(function (it) { if (!by[it.k]) { by[it.k] = []; order.push(it.k); } by[it.k].push(it); });
      st.items = [];
      var html = '';
      order.forEach(function (k) {
        html += '<div class="palette-group">' + GROUPS[k] + '</div>';
        by[k].slice(0, k === 'file' && scope === 'all' ? 8 : 60).forEach(function (it) {
          var n = st.items.length; st.items.push(it);
          var sub = it.snip ? mark(it.snip, toks) : (it.s ? mark(it.s, toks) : '');
          html += '<a class="palette-item" role="option" data-n="' + n + '" href="' + esc(it.u || '#') + '">' + icon(it.i || ICON[it.k]) +
            '<span class="palette-main"><span class="palette-title">' + mark(it.t, toks) + '</span>' + (sub ? '<span class="palette-sub">' + sub + '</span>' : '') + '</span>' +
            (it.hint ? '<kbd>' + esc(it.hint) + '</kbd>' : '<span class="palette-hint">' + (it.run ? 'Run' : (/^https?:/.test(it.u || '') ? 'Open \u2197' : 'Jump to')) + '</span>') + '</a>';
        });
      });
      if (!st.items.length) html = '<div class="palette-empty">' + (st.loading ? 'Loading index\u2026' : 'No results' + (toks.length ? ' for \u201c' + esc(raw.trim()) + '\u201d' : '')) + '</div>';
      list.innerHTML = html;
      setActive(0);
    }
    function setActive(n) {
      var els = $$('.palette-item', list); if (!els.length) { st.active = -1; return; }
      st.active = Math.max(0, Math.min(els.length - 1, n));
      els.forEach(function (e, i) { e.classList.toggle('active', i === st.active); e.setAttribute('aria-selected', String(i === st.active)); });
      var a = els[st.active], lr = list.getBoundingClientRect(), ar = a.getBoundingClientRect();
      if (ar.bottom > lr.bottom) list.scrollTop += ar.bottom - lr.bottom + 6;
      if (ar.top < lr.top) list.scrollTop -= lr.top - ar.top + (st.active === 0 ? 40 : 6);
    }
    function go(it, newTab) {
      if (!it) return;
      if (it.run) { close(); it.run(); return; }
      if (newTab || /^https?:/.test(it.u)) { window.open(it.u, '_blank', 'noopener'); close(); return; }
      close();
      var same = it.u.split('#')[0] === location.pathname;
      location.href = it.u;
      if (same && it.u.indexOf('#') >= 0) window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
    function setScope(s) {
      st.scope = s;
      chips.forEach(function (c) { c.classList.toggle('selected', c.getAttribute('data-scope') === s); });
      search();
    }
    function open(scope, prefill) {
      if (el.hidden) st.lastFocus = doc.activeElement;
      el.hidden = false; body.style.overflow = 'hidden';
      input.value = prefill || '';
      ensureIndex(); setScope(scope || 'all');
      setTimeout(function () { input.focus(); }, 0);
    }
    function close() {
      if (el.hidden) return;
      el.hidden = true; body.style.overflow = '';
      if (st.lastFocus && st.lastFocus.focus) st.lastFocus.focus();
    }

    on(input, 'input', search);
    on(input, 'keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(st.active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(st.active - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); go(st.items[st.active], e.metaKey || e.ctrlKey); }
      else if (e.key === 'Tab') { e.preventDefault(); setScope(SCOPES[(SCOPES.indexOf(st.scope) + (e.shiftKey ? SCOPES.length - 1 : 1)) % SCOPES.length]); }
    });
    on(list, 'click', function (e) {
      var a = e.target.closest ? e.target.closest('.palette-item') : null; if (!a) return;
      if (e.metaKey || e.ctrlKey) return;
      e.preventDefault(); go(st.items[parseInt(a.getAttribute('data-n'), 10)]);
    });
    on(list, 'mousemove', function (e) {
      var a = e.target.closest ? e.target.closest('.palette-item') : null; if (!a) return;
      var n = parseInt(a.getAttribute('data-n'), 10); if (n !== st.active) setActive(n);
    });
    chips.forEach(function (c) { on(c, 'click', function () { setScope(c.getAttribute('data-scope')); input.focus(); }); });
    $$('[data-palette-close]', el).forEach(function (b) { on(b, 'click', close); });
    $$('[data-palette-open]').forEach(function (b) { on(b, 'click', function () { open('all'); }); });
    return { open: open, close: close, isOpen: function () { return !el.hidden; } };
  })();

  // shortcuts dialog
  var modalEl = $('#shortcuts');
  function modal(open) { if (modalEl) { modalEl.hidden = !open; if (open) { var b = $('button', modalEl); if (b) b.focus(); } } }
  $$('[data-shortcuts-open]').forEach(function (b) { on(b, 'click', function () { modal(true); }); });
  $$('[data-shortcuts-close]').forEach(function (b) { on(b, 'click', function () { modal(false); }); });

  /* ---------- GitHub data (latest commit, counters, activity) ---------- */
  (function () {
    if (!P.repo || !window.fetch) return;
    var API = 'https://api.github.com/repos/' + P.repo, TTL = 6 * 3600 * 1000;
    function gh(key, url) {
      var ck = 'gh:' + key, raw = store.get(ck);
      if (raw) { try { var c = JSON.parse(raw); if (Date.now() - c.t < TTL) return Promise.resolve(c.d); } catch (e) {} }
      return fetch(url, { headers: { Accept: 'application/vnd.github+json' } }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      }).then(function (d) { return d; });
    }
    function cache(key, d) { store.set('gh:' + key, JSON.stringify({ t: Date.now(), d: d })); return d; }
    function slim(c) {
      return { sha: c.sha, url: c.html_url, msg: (c.commit.message || '').split('\n')[0], date: c.commit.author && c.commit.author.date, who: (c.author && c.author.login) || (c.commit.author && c.commit.author.name) || '' };
    }

    var bar = $('[data-commit-path]');
    if (bar) {
      var path = bar.getAttribute('data-commit-path');
      gh('c:' + path, API + '/commits?per_page=1&sha=' + encodeURIComponent(P.branch) + '&path=' + encodeURIComponent(path)).then(function (d) {
        var c = Array.isArray(d) ? (d[0] && d[0].commit ? cache('c:' + path, slim(d[0])) : null) : d;
        if (!c || !c.sha) return;
        bar.innerHTML = icon('git-commit') + (c.who ? '<strong>' + esc(c.who) + '</strong>' : '') +
          '<a class="commitbar-msg" href="' + esc(c.url) + '" rel="nofollow noopener">' + esc(c.msg) + '</a>' +
          '<span class="commitbar-right"><code>' + esc(c.sha.slice(0, 7)) + '</code><span>\u00b7</span><time datetime="' + esc(c.date) + '" title="' + esc(new Date(c.date).toLocaleString()) + '">' + esc(relTime(c.date)) + '</time></span>';
        bar.hidden = false;
      }).catch(function () {});
    }

    var counters = $$('[data-gh]');
    if (counters.length) {
      gh('repo', API).then(function (d) {
        var r = d.full_name ? cache('repo', { stars: d.stargazers_count, forks: d.forks_count, issues: d.open_issues_count }) : d;
        counters.forEach(function (el) { var v = r[el.getAttribute('data-gh')]; if (v > 0) { el.textContent = v.toLocaleString('en-US'); el.hidden = false; } });
      }).catch(function () {});
    }

    var act = $('[data-gh-activity]'), latest = $('[data-gh-latest]');
    if (act || latest) {
      gh('log', API + '/commits?per_page=5&sha=' + encodeURIComponent(P.branch)).then(function (d) {
        var list = (d.length && d[0].commit) ? cache('log', d.map(slim)) : d;
        if (!list || !list.length) return;
        if (latest) {
          var a = $('[data-gh-latest-link]', latest);
          a.href = list[0].url; a.textContent = relTime(list[0].date) + ' \u00b7 ' + list[0].msg; a.title = list[0].msg;
          latest.hidden = false;
        }
        if (act) {
          $('[data-gh-activity-list]', act).innerHTML = list.map(function (c) {
            return '<li><a href="' + esc(c.url) + '" rel="nofollow noopener" title="' + esc(c.msg) + '">' + esc(c.msg) + '</a><small><code>' + esc(c.sha.slice(0, 7)) + '</code> \u00b7 ' + esc(c.who) + ' \u00b7 ' + esc(relTime(c.date)) + '</small></li>';
          }).join('');
          act.hidden = false;
        }
      }).catch(function () {});
    }
  })();

  /* ---------- keyboard ---------- */
  var gPending = 0;
  on(doc, 'keydown', function (e) {
    if (e.key === 'Escape') {
      if (palette && palette.isOpen()) { palette.close(); return; }
      if (modalEl && !modalEl.hidden) { modal(false); return; }
      var lb = $('#lightbox'); if (lb && !lb.hidden) { lb.hidden = true; return; }
      if (viewer && viewer.isFull()) { viewer.exitFull(); return; }
      if (body.classList.contains('drawer-open')) { drawer(false); return; }
      $$('details[data-dropdown][open]').forEach(function (d) { d.open = false; });
      $$('.topnav-item.open').forEach(function (it) { it.classList.remove('open'); });
      return;
    }
    if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (palette) palette.open('all'); return; }
    if (e.metaKey || e.ctrlKey || e.altKey || typing(e)) return;
    if (palette && palette.isOpen()) return;
    if (modalEl && !modalEl.hidden) return;

    var k = e.key;
    if (gPending && Date.now() - gPending < 1200) {
      gPending = 0;
      var base = P.base || '';
      if (k === 'h') { location.href = base + '/'; return; }
      if (k === 'i') { location.href = base + '/indicators/'; return; }
      if (k === 'd') { location.href = base + '/docs/'; return; }
      if (k === 't') { cycleTheme(); return; }
    }
    switch (k) {
      case '/': e.preventDefault(); if (palette) palette.open('all'); break;
      case 't': e.preventDefault(); if (palette) palette.open('file'); break;
      case '>': e.preventDefault(); if (palette) palette.open('command'); break;
      case '?': e.preventDefault(); modal(true); break;
      case 'g': gPending = Date.now(); break;
      case 'w': toggleWide(); break;
      case 'j': jumpSection(1); break;
      case 'k': jumpSection(-1); break;
      case ']': if (viewer) viewer.step(1); break;
      case '[': if (viewer) viewer.step(-1); break;
      case 'f': if (viewer) viewer.full(); break;
      case 's': if (viewer) viewer.split(); break;
      case 'y': if (viewer) viewer.copy(); break;
    }
  });
})();
