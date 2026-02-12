-- ==========================================
-- TRIGGER: Crear notificaciones de bienvenida para nuevos usuarios
-- ==========================================

-- Función que crea notificaciones de bienvenida
CREATE OR REPLACE FUNCTION crear_notificaciones_bienvenida()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar notificación de bienvenida
    INSERT INTO notificaciones (cliente_id, titulo, mensaje, tipo, leido)
    VALUES 
    (
        NEW.id,
        '¡Bienvenido a Patagonia Automatiza!',
        'Gracias por registrarte. Estamos aquí para ayudarte con todos tus servicios de IT.',
        'success',
        false
    ),
    (
        NEW.id,
        '🚀 Explora tus servicios',
        'Navega por el panel para ver tus servicios activos, facturas y soporte técnico.',
        'info',
        false
    ),
    (
        NEW.id,
        '💡 ¿Necesitas ayuda?',
        'Usa el botón de WhatsApp para contactarnos directamente. Estamos disponibles 24/7.',
        'info',
        false
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger que se ejecuta después de insertar en la tabla 'clientes'
DROP TRIGGER IF EXISTS trigger_notificaciones_bienvenida ON clientes;

CREATE TRIGGER trigger_notificaciones_bienvenida
AFTER INSERT ON clientes
FOR EACH ROW
EXECUTE FUNCTION crear_notificaciones_bienvenida();

-- ==========================================
-- NOTA: Este trigger creará automáticamente 3 notificaciones
-- de bienvenida cada vez que se registre un nuevo usuario
-- ==========================================
