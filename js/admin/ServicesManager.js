export class ServicesManager {
    constructor(adminPanel) {
        this.adminPanel = adminPanel;
        this.i18n = window.i18nManager;
        this.services = [];
        this.categories = [];
        this.currentService = null;
        
        this.initializeElements();
        this.bindLanguageChange();
    }

    bindLanguageChange() {
        document.addEventListener('languageChanged', () => {
            this.updateTranslations();
        });
    }

    updateTranslations() {
        this.renderServices();
        
        if (this.services.length === 0) {
            this.renderServices(); 
        }
    }

    initializeElements() {
        this.servicesTableBody = document.getElementById('servicesTableBody');
        this.addServiceBtn = document.getElementById('addServiceBtn');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.addServiceBtn.addEventListener('click', () => this.openServiceModal());
    }

    async loadServices() {
        try {
            const response = await fetch('http://localhost:3000/services');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            this.categories = data.categories;
            this.services = this.extractAllServices(data.categories);
            this.renderServices();
        } catch (error) {
            console.error('Error loading services:', error);
            throw error;
        }
    }

    extractAllServices(categories) {
        const allServices = [];
        categories.forEach(category => {
            category.services.forEach(service => {
                allServices.push({
                    ...service,
                    category: category.name[this.i18n.currentLang] || category.name,
                    categoryId: category.id
                });
            });
        });
        return allServices;
    }

    renderServices() {
        if (!this.servicesTableBody) return;
        
        this.servicesTableBody.innerHTML = '';
        
        if (this.services.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6">
                    <div class="empty-state">
                        <h3>${this.i18n.t('admin.messages.no_services')}</h3>
                        <p>${this.i18n.t('admin.messages.add_first_service')}</p>
                    </div>
                </td>
            `;
            this.servicesTableBody.appendChild(row);
            return;
        }
        
        this.services.forEach(service => {
            const row = document.createElement('tr');
            
            const serviceName = service.name[this.i18n.currentLang] || service.name;
            
            row.innerHTML = `
                <td>${service.id}</td>
                <td><strong>${serviceName}</strong></td>
                <td>${service.category}</td>
                <td>${service.price ? service.price.toLocaleString() + ' ' + this.i18n.t('services.currency') : '-'}</td>
                <td>${service.duration || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-edit" data-id="${service.id}" data-action="edit">
                            ${this.i18n.t('admin.buttons.edit')}
                        </button>
                        <button class="action-btn btn-delete" data-id="${service.id}" data-action="delete">
                            ${this.i18n.t('admin.buttons.delete')}
                        </button>
                    </div>
                </td>
            `;
            
            this.servicesTableBody.appendChild(row);
        });
        
        this.addActionHandlers();
    }

    addActionHandlers() {
        const buttons = this.servicesTableBody.querySelectorAll('.action-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const serviceId = e.target.getAttribute('data-id');
                const action = e.target.getAttribute('data-action');
                this.handleAction(serviceId, action);
            });
        });
    }

    handleAction(serviceId, action) {
        const service = this.services.find(s => s.id == serviceId);
        if (!service) {
            this.adminPanel.showError(this.i18n.t('admin.messages.service_not_found'));
            return;
        }
        
        this.currentService = service;
        
        if (action === 'edit') {
            this.adminPanel.managers.modal.openServiceModal('edit', service);
        } else if (action === 'delete') {
            this.deleteService();
        }
    }

    openServiceModal() {
        this.adminPanel.managers.modal.openServiceModal('add');
    }

    async saveService(serviceData, mode, currentService = null) {
        try {
            this.adminPanel.showLoading(true);

            if (mode === 'edit' && currentService) {
                await this.updateServiceInCategory(serviceData, currentService);
            } else {
                await this.addServiceToCategory(serviceData);
            }

            await this.loadServices();
            this.adminPanel.showSuccess(this.i18n.t('admin.messages.service_saved'));

        } catch (error) {
            console.error('Error saving service:', error);
            this.adminPanel.showError(this.i18n.t('admin.messages.service_save_error'));
        } finally {
            this.adminPanel.showLoading(false);
        }
    }

    async addServiceToCategory(serviceData) {
        const response = await fetch('http://localhost:3000/services');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const servicesData = await response.json();
        const categories = servicesData.categories;

        const categoryIndex = categories.findIndex(cat => cat.id === serviceData.categoryId);
        if (categoryIndex === -1) {
            throw new Error(this.i18n.t('admin.messages.category_not_found'));
        }

        const newService = {
            id: `service_${Date.now()}`,
            name: serviceData.name,
            description: serviceData.description,
            price: serviceData.price,
            priceUnit: serviceData.priceUnit,
            duration: serviceData.duration,
            procedures: serviceData.procedures,
            popular: false
        };

        categories[categoryIndex].services.push(newService);

        const updateResponse = await fetch('http://localhost:3000/services', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categories })
        });

        if (!updateResponse.ok) {
            throw new Error(`HTTP error! status: ${updateResponse.status}`);
        }
    }

    async updateServiceInCategory(serviceData, currentService) {
        const response = await fetch('http://localhost:3000/services');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const servicesData = await response.json();
        const categories = servicesData.categories;

        const categoryIndex = categories.findIndex(cat => cat.id === serviceData.categoryId);
        if (categoryIndex === -1) {
            throw new Error(this.i18n.t('admin.messages.category_not_found'));
        }

        const serviceIndex = categories[categoryIndex].services.findIndex(s => s.id === currentService.id);
        if (serviceIndex === -1) {
            throw new Error(this.i18n.t('admin.messages.service_not_found'));
        }

        categories[categoryIndex].services[serviceIndex] = {
            ...categories[categoryIndex].services[serviceIndex],
            name: serviceData.name,
            description: serviceData.description,
            price: serviceData.price,
            priceUnit: serviceData.priceUnit,
            duration: serviceData.duration,
            procedures: serviceData.procedures
        };

        const updateResponse = await fetch('http://localhost:3000/services', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categories })
        });

        if (!updateResponse.ok) {
            throw new Error(`HTTP error! status: ${updateResponse.status}`);
        }
    }

    async deleteService() {
        if (!this.currentService) return;
        
        const serviceName = this.currentService.name[this.i18n.currentLang] || this.currentService.name;
        const confirmMessage = `${this.i18n.t('admin.messages.delete_confirm_service')} "${serviceName}"?`;
        
        if (confirm(confirmMessage)) {
            try {
                this.adminPanel.showLoading(true);
                
                const response = await fetch('http://localhost:3000/services');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const servicesData = await response.json();
                const categories = servicesData.categories;

                let serviceDeleted = false;
                
                for (let category of categories) {
                    const serviceIndex = category.services.findIndex(s => s.id === this.currentService.id);
                    if (serviceIndex !== -1) {
                        category.services.splice(serviceIndex, 1);
                        serviceDeleted = true;
                        break;
                    }
                }

                if (!serviceDeleted) {
                    throw new Error(this.i18n.t('admin.messages.service_not_found'));
                }

                const updateResponse = await fetch('http://localhost:3000/services', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ categories })
                });

                if (!updateResponse.ok) {
                    throw new Error(`HTTP error! status: ${updateResponse.status}`);
                }
                
                await this.loadServices();
                this.adminPanel.showSuccess(this.i18n.t('admin.messages.service_deleted'));
                
            } catch (error) {
                console.error('Error deleting service:', error);
                this.adminPanel.showError(this.i18n.t('admin.messages.service_delete_error'));
            } finally {
                this.adminPanel.showLoading(false);
            }
        }
    }
}