import { AdminPanel } from './AdminPanel.js';

// Инициализация админ-панели
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.admin-container')) {
        new AdminPanel();
    }
});