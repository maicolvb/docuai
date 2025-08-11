import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';
import { payuClient } from '@/lib/payu/client';
import { PAYU_CONFIG } from '@/lib/payu/config';

export async function POST(request) {
  try {
    // Verificar autenticación
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { planId } = await request.json();

    if (!planId || !PAYU_CONFIG.plans[planId]) {
      return NextResponse.json(
        { error: 'Plan inválido' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Error obteniendo perfil de usuario' },
        { status: 500 }
      );
    }

    const plan = PAYU_CONFIG.plans[planId];
    const referenceCode = payuClient.generateReference(user.id, planId);

    // Crear formulario de pago PayU
    const paymentForm = payuClient.createPaymentForm({
      referenceCode: referenceCode,
      description: `Suscripción ${plan.name} - Adufacil.ia`,
      amount: plan.price,
      currency: 'COP',
      buyerEmail: profile.email,
      buyerFullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
      userId: user.id,
      planId: planId
    });

    // Guardar intento de pago en base de datos
    const { error: paymentError } = await supabase
      .from('billing_transactions')
      .insert([{
        user_id: user.id,
        transaction_type: 'subscription',
        amount: plan.price,
        currency: 'COP',
        status: 'pending',
        description: `Intento de suscripción ${plan.name}`,
        metadata: {
          planId: planId,
          referenceCode: referenceCode,
          paymentMethod: 'payu'
        }
      }]);

    if (paymentError) {
      console.error('Error saving payment attempt:', paymentError);
    }

    return NextResponse.json({
      success: true,
      paymentForm: paymentForm,
      plan: {
        id: planId,
        name: plan.name,
        price: plan.price,
        priceDisplay: plan.priceDisplay,
        currency: plan.currency
      },
      referenceCode: referenceCode
    });

  } catch (error) {
    console.error('Error creating PayU payment:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error creando pago'
    }, { status: 500 });
  }
}

// Endpoint para obtener planes disponibles
export async function GET() {
  return NextResponse.json({
    success: true,
    plans: PAYU_CONFIG.plans,
    paymentMethods: PAYU_CONFIG.paymentMethods,
    currency: PAYU_CONFIG.currency,
    country: PAYU_CONFIG.country
  });
}