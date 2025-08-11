'use client';

import { useState } from 'react';
import { 
  DollarSign, 
  FileText, 
  Globe, 
  Package, 
  AlertTriangle, 
  CheckCircle,
  Download,
  Share2,
  Calculator,
  Clock,
  TrendingUp
} from 'lucide-react';

interface TaxCalculation {
  baseValue: number;
  arancel: number;
  arancelRate: number;
  iva: number;
  ivaRate: number;
  cuatroPorMil: number;
  totalTaxes: number;
  totalToPay: number;
  breakdown: TaxBreakdown[];
}

interface TaxBreakdown {
  concept: string;
  rate: number;
  amount: number;
  description: string;
}

interface AdditionalInfo {
  hsCode: string;
  restrictions: string[];
  estimatedProcessingDays: number;
  currency: string;
  calculatedAt: string;
}

interface TaxResultsProps {
  calculation: TaxCalculation;
  additionalInfo: AdditionalInfo;
  warnings: string[];
  recommendations: string[];
  invoiceData: {
    totalValue: number;
    products: string[];
    origin: string;
    supplier: string;
    weight: number;
  };
}

export default function TaxResultsDashboard({ 
  calculation, 
  additionalInfo, 
  warnings, 
  recommendations,
  invoiceData 
}: TaxResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'details'>('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      
      {/* Header con resumen principal */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Cálculo de Importación</h1>
              <p className="text-blue-100">
                {invoiceData.products[0]} desde {invoiceData.origin}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100 mb-1">Total a Pagar</div>
              <div className="text-4xl font-bold">
                {formatCurrency(calculation.totalToPay)}
              </div>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-gray-700">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
              <Package className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {formatCurrency(calculation.baseValue)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Valor CIF</div>
          </div>

          <div className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {calculation.arancelRate}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Arancel</div>
          </div>

          <div className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Calculator className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {formatCurrency(calculation.totalTaxes)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Impuestos</div>
          </div>

          <div className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <Clock className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {additionalInfo.estimatedProcessingDays}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Días estimados</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Resumen', icon: FileText },
              { id: 'breakdown', name: 'Desglose', icon: Calculator },
              { id: 'details', name: 'Detalles', icon: Globe }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Advertencias */}
              {warnings.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        Advertencias Importantes
                      </h3>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        {warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Recomendaciones */}
              {recommendations.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        Recomendaciones
                      </h3>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        {recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Información de la factura */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Información del Producto
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Producto:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {invoiceData.products[0]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Proveedor:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {invoiceData.supplier}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Origen:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {invoiceData.origin}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Peso:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {invoiceData.weight} kg
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Clasificación Arancelaria
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Código HS:</span>
                      <span className="font-mono font-medium text-gray-900 dark:text-white">
                        {additionalInfo.hsCode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tasa Arancel:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {calculation.arancelRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Calculado:</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(additionalInfo.calculatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Breakdown Tab */}
          {activeTab === 'breakdown' && (
            <div className="space-y-6">
              
              {/* Visual breakdown */}
              <div className="relative">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-8 overflow-hidden">
                  <div className="flex h-full">
                    <div 
                      className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(calculation.baseValue / calculation.totalToPay) * 100}%` }}
                    >
                      Valor Base
                    </div>
                    <div 
                      className="bg-orange-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(calculation.arancel / calculation.totalToPay) * 100}%` }}
                    >
                      Arancel
                    </div>
                    <div 
                      className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(calculation.iva / calculation.totalToPay) * 100}%` }}
                    >
                      IVA
                    </div>
                    <div 
                      className="bg-purple-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(calculation.cuatroPorMil / calculation.totalToPay) * 100}%` }}
                    >
                      4x1000
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown table */}
              <div className="space-y-3">
                {calculation.breakdown.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.concept}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </div>
                      {item.rate > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.rate}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Total */}
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg font-bold">
                  <span className="text-blue-900 dark:text-blue-100">
                    TOTAL A PAGAR
                  </span>
                  <span className="text-xl text-blue-900 dark:text-blue-100">
                    {formatCurrency(calculation.totalToPay)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              
              {/* Restricciones */}
              {additionalInfo.restrictions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Restricciones y Requisitos
                  </h3>
                  <div className="space-y-3">
                    {additionalInfo.restrictions.map((restriction, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <span className="text-sm text-red-700 dark:text-red-300">
                          {restriction}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Información técnica */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Información Técnica
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-gray-600 dark:text-gray-400">Código HS:</span>
                      <span className="font-mono text-gray-900 dark:text-white">{additionalInfo.hsCode}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-gray-600 dark:text-gray-400">Moneda base:</span>
                      <span className="text-gray-900 dark:text-white">{additionalInfo.currency}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-gray-600 dark:text-gray-400">Días estimados:</span>
                      <span className="text-gray-900 dark:text-white">{additionalInfo.estimatedProcessingDays} días</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-gray-600 dark:text-gray-400">Calculado el:</span>
                      <span className="text-gray-900 dark:text-white">{formatDate(additionalInfo.calculatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Cálculo válido hasta: {formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())}
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Share2 className="h-4 w-4" />
            Compartir
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="h-4 w-4" />
            Exportar PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <DollarSign className="h-4 w-4" />
            Pagar Cálculo Detallado
          </button>
        </div>
      </div>
    </div>
  );
}