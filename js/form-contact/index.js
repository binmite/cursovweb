document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: this.querySelector('input[type="text"]').value,
                phone: this.querySelector('input[type="tel"]').value,
                email: this.querySelector('input[type="email"]').value,
                message: this.querySelector('textarea').value
            };
            
            if (validateForm(formData)) {
                sendFormData(formData);
            }
        });
    }
    
    function validateForm(data) {
        if (!data.name.trim()) {
            alert('Пожалуйста, введите ваше имя');
            return false;
        }
        
        if (!data.phone.trim()) {
            alert('Пожалуйста, введите ваш телефон');
            return false;
        }
        
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
        if (!phoneRegex.test(data.phone)) {
            alert('Пожалуйста, введите корректный номер телефона');
            return false;
        }
        
        return true;
    }
    
    function sendFormData(data) {
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            console.log('Данные формы:', data);
            alert('Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.');
            
            contactForm.reset();
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
});