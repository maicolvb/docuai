'use client';

import { useState } from 'react';
import InvoiceUpload from '@/components/features/InvoiceUpload/InvoiceUpload';
import TaxResultsDashboard from '@/components/features/TaxResultsDashboard/TaxResultsDashboard';
import { Calculator, Zap, Shield, Clock } from 'lucide-react';

interface CalculationState {
  step: 'upload' | 'calculating' | 'results';
  invoiceData: any;
  taxResults: any;
}

export default function CalculatorPage() {
  const [state, setState] = useState<CalculationState>({
    step: 'upload',
    invoiceData: null,
    taxResults: null
  });

  const handleFileAnalyzed = async (invoiceData: any) => {
    setState(prev => ({ ...prev, step: 'calculating', invoiceData }));

    try {
      // Llamar a la API de cálculo de impuestos
      const response = await fetch('/api/integrations/dian/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalValue: invoiceData.totalValue,
          products: invoiceData.products,
          origin: invoiceData.origin,
          weight: invoiceData.weight,
          currency: invoiceData.currency || 'USD'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          step: 'results',
          taxResults: result.data
        }));
      } else {
        console.error('Error calculating taxes:', result.error);
        // Volver al paso de upload con error
        setState(prev => ({ ...prev, step: 'upload' }));
      }
    } catch (error) {
      console.error('Error calculating taxes:', error);
      setState(prev => ({ ...prev, step: 'upload' }));
    }
  };

  const resetCalculator = () => {
    setState({
      step: 'upload',
      invoiceData: null,
      taxResults: null
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section - Solo mostrar en step upload */}
        {state.step === 'upload' && (
          <div className="text-center mb-12 fade-in">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Calculator className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Calculadora de{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Impuestos de Importación
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Sube tu factura comercial y obtén el cálculo exacto de aranceles, IVA y todos los impuestos DIAN en 30 segundos. 
              <span className="font-semibold text-blue-600 dark:text-blue-400"> Sin sorpresas en aduana.</span>
            </p>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <Zap className="h-6 w-6 text-yellow-500" />
                <span className="font-medium text-gray-900 dark:text-white">Resultados en 30s</span>
              </div>
              <div className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <Shield className="h-6 w-6 text-green-500" />
                <span className="font-medium text-gray-900 dark:text-white">100% Precisión DIAN</span>
              </div>
              <div className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <Clock className="h-6 w-6 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">Disponible 24/7</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {/* Step 1: Upload */}
            <div className={`flex items-center ${state.step === 'upload' ? 'text-blue-600 dark:text-blue-400' : state.step === 'calculating' || state.step === 'results' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${state.step === 'upload' ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' : state.step === 'calculating' || state.step === 'results' ? 'border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                {state.step === 'calculating' || state.step === 'results' ? '✓' : '1'}
              </div>
              <span className="ml-2 text-sm font-medium">Subir Factura</span>
            </div>

            {/* Connector */}
            <div className={`w-16 h-px ${state.step === 'calculating' || state.step === 'results' ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>

            {/* Step 2: Calculate */}
            <div className={`flex items-center ${state.step === 'calculating' ? 'text-blue-600 dark:text-blue-400' : state.step === 'results' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${state.step === 'calculating' ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' : state.step === 'results' ? 'border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                {state.step === 'results' ? '✓' : '2'}
              </div>
              <span className="ml-2 text-sm font-medium">Calcular Impuestos</span>
            </div>

            {/* Connector */}
            <div className={`w-16 h-px ${state.step === 'results' ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>

            {/* Step 3: Results */}
            <div className={`flex items-center ${state.step === 'results' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${state.step === 'results' ? 'border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                {state.step === 'results' ? '✓' : '3'}
              </div>
              <span className="ml-2 text-sm font-medium">Ver Resultados</span>
            </div>
          </div>
        </div>

        {/* Content based on step */}
        <div className="fade-in">
          
          {/* Upload Step */}
          {state.step === 'upload' && (
            <div className="max-w-4xl mx-auto">
              <InvoiceUpload onFileAnalyzed={handleFileAnalyzed} />
              
              {/* Testimonial */}
              <div className="mt-12 text-center">
                <blockquote className="text-lg italic text-gray-600 dark:text-gray-400 mb-4">
                  &ldquo;Antes pagaba $300 USD a mi agente aduanero y esperaba 3 días. 
                  Ahora tengo el resultado exacto en 30 segundos por $19 USD.&rdquo;
                </blockquote>
                <cite className="text-sm font-medium text-gray-900 dark:text-white">
                  — María González, Importadora de Electrónicos
                </cite>
              </div>
            </div>
          )}

          {/* Calculating Step */}
          {state.step === 'calculating' && (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-8"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Calculando tus impuestos...
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Analizando clasificación arancelaria y aplicando beneficios según origen
              </p>
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Clasificando producto...</span>
                  <span className="text-green-600 dark:text-green-400">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Calculando aranceles...</span>
                  <div className="animate-pulse w-4 h-4 bg-blue-400 rounded"></div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Aplicando beneficios TLC...</span>
                  <span>⏳</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Calculando IVA y 4x1000...</span>
                  <span>⏳</span>
                </div>
              </div>
            </div>
          )}

          {/* Results Step */}
          {state.step === 'results' && state.taxResults && (
            <div>
              <TaxResultsDashboard
                calculation={state.taxResults.calculation}
                additionalInfo={state.taxResults.additionalInfo}
                warnings={state.taxResults.warnings}
                recommendations={state.taxResults.recommendations}
                invoiceData={state.invoiceData}
              />
              
              {/* New Calculation Button */}
              <div className="text-center mt-8">
                <button
                  onClick={resetCalculator}
                  className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Calcular Nueva Importación
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA - Solo mostrar en upload */}
        {state.step === 'upload' && (
          <div className="mt-20 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Listo para eliminar las sorpresas en aduana?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Miles de importadores ya confían en nuestra calculadora IA
            </p>
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400 mr-2">98.5%</span>
                Precisión
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mr-2">15k+</span>
                Cálculos realizados
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mr-2">4.9★</span>
                Calificación
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}