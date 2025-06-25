import { useEffect } from "react";

import { FiltrosDTO } from "../../types/shared.type";

import { useSucursalesStore } from "@/stores/sucursalesStore";

import { useDepositosStore } from "@/stores/depositosStore";
import ProveedoresSelect from "@/ui/select/ProveedoresSelect";
import { Deposito } from "@/types/shared_interfaces";
import { createRoot } from "react-dom/client";
import ReporteIngresosComponent from "../ReporteIngresos";

import { InformeIngresosExcel } from "../ReporteIngresosExcel";
import { useVerificadorConfigStore } from "../../store/verificadorConfigStore";
import { FormButtons } from "@/shared/components/FormButtons/FormButtons";

interface Props {
  filtros: FiltrosDTO;
  setFiltros: (filtros: FiltrosDTO) => void;
  setDepositos: (depositos: Deposito[]) => void;
}

const FormularioFiltros = ({ filtros, setFiltros, setDepositos }: Props) => {
  const { depositoSeleccionado } = useVerificadorConfigStore();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  const handleProveedorChange = (proveedor_id: number | null) => {
    setFiltros({ ...filtros, nro_proveedor: proveedor_id || 0 });
  };

  const { sucursales, fetchSucursales } = useSucursalesStore();
  const { depositos, fetchDepositos } = useDepositosStore();

  //traer los datos de las sucursales y los depositos
  useEffect(() => {
    fetchSucursales();
    fetchDepositos();
  }, []);

  useEffect(() => {
    setDepositos(depositos);
  }, [depositos]);

  //establecer por defecto el deposito y la sucursal, respetando el guardado
  useEffect(() => {
    if (depositos.length > 0 && sucursales.length > 0) {
      // Usar el depósito guardado si existe, sino el primero de la lista
      const depositoInicial = depositoSeleccionado || depositos[0].dep_codigo;
      
      setFiltros({
        ...filtros,
        deposito: depositoInicial,
        sucursal: sucursales[0].id,
        fecha_desde: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        fecha_hasta: new Date().toISOString().split("T")[0],
        tipo_ingreso: 1,
      });
    }
  }, [depositos, sucursales, depositoSeleccionado]);

  const ReporteComponente = (
    filtros: FiltrosDTO,
    onComplete: () => void,
    onError: (error: any) => void,
    action: "print" | "download"
  ) => {
    const reporteDiv = document.createElement("div");
    reporteDiv.style.display = "none";
    document.body.appendChild(reporteDiv);

    const root = createRoot(reporteDiv);
    root.render(
      <ReporteIngresosComponent
        filtros={filtros}
        onComplete={onComplete}
        onError={onError}
        action={action}
      />
    );

    setTimeout(() => {
      root.unmount();
      document.body.removeChild(reporteDiv);
    }, 2000);
  };


  const ReporteComponenteExcel = (
    filtros: FiltrosDTO,
    onComplete: () => void,
    onError: (error: any) => void,
  ) => {
    console.log("ReporteComponenteExcel", filtros);
    const reporteDiv = document.createElement("div");
    reporteDiv.style.display = "none";
    document.body.appendChild(reporteDiv);

    const root = createRoot(reporteDiv);
    root.render(
      <InformeIngresosExcel
        filtros={filtros}
        onComplete={onComplete}
        onError={onError}
      />
    );

    setTimeout(() => {
      root.unmount();
      document.body.removeChild(reporteDiv);
    }, 5000);
  };
  return (
    <div className="flex flex-col gap-2 w-full p-2 ">
      <div className="flex flex-row gap-2 items-center bg-blue-500 w-full p-4 rounded-md">
        <h1 className="text-white text-xl font-bold">
          Verificacion de Ingreso de Articulos
        </h1>
      </div>
      <div className="flex flex-row gap-2 w-full border border-gray-200 rounded-md bg-blue-200 p-2 items-center">
        <div className="flex flex-col gap-2 border border-gray-200 rounded-md bg-orange-200 p-2">
          <p className="text-md font-bold">Tipo de Ingreso</p>
          <div className="flex flex-row gap-2">
            <input
              type="checkbox"
              name="tipo_ingreso"
              value={1}
              checked={filtros.tipo_ingreso === 1}
              onChange={(e) => handleChange(e)}
              className="border border-gray-200 rounded-md p-2 focus:outline-blue-500"
            />
            <label htmlFor="tipo_ingreso" className="text-md font-bold">
              Orden de compra
            </label>
          </div>
          <div className="flex flex-row gap-2">
            <input
              type="checkbox"
              name="tipo_ingreso"
              value={2}
              checked={filtros.tipo_ingreso === 2}
              onChange={(e) => handleChange(e)}
              className="border border-gray-200 rounded-md p-2 focus:outline-blue-500"
            />
            <label htmlFor="tipo_ingreso" className="text-md font-bold">
              Pedido
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="fecha_desde" className="text-md font-bold">
            Fecha Desde
          </label>
          <input
            type="date"
            name="fecha_desde"
            value={filtros.fecha_desde}
            onChange={(e) => handleChange(e)}
            className="border border-gray-200 rounded-md p-2 focus:outline-blue-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="fecha_hasta" className="text-md font-bold">
            Fecha Hasta
          </label>
          <input
            type="date"
            name="fecha_hasta"
            value={filtros.fecha_hasta}
            onChange={(e) => handleChange(e)}
            className="border border-gray-200 rounded-md p-2 focus:outline-blue-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="deposito" className="text-md font-bold">
            Sucursal
          </label>
          <select
            name="deposito"
            value={filtros.sucursal}
            onChange={(e) =>
              setFiltros({ ...filtros, sucursal: parseInt(e.target.value) })
            }
            className="border border-gray-200 rounded-md p-2 focus:outline-blue-500"
          >
            {sucursales.length > 0 ? (
              sucursales.map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.descripcion}
                </option>
              ))
            ) : (
              <option value={0}>No hay sucursales</option>
            )}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="deposito" className="text-md font-bold">
            Deposito
          </label>
          <select
            name="deposito"
            value={filtros.deposito}
            onChange={(e) =>
              setFiltros({ ...filtros, deposito: parseInt(e.target.value) })
            }
            className="border border-gray-200 rounded-md p-2 focus:outline-blue-500"
          >
            {depositos.length > 0 ? (
              depositos.map((deposito) => (
                <option key={deposito.dep_codigo} value={deposito.dep_codigo}>
                  {deposito.dep_descripcion}
                </option>
              ))
            ) : (
              <option value={0}>No hay depositos</option>
            )}
          </select>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <ProveedoresSelect
            onChange={(proveedor) => handleProveedorChange(proveedor)}
            value={filtros.nro_proveedor}
            label="Proveedor"
            required={false}
            placeholder="Seleccione un proveedor"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="deposito" className="text-md font-bold">
            Estado de verificacion
          </label>
          <select
            name="verificado"
            value={filtros.verificado}
            onChange={(e) =>
              setFiltros({ ...filtros, verificado: parseInt(e.target.value) })
            }
            className="border border-gray-200 rounded-md p-2 focus:outline-blue-500"
          >
            <option value={-1}>Todos</option>
            <option value={0}>Sin verificar</option>
            <option value={1}>Verificado</option>
            <option value={2}>Confirmado</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="nro_factura" className="text-md font-bold">
            Nro. Factura
          </label>
          <input
            type="text"
            name="nro_factura"
            value={filtros.nro_factura}
            onChange={(e) => handleChange(e)}
            className="border border-gray-200 rounded-md p-2 focus:outline-blue-500"
          />
        </div>
        <div className="flex flex-col gap-2 p-1 items-center justify-end">
          <FormButtons
            onClickExcel={() => ReporteComponenteExcel(filtros, () => {}, (error) => {console.log(error)})}
            onClickPDF={() => ReporteComponente(filtros, () => {}, (error) => {console.log(error)}, "print")}
            onClickLimpiar={() => setFiltros({...filtros, deposito: 0, sucursal: 0, fecha_desde: "", fecha_hasta: "", tipo_ingreso: 1, nro_proveedor: 0, verificado: -1, nro_factura: ""})}
          />
        </div>
      </div>
    </div>
  );
};

export default FormularioFiltros;
