import { ContactosRow } from "../ContactosRow"
import { ContactoCRM, ContactoCRMModel } from "../../types/contactos.type"
import { Search, Plus, Users } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useContactos } from "../../hooks/useCRM"
import { ContactoForm } from "../CreateContactoForm"
import { MobileContactoCard } from "./MobileContactoCard"
import { useAuth } from "@/services/AuthContext"

interface ContactosMobileProps {
    onContactoClick: (contacto: ContactoCRM) => void;
}

export const ContactosMobile = ({ onContactoClick }: ContactosMobileProps) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedContacto, setSelectedContacto] = useState<ContactoCRM | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [editingContacto, setEditingContacto] = useState<ContactoCRMModel | null>(null)

    const auth = useAuth();

    const operador = Number(auth.auth?.userId);
    const esAdmin = auth.auth?.rol === 7;
        
    const { data: contactos = [], isLoading, error, isError } = useContactos(operador, esAdmin)

    // Asegurar que contactos sea siempre un array de ContactoCRM
    const contactosArray: ContactoCRM[] = Array.isArray(contactos) ? contactos : []

    const filteredContactos: ContactoCRM[] = contactosArray.filter((contacto: ContactoCRM) =>
        contacto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contacto.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleContactoClick = (contacto: ContactoCRM) => {
        setSelectedContacto(contacto)
        onContactoClick(contacto)
    }

    const handleBackToList = () => {
        setSelectedContacto(null)
        onContactoClick(null as any)
    }

    const handleCreateContacto = () => {
        setEditingContacto(null)
        setShowForm(true)
    }

    const handleEditContacto = (contacto: ContactoCRMModel, e: React.MouseEvent) => {
        e.stopPropagation()
        setEditingContacto(contacto)
        setShowForm(true)
    }

    const handleFormClose = () => {
        setShowForm(false)
        setEditingContacto(null)
    }

    const handleFormSuccess = () => {
        setShowForm(false)
        setEditingContacto(null)
        // No resetear selectedContacto aquí para mantener la vista del detalle
    }

    const handleContactoUpdated = () => {
        // Refrescar la lista cuando se actualiza un contacto
        // El hook useContactos se encargará de refetch automáticamente
    }

    if (isError && error) {
        console.error("Error en ContactosMobile:", error);
        return (
            <div className="flex flex-col h-full bg-white">
                {/* Header de error */}
                <div className="bg-red-500 text-white px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">Contactos</h1>
                        <p className="text-sm opacity-90">Error al cargar</p>
                    </div>
                </div>
                
                {/* Contenido de error */}
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Error</h2>
                        <p className="text-sm text-gray-600 mb-4">Error al cargar los contactos</p>
                        <p className="text-xs text-gray-500">
                            {error instanceof Error ? error.message : 'Error desconocido'}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Si hay un contacto seleccionado, mostrar el detalle
    if (selectedContacto) {
        return (
            <MobileContactoCard 
                contacto={selectedContacto}
                onContactoUpdated={handleContactoUpdated}
                onBack={handleBackToList}
            />
        )
    }

    return (
        <>
            <div className="flex flex-col h-full bg-white">
                {/* Header móvil */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Contactos</h1>
                                <p className="text-sm opacity-90">
                                    {isLoading ? "Cargando..." : `${filteredContactos.length} contactos`}
                                </p>
                            </div>
                        </div>
                        
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCreateContacto}
                            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Crear</span>
                        </motion.button>
                    </div>

                    {/* Búsqueda móvil */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                        <input 
                            type="text" 
                            placeholder="Buscar contacto..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border-0 bg-white/20 text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:bg-white/30 transition-all"
                        />
                    </div>
                </div>

                {/* Lista de contactos */}
                <div className="flex-1 mb-16 overflow-hidden bg-gray-50">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600 font-medium">Cargando contactos...</p>
                                <p className="text-sm text-gray-500 mt-1">Por favor espera</p>
                            </div>
                        </div>
                    ) : filteredContactos.length > 0 ? (
                        <div className="h-full overflow-y-auto">
                            <div className="p-4 space-y-3">
                                <AnimatePresence>
                                    {filteredContactos.map((contacto: ContactoCRM, index: number) => (
                                        <motion.div
                                            key={`contacto-${contacto.codigo}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ 
                                                duration: 0.3, 
                                                delay: index * 0.05 
                                            }}
                                        >
                                            <ContactosRow 
                                                contacto={contacto} 
                                                index={index}
                                                isSelected={(selectedContacto as ContactoCRM | null)?.codigo === contacto.codigo}
                                                onClick={() => handleContactoClick(contacto)}
                                                onEdit={(e: React.MouseEvent) => handleEditContacto(contacto, e)}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full p-6">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="text-center"
                            >
                                <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {searchTerm ? "No se encontraron contactos" : "No hay contactos registrados"}
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                                    {searchTerm 
                                        ? "Intenta con otros términos de búsqueda o verifica la ortografía" 
                                        : "Comienza creando tu primer contacto para gestionar tus relaciones comerciales"
                                    }
                                </p>
                                {!searchTerm && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCreateContacto}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto font-medium"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Crear primer contacto
                                    </motion.button>
                                )}
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* Indicador de estado */}
                {!isLoading && filteredContactos.length > 0 && (
                    <div className="bg-white border-t border-gray-200 px-4 py-2">
                        <p className="text-xs text-gray-500 text-center">
                            {filteredContactos.length} de {contactosArray.length} contactos mostrados
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de formulario */}
            <AnimatePresence>
                {showForm && (
                    <ContactoForm
                        contacto={editingContacto || undefined}
                        onClose={handleFormClose}
                        onSuccess={handleFormSuccess}
                    />
                )}
            </AnimatePresence>
        </>
    )
}
