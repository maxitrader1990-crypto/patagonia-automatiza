/* ==========================================
   SUPER ADMIN - AUTH MIDDLEWARE
   ========================================== */

// Verificar si el usuario actual es super admin
async function verifySuperAdmin() {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.log('❌ No hay sesión activa');
            window.location.href = '../login.html';
            return false;
        }

        const { data, error } = await supabase
            .from('super_admins')
            .select('*')
            .eq('id', user.id)
            .eq('activo', true)
            .single();

        if (error || !data) {
            console.log('❌ Usuario no es super admin');
            alert('Acceso denegado. Esta sección es solo para administradores.');
            window.location.href = '../login.html';
            return false;
        }

        console.log('✅ Super admin verificado:', data.email);

        // Actualizar última conexión
        await supabase
            .from('super_admins')
            .update({ ultima_conexion: new Date().toISOString() })
            .eq('id', user.id);

        return data;
    } catch (error) {
        console.error('❌ Error verificando super admin:', error);
        window.location.href = '../login.html';
        return false;
    }
}

// Variable global para el super admin actual
let currentAdmin = null;

// Inicializar verificación al cargar
document.addEventListener('DOMContentLoaded', async () => {
    currentAdmin = await verifySuperAdmin();

    if (currentAdmin) {
        // Mostrar nombre del admin en el UI
        const adminNameElement = document.getElementById('admin-name');
        if (adminNameElement) {
            adminNameElement.textContent = currentAdmin.nombre || currentAdmin.email;
        }

        // Cargar datos según la página
        const currentPage = window.location.pathname;

        if (currentPage.includes('/admin/index.html') || currentPage.includes('/admin/') && !currentPage.includes('.html')) {
            loadAdminDashboard();
        } else if (currentPage.includes('usuarios.html')) {
            loadUsers();
        } else if (currentPage.includes('servicios.html')) {
            loadServices();
        } else if (currentPage.includes('facturas.html')) {
            loadInvoices();
        } else if (currentPage.includes('analytics.html')) {
            loadAnalytics();
        }

        // Configurar logout
        setupAdminLogout();
    }
});

// Configurar logout del admin
function setupAdminLogout() {
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                toast.error('Error al cerrar sesión');
            } else {
                window.location.href = '../login.html';
            }
        });
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.verifySuperAdmin = verifySuperAdmin;
    window.currentAdmin = currentAdmin;
}
