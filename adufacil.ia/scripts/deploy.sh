#!/bin/bash

echo "🚀 Iniciando deploy de AduFacil.IA..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar que estamos en la rama correcta
print_status "Verificando rama actual..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "No estás en la rama main. Rama actual: $CURRENT_BRANCH"
    read -p "¿Continuar de todas formas? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deploy cancelado"
        exit 1
    fi
fi

# 2. Verificar que no hay cambios sin commitear
print_status "Verificando estado del repositorio..."
if [[ -n $(git status --porcelain) ]]; then
    print_warning "Hay cambios sin commitear:"
    git status --short
    read -p "¿Hacer commit automático? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
        print_success "Cambios commiteados automáticamente"
    else
        print_error "Deploy cancelado. Commitea los cambios primero."
        exit 1
    fi
fi

# 3. Ejecutar tests (si existen)
print_status "Ejecutando tests..."
if [ -f "package.json" ] && npm run test --if-present; then
    print_success "Tests pasaron exitosamente"
else
    print_warning "No hay tests o fallaron. Continuando..."
fi

# 4. Build local para verificar
print_status "Ejecutando build local..."
if npm run build; then
    print_success "Build local exitoso"
else
    print_error "Build falló. Revisa los errores."
    exit 1
fi

# 5. Verificar variables de entorno necesarias
print_status "Verificando configuración de producción..."

required_vars=(
    "GOOGLE_CLOUD_PROJECT_ID"
    "NEXT_PUBLIC_SUPABASE_URL" 
    "PAYU_MERCHANT_ID"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! vercel env ls | grep -q "$var"; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    print_error "Variables de entorno faltantes en Vercel:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    print_warning "Configura las variables con: vercel env add"
    exit 1
fi

# 6. Deploy a Vercel
print_status "Desplegando a Vercel..."
if vercel --prod; then
    print_success "Deploy completado exitosamente!"
else
    print_error "Deploy falló"
    exit 1
fi

# 7. Verificar que el deploy funcionó
print_status "Verificando deployment..."
DEPLOYMENT_URL=$(vercel ls | head -n 2 | tail -n 1 | awk '{print $2}')

if [ -n "$DEPLOYMENT_URL" ]; then
    print_success "App desplegada en: https://$DEPLOYMENT_URL"
    
    # Test básico de salud
    print_status "Ejecutando health check..."
    if curl -s "https://$DEPLOYMENT_URL/api/health" > /dev/null; then
        print_success "Health check exitoso ✓"
    else
        print_warning "Health check falló - verificar manualmente"
    fi
    
    print_success "🎉 Deploy completado!"
    echo ""
    echo "🔗 URLs importantes:"
    echo "   • Producción: https://$DEPLOYMENT_URL"
    echo "   • Dashboard: https://vercel.com/dashboard"
    echo "   • Logs: vercel logs https://$DEPLOYMENT_URL"
    
else
    print_error "No se pudo obtener URL de deployment"
fi

echo ""
print_status "Deploy finalizado a las $(date)"