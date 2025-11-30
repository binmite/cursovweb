export class ModalManager {
    constructor(adminPanel) {
        this.adminPanel = adminPanel;
        this.i18n = window.i18nManager;
        this.initializeElements();
        this.initializeEventListeners();
        this.bindLanguageChange();
    }

    bindLanguageChange() {
        document.addEventListener('languageChanged', () => {
            this.updateTranslations();
        });
    }

    updateTranslations() {
        if (this.modalTitle && this.adminPanel.managers.appointments.currentAppointment) {
            const isViewMode = this.modalTitle.textContent.includes('Просмотр') || this.modalTitle.textContent.includes('View');
            this.modalTitle.textContent = isViewMode ? 
                this.i18n.t('admin.modal.appointment_title') : 
                this.i18n.t('admin.modal.appointment_edit_title');
        }
        
        if (this.serviceModalTitle) {
            const isAddMode = this.serviceModalTitle.textContent.includes('Добавить') || this.serviceModalTitle.textContent.includes('Add');
            this.serviceModalTitle.textContent = isAddMode ? 
                this.i18n.t('admin.modal.service_add_title') : 
                this.i18n.t('admin.modal.service_edit_title');
        }
        
        this.updateButtonText();
        
        this.updatePlaceholders();
    }

    updateButtonText() {
        if (this.saveAppointmentBtn) {
            this.saveAppointmentBtn.textContent = this.i18n.t('admin.buttons.save');
        }
        if (this.confirmAppointmentBtn) {
            this.confirmAppointmentBtn.textContent = this.i18n.t('admin.buttons.confirm');
        }
        if (this.rejectAppointmentBtn) {
            this.rejectAppointmentBtn.textContent = this.i18n.t('admin.buttons.reject');
        }
        if (this.deleteAppointmentBtn) {
            this.deleteAppointmentBtn.textContent = this.i18n.t('admin.buttons.delete');
        }
        if (this.saveServiceBtn) {
            this.saveServiceBtn.textContent = this.i18n.t('admin.buttons.save');
        }
    }

    updatePlaceholders() {
        if (this.adminNotes) {
            this.adminNotes.placeholder = this.i18n.t('admin.modal.admin_notes_placeholder');
        }
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

        this.updateFormLabels();
    }

    updateFormLabels() {
        const labels = {
            'modalClient': 'admin.modal.client',
            'modalService': 'admin.modal.service',
            'modalDoctor': 'admin.modal.doctor',
            'modalPrice': 'admin.modal.price',
            'modalDate': 'admin.modal.date',
            'modalTime': 'admin.modal.time',
            'modalStatus': 'admin.modal.status',
            'modalNotes': 'admin.modal.client_notes',
            'adminNotes': 'admin.modal.admin_notes'
        };

        Object.entries(labels).forEach(([elementId, translationKey]) => {
            const label = document.querySelector(`label[for="${elementId}"]`);
            if (label) {
                label.textContent = this.i18n.t(translationKey);
            }
        });
    }

    initializeServiceForm() {
        this.serviceModalTitle = document.getElementById('serviceModalTitle');
        this.serviceForm = document.getElementById('serviceForm');
        this.saveServiceBtn = document.getElementById('saveServiceBtn');

        this.updateServiceFormLabels();
    }

    updateServiceFormLabels() {
        const labels = {
            'serviceName': 'admin.modal.service_name',
            'serviceCategory': 'admin.modal.service_category',
            'servicePrice': 'admin.modal.service_price',
            'servicePriceUnit': 'admin.modal.service_price_unit',
            'serviceDuration': 'admin.modal.service_duration',
            'serviceDescription': 'admin.modal.service_description',
            'serviceProcedures': 'admin.modal.service_procedures'
        };

        Object.entries(labels).forEach(([elementId, translationKey]) => {
            const label = document.querySelector(`label[for="${elementId}"]`);
            if (label) {
                label.textContent = this.i18n.t(translationKey);
            }
        });

        const placeholders = {
            'serviceDuration': 'admin.modal.service_duration_placeholder',
            'serviceProcedures': 'admin.modal.service_procedures_placeholder'
        };

        Object.entries(placeholders).forEach(([elementId, translationKey]) => {
            const input = document.getElementById(elementId);
            if (input) {
                input.placeholder = this.i18n.t(translationKey);
            }
        });

        this.updateCategoryOptions();
    }

    updateCategoryOptions() {
        const categorySelect = document.getElementById('serviceCategory');
        if (categorySelect && categorySelect.firstChild) {
            categorySelect.firstChild.textContent = this.i18n.t('admin.modal.service_category_placeholder');
        }
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
        
        this.modalClient.value = `${this.i18n.t('admin.modal.client')} ID: ${appointment.userId}`;
        this.modalService.value = appointment.service;
        this.modalDoctor.value = appointment.doctor;
        this.modalPrice.value = appointment.price ? appointment.price.toLocaleString() + ' ' + this.i18n.t('services.currency') : '-';
        this.modalDate.value = appointment.date;
        this.modalTime.value = appointment.time;
        this.modalStatus.value = appointment.status;
        this.modalNotes.value = appointment.notes || '';
        this.adminNotes.value = appointment.adminNotes || '';
        
        const isViewMode = mode === 'view';
        this.modalTitle.textContent = isViewMode ? 
            this.i18n.t('admin.modal.appointment_title') : 
            this.i18n.t('admin.modal.appointment_edit_title');
        
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
            this.adminPanel.showSuccess(this.i18n.t('admin.messages.appointment_updated'));
            
        } catch (error) {
            console.error('Error updating appointment:', error);
            this.adminPanel.showError(this.i18n.t('admin.messages.appointment_update_error'));
        } finally {
            this.adminPanel.showLoading(false);
        }
    }

    openServiceModal(mode, service = null) {
        this.adminPanel.managers.services.currentService = service;
        
        this.serviceModalTitle.textContent = mode === 'add' ? 
            this.i18n.t('admin.modal.service_add_title') : 
            this.i18n.t('admin.modal.service_edit_title');
        
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

        const mode = this.serviceModalTitle.textContent.includes(this.i18n.t('admin.modal.service_add_title')) ? 'add' : 'edit';
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