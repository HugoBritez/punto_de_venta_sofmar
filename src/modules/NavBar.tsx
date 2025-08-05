import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  Icon,
  Text,
  GridItem,
  useMediaQuery,
  useDisclosure,
  Tooltip,
} from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChartSpline,
  ShoppingCart,
  LogOut,
  Archive,
  SquareChartGantt,
  HandCoins,
  FilePen,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Truck,
  Handshake,
  ShoppingBasket,
  ArchiveRestore,
  Package,
  Ellipsis,
  SmartphoneNfc,
  FileChartColumnIncreasing,
  Bus,
  Newspaper,
  Forklift,
  FileBox,
  Home,
  ScanQrCode,
  Settings,
  Podcast,
  Boxes,
  Menu,
  User,
  Columns3,
  Banknote,
} from "lucide-react";
import { useAuth } from "@/services/AuthContext";
import { db, fechaRelease, version } from "@/utils";
import CustomDrawer from "./customDrawer";

interface NavItem {
  grupo?: number;
  orden?: number;
  id?: number;
  name: string;
  icon: React.ElementType;
  path: string;
  enabled: boolean;
  subItems?: NavItem[];
  level?: number;
}

const Sidebar = () => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const [isExpanded, setIsExpanded] = useState(false);
  const [, setIsMobileExpanded] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const location = useLocation();
  const mobileBarRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();


  const permisos_menu_local = (() => {
    try {
      const stored = sessionStorage.getItem("permisos_menu");
      // Verificar que stored no sea null, undefined o una cadena vacía
      if (!stored || stored === "undefined" || stored === "") {

        return [
          {
            grupo: 0,
            esActivo: 1,
            orden: 1,
            acceso: 1,
            menu_id: 0,
            menu_descripcion: "Inicio",
          },
        ];
      }

      const parsed = JSON.parse(stored);

      // Si es un array vacío o null, agregar permiso de Home
      if (!Array.isArray(parsed) || parsed.length === 0) {

        return [
          {
            acceso: 1,
            menu_id: 0,
            esActivo: 1,
            menu_descripcion: "Inicio",
            menu_grupo: 0,
            menu_orden: 1,
          },
        ];
      }

      return parsed;
    } catch (error) {
      console.warn("Error al analizar permisos_menu:", error);

      return [
        {
          acceso: 1,
          menu_id: 0,
          esActivo: 1,
          menu_descripcion: "Inicio",
          menu_grupo: 0,
          menu_orden: 1,
        },
      ];
    }
  })();

  const nombreUsuario = sessionStorage.getItem("user_name");
  const userNombre = sessionStorage.getItem("user_usuario");

  const NAV_ITEMS: NavItem[] = [
    {
      grupo: 0,
      orden: 1,
      id: 0, // ID 0 para indicar que es accesible para todos
      name: "Inicio",
      icon: Home,
      path: "/home",
      enabled: true,
    },
    {
      grupo: 1,
      orden: 1,
      id: 1, // ID 0 para indicar que es accesible para todos
      name: "Consulta de Artículos",
      icon: Archive,
      path: "/consulta-de-articulos",
      enabled: true,
    },
    {
      grupo: 1,
      orden: 1,
      id: 249,
      name: "Dashboard",
      icon: ChartSpline,
      path: "/dashboard",
      enabled: true,
    },
     {
       grupo: 17,
       orden: 1,
       id: 590,
       name: "CRM",
       icon: User,
       path: "/crm",
       enabled: false,
     },
     {
      grupo: 999,
      orden: 999,
      id: 590,
      name: "Bancos",
      icon: Banknote,
      path: "/bancos",
      enabled: false,
    },
    // {
    //   name: "Módulo Financiero",
    //   icon: Receipt,
    //   path: "/cobros",
    //   enabled: true,
    //   subItems: [
    //     {
    //       grupo: 5,
    //       orden: 2,
    //       id: 142,
    //       name: "Op. Caja Diaria",
    //       icon: SmartphoneNfc,
    //       path: "/cobros",
    //       enabled: true,
    //     },
    //     {
    //       grupo: 5,
    //       orden: 6,
    //       id: 146,
    //       name: "Op. Caja Financiero",
    //       icon: HandCoins,
    //       path: "/consulta-de-cobros",
    //       enabled: true,
    //     },
    //   ],
    // },
     {
       name: "Módulo Mantenimiento",
       icon: Columns3,
       path: "/personas",
       enabled: true,
       subItems: [
         {
           grupo: 16,
           orden: 1,
           id: 115,
           name: "Personas",
           icon: User,
           path: "/personas",
           enabled: true,
         }
       ],
     },
    {
      name: "Modulo Ventas",
      icon: DollarSign,
      path: "/ventas-y-egresos",
      enabled: true,
      subItems: [
        {
          grupo: 2,
          orden: 9,
          id: 47,
          name: "Venta Rápida",
          icon: SmartphoneNfc,
          path: "/venta-rapida",
          enabled: true,
        },
        {
          grupo: 2, //2
          orden: 102, //102
          id: 421,
          name: "Punto de Venta",
          icon: ShoppingBasket,
          path: "/punto-de-venta",
          enabled: true,
        },
        {
          grupo: 2, //2
          orden: 104, //104
          id: 429,
          name: "Venta Balcon",
          icon: ShoppingCart,
          path: "/venta-balcon-nuevo",
          enabled: true,
        },
        {
          grupo: 2, // recordar anotar id y grupo anterior
          orden: 17,
          id: 401,
          name: "Reg. de Pedidos",
          icon: Handshake,
          path: "/registrar-pedido",
          enabled: true,
        },
        {
          grupo: 2,
          orden: 13,
          id: 51,
          name: "Reg. Presupuesto",
          icon: SquareChartGantt,
          path: "/presupuestos-nuevo",
          enabled: true,
        },
        {
          grupo: 1,
          orden: 1,
          id: 53,
          name: "Informes",
          icon: SquareChartGantt,
          path: "",
          enabled: true,
          subItems: [
            {
              grupo: 2,
              orden: 117,
              id: 51,
              name: "Informe Movimiento Productos y Metas Agrup. x Año",
              icon: FileChartColumnIncreasing,
              path: "/ventas/reporte-movimiento-productos",
              enabled: true,
            },
             {
               grupo: 2,
               orden: 116,
               id: 51,
               name: "Reporte Pedidos Facturados",
               icon: FileChartColumnIncreasing,
               path: "/reporte-pedidos-facturados",
               enabled: true,
             },
            {
              grupo: 2,
              orden: 36,
              id: 74,
              name: "Informe de Ventas",
              icon: FileChartColumnIncreasing,
              path: "/informe-de-ventas",
              enabled: true,
            },
          ]
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
          id: 462,
          name: "Consulta de Ventas",
          icon: HandCoins,
          path: "/consulta-de-ventas",
          enabled: true,
        },
        {
          grupo: 2,
          orden: 106,
          id: 462,
          name: "Consulta de Pedidos",
          icon: Handshake,
          path: "/consultar-pedidos",
          enabled: true,
        },
        {
          grupo: 2,
          orden: 106,
          id: 462,
          name: "Consulta de Presupuestos",
          icon: FilePen,
          path: "/consulta-de-presupuestos",
          enabled: true,
        },
      ],
    },
    // {
    //   name: "Modulo CRM/ERP",
    //   icon: User,
    //   path: "/",
    //   enabled: true,
    //   subItems: [
    //     {
    //       grupo: 2,
    //       orden: 18,
    //       id: 68,
    //       name: "Consulta de Ventas Proveedores",
    //       icon: Truck,
    //       path: "/consulta-ventas-proveedores",
    //       enabled: true,
    //     }
    //   ],
    // },
    {
      name: "Modulo Stock",
      icon: Package,
      path: "/inventario",
      enabled: true,
      subItems: [
        {
          grupo: 999,
          orden: 999,
          id: 1,
          name: "Formulario de Artículos",
          icon: Archive,
          path: "/formulario-articulos",
          enabled: true,
        },
        {
          grupo: 1,
          orden: 1,
          id: 1,
          name: "Informe de Artículos",
          icon: Archive,
          path: "/inventario",
          enabled: true,
        },
        {
          grupo: 1,
          orden: 50,
          id: 1,
          name: "Autorización de Ajuste de Stock",
          icon: ArchiveRestore,
          path: "/autorizacion-ajuste-stock",
          enabled: true,
        },
        {
          grupo: 1,
          orden: 49,
          id: 14,
          name: "Inventario por scanner",
          icon: ScanQrCode,
          path: "/inventario-scanner",
          enabled: true,
        },
        {
          grupo: 1,
          orden: 15,
          id: 15,
          name: "Toma de inventario",
          icon: ArchiveRestore,
          path: "/toma-de-inventario",
          enabled: true,
        },
        // {
        //   grupo: 1,
        //   orden: 15,
        //   id: 14,
        //   name: "Toma de inventario",
        //   icon: ArchiveRestore,
        //   path: "/toma-de-inventario",
        //   enabled: true,
        // },
      ],
    },
    {
      name: "Modulo Planificación",
      icon: Bus,
      path: "/ruteamientos",
      enabled: true,
      subItems: [
        {
          grupo: 2,
          orden: 18,
          id: 68,
          name: "Ingreso de planificación",
          icon: Truck,
          path: "/ruteamientos",
          enabled: true,
        }
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
          id: 68,
          name: "Control de Ingresos",
          icon: Truck,
          path: "/control-ingreso",
          enabled: true,
        },
        {
          grupo: 1,
          orden: 51,
          id: 68,
          name: "Verificador de Ingresos",
          icon: Truck,
          path: "/verificador-ingresos",
          enabled: true,
        },
        {
          grupo: 1,
          orden: 51,
          id: 68,
          name: "Consulta de Pedidos Faltantes",
          icon: Truck,
          path: "/consulta-pedidos-faltantes",
          enabled: true,
        },
        {
          grupo: 1,
          orden: 51,
          id: 68,
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
          id: 56,
          name: "Ruteamiento de pedidos",
          icon: Truck,
          path: "/ruteamiento-de-pedidos",
          enabled: true,
        },
        {
          grupo: 2,
          orden: 111,
          id: 56,
          name: "Rutas de pedidos",
          icon: Truck,
          path: "/entrega-de-pedidos",
          enabled: true,
        },
        {
          grupo: 2,
          orden: 112,
          id: 69,
          name: "Informe de entregas",
          icon: FileBox,
          path: "/informe-de-entregas",
          enabled: true,
        },
        {
          grupo: 2,
          orden: 113,
          id: 69,
          name: "Preparacion de pedidos",
          icon: FileBox,
          path: "/preparacion-de-pedido",
          enabled: true,
        },
        {
          grupo: 2,
          orden: 114,
          id: 69,
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
      id: 69,
      name: "Configuraciones",
      icon: Settings,
      path: "/configuraciones",
      enabled: true,
    },
  ];

  const [menuItems, setMenuItems] = useState(NAV_ITEMS);

  useEffect(() => {
    const tienePermiso = (
      grupo: number | undefined,
      orden: number | undefined
    ) => {
      if (nombreUsuario && nombreUsuario.toLowerCase() === "sofmar" || userNombre && userNombre.toLowerCase() === "sofmar") return true;
      if (!grupo || !orden) return false;

      return permisos_menu_local?.some?.(
        (permiso: any) =>
          permiso.menu_grupo === grupo &&
          permiso.menu_orden === orden &&
          permiso.acceso === 1
      );
    };

    const menuConPermisos: NavItem[] = NAV_ITEMS.map((item) => {
      // Para elementos principales sin subItems
      if (!item.subItems) {
        const tieneAcceso = tienePermiso(item.grupo, item.orden);
        return tieneAcceso ? item : null;
      }

      // Para elementos con subItems
      const subItemsFiltrados = item.subItems
        .map((subItem) => {
          const tieneAcceso = tienePermiso(subItem.grupo, subItem.orden);
          return tieneAcceso ? subItem : null;
        })
        .filter((subItem): subItem is NavItem => subItem !== null);

      // Solo mostrar el elemento principal si tiene al menos un subItem visible
      return subItemsFiltrados.length > 0 ? {
        ...item,
        subItems: subItemsFiltrados,
      } : null;
    }).filter((item): item is NavItem => item !== null);

    setMenuItems(menuConPermisos);
  }, []);

  const handleToggleSidebar = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se propague al contenedor
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setExpandedItems(new Set()); // Cierra los subitems cuando se contrae el menú
    }
  };

  const handleItemClick = (e: React.MouseEvent, itemName: string) => {
    e.stopPropagation(); // Evita que el clic se propague al menú principal
    toggleItemExpansion(itemName);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleItemExpansion = (itemName: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const isItemExpanded = (itemName: string) => {
    return expandedItems.has(itemName);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileBarRef.current &&
        !mobileBarRef.current.contains(event.target as Node)
      ) {
        setIsMobileExpanded(false);
        setExpandedItems(new Set());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderNavItem = (item: NavItem, level: number = 0) => (
    <GridItem key={item.name} borderTopLeftRadius="15px">
      {item.subItems ? (
        <Box>
          <Tooltip
            label={item.name}
            placement="right"
            isDisabled={isExpanded}
            hasArrow
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              h="100%"
              px={2}
              pt={2}
              mx={2}
              mt={4}
              borderRadius={"8px"}
              transition="all 0.3s"
              className="hover:bg-blue-100"
              opacity={1}
              onClick={(e) => handleItemClick(e, item.name)}
              cursor="pointer"
              border="2px solid"
              borderColor={isItemExpanded(item.name) ? "blue.500" : "transparent"}
              bg={isItemExpanded(item.name) ? "blue.50" : "transparent"}
            >
              <Icon as={item.icon} boxSize={6} color="black" />
              <Text fontSize="sm" fontWeight={"bold"} mt={1} textAlign="center" color="black">
                {isExpanded ? item.name : ""}
              </Text>
              {isExpanded && (
                <Icon
                  as={isItemExpanded(item.name) ? ChevronUp : ChevronDown}
                  boxSize={4}
                  color="black"
                  mt={1}
                />
              )}
            </Flex>
          </Tooltip>
          {isItemExpanded(item.name) && isExpanded && (
            <Box
              ml={4 * (level + 1)}
              transition="all 0.3s"
              borderLeft="2px solid"
              borderColor="blue.200"
              pl={2}
              mt={2}
            >
              <Box
                w="100%"
                h="1px"
                bg="blue.200"
                mb={3}
                mx={2}
              />
              {item.subItems.map((subItem) => (
                <Box key={subItem.name} mb={2}>
                  {subItem.subItems ? (
                    <Box>
                      <Flex
                        align="center"
                        px={3}
                        py={2}
                        mx={2}
                        borderRadius={"8px"}
                        transition="all 0.3s"
                        className="hover:bg-blue-100"
                        opacity={1}
                        onClick={(e) => handleItemClick(e, subItem.name)}
                        cursor="pointer"
                        border="1px solid"
                        borderColor={isItemExpanded(subItem.name) ? "blue.400" : "gray.200"}
                        bg={isItemExpanded(subItem.name) ? "blue.50" : "transparent"}
                        position="relative"
                      >
                        <Box
                          position="absolute"
                          left="-8px"
                          top="50%"
                          transform="translateY(-50%)"
                          w="4px"
                          h="4px"
                          borderRadius="full"
                          bg="blue.400"
                        />
                        <Icon
                          as={subItem.icon}
                          boxSize={4}
                          color="black"
                          mr={2}
                        />
                        <Text fontSize="sm" color="black" flex={1} fontWeight="medium">
                          {subItem.name}
                        </Text>
                        <Icon
                          as={isItemExpanded(subItem.name) ? ChevronUp : ChevronDown}
                          boxSize={3}
                          color="black"
                        />
                      </Flex>
                      {isItemExpanded(subItem.name) && (
                        <Box
                          ml={4}
                          mt={2}
                          pl={3}
                          borderLeft="1px solid"
                          borderColor="gray.200"
                        >
                          <Box
                            w="100%"
                            h="1px"
                            bg="gray.200"
                            mb={2}
                          />
                          <Flex
                            direction="row"
                            flexWrap="wrap"
                            gap={2}
                          >
                            {subItem.subItems.map((nestedItem) => (
                              <Link
                                key={nestedItem.name}
                                to={nestedItem.path}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onClose();
                                }}
                                style={{
                                  pointerEvents: "auto",
                                }}
                              >
                                <Flex
                                  direction="row"
                                  align="center"
                                  px={3}
                                  py={2}
                                  borderRadius={"8px"}
                                  transition="all 0.3s"
                                  className="hover:bg-blue-100"
                                  opacity={1}
                                  minW="120px"
                                  maxW="200px"
                                  border="1px solid"
                                  borderColor="gray.200"
                                  bg="white"
                                  _hover={{
                                    borderColor: "blue.300",
                                    transform: "translateY(-1px)",
                                    boxShadow: "sm"
                                  }}
                                >
                                  <Icon
                                    as={nestedItem.icon}
                                    boxSize={4}
                                                                      color={
                                    location.pathname === nestedItem.path
                                      ? "blue.500"
                                      : "black"
                                  }
                                    mr={2}
                                  />
                                  <Text 
                                    fontSize="xs" 
                                    color="black" 
                                    textAlign="left"
                                    noOfLines={2}
                                    fontWeight="medium"
                                    flex={1}
                                  >
                                    {nestedItem.name}
                                  </Text>
                                </Flex>
                              </Link>
                            ))}
                          </Flex>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Link
                      to={subItem.path}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        pointerEvents: "auto",
                      }}
                    >
                      <Flex
                        align="center"
                        px={3}
                        py={2}
                        mx={2}
                        borderRadius={"8px"}
                        transition="all 0.3s"
                        className="hover:bg-blue-100"
                        opacity={1}
                        border="1px solid"
                        borderColor="transparent"
                        _hover={{
                          borderColor: "blue.300",
                          bg: "blue.50"
                        }}
                        position="relative"
                      >
                        <Box
                          position="absolute"
                          left="-8px"
                          top="50%"
                          transform="translateY(-50%)"
                          w="3px"
                          h="3px"
                          borderRadius="full"
                          bg="gray.400"
                        />
                        <Icon
                          as={subItem.icon}
                          boxSize={4}
                          color={
                            location.pathname === subItem.path
                              ? "blue.500"
                              : "black"
                          }
                          mr={2}
                        />
                        {isExpanded && (
                          <Text fontSize="sm" color="black" fontWeight="medium">
                            {subItem.name}
                          </Text>
                        )}
                      </Flex>
                    </Link>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Tooltip
          label={item.name}
          placement="right"
          isDisabled={isExpanded}
          hasArrow
        >
          <Box
            onClick={handleToggleSidebar}
            cursor="pointer"
            w="100%"
            h="100%"
          >
            <Link
              to={item.path}
              style={{
                width: "100%",
                height: "100%",
                pointerEvents: "auto",
              }}
            >
              <Flex
                direction="column"
                align="center"
                justify="center"
                h="100%"
                px={2}
                py={2}
                mx={2}
                my={4}
                borderRadius={"8px"}
                transition="all 0.3s"
                              className="hover:bg-blue-100"
              opacity={1}
              border="2px solid"
              borderColor={location.pathname === item.path ? "blue.500" : "transparent"}
              bg={location.pathname === item.path ? "blue.50" : "transparent"}
              >
                <Icon
                  as={item.icon}
                  boxSize={6}
                  color={
                    location.pathname === item.path
                      ? "blue.500"
                      : "black"
                  }
                />
                <Text fontSize="sm" fontWeight={"bold"} mt={1} textAlign="center" color="black">
                  {isExpanded ? item.name : ""}
                </Text>
              </Flex>
            </Link>
          </Box>
        </Tooltip>
      )}
    </GridItem>
  );

  if (!isLargerThan768) {
    return (
      <Box
        as="nav"
        pos="fixed"
        right={8}
        bottom={16}
        zIndex={50}
        ref={mobileBarRef}
        transform={isOpen ? "translateX(100%)" : "translateX(0)"}
        transition="all 0.3s ease-in-out"
      >
        <Box
          bg="blue.600"
          w="60px"
          h="60px"
          borderRadius="full"
          boxShadow="lg"
          position="relative"
          onClick={onOpen}
          transition="all 0.3s"
          _hover={{ transform: "scale(1.1)" }}
        >
          <Flex h="100%" w="100%" align="center" justify="center">
            <Icon as={Ellipsis} boxSize={6} color={"white"} />
          </Flex>
        </Box>

        <CustomDrawer
          isOpen={isOpen}
          onClose={onClose}
          navItems={menuItems}
          userName={nombreUsuario || ""}
          version={version}
          fechaRelease={fechaRelease}
          db={db}
          handleLogout={handleLogout}
        />
      </Box>
    );
  }

  return (
    <>
      <Box
        pos="fixed"
        inset={0}
        bg="blackAlpha.500"
        transition="all 0.3s"
        opacity={isExpanded ? 1 : 0}
        visibility={isExpanded ? "visible" : "hidden"}
        onClick={() => {
          setIsExpanded(false);
          setExpandedItems(new Set());
        }}
        zIndex={999}
        pointerEvents={isExpanded ? "auto" : "none"}
      />
      <Box
        as="nav"
        pos="fixed"
        left={2}
        top={2}
        h="calc(100vh - 16px)"
        w={isExpanded ? "350px" : "80px"}
        bg="white"
        color="blue.500"
        transition="all 0.3s"
        zIndex={999999}
        onClick={handleToggleSidebar}
        overflowY="auto"
        borderRadius="md"
        boxShadow="xs"
        sx={{
          "&::-webkit-scrollbar": {
            width: "12px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#CBD5E0",
            borderRadius: "20px",
          },
        }}
      >
        <Flex direction="column" h="100%" align="stretch">
          {/* Botón de toggle */}
          <Flex
            justify="center"
            align="center"
            p={2}
            mt={2}
            cursor="pointer"
            onClick={handleToggleSidebar}
            borderRadius="full"
            mx={2}
            bg="blue.600"
          >
            <Icon
              as={Menu}
              boxSize={5}
              color="white"
              transform={isExpanded ? "rotate(180deg)" : "rotate(0deg)"}
              transition="transform 0.3s"
            />
          </Flex>

          {isExpanded && (
            <Flex
              align="center"
              p={2}
              mt={2}
              direction={"column"}
              _hover={{ color: "red.500", cursor: "pointer" }}
            >
              <Text color={"black"} fontWeight={"bold"}>
                {" "}
                Usuario: {nombreUsuario}
              </Text>
            </Flex>
          )}
          {menuItems.map(renderNavItem)}
          <Box mt="auto">
            <Flex
              align="center"
              p={2}
              direction={"column"}
              onClick={handleLogout}
              _hover={{ color: "red.500", cursor: "pointer" }}
            >
              <LogOut />
              {isExpanded && <Text mt={1}>Cerrar Sesión</Text>}
            </Flex>
          </Box>
          {isExpanded && (
            <Flex
              align="center"
              p={2}
              mt={4}
              direction={"column"}
              _hover={{ color: "red.500", cursor: "pointer" }}
            >
              <Text color={"gray.500"} fontWeight={"thin"}>
                {version} - {fechaRelease}
              </Text>
              <Text color={"gray.500"} fontWeight={"thin"}>
                DB: {db}
              </Text>
            </Flex>
          )}
        </Flex>
      </Box>
    </>
  );
};

export default Sidebar;
