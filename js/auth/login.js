class LoginForm {
    constructor() {
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
        this.loginBtn.textContent = this.i18n.t('auth.login_button');
        
        this.validateLoginEmail();
        this.validateLoginPassword();
    }

    initializeElements() {
        this.form = document.getElementById('loginForm');
        this.loginEmailInput = document.getElementById('loginEmail');
        this.loginPasswordInput = document.getElementById('loginPassword');
        this.loginBtn = this.form.querySelector('.auth-btn');
        
        this.errorElements = {
            loginEmail: document.getElementById('loginEmailError'),
            loginPassword: document.getElementById('loginPasswordError')
        };
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.loginEmailInput.addEventListener('input', () => this.validateLoginEmail());
        this.loginPasswordInput.addEventListener('input', () => this.validateLoginPassword());
    }

    validateLoginEmail() {
        const value = this.loginEmailInput.value.trim();
        
        if (!value) {
            this.showError('loginEmail', this.i18n.t('validation.required'));
            return false;
        }
        
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const isPhone = /^\+375(25|29|33|44)\d{7}$/.test(value.replace(/\D/g, ''));
        
        if (!isEmail && !isPhone) {
            this.showError('loginEmail', this.i18n.t('validation.invalid_login'));
            return false;
        }
        
        this.hideError('loginEmail');
        return true;
    }

    validateLoginPassword() {
        const password = this.loginPasswordInput.value;
        
        if (!password) {
            this.showError('loginPassword', this.i18n.t('validation.required'));
            return false;
        }
        
        this.hideError('loginPassword');
        return true;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateLoginEmail() || !this.validateLoginPassword()) {
            return;
        }
        
        const loginData = {
            login: this.loginEmailInput.value.trim(),
            password: this.loginPasswordInput.value
        };
        
        try {
            const user = await this.authenticateUser(loginData);
            if (user) {
                authManager.setUser(user);
                
                alert(this.i18n.t('auth.login_success'));
                
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);
                
            } else {
                this.showError('loginPassword', this.i18n.t('auth.login_failed'));
            }
        } catch (error) {
            console.error('Login error:', error);
            alert(this.i18n.t('auth.connection_error'));
        }
    }

    async authenticateUser(loginData) {
        const response = await fetch('http://localhost:3000/users');
        const users = await response.json();
        
        const user = users.find(u => {
            const isEmailMatch = u.email === loginData.login;
            const isPhoneMatch = u.phone === loginData.login;
            const isPasswordMatch = u.password === loginData.password;
            
            return (isEmailMatch || isPhoneMatch) && isPasswordMatch;
        });
        
        return user || null;
    }

    showError(field, message) {
        this.errorElements[field].textContent = message;
    }

    hideError(field) {
        this.errorElements[field].textContent = '';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('loginForm')) {
        new LoginForm();
    }
});