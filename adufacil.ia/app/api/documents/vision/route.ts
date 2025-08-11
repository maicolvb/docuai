import { NextRequest, NextResponse } from 'next/server';
import { InvoiceAnalyzer } from '@/lib/vision/invoice-analyzer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se encontró archivo' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de archivo no válido. Use PDF, JPG o PNG.' },
        { status: 400 }
      );
    }

    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Archivo muy grande. Máximo 10MB.' },
        { status: 400 }
      );
    }

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Analizar factura con IA
    const analyzer = new InvoiceAnalyzer();
    const extractedData = await analyzer.analyzeInvoice(buffer);

    return NextResponse.json({
      success: true,
      data: extractedData,
      message: 'Factura analizada exitosamente'
    });

  } catch (error) {
    console.error('Error in vision API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al procesar documento'
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para testing
export async function GET() {
  return NextResponse.json({
    message: 'Vision API endpoint activo',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
}