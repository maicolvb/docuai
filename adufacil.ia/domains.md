# 🌐 Configuración de Dominio

## Opciones de Dominio

### Opción 1: Dominio Propio (Recomendado)
- **adufacil.com** o **adufacil.co** 
- **Ventajas**: Profesional, fácil de recordar, SEO
- **Costo**: ~$15-30 USD/año

### Opción 2: Subdominio Vercel (Gratis)
- **adufacil-ia.vercel.app**
- **Ventajas**: Gratis, SSL automático
- **Desventajas**: Menos profesional

## Configuración en Vercel

### 1. Comprar dominio
```bash
# En tu registrador favorito (Namecheap, GoDaddy, etc.)
adufacil.com
```

### 2. Agregar dominio en Vercel
```bash
vercel domains add adufacil.com
vercel domains add www.adufacil.com
```

### 3. Configurar DNS
```
# En tu registrador de dominio:
Type: A     Name: @       Value: 76.76.19.61
Type: CNAME Name: www     Value: cname.vercel-dns.com
```

### 4. SSL Automático
- Vercel configura SSL automáticamente
- Let's Encrypt renovación automática
- HTTP/2 habilitado por defecto

## Configuración de Subdominios

### API Dedicada
```
api.adufacil.com → Endpoints API
app.adufacil.com → Aplicación principal  
docs.adufacil.com → Documentación
```

### Marketing
```
www.adufacil.com → Landing principal
demo.adufacil.com → Demo interactivo
blog.adufacil.com → Blog/contenido
```

## Redirects y Rewrites

En `vercel.json`:
```json
{
  "redirects": [
    {
      "source": "/",
      "destination": "/calculator",
      "permanent": false
    }
  ],
  "rewrites": [
    {
      "source": "/docs/:path*",
      "destination": "/api/docs/:path*"
    }
  ]
}
```

## CDN y Performance

### Configuración automática de Vercel:
- ✅ CDN global (Edge Network)
- ✅ Compresión Gzip/Brotli  
- ✅ Cache inteligente
- ✅ Image optimization
- ✅ Static assets optimization

### Custom Headers para SEO:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options", 
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```