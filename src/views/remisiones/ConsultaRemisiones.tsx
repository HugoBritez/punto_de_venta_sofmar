import { useState, useEffect } from "react";
import axios from "axios";
import { Remisiones } from "@/shared/types/shared_interfaces";
import { api_url } from "@/utils";
import { Box, useToast } from "@chakra-ui/react";
import { ClienteViewModel } from "@/models/viewmodels/ClienteViewModel";

interface ConsultaRemisionesProps {
  onSelectRemision?: (remision: Remisiones) => void;
  onClose?: () => void | null;
  isModal?: boolean | null;
  clienteSeleccionado?: ClienteViewModel | null;
}

const ConsultaRemisiones = ({
  onSelectRemision,
  isModal,
  clienteSeleccionado,
}: ConsultaRemisionesProps) => {
  const [remisiones, setRemisiones] = useState<Remisiones[]>([]);
  const [fechaDesde, setFechaDesde] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState<string>(new Date().toISOString().split('T')[0]);
  const [remisionSeleccionada, setRemisionSeleccionada] = useState<Remisiones | null>(null);
  const toast  = useToast();

  const getRemisiones = async () => {
    try {
      const response = await axios.get(`${api_url}remisiones/consultas`,
        {
            params: {
                fecha_desde: fechaDesde,
                fecha_hasta: fechaHasta,
                cliente: clienteSeleccionado
            }
        }
      );
      if (response.status === 200) {
        console.log(response.data.body);
        setRemisiones(response.data.body);
      }
    } catch (error) {
      console.error("Error al obtener las remisiones", error);
    }
  };

  useEffect(() => {
    getRemisiones();
  }, [fechaDesde, fechaHasta]);

  const handleSelectRemision = (remision: Remisiones) => {
    setRemisionSeleccionada(remision);
  };

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      h={"100vh"}
      w={"100%"}
      overflowY={"auto"}
      bg={"gray.100"}
      gap={2}
      rounded={"md"}
      p={2}
    >
      {/* {SECCION DE FILTRO} */}
      <div className="flex border border-gray-300 bg-white p-2 rounded-md gap-8">
        <div className="flex flex-row gap-2 items-center">
          <p className="text-md font-bold">Fecha desde:</p>
          <input
            type="date"
            className="border border-gray-300 rounded-md p-2"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
        </div>
        <div className="flex flex-row gap-2 items-center">
          <p className="text-md font-bold">Fecha hasta:</p>
          <input
            type="date"
            className="border border-gray-300 rounded-md p-2"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </div>
      </div>
      <div className="border border-gray-300 bg-white p-2 rounded-md h-[calc(100%-500px)] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr className="[&>th]:p-2 [&>th]:border [&>th]:border-gray-300">
              <th>Codigo</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Nro. Remision</th>
              <th>Operador</th>
              <th>Chofer</th>
              <th>Deposito</th>
              <th>Motivo</th>
              <th>Nro. Factura</th>
              <th>Timbrado</th>
              <th>Vehiculo</th>
              <th>F. Salida</th>
              <th>F. LLegada</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {remisiones.map((remision) => (
              <tr
                className="[&>td]:p-2 [&>td]:border [&>td]:border-gray-300 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleSelectRemision(remision)}
              >
                <td>{remision.id}</td>
                <td>{remision.fecha}</td>
                <td>{remision.cliente}</td>
                <td>{remision.nro_remision}</td>
                <td>{remision.operador}</td>
                <td>{remision.chofer}</td>
                <td>{remision.deposito}</td>
                <td>{remision.tipo_remision}</td>
                <td>{remision.factura}</td>
                <td>{remision.timbrado}</td>
                <td>{remision.vehiculo}</td>
                <td>{remision.fecha_salida}</td>
                <td>{remision.fecha_llegada}</td>
                {isModal && (
                  <td>
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer ease-in-out duration-300"
                      onClick={() => {
                        if (
                          remision.timbrado !== null &&
                          remision.timbrado !== "" &&
                          remision.timbrado !== "   " &&
                          remision.timbrado !== " "
                        ) {
                          toast({
                            title: "Error",
                            description:
                              "No se puede convertir a venta, la remision ya esta facturada",
                            status: "error",
                          });
                        } else {
                          onSelectRemision?.(remision);
                        }
                      }}
                    >
                      Convertir a Venta
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border border-gray-300 bg-white p-2 rounded-md">
        <p className="text-lg font-bold mb-2 text-center">
          Detalles de la remision:
        </p>
        <div className="border border-gray-300 bg-white  rounded-md  h-[300px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr className="[&>th]:p-2 [&>th]:border [&>th]:border-gray-300">
                <th>Codigo</th>
                <th>Cod. Barra</th>
                <th>Descripcion</th>
                <th>Cant.</th>
                <th>Lote</th>
                <th>Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {remisionSeleccionada?.items.map((item) => (
                <tr className="[&>td]:p-2 [&>td]:border [&>td]:border-gray-300">
                  <td>{item.articulo_id}</td>
                  <td>{item.cod_barras}</td>
                  <td>{item.articulo_descripcion}</td>
                  <td className="text-center">{item.cantidad}</td>
                  <td>{item.lote}</td>
                  <td>{item.vencimiento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Box>
  );
};

export default ConsultaRemisiones;
