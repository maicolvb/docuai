// Customs Validator for Colombian Import Documents
export class CustomsValidator {
  
  constructor() {
    this.validationRules = {
      // Required fields for customs declaration
      requiredFields: [
        'invoice_number',
        'supplier_name', 
        'supplier_country',
        'product_description',
        'unit_value',
        'total_value',
        'currency',
        'weight',
        'quantity'
      ],
      
      // HS Code validation patterns
      hsCodePattern: /^\d{4}\.\d{2}\.\d{2}\.\d{2}$/,
      
      // Supported currencies
      supportedCurrencies: ['USD', 'EUR', 'COP', 'CNY'],
      
      // Maximum values for validation
      maxValues: {
        totalValue: 1000000, // 1M USD
        weight: 50000, // 50 tons
        quantity: 100000
      }
    };
  }

  /**
   * Validates extracted document data for customs compliance
   */
  validateDocument(extractedData) {
    const validationResults = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Check required fields
    this.validateRequiredFields(extractedData, validationResults);
    
    // Validate data formats and ranges
    this.validateDataFormats(extractedData, validationResults);
    
    // Check for potential issues
    this.checkPotentialIssues(extractedData, validationResults);
    
    // Add suggestions for optimization
    this.addOptimizationSuggestions(extractedData, validationResults);

    return validationResults;
  }

  /**
   * Check if all required fields are present
   */
  validateRequiredFields(data, results) {
    const missing = this.validationRules.requiredFields.filter(field => {
      const value = data[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missing.length > 0) {
      results.errors.push(`Campos obligatorios faltantes: ${missing.join(', ')}`);
      results.isValid = false;
    }
  }

  /**
   * Validate data formats and value ranges
   */
  validateDataFormats(data, results) {
    // Validate currency
    if (data.currency && !this.validationRules.supportedCurrencies.includes(data.currency)) {
      results.warnings.push(`Moneda ${data.currency} no común en Colombia. Verifique tasa de cambio.`);
    }

    // Validate numerical values
    if (data.total_value && data.total_value > this.validationRules.maxValues.totalValue) {
      results.warnings.push(`Valor muy alto (${data.total_value}). Puede requerir garantías adicionales.`);
    }

    if (data.weight && data.weight > this.validationRules.maxValues.weight) {
      results.warnings.push(`Peso muy alto (${data.weight}kg). Verifique restricciones de transporte.`);
    }

    // Validate HS Code format if present
    if (data.hs_code && !this.validationRules.hsCodePattern.test(data.hs_code)) {
      results.warnings.push(`Formato de código HS inválido: ${data.hs_code}`);
    }

    // Check unit value consistency
    if (data.unit_value && data.quantity && data.total_value) {
      const calculatedTotal = data.unit_value * data.quantity;
      const variance = Math.abs(calculatedTotal - data.total_value) / data.total_value;
      
      if (variance > 0.05) { // 5% tolerance
        results.warnings.push(`Inconsistencia en valores: Unit(${data.unit_value}) × Qty(${data.quantity}) ≠ Total(${data.total_value})`);
      }
    }
  }

  /**
   * Check for potential customs issues
   */
  checkPotentialIssues(data, results) {
    // Check for high-risk countries (simplified list)
    const highRiskCountries = ['Afghanistan', 'Iran', 'North Korea', 'Syria'];
    if (data.supplier_country && highRiskCountries.some(country => 
      data.supplier_country.toLowerCase().includes(country.toLowerCase())
    )) {
      results.warnings.push(`País de origen de alto riesgo: ${data.supplier_country}. Puede requerir documentación adicional.`);
    }

    // Check for restricted products (simplified)
    const restrictedKeywords = ['weapon', 'ammunition', 'drug', 'narcotic', 'explosive'];
    if (data.product_description && restrictedKeywords.some(keyword =>
      data.product_description.toLowerCase().includes(keyword)
    )) {
      results.errors.push(`Producto potencialmente restringido detectado. Verifique permisos especiales.`);
      results.isValid = false;
    }

    // Check for unusual unit values
    if (data.unit_value) {
      if (data.unit_value < 0.01) {
        results.warnings.push(`Valor unitario muy bajo (${data.unit_value}). DIAN puede considerar subvaloración.`);
      } else if (data.unit_value > 50000) {
        results.warnings.push(`Valor unitario muy alto (${data.unit_value}). Puede requerir valoración adicional.`);
      }
    }
  }

  /**
   * Add optimization suggestions
   */
  addOptimizationSuggestions(data, results) {
    // Suggest HS code if missing
    if (!data.hs_code) {
      const suggestedCode = this.suggestHSCode(data.product_description);
      if (suggestedCode) {
        results.suggestions.push(`Código HS sugerido: ${suggestedCode} (verificar con clasificador oficial)`);
      }
    }

    // Suggest incoterm if missing
    if (!data.incoterm) {
      results.suggestions.push(`Considere especificar el Incoterm (FOB, CIF, etc.) para cálculos precisos.`);
    }

    // Currency optimization
    if (data.currency === 'COP' && data.total_value > 10000) {
      results.suggestions.push(`Para valores altos, considere usar USD para estabilidad cambiaria.`);
    }

    // Documentation suggestions
    results.suggestions.push(`Asegúrese de tener: Factura comercial, Lista de empaque, Conocimiento de embarque, Certificado de origen`);
  }

  /**
   * Suggest HS code based on product description (simplified)
   */
  suggestHSCode(productDescription) {
    if (!productDescription) return null;

    const description = productDescription.toLowerCase();
    
    // Simple keyword-based HS code suggestions
    const hsCodeMap = {
      'smartphone': '8517.12.00',
      'phone': '8517.12.00', 
      'mobile': '8517.12.00',
      'laptop': '8471.30.00',
      'computer': '8471.30.00',
      'tablet': '8471.30.00',
      'shirt': '6205.20.00',
      'pants': '6203.42.00',
      'shoes': '6403.99.00',
      'watch': '9102.21.00',
      'car': '8703.23.90',
      'motorcycle': '8711.20.00'
    };

    for (const [keyword, hsCode] of Object.entries(hsCodeMap)) {
      if (description.includes(keyword)) {
        return hsCode;
      }
    }

    return null;
  }

  /**
   * Calculate estimated processing time based on validation results
   */
  estimateProcessingTime(validationResults, documentType = 'standard') {
    let baseDays = 3; // Standard processing time
    
    // Add delays for errors and warnings
    if (validationResults.errors.length > 0) {
      baseDays += 5; // Major delays for errors
    }
    
    if (validationResults.warnings.length > 2) {
      baseDays += 2; // Additional review time
    }

    // Document type adjustments
    switch (documentType) {
      case 'first_time_importer':
        baseDays += 3;
        break;
      case 'restricted_product':
        baseDays += 7;
        break;
      case 'high_value':
        baseDays += 2;
        break;
    }

    return Math.min(baseDays, 15); // Cap at 15 days
  }

  /**
   * Generate compliance checklist
   */
  generateComplianceChecklist(extractedData) {
    return [
      {
        item: 'Factura comercial original',
        status: extractedData.invoice_number ? 'completed' : 'pending',
        required: true
      },
      {
        item: 'Lista de empaque detallada',
        status: extractedData.weight && extractedData.quantity ? 'completed' : 'pending',
        required: true
      },
      {
        item: 'Conocimiento de embarque',
        status: 'pending',
        required: true
      },
      {
        item: 'Certificado de origen',
        status: extractedData.supplier_country ? 'completed' : 'pending',
        required: false
      },
      {
        item: 'Registro como importador en DIAN',
        status: 'pending',
        required: true
      },
      {
        item: 'Clasificación arancelaria verificada',
        status: extractedData.hs_code ? 'completed' : 'pending',
        required: true
      }
    ];
  }
}