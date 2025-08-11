'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/SimpleAuthContext';
import { CreditCard, Smartphone, Building, Zap, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function PayUCheckout({ selectedPlan, onSuccess, onCancel }) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('PSE');
  const [error, setError] = useState('');

  useEffect(() => {
    loadPayUData();
  }, []);

  const loadPayUData = async () => {
    try {
      const response = await fetch('/api/payu/create-payment');
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.plans);
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error('Error loading PayU data:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan || !user) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payu/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Crear y enviar formulario PayU automáticamente
        const form = document.createElement('form');
        form.method = data.paymentForm.method;
        form.action = data.paymentForm.action;
        form.target = '_blank'; // Abrir en nueva ventana

        // Agregar campos del formulario
        Object.entries(data.paymentForm.fields).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        // Mostrar mensaje de éxito
        if (onSuccess) {
          onSuccess(data.referenceCode);
        }

      } else {
        setError(data.error || 'Error creando pago');
      }

    } catch (error) {
      setError('Error procesando pago');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (methodId) => {
    switch (methodId) {
      case 'PSE':
      case 'BANCOLOMBIA_COLLECT':
        return <Building className="w-5 h-5" />;
      case 'NEQUI':
      case 'DAVIPLATA':
        return <Smartphone className="w-5 h-5" />;
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const plan = plans[selectedPlan];

  if (!plan) {
    return (
      <div className="text-center py-8">
        <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Cargando información de planes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              🚀 Upgrade a {plan.name}
            </h2>
            <p className="opacity-90">
              Procesa más documentos con todas las funcionalidades
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{plan.priceDisplay}</div>
            <div className="text-sm opacity-90">pesos colombianos/mes</div>
          </div>
        </div>
      </div>

      {/* Plan Details */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          ✨ Lo que incluye tu plan {plan.name}:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-green-800">
            <strong>📊 Límite mensual:</strong> {plan.documentsLimit === 9999 ? 'Ilimitado' : `${plan.documentsLimit.toLocaleString()} documentos`}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          💳 Elige tu método de pago preferido:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paymentMethods.filter(method => method.popular).map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedPaymentMethod(method.id)}
              className={`p-4 border rounded-lg text-left transition-all ${
                selectedPaymentMethod === method.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 ${
                  selectedPaymentMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {getPaymentMethodIcon(method.id)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{method.name}</div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <details className="text-sm text-gray-600">
            <summary className="cursor-pointer font-medium hover:text-gray-800">
              Ver todos los métodos de pago disponibles
            </summary>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              {paymentMethods.filter(method => !method.popular).map((method) => (
                <div key={method.id} className="flex items-center p-2">
                  <div className="p-1 bg-gray-100 rounded mr-2">
                    {getPaymentMethodIcon(method.id)}
                  </div>
                  <span>{method.name}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-6 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Pagar {plan.priceDisplay}
              </>
            )}
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 Pago seguro procesado por PayU Colombia<br/>
            Puedes cancelar tu suscripción en cualquier momento
          </p>
        </div>
      </div>
    </div>
  );
}