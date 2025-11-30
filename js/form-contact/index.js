document.addEventListener('DOMContentLoaded', function() {
    const i18n = window.i18nManager;
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
            alert(i18n.t('form.validation.required_name'));
            return false;
        }
        
        if (!data.phone.trim()) {
            alert(i18n.t('form.validation.required_phone'));
            return false;
        }
        
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
        if (!phoneRegex.test(data.phone)) {
            alert(i18n.t('form.validation.invalid_phone'));
            return false;
        }
        
        if (data.email && !isValidEmail(data.email)) {
            alert(i18n.t('form.validation.invalid_email'));
            return false;
        }
        
        return true;
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function sendFormData(data) {
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = i18n.t('form.sending');
        submitBtn.disabled = true;
        
        setTimeout(() => {
            console.log('Данные формы:', data);
            alert(i18n.t('form.success.message'));
            
            contactForm.reset();
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
});