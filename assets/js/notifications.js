/* assets/js/notifications.js */

// ==========================================
// SISTEMA DE NOTIFICACIONES
// ==========================================

let notificationDropdown = null;
let notificationBell = null;
let notificationList = null;
let notificationCount = null;

// Inicializar sistema de notificaciones
function initNotifications() {
    notificationDropdown = document.getElementById('notification-dropdown');
    notificationBell = document.getElementById('notification-bell');
    notificationList = document.getElementById('notification-list');
    notificationCount = document.getElementById('notification-count');

    // Toggle dropdown al hacer click en la campanita
    if (notificationBell) {
        notificationBell.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNotificationDropdown();
        });
    }

    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', (e) => {
        if (notificationDropdown && !notificationBell.contains(e.target)) {
            notificationDropdown.classList.remove('active');
        }
    });

    // Marcar todas como leídas
    const markAllRead = document.getElementById('mark-all-read');
    if (markAllRead) {
        markAllRead.addEventListener('click', async (e) => {
            e.preventDefault();
            await markAllNotificationsAsRead();
        });
    }

    // Cargar notificaciones
    loadNotifications();

    // Actualizar contador cada 30 segundos
    setInterval(loadNotifications, 30000);
}

function toggleNotificationDropdown() {
    if (notificationDropdown) {
        notificationDropdown.classList.toggle('active');
    }
}

async function loadNotifications() {
    try {
        if (!currentUser) return;

        const { data, error } = await supabase
            .from('notificaciones')
            .select('*')
            .eq('cliente_id', currentUser.id)
            .order('fecha_creacion', { ascending: false })
            .limit(10);

        if (error) throw error;

        renderNotifications(data || []);
        updateNotificationCount(data || []);

    } catch (error) {
        console.error('❌ Error al cargar notificaciones:', error);
    }
}

function renderNotifications(notifications) {
    if (!notificationList) return;

    if (notifications.length === 0) {
        notificationList.innerHTML = `
            <div class="notification-empty">
                <p>No tienes notificaciones</p>
            </div>
        `;
        return;
    }

    notificationList.innerHTML = notifications.map(notif => createNotificationItem(notif)).join('');

    // Agregar event listeners para marcar como leída al hacer click
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', async () => {
            const notifId = item.dataset.id;
            const isUnread = item.classList.contains('unread');

            if (isUnread) {
                await markAsRead(notifId);
            }
        });
    });
}

function createNotificationItem(notification) {
    const timeAgo = getTimeAgo(notification.fecha_creacion);
    const unreadClass = !notification.leido ? 'unread' : '';
    const typeClass = `type-${notification.tipo}`;

    return `
        <div class="notification-item ${unreadClass} ${typeClass}" data-id="${notification.id}">
            <div class="notification-item-header">
                <h5 class="notification-item-title">${notification.titulo}</h5>
                <span class="notification-item-time">${timeAgo}</span>
            </div>
            <p class="notification-item-message">${notification.mensaje}</p>
        </div>
    `;
}

function updateNotificationCount(notifications) {
    const unreadCount = notifications.filter(n => !n.leido).length;

    if (notificationCount) {
        if (unreadCount > 0) {
            notificationCount.textContent = unreadCount > 99 ? '99+' : unreadCount;
            notificationCount.style.display = 'block';
        } else {
            notificationCount.style.display = 'none';
        }
    }
}

async function markAsRead(notificationId) {
    try {
        const { error } = await supabase
            .from('notificaciones')
            .update({ leido: true })
            .eq('id', notificationId);

        if (error) throw error;

        // Recargar notificaciones después de marcar como leída
        await loadNotifications();
    } catch (error) {
        console.error('❌ Error al marcar notificación como leída:', error);
    }
}

async function markAllNotificationsAsRead() {
    try {
        if (!currentUser) return;

        const { error } = await supabase
            .from('notificaciones')
            .update({ leido: true })
            .eq('cliente_id', currentUser.id)
            .eq('leido', false);

        if (error) throw error;

        // Recargar notificaciones
        await loadNotifications();
    } catch (error) {
        console.error('❌ Error al marcar todas como leídas:', error);
    }
}

function getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;

    return date.toLocaleDateString('es-AR');
}

// Exportar para uso en panel.js
if (typeof window !== 'undefined') {
    window.initNotifications = initNotifications;
}
