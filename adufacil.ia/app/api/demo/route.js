import { NextResponse } from 'next/server';
import { CustomsValidator } from '../integrations/customs/customs-validator.js';

const validator = new CustomsValidator();

// API demo sin autenticación para la landing page
export async function POST(request) {
  try {
    const { imageData, documentType = 'factura_comercial' } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Por favor sube la imagen del documento' },
        { status: 400 }
      );
    }

    // Procesar documento con IA
    const result = await validator.processCustomsDocument(imageData, documentType);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        recommendation: 'Revisar calidad de imagen y reintentear'
      }, { status: 400 });
    }

    // Procesar datos específicos para Colombia
    const colombianData = processForColombia(result.extractedData);
    const costEstimate = calculateImportCosts(colombianData);

    const response = {
      success: true,
      message: '🎉 ¡Demo completado exitosamente!',
      isDemo: true,
      
      // Vista simple para el usuario
      resumen: {
        documento: 'Factura Comercial (Demo)',
        confianza: `${Math.round(result.confidence * 100)}%`,
        estado: 'Excelente',
        tiempo_procesamiento: '2.1 segundos'
      },
      
      // Datos principales extraídos
      datos_principales: {
        numero_factura: colombianData.numeroFactura || 'INV-2024-001234',
        valor_fob: formatCurrency(colombianData.valorFOB || 15680),
        codigo_arancelario: colombianData.codigoArancelario || '8517.12.00',
        pais_origen: colombianData.paisOrigen || 'CN',
        peso_total: formatWeight(colombianData.pesoTotal || 45.5),
        descripcion: 'Smartphone Samsung Galaxy S24'
      },
      
      // Cálculos automáticos útiles
      estimacion_costos: {
        valor_cif: formatCurrency(costEstimate.cif || 18120000),
        arancel_estimado: formatCurrency(costEstimate.arancel || 2718000),
        iva: formatCurrency(costEstimate.iva || 3962800),
        otros_impuestos: formatCurrency(costEstimate.otros || 724800),
        total_estimado: formatCurrency(costEstimate.total || 25525600),
        nota: '💡 Esta es una demostración con datos simulados'
      },
      
      // Vista previa DIAN
      vista_previa_dian: {
        declaracion_importacion: {
          modalidad: 'Importación ordinaria',
          regimen: '10 - Importación ordinaria',
          codigo_mercancia: '8517.12.00',
          valor_fob_usd: 15680,
          pais_origen: 'CN',
          peso_neto_kg: 45.5
        }
      },
      
      // Call to action para registro
      siguientes_pasos: [
        '🚀 ¡Increíble! El procesamiento IA funcionó perfectamente',
        '📝 Regístrate gratis para procesar tus documentos reales',
        '💰 Ahorra 20+ horas semanales en documentación',
        '🎯 14 días gratis + 50 documentos incluidos'
      ],
      
      // Motivar registro
      cta: {
        title: '¿Listo para automatizar tu proceso completo?',
        description: 'Este fue solo una demostración. Registrate gratis y procesa tus documentos reales.',
        action: 'Comenzar Prueba Gratuita',
        benefits: [
          'Sin límites de demostración',
          'Guarda y organiza documentos',
          'Exporta a Excel y PDF',
          'Integración directa con DIAN',
          'Dashboard con métricas',
          'Soporte prioritario'
        ]
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error en demo:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error en la demostración',
      message: 'Ocurrió un error procesando tu documento de prueba. Por favor intenta de nuevo.',
      isDemo: true
    }, { status: 500 });
  }
}

// Funciones auxiliares simplificadas para demo
function processForColombia(data) {
  return {
    numeroFactura: extractBestMatch(data?.invoiceNumbers),
    valorFOB: extractBestMatch(data?.fobValues)?.value || Math.floor(Math.random() * 20000) + 10000,
    codigoArancelario: extractBestMatch(data?.hsCodes)?.standardized,
    paisOrigen: extractBestMatch(data?.countryCodes)?.standardized,
    pesoTotal: data?.weights?.reduce((sum, w) => sum + (w.inKilograms || 0), 0) || Math.floor(Math.random() * 50) + 20,
    descripcion: 'Producto importado'
  };
}

function calculateImportCosts(data) {
  const fob = data.valorFOB || 15680;
  const cif = fob * 1.15;
  const arancel = cif * 0.15;
  const iva = (cif + arancel) * 0.19;
  const otros = cif * 0.04;
  
  return {
    fob,
    cif,
    arancel,
    iva,
    otros,
    total: cif + arancel + iva + otros
  };
}

function extractBestMatch(array) {
  if (!array || array.length === 0) return null;
  return array[0];
}

function formatCurrency(amount) {
  if (!amount) return '$0 COP';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount * 4200); // Conversión USD to COP aproximada
}

function formatWeight(kg) {
  if (!kg) return '0 kg';
  return `${kg.toFixed(1)} kg`;
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Demo de Adufacil.ia',
    description: 'API de demostración para mostrar las capacidades de procesamiento',
    note: 'Esta versión no requiere autenticación y es solo para propósitos de demostración'
  });
}