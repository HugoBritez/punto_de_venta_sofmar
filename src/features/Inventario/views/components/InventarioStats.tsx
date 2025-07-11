import { useState} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Filter,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  BarChart3,

  Hash
} from "lucide-react";
import { Inventario } from "../../types/inventario.type";

interface InventarioStatsProps {
  totalItems: number;
  totalInventariado: number;
  porcentajeCompletado: string;
  inventarioSeleccionado: Inventario | null;
  inventarios: Inventario[];
  tipoInventario: string;
  onSelectInventario: (inventario: Inventario) => void;
  onSelectFilter: (tipo: string, valor: number) => void;
  selectedFilter?: { tipo: string; valor: number; nombre: string };
  categorias?: any[];
  marcas?: any[];
  secciones?: any[];
  ubicaciones?: any[];
}

const InventarioStats: React.FC<InventarioStatsProps> = ({
  totalItems,
  totalInventariado,
  porcentajeCompletado,
  inventarioSeleccionado,
  inventarios,
  tipoInventario,
  onSelectInventario,
  onSelectFilter,
  selectedFilter,
  categorias = [],
  marcas = [],
  secciones = [],
  ubicaciones = []
}) => {
  const [isInventariosOpen, setIsInventariosOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const diferencia = totalItems - totalInventariado;

  const getTipoInventarioText = () => {
    switch (tipoInventario) {
      case "1": return "Categorías";
      case "2": return "Artículos";
      case "3": return "Ubicaciones";
      case "4": return "Marcas";
      case "5": return "Secciones";
      default: return "Categorías";
    }
  };

  const getInventarioStatus = (inventario: Inventario) => {
    if (inventario.autorizado === 1) return { text: "Autorizado", color: "bg-emerald-500", icon: CheckCircle };
    if (inventario.estado === 0) return { text: "En Progreso", color: "bg-blue-500", icon: Clock };
    if (inventario.estado === 1) return { text: "Completado", color: "bg-green-500", icon: CheckCircle };
    return { text: "Anulado", color: "bg-red-500", icon: AlertTriangle };
  };

  const getFilterOptions = () => {
    switch (tipoInventario) {
      case "1": return categorias;
      case "4": return marcas;
      case "5": return secciones;
      case "3": return ubicaciones;
      default: return [];
    }
  };

  const filteredOptions = getFilterOptions().filter((option: any) =>
    option.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Inventario Activo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Inventario Activo</h3>
          <BarChart3 className="w-5 h-5 text-blue-600" />
        </div>

        {/* Selector de Inventario */}
        <div className="relative">
          <button
            onClick={() => setIsInventariosOpen(!isInventariosOpen)}
            className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Hash className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">
                  #{inventarioSeleccionado?.nroInventario || "Seleccionar"}
                </div>
                <div className="text-sm text-gray-500">
                  {inventarioSeleccionado ? 
                    inventarioSeleccionado.fechaInicio.toLocaleDateString() : 
                    "Ningún inventario seleccionado"
                  }
                </div>
              </div>
            </div>
            {isInventariosOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {isInventariosOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {inventarios.map((inventario) => {
                  const status = getInventarioStatus(inventario);
                  return (
                    <div
                      key={inventario.id}
                      onClick={() => {
                        onSelectInventario(inventario);
                        setIsInventariosOpen(false);
                      }}
                      className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        inventarioSeleccionado?.id === inventario.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            #{inventario.nroInventario}
                          </div>
                          <div className="text-sm text-gray-500">
                            {inventario.fechaInicio.toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} text-white`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Estado del Inventario Seleccionado */}
        {inventarioSeleccionado && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Estado:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                getInventarioStatus(inventarioSeleccionado).color
              } text-white`}>
                {getInventarioStatus(inventarioSeleccionado).text}
              </span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Operador: {inventarioSeleccionado.operador}</div>
              <div>Inicio: {inventarioSeleccionado.horaInicio}</div>
              {inventarioSeleccionado.fechaCierre && (
                <div>Cierre: {inventarioSeleccionado.horaCierre}</div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Filtros Específicos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          <Filter className="w-5 h-5 text-blue-600" />
        </div>

        <div className="mb-3">
          <span className="text-sm font-medium text-gray-700">
            Tipo: {getTipoInventarioText()}
          </span>
        </div>

        {/* Selector de Filtro Específico */}
        <div className="relative">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Filter className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">
                  {selectedFilter?.nombre || "Seleccionar filtro"}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedFilter ? "Filtro aplicado" : "Ningún filtro seleccionado"}
                </div>
              </div>
            </div>
            {isFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {/* Búsqueda */}
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Opciones */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option: any) => (
                      <div
                        key={option.id}
                        onClick={() => {
                          onSelectFilter(tipoInventario, option.id);
                          setIsFiltersOpen(false);
                          setSearchTerm("");
                        }}
                        className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedFilter?.valor === option.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {option.nombre || option.descripcion}
                        </div>
                        {option.cantidad_articulos && (
                          <div className="text-sm text-gray-500">
                            {option.cantidad_articulos} artículos
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      No se encontraron opciones
                    </div>
                  )}
                </div>

                {/* Limpiar filtro */}
                {selectedFilter && (
                  <div className="p-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        onSelectFilter("", 0);
                        setIsFiltersOpen(false);
                        setSearchTerm("");
                      }}
                      className="w-full text-sm text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      Limpiar filtro
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filtro Actual */}
        {selectedFilter && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-900">
                  Filtro aplicado
                </div>
                <div className="text-sm text-blue-700">
                  {selectedFilter.nombre}
                </div>
              </div>
              <button
                onClick={() => onSelectFilter("", 0)}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Progreso</h3>
          <TrendingUp className="w-5 h-5 text-green-600" />
        </div>

        <div className="space-y-4">
          {/* Barra de progreso */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Completado</span>
              <span className="font-medium text-gray-900">{porcentajeCompletado}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${porcentajeCompletado}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
              />
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
              <div className="text-xs text-blue-700">Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalInventariado}</div>
              <div className="text-xs text-green-700">Inventariado</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{diferencia}</div>
              <div className="text-xs text-yellow-700">Pendiente</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{porcentajeCompletado}%</div>
              <div className="text-xs text-purple-700">Progreso</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InventarioStats; 