import { memo } from "react";
import { Search } from "lucide-react";

// Componente completamente separado para el input de búsqueda de ubicaciones
export const SearchUbicacionesInput = memo(({ 
  searchTerm, 
  onSearchChange 
}: { 
  searchTerm: string; 
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
}) => (
  <div className="flex items-center gap-2">
    <Search size={20} className="text-gray-400" />
    <input
      type="text"
      placeholder="Buscar ubicaciones..."
      value={searchTerm}
      onChange={onSearchChange}
      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
));

SearchUbicacionesInput.displayName = 'SearchUbicacionesInput';

// Componente completamente separado para el input de búsqueda de ubicaciones agrupadas
export const SearchUbicacionesAgrupadasInput = memo(({ 
  onSearchChange 
}: { 
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
}) => (
  <div className="flex items-center gap-2">
    <Search size={20} className="text-gray-400" />
    <input
      type="text"
      placeholder="Buscar en zona..."
      onChange={onSearchChange}
      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
));

SearchUbicacionesAgrupadasInput.displayName = 'SearchUbicacionesAgrupadasInput';

// Componente completamente separado para el input de búsqueda de items
export const SearchItemsInput = memo(({ 
  onSearchChange 
}: { 
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
}) => (
  <div className="flex items-center gap-2">
    <Search size={20} className="text-gray-400" />
    <input
      type="text"
      placeholder="Buscar items..."
      onChange={onSearchChange}
      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
));

SearchItemsInput.displayName = 'SearchItemsInput';