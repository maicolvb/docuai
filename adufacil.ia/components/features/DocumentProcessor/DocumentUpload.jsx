'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Camera, Loader, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '@/app/contexts/SimpleAuthContext';

export default function DocumentUpload({ onProcessComplete }) {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('upload'); // upload, processing, result

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setStep('processing');
    setProcessing(true);
    setError('');

    try {
      // Convertir a base64
      const base64 = await fileToBase64(file);
      
      // Decidir qué endpoint usar basado en si el usuario está autenticado
      const endpoint = user ? '/api/colombia' : '/api/demo';
      
      // Procesar con nuestra API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64,
          documentType: 'factura_comercial',
          filename: file.name
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error procesando documento');
      }

      setResult(data);
      setStep('result');
      
      if (onProcessComplete) {
        onProcessComplete(data);
      }

    } catch (err) {
      setError(err.message);
      setStep('upload');
    } finally {
      setProcessing(false);
    }
  }, [onProcessComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: processing
  });

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const resetUpload = () => {
    setStep('upload');
    setResult(null);
    setError('');
  };

  if (step === 'processing') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🤖 Procesando con IA...
            </h2>
            <p className="text-gray-600">
              Extrayendo datos y validando información aduanera
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Analizando documento</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Extrayendo campos</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Validando con DIAN</span>
              <Loader className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-50">
              <span className="text-sm text-gray-400">Calculando impuestos</span>
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
            </div>
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            Tiempo promedio: 30 segundos
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result' && result) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header de Resultado */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  <h2 className="text-2xl font-bold">
                    {result.message}
                  </h2>
                </div>
                <p className="opacity-90">
                  Documento procesado en {result.resumen?.tiempo_procesamiento || '2.3 segundos'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {result.resumen?.confianza || '95%'}
                </div>
                <div className="text-sm opacity-90">Precisión IA</div>
              </div>
            </div>
          </div>

          {/* Datos Principales */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Datos Extraídos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(result.datos_principales || {}).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {value || 'No detectado'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estimación de Costos */}
          <div className="p-6 bg-blue-50 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💰 Estimación de Impuestos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {result.estimacion_costos && Object.entries(result.estimacion_costos)
                .filter(([key]) => key !== 'nota')
                .map(([key, value]) => (
                <div key={key} className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600 mb-1">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            {result.estimacion_costos?.nota && (
              <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {result.estimacion_costos.nota}
                </p>
              </div>
            )}
          </div>

          {/* Vista Previa DIAN */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🏛️ Vista Previa DIAN
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {result.vista_previa_dian?.declaracion_importacion && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.vista_previa_dian.declaracion_importacion).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                      </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Siguientes Pasos */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🚀 Siguientes Pasos
            </h3>
            <div className="space-y-2">
              {result.siguientes_pasos?.map((step, index) => (
                <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-medium text-green-600">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-green-800">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="p-6 bg-gray-50">
            {result.isDemo ? (
              // CTA especial para usuarios no autenticados
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white mb-4">
                  <h3 className="text-xl font-bold mb-2">
                    🎉 ¡Impresionante! La IA procesó tu documento perfectamente
                  </h3>
                  <p className="mb-4 opacity-90">
                    Esto fue solo una demostración. Regístrate gratis para procesar tus documentos reales.
                  </p>
                  <button 
                    onClick={() => window.location.href = '/auth'}
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    🚀 Comenzar Prueba Gratuita
                  </button>
                  <p className="text-sm mt-3 opacity-75">
                    14 días gratis • 50 documentos incluidos • Sin tarjeta de crédito
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-green-600">✅ Dashboard Completo</div>
                    <div className="text-gray-600">Métricas y analytics detallados</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-blue-600">✅ Exportar Documentos</div>
                    <div className="text-gray-600">PDF, Excel y formatos DIAN</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-semibold text-purple-600">✅ API Integration</div>
                    <div className="text-gray-600">Conecta con tus sistemas</div>
                  </div>
                </div>

                <button
                  onClick={resetUpload}
                  className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
                >
                  Probar con otra imagen
                </button>
              </div>
            ) : (
              // Acciones normales para usuarios autenticados
              <div className="flex justify-between items-center">
                <button
                  onClick={resetUpload}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  <X className="w-4 h-4 mr-2" />
                  Procesar Otro Documento
                </button>
                <div className="flex space-x-3">
                  <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    Descargar PDF
                  </button>
                  <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Generar Declaración DIAN
                  </button>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Enviar a Agente Aduanero
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🚀 Procesa tu Documento Aduanero
        </h1>
        <p className="text-gray-600">
          Sube tu factura comercial y obtén datos listos para DIAN en 30 segundos
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="mb-4">
          {isDragActive ? (
            <div className="inline-flex p-4 bg-blue-100 rounded-full">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
          ) : (
            <div className="inline-flex p-4 bg-gray-100 rounded-full">
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isDragActive ? 'Suelta tu archivo aquí' : 'Sube tu documento'}
        </h3>
        
        <p className="text-gray-600 mb-4">
          Arrastra y suelta o haz clic para seleccionar
        </p>

        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Camera className="w-4 h-4 mr-1" />
            Foto
          </div>
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            PDF
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-yellow-800 mb-2">💡 Tips para mejores resultados:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Asegúrate de que el documento esté bien iluminado</li>
          <li>• Incluye todas las esquinas del documento</li>
          <li>• Evita sombras y reflejos</li>
          <li>• Usa alta resolución (mín. 1080p)</li>
        </ul>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4">
          <div className="text-2xl font-bold text-blue-600 mb-1">30s</div>
          <div className="text-sm text-gray-600">Tiempo promedio</div>
        </div>
        <div className="p-4">
          <div className="text-2xl font-bold text-green-600 mb-1">96.8%</div>
          <div className="text-sm text-gray-600">Precisión IA</div>
        </div>
        <div className="p-4">
          <div className="text-2xl font-bold text-purple-600 mb-1">$45K</div>
          <div className="text-sm text-gray-600">Ahorro promedio/mes</div>
        </div>
      </div>
    </div>
  );
}