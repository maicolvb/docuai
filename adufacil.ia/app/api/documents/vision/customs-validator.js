// Validador especializado para documentos aduaneros
import vision from '@google-cloud/vision';

export class CustomsDocumentValidator {
  constructor() {
    this.client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
    
    this.customsPatterns = {
      hsCode: /\b\d{4}\.\d{2}\.\d{2}\.\d{2}\b|\b\d{6,10}\b/g,
      cifValue: /CIF[:\s]*[\$€£¥]?\s*[\d,]+\.?\d*/gi,
      fobValue: /FOB[:\s]*[\$€£¥]?\s*[\d,]+\.?\d*/gi,
      countryCode: /\b[A-Z]{2,3}\b/g,
      weight: /\d+\.?\d*\s*(kg|g|ton|lb|oz)/gi,
      serialNumber: /\b[A-Z0-9]{6,}\b/g,
      invoiceNumber: /(?:invoice|factura|inv)[#:\s]*[A-Z0-9\-]+/gi
    };
  }

  async processCustomsDocument(imageData, documentType = 'general') {
    try {
      const [result] = await this.client.textDetection({
        image: { content: imageData.replace(/^data:image\/[a-z]+;base64,/, '') }
      });

      const detections = result.textAnnotations;
      if (!detections || detections.length === 0) {
        return {
          success: false,
          error: 'No se detectó texto en el documento',
          requiresManualReview: true
        };
      }

      const fullText = detections[0].description;
      const extractedData = this.extractCustomsFields(fullText);
      const validation = this.validateCustomsData(extractedData);
      
      return {
        success: true,
        documentType,
        extractedData,
        validation,
        confidence: validation.overallConfidence,
        requiresHumanReview: validation.overallConfidence < 0.95,
        criticalErrors: validation.criticalErrors,
        warnings: validation.warnings,
        rawText: fullText
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        requiresManualReview: true
      };
    }
  }

  extractCustomsFields(text) {
    return {
      hsCodes: this.extractWithPosition(text, this.customsPatterns.hsCode),
      cifValues: this.extractWithPosition(text, this.customsPatterns.cifValue),
      fobValues: this.extractWithPosition(text, this.customsPatterns.fobValue),
      countryCodes: this.extractWithPosition(text, this.customsPatterns.countryCode),
      weights: this.extractWithPosition(text, this.customsPatterns.weight),
      serialNumbers: this.extractWithPosition(text, this.customsPatterns.serialNumber),
      invoiceNumbers: this.extractWithPosition(text, this.customsPatterns.invoiceNumber),
      dates: this.extractDates(text),
      currencies: this.extractCurrencies(text)
    };
  }

  extractWithPosition(text, pattern) {
    const matches = [];
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      matches.push({
        value: match[0],
        position: match.index,
        confidence: this.calculateFieldConfidence(match[0], pattern)
      });
    }
    
    return matches;
  }

  validateCustomsData(data) {
    const validation = {
      overallConfidence: 0,
      criticalErrors: [],
      warnings: [],
      fieldValidations: {}
    };

    // Validar códigos HS
    validation.fieldValidations.hsCodes = this.validateHSCodes(data.hsCodes);
    
    // Validar valores monetarios
    validation.fieldValidations.values = this.validateMonetaryValues(data.cifValues, data.fobValues);
    
    // Validar códigos de país
    validation.fieldValidations.countries = this.validateCountryCodes(data.countryCodes);
    
    // Validar pesos y medidas
    validation.fieldValidations.weights = this.validateWeights(data.weights);
    
    // Calcular confianza general
    validation.overallConfidence = this.calculateOverallConfidence(validation.fieldValidations);
    
    // Identificar errores críticos
    if (validation.overallConfidence < 0.9) {
      validation.criticalErrors.push('Confianza general por debajo del umbral seguro');
    }
    
    return validation;
  }

  validateHSCodes(hsCodes) {
    const validCodes = [];
    const invalidCodes = [];
    
    hsCodes.forEach(code => {
      // Validación básica de formato HS
      const cleanCode = code.value.replace(/\D/g, '');
      if (cleanCode.length >= 4 && cleanCode.length <= 10) {
        validCodes.push({
          ...code,
          standardized: this.formatHSCode(cleanCode)
        });
      } else {
        invalidCodes.push(code);
      }
    });
    
    return {
      valid: validCodes,
      invalid: invalidCodes,
      confidence: validCodes.length > 0 ? 0.9 : 0.3
    };
  }

  validateMonetaryValues(cifValues, fobValues) {
    const validation = {
      cifTotal: 0,
      fobTotal: 0,
      currency: null,
      inconsistencies: []
    };
    
    // Extraer y validar valores CIF
    cifValues.forEach(cif => {
      const amount = this.parseMonetaryAmount(cif.value);
      if (amount.value > 0) {
        validation.cifTotal += amount.value;
        if (!validation.currency) validation.currency = amount.currency;
      }
    });
    
    // Extraer y validar valores FOB
    fobValues.forEach(fob => {
      const amount = this.parseMonetaryAmount(fob.value);
      if (amount.value > 0) {
        validation.fobTotal += amount.value;
      }
    });
    
    // Validar lógica comercial: CIF debe ser >= FOB
    if (validation.cifTotal > 0 && validation.fobTotal > 0) {
      if (validation.cifTotal < validation.fobTotal) {
        validation.inconsistencies.push('CIF no puede ser menor que FOB');
      }
    }
    
    return validation;
  }

  validateCountryCodes(countryCodes) {
    // Lista de códigos ISO válidos (simplificada)
    const validISO = ['US', 'MX', 'CA', 'CN', 'DE', 'ES', 'FR', 'IT', 'BR', 'AR', 'CO', 'PE', 'CL'];
    
    return countryCodes.map(code => ({
      ...code,
      isValid: validISO.includes(code.value.toUpperCase()),
      standardized: code.value.toUpperCase()
    }));
  }

  validateWeights(weights) {
    return weights.map(weight => {
      const parsed = this.parseWeight(weight.value);
      return {
        ...weight,
        standardized: parsed,
        isValid: parsed.value > 0,
        inKilograms: this.convertToKg(parsed)
      };
    });
  }

  // Métodos auxiliares
  calculateFieldConfidence(value, pattern) {
    // Lógica para calcular confianza basada en coincidencia de patrón
    return 0.85; // Implementación simplificada
  }

  calculateOverallConfidence(fieldValidations) {
    const weights = {
      hsCodes: 0.3,
      values: 0.25,
      countries: 0.2,
      weights: 0.25
    };
    
    let totalConfidence = 0;
    Object.keys(weights).forEach(field => {
      if (fieldValidations[field] && fieldValidations[field].confidence) {
        totalConfidence += fieldValidations[field].confidence * weights[field];
      }
    });
    
    return Math.min(totalConfidence, 0.99); // Nunca 100% para documentos legales
  }

  formatHSCode(code) {
    // Formato estándar: XXXX.XX.XX.XX
    if (code.length >= 6) {
      return `${code.substr(0,4)}.${code.substr(4,2)}.${code.substr(6,2)}.${code.substr(8,2) || '00'}`;
    }
    return code;
  }

  parseMonetaryAmount(text) {
    const amount = text.replace(/[^\d.,]/g, '');
    const value = parseFloat(amount.replace(',', ''));
    const currency = text.match(/[\$€£¥]/)?.[0] || 'USD';
    
    return { value: value || 0, currency };
  }

  parseWeight(text) {
    const value = parseFloat(text.match(/\d+\.?\d*/)?.[0] || 0);
    const unit = text.match(/(kg|g|ton|lb|oz)/i)?.[0].toLowerCase() || 'kg';
    
    return { value, unit };
  }

  convertToKg(weight) {
    const conversions = {
      'g': 0.001,
      'kg': 1,
      'ton': 1000,
      'lb': 0.453592,
      'oz': 0.0283495
    };
    
    return weight.value * (conversions[weight.unit] || 1);
  }

  extractDates(text) {
    const datePatterns = [
      /\d{1,2}\/\d{1,2}\/\d{4}/g,
      /\d{1,2}-\d{1,2}-\d{4}/g,
      /\d{4}-\d{1,2}-\d{1,2}/g
    ];
    
    const dates = [];
    datePatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        dates.push({
          value: match,
          standardized: this.standardizeDate(match)
        });
      });
    });
    
    return dates;
  }

  extractCurrencies(text) {
    const currencyPattern = /\b(USD|EUR|GBP|JPY|MXN|CAD|CNY)\b/gi;
    return text.match(currencyPattern) || [];
  }

  standardizeDate(dateStr) {
    // Convertir a formato ISO 8601
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  }
}