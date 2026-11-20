/* =====================================================================
   Jazyky webu – laboratórium: stránka Záverečný projekt
   - zoznam požiadaviek a odhad bodov (pamätá si ich localStorage)
   - kalkulačka výslednej známky
   - kontrola .zip projektu priamo v prehliadači (JSZip), nič sa neodosiela
   Texty pre jazyk nastaví stránka do window.PROJECT_I18N pred týmto skriptom.
   ===================================================================== */
(function () {
  'use strict';

  var T = window.PROJECT_I18N;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fill(str, vals) {
    return String(str).replace(/\{(\w+)\}/g, function (m, k) { return vals && k in vals ? vals[k] : m; });
  }
  function num(v, digits) {
    var f = Math.pow(10, digits == null ? 1 : digits);
    var s = String(Math.round(v * f) / f);
    return T.decimalComma ? s.replace('.', ',') : s;
  }

  /* ------------------------------------------------------------------
     Zaškrtávacie zoznamy s pamäťou
     ------------------------------------------------------------------ */
  function remember(boxes, key, onChange) {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { saved = {}; }
    boxes.forEach(function (b) {
      if (saved[b.id]) b.checked = true;
      b.addEventListener('change', function () {
        saved[b.id] = b.checked;
        try { localStorage.setItem(key, JSON.stringify(saved)); } catch (e) { /* bez pamäte */ }
        if (onChange) onChange();
      });
    });
    if (onChange) onChange();
  }

  var reqBoxes = $$('#req-list input[type=checkbox]');
  function reqUpdate() {
    var done = reqBoxes.filter(function (b) { return b.checked; }).length;
    var out = $('#req-count');
    if (out) out.textContent = fill(T.reqCount, { done: done, all: reqBoxes.length });
  }
  remember(reqBoxes, 'lab-project-req', reqUpdate);

  var scoreBoxes = $$('#score-grid input[type=checkbox]');
  function scoreUpdate() {
    var sum = scoreBoxes.reduce(function (s, b) { return s + (b.checked ? Number(b.dataset.pts || 1) : 0); }, 0);
    $('#score-sum').textContent = sum;
    var bar = $('#score-bar');
    bar.style.width = (sum / 25 * 100) + '%';
    bar.classList.toggle('bg-danger', sum < 10);
    bar.classList.toggle('bg-success', sum >= 10);
    $('#score-status').textContent = sum < 10 ? fill(T.scoreLow, { missing: 10 - sum }) : T.scoreOk;
    $('#score-status').className = 'small fw-semibold ' + (sum < 10 ? 'text-danger' : 'text-success');
    $$('#score-grid .score-card').forEach(function (card) {
      var bx = $$('input[type=checkbox]', card);
      var got = bx.reduce(function (s, b) { return s + (b.checked ? Number(b.dataset.pts || 1) : 0); }, 0);
      var badge = $('.score-got', card);
      if (badge) badge.textContent = got;
      card.classList.toggle('complete', bx.every(function (b) { return b.checked; }));
    });
  }
  if (scoreBoxes.length) remember(scoreBoxes, 'lab-project-score', scoreUpdate);
  var reset = $('#score-reset');
  if (reset) reset.addEventListener('click', function () {
    scoreBoxes.forEach(function (b) { b.checked = false; });
    try { localStorage.removeItem('lab-project-score'); } catch (e) { /* nič */ }
    scoreUpdate();
  });

  /* ------------------------------------------------------------------
     Kalkulačka známky
     ------------------------------------------------------------------ */
  function band(v) { return v >= 92 ? 5 : v >= 75 ? 4 : v >= 60 ? 3 : 0; }
  function grade(v) { return v >= 95 ? 'A' : v >= 90 ? 'B' : v >= 85 ? 'C' : v >= 80 ? 'D' : v >= 70 ? 'E' : 'FX'; }

  var calc = $('#calc');
  if (calc) {
    var inputs = $$('input[data-calc]', calc);
    // posuvník a číselné pole sú spárované
    inputs.forEach(function (inp) {
      inp.addEventListener('input', function () {
        $$('input[data-calc="' + inp.dataset.calc + '"]', calc).forEach(function (o) { if (o !== inp) o.value = inp.value; });
        calcUpdate();
      });
    });
    var calcUpdate = function () {
      function val(k) {
        var el = $('input[type=number][data-calc="' + k + '"]', calc);
        if (!el) return null;
        var v = parseFloat(String(el.value).replace(',', '.'));
        return isNaN(v) ? 0 : Math.max(0, Math.min(Number(el.max), v));
      }
      var pts = val('project'), test = val('test'), auto = val('auto'), tasks = val('tasks');
      var projPct = pts / 25 * 100;
      var base = (projPct + test) / 2;
      var bAuto = auto == null ? 0 : band(auto), bTasks = band(tasks);
      var total = base + bAuto + bTasks;
      var lines = [];
      lines.push(fill(T.calcProject, { pts: num(pts), pct: num(projPct) }));
      lines.push(fill(T.calcBase, { p: num(projPct), t: num(test), r: num(base, 2) }));
      if (auto != null) lines.push(fill(T.calcAuto, { v: num(auto), b: bAuto }));
      lines.push(fill(T.calcTasks, { v: num(tasks), b: bTasks }));
      $('#calc-lines').innerHTML = lines.map(function (l) { return '<li>' + l + '</li>'; }).join('');
      var problems = [];
      if (test < 60) problems.push(T.calcTestLow);
      if (pts < 10) problems.push(T.calcProjectLow);
      var g = problems.length ? 'FX' : grade(total);
      $('#calc-total').textContent = num(total, 2) + ' %';
      var gEl = $('#calc-grade');
      gEl.textContent = g;
      gEl.className = 'calc-grade grade-' + g.toLowerCase();
      $('#calc-note').innerHTML = problems.length ? problems.map(esc).join('<br>') : esc(T.calcOk);
      $('#calc-note').className = 'small mb-0 ' + (problems.length ? 'text-danger fw-semibold' : 'text-secondary');
      $$('#grade-scale tr[data-g]').forEach(function (tr) { tr.classList.toggle('table-active', tr.dataset.g === g); });
    };
    calcUpdate();
  }

  /* ------------------------------------------------------------------
     Kontrola .zip projektu
     ------------------------------------------------------------------ */
  var IMG_EXT = /\.(jpe?g|png|gif|svg|webp|avif|ico|bmp)$/i;
  var IGNORE = /(^|\/)(__MACOSX|\.DS_Store|Thumbs\.db|desktop\.ini|\.git|\.vscode)(\/|$)/i;
  var CREATIVE = /<!--\s*(kreat[ií]vny\s+bod|creative\s+point|punto\s+creativo)\s*-->/gi;

  // vyrieši relatívnu cestu voči súboru v zipe, vráti null pre externé odkazy
  function resolve(from, ref) {
    if (ref == null) return null;
    ref = ref.trim();
    if (!ref || ref[0] === '#' || /^(https?:|mailto:|tel:|data:|javascript:|\/\/|sms:|ftp:)/i.test(ref)) return null;
    ref = ref.replace(/[?#].*$/, '');
    if (!ref) return null;
    try { ref = decodeURI(ref); } catch (e) { /* necháme tak */ }
    var parts = from.split('/'); parts.pop();
    ref.split('/').forEach(function (p) {
      if (p === '..') parts.pop();
      else if (p !== '.' && p !== '') parts.push(p);
    });
    return parts.join('/');
  }
  function isAbsolutePath(ref) {
    return /^(file:|[a-z]:[\\/]|\\\\)/i.test(ref.trim());
  }

  function Report() { this.items = []; }
  Report.prototype.add = function (group, level, text, detail) { this.items.push({ g: group, l: level, t: text, d: detail || '' }); };

  async function checkZip(blob, fileName) {
    if (!window.JSZip) throw new Error(T.noJszip);
    var zip = await window.JSZip.loadAsync(blob);
    var R = new Report();
    var G = T.groups;
    var all = Object.keys(zip.files).filter(function (p) { return !zip.files[p].dir && !IGNORE.test(p); });

    // --- názov zipu a koreňový priečinok
    var base = fileName.replace(/\.zip$/i, '');
    var zipRe = new RegExp('^[a-z0-9-]+_' + T.zipWord + '$');
    if (zipRe.test(base)) R.add(G.files, 'ok', fill(T.zipNameOk, { name: fileName }));
    else R.add(G.files, 'err', fill(T.zipNameBad, { name: fileName, example: T.zipExample }));

    var tops = {};
    all.forEach(function (p) { tops[p.indexOf('/') === -1 ? '' : p.split('/')[0]] = true; });
    var topNames = Object.keys(tops);
    var root = '';
    if (topNames.length === 1 && topNames[0] !== '') {
      root = topNames[0] + '/';
      if (topNames[0] === base) R.add(G.files, 'ok', fill(T.rootOk, { root: topNames[0] }));
      else R.add(G.files, 'warn', fill(T.rootName, { root: topNames[0], base: base }));
    } else if (tops['']) {
      R.add(G.files, 'err', T.rootMissing);
    } else {
      R.add(G.files, 'err', fill(T.rootMany, { list: topNames.join(', ') }));
      root = topNames[0] + '/';
    }

    var files = all.filter(function (p) { return p.indexOf(root) === 0; }).map(function (p) { return p.slice(root.length); });
    var has = {}; var lower = {};
    files.forEach(function (f) { has[f] = true; lower[f.toLowerCase()] = f; });

    var pages = files.filter(function (f) { return /\.html?$/i.test(f); }).sort();
    var cssFiles = files.filter(function (f) { return /\.css$/i.test(f); });
    var jsFiles = files.filter(function (f) { return /\.js$/i.test(f); });
    var imgFiles = files.filter(function (f) { return IMG_EXT.test(f); });

    if (has['index.html']) R.add(G.files, 'ok', T.indexOk);
    else R.add(G.files, 'err', T.indexMissing);
    var sub = pages.filter(function (f) { return f !== 'index.html'; });
    if (sub.length >= 3) R.add(G.files, 'ok', fill(T.pagesOk, { n: sub.length }), sub.join(', '));
    else R.add(G.files, 'err', fill(T.pagesFew, { n: sub.length }), sub.join(', '));

    function folderCheck(list, folder, okMsg, badMsg) {
      var inside = list.filter(function (f) { return f.indexOf(folder + '/') === 0; });
      if (inside.length) R.add(G.files, 'ok', fill(okMsg, { n: inside.length }));
      else R.add(G.files, list.length ? 'warn' : 'err', badMsg, list.join(', '));
    }
    folderCheck(cssFiles, 'css', T.cssOk, T.cssMissing);
    folderCheck(jsFiles, 'js', T.jsOk, T.jsMissing);
    folderCheck(imgFiles, 'img', T.imgOk, T.imgMissing);
    var outside = imgFiles.filter(function (f) { return f.indexOf('img/') !== 0; });
    if (outside.length) R.add(G.files, 'warn', T.imgOutside, outside.join(', '));
    var badNames = files.filter(function (f) { return /[A-Z\s]|[^\x00-\x7f]/.test(f); });
    if (badNames.length) R.add(G.files, 'warn', T.badNames, badNames.join(', '));
    var big = all.filter(function (p) { return IMG_EXT.test(p) && zip.files[p]._data && zip.files[p]._data.uncompressedSize > 1024 * 1024; });
    if (big.length) R.add(G.files, 'warn', T.bigImages, big.map(function (p) { return p.slice(root.length); }).join(', '));

    // --- texty všetkých súborov
    var text = {};
    await Promise.all(files.filter(function (f) { return /\.(html?|css|js)$/i.test(f); }).map(function (f) {
      return zip.file(root + f).async('string').then(function (s) { text[f] = s; });
    }));

    function missingRef(from, ref, where, out) {
      if (isAbsolutePath(ref)) { out.err.push(fill(T.refAbsolute, { ref: ref, where: where })); return; }
      if (/^\//.test(ref.trim()) && !/^\/\//.test(ref.trim())) { out.warn.push(fill(T.refRoot, { ref: ref, where: where })); return; }
      var target = resolve(from, ref);
      if (target == null) return;
      if (has[target]) return;
      if (lower[target.toLowerCase()]) out.err.push(fill(T.refCase, { ref: ref, real: lower[target.toLowerCase()], where: where }));
      else out.err.push(fill(T.refMissing, { ref: ref, where: where }));
    }

    var combinedHtml = '';
    var featureDocs = [];
    var commentCount = 0, creative = 0;

    pages.forEach(function (page) {
      var src = text[page] || '';
      combinedHtml += src;
      var doc = new DOMParser().parseFromString(src, 'text/html');
      featureDocs.push({ page: page, doc: doc });
      var out = { ok: [], warn: [], err: [] };

      if (!/^\s*(<!--[\s\S]*?-->\s*)*<!doctype html>/i.test(src)) out.warn.push(T.noDoctype);
      if (!doc.documentElement.getAttribute('lang')) out.warn.push(T.noLang);
      if (!doc.title.trim()) out.warn.push(T.noTitle);
      if (!doc.querySelector('meta[name="viewport" i]')) out.warn.push(T.noViewport);
      ['description', 'keywords', 'author'].forEach(function (n) {
        var m = doc.querySelector('meta[name="' + n + '" i]');
        if (!m || !(m.getAttribute('content') || '').trim()) out.err.push(fill(T.metaMissing, { name: n }));
      });
      var styles = doc.querySelectorAll('style').length;
      if (styles) out.err.push(fill(T.styleBlock, { n: styles }));
      var inlineStyle = doc.querySelectorAll('[style]').length;
      if (inlineStyle) out.warn.push(fill(T.styleAttr, { n: inlineStyle }));
      var inlineJs = Array.prototype.filter.call(doc.scripts, function (s) {
        return !s.getAttribute('src') && s.textContent.trim() && !/json|template/i.test(s.type || '');
      }).length;
      if (inlineJs) out.err.push(fill(T.scriptInline, { n: inlineJs }));
      var handlers = 0;
      Array.prototype.forEach.call(doc.querySelectorAll('*'), function (el) {
        Array.prototype.forEach.call(el.attributes, function (a) { if (/^on[a-z]+$/i.test(a.name)) handlers++; });
      });
      if (handlers) out.warn.push(fill(T.handlers, { n: handlers }));

      var localCss = Array.prototype.filter.call(doc.querySelectorAll('link[rel~="stylesheet" i][href]'), function (l) {
        return resolve(page, l.getAttribute('href')) != null;
      });
      if (!localCss.length) out.err.push(T.noLocalCss);

      var refs = [];
      [['a', 'href'], ['link', 'href'], ['script', 'src'], ['img', 'src'], ['source', 'src'], ['video', 'src'],
        ['video', 'poster'], ['audio', 'src'], ['iframe', 'src'], ['form', 'action'], ['embed', 'src'], ['object', 'data']]
        .forEach(function (pair) {
          Array.prototype.forEach.call(doc.querySelectorAll(pair[0] + '[' + pair[1] + ']'), function (el) {
            refs.push(el.getAttribute(pair[1]));
          });
        });
      Array.prototype.forEach.call(doc.querySelectorAll('[srcset]'), function (el) {
        el.getAttribute('srcset').split(',').forEach(function (part) { var u = part.trim().split(/\s+/)[0]; if (u) refs.push(u); });
      });
      Array.prototype.forEach.call(doc.querySelectorAll('[style]'), function (el) {
        (el.getAttribute('style').match(/url\(\s*['"]?[^'")]+/gi) || []).forEach(function (m) { refs.push(m.replace(/url\(\s*['"]?/i, '')); });
      });
      var seenRef = {};
      refs.forEach(function (ref) {
        if (seenRef[ref]) return;
        seenRef[ref] = true;
        missingRef(page, ref, page, out);
      });

      var linked = {};
      Array.prototype.forEach.call(doc.querySelectorAll('a[href]'), function (a) {
        var t = resolve(page, a.getAttribute('href'));
        if (t && t !== page && /\.html?$/i.test(t) && has[t]) linked[t] = true;
      });
      var nLinked = Object.keys(linked).length;
      if (nLinked < 3) out.warn.push(fill(T.navFew, { n: nLinked }));

      var c = (src.match(/<!--[\s\S]*?-->/g) || []).length;
      commentCount += c;
      creative += (src.match(CREATIVE) || []).length;

      var level = out.err.length ? 'err' : out.warn.length ? 'warn' : 'ok';
      var detail = out.err.map(function (m) { return '✖ ' + m; }).concat(out.warn.map(function (m) { return '⚠ ' + m; }));
      R.add(G.pages, level, fill(level === 'ok' ? T.pageOk : T.pageIssues, { page: page, e: out.err.length, w: out.warn.length }), detail.join('\n'));
    });

    // --- CSS a JS súbory
    var cssText = '', jsText = '';
    cssFiles.forEach(function (f) {
      var s = text[f] || '';
      cssText += s;
      commentCount += (s.match(/\/\*[\s\S]*?\*\//g) || []).length;
      var out = { ok: [], warn: [], err: [] };
      (s.match(/url\(\s*['"]?[^'")]+/gi) || []).forEach(function (m) {
        missingRef(f, m.replace(/url\(\s*['"]?/i, ''), f, out);
      });
      if (out.err.length || out.warn.length) {
        R.add(G.pages, out.err.length ? 'err' : 'warn', fill(T.pageIssues, { page: f, e: out.err.length, w: out.warn.length }),
          out.err.map(function (m) { return '✖ ' + m; }).concat(out.warn.map(function (m) { return '⚠ ' + m; })).join('\n'));
      }
    });
    jsFiles.forEach(function (f) {
      var s = text[f] || '';
      jsText += s;
      commentCount += (s.match(/\/\*[\s\S]*?\*\/|(^|[^:'"\\])\/\/[^\n]*/g) || []).length;
    });
    if (!commentCount) R.add(G.files, 'warn', T.noComments);
    else R.add(G.files, 'ok', fill(T.comments, { n: commentCount }));

    // --- prvky z bodovania (odhad)
    function any(sel) {
      return featureDocs.some(function (d) { try { return !!d.doc.querySelector(sel); } catch (e) { return false; } });
    }
    function count(sel) {
      return featureDocs.reduce(function (s, d) { try { return s + d.doc.querySelectorAll(sel).length; } catch (e) { return s; } }, 0);
    }
    var levels = {};
    featureDocs.forEach(function (d) {
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(function (h) { if (d.doc.querySelector(h)) levels[h] = true; });
    });
    var formOk = featureDocs.some(function (d) {
      return Array.prototype.some.call(d.doc.querySelectorAll('form'), function (f) {
        return f.querySelector('input[type="email" i]') && f.querySelector('textarea') && f.querySelector('input[type="checkbox" i]') &&
          f.querySelector('button:not([type="button" i]):not([type="reset" i]), input[type="submit" i]');
      });
    });
    var thanks = featureDocs.some(function (d) {
      return Array.prototype.some.call(d.doc.querySelectorAll('form[action]'), function (f) {
        var t = resolve(d.page, f.getAttribute('action'));
        return t && has[t];
      });
    }) || /location(\.href)?\s*=|location\.(assign|replace)\s*\(/.test(jsText);
    var features = [
      ['headings', Object.keys(levels).length >= 3, Object.keys(levels).sort().join(', ')],
      ['hamburger', any('.navbar-toggler, [class*="hamburger" i], [class*="burger" i], [class*="menu-toggle" i], [class*="nav-toggle" i], button[aria-controls][aria-expanded]')],
      ['logo', any('nav img, header img, .navbar-brand img, [class*="logo" i]')],
      ['sticky', any('.sticky-top, .fixed-top') || /position\s*:\s*(sticky|fixed)/i.test(cssText)],
      ['footerCopy', /&copy;|©|copyright/i.test(featureDocs.map(function (d) { var f = d.doc.querySelector('footer'); return f ? f.innerHTML : ''; }).join(' '))],
      ['form', formOk],
      ['thanks', thanks],
      ['images', count('img') > 0, String(count('img'))],
      ['button', any('a.btn, a[class*="button" i], a[class*="btn" i]')],
      ['mailtel', any('a[href^="mailto:" i]') && any('a[href^="tel:" i]')],
      ['list', any('main ul, main ol, section ul, section ol, article ul, article ol, footer ul') || count('ul, ol') > count('nav ul, nav ol')],
      ['table', any('table')],
      ['banner', any('[class*="banner" i], [class*="hero" i], [class*="jumbotron" i]') || /\.(banner|hero)[\w-]*\s*\{/i.test(cssText)],
      ['carousel', any('[class*="carousel" i], [class*="slide" i], [class*="swiper" i]')],
      ['accordion', any('[class*="accordion" i], details')],
      ['alert', any('.alert, [class*="alert" i], [role="alert"]')],
      ['creative', creative > 0, String(creative)]
    ];
    features.forEach(function (f) {
      var label = T.features[f[0]];
      R.add(G.features, f[1] ? 'ok' : 'unknown', label + (f[1] && f[2] ? ' (' + f[2] + ')' : ''), f[1] ? '' : T.featureHint);
    });
    return R;
  }

  var ICON = { ok: '✔', warn: '⚠', err: '✖', unknown: '?' };
  function renderReport(R, name) {
    var out = $('#zip-result');
    var counts = { ok: 0, warn: 0, err: 0 };
    R.items.forEach(function (i) { if (counts[i.l] != null && i.g !== T.groups.features) counts[i.l]++; });
    var html = '<div class="d-flex flex-wrap gap-2 align-items-center mb-3">' +
      '<strong class="me-2">' + esc(name) + '</strong>' +
      '<span class="badge text-bg-success">' + ICON.ok + ' ' + counts.ok + '</span>' +
      '<span class="badge text-bg-warning">' + ICON.warn + ' ' + counts.warn + ' ' + esc(T.warnings) + '</span>' +
      '<span class="badge text-bg-danger">' + ICON.err + ' ' + counts.err + ' ' + esc(T.errors) + '</span></div>';
    [T.groups.files, T.groups.pages, T.groups.features].forEach(function (g) {
      var items = R.items.filter(function (i) { return i.g === g; });
      if (!items.length) return;
      html += '<h3 class="h6 mt-3">' + esc(g) + '</h3><ul class="zip-list">';
      items.forEach(function (i) {
        html += '<li class="zl-' + i.l + '"><span class="zl-icon">' + ICON[i.l] + '</span><div>' + esc(i.t) +
          (i.d ? '<div class="zl-detail">' + esc(i.d) + '</div>' : '') + '</div></li>';
      });
      html += '</ul>';
      if (g === T.groups.features) html += '<p class="tiny-label mb-0">' + esc(T.featureNote) + '</p>';
    });
    out.innerHTML = html;
  }

  async function runCheck(blob, name) {
    var out = $('#zip-result');
    out.innerHTML = '<p class="small text-secondary mb-0">' + esc(T.checking) + '</p>';
    try {
      var R = await checkZip(blob, name);
      renderReport(R, name);
    } catch (e) {
      out.innerHTML = '<div class="alert alert-danger small mb-0">' + esc(fill(T.zipError, { msg: e.message || e })) + '</div>';
    }
  }

  var input = $('#zip-input');
  var drop = $('#zip-drop');
  if (input && drop) {
    input.addEventListener('change', function () {
      if (input.files[0]) runCheck(input.files[0], input.files[0].name);
    });
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); });
    });
    drop.addEventListener('drop', function (e) {
      var f = e.dataTransfer.files[0];
      if (f) runCheck(f, f.name);
    });
  }

  // ukážkový projekt s pár zámernými chybami
  var demo = $('#zip-demo');
  if (demo) demo.addEventListener('click', async function () {
    if (!window.JSZip) { $('#zip-result').textContent = T.noJszip; return; }
    var D = T.demo;
    var z = new window.JSZip();
    var dir = z.folder(D.root);
    function page(file, title, body, metaAll) {
      var nav = D.pages.map(function (p) { return '<a href="' + p[0] + '">' + p[1] + '</a>'; }).join('\n      ');
      return '<!DOCTYPE html>\n<html lang="' + D.lang + '">\n<head>\n  <meta charset="utf-8">\n' +
        '  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
        '  <meta name="description" content="' + title + '">\n' +
        (metaAll ? '  <meta name="keywords" content="demo">\n' : '') +
        '  <meta name="author" content="Novák">\n  <title>' + title + '</title>\n' +
        '  <link rel="stylesheet" href="css/style.css">\n</head>\n<body>\n' +
        '  <!-- ' + D.navComment + ' -->\n  <header class="sticky-top">\n    <img src="img/logo.png" alt="logo">\n' +
        '    <button class="nav-toggle" aria-controls="menu" aria-expanded="false">☰</button>\n    <nav id="menu">\n      ' + nav +
        '\n    </nav>\n  </header>\n' + body +
        '\n  <footer><p>&copy; 2026 Novák</p></footer>\n  <script src="js/app.js"></script>\n</body>\n</html>\n';
    }
    dir.file(D.pages[0][0], page(D.pages[0][0], D.pages[0][1],
      '  <section class="hero"><h1>' + D.pages[0][1] + '</h1><a class="btn" href="' + D.pages[3][0] + '">' + D.pages[3][1] + '</a></section>\n' +
      '  <!-- ' + D.creative + ' -->\n  <div class="carousel"><img src="img/hory.jpg" alt=""></div>', true));
    dir.file(D.pages[1][0], page(D.pages[1][0], D.pages[1][1],
      '  <main><h2>' + D.pages[1][1] + '</h2><ul><li>HTML</li><li>CSS</li></ul></main>', false));
    dir.file(D.pages[2][0], page(D.pages[2][0], D.pages[2][1],
      '  <main><h2>' + D.pages[2][1] + '</h2><img src="img/More.jpg" alt=""><p style="color:red">!</p></main>', true));
    dir.file(D.pages[3][0], page(D.pages[3][0], D.pages[3][1],
      '  <main><h3>' + D.pages[3][1] + '</h3>\n  <form action="' + D.thanks + '"><input type="text" required><input type="email" required>' +
      '<textarea></textarea><input type="checkbox" required><button>OK</button></form>\n' +
      '  <a href="mailto:novak@example.com">e-mail</a> <a href="tel:+421900000000">tel</a></main>', true));
    dir.file('css/style.css', '/* ' + D.cssComment + ' */\nbody { font-family: Georgia, serif; }\n.hero { background: url("../img/hory.jpg"); }\n');
    dir.file('js/app.js', '// ' + D.jsComment + '\ndocument.querySelector(".nav-toggle").addEventListener("click", function () {\n  document.getElementById("menu").classList.toggle("open");\n});\n');
    dir.file('img/hory.jpg', 'demo');
    dir.file('img/more.jpg', 'demo');
    dir.file('img/logo.png', 'demo');
    var blob = await z.generateAsync({ type: 'blob' });
    runCheck(blob, D.zipName);
  });
})();
