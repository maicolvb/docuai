import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Verificar autenticación
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    
    // Obtener profile del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Obtener documentos del usuario
    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calcular estadísticas
    const totalDocuments = profile?.documents_processed_this_month || 0;
    const totalSavings = totalDocuments * 67500; // COP ahorrados por documento (promedio 45 min a $1500/hora)
    
    // Calcular tiempo promedio de procesamiento si hay documentos
    let avgProcessingTime = 28; // default
    if (documents && documents.length > 0) {
      const processingTimes = documents
        .filter(doc => doc.processing_time_seconds)
        .map(doc => doc.processing_time_seconds);
      
      if (processingTimes.length > 0) {
        avgProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
      }
    }

    // Calcular tasa de éxito basada en confidence scores
    let successRate = 97.2; // default
    if (documents && documents.length > 0) {
      const confidenceScores = documents
        .filter(doc => doc.confidence_score)
        .map(doc => doc.confidence_score);
      
      if (confidenceScores.length > 0) {
        successRate = (confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length) * 100;
      }
    }

    // Formatear documentos para el frontend
    const formattedDocuments = (documents || []).map(doc => ({
      id: doc.id,
      name: doc.original_filename || 'Documento procesado',
      type: doc.document_type,
      status: doc.processing_status,
      confidence: doc.confidence_score ? (doc.confidence_score * 100).toFixed(1) : null,
      processedAt: doc.created_at,
      totalValue: doc.total_value,
      hsCode: doc.hs_codes?.[0] || null,
      country: doc.origin_country
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalDocuments,
        totalSavings,
        avgProcessingTime: Math.round(avgProcessingTime),
        successRate: Math.round(successRate * 10) / 10
      },
      documents: formattedDocuments,
      profile: {
        name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
        email: profile?.email,
        company: profile?.company_name,
        subscription: profile?.subscription_plan || 'starter',
        trialDaysLeft: profile?.trial_ends_at ? 
          Math.max(0, Math.ceil((new Date(profile.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24))) : 0,
        monthlyLimit: profile?.monthly_limit || 50,
        documentsUsed: totalDocuments
      }
    });

  } catch (error) {
    console.error('Error en dashboard API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error cargando datos del dashboard'
    }, { status: 500 });
  }
}