-- Esquema de Base de Datos para Adufacil.ia

-- =====================================================
-- 1. TABLA DE PERFILES DE USUARIO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Información básica
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(200),
    phone VARCHAR(20),
    
    -- Información de negocio
    business_type VARCHAR(50) CHECK (business_type IN ('importer', 'exporter', 'agent', 'consultant')),
    company_size VARCHAR(20) CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+')),
    monthly_documents_volume INTEGER DEFAULT 0,
    
    -- Ubicación
    country VARCHAR(2) DEFAULT 'CO',
    city VARCHAR(100),
    address TEXT,
    
    -- Configuraciones
    preferred_currency VARCHAR(3) DEFAULT 'COP',
    timezone VARCHAR(50) DEFAULT 'America/Bogota',
    language VARCHAR(5) DEFAULT 'es-CO',
    
    -- Estado de la cuenta
    subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'suspended')),
    subscription_plan VARCHAR(20) DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'enterprise')),
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
    
    -- Límites y uso
    documents_processed_this_month INTEGER DEFAULT 0,
    monthly_limit INTEGER DEFAULT 50,
    
    -- Metadatos
    onboarding_completed BOOLEAN DEFAULT FALSE,
    marketing_consent BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- 2. TABLA DE DOCUMENTOS PROCESADOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Información del documento
    original_filename VARCHAR(255),
    document_type VARCHAR(50) CHECK (document_type IN ('commercial_invoice', 'bill_of_lading', 'packing_list', 'certificate_origin', 'other')),
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- URLs de archivos
    original_file_url TEXT, -- URL del archivo original en Supabase Storage
    processed_file_url TEXT, -- URL del archivo procesado (si aplica)
    
    -- Estado del procesamiento
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'review_required')),
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    processing_time_seconds INTEGER,
    
    -- Datos extraídos
    extracted_data JSONB, -- Todos los datos extraídos por la IA
    confidence_score DECIMAL(4,3), -- 0.000 to 1.000
    validation_errors TEXT[],
    warnings TEXT[],
    
    -- Información específica para aduanas
    invoice_number VARCHAR(100),
    total_value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'COP',
    hs_codes TEXT[], -- Array de códigos HS encontrados
    origin_country VARCHAR(2),
    destination_country VARCHAR(2) DEFAULT 'CO',
    gross_weight DECIMAL(10,3),
    net_weight DECIMAL(10,3),
    weight_unit VARCHAR(5) DEFAULT 'KG',
    
    -- Cálculos automáticos
    estimated_duties DECIMAL(15,2),
    estimated_taxes DECIMAL(15,2),
    estimated_total_cost DECIMAL(15,2),
    
    -- Metadatos
    requires_human_review BOOLEAN DEFAULT FALSE,
    reviewed_by_human BOOLEAN DEFAULT FALSE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    notes TEXT
);

-- =====================================================
-- 3. TABLA DE TRANSACCIONES/FACTURACIÓN
-- =====================================================
CREATE TABLE IF NOT EXISTS public.billing_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Información de la transacción
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('subscription', 'pay_per_use', 'refund', 'credit')),
    amount DECIMAL(12,2) NOT NULL, -- Increased precision for COP amounts
    currency VARCHAR(3) DEFAULT 'COP',
    
    -- Referencias externas
    payu_payment_id VARCHAR(255),
    payu_reference VARCHAR(255),
    invoice_id VARCHAR(100),
    
    -- Estado
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    
    -- Descripción
    description TEXT,
    metadata JSONB
);

-- =====================================================
-- 4. TABLA DE SESIONES DE PROCESAMIENTO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.processing_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Información de la sesión
    session_type VARCHAR(20) DEFAULT 'document_processing',
    documents_count INTEGER DEFAULT 0,
    total_processing_time INTEGER DEFAULT 0, -- en segundos
    
    -- Métricas de rendimiento
    success_rate DECIMAL(4,3),
    average_confidence DECIMAL(4,3),
    
    -- Costos
    api_costs_cop DECIMAL(10,2), -- Costo en APIs externas convertido a COP (Google Vision, Claude, etc)
    
    -- Metadatos
    user_agent TEXT,
    ip_address INET,
    metadata JSONB
);

-- =====================================================
-- 5. TABLA DE CONFIGURACIONES DEL SISTEMA
-- =====================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Configuración (si user_id es NULL, es configuración global)
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    setting_type VARCHAR(20) CHECK (setting_type IN ('user', 'global', 'feature_flag')),
    
    -- Metadatos
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 6. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para profiles
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS profiles_company_name_idx ON public.profiles(company_name);

-- Índices para documents
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS documents_processing_status_idx ON public.documents(processing_status);
CREATE INDEX IF NOT EXISTS documents_document_type_idx ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS documents_confidence_score_idx ON public.documents(confidence_score DESC);

-- Índices para búsqueda de texto en documentos
CREATE INDEX IF NOT EXISTS documents_invoice_number_idx ON public.documents(invoice_number);
CREATE INDEX IF NOT EXISTS documents_origin_country_idx ON public.documents(origin_country);

-- Índices para billing_transactions
CREATE INDEX IF NOT EXISTS billing_transactions_user_id_idx ON public.billing_transactions(user_id);
CREATE INDEX IF NOT EXISTS billing_transactions_created_at_idx ON public.billing_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS billing_transactions_status_idx ON public.billing_transactions(status);

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para documents
CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para billing_transactions
CREATE POLICY "Users can view own transactions" ON public.billing_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Políticas para processing_sessions
CREATE POLICY "Users can view own sessions" ON public.processing_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.processing_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para system_settings
CREATE POLICY "Users can view own settings" ON public.system_settings
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage own settings" ON public.system_settings
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 8. FUNCIONES ÚTILES
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 9. CONFIGURACIÓN DE STORAGE
-- =====================================================

-- Bucket para documentos originales
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Bucket para archivos procesados
INSERT INTO storage.buckets (id, name, public)
VALUES ('processed', 'processed', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas similares para bucket 'processed'
CREATE POLICY "Users can upload own processed files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'processed' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own processed files"
ON storage.objects FOR SELECT
USING (bucket_id = 'processed' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- 10. DATOS INICIALES
-- =====================================================

-- Configuraciones globales del sistema
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) VALUES
('max_file_size_mb', '10', 'global', 'Tamaño máximo de archivo en MB'),
('supported_file_types', '["image/jpeg", "image/png", "image/webp", "application/pdf"]', 'global', 'Tipos de archivo soportados'),
('trial_duration_days', '14', 'global', 'Duración del trial en días'),
('starter_plan_limit', '50', 'global', 'Límite mensual plan starter'),
('professional_plan_limit', '500', 'global', 'Límite mensual plan professional'),
('enterprise_plan_limit', '5000', 'global', 'Límite mensual plan enterprise')
ON CONFLICT DO NOTHING;