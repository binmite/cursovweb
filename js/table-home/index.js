document.addEventListener('DOMContentLoaded', function() {
    const newsItems = document.querySelectorAll('.news-item');
    const newsFeatured = document.querySelectorAll('.news-featured');
    
    // Проверяем сохраненный выбор в localStorage
    const savedTab = localStorage.getItem('selectedNewsTab');
    const initialTab = savedTab || 'tab1';
    
    function switchTab(tabId) {
        // Добавляем анимацию исчезновения для активного контента
        const currentActive = document.querySelector('.news-featured.active');
        if (currentActive) {
            currentActive.classList.add('fade-out');
        }
        
        setTimeout(() => {
            // Убираем активный класс у всех элементов
            newsItems.forEach(item => item.classList.remove('active'));
            newsFeatured.forEach(content => {
                content.classList.remove('active');
                content.classList.remove('fade-out');
            });
            
            // Добавляем активный класс выбранному элементу
            const selectedItem = document.querySelector(`[data-tab="${tabId}"]`);
            const selectedContent = document.getElementById(tabId);
            
            if (selectedItem && selectedContent) {
                selectedItem.classList.add('active');
                selectedContent.classList.add('active');
                
                // Сохраняем выбор в localStorage
                localStorage.setItem('selectedNewsTab', tabId);
                
                // Прокрутка к верху контента на мобильных
                if (window.innerWidth <= 768) {
                    selectedContent.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            }
        }, 150);
    }
    
    // Добавляем обработчики событий
    newsItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if (!this.classList.contains('active')) {
                switchTab(tabId);
            }
        });
        
        // Поддержка клавиатуры
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const tabId = this.getAttribute('data-tab');
                if (!this.classList.contains('active')) {
                    switchTab(tabId);
                }
            }
        });
    });
    
    // Активируем сохраненный или первый таб
    switchTab(initialTab);
});