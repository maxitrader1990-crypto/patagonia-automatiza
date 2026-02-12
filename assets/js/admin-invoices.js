/* ADMIN - INVOICES MANAGEMENT */
let allInvoices = [], filteredInvoices = [], allClients = [];

async function loadInvoices() {
    try {
        const [invoicesRes, clientsRes] = await Promise.all([
            supabase.from('facturas').select('*').order('fecha_emision', { ascending: false }),
            supabase.from('clientes').select('id, nombre, email')
        ]);
        if (invoicesRes.error) throw invoicesRes.error;
        if (clientsRes.error) throw clientsRes.error;
        allInvoices = invoicesRes.data || [];
        allClients = clientsRes.data || [];
        filteredInvoices = allInvoices;
        updateInvoiceStats();
        renderInvoicesTable();
        populateClientSelect();
    } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar facturas');
    }
}

function updateInvoiceStats() {
    const paid = allInvoices.filter(i => i.estado === 'pagada').reduce((sum, i) => sum + i.monto, 0);
    const pending = allInvoices.filter(i => i.estado === 'pendiente').reduce((sum, i) => sum + i.monto, 0);
    document.getElementById('total-invoices').textContent = allInvoices.length;
    document.getElementById('paid-amount').textContent = '$' + paid.toLocaleString();
    document.getElementById('pending-amount').textContent = '$' + pending.toLocaleString();
}

async function renderInvoicesTable() {
    const tbody = document.getElementById('invoices-table-body');
    if (filteredInvoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 3rem;">No hay facturas</td></tr>';
        return;
    }
    const invoicesWithClients = filteredInvoices.map(inv => {
        const client = allClients.find(c => c.id === inv.cliente_id);
        return { ...inv, clientName: client ? (client.nombre || client.email) : 'Desconocido' };
    });
    tbody.innerHTML = invoicesWithClients.map(inv => `
        <tr>
            <td><strong>${inv.clientName}</strong></td>
            <td>$${inv.monto.toLocaleString()}</td>
            <td>${new Date(inv.fecha_emision).toLocaleDateString('es-AR')}</td>
            <td>${inv.fecha_vencimiento ? new Date(inv.fecha_vencimiento).toLocaleDateString('es-AR') : '-'}</td>
            <td><span class="badge badge-${inv.estado === 'pagada' ? 'success' : 'warning'}">${inv.estado}</span></td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-sm btn-${inv.estado === 'pendiente' ? 'success' : 'secondary'}" onclick="toggleInvoiceStatus('${inv.id}')">${inv.estado === 'pendiente' ? 'Marcar Pagada' : 'Marcar Pendiente'}</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteInvoice('${inv.id}')">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function populateClientSelect() {
    const select = document.getElementById('invoice-cliente');
    select.innerHTML = '<option value="">Seleccionar...</option>' + allClients.map(c => `<option value="${c.id}">${c.nombre || c.email}</option>`).join('');
}

document.getElementById('filter-status').addEventListener('change', (e) => {
    const status = e.target.value;
    filteredInvoices = status ? allInvoices.filter(i => i.estado === status) : allInvoices;
    renderInvoicesTable();
});

function showAddInvoiceModal() {
    document.getElementById('invoice-modal-title').textContent = 'Nueva Factura';
    document.getElementById('invoice-form').reset();
    document.getElementById('invoice-id').value = '';
    document.getElementById('invoice-modal').style.display = 'flex';
}

function closeInvoiceModal() {
    document.getElementById('invoice-modal').style.display = 'none';
}

document.getElementById('invoice-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        cliente_id: document.getElementById('invoice-cliente').value,
        monto: parseFloat(document.getElementById('invoice-monto').value),
        estado: document.getElementById('invoice-estado').value,
        fecha_emision: new Date().toISOString(),
        fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    try {
        const { error } = await supabase.from('facturas').insert([data]);
        if (error) throw error;
        toast.success('Factura creada');
        closeInvoiceModal();
        loadInvoices();
    } catch (error) {
        console.error('Error:', error);
        toast.error('Error al crear factura');
    }
});

async function toggleInvoiceStatus(id) {
    const invoice = allInvoices.find(i => i.id === id);
    if (!invoice) return;
    const newStatus = invoice.estado === 'pagada' ? 'pendiente' : 'pagada';
    try {
        const { error } = await supabase.from('facturas').update({ estado: newStatus }).eq('id', id);
        if (error) throw error;
        toast.success(`Factura marcada como ${newStatus}`);
        loadInvoices();
    } catch (error) {
        console.error('Error:', error);
        toast.error('Error al actualizar factura');
    }
}

async function deleteInvoice(id) {
    if (!confirm('¿Eliminar esta factura?')) return;
    try {
        const { error } = await supabase.from('facturas').delete().eq('id', id);
        if (error) throw error;
        toast.success('Factura eliminada');
        loadInvoices();
    } catch (error) {
        console.error('Error:', error);
        toast.error('Error al eliminar factura');
    }
}

window.loadInvoices = loadInvoices;
window.showAddInvoiceModal = showAddInvoiceModal;
window.closeInvoiceModal = closeInvoiceModal;
window.toggleInvoiceStatus = toggleInvoiceStatus;
window.deleteInvoice = deleteInvoice;
