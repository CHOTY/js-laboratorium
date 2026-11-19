# Jazyky webu · laboratórium

Interaktívne lekcie ku cvičeniam z predmetu Jazyky webu – od nastavenia editora cez HTML, CSS a Bootstrap po JavaScript a XML. Každý príklad sa dá priamo na stránke spustiť, upraviť a hneď vidieť výsledok.

**🔗 Stránka: <https://choty.github.io/js-laboratorium/>** · English: [`/en/`](https://choty.github.io/js-laboratorium/en/) · Español: [`/es/`](https://choty.github.io/js-laboratorium/es/)

## Lekcie

| # | Stránka | Čo obsahuje |
|---|---|---|
| 0 | [`0-setup.html`](https://choty.github.io/js-laboratorium/0-setup.html) | prečo lokálny server, priečinok projektu, VS Code + Live Server, Zed + LiveServer, server z terminálu, riešenie problémov |
| 1 | [`1-html.html`](https://choty.github.io/js-laboratorium/1-html.html) | značky a atribúty, hlavička a meta značky, texty, odkazy, obrázky, zoznamy, tabuľky, formuláre, sémantické značky; úlohy s automatickou kontrolou |
| 2 | [`2-css-text.html`](https://choty.github.io/js-laboratorium/2-css-text.html) | inline / interné / externé CSS, pravidlo CSS, farby, fonty, `px` / `em` / `rem`, pozadie; úlohy s kontrolou výsledných štýlov |
| 3 | [`3-css-box.html`](https://choty.github.io/js-laboratorium/3-css-box.html) | `id` a `class` (tester selektorov), box model, `margin` / `padding` skratky, `width` / `height`, `box-sizing`, block / inline / inline-block |
| 4 | [`4-layout.html`](https://choty.github.io/js-laboratorium/4-layout.html) | `position`, responzívny dizajn, flexbox (rodič aj potomkovia), media queries |
| 5 | [`5-bootstrap.html`](https://choty.github.io/js-laboratorium/5-bootstrap.html) | `rem`, `vw`, `clamp()`, inštalácia Bootstrapu krok za krokom (CDN, stiahnutie, npm), breakpointy, kontajnery, mriežka, medzery, komponenty |
| JS 1 | [`js1.html`](https://choty.github.io/js-laboratorium/js1.html) | umiestnenie skriptu, `alert` / `prompt` / `confirm`, konzola, premenné, operátory, podmienky, cykly, funkcie, `window`, `document`, registračný formulár |
| JS 2 | [`js2.html`](https://choty.github.io/js-laboratorium/js2.html) | strom DOM, selektovanie, `createElement`, `innerText` / `innerHTML`, atribúty, `classList`, `style`, `addEventListener`, inputy, `try` / `catch`, kalkulačka |
| JS 3 | [`js3.html`](https://choty.github.io/js-laboratorium/js3.html) | typy funkcií, anonymné a arrow funkcie, udalosti, `onclick` vs. `addEventListener`, navigácia, akordeón, úlohy |
| XML | [`xml.html`](https://choty.github.io/js-laboratorium/xml.html) | syntax a kontrola well-formed, CDATA, entity, menné priestory, DOM, XML + CSS, DTD s validátorom, XPath tester, XSLT |

Každá lekcia má na konci **kvíz** s vysvetleniami a **úlohy** na hodinu.

## Jazykové verzie

Slovenská verzia je v koreni, anglická v [`en/`](en) a španielska v [`es/`](es) – rovnaké názvy súborov, prepínač jazyka je v hornej lište. V lekciách JS 1 – JS 3 ostávajú názvy premenných a súborov v kóde po slovensky, aby zodpovedali štartovacím projektom.

## Na stiahnutie

- [`projekt-ziaci.zip`](projekt-ziaci.zip) – štartovací projekt k JS 1 a JS 2 (`index.html`, akordeón `qna.html`, `kalkulacka.html`, `formular.html`)
- [`ulohy-js3`](ulohy-js3) / [`ulohy-js3.zip`](ulohy-js3.zip) – úlohy k JS 3: hotové HTML a CSS, JavaScript píšu študenti sami

## Technické informácie

- čisté HTML, CSS a JavaScript, žiadna inštalácia ani build
- spoločné súbory: [`assets/nav.js`](assets/nav.js) (lišta s lekciami a jazykmi), [`assets/lab.css`](assets/lab.css) a [`assets/lab.js`](assets/lab.js) (živé editory, ihriská, kvízy)
- [Bootstrap 5.3](https://getbootstrap.com/docs/5.3/) sa načítava z CDN, stránky preto potrebujú internet
- XSLT v lekcii XML: ak prehliadač nemá zabudovaný XSLT procesor (Chrome 158+), načíta sa [xslt-polyfill](https://github.com/mfreed7/xslt_polyfill)
- hosting: GitHub Pages z vetvy `main`
