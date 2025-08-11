'use client';

import { useState } from 'react';

export default function VisionExample() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Por favor selecciona un archivo de imagen válido');
    }
  };

  const extractText = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona una imagen primero');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        
        const response = await fetch('/api/vision', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: base64Data
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al procesar la imagen');
        }

        setResult(data);
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Google Cloud Vision - Extracción de Texto (OCR)
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Imagen
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {imagePreview && (
            <div className="border rounded-lg p-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-auto max-h-64 mx-auto rounded"
              />
            </div>
          )}

          <button
            onClick={extractText}
            disabled={!selectedFile || loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Procesando...' : 'Extraer Texto'}
          </button>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                <strong>Éxito:</strong> {result.message}
              </div>

              {result.text && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Texto Extraído:
                  </h3>
                  <div className="bg-gray-50 border rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {result.text}
                    </pre>
                  </div>
                </div>
              )}

              {result.blocks && result.blocks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Bloques de Texto ({result.totalBlocks}):
                  </h3>
                  <div className="bg-gray-50 border rounded-lg p-4 max-h-64 overflow-y-auto">
                    {result.blocks.map((block, index) => (
                      <div key={index} className="mb-2 text-sm">
                        <span className="font-medium text-blue-600">
                          Bloque {index + 1}:
                        </span>{' '}
                        <span className="text-gray-700">{block.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Código de ejemplo:</h3>
        <pre className="text-xs bg-yellow-100 p-3 rounded overflow-x-auto">
{`// Ejemplo de uso desde JavaScript
const extractTextFromImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  // O usando base64:
  const reader = new FileReader();
  reader.onload = async (e) => {
    const response = await fetch('/api/vision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: e.target.result  // base64 data URL
      }),
    });
    
    const result = await response.json();
    console.log('Texto extraído:', result.text);
  };
  reader.readAsDataURL(imageFile);
};`}
        </pre>
      </div>
    </div>
  );
}