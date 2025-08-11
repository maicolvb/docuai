import { NextResponse } from 'next/server';
import { CustomsValidator } from './customs-validator.js';

const validator = new CustomsValidator();

export async function POST(request) {
  try {
    const { imageData, documentType = 'general', validationLevel = 'strict' } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Imagen requerida para procesamiento aduanero' },
        { status: 400 }
      );
    }

    // Procesar documento con validación especializada
    const result = await validator.processCustomsDocument(imageData, documentType);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        recommendation: 'Revisar calidad de imagen y reintentear',
        requiresManualReview: true
      }, { status: 400 });
    }

    // Evaluar si requiere revisión humana
    const response = {
      success: true,
      documentType: result.documentType,
      processingConfidence: result.confidence,
      
      // Datos extraídos estructurados
      extractedFields: {
        hsCodes: result.extractedData.hsCodes,
        monetaryValues: {
          cif: result.extractedData.cifValues,
          fob: result.extractedData.fobValues,
          currency: result.validation.fieldValidations.values?.currency
        },
        logistics: {
          weights: result.extractedData.weights,
          countryCodes: result.extractedData.countryCodes
        },
        identification: {
          invoiceNumbers: result.extractedData.invoiceNumbers,
          serialNumbers: result.extractedData.serialNumbers,
          dates: result.extractedData.dates
        }
      },
      
      // Estado de validación
      validation: {
        overallStatus: result.confidence >= 0.95 ? 'APPROVED' : result.confidence >= 0.90 ? 'REVIEW_RECOMMENDED' : 'REQUIRES_REVIEW',
        confidence: result.confidence,
        criticalErrors: result.criticalErrors,
        warnings: result.warnings,
        fieldValidations: result.validation.fieldValidations
      },
      
      // Acciones recomendadas
      actions: {
        requiresHumanReview: result.requiresHumanReview,
        canProceedAutomatically: result.confidence >= 0.95,
        recommendedActions: generateRecommendations(result)
      },
      
      // Para integración con sistemas aduaneros
      exportData: {
        pedimento: generatePedimentoData(result.extractedData),
        manifestCargo: generateManifestData(result.extractedData),
        factura: generateInvoiceData(result.extractedData)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error en procesamiento aduanero:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno en validación aduanera',
      requiresManualReview: true,
      details: process.env.NODE_ENV === 'development' ? error.message : null
    }, { status: 500 });
  }
}

function generateRecommendations(result) {
  const recommendations = [];
  
  if (result.confidence < 0.95) {
    recommendations.push('Revisión manual recomendada para documentos oficiales');
  }
  
  if (result.criticalErrors.length > 0) {
    recommendations.push('Corregir errores críticos antes de procesar');
  }
  
  if (!result.extractedData.hsCodes.length) {
    recommendations.push('Verificar códigos de clasificación arancelaria');
  }
  
  return recommendations;
}

function generatePedimentoData(data) {
  // Estructura para pedimento aduanero mexicano
  return {
    fraccionArancelaria: data.hsCodes[0]?.value || '',
    valorComercial: data.cifValues[0]?.value || 0,
    pesoNeto: data.weights[0]?.inKilograms || 0,
    paisOrigen: data.countryCodes[0]?.standardized || '',
    numeroFactura: data.invoiceNumbers[0]?.value || ''
  };
}

function generateManifestData(data) {
  return {
    hsCode: data.hsCodes[0]?.standardized || '',
    declaredValue: data.fobValues[0]?.value || 0,
    grossWeight: data.weights.reduce((sum, w) => sum + w.inKilograms, 0),
    originCountry: data.countryCodes[0]?.standardized || ''
  };
}

function generateInvoiceData(data) {
  return {
    invoiceNumber: data.invoiceNumbers[0]?.value || '',
    totalValue: data.cifValues.reduce((sum, v) => sum + v.value, 0),
    currency: data.currencies[0] || 'USD',
    itemsWithHS: data.hsCodes.map(hs => ({
      hsCode: hs.standardized,
      description: 'Extracted from document'
    }))
  };
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Procesamiento Especializado de Documentos Aduaneros',
    features: [
      'Extracción precisa de códigos HS/TARIC',
      'Validación de valores CIF/FOB',
      'Verificación de códigos de país ISO',
      'Análisis de pesos y medidas',
      'Detección de inconsistencias críticas',
      'Generación de datos para pedimentos',
      'Recomendaciones de revisión humana'
    ],
    requiredFields: [
      'imageData (base64)',
      'documentType (opcional): bill_of_lading, commercial_invoice, packing_list',
      'validationLevel (opcional): strict, standard, permissive'
    ],
    confidenceThresholds: {
      automatic: '≥ 95%',
      reviewRecommended: '90-94%',
      manualRequired: '< 90%'
    }
  });
}