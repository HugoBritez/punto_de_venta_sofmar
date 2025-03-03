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
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

interface FloatingCardProps {
  inventarios: Array<{ id: number; fecha: string }>;
  onSelect: (id: number) => void;
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
    Array<{ id: number; fecha: string }>
  >([]);
  const [showInventarioCard, setShowInventarioCard] = useState(false);

  const [inventarioSeleccionado, setInventarioSeleccionado] = useState<
    number | null
  >(null);

  const toast = useToast();

  const fetchInventariosDisponibles = async () => {
    const response = await axios.get(
      `${api_url}articulos/inventarios-disponibles`,
      {
        params: {
          estado: 1,
          deposito: depositoSeleccionado?.dep_codigo,
          sucursal: sucursaleSeleccionada?.id,
        },
      }
    );
    const data = response.data;
    setInventariosDisponibles(data.body || []);
    console.log(data.body);
  };

  useEffect(() => {
    fetchInventariosDisponibles();
  }, [depositoSeleccionado, sucursaleSeleccionada]);

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

  const fetchAutorizaciones = async () => {
    if (inventarioSeleccionado === null) {
      toast({
        title: "Error",
        description: "Debe seleccionar un inventario",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    try {
      const response = await axios.get(
        `${api_url}articulos/reporte-anomalias`,
        {
          params: {
            nro_inventario: inventarioSeleccionado,
            sucursal: sucursaleSeleccionada?.id,
            deposito: depositoSeleccionado?.dep_codigo,
          },
        }
      );
      console.log(response.data.body);
      setAutorizaciones(response.data.body);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener el reporte de anomalias:", error);
      setLoading(false);
    }
  };

  const cerrarInventario = async () => {
    if (inventarioSeleccionado === null) {
      toast({
        title: "Debe seleccionar un inventario",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    const inventario = {
      id: autorizaciones[0].id_inventario,
      operador: sessionStorage.getItem("user_id"),
      sucursal: sucursaleSeleccionada?.id,
      deposito: depositoSeleccionado?.dep_codigo,
      nro_inventario: autorizaciones[0].nro_inventario,
      autorizado: true,
    };

    try {
      await axios.post(
        `${api_url}articulos/cerrar-inventario-auxiliar`,
        inventario
      );
      toast({
        title: "Inventario cerrado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setAutorizaciones([]);
      setInventarioSeleccionado(null);
      fetchInventariosDisponibles();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al cerrar el inventario",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
                {inventarios.map((inv: any) => (
                  <button
                    key={inv.id}
                    onClick={() => {
                      onSelect(inv.id);
                      // Realizar búsqueda inmediata al seleccionar inventario
                      onBuscarItems(String(inv.id), null);
                    }}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">Inventario #{inv.id}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(inv.fecha).toLocaleDateString()}
                      </div>
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
                  onSelect={(id) => {
                    setInventarioSeleccionado(id);
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
          <Button onClick={fetchAutorizaciones} colorScheme="green">
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
              cerrarInventario();
            }}
            title="¿Está seguro de autorizar este ajuste de stock?"
            message="Esta acción autorizará el ajuste de stock y no podrá ser revertida."
          />
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
          <div className="flex flex-col gap-2 w-full border-2 border-gray-300 rounded-md p-2">
            <table className="w-full border-2 border-gray-300">
              <thead className="bg-gray-200 [&>th]:p-2 [&>th]:text-center [&>th]:text-sm [&>th]:font-bold [&>th]:text-gray-700 [&>th]:border-2 [&>th]:border-gray-300">
                <tr className="border-2 border-gray-300 [&>th]:border [&>th]:border-gray-300">
                  <th>Codigo</th>
                  <th>Articulo</th>
                  <th>Cantidad Inicial</th>
                  <th>Cantidad Scanneada</th>
                  <th>Diferencia</th>
                  <th>Costo Total Gs.</th>
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
                    // Si son del mismo tipo (ambos faltantes o ambos sobrantes),
                    // ordenamos por el valor absoluto de la diferencia (mayor a menor)
                    return Math.abs(b.diferencia_total) - Math.abs(a.diferencia_total);
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
                      <td className="text-center">
                        {item.cantidad_inicial_total}
                      </td>
                      <td className="text-center">
                        {item.cantidad_scanner_total || 0}
                      </td>
                      <td className="text-right">{item.diferencia_total}</td>
                      <td className="text-right">{item.costo_diferencia_total}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col border border-gray-400 p-2 rounded-md">
            <p>
              <strong>Total items faltantes:</strong>{" "}
              {autorizaciones[0].items.reduce((acc, item) => acc + item.diferencia_total, 0)}
            </p>
            <p>
              <strong>Total items sobrantes:</strong>{" "}
              {autorizaciones[0].items.reduce((acc, item) => acc + item.diferencia_total, 0)}
            </p>
            <p>
              <strong>Total costo items faltante:</strong>{" "}
              {autorizaciones[0].items.reduce((acc, item) => acc + item.costo_diferencia_total, 0)}
            </p>
            <p>
              <strong>Total costo items sobrante:</strong>{" "}
              {autorizaciones[0].items.reduce((acc, item) => acc + item.costo_diferencia_total, 0)}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 items-center justify-center p-4 text-gray-500">
          <p>No hay datos para mostrar</p>
          <p className="text-sm">
            Seleccione un inventario para ver los detalles
          </p>
        </div>
      )}
    </Flex>
  );
};

export default AutorizacionAjusteDeStock;
