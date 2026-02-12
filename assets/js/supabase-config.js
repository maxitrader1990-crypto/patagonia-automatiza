/* assets/js/supabase-config.js */

// ⚠️ IMPORTANTE: REEMPLAZAR CON TUS CREDENCIALES DE SUPABASE
// Obtén estas credenciales desde Supabase Dashboard > Project Settings > API

const SUPABASE_URL = 'https://ajrbzwomstgykzcugmes.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqcmJ6d29tc3RneWt6Y3VnbWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTg0MzAsImV4cCI6MjA4NjQ0MzB9.fTMUbIIFcNe8UZSJS9CmfNcSqel5iWrr8v5fZ3y-8rk';
iOiJzdXBhYmFzZSIsInJlZiI6ImFqcmJ6d29tc3RneWt6Y3VnbWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTg0MzAsImV4cCI6MjA4NjQzNDQzMH0.fTMUbIIFcNe8UZSJS9CmfNcSqel5iWrr8v5fZ3y - 8rk'; // ⚠️ REEMPLAZAR

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase inicializado correctamente');
