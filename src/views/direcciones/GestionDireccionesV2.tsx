import { useEffect, useState, useMemo, useCallback } from "react";
import React from "react";
import {
  UbicacionDTO,
  AgrupacionDTO,
  ItemsPorDireccionDTO,
} from "./types/ubicaciones.type";
import { useDirecciones } from "./hooks/useDirecciones";
import { useItemsPorDireccion } from "./hooks/useItemsPorDireccion";
import { useToast } from "@chakra-ui/react";
import { 
  MapPin, 
  Layers, 
  Package, 
  Plus, 
  Trash2, 
  Printer,
  Building2,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import Modal from "@/ui/modal/Modal";
import { BuscadorArticulos } from "@/ui/buscador_articulos/BuscadorArticulos";
import { Articulo } from "@/ui/buscador_articulos/types/articulo";
import DireccionesRotulo from "./DireccionesRotulo";
import { createRoot } from "react-dom/client";
import { 
  SearchUbicacionesInput, 
  SearchUbicacionesAgrupadasInput, 
  SearchItemsInput 
} from "./components/SearchInput";

type TabType = 'crear' | 'agrupar' | 'items';

// MOVER ESTOS COMPONENTES FUERA DEL COMPONENTE PRINCIPAL
const TabButton = React.memo(({ tab, icon: Icon, label, count, activeTab, setActiveTab }: { 
  tab: TabType; 
  icon: any; 
  label: string; 
  count?: number; 
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}) => (
  <button
    onClick={() => setActiveTab(tab)}
    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
      activeTab === tab
        ? 'bg-blue-500 text-white shadow-lg'
        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
    {count !== undefined && (
      <span className={`px-2 py-1 rounded-full text-xs ${
        activeTab === tab ? 'bg-white text-blue-500' : 'bg-gray-200 text-gray-600'
      }`}>
        {count}
      </span>
    )}
  </button>
));

const RangeInput = React.memo(({ 
  label, 
  initialName, 
  finalName, 
  initialValue, 
  finalValue, 
  onChange, 
  placeholder = "Número" 
}: {
  label: string;
  initialName: string;
  finalName: string;
  initialValue: number;
  finalValue: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="number"
        name={initialName}
        value={initialValue || ''}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <ArrowRight size={16} className="text-gray-400" />
      <input
        type="number"
        name={finalName}
        value={finalValue || ''}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  </div>
));

const ZonaSelector = React.memo(({ 
  value, 
  onChange 
}: { 
  value: number; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
}) => {
  const zonas = [
    { id: 1, name: 'ZONA AA', color: 'bg-red-100 text-red-800', desc: 'Mayor rotación' },
    { id: 2, name: 'ZONA A', color: 'bg-orange-100 text-orange-800', desc: 'Alta rotación' },
    { id: 3, name: 'ZONA B', color: 'bg-yellow-100 text-yellow-800', desc: 'Media rotación' },
    { id: 4, name: 'ZONA C', color: 'bg-blue-100 text-blue-800', desc: 'Baja rotación' },
    { id: 5, name: 'ZONA D', color: 'bg-gray-100 text-gray-800', desc: 'Mínima rotación' },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Seleccionar Zona</label>
      <div className="grid grid-cols-1 gap-2">
        {zonas.map((zona) => (
          <label key={zona.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="zona"
              value={zona.id}
              checked={value === zona.id}
              onChange={onChange}
              className="w-4 h-4 text-blue-500 cursor-pointer"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${zona.color}`}>
                  {zona.name}
                </span>
                <span className="text-sm text-gray-500">{zona.desc}</span>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
});

const TipoDireccionSelector = React.memo(({ 
  value, 
  onChange 
}: { 
  value: number; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
}) => {
  const tipos = [
    { id: 1, name: 'Items por caja', desc: 'Productos completos' },
    { id: 2, name: 'Items fraccionados', desc: 'Productos divididos' },
    { id: 3, name: 'Reserva', desc: 'Almacenamiento temporal' },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Tipo de Dirección</label>
      <div className="grid grid-cols-1 gap-2">
        {tipos.map((tipo) => (
          <label key={tipo.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="d_tipo_direccion"
              value={tipo.id}
              checked={value === tipo.id}
              onChange={onChange}
              className="w-4 h-4 text-blue-500 cursor-pointer"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{tipo.name}</span>
                <span className="text-sm text-gray-500">{tipo.desc}</span>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
});

const GestionDireccionesV2 = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('crear');
  
  // Hooks existentes
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

  // Estados para formularios
  const [ubicacionDTO, setUbicacionDTO] = useState<UbicacionDTO>({
    d_calle_inicial: 0,
    d_calle_final: 0,
    d_predio_inicial: 0,
    d_predio_final: 0,
    d_piso_inicial: 0,
    d_piso_final: 0,
    d_direccion_inicial: 0,
    d_direccion_final: 0,
    d_estado: 1,
    d_tipo_direccion: 1,
  });

  const [ubicacionAgrupadaDTO, setUbicacionAgrupadaDTO] = useState<AgrupacionDTO>({
    rango: {
      d_calle_inicial: 0,
      d_calle_final: 0,
      d_predio_inicial: 0,
      d_predio_final: 0,
      d_piso_inicial: 0,
      d_piso_final: 0,
      d_direccion_inicial: 0,
      d_direccion_final: 0,
    },
    zona: 0,
  });

  const [itemsPorDireccionDTO, setItemsPorDireccionDTO] = useState<ItemsPorDireccionDTO>({
    rango: {
      d_calle_inicial: 0,
      d_calle_final: 0,
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Log para ver cuándo se re-renderiza el componente


  // Memoizar ubicaciones filtradas para evitar re-renderizados
  const ubicacionesFiltradas = useMemo(() => {
    console.log('🔍 Filtrando ubicaciones:', {
      total: ubicaciones?.length,
      searchTerm,
      ubicaciones: ubicaciones?.slice(0, 3) // Solo los primeros 3 para no saturar el log
    });
    
    if (!ubicaciones || ubicaciones.length === 0) return [];
    
    return ubicaciones
      .filter(ubicacion => ubicacion && ubicacion.direccion_completa) // Filtrar elementos undefined/null
      .filter(ubicacion => 
        ubicacion.direccion_completa.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [ubicaciones, searchTerm]);



  // Handlers MEMOIZADOS para evitar re-renderizados
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    console.log('📝 handleChange:', { name, value, type });
    setUbicacionDTO(prev => ({
      ...prev,
      [name]: type === "radio" || type === "number" ? Number(value) : value,
    }));
  }, []);

  const handleChangeAgrupacion = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    console.log('📝 handleChangeAgrupacion:', { name, value, type });
    if (name.startsWith("d_")) {
      setUbicacionAgrupadaDTO(prev => ({
        ...prev,
        rango: {
          ...prev.rango,
          [name]: type === "number" ? Number(value) : value,
        },
      }));
    } else if (name === "zona") {
      setUbicacionAgrupadaDTO(prev => ({
        ...prev,
        zona: Number(value),
      }));
    }
  }, []);

  const handleChangeRangoItems = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    console.log('📝 handleChangeRangoItems:', { name, value, type });
    setItemsPorDireccionDTO(prev => ({
      ...prev,
      rango: {
        ...prev.rango,
        [name]: type === "number" ? Number(value) : value,
      },
    }));
  }, []);

  const handleSeleccionarArticulo = (articulo: Articulo) => {
    console.log('📦 handleSeleccionarArticulo:', articulo);
    const nuevoDTO = {
      ...itemsPorDireccionDTO,
      articulo: articulo.id_articulo,
    };
    setItemsPorDireccionDTO(nuevoDTO);
    crearItemsPorDireccion(nuevoDTO);
    setIsModalOpen(false);
    setTimeout(async () => {
      await obtenerItemsPorDireccion();
    }, 500);
  };

  const handleCrearUbicacion = async () => {
    console.log('🏗️ handleCrearUbicacion:', ubicacionDTO);
    try {
      await crearUbicaciones(ubicacionDTO);
      setUbicacionDTO({
        d_calle_inicial: 0,
        d_calle_final: 0,
        d_predio_inicial: 0,
        d_predio_final: 0,
        d_piso_inicial: 0,
        d_piso_final: 0,
        d_direccion_inicial: 0,
        d_direccion_final: 0,
        d_estado: 1,
        d_tipo_direccion: 1,
      });
      setTimeout(async () => {
        await obtenerUbicaciones();
      }, 500);
    } catch (error) {
      console.error("Error al crear ubicación:", error);
    }
  };

  const handleAgruparDirecciones = async () => {
    console.log('🏷️ handleAgruparDirecciones:', ubicacionAgrupadaDTO);
    try {
      const zonaActual = ubicacionAgrupadaDTO.zona;
      await agruparDirecciones(ubicacionAgrupadaDTO);
      setUbicacionAgrupadaDTO({
        rango: {
          d_calle_inicial: 0,
          d_calle_final: 0,
          d_predio_inicial: 0,
          d_predio_final: 0,
          d_piso_inicial: 0,
          d_piso_final: 0,
          d_direccion_inicial: 0,
          d_direccion_final: 0,
        },
        zona: 0,
      });
      setTimeout(async () => {
        await getUbicacionesAgrupadas("", zonaActual);
      }, 500);
    } catch (error) {
      console.error("Error al agrupar direcciones:", error);
    }
  };

  const ComponenteRotulo = (datos: Omit<UbicacionDTO, 'd_tipo_direccion' | 'd_estado'>) => {
    console.log('🖨️ ComponenteRotulo:', datos);
    const rotulosDiv = document.createElement('div');
    rotulosDiv.style.display = 'none';
    document.body.appendChild(rotulosDiv);

    const root = createRoot(rotulosDiv);
    root.render(
      <DireccionesRotulo
        data={datos}
        action="print"
      />
    );

    setTimeout(() => {
      root.unmount();
      document.body.removeChild(rotulosDiv);
    }, 2000);
  };

  const handleImprimirRotulos = () => {
    const rango = itemsPorDireccionDTO.rango;
    console.log('🖨️ handleImprimirRotulos:', rango);
    if (!rango.d_calle_inicial || !rango.d_calle_final || !rango.d_predio_inicial || 
        !rango.d_predio_final || !rango.d_piso_inicial || !rango.d_piso_final || 
        !rango.d_direccion_inicial || !rango.d_direccion_final) {
      toast({
        title: "Error",
        description: "Debe completar todos los campos del rango",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      ComponenteRotulo(rango);
    }
  };

  // Handlers de búsqueda también memoizados
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 handleSearchChange:', e.target.value);
    setSearchTerm(e.target.value);
  }, []);

  const handleBusquedaUbicacionesAgrupadas = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🏷️ handleBusquedaUbicacionesAgrupadas:', e.target.value);
    getUbicacionesAgrupadas(e.target.value, ubicacionAgrupadaDTO.zona);
  }, [getUbicacionesAgrupadas, ubicacionAgrupadaDTO.zona]);

  const handleBusquedaItems = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 handleBusquedaItems:', e.target.value);
    const rangoCompleto: UbicacionDTO = {
      ...itemsPorDireccionDTO.rango,
      d_tipo_direccion: 1,
      d_estado: 1,
    };
    obtenerItemsPorDireccion(rangoCompleto, e.target.value);
  }, [itemsPorDireccionDTO.rango, obtenerItemsPorDireccion]);

  // Effects
  useEffect(() => {
    console.log('🚀 useEffect inicial - cargando datos');
    obtenerUbicaciones();
    obtenerItemsPorDireccion();
  }, []);

  useEffect(() => {
    if (ubicacionAgrupadaDTO.zona) {
      console.log('🏷️ useEffect zona cambiada:', ubicacionAgrupadaDTO.zona);
      getUbicacionesAgrupadas("", ubicacionAgrupadaDTO.zona);
    }
  }, [ubicacionAgrupadaDTO.zona]);

  // Error handling effects
  useEffect(() => {
    if (errorCrearUbicacion) {
      console.log('❌ errorCrearUbicacion:', errorCrearUbicacion);
      toast({
        title: "Error",
        description: errorCrearUbicacion,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [errorCrearUbicacion, toast]);

  useEffect(() => {
    if (errorAgruparDirecciones) {
      console.log('❌ errorAgruparDirecciones:', errorAgruparDirecciones);
      toast({
        title: "Error",
        description: errorAgruparDirecciones,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [errorAgruparDirecciones, toast]);

  useEffect(() => {
    if (errorCrearItemsPorDireccion) {
      console.log('❌ errorCrearItemsPorDireccion:', errorCrearItemsPorDireccion);
      toast({
        title: "Error",
        description: errorCrearItemsPorDireccion,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [errorCrearItemsPorDireccion, toast]);

  useEffect(() => {
    if (errorEliminarItemsPorDireccion) {
      console.log('❌ errorEliminarItemsPorDireccion:', errorEliminarItemsPorDireccion);
      toast({
        title: "Error",
        description: errorEliminarItemsPorDireccion,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [errorEliminarItemsPorDireccion, toast]);

  useEffect(() => {
    if (errorEliminarDireccion) {
      console.log('❌ errorEliminarDireccion:', errorEliminarDireccion);
      toast({
        title: "Error",
        description: errorEliminarDireccion,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [errorEliminarDireccion, toast]);

  useEffect(() => {
    if (successEliminarDireccion) {
      console.log('✅ successEliminarDireccion:', successEliminarDireccion);
      toast({
        title: "Éxito",
        description: successEliminarDireccion,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [successEliminarDireccion, toast]);

  return (
    <div className="min-h-screen bg-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Building2 size={24} color="white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Depósito</h1>
              <p className="text-sm text-gray-500">Administra ubicaciones, zonas y productos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6">
          <TabButton 
            tab="crear" 
            icon={MapPin} 
            label="Crear Ubicaciones" 
            count={ubicaciones?.length || 0}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <TabButton 
            tab="agrupar" 
            icon={Layers} 
            label="Agrupar por Zonas" 
            count={ubicacionesAgrupadas?.length || 0}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <TabButton 
            tab="items" 
            icon={Package} 
            label="Gestionar Items" 
            count={itemsPorDireccion?.length || 0}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Tab 1: Crear Ubicaciones */}
          {activeTab === 'crear' && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin size={24} className="text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900">Crear Nuevas Ubicaciones</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulario */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-4">Definir Rango de Ubicación</h3>
                    
                    <div className="space-y-4">
                      <RangeInput
                        label="Pasillo"
                        initialName="d_calle_inicial"
                        finalName="d_calle_final"
                        initialValue={ubicacionDTO.d_calle_inicial}
                        finalValue={ubicacionDTO.d_calle_final}
                        onChange={handleChange}
                        placeholder="Número de pasillo"
                      />
                      
                      <RangeInput
                        label="Estante"
                        initialName="d_predio_inicial"
                        finalName="d_predio_final"
                        initialValue={ubicacionDTO.d_predio_inicial}
                        finalValue={ubicacionDTO.d_predio_final}
                        onChange={handleChange}
                        placeholder="Número de estante"
                      />
                      
                      <RangeInput
                        label="Nivel"
                        initialName="d_piso_inicial"
                        finalName="d_piso_final"
                        initialValue={ubicacionDTO.d_piso_inicial}
                        finalValue={ubicacionDTO.d_piso_final}
                        onChange={handleChange}
                        placeholder="Número de nivel"
                      />
                      
                      <RangeInput
                        label="Posición"
                        initialName="d_direccion_inicial"
                        finalName="d_direccion_final"
                        initialValue={ubicacionDTO.d_direccion_inicial}
                        finalValue={ubicacionDTO.d_direccion_final}
                        onChange={handleChange}
                        placeholder="Número de posición"
                      />
                    </div>
                  </div>

                  <TipoDireccionSelector 
                    value={ubicacionDTO.d_tipo_direccion} 
                    onChange={handleChange} 
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={handleCrearUbicacion}
                      className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Crear Ubicaciones
                    </button>
                    <button
                      onClick={() => eliminarDireccion(ubicacionDTO)}
                      className="px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={20} />
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Lista de ubicaciones */}
                <div className="space-y-4">
                  <SearchUbicacionesInput 
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                  />

                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <h3 className="font-medium text-gray-900 mb-3">Ubicaciones Creadas</h3>
                    
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : ubicacionesFiltradas.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin size={48} className="mx-auto mb-2 text-gray-300" />
                        <p>
                          {ubicaciones && ubicaciones.length > 0 
                            ? "No se encontraron ubicaciones con ese filtro" 
                            : "No hay ubicaciones creadas"
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ubicacionesFiltradas.map((ubicacion) => (
                          <div key={`${ubicacion.d_calle}-${ubicacion.d_predio}-${ubicacion.d_piso}-${ubicacion.d_direccion}`} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                            <div className="flex items-center gap-2">
                              <MapPin size={16} className="text-blue-500" />
                              <span className="font-medium">{ubicacion.direccion_completa}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Activa
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Agrupar por Zonas */}
          {activeTab === 'agrupar' && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Layers size={24} className="text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900">Agrupar Ubicaciones por Zonas</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulario de agrupación */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-4">Seleccionar Rango para Agrupar</h3>
                    
                    <div className="space-y-4">
                      <RangeInput
                        label="Pasillo"
                        initialName="d_calle_inicial"
                        finalName="d_calle_final"
                        initialValue={ubicacionAgrupadaDTO.rango.d_calle_inicial}
                        finalValue={ubicacionAgrupadaDTO.rango.d_calle_final}
                        onChange={handleChangeAgrupacion}
                      />
                      
                      <RangeInput
                        label="Estante"
                        initialName="d_predio_inicial"
                        finalName="d_predio_final"
                        initialValue={ubicacionAgrupadaDTO.rango.d_predio_inicial}
                        finalValue={ubicacionAgrupadaDTO.rango.d_predio_final}
                        onChange={handleChangeAgrupacion}
                      />
                      
                      <RangeInput
                        label="Nivel"
                        initialName="d_piso_inicial"
                        finalName="d_piso_final"
                        initialValue={ubicacionAgrupadaDTO.rango.d_piso_inicial}
                        finalValue={ubicacionAgrupadaDTO.rango.d_piso_final}
                        onChange={handleChangeAgrupacion}
                      />
                      
                      <RangeInput
                        label="Posición"
                        initialName="d_direccion_inicial"
                        finalName="d_direccion_final"
                        initialValue={ubicacionAgrupadaDTO.rango.d_direccion_inicial}
                        finalValue={ubicacionAgrupadaDTO.rango.d_direccion_final}
                        onChange={handleChangeAgrupacion}
                      />
                    </div>
                  </div>

                  <ZonaSelector 
                    value={ubicacionAgrupadaDTO.zona} 
                    onChange={handleChangeAgrupacion} 
                  />

                  <button
                    onClick={handleAgruparDirecciones}
                    className="w-full bg-green-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Layers size={20} />
                    Agrupar en Zona Seleccionada
                  </button>
                </div>

                {/* Lista de ubicaciones agrupadas */}
                <div className="space-y-4">
                  <SearchUbicacionesAgrupadasInput 
                    onSearchChange={handleBusquedaUbicacionesAgrupadas}
                  />

                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <h3 className="font-medium text-gray-900 mb-3">Ubicaciones en Zona</h3>
                    
                    {loadingAgrupaciones ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : errorAgrupaciones ? (
                      <div className="text-center py-8 text-red-500">
                        <AlertCircle size={48} className="mx-auto mb-2" />
                        <p>Error: {errorAgrupaciones}</p>
                      </div>
                    ) : !ubicacionesAgrupadas || ubicacionesAgrupadas.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Layers size={48} className="mx-auto mb-2 text-gray-300" />
                        <p>No hay ubicaciones en esta zona</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ubicacionesAgrupadas
                          .filter(ubicacion => ubicacion && ubicacion.direccion_completa)
                          .map((ubicacion) => (
                            <div key={`${ubicacion.d_calle}-${ubicacion.d_predio}-${ubicacion.d_piso}-${ubicacion.d_direccion}`} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div className="flex items-center gap-2">
                                <Layers size={16} className="text-green-500" />
                                <span className="font-medium">{ubicacion.direccion_completa}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  Zona {ubicacion.d_zona}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Gestionar Items */}
          {activeTab === 'items' && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Package size={24} className="text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900">Gestionar Items por Ubicación</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulario de items */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-4">Seleccionar Rango de Ubicación</h3>
                    
                    <div className="space-y-4">
                      <RangeInput
                        label="Pasillo"
                        initialName="d_calle_inicial"
                        finalName="d_calle_final"
                        initialValue={itemsPorDireccionDTO.rango.d_calle_inicial}
                        finalValue={itemsPorDireccionDTO.rango.d_calle_final}
                        onChange={handleChangeRangoItems}
                      />
                      
                      <RangeInput
                        label="Estante"
                        initialName="d_predio_inicial"
                        finalName="d_predio_final"
                        initialValue={itemsPorDireccionDTO.rango.d_predio_inicial}
                        finalValue={itemsPorDireccionDTO.rango.d_predio_final}
                        onChange={handleChangeRangoItems}
                      />
                      
                      <RangeInput
                        label="Nivel"
                        initialName="d_piso_inicial"
                        finalName="d_piso_final"
                        initialValue={itemsPorDireccionDTO.rango.d_piso_inicial}
                        finalValue={itemsPorDireccionDTO.rango.d_piso_final}
                        onChange={handleChangeRangoItems}
                      />
                      
                      <RangeInput
                        label="Posición"
                        initialName="d_direccion_inicial"
                        finalName="d_direccion_final"
                        initialValue={itemsPorDireccionDTO.rango.d_direccion_inicial}
                        finalValue={itemsPorDireccionDTO.rango.d_direccion_final}
                        onChange={handleChangeRangoItems}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Agregar Item
                    </button>
                    <button
                      onClick={handleImprimirRotulos}
                      className="px-4 py-3 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-2"
                    >
                      <Printer size={20} />
                      Imprimir
                    </button>
                  </div>

                  <button
                    onClick={() => eliminarItemsPorDireccion(
                      itemsPorDireccionDTO.rango,
                      itemsPorDireccionDTO.articulo
                    )}
                    className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={20} />
                    Eliminar Items de esta Ubicación
                  </button>
                </div>

                {/* Lista de items */}
                <div className="space-y-4">
                  <SearchItemsInput 
                    onSearchChange={handleBusquedaItems}
                  />

                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <h3 className="font-medium text-gray-900 mb-3">Items en Ubicación</h3>
                    
                    {itemsPorDireccion.length > 0 ? (
                      <div className="space-y-2">
                        {itemsPorDireccion
                          .filter(item => item && item.direccion_completa)
                          .map((item) => (
                            <div key={`${item.cod_barras}-${item.direccion_completa}`} className="p-3 bg-white rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Package size={16} className="text-blue-500" />
                                  <span className="font-medium">{item.descripcion}</span>
                                </div>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {item.zona}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Código:</strong> {item.cod_barras}</p>
                                <p><strong>Ubicación:</strong> {item.direccion_completa}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Package size={48} className="mx-auto mb-2 text-gray-300" />
                        <p>No hay items en esta ubicación</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para agregar items */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agregar Item a Ubicación"
        maxWidth="max-w-4xl"
      >
        <div className="flex flex-col gap-4 h-[400px] w-full overflow-y-auto">
          <BuscadorArticulos
            onSeleccionarArticulo={handleSeleccionarArticulo}
            placeholder="Buscar artículo por nombre o código de barras"
            stock={true}
            moneda={1}
          />
          <div className="text-center text-gray-500">
            <Package size={48} className="mx-auto mb-2 text-gray-300" />
            <p>Seleccione el artículo que desea agregar a las ubicaciones</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GestionDireccionesV2;
