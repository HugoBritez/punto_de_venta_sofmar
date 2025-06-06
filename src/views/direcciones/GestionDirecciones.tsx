import { useEffect, useState } from "react";
import {
  UbicacionDTO,
  AgrupacionDTO,
  ItemsPorDireccionDTO,
  Ubicacion,
} from "./types/ubicaciones.type";
import { useDirecciones } from "./hooks/useDirecciones";
import { Boxes, Plus } from "lucide-react";
import { useToast } from "@chakra-ui/react";
import { useItemsPorDireccion } from "./hooks/useItemsPorDireccion";
import Modal from "@/shared/ui/modal/Modal";
import { BuscadorArticulos } from "@/shared/ui/buscador_articulos/BuscadorArticulos";
import { Articulo } from "@/shared/ui/buscador_articulos/types/articulo";
import DireccionesRotulo from "./DireccionesRotulo";
import { createRoot } from "react-dom/client";

const GestionDirecciones = () => {
  const toast = useToast();
  const {
    ubicaciones,
    ubicacionesAgrupadas,
    loading,
    errorCrearUbicacion,
    errorAgruparDirecciones,
    loadingAgrupaciones,
    errorAgrupaciones,
    errorEliminarDireccion,
    successEliminarDireccion,
    obtenerUbicaciones,
    crearUbicaciones,
    agruparDirecciones,
    getUbicacionesAgrupadas,
    eliminarDireccion,
  } = useDirecciones();
  const {
    itemsPorDireccion,
    obtenerItemsPorDireccion,
    crearItemsPorDireccion,
    errorCrearItemsPorDireccion,
    errorEliminarItemsPorDireccion,
    eliminarItemsPorDireccion,
  } = useItemsPorDireccion();
  const [ubicacionDTO, setUbicacionDTO] = useState<UbicacionDTO>({
    d_calle_inicial: "",
    d_calle_final: "",
    d_predio_inicial: 0,
    d_predio_final: 0,
    d_piso_inicial: 0,
    d_piso_final: 0,
    d_direccion_inicial: 0,
    d_direccion_final: 0,
    d_estado: 1,
    d_tipo_direccion: 1,
  });

  const [ubicacionAgrupadaDTO, setUbicacionAgrupadaDTO] =
    useState<AgrupacionDTO>({
      rango: {
        d_calle_inicial: "",
        d_calle_final: "",
        d_predio_inicial: 0,
        d_predio_final: 0,
        d_piso_inicial: 0,
        d_piso_final: 0,
        d_direccion_inicial: 0,
        d_direccion_final: 0,
      },
      zona: 0,
    });

  const [itemsPorDireccionDTO, ] =
    useState<ItemsPorDireccionDTO>({
      rango: {
        d_calle_inicial: "",
        d_calle_final: "",
        d_predio_inicial: 0,
        d_predio_final: 0,
        d_piso_inicial: 0,
        d_piso_final: 0,
        d_direccion_inicial: 0,
        d_direccion_final: 0,
      },
      lote: "",
      articulo: 0,
    });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDirecciones, setSelectedDirecciones] = useState<Ubicacion[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setUbicacionDTO({
      ...ubicacionDTO,
      [name]:
        type === "radio"
          ? Number(value)
          : type === "number"
          ? value === "" ? 0 : Number(value)
          : name === "d_calle_inicial" || name === "d_calle_final"
          ? value.toUpperCase()
          : value,
    });
  };

  const handleSeleccionarArticulo = (articulo: Articulo) => {
    if (selectedDirecciones.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos una dirección",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    selectedDirecciones.forEach(direccion => {
      const nuevoDTO: ItemsPorDireccionDTO = {
        articulo: articulo.id_articulo,
        rango: convertirUbicacionADTO(direccion)
      };
      crearItemsPorDireccion(nuevoDTO);
    });

    setIsOpen(false);
    setTimeout(async () => {
      await obtenerItemsPorDireccion();
    }, 500);
  };

  useEffect(() => {
    obtenerUbicaciones();
    obtenerItemsPorDireccion();
  }, []);

  useEffect(() => {
    if (ubicacionAgrupadaDTO.zona) {
      getUbicacionesAgrupadas("", ubicacionAgrupadaDTO.zona);
    }
  }, [ubicacionAgrupadaDTO.zona]);

  const handleBusquedaUbicaciones = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    obtenerUbicaciones(value);
  };

  const handleBusquedaUbicacionesAgrupadas = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    getUbicacionesAgrupadas(value, ubicacionAgrupadaDTO.zona);
  };

  const handleBuscarItemsPorDireccion = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const rangoCompleto: UbicacionDTO = {
      ...itemsPorDireccionDTO.rango,
      d_tipo_direccion: 1,
      d_estado: 1,
    };
    obtenerItemsPorDireccion(rangoCompleto, value);
  };

  const handleChangeAgrupacion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (name.startsWith("d_")) {
      setUbicacionAgrupadaDTO({
        ...ubicacionAgrupadaDTO,
        rango: {
          ...ubicacionAgrupadaDTO.rango,
          [name]:
            type === "number"
              ? Number(value)
              : name === "d_calle_inicial" || name === "d_calle_final"
              ? value.toUpperCase()
              : value,
        },
      });
    } else if (name === "zona") {
      setUbicacionAgrupadaDTO({
        ...ubicacionAgrupadaDTO,
        zona: Number(value),
      });
    }
  };


  const handleCrearUbicacion = async () => {
    try {
      await crearUbicaciones(ubicacionDTO);
      // Limpiar el formulario después de crear
      setUbicacionDTO({
        d_calle_inicial: "",
        d_calle_final: "",
        d_predio_inicial: 0,
        d_predio_final: 0,
        d_piso_inicial: 0,
        d_piso_final: 0,
        d_direccion_inicial: 0,
        d_direccion_final: 0,
        d_estado: 1,
        d_tipo_direccion: 1,
      });
      // Esperar un momento para asegurar que la creación se complete
      setTimeout(async () => {
        await obtenerUbicaciones();
      }, 500);
    } catch (error) {
      console.error("Error al crear ubicación:", error);
    }
  };

  useEffect(() => {
    if (errorCrearUbicacion) {
      toast({
        title: "Error",
        description: errorCrearUbicacion,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [errorCrearUbicacion]);

  useEffect(() => {
    if (errorAgruparDirecciones) {
      toast({
        title: "Error",
        description: errorAgruparDirecciones,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [errorAgruparDirecciones]);

  useEffect(() => {
    if (errorCrearItemsPorDireccion) {
      toast({
        title: "Error",
        description: errorCrearItemsPorDireccion,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [errorCrearItemsPorDireccion]);

  useEffect(() => {
    if (errorEliminarItemsPorDireccion) {
      toast({
        title: "Error",
        description: errorEliminarItemsPorDireccion,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [errorEliminarItemsPorDireccion]);

  useEffect(() => {
    if (errorEliminarDireccion) {
      toast({
        title: "Error",
        description: errorEliminarDireccion,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [errorEliminarDireccion]);

  useEffect(() => {
    if (successEliminarDireccion) {
      toast({
        title: "Success",
        description: successEliminarDireccion,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [successEliminarDireccion]);

  const handleAgruparDirecciones = async () => {
    try {
      const zonaActual = ubicacionAgrupadaDTO.zona;
      await agruparDirecciones(ubicacionAgrupadaDTO);
      // Limpiar el formulario después de crear
      setUbicacionAgrupadaDTO({
        rango: {
          d_calle_inicial: "",
          d_calle_final: "",
          d_predio_inicial: 0,
          d_predio_final: 0,
          d_piso_inicial: 0,
          d_piso_final: 0,
          d_direccion_inicial: 0,
          d_direccion_final: 0,
        },
        zona: 0,
      });
      // Esperar un momento para asegurar que la creación se complete
      setTimeout(async () => {
        await getUbicacionesAgrupadas("", zonaActual);
      }, 500);
    } catch (error) {
      console.error("Error al agrupar direcciones:", error);
    }
  };
  
  const ComponenteRotulo = (
    datos: Omit<UbicacionDTO, 'd_tipo_direccion' | 'd_estado'>
  ) =>{
    const rotulosDiv = document.createElement('div');
    rotulosDiv.style.display = 'none';
    document.body.appendChild(rotulosDiv);

    const root = createRoot(rotulosDiv);
    root.render(
      <DireccionesRotulo
        data={datos}
        action="print"
      />
    )

    setTimeout(() => {
      root.unmount();
      document.body.removeChild(rotulosDiv);
    }, 2000);
  }

  const handleDireccionSelection = (direccion: Ubicacion) => {
    if (!direccion) return;

    setSelectedDirecciones(prev => {
      const exists = prev.some(d => 
        d && d.d_calle === direccion.d_calle && 
        d.d_predio === direccion.d_predio && 
        d.d_piso === direccion.d_piso && 
        d.d_direccion === direccion.d_direccion
      );
      
      if (exists) {
        return prev.filter(d => 
          d && !(d.d_calle === direccion.d_calle && 
            d.d_predio === direccion.d_predio && 
            d.d_piso === direccion.d_piso && 
            d.d_direccion === direccion.d_direccion)
        );
      } else {
        return [...prev, direccion];
      }
    });
  };

  const convertirUbicacionADTO = (ubicacion: Ubicacion): Omit<UbicacionDTO, 'd_tipo_direccion' | 'd_estado'> => {
    return {
      d_calle_inicial: ubicacion.d_calle,
      d_calle_final: ubicacion.d_calle,
      d_predio_inicial: ubicacion.d_predio,
      d_predio_final: ubicacion.d_predio,
      d_piso_inicial: ubicacion.d_piso,
      d_piso_final: ubicacion.d_piso,
      d_direccion_inicial: ubicacion.d_direccion,
      d_direccion_final: ubicacion.d_direccion
    };
  };

  const obtenerArticulosDeDireccionesSeleccionadas = async () => {
    if (selectedDirecciones.length === 0) {
      await obtenerItemsPorDireccion();
      return;
    }

    const articulosPromises = selectedDirecciones.map(direccion => {
      const dto = convertirUbicacionADTO(direccion);
      return obtenerItemsPorDireccion({
        ...dto,
        d_tipo_direccion: 1,
        d_estado: 1
      });
    });
    
    await Promise.all(articulosPromises);
  };

  useEffect(() => {
    obtenerArticulosDeDireccionesSeleccionadas();
  }, [selectedDirecciones]);

  return (
    <div className="flex flex-col gap-2 bg-gray-100 h-screen p-2">
      <div className="flex items-center gap-2 p-2 bg-blue-500 rounded-md ">
        <Boxes size={36} color="white" />
        <p className="text-white font-bold text-2xl">Gestion de Direcciones</p>
      </div>
      {/* FORM DE CREACION DE DIRECCIONES */}
      <div className="flex flex-col gap-2 border-4 border-gray-300 rounded-md p-2 bg-white ">
        <p className="font-bold text-xl ">
          Formulario de creacion de direcciones
        </p>
        <div className="flex flex-row gap-2">
          {/* TABLA DE DEFINICION DE DIRECCIONES */}
          <div className="flex flex-col">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2"></th>
                  <th className="border border-gray-300 px-4 py-2">CALLE</th>
                  <th className="border border-gray-300 px-4 py-2">ESTANTE</th>
                  <th className="border border-gray-300 px-4 py-2">PISO</th>
                  <th className="border border-gray-300 px-4 py-2">
                    DIRECCION
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    Inicial
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      name="d_calle_inicial"
                      value={ubicacionDTO.d_calle_inicial}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="d_predio_inicial"
                      value={ubicacionDTO.d_predio_inicial}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="d_piso_inicial"
                      value={ubicacionDTO.d_piso_inicial}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="d_direccion_inicial"
                      value={ubicacionDTO.d_direccion_inicial}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    Final
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      name="d_calle_final"
                      value={ubicacionDTO.d_calle_final}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="d_predio_final"
                      value={ubicacionDTO.d_predio_final}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="d_piso_final"
                      value={ubicacionDTO.d_piso_final}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="d_direccion_final"
                      value={ubicacionDTO.d_direccion_final}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2">
            <table className="border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="border border-gray-300 px-4 py-2 text-left"
                    colSpan={2}
                  >
                    Tipo de dirección
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    Dir. Items por caja
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="d_tipo_direccion"
                      value={1}
                      checked={ubicacionDTO.d_tipo_direccion === 1}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    Dir. items fraccionados
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="d_tipo_direccion"
                      value={2}
                      checked={ubicacionDTO.d_tipo_direccion === 2}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    Dir. de reserva
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="d_tipo_direccion"
                      value={3}
                      checked={ubicacionDTO.d_tipo_direccion === 3}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* LISTADO DE DIRECCIONES*/}
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[200px]">
            <table className="border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="border border-gray-300 px-4 py-2 text-left"
                    colSpan={2}
                  >
                    Lista de direcciones creadas
                  </th>
                  <th className="border border-gray-300 px-4 py-2" colSpan={2}>
                    <input
                      type="text"
                      placeholder="Buscar dirección"
                      onChange={handleBusquedaUbicaciones}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : !ubicaciones || ubicaciones.length === 0 ? (
                  <tr>
                    <td
                      className="border border-gray-300 px-4 py-2 text-center text-gray-500"
                      colSpan={5}
                    >
                      No hay direcciones creadas
                    </td>
                  </tr>
                ) : (
                  ubicaciones.map((ubicacion, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion?.d_calle || ""}
                      </td> 
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion?.d_predio || "0"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion?.d_piso || "0"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion?.d_direccion || "0"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/*BOTONES Y FUNCIONES */}
          <div className="flex flex-col gap-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={handleCrearUbicacion}
            >
              Crear dirección
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md"
              onClick={() => eliminarDireccion(ubicacionDTO)}
            >
              Eliminar dirección
            </button>
          </div>
        </div>
      </div>
      {/* FORMULARIO DE AGRUPACION DE DIRECCIONES */}
      <div className="flex flex-col gap-2 border-4 border-gray-300 rounded-md p-2 bg-white ">
        <p className="font-bold text-xl ">
          Formulario de agrupacion de direcciones
        </p>
        <div className="flex flex-row gap-2">
          <div className="flex flex-col">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2"></th>
                  <th className="border border-gray-300 px-4 py-2">CALLE</th>
                  <th className="border border-gray-300 px-4 py-2">ESTANTE</th>
                  <th className="border border-gray-300 px-4 py-2">PISO</th>
                  <th className="border border-gray-300 px-4 py-2">
                    DIRECCION
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    Inicial
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      name="d_calle_inicial"
                      value={ubicacionAgrupadaDTO.rango.d_calle_inicial}
                      onChange={handleChangeAgrupacion}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="d_predio_inicial"
                      value={ubicacionAgrupadaDTO.rango.d_predio_inicial}
                      onChange={handleChangeAgrupacion}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="d_piso_inicial"
                      value={ubicacionAgrupadaDTO.rango.d_piso_inicial}
                      onChange={handleChangeAgrupacion}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="d_direccion_inicial"
                      value={ubicacionAgrupadaDTO.rango.d_direccion_inicial}
                      onChange={handleChangeAgrupacion}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    Final
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      name="d_calle_final"
                      value={ubicacionAgrupadaDTO.rango.d_calle_final}
                      onChange={handleChangeAgrupacion}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="d_predio_final"
                      value={ubicacionAgrupadaDTO.rango.d_predio_final}
                      onChange={handleChangeAgrupacion}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="d_piso_final"
                      value={ubicacionAgrupadaDTO.rango.d_piso_final}
                      onChange={handleChangeAgrupacion}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="d_direccion_final"
                      value={ubicacionAgrupadaDTO.rango.d_direccion_final}
                      onChange={handleChangeAgrupacion}
                      min="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2">
            <table className="border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="border border-gray-300 px-4 py-2 text-left"
                    colSpan={2}
                  >
                    Tipo de zona
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">ZONA AA</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="zona"
                      value={1}
                      checked={ubicacionAgrupadaDTO.zona === 1}
                      onChange={handleChangeAgrupacion}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">ZONA A</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="zona"
                      value={2}
                      checked={ubicacionAgrupadaDTO.zona === 2}
                      onChange={handleChangeAgrupacion}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">ZONA B</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="zona"
                      value={3}
                      checked={ubicacionAgrupadaDTO.zona === 3}
                      onChange={handleChangeAgrupacion}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">ZONA C</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="zona"
                      value={4}
                      checked={ubicacionAgrupadaDTO.zona === 4}
                      onChange={handleChangeAgrupacion}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">ZONA D</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="radio"
                      name="zona"
                      value={5}
                      checked={ubicacionAgrupadaDTO.zona === 5}
                      onChange={handleChangeAgrupacion}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* LISTADO DE DIRECCIONES*/}
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[250px]">
            <table className="border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="border border-gray-300 px-4 py-2 text-left"
                    colSpan={2}
                  >
                    Lista de direcciones en esta zona
                  </th>
                  <th className="border border-gray-300 px-4 py-2" colSpan={2}>
                    <input
                      type="text"
                      placeholder="Buscar dirección"
                      onChange={handleBusquedaUbicacionesAgrupadas}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingAgrupaciones ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : errorAgrupaciones ? (
                  <tr>
                    <td colSpan={5} className="text-center text-red-500 p-4">
                      Error al cargar las ubicaciones agrupadas:{" "}
                      {errorAgrupaciones}
                    </td>
                  </tr>
                ) : !ubicacionesAgrupadas ||
                  ubicacionesAgrupadas.length === 0 ? (
                  <tr>
                    <td
                      className="border border-gray-300 px-4 py-2 text-center text-gray-500"
                      colSpan={5}
                    >
                      No hay direcciones en esta zona
                    </td>
                  </tr>
                ) : (
                  ubicacionesAgrupadas.map((ubicacion, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion?.d_calle || ""}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion?.d_predio || ""}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion?.d_piso || ""}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion?.d_direccion || ""}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {ubicacion?.d_tipo_direccion || ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/*BOTONES Y FUNCIONES */}
          <div className="flex flex-col gap-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={handleAgruparDirecciones}
            >
              Agrupar direcciones
            </button>
          </div>
        </div>
      </div>

      
      {/*FORMULARIO PARA RELACIONAR ITEMS CON SUS RESPECTIVA UBICACIONES */}
      <div className="flex flex-col gap-2 border-4 border-gray-300 rounded-md p-2 bg-white ">
        <p className="font-bold text-xl ">Formulario de items en direcciones</p>
        <div className="flex flex-row gap-2">
          <div className="flex flex-col w-1/2">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Seleccionar Direcciones</h3>
                <input
                  type="text"
                  placeholder="Buscar dirección"
                  onChange={handleBusquedaUbicaciones}
                  className="w-1/2 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="border border-gray-300 rounded-md p-2 max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : !ubicaciones || ubicaciones.length === 0 ? (
                  <p className="text-center text-gray-500 p-4">No hay direcciones disponibles</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {ubicaciones.map((ubicacion, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDirecciones.some(d => 
                            d && d.d_calle === ubicacion.d_calle && 
                            d.d_predio === ubicacion.d_predio && 
                            d.d_piso === ubicacion.d_piso && 
                            d.d_direccion === ubicacion.d_direccion
                          )}
                          onChange={() => handleDireccionSelection(ubicacion)}
                          className="w-4 h-4 text-blue-500 cursor-pointer"
                        />
                        <span className="flex-1">
                          {ubicacion && `${ubicacion.d_calle} - Estante: ${ubicacion.d_predio} - Piso: ${ubicacion.d_piso} - Dirección: ${ubicacion.d_direccion}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-row gap-2 justify-center items-center mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md"
                onClick={() => {
                  selectedDirecciones.forEach(direccion => 
                    eliminarItemsPorDireccion(convertirUbicacionADTO(direccion), itemsPorDireccionDTO.articulo)
                  );
                  setSelectedDirecciones([]);
                }}
              >
                <p className="text-white font-bold">
                  Eliminar items de direcciones seleccionadas
                </p>
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={() => {
                  selectedDirecciones.forEach(direccion => 
                    ComponenteRotulo(convertirUbicacionADTO(direccion))
                  );
                }}
              >
                <p className="text-white font-bold">
                  Generar rótulos para direcciones seleccionadas
                </p>
              </button>
            </div>
          </div>

          {/* LISTADO DE DIRECCIONES*/}
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[400px]">
            <table className="border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="border border-gray-300 px-4 py-2 text-left"
                    colSpan={2}
                  >
                    Lista de items por zona
                  </th>
                  <th className="border border-gray-300 px-4 py-2" colSpan={2}>
                    <input
                      type="text"
                      placeholder="Buscar items por nombre o codigo de barras"
                      onChange={handleBuscarItemsPorDireccion}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {itemsPorDireccion.length > 0 ? (
                  itemsPorDireccion.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {item.cod_barras || ""}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.descripcion || ""}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.direccion_completa || ""}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.zona || ""}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="hover:bg-gray-50">
                    <td
                      className="border border-gray-300 px-4 py-2 text-center text-gray-500"
                      colSpan={5}
                    >
                      No hay items en esta zona
                    </td>
                  </tr>
                )}
                <tr>
                  <td
                    className="px-4 py-2 text-center text-gray-500 items-center justify-center hover:bg-gray-50"
                    colSpan={5}
                  >
                    <div className="flex flex-row gap-2 items-center justify-center">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md flex flex-row gap-2 items-center justify-center"
                        onClick={() => {
                          if (selectedDirecciones.length === 0) {
                            toast({
                              title: "Error",
                              description: "Debe seleccionar al menos una dirección",
                              status: "error",
                              duration: 5000,
                              isClosable: true,
                            });
                            return;
                          }
                          setIsOpen(true);
                        }}
                      >
                        <div className="flex flex-row gap-2 items-center justify-center">
                          Insertar items <Plus size={20} />
                        </div>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Insertar items en direcciones"
        maxWidth="max-w-4xl"
        children={
          <div className="flex flex-col gap-2 h-[400px] w-full overflow-y-auto">
            <BuscadorArticulos
              onSeleccionarArticulo={handleSeleccionarArticulo}
              placeholder="Buscar articulo"
              stock={true}
              moneda={1}
            />
            <div className="flex flex-col gap-2 justify-center items-center">
              <p className="text-md text-gray-500">
                Seleccione el articulo que desea insertar en las direcciones
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default GestionDirecciones;
