import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {  LogOut, User } from 'lucide-react';
import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { menuItems } from './menuItems';
import { filterMenuItemsByPermissions } from './menuItems';// import { useThemeStore } from '../../stores/themeStore';

// Actualizamos las interfaces para que coincidan con la estructura real
interface SubMenuItem {
  grupo: number;
  orden: number;
  name: string;
  icon: React.ComponentType;
  path: string;
  enabled: boolean;
  subItems?: SubMenuItem[];
}

interface MenuItem {
  grupo?: number;
  orden?: number;
  name: string;
  icon: React.ComponentType;
  path: string;
  enabled: boolean;
  subItems?: SubMenuItem[];
}

interface SidebarProps {
  isMobile?: boolean;
}

// Nuevo componente para manejar submenús recursivamente
const SubMenu = ({ items, onClose }: { items: SubMenuItem[], onClose: () => void }) => {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [subMenuPosition, setSubMenuPosition] = useState({ top: 0, left: 0 });
  const subMenuRef = useRef<HTMLDivElement>(null);

  const handleSubItemClick = (e: React.MouseEvent, itemName: string, itemElement: HTMLElement) => {
    e.stopPropagation();
    
    if (activeSubMenu === itemName) {
      setActiveSubMenu(null);
      return;
    }

    const rect = itemElement.getBoundingClientRect();
    setSubMenuPosition({
      top: rect.top,
      left: rect.right + 8
    });
    setActiveSubMenu(itemName);
  };

  return (
    <>
      {items.map((item) => (
        <div key={`${item.name}-${item.grupo}-${item.orden}`}>
          {item.subItems ? (
            <div
              className={subMenuStyles.itemWithSubmenu}
              onClick={(e) => handleSubItemClick(e, item.name, e.currentTarget)}
            >
              {item.name}
              <span className={subMenuStyles.submenuIndicator}>›</span>
            </div>
          ) : (
            <Link
              to={item.path}
              className={subMenuStyles.item}
              onClick={onClose}
            >
              {item.name}
            </Link>
          )}
        </div>
      ))}

      {activeSubMenu && (
        <div
          ref={subMenuRef}
          className={subMenuStyles.container}
          style={{
            top: `${subMenuPosition.top}px`,
            left: `${subMenuPosition.left}px`,
          }}
        >
          <SubMenu 
            items={items.find(item => item.name === activeSubMenu)?.subItems || []} 
            onClose={() => setActiveSubMenu(null)}
          />
        </div>
      )}
    </>
  );
};

// Agregar estos estilos al componente SubMenu
const subMenuStyles = {
  container: "fixed bg-white rounded-lg shadow-xs border border-gray-200 py-2 min-w-[200px] z-[70]",
  item: "block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors",
  itemWithSubmenu: "block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors cursor-pointer flex items-center justify-between",
  submenuIndicator: "ml-2 text-gray-400"
};

export const Sidebar = ({ isMobile = false }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  // const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const { usuario, logout } = useAuthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar los menús según los permisos del usuario
  const filteredMenuItems = React.useMemo(() => {
    if (!usuario?.permisos_menu) return [];
    return filterMenuItemsByPermissions(menuItems, usuario.permisos_menu);
  }, [usuario?.permisos_menu]);

  // Manejador para cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setActiveDropdown(null);
    }
  };

  const handleItemClick = (e: React.MouseEvent, itemName: string, itemElement: HTMLElement) => {
    e.stopPropagation();
    
    if (activeDropdown === itemName) {
      setActiveDropdown(null);
      return;
    }

    const rect = itemElement.getBoundingClientRect();
    setDropdownPosition({
      top: rect.top,
      left: rect.right + 8 // 8px de separación del sidebar
    });
    setActiveDropdown(itemName);
  };

//   const handleThemeToggle = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     console.log('Toggle theme clicked, current theme:', theme);
//     toggleTheme();
//   };

  if (isMobile) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300
          ${(isExpanded || activeDropdown) ? 'opacity-100 visible' : 'opacity-0 invisible'}
          ${(isExpanded || activeDropdown) ? 'pointer-events-auto' : 'pointer-events-none'}
          z-50
        `}
        onClick={() => {
          setIsExpanded(false);
          setActiveDropdown(null);
        }}
      />

      {/* Sidebar */}
      <nav
        className={`
          fixed left-2 top-2 h-[calc(100vh-16px)]
          ${isExpanded ? 'w-[240px]' : 'w-[56px]'}
          bg-white 
          text-gray-700
          transition-all duration-300
          z-50 overflow-y-auto overflow-x-hidden rounded-md shadow-lg
          max-w-full
        `}
        onClick={handleClick}
      >
        <div className="flex flex-col h-full w-full">
          {/* User Profile Section */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {usuario?.op_nombre || 'Usuario'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          {filteredMenuItems.map((item: MenuItem) => (
            <div key={item.name} className="border-t border-gray-100 first:border-t-0 w-full">
              {item.subItems ? (
                <div className="w-full">
                  <div
                    className={`
                      flex flex-col items-center justify-center
                      px-1.5 py-2.5 mx-1.5 my-1 rounded-lg
                      transition-all duration-300
                      hover:bg-gray-100 cursor-pointer
                      ${activeDropdown === item.name ? 'bg-gray-100' : ''}
                      w-[calc(100%-8px)]
                    `}
                    onClick={(e) => handleItemClick(e, item.name, e.currentTarget)}
                  >
                    <div className="text-xl text-gray-700">
                      {React.createElement(item.icon)}
                    </div>
                    {isExpanded && (
                      <span className="mt-1 text-sm font-medium text-center text-gray-700 truncate w-full px-1">
                        {item.name}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`
                    flex flex-col items-center justify-center
                    px-1.5 py-2.5 mx-1.5 my-1 rounded-lg
                    transition-all duration-300
                    hover:bg-gray-100
                    w-[calc(100%-8px)]
                  `}
                >
                  <div className="text-xl text-gray-700">
                    {React.createElement(item.icon)}
                  </div>
                  {isExpanded && (
                    <span className="mt-1 text-sm font-medium text-center text-gray-700 truncate w-full px-1">
                      {item.name}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}

          {/* Theme Toggle y Logout */}
          <div className="mt-auto w-full space-y-1">
            {/* Theme Toggle Button */}
            {/* <button
              type="button"
              onClick={handleThemeToggle}
              className={`
                flex flex-col items-center justify-center
                w-[calc(100%-8px)] px-1.5 py-2.5 mx-1.5 rounded-lg
                transition-all duration-300
                hover:bg-gray-100
                text-gray-700
                cursor-pointer
              `}
            >
              {theme === 'light' ? (
                <Moon className="w-6 h-6" />
              ) : (
                <Sun className="w-6 h-6" />
              )}
              {isExpanded && (
                <span className="mt-1 text-sm text-center truncate w-full px-1">
                  {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
                </span>
              )}
            </button> */}

            {/* Logout Button */}
            <button
              className={`
                flex flex-col items-center justify-center
                w-[calc(100%-8px)] px-1.5 py-2.5 mx-1.5 my-1 rounded-lg
                transition-all duration-300
                hover:bg-red-50
                hover:text-red-500
                text-gray-700
              `}
              onClick={() => {
                logout();
                navigate('/auth');
              }}
            >
              <LogOut className="w-6 h-6" />
              {isExpanded && (
                <span className="mt-1 text-sm font-medium text-center truncate w-full px-1">
                  Cerrar Sesión
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Dropdown Menu */}
      {activeDropdown && (
        <div
          ref={dropdownRef}
          className="fixed bg-white rounded-lg shadow-xs border border-gray-200 py-2 min-w-[200px] z-[70]"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <SubMenu 
            items={filteredMenuItems
              .find((item: MenuItem) => item.name === activeDropdown)
              ?.subItems || []} 
            onClose={() => setActiveDropdown(null)}
          />
        </div>
      )}
    </>
  );
};