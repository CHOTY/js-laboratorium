// Pôvodný kód – funkcia sa volá z atribútu onclick v HTML.
// ÚLOHA: prerob ho tak, aby používal addEventListener
//        a z HTML zmaž atribút onclick.

function myNav() {
  const menu = document.querySelector(".main-menu");
  if (menu.className === "main-menu") {
    menu.className += " responsive";
  } else {
    menu.className = "main-menu";
  }
}
