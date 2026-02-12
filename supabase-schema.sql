-- Schema SQL para Patagonia Automatiza
-- Ejecutar en Supabase SQL Editor

-- Tabla de clientes
CREATE TABLE clientes (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  empresa TEXT,
  fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de servicios
CREATE TABLE servicios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  tipo TEXT NOT NULL,
  plan TEXT NOT NULL,
  dominio TEXT,
  estado TEXT NOT NULL DEFAULT 'activo',
  precio NUMERIC NOT NULL,
  fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
  fecha_vencimiento TIMESTAMPTZ NOT NULL
);

-- Tabla de facturas
CREATE TABLE facturas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  numero TEXT NOT NULL,
  monto NUMERIC NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  concepto TEXT NOT NULL,
  fecha_emision TIMESTAMPTZ DEFAULT NOW(),
  fecha_vencimiento TIMESTAMPTZ NOT NULL
);

-- Tabla de tickets
CREATE TABLE tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  asunto TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'abierto',
  prioridad TEXT NOT NULL DEFAULT 'media',
  fecha_apertura TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para clientes
CREATE POLICY "Los usuarios pueden ver su propio perfil" 
ON clientes FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
ON clientes FOR UPDATE 
USING (auth.uid() = id);

-- Políticas de seguridad para servicios
CREATE POLICY "Los usuarios pueden ver sus propios servicios" 
ON servicios FOR SELECT 
USING (auth.uid() = cliente_id);

-- Políticas de seguridad para facturas
CREATE POLICY "Los usuarios pueden ver sus propias facturas" 
ON facturas FOR SELECT 
USING (auth.uid() = cliente_id);

-- Políticas de seguridad para tickets
CREATE POLICY "Los usuarios pueden ver sus propios tickets" 
ON tickets FOR SELECT 
USING (auth.uid() = cliente_id);

CREATE POLICY "Los usuarios pueden crear tickets" 
ON tickets FOR INSERT 
WITH CHECK (auth.uid() = cliente_id);
