-- ==========================================
-- SUPER ADMIN SYSTEM - SETUP COMPLETO
-- ==========================================

-- 1. Tabla de Super Admins
CREATE TABLE IF NOT EXISTS super_admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    ultima_conexion TIMESTAMP,
    activo BOOLEAN DEFAULT true
);

-- 2. Habilitar RLS
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies para super_admins

-- Solo super admins pueden ver la tabla super_admins
DROP POLICY IF EXISTS "Super admins can view super_admins" ON super_admins;
CREATE POLICY "Super admins can view super_admins"
ON super_admins FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT id FROM super_admins WHERE activo = true));

-- Solo super admins pueden insertar
DROP POLICY IF EXISTS "Super admins can insert super_admins" ON super_admins;
CREATE POLICY "Super admins can insert super_admins"
ON super_admins FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (SELECT id FROM super_admins WHERE activo = true));

-- Solo super admins pueden actualizar
DROP POLICY IF EXISTS "Super admins can update super_admins" ON super_admins;
CREATE POLICY "Super admins can update super_admins"
ON super_admins FOR UPDATE
TO authenticated
USING (auth.uid() IN (SELECT id FROM super_admins WHERE activo = true));

-- 4. RLS Policies para que super admins vean TODO

-- Super admins pueden ver TODOS los clientes
DROP POLICY IF EXISTS "Super admins can view all clients" ON clientes;
CREATE POLICY "Super admins can view all clients"
ON clientes FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM super_admins WHERE activo = true));

-- Super admins pueden ver TODOS los servicios
DROP POLICY IF EXISTS "Super admins can view all services" ON servicios;
CREATE POLICY "Super admins can view all services"
ON servicios FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM super_admins WHERE activo = true));

-- Super admins pueden ver TODAS las facturas
DROP POLICY IF EXISTS "Super admins can view all invoices" ON facturas;
CREATE POLICY "Super admins can view all invoices"
ON facturas FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM super_admins WHERE activo = true));

-- Super admins pueden ver TODAS las notificaciones
DROP POLICY IF EXISTS "Super admins can view all notifications" ON notificaciones;
CREATE POLICY "Super admins can view all notifications"
ON notificaciones FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM super_admins WHERE activo = true));

-- 5. Función para verificar si un usuario es super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM super_admins 
        WHERE id = user_id AND activo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Función para actualizar última conexión
CREATE OR REPLACE FUNCTION update_super_admin_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE super_admins
    SET ultima_conexion = NOW()
    WHERE id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. INSERTAR TU EMAIL COMO SUPER ADMIN
-- ⚠️ REEMPLAZA 'tu@email.com' con el email que usas para login
-- Primero necesitas obtener el UUID del usuario desde auth.users

-- Opción 1: Si ya tienes el UUID
-- INSERT INTO super_admins (id, email, nombre, activo)
-- VALUES ('uuid-aqui', 'tu@email.com', 'Tu Nombre', true)
-- ON CONFLICT (id) DO NOTHING;

-- Opción 2: Insertar usando el email (ejecuta esto DESPUÉS de login)
-- INSERT INTO super_admins (id, email, nombre, activo)
-- SELECT id, email, raw_user_meta_data->>'nombre', true
-- FROM auth.users
-- WHERE email = 'tu@email.com'
-- ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- INSTRUCCIONES:
-- 1. Ejecuta todo este script en Supabase SQL Editor
-- 2. Luego ejecuta el INSERT con tu email
-- 3. Verifica con: SELECT * FROM super_admins;
-- ==========================================

COMMENT ON TABLE super_admins IS 'Tabla de administradores con acceso completo al sistema';
