document.addEventListener('DOMContentLoaded', function() {
    const burger = document.querySelector('.nav__burger');
    const menu = document.querySelector('.nav__menu');
    
    burger.addEventListener('click', function() {
        menu.classList.toggle('nav__menu--active');
        burger.classList.toggle('nav__menu--active');
    });
});