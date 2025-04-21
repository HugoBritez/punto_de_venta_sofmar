import { useState } from "react";
import { useBuscadorArticulos } from "./hooks/useBuscadorArticulos";
import { BusquedaDTO } from "./types/busquedaDTO.type";
import Modal from "../modal/Modal";
import DepositosSelect from "../select/DepositosSelect";
import SucursalesSelect from "../select/SucursalesSelect";
import { Articulo } from "./types/articulo.type";
import useVerArticulosEnPedido from "./hooks/useVerArticulosEnPedido";
import NotFound from "@/assets/not-found/not-found.png";
import { useToast } from "@chakra-ui/react";

interface ArticulosComponentProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelect?: (articulo: any) => void;
}

export const ArticulosComponent = ({
  isOpen,
  setIsOpen,
  onSelect,
}: ArticulosComponentProps) => {
  const [busquedaDTO, setBusquedaDTO] = useState<BusquedaDTO>({
    busqueda: "",
    id_articulo: undefined,
    codigo_barra: undefined,
    deposito: undefined,
    stock: false,
    moneda: undefined,
    marca: undefined,
    categoria: undefined,
    ubicacion: undefined,
    proveedor: undefined,
    cod_interno: undefined,
    articulo: undefined,
  });

  const [articuloSeleccionado, setArticuloSeleccionado] =
    useState<Articulo | null>(null);

  const toast = useToast();

  const {
    setTermino,
    resultados: resultadosBusqueda,
    cargando: cargandoBusqueda,
    error: errorBusqueda,
  } = useBuscadorArticulos(busquedaDTO);
  const {
    articulosEnPedido,
    cargando: cargandoPedido,
    error: errorPedido,
  } = useVerArticulosEnPedido(articuloSeleccionado?.id_articulo ?? 0);

  // Maneja cambios en el campo de búsqueda
  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setTermino(valor);
    setBusquedaDTO((prev) => ({
      ...prev,
      busqueda: valor,
    }));
  };

  // Maneja cambios en los checkboxes y otros campos
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
          ? 1
          : undefined
        : value;

    setBusquedaDTO((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleDepositoChange = (depositoId: number | null) => {
    setBusquedaDTO((prev) => ({
      ...prev,
      deposito: depositoId ?? undefined, // Convertimos null a undefined
    }));
  };

  const handleSucursalChange = (sucursalId: number | null) => {
    setBusquedaDTO((prev) => ({
      ...prev,
      sucursal: sucursalId ?? undefined, // Convertimos null a undefined
    }));
  };

  const TablaArticulos = () => {
    return (
      <table className="w-full">
        <thead>
          <tr>
            <th>Código Int.</th>
            <th>Cód. de Barras</th>
            <th>Descripción</th>
            <th>Stock Lote</th>
            <th>P. Contado</th>
            <th>P. Crédito</th>
            <th>P. Mostrador</th>
            <th>Serie</th>
            <th>Lote</th>
            <th>Vencimiento</th>
            <th>Nro. Registro</th>
            <th>Proveedor</th>
            <th>ID Lote</th>
          </tr>
        </thead>
        <tbody>
          {resultadosBusqueda.map((resultado) => (
            <tr
              key={resultado.id_lote}
              onClick={() => setArticuloSeleccionado(resultado)}
            >
              <td>{resultado.id_articulo}</td>
              <td>{resultado.codigo_barra}</td>
              <td>{resultado.descripcion}</td>
              <td>{resultado.cantidad_lote}</td>
              <td>{resultado.precio_venta_guaranies}</td>
              <td>{resultado.precio_credito}</td>
              <td>{resultado.precio_mostrador}</td>
              <td>{resultado.lote}</td>
              <td>{resultado.lote}</td>
              <td>{resultado.vencimiento_lote}</td>
              <td>{resultado.id_articulo}</td>
              <td>{resultado.proveedor}</td>
              <td>{resultado.id_lote}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const ErrorTablaArticulos = () => {
    return (
      <div className="flex flex-col p-2 gap-2 bg-white rounded-md">
        <p className="text-md font-bold text-red-500">
          No se encontraron articulos
        </p>
      </div>
    );
  };

  const CargandoTablaArticulos = () => {
    return (
      <div className="flex flex-col p-2 gap-2 bg-white rounded-md">
        <p className="text-md font-bold">Cargando...</p>
      </div>
    );
  };

  const ErrorTablaArticulosEnPedido = () => {
    return (
      <div className="flex flex-col p-2 gap-2 bg-white rounded-md">
        <p className="text-md font-bold">
          Error al obtener articulos en pedido
        </p>
      </div>
    );
  };

  const CargandoTablaArticulosEnPedido = () => {
    return (
      <div className="flex flex-col p-2 gap-2 bg-white rounded-md">
        <p className="text-md font-bold">Cargando...</p>
      </div>
    );
  };

  const TablaArticulosEnPedido = () => {
    return (
      <table className="w-full">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {articulosEnPedido.map((articulo) => (
            <tr key={articulo.id_detalle_pedido}>
              <td>{articulo.fecha}</td>
              <td>{articulo.cliente}</td>
              <td>{articulo.cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const handleSeleccionarArticulo = () => {
    if (articuloSeleccionado) {
      setIsOpen(false);
      onSelect?.(articuloSeleccionado);
    } else {
      toast({
        title: "No se ha seleccionado ningun articulo",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      size="h-[calc(100vh-10rem)]"
      maxWidth="max-w-[calc(100vw-10rem)]"
      backgroundColor="bg-blue-100"
    >
      <div className="h-screen w-full flex flex-col gap-2">
        <div className="flex flex-row bg-white rounded-md p-2 gap-2">
          <div className="flex flex-row gap-2 flex-1">
            <label htmlFor="busqueda" className="text-md font-bold">
              Buscar:
            </label>
            <input
              value={busquedaDTO.busqueda}
              onChange={handleBusqueda}
              type="text"
              id="busqueda"
              className="w-full p-2 rounded-md border-2 border-gray-300 text-4xl font-bold focus:outline-none"
            />
          </div>
          <div className="flex flex-row gap-2 flex-1">
            <div className="flex flex-col gap-2 flex-1">
              <SucursalesSelect
                onChange={handleSucursalChange}
                value={busquedaDTO.sucursal}
              />
              <DepositosSelect
                onChange={handleDepositoChange}
                value={busquedaDTO.deposito}
              />
            </div>
            <div className="flex flex-col gap-1 ">
              <div className="border border-gray-200 rounded-md bg-orange-200 grid grid-cols-3 gap-2 p-2">
                <div className="flex flex-row gap-2">
                  <input
                    type="checkbox"
                    id="categoria"
                    onChange={handleChange}
                  />
                  <p className="text-md font-bold">Categoria</p>
                </div>
                <div className="flex flex-row gap-2">
                  <input type="checkbox" id="marca" onChange={handleChange} />
                  <p className="text-md font-bold">Marca</p>
                </div>
                <div className="flex flex-row gap-2">
                  <input
                    type="checkbox"
                    id="ubicacion"
                    onChange={handleChange}
                  />
                  <p className="text-md font-bold">Ubicacion</p>
                </div>
                <div className="flex flex-row gap-2">
                  <input
                    type="checkbox"
                    id="proveedor"
                    onChange={handleChange}
                  />
                  <p className="text-md font-bold">Proveedores</p>
                </div>
                <div className="flex flex-row gap-2">
                  <input
                    type="checkbox"
                    id="cod_interno"
                    onChange={handleChange}
                  />
                  <p className="text-md font-bold">Articulos</p>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="bg-white flex flex-col  ">
                <div className="flex flex-row gap-2">
                  <input type="checkbox" />
                  <p className="text-md font-bold">Busc. Por Marca de Origen</p>
                </div>
                <div className="flex flex-row gap-2">
                  <input type="checkbox" />
                  <p className="text-md font-bold">Mostrar todos los items</p>
                </div>
                <div className="flex flex-row gap-2">
                  <input type="checkbox" />
                  <p className="text-md font-bold">Stock &lt; 0</p>
                </div>
              </div>
              <div className="bg-white flex flex-col  ">
                <div className="flex flex-row gap-2">
                  <input type="checkbox" />
                  <p className="text-md font-bold">
                    Busqueda por codigo interno
                  </p>
                </div>
                <div className="flex flex-row gap-2">
                  <input type="checkbox" />
                  <p className="text-md font-bold">Busqueda por lote</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*TABLA DE ARTICULOS */}
        <div className="flex flex-col p-2 gap-2 bg-white rounded-md">
          {cargandoBusqueda ? (
            <CargandoTablaArticulos />
          ) : errorBusqueda ? (
            <ErrorTablaArticulos />
          ) : (
            <TablaArticulos />
          )}
        </div>

        {/*Componentes varios */}
        <div className="flex flex-row gap-2 p-2 rounded-md bg-white">
          {/*Informacion del producto */}
          <div className="flex flex-row gap-2">
            <div className="flex flex-col gap-2 [&>p]:font-bold">
              <p>Proveedor: {articuloSeleccionado?.proveedor ?? ""}</p>
              <p>Lab./Marca: {articuloSeleccionado?.marca ?? ""}</p>
              <p>
                Principio Activo: {articuloSeleccionado?.principio_activo ?? ""}
              </p>
              <p>Cant. por Caja: {articuloSeleccionado?.cantidad_caja ?? ""}</p>
              <p>P. Sugerido: {articuloSeleccionado?.precio_sugerido}</p>
            </div>
            <div className="flex flex-col gap-2 [&>p]:font-bold">
              <p>
                Fecha últ. Venta:{" "}
                {articuloSeleccionado?.fecha_ultima_venta ?? ""}
              </p>
              <p>
                Fecha últ. Compra:{" "}
                {articuloSeleccionado?.fecha_ultima_compra ?? ""}
              </p>
              <p>Presentación: {articuloSeleccionado?.presentacion ?? ""}</p>
              <p>Ubicación: {articuloSeleccionado?.ubicacion ?? ""}</p>
              <p>Sub. Ubicación: {articuloSeleccionado?.sub_ubicacion ?? ""}</p>
            </div>
          </div>
          {/*Tabla de articulos en pedidos */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <p className="text-md font-bold">
                Cantidad de articulos en pedido: {articulosEnPedido.length}{" "}
              </p>{" "}
              <div className="p-2 w-2 h-2 border border-gray-300 bg-white rounded-md items-center" />
              <p className="text-md font-bold">
                Cantidad de articulos en remision: {articulosEnPedido.length}{" "}
              </p>
              <div className="p-2 w-2 h-2 bg-purple-500 rounded-md" />
            </div>
            {cargandoPedido ? (
              <CargandoTablaArticulosEnPedido />
            ) : errorPedido ? (
              <ErrorTablaArticulosEnPedido />
            ) : (
              <TablaArticulosEnPedido />
            )}
          </div>
          {/*Foto del articulo */}
          <div className="flex flex-col gap-2">
            <img
              src={NotFound}
              alt="Foto del articulo"
              className="w-56 h-56 object-cover"
            />
            <p className="text-md font-bold">Foto del articulo no disponible</p>
          </div>
          {/*Botones de accion y leyebdas*/}
          <div className="flex flex-col gap-2">
            <div className="border border-gray-300 rounded-md p-2">
              <div className="flex flex-row gap-2 p-2 items-center">
                <p>Lote Vencido o proximo a vencer</p>
                <div className="p-2 w-2 h-2 bg-red-400 rounded-md" />
              </div>
              <div className="flex flex-row gap-2 p-2 items-center">
                <p>Lote vence en más de 120 dias</p>
                <div className="p-2 w-2 h-2 bg-yellow-400 rounded-md" />
              </div>
              <div className="flex flex-row gap-2 p-2 items-center">
                <p>Registrado en pre-compra</p>
                <div className="p-2 w-2 h-2 bg-cyan-400 rounded-md" />
              </div>
            </div>
            <div className="border border-gray-300 rounded-md p-2 flex flex-row gap-2">
              <button className="bg-orange-400 text-white p-2 rounded-md">
                Limpiar Filtros
              </button>
              <button
                className="bg-blue-500 text-white p-2 rounded-md"
                onClick={handleSeleccionarArticulo}
              >
                Seleccionar articulo
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
