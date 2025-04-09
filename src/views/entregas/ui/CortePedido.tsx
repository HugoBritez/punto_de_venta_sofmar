import { useState } from "react";
import { useCortePedidos } from "../hooks/useCortePedidos";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@chakra-ui/react";

interface CortePedidoProps {
  id_detalle: number;
  cantidad: number;
  onClose?: () => void;
  onSuccess?: () => void;
}

const CortePedido = ({ id_detalle, cantidad, onClose, onSuccess }: CortePedidoProps) => {
  const { agregarPedidoFaltante, loading } = useCortePedidos();
  const [isOpen, setIsOpen] = useState(true);
  const [cantidadInput, setCantidadInput] = useState(cantidad);
  const [observacion, setObservacion] = useState("");
  const toast = useToast();

  const handleAgregarPedidoFaltante = async () => {
    try {
      if (observacion.trim() === "") {
        toast({
          title: "Error",
          description: "El motivo de corte de pedido es requerido",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      if (cantidadInput <= 0) {
        toast({
          title: "Error",
          description: "La cantidad de pedido faltante debe ser mayor a 0",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      if (!Number.isInteger(cantidadInput)) {
        toast({
          title: "Error",
          description: "La cantidad de pedido faltante debe ser un número entero",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      await agregarPedidoFaltante(id_detalle, cantidadInput, observacion);
      console.log('datos enviados', id_detalle, cantidadInput, observacion)
      setIsOpen(false);
      if (onClose) onClose();
      if (onSuccess) onSuccess();
      toast({
        title: "Pedido Faltante Agregado",
        description: "El pedido faltante se ha agregado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error al agregar pedido faltante",
        description: error as string,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">
              Agregar  Pedido Faltante
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad faltante:
                </label>
                <input
                  type="number"
                  value={cantidadInput}
                  onChange={(e) => setCantidadInput(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de corte de pedido:
                </label>
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAgregarPedidoFaltante}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CortePedido;
