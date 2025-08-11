import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { payuClient } from '@/lib/payu/client';

export async function POST(request) {
  try {
    // PayU envía datos como form-data
    const formData = await request.formData();
    const params = {};
    
    // Convertir FormData a objeto
    for (const [key, value] of formData.entries()) {
      params[key] = value;
    }

    console.log('PayU confirmation received:', params);

    // Validar signature
    if (!payuClient.validateConfirmationSignature(params)) {
      console.error('Invalid PayU signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const {
      merchant_id,
      state_pol, // Estado de la transacción
      risk, // Nivel de riesgo
      response_code_pol, // Código de respuesta
      reference_sale, // Referencia de la venta
      reference_pol, // Referencia PayU
      sign, // Firma
      extra1, // userId
      extra2, // planId
      extra3, // transaction type
      value, // Valor pagado
      currency, // Moneda
      transaction_date, // Fecha transacción
      payment_method_name, // Método de pago usado
      email_buyer // Email del comprador
    } = params;

    const userId = extra1;
    const planId = extra2;
    const transactionType = extra3;

    if (!userId || !planId) {
      console.error('Missing userId or planId in PayU confirmation');
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const supabase = createClient();

    // Determinar estado de la transacción
    let transactionStatus = 'pending';
    let subscriptionStatus = 'trial';

    switch (state_pol) {
      case '4': // Transacción aprobada
        transactionStatus = 'completed';
        subscriptionStatus = 'active';
        break;
      case '6': // Transacción rechazada
        transactionStatus = 'failed';
        subscriptionStatus = 'cancelled';
        break;
      case '104': // Error en transacción
        transactionStatus = 'failed';
        subscriptionStatus = 'cancelled';
        break;
      case '7': // Pago pendiente
        transactionStatus = 'pending';
        subscriptionStatus = 'trial';
        break;
      default:
        transactionStatus = 'pending';
        subscriptionStatus = 'trial';
    }

    // Actualizar o crear transacción en base de datos
    const { error: transactionError } = await supabase
      .from('billing_transactions')
      .upsert({
        user_id: userId,
        transaction_type: transactionType,
        amount: parseFloat(value),
        currency: currency,
        status: transactionStatus,
        description: `Pago ${planId} - PayU`,
        metadata: {
          planId: planId,
          payuReference: reference_pol,
          paymentMethod: payment_method_name,
          riskLevel: risk,
          responseCode: response_code_pol,
          transactionDate: transaction_date
        }
      }, {
        onConflict: 'user_id,metadata->payuReference',
        ignoreDuplicates: false
      });

    if (transactionError) {
      console.error('Error updating transaction:', transactionError);
    }

    // Si la transacción fue aprobada, actualizar suscripción del usuario
    if (transactionStatus === 'completed') {
      const plan = {
        starter: { limit: 50, plan: 'starter' },
        professional: { limit: 500, plan: 'professional' },
        enterprise: { limit: 9999, plan: 'enterprise' }
      }[planId] || { limit: 50, plan: 'starter' };

      // Calcular nueva fecha de vencimiento (30 días)
      const nextBillingDate = new Date();
      nextBillingDate.setDate(nextBillingDate.getDate() + 30);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_status: subscriptionStatus,
          subscription_plan: plan.plan,
          monthly_limit: plan.limit,
          trial_ends_at: nextBillingDate.toISOString(),
          documents_processed_this_month: 0 // Reset contador mensual
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating user profile:', profileError);
      } else {
        console.log(`User ${userId} upgraded to ${planId} plan`);
      }
    }

    // PayU espera una respuesta específica
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('Error processing PayU confirmation:', error);
    return new NextResponse('ERROR', { status: 500 });
  }
}

// PayU también puede enviar confirmaciones por GET
export async function GET(request) {
  console.log('PayU GET confirmation:', request.url);
  return new NextResponse('OK', { status: 200 });
}