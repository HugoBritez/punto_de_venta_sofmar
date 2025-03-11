import { api_url } from "@/utils";
import { useMediaQuery, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";

interface PresupuestoPendiente {
    codigo: number;
    fecha: string;
    cliente: string;
    total: number;
    nroOT: number;
}

interface PresupuestosPendientesProps{
  onClose: () => void;
  onSelect?: (presupuesto: number) => void;
}

export const PresupuestosPendientes = ({
  onClose,
  onSelect,
}: PresupuestosPendientesProps) => {
  const [presupuestosPendientes, setPresupuestosPendientes] = useState<
    PresupuestoPendiente[]
  >([]);

  const [presupuestoSeleccionado, setPresupuestoSeleccionado] = useState<PresupuestoPendiente | null>(null);

  const [fechaDesde, setFechaDesde] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [fechaHasta, setFechaHasta] = useState<string>(new Date().toISOString().split('T')[0]);
  const [estadoPresupuesto, setEstadoPresupuesto] = useState<number | null>(0);
  const [busqueda, setBusqueda] = useState<string>("");

  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const toast = useToast();

    useEffect(() =>{
        const fetchPresupuestosPendientes = async () =>{
            const response = await axios.post(`${api_url}presupuestos/consultas`,
              {
                fecha_desde: fechaDesde,
                fecha_hasta: fechaHasta,
                estado: estadoPresupuesto,
                busqueda: busqueda
              }
            );
            setPresupuestosPendientes(response.data.body);
        }
        fetchPresupuestosPendientes();
    }, [fechaDesde, fechaHasta, estadoPresupuesto, busqueda]);
    
    function handleSelectPresupuesto(presupuesto: PresupuestoPendiente){
      setPresupuestoSeleccionado(presupuesto);
    }

    function handlePressSeleccionar(){
      if(presupuestoSeleccionado){
        onSelect?.(presupuestoSeleccionado.codigo);
      }else {
        toast({
          title: "Error",
          description: "No se ha seleccionado ningún presupuesto",
          status: "error",
        });
      }
    }

    return (
      <div className="flex flex-col gap-2 bg-blue-100">
        <div className={`flex gap-4 ${isMobile ? "flex-col" : "flex-row"}`}>
          <div className="flex gap-2 items-center">
            <div className="flex gap-2 items-center">
              <label className="text-black font-bold">Desde:</label>
              <input
                type="date"
                className="bg-white rounded-md p-2 text-right font-bold"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-black font-bold">Hasta:</label>
              <input
                type="date"
                className="bg-white rounded-md p-2 text-right font-bold"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 items-center flex-1">
            <label className="text-black font-bold">Busqueda:</label>
            <input
              type="text"
              className="bg-white rounded-md p-2 text-right font-bold flex-1"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-col border rounded-md p-2 border-blue-500">
            <div className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={estadoPresupuesto === 0}
                onChange={(e) =>
                  setEstadoPresupuesto(e.target.checked ? 0 : null)
                }
              />
              <label>Pendientes</label>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                checked={estadoPresupuesto === 1}
                onChange={(e) =>
                  setEstadoPresupuesto(e.target.checked ? 1 : null)
                }
              />
              <label>Confirmados</label>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                checked={estadoPresupuesto === null}
                onChange={(e) =>
                  setEstadoPresupuesto(e.target.checked ? null : 0)
                }
              />
              <label>Todos</label>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-2 overflow-y-auto overflow-x-auto min-h-[300px] max-h-[300px]">
          <table className={isMobile ? "w-[800px]" : "w-full"}>
            <thead>
              <tr className="border-b border-black [&>*]:border-r [&>*]:border-gray-300 [&>*]:px-2">
                <th className="text-left">Codigo</th>
                <th className="text-left">Fecha</th>
                <th className="text-left">Cliente</th>
                <th className="text-right">Total</th>
                <th className="text-right">Nro. OT</th>
              </tr>
            </thead>
            <tbody>
              {presupuestosPendientes.map((presupuesto) => (
                <tr
                  key={presupuesto.codigo}
                  onClick={() => handleSelectPresupuesto(presupuesto)}
                  className={
                    "cursor-pointer hover:bg-blue-100 transition-all duration-300 [&>*]:border-r [&>*]:border-gray-300 [&>*]:px-2"  +
                    (presupuestoSeleccionado?.codigo === presupuesto.codigo
                      ? " bg-blue-200"
                      : "")
                  }
                >
                  <td>{presupuesto.codigo}</td>
                  <td>{presupuesto.fecha}</td>
                  <td>{presupuesto.cliente}</td>
                  <td className="text-right">{presupuesto.total}</td>
                  <td className="text-right">{presupuesto.nroOT}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 py-4">
          <button
            className="bg-green-600 text-white rounded-md p-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 hover:bg-green-700 transition-all duration-300 "
            onClick={handlePressSeleccionar}
          >
            Seleccionar
          </button>
          <button
            className="bg-red-600 text-white rounded-md p-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 hover:bg-red-700 transition-all duration-300 "
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
}