document.addEventListener('DOMContentLoaded', function() {
    const i18n = window.i18nManager;
    const appointmentForm = document.querySelector('.appointment-form-content');
    const directionSelect = document.querySelector('select[required]');
    const serviceSelect = document.querySelectorAll('select')[1];
    
    function updateServiceOptions() {
        if (directionSelect && serviceSelect && directionSelect.value) {
            const direction = directionSelect.value;
            serviceSelect.innerHTML = `<option value="">${i18n.t('appointment.service_placeholder')}</option>`;
            
            if (direction === 'cosmetology') {
                serviceSelect.innerHTML += `
                    <option value="consultation">${i18n.t('appointment.services.cosmetology.consultation')}</option>
                    <option value="injection">${i18n.t('appointment.services.cosmetology.injection')}</option>
                    <option value="apparatus">${i18n.t('appointment.services.cosmetology.apparatus')}</option>
                    <option value="care">${i18n.t('appointment.services.cosmetology.care')}</option>
                `;
            } else if (direction === 'surgery') {
                serviceSelect.innerHTML += `
                    <option value="consultation">${i18n.t('appointment.services.surgery.consultation')}</option>
                    <option value="face">${i18n.t('appointment.services.surgery.face')}</option>
                    <option value="body">${i18n.t('appointment.services.surgery.body')}</option>
                    <option value="reconstruction">${i18n.t('appointment.services.surgery.reconstruction')}</option>
                `;
            }
        }
    }
    
    if (directionSelect && serviceSelect) {
        directionSelect.addEventListener('change', function() {
            updateServiceOptions();
        });
        
        document.addEventListener('languageChanged', function() {
            updateServiceOptions();
        });
    }
    
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
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
                submitBtn.textContent = i18n.t('form.sending');
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    alert(i18n.t('appointment.success.message'));
                    this.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 2000);
            }
        });
    }
});