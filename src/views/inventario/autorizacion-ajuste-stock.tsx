import HeaderComponent from "@/modules/Header";
import { Deposito, Sucursal } from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import { Button, Flex, Select, useToast } from "@chakra-ui/react";
import axios from "axios";
import {
  AlertTriangle,
  ArchiveRestore,
  ChartColumn,
  Check,
  Search,
  Printer,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReporteItemsScaneados from "./pdfs/reporte-items-scanneados";
import { generarExcelReporteInventario } from './excel/ReporteInventarioExcel';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

interface AutorizacionAjusteDeStock {
  id_inventario: number;
  nro_inventario: number;
  fecha: string;
  hora: string;
  operador: number;
  operador_nombre: string;
  nombre_sucursal: string;
  nombre_deposito: string;
  estado_inventario: string;
  items: [
    {
      articulo_id: number;
      articulo: string;
      cod_interno: string;
      items_lotes: [
        {
          cod_barras: string;
          vencimiento: string;
          lote_id: number;
          lote: string;
          cantidad_inicial: number;
          cantidad_scanner: number;
          diferencia: number;
          costo_diferencia: number;
        }
      ];
      ubicacion: string;
      sub_ubicacion: string;
      cantidad_inicial_total: number;
      cantidad_scanner_total: number;
      diferencia_total: number;
      costo_diferencia_total: number;
    }
  ];
}

interface InventariosDisponibles {
  id_inventario: number;
  nro_inventario: number;
  fecha: string;
  hora: string;
  deposito_id: number;
  deposito_nombre: string;
  sucursal_id: number;
  sucursal_nombre: string;
}

interface FloatingCardProps {
  inventarios: InventariosDisponibles[];
  onSelect: (inventario: InventariosDisponibles) => void;
  onClose: () => void;
  onBuscarItems: (inventarioId: string, busqueda: string | null) => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <motion.div
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                    >
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </motion.div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        {title}
                      </motion.h3>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="mt-2"
                      >
                        <p className="text-sm text-gray-500">{message}</p>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                  >
                    Confirmar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={onClose}
                  >
                    Cancelar
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ReportesModalProps {
  isOpen: boolean;
  onClose: () => void;
  depositos: Deposito[];
  onGenerarReporte: (
    depositoId: number,
    fechaInicio: string,
    fechaFin: string
  ) => void;
}

const ReportesModal: React.FC<ReportesModalProps> = ({
  isOpen,
  onClose,
  depositos,
  onGenerarReporte,
}) => {
  const [depositoSeleccionado, setDepositoSeleccionado] = useState<
    number | null
  >(null);
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const toast = useToast();

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = () => {
    // Verificamos que haya al menos un depósito O ambas fechas
    const tieneDeposito = !!depositoSeleccionado;
    const tieneFechas = !!(fechaInicio && fechaFin);

    if (!tieneDeposito && !tieneFechas) {
      toast({
        title: "Error",
        description: "Debe seleccionar un depósito o un rango de fechas",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Si hay fecha inicio, debe haber fecha fin y viceversa
    if ((fechaInicio && !fechaFin) || (!fechaInicio && fechaFin)) {
      toast({
        title: "Error",
        description: "Debe seleccionar ambas fechas para el rango",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onGenerarReporte(depositoSeleccionado || 0, fechaInicio, fechaFin);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Generar Reporte de Inventario
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Seleccione los parámetros para generar el reporte
                    </p>
                  </div>

                  {/* Formulario */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Depósito
                      </label>
                      <select
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white focus:outline-none"
                        value={depositoSeleccionado || ""}
                        onChange={(e) =>
                          setDepositoSeleccionado(Number(e.target.value))
                        }
                      >
                        <option value="">Seleccione un depósito</option>
                        {depositos.map((deposito) => (
                          <option
                            key={deposito.dep_codigo}
                            value={deposito.dep_codigo}
                          >
                            {deposito.dep_descripcion}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white focus:outline-none"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white focus:outline-none"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleSubmit}
                  >
                    Generar Reporte
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={onClose}
                  >
                    Cancelar
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AutorizacionAjusteDeStock = () => {
  const [autorizaciones, setAutorizaciones] = useState<
    AutorizacionAjusteDeStock[]
  >([]);
  const [, setLoading] = useState(true);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [sucursaleSeleccionada, setSucursaleSeleccionada] =
    useState<Sucursal | null>(null);
  const [depositoSeleccionado, setDepositoSeleccionado] =
    useState<Deposito | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [inventariosDisponibles, setInventariosDisponibles] = useState<
    InventariosDisponibles[]
  >([]);
  const [showInventarioCard, setShowInventarioCard] = useState(false);

  const [inventarioSeleccionado, setInventarioSeleccionado] =
    useState<InventariosDisponibles | null>(null);

  const toast = useToast();

  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [showReportesModal, setShowReportesModal] = useState(false);

  // Nuevo useEffect separado que depende del depositoId

  const fetchInventariosDisponibles = async () => {
    try {
      const response = await axios.get(`${api_url}inventarios/disponibles`, {
        params: {
          estado: 1,
          deposito: depositoSeleccionado?.dep_codigo,
        },
      });
      const data = response.data;
      console.log(data.body);
      setInventariosDisponibles(data.body || []);
    } catch (error) {
      console.error("Error al cargar inventarios:", error);
    }
  };

  useEffect(() => {
    fetchInventariosDisponibles();
  }, [depositoSeleccionado]);

  useEffect(() => {
    const fetchSucursales = async () => {
      const response = await axios.get(`${api_url}sucursales/listar`);
      setSucursales(response.data.body);
      setSucursaleSeleccionada(response.data.body[0]);
    };

    const fetchDepositos = async () => {
      const response = await axios.get(`${api_url}depositos/`);
      setDepositos(response.data.body);
      setDepositoSeleccionado(response.data.body[0]);
    };

    fetchSucursales();
    fetchDepositos();
  }, []);

  const fetchReporte = async () => {
    if (!inventarioSeleccionado) {
      toast({
        title: "Error",
        description: "No se ha seleccionado un inventario",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const response = await axios.get(`${api_url}inventarios/anomalias`, {
        params: {
          nro_inventario: inventarioSeleccionado?.nro_inventario || 0,
          sucursal: sucursaleSeleccionada?.id || 0,
          deposito: depositoSeleccionado?.dep_codigo || 0,
        },
      });
      console.log(response.data.body);
      setAutorizaciones(response.data.body);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener el reporte de anomalias:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("inventarioSeleccionado", inventarioSeleccionado);
  }, [inventarioSeleccionado]);

  const autorizarInventario = async (
    id: number,
    operador: number,
    sucursal: number,
    deposito: number,
    nro_inventario: number
  ) => {
    try {
      const response = await axios.post(`${api_url}inventarios/autorizar`, {
        id,
        operador,
        sucursal,
        deposito,
        nro_inventario,
      });
      console.log(response.data.body);
      if (response.data.body.error === false) {
        toast({
          title: "Inventario autorizado",
          description: "El inventario ha sido autorizado correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: response.data.body.mensaje,
          status: "error",
          duration: 3000,
        });
      }
      fetchInventariosDisponibles();
      setAutorizaciones([]);
    } catch (error) {
      console.error("Error al autorizar el inventario:", error);
    }
  };

  const FloatingCard = ({
    inventarios,
    onSelect,
    onClose,
    onBuscarItems,
  }: FloatingCardProps) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className=" border border-gray-500 absolute left-16 top-full mt-2 bg-white rounded-lg shadow-lg w-72 z-50"
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700">
              Inventarios Disponibles
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {inventarios.length > 0 ? (
              <div className="space-y-2">
                {inventarios.map((inv: InventariosDisponibles) => (
                  <button
                    key={inv.id_inventario}
                    onClick={() => {
                      onSelect(inv);
                      // Realizar búsqueda inmediata al seleccionar inventario
                      onBuscarItems(String(inv.id_inventario), null);
                    }}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">
                        Inventario #{inv.nro_inventario}
                      </div>
                      <div className="text-sm text-gray-500">{inv.fecha}</div>
                    </div>
                    <ChartColumn size={16} className="text-gray-400" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No hay inventarios disponibles
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Verificar si hay autorizaciones disponibles antes de calcular totales
  const hayAutorizaciones =
    autorizaciones &&
    autorizaciones[0] &&
    autorizaciones[0].items &&
    autorizaciones.length > 0 &&
    autorizaciones[0].items.length > 0;

  // Calcular totales solo si hay autorizaciones
  const totalItemsFaltantes = hayAutorizaciones
    ? autorizaciones[0].items.filter((item) => {
        const diferencia =
          typeof item.diferencia_total === "string"
            ? parseFloat(item.diferencia_total)
            : item.diferencia_total;
        return diferencia < 0;
      }).length
    : 0;

  const totalItemsSobrantes = hayAutorizaciones
    ? autorizaciones[0].items.filter((item) => {
        const diferencia =
          typeof item.diferencia_total === "string"
            ? parseFloat(item.diferencia_total)
            : item.diferencia_total;
        return diferencia > 0;
      }).length
    : 0;

  const totalCostoItemsFaltantes = hayAutorizaciones
    ? autorizaciones[0].items.reduce((acc, item) => {
        const costoDiferencia =
          typeof item.costo_diferencia_total === "string"
            ? Math.abs(
                parseFloat(
                  String(item.costo_diferencia_total)
                    .replace(/\./g, "")
                    .replace(",", ".")
                )
              )
            : Math.abs(item.costo_diferencia_total);
        return item.diferencia_total < 0 ? acc + costoDiferencia : acc;
      }, 0)
    : 0;

  const totalCostoItemsSobrantes = hayAutorizaciones
    ? autorizaciones[0].items.reduce((acc, item) => {
        const costoDiferencia =
          typeof item.costo_diferencia_total === "string"
            ? parseFloat(
                String(item.costo_diferencia_total)
                  .replace(/\./g, "")
                  .replace(",", ".")
              )
            : item.costo_diferencia_total;
        return item.diferencia_total > 0 ? acc + costoDiferencia : acc;
      }, 0)
    : 0;

  const generarPDF = async () => {
    try {
      setMostrarReporte(true);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast({
        title: "Error",
        description: "Error al generar el PDF",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleGenerarReportePersonalizado = async (
    depositoId: number,
    fechaInicio: string,
    fechaFin: string
  ) => {
    try {
      const params: any = {
        sucursal: sucursaleSeleccionada?.id || 0
      };

      if (depositoId) {
        params.deposito = depositoId;
      }

      if (fechaInicio && fechaFin) {
        params.fecha_inicio = fechaInicio;
        params.fecha_fin = fechaFin;
      }

      // Hacer la llamada al API
      const response = await axios.get(`${api_url}inventarios/reporte`, { params });
      
      // Generar el Excel con los datos
      generarExcelReporteInventario(response.data.body);

      toast({
        title: "Éxito",
        description: "Reporte Excel generado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error al generar reporte personalizado:", error);
      toast({
        title: "Error",
        description: "Error al generar el reporte personalizado",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex direction="column" gap={2} w="full" h="100vh" bg="gray.100" p={2}>
      <HeaderComponent
        titulo="Autorización de Ajuste de Stock"
        Icono={ArchiveRestore}
      />
      <div className="flex flex-row gap-2 w-full bg-white p-2 rounded-md">
        <div className="relative">
          {" "}
          <Button onClick={() => setShowInventarioCard(true)}>
            Buscar Inventario
          </Button>
          <AnimatePresence>
            {showInventarioCard && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowInventarioCard(false)}
                />
                <FloatingCard
                  inventarios={inventariosDisponibles}
                  onSelect={(inventario) => {
                    setInventarioSeleccionado(inventario);
                    setShowInventarioCard(false);
                  }}
                  onClose={() => setShowInventarioCard(false)}
                  onBuscarItems={() => {}}
                />
              </>
            )}
          </AnimatePresence>
        </div>
        <Select
          placeholder="Sucursal"
          value={sucursaleSeleccionada?.id}
          onChange={(e) =>
            setSucursaleSeleccionada(
              sucursales.find(
                (sucursal) => sucursal.id === Number(e.target.value)
              ) || null
            )
          }
        >
          {sucursales.map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.descripcion}
            </option>
          ))}
        </Select>
        <Select
          placeholder="Deposito"
          value={depositoSeleccionado?.dep_codigo}
          onChange={(e) =>
            setDepositoSeleccionado(
              depositos.find(
                (deposito) => deposito.dep_codigo === Number(e.target.value)
              ) || null
            )
          }
        >
          {depositos.map((deposito) => (
            <option key={deposito.dep_codigo} value={deposito.dep_codigo}>
              {deposito.dep_descripcion}
            </option>
          ))}
        </Select>
        <div className="flex flex-row gap-2">
          <Button
            onClick={() => setShowReportesModal(true)}
            colorScheme="purple"
          >
            <div className="flex flex-row gap-2">
              Reportes Personalizados
              <FileText />
            </div>
          </Button>
          <Button onClick={fetchReporte} colorScheme="green">
            <div className="flex flex-row gap-2">
              Buscar <Search />
            </div>
          </Button>
        </div>
        <div className="flex flex-row gap-2">
          <Button onClick={() => setShowConfirmModal(true)} colorScheme="blue">
            <div className="flex flex-row gap-2">
              Autorizar
              <Check />
            </div>
          </Button>
          <ConfirmModal
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={() => {
              autorizarInventario(
                inventarioSeleccionado?.id_inventario || 0,
                Number(sessionStorage.getItem("user_id") || 1),
                sucursaleSeleccionada?.id || 0,
                depositoSeleccionado?.dep_codigo || 0,
                inventarioSeleccionado?.nro_inventario || 0
              );
            }}
            title="¿Está seguro de autorizar este ajuste de stock?"
            message="Esta acción autorizará el ajuste de stock y no podrá ser revertida."
          />
        </div>
        <div className="flex flex-row gap-2">
          <Button onClick={generarPDF} colorScheme="teal">
            <div className="flex flex-row gap-2">
              Imprimir
              <Printer size={20} />
            </div>
          </Button>
        </div>
      </div>
      {autorizaciones.length > 0 ? (
        <div className="flex flex-col gap-2 w-full bg-white p-2 rounded-md">
          <div className="flex flex-row gap-2 justify-around my-4">
            <p>
              <strong>Nro. Ajuste:</strong> {autorizaciones[0].id_inventario}
            </p>
            <p>
              <strong>Nro. Inventario:</strong>{" "}
              {autorizaciones[0].nro_inventario}
            </p>
            <p>
              <strong>Estado del Inventario:</strong>{" "}
              {autorizaciones[0].estado_inventario}
            </p>
            <p>
              <strong>Sucursal:</strong> {autorizaciones[0].nombre_sucursal}
            </p>
            <p>
              <strong>Deposito:</strong> {autorizaciones[0].nombre_deposito}
            </p>
            <p>
              <strong>Fecha:</strong> {autorizaciones[0].fecha}
            </p>
            <p>
              <strong>Hora:</strong> {autorizaciones[0].hora}
            </p>
            <p>
              <strong>Operador:</strong> {autorizaciones[0].operador_nombre}
            </p>
          </div>
          {autorizaciones &&
          autorizaciones[0] &&
          autorizaciones[0].items &&
          autorizaciones[0].items.length > 0 ? (
            <>
              <div className="flex flex-col gap-2 w-full border-2 border-gray-300 rounded-md p-2">
                <table className="w-full border-2 border-gray-300">
                  <thead className="bg-gray-200 [&>th]:p-2 [&>th]:text-center [&>th]:text-sm [&>th]:font-bold [&>th]:text-gray-700 [&>th]:border-2 [&>th]:border-gray-300">
                    <tr className="border-2 border-gray-300 [&>th]:border [&>th]:border-gray-300">
                      <th>Codigo</th>
                      <th>Articulo</th>
                      <th>Lote</th>
                      <th>Cantidad Inicial</th>
                      <th>Cantidad Scanneada</th>
                      <th>Diferencia</th>
                      <th>Valor</th>
                      <th>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {autorizaciones[0].items
                      .sort((a, b) => {
                        if (
                          (a.diferencia_total < 0 && b.diferencia_total >= 0) ||
                          (a.diferencia_total >= 0 && b.diferencia_total < 0)
                        ) {
                          return a.diferencia_total < 0 ? -1 : 1;
                        }
                        return (
                          Math.abs(b.diferencia_total) -
                          Math.abs(a.diferencia_total)
                        );
                      })
                      .map((item) => (
                        <tr
                          key={item.cod_interno}
                          className={`border-2 border-gray-300 [&>td]:p-2 [&>td]:text-sm [&>td]:text-gray-700 [&>td]:border [&>td]:border-gray-300 
                        ${
                          item.diferencia_total < 0
                            ? "bg-red-50"
                            : item.diferencia_total > 0
                            ? "bg-green-50"
                            : ""
                        }`}
                        >
                          <td>{item.cod_interno}</td>
                          <td>{item.articulo}</td>
                          <td>{item.items_lotes[0]?.lote || "-"}</td>
                          <td className="text-center">
                            {item.cantidad_inicial_total}
                          </td>
                          <td className="text-center">
                            {item.cantidad_scanner_total || 0}
                          </td>
                          <td className="text-right">
                            {item.diferencia_total}
                          </td>
                          <td className="text-right">
                            {item.costo_diferencia_total}
                          </td>
                          <td className="text-center">
                            {item.diferencia_total < 0
                              ? "PÉRDIDA"
                              : item.diferencia_total > 0
                              ? "GANANCIA"
                              : "SIN CAMBIO"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col border border-gray-400 p-2 rounded-md">
                <p>
                  <strong>Número de artículos faltantes:</strong>{" "}
                  {totalItemsFaltantes}
                </p>
                <p>
                  <strong>Número de artículos sobrantes:</strong>{" "}
                  {totalItemsSobrantes}
                </p>
                <p>
                  <strong>Total costo items faltante:</strong>{" "}
                  {totalCostoItemsFaltantes.toLocaleString("es-PY", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p>
                  <strong>Total costo items sobrante:</strong>{" "}
                  {totalCostoItemsSobrantes.toLocaleString("es-PY", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 items-center justify-center p-4 text-gray-500">
              <p>No hay datos para mostrar</p>
              <p className="text-sm">
                Este inventario no tiene tiene items para ajustar
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 items-center justify-center p-4 text-gray-500">
          <p>No hay datos para mostrar</p>
          <p className="text-sm">
            Seleccione un inventario para ver los detalles
          </p>
        </div>
      )}
      {mostrarReporte && (
        <ReporteItemsScaneados
          id_inventario={inventarioSeleccionado?.id_inventario || 0}
          onComplete={() => {
            setMostrarReporte(false);
            toast({
              title: "Éxito",
              description: "PDF generado correctamente",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          }}
          onError={() => {
            setMostrarReporte(false);
            toast({
              title: "Error",
              description: "Error al generar el PDF",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }}
        />
      )}
      <ReportesModal
        isOpen={showReportesModal}
        onClose={() => setShowReportesModal(false)}
        depositos={depositos}
        onGenerarReporte={handleGenerarReportePersonalizado}
      />
    </Flex>
  );
};

export default AutorizacionAjusteDeStock;
