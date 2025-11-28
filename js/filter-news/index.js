document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const newsCards = document.querySelectorAll('.news-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.textContent.trim();
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            this.classList.add('active');
            
            newsCards.forEach(card => {
                const category = card.querySelector('.news-category').textContent.trim();
                
                if (filter === 'Все новости' || category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
});