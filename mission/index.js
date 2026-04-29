
let selectElem = document.querySelector('select');
let logo = document.querySelector('img');

selectElem.addEventListener('change', changeTheme);

function changeTheme() {
    let current = selectElem.value;
    let hr = document.querySelector('hr');
    let content = document.querySelector('#content');
    let h2 = document.querySelector('h2');
    if (current == 'dark') {
        // code for changes to colors and logo
        document.body.style.backgroundColor = '#333333';
        document.body.style.color = 'white';
        logo.src = "https://wddbyui.github.io/wdd131/images/byui-logo-white.png";
        hr.style.color = 'white';
        content.style.borderColor = 'white';
        h2.style.color = '#A0D4ED';
    } else {
        // code for changes to colors and logo
        document.body.style.backgroundColor = 'white';
        document.body.style.color = 'black';
        logo.src = "https://wddbyui.github.io/wdd131/images/byui-logo-blue.webp";
        hr.style.color = 'black';
        content.style.borderColor = 'black';
        h2.style.color = '#4F9ACF';
    }
}           
