import { Home, ShoppingCart,  Settings, Archive, ChartSpline, UsersRound, Receipt, SmartphoneNfc, HandCoins, DollarSign, ShoppingBasket, Handshake, SquareChartGantt, FileChartColumnIncreasing, FilePen, Package, ArchiveRestore,  Truck, Boxes, FileBox, Forklift, Bus, Podcast } from 'lucide-react';
import { Newspaper } from 'lucide-react';
import type { PermisoMenu } from '../../types/auth';
import type { LucideIcon } from 'lucide-react';

// Definimos las interfaces para los items del menú
export interface MenuSubItem {
  grupo: number;
  orden: number;
  name: string;
  icon: LucideIcon;
  path: string;
  enabled: boolean;
  subItems?: MenuSubItem[];
}

export interface MenuItem {
  grupo?: number;
  orden?: number;
  name: string;
  icon: LucideIcon;
  path: string;
  enabled: boolean;
  subItems?: MenuSubItem[];
}

export const menuItems: MenuItem[] =[
  {
    grupo: 0,
    orden: 1,
    name: "Inicio",
    icon: Home,
    path: "/home",
    enabled: true,
  },
  {
    grupo: 1,
    orden: 1,
    name: "Consulta de Artículos",
    icon: Archive,
    path: "/inventario/consulta-articulos",
    enabled: true,
  },
  {
    grupo: 1,
    orden: 1,
    name: "Dashboard",
    icon: ChartSpline,
    path: "/dashboard",
    enabled: true,
  },
  {
    name: "Módulo RRHH",
    icon: UsersRound ,
    path: "/rrhh",
    enabled: true,
    subItems: [
      {
        grupo: 5,
        orden: 2,
        name: "Listar Personas",
        icon: UsersRound ,
        path: "/personas/listar-personas",
        enabled: true,
      },
    ],
  },
  {
    name: "Módulo Financiero",
    icon: Receipt,
    path: "/cobros",
    enabled: true,
    subItems: [
      {
        grupo: 5,
        orden: 2,
        name: "Op. Caja Diaria",
        icon: SmartphoneNfc,
        path: "/cobros",
        enabled: true,
      },
      {
        grupo: 5,
        orden: 6,
        name: "Op. Caja Financiero",
        icon: HandCoins,
        path: "/consulta-de-cobros",
        enabled: true,
      },
    ],
  },
  {
    name: "Modulo Ventas",
    icon: DollarSign,
    path: "/",
    enabled: true,
    subItems: [
      {
        grupo: 2,
        orden: 9,
        name: "Venta Rápida",
        icon: SmartphoneNfc,
        path: "/ventas/venta-mobil",
        enabled: true,
      },
      {
        grupo:  2, //2
        orden: 102, //102
        name: "Punto de Venta",
        icon: ShoppingBasket,
        path: "/ventas/punto-de-venta",
        enabled: true,
      },
      {
        grupo: 2, //2
        orden: 104, //104
        name: "Venta Balcon",
        icon: ShoppingCart,
        path: "/ventas/venta-balcon",
        enabled: true,
      },
      {
        grupo: 2, // recordar anotar id y grupo anterior
        orden: 17,
        name: "Reg. de Pedidos",
        icon: Handshake,
        path: "/registrar-pedido",
        enabled: true,
      },
      {
        grupo: 2,
        orden: 13,
        name: "Reg. Presupuesto",
        icon: SquareChartGantt,
        path: "/presupuestos-nuevo",
        enabled: true,
      },

      {
        grupo: 2,
        orden: 99999,
        name: "Informes",
        icon: FileChartColumnIncreasing,
        path: "/reporte/pedidos-facturados",
        enabled: true,
        subItems: [
          {
            grupo: 2,
            orden: 36,
            name: "Informe de Ventas",
            icon: FileChartColumnIncreasing,
            path: "/informe-de-ventas",
            enabled: true,
          },
          {
            grupo: 2,
            orden: 69,
            name: "Reporte de Pedidos Facturados",
            icon: FileChartColumnIncreasing,
            path: "/reporte/pedidos-facturados",
            enabled: true,
          },
          {
            grupo: 2,
            orden: 53,
            name: "Informe Movimiento Productos y Metas Agrup. x Año",
            icon: FileChartColumnIncreasing,
            path: "/ventas/reporte-movimiento-productos",
            enabled: true,
          },
        ],
      },
    ],
  },
  {
    name: "Modulo Consultas",
    icon: Newspaper,
    path: "/ventas-y-egresos",
    enabled: true,
    subItems: [
      {
        grupo: 2,
        orden: 106,
        name: "Consulta de Ventas",
        icon: HandCoins,
        path: "/consulta-de-ventas",
        enabled: true,
      },
      {
        grupo: 2,
        orden: 106,
        name: "Consulta de Pedidos",
        icon: Handshake,
        path: "/consultar-pedidos",
        enabled: true,
      },
      {
        grupo: 2,
        orden: 106,
        name: "Consulta de Presupuestos",
        icon: FilePen,
        path: "/consulta-de-presupuestos",
        enabled: true,
      },
    ],
  },
  {
    name: "Modulo Stock",
    icon: Package,
    path: "/inventario",
    enabled: true,
    subItems: [
      {
        grupo: 1,
        orden: 1,
        name: "Formulario de Artículos",
        icon: Archive,
        path: "/formulario-articulos",
        enabled: true,
      },
      {
        grupo: 1,
        orden: 1,
        name: "Informe de Artículos",
        icon: Archive,
        path: "/inventario",
        enabled: true,
      },
      {
        grupo: 1,
        orden: 50,
        name: "Autorización de Ajuste de Stock",
        icon: ArchiveRestore,
        path: "/autorizacion-ajuste-stock",
        enabled: true,
      },
      {
        grupo: 1,
        orden: 15,
        name: "Toma de inventario",
        icon: ArchiveRestore,
        path: "/toma-de-inventario",
        enabled: true,
      },
    ],
  },
  {
    name: "Modulo Agendas",
    icon: Bus,
    path: "/agendas/",
    enabled: true,
    subItems: [
      {
        grupo: 2,
        orden: 18,
        name: "Ingreso de planificación",
        icon: Truck,
        path: "/agendas/planificacion",
        enabled: true,
      },
      {
        grupo: 2,
        orden: 31,
        name: "Dashboard Planificaciones",
        icon: Truck,
        path: "/rutas-dashboard",
        enabled: true,
      },
    ],
  },
  {
    name: "Modulo Logistica",
    icon: Podcast,
    path: "/ruteamientos",
    enabled: true,
    subItems: [
      {
        grupo: 1,
        orden: 51,
        name: "Control de Ingresos",
        icon: Truck,
        path: "/control-ingreso",
        enabled: true,
      },
      {
        grupo: 1,
        orden: 51,
        name: "Verificador de Ingresos",
        icon: Truck,
        path: "/verificador-ingresos",
        enabled: true,
      },
      {
        grupo: 1,
        orden: 51,
        name: "Consulta de Pedidos Faltantes",
        icon: Truck,
        path: "/consulta-pedidos-faltantes",
        enabled: true,
      },
      {
        grupo: 1,
        orden: 51,
        name: "Gestion de Direcciones",
        icon: Boxes,
        path: "/gestion-direcciones",
        enabled: true,
      },
    ],
  },
  {
    name: "Modulo Entregas",
    icon: Forklift,
    path: "/ruteamientos",
    enabled: true,
    subItems: [
      {
        grupo: 2,
        orden: 110,
        name: "Ruteamiento de pedidos",
        icon: Truck,
        path: "/ruteamiento-de-pedidos",
        enabled: true,
      },
      {
        grupo: 2,
        orden: 111,
        name: "Rutas de pedidos",
        icon: Truck,
        path: "/entrega-de-pedidos",
        enabled: true,
      },
      {
        grupo: 2,
        orden: 112,
        name: "Informe de entregas",
        icon: FileBox,
        path: "/informe-de-entregas",
        enabled: true,
      },
      {
        grupo: 2,
        orden: 113,
        name: "Preparacion de pedidos",
        icon: FileBox,
        path: "/preparacion-de-pedido",
        enabled: true,
      },
      {
        grupo: 2,
        orden: 114,
        name: "Verificacion de pedidos",
        icon: FileBox,
        path: "/verificacion-de-pedidos",
        enabled: true,
      },
    ],
  },
  {
    grupo: 10,
    orden: 9,
    name: "Configuraciones",
    icon: Settings,
    path: "/configuraciones",
    enabled: true,
  },
];

// Función para verificar si un usuario tiene acceso a un menú específico
export const hasMenuAccess = (permisos: PermisoMenu[], grupo: number, orden: number): boolean => {
  return permisos.some(
    permiso => 
      permiso.menu_grupo === grupo && 
      permiso.menu_orden === orden && 
      permiso.acceso === 1
  );
};

// Función para filtrar los menús según los permisos del usuario
export const filterMenuItemsByPermissions = (menuItems: MenuItem[], permisos: PermisoMenu[]): MenuItem[] => {
  return menuItems.filter(item => {
    // Si el item tiene subItems, verificar permisos de cada subItem
    if (item.subItems) {
      const filteredSubItems = item.subItems.filter(subItem => 
        hasMenuAccess(permisos, subItem.grupo, subItem.orden)
      );
      
      // Si hay subItems con acceso, mantener el item principal
      if (filteredSubItems.length > 0) {
        return {
          ...item,
          subItems: filteredSubItems
        };
      }
      return false;
    }
    
    // Si es un item sin subItems, verificar su propio permiso
    return item.grupo !== undefined && 
           item.orden !== undefined && 
           hasMenuAccess(permisos, item.grupo, item.orden);
  });
};