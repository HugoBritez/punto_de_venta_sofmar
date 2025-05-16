import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { api_url } from "../../utils";
import { useToast } from "@chakra-ui/react";

import { AnimatePresence, motion } from "framer-motion";
import Auditar from "@/shared/services/AuditoriaHook";
import { ChartColumn } from "lucide-react";

interface FloatingCardProps {
  inventarios: InventariosDisponibles[];
  onSelect: (inventario: InventariosDisponibles) => void;
  onClose: () => void;
  onBuscarItems: (inventarioId: string, busqueda: string | null) => void;
}

const FloatingCard = ({
  inventarios,
  onSelect,
  onClose,
}: FloatingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className=" border border-gray-500 absolute right-16 top-full mt-2 bg-white rounded-lg shadow-lg w-72 z-50"
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
                  key={inv.id_inventario}
                  onClick={() => {
                    onSelect(inv);
                  }}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">
                      Inventario #{inv.nro_inventario}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(inv.fecha).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Suc: {inv.sucursal_nombre}
                    </div>
                    <div className="text-sm text-gray-500">
                      Dep: {inv.deposito_nombre}
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

interface Ubicaciones {
  ub_codigo: number;
  ub_descripcion: string;
}

interface Sububicaciones {
  s_codigo: number;
  s_descripcion: string;
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

interface ArticuloInventario {
  articulo_id: number;
  cod_interno: string;
  lote_id: number;
  descripcion: string;
  ubicacion_id: number;
  ubicacion: string;
  sub_ubicacion_id: number;
  sub_ubicacion: string;
  control_vencimiento: number;
  vencimiento: string;
  lote: string;
  talle_id: number;
  talle: string;
  color_id: number;
  color: string;
  cantidad: number;
  cod_barra: string;
  cod_barra_lote: string;
}

interface ArticuloInventarioFields {
  id_articulo: number;
  id_lote: number;
  cantidad: number;
  lote: string;
  talle_id: number;
  color_id: number;
  vencimiento: string;
  codigo_barras: string;
  id_inventario: number;
  ubicacion_id: number;
  sub_ubicacion_id: number;
}

const InventarioScanner = () => {
  const [isGridView] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [articulos, setArticulos] = useState<ArticuloInventario[]>([]);
  const [articuloBusqueda, setArticuloBusqueda] = useState("");
  const [articuloSeleccionado, setArticuloSeleccionado] =
    useState<ArticuloInventario | null>(null);

  const [articuloFields, setArticuloFields] =
    useState<ArticuloInventarioFields>({
      id_articulo: 0,
      id_lote: 0,
      cantidad: 0,
      lote: "",
      talle_id: 0,
      color_id: 0,
      vencimiento: "",
      codigo_barras: "",
      id_inventario: 0,
      ubicacion_id: 0,
      sub_ubicacion_id: 0,
    });

  const [isFloatingCardVisible, setIsFloatingCardVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cantidadInputRef = useRef<HTMLInputElement>(null);
  const [ubicaciones, setUbicaciones] = useState<Ubicaciones[]>([]);
  const [sububicaciones, setSububicaciones] = useState<Sububicaciones[]>([]);
  const toast = useToast();
  const [inventariosDisponibles, setInventariosDisponibles] = useState<
    InventariosDisponibles[]
  >([]);

  const [inventarioSeleccionado, setInventarioSeleccionado] =
    useState<InventariosDisponibles | null>(null);

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  };

  const handleSeleccionarInventario = (inventario: InventariosDisponibles) => {
    setInventarioSeleccionado(inventario);
    console.log("inventario seleccionado", inventario);
  };

  useEffect(() => {
    if (inventarioSeleccionado) {
      console.log("inventario seleccionado", inventarioSeleccionado);
    }
  }, [inventarioSeleccionado]);

  const handleEditarArticulo = (articulo: ArticuloInventario) => {
    setArticuloFields({
      id_articulo: 0,
      id_lote: 0,
      cantidad: 0,
      lote: "",
      talle_id: 0,
      color_id: 0,
      vencimiento: "",
      codigo_barras: "",
      id_inventario: 0,
      ubicacion_id: 0,
      sub_ubicacion_id: 0,
    });
    setArticuloSeleccionado(articulo);
    setModalVisible(true);
    setArticuloFields({
      id_articulo: articulo.articulo_id,
      id_lote: articulo.lote_id,
      cantidad: articulo.cantidad,
      lote: articulo.lote,
      talle_id: articulo.talle_id,
      color_id: articulo.color_id,
      vencimiento: articulo.vencimiento,
      codigo_barras: articulo.cod_barra,
      id_inventario: inventarioSeleccionado?.id_inventario || 0,
      ubicacion_id: articulo.ubicacion_id,
      sub_ubicacion_id: articulo.sub_ubicacion_id,
    });
    console.log("articulo seleccionado", articulo);
  };

  // Nuevo useEffect separado que depende del depositoId
  useEffect(() => {
    const fetchInventariosDisponibles = async () => {
      try {
        const response = await axios.get(`${api_url}inventarios/disponibles`);
        const data = response.data;
        console.log(data.body);
        setInventariosDisponibles(data.body || []);
      } catch (error) {
        console.error("Error al cargar inventarios:", error);
      }
    };

    fetchInventariosDisponibles();
  }, []);

  const fetchUbicaciones = async () => {
    try {
      const response = await axios.get(`${api_url}ubicaciones/`);
      const data = response.data;
      setUbicaciones(data.body || []);
    } catch (error) {
      console.error("Error al obtener ubicaciones:", error);
    }
  };

  const fetchSububicaciones = async () => {
    try {
      const response = await axios.get(`${api_url}sububicaciones`);
      const data = response.data;
      setSububicaciones(data.body || []);
    } catch (error) {
      console.error("Error al obtener sububicaciones:", error);
    }
  };

  useEffect(() => {
    fetchUbicaciones();
    fetchSububicaciones();
  }, []);

  useEffect(() => {
    if (modalVisible && cantidadInputRef.current) {
      cantidadInputRef.current.focus();
    }
  }, [modalVisible]);

  async function getArticulos(busqueda?: string) {
    if (!inventarioSeleccionado) {
      toast({
        title: "Error",
        description: "Debe seleccionar un inventario",
        status: "error",
      });
      return;
    }

    try {
      const response = await axios.get(`${api_url}inventarios/escanear`, {
        params: {
          nro_inventario: inventarioSeleccionado.nro_inventario,
          inventario_id: inventarioSeleccionado.id_inventario,
          busqueda: busqueda,
          deposito_id: inventarioSeleccionado.deposito_id,
        },
      });
      const data = response.data;
      setArticulos(data.body || []);
    } catch (error) {
      console.error("Error al obtener articulos:", error);
      toast({
        title: "Error",
        description: "Error al obtener articulos:" + error,
        status: "error",
      });
    }
  }

  const handleBuscarArticulos = (texto: string) => {
    const textoformateado = texto.startsWith("0") ? texto.slice(1) : texto;
    getArticulos(textoformateado);
    if (
      !textoformateado ||
      textoformateado.trim() === "" ||
      textoformateado.length < 1
    ) {
      setArticulos([]);
    }
  };

  useEffect(() => {
    if (inventarioSeleccionado) {
      getArticulos();
    }
  }, [inventarioSeleccionado]);

  async function escanearArticulo(formData: ArticuloInventarioFields) {
    if(!inventarioSeleccionado) {
      toast({
        title: "Error",
        description: "Debe seleccionar un inventario",
        status: "error",
      });
    }
    if (Object.keys(formData).length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar un articulo",
        status: "error",
      });
      return;
    }

    if(formData.id_articulo === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar un articulo",
        status: "error",
      });
      return;
    }

    if(formData.cantidad === null || formData.cantidad === undefined) {
      toast({
        title: "Error",
        description: "Debe seleccionar una cantidad",
        status: "error",
      });
      return;
    }

    try {
      console.log(formData);
      const response = await axios.post(
        `${api_url}inventarios/items/escanear`,
        {
          id_articulo: formData.id_articulo,
          id_lote: formData.id_lote,
          cantidad: formData.cantidad,
          lote: formData.lote,
          talle_id: formData.talle_id,
          color_id: formData.color_id,
          vencimiento: formData.vencimiento,
          codigo_barras: formData.codigo_barras,
          id_inventario: formData.id_inventario,
          ubicacion_id: formData.ubicacion_id,
          sub_ubicacion_id: formData.sub_ubicacion_id,
        }
      );
      console.log(response);
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Articulo escaneado correctamente",
          status: "success",
        });
        setArticuloFields({
          id_articulo: 0,
          id_lote: 0,
          cantidad: 0,
          lote: "",
          talle_id: 0,
          color_id: 0,
          vencimiento: "",
          codigo_barras: "",
          id_inventario: 0,
          ubicacion_id: 0,
          sub_ubicacion_id: 0,
        });
        setArticuloSeleccionado(null);
        setModalVisible(false);
        Auditar(
          1,
          1,
          inventarioSeleccionado?.id_inventario || null,
          Number(sessionStorage.getItem("user_id") || 1),
          "Scanneo un item del inventario con la app"
        );
        getArticulos();
      }
    } catch (error) {
      console.error("Error al escanear el articulo:", error);
    }
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Header Fijo */}
      <div className="bg-[#0455c1] rounded-b-3xl pb-4 z-2">
        <div className="flex  justify-between items-center px-4 pt-2 pb-4">
          <div className="flex items-start gap-4 flex-col">
            <h1 className="text-white text-xl font-bold">
              Toma de Inventario Agrupado
            </h1>
            <div className="flex flex-row gap-4">
              <h2 className="text-white text-xs font-medium">
                Inventario Nro: {inventarioSeleccionado?.nro_inventario}
              </h2>
              <h2 className="text-white text-xs font-medium">
                Deposito: {inventarioSeleccionado?.deposito_nombre}
              </h2>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="px-4 flex flex-row w-full justify-center items-center gap-4">
          <div className="flex items-center bg-white rounded-lg w-full">
            <input
              ref={searchInputRef}
              type="text"
              inputMode="text"
              placeholder="Buscar producto por nombre o codigo"
              className="flex-1 p-3 rounded-lg"
              value={articuloBusqueda}
              onChange={(e) => {
                setArticuloBusqueda(e.target.value);
                handleBuscarArticulos(e.target.value);
              }}
              onClick={handleInputClick}
            />
          </div>
          <button onClick={() => setIsFloatingCardVisible(true)}>
            <ChartColumn size={20} className="text-white" />
          </button>
          <div className="relative">
            <AnimatePresence>
              {isFloatingCardVisible && (
                <div className="absolute right-16 top-full mt-2 bg-white rounded-lg shadow-lg w-72 z-50">
                  <FloatingCard
                    inventarios={inventariosDisponibles}
                    onSelect={(inventario) => {
                      handleSeleccionarInventario(inventario);
                      setIsFloatingCardVisible(false);
                    }}
                    onClose={() => setIsFloatingCardVisible(false)}
                    onBuscarItems={getArticulos}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Lista de artículos con scroll - Ajustamos las clases */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {articulos.length > 0 ? (
            <motion.div
              className={`grid ${
                isGridView ? "grid-cols-2" : "grid-cols-1"
              } gap-4`}
              layout
            >
              {articulos.map((item) => (
                <motion.div
                  key={item.lote_id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleEditarArticulo(item)}
                  className="bg-white p-4 rounded-lg shadow cursor-pointer"
                >
                  <p className="text-md text-gray-500 font-semibold">
                    Lote: {item.lote || "N/A"}
                  </p>
                  <p className="text-md text-gray-500 font-semibold">
                    Cod. Barras: {item.cod_barra}
                  </p>
                  <p className="text-md text-gray-500">
                    Cod. Ref: {item.cod_interno}
                  </p>
                  <p className="font-bold my-1">{item.descripcion}</p>
                  <p className="text-sm text-blue-500">
                    {item.ubicacion} - {item.sub_ubicacion}
                  </p>
                  <p className="text-sm text-gray-500"> {item.vencimiento} </p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            articuloBusqueda && (
              <div className="min-h-[200px] flex flex-col items-center justify-center text-gray-500">
                <p className="text-lg font-medium">
                  No se encontraron artículos
                </p>
                <p className="text-sm">Intente con otro código o descripción</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal de Edición */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Lote: {articuloSeleccionado?.lote}
                </h2>
                <button
                  onClick={() => setModalVisible(false)}
                  className="text-gray-500"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-500">Cod. Ref:</p>
                <div className="flex space-x-14">
                  <p className="font-bold">
                    {articuloSeleccionado?.cod_interno}
                  </p>
                  <p className="text-lg">{articuloSeleccionado?.descripcion}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={articuloSeleccionado?.cantidad}
                    onChange={(e) => {
                      setArticuloFields({
                        ...articuloFields,
                        cantidad: Number(e.target.value),
                      });
                    }}
                    ref={cantidadInputRef}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Vencimiento
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded"
                    value={articuloFields.vencimiento ? 
                      new Date(articuloFields.vencimiento).toISOString().split('T')[0] 
                      : ''
                    }
                    disabled={articuloSeleccionado?.control_vencimiento === 0}
                    onChange={(e) => {
                      setArticuloFields({
                        ...articuloFields,
                        vencimiento: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="mb-4 flex flex-row gap-4"></div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicacion
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={articuloFields.ubicacion_id || ""}
                    onChange={(e) => {
                      setArticuloFields({
                        ...articuloFields,
                        ubicacion_id: Number(e.target.value),
                      });
                    }}
                  >
                    {ubicaciones.map((ub: Ubicaciones) => (
                      <option key={ub.ub_codigo} value={ub.ub_codigo}>
                        {ub.ub_descripcion}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sububicacion
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={articuloFields.sub_ubicacion_id || ""}
                    onChange={(e) => {
                      setArticuloFields({
                        ...articuloFields,
                        sub_ubicacion_id: Number(e.target.value),
                      });
                    }}
                  >
                    {sububicaciones.map((sub) => (
                      <option key={sub.s_codigo} value={sub.s_codigo}>
                        {sub.s_descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-row gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lote
                  </label>
                  <input
                    placeholder={
                      articuloSeleccionado?.control_vencimiento === 1
                        ? "Solo p/ lote nuevo"
                        : "Item marcado como Sin control de vencimiento"
                    }
                    type="text"
                    className="w-full p-2 border rounded"
                    value={articuloFields.lote}
                    onChange={(e) => {
                      setArticuloFields({
                        ...articuloFields,
                        lote: e.target.value,
                      });
                    }}
                    disabled={articuloSeleccionado?.control_vencimiento === 0}
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código de barras
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={articuloFields.codigo_barras}
                    onChange={(e) => {
                      setArticuloFields({
                        ...articuloFields,
                        codigo_barras: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => escanearArticulo(articuloFields)}
                className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioScanner;
