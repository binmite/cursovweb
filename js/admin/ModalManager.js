export class ModalManager {
    constructor(adminPanel) {
        this.adminPanel = adminPanel;
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.appointmentModal = document.getElementById('appointmentModal');
        this.serviceModal = document.getElementById('serviceModal');

        this.closeBtns = document.querySelectorAll('.close');
     
        this.initializeAppointmentForm();
        this.initializeServiceForm();
    }

    initializeAppointmentForm() {
        this.modalTitle = document.getElementById('modalTitle');
        this.modalClient = document.getElementById('modalClient');
        this.modalService = document.getElementById('modalService');
        this.modalDoctor = document.getElementById('modalDoctor');
        this.modalPrice = document.getElementById('modalPrice');
        this.modalDate = document.getElementById('modalDate');
        this.modalTime = document.getElementById('modalTime');
        this.modalStatus = document.getElementById('modalStatus');
        this.modalNotes = document.getElementById('modalNotes');
        this.adminNotes = document.getElementById('adminNotes');
        
        this.saveAppointmentBtn = document.getElementById('saveAppointmentBtn');
        this.confirmAppointmentBtn = document.getElementById('confirmAppointmentBtn');
        this.rejectAppointmentBtn = document.getElementById('rejectAppointmentBtn');
        this.deleteAppointmentBtn = document.getElementById('deleteAppointmentBtn');
    }

    initializeServiceForm() {
        this.serviceModalTitle = document.getElementById('serviceModalTitle');
        this.serviceForm = document.getElementById('serviceForm');
        this.saveServiceBtn = document.getElementById('saveServiceBtn');
    }

    initializeEventListeners() {
        this.closeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === this.appointmentModal) this.closeAllModals();
            if (e.target === this.serviceModal) this.closeAllModals();
        });
        
        this.saveAppointmentBtn.addEventListener('click', () => this.saveAppointment());
        this.saveServiceBtn.addEventListener('click', () => this.saveService());

        document.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
    }

    openAppointmentModal(mode, appointment) {
        this.adminPanel.managers.appointments.currentAppointment = appointment;
        
        this.modalClient.value = `Клиент ID: ${appointment.userId}`;
        this.modalService.value = appointment.service;
        this.modalDoctor.value = appointment.doctor;
        this.modalPrice.value = appointment.price ? appointment.price.toLocaleString() + ' ₽' : '-';
        this.modalDate.value = appointment.date;
        this.modalTime.value = appointment.time;
        this.modalStatus.value = appointment.status;
        this.modalNotes.value = appointment.notes || '';
        this.adminNotes.value = appointment.adminNotes || '';
        
        const isViewMode = mode === 'view';
        this.modalTitle.textContent = isViewMode ? 'Просмотр заявки' : 'Редактирование заявки';
        
        const readonly = isViewMode;
        this.modalDate.readOnly = readonly;
        this.modalTime.disabled = readonly;
        this.modalStatus.disabled = readonly;
        this.modalNotes.readOnly = readonly;
        this.adminNotes.readOnly = readonly;
        
        this.saveAppointmentBtn.style.display = isViewMode ? 'none' : 'block';
        this.confirmAppointmentBtn.style.display = !readonly && appointment.status === 'pending' ? 'block' : 'none';
        this.rejectAppointmentBtn.style.display = !readonly && appointment.status === 'pending' ? 'block' : 'none';
        this.deleteAppointmentBtn.style.display = 'block';
        
        this.appointmentModal.style.display = 'block';
    }

    async saveAppointment() {
        const appointment = this.adminPanel.managers.appointments.currentAppointment;
        if (!appointment) return;
        
        try {
            this.adminPanel.showLoading(true);
            
            const updatedData = {
                ...appointment,
                date: this.modalDate.value,
                time: this.modalTime.value,
                status: this.modalStatus.value,
                notes: this.modalNotes.value,
                adminNotes: this.adminNotes.value,
                updatedAt: new Date().toISOString()
            };
            
            const response = await fetch(`http://localhost:3000/appointments/${appointment.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await this.adminPanel.managers.appointments.loadAppointments();
            this.closeAllModals();
            this.adminPanel.showSuccess('Заявка успешно обновлена!');
            
        } catch (error) {
            console.error('Error updating appointment:', error);
            this.adminPanel.showError('Ошибка при обновлении заявки.');
        } finally {
            this.adminPanel.showLoading(false);
        }
    }

    openServiceModal(mode, service = null) {
        this.adminPanel.managers.services.currentService = service;
        
        this.serviceModalTitle.textContent = mode === 'add' ? 'Добавить услугу' : 'Редактировать услугу';
        
        if (mode === 'edit' && service) {
            document.getElementById('serviceName').value = service.name;
            document.getElementById('serviceCategory').value = service.categoryId;
            document.getElementById('servicePrice').value = service.price;
            document.getElementById('servicePriceUnit').value = service.priceUnit || 'от';
            document.getElementById('serviceDuration').value = service.duration;
            document.getElementById('serviceDescription').value = service.description;
            document.getElementById('serviceProcedures').value = service.procedures?.join(', ') || '';
        } else {
            this.serviceForm.reset();
            document.getElementById('servicePriceUnit').value = 'от';
        }
        
        this.serviceModal.style.display = 'block';
    }

    async saveService() {
        const serviceData = {
            name: document.getElementById('serviceName').value,
            categoryId: document.getElementById('serviceCategory').value,
            price: parseInt(document.getElementById('servicePrice').value),
            priceUnit: document.getElementById('servicePriceUnit').value,
            duration: document.getElementById('serviceDuration').value,
            description: document.getElementById('serviceDescription').value,
            procedures: document.getElementById('serviceProcedures').value.split(',').map(p => p.trim()).filter(p => p)
        };

        const mode = this.serviceModalTitle.textContent.includes('Добавить') ? 'add' : 'edit';
        const currentService = this.adminPanel.managers.services.currentService;
        
        await this.adminPanel.managers.services.saveService(serviceData, mode, currentService);
        this.closeAllModals();
    }

    closeAllModals() {
        this.appointmentModal.style.display = 'none';
        this.serviceModal.style.display = 'none';
        
        this.adminPanel.managers.appointments.currentAppointment = null;
        this.adminPanel.managers.services.currentService = null;
    }
}