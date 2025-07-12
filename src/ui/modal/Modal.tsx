import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxWidth?: string;
  showCloseButton?: boolean;
  size?: string;
  backgroundColor?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = "max-w-lg",
  showCloseButton = true,
  size = "",
  backgroundColor = "bg-white",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal Container - Mejorado para móviles */}
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1],
              }}
              className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all w-full h-full sm:h-auto sm:my-8 ${maxWidth} ${size} ${backgroundColor}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Mejorado para móviles */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 sticky top-0 bg-white z-10">
                  {title && (
                    <h3 className="text-base sm:text-lg font-medium leading-6 text-gray-900 pr-2">
                      {title}
                    </h3>
                  )}
                  {showCloseButton && (
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors duration-150"
                      onClick={onClose}
                    >
                      <span className="sr-only">Cerrar</span>
                      <svg
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Content - Mejorado para móviles */}
              <div className="overflow-y-auto max-h-[calc(100vh-120px)] sm:max-h-[80vh]">
                <div className="p-3 sm:p-4">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
