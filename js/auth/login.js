class LoginForm {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
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
            this.showError('loginEmail', 'Email или телефон обязателен');
            return false;
        }
        
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const isPhone = /^\+375(25|29|33|44)\d{7}$/.test(value.replace(/\D/g, ''));
        
        if (!isEmail && !isPhone) {
            this.showError('loginEmail', 'Введите корректный email или номер телефона');
            return false;
        }
        
        this.hideError('loginEmail');
        return true;
    }

    validateLoginPassword() {
        const password = this.loginPasswordInput.value;
        
        if (!password) {
            this.showError('loginPassword', 'Пароль обязателен');
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
                
                alert('Вход выполнен успешно!');
                
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);
                
            } else {
                this.showError('loginPassword', 'Неверный email/телефон или пароль');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Ошибка соединения с сервером');
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