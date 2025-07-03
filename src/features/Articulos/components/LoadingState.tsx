import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Cargando..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
      {/* Spinner animado */}
      <div className="relative mb-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-ping"></div>
      </div>
      
      {/* Mensaje */}
      <div className="text-center">
        <p className="text-lg font-medium text-gray-700 mb-2 animate-pulse">
          {message}
        </p>
        <div className="flex space-x-1 justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}; 