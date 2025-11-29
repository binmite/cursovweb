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
                        <h3>Заявки не найдены</h3>
                        <p>Попробуйте изменить параметры фильтрации</p>
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
                <td>${appointment.userId || 'Не указан'}</td>
                <td>${appointment.service}</td>
                <td>${appointment.doctor}</td>
                <td>${appointment.date} ${appointment.time}</td>
                <td><span class="status-badge status-${appointment.status}">${this.getStatusText(appointment.status)}</span></td>
                <td>${appointment.price ? appointment.price.toLocaleString() + ' ₽' : '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-view" data-id="${appointment.id}" data-action="view">Просмотр</button>
                        <button class="action-btn btn-edit" data-id="${appointment.id}" data-action="edit">Редакт.</button>
                        ${appointment.status === 'pending' ? `
                            <button class="action-btn btn-confirm" data-id="${appointment.id}" data-action="confirm">Принять</button>
                            <button class="action-btn btn-reject" data-id="${appointment.id}" data-action="reject">Отклонить</button>
                        ` : ''}
                        <button class="action-btn btn-delete" data-id="${appointment.id}" data-action="delete">Удалить</button>
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
            this.adminPanel.showError('Заявка не найдена');
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
        
        if (confirm('Подтвердить эту заявку?')) {
            try {
                this.adminPanel.showLoading(true);
                
                const updatedData = {
                    ...this.currentAppointment,
                    status: 'confirmed',
                    adminNotes: this.currentAppointment.adminNotes || 'Заявка подтверждена администратором',
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
                this.adminPanel.showSuccess('Заявка подтверждена!');
                
            } catch (error) {
                console.error('Error confirming appointment:', error);
                this.adminPanel.showError('Ошибка при подтверждении заявки.');
            } finally {
                this.adminPanel.showLoading(false);
            }
        }
    }

    async rejectAppointment() {
        if (!this.currentAppointment) return;
        
        const reason = prompt('Укажите причину отказа:');
        if (reason === null) return;
        
        try {
            this.adminPanel.showLoading(true);
            
            const updatedData = {
                ...this.currentAppointment,
                status: 'rejected',
                adminNotes: reason || 'Заявка отклонена администратором',
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
            this.adminPanel.showSuccess('Заявка отклонена!');
            
        } catch (error) {
            console.error('Error rejecting appointment:', error);
            this.adminPanel.showError('Ошибка при отклонении заявки.');
        } finally {
            this.adminPanel.showLoading(false);
        }
    }

    async deleteAppointment() {
        if (!this.currentAppointment) return;
        
        if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
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
                this.adminPanel.showSuccess('Заявка удалена!');
                
            } catch (error) {
                console.error('Error deleting appointment:', error);
                this.adminPanel.showError('Ошибка при удалении заявки.');
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
            'pending': 'Ожидание',
            'confirmed': 'Подтверждено',
            'rejected': 'Отклонено'
        };
        
        return statusMap[status] || status;
    }
}