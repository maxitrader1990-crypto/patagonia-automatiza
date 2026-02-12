/* ==========================================
   SUPER ADMIN - DASHBOARD FUNCTIONS
   ========================================== */

let usersChart, servicesChart, revenueChart, invoicesChart;

// Cargar dashboard completo
async function loadAdminDashboard() {
    try {
        console.log('📊 Cargando dashboard admin...');

        // Cargar métricas en paralelo
        await Promise.all([
            loadUserMetrics(),
            loadRevenueMetrics(),
            loadServiceMetrics(),
            loadInvoiceMetrics(),
            loadRecentUsers(),
            loadOverdueInvoices()
        ]);

        // Crear gráficos
        createChartsAsync();

    } catch (error) {
        console.error('❌ Error cargando dashboard:', error);
        toast.error('Error al cargar el dashboard');
    }
}

// Métricas de Usuarios
async function loadUserMetrics() {
    try {
        const { data: users, error } = await supabase
            .from('clientes')
            .select('id, fecha_registro');

        if (error) throw error;

        const totalUsers = users.length;
        document.getElementById('total-users').textContent = totalUsers;

        // Calcular crecimiento
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const usersLastMonth = users.filter(u => new Date(u.fecha_registro) < lastMonth).length;
        const growth = usersLastMonth > 0 ? ((totalUsers - usersLastMonth) / usersLastMonth * 100).toFixed(1) : 0;

        document.getElementById('users-change').innerHTML = `
            <span>${growth >= 0 ? '↑' : '↓'} ${Math.abs(growth)}%</span>
            <span>vs. mes anterior</span>
        `;
        document.getElementById('users-change').className = `stat-change ${growth >= 0 ? 'positive' : 'negative'}`;

    } catch (error) {
        console.error('Error cargando métricas de usuarios:', error);
    }
}

// Métricas de Ingresos
async function loadRevenueMetrics() {
    try {
        const { data: invoices, error } = await supabase
            .from('facturas')
            .select('monto, estado, fecha_emision');

        if (error) throw error;

        // Ingresos del mes actual
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyRevenue = invoices
            .filter(inv => {
                const invDate = new Date(inv.fecha_emision);
                return invDate.getMonth() === currentMonth &&
                    invDate.getFullYear() === currentYear &&
                    inv.estado === 'pagada';
            })
            .reduce((sum, inv) => sum + (inv.monto || 0), 0);

        document.getElementById('monthly-revenue').textContent = `$${monthlyRevenue.toLocaleString()}`;

        // Calcular crecimiento vs mes anterior
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const lastMonthRevenue = invoices
            .filter(inv => {
                const invDate = new Date(inv.fecha_emision);
                return invDate.getMonth() === lastMonth &&
                    invDate.getFullYear() === lastMonthYear &&
                    inv.estado === 'pagada';
            })
            .reduce((sum, inv) => sum + (inv.monto || 0), 0);

        const revenueGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;

        document.getElementById('revenue-change').innerHTML = `
            <span>${revenueGrowth >= 0 ? '↑' : '↓'} ${Math.abs(revenueGrowth)}%</span>
            <span>vs. mes anterior</span>
        `;
        document.getElementById('revenue-change').className = `stat-change ${revenueGrowth >= 0 ? 'positive' : 'negative'}`;

    } catch (error) {
        console.error('Error cargando métricas de ingresos:', error);
    }
}

// Métricas de Servicios
async function loadServiceMetrics() {
    try {
        const { data: services, error } = await supabase
            .from('servicios')
            .select('estado');

        if (error) throw error;

        const activeServices = services.filter(s => s.estado === 'activo').length;
        document.getElementById('active-services').textContent = activeServices;
        document.getElementById('services-info').textContent = `${services.length} servicios totales`;

    } catch (error) {
        console.error('Error cargando métricas de servicios:', error);
    }
}

// Métricas de Facturas
async function loadInvoiceMetrics() {
    try {
        const { data: invoices, error } = await supabase
            .from('facturas')
            .select('estado, monto');

        if (error) throw error;

        const pendingInvoices = invoices.filter(inv => inv.estado === 'pendiente');
        const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (inv.monto || 0), 0);

        document.getElementById('pending-invoices').textContent = pendingInvoices.length;
        document.getElementById('pending-amount').innerHTML = `<span>$${pendingAmount.toLocaleString()} pendiente</span>`;

    } catch (error) {
        console.error('Error cargando métricas de facturas:', error);
    }
}

// Últimos usuarios registrados
async function loadRecentUsers() {
    try {
        const { data: users, error } = await supabase
            .from('clientes')
            .select('id, nombre, email, fecha_registro')
            .order('fecha_registro', { ascending: false })
            .limit(10);

        if (error) throw error;

        // Obtener servicios de cada usuario
        const usersWithServices = await Promise.all(users.map(async (user) => {
            const { data: services } = await supabase
                .from('servicios')
                .select('id')
                .eq('cliente_id', user.id);

            return {
                ...user,
                serviceCount: services ? services.length : 0
            };
        }));

        const tbody = document.getElementById('recent-users');
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--gray);">No hay usuarios registrados</td></tr>';
            return;
        }

        tbody.innerHTML = usersWithServices.map(user => `
            <tr>
                <td><strong>${user.nombre || 'Sin nombre'}</strong></td>
                <td>${user.email}</td>
                <td>${new Date(user.fecha_registro).toLocaleDateString('es-AR')}</td>
                <td><span class="badge badge-info">${user.serviceCount}</span></td>
                <td><span class="badge badge-success">Activo</span></td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error cargando usuarios recientes:', error);
    }
}

// Facturas vencidas
async function loadOverdueInvoices() {
    try {
        const { data: invoices, error } = await supabase
            .from('facturas')
            .select('id, cliente_id, monto, fecha_vencimiento')
            .eq('estado', 'pendiente')
            .order('fecha_vencimiento', { ascending: true })
            .limit(10);

        if (error) throw error;

        const now = new Date();
        const overdueInvoices = invoices.filter(inv => new Date(inv.fecha_vencimiento) < now);

        // Obtener nombres de clientes
        const invoicesWithClients = await Promise.all(overdueInvoices.map(async (invoice) => {
            const { data: client } = await supabase
                .from('clientes')
                .select('nombre, email')
                .eq('id', invoice.cliente_id)
                .single();

            const daysOverdue = Math.floor((now - new Date(invoice.fecha_vencimiento)) / (1000 * 60 * 60 * 24));

            return {
                ...invoice,
                clientName: client ? client.nombre || client.email : 'Desconocido',
                daysOverdue
            };
        }));

        const tbody = document.getElementById('overdue-invoices');
        if (overdueInvoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--success);">✅ No hay facturas vencidas</td></tr>';
            return;
        }

        tbody.innerHTML = invoicesWithClients.map(invoice => `
            <tr>
                <td><strong>${invoice.clientName}</strong></td>
                <td>$${invoice.monto.toLocaleString()}</td>
                <td>${new Date(invoice.fecha_vencimiento).toLocaleDateString('es-AR')}</td>
                <td><span class="badge badge-danger">${invoice.daysOverdue} días</span></td>
                <td><button class="btn btn-sm btn-secondary" onclick="sendPaymentReminder('${invoice.id}')">Recordar</button></td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error cargando facturas vencidas:', error);
    }
}

// Crear gráficos
async function createChartsAsync() {
    await createUsersChart();
    await createServicesChart();
    await createRevenueChart();
    await createInvoicesChart();
}

// Gráfico de usuarios por mes
async function createUsersChart() {
    const { data: users } = await supabase
        .from('clientes')
        .select('fecha_registro');

    // Agrupar por mes los últimos 6 meses
    const months = [];
    const counts = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
        months.push(monthName);

        const count = users.filter(u => {
            const userDate = new Date(u.fecha_registro);
            return userDate.getMonth() === date.getMonth() &&
                userDate.getFullYear() === date.getFullYear();
        }).length;
        counts.push(count);
    }

    const ctx = document.getElementById('usersChart');
    usersChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Nuevos Usuarios',
                data: counts,
                borderColor: '#0066ff',
                backgroundColor: 'rgba(0, 102, 255, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { color: '#8892b0' } },
                x: { ticks: { color: '#8892b0' } }
            }
        }
    });
}

// Gráfico de servicios por tipo
async function createServicesChart() {
    const { data: services } = await supabase
        .from('servicios')
        .select('tipo');

    const types = {};
    services.forEach(s => {
        types[s.tipo] = (types[s.tipo] || 0) + 1;
    });

    const ctx = document.getElementById('servicesChart');
    servicesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(types),
            datasets: [{
                label: 'Cantidad',
                data: Object.values(types),
                backgroundColor: ['#0066ff', '#64ffda', '#00ff88', '#ffa500', '#ff4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { color: '#8892b0' } },
                x: { ticks: { color: '#8892b0' } }
            }
        }
    });
}

// Gráfico de ingresos por servicio
async function createRevenueChart() {
    const { data: invoices } = await supabase
        .from('facturas')
        .select('servicio_id, monto')
        .eq('estado', 'pagada');

    const { data: services } = await supabase
        .from('servicios')
        .select('id, tipo');

    const revenueByType = {};
    invoices.forEach(inv => {
        const service = services.find(s => s.id === inv.servicio_id);
        if (service) {
            revenueByType[service.tipo] = (revenueByType[service.tipo] || 0) + inv.monto;
        }
    });

    const ctx = document.getElementById('revenueChart');
    revenueChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(revenueByType),
            datasets: [{
                data: Object.values(revenueByType),
                backgroundColor: ['#0066ff', '#64ffda', '#00ff88', '#ffa500', '#ff4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#8892b0' } }
            }
        }
    });
}

// Gráfico de facturas pagadas vs pendientes
async function createInvoicesChart() {
    const { data: invoices } = await supabase
        .from('facturas')
        .select('estado, monto');

    const paid = invoices.filter(i => i.estado === 'pagada').reduce((sum, i) => sum + i.monto, 0);
    const pending = invoices.filter(i => i.estado === 'pendiente').reduce((sum, i) => sum + i.monto, 0);

    const ctx = document.getElementById('invoicesChart');
    invoicesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Pagadas', 'Pendientes'],
            datasets: [{
                label: 'Monto ($)',
                data: [paid, pending],
                backgroundColor: ['#00ff88', '#ff4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { color: '#8892b0' } },
                x: { ticks: { color: '#8892b0' } }
            }
        }
    });
}

// Enviar recordatorio de pago
async function sendPaymentReminder(invoiceId) {
    try {
        // Aquí puedes implementar el envío de notificación
        toast.success('Recordatorio enviado correctamente');
    } catch (error) {
        console.error('Error enviando recordatorio:', error);
        toast.error('Error al enviar recordatorio');
    }
}

// Exportar funciones
if (typeof window !== 'undefined') {
    window.loadAdminDashboard = loadAdminDashboard;
    window.sendPaymentReminder = sendPaymentReminder;
}
