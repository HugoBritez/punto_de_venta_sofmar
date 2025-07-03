import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, FileText } from "lucide-react";

interface ErrorNotificationProps {
  error: string | null;
  onClose: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ error, onClose }) => {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ 
            duration: 0.3, 
            ease: [0.4, 0, 0.2, 1] 
          }}
          className="fixed top-4 right-4 z-50 max-w-md w-[90%]"
        >
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-red-800">
                      Error en Facturación Electrónica
                    </h3>
                  </div>
                  <div className="text-sm text-red-700 bg-red-100 p-3 rounded-md border border-red-200 max-h-40 overflow-y-auto">
                    <p className="whitespace-pre-wrap break-words">
                      {error && error.length > 1000 
                        ? `${error.substring(0, 1000)}...` 
                        : error
                      }
                    </p>
                  </div>
                  <div className="mt-3 text-xs text-red-600">
                    <p>Por favor, revisa los datos e intenta nuevamente.</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-red-100 transition-colors"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const useFacturaSendNotification = () => {
  const [error, setError] = useState<string | null>(null);

  const showError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  const ErrorNotificationComponent = () => (
    <ErrorNotification error={error} onClose={clearError} />
  );

  return { 
    showError, 
    clearError, 
    ErrorNotificationComponent,
    hasError: !!error 
  };
};
