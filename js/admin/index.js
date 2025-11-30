import { AdminPanel } from './AdminPanel.js';

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.admin-container')) {
        new AdminPanel();
    }
});