class ServicesTabs {
    constructor() {
        this.categories = [];
        this.init();
    }

    async init() {
        await this.loadServices();
        this.initializeTabs();
        this.renderCategories();
    }

    async loadServices() {
        try {
            const response = await fetch('http://localhost:3000/services');
            const data = await response.json();
            this.categories = data.categories;
        } catch (error) {
            console.error('Error loading services:', error);
            alert('Ошибка загрузки услуг. Пожалуйста, проверьте подключение к серверу.');
        }
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

        tabsContainer.innerHTML = '';
        contentContainer.querySelectorAll('.category-content').forEach(el => el.remove());

        this.categories.forEach((category, index) => {
            const tabButton = document.createElement('button');
            tabButton.className = `tab-btn ${index === 0 ? 'active' : ''}`;
            tabButton.setAttribute('data-category', category.id);
            tabButton.textContent = category.name;
            tabsContainer.appendChild(tabButton);

            const categoryContent = document.createElement('div');
            categoryContent.className = `category-content ${index === 0 ? 'active' : ''}`;
            categoryContent.id = category.id;
            
            categoryContent.innerHTML = `
                <h2>${category.name}</h2>
                <p class="category-description">${category.description}</p>
                <div class="services-grid" id="services-${category.id}"></div>
            `;

            contentContainer.appendChild(categoryContent);
            this.renderServices(category.id, category.services);
        });

        this.initializeTabs();
    }

    renderServices(categoryId, services) {
        const servicesGrid = document.getElementById(`services-${categoryId}`);
        
        servicesGrid.innerHTML = services.map(service => `
            <div class="service-card ${service.popular ? 'popular' : ''}">
                ${service.popular ? '<span class="popular-badge">Популярно</span>' : ''}
                <h3>${service.name}</h3>
                <p class="service-description">${service.description}</p>
                <ul>
                    ${service.procedures.map(procedure => `<li>${procedure}</li>`).join('')}
                </ul>
                <div class="service-meta">
                    <div class="price">${service.priceUnit} ${service.price.toLocaleString()} ₽</div>
                    <div class="duration">${service.duration}</div>
                </div>
                <button class="service-btn" data-service="${service.id}">Записаться</button>
            </div>
        `).join('');

        this.addServiceButtonHandlers();
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
        if (!authManager.isAuthenticated()) {
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