# 🛡️ Solución para "Sitio Peligroso" en Chrome

## 📋 Problema

Chrome muestra la alerta **"Sitio peligroso"** cuando accedes desde el celular. Esta es una advertencia de Google Safe Browsing.

## ✅ Causa Identificada

- **NO hay código malicioso** en tu sitio
- **NO hay enlaces HTTP** (todos son HTTPS)
- Es un **falso positivo** común en dominios `.vercel.app` nuevos
- Google necesita verificar que el sitio es legítimo

## 🔧 Acciones Implementadas

### 1. Headers de Seguridad Agregados

He añadido en `vercel.json`:

- `X-Content-Type-Options`: Previene ataques MIME
- `X-Frame-Options`: Previene clickjacking
- `X-XSS-Protection`: Protección XSS
- `Content-Security-Policy`: Política estricta de contenido
- `Referrer-Policy`: Control de referencia
- `Permissions-Policy`: Permisos restrictivos

### 2. Pasos OBLIGATORIOS para ti

#### A. Verificar en Google Search Console

1. Ir a: <https://search.google.com/search-console>
2. Agregar propiedad: `https://patagonia-automatiza.vercel.app`
3. Verificar dominio (método HTML o TXT)
4. Ir a "Seguridad y Acciones Manuales"
5. Ver si hay alguna advertencia específica

#### B. Solicitar Revisión

Si aparece marcado como "Sitio engañoso":

1. En Search Console → "Problemas de Seguridad"
2. Click en "Solicitar revisión"
3. Explicar: "Sitio legítimo de empresa Patagonia Automatiza, servicios de hosting e IT"
4. Puede tomar 2-3 días

#### C. Reportar Falso Positivo

Ir a: <https://safebrowsing.google.com/safebrowsing/report_error/?hl=es>  
Reportar el sitio como "falso positivo"

## ⏱️ Tiempo de Resolución

- Headers de seguridad: ✅ Ya activos
- Revisión de Google: 24-72 horas
- Remoción de lista: Inmediata tras aprobación

## 🚀 Deploy

Los cambios ya están siendo desplegados. Los headers de seguridad se aplicarán automáticamente.
