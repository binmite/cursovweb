class AuthTabs {
    constructor() {
        this.tabs = document.querySelectorAll('.auth-tab');
        this.contents = document.querySelectorAll('.auth-content');
        this.init();
    }

    init() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target));
        });
    }

    switchTab(clickedTab) {
        const tabName = clickedTab.getAttribute('data-tab');
        
        this.tabs.forEach(tab => tab.classList.remove('active'));
        this.contents.forEach(content => content.classList.remove('active'));
        
        clickedTab.classList.add('active');
        document.getElementById(tabName === 'login' ? 'loginForm' : 'registrationForm').classList.add('active');
        
        this.clearErrors();
        
        this.resetForms();
    }

    clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
    }

    resetForms() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.reset();
        }
        
        const registrationForm = document.getElementById('registrationForm');
        if (registrationForm) {
            const username = document.getElementById('username')?.value;
            const autoPassword = document.getElementById('autoPassword')?.value;
            
            registrationForm.reset();
            
            if (username && document.getElementById('username')) {
                document.getElementById('username').value = username;
            }
            if (autoPassword && document.getElementById('autoPassword')) {
                document.getElementById('autoPassword').value = autoPassword;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.auth-tabs')) {
        new AuthTabs();
    }
});