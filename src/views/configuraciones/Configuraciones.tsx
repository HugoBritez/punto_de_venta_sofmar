import { useMediaQuery } from "@chakra-ui/react";
import { useState } from "react";
import ConfiguracionCard from "./ConfiguracionCard";
import { configuraciones } from "./configuracionesData";
import EncabezadoPieConfig from "./configs/EncabezadoPiePresupuesto";
import { Settings } from "lucide-react";
import EncabezadoFacturaConfig from "./configs/EncabezadoFacturaReport";
import ConfiguracionesFactura from "./configs/ConfiguracionesFactura";

export default function ConfiguracionesMenu() {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [configuracionSeleccionada, setConfiguracionSeleccionada] = useState<
    string | null
  >(null);

  const renderizarConfiguracion = () => {
    switch (configuracionSeleccionada) {
      case "encabezado-pie":
        return <EncabezadoPieConfig />;
      case "encabezado-factura":
        return <EncabezadoFacturaConfig />;
      case "factura":
        return <ConfiguracionesFactura />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              Selecciona una configuración para comenzar
            </p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 h-[100vh] w-full p-2">
        <div
          className={
            isMobile
              ? "flex flex-col gap-2 bg-blue-600 rounded-md h-[6%] justify-center px-1"
              : "flex flex-col gap-2 bg-blue-600 rounded-md h-[6%] justify-center px-4"
          }
        >
          <div
            className={
              isMobile
                ? "flex flex-row gap-2 p-2 items-center"
                : "flex flex-row gap-2 items-center"
            }
          >
            <Settings size={20} className="text-white" />
            <p className="text-white font-bold text-xl">Configuraciones</p>
          </div>
        </div>
        <div className="flex flex-row gap-2 w-full h-full">
          <div className="w-1/3 h-full bg-white rounded-md shadow-sm p-2">
            <div className="flex flex-row gap-2 p-2 items-center">
              <p className="text-md font-bold">Buscar</p>
              <input
                type="text"
                className="w-full p-2 rounded-md border border-gray-200 bg-gray-100 outline-blue-600"
              />
            </div>
            <div className="border-[1px] border-b-gray-200" />
            <div>
              {configuraciones.map((config) => (
                <ConfiguracionCard
                  key={config.id}
                  nombre={config.nombre}
                  descripcion={config.descripcion}
                  icono={config.icono}
                  onClick={() => setConfiguracionSeleccionada(config.id)}
                  seleccionado={configuracionSeleccionada === config.id}
                />
              ))}
            </div>
          </div>
          <div className="w-2/3 h-full bg-white rounded-md shadow-sm overflow-y-auto">
            {renderizarConfiguracion()}
          </div>
        </div>
      </div>
    </>
  );
}
