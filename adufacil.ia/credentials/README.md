# Credenciales de Google Cloud Vision

## ⚠️ IMPORTANTE: SEGURIDAD

**NUNCA subas archivos de credenciales a GitHub o repositorios públicos.**

## Configuración requerida

1. Coloca tu archivo de credenciales JSON aquí con el nombre: `google-vision-key.json`
2. Configura las siguientes variables de entorno:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-vision-key.json
GOOGLE_CLOUD_PROJECT_ID=tu-project-id-aqui
```

## Cómo obtener las credenciales

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Cloud Vision
4. Ve a "IAM y administración" > "Cuentas de servicio"
5. Crea una nueva cuenta de servicio
6. Descarga la clave JSON
7. Colócala en este directorio como `google-vision-key.json`

## Estructura esperada

```
credentials/
├── google-vision-key.json  # Tu archivo de credenciales (NO subir a Git)
├── .gitkeep               # Para mantener el directorio en Git
└── README.md              # Este archivo de documentación
```