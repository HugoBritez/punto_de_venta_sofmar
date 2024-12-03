import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  Icon,
  Text,
  GridItem,
  useMediaQuery,
  useDisclosure,
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
  NotebookPen,
  Handshake,
  ShoppingBasket,
  ArchiveRestore,
  Package,
  Ellipsis,
  Receipt,
  SmartphoneNfc,
} from "lucide-react";
import { useAuth } from "@/services/AuthContext";
import { db, fechaRelease, userName, version } from "@/utils";
import CustomDrawer from "./customDrawer";

interface NavItem {
  name: string;
  icon: React.ElementType;
  path: string;
  enabled: boolean;
  subItems?: NavItem[];
}

const Sidebar = () => {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const [isExpanded, setIsExpanded] = useState(false);
  const [, setIsMobileExpanded] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const location = useLocation();
  const mobileBarRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();


  const NAV_ITEMS: NavItem[] = [
    { name: "Dashboard", icon: ChartSpline, path: "/dashboard", enabled: true },
    { name: "Cobros", icon: Receipt, path: "/cobros", enabled: true },
    {
      name: "Modulo Ventas",
      icon: DollarSign,
      path: "/ventas-y-egresos",
      enabled: true,
      subItems: [
        {
          name: "Venta Rápida",
          icon: SmartphoneNfc,
          path: "/venta-rapida",
          enabled: true,
        },
        {
          name: "Punto de Venta",
          icon: ShoppingBasket,
          path: "/punto-de-venta",
          enabled: true,
        },
        {
          name: "Venta Balcon",
          icon: ShoppingCart,
          path: "/venta-balcon",
          enabled: true,
        },
        {
          name: "Consulta de Ventas",
          icon: HandCoins,
          path: "/consulta-de-ventas",
          enabled: true,
        },
        {
          name: "Reg. de Pedidos",
          icon: Handshake,
          path: "/registrar-pedido",
          enabled: true,
        },
        {
          name: "Consulta de Pedidos",
          icon: Handshake,
          path: "/consultar-pedidos",
          enabled: true,
        },
        {
          name: "Reg. Presupuesto",
          icon: SquareChartGantt,
          path: "/presupuestos",
          enabled: true,
        },
        {
          name: "Consulta de Presupuestos",
          icon: FilePen,
          path: "/consulta-de-presupuestos",
          enabled: true,
        },
      ],
    },
    {
      name: "Modulo Inventario",
      icon: Package,
      path: "/inventario",
      enabled: true,
      subItems: [
        {
          name: "Consulta de Artículos",
          icon: Archive,
          path: "/inventario",
          enabled: true,
        },
        {
          name: "Toma de inventario",
          icon: ArchiveRestore,
          path: "/toma-de-inventario",
          enabled: true,
        },
      ],
    },
    {
      name: "Modulo Ruteamientos",
      icon: NotebookPen,
      path: "/ruteamientos",
      enabled: true,
      subItems: [
        { name: "Rutas", icon: Truck, path: "/rutas", enabled: true },
        {
          name: "Consulta de Ruteamientos",
          icon: Truck,
          path: "/ruteamientos",
          enabled: true,
        },
        {
          name: "Dashboard Ruteamientos",
          icon: Truck,
          path: "/rutas-dashboard",
          enabled: true,
        },
      ],
    },
  ];

  const handleMouseEnter = () => {
    if (isLargerThan768) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (isLargerThan768) {
      setIsExpanded(false);
      setExpandedItem(null);
    }
  };



  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleItemExpansion = (itemName: string) => {
    setExpandedItem(expandedItem === itemName ? null : itemName);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileBarRef.current &&
        !mobileBarRef.current.contains(event.target as Node)
      ) {
        setIsMobileExpanded(false);
        setExpandedItem(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderNavItem = (item: NavItem) => (
    <GridItem key={item.name} borderTopLeftRadius="15px">
      {item.subItems ? (
        <Box>
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
            className={item.enabled ? "hover:bg-blue-100" : ""}
            opacity={item.enabled ? 1 : 0.5}
            onClick={() => toggleItemExpansion(item.name)}
            cursor="pointer"
          >
            <Icon as={item.icon} boxSize={6} color="black" />
            <Text fontSize="xs" mt={1} textAlign="center" color="black">
              {isLargerThan768 ? (isExpanded ? item.name : "") : item.name}
            </Text>
            {(isExpanded || !isLargerThan768) && (
              <Icon
                as={expandedItem === item.name ? ChevronUp : ChevronDown}
                boxSize={4}
                color="black"
                mt={1}
              />
            )}
          </Flex>
          {expandedItem === item.name && (
            <Box ml={isLargerThan768 && isExpanded ? 4 : 0}>
              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.name}
                  to={subItem.path}
                  style={{
                    width: "100%",
                    height: "100%",
                    pointerEvents: subItem.enabled ? "auto" : "none",
                  }}
                >
                  <Flex
                    align="center"
                    px={2}
                    py={2}
                    mx={2}
                    my={1}
                    borderRadius={"8px"}
                    transition="all 0.3s"
                    className={subItem.enabled ? "hover:bg-blue-100" : ""}
                    opacity={subItem.enabled ? 1 : 0.5}
                  >
                    <Icon
                      as={subItem.icon}
                      boxSize={4}
                      color={
                        location.pathname === subItem.path && subItem.enabled
                          ? "blue.500"
                          : "black"
                      }
                      mr={2}
                    />
                    {(isExpanded || !isLargerThan768) && (
                      <Text fontSize="md" color="black">
                        {subItem.name}
                      </Text>
                    )}
                  </Flex>
                </Link>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Link
          to={item.enabled ? item.path : "#"}
          style={{
            width: "100%",
            height: "100%",
            pointerEvents: item.enabled ? "auto" : "none",
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
            className={item.enabled ? "hover:bg-blue-100" : ""}
            opacity={item.enabled ? 1 : 0.5}
          >
            <Icon
              as={item.icon}
              boxSize={6}
              color={
                location.pathname === item.path && item.enabled
                  ? "blue.500"
                  : "black"
              }
            />
            <Text fontSize="xs" mt={1} textAlign="center" color="black">
              {isLargerThan768 ? (isExpanded ? item.name : "") : item.name}
            </Text>
          </Flex>
        </Link>
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
        zIndex={1000}
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
            <Icon as={Ellipsis} boxSize={6} color={'white'} />
          </Flex>
        </Box>

        <CustomDrawer
          isOpen={isOpen}
          onClose={onClose}
          navItems={NAV_ITEMS}
          userName={userName || ""}
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
    onClick={handleMouseLeave}
    zIndex={999}
  />
    <Box
    as="nav"
    pos="fixed"
    left={2} 
    top={2} 
    h="calc(100vh - 16px)" 
    w={isExpanded ? "200px" : "60px"}
    bg="white"
    color="blue.500"
    transition="all 0.3s"
    zIndex={1000}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
    overflowY="auto"
    borderRadius="md" 
    boxShadow="lg" 
    sx={{
      '&::-webkit-scrollbar': {
        width: '4px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#CBD5E0',
        borderRadius: '20px',
      },
    }}
  >
      <Flex direction="column" h="100%" align="stretch">
        {isExpanded && (
          <Flex
            align="center"
            p={2}
            mt={4}
            direction={"column"}
            _hover={{ color: "red.500", cursor: "pointer" }}
          >
            <Text color={"black"} fontWeight={"bold"}>
              {" "}
              Bienvenido, {userName}
            </Text>
          </Flex>
        )}

        {NAV_ITEMS.map(renderNavItem)}
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
