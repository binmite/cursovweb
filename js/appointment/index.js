class AppointmentManager {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.currentUser = null;
        this.categories = [];
        this.services = [];
        this.doctors = [
            { id: 'dr_smirnova', name: 'Смирнова О.Л.', specialty: 'Косметолог', category: 'cosmetology' },
            { id: 'dr_ivanova', name: 'Иванова А.П.', specialty: 'Косметолог', category: 'cosmetology' },
            { id: 'dr_petrov', name: 'Петров С.М.', specialty: 'Пластический хирург', category: 'surgery' },
            { id: 'dr_sidorov', name: 'Сидоров В.И.', specialty: 'Пластический хирург', category: 'surgery' },
            { id: 'dr_kuznetsova', name: 'Кузнецова Е.В.', specialty: 'Стоматолог', category: 'dentistry' },
            { id: 'dr_volkov', name: 'Волков А.С.', specialty: 'Стоматолог', category: 'dentistry' },
            { id: 'dr_orlova', name: 'Орлова М.К.', specialty: 'Лазерный терапевт', category: 'laser' },
            { id: 'dr_zhukov', name: 'Жуков Д.Н.', specialty: 'Лазерный терапевт', category: 'laser' }
        ];
        
        this.init();
    }

    async init() {
        await this.loadCurrentUser();
        if (!this.currentUser) {
            return; 
        }
        await this.loadCategories();
        this.bindEvents();
        this.setMinDate();
        this.updateUI();
    }

    async loadCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                console.log('Пользователь найден в localStorage:', this.currentUser);
            } else {
                console.log('Пользователь не авторизован, перенаправление...');
                this.redirectToAuth();
                return null;
            }
        } catch (error) {
            console.error('Ошибка загрузки пользователя из localStorage:', error);
            this.redirectToAuth();
            return null;
        }
    }

    redirectToAuth() {
        const currentPath = window.location.pathname;
        const returnUrl = encodeURIComponent(currentPath);
        window.location.href = `../auth.html?returnUrl=${returnUrl}`;
    }

    async loadCategories() {
        try {
            const response = await fetch(`${this.baseUrl}/services`);
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных с сервера');
            }
            const data = await response.json();
            this.categories = data.categories;
            this.populateCategories();
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
            this.showError(i18nManager.t('appointment.error.message'));
            
            this.showLoadingError();
        }
    }

    showLoadingError() {
        const form = document.getElementById('appointmentForm');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'loading-error';
        errorDiv.style.cssText = `
            background: #ffebee;
            color: #c62828;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            border: 1px solid #ffcdd2;
        `;
        errorDiv.innerHTML = `
            <p><strong>${i18nManager.t('appointment.error.title')}</strong></p>
            <p>${i18nManager.t('appointment.error.message')}</p>
            <button id="retryLoading" class="retry-btn" style="
                background: #1976d2;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
            ">${i18nManager.t('appointment.retry_button') || 'Повторить попытку'}</button>
        `;
        
        form.parentNode.insertBefore(errorDiv, form);
        
        document.getElementById('retryLoading').addEventListener('click', () => {
            errorDiv.remove();
            this.loadCategories();
        });
    }

    populateCategories() {
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = '<option value="" data-i18n="appointment.category_placeholder">Выберите категорию</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            
            const translationKey = `appointment.categories.${category.id}`;
            const translatedName = i18nManager.t(translationKey);
            option.textContent = translatedName !== translationKey ? translatedName : category.name;
            
            categorySelect.appendChild(option);
        });
        
        i18nManager.applyTranslations();
    }

    populateServices(categoryId) {
        const serviceSelect = document.getElementById('service');
        const category = this.categories.find(cat => cat.id === categoryId);
        
        serviceSelect.innerHTML = '<option value="" data-i18n="appointment.service_placeholder">Сначала выберите категорию</option>';
        serviceSelect.disabled = true;
        
        if (category) {
            serviceSelect.innerHTML = '<option value="" data-i18n="appointment.service_placeholder">Выберите услугу</option>';
            category.services.forEach(service => {
                const option = document.createElement('option');
                option.value = service.id;
                option.textContent = service.name;
                option.dataset.service = JSON.stringify(service);
                serviceSelect.appendChild(option);
            });
            serviceSelect.disabled = false;
        }
        
        this.hideServiceInfo();
        document.getElementById('doctor').disabled = true;
        this.updateSubmitButton();
        
        i18nManager.applyTranslations();
    }

    populateDoctors(serviceId) {
        const doctorSelect = document.getElementById('doctor');
        const service = this.findServiceById(serviceId);
        
        doctorSelect.innerHTML = '<option value="" data-i18n="appointment.doctor_placeholder">Сначала выберите услугу</option>';
        doctorSelect.disabled = true;
        
        if (service) {
            const category = this.categories.find(cat => 
                cat.services.some(s => s.id === serviceId)
            );
            
            if (category) {
                const availableDoctors = this.doctors.filter(doctor => 
                    doctor.category === category.id
                );
                
                doctorSelect.innerHTML = '<option value="" data-i18n="appointment.doctor_placeholder">Выберите специалиста</option>';
                availableDoctors.forEach(doctor => {
                    const option = document.createElement('option');
                    option.value = doctor.id;
                    option.textContent = `${doctor.name} - ${doctor.specialty}`;
                    doctorSelect.appendChild(option);
                });
                doctorSelect.disabled = false;
            }
        }
        
        i18nManager.applyTranslations();
    }

    findServiceById(serviceId) {
        for (const category of this.categories) {
            const service = category.services.find(s => s.id === serviceId);
            if (service) return service;
        }
        return null;
    }

    showServiceInfo(service) {
        const serviceInfo = document.querySelector('.selected-service-info');
        const serviceName = document.getElementById('serviceName');
        const serviceDescription = document.getElementById('serviceDescription');
        const servicePrice = document.getElementById('servicePrice');
        const serviceDuration = document.getElementById('serviceDuration');
        const serviceProcedures = document.getElementById('serviceProcedures');

        serviceName.textContent = service.name;
        serviceDescription.textContent = service.description;
        servicePrice.textContent = `${service.priceUnit || 'от'} ${service.price} ${i18nManager.t('appointment.price_currency')}`;
        serviceDuration.textContent = service.duration;
        serviceProcedures.textContent = service.procedures.join(', ');

        serviceInfo.style.display = 'block';
    }

    hideServiceInfo() {
        const serviceInfo = document.querySelector('.selected-service-info');
        serviceInfo.style.display = 'none';
    }

    setMinDate() {
        const dateInput = document.getElementById('date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        
        dateInput.value = today;
    }

    updateSubmitButton() {
        const submitBtn = document.querySelector('.submit-btn');
        const form = document.getElementById('appointmentForm');
        
        const category = document.getElementById('category').value;
        const service = document.getElementById('service').value;
        const doctor = document.getElementById('doctor').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        
        const isValid = category && service && doctor && date && time;
        submitBtn.disabled = !isValid;
    }

    bindEvents() {
        document.getElementById('category').addEventListener('change', (e) => {
            this.populateServices(e.target.value);
        });

        document.getElementById('service').addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            if (selectedOption.value && selectedOption.dataset.service) {
                const service = JSON.parse(selectedOption.dataset.service);
                this.showServiceInfo(service);
                this.populateDoctors(e.target.value);
            } else {
                this.hideServiceInfo();
                document.getElementById('doctor').disabled = true;
            }
            this.updateSubmitButton();
        });

        document.getElementById('doctor').addEventListener('change', () => {
            this.updateSubmitButton();
        });

        document.getElementById('date').addEventListener('change', () => {
            this.updateSubmitButton();
        });

        document.getElementById('time').addEventListener('change', () => {
            this.updateSubmitButton();
        });

        document.getElementById('appointmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitAppointment();
        });

        document.getElementById('backBtn').addEventListener('click', () => {
            window.history.back();
        });

        document.getElementById('appointmentForm').addEventListener('input', () => {
            this.updateSubmitButton();
        });

        document.getElementById('notes').addEventListener('input', () => {
        });
    }

    async submitAppointment() {
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = i18nManager.t('appointment.loading.creating');
            
            const formData = new FormData(document.getElementById('appointmentForm'));
            const selectedService = this.findServiceById(formData.get('service'));
            const selectedDoctor = this.doctors.find(d => d.id === formData.get('doctor'));
            const selectedCategory = this.categories.find(cat => 
                cat.services.some(s => s.id === formData.get('service'))
            );

            if (!selectedService || !selectedDoctor || !selectedCategory) {
                throw new Error('Не удалось найти выбранные услуги или специалиста');
            }

            const appointment = {
                id: this.generateAppointmentId(),
                userId: this.currentUser.id,
                category: selectedCategory.name,
                categoryId: selectedCategory.id,
                service: selectedService.name,
                serviceId: selectedService.id,
                doctor: `${selectedDoctor.name} - ${selectedDoctor.specialty}`,
                doctorId: selectedDoctor.id,
                date: formData.get('date'),
                time: formData.get('time'),
                notes: formData.get('notes') || '',
                price: selectedService.price,
                status: 'pending',
                adminNotes: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const response = await fetch(`${this.baseUrl}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointment)
            });

            if (response.ok) {
                this.showSuccess(appointment.id);
                document.getElementById('appointmentForm').reset();
                this.hideServiceInfo();
                this.setMinDate();
                this.updateSubmitButton();
            } else {
                throw new Error('Ошибка HTTP: ' + response.status);
            }

        } catch (error) {
            console.error('Ошибка создания записи:', error);
            this.showError(i18nManager.t('appointment.error.message'));
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    generateAppointmentId() {
        return Math.random().toString(36).substr(2, 9);
    }

    showSuccess(appointmentId) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 400px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            ">
                <div style="color: #4caf50; font-size: 48px; margin-bottom: 15px;">✓</div>
                <h3 style="color: #2e7d32; margin-bottom: 15px;">${i18nManager.t('appointment.success.title')}</h3>
                <p style="margin-bottom: 10px; color: #555;">${i18nManager.t('appointment.success.message')}</p>
                <p style="margin-bottom: 20px; font-weight: bold; color: #333;">
                    ${i18nManager.t('appointment.success.number')} <span style="color: #1976d2;">${appointmentId}</span>
                </p>
                <button id="successOk" style="
                    background: #4caf50;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                ">OK</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('successOk').addEventListener('click', () => {
            modal.remove();
        });
    }

    showError(message) {
        alert(`${i18nManager.t('appointment.error.title')}\n${message}`);
    }

    updateUI() {
        if (this.currentUser) {
            const userNameElement = document.getElementById('userName');
            const displayName = this.currentUser.firstName || this.currentUser.username || 'Пользователь';
            userNameElement.textContent = displayName;
            
            console.log('Интерфейс обновлен для пользователя:', displayName);
        }
    }
}

if (translations.ru) {
    translations.ru['appointment.retry_button'] = 'Повторить попытку';
}
if (translations.en) {
    translations.en['appointment.retry_button'] = 'Retry';
}

document.addEventListener('DOMContentLoaded', async function() {
    if (!window.i18nManager) {
        window.i18nManager = new I18nManager();
    }
    
    setTimeout(() => {
        window.appointmentManager = new AppointmentManager();
    }, 100);
});