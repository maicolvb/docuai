import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import ErrorBoundary from "@/components/providers/ErrorBoundary";
import ThemeToggle from "@/components/ui/ThemeToggle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Adufacil.ia - Calculadora de Impuestos",
  description: "Calculadora de impuestos DIAN para importaciones en Colombia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-white dark:bg-gray-900 transition-colors duration-300`}>
        <ErrorBoundary>
          <ThemeProvider>
            <ErrorBoundary>
              <AuthProvider>
                {/* Header con Theme Toggle */}
                <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
                  <div className="container flex h-14 items-center justify-between px-4">
                    <div className="flex items-center space-x-2">
                      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Adufacil.ia
                      </h1>
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Calculadora de Importación
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <ErrorBoundary>
                        <ThemeToggle />
                      </ErrorBoundary>
                    </div>
                  </div>
                </header>

                {/* Main Content */}
                <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </main>

                {/* Footer */}
                <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        © 2025 Adufacil.ia. Todos los derechos reservados.
                      </div>
                      <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-4 md:mt-0">
                        <a href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-100">
                          Privacidad
                        </a>
                        <a href="/terms" className="hover:text-gray-900 dark:hover:text-gray-100">
                          Términos
                        </a>
                        <a href="/contact" className="hover:text-gray-900 dark:hover:text-gray-100">
                          Contacto
                        </a>
                      </div>
                    </div>
                  </div>
                </footer>
              </AuthProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
