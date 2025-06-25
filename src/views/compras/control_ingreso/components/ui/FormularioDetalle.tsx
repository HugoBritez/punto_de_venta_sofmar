import { createRoot } from "react-dom/client";
import { IngresoDetalle } from "../../types/shared.type";
import  {VerificacionItemDTO} from "@/shared/types/controlIngreso"
import CaratulaItemVerificado from "../CaratulaItemVerificado";
import { Printer } from "lucide-react";
import {  useState} from "react";
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

// Función auxiliar para formatear fechas para mostrar - mover fuera del componente
const formatearFechaParaMostrar = (fecha: string | Date) => {
  if (!fecha) return "";
  
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (isNaN(fechaObj.getTime())) return "";
  
  return fechaObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Componente de tabla movido fuera del componente principal
const TablaIngresosCabecera = ({ 
  detalleIngreso, 
  modoEdicion, 
  valoresTemp, 
  setValoresTemp, 
  handleGuardarCantidad, 
  cancelarEdicion, 
  handleEditarCantidad, 
  ComponenteCaratula 
}: {
  detalleIngreso: IngresoDetalle[];
  modoEdicion: number | null;
  valoresTemp: ValoresEdicion;
  setValoresTemp: (valores: ValoresEdicion | ((prev: ValoresEdicion) => ValoresEdicion)) => void;
  handleGuardarCantidad: (detalle: IngresoDetalle) => void;
  cancelarEdicion: () => void;
  handleEditarCantidad: (detalle: IngresoDetalle) => void;
  ComponenteCaratula: (detalle: IngresoDetalle, accion?: "print" | "generate") => void;
}) => {
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
                  {formatearFechaParaMostrar(ingreso.vencimiento)}
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

const FormularioDetalle = ({ detalleIngreso, onItemVerificado }: CabeceraProps) => {
  const { mutate: verificarItem, isPending: isVerificandoItem, isError: isErrorVerificandoItem } = useVerificarItem();
  const [modoEdicion, setModoEdicion] = useState<number | null>(null);
  const [valoresTemp, setValoresTemp] = useState<ValoresEdicion>({
    cantidad: "",
    lote: "",
    vencimiento: ""
  });
  const toast  = useToast();

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
        vencimiento={new Date(detalle.vencimiento)}
        lote={detalle.lote}
        cantidad={detalle.cantidad_verificada}
        responsable={detalle.responsable}
        action={accion}
      />
    )
  }
   
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
    
    // Formatear la fecha para el input date (YYYY-MM-DD)
    const formatearFechaParaInput = (fecha: string | Date) => {
      if (!fecha) return "";
      
      const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
      if (isNaN(fechaObj.getTime())) return "";
      
      return fechaObj.toISOString().split('T')[0];
    };

    setValoresTemp({
      cantidad: detalle.cantidad_verificada.toString(),
      lote: detalle.lote || "",
      vencimiento: formatearFechaParaInput(detalle.vencimiento)
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
      // Simplificar la lógica de conversión de fechas
      let fechaFormateada = "";
      
      // Si hay fecha en valoresTemp, usarla
      if (valoresTemp.vencimiento && valoresTemp.vencimiento.trim() !== "") {
        const fecha = new Date(valoresTemp.vencimiento);
        if (!isNaN(fecha.getTime())) {
          fechaFormateada = fecha.toISOString().split('T')[0];
        }
      } 
      // Si no hay fecha en valoresTemp pero sí en detalle original, usar la original
      else if (detalle.vencimiento) {
        const fechaOriginal = typeof detalle.vencimiento === 'string' 
          ? new Date(detalle.vencimiento) 
          : detalle.vencimiento;
        
        if (!isNaN(fechaOriginal.getTime())) {
          fechaFormateada = fechaOriginal.toISOString().split('T')[0];
        }
      }

      const verificacionItemDTO: VerificacionItemDTO = {
        detalle: detalle.detalle_compra,
        cantidad: nuevaCantidad,
        lote: valoresTemp.lote || detalle.lote || "",
        vencimiento: fechaFormateada,
      };
      
      console.log('Datos a enviar desde FormularioDetalle:', verificacionItemDTO);
      
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
      if (onItemVerificado) {
        onItemVerificado();
      }

    } catch (error: any) {
      console.error("Error al actualizar item:", error);
      
      // Mostrar detalles específicos del error
      let errorMessage = "Error al actualizar los datos";
      
      if (error.response?.data?.title) {
        errorMessage = error.response.data.title;
      }
      
      if (error.response?.data?.detail) {
        errorMessage += `: ${error.response.data.detail}`;
      }
      
      if (error.response?.data?.errors) {
        const validationErrors = Object.values(error.response.data.errors).flat();
        errorMessage += ` - ${validationErrors.join(', ')}`;
      }

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
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
          <TablaIngresosCabecera 
            detalleIngreso={detalleIngreso}
            modoEdicion={modoEdicion}
            valoresTemp={valoresTemp}
            setValoresTemp={setValoresTemp}
            handleGuardarCantidad={handleGuardarCantidad}
            cancelarEdicion={cancelarEdicion}
            handleEditarCantidad={handleEditarCantidad}
            ComponenteCaratula={ComponenteCaratula}
          />
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
