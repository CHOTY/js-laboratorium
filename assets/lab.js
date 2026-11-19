/* =====================================================================
   Jazyky webu – laboratórium: spoločné nástroje lekcií 0–5 a XML
   - zvýrazňovanie kódu: <pre class="code-inspector" data-lang="html|css|js|xml">
   - tlačidlo Kopírovať: <pre data-copy>
   - živý editor: <div class="live"><textarea data-part="html">…</textarea><textarea data-part="css">…</textarea></div>
   - kvíz: Lab.quiz('#kviz', [{ q, o: [...], a, e }])
   - ihrisko s CSS vlastnosťami: Lab.playground(root, { target, selector, props })
   - náhľad s meniteľnou šírkou: Lab.resizer(root, { doc })
   ===================================================================== */
(function () {
  'use strict';

  var LANG = (document.documentElement.lang || 'sk').slice(0, 2);
  var UI = {
    sk: { copy: 'Kopírovať', copied: 'Skopírované ✓', reset: 'Obnoviť pôvodný kód', preview: 'výsledok', width: 'Šírka okna',
      evaluate: 'Vyhodnotiť', clear: 'Vymazať odpovede', score: 'Výsledok', correct: '✔ Správne. ', wrong: '✖ Nesprávne. ', none: '– Bez odpovede. ' },
    en: { copy: 'Copy', copied: 'Copied ✓', reset: 'Reset code', preview: 'result', width: 'Window width',
      evaluate: 'Check answers', clear: 'Clear answers', score: 'Score', correct: '✔ Correct. ', wrong: '✖ Wrong. ', none: '– No answer. ' },
    es: { copy: 'Copiar', copied: 'Copiado ✓', reset: 'Restaurar código', preview: 'resultado', width: 'Ancho de la ventana',
      evaluate: 'Comprobar', clear: 'Borrar respuestas', score: 'Resultado', correct: '✔ Correcto. ', wrong: '✖ Incorrecto. ', none: '– Sin respuesta. ' }
  }[LANG] || null;
  if (!UI) UI = { copy: 'Copy', copied: 'Copied ✓', reset: 'Reset', preview: 'result', width: 'Width', evaluate: 'Check', clear: 'Clear', score: 'Score', correct: '✔ ', wrong: '✖ ', none: '– ' };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function span(cls, t) { return '<span class="' + cls + '">' + esc(t) + '</span>'; }

  /* ------------------------------------------------------------------
     Zvýrazňovanie
     ------------------------------------------------------------------ */
  function hlJS(src) {
    var re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|var|function|return|if|else|for|of|in|while|new|true|false|null|undefined|typeof|this|try|catch)\b|\b(document|console|window|Number|Math)\b|\b(\d+(?:\.\d+)?)\b/g;
    var out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      out += span(m[1] ? 'com' : m[2] ? 'str' : m[3] ? 'kw' : m[4] ? 'obj' : 'num', m[0]);
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }

  function hlCSS(src) {
    // rozdelíme na komentáre a zvyšok, zvyšok na kúsky ukončené { } ;
    var pieces = src.split(/(\/\*[\s\S]*?\*\/)/);
    var tokens = [];
    pieces.forEach(function (p, i) {
      if (i % 2) { tokens.push({ t: 'com', v: p }); return; }
      p.split(/([{};])/).forEach(function (q, j) {
        if (q === '') return;
        tokens.push({ t: j % 2 ? 'delim' : 'text', v: q });
      });
    });
    var out = '';
    tokens.forEach(function (tok, i) {
      if (tok.t === 'com') { out += span('com', tok.v); return; }
      if (tok.t === 'delim') { out += esc(tok.v); return; }
      var next = null;
      for (var k = i + 1; k < tokens.length; k++) if (tokens[k].t === 'delim') { next = tokens[k].v; break; }
      var v = tok.v;
      if (next === '{') {
        var mm = /^(\s*)([\s\S]*?)(\s*)$/.exec(v);
        out += esc(mm[1]) + span('sel', mm[2]) + esc(mm[3]);
      } else {
        var d = /^(\s*)([\w-]+)(\s*:\s*)([\s\S]*?)(\s*)$/.exec(v);
        if (d) out += esc(d[1]) + span('prop', d[2]) + esc(d[3]) + span('value', d[4]) + esc(d[5]);
        else out += esc(v);
      }
    });
    return out;
  }

  function hlMarkup(src, xml) {
    var re = xml
      ? /(<!--[\s\S]*?-->)|(<!\[CDATA\[[\s\S]*?\]\]>)|(<\?[\s\S]*?\?>)|(<![A-Z][^>]*>?)|(<\/?)([\w:.-]+)((?:\s+[\w:.-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)(\s*\/?>)/g
      : /(<!--[\s\S]*?-->)|()()(<!doctype[^>]*>)|(<\/?)([\w-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)(\s*\/?>)/gi;
    var out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      if (m[1]) out += span('com', m[1]);
      else if (m[2]) out += span('str', m[2]);
      else if (m[3]) out += span('pi', m[3]);
      else if (m[4]) out += span('pi', m[4]);
      else {
        out += span('tag', m[5] + m[6]);
        out += m[7].replace(/([\w:.-]+)(\s*=\s*)?("[^"]*"|'[^']*')?/g, function (a, n, eq, v) {
          return a.trim() === '' ? a : span('attr', n) + (eq ? esc(eq) : '') + (v ? span('value', v) : '');
        });
        out += span('tag', m[8]);
      }
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }

  var HL = {
    js: hlJS,
    css: hlCSS,
    html: function (s) { return hlMarkup(s, false); },
    xml: function (s) { return hlMarkup(s, true); },
    text: esc
  };
  function highlight(lang, src) { return (HL[lang] || esc)(src); }
  function setCode(el, lang, src) { el.innerHTML = highlight(lang, src); }

  /* ------------------------------------------------------------------
     Obrázky do ukážok (aby nebolo treba sťahovať súbory)
     ------------------------------------------------------------------ */
  function svgScene(kind) {
    var s = {
      'slnecnica': '<rect width="400" height="260" fill="#7dd3fc"/><rect y="190" width="400" height="70" fill="#4d7c0f"/><rect x="196" y="120" width="8" height="110" fill="#365314"/><g transform="translate(200 110)">' +
        Array.apply(null, Array(14)).map(function (_, i) { return '<ellipse rx="10" ry="34" fill="#facc15" transform="rotate(' + i * 25.7 + ') translate(0 -40)"/>'; }).join('') + '<circle r="30" fill="#78350f"/></g>',
      'hory': '<rect width="400" height="260" fill="#fde68a"/><circle cx="310" cy="70" r="34" fill="#f97316"/><path d="M0 260 L120 90 L210 210 L280 130 L400 260Z" fill="#475569"/><path d="M120 90 L150 133 L132 128 L120 142 L106 130 L95 126Z" fill="#fff"/>',
      'mesto': '<rect width="400" height="260" fill="#1e3a8a"/><circle cx="330" cy="60" r="22" fill="#fef3c7"/>' +
        [[20, 120, 60], [90, 80, 50], [150, 140, 70], [230, 60, 55], [295, 110, 80]].map(function (b) { return '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + (260 - b[1]) + '" fill="#0f172a"/>'; }).join('') +
        '<g fill="#fde047">' + Array.apply(null, Array(24)).map(function (_, i) { return '<rect x="' + (30 + (i * 53) % 340) + '" y="' + (150 + (i * 37) % 90) + '" width="8" height="10"/>'; }).join('') + '</g>',
      'more': '<rect width="400" height="260" fill="#bae6fd"/><rect y="150" width="400" height="110" fill="#0284c7"/><path d="M0 170 Q50 155 100 170 T200 170 T300 170 T400 170 V260 H0Z" fill="#0369a1"/><rect y="215" width="400" height="45" fill="#fde68a"/><circle cx="80" cy="70" r="30" fill="#facc15"/>',
      'vzor': '<rect width="400" height="260" fill="#ede9fe"/><g fill="#8b5cf6" opacity=".55">' +
        Array.apply(null, Array(30)).map(function (_, i) { return '<circle cx="' + (20 + (i % 6) * 72) + '" cy="' + (25 + Math.floor(i / 6) * 55) + '" r="12"/>'; }).join('') + '</g>',
      'logo': '<rect width="400" height="260" rx="40" fill="#111827"/><text x="200" y="160" font-family="Arial" font-size="96" font-weight="700" fill="#34d399" text-anchor="middle">&lt;/&gt;</text>'
    }[kind];
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="400" height="260">' + s + '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  var FILES = {};
  ['slnecnica', 'hory', 'mesto', 'more', 'vzor', 'logo'].forEach(function (n) {
    ['jpg', 'png', 'svg'].forEach(function (ext) { FILES['img/' + n + '.' + ext] = null; });
  });
  function resolveFiles(text) {
    return text.replace(/(?:\.\.\/|\.\/)?img\/(slnecnica|hory|mesto|more|vzor|logo)\.(?:jpg|png|svg)/g, function (m, n) { return svgScene(n); });
  }

  /* ------------------------------------------------------------------
     Dokument pre náhľad
     ------------------------------------------------------------------ */
  var BOOTSTRAP_CSS = '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">';
  var BOOTSTRAP_JS = '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"><\/script>';
  var BASE = 'body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;margin:12px;line-height:1.45}img{max-width:100%}';

  function buildDoc(opts) {
    if (opts.full) return resolveFiles(opts.html || '');
    var head = '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
      (opts.bootstrap ? BOOTSTRAP_CSS : '') +
      '<style>' + (opts.nobase ? '' : BASE) + resolveFiles(opts.css || '') + '</style>';
    var tail = (opts.bootstrap === 'js' ? BOOTSTRAP_JS : '') + (opts.js ? '<script>' + opts.js.replace(/<\/script/gi, '<\\/script') + '<\/script>' : '');
    return '<!doctype html><html lang="' + LANG + '"><head>' + head + '</head><body>' + resolveFiles(opts.html || '') + tail + '</body></html>';
  }

  /* ------------------------------------------------------------------
     Živý editor
     ------------------------------------------------------------------ */
  function buildLive(root) {
    var areas = $$('textarea[data-part]', root);
    if (!areas.length) return;
    var initial = areas.map(function (a) { return a.value.replace(/^\n/, ''); });
    areas.forEach(function (a, i) { a.value = initial[i]; a.spellcheck = false; a.setAttribute('autocapitalize', 'off'); });
    var height = Number(root.dataset.height) || 280;

    var bar = document.createElement('div');
    bar.className = 'live-bar';
    var tabs = areas.map(function (a, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'live-tab' + (i === 0 ? ' active' : '');
      b.textContent = a.dataset.label || a.dataset.part.toUpperCase();
      b.addEventListener('click', function () { show(i); });
      bar.appendChild(b);
      return b;
    });
    var reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'live-reset';
    reset.textContent = UI.reset;
    bar.appendChild(reset);

    var body = document.createElement('div');
    body.className = 'live-body';
    var codeCol = document.createElement('div');
    areas.forEach(function (a) { a.style.minHeight = height + 'px'; codeCol.appendChild(a); });
    var prev = document.createElement('div');
    prev.className = 'live-preview';
    var label = document.createElement('span');
    label.className = 'live-preview-label';
    label.textContent = UI.preview;
    var frame = document.createElement('iframe');
    frame.title = UI.preview;
    frame.setAttribute('sandbox', 'allow-scripts allow-modals');
    frame.style.minHeight = height + 'px';
    prev.appendChild(label);
    prev.appendChild(frame);
    body.appendChild(codeCol);
    body.appendChild(prev);

    root.innerHTML = '';
    root.appendChild(bar);
    root.appendChild(body);

    function show(i) {
      areas.forEach(function (a, j) { a.style.display = i === j ? 'block' : 'none'; });
      tabs.forEach(function (t, j) { t.classList.toggle('active', i === j); });
    }
    function part(name) {
      var a = areas.filter(function (x) { return x.dataset.part === name; })[0];
      return a ? a.value : '';
    }
    // viac volaní v jednej úlohe spojíme do jedného (dve rýchle zmeny srcdoc Chrome niekedy nespracuje)
    var pending = false;
    function render() {
      if (pending) return;
      pending = true;
      setTimeout(function () { pending = false; draw(); }, 0);
    }
    function draw() {
      frame.srcdoc = buildDoc({
        html: part('html') || part('doc'), css: part('css'), js: part('js'),
        full: !!part('doc'), bootstrap: root.dataset.bootstrap, nobase: root.hasAttribute('data-nobase')
      });
    }
    var timer = null;
    areas.forEach(function (a) {
      a.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(render, 300); });
      a.addEventListener('keydown', function (e) {
        if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); a.setRangeText('  ', a.selectionStart, a.selectionEnd, 'end'); }
      });
    });
    reset.addEventListener('click', function () {
      areas.forEach(function (a, i) { a.value = initial[i]; });
      render();
    });
    show(0);
    render();
    root.labRender = render;
  }

  /* ------------------------------------------------------------------
     Náhľad s meniteľnou šírkou
     ------------------------------------------------------------------ */
  function resizer(root, opts) {
    opts = opts || {};
    var min = opts.min || 320, max = opts.max || 1200, value = opts.value || 900;
    root.classList.add('resizer');
    root.innerHTML =
      '<div class="resizer-bar"><span>' + UI.width + ':</span><input type="range" min="' + min + '" max="' + max + '" step="10" value="' + value + '" aria-label="' + UI.width + '">' +
      '<span class="px"></span>' + (opts.presets === false ? '' :
        '<span class="btn-group btn-group-sm"><button type="button" class="btn btn-outline-secondary" data-w="375">📱 375</button><button type="button" class="btn btn-outline-secondary" data-w="768">768</button><button type="button" class="btn btn-outline-secondary" data-w="1100">🖥 1100</button></span>') +
      '</div><div class="resizer-stage"><iframe title="' + UI.preview + '" sandbox="allow-scripts"></iframe></div>';
    var range = $('input', root), px = $('.px', root), frame = $('iframe', root), stage = $('.resizer-stage', root);
    var height = opts.height || 340, current = value;
    frame.style.height = height + 'px';
    // širšie „okno“, ako je miesto na stránke, zmenšíme (zoom), aby bolo vidieť celé
    function fit() {
      var avail = stage.clientWidth || current;
      var scale = Math.min(1, avail / current);
      frame.style.transform = scale < 1 ? 'scale(' + scale + ')' : '';
      frame.style.transformOrigin = 'top left';
      frame.style.margin = scale < 1 ? '0' : '0 auto';
      stage.style.height = Math.ceil(height * scale) + 'px';
      stage.title = scale < 1 ? Math.round(scale * 100) + ' %' : '';
    }
    function setW(w) {
      w = Math.max(min, Math.min(max, Number(w)));
      current = w;
      range.value = w;
      frame.style.width = w + 'px';
      px.textContent = w + ' px';
      fit();
      if (opts.onWidth) opts.onWidth(w);
    }
    window.addEventListener('resize', fit);
    range.addEventListener('input', function () { setW(range.value); });
    $$('[data-w]', root).forEach(function (b) { b.addEventListener('click', function () { setW(b.dataset.w); }); });
    var api = {
      frame: frame,
      setDoc: function (d) { frame.srcdoc = typeof d === 'string' ? d : buildDoc(d); },
      setWidth: setW
    };
    if (opts.doc) api.setDoc(opts.doc);
    setW(value);
    return api;
  }

  /* ------------------------------------------------------------------
     Ihrisko s CSS vlastnosťami
     props: [{ prop, type: 'range'|'select'|'color'|'text', min, max, step, unit, value, options, label }]
     ------------------------------------------------------------------ */
  function playground(root, opts) {
    var controls = $('.pg-controls', root);
    var codeEl = $('.pg-code', root);
    var targets = typeof opts.target === 'string' ? $$(opts.target, root) : [].concat(opts.target);
    var values = {};
    function fmt(p) { return values[p.prop] + (p.type === 'range' && p.unit ? p.unit : ''); }
    function apply() {
      opts.props.forEach(function (p) {
        targets.forEach(function (t) {
          if (p.apply) p.apply(t, fmt(p), values[p.prop]);
          else t.style.setProperty(p.prop, fmt(p));
        });
      });
      if (codeEl) {
        var lines = opts.props.filter(function (p) { return !p.hidden; }).map(function (p) { return '  ' + (p.cssName || p.prop) + ': ' + fmt(p) + ';'; });
        setCode(codeEl, 'css', (opts.selector || '.box') + ' {\n' + lines.join('\n') + '\n}');
      }
      if (opts.onChange) opts.onChange(values);
    }
    controls.innerHTML = '';
    opts.props.forEach(function (p, i) {
      values[p.prop] = p.value;
      var row = document.createElement('div');
      row.className = 'pg-row';
      var id = (root.id || 'pg') + '-' + i;
      var lab = document.createElement('label');
      lab.htmlFor = id;
      lab.textContent = p.label || p.cssName || p.prop;
      var input, out = document.createElement('span');
      out.className = 'pg-val';
      if (p.type === 'select') {
        input = document.createElement('select');
        input.className = 'form-select form-select-sm';
        p.options.forEach(function (o) {
          var op = document.createElement('option');
          op.value = op.textContent = o;
          input.appendChild(op);
        });
      } else {
        input = document.createElement('input');
        input.type = p.type || 'range';
        if (p.type === 'range' || !p.type) {
          input.className = 'form-range';
          input.min = p.min; input.max = p.max; input.step = p.step || 1;
        } else if (p.type === 'text') input.className = 'form-control form-control-sm';
      }
      input.id = id;
      input.value = p.value;
      input.addEventListener('input', function () {
        values[p.prop] = input.value;
        out.textContent = p.type === 'select' || p.type === 'text' ? '' : fmt(p);
        apply();
      });
      out.textContent = p.type === 'select' || p.type === 'text' ? '' : fmt(p);
      row.appendChild(lab); row.appendChild(input); row.appendChild(out);
      controls.appendChild(row);
      p.input = input;
    });
    apply();
    return {
      set: function (prop, v) {
        opts.props.forEach(function (p) { if (p.prop === prop) { p.input.value = v; values[prop] = v; } });
        apply();
      },
      values: values
    };
  }

  /* ------------------------------------------------------------------
     Kvíz
     ------------------------------------------------------------------ */
  function quiz(holder, questions) {
    if (typeof holder === 'string') holder = $(holder);
    var answers = questions.map(function () { return null; });
    var wrap = document.createElement('div');
    questions.forEach(function (item, qi) {
      var box = document.createElement('div');
      box.className = 'quiz-question';
      var title = document.createElement('p');
      title.className = 'fw-semibold mb-2';
      title.textContent = (qi + 1) + '. ' + item.q;
      var list = document.createElement('div');
      list.className = 'list-group';
      item.o.forEach(function (opt, oi) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'list-group-item list-group-item-action small' + (item.mono === false ? '' : ' font-monospace');
        btn.textContent = opt;
        btn.addEventListener('click', function () {
          if (holder.classList.contains('quiz-done')) return;
          answers[qi] = oi;
          $$('.list-group-item', list).forEach(function (b) { b.classList.remove('vybrana'); });
          btn.classList.add('vybrana');
        });
        list.appendChild(btn);
      });
      var fb = document.createElement('div');
      fb.className = 'small mt-2';
      box.appendChild(title); box.appendChild(list); box.appendChild(fb);
      wrap.appendChild(box);
    });
    var controls = document.createElement('div');
    controls.className = 'd-flex flex-wrap align-items-center gap-2';
    var evalBtn = document.createElement('button');
    evalBtn.type = 'button'; evalBtn.className = 'btn btn-primary'; evalBtn.textContent = UI.evaluate;
    var resetBtn = document.createElement('button');
    resetBtn.type = 'button'; resetBtn.className = 'btn btn-outline-secondary'; resetBtn.textContent = UI.clear;
    var score = document.createElement('span');
    score.className = 'fw-semibold ms-2';
    controls.appendChild(evalBtn); controls.appendChild(resetBtn); controls.appendChild(score);
    evalBtn.addEventListener('click', function () {
      var good = 0;
      $$('.quiz-question', wrap).forEach(function (box, qi) {
        var opts = $$('.list-group-item', box);
        var q = questions[qi];
        opts[q.a].classList.add('list-group-item-success');
        var fb = box.lastElementChild;
        if (answers[qi] === q.a) { good++; fb.className = 'small mt-2 text-success'; fb.textContent = UI.correct + q.e; }
        else {
          if (answers[qi] !== null) opts[answers[qi]].classList.add('list-group-item-danger');
          fb.className = 'small mt-2 text-danger';
          fb.textContent = (answers[qi] === null ? UI.none : UI.wrong) + q.e;
        }
      });
      holder.classList.add('quiz-done');
      score.textContent = UI.score + ': ' + good + ' / ' + questions.length;
    });
    resetBtn.addEventListener('click', function () {
      answers = questions.map(function () { return null; });
      holder.classList.remove('quiz-done');
      $$('.list-group-item', wrap).forEach(function (b) { b.classList.remove('vybrana', 'list-group-item-success', 'list-group-item-danger'); });
      $$('.quiz-question', wrap).forEach(function (box) { box.lastElementChild.textContent = ''; });
      score.textContent = '';
    });
    holder.appendChild(wrap);
    holder.appendChild(controls);
  }

  /* ------------------------------------------------------------------
     Konzola
     ------------------------------------------------------------------ */
  function logTo(box, text, cls) {
    $$('.line.muted', box).forEach(function (l) { l.remove(); });
    var line = document.createElement('div');
    line.className = 'line ' + (cls || '');
    line.textContent = text;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
  }
  function clearConsole(box) { box.innerHTML = ''; }

  /* ------------------------------------------------------------------
     Kopírovanie
     ------------------------------------------------------------------ */
  function copyText(text, btn) {
    function done() { btn.textContent = UI.copied; setTimeout(function () { btn.textContent = UI.copy; }, 1500); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) { /* nič */ }
      ta.remove(); done();
    }
  }

  /* ------------------------------------------------------------------
     Inicializácia
     ------------------------------------------------------------------ */
  function init() {
    $$('pre.code-inspector[data-lang]').forEach(function (pre) {
      pre.innerHTML = highlight(pre.dataset.lang, pre.textContent.replace(/^\n/, ''));
    });
    $$('pre[data-copy]').forEach(function (pre) {
      var wrap = document.createElement('div');
      wrap.className = 'copy-wrap';
      ['d-none', 'mt-2', 'mt-3', 'mb-2', 'mb-3'].forEach(function (c) {
        if (pre.classList.contains(c)) { wrap.classList.add(c); pre.classList.remove(c); }
      });
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = UI.copy;
      btn.addEventListener('click', function () { copyText(pre.textContent, btn); });
      wrap.appendChild(btn);
    });
    $$('.live').forEach(buildLive);
    // jednoduché záložky: <div data-tabs> s tlačidlami [data-tab="id"] a panelmi s id
    $$('[data-tabs]').forEach(function (group) {
      var buttons = $$('[data-tab]', group);
      buttons.forEach(function (b) {
        b.addEventListener('click', function () {
          buttons.forEach(function (x) {
            var on = x === b;
            x.classList.toggle('active', on);
            var panel = document.getElementById(x.dataset.tab);
            if (panel) (panel.closest('.copy-wrap') || panel).classList.toggle('d-none', !on);
          });
        });
      });
    });
  }

  window.Lab = {
    lang: LANG, ui: UI, $: $, $$: $$, esc: esc,
    highlight: highlight, setCode: setCode, buildDoc: buildDoc, svgScene: svgScene,
    resizer: resizer, playground: playground, quiz: quiz, logTo: logTo, clearConsole: clearConsole
  };

  // lab.js sa vkladá na koniec <body> – obsah stránky už existuje, takže hneď inicializujeme,
  // aby skript stránky (hneď za lab.js) mohol používať hotové editory
  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
