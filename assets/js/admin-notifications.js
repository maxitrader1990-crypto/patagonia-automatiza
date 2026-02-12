/* ADMIN - NOTIFICATIONS */
let allUsers = [];

async function loadNotificationPage() {
    try {
        const { data, error } = await supabase.from('clientes').select('id');
        if (error) throw error;
        allUsers = data || [];
        updateRecipientsCount();
    } catch (error) {
        console.error('Error:', error);
    }
}

document.getElementById('recipients-type').addEventListener('change', updateRecipientsCount);

async function updateRecipientsCount() {
    const type = document.getElementById('recipients-type').value;
    let count = allUsers.length;

    if (type === 'active') {
        const { data } = await supabase.from('servicios').select('cliente_id').eq('estado', 'activo');
        count = new Set(data.map(s => s.cliente_id)).size;
    } else if (type === 'pending') {
        const { data } = await supabase.from('facturas').select('cliente_id').eq('estado', 'pendiente');
        count = new Set(data.map(f => f.cliente_id)).size;
    }

    document.getElementById('recipients-count').textContent = count;
}

document.getElementById('notification-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const recipientsType = document.getElementById('recipients-type').value;
    const tipo = document.getElementById('notification-type').value;
    const titulo = document.getElementById('notification-title').value;
    const mensaje = document.getElementById('notification-message').value;

    try {
        let recipients = allUsers.map(u => u.id);

        if (recipientsType === 'active') {
            const { data } = await supabase.from('servicios').select('cliente_id').eq('estado', 'activo');
            recipients = [...new Set(data.map(s => s.cliente_id))];
        } else if (recipientsType === 'pending') {
            const { data } = await supabase.from('facturas').select('cliente_id').eq('estado', 'pendiente');
            recipients = [...new Set(data.map(f => f.cliente_id))];
        }

        const notifications = recipients.map(clienteId => ({
            cliente_id: clienteId,
            titulo,
            mensaje,
            tipo,
            leido: false
        }));

        const { error } = await supabase.from('notificaciones').insert(notifications);
        if (error) throw error;

        toast.success(`✅ ${recipients.length} notificaciones enviadas correctamente`);
        document.getElementById('notification-form').reset();
        updateRecipientsCount();

    } catch (error) {
        console.error('Error:', error);
        toast.error('Error al enviar notificaciones');
    }
});

window.loadNotificationPage = loadNotificationPage;
