document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const categoryContents = document.querySelectorAll('.category-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            categoryContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            
            const targetContent = document.getElementById(category);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
});