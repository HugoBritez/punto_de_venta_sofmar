import { Agenda, Configuraciones } from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import axios from "axios";
import React, { useState, useEffect } from "react";
import {  useToast, Spinner } from "@chakra-ui/react";
import { generatePDF } from "@/services/pdfService";

interface ReporteAgendasProps {
  Agendas: Agenda[];
  onPrint: () => void;
  filtros: Filtros;
}

interface Filtros {
  fechaInicio: string;
  fechaFin: string;
  cliente: number[];
  estado: string;
  planificacion: string;
  condicion: string;
}

const ReporteAgendas: React.FC<ReporteAgendasProps> = ({
  Agendas,
  filtros,
}: ReporteAgendasProps) => {
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [configuracionesEmpresa, setConfiguracionesEmpresa] = useState<
    Configuraciones[]
  >([]);

  const nombreEmpresa = configuracionesEmpresa[0]?.valor || "N/A";
  const rucEmpresa = configuracionesEmpresa[30]?.valor || "N/A";
  const fechaCompletaActual = new Date().toLocaleString();

  const usuario = sessionStorage.getItem("user_name");

  useEffect(() => {
    fetchConfiguraciones();
    setLoading(false);
    console.log("Agendas", Agendas);
  }, []);

  const fetchConfiguraciones = async () => {
    try {
      const response = await axios.get(`${api_url}configuraciones/todos`);
      setConfiguracionesEmpresa(response.data.body);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Error al cargar las configuraciones de la empresa",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const clientes = () => {
    if (!filtros.cliente || filtros.cliente.length === 0) {
      return "Todos";
    } else {
      return Agendas
        .filter(agenda => filtros.cliente.includes(agenda.cliente_id))
        .map(agenda => agenda.cliente)
        .join(", ");
    }
  };

  const generarPDF = async (data: Agenda[]) => {
    if (!data || data.length === 0) {
      toast({
        title: "Error al generar PDF",
        description: "No hay datos disponibles para generar el reporte",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Formatear fecha actual para el nombre del archivo
      const fecha = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
      const nombreArchivo = `informe_planificacion_${fecha}`;

      const docDefinition = {
        pageSize: "A4",
        pageMargins: [20, 20, 20, 20],
        name: nombreArchivo,
        content: [
          // Encabezado
          {
            columns: [
              { text: `RUC: ${rucEmpresa}`, width: "auto", fontSize: 8 },
              {
                text: nombreEmpresa,
                alignment: "center",
                width: "*",
                fontSize: 8,
              },
              {
                stack: [
                  {
                    text: fechaCompletaActual,
                    alignment: "right",
                    width: "auto",
                    fontSize: 8,
                  },
                  {
                    text: usuario,
                    alignment: "right",
                    width: "auto",
                    fontSize: 8,
                  },
                ],
              },
            ],
          },
          {
            canvas: [
              {
                type: "line",
                x1: 0,
                y1: 0,
                x2: 595,
                y2: 0,
              },
            ],
          },
          {
            text: "INFORME DE PLANIFICACIÓN",
            alignment: "center",
            fontSize: 10,
            bold: true,
            margin: [0, 10],
          },
          {
            columns: [
              {
                text: `Cliente: ${clientes()}`,
                fontSize: 8,
                bold: true,
              },
              {
                text: `Fecha/s: ${filtros.fechaInicio}, ${filtros.fechaFin}`,
                fontSize: 8,
                bold: true,
              },
              {
                text: `Estado: ${filtros.estado}`,
                fontSize: 8,
                bold: true,
              },
              {
                text: `Planificacion: ${filtros.planificacion}`,
                fontSize: 8,
                bold: true,
              },
              {
                text: `Condicion: ${filtros.condicion}`,
                fontSize: 8,
                bold: true,
              },
            ],
            columnGap: 10,
            margin: [0, 5, 0, 10],
          },
          // Tabla de agendas
          ...data
            .map((agenda) => [
              {
                table: {
                  widths: ["auto", "auto", "auto", "auto", "auto", "*", "auto", "auto", "auto"],
                  body: [
                    // Encabezados
                    [
                      { text: "Cliente", style: "tableHeader" },
                      { text: "Código", style: "tableHeader" },
                      { text: "Fecha y hora planificadas", style: "tableHeader" },
                      { text: "Visitado", style: "tableHeader" },
                      { text: "Prioridad", style: "tableHeader" },
                      { text: "Planificación", style: "tableHeader" },
                      { text: "Hora de llegada", style: "tableHeader" },
                      { text: "Hora de salida", style: "tableHeader" },
                      { text: "Tiempo total", style: "tableHeader" },
                    ],
                    // Datos
                    [
                      { text: agenda.cliente, fontSize: 8 },
                      { text: agenda.a_codigo.toString(), fontSize: 8 },
                      { text: agenda.fecha + " " + agenda.a_hora, fontSize: 8 },
                      { text: agenda.visitado, fontSize: 8 },
                      { text: agenda.prioridad, fontSize: 8 },
                      { text: agenda.a_obs, fontSize: 8 },
                      { text: agenda.l_hora_inicio, fontSize: 8 },
                      { text: agenda.l_hora_fin, fontSize: 8 },
                      { text: agenda.tiempo_transcurrido, fontSize: 8 },
                    ],
                  ],
                },
                layout: {
                  hLineWidth: function () {
                    return 0.5;
                  },
                  vLineWidth: function () {
                    return 0.5;
                  },
                  hLineColor: function () {
                    return "#aaa";
                  },
                  vLineColor: function () {
                    return "#aaa";
                  },
                  paddingLeft: function () {
                    return 5;
                  },
                  paddingRight: function () {
                    return 5;
                  },
                  paddingTop: function () {
                    return 3;
                  },
                  paddingBottom: function () {
                    return 3;
                  },
                },
                margin: [0, 10],
              },
              // Notas (solo si existen)
              ...(agenda.notas && agenda.notas.length > 0
                ? [
                    {
                      text: "Resultados de la visita:",
                      fontSize: 8,
                      bold: true,
                      margin: [0, 5],
                    },
                    {
                      ul: agenda.notas.map((nota) => ({
                        text: `Hora: ${nota.hora} - Nota: ${nota.nota}`,
                        fontSize: 8,
                      })),
                      margin: [0, 5],
                    },
                  ]
                : []),

              // Subvisitas (solo si existen)
              ...(agenda.subvisitas && agenda.subvisitas.length > 0
                ? [
                    {
                      text: "Subvisitas realizadas:",
                      fontSize: 8,
                      bold: true,
                      margin: [0, 5],
                    },
                    {
                      table: {
                        widths: ["*", "*", "*"],
                        body: [
                          [
                            { text: "Cliente", style: "tableHeader" },
                            { text: "Motivo", style: "tableHeader" },
                            { text: "Resultado", style: "tableHeader" },
                          ],
                          ...agenda.subvisitas.map((subvisita) => [
                            {
                              text: subvisita.nombre_cliente || "",
                              fontSize: 8,
                            },
                            {
                              text: subvisita.motivo_visita || "",
                              fontSize: 8,
                            },
                            {
                              text: subvisita.resultado_visita || "",
                              fontSize: 8,
                            },
                          ]),
                        ],
                      },
                      layout: {
                        hLineWidth: function () {
                          return 0.5;
                        },
                        vLineWidth: function () {
                          return 0.5;
                        },
                        hLineColor: function () {
                          return "#aaa";
                        },
                        vLineColor: function () {
                          return "#aaa";
                        },
                        paddingLeft: function () {
                          return 5;
                        },
                        paddingRight: function () {
                          return 5;
                        },
                        paddingTop: function () {
                          return 3;
                        },
                        paddingBottom: function () {
                          return 3;
                        },
                      },
                      margin: [20, 10],
                    },
                  ]
                : []),

              // Línea separadora siempre presente
              {
                canvas: [
                  {
                    type: "line",
                    x1: 0,
                    y1: 0,
                    x2: 595,
                    y2: 0,
                    lineWidth: 0.2,
                    lineColor: "#6e6e6e",
                  },
                ],
              },
            ])
            .flat(),
        ],
        styles: {
          tableHeader: {
            bold: true,
            fontSize: 8,
            fillColor: "#f8f9fa",
            alignment: "center",
          },
        },
        defaultStyle: {
          fontSize: 8,
        },
      };

      await generatePDF(docDefinition as any, "download", nombreArchivo);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al generar el PDF",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-screen overflow-hidden">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
          <p className="ml-4">Cargando datos del reporte...</p>
        </div>
      ) : Agendas && Agendas.length > 0 ? (
        <div className="flex flex-col gap-4 h-full overflow-hidden">
          {/* Encabezado - Fijo */}
          <div className="flex flex-col gap-2 w-full border border-gray-300 rounded-sm p-2">
            {/* Información de la empresa */}
            <div className="flex flex-col md:flex-row gap-2 w-full items-center justify-between border-b p-2">
              <p className="text-sm md:text-base">{rucEmpresa}</p>
              <p className="text-sm md:text-base text-center">{nombreEmpresa}</p>
              <div className="text-center md:text-right">
                <p className="text-xs md:text-sm">{fechaCompletaActual}</p>
                <p className="text-xs md:text-sm">{sessionStorage.getItem("user_name")}</p>
              </div>
            </div>

            {/* Información del reporte */}
            <div className="flex flex-col border-b">
              <h1 className="text-center text-base md:text-lg font-bold py-2">
                Informe de planificacion
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full mb-4 px-2">
                <p className="text-sm">
                  <strong>Fecha Inicio</strong>: {filtros.fechaInicio}
                </p>
                <p className="text-sm">
                  <strong>Fecha Fin</strong>: {filtros.fechaFin}
                </p>
                <p className="text-sm">
                  <strong>Cliente</strong>: {clientes()}
                </p>
                <p className="text-sm">
                  <strong>Estado</strong>: {filtros.estado}
                </p>
                <p className="text-sm">
                  <strong>Planificación</strong>: {filtros.planificacion}
                </p>
                <p className="text-sm">
                  <strong>Condición</strong>: {filtros.condicion}
                </p>
              </div>
            </div>
          </div>

          {/* Contenido principal - Scrolleable */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 px-2 md:px-8">
              {Agendas.map((agenda) => (
                <div key={agenda.a_codigo} className="w-full border border-gray-200 rounded-lg">
                  {/* Tabla principal */}
                  <div className="w-full">
                    <table className="w-full border-collapse bg-gray-50">
                      <thead>
                        <tr>
                          <th colSpan={9} className="border p-2 text-left bg-blue-900">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                              <span className="font-bold text-white text-sm md:text-base">
                                Agenda #{agenda.a_codigo}
                              </span>
                              <span className="text-xs md:text-sm text-white">
                                Fecha: {agenda.fecha} - Hora: {agenda.a_hora}
                              </span>
                            </div>
                          </th>
                        </tr>
                        <tr className="bg-gray-400 text-xs md:text-sm">
                          <th className="border p-1 md:p-2">Cliente</th>
                          <th className="border p-1 md:p-2">Visitado</th>
                          <th className="border p-1 md:p-2">Prioridad</th>
                          <th className="border p-1 md:p-2">Planificación</th>
                          <th className="border p-1 md:p-2">Teléfono</th>
                          <th className="border p-1 md:p-2">Hora de llegada</th>
                          <th className="border p-1 md:p-2">Hora de salida</th>
                          <th className="border p-1 md:p-2">Tiempo total</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs md:text-sm">
                        <tr className="hover:bg-gray-50">
                          <td className="border p-2">{agenda.cliente}</td>
                          <td className="border p-2">{agenda.visitado}</td>
                          <td className="border p-2">{agenda.prioridad}</td>
                          <td className="border p-2">{agenda.a_obs}</td>
                          <td className="border p-2">{agenda.cli_tel}</td>
                          <td className="border p-2">{agenda.l_hora_inicio}</td>
                          <td className="border p-2">{agenda.l_hora_fin}</td>
                          <td className="border p-2">{agenda.tiempo_transcurrido}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Sección de Notas */}
                  <div className="border-t border-gray-200">
                    <div className="bg-gray-50 p-2 font-bold text-sm">Notas</div>
                    <div className="p-2 md:p-4">
                      {agenda.notas && agenda.notas.length > 0 ? (
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-blue-700 text-white text-xs md:text-sm">
                              <th className="border p-1 md:p-2 w-1/12">Hora</th>
                              <th className="border p-1 md:p-2 w-11/12">Nota</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs md:text-sm">
                            {agenda.notas.map((nota) => (
                              <tr key={nota.id} className="hover:bg-gray-50">
                                <td className="border p-2">{nota.hora}</td>
                                <td className="border p-2">{nota.nota}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-gray-500 text-center py-2 text-sm">
                          No hay notas registradas
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sección de Subvisitas */}
                  <div className="border-t border-gray-200">
                    <div className="bg-gray-50 p-2 font-bold text-sm">Subvisitas</div>
                    <div className="p-2 md:p-4">
                      {agenda.subvisitas && agenda.subvisitas.length > 0 ? (
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-blue-700 text-white text-xs md:text-sm">
                              <th className="border p-1 md:p-2">Cliente</th>
                              <th className="border p-1 md:p-2">Motivo</th>
                              <th className="border p-1 md:p-2">Resultado</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs md:text-sm">
                            {agenda.subvisitas.map((subvisita) => (
                              <tr key={subvisita.id} className="hover:bg-gray-50">
                                <td className="border p-2">{subvisita.nombre_cliente || ""}</td>
                                <td className="border p-2">{subvisita.motivo_visita || ""}</td>
                                <td className="border p-2">{subvisita.resultado_visita || ""}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-gray-500 text-center py-2 text-sm">
                          No hay subvisitas registradas
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer - Fijo */}
          <div className="flex flex-col md:flex-row gap-2 w-full items-center justify-between mt-4 bg-white py-2">
            <p className="text-sm font-bold">
              Total de agendas: {Agendas.length}
            </p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm w-full md:w-auto"
              onClick={() => generarPDF(Agendas)}
              disabled={loading || !Agendas || Agendas.length === 0}
            >
              Generar PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-sm">No hay datos disponibles para mostrar</p>
        </div>
      )}
    </div>
  );
};

export default ReporteAgendas;
