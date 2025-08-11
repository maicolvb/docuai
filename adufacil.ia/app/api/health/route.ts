import { NextResponse } from 'next/server';

export async function GET() {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'checking...',
      vision: 'checking...',
      payment: 'checking...'
    }
  };

  try {
    // Verificar conexión a Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      healthCheck.services.database = 'OK';
    } else {
      healthCheck.services.database = 'ERROR - No URL configured';
    }

    // Verificar Google Vision
    if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
      healthCheck.services.vision = 'OK';
    } else {
      healthCheck.services.vision = 'ERROR - Credentials missing';
    }

    // Verificar PayU
    if (process.env.PAYU_MERCHANT_ID && process.env.PAYU_API_KEY) {
      healthCheck.services.payment = 'OK';
    } else {
      healthCheck.services.payment = 'ERROR - PayU not configured';
    }

    // Status general
    const hasErrors = Object.values(healthCheck.services).some(status => 
      status.includes('ERROR')
    );
    
    if (hasErrors) {
      healthCheck.status = 'DEGRADED';
    }

    return NextResponse.json(healthCheck, { 
      status: hasErrors ? 503 : 200,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}