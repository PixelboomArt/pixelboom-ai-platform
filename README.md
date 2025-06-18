# Pixelboom AI Platform - Embedded Shopify App

Herramienta de diseño con IA para generar arte cyberpunk, embebida en Shopify.

## 🎯 Función

App embebida en Shopify para:
- Generar arte con IA (Replicate/Stable Diffusion/flush)
- Subir diseños propios
- Previsualizar en mockups dinámicos
- Crear Draft Order y redirigir al checkout de Shopify

## 🚀 Estado Actual

- ✅ Interfaz completa
- ✅ Sistema de créditos
- ✅ Detección automática vertical/horizontal
- ✅ 4 mockups dinámicos configurados
- ✅ Imágenes de fondo no cargan (problema del entorno Claude)
- ⏳ Integración con APIs
- ⏳ Conexión con Shopify Draft Orders

## 📁 Archivos

- `PixelboomGenerator.tsx` - Código principal
- `/mockups/` - Imágenes de fondo

## 🔧 Integración Shopify

1. Subir a Shopify como Embedded App
2. Configurar Draft Orders API
3. El checkout se maneja en Shopify (no en esta app)

4. ## 🔧 Tecnologías

- React
- Tailwind CSS
- Cloudinary (imágenes)
- Próximamente: Replicate API, Supabase, Shopify

## 📝 Nota

Esta es solo la interfaz de diseño. El pago, envío y todo lo demás lo gestiona Shopify.
