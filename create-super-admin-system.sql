-- ==========================================
-- SUPER ADMIN SYSTEM - SETUP CORREGIDO
-- ==========================================
-- Este script evita la recursión infinita en RLS policies

-- 1. Eliminar tabla anterior si existe
DROP TABLE IF EXISTS super_admins CASCADE;

-- 2. Crear tabla de Super Admins
CREATE TABLE super_admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    ultima_conexion TIMESTAMP,
    activo BOOLEAN DEFAULT true
);

-- 3. Habilitar RLS
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- 4. Política SIMPLE para super_admins (sin recursión)
-- Permitir que los usuarios autenticados lean su propio registro
DROP POLICY IF EXISTS "Users can view own super_admin record" ON super_admins;
CREATE POLICY "Users can view own super_admin record"
ON super_admins FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Permitir que super admins vean todos los registros (sin recursión)
DROP POLICY IF EXISTS "Super admins can view all super_admins" ON super_admins;
CREATE POLICY "Super admins can view all super_admins"
ON super_admins FOR SELECT
TO authenticated
USING (id = auth.uid() AND activo = true);

-- Permitir INSERT y UPDATE solo a super admins existentes
DROP POLICY IF EXISTS "Super admins can manage super_admins" ON super_admins;
CREATE POLICY "Super admins can manage super_admins"
ON super_admins FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM super_admins sa
        WHERE sa.id = auth.uid() AND sa.activo = true
    )
);

-- 5. RLS Policies para que super admins vean TODO
-- Usando una subconsulta más eficiente que evita recursión

-- Super admins pueden ver TODOS los clientes
DROP POLICY IF EXISTS "Super admins can view all clients" ON clientes;
CREATE POLICY "Super admins can view all clients"
ON clientes FOR ALL
TO authenticated
USING (
    auth.uid() IN (
        SELECT id FROM super_admins WHERE activo = true
    )
);

-- Super admins pueden ver TODOS los servicios
DROP POLICY IF EXISTS "Super admins can view all services" ON servicios;
CREATE POLICY "Super admins can view all services"
ON servicios FOR ALL
TO authenticated
USING (
    auth.uid() IN (
        SELECT id FROM super_admins WHERE activo = true
    )
);

-- Super admins pueden ver TODAS las facturas
DROP POLICY IF EXISTS "Super admins can view all invoices" ON facturas;
CREATE POLICY "Super admins can view all invoices"
ON facturas FOR ALL
TO authenticated
USING (
    auth.uid() IN (
        SELECT id FROM super_admins WHERE activo = true
    )
);

-- Super admins pueden ver TODAS las notificaciones
DROP POLICY IF EXISTS "Super admins can view all notifications" ON notificaciones;
CREATE POLICY "Super admins can view all notifications"
ON notificaciones FOR ALL
TO authenticated
USING (
    auth.uid() IN (
        SELECT id FROM super_admins WHERE activo = true
    )
);

-- 6. Función helper para verificar super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM super_admins 
        WHERE id = user_id AND activo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. PASO CRÍTICO: Insertar el primer super admin
-- ⚠️ REEMPLAZA 'tu@email.com' con TU email real

-- Primero, deshabilitamos RLS temporalmente para insertar el primer admin
ALTER TABLE super_admins DISABLE ROW LEVEL SECURITY;

-- Inserta tu email como super admin
INSERT INTO super_admins (id, email, nombre, activo)
SELECT id, email, raw_user_meta_data->>'nombre', true
FROM auth.users
WHERE email = 'TU_EMAIL_AQUI@gmail.com'  -- ⚠️ CAMBIA ESTO
ON CONFLICT (id) DO UPDATE SET activo = true;

-- Volver a habilitar RLS
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- 8. Verificar que se creó correctamente
SELECT * FROM super_admins;

-- ==========================================
-- INSTRUCCIONES:
-- 1. Reemplaza 'TU_EMAIL_AQUI@gmail.com' con tu email (línea 101)
-- 2. Ejecuta TODO este script en Supabase SQL Editor
-- 3. Verifica que aparece tu registro en el SELECT final
-- 4. Ve a tu-web.vercel.app/admin/
-- ==========================================

COMMENT ON TABLE super_admins IS 'Tabla de administradores con acceso completo al sistema';
