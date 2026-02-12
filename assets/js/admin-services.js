/* ADMIN - SERVICES MANAGEMENT */

let allServices = [];
let filteredServices = [];
let allClients = [];

async function loadServices() {
    try {
        const [servicesRes, clientsRes] = await Promise.all([
            supabase.from('servicios').select('*').order('fecha_inicio', { ascending: false }),
            supabase.from('clientes').select('id, nombre, email')
        ]);

        if (servicesRes.error) throw servicesRes.error;
        if (clientsRes.error) throw clientsRes.error;

        allServices = servicesRes.data || [];
        allClients = clientsRes.data || [];
        filteredServices = allServices;

        updateServiceStats();
        renderServicesTable();
        populateClientSelect();

    } catch (error) {
        console.error('Error loading services:', error);
        toast.error('Error al cargar servicios');
    }
}

function updateServiceStats() {
    document.getElementById('total-services').textContent = allServices.length;
    document.getElementById('active-services').textContent = allServices.filter(s => s.estado === 'activo').length;
    document.getElementById('paused-services').textContent = allServices.filter(s => s.estado === 'pausado').length;
}

async function renderServicesTable() {
    const tbody = document.getElementById('services-table-body');

    if (filteredServices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 3rem;">No se encontraron servicios</td></tr>';
        return;
    }

    const servicesWithClients = await Promise.all(filteredServices.map(async (service) => {
        const client = allClients.find(c => c.id === service.cliente_id);
        return { ...service, clientName: client ? (client.nombre || client.email) : 'Desconocido' };
    }));

    tbody.innerHTML = servicesWithClients.map(s => `
        <tr>
            <td><strong>${s.clientName}</strong></td>
            <td><span class="badge badge-info">${s.tipo}</span></td>
            <td>${s.descripcion || '-'}</td>
            <td>$${s.precio_mensual ? s.precio_mensual.toLocaleString() : '0'}</td>
            <td>${s.fecha_inicio ? new Date(s.fecha_inicio).toLocaleDateString('es-AR') : '-'}</td>
            <td><span class="badge badge-${s.estado === 'activo' ? 'success' : s.estado === 'pausado' ? 'warning' : 'danger'}">${s.estado}</span></td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-sm btn-primary" onclick="editService('${s.id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteService('${s.id}')">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function populateClientSelect() {
    const select = document.getElementById('service-cliente');
    select.innerHTML = '<option value="">Seleccionar cliente...</option>' +
        allClients.map(c => `<option value="${c.id}">${c.nombre || c.email}</option>`).join('');
}

document.getElementById('filter-type').addEventListener('change', applyFilters);
document.getElementById('filter-status').addEventListener('change', applyFilters);

function applyFilters() {
    const type = document.getElementById('filter-type').value;
    const status = document.getElementById('filter-status').value;

    filteredServices = allServices.filter(s =>
        (!type || s.tipo === type) && (!status || s.estado === status)
    );
    renderServicesTable();
}

function showAddServiceModal() {
    document.getElementById('service-modal-title').textContent = 'Nuevo Servicio';
    document.getElementById('service-form').reset();
    document.getElementById('service-id').value = '';
    document.getElementById('service-modal').style.display = 'flex';
}

async function editService(id) {
    const service = allServices.find(s => s.id === id);
    if (!service) return;

    document.getElementById('service-modal-title').textContent = 'Editar Servicio';
    document.getElementById('service-id').value = service.id;
    document.getElementById('service-cliente').value = service.cliente_id;
    document.getElementById('service-tipo').value = service.tipo;
    document.getElementById('service-descripcion').value = service.descripcion || '';
    document.getElementById('service-precio').value = service.precio_mensual || '';
    document.getElementById('service-estado').value = service.estado;
    document.getElementById('service-modal').style.display = 'flex';
}

function closeServiceModal() {
    document.getElementById('service-modal').style.display = 'none';
}

document.getElementById('service-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('service-id').value;
    const data = {
        cliente_id: document.getElementById('service-cliente').value,
        tipo: document.getElementById('service-tipo').value,
        descripcion: document.getElementById('service-descripcion').value,
        precio_mensual: parseFloat(document.getElementById('service-precio').value) || 0,
        estado: document.getElementById('service-estado').value,
        fecha_inicio: id ? undefined : new Date().toISOString()
    };

    try {
        if (id) {
            const { error } = await supabase.from('servicios').update(data).eq('id', id);
            if (error) throw error;
            toast.success('Servicio actualizado');
        } else {
            const { error } = await supabase.from('servicios').insert([data]);
            if (error) throw error;
            toast.success('Servicio creado');
        }
        closeServiceModal();
        loadServices();
    } catch (error) {
        console.error('Error:', error);
        toast.error('Error al guardar servicio');
    }
});

async function deleteService(id) {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;

    try {
        const { error } = await supabase.from('servicios').delete().eq('id', id);
        if (error) throw error;
        toast.success('Servicio eliminado');
        loadServices();
    } catch (error) {
        console.error('Error:', error);
        toast.error('Error al eliminar servicio');
    }
}

window.loadServices = loadServices;
window.showAddServiceModal = showAddServiceModal;
window.editService = editService;
window.closeServiceModal = closeServiceModal;
window.deleteService = deleteService;
