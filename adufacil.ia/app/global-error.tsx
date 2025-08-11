'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Algo salió mal
            </h2>
            <p className="text-gray-600 mb-6">
              Ocurrió un error inesperado. Por favor intenta de nuevo.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => reset()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Intentar de nuevo
              </button>
              <a
                href="/calculator"
                className="bg-gray-100 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-200"
              >
                Ir a Calculadora
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}