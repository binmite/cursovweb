class ServicesTabs {
    constructor() {
        this.categories = [];
        this.i18n = window.i18nManager;
        this.localTranslations = {
            ru: {
                "popular": "Популярно",
                "currency": "₽",
                "book_button": "Записаться",
                "load_error": "Ошибка загрузки услуг. Пожалуйста, проверьте подключение к серверу.",
                "price_unit_from": "от",
                "price_unit_procedure": "за процедуру",
                "price_unit_session": "за сеанс",
                "price_unit_course": "за курс"
            },
            en: {
                "popular": "Popular",
                "currency": "RUB",
                "book_button": "Book Now",
                "load_error": "Error loading services. Please check your server connection.",
                "price_unit_from": "from",
                "price_unit_procedure": "per procedure",
                "price_unit_session": "per session",
                "price_unit_course": "per course"
            }
        };
        this.init();
    }

    lt(key) {
        return this.localTranslations[this.i18n.currentLang]?.[key] || key;
    }

    async init() {
        await this.loadServices();
        this.initializeTabs();
        this.renderCategories();
        this.bindLanguageChange();
    }

    async loadServices() {
        try {
            const response = await fetch('http://localhost:3000/services');
            const data = await response.json();
            this.categories = data.categories;
        } catch (error) {
            console.error('Error loading services:', error);
            this.showError(this.lt('load_error'));
        }
    }

    bindLanguageChange() {
        document.addEventListener('languageChanged', () => {
            this.renderCategories();
        });
    }

    showError(message) {
        alert(message);
    }

    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const categoryContents = document.querySelectorAll('.category-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                categoryContents.forEach(content => content.classList.remove('active'));
                
                button.classList.add('active');
                
                const targetContent = document.getElementById(category);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    renderCategories() {
        const tabsContainer = document.querySelector('.category-tabs');
        const contentContainer = document.querySelector('.services-categories .services-container');

        if (!tabsContainer || !contentContainer) return;

        tabsContainer.innerHTML = '';
        contentContainer.querySelectorAll('.category-content').forEach(el => el.remove());

        this.categories.forEach((category, index) => {
            const tabButton = this.createTabButton(category, index);
            tabsContainer.appendChild(tabButton);

            const categoryContent = this.createCategoryContent(category, index);
            contentContainer.appendChild(categoryContent);

            this.renderServices(category.id, category.services);
        });

        this.initializeTabs();
    }

    createTabButton(category, index) {
        const tabButton = document.createElement('button');
        tabButton.className = `tab-btn ${index === 0 ? 'active' : ''}`;
        tabButton.setAttribute('data-category', category.id);
        
        const categoryName = category.name[this.i18n.currentLang] || category.name;
        tabButton.textContent = categoryName;
        
        return tabButton;
    }

    createCategoryContent(category, index) {
        const categoryContent = document.createElement('div');
        categoryContent.className = `category-content ${index === 0 ? 'active' : ''}`;
        categoryContent.id = category.id;
        
        const categoryName = category.name[this.i18n.currentLang] || category.name;
        const categoryDescription = category.description[this.i18n.currentLang] || category.description;
        
        categoryContent.innerHTML = `
            <h2>${categoryName}</h2>
            <p class="category-description">${categoryDescription}</p>
            <div class="services-grid" id="services-${category.id}"></div>
        `;

        return categoryContent;
    }

    renderServices(categoryId, services) {
        const servicesGrid = document.getElementById(`services-${categoryId}`);
        if (!servicesGrid) return;
        
        servicesGrid.innerHTML = services.map(service => this.createServiceCard(service)).join('');
        this.addServiceButtonHandlers();
    }

    createServiceCard(service) {
        const serviceName = service.name[this.i18n.currentLang] || service.name;
        const serviceDescription = service.description[this.i18n.currentLang] || service.description;
        const procedures = service.procedures[this.i18n.currentLang] || service.procedures;
        
        return `
            <div class="service-card ${service.popular ? 'popular' : ''}">
                ${service.popular ? `<span class="popular-badge">${this.lt('popular')}</span>` : ''}
                <h3>${serviceName}</h3>
                <p class="service-description">${serviceDescription}</p>
                <ul>
                    ${Array.isArray(procedures) 
                        ? procedures.map(procedure => `<li>${procedure}</li>`).join('')
                        : procedures.split(',').map(procedure => `<li>${procedure.trim()}</li>`).join('')
                    }
                </ul>
                <div class="service-meta">
                    <div class="price">
                        ${service.priceUnit ? this.getLocalizedPriceUnit(service.priceUnit) + ' ' : ''}
                        ${service.price.toLocaleString()} ${this.lt('currency')}
                    </div>
                    <div class="duration">
                        ${service.duration[this.i18n.currentLang] || service.duration}
                    </div>
                </div>
                <button class="service-btn" data-service="${service.id}">
                    ${this.lt('book_button')}
                </button>
            </div>
        `;
    }

    getLocalizedPriceUnit(priceUnit) {
        const priceUnits = {
            'от': this.lt('price_unit_from'),
            'за процедуру': this.lt('price_unit_procedure'),
            'за сеанс': this.lt('price_unit_session'),
            'за курс': this.lt('price_unit_course')
        };
        
        return priceUnits[priceUnit] || priceUnit;
    }

    addServiceButtonHandlers() {
        document.querySelectorAll('.service-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const serviceId = e.target.getAttribute('data-service');
                this.handleServiceSelection(serviceId);
            });
        });
    }

    handleServiceSelection(serviceId) {
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            window.location.href = 'auth.html';
            return;
        }

        const service = this.findServiceById(serviceId);
        if (service) {
            localStorage.setItem('selectedService', JSON.stringify(service));
            window.location.href = 'appointment.html';
        }
    }

    findServiceById(serviceId) {
        for (const category of this.categories) {
            const service = category.services.find(s => s.id === serviceId);
            if (service) return service;
        }
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new ServicesTabs();
});