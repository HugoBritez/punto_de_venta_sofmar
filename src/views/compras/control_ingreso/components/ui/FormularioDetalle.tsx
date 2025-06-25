import { createRoot } from "react-dom/client";
import { IngresoDetalle } from "../../types/shared.type";
import  {VerificacionItemDTO} from "@/shared/types/controlIngreso"
import CaratulaItemVerificado from "../CaratulaItemVerificado";
import { Printer } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { useVerificarItem } from "../../hooks/useMutations";

interface CabeceraProps {
  loading?: boolean;
  error?: string | null;
  detalleIngreso: IngresoDetalle[];
  onItemVerificado?: () => void;
}

// Interfaz para los valores temporales de edición
interface ValoresEdicion {
  cantidad: string;
  lote: string;
  vencimiento: string;
}

const FormularioDetalle = ({ detalleIngreso, onItemVerificado }: CabeceraProps) => {
  const { mutate: verificarItem, isPending: isVerificandoItem, isError: isErrorVerificandoItem } = useVerificarItem();
  const [modoEdicion, setModoEdicion] = useState<number | null>(null);
  const [valoresTemp, setValoresTemp] = useState<ValoresEdicion>({
    cantidad: "",
    lote: "",
    vencimiento: ""
  });
  const cantidadRef = useRef<HTMLInputElement>(null);
  const loteRef = useRef<HTMLInputElement>(null);
  const vencimientoRef = useRef<HTMLInputElement>(null);
  const toast  = useToast();

  // Enfocar el input de cantidad automáticamente cuando se empieza a editar
  useEffect(() => {
    if (modoEdicion !== null && cantidadRef.current) {
      cantidadRef.current.focus();
    }
  }, [modoEdicion]);

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
                {modoEdicion === ingreso.detalle_compra ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={cantidadRef}
                      type="number"
                      value={valoresTemp.cantidad}
                      onChange={(e) => setValoresTemp(prev => ({ ...prev, cantidad: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleGuardarCantidad(ingreso);
                        } else if (e.key === 'Escape') {
                          cancelarEdicion();
                        }
                      }}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                      placeholder="0"
                    />
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
              <td>
                {modoEdicion === ingreso.detalle_compra ? (
                  <input
                    ref={loteRef}
                    type="text"
                    value={valoresTemp.lote}
                    onChange={(e) => setValoresTemp(prev => ({ ...prev, lote: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleGuardarCantidad(ingreso);
                      } else if (e.key === 'Escape') {
                        cancelarEdicion();
                      }
                    }}
                    className="w-24 px-2 py-1 border border-gray-300 rounded"
                    placeholder="Lote"
                  />
                ) : (
                  <div
                    className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                    onClick={() => handleEditarCantidad(ingreso)}
                  >
                    {ingreso.lote}
                  </div>
                )}
              </td>
              <td>
                {modoEdicion === ingreso.detalle_compra ? (
                  <input
                    ref={vencimientoRef}
                    type="date"
                    value={valoresTemp.vencimiento}
                    onChange={(e) => setValoresTemp(prev => ({ ...prev, vencimiento: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleGuardarCantidad(ingreso);
                      } else if (e.key === 'Escape') {
                        cancelarEdicion();
                      }
                    }}
                    className="w-32 px-2 py-1 border border-gray-300 rounded"
                  />
                ) : (
                  <div
                    className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                    onClick={() => handleEditarCantidad(ingreso)}
                  >
                    {ingreso.vencimiento}
                  </div>
                )}
              </td>
              <td>
                {modoEdicion === ingreso.detalle_compra ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleGuardarCantidad(ingreso)}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                      title="Guardar"
                    >
                      ✓
                    </button>
                    <button
                      onClick={cancelarEdicion}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      title="Cancelar"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button onClick={() => ComponenteCaratula(ingreso, 'print')}>
                    <Printer />
                  </button>
                )}
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
    setModoEdicion(detalle.detalle_compra);
    setValoresTemp({
      cantidad: detalle.cantidad_verificada.toString(),
      lote: detalle.lote || "",
      vencimiento: detalle.vencimiento || ""
    });
  };

  const cancelarEdicion = () => {
    setModoEdicion(null);
    setValoresTemp({
      cantidad: "",
      lote: "",
      vencimiento: ""
    });
  };

  const handleGuardarCantidad = async (detalle: IngresoDetalle) => {
    const nuevaCantidad = parseInt(valoresTemp.cantidad || '0');

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
        detalle: detalle.detalle_compra,
        cantidad: nuevaCantidad,
        lote: valoresTemp.lote,
        vencimiento: valoresTemp.vencimiento,
      };
      
      await verificarItem(verificacionItemDTO);
      
      toast({
        title: "Éxito",
        description: "Datos actualizados correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      cancelarEdicion();
      
      // Notificar al componente padre que se actualizó un ítem
      onItemVerificado?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar los datos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full h-full px-2">
      <div className="flex flex-col gap-2 w-full h-full bg-white p-2 border border-gray-200 rounded-md">
        {isVerificandoItem ? (
          <LoadingComponent />
        ) : isErrorVerificandoItem ? (
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
