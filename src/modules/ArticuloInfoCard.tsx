import { ArticuloBusqueda } from "@/types/shared_interfaces";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2,
  Calendar,
} from "lucide-react";

interface ArticuloInfoCardProps {
  articulo: ArticuloBusqueda | null;
  isVisible: boolean;
}

const ArticuloInfoCard = ({ articulo, isVisible }: ArticuloInfoCardProps) => {
  if (!articulo || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm border border-gray-200 z-50"
        >
          <div className="flex flex-col gap-3">
            {/* Título */}
            <div className="border-b pb-2">
              <h3 className="text-lg font-bold text-gray-800">
                {articulo.descripcion}
              </h3>
            </div>

            {/* Información principal */}
            <div className="flex flex-col gap-2">
              {/* Vencimiento si existe */}
              {articulo.vencimiento_validacion === 0 && articulo.lotes?.[0] && (
                <div className="flex items-center gap-2 text-gray-700 mt-1">
                  <Calendar size={18} className="text-orange-500" />
                  <span className="font-semibold">Vencimiento:</span>
                  <span>{articulo.lotes[0].vencimiento}</span>
                </div>
              )}

              {/* Estadísticas adicionales */}
              <div className="flex items-center gap-2 text-gray-700 mt-1">
                <BarChart2 size={18} className="text-purple-500" />
                <span className="font-semibold">Ubi./ Sub. Ubi.:</span>
                <span className="text-sm">{articulo.ubicacion}</span>
                <span className="text-sm">{articulo.sub_ubicacion}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 mt-1">
                <BarChart2 size={18} className="text-purple-500" />
                <span className="font-semibold">Proveedor:</span>
                <span className="text-sm">{articulo.proveedor}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 mt-1">
                <BarChart2 size={18} className="text-purple-500" />
                <span className="font-semibold">Marca/Lab.:</span>
                <span className="text-sm">{articulo.marca}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 mt-1">
                <BarChart2 size={18} className="text-purple-500" />
                <span className="font-semibold">Fecha ult. compra.:</span>
                <span className="text-sm">{articulo.fecha_ultima_compra}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 mt-1">
                <BarChart2 size={18} className="text-purple-500" />
                <span className="font-semibold">Fecha ult. venta.:</span>
                <span className="text-sm">{articulo.fecha_ultima_venta}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ArticuloInfoCard;
