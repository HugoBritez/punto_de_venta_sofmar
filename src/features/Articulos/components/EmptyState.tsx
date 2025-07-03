import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionButton?: {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = "No hay artículos",
  message = "No se encontraron artículos que coincidan con tu búsqueda. Intenta con otros filtros o crea un nuevo artículo.",
  actionButton
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
      {/* Icono ilustrativo */}
      <div className="mb-6 p-6 bg-gray-50 rounded-full">
        <svg 
          className="w-16 h-16 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
          />
        </svg>
      </div>
      
      {/* Contenido */}
      <div className="text-center max-w-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          {title}
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>
        
        {/* Botón de acción opcional */}
        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {actionButton.icon && (
              <span className="mr-2">
                {actionButton.icon}
              </span>
            )}
            {actionButton.text}
          </button>
        )}
      </div>
    </div>
  );
}; 