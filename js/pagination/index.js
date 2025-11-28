document.addEventListener('DOMContentLoaded', function() {
    const pageButtons = document.querySelectorAll('.page-btn');
    
    pageButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('active')) return;
            
            pageButtons.forEach(btn => btn.classList.remove('active'));
            
            this.classList.add('active');
            
            const newsGrid = document.querySelector('.news-grid');
            if (newsGrid) {
                newsGrid.style.opacity = '0.5';
                setTimeout(() => {
                    newsGrid.style.opacity = '1';
                }, 500);
            }
        });
    });
});