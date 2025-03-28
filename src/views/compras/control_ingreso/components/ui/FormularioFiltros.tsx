import { useEffect } from "react";

import { FiltrosDTO } from "../../types/shared.type";

import { useSucursalesStore } from "@/stores/sucursalesStore";

import { useDepositosStore } from "@/stores/depositosStore";


interface Props {
  filtros: FiltrosDTO;
  setFiltros: (filtros: FiltrosDTO) => void;
}

const FormularioFiltros = ({ filtros, setFiltros }: Props) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };
  const { sucursales, fetchSucursales } = useSucursalesStore();
  const { depositos, fetchDepositos } = useDepositosStore();

  //traer los datos de las sucursales y los depositos
  useEffect(() => {
    fetchSucursales();
    fetchDepositos();
  }, []);

  //establecer por defecto el deposito y la sucursal
  useEffect(() => {
    if (depositos.length > 0 && sucursales.length > 0) {
      setFiltros({
        ...filtros,
        deposito: depositos[0].dep_codigo,
        sucursal: sucursales[0].id,
        fecha_desde: new Date().toISOString().split("T")[0],
        fecha_hasta: new Date().toISOString().split("T")[0],
        tipo_ingreso: 1,
      });
    }
  }, [depositos, sucursales]);

  return (
    <div className="flex flex-col gap-2 w-full p-2">
      <div className="flex flex-row gap-2 items-center bg-blue-500 w-full p-4 rounded-md">
        <h1 className="text-white text-xl font-bold">Formulario de Ingresos</h1>
      </div>
      <div className="flex flex-row gap-2 w-full border border-gray-200 rounded-md bg-white p-2 items-center">
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
        <div className="flex flex-col gap-2">
          <label htmlFor="nro_proveedor" className="text-md font-bold">
            Codigo de  Proveedor
          </label>
          <input
            type="number"
            name="nro_proveedor"
            value={filtros.nro_proveedor}
            onChange={(e) => handleChange(e)}
            className="border border-gray-200 rounded-md p-2 focus:outline-blue-500"
          />
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
          <button
            className="bg-blue-500 text-white rounded-md p-2"
            onClick={() => {
              console.log("filtros", filtros);
            }}
          >
            <p className="text-white font-bold text-md">Procesar</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormularioFiltros;
