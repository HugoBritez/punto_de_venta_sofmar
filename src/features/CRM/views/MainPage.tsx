import { CRMNav } from "../components/CRMNav"
import { useState, useRef, useEffect } from "react"
import { ContactoCRM } from "../types/contactos.type"
import { ContactoCard } from "../components/ContactoCard"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Search, Filter, Calendar, Users, Kanban } from "lucide-react"
import ProjectCanvas from "../components/ProjectCanvas"
import { ProyectoForm } from "../components/ProyectoForm"
import { useActualizarOportunidad, useAgendamientos, useOportunidades } from "../hooks/useCRM"
import { useAuth } from "@/services/AuthContext"
import { useQueryClient } from "@tanstack/react-query"
import { CalendarView } from "../components/CalendarView"
import { MainDashboard } from "../components/MainDashboard"
import { MobileView } from "./MobileView"

// Definir los tipos de tabs disponibles
type TabType = "kanban" | "tabla" | "resumen"

interface TabConfig {
    id: TabType
    label: string
    icon: React.ComponentType<{ className?: string }>
    description: string
}

const TABS: TabConfig[] = [
    {
        id: "kanban",
        label: "Vista Kanban",
        icon: Kanban,
        description: "Gestión visual de oportunidades"
    },
    {
        id: "resumen",
        label: "Resumen",
        icon: Calendar,
        description: "Estadísticas y métricas"
    }
]

export const ModuloCRM = () => {
    const [selectedContacto, setSelectedContacto] = useState<ContactoCRM | null>(null)
    const [isProyectoFormOpen, setIsProyectoFormOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [isFiltrosOpen, setIsFiltrosOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<TabType>("kanban")
    const [isMobile, setIsMobile] = useState(false)
    
    // Fechas por defecto: último mes
    const getFechaPorDefecto = () => {
        const hoy = new Date();
        const haceUnMes = new Date();
        haceUnMes.setMonth(hoy.getMonth() - 1);
        return {
            desde: haceUnMes.toISOString().split('T')[0],
            hasta: hoy.toISOString().split('T')[0]
        };
    };

    const fechasPorDefecto = getFechaPorDefecto();
    const [fechaDesde, setFechaDesde] = useState<string>(fechasPorDefecto.desde)
    const [fechaHasta, setFechaHasta] = useState<string>(fechasPorDefecto.hasta)
    const [filtroProyectos, setFiltroProyectos] = useState<"todos" | "generales" | "mios">("todos")
    const cardRef = useRef<HTMLDivElement>(null)

    const auth = useAuth();
    const operador = Number(auth.auth?.userId);
    const esAdmin = auth.auth?.rol === 7;

    // Convertir fechas string a Date para el hook
    const fechaDesdeDate = fechaDesde ? new Date(fechaDesde + 'T00:00:00') : undefined;
    const fechaHastaDate = fechaHasta ? new Date(fechaHasta + 'T23:59:59') : undefined;

    const { data: oportunidades, isLoading: isLoadingOportunidades } = useOportunidades(
        esAdmin, 
        operador, 
        fechaDesdeDate, 
        fechaHastaDate
    );

    const { data: agendamientos} = useAgendamientos();
    

    const actualizarOportunidad = useActualizarOportunidad();
    const queryClient = useQueryClient();

    // Detectar si es dispositivo móvil
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 1024) // lg breakpoint
        }

        checkIsMobile()
        window.addEventListener('resize', checkIsMobile)

        return () => window.removeEventListener('resize', checkIsMobile)
    }, [])

    const handleContactoClick = (contacto: ContactoCRM) => {
        setSelectedContacto(contacto)
    }

    const handleCloseCard = () => {
        setSelectedContacto(null)
    }

    const handleCrearProyecto = () => {
        setIsProyectoFormOpen(true)
    }

    const handleProyectoCreated = () => {
        queryClient.invalidateQueries({ queryKey: ["oportunidades"] });
    }

    const handleOportunidadMove = async (oportunidadId: number, nuevoEstado: number) => {
        try {
            await actualizarOportunidad.mutateAsync({
                codigo: oportunidadId,
                estado: nuevoEstado,
                autorizadoPor: operador
            });
        } catch (error) {
            console.error('Error al actualizar oportunidad:', error);
        }
    }

    // Filtrar oportunidades basado en la búsqueda y filtros
    const oportunidadesFiltradas = oportunidades?.filter(oportunidad => {
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            const coincideBusqueda = (
                oportunidad.titulo?.toLowerCase().includes(searchLower) ||
                oportunidad.clienteNombre?.toLowerCase().includes(searchLower) ||
                oportunidad.descripcion?.toLowerCase().includes(searchLower) ||
                oportunidad.valorNegociacion?.toString().includes(searchTerm)
            );
            if (!coincideBusqueda) return false;
        }

        if (filtroProyectos === "generales") {
            if (oportunidad.general !== 1) return false;
        } else if (filtroProyectos === "mios") {
            if (oportunidad.operador !== operador) return false;
        }

        return true;
    }) || [];

    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
    }

    const handleClearSearch = () => {
        setSearchTerm("")
    }

    const limpiarFiltros = () => {
        const fechasDefecto = getFechaPorDefecto();
        setFechaDesde(fechasDefecto.desde)
        setFechaHasta(fechasDefecto.hasta)
        setFiltroProyectos("todos")
    }

    const tieneFiltrosActivos = () => {
        const fechasDefecto = getFechaPorDefecto();
        const esRangoPorDefecto = fechaDesde === fechasDefecto.desde && fechaHasta === fechasDefecto.hasta;
        return !esRangoPorDefecto || filtroProyectos !== "todos"
    }

    const handleFechaDesdeChange = (fecha: string) => {
        setFechaDesde(fecha)
        if (fecha && fechaHasta && fecha > fechaHasta) {
            setFechaHasta("")
        }
    }

    const handleFechaHastaChange = (fecha: string) => {
        setFechaHasta(fecha)
        if (fecha && fechaDesde && fecha < fechaDesde) {
            setFechaDesde("")
        }
    }

    // Manejar clic fuera del card
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                handleCloseCard()
            }
        }

        if (selectedContacto) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [selectedContacto])

    // Renderizar el contenido de la tab activa
    const renderMainContent = () => {
        if (isLoadingOportunidades) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600">
                            Cargando oportunidades del {fechaDesde} al {fechaHasta}...
                        </span>
                    </div>
                </div>
            )
        }

        switch (activeTab) {
            case "kanban":
                return (
                    <ProjectCanvas 
                        oportunidades={oportunidadesFiltradas}
                        onOportunidadMove={handleOportunidadMove}
                    />
                )
            case "tabla":
                return (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-gray-600 mb-2">Componente de Tabla</p>
                        </div>
                    </div>
                )
            case "resumen":
                return (
                    <MainDashboard
                        oportunidades={oportunidadesFiltradas}
                    />
                )
            default:
                return null
        }
    }

    // Si es móvil, mostrar MobileView
    if (isMobile) {
        return (
            <MobileView
                oportunidades={oportunidadesFiltradas}
                agendamientos={agendamientos || []}
                contactos={[]} // Agregar esta prop si es necesaria
                isLoadingOportunidades={isLoadingOportunidades}
                searchTerm={searchTerm}
                isSearchFocused={isSearchFocused}
                isFiltrosOpen={isFiltrosOpen}
                fechaDesde={fechaDesde}
                fechaHasta={fechaHasta}
                filtroProyectos={filtroProyectos}
                tieneFiltrosActivos={tieneFiltrosActivos()}
                isProyectoFormOpen={isProyectoFormOpen}
                operador={operador}
                esAdmin={esAdmin}
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}
                onSearchFocus={() => setIsSearchFocused(true)}
                onSearchBlur={() => setIsSearchFocused(false)}
                onFiltrosToggle={() => setIsFiltrosOpen(!isFiltrosOpen)}
                onFechaDesdeChange={handleFechaDesdeChange}
                onFechaHastaChange={handleFechaHastaChange}
                onFiltroProyectosChange={setFiltroProyectos}
                onLimpiarFiltros={limpiarFiltros}
                onCrearProyecto={handleCrearProyecto}
                onProyectoFormClose={() => setIsProyectoFormOpen(false)}
                onProyectoCreated={handleProyectoCreated}
                onOportunidadMove={handleOportunidadMove}
                onContactoClick={handleContactoClick} // Agregar esta prop faltante
            />
        )
    }

    // Desktop view - mantener la estructura original
    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
                    <p className="text-md font-medium text-gray-600">Gestión de Relaciones con Clientes y Oportunidades de Venta</p>
                </div>
                
                {/* Campo de búsqueda y filtros */}
                <div className="flex items-center gap-3">
                    {/* Campo de búsqueda */}
                    <div className="relative w-full max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar proyecto por título, cliente o descripción..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className={`
                                    w-full pl-10 pr-10 py-2.5 rounded-lg border transition-all duration-200
                                    ${isSearchFocused 
                                        ? 'border-blue-500 bg-white shadow-lg ring-2 ring-blue-500/20' 
                                        : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-gray-400'
                                    }
                                    focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                `}
                            />
                            {searchTerm && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Botón de filtros */}
                    <div className="relative">
                        <button
                            onClick={() => setIsFiltrosOpen(!isFiltrosOpen)}
                            className={`
                                flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200
                                ${tieneFiltrosActivos()
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 bg-white hover:border-gray-400'
                                }
                            `}
                        >
                            <Filter className="w-4 h-4" />
                            <span className="text-sm font-medium">Filtros</span>
                            {tieneFiltrosActivos() && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                        </button>

                        {/* Panel de filtros */}
                        <AnimatePresence>
                            {isFiltrosOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                                >
                                    <div className="p-4">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-gray-900">Filtros</h3>
                                            <div className="flex items-center gap-2">
                                                {tieneFiltrosActivos() && (
                                                    <button
                                                        onClick={limpiarFiltros}
                                                        className="text-xs text-gray-500 hover:text-gray-700"
                                                    >
                                                        Restablecer
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setIsFiltrosOpen(false)}
                                                    className="p-1 rounded-full hover:bg-gray-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Filtro de fechas */}
                                        <div className="mb-4">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                                <Calendar className="w-4 h-4" />
                                                Rango de fechas
                                            </label>
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Desde</label>
                                                    <input
                                                        type="date"
                                                        value={fechaDesde}
                                                        onChange={(e) => handleFechaDesdeChange(e.target.value)}
                                                        max={fechaHasta || undefined}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Hasta</label>
                                                    <input
                                                        type="date"
                                                        value={fechaHasta}
                                                        onChange={(e) => handleFechaHastaChange(e.target.value)}
                                                        min={fechaDesde || undefined}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                {/* Botones de rangos rápidos */}
                                                <div className="flex gap-1 mt-2">
                                                    <button
                                                        onClick={() => {
                                                            const fechas = getFechaPorDefecto();
                                                            setFechaDesde(fechas.desde);
                                                            setFechaHasta(fechas.hasta);
                                                        }}
                                                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                                    >
                                                        Último mes
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const hoy = new Date();
                                                            const haceUnaSemana = new Date();
                                                            haceUnaSemana.setDate(hoy.getDate() - 7);
                                                            setFechaDesde(haceUnaSemana.toISOString().split('T')[0]);
                                                            setFechaHasta(hoy.toISOString().split('T')[0]);
                                                        }}
                                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                                    >
                                                        Última semana
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const hoy = new Date();
                                                            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                                                            setFechaDesde(inicioMes.toISOString().split('T')[0]);
                                                            setFechaHasta(hoy.toISOString().split('T')[0]);
                                                        }}
                                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                                    >
                                                        Este mes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Filtro de proyectos */}
                                        <div className="mb-4">
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                                <Users className="w-4 h-4" />
                                                Tipo de proyectos
                                            </label>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="filtroProyectos"
                                                        value="todos"
                                                        checked={filtroProyectos === "todos"}
                                                        onChange={(e) => setFiltroProyectos(e.target.value as any)}
                                                        className="text-blue-600"
                                                    />
                                                    <span className="text-sm">Todos los proyectos</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="filtroProyectos"
                                                        value="generales"
                                                        checked={filtroProyectos === "generales"}
                                                        onChange={(e) => setFiltroProyectos(e.target.value as any)}
                                                        className="text-blue-600"
                                                    />
                                                    <span className="text-sm">Solo generales</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="filtroProyectos"
                                                        value="mios"
                                                        checked={filtroProyectos === "mios"}
                                                        onChange={(e) => setFiltroProyectos(e.target.value as any)}
                                                        className="text-blue-600"
                                                    />
                                                    <span className="text-sm">Solo míos</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <button
                    onClick={handleCrearProyecto}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Proyecto</span>
                </button>
            </div>

            {/* Sistema de Tabs - Solo para la sección principal */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-4">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {TABS.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 relative
                                        ${isActive 
                                            ? 'border-blue-500 text-blue-600' 
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </button>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="flex flex-row flex-1 p-2 gap-2 relative">
                {/* Sección principal con tabs */}
                <div className="flex flex-col gap-2 p-2 bg-blue-100 shadow-sm w-full rounded-md">
                    {renderMainContent()}
                </div>
                
                {/* CalendarView siempre visible */}
                <CalendarView oportunidades={oportunidadesFiltradas} agendamientos={agendamientos || []} />
                
                <div className="relative">
                    <CRMNav onContactoClick={handleContactoClick} />

                    {/* Backdrop y Card flotante */}
                    <AnimatePresence>
                        {selectedContacto && (
                            <>
                                {/* Backdrop */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                                />
                                {/* Card flotante */}
                                <motion.div 
                                    ref={cardRef}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute -left-[26rem] top-10 z-50"
                                >
                                    <div className="relative">
                                        <button
                                            onClick={handleCloseCard}
                                            className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <ContactoCard contacto={selectedContacto} />
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modal de Creación de Proyecto */}
            <ProyectoForm
                isOpen={isProyectoFormOpen}
                onClose={() => setIsProyectoFormOpen(false)}
                onSuccess={handleProyectoCreated}
                operador={operador}
                esAdmin={esAdmin}
            />
        </div>
    )
}