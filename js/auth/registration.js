class RegistrationForm {
    constructor() {
        this.i18n = window.i18nManager;
        this.initializeElements();
        this.initializeEventListeners();
        this.attemptsCount = 0;
        this.maxAttempts = 5;
        this.commonPasswords = this.getCommonPasswords();
        this.bindLanguageChange();
    }

    bindLanguageChange() {
        document.addEventListener('languageChanged', () => {
            this.updateTranslations();
        });
    }

    updateTranslations() {
        this.generateBtn.textContent = this.i18n.t('auth.generate_username');
        this.copyBtn.textContent = this.i18n.t('auth.copy_password');
        this.registerBtn.textContent = this.i18n.t('auth.register_button');
        
        this.attemptsCounter.textContent = this.attemptsCount;
        
        document.querySelectorAll('input[name="passwordType"]').forEach((radio, index) => {
            const label = radio.closest('.radio-label');
            if (label) {
                const span = label.querySelector('span');
                if (span) {
                    span.textContent = index === 0 ? this.i18n.t('auth.auto_password') : this.i18n.t('auth.manual_password');
                }
            }
        });
        
        const autoPasswordLabel = document.querySelector('.auto-password-group label');
        if (autoPasswordLabel) {
            autoPasswordLabel.textContent = this.i18n.t('auth.auto_password_label');
        }
        
        this.validateForm();
    }

    initializeElements() {
        this.form = document.getElementById('registrationForm');
        this.phoneInput = document.getElementById('phone');
        this.emailInput = document.getElementById('email');
        this.birthDateInput = document.getElementById('birthDate');
        this.lastNameInput = document.getElementById('lastName');
        this.firstNameInput = document.getElementById('firstName');
        this.middleNameInput = document.getElementById('middleName');
        this.usernameInput = document.getElementById('username');
        this.generateBtn = document.getElementById('generateUsername');
        this.attemptsCounter = document.getElementById('attemptsCount');
        this.passwordTypeRadios = document.querySelectorAll('input[name="passwordType"]');
        this.autoPasswordGroup = document.querySelector('.auto-password-group');
        this.manualPasswordGroups = document.querySelectorAll('.manual-password-group');
        this.autoPasswordInput = document.getElementById('autoPassword');
        this.copyBtn = document.getElementById('copyPassword');
        this.passwordInput = document.getElementById('password');
        this.confirmPasswordInput = document.getElementById('confirmPassword');
        this.agreementCheckbox = document.getElementById('agreement');
        this.registerBtn = document.getElementById('registerBtn');
        
        this.errorElements = {
            phone: document.getElementById('phoneError'),
            email: document.getElementById('emailError'),
            birthDate: document.getElementById('birthDateError'),
            username: document.getElementById('usernameError'),
            password: document.getElementById('passwordError'),
            confirmPassword: document.getElementById('confirmPasswordError'),
            agreement: document.getElementById('agreementError')
        };
    }

    initializeEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateUsername());
        this.passwordTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => this.togglePasswordType(e.target.value));
        });
        this.copyBtn.addEventListener('click', () => this.copyPassword());
        this.phoneInput.addEventListener('input', () => this.validatePhone());
        this.emailInput.addEventListener('input', () => this.validateEmail());
        this.birthDateInput.addEventListener('input', () => this.validateBirthDate());
        this.usernameInput.addEventListener('input', () => this.validateUsername());
        this.passwordInput.addEventListener('input', () => this.validatePassword());
        this.confirmPasswordInput.addEventListener('input', () => this.validateConfirmPassword());
        this.agreementCheckbox.addEventListener('change', () => this.validateAgreement());
        this.form.addEventListener('input', () => this.validateForm());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        this.generateUsername();
        this.generateAutoPassword();
    }

    validateForm() {
        const validations = [
            this.validatePhone(),
            this.validateEmail(),
            this.validateBirthDate(),
            this.validateUsername(),
            this.validatePassword(),
            this.validateConfirmPassword(),
            this.validateAgreement()
        ];
        
        const isValid = validations.every(valid => valid);
        this.registerBtn.disabled = !isValid;
        
        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) return;
        
        const formData = {
            id: Date.now(),
            role: 'user', 
            phone: this.phoneInput.value,
            email: this.emailInput.value,
            birthDate: this.birthDateInput.value,
            lastName: this.lastNameInput.value,
            firstName: this.firstNameInput.value,
            middleName: this.middleNameInput.value,
            username: this.usernameInput.value,
            password: document.querySelector('input[name="passwordType"]:checked').value === 'auto' 
                     ? this.autoPasswordInput.value 
                     : this.passwordInput.value,
            registrationDate: new Date().toISOString(),
            isActive: true
        };
        
        try {
            const response = await this.sendToServer(formData);
            if (response.id) { 
                authManager.setUser(formData);
                
                alert(this.i18n.t('auth.registration_success'));
                
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 2000);
                
            } else {
                alert(this.i18n.t('auth.registration_failed'));
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert(this.i18n.t('auth.connection_error'));
        }
    }

    validatePhone() {
        const phone = this.phoneInput.value.replace(/\D/g, '');
        const belarusPattern = /^(375)(25|29|33|44)(\d{7})$/;
        
        if (!phone) {
            this.showError('phone', this.i18n.t('validation.required'));
            return false;
        }
        
        if (!belarusPattern.test(phone)) {
            this.showError('phone', this.i18n.t('validation.invalid_phone'));
            return false;
        }
        
        this.hideError('phone');
        return true;
    }

    validateEmail() {
        const email = this.emailInput.value;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showError('email', this.i18n.t('validation.required'));
            return false;
        }
        
        if (!emailPattern.test(email)) {
            this.showError('email', this.i18n.t('validation.invalid_email'));
            return false;
        }
        
        this.hideError('email');
        return true;
    }

    validateBirthDate() {
        const birthDate = new Date(this.birthDateInput.value);
        const today = new Date();
        const minAgeDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
        
        if (!this.birthDateInput.value) {
            this.showError('birthDate', this.i18n.t('validation.required'));
            return false;
        }
        
        if (birthDate > minAgeDate) {
            this.showError('birthDate', this.i18n.t('validation.invalid_birth_date'));
            return false;
        }
        
        this.hideError('birthDate');
        return true;
    }

    generateUsername() {
        if (this.attemptsCount >= this.maxAttempts) {
            this.usernameInput.removeAttribute('readonly');
            this.generateBtn.disabled = true;
            this.generateBtn.textContent = this.i18n.t('auth.enter_manually');
            return;
        }
        
        const adjectives = this.i18n.currentLang === 'ru' 
            ? ['Крутой', 'Веселый', 'Серьезный', 'Яркий', 'Смелый', 'Умный', 'Быстрый', 'Сильный']
            : ['Cool', 'Funny', 'Serious', 'Bright', 'Brave', 'Smart', 'Fast', 'Strong'];
        
        const nouns = this.i18n.currentLang === 'ru'
            ? ['Тигр', 'Орел', 'Волк', 'Дракон', 'Феникс', 'Единорог', 'Лев', 'Сокол']
            : ['Tiger', 'Eagle', 'Wolf', 'Dragon', 'Phoenix', 'Unicorn', 'Lion', 'Falcon'];
        
        const numbers = Math.floor(Math.random() * 1000);
        
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        
        const username = `${adjective}${noun}${numbers}`;
        this.usernameInput.value = username;
        this.attemptsCount++;
        this.attemptsCounter.textContent = this.attemptsCount;
        
        this.validateUsername();
    }

    validateUsername() {
        const username = this.usernameInput.value;
        
        if (!username) {
            this.showError('username', this.i18n.t('validation.required'));
            return false;
        }
        
        if (username.length < 3) {
            this.showError('username', this.i18n.t('validation.username_too_short'));
            return false;
        }
        
        this.hideError('username');
        return true;
    }

    togglePasswordType(type) {
        if (type === 'auto') {
            this.autoPasswordGroup.style.display = 'flex';
            this.manualPasswordGroups.forEach(group => group.style.display = 'none');
            this.generateAutoPassword();
        } else {
            this.autoPasswordGroup.style.display = 'none';
            this.manualPasswordGroups.forEach(group => group.style.display = 'block');
            this.passwordInput.value = '';
            this.confirmPasswordInput.value = '';
        }
        this.validateForm();
    }

    generateAutoPassword() {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        
        password += this.getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        password += this.getRandomChar('abcdefghijklmnopqrstuvwxyz');
        password += this.getRandomChar('0123456789');
        password += this.getRandomChar('!@#$%^&*');
        
        for (let i = 4; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        password = password.split('').sort(() => 0.5 - Math.random()).join('');
        this.autoPasswordInput.value = password;
    }

    getRandomChar(charset) {
        return charset.charAt(Math.floor(Math.random() * charset.length));
    }

    copyPassword() {
        const password = this.autoPasswordInput.value;
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(password)
                .then(() => {
                    this.copyBtn.textContent = this.i18n.t('auth.password_copied');
                    setTimeout(() => {
                        this.copyBtn.textContent = this.i18n.t('auth.copy_password');
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    this.fallbackCopy(password);
                });
        } else {
            this.fallbackCopy(password);
        }
    }

    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.copyBtn.textContent = this.i18n.t('auth.password_copied');
                setTimeout(() => {
                    this.copyBtn.textContent = this.i18n.t('auth.copy_password');
                }, 2000);
            } else {
                this.showCopyError();
            }
        } catch (err) {
            console.error('Fallback copy failed: ', err);
            this.showCopyError();
        } finally {
            document.body.removeChild(textArea);
        }
    }

    showCopyError() {
        this.copyBtn.textContent = this.i18n.t('auth.copy_error');
        this.copyBtn.style.background = '#e74c3c';
        
        setTimeout(() => {
            this.copyBtn.textContent = this.i18n.t('auth.copy_password');
            this.copyBtn.style.background = '#27ae60';
        }, 2000);
    }

    validatePassword() {
        const password = this.passwordInput.value;
        const passwordType = document.querySelector('input[name="passwordType"]:checked').value;
        
        if (passwordType === 'auto') return true;
        
        if (!password) {
            this.showError('password', this.i18n.t('validation.required'));
            return false;
        }
        
        if (password.length < 8 || password.length > 20) {
            this.showError('password', this.i18n.t('validation.password_length'));
            return false;
        }
        
        if (!/(?=.*[a-z])/.test(password)) {
            this.showError('password', this.i18n.t('validation.password_lowercase'));
            return false;
        }
        
        if (!/(?=.*[A-Z])/.test(password)) {
            this.showError('password', this.i18n.t('validation.password_uppercase'));
            return false;
        }
        
        if (!/(?=.*\d)/.test(password)) {
            this.showError('password', this.i18n.t('validation.password_number'));
            return false;
        }
        
        if (!/(?=.*[!@#$%^&*])/.test(password)) {
            this.showError('password', this.i18n.t('validation.password_special'));
            return false;
        }
        
        if (this.commonPasswords.includes(password.toLowerCase())) {
            this.showError('password', this.i18n.t('validation.password_common'));
            return false;
        }
        
        this.hideError('password');
        return true;
    }

    validateConfirmPassword() {
        const password = this.passwordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        const passwordType = document.querySelector('input[name="passwordType"]:checked').value;
        
        if (passwordType === 'auto') return true;
        
        if (!confirmPassword) {
            this.showError('confirmPassword', this.i18n.t('validation.required'));
            return false;
        }
        
        if (password !== confirmPassword) {
            this.showError('confirmPassword', this.i18n.t('validation.passwords_not_match'));
            return false;
        }
        
        this.hideError('confirmPassword');
        return true;
    }

    validateAgreement() {
        if (!this.agreementCheckbox.checked) {
            this.showError('agreement', this.i18n.t('validation.agreement_required'));
            return false;
        }
        
        this.hideError('agreement');
        return true;
    }

    async sendToServer(data) {
        const response = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    }

    getCommonPasswords() {
        return [
            'password', '123456', '12345678', '123456789', '12345',
            'qwerty', 'abc123', 'password1', '1234567', '1234567890',
            'admin', 'welcome', 'monkey', 'login', 'passw0rd'
        ];
    }

    showError(field, message) {
        this.errorElements[field].textContent = message;
    }

    hideError(field) {
        this.errorElements[field].textContent = '';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('registrationForm')) {
        new RegistrationForm();
    }
});