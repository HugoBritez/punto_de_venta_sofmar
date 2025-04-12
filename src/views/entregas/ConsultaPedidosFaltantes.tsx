import { useEffect, useState } from "react";
import { useCortePedidos } from "./hooks/useCortePedidos";
import { FiltrosPedidoFaltante, PedidoFaltante } from "./types/shared.type";
import { ArchiveX } from "lucide-react";
import ClientesSelect from "@/ui/select/ClientesSelect";
import OperadoresSelect from "@/ui/select/OperadoresSelect";
import CategoriasSelect from "@/ui/select/CategoriasSelect";
import SubCategoriaSelect from "@/ui/select/SubCategoriaSelect";
import DvlSelect from "@/ui/select/DvlSelect";
import LineasSelect from "@/ui/select/LineasSelect";
import MarcasSelect from "@/ui/select/MarcasSelect";
import { BuscadorArticulos } from "@/ui/buscador_articulos/BuscadorArticulos";
import pdfIcon from '@/assets/custom_icons/pdf-icon.svg'
import excelIcon from '@/assets/custom_icons/excel-icon.svg'
import { ReportePedidosFaltantesPdf } from "./docs/InformePedidosFaltantesPdf";
import { createRoot } from "react-dom/client";
import { ReportePedidosFaltantesExcel } from "./docs/InformePedidosFaltantesExcel";
import { useToast } from "@chakra-ui/react";
import Modal from "@/ui/modal/Modal";

const ConsultaPedidosFaltantes = () => {
    const { pedidosFaltantes,  obtenerPedidoFaltante, reprocesarPedido } = useCortePedidos();
    const fechaHoy = new Date().toISOString().split('T')[0];
    const [filtrosDescripcion, setFiltrosDescripcion] = useState<string[]>([]);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoFaltante | null>(null);
    const toast = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        if (name === "descripcion") {
            setFiltrosDescripcion([...filtrosDescripcion, value]);
        }
    }

    const handleSeleccionarPedido = (pedido: PedidoFaltante) => {
      setPedidoSeleccionado(pedido);
    }

    const esPedidoSeleccionado = (pedido: PedidoFaltante) => {
      return pedidoSeleccionado?.id_pedido === pedido.id_pedido;
    }

    useEffect(() => {
        console.log('obteniendo pedidos faltantes con los filtros', filtros)
        obtenerPedidoFaltante(filtros);
    }, [filtros]);

    const ReporteFaltantesPdfComponent = () => {
      const ReportePdfDiv = document.createElement('div');
      ReportePdfDiv.style.display = 'none';
      document.body.appendChild(ReportePdfDiv);

      const root = createRoot(ReportePdfDiv);
      root.render(
        <ReportePedidosFaltantesPdf
          filtros={filtros}
          pedidosFaltantes={pedidosFaltantes}
          onComplete={() => {}}
          onError={() => {}}
        />
      );
      
      setTimeout(() => {
       root.unmount();
       document.body.removeChild(ReportePdfDiv);
      }, 100);
    };

    const ReporteFaltantesExcelComponent = () => {
      const ReportePdfDiv = document.createElement("div");
      ReportePdfDiv.style.display = "none";
      document.body.appendChild(ReportePdfDiv);

      const root = createRoot(ReportePdfDiv);
      root.render(
        <ReportePedidosFaltantesExcel
          filtros={filtros}
          pedidosFaltantes={pedidosFaltantes}
          onComplete={() => {}}
          onError={() => {}}
        />
      );

      setTimeout(() => {
        root.unmount();
        document.body.removeChild(ReportePdfDiv);
      }, 100);
    };

    const handleModal = () => {
      setIsModalOpen(!isModalOpen);
    }

    const handleReprocesarPedido = (id_pedido: number) => {
      if(!id_pedido){
        toast({
          title: "Error",
          description: "No se ha seleccionado ningun pedido",
          status: "error",
          duration: 3000,
        })
        return;
      }
      if(pedidoSeleccionado?.tiene_lotes_disponibles === 'NO'){
        toast({
          title: "Error",
          description: "No se tiene lotes disponibles para reprocesar",
          status: "error",
          duration: 3000,
        })
        return;
      }
      reprocesarPedido(id_pedido);
      setIsModalOpen(false);
      obtenerPedidoFaltante(filtros);

      toast({
        title: "Reprocesado",
        description: "Pedido reprocesado correctamente",
        status: "success",
        duration: 3000,
      })
    }
    
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
                    setFiltros({
                      ...filtros,
                      articulo: articulo.id_articulo ?? undefined,
                    })
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
        <div className="flex flex-col bg-white p-2 rounded-md shadow-xs h-[calc(100dvh-330px)] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-blue-500 text-white p-2 rounded-md">
              <tr>
                <th>Cod. Pedido</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Descripcion Art.</th>
                <th>Cantidad Pedido</th>
                <th>Cantidad faltante</th>
                <th>P. Unitario</th>
                <th>Subtotal</th>
                <th>Operador</th>
                <th>Vendedor</th>
                <th>Motivo de corte</th>
                <th>Disponible para reprocesar</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFaltantes.length > 0 ? (
                pedidosFaltantes.map((pedido) => (
                  <tr
                    key={pedido.id_pedido}
                    className={` ${
                      esPedidoSeleccionado(pedido)
                        ? "bg-blue-100 hover:bg-blue-200"
                        : "hover:bg-gray-100"
                    } cursor-pointer border-2 border-gray-200 [&>td]:border-2 [&>td]:border-gray-200 [&>td]:px-2`}
                    onClick={() => handleSeleccionarPedido(pedido)}
                  >
                    <td>{pedido.id_pedido}</td>
                    <td>{pedido.fecha}</td>
                    <td>{pedido.cliente}</td>
                    <td>{pedido.descripcion}</td>
                    <td className="text-center">{pedido.cantidad_pedido}</td>
                    <td className="text-center">{pedido.cantidad_faltante}</td>
                    <td className="text-right">{pedido.p_unitario}</td>
                    <td className="text-right">{pedido.subtotal}</td>
                    <td>{pedido.operador}</td>
                    <td>{pedido.vendedor}</td>
                    <td>{pedido.observacion}</td>
                    <td className="text-center">{pedido.tiene_lotes_disponibles}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center">
                    No hay pedidos faltantes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-row gap-2 bg-blue-200 shadow-xs p-2 rounded-md mt-auto h-[100px] justify-end items-center">
          <button
            className="bg-red-600 text-white p-2 rounded-md h-12 flex flex-row gap-2 items-center"
            onClick={ReporteFaltantesPdfComponent}
          >
            <p className="text-md font-bold">Generar Reporte en Pdf </p>
            <img src={pdfIcon} alt="pdf" className="w-6 h-6" />
          </button>
          <button
            className="bg-[#008000] text-white p-2 rounded-md h-12 flex flex-row gap-2 items-center"
            onClick={ReporteFaltantesExcelComponent}
          >
            <p className="text-md font-bold">Generar Reporte en EXCEL</p>
            <img src={excelIcon} alt="excel" className="w-6 h-6" />
          </button>
          <button
            className="bg-blue-500 text-white p-2 rounded-md h-12 flex flex-row gap-2 items-center"
            onClick={handleModal}
          >
            <p className="text-md font-bold">Reprocesar Pedido</p>
          </button>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Reprocesar Pedido"
      >
        <div className="flex flex-col gap-4">
          {pedidoSeleccionado ? (
            <>
              <p className="text-gray-600">
                Por favor seleccione el lote que desea utilizar para reprocesar el pedido #{pedidoSeleccionado.id_pedido}
              </p>
              <div className="flex flex-col gap-2">
                <h4 className="font-medium text-gray-900">Lotes Disponibles:</h4>
                {pedidoSeleccionado.lotes_disponibles && pedidoSeleccionado.lotes_disponibles.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {pedidoSeleccionado.lotes_disponibles.map((lote) => (
                      <div 
                        key={lote.id_lote}
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleReprocesarPedido(pedidoSeleccionado.id_pedido)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">Lote: {lote.lote}</span>
                          <span className="text-sm text-gray-500">Cantidad: {lote.cantidad}</span>
                          <span className="text-sm text-gray-500">Depósito: {lote.deposito}</span>
                          <span className="text-sm text-gray-500">Vencimiento: {lote.vencimiento}</span>
                        </div>
                        <button 
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          onClick={() => handleReprocesarPedido(pedidoSeleccionado.id_pedido)}
                        >
                          Seleccionar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-500">No hay lotes disponibles para este pedido</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-red-500">No hay ningún pedido seleccionado</p>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default ConsultaPedidosFaltantes
