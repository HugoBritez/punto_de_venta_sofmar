import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import OperadoresSelect from "@/shared/ui/select/OperadoresSelect";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (depositoDestino: number) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  depositos: Array<{ dep_codigo: number; dep_descripcion: string }>;
  operadorResponsable: number | null;
  setOperadorResponsable: (operadorId: number | null) => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  depositos,
  operadorResponsable,
  setOperadorResponsable,
}) => {
  const [error, setError] = useState("");
  const [depositoDestino, setDepositoDestino] = useState<number | null>(null);


  const handleConfirm = () => {
    if (!depositoDestino) {
      setError("Por favor seleccione un depósito");
      return;
    }
    onConfirm(depositoDestino);
    onClose();
    setDepositoDestino(null);
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
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100"
                    >
                      <AlertTriangle className="h-6 w-6 text-blue-600" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">{message}</p>

                      <div className="mt-4 space-y-3">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-gray-700">
                            Por favor seleccione el depósito al que transferir los items verificados
                          </label>
                          <select
                            className="w-full p-2 border rounded-md"
                            value={depositoDestino || ""}
                            onChange={(e) => setDepositoDestino(Number(e.target.value))}
                          >
                            <option value="">Seleccione un depósito</option>
                            {depositos.map((dep) => (
                              <option key={dep.dep_codigo} value={dep.dep_codigo}>
                                {dep.dep_descripcion}
                              </option>
                            ))}
                          </select>
                          <label className="text-sm font-medium text-gray-700">
                            Seleccione el responsable de ubicar los items en el depósito destino
                          </label>
                          <OperadoresSelect
                            onChange={(operadorId) => setOperadorResponsable(operadorId)}
                            value={operadorResponsable}
                          />
                        </div>
                        {error && (
                          <p className="text-sm text-red-500">{error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

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
                    className="px-4 py-2 text-sm font-medium text-white rounded-md bg-blue-600 hover:bg-blue-700"
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
