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

    t(key) {
        if (window.i18nManager && typeof window.i18nManager.t === 'function') {
            return window.i18nManager.t(key);
        }
        
        const fallbackTranslations = {
            'admin.page_title': 'Панель администратора',
            'admin.title': 'Панель администратора',
            'admin.refresh': 'Обновить',
            'admin.back': 'Назад',
            
            'admin.tabs.appointments': 'Заявки',
            'admin.tabs.services': 'Услуги',
            
            'admin.messages.refresh_success': 'Данные обновлены',
            'admin.messages.init_error': 'Ошибка инициализации панели администратора',
            'admin.messages.access_denied': 'Доступ запрещен. Требуются права администратора.',
            
            'admin.preloader': 'Загрузка панели администратора...',
            
            'auth.unauthorized': 'Необходима авторизация',
            'auth.access_denied': 'Доступ запрещен'
        };
        
        return fallbackTranslations[key] || key;
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
            this.showError(this.t('admin.messages.init_error'));
        }
    }

    showPreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.remove('preloader--hidden');
            
            const preloaderText = preloader.querySelector('.preloader-text');
            if (preloaderText) {
                preloaderText.textContent = this.t('admin.preloader');
            }
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
        
        this.updateTranslations();
    }

    updateTranslations() {
        document.title = this.t('admin.page_title');
        
        const title = document.querySelector('.admin-header h1');
        if (title) {
            title.textContent = this.t('admin.title');
        }
        
        if (this.refreshBtn) {
            this.refreshBtn.textContent = this.t('admin.refresh');
            this.refreshBtn.title = this.t('admin.refresh');
        }
        
        if (this.backBtn) {
            this.backBtn.textContent = this.t('admin.back');
            this.backBtn.title = this.t('admin.back');
        }
        
        this.tabButtons.forEach(btn => {
            const tab = btn.getAttribute('data-tab');
            if (tab === 'appointments') {
                btn.textContent = this.t('admin.tabs.appointments');
            } else if (tab === 'services') {
                btn.textContent = this.t('admin.tabs.services');
            }
        });
        
        if (this.managers.appointments && typeof this.managers.appointments.refreshTranslations === 'function') {
            this.managers.appointments.refreshTranslations();
        }
        
        if (this.managers.services && typeof this.managers.services.refreshTranslations === 'function') {
            this.managers.services.refreshTranslations();
        }
        
        if (this.managers.modal && typeof this.managers.modal.refreshTranslations === 'function') {
            this.managers.modal.refreshTranslations();
        }
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
        
        document.addEventListener('languageChanged', () => {
            this.refreshTranslations();
        });
    }

    refreshTranslations() {
        this.updateTranslations();
    }

    async handleRefresh() {
        this.showLoading(true);
        await this.loadAllData();
        this.showLoading(false);
        this.showSuccess(this.t('admin.messages.refresh_success'));
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
            this.showError(this.t('admin.messages.access_denied'));
            window.location.href = 'home.html';
            return false;
        }
        return true;
    }

    handleBack() {
        window.location.href = 'home.html';
    }
}