document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = 'red';
                    isValid = false;
                } else {
                    field.style.borderColor = '#e0e0e0';
                }
            });
            
            if (isValid) {
                const submitBtn = this.querySelector('.submit-btn');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Отправка...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    alert('Сообщение успешно отправлено! Мы ответим вам в ближайшее время.');
                    this.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 2000);
            }
        });
    }
});