function handleAppointmentButtonClick() {
    if (authManager.isAuthenticated()) {
        window.location.href = 'appointment.html';
    } else {
        window.location.href = 'auth.html';
    }
}

function updateNavigation() {
    const user = authManager.getCurrentUser();
    const nav = document.querySelector('.nav__menu');
    
    if (!nav) return;
    
    if (user) {
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info-nav';
        userInfo.innerHTML = `
            <span class="user-name">${user.firstName} ${user.lastName}</span>
            <button class="logout-nav-btn">Выйти</button>
        `;
        
        const oldUserInfo = document.querySelector('.user-info-nav');
        if (oldUserInfo) {
            oldUserInfo.remove();
        }
        
        nav.appendChild(userInfo);
        
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