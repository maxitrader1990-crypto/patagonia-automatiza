# Patagonia Automatiza - Sitio Web Profesional

Sitio web completo para **Patagonia Automatiza**, empresa argentina especializada en soluciones tecnológicas integrales.

## 🚀 Características

- ✅ Sitio público con 6 páginas de servicios
- ✅ Sistema de autenticación con Supabase
- ✅ Panel de clientes con dashboard interactivo
- ✅ Diseño 100% responsive (Mobile, Tablet, Desktop)
- ✅ Animaciones suaves y micro-interacciones
- ✅ WhatsApp flotante integrado
- ✅ Backend PostgreSQL con Supabase
- ✅ Sin frameworks (Vanilla HTML/CSS/JS)

## 📁 Estructura de Archivos

```
web-patagonia/
├── index.html                      # Página principal
├── hosting.html                    # Servicios de Hosting y Docker
├── telecomunicaciones.html         # Servicios de Telecomunicaciones
├── informatica.html                # Desarrollo Web e Informática
├── electricidad.html               # Ingeniería Eléctrica SEC A
├── seguridad.html                  # Seguridad Electrónica
├── login.html                      # Login de clientes
├── register.html                   # Registro de nuevos clientes
├── panel/
│   ├── dashboard.html              # Dashboard del cliente
│   ├── servicios.html              # Gestión de servicios
│   └── facturas.html               # Gestión de facturas
└── assets/
    ├── css/
    │   ├── styles.css              # Estilos sitio público
    │   └── panel.css               # Estilos panel de clientes
    └── js/
        ├── script.js               # JavaScript sitio público
        ├── supabase-config.js      # Configuración Supabase
        ├── auth.js                 # Autenticación Supabase
        └── panel.js                # Lógica del panel
```

## ⚙️ Instalación

### 1. Descargar el proyecto

No requiere instalación. Solo necesitas los archivos HTML y un servidor web.

### 2. Configurar Supabase

Este proyecto usa **Supabase** para autenticación y base de datos. Debes configurar tu propio proyecto Supabase:

#### Paso 1: Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Clic en "Start your project"
3. Crea una cuenta o inicia sesión
4. Clic en "New Project"
5. Nombre: `patagonia-automatiza` (o el que prefieras)
6. Database Password: **Guarda esta contraseña**
7. Region: `South America (São Paulo)`
8. Clic en "Create new project"

#### Paso 2: Obtener credenciales

1. En tu proyecto Supabase, ve a **Settings** > **API**
2. Copia:
   - **Project URL**
   - **anon / public key**

#### Paso 3: Configurar en el código

Abre el archivo `assets/js/supabase-config.js` y reemplaza las credenciales:

```javascript
const SUPABASE_URL = 'https://tu-proyecto.supabase.co'; // ⚠️ REEMPLAZAR
const SUPABASE_ANON_KEY = 'eyXXXXXXXXXXXXXXXXX'; // ⚠️ REEMPLAZAR
```

#### Paso 4: Crear tablas en Supabase

Ve a **SQL Editor** en Supabase y ejecuta este script:

```sql
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
```

#### Paso 5: Habilitar Email Auth

1. Ve a **Authentication** > **Providers**
2. Activa **Email**
3. Desactiva "Confirm email" si quieres pruebas rápidas (opcional)

## 🌐 Despliegue

### Opción 1: Servidor Local (Desarrollo)

Puedes usar cualquier servidor local. Por ejemplo:

**Python:**

```bash
# Python 3
python -m http.server 8000
```

**PHP:**

```bash
php -S localhost:8000
```

**VS Code Live Server:**

- Instala la extensión "Live Server"
- Clic derecho en `index.html` > "Open with Live Server"

Luego visita: `http://localhost:8000`

### Opción 2: Hosting Gratuito

Puedes desplegar gratis en:

#### Netlify

```bash
# Arrastra la carpeta del proyecto al sitio netlify.com/drop
```

#### Vercel

```bash
npm i -g vercel
vercel
```

#### GitHub Pages

```bash
# 1. Crea un repositorio en GitHub
# 2. Sube los archivos
# 3. Ve a Settings > Pages
# 4. Source: Deploy from branch main
```

## 🎨 Paleta de Colores

```css
--primary: #0066ff;      /* Azul principal */
--secondary: #64ffda;    /* Cyan/Turquesa */
--dark: #0a0e27;         /* Fondo principal */
--dark-alt: #141938;     /* Fondo alternativo */
--light: #ccd6f6;        /* Texto claro */
--gray: #8892b0;         /* Texto secundario */
--success: #00ff88;      /* Verde éxito */
--warning: #ffa500;      /* Naranja advertencia */
--danger: #ff4444;       /* Rojo peligro */
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 968px
- **Desktop**: > 968px

## 🔐 Uso del Panel de Clientes

### Registro

1. Ir a `register.html`
2. Completar el formulario
3. Se crea automáticamente el usuario en Supabase Auth y tabla clientes

### Login

1. Ir a `login.html`
2. Ingresar email y contraseña
3. Opción "Recordarme" para persistencia de sesión

### Dashboard

El dashboard carga automáticamente:

- Estadísticas de servicios activos
- Facturas pendientes
- Tickets de soporte
- Próximo vencimiento

## 📊 Agregar Datos de Prueba

Para probar el panel, agrega datos manualmente en Supabase:

1. Ve a **Table Editor** en Supabase
2. Agrega registros a las tablas `servicios`, `facturas`, `tickets`
3. Usa el `id` del usuario autenticado como `cliente_id`

**Ejemplo de servicio:**

```sql
INSERT INTO servicios (cliente_id, tipo, plan, dominio, estado, precio, fecha_vencimiento)
VALUES (
  'uid-del-usuario',
  'hosting',
  'Plan Básico',
  'ejemplo.com',
  'activo',
  8250,
  NOW() + INTERVAL '30 days'
);
```

## 📞 Información de Contacto

La información de contacto está hardcodeada en los archivos HTML. Para cambiarla:

- **Teléfono**: `+54 280 497 6552`
- **Email**: `soporte@patagoniaautomatiza.com`
- **WhatsApp**: `https://wa.me/5402804976552`

Busca y reemplaza en todos los archivos HTML.

## 🛠️ Tecnologías Utilizadas

- HTML5
- CSS3 (Vanilla, sin frameworks)
- JavaScript (Vanilla, ES6+)
- Supabase Authentication
- Supabase PostgreSQL
- Google Fonts (Outfit)

## ⚠️ Notas Importantes

1. **Supabase es necesario**: El panel de clientes NO funcionará sin configurar Supabase correctamente.

2. **HTTPS requerido**: Supabase Auth requiere HTTPS en producción. En local funciona con `localhost`.

3. **Datos de demo**: Para probar el panel, debes agregar datos manualmente en Supabase.

4. **Seguridad**: Las políticas RLS incluidas son básicas. Para producción, considera agregar validaciones más estrictas.

## 📄 Licencia

© 2026 Patagonia Automatiza. Todos los derechos reservados.

---

**Desarrollado con ❤️ en Argentina**
