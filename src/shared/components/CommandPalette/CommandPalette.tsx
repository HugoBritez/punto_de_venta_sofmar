// import { useState, useEffect, useCallback, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { PanelBottomOpen, Search } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { useAuthStore } from '../../stores/authStore';
// import { menuItems, filterMenuItemsByPermissions, hasMenuAccess } from '../Sidebar/menuItems';
// import React from 'react';

// interface CommandItem {
//   id: string;
//   name: string;
//   icon?: React.ComponentType;
//   path?: string;
//   group: string;
//   shortcut?: string;
//   subItems?: CommandItem[];
// }

// interface CommandPaletteProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onOpen: () => void;
// }

// const commandPaletteStyles = {
//   container: "fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-2xl bg-white rounded-lg shadow-xs border border-gray-200 z-50 overflow-hidden",
//   header: "flex items-center gap-2 p-4 border-b border-gray-100",
//   searchInput: "flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400",
//   resultsContainer: "max-h-96 overflow-y-auto",
//   noResults: "p-4 text-center text-gray-500",
//   item: "w-full px-4 py-2 flex items-center gap-3 transition-colors",
//   itemSelected: "bg-blue-50",
//   itemHover: "hover:bg-gray-50",
//   itemIcon: "w-5 h-5 text-gray-400",
//   itemContent: "flex-1 text-left",
//   itemName: "text-md font-bold text-gray-700",
//   itemGroup: "text-sm text-gray-500",
//   shortcut: "px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded",
//   submenuIndicator: "w-4 h-4 text-gray-400",
//   mobileButton: "fixed bottom-4 right-4 md:hidden z-40",
//   mobileButtonInner: "flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors",
//   mobileButtonIcon: "w-6 h-6",
//   mobileContainer: "md:left-1/2 md:top-1/4 md:-translate-x-1/2 md:w-full md:max-w-2xl left-0 top-0 w-full h-full md:h-auto md:rounded-lg",
//   mobileHeader: "md:p-4 p-3",
//   mobileResultsContainer: "md:max-h-96 h-[calc(100vh-80px)]"
// };

// export const CommandPalette = ({ isOpen, onClose, onOpen }: CommandPaletteProps) => {
//   const [search, setSearch] = useState('');
//   const [selectedIndex, setSelectedIndex] = useState(0);
//   const navigate = useNavigate();
//   const { usuario } = useAuthStore();
//   const resultsRef = useRef<HTMLDivElement>(null);
//   const selectedItemRef = useRef<HTMLButtonElement>(null);
//   const [isMobile, setIsMobile] = useState(false);

//   // Función recursiva para procesar items y subitems con verificación de permisos
//   const processMenuItem = (item: any, group: string, parentPath: string = ''): CommandItem[] => {
//     const result: CommandItem[] = [];
//     const currentPath = parentPath ? `${parentPath} > ${item.name}` : item.name;
    
//     // Verificar permisos para el item principal
//     if (item.grupo !== undefined && item.orden !== undefined) {
//       const hasAccess = hasMenuAccess(usuario?.permisos_menu || [], item.grupo, item.orden);
//       if (!hasAccess) return result;
//     }
    
//     // Agregar el item principal solo si tiene path o subitems
//     if (item.path || item.subItems?.length > 0) {
//       result.push({
//         id: `menu-${item.name}`,
//         name: item.name,
//         icon: item.icon,
//         path: item.path,
//         group: group,
//       });
//     }

//     // Procesar subitems recursivamente
//     if (item.subItems?.length > 0) {
//       const accessibleSubItems = item.subItems.filter((subItem: any) => {
//         if (subItem.grupo !== undefined && subItem.orden !== undefined) {
//           return hasMenuAccess(usuario?.permisos_menu || [], subItem.grupo, subItem.orden);
//         }
//         return false; // Si no tiene grupo y orden, no tiene permisos
//       });

//       accessibleSubItems.forEach((subItem: any) => {
//         // Procesar el subitem actual
//         result.push({
//           id: `submenu-${subItem.name}`,
//           name: subItem.name,
//           icon: subItem.icon,
//           path: subItem.path,
//           group: `${group} > ${currentPath}`,
//         });

//         // Procesar recursivamente los subsubitems si existen
//         if (subItem.subItems?.length > 0) {
//           result.push(...processMenuItem(subItem, group, currentPath));
//         }
//       });
//     }

//     return result;
//   };

//   // Convertir los menús en items de comando con soporte para subitems
//   const commandItems = useCallback((): CommandItem[] => {
//     if (!usuario?.permisos_menu) return [];
    
//     const items: CommandItem[] = [];
//     const filteredItems = filterMenuItemsByPermissions(menuItems, usuario.permisos_menu);
    
//     filteredItems.forEach(item => {
//       items.push(...processMenuItem(item, 'Menú Principal'));
//     });

//     return items;
//   }, [usuario?.permisos_menu]);

//   // Filtrar items basado en la búsqueda
//   const filteredItems = commandItems().filter(item =>
//     item.name.toLowerCase().includes(search.toLowerCase())
//   );

//   // Función para manejar el scroll automático
//   const scrollToSelectedItem = useCallback(() => {
//     if (selectedItemRef.current && resultsRef.current) {
//       const container = resultsRef.current;
//       const item = selectedItemRef.current;
      
//       const containerRect = container.getBoundingClientRect();
//       const itemRect = item.getBoundingClientRect();
      
//       // Verificar si el item está fuera de la vista
//       if (itemRect.top < containerRect.top) {
//         container.scrollTop = container.scrollTop - (containerRect.top - itemRect.top);
//       } else if (itemRect.bottom > containerRect.bottom) {
//         container.scrollTop = container.scrollTop + (itemRect.bottom - containerRect.bottom);
//       }
//     }
//   }, []);

//   // Efecto para manejar el scroll cuando cambia el índice seleccionado
//   useEffect(() => {
//     scrollToSelectedItem();
//   }, [selectedIndex, scrollToSelectedItem]);

//   // Manejar navegación con teclado
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (!isOpen) return;

//       switch (e.key) {
//         case 'ArrowDown':
//           e.preventDefault();
//           setSelectedIndex(prev => 
//             prev < filteredItems.length - 1 ? prev + 1 : prev
//           );
//           break;
//         case 'ArrowUp':
//           e.preventDefault();
//           setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
//           break;
//         case 'Enter':
//           e.preventDefault();
//           const selectedItem = filteredItems[selectedIndex];
//           if (selectedItem?.path) {
//             navigate(selectedItem.path);
//             onClose();
//           }
//           break;
//         case 'Escape':
//           e.preventDefault();
//           onClose();
//           break;
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [isOpen, filteredItems, selectedIndex, navigate, onClose]);

//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768); // 768px es el breakpoint de md en Tailwind
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   const renderItem = (item: CommandItem, index: number) => (
//     <motion.button
//       key={item.id}
//       ref={selectedIndex === index ? selectedItemRef : null}
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.05 }}
//       className={`
//         ${commandPaletteStyles.item}
//         ${selectedIndex === index ? commandPaletteStyles.itemSelected : commandPaletteStyles.itemHover}
//       `}
//       onClick={() => {
//         if (item.path) {
//           navigate(item.path);
//           onClose();
//         }
//       }}
//     >
//       {item.icon && (
//         <div className={commandPaletteStyles.itemIcon}>
//           {React.createElement(item.icon)}
//         </div>
//       )}
//       <div className={commandPaletteStyles.itemContent}>
//         <div className={commandPaletteStyles.itemName}>
//           {item.name}
//         </div>
//         <div className={commandPaletteStyles.itemGroup}>
//           {item.group}
//         </div>
//       </div>
//     </motion.button>
//   );

//   return (
//     <>
//       {!isOpen && isMobile && (
//         <motion.button
//           initial={{ scale: 0, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0, opacity: 0 }}
//           className={commandPaletteStyles.mobileButton}
//           onClick={onOpen}
//         >
//           <div className={commandPaletteStyles.mobileButtonInner}>
//             <PanelBottomOpen className={commandPaletteStyles.mobileButtonIcon} />
//           </div>
//         </motion.button>
//       )}

//       <AnimatePresence>
//         {isOpen && (
//           <>
//             {/* Overlay */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black/50 z-50"
//               onClick={onClose}
//             />

//             {/* Command Palette */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95, y: isMobile ? '100%' : 0 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: isMobile ? '100%' : 0 }}
//               className={`${commandPaletteStyles.container} ${commandPaletteStyles.mobileContainer}`}
//             >
//               {/* Header */}
//               <div className={`${commandPaletteStyles.header} ${commandPaletteStyles.mobileHeader}`}>
//                 <Search className="w-5 h-5 text-gray-400" />
//                 <input
//                   type="text"
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   placeholder="Buscar en todos los menús..."
//                   className={commandPaletteStyles.searchInput}
//                   autoFocus
//                 />
//                 {!isMobile && (
//                   <kbd className={commandPaletteStyles.shortcut}>
//                     ESC
//                   </kbd>
//                 )}
//               </div>

//               {/* Results */}
//               <div ref={resultsRef} className={`${commandPaletteStyles.resultsContainer} ${commandPaletteStyles.mobileResultsContainer}`}>
//                 {filteredItems.length === 0 ? (
//                   <div className={commandPaletteStyles.noResults}>
//                     No se encontraron resultados
//                   </div>
//                 ) : (
//                   filteredItems.map((item, index) => renderItem(item, index))
//                 )}
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };
