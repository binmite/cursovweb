class AppointmentForm {
    constructor() {
        this.init();
    }

    init() {
        if (!authManager.isAuthenticated()) {
            window.location.href = 'auth.html';
            return;
        }

        this.initializeElements();
        this.initializeEventListeners();
        this.displayUserInfo();
        this.setMinDate();
    }

    initializeElements() {
        this.form = document.getElementById('appointmentForm');
        this.userNameElement = document.getElementById('userName');
        this.serviceSelect = document.getElementById('service');
        this.doctorSelect = document.getElementById('doctor');
        this.dateInput = document.getElementById('date');
        this.timeSelect = document.getElementById('time');
        this.notesTextarea = document.getElementById('notes');
        this.logoutBtn = document.getElementById('logoutBtn');
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        this.serviceSelect.addEventListener('change', () => this.updateDoctors());
    }

    displayUserInfo() {
        const user = authManager.getCurrentUser();
        if (user) {
            this.userNameElement.textContent = `${user.firstName} ${user.lastName}`;
        }
    }

    setMinDate() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const minDate = tomorrow.toISOString().split('T')[0];
        this.dateInput.min = minDate;
    }

    updateDoctors() {
        const service = this.serviceSelect.value;
        this.doctorSelect.innerHTML = '<option value="">Выберите специалиста</option>';
        
        const doctors = this.getDoctorsByService(service);
        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = doctor.name;
            this.doctorSelect.appendChild(option);
        });
    }

    getDoctorsByService(service) {
        const doctors = {
            'cosmetology': [
                { id: 'dr_ivanova', name: 'Иванова А.П. - Косметолог' },
                { id: 'dr_smirnova', name: 'Смирнова О.Л. - Косметолог' }
            ],
            'surgery': [
                { id: 'dr_petrov', name: 'Петров В.С. - Хирург' },
                { id: 'dr_volkov', name: 'Волков М.А. - Хирург' }
            ],
            'dentistry': [
                { id: 'dr_sidorova', name: 'Сидорова М.К. - Стоматолог' },
                { id: 'dr_fedorov', name: 'Федоров П.С. - Стоматолог' }
            ],
            'laser': [
                { id: 'dr_kuznetsov', name: 'Кузнецов Д.И. - Лазерный терапевт' },
                { id: 'dr_romanova', name: 'Романова Е.В. - Лазерный терапевт' }
            ]
        };
        
        return doctors[service] || [];
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            userId: authManager.getCurrentUser().id,
            service: this.serviceSelect.value,
            doctor: this.doctorSelect.value,
            date: this.dateInput.value,
            time: this.timeSelect.value,
            notes: this.notesTextarea.value,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        try {
            const response = await this.sendAppointment(formData);
            if (response.success) {
                alert('Запись на прием успешно создана!');
                this.form.reset();
                this.updateDoctors();
            } else {
                alert('Ошибка при создании записи: ' + response.message);
            }
        } catch (error) {
            alert('Ошибка соединения с сервером');
        }
    }

    async sendAppointment(data) {
        const response = await fetch('http://localhost:3000/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    }

    handleLogout() {
        authManager.logout();
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AppointmentForm();
});