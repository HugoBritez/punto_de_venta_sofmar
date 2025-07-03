import { FiltrosDTO, Ingreso, IngresoDetalle } from "../../types/shared.type";
import { useToast } from "@chakra-ui/react";
import { useState } from "react";
import ConfirmationModal from "./ConfirmVerificationModal";
import { Deposito } from "@/types/shared_interfaces";
import { useConfirmarIngreso } from "../../hooks/useMutations";
import { useGetDetalleIngreso } from "../../hooks/useQueryIngresos";

interface CabeceraProps {
  filtros: FiltrosDTO;
  loading?: boolean;
  error?: string | null;
  ingresos: Ingreso[];
  ingresoSeleccionado: Ingreso | null;
  setIngresoSeleccionado: (ingreso: Ingreso) => void;
  depositos: Deposito[];
  onRefresh: () => void;
}

const FormularioCabecera = ({
  loading,
  error,
  ingresos,
  ingresoSeleccionado,
  setIngresoSeleccionado,
  depositos,
  onRefresh
}: CabeceraProps) => {
  const toast = useToast();
  const { mutate: confirmarVerificacion} = useConfirmarIngreso();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ingresoAConfirmar, setIngresoAConfirmar] = useState<Ingreso | null>(null);
  const [operadorResponsable, setOperadorResponsable] = useState<number | null>(null);

  // Hook para obtener el detalle del ingreso seleccionado
  const { data: detalleIngreso = [] } = useGetDetalleIngreso(
    ingresoSeleccionado?.id_compra || 0
  );

  const estaSeleccionado = (ingreso: Ingreso) => {
    return ingreso.id_compra === ingresoSeleccionado?.id_compra;
  };

  const handleConfirmarVerificacion = (ingreso: Ingreso) => {
    if (!esIngresoVerificado(ingreso)) {
      mostrarError("El ingreso no está verificado");
      return;
    }

    setIngresoAConfirmar(ingreso);
    setShowConfirmModal(true);
  };

  const esIngresoVerificado = (ingreso: Ingreso): boolean => {
    return ingreso.verificado === 1;
  };

  const mostrarError = (mensaje: string) => {
    toast({
      title: "Error",
      description: mensaje,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  };

  const mostrarExito = (mensaje: string) => {
    toast({
      title: "Éxito",
      description: mensaje,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleConfirmDeposito = (depositoDestino: number) => {
    if (!ingresoAConfirmar) {
      mostrarError("No hay información suficiente para confirmar la verificación");
      return;
    }

    const id_usuario = Number(sessionStorage.getItem("user_id"));

    const items = Array.isArray(detalleIngreso) 
      ? detalleIngreso.map((detalle: IngresoDetalle) => ({
          lote: detalle.lote,
          cantidadIngreso: detalle.cantidad_verificada,
          cantidadFactura: detalle.cantidad,
          idArticulo: detalle.articulo_id,
          vencimiento: new Date(detalle.vencimiento),
        }))
      : detalleIngreso.body?.map((detalle: IngresoDetalle) => ({
          lote: detalle.lote,
          cantidadIngreso: detalle.cantidad_verificada,
          cantidadFactura: detalle.cantidad,
          idArticulo: detalle.articulo_id,
          vencimiento: new Date(detalle.vencimiento),
        })) || [];

    confirmarVerificacion({
      idCompra: ingresoAConfirmar.id_compra,
      deposito_inicial: ingresoAConfirmar.deposito,
      deposito_destino: depositoDestino,
      factura: ingresoAConfirmar.nro_factura,
      user_id: id_usuario,
      confirmador_id: operadorResponsable || 0,
      items: items,
    }, {
      onSuccess: () => {
        mostrarExito("Verificación confirmada correctamente");
        onRefresh();
        limpiarEstados();
      },
      onError: (error: any) => {
        console.error('Error en confirmación:', error);
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.detail || 
                           error.message || 
                           "Error al confirmar la verificación";
        mostrarError(errorMessage);
      }
    });
  };

  const limpiarEstados = () => {
    setIngresoAConfirmar(null);
    setShowConfirmModal(false);
    setOperadorResponsable(null);
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setIngresoAConfirmar(null);
    setOperadorResponsable(null);
  };

  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent />;
  }

  if (ingresos.length === 0) {
    return <EmptyStateComponent />;
  }

  return (
    <div className="flex flex-col gap-2 w-full h-1/2 px-2">
      <div className="flex flex-col gap-2 w-full h-full bg-white p-2 border border-gray-200 rounded-md overflow-y-auto">
        <TablaIngresosCabecera 
          ingresos={ingresos}
          ingresoSeleccionado={ingresoSeleccionado}
          setIngresoSeleccionado={setIngresoSeleccionado}
          estaSeleccionado={estaSeleccionado}
          onConfirmarVerificacion={handleConfirmarVerificacion}
        />
        
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDeposito}
          title="Confirmar transferencia"
          message="Seleccione el depósito destino para los items verificados"
          depositos={depositos}
          operadorResponsable={operadorResponsable}
          setOperadorResponsable={setOperadorResponsable}
        />
      </div>
    </div>
  );
};

// Componentes separados para mejor organización
const TablaIngresosCabecera = ({ 
  ingresos, 
  setIngresoSeleccionado, 
  estaSeleccionado, 
  onConfirmarVerificacion 
}: {
  ingresos: Ingreso[];
  ingresoSeleccionado: Ingreso | null;
  setIngresoSeleccionado: (ingreso: Ingreso) => void;
  estaSeleccionado: (ingreso: Ingreso) => boolean;
  onConfirmarVerificacion: (ingreso: Ingreso) => void;
}) => (
  <table className="w-full overflow-y-auto">
    <thead>
      <tr className="bg-gray-100 border border-gray-200 [&>th]:border [&>th]:border-gray-200">
        <th>Nro. Compra</th>
        <th>Fecha</th>
        <th>Proveedor</th>
        <th>Deposito</th>
        <th>Factura</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {ingresos.map((ingreso) => (
        <FilaIngreso
          key={ingreso.id_compra}
          ingreso={ingreso}
          estaSeleccionado={estaSeleccionado(ingreso)}
          onSelect={() => setIngresoSeleccionado(ingreso)}
          onConfirmarVerificacion={onConfirmarVerificacion}
        />
      ))}
    </tbody>
  </table>
);

const FilaIngreso = ({ 
  ingreso, 
  estaSeleccionado, 
  onSelect, 
  onConfirmarVerificacion 
}: {
  ingreso: Ingreso;
  estaSeleccionado: boolean;
  onSelect: () => void;
  onConfirmarVerificacion: (ingreso: Ingreso) => void;
}) => (
  <tr
    onClick={onSelect}
    className={`border border-gray-200 [&>td]:border [&>td]:border-gray-200 [&>td]:p-2 cursor-pointer hover:bg-blue-100 ${
      estaSeleccionado ? "bg-blue-200" : ""
    }`}
  >
    <td className="text-center">{ingreso.id_compra}</td>
    <td className="text-center">{ingreso.fecha_compra}</td>
    <td>{ingreso.proveedor}</td>
    <td className="text-center">{ingreso.deposito_descripcion}</td>
    <td className="text-center">{ingreso.nro_factura}</td>
    <td>{ingreso.estado}</td>
    <td className="text-center">
      {estaSeleccionado && (
        <BotonConfirmarVerificacion 
          ingreso={ingreso}
          onConfirmar={onConfirmarVerificacion}
        />
      )}
    </td>
  </tr>
);

const BotonConfirmarVerificacion = ({ 
  ingreso, 
  onConfirmar 
}: {
  ingreso: Ingreso;
  onConfirmar: (ingreso: Ingreso) => void;
}) => (
  <div className="flex flex-row gap-2 justify-center">
    <button
      className="bg-orange-500 text-white px-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={ingreso.verificado !== 1}
      onClick={(e) => {
        e.stopPropagation();
        onConfirmar(ingreso);
      }}
    >
      Confirmar Verificacion
    </button>
  </div>
);

const LoadingComponent = () => (
  <div className="flex flex-col gap-2 w-full h-full px-2 items-center justify-center">
    <h1>Cargando...</h1>
  </div>
);

const ErrorComponent = () => (
  <div className="flex flex-col gap-2 w-full h-full px-2 items-center justify-center">
    <h1 className="text-lg font-bold text-gray-600">
      Error al obtener los ingresos
    </h1>
  </div>
);

const EmptyStateComponent = () => (
  <div className="flex flex-col gap-2 w-full h-full px-2 items-center justify-center">
    <h1 className="text-lg font-bold text-gray-600">
      No se encontraron ingresos
    </h1>
  </div>
);

export default FormularioCabecera;
