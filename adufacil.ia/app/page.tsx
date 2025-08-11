import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900">
        <div className="pb-80 pt-16 sm:pb-40 sm:pt-24 lg:pb-48 lg:pt-40">
          <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
            <div className="sm:max-w-lg">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                Adufacil.ia
              </h1>
              <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
                Calculadora inteligente de impuestos DIAN para importaciones en Colombia. 
                Procesamiento de documentos con IA y cálculos precisos de aranceles.
              </p>
            </div>
            <div className="mt-10">
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/calculator"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Calcular Impuestos
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-8 py-3 text-base font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Ver Planes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Características</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Importación Inteligente
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0-1.125.504-1.125 1.125V3.375c0-.621-.504-1.125-1.125-1.125Z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Procesamiento de Documentos</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Extrae datos de facturas y documentos comerciales usando IA
                </p>
              </div>

              <div className="relative text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18a2.25 2.25 0 0 1-2.25 2.25h-7.5A2.25 2.25 0 0 1 3.75 18v-7.5A2.25 2.25 0 0 1 6 8.25h7.5A2.25 2.25 0 0 1 15.75 10.5v5.25ZM18 10.5h2.25A2.25 2.25 0 0 1 22.5 12.75V18a2.25 2.25 0 0 1-2.25 2.25H18M18 10.5V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v4.5" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Cálculos DIAN</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Tarifas arancelarias actualizadas y cálculos precisos de impuestos
                </p>
              </div>

              <div className="relative text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 7.996 21 8.625 21h6.75c.621 0 1.125-.504 1.125-1.125v-6.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v6.75C21 20.496 20.496 21 19.875 21H4.125C3.504 21 3 20.496 3 19.875v-6.75Z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Dashboard Interactivo</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Visualizaciones detalladas y reportes de tus importaciones
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}