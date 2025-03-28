import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import configuracionesWebStore from "@/stores/configuracionesWebStore";
import VistaPreviaFactura from "./VistaPreviaFactura";

interface ConfiguracionFactura {
  tipo_factura: string;
  desc_establecimiento: string;
  dato_establecimiento: string;
  ancho_pag: string;
  alto_pag: string;
  items_p_factura: string;
  cantidad_copias: string;
}

const ConfiguracionesFactura = () => {
  const {
    ajustesFactura,
    facturaConfig,
    setFacturaConfig,
    guardarAjustesFactura,
  } = configuracionesWebStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<{
    tipo: "success" | "error";
    texto: string;
  } | null>(null);

  const [config, setConfig] = useState<ConfiguracionFactura>({
    tipo_factura: "",
    desc_establecimiento: "",
    dato_establecimiento: "",
    ancho_pag: "500",
    alto_pag: "800",
    items_p_factura: "10",
    cantidad_copias: "1",
  });

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  useEffect(() => {
    if (facturaConfig) {
      setConfig(facturaConfig);
    }
  }, [facturaConfig]);

  const cargarConfiguracion = async () => {
    try {
      setIsLoading(true);
      await ajustesFactura();
    } catch (error) {
      console.error("Error al cargar la configuración:", error);
      setMensaje({
        tipo: "error",
        texto: "Error al cargar la configuración",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true);
      const response = await guardarAjustesFactura(config);

      if (response?.data?.body?.success === true) {
        setMensaje({
          tipo: "success",
          texto: "Configuración guardada correctamente",
        });
        setFacturaConfig(config);
      } else {
        throw new Error(
          response?.data?.message || "Error al guardar la configuración"
        );
      }
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Configuración de Factura</h2>

        {mensaje && (
          <div
            className={`mb-4 p-4 rounded ${
              mensaje.tipo === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {mensaje.texto}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Factura
            </label>
            <select
              name=""
              id=""
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) =>
                setConfig({ ...config, tipo_factura: e.target.value })
              }
              value={config.tipo_factura}
            >
              <option value="autofactura">Autofactura</option>
              <option value="prefactura">Factura Preimpresa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción del Establecimiento
            </label>
            <input
              type="text"
              value={config.desc_establecimiento}
              onChange={(e) =>
                setConfig({ ...config, desc_establecimiento: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datos del Establecimiento
            </label>
            <input
              type="text"
              value={config.dato_establecimiento}
              onChange={(e) =>
                setConfig({ ...config, dato_establecimiento: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Ancho de Página (Obs: 595.28p es el ancho estándar de una hoja A4,
              1 cm = 28.35p)
            </label>
            <input
              type="number"
              value={config.ancho_pag}
              onChange={(e) =>
                setConfig({ ...config, ancho_pag: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Alto de Página (Obs: 841.89p es el alto estándar de una hoja A4, 1
              cm = 28.35p)
            </label>
            <input
              type="number"
              value={config.alto_pag}
              onChange={(e) =>
                setConfig({ ...config, alto_pag: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Items por Factura
            </label>
            <input
              type="number"
              value={config.items_p_factura}
              onChange={(e) =>
                setConfig({ ...config, items_p_factura: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad de Copias
            </label>
            <input
              type="number"
              value={config.cantidad_copias}
              onChange={(e) =>
                setConfig({ ...config, cantidad_copias: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-300"
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Guardando...
              </>
            ) : (
              <>
                <Settings size={18} />
                Guardar configuración
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <VistaPreviaFactura />
      </div>
    </div>
  );
};

export default ConfiguracionesFactura;
