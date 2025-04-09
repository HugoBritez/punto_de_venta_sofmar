import { FiltrosDTO, Ingreso } from "../../types/shared.type";
import { useVerificarIngresos } from "../../hooks/useVerificarIngresos";
import { useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import ConfirmationModal from "./ConfirmVerificationModal";
import { Deposito } from "@/types/shared_interfaces";
import { useIngresos } from "../../hooks/useIngresos";
interface CabeceraProps {
  filtros: FiltrosDTO;
  loading?: boolean;
  error?: string | null;
  ingresos: Ingreso[];
  ingresoSeleccionado: Ingreso | null;
  setIngresoSeleccionado: (ingreso: Ingreso) => void;
  depositos: Deposito[];
}
const FormularioCabecera = ({
  loading,
  error,
  ingresos,
  ingresoSeleccionado,
  setIngresoSeleccionado,
  depositos,
  filtros
}: CabeceraProps) => {
  const estaSeleccionado = (ingreso: Ingreso) => {
    return ingreso.id_compra === ingresoSeleccionado?.id_compra;
  };

  const TablaIngresosCabecera = () => {
    const { obtenerDetalleIngreso, detalleIngreso, obtenerIngresos } = useIngresos();
    const { confirmarVerificacion, error } = useVerificarIngresos();
    const id_usuario = Number(sessionStorage.getItem("user_id"));
    const toast = useToast();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [ingresoAConfirmar, setIngresoAConfirmar] = useState<Ingreso | null>(null);
    const [operadorResponsable, setOperadorResponsable] = useState<number | null>(null);

    const handleConfirmarVerificacion = (ingreso: Ingreso) => {
      if (ingreso.verificado === 0 || ingreso.verificado === 2) {
        toast({
          title: "Error",
          description: "El ingreso no esta verificado",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setIngresoAConfirmar(ingreso);
      setShowConfirmModal(true);
    };

    useEffect(() => {
      if (ingresoSeleccionado) {
        obtenerDetalleIngreso(ingresoSeleccionado.id_compra);
      }
    }, [ingresoSeleccionado]);

    const handleConfirmDeposito = async (depositoDestino: number) => {
      if (!ingresoAConfirmar ) {
        toast({
          title: "Error",
          description: "No hay información suficiente para confirmar la verificación",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      await confirmarVerificacion({
        id_compra: ingresoAConfirmar.id_compra,
        deposito_transitorio: ingresoAConfirmar.deposito,
        deposito_destino: depositoDestino,
        factura_compra: ingresoAConfirmar.nro_factura,
        user_id: id_usuario,
        operador_id: operadorResponsable || 0,
        items: detalleIngreso.map((detalle) => ({
          lote: detalle.lote,
          cantidad_ingreso: detalle.cantidad_verificada,
          cantidad_factura: detalle.cantidad,
          id_articulo: detalle.articulo_id,
        })),
      });

      if (error) {
        toast({
          title: "Error",
          description: error,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Éxito",
          description: "Verificación confirmada correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        obtenerIngresos(filtros);
      }
    };

    return (
      <>
        <table className="w-full overflow-y-auto">
          <thead>
            <tr className="bg-gray-100 border border-gray-200 [&>th]:border [&>th]:border-gray-200 ">
              <th>Nro. Ingreso</th>
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
              <tr
                key={ingreso.id_compra}
                onClick={() => setIngresoSeleccionado(ingreso)}
                className={`border border-gray-200 [&>td]:border [&>td]:border-gray-200 [&>td]:p-2 cursor-pointer hover:bg-blue-100 ${
                  estaSeleccionado(ingreso) ? "bg-blue-200" : ""
                }`}
              >
                <td className="text-center">{ingreso.id_orden}</td>
                <td className="text-center">{ingreso.fecha_compra}</td>
                <td>{ingreso.proveedor}</td>
                <td className="text-center">{ingreso.deposito_descripcion}</td>
                <td className="text-center">{ingreso.nro_factura}</td>
                <td>{ingreso.estado}</td>
                <td className="text-center">
                  {estaSeleccionado(ingreso) ? (
                    <div className="flex flex-row gap-2 justify-center">
                      <button
                        className="bg-orange-500 text-white px-2  rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={ingreso.verificado !== 1}
                        onClick={() => {
                          handleConfirmarVerificacion(ingreso);
                        }}
                      >
                        Confirmar Verificacion
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmDeposito}
          title="Confirmar transferencia"
          message="Seleccione el depósito destino para los items verificados"
          depositos={depositos}
          operadorResponsable={operadorResponsable}
          setOperadorResponsable={setOperadorResponsable}
        />
      </>
    );
  };

  const ErrorComponent = () => {
    return (
      <div className="flex flex-col gap-2 w-full h-full px-2 items-center justify-center">
        <h1 className="text-lg font-bold text-gray-600">
          Error al obtener los ingresos
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

  return (
    <div className="flex flex-col gap-2 w-full h-1/2 px-2">
      <div className="flex flex-col gap-2 w-full h-full bg-white p-2 border border-gray-200 rounded-md overflow-y-auto">
        {loading ? (
          <LoadingComponent />
        ) : error ? (
          <ErrorComponent />
        ) : ingresos.length > 0 ? (
          <TablaIngresosCabecera />
        ) : (
          <div className="flex flex-col gap-2 w-full h-full px-2 items-center justify-center">
            <h1 className="text-lg font-bold text-gray-600">
              No se encontraron ingresos
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormularioCabecera;
