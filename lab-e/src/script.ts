// Stan aplikacji
const styles: Record<string, string> = {
    "style-1": "/style-1.css",
    "style-2": "/style-2.css",
    "style-3": "/style-3.css"
};

let currentStyle: string = "style-1";

// Funkcja do dodawania linku CSS do head
function addStyleLink(href: string): HTMLLinkElement {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    return link;
}

// Funkcja do usuwania linku CSS z head
function removeStyleLink(link: HTMLLinkElement): void {
    document.head.removeChild(link);
}

// Inicjalizacja: dodaj pierwszy styl
let currentLink: HTMLLinkElement = addStyleLink(styles[currentStyle]);

// Funkcja do zmiany stylu
function changeStyle(newStyle: string): void {
    if (newStyle === currentStyle || !styles[newStyle]) return;

    // Usuń stary link
    removeStyleLink(currentLink);

    // Dodaj nowy link
    currentStyle = newStyle;
    currentLink = addStyleLink(styles[currentStyle]);
}

// Utwórz fragment z przyciskami zmiany stylu
const styleSwitcher = document.createElement('div');
styleSwitcher.id = 'style-switcher';
styleSwitcher.innerHTML = `
    <p>Wybierz styl:</p>
    <button data-style="style-1">Styl 1</button>
    <button data-style="style-2">Styl 2</button>
    <button data-style="style-3">Styl 3</button>
`;

// Dodaj event listeners do przycisków
styleSwitcher.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const style = target.getAttribute('data-style');
        if (style) {
            changeStyle(style);
        }
    });
});

// Dodaj style-switcher do strony, np. po nav
const nav = document.querySelector('nav');
if (nav) {
    nav.insertAdjacentElement('afterend', styleSwitcher);
}
