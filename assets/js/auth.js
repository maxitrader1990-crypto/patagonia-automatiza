/* assets/js/auth.js */

// ==========================================
// AUTENTICACIÓN CON SUPABASE
// ==========================================

// Verificar sesión activa
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        return session.user;
    }
    throw new Error('No hay sesión activa');
}

// Registrar nuevo usuario
async function registerUser(nombre, email, telefono, empresa, password) {
    try {
        // Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    nombre: nombre,
                    telefono: telefono,
                    empresa: empresa || ''
                }
            }
        });

        if (authError) throw authError;

        // Guardar información adicional en tabla clientes
        const { error: insertError } = await supabase
            .from('clientes')
            .insert([{
                id: authData.user.id,
                nombre: nombre,
                email: email,
                telefono: telefono,
                empresa: empresa || '',
                fecha_registro: new Date().toISOString()
            }]);

        if (insertError) throw insertError;

        console.log('✅ Usuario registrado correctamente');
        return authData.user;
    } catch (error) {
        console.error('❌ Error al registrar:', error);
        throw error;
    }
}

// Iniciar sesión
async function loginUser(email, password, rememberMe = false) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        console.log('✅ Sesión iniciada correctamente');
        return data.user;
    } catch (error) {
        console.error('❌ Error al iniciar sesión:', error);
        throw error;
    }
}

// Cerrar sesión
async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        console.log('✅ Sesión cerrada correctamente');
        window.location.href = '../login.html';
    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        throw error;
    }
}

// Recuperar contraseña
async function resetPassword(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        });

        if (error) throw error;

        console.log('✅ Email de recuperación enviado');
        return true;
    } catch (error) {
        console.error('❌ Error al enviar email:', error);
        throw error;
    }
}

// Obtener datos del usuario actual
async function getCurrentUserData() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No hay usuario autenticado');

        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('❌ Error al obtener datos:', error);
        throw error;
    }
}

// Proteger rutas (redirigir si no hay sesión)
async function protectRoute() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '../login.html';
    }
}

// Escuchar cambios de autenticación
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        // Usuario cerró sesión
        if (window.location.pathname.includes('/panel/')) {
            window.location.href = '../login.html';
        }
    }
});

// Mostrar mensajes de error traducidos
function getErrorMessage(errorMessage) {
    const errors = {
        'User already registered': 'Este email ya está registrado',
        'Invalid login credentials': 'Email o contraseña incorrectos',
        'Email not confirmed': 'Debes confirmar tu email antes de iniciar sesión',
        'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
        'Invalid email': 'Email inválido',
        'Unable to validate email address': 'No se pudo validar el email',
        'User not found': 'Usuario no encontrado'
    };

    // Buscar coincidencia parcial
    for (const [key, value] of Object.entries(errors)) {
        if (errorMessage.includes(key)) {
            return value;
        }
    }

    return errorMessage || 'Error desconocido. Intenta nuevamente';
}
