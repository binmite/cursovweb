class AccessibilityManager {
    constructor() {
        this.settings = {
            fontSize: 'medium',
            colorScheme: 'default',
            imagesEnabled: true
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.applySettings();
        this.bindEvents();
    }
    
    loadSettings() {
        const saved = localStorage.getItem('accessibilitySettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
    
    saveSettings() {
        localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
    }
    
    applySettings() {
        document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
        document.body.classList.add(`font-size-${this.settings.fontSize}`);
        
        document.body.classList.remove(
            'scheme-black-white', 
            'scheme-black-green', 
            'scheme-beige-brown', 
            'scheme-blue-darkblue'
        );
        
        if (this.settings.colorScheme !== 'default') {
            document.body.classList.add(`scheme-${this.settings.colorScheme}`);
            document.body.classList.add('accessibility-mode');
        } else {
            document.body.classList.remove('accessibility-mode');
        }
        
        if (this.settings.imagesEnabled) {
            document.body.classList.remove('images-disabled');
        } else {
            document.body.classList.add('images-disabled');
        }
        
        this.updateUI();
    }
    
    updateUI() {
        document.querySelectorAll('.font-size-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === this.settings.fontSize);
        });
        
        document.querySelectorAll('.color-scheme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scheme === this.settings.colorScheme);
        });
        
        const imagesToggle = document.getElementById('imagesToggle');
        if (imagesToggle) {
            imagesToggle.checked = this.settings.imagesEnabled;
        }
    }
    
    bindEvents() {
        document.querySelector('.header-top-block button').addEventListener('click', () => {
            this.openModal();
        });

        document.querySelector('.accessibility-modal__close').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('accessibilityModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });
        
        document.querySelectorAll('.font-size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.settings.fontSize = btn.dataset.size;
                this.applySettings();
            });
        });
        
        document.querySelectorAll('.color-scheme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.settings.colorScheme = btn.dataset.scheme;
                this.applySettings();
            });
        });
        
        document.getElementById('imagesToggle').addEventListener('change', (e) => {
            this.settings.imagesEnabled = e.target.checked;
            this.applySettings();
        });
        
        document.querySelector('.reset-settings-btn').addEventListener('click', () => {
            this.resetSettings();
        });
        
        document.querySelector('.apply-settings-btn').addEventListener('click', () => {
            this.saveSettings();
            this.closeModal();
        });
        
        this.bindQuickAccess();
    }
    
    bindQuickAccess() {
        document.querySelector('[data-action="increase-font"]').addEventListener('click', () => {
            const sizes = ['small', 'medium', 'large'];
            const currentIndex = sizes.indexOf(this.settings.fontSize);
            if (currentIndex < sizes.length - 1) {
                this.settings.fontSize = sizes[currentIndex + 1];
                this.applySettings();
                this.saveSettings();
            }
        });
        
        document.querySelector('[data-action="decrease-font"]').addEventListener('click', () => {
            const sizes = ['small', 'medium', 'large'];
            const currentIndex = sizes.indexOf(this.settings.fontSize);
            if (currentIndex > 0) {
                this.settings.fontSize = sizes[currentIndex - 1];
                this.applySettings();
                this.saveSettings();
            }
        });
        
        document.querySelector('[data-action="toggle-contrast"]').addEventListener('click', () => {
            const schemes = ['default', 'black-white', 'black-green', 'beige-brown', 'blue-darkblue'];
            const currentIndex = schemes.indexOf(this.settings.colorScheme);
            const nextIndex = (currentIndex + 1) % schemes.length;
            this.settings.colorScheme = schemes[nextIndex];
            this.applySettings();
            this.saveSettings();
        });
        
        document.querySelector('[data-action="toggle-images"]').addEventListener('click', () => {
            this.settings.imagesEnabled = !this.settings.imagesEnabled;
            this.applySettings();
            this.saveSettings();
        });
    }
    
    openModal() {
        document.getElementById('accessibilityModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        document.getElementById('accessibilityModal').style.display = 'none';
        document.body.style.overflow = '';
    }
    
    resetSettings() {
        this.settings = {
            fontSize: 'medium',
            colorScheme: 'default',
            imagesEnabled: true
        };
        this.applySettings();
        localStorage.removeItem('accessibilitySettings');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.accessibilityManager = new AccessibilityManager();
});