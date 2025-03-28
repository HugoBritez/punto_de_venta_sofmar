import { useState } from "react";
import { Eye } from "lucide-react";
import ModeloFacturaGeneral from "@/views/facturacion/FacturasClientes/FacturaGeneral";

const VistaPreviaFactura = () => {
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState<boolean>(false);

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Vista Previa de Factura</h2>
          {mostrarVistaPrevia ? (
            <button
              className="px-4 py-2 rounded-md text-white bg-gray-600"
              onClick={() => setMostrarVistaPrevia(false)}
            >
              Volver a edición
            </button>
          ) : (
            <button
              className="px-4 py-2 rounded-md text-white bg-blue-600 flex items-center gap-2"
              onClick={() => setMostrarVistaPrevia(true)}
            >
              <Eye size={18} />
              Vista previa PDF
            </button>
          )}
        </div>

        {mostrarVistaPrevia ? (
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">Vista previa de la factura</h3>
            <div className="w-full border border-gray-300 rounded-md p-4">
              <ModeloFacturaGeneral id_venta={134812} onImprimir={false} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Este botón generará una vista previa de la factura usando los datos de la venta #134812.
              Esto te permitirá ver cómo se verá la factura con las configuraciones actuales.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VistaPreviaFactura; 