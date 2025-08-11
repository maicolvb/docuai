'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/SimpleAuthContext';
import { Mail, Lock, User, Building, Phone, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function AuthForm({ mode = 'signin', onSuccess }) {
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const [formMode, setFormMode] = useState(mode); // 'signin' | 'signup'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
    phone: '',
    businessType: 'importer',
    companySize: '11-50'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (formMode === 'signup') {
        // Registro de usuario
        const result = await signUp({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName,
          phone: formData.phone,
          businessType: formData.businessType,
          companySize: formData.companySize
        });

        setMessage('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
        if (onSuccess) onSuccess(result.user);

      } else {
        // Inicio de sesión
        const result = await signIn({
          email: formData.email,
          password: formData.password
        });

        setMessage('¡Bienvenido de vuelta!');
        if (onSuccess) onSuccess(result.user);
      }

    } catch (error) {
      console.error('Auth error:', error);
      
      // Mensajes de error más amigables
      const errorMessages = {
        'Invalid login credentials': 'Email o contraseña incorrectos',
        'User already registered': 'Este email ya está registrado. ¿Quieres iniciar sesión?',
        'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
        'Unable to validate email address: invalid format': 'Formato de email inválido',
        'Email not confirmed': 'Confirma tu email antes de iniciar sesión'
      };
      
      setError(errorMessages[error.message] || error.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();
      if (onSuccess) onSuccess(result.user);
    } catch (error) {
      setError('Error al conectar con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Building className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {formMode === 'signup' ? '🚀 Únete a Adufacil' : '👋 Bienvenido de vuelta'}
          </h2>
          <p className="mt-2 text-gray-600">
            {formMode === 'signup' 
              ? 'Automatiza tus documentos aduaneros con IA'
              : 'Ingresa a tu cuenta para continuar'
            }
          </p>
        </div>

        {/* Mensajes */}
        {message && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700">{message}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@empresa.com"
                />
              </div>
            </div>

            {/* Campos adicionales para registro */}
            {formMode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Juan"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tu empresa SAS"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de negocio
                    </label>
                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="importer">Importador</option>
                      <option value="exporter">Exportador</option>
                      <option value="agent">Agente Aduanero</option>
                      <option value="consultant">Consultor</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-1">
                      Tamaño empresa
                    </label>
                    <select
                      id="companySize"
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="1-10">1-10 empleados</option>
                      <option value="11-50">11-50 empleados</option>
                      <option value="51-200">51-200 empleados</option>
                      <option value="201-1000">201-1000 empleados</option>
                      <option value="1000+">1000+ empleados</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={formMode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Botón principal */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {formMode === 'signup' ? 'Creando cuenta...' : 'Iniciando sesión...'}
              </div>
            ) : (
              formMode === 'signup' ? '🚀 Crear cuenta gratis' : '👋 Iniciar sesión'
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">o</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          {/* Toggle entre signin/signup */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setFormMode(formMode === 'signup' ? 'signin' : 'signup')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {formMode === 'signup' 
                ? '¿Ya tienes cuenta? Inicia sesión' 
                : '¿No tienes cuenta? Regístrate gratis'
              }
            </button>
          </div>
        </form>

        {/* Trial info para signup */}
        {formMode === 'signup' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <h4 className="font-medium text-blue-900 mb-1">
                ✨ 14 días de prueba gratis
              </h4>
              <p className="text-sm text-blue-700">
                Sin tarjeta de crédito • Cancela cuando quieras • 50 documentos incluidos
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}