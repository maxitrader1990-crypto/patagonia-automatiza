/* assets/js/supabase-config.js */

// ⚠️ IMPORTANTE: REEMPLAZAR CON TUS CREDENCIALES DE SUPABASE
// Obtén estas credenciales desde Supabase Dashboard > Project Settings > API

const SUPABASE_URL = 'https://XXXXXX.supabase.co'; // ⚠️ REEMPLAZAR
const SUPABASE_ANON_KEY = 'eyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // ⚠️ REEMPLAZAR

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase inicializado correctamente');
