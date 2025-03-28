import  { useEffect} from "react";
import { FiltrosDTO, Ingreso } from "../../types/shared.type";
import { useIngresos } from "../../hooks/useIngresos";

interface CabeceraProps {
  filtros: FiltrosDTO;
  loading?: boolean;
  error?: string | null;
  ingresos: Ingreso[];
  setIngresoSeleccionado: (ingreso: Ingreso) => void;
}
const FormularioCabecera = ({ filtros, setIngresoSeleccionado }: CabeceraProps) => {
  const { obtenerIngresos, ingresos, loading, error } = useIngresos();

  useEffect(() => {
    obtenerIngresos(filtros);
  }, [filtros]);

  const TablaIngresosCabecera = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>Nro. Ingreso</th>
            <th>Fecha</th>
            <th>Proveedor</th>
            <th>Deposito</th>
            <th>Sucursal</th>
          </tr>
        </thead>
        <tbody>
          {ingresos.map((ingreso) => (
            <tr key={ingreso.id_compra} onClick={() => setIngresoSeleccionado(ingreso)}>
              <td>{ingreso.fecha_compra}</td>
              <td>{ingreso.proveedor}</td>
              <td>{ingreso.deposito_descripcion}</td>
              <td>{ingreso.sucursal_descripcion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const ErrorComponent = () => {
    return (
      <div className="flex flex-col gap-2 w-full h-full px-2 items-center justify-center">
        <h1 className="text-lg font-bold text-gray-600">Error al obtener los ingresos</h1>
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
    <div className="flex flex-col gap-2 w-full h-full px-2">
      <div className="flex flex-col gap-2 w-full h-full bg-white p-2 border border-gray-200 rounded-md">
        {loading ? (
          <LoadingComponent />
        ) : error ? (
          <ErrorComponent />
        ) : (
            ingresos.length > 0 ? (
                <TablaIngresosCabecera />
            ) : (
                <div className="flex flex-col gap-2 w-full h-full px-2 items-center justify-center">
                    <h1 className="text-lg font-bold text-gray-600">No se encontraron ingresos</h1>
                </div>
            )
        )}
      </div>
    </div>
  );
};

export default FormularioCabecera;
