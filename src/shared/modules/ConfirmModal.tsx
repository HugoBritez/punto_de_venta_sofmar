import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Lock } from "lucide-react";
import { Input } from "@chakra-ui/react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (credentials?: { username: string; password: string }) => void;
  title: string;
  message: string;
  type?: "simple" | "auth";
  confirmText?: string;
  cancelText?: string;
  icon?: "warning" | "lock";
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "simple",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  icon = "warning",
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleConfirm = () => {
    if (type === "auth") {
      if (!username || !password) {
        setError("Por favor complete todos los campos");
        return;
      }
      onConfirm({ username, password });
    } else {
      onConfirm();
    }
    onClose();
    setUsername("");
    setPassword("");
  };

  const renderIcon = () => {
    const iconProps = "h-6 w-6";
    return icon === "warning" ? (
      <AlertTriangle className={`${iconProps} text-red-600`} />
    ) : (
      <Lock className={`${iconProps} text-blue-600`} />
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-lg rounded-lg bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        icon === "warning" ? "bg-red-100" : "bg-blue-100"
                      }`}
                    >
                      {renderIcon()}
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">{message}</p>

                      {type === "auth" && (
                        <div className="mt-4 space-y-3">
                          <Input
                            placeholder="Usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                          <Input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          {error && (
                            <p className="text-sm text-red-500">{error}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3 rounded-b-lg flex justify-end gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={onClose}
                  >
                    {cancelText}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                      icon === "warning"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    onClick={handleConfirm}
                  >
                    {confirmText}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
