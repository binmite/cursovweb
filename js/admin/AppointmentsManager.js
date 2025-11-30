export class AppointmentsManager {
    constructor(adminPanel) {
        this.adminPanel = adminPanel;
        this.appointments = [];
        this.filteredAppointments = [];
        this.currentAppointment = null;
        
        this.initializeElements();
    }

    initializeElements() {
        this.appointmentsTableBody = document.getElementById('appointmentsTableBody');
        this.statusFilter = document.getElementById('statusFilter');
        this.dateFilter = document.getElementById('dateFilter');
        this.searchFilter = document.getElementById('searchFilter');
        this.clearFilters = document.getElementById('clearFilters');
        
        this.totalAppointments = document.getElementById('totalAppointments');
        this.pendingAppointments = document.getElementById('pendingAppointments');
        this.confirmedAppointments = document.getElementById('confirmedAppointments');
        this.rejectedAppointments = document.getElementById('rejectedAppointments');
        
        this.initializeEventListeners();
        this.updateTranslations();
    }

    t(key) {
        if (window.i18nManager && typeof window.i18nManager.t === 'function') {
            return window.i18nManager.t(key);
        }
        
        const fallbackTranslations = {
            'admin.stats.total_appointments': 'Всего заявок',
            'admin.stats.pending': 'Ожидают',
            'admin.stats.confirmed': 'Подтверждены',
            'admin.stats.rejected': 'Отклонены',
            
            'admin.filters.status': 'Статус:',
            'admin.filters.status_all': 'Все статусы',
            'admin.filters.status_pending': 'Ожидание',
            'admin.filters.status_confirmed': 'Подтверждено',
            'admin.filters.status_rejected': 'Отклонено',
            'admin.filters.date': 'Дата:',
            'admin.filters.search': 'Поиск:',
            'admin.filters.search_placeholder': 'Поиск по клиенту или услуге...',
            'admin.filters.clear': 'Сбросить',
            
            'admin.appointments.id': 'ID',
            'admin.appointments.client': 'Клиент',
            'admin.appointments.service': 'Услуга',
            'admin.appointments.doctor': 'Специалист',
            'admin.appointments.datetime': 'Дата и время',
            'admin.appointments.status': 'Статус',
            'admin.appointments.price': 'Цена',
            'admin.appointments.actions': 'Действия',
            
            'admin.status.pending': 'Ожидание',
            'admin.status.confirmed': 'Подтверждено',
            'admin.status.rejected': 'Отклонено',
            
            'admin.buttons.view': 'Просмотр',
            'admin.buttons.edit': 'Редактировать',
            'admin.buttons.confirm': 'Подтвердить',
            'admin.buttons.reject': 'Отклонить',
            'admin.buttons.delete': 'Удалить',
            
            'admin.messages.no_appointments': 'Заявки не найдены',
            'admin.messages.no_appointments_filter': 'Попробуйте изменить параметры фильтрации',
            'admin.messages.client_not_specified': 'Не указан',
            'admin.messages.price_not_specified': '-',
            'admin.messages.confirm_appointment': 'Подтвердить эту заявку?',
            'admin.messages.reject_reason': 'Укажите причину отказа:',
            'admin.messages.default_reject_reason': 'Заявка отклонена администратором',
            'admin.messages.default_confirm_reason': 'Заявка подтверждена администратором',
            'admin.messages.delete_confirm': 'Вы уверены, что хотите удалить эту заявку?',
            
            'admin.messages.appointment_confirmed': 'Заявка подтверждена!',
            'admin.messages.appointment_rejected': 'Заявка отклонена!',
            'admin.messages.appointment_deleted': 'Заявка удалена!',
            
            'admin.messages.appointment_not_found': 'Заявка не найдена',
            'admin.messages.confirm_error': 'Ошибка при подтверждении заявки.',
            'admin.messages.reject_error': 'Ошибка при отклонении заявки.',
            'admin.messages.delete_error': 'Ошибка при удалении заявки.',
            'admin.messages.load_error': 'Ошибка загрузки заявок'
        };
        
        return fallbackTranslations[key] || key;
    }

    updateTranslations() {
        if (this.statusFilter) {
            const label = this.statusFilter.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.textContent = this.t('admin.filters.status');
            }
            
            const options = this.statusFilter.querySelectorAll('option');
            options[0].textContent = this.t('admin.filters.status_all');
            options[1].textContent = this.t('admin.filters.status_pending');
            options[2].textContent = this.t('admin.filters.status_confirmed');
            options[3].textContent = this.t('admin.filters.status_rejected');
        }
        
        if (this.dateFilter) {
            const label = this.dateFilter.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.textContent = this.t('admin.filters.date');
            }
        }
        
        if (this.searchFilter) {
            const label = this.searchFilter.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.textContent = this.t('admin.filters.search');
            }
            this.searchFilter.placeholder = this.t('admin.filters.search_placeholder');
        }
        
        if (this.clearFilters) {
            this.clearFilters.textContent = this.t('admin.filters.clear');
        }
        
        if (this.totalAppointments) {
            const label = this.totalAppointments.closest('.stat-card')?.querySelector('.stat-label');
            if (label) {
                label.textContent = this.t('admin.stats.total_appointments');
            }
        }
        
        if (this.pendingAppointments) {
            const label = this.pendingAppointments.closest('.stat-card')?.querySelector('.stat-label');
            if (label) {
                label.textContent = this.t('admin.stats.pending');
            }
        }
        
        if (this.confirmedAppointments) {
            const label = this.confirmedAppointments.closest('.stat-card')?.querySelector('.stat-label');
            if (label) {
                label.textContent = this.t('admin.stats.confirmed');
            }
        }
        
        if (this.rejectedAppointments) {
            const label = this.rejectedAppointments.closest('.stat-card')?.querySelector('.stat-label');
            if (label) {
                label.textContent = this.t('admin.stats.rejected');
            }
        }
    }

    initializeEventListeners() {
        this.statusFilter.addEventListener('change', () => this.applyFilters());
        this.dateFilter.addEventListener('change', () => this.applyFilters());
        this.searchFilter.addEventListener('input', () => this.applyFilters());
        this.clearFilters.addEventListener('click', () => this.clearAllFilters());
    }

    async loadAppointments() {
        try {
            const response = await fetch('http://localhost:3000/appointments');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.appointments = await response.json();
            this.applyFilters();
            this.updateStats();
        } catch (error) {
            console.error('Error loading appointments:', error);
            this.adminPanel.showError(this.t('admin.messages.load_error'));
            throw error;
        }
    }

    applyFilters() {
        let filtered = [...this.appointments];
        
        const statusFilter = this.statusFilter.value;
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter);
        }
        
        const dateFilter = this.dateFilter.value;
        if (dateFilter) {
            filtered = filtered.filter(app => app.date === dateFilter);
        }
        
        const searchFilter = this.searchFilter.value.toLowerCase();
        if (searchFilter) {
            filtered = filtered.filter(app => 
                app.service.toLowerCase().includes(searchFilter) ||
                app.doctor.toLowerCase().includes(searchFilter) ||
                (app.userId && app.userId.toString().includes(searchFilter)) ||
                (app.notes && app.notes.toLowerCase().includes(searchFilter))
            );
        }
        
        this.filteredAppointments = filtered;
        this.renderAppointments();
    }

    clearAllFilters() {
        this.statusFilter.value = 'all';
        this.dateFilter.value = '';
        this.searchFilter.value = '';
        this.applyFilters();
    }

    renderAppointments() {
        if (!this.appointmentsTableBody) return;
        
        this.appointmentsTableBody.innerHTML = '';
        
        if (this.filteredAppointments.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="8">
                    <div class="empty-state">
                        <h3>${this.t('admin.messages.no_appointments')}</h3>
                        <p>${this.t('admin.messages.no_appointments_filter')}</p>
                    </div>
                </td>
            `;
            this.appointmentsTableBody.appendChild(row);
            return;
        }
        
        this.filteredAppointments.forEach(appointment => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${appointment.id}</td>
                <td>${appointment.userId || this.t('admin.messages.client_not_specified')}</td>
                <td>${appointment.service}</td>
                <td>${appointment.doctor}</td>
                <td>${appointment.date} ${appointment.time}</td>
                <td><span class="status-badge status-${appointment.status}">${this.getStatusText(appointment.status)}</span></td>
                <td>${appointment.price ? appointment.price.toLocaleString() + ' ₽' : this.t('admin.messages.price_not_specified')}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-view" data-id="${appointment.id}" data-action="view" title="${this.t('admin.buttons.view')}">
                            ${this.t('admin.buttons.view')}
                        </button>
                        <button class="action-btn btn-edit" data-id="${appointment.id}" data-action="edit" title="${this.t('admin.buttons.edit')}">
                            ${this.t('admin.buttons.edit')}
                        </button>
                        ${appointment.status === 'pending' ? `
                            <button class="action-btn btn-confirm" data-id="${appointment.id}" data-action="confirm" title="${this.t('admin.buttons.confirm')}">
                                ${this.t('admin.buttons.confirm')}
                            </button>
                            <button class="action-btn btn-reject" data-id="${appointment.id}" data-action="reject" title="${this.t('admin.buttons.reject')}">
                                ${this.t('admin.buttons.reject')}
                            </button>
                        ` : ''}
                        <button class="action-btn btn-delete" data-id="${appointment.id}" data-action="delete" title="${this.t('admin.buttons.delete')}">
                            ${this.t('admin.buttons.delete')}
                        </button>
                    </div>
                </td>
            `;
            
            this.appointmentsTableBody.appendChild(row);
        });
        
        this.addActionHandlers();
    }

    addActionHandlers() {
        const buttons = this.appointmentsTableBody.querySelectorAll('.action-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const appointmentId = e.target.getAttribute('data-id');
                const action = e.target.getAttribute('data-action');
                this.handleAction(appointmentId, action);
            });
        });
    }

    handleAction(appointmentId, action) {
        const appointment = this.appointments.find(app => app.id == appointmentId);
        
        if (!appointment) {
            this.adminPanel.showError(this.t('admin.messages.appointment_not_found'));
            return;
        }
        
        this.currentAppointment = appointment;
        
        switch (action) {
            case 'view':
                this.adminPanel.managers.modal.openAppointmentModal('view', appointment);
                break;
            case 'edit':
                this.adminPanel.managers.modal.openAppointmentModal('edit', appointment);
                break;
            case 'confirm':
                this.confirmAppointment();
                break;
            case 'reject':
                this.rejectAppointment();
                break;
            case 'delete':
                this.deleteAppointment();
                break;
        }
    }

    async confirmAppointment() {
        if (!this.currentAppointment) return;
        
        if (confirm(this.t('admin.messages.confirm_appointment'))) {
            try {
                this.adminPanel.showLoading(true);
                
                const updatedData = {
                    ...this.currentAppointment,
                    status: 'confirmed',
                    adminNotes: this.currentAppointment.adminNotes || this.t('admin.messages.default_confirm_reason'),
                    updatedAt: new Date().toISOString()
                };
                
                const response = await fetch(`http://localhost:3000/appointments/${this.currentAppointment.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                await this.loadAppointments();
                this.adminPanel.managers.modal.closeAllModals();
                this.adminPanel.showSuccess(this.t('admin.messages.appointment_confirmed'));
                
            } catch (error) {
                console.error('Error confirming appointment:', error);
                this.adminPanel.showError(this.t('admin.messages.confirm_error'));
            } finally {
                this.adminPanel.showLoading(false);
            }
        }
    }

    async rejectAppointment() {
        if (!this.currentAppointment) return;
        
        const reason = prompt(this.t('admin.messages.reject_reason'));
        if (reason === null) return;
        
        try {
            this.adminPanel.showLoading(true);
            
            const updatedData = {
                ...this.currentAppointment,
                status: 'rejected',
                adminNotes: reason || this.t('admin.messages.default_reject_reason'),
                updatedAt: new Date().toISOString()
            };
            
            const response = await fetch(`http://localhost:3000/appointments/${this.currentAppointment.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await this.loadAppointments();
            this.adminPanel.managers.modal.closeAllModals();
            this.adminPanel.showSuccess(this.t('admin.messages.appointment_rejected'));
            
        } catch (error) {
            console.error('Error rejecting appointment:', error);
            this.adminPanel.showError(this.t('admin.messages.reject_error'));
        } finally {
            this.adminPanel.showLoading(false);
        }
    }

    async deleteAppointment() {
        if (!this.currentAppointment) return;
        
        if (confirm(this.t('admin.messages.delete_confirm'))) {
            try {
                this.adminPanel.showLoading(true);
                
                const response = await fetch(`http://localhost:3000/appointments/${this.currentAppointment.id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                await this.loadAppointments();
                this.adminPanel.managers.modal.closeAllModals();
                this.adminPanel.showSuccess(this.t('admin.messages.appointment_deleted'));
                
            } catch (error) {
                console.error('Error deleting appointment:', error);
                this.adminPanel.showError(this.t('admin.messages.delete_error'));
            } finally {
                this.adminPanel.showLoading(false);
            }
        }
    }

    updateStats() {
        const total = this.appointments.length;
        const pending = this.appointments.filter(app => app.status === 'pending').length;
        const confirmed = this.appointments.filter(app => app.status === 'confirmed').length;
        const rejected = this.appointments.filter(app => app.status === 'rejected').length;
        
        this.totalAppointments.textContent = total;
        this.pendingAppointments.textContent = pending;
        this.confirmedAppointments.textContent = confirmed;
        this.rejectedAppointments.textContent = rejected;
    }

    getStatusText(status) {
        const statusMap = {
            'pending': this.t('admin.status.pending'),
            'confirmed': this.t('admin.status.confirmed'),
            'rejected': this.t('admin.status.rejected')
        };
        
        return statusMap[status] || status;
    }

    refreshTranslations() {
        this.updateTranslations();
        this.renderAppointments(); 
    }
}