'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/SimpleAuthContext';
import PayUCheckout from '@/components/features/Payment/PayUCheckout';
import { Check, Zap, Building, Crown, ArrowLeft } from 'lucide-react';

export default function PricingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/payu/create-payment');
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId) => {
    if (!user) {
      router.push('/auth?redirectTo=/pricing');
      return;
    }

    setSelectedPlan(planId);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = (referenceCode) => {
    // Mostrar mensaje de éxito y redirigir
    alert(`¡Pago iniciado exitosamente! Referencia: ${referenceCode}\n\nSerás redirigido al proceso de pago de PayU.`);
    setShowCheckout(false);
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'starter':
        return <Zap className="w-8 h-8" />;
      case 'professional':
        return <Building className="w-8 h-8" />;
      case 'enterprise':
        return <Crown className="w-8 h-8" />;
      default:
        return <Zap className="w-8 h-8" />;
    }
  };

  const getPlanColor = (planId) => {
    switch (planId) {
      case 'starter':
        return 'blue';
      case 'professional':
        return 'purple';
      case 'enterprise':
        return 'gold';
      default:
        return 'blue';
    }
  };

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setShowCheckout(false)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a planes
          </button>
          
          <PayUCheckout
            selectedPlan={selectedPlan}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowCheckout(false)}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando planes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Planes que se adaptan a tu negocio
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Desde startups hasta grandes importadores. Elige el plan perfecto para automatizar 
            tus documentos aduaneros con IA.
          </p>
          
          {profile?.subscription_status === 'trial' && (
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm">
              ⏳ Te quedan {profile.trialDaysLeft || 0} días de prueba gratis
            </div>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(plans).map(([planId, plan]) => {
            const color = getPlanColor(planId);
            const isPopular = planId === 'professional';
            const isCurrent = profile?.subscription_plan === planId;

            return (
              <div
                key={planId}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                  isPopular ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                    <div className="bg-purple-500 text-white px-4 py-1 text-sm rounded-b-lg font-medium">
                      🔥 Más Popular
                    </div>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-100 text-green-800 px-3 py-1 text-xs rounded-full font-medium">
                      Plan Actual
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex p-3 rounded-full mb-4 ${
                      color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {getPlanIcon(planId)}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.priceDisplay}
                      </span>
                      <span className="text-gray-600 ml-2">/mes</span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {plan.documentsLimit === 9999 
                        ? 'Documentos ilimitados' 
                        : `${plan.documentsLimit} documentos/mes`
                      }
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleSelectPlan(planId)}
                    disabled={isCurrent}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : isPopular
                        ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isCurrent ? 'Plan Actual' : `Elegir ${plan.name}`}
                  </button>

                  {planId === 'enterprise' && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                      💬 ¿Necesitas más? Contáctanos para un plan personalizado
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            💳 Métodos de pago colombianos
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-sm font-medium">PSE</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                📱
              </div>
              <div className="text-sm font-medium">Nequi</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                💳
              </div>
              <div className="text-sm font-medium">DaviPlata</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                🏛️
              </div>
              <div className="text-sm font-medium">Bancolombia</div>
            </div>
          </div>
          
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
            Todos los pagos son procesados de forma segura por PayU Colombia. 
            Puedes cancelar tu suscripción en cualquier momento desde tu dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}