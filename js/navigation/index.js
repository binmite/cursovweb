function handleAppointmentButtonClick() {
    if (authManager.isAuthenticated()) {
        window.location.href = 'appointment.html';
    } else {
        window.location.href = 'auth.html';
    }
}

function resetSettings() {
    const i18n = window.i18nManager;
    const confirmMessage = i18n.t('user.reset_confirm');
    const successMessage = i18n.t('user.reset_success');
    
    if (confirm(confirmMessage)) {
        const currentUser = localStorage.getItem('currentUser');
        
        localStorage.clear();
        
        if (currentUser) {
            localStorage.setItem('currentUser', currentUser);
        }
        
        sessionStorage.clear();
        
        alert(successMessage);
        
        window.location.reload();
    }
}

function updateNavigation() {
    const i18n = window.i18nManager;
    const user = authManager.getCurrentUser();
    const nav = document.querySelector('.nav__menu');
    
    if (!nav) return;
    
    if (user) {
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info-nav';
        
        const isAdmin = user.role === 'admin' || user.email === 'admin@clinic.ru';
        
        userInfo.innerHTML = `
            <span class="user-name">${user.firstName} ${user.lastName}</span>
            ${isAdmin ? `<button class="admin-nav-btn">${i18n.t('user.admin_panel')}</button>` : ''}
            <button class="logout-nav-btn">${i18n.t('user.logout')}</button>
        `;
        
        const oldUserInfo = document.querySelector('.user-info-nav');
        if (oldUserInfo) {
            oldUserInfo.remove();
        }
        
        nav.appendChild(userInfo);
        
        const adminBtn = document.querySelector('.admin-nav-btn');
        if (adminBtn) {
            adminBtn.addEventListener('click', function() {
                window.location.href = 'admin.html';
            });
        }
        
        const resetBtn = document.querySelector('.reset-settings-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetSettings);
        }
        
        document.querySelector('.logout-nav-btn').addEventListener('click', function() {
            authManager.logout();
            window.location.reload();
        });
    } else {
        const oldUserInfo = document.querySelector('.user-info-nav');
        if (oldUserInfo) {
            oldUserInfo.remove();
        }
    }
}

function bindLanguageChange() {
    document.addEventListener('languageChanged', () => {
        updateNavigation();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const appointmentButton = document.querySelector('.nav__button');
    if (appointmentButton) {
        appointmentButton.addEventListener('click', handleAppointmentButtonClick);
    }
    
    updateNavigation();
    bindLanguageChange();
});