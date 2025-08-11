import crypto from 'crypto-js';
import axios from 'axios';
import { getPayUConfig } from './config';

export class PayUClient {
  constructor() {
    this.config = getPayUConfig();
  }

  // Generar firma para transacciones
  generateSignature(referenceCode, amount, currency = 'COP') {
    const { apiKey, merchantId } = this.config;
    const signature = `${apiKey}~${merchantId}~${referenceCode}~${amount}~${currency}`;
    return crypto.MD5(signature).toString();
  }

  // Crear referencia única
  generateReference(userId, planId) {
    const timestamp = Date.now();
    return `ADUFACIL_${userId}_${planId}_${timestamp}`;
  }

  // Crear formulario de pago PayU
  createPaymentForm(paymentData) {
    const {
      referenceCode,
      description,
      amount,
      currency = 'COP',
      buyerEmail,
      buyerFullName,
      userId,
      planId
    } = paymentData;

    const signature = this.generateSignature(referenceCode, amount, currency);

    return {
      action: this.config.paymentsUrl,
      method: 'POST',
      fields: {
        // Configuración PayU
        merchantId: this.config.merchantId,
        accountId: this.config.accountId,
        description: description,
        referenceCode: referenceCode,
        amount: amount,
        tax: '0',
        taxReturnBase: '0',
        currency: currency,
        signature: signature,
        test: process.env.NODE_ENV !== 'production' ? '1' : '0',
        
        // URLs de respuesta
        confirmationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payu/confirmation`,
        responseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?plan=${planId}&user=${userId}`,
        
        // Información del comprador
        buyerFullName: buyerFullName,
        buyerEmail: buyerEmail,
        
        // Configuración adicional
        lng: 'es',
        displayShippingInformation: 'NO',
        
        // Metadatos personalizados
        extra1: userId, // User ID
        extra2: planId, // Plan seleccionado
        extra3: 'subscription' // Tipo de transacción
      }
    };
  }

  // Crear pago recurrente (suscripciones)
  async createRecurringPayment(subscriptionData) {
    const {
      userId,
      planId,
      userEmail,
      userName,
      amount,
      startDate
    } = subscriptionData;

    const referenceCode = this.generateReference(userId, planId);
    
    try {
      const response = await axios.post(this.config.apiUrl, {
        language: 'es',
        command: 'CREATE_BATCH_CUSTOMERS_PLAN_AND_SUBSCRIPTION',
        merchant: {
          apiKey: this.config.apiKey,
          apiLogin: this.config.apiLogin
        },
        subscription: {
          quantity: 1,
          installments: 999, // Pagos recurrentes indefinidos
          currentPeriodStart: startDate,
          plan: {
            planCode: `ADUFACIL_${planId.toUpperCase()}`,
            description: `Plan ${planId} Adufacil`,
            interval: 'MONTH',
            intervalCount: 1,
            maxPaymentsAllowed: 999,
            paymentAttemptsDelay: 3,
            additionalCharges: [
              {
                chargeCode: 'SUBSCRIPTION_FEE',
                description: 'Suscripción mensual Adufacil',
                amount: {
                  value: amount,
                  currency: 'COP'
                }
              }
            ]
          },
          customer: {
            customerId: `CUSTOMER_${userId}`,
            fullName: userName,
            email: userEmail
          }
        }
      });

      return {
        success: true,
        subscriptionId: response.data.result?.subscription?.id,
        planCode: response.data.result?.plan?.planCode,
        customerId: response.data.result?.customer?.customerId
      };

    } catch (error) {
      console.error('Error creating PayU subscription:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Verificar estado de transacción
  async getTransactionStatus(transactionId) {
    try {
      const response = await axios.post(this.config.apiUrl, {
        language: 'es',
        command: 'ORDER_DETAIL',
        merchant: {
          apiKey: this.config.apiKey,
          apiLogin: this.config.apiLogin
        },
        details: {
          orderId: transactionId
        }
      });

      const transaction = response.data.result?.payload?.[0]?.transactions?.[0];
      
      return {
        success: true,
        status: transaction?.transactionResponse?.state,
        responseCode: transaction?.transactionResponse?.responseCode,
        paymentMethod: transaction?.paymentMethod
      };

    } catch (error) {
      console.error('Error getting transaction status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cancelar suscripción
  async cancelSubscription(subscriptionId) {
    try {
      const response = await axios.post(this.config.apiUrl, {
        language: 'es',
        command: 'CANCEL_SUBSCRIPTION',
        merchant: {
          apiKey: this.config.apiKey,
          apiLogin: this.config.apiLogin
        },
        subscription: {
          id: subscriptionId
        }
      });

      return {
        success: true,
        cancelled: response.data.result?.subscription?.status === 'CANCELLED'
      };

    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Formatear precio colombiano
  formatCOPPrice(amount) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Validar signature de confirmación (webhook)
  validateConfirmationSignature(params) {
    const {
      merchant_id,
      reference_sale,
      value,
      currency,
      state_pol,
      signature
    } = params;

    const expectedSignature = crypto.MD5(
      `${this.config.apiKey}~${merchant_id}~${reference_sale}~${value}~${currency}~${state_pol}`
    ).toString();

    return signature === expectedSignature;
  }
}

// Instancia singleton
export const payuClient = new PayUClient();