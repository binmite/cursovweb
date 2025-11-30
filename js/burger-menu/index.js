document.addEventListener('DOMContentLoaded', function() {
    const burger = document.querySelector('.nav__burger');
    const menu = document.querySelector('.nav__menu');
    
    function closeMenu() {
        menu.classList.remove('nav__menu--active');
        burger.classList.remove('nav__burger--active');
        document.body.style.overflow = '';
    }
    
    burger.addEventListener('click', function() {
        const isActive = menu.classList.contains('nav__menu--active');
        
        if (!isActive) {
            menu.classList.add('nav__menu--active');
            burger.classList.add('nav__burger--active');
            document.body.style.overflow = 'hidden';
        } else {
            closeMenu();
        }
    });
    
    menu.addEventListener('click', function(e) {
        if (e.target === menu) {
            closeMenu();
        }
    });
    
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menu.classList.contains('nav__menu--active')) {
            closeMenu();
        }
    });
});