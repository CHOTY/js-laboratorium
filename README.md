# JavaScript laboratórium

Interaktívne ukážky ku hodinám JavaScriptu pre stredoškolákov. Každý príklad sa dá priamo na stránke spustiť, upraviť a hneď vidieť výsledok – tak, ako by ho vypísala konzola prehliadača.

**🔗 Stránka: <https://choty.github.io/js-laboratorium/>**

## Obsah

| Stránka | Čo obsahuje |
|---|---|
| [`index.html`](https://choty.github.io/js-laboratorium/) | rozcestník a štartovací projekt na stiahnutie |
| [`js1.html`](https://choty.github.io/js-laboratorium/js1.html) – **JS 1 · Základy** | umiestnenie skriptu, `alert` / `prompt` / `confirm`, konzola, premenné a dátové typy, `var` / `let` / `const`, operátory, porovnávanie a logické operátory, `if` / `else`, cykly (krokovanie cyklu `for`), funkcie, objekty `window`, `location`, `history`, `screen`, `event` a `document`, cvičenie s registračným formulárom |
| [`js2.html`](https://choty.github.io/js-laboratorium/js2.html) – **JS 2 · Manipulácia s DOM** | strom DOM, selektovanie prvkov, `createElement` a `append`, `innerText` / `textContent` / `innerHTML`, `remove`, atribúty, `classList`, `style`, udalosti (`addEventListener`), práca s inputmi, úloha kalkulačka |
| [`js3.html`](https://choty.github.io/js-laboratorium/js3.html) – **JS 3 · Funkcie a udalosti** | funkcie bez parametra, s jedným a s viacerými parametrami, anonymné funkcie, arrow funkcie (prevod krok po kroku), tabuľka udalostí naživo, `onclick` vs. event handler vs. `addEventListener`, navigácia s hamburgerom, akordeón, úlohy na hodinu |

Na každej stránke je navyše **playground** na písanie vlastného kódu, **kvíz** s vysvetleniami a **úlohy** na precvičenie.

## Štartovací projekt

[`projekt-ziaci.zip`](projekt-ziaci.zip) – priečinok pre VS Code a rozšírenie Live Server:

| Súbor | Úloha |
|---|---|
| `index.html` + `js/app.js` | ukážky a mini úlohy |
| `qna.html` + `js/qna.js` | akordeón – po kliknutí na otázku sa zobrazí odpoveď (JS 2) |
| `kalkulacka.html` + `js/kalkulacka.js` | kalkulačka – doprogramovať `display`, `clearAll`, `solve` (JS 2) |
| `formular.html` + `js/formular.js` → `dakujem.html` | kontrola registračného formulára (JS 1) |

## Úlohy k JS 3

Priečinok [`ulohy-js3`](ulohy-js3) (aj ako [`ulohy-js3.zip`](ulohy-js3.zip)) – hotové HTML a CSS, JavaScript píšu študenti sami:

| Priečinok | Úloha |
|---|---|
| `1-funkcie` | Zadanie 1 – tri typy funkcií |
| `2-navigacia` | Úloha 2 – prerobiť navigáciu z `onclick` na `addEventListener` |
| `3-akordeon` | Úloha 3 – akordeón |
| `4-kalkulacka` | Úloha 4 – kalkulačka bez jediného `onclick` (bez JS) |
| `5-hodnotenie` | Úloha 5 – hodnotenie hviezdičkami (bez JS) |

## Technické informácie

- čisté HTML, CSS a JavaScript, žiadna inštalácia ani build
- [Bootstrap 5.3](https://getbootstrap.com/docs/5.3/) sa načítava z CDN, preto stránky potrebujú internet
- každá stránka je jeden samostatný súbor – dá sa otvoriť aj lokálne dvojklikom
- hosting: GitHub Pages z vetvy `main`
