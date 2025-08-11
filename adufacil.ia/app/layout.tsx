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
      <body className={`${inter.variable} font-sans antialiased bg-white transition-colors duration-300`}>
        {/* Versión mínima para debugging */}
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="container flex h-14 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-blue-600">
                Adufacil.ia
              </h1>
              <span className="text-sm text-gray-600 font-medium">
                Calculadora de Importación
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-600">
                © 2025 Adufacil.ia. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
