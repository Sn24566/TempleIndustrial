/* ============================================================
   TEMPLE INDUSTRIAL — shared site behaviour
   Loaded on every page with <script src="site.js" defer></script>
   (use ../site.js from pages inside a subfolder)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Mobile nav toggle ---------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });

    // Close the menu when a link is chosen
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
        toggle.focus();
      }
    });
  }

  /* ---------- Copy-to-clipboard ----------
     Any <button class="copy-btn" data-copy="value">Copy</button>
     Falls back to a hidden textarea where the async API is unavailable
     (older browsers, or any non-HTTPS context).                        */
  function initCopy() {
    var buttons = document.querySelectorAll('.copy-btn');
    if (!buttons.length) return;

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-copy') || '';
        if (!value) return;

        function done() {
          var original = btn.getAttribute('data-label') || btn.textContent;
          btn.setAttribute('data-label', original);
          btn.textContent = 'Copied';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = original;
            btn.classList.remove('copied');
          }, 1800);
        }

        function fallback() {
          var ta = document.createElement('textarea');
          ta.value = value;
          ta.setAttribute('readonly', '');
          ta.style.cssText = 'position:absolute;left:-9999px;top:0;';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); done(); } catch (err) { /* no-op */ }
          document.body.removeChild(ta);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(done).catch(fallback);
        } else {
          fallback();
        }
      });
    });
  }

  /* ---------- Property filtering ----------
     Buttons:  <button class="filter-btn" data-filter="available">
     Items:    <div class="prop" data-status="available">                */
  function initFilter() {
    var buttons = document.querySelectorAll('.filter-btn');
    var items = document.querySelectorAll('[data-status]');
    if (!buttons.length || !items.length) return;

    var empty = document.querySelector('.filter-empty');

    function apply(filter) {
      var shown = 0;
      Array.prototype.forEach.call(items, function (item) {
        var match = filter === 'all' || item.getAttribute('data-status') === filter;
        item.hidden = !match;
        if (match) shown++;
      });
      Array.prototype.forEach.call(buttons, function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-filter') === filter ? 'true' : 'false');
      });
      // Hide a section heading when everything under it is filtered out
      document.querySelectorAll('[data-section]').forEach(function (sec) {
        var visible = sec.querySelectorAll('[data-status]:not([hidden])').length;
        sec.hidden = visible === 0;
      });
      if (empty) empty.style.display = shown === 0 ? 'block' : 'none';

      try {
        var url = new URL(window.location);
        if (filter === 'all') { url.searchParams.delete('show'); }
        else { url.searchParams.set('show', filter); }
        history.replaceState(null, '', url);
      } catch (err) { /* no-op */ }
    }

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function () {
        apply(btn.getAttribute('data-filter'));
      });
    });

    // Honour ?show=  on load, and don't filter if the visitor arrived at an anchor
    var initial = 'all';
    try {
      var param = new URL(window.location).searchParams.get('show');
      if (param) initial = param;
    } catch (err) { /* no-op */ }
    if (window.location.hash) initial = 'all';
    apply(initial);

    // Re-reveal a hidden property if the visitor jumps to its anchor
    window.addEventListener('hashchange', function () {
      if (window.location.hash) apply('all');
    });
  }

  function init() {
    initNav();
    initCopy();
    initFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
