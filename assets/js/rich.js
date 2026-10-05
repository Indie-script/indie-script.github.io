/* Renders what GitHub renders natively in Markdown: ```mermaid``` diagrams and $$...$$ math.
   Libraries are loaded from a CDN only on pages that contain such blocks. */
(function () {
  'use strict';

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function loadCss(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    document.head.appendChild(l);
  }

  function mermaidTargets(root) {
    var out = [];
    root.querySelectorAll('div.language-mermaid, pre > code.language-mermaid').forEach(function (el) {
      var holder = el.tagName === 'CODE' ? el.parentNode : el;
      if (holder.dataset.richDone) return;
      out.push(holder);
    });
    return out;
  }

  function renderMermaid(root) {
    var targets = mermaidTargets(root);
    if (!targets.length) return;
    loadScript('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js').then(function () {
      var dark = document.documentElement.getAttribute('data-theme') !== 'light';
      window.mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'default', securityLevel: 'strict' });
      targets.forEach(function (holder) {
        var code = holder.querySelector('code');
        var src = (code || holder).textContent;
        var box = document.createElement('pre');
        box.className = 'mermaid';
        box.dataset.richDone = '1';
        box.textContent = src;
        holder.parentNode.replaceChild(box, holder);
      });
      window.mermaid.run({ querySelector: 'pre.mermaid' });
    }).catch(function () { /* diagram stays as readable source */ });
  }

  function renderMath(root) {
    var nodes = root.querySelectorAll('script[type^="math/tex"]');
    if (!nodes.length) return;
    loadCss('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css');
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js').then(function () {
      nodes.forEach(function (n) {
        var display = /mode=display/.test(n.getAttribute('type'));
        var el = document.createElement(display ? 'div' : 'span');
        el.className = 'math-block';
        try {
          window.katex.render(n.textContent, el, { displayMode: display, throwOnError: false });
          n.parentNode.replaceChild(el, n);
        } catch (e) { /* leave the TeX source */ }
      });
    }).catch(function () {});
  }

  function init() {
    var root = document.querySelector('.markdown-body');
    if (!root) return;
    renderMermaid(root);
    renderMath(root);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
