import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { api_url } from "../../../../utils";
import { useToast } from "@chakra-ui/react";

import { AnimatePresence, motion } from "framer-motion";
import Auditar from "@/services/AuditoriaHook";
import { ChartColumn } from "lucide-react";
import { Ingreso, IngresoDetalle, VerificacionItemDTO } from "../types/shared.type";
import { useVerificarIngresos } from "../hooks/useVerificarIngresos";
interface FloatingCardProps {
  facturas: Ingreso[];
  onSelect: (factura: Ingreso) => void;
  onClose: () => void;
  onBuscarItems: (facturaId: string, busqueda: string | null) => void;
}

const FloatingCard = ({
  facturas,
  onSelect,
  onClose,
}: FloatingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className=" border border-gray-500 absolute left-1/4 -translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-lg w-72 z-50"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">
            Facturas Disponibles
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {facturas.length > 0 ? (
            <div className="space-y-2 ">
              {facturas.map((factura: Ingreso) => (
                <button
                  key={factura.id_compra}
                  onClick={() => {
                    onSelect(factura);
                  }}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors flex justify-between items-center border-b border-gray-500"
                >
                  <div>
                    <div className="font-medium">
                      Factura #{factura.nro_factura}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(factura.fecha_compra)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Dep: {factura.deposito_descripcion}
                    </div>
                  </div>
                  <ChartColumn size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No hay facturas disponibles
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const InventarioScanner = () => {
  const [isGridView] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [articulos, setArticulos] = useState<IngresoDetalle[]>([]);
  const [articuloBusqueda, setArticuloBusqueda] = useState("");
  const [articuloSeleccionado, setArticuloSeleccionado] =
    useState<IngresoDetalle | null>(null);

  const [articuloFields, setArticuloFields] =
    useState<VerificacionItemDTO>({
      id_detalle: 0,
      cantidad: 0,
    });

  const [isFloatingCardVisible, setIsFloatingCardVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cantidadInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [facturasDisponibles, setFacturasDisponibles] = useState<
    Ingreso[]
  >([]);

  const [facturaSeleccionada, setFacturaSeleccionada] =
    useState<Ingreso | null>(null);

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  };

  const handleSeleccionarIngreso = (ingreso: Ingreso) => {
    setFacturaSeleccionada(ingreso);
    console.log("ingreso seleccionado", ingreso);
  };

  const { verificarItem, verificarCompra } = useVerificarIngresos();

  useEffect(() => {
    if (facturaSeleccionada) {
      console.log("ingreso seleccionado", facturaSeleccionada);
    }
  }, [facturaSeleccionada]);

  const handleEditarArticulo = (articulo: IngresoDetalle) => {
    setArticuloFields({
      id_detalle: articulo.detalle_compra,
      cantidad: 0,
    });
    setArticuloSeleccionado(articulo);
    setModalVisible(true);
    console.log("articulo seleccionado", articulo);
  };
  const fetchFacturasDisponibles = async () => {
    try {
      const response = await axios.get(`${api_url}control-ingreso/`,
        {
          params: {
            verificado: 0
          }
        }
      );
      const data = response.data;
      console.log(data.body);
      setFacturasDisponibles(data.body || []);
    } catch (error) {
      console.error("Error al cargar facturas:", error);
    }
  };

  // Nuevo useEffect separado que depende del depositoId
  useEffect(() => {
    fetchFacturasDisponibles();
  }, []);


  useEffect(() => {
    if (modalVisible && cantidadInputRef.current) {
      cantidadInputRef.current.focus();
    }
  }, [modalVisible]);


  async function getArticulos(busqueda?: string) {
    if (!facturaSeleccionada) {
      toast({
        title: "Error",
        description: "Debe seleccionar una factura",
        status: "error",
      });
      return null;
    }

    try {
      const response = await axios.get(
        `${api_url}control-ingreso/items-a-escanear`,
        {
          params: {
            id_compra: facturaSeleccionada.id_compra,
            busqueda: busqueda,
          },
        }
      );
      const items = response.data.body || [];
      setArticulos(items);
      return items; // Retornamos los items directamente
    } catch (error) {
      console.error("Error al obtener articulos:", error);
      toast({
        title: "Error",
        description: "Error al obtener articulos:" + error,
        status: "error",
      });
      return null;
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
    if (facturaSeleccionada) {
      getArticulos();
    }
  }, [facturaSeleccionada]);

  async function escanearArticulo(formData: VerificacionItemDTO) {
    if (!facturaSeleccionada) {
      toast({
        title: "Error",
        description: "Debe seleccionar una factura",
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

    if (formData.id_detalle === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar un articulo",
        status: "error",
      });
      return;
    }

    if (formData.cantidad === null || formData.cantidad === undefined) {
      toast({
        title: "Error",
        description: "Debe seleccionar una cantidad",
        status: "error",
      });
      return;
    }

    try {
      const response = await verificarItem(formData);
      if (response) {
        toast({
          title: "Success",
          description: "Artículo escaneado correctamente",
          status: "success",
        });
        setArticuloFields({
          id_detalle: 0,
          cantidad: 0,
        });
        setArticuloSeleccionado(null);
        setModalVisible(false);
        Auditar(
          1,
          1,
          facturaSeleccionada?.id_compra || null,
          Number(sessionStorage.getItem("user_id") || 1),
          "Scanneo un item de la factura con la app para verificacion antes de ingreso a deposito"
        );

        console.log('empezando a traer los articulos');
        
        // Obtener los artículos actualizados y usar el valor retornado
        const articulosActualizados = await getArticulos();
        
        console.log('articulos actualizados', articulosActualizados?.length);
        
        // Verificar usando los artículos retornados, no el estado
        if (articulosActualizados?.length === 0) {
          console.log('verificando la compra', facturaSeleccionada?.id_compra);
          const compraResponse = await verificarCompra({
            id_compra: facturaSeleccionada?.id_compra || 0
          });
          
          if (compraResponse) {
            toast({
              title: "Success",
              description: "No hay más artículos por verificar",
              status: "success",
            });
          }
          await fetchFacturasDisponibles();
        }
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
              Verificacion de Ingresos
            </h1>
            {facturaSeleccionada ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-white text-sm font-medium">
                  Factura Nro: {facturaSeleccionada?.nro_factura}
                </h2>
                <h2 className="text-white text-xs font-medium">
                  Proveedor: {facturaSeleccionada?.proveedor}
                </h2>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <h2 className="text-white text-sm font-medium">
                  No se ha seleccionado ninguna factura
                </h2>
              </div>
            )}
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
                    facturas={facturasDisponibles}
                    onSelect={(factura) => {
                      handleSeleccionarIngreso(factura);
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
                  key={item.detalle_compra}
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
                    Cod. Interno: {item.articulo_id}
                  </p>
                  <p className="font-bold my-1">{item.articulo_descripcion}</p>
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
                    {articuloSeleccionado?.articulo_id}
                  </p>
                  <p className="text-lg">
                    {articuloSeleccionado?.articulo_descripcion}
                  </p>
                </div>
              </div>
              <div className="flex flex-row  w-full gap-4 mb-4">
                <div className="w-full">
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={articuloFields.cantidad || ''}
                    onChange={(e) => {
                      setArticuloFields({
                        ...articuloFields,
                        cantidad: Number(e.target.value),
                      });
                    }}
                    ref={cantidadInputRef}
                  />
                </div>
              </div>
              <div className="mb-4 flex flex-row gap-4"></div>
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
