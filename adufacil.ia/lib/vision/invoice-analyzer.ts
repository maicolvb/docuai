import { ImageAnnotatorClient } from '@google-cloud/vision';

// Configurar cliente Vision con variables de entorno
const visionClient = new ImageAnnotatorClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: undefined, // Usar variables de entorno
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

interface ExtractedInvoiceData {
  totalValue: number;
  currency: string;
  products: string[];
  origin: string;
  weight: number;
  supplier: string;
  hsCode?: string;
  invoiceNumber?: string;
  date?: string;
  rawText: string;
}

export class InvoiceAnalyzer {
  
  async analyzeInvoice(imageBuffer: Buffer): Promise<ExtractedInvoiceData> {
    try {
      // Extraer texto usando Google Vision
      const [result] = await visionClient.textDetection({
        image: { content: imageBuffer },
      });

      const detections = result.textAnnotations;
      const rawText = detections && detections[0] ? detections[0].description || '' : '';

      if (!rawText) {
        throw new Error('No se pudo extraer texto del documento');
      }

      // Analizar el texto extraído
      const extractedData = this.parseInvoiceText(rawText);
      
      return {
        ...extractedData,
        rawText
      };

    } catch (error) {
      console.error('Error analyzing invoice:', error);
      throw new Error('Error al analizar la factura');
    }
  }

  private parseInvoiceText(text: string): Omit<ExtractedInvoiceData, 'rawText'> {
    const normalizedText = text.toLowerCase().replace(/\s+/g, ' ');
    
    // Extraer valor total
    const totalValue = this.extractTotalValue(normalizedText);
    
    // Extraer moneda
    const currency = this.extractCurrency(normalizedText);
    
    // Extraer productos
    const products = this.extractProducts(normalizedText);
    
    // Extraer país de origen
    const origin = this.extractOrigin(normalizedText);
    
    // Extraer peso
    const weight = this.extractWeight(normalizedText);
    
    // Extraer proveedor
    const supplier = this.extractSupplier(normalizedText);
    
    // Extraer código HS
    const hsCode = this.extractHSCode(normalizedText);
    
    // Extraer número de factura
    const invoiceNumber = this.extractInvoiceNumber(normalizedText);
    
    // Extraer fecha
    const date = this.extractDate(normalizedText);

    return {
      totalValue,
      currency,
      products,
      origin,
      weight,
      supplier,
      hsCode,
      invoiceNumber,
      date
    };
  }

  private extractTotalValue(text: string): number {
    // Buscar patrones de valor total
    const patterns = [
      /total[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      /amount[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      /value[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      /\$\s*([\d,]+\.?\d*)/g
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseFloat(match[1].replace(/,/g, ''));
        if (value > 100) { // Filtrar valores muy pequeños
          return value;
        }
      }
    }

    // Valor por defecto si no se encuentra
    return 1000;
  }

  private extractCurrency(text: string): string {
    const currencyPatterns = [
      /usd|dollar|dolar/i,
      /eur|euro/i,
      /cny|yuan|rmb/i,
      /cop|peso/i
    ];

    const currencies = ['USD', 'EUR', 'CNY', 'COP'];

    for (let i = 0; i < currencyPatterns.length; i++) {
      if (currencyPatterns[i].test(text)) {
        return currencies[i];
      }
    }

    return 'USD'; // Por defecto
  }

  private extractProducts(text: string): string[] {
    // Palabras clave comunes en facturas
    const productKeywords = [
      'smartphone', 'phone', 'celular', 'mobile',
      'laptop', 'computer', 'tablet',
      'clothing', 'textile', 'fabric',
      'electronics', 'electronic',
      'machinery', 'equipment',
      'parts', 'components'
    ];

    const foundProducts: string[] = [];
    
    for (const keyword of productKeywords) {
      if (text.includes(keyword)) {
        // Buscar contexto alrededor de la palabra clave
        const regex = new RegExp(`([\\w\\s]{0,20}${keyword}[\\w\\s]{0,20})`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          foundProducts.push(matches[0].trim());
          break; // Solo el primer producto encontrado
        }
      }
    }

    return foundProducts.length > 0 ? foundProducts : ['Producto electrónico'];
  }

  private extractOrigin(text: string): string {
    const countries = [
      'china', 'usa', 'united states', 'germany', 'japan',
      'south korea', 'taiwan', 'singapore', 'mexico',
      'brasil', 'brazil', 'canada', 'france', 'italy'
    ];

    for (const country of countries) {
      if (text.includes(country)) {
        return country.charAt(0).toUpperCase() + country.slice(1);
      }
    }

    return 'China'; // Más común en importaciones
  }

  private extractWeight(text: string): number {
    const weightPatterns = [
      /(\d+\.?\d*)\s*(kg|kilogram|kilo)/i,
      /weight[:\s]*(\d+\.?\d*)/i,
      /(\d+\.?\d*)\s*kg/i
    ];

    for (const pattern of weightPatterns) {
      const match = text.match(pattern);
      if (match) {
        const weight = parseFloat(match[1]);
        if (weight > 0) {
          return weight;
        }
      }
    }

    return 100; // Peso por defecto
  }

  private extractSupplier(text: string): string {
    // Buscar líneas que parezcan nombres de empresas
    const supplierPatterns = [
      /seller[:\s]*([^\n]{5,50})/i,
      /supplier[:\s]*([^\n]{5,50})/i,
      /from[:\s]*([^\n]{5,50})/i,
      /company[:\s]*([^\n]{5,50})/i
    ];

    for (const pattern of supplierPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'Proveedor Internacional'; // Por defecto
  }

  private extractHSCode(text: string): string | undefined {
    const hsPattern = /(\d{4}\.?\d{2}\.?\d{2}\.?\d{2})/;
    const match = text.match(hsPattern);
    return match ? match[1] : undefined;
  }

  private extractInvoiceNumber(text: string): string | undefined {
    const invoicePatterns = [
      /invoice[:\s#]*([A-Z0-9-]+)/i,
      /factura[:\s#]*([A-Z0-9-]+)/i,
      /#\s*([A-Z0-9-]+)/
    ];

    for (const pattern of invoicePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  private extractDate(text: string): string | undefined {
    const datePatterns = [
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
      /(\d{2,4}[-/]\d{1,2}[-/]\d{1,2})/,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }
}