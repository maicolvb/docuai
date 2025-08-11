import { NextRequest, NextResponse } from 'next/server';
import { DIANTaxCalculator } from '@/lib/dian/tax-calculator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos requeridos
    const { totalValue, products, origin, weight, currency } = body;
    
    if (!totalValue || !products || !origin || !weight) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan datos requeridos: totalValue, products, origin, weight' 
        },
        { status: 400 }
      );
    }

    // Convertir a USD si es necesario
    const valueInUSD = await convertToUSD(totalValue, currency);
    
    // Inicializar calculadora
    const calculator = new DIANTaxCalculator();
    
    // Obtener descripción del primer producto
    const productDescription = Array.isArray(products) 
      ? products[0] 
      : products.toString();
    
    // Calcular impuestos
    const taxCalculation = calculator.calculateImportTaxes(
      valueInUSD,
      productDescription,
      origin,
      weight
    );

    // Obtener información adicional
    const hsCode = taxCalculation.breakdown.find(item => 
      item.concept === 'Arancel'
    )?.description?.match(/(\d{4}\.\d{2}\.\d{2})/)?.[0] || 'N/A';
    
    const restrictions = calculator.getImportRestrictions(hsCode);
    const processingTime = calculator.estimateProcessingTime(
      valueInUSD, 
      restrictions.length > 0
    );

    // Preparar respuesta completa
    const response = {
      success: true,
      data: {
        calculation: taxCalculation,
        additionalInfo: {
          hsCode,
          restrictions,
          estimatedProcessingDays: processingTime,
          currency: 'USD',
          exchangeRate: currency === 'USD' ? 1 : await getExchangeRate(currency),
          calculatedAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
        },
        warnings: generateWarnings(taxCalculation, valueInUSD, restrictions),
        recommendations: generateRecommendations(taxCalculation, origin, restrictions)
      },
      message: 'Cálculo de impuestos completado exitosamente'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error calculating taxes:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al calcular impuestos'
      },
      { status: 500 }
    );
  }
}

/**
 * Convierte valor a USD usando tasas de cambio actuales
 */
async function convertToUSD(value: number, currency: string): Promise<number> {
  if (!currency || currency === 'USD') {
    return value;
  }

  try {
    const rate = await getExchangeRate(currency);
    return Math.round(value / rate * 100) / 100; // Redondear a 2 decimales
  } catch (error) {
    console.warn('Error getting exchange rate, using original value:', error);
    return value;
  }
}

/**
 * Obtiene tasa de cambio actual (mock - en producción usar API real)
 */
async function getExchangeRate(fromCurrency: string): Promise<number> {
  // Mock de tasas de cambio (en producción, usar API como exchangerate-api.com)
  const mockRates: { [key: string]: number } = {
    'COP': 4000,  // 1 USD = 4000 COP
    'EUR': 0.85,  // 1 USD = 0.85 EUR
    'CNY': 7.2,   // 1 USD = 7.2 CNY
    'MXN': 18,    // 1 USD = 18 MXN
  };

  return mockRates[fromCurrency] || 1;
}

/**
 * Genera advertencias basadas en el cálculo
 */
function generateWarnings(taxCalculation: any, value: number, restrictions: string[]): string[] {
  const warnings: string[] = [];

  if (value > 200000) {
    warnings.push('⚠️ Importación de alto valor - requiere garantía bancaria');
  }

  if (taxCalculation.totalTaxes > value * 0.5) {
    warnings.push('⚠️ Los impuestos representan más del 50% del valor FOB');
  }

  if (restrictions.length > 0) {
    warnings.push('⚠️ Producto sujeto a restricciones especiales');
  }

  if (taxCalculation.arancelRate > 20) {
    warnings.push('⚠️ Alta tasa arancelaria - considere verificar clasificación');
  }

  return warnings;
}

/**
 * Genera recomendaciones para optimizar la importación
 */
function generateRecommendations(taxCalculation: any, origin: string, restrictions: string[]): string[] {
  const recommendations: string[] = [];

  if (taxCalculation.arancelRate > 10) {
    recommendations.push('💡 Verifique si existe un TLC que reduzca el arancel');
  }

  if (restrictions.length > 0) {
    recommendations.push('💡 Gestione permisos previos para evitar demoras');
  }

  if (origin.toLowerCase().includes('china')) {
    recommendations.push('💡 Considere consolidar envíos para optimizar fletes');
  }

  recommendations.push('💡 Mantenga documentación completa para agilizar el proceso');

  return recommendations;
}

// Endpoint GET para testing
export async function GET() {
  return NextResponse.json({
    message: 'DIAN Tax Calculator API',
    status: 'active',
    version: '1.0.0',
    endpoints: {
      POST: 'Calculate import taxes',
      required_fields: ['totalValue', 'products', 'origin', 'weight'],
      optional_fields: ['currency']
    }
  });
}