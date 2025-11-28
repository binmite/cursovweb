document.addEventListener('DOMContentLoaded', function() {
    const newsItems = document.querySelectorAll('.news-item');
    const newsFeatured = document.querySelectorAll('.news-featured');
    
    const savedTab = localStorage.getItem('selectedNewsTab');
    const initialTab = savedTab || 'tab1';
    
    function switchTab(tabId) {
        const currentActive = document.querySelector('.news-featured.active');
        if (currentActive) {
            currentActive.classList.add('fade-out');
        }
        
        setTimeout(() => {
            newsItems.forEach(item => item.classList.remove('active'));
            newsFeatured.forEach(content => {
                content.classList.remove('active');
                content.classList.remove('fade-out');
            });
            
            const selectedItem = document.querySelector(`[data-tab="${tabId}"]`);
            const selectedContent = document.getElementById(tabId);
            
            if (selectedItem && selectedContent) {
                selectedItem.classList.add('active');
                selectedContent.classList.add('active');
                
                localStorage.setItem('selectedNewsTab', tabId);
                
                if (window.innerWidth <= 768) {
                    selectedContent.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            }
        }, 150);
    }
    
    newsItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if (!this.classList.contains('active')) {
                switchTab(tabId);
            }
        });
        
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
    
    switchTab(initialTab);
});