-- =====================================================
-- MIGRACIÓN: Actualizar moneda de USD a COP
-- Fecha: 2025-01-10
-- Descripción: Actualizar la base de datos para soportar pesos colombianos (COP)
--              y reemplazar referencias de Stripe con PayU
-- =====================================================

BEGIN;

-- 1. Actualizar defaults de currency en documents
ALTER TABLE public.documents 
ALTER COLUMN currency SET DEFAULT 'COP';

-- 2. Actualizar precision para amounts en billing_transactions (para manejar valores COP más grandes)
ALTER TABLE public.billing_transactions 
ALTER COLUMN amount TYPE DECIMAL(12,2);

-- 3. Actualizar defaults de currency en billing_transactions
ALTER TABLE public.billing_transactions 
ALTER COLUMN currency SET DEFAULT 'COP';

-- 4. Agregar nuevas columnas PayU y marcar Stripe como deprecated
ALTER TABLE public.billing_transactions 
ADD COLUMN IF NOT EXISTS payu_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payu_reference VARCHAR(255);

-- 5. Actualizar processing_sessions para costos en COP
ALTER TABLE public.processing_sessions 
ADD COLUMN IF NOT EXISTS api_costs_cop DECIMAL(10,2);

-- 6. Comentario para indicar que stripe columns están deprecated
COMMENT ON COLUMN public.billing_transactions.stripe_payment_intent_id IS 'DEPRECATED: Use payu_payment_id instead';
COMMENT ON COLUMN public.billing_transactions.stripe_subscription_id IS 'DEPRECATED: Use payu_reference instead';
COMMENT ON COLUMN public.processing_sessions.api_costs_usd IS 'DEPRECATED: Use api_costs_cop instead';

-- 7. Crear índices para mejorar rendimiento de consultas PayU
CREATE INDEX IF NOT EXISTS idx_billing_transactions_payu_payment_id 
ON public.billing_transactions(payu_payment_id);

CREATE INDEX IF NOT EXISTS idx_billing_transactions_payu_reference 
ON public.billing_transactions(payu_reference);

CREATE INDEX IF NOT EXISTS idx_billing_transactions_currency 
ON public.billing_transactions(currency);

-- 8. Actualizar registros existentes de USD a COP (si los hubiera)
UPDATE public.documents 
SET currency = 'COP' 
WHERE currency = 'USD';

UPDATE public.billing_transactions 
SET currency = 'COP' 
WHERE currency = 'USD';

-- 9. Agregar constraint para validar monedas soportadas
ALTER TABLE public.documents 
DROP CONSTRAINT IF EXISTS documents_currency_check;

ALTER TABLE public.documents 
ADD CONSTRAINT documents_currency_check 
CHECK (currency IN ('COP', 'USD', 'EUR'));

ALTER TABLE public.billing_transactions 
DROP CONSTRAINT IF EXISTS billing_transactions_currency_check;

ALTER TABLE public.billing_transactions 
ADD CONSTRAINT billing_transactions_currency_check 
CHECK (currency IN ('COP', 'USD'));

COMMIT;

-- =====================================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- =====================================================
-- Ejecutar estas consultas para verificar que la migración fue exitosa:
--
-- SELECT column_name, column_default, data_type 
-- FROM information_schema.columns 
-- WHERE table_name IN ('documents', 'billing_transactions') 
-- AND column_name = 'currency';
--
-- SELECT column_name, data_type, numeric_precision, numeric_scale
-- FROM information_schema.columns 
-- WHERE table_name = 'billing_transactions' 
-- AND column_name = 'amount';