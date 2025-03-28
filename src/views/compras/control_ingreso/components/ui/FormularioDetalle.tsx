import { useEffect } from "react";
import { useIngresos } from "../../hooks/useIngresos";

interface CabeceraProps {
  loading?: boolean;
  error?: string | null;
  id_ingreso: number | null;
}
const FormularioDetalle = ({ id_ingreso }: CabeceraProps) => {
  const { obtenerDetalleIngreso, detalleIngreso, loadingDetalle, errorDetalle } = useIngresos();

  useEffect(() => {
    if (id_ingreso) {
      obtenerDetalleIngreso(id_ingreso);
    }
  }, [id_ingreso]);

  const TablaIngresosCabecera = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>Detalle Compra</th>
            <th>Articulo</th>
            <th>Cantidad</th>
            <th>Lote</th>
            <th>Vencimiento</th>
          </tr>
        </thead>
        <tbody>
          {detalleIngreso.map((ingreso) => (
            <tr key={ingreso.detalle_compra}>
              <td>{ingreso.detalle_compra}</td>
              <td>{ingreso.articulo_descripcion}</td>
              <td>{ingreso.cantidad}</td>
              <td>{ingreso.lote}</td>
              <td>{ingreso.vencimiento}</td>
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
