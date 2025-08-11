'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface InvoiceUploadProps {
  onFileAnalyzed: (data: any) => void;
}

interface AnalysisResult {
  success: boolean;
  data?: {
    totalValue: number;
    currency: string;
    products: string[];
    origin: string;
    weight: number;
    supplier: string;
  };
  error?: string;
}

export default function InvoiceUpload({ onFileAnalyzed }: InvoiceUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const analyzeInvoice = async (file: File) => {
    setUploading(true);
    setUploadStatus('analyzing');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/documents/vision', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setAnalysisResult(result);
        setUploadStatus('success');
        onFileAnalyzed(result.data);
      } else {
        setUploadStatus('error');
        setAnalysisResult(result);
      }
    } catch (error) {
      console.error('Error analyzing invoice:', error);
      setUploadStatus('error');
      setAnalysisResult({
        success: false,
        error: 'Error al procesar el documento. Por favor intenta de nuevo.'
      });
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      analyzeInvoice(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const getUploadContent = () => {
    switch (uploadStatus) {
      case 'analyzing':
        return (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analizando tu factura...
            </h3>
            <p className="text-gray-600">
              Nuestra IA está extrayendo los datos importantes
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¡Factura analizada exitosamente!
            </h3>
            <p className="text-gray-600">
              Datos extraídos y listos para cálculo
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al procesar
            </h3>
            <p className="text-gray-600 mb-4">
              {analysisResult?.error || 'No pudimos procesar tu documento'}
            </p>
            <button 
              onClick={() => setUploadStatus('idle')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Intentar de nuevo
            </button>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sube tu factura comercial
            </h3>
            <p className="text-gray-600 mb-6">
              Arrastra y suelta tu archivo PDF o imagen aquí, o haz clic para seleccionar
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                PDF, JPG, PNG
              </span>
              <span>•</span>
              <span>Máximo 10MB</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : uploadStatus === 'success' 
              ? 'border-green-400 bg-green-50'
              : uploadStatus === 'error'
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${uploading ? 'pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        {getUploadContent()}
      </div>

      {/* Demo hint */}
      {uploadStatus === 'idle' && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            ¿No tienes una factura a mano?
          </p>
          <button 
            onClick={() => {
              // Simular análisis con datos de demo
              setUploadStatus('analyzing');
              setTimeout(() => {
                const demoData = {
                  totalValue: 15000,
                  currency: 'USD',
                  products: ['Smartphones Samsung Galaxy S24'],
                  origin: 'China',
                  weight: 500,
                  supplier: 'Samsung Electronics Co Ltd'
                };
                setAnalysisResult({ success: true, data: demoData });
                setUploadStatus('success');
                onFileAnalyzed(demoData);
              }, 2000);
            }}
            className="text-blue-600 hover:text-blue-700 underline text-sm font-medium"
          >
            Usar datos de demostración
          </button>
        </div>
      )}
    </div>
  );
}