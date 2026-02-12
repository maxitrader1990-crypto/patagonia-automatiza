/* ==========================================
   SUPER ADMIN - USERS MANAGEMENT
   ========================================== */

let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
const usersPerPage = 10;

// Cargar todos los usuarios
async function loadUsers() {
    try {
        console.log('👥 Cargando usuarios...');

        const { data: users, error } = await supabase
            .from('clientes')
            .select('*')
            .order('fecha_registro', { ascending: false });

        if (error) throw error;

        allUsers = users;
        filteredUsers = users;

        // Actualizar stats
        updateUserStats(users);

        // Renderizar tabla
        renderUsersTable();

    } catch (error) {
        console.error('❌ Error cargando usuarios:', error);
        toast.error('Error al cargar usuarios');
    }
}

// Actualizar estadísticas
function updateUserStats(users) {
    document.getElementById('total-users-count').textContent = users.length;
    document.getElementById('active-users-count').textContent = users.length; // Todos activos por ahora

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const newThisMonth = users.filter(u => {
        const regDate = new Date(u.fecha_registro);
        return regDate.getMonth() === currentMonth && regDate.getFullYear() === currentYear;
    }).length;

    document.getElementById('new-users-month').textContent = newThisMonth;
}

// Renderizar tabla de usuarios
async function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    const start = (currentPage - 1) * usersPerPage;
    const end = start + usersPerPage;
    const usersToShow = filteredUsers.slice(start, end);

    if (usersToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--gray); padding: 3rem;">No se encontraron usuarios</td></tr>';
        return;
    }

    // Obtener servicios de cada usuario
    const usersWithServices = await Promise.all(usersToShow.map(async (user) => {
        const { data: services } = await supabase
            .from('servicios')
            .select('id, tipo')
            .eq('cliente_id', user.id);

        return {
            ...user,
            services: services || []
        };
    }));

    tbody.innerHTML = usersWithServices.map(user => `
        <tr style="cursor: pointer;" onclick="viewUser('${user.id}')">
            <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem;">
                        ${getInitials(user.nombre || user.email)}
                    </div>
                    <strong>${user.nombre || 'Sin nombre'}</strong>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${user.telefono || '-'}</td>
            <td>${user.empresa || '-'}</td>
            <td>${new Date(user.fecha_registro).toLocaleDateString('es-AR')}</td>
            <td><span class="badge badge-info">${user.services.length}</span></td>
            <td><span class="badge badge-success">Activo</span></td>
            <td onclick="event.stopPropagation();">
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-sm btn-secondary" onclick="viewUser('${user.id}')">Ver</button>
                    <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">Editar</button>
                </div>
            </td>
        </tr>
    `).join('');

    // Actualizar información de paginación
    document.getElementById('showing-count').textContent = usersToShow.length;
    document.getElementById('total-count').textContent = filteredUsers.length;

    renderPagination();
}

// Obtener iniciales del nombre
function getInitials(name) {
    if (!name) return 'XX';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Renderizar paginación
function renderPagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginationDiv = document.getElementById('pagination-controls');

    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }

    let html = '<div style="display: flex; gap: 0.5rem;">';

    // Botón anterior
    html += `<button class="btn btn-sm btn-secondary" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>←</button>`;

    // Páginas
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        html += `<button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-secondary'}" onclick="changePage(${i})">${i}</button>`;
    }

    // Botón siguiente
    html += `<button class="btn btn-sm btn-secondary" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>→</button>`;

    html += '</div>';
    paginationDiv.innerHTML = html;
}

// Cambiar página
function changePage(page) {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderUsersTable();
}

// Buscar usuarios
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-users');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filteredUsers = allUsers.filter(user =>
                (user.nombre && user.nombre.toLowerCase().includes(query)) ||
                (user.email && user.email.toLowerCase().includes(query)) ||
                (user.empresa && user.empresa.toLowerCase().includes(query))
            );
            currentPage = 1;
            renderUsersTable();
        });
    }
});

// Ver usuario
async function viewUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('modal-title').textContent = 'Detalles del Usuario';
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-nombre').value = user.nombre || '';
    document.getElementById('user-email').value = user.email || '';
    document.getElementById('user-telefono').value = user.telefono || '';
    document.getElementById('user-empresa').value = user.empresa || '';

    // Cargar servicios
    const { data: services } = await supabase
        .from('servicios')
        .select('*')
        .eq('cliente_id', userId);

    const servicesList = document.getElementById('services-list');
    if (services && services.length > 0) {
        servicesList.innerHTML = services.map(s => `
            <div style="padding: 0.75rem; background: var(--dark-alt); border-radius: 8px; margin-bottom: 0.5rem;">
                <div style="display: flex; justify-content: space-between;">
                    <strong>${s.tipo}</strong>
                    <span class="badge badge-${s.estado === 'activo' ? 'success' : 'warning'}">${s.estado}</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--gray); margin-top: 0.25rem;">${s.descripcion || 'Sin descripción'}</div>
            </div>
        `).join('');
    } else {
        servicesList.innerHTML = '<p style="color: var(--gray);">No tiene servicios contratados</p>';
    }

    showUserModal();
}

// Editar usuario
function editUser(userId) {
    viewUser(userId);
}

// Mostrar modal
function showUserModal() {
    const modal = document.getElementById('user-modal');
    modal.style.display = 'flex';
}

// Cerrar modal
function closeUserModal() {
    const modal = document.getElementById('user-modal');
    modal.style.display = 'none';
}

// Mostrar modal agregar usuario
function showAddUserModal() {
    toast.info('Funcionalidad de agregar usuario próximamente');
}

// Guardar cambios de usuario
document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('user-id').value;
    const nombre = document.getElementById('user-nombre').value;
    const email = document.getElementById('user-email').value;
    const telefono = document.getElementById('user-telefono').value;
    const empresa = document.getElementById('user-empresa').value;

    try {
        const { error } = await supabase
            .from('clientes')
            .update({ nombre, email, telefono, empresa })
            .eq('id', userId);

        if (error) throw error;

        toast.success('Usuario actualizado correctamente');
        closeUserModal();
        loadUsers();

    } catch (error) {
        console.error('Error actualizando usuario:', error);
        toast.error('Error al actualizar usuario');
    }
});

// Enviar notificación a usuario
async function sendNotificationToUser() {
    const userId = document.getElementById('user-id').value;
    toast.info('Funcionalidad de enviar notificación próximamente');
}

// Exportar usuarios a CSV
function exportUsers() {
    const csv = [
        ['Nombre', 'Email', 'Teléfono', 'Empresa', 'Fecha Registro'],
        ...allUsers.map(u => [
            u.nombre || '',
            u.email || '',
            u.telefono || '',
            u.empresa || '',
            new Date(u.fecha_registro).toLocaleDateString('es-AR')
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Usuarios exportados correctamente');
}

// Exportar funciones
if (typeof window !== 'undefined') {
    window.loadUsers = loadUsers;
    window.viewUser = viewUser;
    window.editUser = editUser;
    window.showAddUserModal = showAddUserModal;
    window.showUserModal = showUserModal;
    window.closeUserModal = closeUserModal;
    window.sendNotificationToUser = sendNotificationToUser;
    window.exportUsers = exportUsers;
    window.changePage = changePage;
}
