import { ChevronDown, ChevronUp, LogOut } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";

interface NavItem {
  name: string;
  icon: React.ElementType;
  path: string;
  enabled: boolean;
  subItems?: NavItem[];
}

interface CustomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  userName: string;
  version: string;
  fechaRelease: string;
  db: string;
  handleLogout: () => void;
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({
  isOpen,
  onClose,
  navItems,
  userName,
  version,
  fechaRelease,
  db,
  handleLogout,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const renderNavItem = (item: NavItem) => (
    <div key={item.name} className="mb-2">
      {item.subItems ? (
        <div>
          <div
            className="flex items-center justify-between px-4 py-2 text-black hover:bg-blue-100 rounded-lg cursor-pointer"
            onClick={() =>
              setExpandedItem(expandedItem === item.name ? null : item.name)
            }
          >
            <div className="flex items-center">
              <item.icon className="w-5 h-5 mr-2" />
              <span>{item.name}</span>
            </div>
            {expandedItem === item.name ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
          {expandedItem === item.name && (
            <div className="ml-4">
              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.name}
                  to={subItem.path}
                  onClick={onClose}
                  className={`flex items-center px-4 py-2 text-sm ${
                    location.pathname === subItem.path
                      ? "text-blue-500"
                      : "text-black"
                  } hover:bg-blue-100 rounded-lg ${
                    subItem.enabled ? "" : "opacity-50 pointer-events-none"
                  }`}
                >
                  <subItem.icon className="w-4 h-4 mr-2" />
                  <span>{subItem.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Link
          to={item.path}
          onClick={onClose}
          className={`flex items-center px-4 py-2 ${
            location.pathname === item.path ? "text-blue-500" : "text-black"
          } hover:bg-blue-100 rounded-lg ${
            item.enabled ? "" : "opacity-50 pointer-events-none"
          }`}
        >
          <item.icon className="w-5 h-5 mr-2" />
          <span>{item.name}</span>
        </Link>
      )}
    </div>
  );

  return createPortal(
    <div
      className={`fixed inset-0 transition-all duration-300 ease-in-out ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "bg-opacity-50" : "bg-opacity-0"
        }`}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-999 flex items-start justify-start p-4 pointer-events-none">
        <div
          ref={drawerRef}
          className={`bg-white w-64 h-[98%] shadow-xl rounded-xl my-2 relative pointer-events-auto
            transition-all duration-300 ease-in-out transform flex flex-col
            ${
              isOpen
                ? "translate-x-0 opacity-100"
                : "-translate-x-full opacity-0"
            }`}
          style={{ boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="p-4 border-b">
            <p className="text-md font-bold">Bienvenido, {userName}</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {navItems.map(renderNavItem)}
          </nav>

          <div className="mt-auto p-4 border-t">
            <button
              onClick={() => {
                handleLogout();
                onClose();
              }}
              className="flex items-center justify-center w-full px-4 py-2 text-black hover:bg-blue-100 rounded-lg"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
          <div className="p-4 pb-6 border-t text-center rounded-b-xl bg-white mt-auto">
            <p className="text-xs text-gray-500">
              {version} - {fechaRelease}
            </p>
            <p className="text-xs text-gray-500">DB: {db}</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CustomDrawer;
