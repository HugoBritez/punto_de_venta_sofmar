import { useEffect, useState } from "react";
import { useCortePedidos } from "./hooks/useCortePedidos";
import { FiltrosPedidoFaltante } from "./types/shared.type";
import { ArchiveX } from "lucide-react";
import ClientesSelect from "@/ui/select/ClientesSelect";
import OperadoresSelect from "@/ui/select/OperadoresSelect";
import CategoriasSelect from "@/ui/select/CategoriasSelect";
import SubCategoriaSelect from "@/ui/select/SubCategoriaSelect";
import DvlSelect from "@/ui/select/DvlSelect";
import LineasSelect from "@/ui/select/LineasSelect";
import MarcasSelect from "@/ui/select/MarcasSelect";
import { BuscadorArticulos } from "@/ui/buscador_articulos/BuscadorArticulos";

const ConsultaPedidosFaltantes = () => {
    const { pedidosFaltantes,  obtenerPedidoFaltante } = useCortePedidos();
    const fechaHoy = new Date().toISOString().split('T')[0];

    const [filtros, setFiltros] = useState<FiltrosPedidoFaltante>({
        fecha_desde: fechaHoy,
        fecha_hasta: fechaHoy,
        cliente: 0,
        vendedor: 0,
        articulo: 0,
        dvl: 0,
        marca: 0,
        linea: 0,
        categoria: 0,
        subcategoria: 0,
        estado: 0
    });

    const handleFiltrosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFiltros({ ...filtros, [name]: value });
    }

    useEffect(() => {
        obtenerPedidoFaltante(filtros);
    }, [filtros]);
  
  return (
    <div className="w-full h-screen  bg-gray-100">
      <div className="flex flex-col p-2 gap-2">
        <div className="flex flex-row bg-blue-500 px-2 py-4 rounded-md gap-2 items-center">
          <ArchiveX size={32} className=" text-white" />
          <p className="text-white font-bold text-xl">
            Consulta de Pedidos Faltantes
          </p>
        </div>
        <div className="bg-blue-200 p-2 rounded-sm flex flex-row gap-2">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="fecha_desde" className="text-md font-bold ">
                Fecha Desde:
              </label>
              <input
                type="date"
                id="fecha_desde"
                name="fecha_desde"
                value={filtros.fecha_desde}
                onChange={handleFiltrosChange}
                className="border-2 border-gray-300 rounded-md p-2"
              />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="fecha_hasta" className="text-md font-bold ">
                Fecha Hasta:
              </label>
              <input
                type="date"
                id="fecha_hasta"
                name="fecha_hasta"
                value={filtros.fecha_hasta}
                onChange={handleFiltrosChange}
                className="border-2 border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="cliente" className="text-md font-bold ">
                Cliente:
              </label>
              <ClientesSelect
                onChange={(clienteId) =>
                  setFiltros({ ...filtros, cliente: clienteId ?? undefined })
                }
                value={filtros.cliente}
              />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="vendedor" className="text-md font-bold ">
                Vendedor:
              </label>
              <OperadoresSelect
                onChange={(vendedorId) =>
                  setFiltros({ ...filtros, vendedor: vendedorId ?? undefined })
                }
                value={filtros.vendedor}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex flex-row gap-2 items-center w-full ">
              <div className="flex flex-row gap-2 items-center w-full flex-1">
                <label htmlFor="categoria" className="text-md font-bold ">
                  Categoria:
                </label>
                <CategoriasSelect
                  onChange={(categoriaId) =>
                    setFiltros({
                      ...filtros,
                      categoria: categoriaId ?? undefined,
                    })
                  }
                  value={filtros.categoria}
                  className="flex-1"
                />
              </div>
              <div className="flex flex-row gap-2 items-center flex-1">
                <label htmlFor="dvl" className="text-md font-bold ">
                  Subcategoria:
                </label>
                <SubCategoriaSelect
                  onChange={(subCategoriaId) =>
                    setFiltros({
                      ...filtros,
                      subcategoria: subCategoriaId ?? undefined,
                    })
                  }
                  value={filtros.subcategoria}
                  className="flex-1"
                />
              </div>
              <div className="flex flex-row gap-2 items-center flex-1">
                <label htmlFor="dvl" className="text-md font-bold ">
                  DVL:
                </label>
                <DvlSelect
                  onChange={(dvlId) =>
                    setFiltros({ ...filtros, dvl: dvlId ?? undefined })
                  }
                  value={filtros.dvl}
                  className="flex-1"
                />
              </div>
              <div className="flex flex-row gap-2 items-center flex-1 ">
                <label htmlFor="dvl" className="text-md font-bold ">
                  Linea:
                </label>
                <LineasSelect
                  onChange={(lineaId) =>
                    setFiltros({ ...filtros, linea: lineaId ?? undefined })
                  }
                  value={filtros.linea}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex flex-row gap-2 items-center flex-1">
              <div className="flex flex-row gap-2 items-center flex-1">
                <BuscadorArticulos
                  onSeleccionarArticulo={(articulo) =>
                    setFiltros({ ...filtros, articulo: articulo.id_articulo ?? undefined })
                  }
                />
              </div>
              <div className="flex flex-row gap-2 items-center flex-1">
                <label htmlFor="dvl" className="text-md font-bold ">
                  Marca:
                </label>
                <MarcasSelect
                  onChange={(marcaId) =>
                    setFiltros({ ...filtros, marca: marcaId ?? undefined })
                  }
                  value={filtros.marca}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 bg-orange-200 border-2 border-black p-2 rounded-md">
            <div className="flex flex-row gap-2 items-center">
              <input
                type="checkbox"
                name="estado"
                id="estado"
                value={0}
                onChange={handleFiltrosChange}
              />
              <label htmlFor="estado" className="text-md font-bold ">
                Pendiente
              </label>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <input
                type="checkbox"
                name="estado"
                id="estado"
                value={1}
                onChange={handleFiltrosChange}
              />
              <label htmlFor="estado" className="text-md font-bold ">
                Procesado
              </label>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <input
                type="checkbox"
                name="estado"
                id="estado"
                value={2}
                onChange={handleFiltrosChange}
              />
              <label htmlFor="estado" className="text-md font-bold ">
                Todos
              </label>
            </div>
          </div>
        </div>
        <div className="flex flex-col bg-white p-2 rounded-md shadow-xs h-full overflow-y-auto">
          <table className="w-full">
            <thead className="bg-blue-500 text-white p-2 rounded-md">
              <tr>
                <th>Cod. Pedido</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Cod. Barras</th>
                <th>Descripcion Art.</th>
                <th>Marca</th>
                <th>Cantidad Pedido</th>
                <th>Cantidad faltante</th>
                <th>P. Unitario</th>
                <th>Subtotal</th>
                <th>Operador</th>
                <th>Vendedor</th>
              </tr>
            </thead>
            <tbody>
              { pedidosFaltantes.length > 0 ? (
                pedidosFaltantes.map((pedido) => (
                  <tr key={pedido.id_pedido} className="hover:bg-gray-100 cursor-pointer border-2 border-gray-200 [&>td]:border-2 [&>td]:border-gray-200 [&>td]:px-2">
                    <td>{pedido.id_pedido}</td>
                    <td>{pedido.fecha}</td>
                    <td>{pedido.cliente}</td>
                    <td>{pedido.cod_barra}</td>
                    <td>{pedido.descripcion}</td>
                    <td>{pedido.marca}</td>
                    <td>{pedido.cantidad_pedido}</td>
                    <td>{pedido.cantidad_faltante}</td>
                    <td>{pedido.p_unitario}</td>
                    <td>{pedido.subtotal}</td>
                    <td>{pedido.operador}</td>
                    <td>{pedido.vendedor}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center">No hay pedidos faltantes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ConsultaPedidosFaltantes
