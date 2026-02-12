-- Política faltante para permitir registro de nuevos clientes
-- Ejecutar en Supabase SQL Editor

CREATE POLICY "Los usuarios pueden insertar su propio perfil durante el registro" 
ON clientes FOR INSERT 
WITH CHECK (auth.uid() = id);
