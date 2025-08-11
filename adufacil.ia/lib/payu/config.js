// Configuración PayU Colombia
export const PAYU_CONFIG = {
  // Sandbox para desarrollo
  sandbox: {
    apiUrl: 'https://sandbox.api.payulatam.com/reports-api/4.0/service.cgi',
    paymentsUrl: 'https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/',
    merchantId: '508029', // Sandbox merchant ID
    accountId: '512321', // Sandbox account ID Colombia
    apiKey: '4Vj8eK4rloUd272L48hsrarnUA', // Sandbox API Key
    apiLogin: 'pRRXKOl8ikMmt9u' // Sandbox API Login
  },
  
  // Producción (configurar cuando tengas cuenta real)
  production: {
    apiUrl: 'https://api.payulatam.com/reports-api/4.0/service.cgi',
    paymentsUrl: 'https://checkout.payulatam.com/ppp-web-gateway-payu/',
    merchantId: process.env.PAYU_MERCHANT_ID,
    accountId: process.env.PAYU_ACCOUNT_ID,
    apiKey: process.env.PAYU_API_KEY,
    apiLogin: process.env.PAYU_API_LOGIN
  },
  
  // Configuración general
  currency: 'COP',
  country: 'CO',
  language: 'es',
  
  // Métodos de pago disponibles en Colombia
  paymentMethods: [
    {
      id: 'PSE',
      name: 'PSE - Pagos Seguros en Línea',
      description: 'Paga directamente desde tu banco',
      icon: 'bank',
      popular: true
    },
    {
      id: 'NEQUI',
      name: 'Nequi',
      description: 'Pago móvil instantáneo',
      icon: 'mobile',
      popular: true
    },
    {
      id: 'DAVIPLATA',
      name: 'DaviPlata',
      description: 'Billetera digital Davivienda',
      icon: 'wallet',
      popular: true
    },
    {
      id: 'BANCOLOMBIA_COLLECT',
      name: 'Bancolombia Personas',
      description: 'Transferencia desde Bancolombia',
      icon: 'bank',
      popular: false
    },
    {
      id: 'CREDIT_CARD',
      name: 'Tarjeta de Crédito',
      description: 'Visa, Mastercard, Amex',
      icon: 'credit-card',
      popular: false
    },
    {
      id: 'DEBIT_CARD',
      name: 'Tarjeta Débito',
      description: 'Débito Visa o Mastercard',
      icon: 'credit-card',
      popular: false
    }
  ],
  
  // Planes de suscripción en COP
  plans: {
    starter: {
      id: 'starter',
      name: 'Starter',
      price: 89000, // COP
      priceDisplay: '$89.000',
      currency: 'COP',
      interval: 'month',
      documentsLimit: 50,
      features: [
        'Procesamiento IA básico',
        'Dashboard con métricas',
        'Export PDF y Excel',
        'Soporte email'
      ]
    },
    professional: {
      id: 'professional',
      name: 'Professional', 
      price: 299000, // COP
      priceDisplay: '$299.000',
      currency: 'COP',
      interval: 'month',
      documentsLimit: 500,
      features: [
        'Todo lo de Starter',
        'API access',
        'Integraciones personalizadas',
        'Soporte prioritario',
        'Analytics avanzados'
      ]
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      price: 899000, // COP
      priceDisplay: '$899.000',
      currency: 'COP', 
      interval: 'month',
      documentsLimit: 9999,
      features: [
        'Todo lo de Professional',
        'Documentos ilimitados',
        'Onboarding dedicado',
        'SLA garantizado',
        'Integración DIAN directa'
      ]
    }
  }
};

// Obtener configuración según ambiente
export const getPayUConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production' && process.env.PAYU_MERCHANT_ID;
  return isProduction ? PAYU_CONFIG.production : PAYU_CONFIG.sandbox;
};

// URLs de respuesta
export const PAYU_RESPONSE_URLS = {
  confirmationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payu/confirmation`,
  responseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/response`,
  pendingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`
};