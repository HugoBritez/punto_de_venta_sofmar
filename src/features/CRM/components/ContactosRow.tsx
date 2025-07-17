import { ContactoCRM } from "../types/contactos.type";
import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";

interface ContactosRowProps {
    contacto: ContactoCRM;
    index: number;
    isSelected?: boolean;
    onClick?: () => void;
    onEdit?: (e: React.MouseEvent) => void;
    onDelete?: (e: React.MouseEvent) => void;
}


export const ContactosRow = ({ 
    contacto, 
    index, 
    isSelected = false, 
    onClick,
    onEdit,
    onDelete 
}: ContactosRowProps) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                ease: "easeOut"
            }}
            whileHover={{ 
                transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`flex flex-row items-center gap-3 p-3 rounded-lg transition-all cursor-pointer border ${
                isSelected 
                    ? 'bg-white border-blue-300 shadow-md' 
                    : 'bg-white hover:bg-white border-blue-200/50'
            }`}
        >
            <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-black'}`}>
                        {contacto.nombre || "Sin nombre"}
                    </h3>
                    
                </div>
                <div className="flex flex-col gap-1">
                    {contacto.empresa && (
                        <p className={`text-sm font-medium ${isSelected ? 'text-blue-800' : 'text-black'}`}>
                            {contacto.empresa}
                        </p>
                    )}
                    {contacto.ruc && (
                        <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-blue-200'}`}>
                            RUC: {contacto.ruc}
                        </p>
                    )}
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                        title="Editar contacto"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                        title="Eliminar contacto"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </motion.div>
    );
};