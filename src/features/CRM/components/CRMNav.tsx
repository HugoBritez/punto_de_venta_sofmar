import { ContactosRow } from "./ContactosRow"
import { ContactoCRM, ContactoCRMModel } from "../types/contactos.type"
import { Filter, Search, Plus} from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useContactos } from "../hooks/useCRM"
import { ContactoForm } from "./CreateContactoForm"
import { useAuth } from "@/services/AuthContext"

interface CRMNavProps {
    onContactoClick: (contacto: ContactoCRM) => void;
}

export const CRMNav = ({ onContactoClick }: CRMNavProps) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedContacto, setSelectedContacto] = useState<ContactoCRM | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [editingContacto, setEditingContacto] = useState<ContactoCRMModel | null>(null)
    const [isExpanded, setIsExpanded] = useState(true)

    const auth = useAuth();

    const operador = Number(auth.auth?.userId);
    const esAdmin = auth.auth?.rol === 7;
        
    const { data: contactos = [], isLoading, error, isError } = useContactos(operador, esAdmin)

    const filteredContactos = contactos.filter(contacto =>
        contacto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contacto.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleContactoClick = (contacto: ContactoCRM) => {
        setSelectedContacto(contacto)
        onContactoClick(contacto)
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
        setSelectedContacto(null)
        onContactoClick(null as any)
    }

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded)
    }

    if (isError && error) {
        console.error("Error en CRMNav:", error);
        return (
            <motion.nav 
                className="flex flex-col px-4 py-3 gap-3 bg-gradient-to-b from-red-600 to-red-400 rounded-lg h-full shadow-lg relative cursor-pointer"
                animate={{ width: isExpanded ? 384 : 80 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onClick={toggleExpanded}
            >
                <div className="text-white text-center">
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p className="text-sm">Error al cargar los contactos</p>
                    <p className="text-xs mt-2 opacity-75">
                        {error instanceof Error ? error.message : 'Error desconocido'}
                    </p>
                </div>
            </motion.nav>
        )
    }

    return (
        <>
            <motion.nav 
                className="flex flex-col px-4 py-3 gap-3 bg-gradient-to-b from-blue-600 to-blue-400 rounded-lg h-full shadow-lg relative overflow-hidden cursor-pointer"
                animate={{ width: isExpanded ? 384 : 80 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onClick={toggleExpanded}
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <AnimatePresence mode="wait">
                        {isExpanded ? (
                            <motion.h2 
                                key="title"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="text-white text-xl font-bold"
                            >
                                Contactos
                            </motion.h2>
                        ) : (
                            <motion.div
                                key="icon"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="w-12 h-8 bg-white/20 rounded-lg flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.button 
                                key="create-button"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleCreateContacto()
                                }}
                                className="bg-white text-blue-500 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Crear
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
                
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-b border-blue-400"
                        />
                    )}
                </AnimatePresence>
                
                {/* Búsqueda mejorada */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                            <input 
                                type="text" 
                                placeholder="Buscar contacto..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-md border-0 bg-blue-400/30 text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:bg-blue-400/50 transition-all"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filtro simple */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4 text-white" />
                            <span className="text-white text-sm">Filtros</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Lista de contactos con animaciones */}
                <div 
                    className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-400/20 hover:scrollbar-thumb-blue-200" 
                    onClick={(e) => e.stopPropagation()}
                >
                    {isLoading ? (
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-center py-8 text-blue-200"
                                >
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                    <p className="text-sm">Cargando contactos...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    ) : (
                        <>
                            <AnimatePresence>
                                {isExpanded && filteredContactos.length > 0 && (
                                    <>
                                        {filteredContactos.map((contacto, index) => (
                                            <ContactosRow 
                                                key={contacto.codigo} 
                                                contacto={contacto} 
                                                index={index}
                                                isSelected={selectedContacto?.codigo === contacto.codigo}
                                                onClick={() => handleContactoClick(contacto)}
                                                onEdit={(e: React.MouseEvent) => handleEditContacto(contacto, e)}
                                            />
                                        ))}
                                    </>
                                )}
                            </AnimatePresence>
                            
                            <AnimatePresence>
                                {isExpanded && filteredContactos.length === 0 && (
                                    <motion.div 
                                        key="no-contacts"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col items-center justify-center py-8 text-blue-200 flex-1"
                                    >
                                        <div className="mb-4">
                                            <div className="w-12 h-12 mx-auto bg-blue-300/20 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-medium mb-1">
                                            {searchTerm ? "No se encontraron contactos" : "No hay contactos registrados"}
                                        </h3>
                                        <p className="text-xs text-blue-300 text-center">
                                            {searchTerm 
                                                ? "Intenta con otros términos de búsqueda" 
                                                : "Comienza creando tu primer contacto"
                                            }
                                        </p>
                                        {!searchTerm && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleCreateContacto()
                                                }}
                                                className="mt-3 bg-white text-blue-500 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1 text-xs font-medium"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Crear contacto
                                            </motion.button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
            </motion.nav>

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