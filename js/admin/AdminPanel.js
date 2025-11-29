import { AppointmentsManager } from './AppointmentsManager.js';
import { ServicesManager } from './ServicesManager.js';
import { ModalManager } from './ModalManager.js';

export class AdminPanel {
    constructor() {
        this.appointments = [];
        this.services = [];
        this.categories = [];
        this.currentTab = 'appointments';
        
        this.managers = {};
        
        this.init();
    }

    async init() {
        console.log('AdminPanel init started');
        
        this.showPreloader();
        
        if (!authManager.isAuthenticated()) {
            this.hidePreloader();
            window.location.href = 'auth.html';
            return;
        }

        if (!this.checkAdminPermissions()) {
            this.hidePreloader();
            return;
        }

        try {
            this.initializeElements();
            this.initializeManagers();
            this.initializeEventListeners();
            await this.loadAllData();
            this.showTab('appointments');
            
            console.log('AdminPanel init completed');
            
            setTimeout(() => {
                this.hidePreloader();
            }, 500);
            
        } catch (error) {
            console.error('AdminPanel init error:', error);
            this.hidePreloader();
            this.showError('Ошибка инициализации панели администратора');
        }
    }

    showPreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.remove('preloader--hidden');
        }
    }

    hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('preloader--hidden');
            
            setTimeout(() => {
                if (preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                }
            }, 500);
        }
    }

    initializeElements() {
        this.refreshBtn = document.getElementById('refreshBtn');
        this.backBtn = document.getElementById('backBtn');
        
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
    }

    initializeManagers() {
        this.managers.modal = new ModalManager(this);
        this.managers.appointments = new AppointmentsManager(this);
        this.managers.services = new ServicesManager(this);
    }

    initializeEventListeners() {
        this.refreshBtn.addEventListener('click', () => this.handleRefresh());
        this.backBtn.addEventListener('click', () => this.handleBack());
        
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.showTab(tab);
            });
        });
    }

    async handleRefresh() {
        this.showLoading(true);
        await this.loadAllData();
        this.showLoading(false);
        this.showSuccess('Данные обновлены');
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.managers.appointments.loadAppointments(),
                this.managers.services.loadServices()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    showTab(tabName) {
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });
        
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        
        this.currentTab = tabName;
    }

    showLoading(show) {
        const mainContent = document.querySelector('.admin-content');
        if (show) {
            mainContent.classList.add('loading');
        } else {
            mainContent.classList.remove('loading');
        }
    }

    showSuccess(message) {
        alert(message);
    }

    showError(message) {
        alert(message);
    }

    checkAdminPermissions() {
        const user = authManager.getCurrentUser();
        const isAdmin = user && (user.role === 'admin' || user.email === 'admin@gmail.com');
        
        if (!isAdmin) {
            alert('Доступ запрещен. Требуются права администратора.');
            window.location.href = 'home.html';
            return false;
        }
        return true;
    }

    handleBack() {
        window.location.href = 'home.html';
    }
}