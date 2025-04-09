import { createRoot } from "react-dom/client";
import { useIngresos } from "../../hooks/useIngresos";
import { IngresoDetalle, VerificacionItemDTO } from "../../types/shared.type";
import CaratulaItemVerificado from "../CaratulaItemVerificado";
import { Printer } from "lucide-react";
import { useVerificarIngresos } from "../../hooks/useVerificarIngresos";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";

interface CabeceraProps {
  loading?: boolean;
  error?: string | null;
  detalleIngreso: IngresoDetalle[];
  onItemVerificado?: () => void;
}
const FormularioDetalle = ({ detalleIngreso, onItemVerificado }: CabeceraProps) => {
  const { loadingDetalle, errorDetalle } = useIngresos();
  const { verificarItem } = useVerificarIngresos();
  const [editandoCantidad, setEditandoCantidad] = useState<number | null>(null);
  const [cantidadTemp, setCantidadTemp] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const toast  = useToast();

  // Enfocar el input automáticamente cuando se empieza a editar
  useEffect(() => {
    if (editandoCantidad !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editandoCantidad]);

  const ComponenteCaratula = (
    detalle: IngresoDetalle,
    accion: "print" | "generate" = "print") => {
    const caratulaDiv = document.createElement('div');
    caratulaDiv.style.display = 'none';
    document.body.appendChild(caratulaDiv);

    const root = createRoot(caratulaDiv);
    root.render(
      <CaratulaItemVerificado
        codigo_interno={detalle.detalle_compra.toString()}
        codigo_barras={detalle.articulo_codigo_barras}
        descripcion={detalle.articulo_descripcion}
        vencimiento={detalle.vencimiento}
        lote={detalle.lote}
        cantidad={detalle.cantidad_verificada}
        responsable={detalle.responsable}
        action={accion}
      />
    )
  }
   
  const TablaIngresosCabecera = () => {
    return (
      <table className="w-full overflow-y-auto">
        <thead>
          <tr className="bg-gray-100 border border-gray-200 [&>th]:border [&>th]:border-gray-200 ">
            <th>Detalle Compra</th>
            <th>Articulo</th>
            <th>Cantidad Ingreso</th>
            <th>Cantidad Verificada</th>
            <th>Diferencia</th>
            <th>Lote</th>
            <th>Vencimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {detalleIngreso.map((ingreso) => (
            <tr key={ingreso.detalle_compra} className="border border-gray-200 [&>td]:border [&>td]:border-gray-200 [&>td]:px-2">
              <td>{ingreso.detalle_compra}</td>
              <td>{ingreso.articulo_descripcion}</td>
              <td>{ingreso.cantidad}</td>
              <td>
                {editandoCantidad === ingreso.detalle_compra ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="number"
                      defaultValue={cantidadTemp}
                      onBlur={(e) => {
                        setCantidadTemp(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const valor = e.currentTarget.value;
                          setCantidadTemp(valor);
                          handleGuardarCantidad(ingreso);
                        } else if (e.key === 'Escape') {
                          setEditandoCantidad(null);
                          setCantidadTemp("");
                        }
                      }}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                      placeholder="0"
                    />
                    <button
                      onClick={() => handleGuardarCantidad(ingreso)}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setEditandoCantidad(null);
                        setCantidadTemp("");
                      }}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                    onClick={() => handleEditarCantidad(ingreso)}
                  >
                    {ingreso.cantidad_verificada}
                  </div>
                )}
              </td>
              <td>{ingreso.cantidad - ingreso.cantidad_verificada}</td>
              <td>{ingreso.lote}</td>
              <td>{ingreso.vencimiento}</td>
              <td>
                <button onClick={() => ComponenteCaratula(ingreso, 'print')}>
                  <Printer />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const ErrorComponent = () => {
    return (
      <div className="flex flex-col gap-2 w-full h-full px-2 items-center justify-center">
        <h1 className="text-lg font-bold text-gray-600">
          Error al obtener los detalles de los ingresos
        </h1>
      </div>
    );
  };

  const LoadingComponent = () => {
    return (
      <div className="flex flex-col gap-2 w-full h-full px-2 items-center justify-center">
        <h1>Cargando...</h1>
      </div>
    );
  };

  const handleEditarCantidad = (detalle: IngresoDetalle) => {
    setEditandoCantidad(detalle.detalle_compra);
    setCantidadTemp(''); // Iniciamos con un valor vacío en lugar del valor actual
  };

  const handleGuardarCantidad = async (detalle: IngresoDetalle) => {
    const nuevaCantidad = parseInt(cantidadTemp || '0');

    if (isNaN(nuevaCantidad) || nuevaCantidad < 0) {
      toast({
        title: "Error",
        description: "La cantidad debe ser un número válido mayor o igual a 0",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  

    try {
      const verificacionItemDTO: VerificacionItemDTO = {
        id_detalle: detalle.detalle_compra,
        cantidad: nuevaCantidad,
      };
      
      await verificarItem(verificacionItemDTO);
      
      toast({
        title: "Éxito",
        description: "Cantidad actualizada correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setEditandoCantidad(null);
      setCantidadTemp("");
      
      // Notificar al componente padre que se actualizó un ítem
      onItemVerificado?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar la cantidad",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full h-full px-2">
      <div className="flex flex-col gap-2 w-full h-full bg-white p-2 border border-gray-200 rounded-md">
        {loadingDetalle ? (
          <LoadingComponent />
        ) : errorDetalle ? (
          <ErrorComponent />
        ) : detalleIngreso.length > 0 ? (
          <TablaIngresosCabecera />
        ) : (
          <div className="flex flex-col gap-2 w-full h-full px-2 items-center justify-center">
            <h1 className="text-lg font-bold text-gray-600">
              No se encontraron detalles de los ingresos
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormularioDetalle;
