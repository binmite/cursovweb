function handleAppointmentButtonClick() {
    if (authManager.isAuthenticated()) {
        window.location.href = 'appointment.html';
    } else {
        window.location.href = 'auth.html';
    }
}

function resetSettings() {
    if (confirm('Вы уверены, что хотите сбросить все настройки? Это очистит все данные кроме текущей авторизации.')) {
        const currentUser = localStorage.getItem('currentUser');
        
        localStorage.clear();
        
        if (currentUser) {
            localStorage.setItem('currentUser', currentUser);
        }
        
        sessionStorage.clear();
        
        alert('Настройки сброшены. Текущая авторизация сохранена. Страница будет перезагружена.');
        
        window.location.reload();
    }
}

function updateNavigation() {
    const user = authManager.getCurrentUser();
    const nav = document.querySelector('.nav__menu');
    
    if (!nav) return;
    
    if (user) {
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info-nav';
        
        const isAdmin = user.role === 'admin' || user.email === 'admin@clinic.ru';
        
        userInfo.innerHTML = `
            <span class="user-name">${user.firstName} ${user.lastName}</span>
            ${isAdmin ? '<button class="admin-nav-btn">Админ панель</button>' : ''}
            <button class="reset-settings-btn">Сбросить настройки</button>
            <button class="logout-nav-btn">Выйти</button>
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

document.addEventListener('DOMContentLoaded', function() {
    const appointmentButton = document.querySelector('.nav__button');
    if (appointmentButton) {
        appointmentButton.addEventListener('click', handleAppointmentButtonClick);
    }
    
    updateNavigation();
});