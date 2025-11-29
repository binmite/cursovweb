export class UsersManager {
    constructor(adminPanel) {
        this.adminPanel = adminPanel;
        this.users = [];
        this.currentUser = null;
        
        this.initializeElements();
    }

    initializeElements() {
        this.usersTableBody = document.getElementById('usersTableBody');
        this.addUserBtn = document.getElementById('addUserBtn');
        
        if (this.addUserBtn) {
            this.addUserBtn.style.display = 'none';
        }
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        if (this.addUserBtn) {
            this.addUserBtn.addEventListener('click', () => this.openUserModal());
        }
    }

    async loadUsers() {
        try {
            const response = await fetch('http://localhost:3000/users');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.users = await response.json();
            console.log('✅ Users loaded:', this.users);
            this.renderUsers();
        } catch (error) {
            console.error('Error loading users:', error);
            throw error;
        }
    }

    renderUsers() {
        if (!this.usersTableBody) return;
        
        this.usersTableBody.innerHTML = '';
        
        if (this.users.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7">
                    <div class="empty-state">
                        <h3>Пользователи не найдены</h3>
                    </div>
                </td>
            `;
            this.usersTableBody.appendChild(row);
            return;
        }
        
        this.users.forEach(user => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.phone || '-'}</td>
                <td>
                    <span class="status-badge ${user.role === 'admin' ? 'status-confirmed' : 'status-pending'}">
                        ${user.role}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-edit" data-id="${user.id}" data-action="edit">Изменить роль</button>
                        ${user.role !== 'admin' ? `
                            <button class="action-btn btn-delete" data-id="${user.id}" data-action="delete">Удалить</button>
                        ` : ''}
                    </div>
                </td>
            `;
            
            this.usersTableBody.appendChild(row);
        });
        
        this.addActionHandlers();
    }

    addActionHandlers() {
        const buttons = this.usersTableBody.querySelectorAll('.action-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.getAttribute('data-id');
                const action = e.target.getAttribute('data-action');
                this.handleAction(userId, action);
            });
        });
    }

    handleAction(userId, action) {
        console.log('🔄 Handling action:', action, 'for user ID:', userId, 'Type:', typeof userId);
        
        const userAsNumber = this.users.find(u => u.id === Number(userId));
        const userAsString = this.users.find(u => u.id == userId); 
        const userExact = this.users.find(u => u.id === userId);
        
        console.log('Search results:', {
            asNumber: userAsNumber,
            asString: userAsString,
            exact: userExact
        });
        
        const user = userAsNumber || userAsString || userExact;
        
        if (!user) {
            this.adminPanel.showError('Пользователь не найден');
            return;
        }
        
        this.currentUser = user;
        
        if (action === 'edit') {
            this.adminPanel.managers.modal.openUserModal('edit', user);
        } else if (action === 'delete') {
            if (user.role === 'admin') {
                this.adminPanel.showError('Нельзя удалить администратора');
                return;
            }
            this.deleteUser();
        }
    }

async saveUser(userData, currentUser) {
    try {
        this.adminPanel.showLoading(true);
        console.log('💾 Saving user role:', currentUser.id, 'New role:', userData.role);

        const response = await fetch('http://localhost:3000/users');
        if (!response.ok) throw new Error(`Failed to load users: ${response.status}`);
        const allUsers = await response.json();

        const updatedUsers = allUsers.map(user => 
            user.id === currentUser.id ? { ...user, role: userData.role } : user
        );

        const updateResponse = await fetch('http://localhost:3000/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUsers)
        });

        if (!updateResponse.ok) {
            throw new Error(`Failed to save users: ${updateResponse.status}`);
        }

        console.log('✅ Users updated successfully');
        await this.loadUsers(); 
        this.adminPanel.showSuccess('Роль пользователя успешно обновлена!');

    } catch (error) {
        console.error('❌ Error saving user:', error);
        this.adminPanel.showError(`Ошибка при сохранении: ${error.message}`);
    } finally {
        this.adminPanel.showLoading(false);
    }
}

    async deleteUser() {
        if (!this.currentUser) return;
        
        if (this.currentUser.role === 'admin') {
            this.adminPanel.showError('Нельзя удалить администратора');
            return;
        }
        
        if (confirm(`Удалить пользователя "${this.currentUser.firstName} ${this.currentUser.lastName}"?`)) {
            try {
                this.adminPanel.showLoading(true);
                
                const response = await fetch(`http://localhost:3000/users/${this.currentUser.id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                await this.loadUsers();
                this.adminPanel.showSuccess('Пользователь удален!');
                
            } catch (error) {
                console.error('Error deleting user:', error);
                this.adminPanel.showError('Ошибка при удалении пользователя.');
            } finally {
                this.adminPanel.showLoading(false);
            }
        }
    }

    async testUserEndpoint(userId) {
        try {
            console.log('🧪 Testing endpoint for user ID:', userId);
            const response = await fetch(`http://localhost:3000/users/${userId}`);
            console.log('Test response:', response.status, response.statusText);
            
            if (response.ok) {
                const user = await response.json();
                console.log('User found:', user);
            } else {
                console.log('User not found');
            }
        } catch (error) {
            console.error('Test error:', error);
        }
    }
}