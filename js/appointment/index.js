class AppointmentForm {
    constructor() {
        this.categories = [];
        this.selectedService = null;
        this.init();
    }

    async init() {
        console.log('AppointmentForm init started');
        
        if (!authManager.isAuthenticated()) {
            console.log('User not authenticated, redirecting to auth.html');
            window.location.href = 'auth.html';
            return;
        }

        await this.loadServices();
        this.initializeElements();
        this.initializeEventListeners();
        this.displayUserInfo();
        this.setMinDate();
        this.populateCategories();
        await this.checkPreSelectedService();
        
        console.log('AppointmentForm init completed');
    }

    async loadServices() {
        try {
            console.log('Loading services from server...');
            const response = await fetch('http://localhost:3000/services');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.categories = data.categories;
            console.log('Services loaded:', this.categories);
        } catch (error) {
            console.error('Error loading services:', error);
            alert('Ошибка загрузки услуг. Пожалуйста, проверьте подключение к серверу.');
        }
    }

    initializeElements() {
        console.log('Initializing elements...');
        
        this.form = document.getElementById('appointmentForm');
        this.userNameElement = document.getElementById('userName');
        this.categorySelect = document.getElementById('category');
        this.serviceSelect = document.getElementById('service');
        this.doctorSelect = document.getElementById('doctor');
        this.dateInput = document.getElementById('date');
        this.timeSelect = document.getElementById('time');
        this.notesTextarea = document.getElementById('notes');
        this.submitBtn = document.querySelector('.submit-btn');
        this.backBtn = document.getElementById('backBtn');
        
        this.serviceInfo = document.querySelector('.selected-service-info');
        this.serviceName = document.getElementById('serviceName');
        this.serviceDescription = document.getElementById('serviceDescription');
        this.servicePrice = document.getElementById('servicePrice');
        this.serviceDuration = document.getElementById('serviceDuration');
        this.serviceProcedures = document.getElementById('serviceProcedures');

        console.log('Elements initialized');
    }

    initializeEventListeners() {
        console.log('Initializing event listeners...');
        
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => this.handleBack());
        }
        
        if (this.categorySelect) {
            this.categorySelect.addEventListener('change', () => this.onCategoryChange());
        }
        
        if (this.serviceSelect) {
            this.serviceSelect.addEventListener('change', () => this.onServiceChange());
        }
        
        if (this.dateInput) {
            this.dateInput.addEventListener('change', () => this.updateSubmitButton());
        }
        
        if (this.timeSelect) {
            this.timeSelect.addEventListener('change', () => this.updateSubmitButton());
        }
        
        if (this.doctorSelect) {
            this.doctorSelect.addEventListener('change', () => this.updateSubmitButton());
        }
    }

    displayUserInfo() {
        const user = authManager.getCurrentUser();
        if (user && this.userNameElement) {
            this.userNameElement.textContent = `${user.firstName} ${user.lastName}`;
        }
    }

    setMinDate() {
        if (!this.dateInput) return;
        
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const minDate = tomorrow.toISOString().split('T')[0];
        this.dateInput.min = minDate;
    }

    populateCategories() {
        if (!this.categorySelect) return;
        
        this.categorySelect.innerHTML = '<option value="">Выберите категорию</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            this.categorySelect.appendChild(option);
        });
    }

    async checkPreSelectedService() {
        const selectedService = localStorage.getItem('selectedService');
        
        if (selectedService && this.categorySelect && this.serviceSelect) {
            try {
                const service = JSON.parse(selectedService);
                
                const category = this.categories.find(cat => 
                    cat.services.some(s => s.id === service.id)
                );
                
                if (category) {
                    this.categorySelect.value = category.id;
                    await this.onCategoryChange();
                    
                    setTimeout(() => {
                        if (this.serviceSelect) {
                            this.serviceSelect.value = service.id;
                            this.onServiceChange();
                        }
                    }, 100);
                }
                
                localStorage.removeItem('selectedService');
            } catch (error) {
                console.error('Error parsing selected service:', error);
            }
        }
    }

    async onCategoryChange() {
        if (!this.categorySelect || !this.serviceSelect || !this.doctorSelect) return;
        
        const categoryId = this.categorySelect.value;
        this.serviceSelect.innerHTML = '<option value="">Выберите услугу</option>';
        this.serviceSelect.disabled = !categoryId;
        this.doctorSelect.disabled = true;
        this.doctorSelect.innerHTML = '<option value="">Сначала выберите услугу</option>';
        this.hideServiceInfo();
        this.updateSubmitButton();

        if (!categoryId) return;

        const category = this.categories.find(cat => cat.id === categoryId);
        if (category && category.services) {
            category.services.forEach(service => {
                const option = document.createElement('option');
                option.value = service.id;
                option.textContent = `${service.name} - ${service.priceUnit} ${service.price.toLocaleString()} ₽`;
                this.serviceSelect.appendChild(option);
            });
            this.serviceSelect.disabled = false;
        }
    }

    onServiceChange() {
        if (!this.serviceSelect || !this.doctorSelect) return;
        
        const serviceId = this.serviceSelect.value;
        this.doctorSelect.disabled = !serviceId;
        this.updateSubmitButton();

        if (!serviceId) {
            this.hideServiceInfo();
            this.doctorSelect.innerHTML = '<option value="">Сначала выберите услугу</option>';
            return;
        }

        this.selectedService = this.findServiceById(serviceId);
        if (this.selectedService) {
            this.showServiceInfo(this.selectedService);
            this.updateDoctors();
            this.doctorSelect.disabled = false;
        }
    }

    findServiceById(serviceId) {
        for (const category of this.categories) {
            const service = category.services.find(s => s.id === serviceId);
            if (service) return service;
        }
        return null;
    }

    showServiceInfo(service) {
        if (!this.serviceInfo) return;
        
        this.serviceName.textContent = service.name;
        this.serviceDescription.textContent = service.description;
        this.servicePrice.textContent = `${service.priceUnit} ${service.price.toLocaleString()} ₽`;
        this.serviceDuration.textContent = service.duration;
        this.serviceProcedures.textContent = service.procedures.join(', ');
        this.serviceInfo.style.display = 'block';
    }

    hideServiceInfo() {
        if (this.serviceInfo) {
            this.serviceInfo.style.display = 'none';
        }
        this.selectedService = null;
    }

    updateDoctors() {
        if (!this.categorySelect || !this.doctorSelect) return;
        
        const categoryId = this.categorySelect.value;
        this.doctorSelect.innerHTML = '<option value="">Выберите специалиста</option>';
        
        if (!categoryId) return;

        const doctors = this.getDoctorsByCategory(categoryId);
        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = doctor.name;
            this.doctorSelect.appendChild(option);
        });
    }

    getDoctorsByCategory(categoryId) {
        const doctors = {
            'cosmetology': [
                { id: 'dr_ivanova', name: 'Иванова А.П. - Косметолог' },
                { id: 'dr_smirnova', name: 'Смирнова О.Л. - Косметолог' },
                { id: 'dr_orlova', name: 'Орлова М.В. - Дерматолог' }
            ],
            'surgery': [
                { id: 'dr_petrov', name: 'Петров В.С. - Пластический хирург' },
                { id: 'dr_volkov', name: 'Волков М.А. - Хирург' },
                { id: 'dr_nikolaeva', name: 'Николаева Е.И. - Челюстно-лицевой хирург' }
            ],
            'dentistry': [
                { id: 'dr_sidorova', name: 'Сидорова М.К. - Стоматолог-терапевт' },
                { id: 'dr_fedorov', name: 'Федоров П.С. - Ортодонт' },
                { id: 'dr_kuzmin', name: 'Кузьмин А.В. - Хирург-имплантолог' }
            ],
            'laser': [
                { id: 'dr_kuznetsov', name: 'Кузнецов Д.И. - Лазерный терапевт' },
                { id: 'dr_romanova', name: 'Романова Е.В. - Дерматолог-косметолог' },
                { id: 'dr_belova', name: 'Белова О.С. - Специалист по лазерной эпиляции' }
            ]
        };
        
        return doctors[categoryId] || [];
    }

    updateSubmitButton() {
        if (!this.submitBtn) return;
        
        const isFormValid = this.categorySelect?.value && 
                           this.serviceSelect?.value && 
                           this.doctorSelect?.value &&
                           this.dateInput?.value && 
                           this.timeSelect?.value;
        
        this.submitBtn.disabled = !isFormValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        console.log('Form submit triggered');
        
        if (!this.validateForm()) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        const formData = this.prepareFormData();
        console.log('Submitting appointment:', formData);

        try {
            const response = await this.sendAppointment(formData);
            console.log('Server response:', response);
            
            if (response.id) {
                alert('Запись на прием успешно создана!');
                window.location.href = 'home.html'; 
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Appointment error:', error);
            alert('Ошибка при создании записи. Попробуйте еще раз.');
        }
    }

    validateForm() {
        return this.categorySelect?.value && 
               this.serviceSelect?.value && 
               this.doctorSelect?.value &&
               this.dateInput?.value && 
               this.timeSelect?.value &&
               this.selectedService;
    }

    prepareFormData() {
        const user = authManager.getCurrentUser();
        return {
            userId: user.id,
            category: this.categorySelect.options[this.categorySelect.selectedIndex]?.text,
            categoryId: this.categorySelect.value,
            service: this.selectedService.name,
            serviceId: this.serviceSelect.value,
            doctor: this.doctorSelect.options[this.doctorSelect.selectedIndex]?.text,
            doctorId: this.doctorSelect.value,
            date: this.dateInput.value,
            time: this.timeSelect.value,
            notes: this.notesTextarea.value,
            price: this.selectedService.price,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
    }

    async sendAppointment(data) {
        const response = await fetch('http://localhost:3000/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    handleBack() {
        window.location.href = 'home.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('appointmentForm')) {
        new AppointmentForm();
    }
});