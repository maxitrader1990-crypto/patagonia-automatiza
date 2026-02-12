/* assets/js/panel.js */

// ==========================================
// PANEL DE CLIENTE - FUNCIONES PRINCIPALES
// ==========================================

// Proteger ruta (requiere autenticación)
protectRoute();

// Variables globales
let currentUser = null;

// Inicializar panel al cargar
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Obtener usuario actual
        currentUser = await getCurrentUserData();

        // Cargar datos según la página
        const currentPage = window.location.pathname;

        if (currentPage.includes('dashboard')) {
            loadDashboard();
        } else if (currentPage.includes('servicios')) {
            loadServicios();
        } else if (currentPage.includes('facturas')) {
            loadFacturas();
        }

        // Configurar sidebar toggle
        setupSidebarToggle();

        // Configurar logout
        setupLogout();

        // Mostrar nombre de usuario en top bar
        displayUserInfo();

    } catch (error) {
        console.error('❌ Error al cargar panel:', error);
        window.location.href = '../login.html';
    }
});

// ==========================================
// DASHBOARD
// ==========================================

async function loadDashboard() {
    try {
        // Cargar estadísticas
        await loadStats();

        // Cargar servicios activos
        await loadRecentServices();

        // Cargar facturas recientes
        await loadRecentInvoices();

        // Cargar tickets recientes
        await loadRecentTickets();

    } catch (error) {
        console.error('❌ Error al cargar dashboard:', error);
    }
}

async function loadStats() {
    try {
        // Contar servicios activos
        const { count: serviciosCount } = await supabase
            .from('servicios')
            .select('*', { count: 'exact', head: true })
            .eq('cliente_id', currentUser.id)
            .eq('estado', 'activo');

        // Contar facturas pendientes
        const { count: facturasCount } = await supabase
            .from('facturas')
            .select('*', { count: 'exact', head: true })
            .eq('cliente_id', currentUser.id)
            .eq('estado', 'pendiente');

        // Contar tickets abiertos
        const { count: ticketsCount } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('cliente_id', currentUser.id)
            .in('estado', ['abierto', 'en_proceso']);

        // Obtener próximo vencimiento
        const proximoVencimiento = await getProximoVencimiento();

        // Actualizar UI
        document.getElementById('stat-servicios').textContent = serviciosCount || 0;
        document.getElementById('stat-facturas').textContent = facturasCount || 0;
        document.getElementById('stat-tickets').textContent = ticketsCount || 0;
        document.getElementById('stat-vencimiento').textContent = proximoVencimiento;

    } catch (error) {
        console.error('❌ Error al cargar estadísticas:', error);
    }
}

async function getProximoVencimiento() {
    try {
        const { data, error } = await supabase
            .from('servicios')
            .select('fecha_vencimiento')
            .eq('cliente_id', currentUser.id)
            .eq('estado', 'activo')
            .order('fecha_vencimiento', { ascending: true })
            .limit(1)
            .single();

        if (error || !data) return '-';

        const fecha = new Date(data.fecha_vencimiento);
        return fecha.toLocaleDateString('es-AR');
    } catch (error) {
        return '-';
    }
}

async function loadRecentServices() {
    try {
        const { data, error } = await supabase
            .from('servicios')
            .select('*')
            .eq('cliente_id', currentUser.id)
            .eq('estado', 'activo')
            .limit(3);

        if (error) throw error;

        const container = document.getElementById('recent-services');
        if (!container) return;

        container.innerHTML = '';

        if (data && data.length > 0) {
            data.forEach((servicio) => {
                container.innerHTML += createServiceItem(servicio);
            });
        } else {
            container.innerHTML = '<p style="color: #8892b0; text-align: center;">No tienes servicios activos</p>';
        }

    } catch (error) {
        console.error('❌ Error al cargar servicios:', error);
    }
}

async function loadRecentInvoices() {
    try {
        const { data, error } = await supabase
            .from('facturas')
            .select('*')
            .eq('cliente_id', currentUser.id)
            .order('fecha_emision', { ascending: false })
            .limit(5);

        if (error) throw error;

        const tbody = document.getElementById('recent-invoices');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (data && data.length > 0) {
            data.forEach((factura) => {
                tbody.innerHTML += createInvoiceRow(factura);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #8892b0;">No tienes facturas</td></tr>';
        }

    } catch (error) {
        console.error('❌ Error al cargar facturas:', error);
    }
}

async function loadRecentTickets() {
    try {
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('cliente_id', currentUser.id)
            .order('fecha_apertura', { ascending: false })
            .limit(3);

        if (error) throw error;

        const container = document.getElementById('recent-tickets');
        if (!container) return;

        container.innerHTML = '';

        if (data && data.length > 0) {
            data.forEach((ticket) => {
                container.innerHTML += createTicketItem(ticket);
            });
        } else {
            container.innerHTML = '<p style="color: #8892b0; text-align: center;">No tienes tickets activos</p>';
        }

    } catch (error) {
        console.error('❌ Error al cargar tickets:', error);
    }
}

// ==========================================
// SERVICIOS
// ==========================================

async function loadServicios() {
    try {
        const { data, error } = await supabase
            .from('servicios')
            .select('*')
            .eq('cliente_id', currentUser.id);

        if (error) throw error;

        const container = document.getElementById('services-list');
        if (!container) return;

        container.innerHTML = '';

        if (data && data.length > 0) {
            data.forEach((servicio) => {
                container.innerHTML += createServiceCard(servicio);
            });
        } else {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem;"><p style="color: #8892b0;">No tienes servicios contratados</p></div>';
        }

    } catch (error) {
        console.error('❌ Error al cargar servicios:', error);
    }
}

// ==========================================
// FACTURAS
// ==========================================

async function loadFacturas() {
    try {
        const { data, error } = await supabase
            .from('facturas')
            .select('*')
            .eq('cliente_id', currentUser.id)
            .order('fecha_emision', { ascending: false });

        if (error) throw error;

        const tbody = document.getElementById('facturas-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (data && data.length > 0) {
            data.forEach((factura) => {
                tbody.innerHTML += createInvoiceRow(factura);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 3rem; color: #8892b0;">No tienes facturas</td></tr>';
        }

    } catch (error) {
        console.error('❌ Error al cargar facturas:', error);
    }
}

// ==========================================
// HELPERS - CREAR ELEMENTOS HTML
// ==========================================

function createServiceItem(servicio) {
    const estadoBadge = getEstadoBadge(servicio.estado);
    return `
        <div class="service-item">
            <div class="service-info">
                <span class="service-icon">${getServiceIcon(servicio.tipo)}</span>
                <div class="service-details">
                    <h4>${servicio.plan}</h4>
                    <p>${servicio.dominio || '-'}</p>
                </div>
            </div>
            <span class="badge badge-${estadoBadge}">${servicio.estado}</span>
        </div>
    `;
}

function createServiceCard(servicio) {
    const estadoBadge = getEstadoBadge(servicio.estado);
    const fechaInicio = servicio.fecha_inicio ? new Date(servicio.fecha_inicio).toLocaleDateString('es-AR') : '-';
    const fechaVencimiento = servicio.fecha_vencimiento ? new Date(servicio.fecha_vencimiento).toLocaleDateString('es-AR') : '-';

    return `
        <div class="service-card">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <span class="service-icon">${getServiceIcon(servicio.tipo)}</span>
                    <h3>${servicio.tipo}</h3>
                    <h4>${servicio.plan}</h4>
                    <p>Dominio: ${servicio.dominio || '-'}</p>
                    <p>Inicio: ${fechaInicio}</p>
                    <p>Vencimiento: ${fechaVencimiento}</p>
                </div>
                <span class="badge badge-${estadoBadge}">${servicio.estado}</span>
            </div>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-sm btn-secondary">Ver Detalles</button>
                <button class="btn btn-sm btn-primary">Renovar</button>
            </div>
        </div>
    `;
}

function createInvoiceRow(factura) {
    const estadoBadge = getEstadoBadge(factura.estado);
    const fechaEmision = factura.fecha_emision ? new Date(factura.fecha_emision).toLocaleDateString('es-AR') : '-';

    return `
        <tr>
            <td>${factura.numero}</td>
            <td>${fechaEmision}</td>
            <td>${factura.concepto}</td>
            <td>$${factura.monto ? factura.monto.toLocaleString('es-AR') : 0}</td>
            <td><span class="badge badge-${estadoBadge}">${factura.estado}</span></td>
            <td>
                <button class="btn btn-sm btn-secondary">PDF</button>
                ${factura.estado === 'pendiente' ? '<button class="btn btn-sm btn-primary">Pagar</button>' : ''}
            </td>
        </tr>
    `;
}

function createTicketItem(ticket) {
    return `
        <div class="service-item">
            <div class="service-info">
                <div class="service-details">
                    <h4>${ticket.asunto}</h4>
                    <p>Prioridad: ${ticket.prioridad}</p>
                </div>
            </div>
            <span class="badge badge-${getEstadoBadge(ticket.estado)}">${ticket.estado}</span>
        </div>
    `;
}

// ==========================================
// HELPERS - UTILIDADES
// ==========================================

function getServiceIcon(tipo) {
    const icons = {
        'hosting': '🚀',
        'docker': '🐳',
        'desarrollo': '💻',
        'telecomunicaciones': '📡',
        'electricidad': '⚡',
        'seguridad': '🔒'
    };
    return icons[tipo] || '📦';
}

function getEstadoBadge(estado) {
    const badges = {
        'activo': 'success',
        'pendiente': 'warning',
        'suspendido': 'danger',
        'cancelado': 'danger',
        'pagada': 'success',
        'vencida': 'danger',
        'abierto': 'warning',
        'en_proceso': 'warning',
        'resuelto': 'success',
        'cerrado': 'success'
    };
    return badges[estado] || 'warning';
}

function displayUserInfo() {
    const userName = document.getElementById('user-name');
    const userInitials = document.getElementById('user-initials');

    if (userName) userName.textContent = currentUser.nombre;
    if (userInitials) {
        const initials = currentUser.nombre.split(' ').map(n => n[0]).join('').substring(0, 2);
        userInitials.textContent = initials.toUpperCase();
    }
}

function setupSidebarToggle() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de cerrar sesión?')) {
                logoutUser();
            }
        });
    }
}
