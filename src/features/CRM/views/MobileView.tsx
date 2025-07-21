import { useState } from "react"
import {  OportunidadViewModel } from "../types/oportunidades.type"
import { AgendamientoCRM } from "../types/agendamientos.type"
import { ContactoCRM } from "../types/contactos.type"
import { MobileActionMenu, ActionItem } from "@/shared/components/MobileActionMenu"
import { 
  Home,
  Calendar,
  Users,
  Ellipsis,
  Search,
  Filter,
  X,
  Plus
} from "lucide-react"
import { MobileTab } from "../components/mobile/MobileTab"
import { ContactosMobile } from "../components/mobile/ContactosMobile"
import { CalendarViewMobile } from "../components/mobile/CalendaViewMobile"
import { DetalleProyectoMobile } from "../components/mobile/DetalleProyectoMobile"
import { ProyectoForm } from "../components/ProyectoForm"

export interface MobileViewProps {
    oportunidades: OportunidadViewModel[]
    agendamientos: AgendamientoCRM[]
    contactos: ContactoCRM[]
    isLoadingOportunidades: boolean
    searchTerm: string
    isSearchFocused: boolean
    isFiltrosOpen: boolean
    fechaDesde: string
    fechaHasta: string
    filtroProyectos: "todos" | "generales" | "mios"
    tieneFiltrosActivos: boolean
    isProyectoFormOpen: boolean
    operador: number
    esAdmin: boolean
    onSearchChange: (value: string) => void
    onClearSearch: () => void
    onSearchFocus: () => void
    onSearchBlur: () => void
    onFiltrosToggle: () => void
    onFechaDesdeChange: (fecha: string) => void
    onFechaHastaChange: (fecha: string) => void
    onFiltroProyectosChange: (filtro: "todos" | "generales" | "mios") => void
    onLimpiarFiltros: () => void
    onCrearProyecto: () => void
    onProyectoFormClose: () => void
    onProyectoCreated: () => void
    onOportunidadMove: (oportunidadId: number, nuevoEstado: number) => void
    onContactoClick: (contacto: ContactoCRM) => void
}

export const MobileView = (props: MobileViewProps) => {
    // Estado para controlar qué sección está activa
    const [activeSection, setActiveSection] = useState<'inicio' | 'calendario' | 'contactos' | 'menu'>('inicio')
    
    // Estado para el modal de detalles del proyecto
    const [selectedOportunidad, setSelectedOportunidad] = useState<OportunidadViewModel | null>(null)
    const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false)

    // Acciones del menú de navegación
    const navigationActions: ActionItem[] = [
        {
            icon: Home,
            label: 'Inicio',
            onClick: () => setActiveSection('inicio'),
            variant: activeSection === 'inicio' ? 'primary' : 'secondary'
        },
        {
            icon: Calendar,
            label: 'Calendario',
            onClick: () => setActiveSection('calendario'),
            variant: activeSection === 'calendario' ? 'primary' : 'secondary'
        },
        {
            icon: Users,
            label: 'Contactos',
            onClick: () => setActiveSection('contactos'),
            variant: activeSection === 'contactos' ? 'primary' : 'secondary'
        },
        {
            icon: Ellipsis,
            label: 'Menú',
            onClick: () => setActiveSection('menu'),
            variant: activeSection === 'menu' ? 'primary' : 'secondary'
        }
    ]

    // Obtener el título según la sección activa
    const getSectionTitle = () => {
        switch (activeSection) {
            case 'inicio':
                return 'Inicio'
            case 'calendario':
                return 'Calendario'
            case 'contactos':
                return 'Contactos'
            case 'menu':
                return 'Menú'
            default:
                return 'Inicio'
        }
    }

    // Manejar clic en oportunidad
    const handleOportunidadClick = (oportunidad: OportunidadViewModel) => {
        console.log('📱 Abriendo detalles del proyecto:', oportunidad.titulo)
        setSelectedOportunidad(oportunidad)
        setIsDetalleModalOpen(true)
    }

    // Manejar cierre del modal
    const handleCloseDetalleModal = () => {
        console.log('📱 Cerrando detalles del proyecto')
        setIsDetalleModalOpen(false)
        setSelectedOportunidad(null)
    }

    // Manejar éxito en la actualización del proyecto
    const handleProyectoSuccess = () => {
        console.log('✅ Proyecto actualizado exitosamente')
        // Aquí podrías recargar los datos si es necesario
        // Por ejemplo, invalidar el cache de React Query
    }

    // Renderizar el contenido según la sección activa
    const renderContent = () => {
        switch (activeSection) {
            case 'inicio':
                return (
                    <MobileTab 
                        oportunidades={props.oportunidades}
                        onOportunidadClick={handleOportunidadClick}
                        onOportunidadMove={props.onOportunidadMove}
                    />
                )
            case 'calendario':
                return (
                    <CalendarViewMobile 
                        oportunidades={props.oportunidades}
                        agendamientos={props.agendamientos}
                        onOportunidadClick={handleOportunidadClick}
                    />
                )
            case 'contactos':
                return (
                    <div className="h-full">
                        <ContactosMobile 
                            onContactoClick={props.onContactoClick}
                        />
                    </div>
                )
            case 'menu':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h3 className="text-lg font-semibold text-gray-900">Menú</h3>
                        <p className="text-gray-600 mt-2">Opciones adicionales próximamente</p>
                    </div>
                )
            default:
                return (
                    <MobileTab 
                        oportunidades={props.oportunidades}
                        onOportunidadClick={handleOportunidadClick}
                        onOportunidadMove={props.onOportunidadMove}
                    />
                )
        }
    }

    // Renderizar filtros y búsqueda solo para la sección de inicio
    const renderSearchAndFilters = () => {
        if (activeSection !== 'inicio') return null

        return (
            <div className="bg-white border-b border-gray-200 p-4 space-y-4">
                {/* Campo de búsqueda */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar proyecto..."
                        value={props.searchTerm}
                        onChange={(e) => props.onSearchChange(e.target.value)}
                        onFocus={props.onSearchFocus}
                        onBlur={props.onSearchBlur}
                        className={`
                            w-full pl-10 pr-10 py-3 rounded-lg border transition-all duration-200 text-sm
                            ${props.isSearchFocused 
                                ? 'border-blue-500 bg-white shadow-lg ring-2 ring-blue-500/20' 
                                : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-gray-400'
                            }
                            focus:outline-none focus:ring-2 focus:ring-blue-500/20
                        `}
                    />
                    {props.searchTerm && (
                        <button
                            onClick={props.onClearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Filtros y botón de crear proyecto */}
                <div className="flex items-center gap-3">
                    {/* Botón de filtros */}
                    <button
                        onClick={props.onFiltrosToggle}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 flex-1
                            ${props.tieneFiltrosActivos
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 bg-white hover:border-gray-400 text-gray-700'
                            }
                        `}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filtros</span>
                        {props.tieneFiltrosActivos && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                    </button>

                    {/* Botón de crear proyecto */}
                    <button
                        onClick={props.onCrearProyecto}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Nuevo</span>
                    </button>
                </div>

                {/* Panel de filtros */}
                {props.isFiltrosOpen && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
                        {/* Header de filtros */}
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 text-sm">Filtros</h3>
                            <div className="flex items-center gap-2">
                                {props.tieneFiltrosActivos && (
                                    <button
                                        onClick={props.onLimpiarFiltros}
                                        className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                        Limpiar
                                    </button>
                                )}
                                <button
                                    onClick={props.onFiltrosToggle}
                                    className="p-1 rounded-full hover:bg-gray-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Filtro de fechas */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                <Calendar className="w-4 h-4" />
                                Rango de fechas
                            </label>
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Desde</label>
                                    <input
                                        type="date"
                                        value={props.fechaDesde}
                                        onChange={(e) => props.onFechaDesdeChange(e.target.value)}
                                        max={props.fechaHasta || undefined}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Hasta</label>
                                    <input
                                        type="date"
                                        value={props.fechaHasta}
                                        onChange={(e) => props.onFechaHastaChange(e.target.value)}
                                        min={props.fechaDesde || undefined}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                {/* Botones de rangos rápidos */}
                                <div className="flex gap-1 mt-2">
                                    <button
                                        onClick={() => {
                                            const hoy = new Date();
                                            const haceUnMes = new Date();
                                            haceUnMes.setMonth(hoy.getMonth() - 1);
                                            props.onFechaDesdeChange(haceUnMes.toISOString().split('T')[0]);
                                            props.onFechaHastaChange(hoy.toISOString().split('T')[0]);
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
                                            props.onFechaDesdeChange(haceUnaSemana.toISOString().split('T')[0]);
                                            props.onFechaHastaChange(hoy.toISOString().split('T')[0]);
                                        }}
                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                    >
                                        Última semana
                                    </button>
                                    <button
                                        onClick={() => {
                                            const hoy = new Date();
                                            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                                            props.onFechaDesdeChange(inicioMes.toISOString().split('T')[0]);
                                            props.onFechaHastaChange(hoy.toISOString().split('T')[0]);
                                        }}
                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                    >
                                        Este mes
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filtro de proyectos */}
                        <div>
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
                                        checked={props.filtroProyectos === "todos"}
                                        onChange={(e) => props.onFiltroProyectosChange(e.target.value as any)}
                                        className="text-blue-600"
                                    />
                                    <span className="text-sm">Todos los proyectos</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="filtroProyectos"
                                        value="generales"
                                        checked={props.filtroProyectos === "generales"}
                                        onChange={(e) => props.onFiltroProyectosChange(e.target.value as any)}
                                        className="text-blue-600"
                                    />
                                    <span className="text-sm">Solo generales</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="filtroProyectos"
                                        value="mios"
                                        checked={props.filtroProyectos === "mios"}
                                        onChange={(e) => props.onFiltroProyectosChange(e.target.value as any)}
                                        className="text-blue-600"
                                    />
                                    <span className="text-sm">Solo míos</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header básico - solo mostrar si no estamos en contactos */}
            {activeSection !== 'contactos' && (
                <div className="bg-white p-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">CRM</h1>
                    <p className="text-sm text-gray-600">{getSectionTitle()}</p>
                </div>
            )}

            {/* Filtros y búsqueda - solo para inicio */}
            {renderSearchAndFilters()}

            {/* Contenido principal */}
            <div className={`flex-1 ${activeSection === 'contactos' ? 'p-0' : 'p-1'} overflow-y-auto`}>
                {renderContent()}
            </div>

            {/* Menú de navegación con las 4 opciones */}
            <MobileActionMenu 
                actions={navigationActions}
                variant="default"
            />

            {/* Modal de detalles del proyecto móvil */}
            <DetalleProyectoMobile
                oportunidad={selectedOportunidad}
                isOpen={isDetalleModalOpen}
                onClose={handleCloseDetalleModal}
                onSuccess={handleProyectoSuccess}
            />

            {/* Modal de Creación de Proyecto */}
            <ProyectoForm
                isOpen={props.isProyectoFormOpen}
                onClose={props.onProyectoFormClose}
                onSuccess={props.onProyectoCreated}
                operador={props.operador}
                esAdmin={props.esAdmin}
            />
        </div>
    )
}