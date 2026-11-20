/* =====================================================================
   Jazyky webu – laboratórium: spoločná navigácia
   - horná lišta: rozcestník, zoznam lekcií, prepínač jazyka SK / EN / ES
   - spodná lišta: predchádzajúca / ďalšia lekcia
   Stránka si ju vloží takto (hneď na začiatok <body>):
     <div id="lab-nav"></div><script src="assets/nav.js"></script>
   (v priečinkoch en/ a es/ s cestou ../assets/nav.js)
   ===================================================================== */
(function () {
  'use strict';

  var LANG = (document.documentElement.lang || 'sk').slice(0, 2);
  if (['sk', 'en', 'es'].indexOf(LANG) === -1) LANG = 'sk';

  var LESSONS = [
    { file: '0-setup.html', num: '0', sk: 'Príprava prostredia', en: 'Setting up your editor', es: 'Preparar el editor' },
    { file: '1-html.html', num: '1', sk: 'HTML', en: 'HTML', es: 'HTML' },
    { file: '2-css-text.html', num: '2', sk: 'CSS – texty a pozadie', en: 'CSS – text and backgrounds', es: 'CSS – texto y fondos' },
    { file: '3-css-box.html', num: '3', sk: 'CSS – box model', en: 'CSS – the box model', es: 'CSS – el modelo de caja' },
    { file: '4-layout.html', num: '4', sk: 'Pozícia, flexbox, media queries', en: 'Positioning, flexbox, media queries', es: 'Posición, flexbox, media queries' },
    { file: '5-bootstrap.html', num: '5', sk: 'Responzívny dizajn a Bootstrap', en: 'Responsive design and Bootstrap', es: 'Diseño responsive y Bootstrap' },
    { file: 'js1.html', num: 'JS 1', sk: 'Základy JavaScriptu', en: 'JavaScript basics', es: 'Fundamentos de JavaScript' },
    { file: 'js2.html', num: 'JS 2', sk: 'Manipulácia s DOM', en: 'DOM manipulation', es: 'Manipulación del DOM' },
    { file: 'js3.html', num: 'JS 3', sk: 'Funkcie a udalosti', en: 'Functions and events', es: 'Funciones y eventos' },
    { file: 'xml.html', num: 'XML', sk: 'XML, DTD, XPath a XSLT', en: 'XML, DTD, XPath and XSLT', es: 'XML, DTD, XPath y XSLT' },
    { file: 'project.html', num: '★', sk: 'Záverečný projekt', en: 'Final project', es: 'Proyecto final' }
  ];

  var T = {
    sk: { brand: 'Jazyky webu · laboratórium', lessons: 'Lekcie', home: 'Rozcestník', lang: 'Jazyk', prev: 'Predchádzajúca lekcia', next: 'Ďalšia lekcia' },
    en: { brand: 'Web Languages · Lab', lessons: 'Lessons', home: 'Overview', lang: 'Language', prev: 'Previous lesson', next: 'Next lesson' },
    es: { brand: 'Lenguajes web · Laboratorio', lessons: 'Lecciones', home: 'Inicio', lang: 'Idioma', prev: 'Lección anterior', next: 'Lección siguiente' }
  }[LANG];

  // aktuálny súbor
  var path = location.pathname;
  var file = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  var current = -1;
  for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].file === file) current = i;

  // cesta k jazykovej verzii tej istej stránky
  function langHref(target) {
    if (target === LANG) return file;
    var toRoot = LANG === 'sk' ? '' : '../';
    return toRoot + (target === 'sk' ? '' : target + '/') + file;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderNav() {
    var holder = document.getElementById('lab-nav');
    if (!holder) {
      holder = document.createElement('div');
      holder.id = 'lab-nav';
      document.body.insertBefore(holder, document.body.firstChild);
    }
    var items = LESSONS.map(function (l, idx) {
      var active = idx === current;
      return '<li><a class="dropdown-item d-flex gap-2' + (active ? ' active' : '') + '" href="' + l.file + '"' +
        (active ? ' aria-current="page"' : '') + '><span class="lab-nav-num">' + esc(l.num) + '</span><span>' + esc(l[LANG]) + '</span></a></li>';
    }).join('');
    var label = current >= 0 ? LESSONS[current].num + ' · ' + LESSONS[current][LANG] : T.lessons;
    var langs = ['sk', 'en', 'es'].map(function (code) {
      var on = code === LANG;
      return '<a class="btn ' + (on ? 'btn-light' : 'btn-outline-light') + '" href="' + langHref(code) + '" hreflang="' + code + '" lang="' + code + '"' +
        (on ? ' aria-current="true"' : '') + '>' + code.toUpperCase() + '</a>';
    }).join('');

    holder.innerHTML =
      '<nav class="navbar navbar-dark bg-dark lab-nav" aria-label="' + esc(T.lessons) + '">' +
        '<div class="container gap-2">' +
          '<a class="navbar-brand fw-bold me-auto" href="index.html">' + esc(T.brand) + '</a>' +
          '<div class="d-flex flex-wrap align-items-center gap-2">' +
            '<div class="dropdown">' +
              '<button class="btn btn-sm btn-outline-light dropdown-toggle lab-nav-current" type="button" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false">' +
                esc(label) + '</button>' +
              '<ul class="dropdown-menu dropdown-menu-lg-end shadow">' +
                '<li><a class="dropdown-item' + (file === 'index.html' ? ' active' : '') + '" href="index.html">' + esc(T.home) + '</a></li>' +
                '<li><hr class="dropdown-divider"></li>' + items +
              '</ul>' +
            '</div>' +
            '<div class="btn-group btn-group-sm" role="group" aria-label="' + esc(T.lang) + '">' + langs + '</div>' +
          '</div>' +
        '</div>' +
      '</nav>';
  }

  function renderPager() {
    if (current < 0) return;
    var holder = document.getElementById('lab-pager');
    if (!holder) {
      holder = document.createElement('div');
      holder.id = 'lab-pager';
      var footer = document.querySelector('body > footer');
      if (footer) footer.parentNode.insertBefore(holder, footer);
      else document.body.appendChild(holder);
    }
    var prev = LESSONS[current - 1], next = LESSONS[current + 1];
    function card(l, dir) {
      if (!l) return '<span></span>';
      var arrowL = dir === 'prev' ? '← ' : '', arrowR = dir === 'next' ? ' →' : '';
      return '<a class="lab-pager-link ' + dir + '" href="' + l.file + '"><small>' + esc(dir === 'prev' ? T.prev : T.next) + '</small>' +
        '<span>' + arrowL + esc(l.num + ' · ' + l[LANG]) + arrowR + '</span></a>';
    }
    holder.innerHTML = '<div class="container lab-pager">' + card(prev, 'prev') + card(next, 'next') + '</div>';
  }

  // štýly lišty (aby fungovali aj na starších stránkach bez lab.css)
  var css = document.createElement('style');
  css.textContent =
    '.lab-nav .navbar-brand{white-space:normal}' +
    '.lab-nav .dropdown-menu{max-height:75vh;overflow:auto;min-width:17rem;max-width:calc(100vw - 2rem)}' +
    '.lab-nav-num{display:inline-block;min-width:2.6rem;font-weight:700;color:#6c757d}' +
    '.lab-nav .dropdown-item.active .lab-nav-num{color:#fff}' +
    '.lab-nav-current{max-width:60vw;overflow:hidden;text-overflow:ellipsis}' +
    '.lab-pager{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding-bottom:1.5rem}' +
    '.lab-pager-link{display:flex;flex-direction:column;gap:.1rem;padding:.75rem 1rem;border-radius:.75rem;background:#fff;' +
    'box-shadow:0 .25rem 1rem #1d2d5010;text-decoration:none;color:inherit;max-width:100%}' +
    '.lab-pager-link.next{margin-left:auto;text-align:right}' +
    '.lab-pager-link small{color:#6c757d}.lab-pager-link span{font-weight:600}' +
    '.lab-pager-link:hover{box-shadow:0 .5rem 1.5rem #1d2d5020}';
  document.head.appendChild(css);

  renderNav();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderPager);
  else renderPager();

  window.LabNav = { lessons: LESSONS, lang: LANG };
})();
