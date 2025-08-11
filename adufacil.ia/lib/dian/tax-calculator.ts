interface ImportTaxes {
  baseValue: number;
  arancel: number;
  arancelRate: number;
  iva: number;
  ivaRate: number;
  cuatroPorMil: number;
  totalTaxes: number;
  totalToPay: number;
  breakdown: TaxBreakdown[];
}

interface TaxBreakdown {
  concept: string;
  rate: number;
  amount: number;
  description: string;
}

interface ProductClassification {
  hsCode: string;
  arancelRate: number;
  category: string;
  description: string;
  restrictions?: string[];
}

export class DIANTaxCalculator {
  
  // Base de datos simplificada de clasificaciones arancelarias
  private static productDatabase: { [key: string]: ProductClassification } = {
    // Electrónicos
    'smartphone': { 
      hsCode: '8517.12.00', 
      arancelRate: 15, 
      category: 'Electrónicos',
      description: 'Teléfonos móviles y smartphones'
    },
    'laptop': { 
      hsCode: '8471.30.00', 
      arancelRate: 10, 
      category: 'Electrónicos',
      description: 'Computadoras portátiles'
    },
    'tablet': { 
      hsCode: '8471.41.00', 
      arancelRate: 10, 
      category: 'Electrónicos',
      description: 'Tabletas y dispositivos similares'
    },
    'electronic': { 
      hsCode: '8543.70.00', 
      arancelRate: 15, 
      category: 'Electrónicos',
      description: 'Aparatos electrónicos diversos'
    },
    
    // Textiles
    'clothing': { 
      hsCode: '6203.42.00', 
      arancelRate: 20, 
      category: 'Textiles',
      description: 'Prendas de vestir'
    },
    'textile': { 
      hsCode: '5407.61.00', 
      arancelRate: 15, 
      category: 'Textiles',
      description: 'Tejidos textiles'
    },
    
    // Maquinaria
    'machinery': { 
      hsCode: '8479.89.00', 
      arancelRate: 5, 
      category: 'Maquinaria',
      description: 'Máquinas y aparatos mecánicos'
    },
    
    // Por defecto
    'default': { 
      hsCode: '9999.99.00', 
      arancelRate: 15, 
      category: 'Otros',
      description: 'Mercancías no clasificadas'
    }
  };

  /**
   * Calcula todos los impuestos de importación para Colombia
   */
  calculateImportTaxes(
    productValue: number,
    productType: string,
    origin: string,
    weight: number
  ): ImportTaxes {
    
    // 1. Clasificar producto y obtener tasa arancelaria
    const classification = this.classifyProduct(productType);
    
    // 2. Aplicar beneficios arancelarios según origen
    const adjustedArancelRate = this.applyOriginBenefits(classification.arancelRate, origin);
    
    // 3. Calcular valor base (FOB + flete + seguro estimado)
    const baseValue = this.calculateCIFValue(productValue, weight, origin);
    
    // 4. Calcular arancel
    const arancel = Math.round((baseValue * adjustedArancelRate) / 100);
    
    // 5. Base gravable para IVA (CIF + Arancel)
    const ivaBase = baseValue + arancel;
    
    // 6. Calcular IVA (19% estándar)
    const iva = Math.round((ivaBase * 19) / 100);
    
    // 7. Calcular 4x1000 (sobre el valor CIF)
    const cuatroPorMil = Math.round((baseValue * 4) / 1000);
    
    // 8. Total de impuestos y valor final
    const totalTaxes = arancel + iva + cuatroPorMil;
    const totalToPay = baseValue + totalTaxes;

    // 9. Crear breakdown detallado
    const breakdown: TaxBreakdown[] = [
      {
        concept: 'Valor CIF',
        rate: 0,
        amount: baseValue,
        description: 'Valor FOB + Flete + Seguro (estimado)'
      },
      {
        concept: 'Arancel',
        rate: adjustedArancelRate,
        amount: arancel,
        description: `${classification.category} - ${classification.hsCode}`
      },
      {
        concept: 'IVA',
        rate: 19,
        amount: iva,
        description: 'Impuesto sobre el Valor Agregado'
      },
      {
        concept: '4x1000',
        rate: 0.4,
        amount: cuatroPorMil,
        description: 'Gravamen a los Movimientos Financieros'
      }
    ];

    return {
      baseValue,
      arancel,
      arancelRate: adjustedArancelRate,
      iva,
      ivaRate: 19,
      cuatroPorMil,
      totalTaxes,
      totalToPay,
      breakdown
    };
  }

  /**
   * Clasifica el producto para determinar código HS y tasa arancelaria
   */
  private classifyProduct(productDescription: string): ProductClassification {
    const normalizedProduct = productDescription.toLowerCase();
    
    // Buscar coincidencias exactas primero
    for (const [key, classification] of Object.entries(DIANTaxCalculator.productDatabase)) {
      if (normalizedProduct.includes(key)) {
        return classification;
      }
    }
    
    // Buscar por palabras clave más específicas
    if (normalizedProduct.includes('phone') || normalizedProduct.includes('celular')) {
      return DIANTaxCalculator.productDatabase['smartphone'];
    }
    
    if (normalizedProduct.includes('computer') || normalizedProduct.includes('computadora')) {
      return DIANTaxCalculator.productDatabase['laptop'];
    }
    
    if (normalizedProduct.includes('ropa') || normalizedProduct.includes('vestir')) {
      return DIANTaxCalculator.productDatabase['clothing'];
    }

    // Por defecto
    return DIANTaxCalculator.productDatabase['default'];
  }

  /**
   * Aplica beneficios arancelarios según país de origen
   */
  private applyOriginBenefits(baseRate: number, origin: string): number {
    const normalizedOrigin = origin.toLowerCase();
    
    // Países con tratados de libre comercio (TLC)
    const tlcCountries = [
      'usa', 'united states', 'estados unidos',
      'canada', 'mexico', 'chile', 'peru',
      'south korea', 'corea del sur'
    ];
    
    // Comunidad Andina (arancel 0%)
    const andeanCountries = ['peru', 'ecuador', 'bolivia'];
    
    // Mercosur (preferencias)
    const mercosurCountries = ['brazil', 'brasil', 'argentina', 'uruguay', 'paraguay'];

    // Aplicar beneficios
    if (andeanCountries.some(country => normalizedOrigin.includes(country))) {
      return 0; // Arancel 0% para Comunidad Andina
    }
    
    if (tlcCountries.some(country => normalizedOrigin.includes(country))) {
      return Math.max(0, baseRate - 10); // Reducción por TLC
    }
    
    if (mercosurCountries.some(country => normalizedOrigin.includes(country))) {
      return Math.max(0, baseRate - 5); // Preferencias Mercosur
    }
    
    return baseRate; // Tasa completa para otros países
  }

  /**
   * Calcula valor CIF (FOB + Flete + Seguro)
   */
  private calculateCIFValue(fobValue: number, weight: number, origin: string): number {
    // Estimación de flete basada en peso y origen
    const freight = this.estimateFreight(weight, origin);
    
    // Seguro típicamente 0.5% del FOB
    const insurance = Math.round(fobValue * 0.005);
    
    return fobValue + freight + insurance;
  }

  /**
   * Estima el costo de flete según peso y origen
   */
  private estimateFreight(weight: number, origin: string): number {
    const normalizedOrigin = origin.toLowerCase();
    
    // Tarifas base por kg según región (USD)
    let ratePerKg = 3; // Tarifa por defecto
    
    if (normalizedOrigin.includes('china') || normalizedOrigin.includes('asia')) {
      ratePerKg = 4;
    } else if (normalizedOrigin.includes('usa') || normalizedOrigin.includes('canada')) {
      ratePerKg = 2.5;
    } else if (normalizedOrigin.includes('europe')) {
      ratePerKg = 3.5;
    }
    
    // Mínimo $50 USD de flete
    return Math.max(50, Math.round(weight * ratePerKg));
  }

  /**
   * Obtiene información adicional sobre restricciones
   */
  getImportRestrictions(hsCode: string): string[] {
    const restrictions: { [key: string]: string[] } = {
      '8517.12.00': [
        'Registro MINTIC requerido para equipos de telecomunicaciones',
        'Certificación de homologación ANTV'
      ],
      '6203.42.00': [
        'Etiquetado obligatorio de composición textil',
        'Certificado de origen para preferencias arancelarias'
      ],
      '8479.89.00': [
        'Registro INVIMA para equipos médicos',
        'Certificación técnica según aplicación'
      ]
    };

    return restrictions[hsCode] || [];
  }

  /**
   * Calcula el tiempo estimado de nacionalización
   */
  estimateProcessingTime(value: number, hasRestrictions: boolean): number {
    let days = 3; // Base para importaciones simples
    
    if (value > 50000) days += 2; // Valores altos requieren más revisión
    if (hasRestrictions) days += 5; // Productos con restricciones
    
    return days;
  }
}