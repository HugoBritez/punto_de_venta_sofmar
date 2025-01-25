import HeaderComponent from "@/modules/Header";
import { Deposito, SubUbicacion, Ubicacion } from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import {
  Flex,
  FormLabel,
  Input,
  Select,
  Button,
  RadioGroup,
  Radio,
  Checkbox,
  Divider,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { ArchiveRestore, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

interface ArticulosCategoria {
  id: number;
  nombre: string;
  cantidad_articulos: number;
  selected?: boolean;
}

interface ArticulosDirecta {
  id: number;
  descripcion: string;
}

interface ItemsParaTomaInventario {
  descripcion: string;
  stock: number;
  ubicacion: number;
  sub_ubicacion: number;
  vencimiento: string;
  lote: string;
  lote_id: number;
  codigo_barra: string;
}


interface FloatingCardProps {
  isVisible: boolean;

  items: any[];
  onClose: () => void;
  onSelect: (item: any) => void;
}

const FloatingCard = ({
  isVisible,
  items,
  onClose,
  onSelect,
}: FloatingCardProps) => {
  return (
    <div
      className={`absolute z-50 bg-white shadow-lg rounded-md border border-gray-200 p-4 w-full min-h-[100px] max-h-[200px] overflow-y-auto mt-4
        transition-all duration-400 ease-out origin-top
        ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
    >
      <div className="flex justify-end items-center mb-2">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          ✕
        </button>
      </div>
      <div className="divide-y">
        {items.length === 0 ? (
          <div className="py-2 px-1">
            <p className="text-center text-gray-500 font-semibold">
              No se encontraron artículos.
            </p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className="py-2 px-1 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
              onClick={() => onSelect(item)}
            >
              <p>{item.nombre || item.descripcion}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const NuevaTomaInventario = () => {
  const [fechaActual, setFechaActual] = useState(new Date());

  const [depositos, setDepositos] = useState<Deposito[] | null>(null);
  const [depositoSeleccionado, setDepositoSeleccionado] =
    useState<Deposito | null>(null);

  const [nroInventario, setNroInventario] = useState<number | null>(null);

  const [tipoInventario, setTipoInventario] = useState<string>("1");

  const [articulosCategoria, setArticulosCategoria] = useState<
    ArticulosCategoria[] | null
  >(null);

  const [articulosDirecta, setArticulosDirecta] = useState<
    ArticulosDirecta[] | null
  >(null);

  const [articuloBuscado, setArticuloBuscado] = useState<string | null>(null);
  const [articuloSeleccionado, setArticuloSeleccionado] =
    useState<ArticulosDirecta | null>(null);

  const [isFloatingCardVisible, setIsFloatingCardVisible] = useState(false);

  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    number[]
  >([]);

const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<Ubicacion | null>(null);
const [subUbicaciones, setSubUbicaciones] = useState<SubUbicacion[]>([]);
const [subUbicacionSeleccionada, setSubUbicacionSeleccionada] = useState<SubUbicacion | null>(null);
const [itemsParaTomaInventario, setItemsParaTomaInventario] = useState<ItemsParaTomaInventario[]>([]);
const [itemsParaTomaInventarioConScanner, setItemsParaTomaInventarioConScanner] = useState<ItemsParaTomaInventario[]>([]);


  const toast = useToast();

  const fetchUbicaciones = async () => {
    const response = await axios.get(`${api_url}ubicaciones/`);
    setUbicaciones(response.data.body);
    setUbicacionSeleccionada(response.data.body[0]);
  };

  const fetchSubUbicaciones = async () => {
    const response = await axios.get(`${api_url}sububicaciones/`);
    setSubUbicaciones(response.data.body);
    setSubUbicacionSeleccionada(response.data.body[0]);
  };


  useEffect(() => {
    fetchUbicaciones();
    fetchSubUbicaciones();
  }, []);


const fetchItemsParaTomaInventario = async () => {

  console.log(
    "estos son los datos",
    depositoSeleccionado,
    articuloSeleccionado,
    ubicacionSeleccionada,
    subUbicacionSeleccionada,
    categoriasSeleccionadas

  );

  // Validación según el tipo de inventario
  if (tipoInventario === "1" && categoriasSeleccionadas.length === 0) {
    toast({
      title: "Error",
      description: "Debe seleccionar al menos una categoría",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  if (tipoInventario === "2" && !articuloSeleccionado) {
    toast({
      title: "Error",
      description: "Debe seleccionar un artículo",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  if (tipoInventario === "3" && (!ubicacionSeleccionada || !subUbicacionSeleccionada)) {
    toast({
      title: "Error",
      description: "Debe ingresar ubicación y sub-ubicación",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  if (!depositoSeleccionado) {
    toast({
      title: "Error",
      description: "Debe seleccionar un depósito",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  try {
    const response = await axios.get(
      `${api_url}articulos/toma-inventario-items`,
      {
        params: {
          deposito_id: depositoSeleccionado?.dep_codigo,
          articulo_id: tipoInventario === "2" ? articuloSeleccionado?.id : null,
          ubicacion: tipoInventario === "3" ? ubicacionSeleccionada?.ub_codigo : null,
          sub_ubicacion: tipoInventario === "3" ? subUbicacionSeleccionada?.s_codigo : null,
          categorias: tipoInventario === "1" ? categoriasSeleccionadas : null,
        },
      }
    );
    console.log("response", response.data.body);
    setItemsParaTomaInventario(response.data.body);
    if(response.data.body.length === 0){
      toast({
        title: "Informacion",
        description: "No se encontraron items para toma inventario",
        status: "info",
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Error al obtener items para toma inventario",
      status: "error",
      duration: 3000,
    });
  }
};

const fetchItemsParaTomaInventarioConScanner = async () => {
  console.log(
    "estos son los datos",
    depositoSeleccionado,
    articuloSeleccionado,
    ubicacionSeleccionada,
    subUbicacionSeleccionada,
    categoriasSeleccionadas
  );

  // Validación según el tipo de inventario
  if (tipoInventario === "1" && categoriasSeleccionadas.length === 0) {
    toast({
      title: "Error",
      description: "Debe seleccionar al menos una categoría",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  if (tipoInventario === "2" && !articuloSeleccionado) {
    toast({
      title: "Error",
      description: "Debe seleccionar un artículo",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  if (
    tipoInventario === "3" &&
    (!ubicacionSeleccionada || !subUbicacionSeleccionada)
  ) {
    toast({
      title: "Error",
      description: "Debe ingresar ubicación y sub-ubicación",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  if (!depositoSeleccionado) {
    toast({
      title: "Error",
      description: "Debe seleccionar un depósito",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  try {
    const response = await axios.get(
      `${api_url}articulos/toma-inventario-scanner`,
      {
        params: {
          deposito_id: depositoSeleccionado?.dep_codigo,
          articulo_id: tipoInventario === "2" ? articuloSeleccionado?.id : null,
          ubicacion:
            tipoInventario === "3" ? ubicacionSeleccionada?.ub_codigo : null,
          sub_ubicacion:
            tipoInventario === "3" ? subUbicacionSeleccionada?.s_codigo : null,
          categorias: tipoInventario === "1" ? categoriasSeleccionadas : null,
        },
      }
    );
    console.log("response", response.data.body);
    setItemsParaTomaInventarioConScanner(response.data.body);
    if (response.data.body.length === 0) {
      toast({
        title: "Informacion",
        description: "No se encontraron items para toma inventario",
        status: "info",
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Error al obtener items para toma inventario",
      status: "error",
      duration: 3000,
    });
  }
};



  const handleCategoriaSelect = (categoriaId: number) => {
    setCategoriasSeleccionadas((prevSelected) => {
      if (prevSelected.includes(categoriaId)) {
        return prevSelected.filter((id) => id !== categoriaId);
      } else {
        return [...prevSelected, categoriaId];
      }

    });
  };

  const handleSelectAllCategorias = (checked: boolean) => {
    if (checked) {
      const todasLasCategorias = articulosCategoria?.map((cat) => cat.id) || [];
      setCategoriasSeleccionadas(todasLasCategorias);
    } else {
      setCategoriasSeleccionadas([]);
    }
  };

  const fetchArticulosCategoria = async () => {
    const response = await axios.get(
      `${api_url}articulos/categorias-articulos`
    );
    setArticulosCategoria(response.data.body);
  };

  const fetchArticulosDirecta = async (busqueda: string) => {
    try {
      const response = await axios.get(`${api_url}articulos/directa`, {
        params: {
          busqueda,
          deposito: depositoSeleccionado?.dep_codigo,
        },
      });
      setArticulosDirecta(response.data.body);
    } catch (error) {
    }
  };

  const fetchDepositos = async () => {
    const response = await axios.get(`${api_url}depositos/`);
    setDepositos(response.data.body);
    setDepositoSeleccionado(response.data.body[0]);
  };

  const traerIdUltimoInventario = async () => {
    try {
      const response = await axios.get(
        `${api_url}articulos/ultimo-nro-inventario`
      );
      const data = response.data;

      if (data.body && data.body.length > 0) {
        setNroInventario(data.body[0].nro_inventario);
      }
    } catch (error) {
      console.error("Error al obtener último número de inventario:", error);
    }
  };

  useEffect(() => {
    fetchDepositos();
    traerIdUltimoInventario();
  }, []);

  useEffect(() => {
    if (tipoInventario === "1") {
      fetchArticulosCategoria();
    }
    setArticuloBuscado(null);
  }, [tipoInventario]);

  const handleArticuloInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const valor = e.target.value;
    setArticuloBuscado(valor);
    setArticuloSeleccionado(null);

    if (valor.length >= 3) {
      fetchArticulosDirecta(valor);
      setIsFloatingCardVisible(true);
    } else {
      setArticulosDirecta(null);
      setIsFloatingCardVisible(false);
    }
  };

  const handleArticuloSelect = (articulo: ArticulosDirecta) => {
    setArticuloSeleccionado(articulo);
    setArticuloBuscado(articulo.descripcion);
    setIsFloatingCardVisible(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (articuloBuscado && articuloBuscado.length >= 3) {
        fetchArticulosDirecta(articuloBuscado);
      }
    }, 300); // espera 300ms después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId);
  }, [articuloBuscado]);

  // Agregar manejo de teclas
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFloatingCardVisible(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <Flex
      bg={"gray.100"}
      h={"100vh"}
      display={"flex"}
      flexDirection={"column"}
      p={2}
      gap={2}
    >
      <HeaderComponent
        Icono={ArchiveRestore}
        titulo="Inventario de articulos"
      />
      <div className="flex flex-row gap-4 border border-gray-300 rounded-md p-2 bg-white justify-between ">
        <div className="flex flex-col gap-2">
          {" "}
          <div className="flex flex-row gap-2 items-center">
            <FormLabel className="w-24">Fecha:</FormLabel>
            <Input
              type="date"
              className="w-36"
              value={fechaActual.toISOString().split("T")[0]}
              onChange={(e) => setFechaActual(new Date(e.target.value))}
            />
          </div>
          <div className="flex flex-row gap-2 items-center">
            <FormLabel className="w-24">Deposito:</FormLabel>
            <Select
              name=""
              id=""
              className="w-36"
              value={depositoSeleccionado?.dep_codigo}
              onChange={(e) =>
                setDepositoSeleccionado(
                  depositos?.find(
                    (deposito) =>
                      deposito.dep_codigo === parseInt(e.target.value)
                  ) || null
                )
              }
            >
              {depositos?.map((deposito) => (
                <option value={deposito.dep_codigo}>
                  {deposito.dep_descripcion}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <FormLabel className="w-24">Nro. Inventario:</FormLabel>
            <Input
              type="number"
              className="w-36"
              value={nroInventario ? nroInventario : 0}
              onChange={(e) => setNroInventario(parseInt(e.target.value))}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 border border-gray-300 rounded-md p-2 bg-white">
          <FormLabel>Tipo de inventario</FormLabel>
          <RadioGroup
            className="flex flex-col gap-2 justify-start"
            onChange={(value) => setTipoInventario(value)}
            value={tipoInventario}
          >
            <Radio value="1">Inventario por categoria</Radio>
            <Radio value="2">Inventario por articulo</Radio>
            <Radio value="3">Inventario por ubicación</Radio>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-2">
          <div className="relative">
            <FormLabel>Articulo</FormLabel>
            <Input
              type="text"
              placeholder="Buscar articulo por nombre o codigo de barras"
              isDisabled={tipoInventario === "1" || tipoInventario === "3"}
              value={articuloBuscado || ""}
              onChange={handleArticuloInputChange}
              onClick={() => {
                if (articuloBuscado && articuloBuscado.length >= 3) {
                  setIsFloatingCardVisible(true);
                }
              }}
            />
            <FloatingCard
              isVisible={isFloatingCardVisible}
              items={articulosDirecta || []}
              onClose={() => setIsFloatingCardVisible(false)}
              onSelect={handleArticuloSelect}
            />
          </div>
          <div className="flex flex-row gap-1">
            <div className="flex flex-col ">
              <FormLabel>Ubicacion</FormLabel>
              <Select
                onChange={(e) =>
                  setUbicacionSeleccionada(
                    ubicaciones.find(
                      (ubicacion) =>
                        ubicacion.ub_codigo === parseInt(e.target.value)
                    ) || null
                  )
                }
                isDisabled={tipoInventario === "2" || tipoInventario === "1"}
                value={ubicacionSeleccionada?.ub_codigo}
              >
                {ubicaciones.map((ubicacion) => (
                  <option value={ubicacion.ub_codigo}>
                    {ubicacion.ub_descripcion}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col ">
              <FormLabel>Sub-ubicacion</FormLabel>
              <Select
                onChange={(e) =>
                  setSubUbicacionSeleccionada(
                    subUbicaciones.find(
                      (subUbicacion) =>
                        subUbicacion.s_codigo === parseInt(e.target.value)
                    ) || null
                  )
                }
                isDisabled={tipoInventario === "2" || tipoInventario === "1"}
                value={subUbicacionSeleccionada?.s_codigo}
              >
                {subUbicaciones.map((subUbicacion) => (
                  <option value={subUbicacion.s_codigo}>
                    {subUbicacion.s_descripcion}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div
          className={`flex flex-col flex-1 w-full ${
            tipoInventario === "2" || tipoInventario === "3"
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <FormLabel>Categorias</FormLabel>
          <div className="flex flex-col gap-2 w-full overflow-y-auto h-[120px]">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th>
                    <div className="flex flex-col  items-center justify-center bg-white">
                      <Checkbox
                        isChecked={
                          articulosCategoria?.length ===
                          categoriasSeleccionadas.length
                        }
                        isIndeterminate={
                          categoriasSeleccionadas.length > 0 &&
                          categoriasSeleccionadas.length <
                            (articulosCategoria?.length || 0)
                        }
                        onChange={(e) =>
                          handleSelectAllCategorias(e.target.checked)
                        }
                        isDisabled={
                          tipoInventario === "2" || tipoInventario === "3"
                        }
                      />
                    </div>
                  </th>
                  <th className="text-center">Código</th>
                  <th className="text-left">Descripción</th>
                  <th className="text-center">Cantidad</th>
                </tr>
              </thead>

              <tbody>
                {articulosCategoria?.map((articulo) => (
                  <tr key={articulo.id}>
                    <td className="text-center">
                      <div className="flex flex-row gap-2 items-center justify-center">
                        <Checkbox
                          isChecked={categoriasSeleccionadas.includes(
                            articulo.id
                          )}
                          onChange={() => handleCategoriaSelect(articulo.id)}
                          isDisabled={
                            tipoInventario === "2" || tipoInventario === "3"
                          }
                        />
                      </div>
                    </td>
                    <td className="text-center">{articulo.id}</td>
                    <td>{articulo.nombre}</td>
                    <td className="text-center">
                      {articulo.cantidad_articulos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-col gap-2  justify-center">
          <Button colorScheme="blue">Limpiar filtros</Button>
          <Button variant={"outline"} colorScheme="red">
            Cerrar Inventario
          </Button>
          <Button colorScheme="green" onClick={fetchItemsParaTomaInventario}>
            Procesar
          </Button>
        </div>
      </div>
      <div className="flex flex-row w-full border border-gray-300 rounded-md bg-white h-full p-1 gap-1">
        <div className="flex flex-col w-1/2 border border-gray-300 rounded-md bg-white h-[73%]">
          <p className="text-center font-bold text-lg">A inventariar:</p>
          <Divider />
          <div className="flex-1 overflow-hidden">
            <div className="flex w-full h-full overflow-y-auto">
              <table className="w-full h-full ">
                <thead className="bg-gray-200 text-center ">
                  <tr className="border border-gray-300">
                    <th className="text-left border border-gray-300 px-2">
                      Ubi./Sub-ubi.
                    </th>
                    <th className="text-left border border-gray-300 px-2">
                      Codigo Barras
                    </th>
                    <th className="text-left border border-gray-300 px-2">
                      Descripcion
                    </th>
                    <th className="text-left border border-gray-300 px-2">
                      Vencimiento
                    </th>
                    <th className="text-left border border-gray-300 px-2">
                      Lote
                    </th>
                    <th className="text-left border border-gray-300 px-2">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {itemsParaTomaInventario.map((item) => (
                    <tr key={item.lote_id} className="border border-gray-300">
                      <td className="border border-gray-300 px-2">
                        {item.ubicacion} / {item.sub_ubicacion}
                      </td>
                      <td className="border border-gray-300 px-2">
                        {item.codigo_barra}
                      </td>
                      <td className="border border-gray-300 px-2">
                        {item.descripcion}
                      </td>
                      <td className="border border-gray-300 px-2">
                        {item.vencimiento}
                      </td>
                      <td className="border border-gray-300 px-2">
                        {item.lote}
                      </td>
                      <td className="border border-gray-300 px-2">
                        {item.stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Divider />
          <div className="flex w-full h-1/10 p-1">
            <p className="text-center font-bold text-lg">
              Total a inventariar: {itemsParaTomaInventario.length}
            </p>
          </div>
        </div>
        <div className="flex flex-col w-1/2 border border-gray-300 rounded-md bg-white h-[73%]">
          <div className="flex flex-row justify-between items-center px-4 py-2">
            <p className="text-center font-bold text-lg">Inventariado:</p>
            <Button
              variant={"outline"}
              colorScheme="blue"
              onClick={fetchItemsParaTomaInventarioConScanner}
            >
              <RotateCcw />
            </Button>
          </div>
          <Divider />
          <div className="flex w-full h-full">
            <table className="w-full h-full">
              <thead className="bg-gray-200 text-center ">
                <tr className="border border-gray-300">
                  <th className="text-left border border-gray-300 px-2">
                    Ubi./Sub-ubi.
                  </th>
                  <th className="text-left border border-gray-300 px-2">
                    Codigo Barras
                  </th>
                  <th className="text-left border border-gray-300 px-2">
                    Descripcion
                  </th>
                  <th className="text-left border border-gray-300 px-2">
                    Vencimiento
                  </th>
                  <th className="text-left border border-gray-300 px-2">
                    Lote
                  </th>
                  <th className="text-left border border-gray-300 px-2">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody className="align-top">
                {itemsParaTomaInventarioConScanner.map((item) => (
                  <tr key={item.lote_id} className="border border-gray-300">
                    <td className="border border-gray-300 px-2">
                      {item.ubicacion} / {item.sub_ubicacion}
                    </td>

                    <td className="border border-gray-300 px-2">
                      {item.codigo_barra}
                    </td>
                    <td className="border border-gray-300 px-2">
                      {item.descripcion}
                    </td>
                    <td className="border border-gray-300 px-2">
                      {item.vencimiento}
                    </td>
                    <td className="border border-gray-300 px-2">{item.lote}</td>
                    <td className="border border-gray-300 px-2">
                      {item.stock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Divider />
          <div className="flex w-full h-1/10 p-1">
            <p className="text-center font-bold text-lg">Total inventariado:</p>
          </div>
        </div>
      </div>
    </Flex>
  );
};

export default NuevaTomaInventario;
