import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit3, 
  Check, 
  X, 
  AlertTriangle, 
  Package, 
  Calendar,
  Hash,
  TrendingUp,
  Eye
} from "lucide-react";
import { Item } from "../../types/items.type";
import { Inventario } from "../../types/inventario.type";
import { ItemDTO } from "../../types/items.type";

interface ItemsTableProps {
  items: Item[];
  isLoading: boolean;
  inventarioSeleccionado: Inventario | null;
  onUpdateItem: (item: ItemDTO) => void;
  isUpdating: boolean;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  isLoading,
  inventarioSeleccionado,
  onUpdateItem,
}) => {
  const [editingItem, setEditingItem] = useState<{
    id: number;
    field: 'cantidad_final' | 'lote' | 'vencimiento';
    value: string | number;
  } | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Item;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleEditItem = (
    item: Item,
    field: 'cantidad_final' | 'lote' | 'vencimiento',
    value: string | number
  ) => {
    if (!inventarioSeleccionado) return;

    const itemDTO: ItemDTO = {
      idInventario: inventarioSeleccionado.id,
      item: {
        idArticulo: item.articulo_id,
        idLote: item.lote_id,
        lote: field === 'lote' ? value as string : item.lote,
        fechaVencimientoItem: field === 'vencimiento' ? new Date(value as string) : new Date(item.vencimiento),
        cantidadInicial: item.cantidad_inicial,
        cantidadFinal: field === 'cantidad_final' ? value as number : item.cantidad_final,
        codigoBarra: item.cod_barra_articulo
      }
    };

    onUpdateItem(itemDTO);
    setEditingItem(null);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    item: Item,
    field: 'cantidad_final' | 'lote' | 'vencimiento'
  ) => {
    if (e.key === "Enter") {
      handleEditItem(item, field, editingItem?.value || "");
    } else if (e.key === "Escape") {
      setEditingItem(null);
    }
  };

  const handleSort = (key: keyof Item) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedItems = [...items].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusColor = (item: Item) => {
    if (item.cantidad_final > 0) return 'bg-green-100 text-green-800';
    if (item.cantidad_actual > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (item: Item) => {
    if (item.cantidad_final > 0) return 'Inventariado';
    if (item.cantidad_actual > 0) return 'En Stock';
    return 'Sin Stock';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando items...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {items.length} items total
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                {items.filter(item => item.cantidad_final > 0).length} inventariados
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">
                {items.filter(item => item.cantidad_final === 0 && item.cantidad_actual > 0).length} pendientes
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedItems(new Set())}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Limpiar selección
            </button>
            {selectedItems.size > 0 && (
              <span className="text-sm text-gray-500">
                {selectedItems.size} seleccionados
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.size === items.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(new Set(items.map(item => item.lote_id)));
                    } else {
                      setSelectedItems(new Set());
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('descripcion')}
              >
                <div className="flex items-center space-x-1">
                  <span>Descripción</span>
                  {sortConfig?.key === 'descripcion' && (
                    <TrendingUp className={`w-3 h-3 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <Hash className="w-3 h-3" />
                  <span>Código</span>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <Package className="w-3 h-3" />
                  <span>Ubicación</span>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Vencimiento</span>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lote
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                C. Inicial
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                C. Final
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                C. Actual
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {sortedItems.map((item, index) => (
                <motion.tr
                  key={item.lote_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedItems.has(item.lote_id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.lote_id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedItems);
                        if (e.target.checked) {
                          newSelected.add(item.lote_id);
                        } else {
                          newSelected.delete(item.lote_id);
                        }
                        setSelectedItems(newSelected);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {item.descripcion}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.cod_barra_articulo}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.cod_interno}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {item.ubicacion}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.sub_ubicacion}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editingItem?.id === item.lote_id && editingItem.field === 'vencimiento' ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="date"
                          className="w-32 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={editingItem.value as string}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              value: e.target.value,
                            })
                          }
                          autoFocus
                          onKeyDown={(e) => handleKeyDown(e, item, 'vencimiento')}
                        />
                        <button
                          onClick={() => handleEditItem(item, 'vencimiento', editingItem.value)}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors group"
                        onClick={() =>
                          setEditingItem({
                            id: item.lote_id,
                            field: 'vencimiento',
                            value: item.vencimiento || "",
                          })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">
                            {item.vencimiento || "Sin fecha"}
                          </span>
                          <Edit3 className="w-3 h-3 text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingItem?.id === item.lote_id && editingItem.field === 'lote' ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={editingItem.value as string}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              value: e.target.value,
                            })
                          }
                          autoFocus
                          onKeyDown={(e) => handleKeyDown(e, item, 'lote')}
                        />
                        <button
                          onClick={() => handleEditItem(item, 'lote', editingItem.value)}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors group"
                        onClick={() =>
                          setEditingItem({
                            id: item.lote_id,
                            field: 'lote',
                            value: item.lote || "",
                          })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">
                            {item.lote || "Sin lote"}
                          </span>
                          <Edit3 className="w-3 h-3 text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900 font-medium">
                      {item.cantidad_inicial || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {editingItem?.id === item.lote_id && editingItem.field === 'cantidad_final' ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={editingItem.value as number}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              value: parseInt(e.target.value) || 0,
                            })
                          }
                          autoFocus
                          onKeyDown={(e) => handleKeyDown(e, item, 'cantidad_final')}
                        />
                        <button
                          onClick={() => handleEditItem(item, 'cantidad_final', editingItem.value)}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors group"
                        onClick={() =>
                          setEditingItem({
                            id: item.lote_id,
                            field: 'cantidad_final',
                            value: item.cantidad_final || 0,
                          })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {item.cantidad_final || 0}
                          </span>
                          <Edit3 className="w-3 h-3 text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">
                      {item.cantidad_actual === null ? "0" : item.cantidad_actual}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item)}`}>
                      {getStatusText(item)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                        title="Marcar como inventariado"
                        onClick={() => handleEditItem(item, 'cantidad_final', item.cantidad_actual || 0)}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Footer con resumen */}
      {items.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Mostrando {items.length} de {items.length} items
            </span>
            <div className="flex items-center space-x-4">
              <span>
                Total inventariado: {items.filter(item => item.cantidad_final > 0).length}
              </span>
              <span>
                Pendientes: {items.filter(item => item.cantidad_final === 0).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsTable; 