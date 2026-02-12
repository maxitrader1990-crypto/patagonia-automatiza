# URLs del Sitio - Patagonia Automatiza

## 🌐 URL Base de Vercel

`https://patagonia-automatiza.vercel.app` (o la que Vercel te asignó)

## 📄 Páginas Públicas (Accesibles desde cualquier dispositivo)

### Página Principal

- **URL**: `https://TU-URL.vercel.app/`
- **O**: `https://TU-URL.vercel.app/index.html`

### Servicios

- **Hosting**: `https://TU-URL.vercel.app/hosting.html`
- **Telecomunicaciones**: `https://TU-URL.vercel.app/telecomunicaciones.html`
- **Informática**: `https://TU-URL.vercel.app/informatica.html`
- **Electricidad**: `https://TU-URL.vercel.app/electricidad.html`
- **Seguridad**: `https://TU-URL.vercel.app/seguridad.html`

### Autenticación

- **Login**: `https://TU-URL.vercel.app/login.html`
- **Registro**: `https://TU-URL.vercel.app/register.html`

## 🔒 Panel de Clientes (Requiere login)

- **Dashboard**: `https://TU-URL.vercel.app/panel/dashboard.html`
- **Servicios**: `https://TU-URL.vercel.app/panel/servicios.html`
- **Facturas**: `https://TU-URL.vercel.app/panel/facturas.html`

---

## ⚠️ Errores Comunes

### 404 Not Found

Si recibes este error, verifica:

1. **URL correcta**: Asegúrate de incluir `.html` al final
   - ❌ `https://tu-url.vercel.app/login`
   - ✅ `https://tu-url.vercel.app/login.html`

2. **Mayúsculas/Minúsculas**: Las URLs son case-sensitive
   - ❌ `https://tu-url.vercel.app/Login.html`
   - ✅ `https://tu-url.vercel.app/login.html`

3. **Carpeta panel**: No olvides la carpeta para el panel
   - ❌ `https://tu-url.vercel.app/dashboard.html`
   - ✅ `https://tu-url.vercel.app/panel/dashboard.html`

### Página en blanco

Si la página carga pero está en blanco:

- Verifica que las credenciales de Supabase estén correctas en `supabase-config.js`
- Abre la consola del navegador (F12) para ver errores

---

## 📱 Responsive Design

✅ **Todas las páginas están optimizadas para móviles**

- Breakpoints automáticos: Mobile (<768px), Tablet (768-968px), Desktop (>968px)
- Navegación adaptativa con menú hamburguesa
- Cards y tablas que se reorganizan automáticamente

---

## 🔧 Solución Rápida

Si continúas con 404:

1. Ve a tu dashboard de Vercel
2. Busca tu proyecto "patagonia-automatiza"
3. Verifica el último deployment
4. Comprueba que todos los archivos HTML estén en el deployment
5. Redeploy si es necesario

---

**Reemplaza `TU-URL` con la URL real que Vercel te asignó**
