-- Crear tabla de notificaciones para el panel de clientes
-- Ejecutar en Supabase SQL Editor

CREATE TABLE notificaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
  leido BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propias notificaciones
CREATE POLICY "Los usuarios pueden ver sus propias notificaciones" 
ON notificaciones FOR SELECT 
USING (auth.uid() = cliente_id);

-- Política: Los usuarios pueden marcar como leídas sus notificaciones
CREATE POLICY "Los usuarios pueden actualizar sus notificaciones" 
ON notificaciones FOR UPDATE 
USING (auth.uid() = cliente_id);

-- Insertar notificaciones de ejemplo (opcional)
-- Reemplaza 'UUID-DEL-CLIENTE' con el ID real del usuario
/*
INSERT INTO notificaciones (cliente_id, titulo, mensaje, tipo, leido) VALUES
  ('UUID-DEL-CLIENTE', 'Bienvenido a Patagonia Automatiza', 'Gracias por registrarte. Estamos aquí para ayudarte.', 'success', false),
  ('UUID-DEL-CLIENTE', 'Recordatorio de Pago', 'Tienes una factura pendiente de pago.', 'warning', false),
  ('UUID-DEL-CLIENTE', 'Nuevo Servicio Disponible', 'Ahora ofrecemos servicios de Docker Hosting.', 'info', false);
*/
