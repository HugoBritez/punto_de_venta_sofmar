// import { useState, useEffect } from "react";
// import { 
//   ArchiveRestore, 
//   Plus, 
//   RotateCcw, 
//   X, 
//   Search, 
//   Filter,
//   BarChart3,
//   Calendar,
//   Building2,
//   Package,
//   CheckCircle,
//   AlertCircle,
//   Clock,
//   TrendingUp,
//   Users,
//   Settings,
//   Download,
//   Eye,
//   Edit3,
//   Trash2,
//   Play,
//   Pause,
//   Square
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// // Hooks personalizados
// import { useGetInventarios, useGetItems } from "../hooks/querys";
// import { 
//   useCreateInventario, 
//   useAnularInventario, 
//   useCerrarInventario,
//   useCreateItem 
// } from "../hooks/mutations";

// // Tipos
// import { Inventario } from "../types/inventario.type";
// import { GetItemsFilters, Item, ItemDTO } from "../types/items.type";

// // Componentes
// import HeaderComponent from "@/modules/Header";
// import ConfirmModal from "../components/ConfirmModal";
// import InventarioForm from "../components/InventarioForm";  
// import InventarioList from "../components/InventarioList";
// import ItemsTable from "../components/ItemsTable";
// import InventarioStats from "../components/InventarioStats";

// // Servicios
// import { fetchDepositos, fetchSucursales, fetchUbicaciones, fetchSubUbicaciones } from "../services/commonService";
// import { GetInventariosFilters } from "../api/inventariosApi";

// interface InventarioPannelProps {
//   // Props si las necesitas
// }

// const InventarioPannel: React.FC<InventarioPannelProps> = () => {
//   // Estado local
//   const [fechaActual, setFechaActual] = useState(new Date());
//   const [depositoSeleccionado, setDepositoSeleccionado] = useState<any>(null);
//   const [sucursalSeleccionada, setSucursalSeleccionada] = useState<any>(null);
//   const [inventarioSeleccionado, setInventarioSeleccionado] = useState<Inventario | null>(null);
//   const [tipoInventario, setTipoInventario] = useState<string>("1");
//   const [busquedaItems, setBusquedaItems] = useState("");
//   const [isListadoOpen, setIsListadoOpen] = useState(false);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [actionToConfirm, setActionToConfirm] = useState<{
//     type: 'anular' | 'cerrar';
//     inventario: Inventario;
//   } | null>(null);
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [selectedFilter, setSelectedFilter] = useState<{ tipo: string; valor: number; nombre: string } | null>(null);

//   // Datos comunes
//   const [depositos, setDepositos] = useState<any[]>([]);
//   const [sucursales, setSucursales] = useState<any[]>([]);
//   const [ubicaciones, setUbicaciones] = useState<any[]>([]);
//   const [subUbicaciones, setSubUbicaciones] = useState<any[]>([]);
//   const [categorias, setCategorias] = useState<any[]>([]);
//   const [marcas, setMarcas] = useState<any[]>([]);
//   const [secciones, setSecciones] = useState<any[]>([]);

//   // Filtros para queries
//   const inventariosFilters: GetInventariosFilters = {
//     estado: 0, // Solo inventarios abiertos por defecto
//     deposito: depositoSeleccionado?.dep_codigo || 0,
//     nro_inventario: ""
//   };

//   const itemsFilters: GetItemsFilters = {
//     idInventario: inventarioSeleccionado?.id || 0,
//     filtro: 0, // Solo items en inventario
//     tipo: selectedFilter?.tipo === "1" ? "Categoria" : 
//           selectedFilter?.tipo === "4" ? "Marca" : 
//           selectedFilter?.tipo === "5" ? "Seccion" : 
//           selectedFilter?.tipo === "3" ? "Ubicacion" : "Todos",
//     valor: selectedFilter?.valor || 0,
//     stock: false,
//     busqueda: busquedaItems
//   };

//   // Queries
//   const { 
//     data: inventarios = [], 
//     isLoading: inventariosLoading,
//     refetch: refetchInventarios 
//   } = useGetInventarios(inventariosFilters);

//   const { 
//     data: items = [], 
//     isLoading: itemsLoading,
//     refetch: refetchItems 
//   } = useGetItems(itemsFilters);

//   // Mutations
//   const createInventarioMutation = useCreateInventario();
//   const anularInventarioMutation = useAnularInventario();
//   const cerrarInventarioMutation = useCerrarInventario();
//   const createItemMutation = useCreateItem();

//   // Cargar datos comunes al montar el componente
//   useEffect(() => {
//     const loadCommonData = async () => {
//       try {
//         const [depositosData, sucursalesData, ubicacionesData, subUbicacionesData] = await Promise.all([
//           fetchDepositos(),
//           fetchSucursales(),
//           fetchUbicaciones(),
//           fetchSubUbicaciones()
//         ]);

//         setDepositos(depositosData);
//         setSucursales(sucursalesData);
//         setUbicaciones(ubicacionesData);
//         setSubUbicaciones(subUbicacionesData);

//         // Seleccionar el primer elemento por defecto
//         if (depositosData.length > 0) setDepositoSeleccionado(depositosData[0]);
//         if (sucursalesData.length > 0) setSucursalSeleccionada(sucursalesData[0]);
//       } catch (error) {
//         console.error("Error al cargar datos iniciales:", error);
//       }
//     };

//     loadCommonData();
//   }, []);

//   // Cargar datos según el tipo de inventario
//   useEffect(() => {
//     const loadFilterData = async () => {
//       try {
//         if (tipoInventario === "1") {
//           const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}articulos/categorias-articulos`);
//           const data = await response.json();
//           setCategorias(data.body || []);
//         } else if (tipoInventario === "4") {
//           const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}articulos/marcas-articulos`);
//           const data = await response.json();
//           setMarcas(data.body || []);
//         } else if (tipoInventario === "5") {
//           const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}articulos/secciones-articulos`);
//           const data = await response.json();
//           setSecciones(data.body || []);
//         }
//       } catch (error) {
//         console.error("Error al cargar datos de filtro:", error);
//       }
//     };

//     loadFilterData();
//     setSelectedFilter(null); // Limpiar filtro al cambiar tipo
//   }, [tipoInventario]);

//   // Seleccionar el primer inventario cuando se cargan
//   useEffect(() => {
//     if (inventarios.length > 0 && !inventarioSeleccionado) {
//       setInventarioSeleccionado(inventarios[0]);
//     }
//   }, [inventarios, inventarioSeleccionado]);

//   // Handlers
//   const handleCreateInventario = async () => {
//     if (!sucursalSeleccionada || !depositoSeleccionado) {
//       return;
//     }

//     const nuevoInventario: Inventario = {
//       id: 0, // Se asignará en el backend
//       fechaInicio: new Date(),
//       horaInicio: new Date().toLocaleTimeString(),
//       operador: parseInt(sessionStorage.getItem("user_id") || "0"),
//       sucursal: sucursalSeleccionada.id,
//       deposito: depositoSeleccionado.dep_codigo,
//       estado: 0,
//       observacion: "",
//       nroInventario: "",
//       autorizado: 0,
//       fechaCierre: new Date(),
//       horaCierre: ""
//     };

//     createInventarioMutation.mutate(nuevoInventario);
//   };

//   const handleAnularInventario = (inventario: Inventario) => {
//     setActionToConfirm({ type: 'anular', inventario });
//     setShowConfirmModal(true);
//   };

//   const handleCerrarInventario = (inventario: Inventario) => {
//     setActionToConfirm({ type: 'cerrar', inventario });
//     setShowConfirmModal(true);
//   };

//   const handleConfirmAction = () => {
//     if (!actionToConfirm) return;

//     if (actionToConfirm.type === 'anular') {
//       anularInventarioMutation.mutate(actionToConfirm.inventario.id);
//     } else if (actionToConfirm.type === 'cerrar') {
//       cerrarInventarioMutation.mutate(actionToConfirm.inventario.id);
//     }

//     setShowConfirmModal(false);
//     setActionToConfirm(null);
//   };

//   const handleBusquedaItems = (busqueda: string) => {
//     setBusquedaItems(busqueda);
//   };

//   const handleRefetchItems = () => {
//     if (inventarioSeleccionado) {
//       refetchItems();
//     }
//   };

//   const handleSelectInventario = (inventario: Inventario) => {
//     setInventarioSeleccionado(inventario);
//     setSelectedFilter(null); // Limpiar filtro al cambiar inventario
//   };

//   const handleSelectFilter = (tipo: string, valor: number) => {
//     if (tipo === "" || valor === 0) {
//       setSelectedFilter(null);
//       return;
//     }

//     // Buscar el nombre del filtro seleccionado
//     let nombre = "";
//     switch (tipo) {
//       case "1":
//         const categoria = categorias.find(cat => cat.id === valor);
//         nombre = categoria?.nombre || categoria?.descripcion || "";
//         break;
//       case "4":
//         const marca = marcas.find(m => m.id === valor);
//         nombre = marca?.nombre || marca?.descripcion || "";
//         break;
//       case "5":
//         const seccion = secciones.find(s => s.id === valor);
//         nombre = seccion?.nombre || seccion?.descripcion || "";
//         break;
//       case "3":
//         const ubicacion = ubicaciones.find(u => u.ub_codigo === valor);
//         nombre = ubicacion?.ub_descripcion || "";
//         break;
//     }

//     setSelectedFilter({ tipo, valor, nombre });
//   };

//   // Cálculos
//   const totalInventariado = items.filter((item: Item) => 
//     item.cantidad_final > 0
//   ).length;

//   const porcentajeCompletado = items.length > 0 
//     ? ((totalInventariado / items.length) * 100).toFixed(1)
//     : "0";

//   const getInventarioStatus = (inventario: Inventario) => {
//     if (inventario.autorizado === 1) return { text: "Autorizado", color: "bg-emerald-500", icon: CheckCircle };
//     if (inventario.estado === 0) return { text: "En Progreso", color: "bg-blue-500", icon: Clock };
//     if (inventario.estado === 1) return { text: "Completado", color: "bg-green-500", icon: CheckCircle };
//     return { text: "Anulado", color: "bg-red-500", icon: AlertCircle };
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//       {/* Header con gradiente moderno */}
//       <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-lg">
//         <div className="container mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="p-2 bg-white/20 rounded-lg">
//                 <ArchiveRestore className="w-6 h-6" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold">Sistema de Inventarios</h1>
//                 <p className="text-blue-100 text-sm">Gestión inteligente de stock</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
//                 <Settings className="w-5 h-5" />
//               </button>
//               <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
//                 <Users className="w-4 h-4" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-6 py-6">
//         {/* Dashboard Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Inventarios Activos</p>
//                 <p className="text-2xl font-bold text-gray-900">{inventarios.length}</p>
//               </div>
//               <div className="p-3 bg-blue-100 rounded-lg">
//                 <Package className="w-6 h-6 text-blue-600" />
//               </div>
//             </div>
//             <div className="mt-4 flex items-center text-sm text-gray-500">
//               <TrendingUp className="w-4 h-4 mr-1" />
//               <span>+12% desde el mes pasado</span>
//             </div>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Items Pendientes</p>
//                 <p className="text-2xl font-bold text-gray-900">{items.length - totalInventariado}</p>
//               </div>
//               <div className="p-3 bg-orange-100 rounded-lg">
//                 <Clock className="w-6 h-6 text-orange-600" />
//               </div>
//             </div>
//             <div className="mt-4 flex items-center text-sm text-gray-500">
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div 
//                   className="bg-orange-500 h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${porcentajeCompletado}%` }}
//                 />
//               </div>
//             </div>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Completado</p>
//                 <p className="text-2xl font-bold text-gray-900">{porcentajeCompletado}%</p>
//               </div>
//               <div className="p-3 bg-green-100 rounded-lg">
//                 <CheckCircle className="w-6 h-6 text-green-600" />
//               </div>
//             </div>
//             <div className="mt-4 flex items-center text-sm text-gray-500">
//               <span>{totalInventariado} de {items.length} items</span>
//             </div>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4 }}
//             className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Inventario Actual</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   #{inventarioSeleccionado?.nroInventario || "N/A"}
//                 </p>
//               </div>
//               <div className="p-3 bg-purple-100 rounded-lg">
//                 <BarChart3 className="w-6 h-6 text-purple-600" />
//               </div>
//             </div>
//             <div className="mt-4 flex items-center text-sm text-gray-500">
//               {inventarioSeleccionado && (
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                   getInventarioStatus(inventarioSeleccionado).color
//                 } text-white`}>
//                   {getInventarioStatus(inventarioSeleccionado).text}
//                 </span>
//               )}
//             </div>
//           </motion.div>
//         </div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           {/* Sidebar */}
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.5 }}
//             className="lg:col-span-1"
//           >
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-lg font-semibold text-gray-900">Configuración</h2>
//                 <button 
//                   onClick={() => setSidebarOpen(!sidebarOpen)}
//                   className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
//                 >
//                   <Settings className="w-4 h-4 text-gray-500" />
//                 </button>
//               </div>

//               <AnimatePresence>
//                 {sidebarOpen && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     exit={{ opacity: 0, height: 0 }}
//                     transition={{ duration: 0.3 }}
//                     className="space-y-4"
//                   >
//                     {/* Fecha */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         <Calendar className="w-4 h-4 inline mr-2" />
//                         Fecha
//                       </label>
//                       <input
//                         type="date"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         value={fechaActual.toISOString().split("T")[0]}
//                         onChange={(e) => setFechaActual(new Date(e.target.value))}
//                       />
//                     </div>

//                     {/* Sucursal */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         <Building2 className="w-4 h-4 inline mr-2" />
//                         Sucursal
//                       </label>
//                       <select
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         value={sucursalSeleccionada?.id}
//                         onChange={(e) =>
//                           setSucursalSeleccionada(
//                             sucursales?.find(
//                               (sucursal) => sucursal.id === parseInt(e.target.value)
//                             ) || null
//                           )
//                         }
//                       >
//                         {sucursales?.map((sucursal) => (
//                           <option key={sucursal.id} value={sucursal.id}>
//                             {sucursal.descripcion}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Depósito */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         <Package className="w-4 h-4 inline mr-2" />
//                         Depósito
//                       </label>
//                       <select
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         value={depositoSeleccionado?.dep_codigo}
//                         onChange={(e) =>
//                           setDepositoSeleccionado(
//                             depositos?.find(
//                               (deposito) =>
//                                 deposito.dep_codigo === parseInt(e.target.value)
//                             ) || null
//                           )
//                         }
//                       >
//                         {depositos?.map((deposito) => (
//                           <option key={deposito.dep_codigo} value={deposito.dep_codigo}>
//                             {deposito.dep_descripcion}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Tipo de Inventario */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         <Filter className="w-4 h-4 inline mr-2" />
//                         Tipo de Inventario
//                       </label>
//                       <div className="space-y-2">
//                         {[
//                           { value: "1", label: "Por Categoría", icon: "📂" },
//                           { value: "2", label: "Por Artículo", icon: "📦" },
//                           { value: "3", label: "Por Ubicación", icon: "📍" },
//                           { value: "4", label: "Por Marca", icon: "🏷️" },
//                           { value: "5", label: "Por Sección", icon: "📋" }
//                         ].map((tipo) => (
//                           <label key={tipo.value} className="flex items-center space-x-3 cursor-pointer">
//                             <input
//                               type="radio"
//                               value={tipo.value}
//                               checked={tipoInventario === tipo.value}
//                               onChange={(e) => setTipoInventario(e.target.value)}
//                               className="text-blue-600 focus:ring-blue-500"
//                             />
//                             <span className="text-sm text-gray-700">
//                               {tipo.icon} {tipo.label}
//                             </span>
//                           </label>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Acciones */}
//                     <div className="pt-4 border-t border-gray-200">
//                       <button
//                         onClick={handleCreateInventario}
//                         disabled={createInventarioMutation.isPending}
//                         className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
//                       >
//                         {createInventarioMutation.isPending ? (
//                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                         ) : (
//                           <Plus className="w-4 h-4" />
//                         )}
//                         <span>Crear Inventario</span>
//                       </button>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </motion.div>

//           {/* Main Content Area */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6 }}
//             className="lg:col-span-3"
//           >
//             {/* Toolbar */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                     <input
//                       type="text"
//                       placeholder="Buscar items..."
//                       value={busquedaItems}
//                       onChange={(e) => handleBusquedaItems(e.target.value)}
//                       className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
//                     />
//                   </div>
//                   <button
//                     onClick={handleRefetchItems}
//                     disabled={itemsLoading}
//                     className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
//                   >
//                     <RotateCcw className="w-4 h-4" />
//                   </button>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <button
//                     onClick={() => setViewMode('grid')}
//                     className={`p-2 rounded-lg transition-colors ${
//                       viewMode === 'grid' 
//                         ? 'bg-blue-100 text-blue-600' 
//                         : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
//                     }`}
//                   >
//                     <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
//                       <div className="bg-current rounded-sm"></div>
//                       <div className="bg-current rounded-sm"></div>
//                       <div className="bg-current rounded-sm"></div>
//                       <div className="bg-current rounded-sm"></div>
//                     </div>
//                   </button>
//                   <button
//                     onClick={() => setViewMode('list')}
//                     className={`p-2 rounded-lg transition-colors ${
//                       viewMode === 'list' 
//                         ? 'bg-blue-100 text-blue-600' 
//                         : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
//                     }`}
//                   >
//                     <div className="w-4 h-4 space-y-1">
//                       <div className="bg-current h-0.5 rounded"></div>
//                       <div className="bg-current h-0.5 rounded"></div>
//                       <div className="bg-current h-0.5 rounded"></div>
//                     </div>
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Content */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//               {viewMode === 'grid' ? (
//                 <div className="p-6">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Items del Inventario</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {items.map((item: Item) => (
//                       <motion.div
//                         key={item.lote_id}
//                         initial={{ opacity: 0, scale: 0.95 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
//                       >
//                         <div className="flex items-start justify-between mb-2">
//                           <h4 className="font-medium text-gray-900 truncate">{item.descripcion}</h4>
//                           <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
//                             {item.cod_interno}
//                           </span>
//                         </div>
//                         <div className="space-y-2 text-sm text-gray-600">
//                           <div className="flex justify-between">
//                             <span>Ubicación:</span>
//                             <span className="font-medium">{item.ubicacion}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span>Cantidad Final:</span>
//                             <span className="font-medium">{item.cantidad_final || 0}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span>Stock Actual:</span>
//                             <span className="font-medium">{item.cantidad_actual || 0}</span>
//                           </div>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <ItemsTable
//                   items={items}
//                   isLoading={itemsLoading}
//                   inventarioSeleccionado={inventarioSeleccionado}
//                   onUpdateItem={createItemMutation.mutate}
//                   isUpdating={createItemMutation.isPending}
//                 />
//               )}
//             </div>
//           </motion.div>
//         </div>

//         {/* Panel de Estadísticas y Filtros */}
//         <div className="mt-6">
//           <InventarioStats
//             totalItems={items.length}
//             totalInventariado={totalInventariado}
//             porcentajeCompletado={porcentajeCompletado}
//             inventarioSeleccionado={inventarioSeleccionado}
//             inventarios={inventarios as Inventario[]}
//             tipoInventario={tipoInventario}
//             onSelectInventario={handleSelectInventario}
//             onSelectFilter={handleSelectFilter}
//             selectedFilter={selectedFilter}
//             categorias={categorias}
//             marcas={marcas}
//             secciones={secciones}
//             ubicaciones={ubicaciones}
//           />
//         </div>
//       </div>

//       {/* Modal de confirmación */}
//       <ConfirmModal
//         isOpen={showConfirmModal}
//         onClose={() => {
//           setShowConfirmModal(false);
//           setActionToConfirm(null);
//         }}
//         onConfirm={handleConfirmAction}
//         title={`Confirmar ${actionToConfirm?.type === 'anular' ? 'anulación' : 'cierre'}`}
//         message={`¿Estás seguro de querer ${actionToConfirm?.type === 'anular' ? 'anular' : 'cerrar'} el inventario?`}
//       />
//     </div>
//   );
// };

// export default InventarioPannel;