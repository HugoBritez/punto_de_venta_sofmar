import React from 'react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = "Error al cargar los artículos",
  onRetry,
  showRetryButton = true
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
      {/* Icono de error */}
      <div className="mb-4 p-4 bg-red-100 rounded-full">
        <svg 
          className="w-12 h-12 text-red-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      </div>
      
      {/* Mensaje de error */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Algo salió mal
        </h3>
        <p className="text-gray-600 max-w-md">
          {message}
        </p>
      </div>
      
      {/* Botón de reintentar */}
      {showRetryButton && onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          Reintentar
        </button>
      )}
    </div>
  );
}; 