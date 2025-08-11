'use client';

import { Moon, Sun } from 'lucide-react';
import { useContext } from 'react';
import { ThemeContext } from '../providers/ThemeProvider';

export default function ThemeToggle() {
  const context = useContext(ThemeContext);
  
  // Fallback for SSR/SSG when context is not available
  const theme = context?.theme || 'light';
  const toggleTheme = context?.toggleTheme || (() => {});

  return (
    <button
      onClick={toggleTheme}
      className="
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
        hover:bg-gray-50 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        transition-all duration-200 ease-in-out
        group
      "
      title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      {/* Sun icon - visible in dark mode */}
      <Sun className={`
        h-5 w-5 text-yellow-500 transition-all duration-300 ease-in-out
        ${theme === 'dark' 
          ? 'rotate-0 scale-100 opacity-100' 
          : 'rotate-90 scale-0 opacity-0'
        }
        group-hover:scale-110
      `} />
      
      {/* Moon icon - visible in light mode */}
      <Moon className={`
        absolute h-5 w-5 text-slate-700 dark:text-slate-300 
        transition-all duration-300 ease-in-out
        ${theme === 'light' 
          ? 'rotate-0 scale-100 opacity-100' 
          : '-rotate-90 scale-0 opacity-0'
        }
        group-hover:scale-110
      `} />
      
      {/* Tooltip */}
      <span className="
        absolute -bottom-8 left-1/2 transform -translate-x-1/2
        px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded
        dark:text-gray-900 dark:bg-gray-100
        opacity-0 group-hover:opacity-100
        transition-opacity duration-200
        pointer-events-none
        whitespace-nowrap
      ">
        {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
      </span>
    </button>
  );
}