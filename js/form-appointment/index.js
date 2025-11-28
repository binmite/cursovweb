document.addEventListener('DOMContentLoaded', function() {
    const appointmentForm = document.querySelector('.appointment-form-content');
    const directionSelect = document.querySelector('select[required]');
    const serviceSelect = document.querySelectorAll('select')[1];
    
    if (directionSelect && serviceSelect) {
        directionSelect.addEventListener('change', function() {
            const direction = this.value;
            serviceSelect.innerHTML = '<option value="">Выберите услугу</option>';
            
            if (direction === 'cosmetology') {
                serviceSelect.innerHTML += `
                    <option value="consultation">Консультация косметолога</option>
                    <option value="injection">Инъекционные процедуры</option>
                    <option value="apparatus">Аппаратная косметология</option>
                    <option value="care">Эстетический уход</option>
                `;
            } else if (direction === 'surgery') {
                serviceSelect.innerHTML += `
                    <option value="consultation">Консультация хирурга</option>
                    <option value="face">Пластика лица</option>
                    <option value="body">Коррекция фигуры</option>
                    <option value="reconstruction">Реконструктивная хирургия</option>
                `;
            }
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
                submitBtn.textContent = 'Отправка...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    alert('Запись успешно отправлена! Мы свяжемся с вами в ближайшее время.');
                    this.reset();
                    submitBtn.textContent = 'Записаться на прием';
                    submitBtn.disabled = false;
                }, 2000);
            }
        });
    }
});