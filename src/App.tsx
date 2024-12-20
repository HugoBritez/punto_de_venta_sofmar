import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import {
  ChakraProvider,
  Box,
  useMediaQuery,
  Spinner,
  Center,
} from "@chakra-ui/react";
import Login from "./views/login/Login";

import { AuthProvider, useAuth } from "./services/AuthContext";
import Sidebar from "./views/modules/NavBar";
import ResumenVentas from "./views/ventas/ResumenVentas";
import GestionInventario from "./views/inventario/gestionInventario";
import VentasDashboard from "./views/dashboards/SalesDashboard";
import Presupuestos from "./views/presupuestos/Presupuestos";
import { SwitchProvider } from "./services/SwitchContext";
import ConsultaPresupuestos from "./views/presupuestos/ConsultaPresupuesto";
import Ruteamientos from "./views/ruteamientos/Ruteamientos";
import Rutas from "./views/ruteamientos/Rutas";
import RuteamientosDashboard from "./views/ruteamientos/RuteamientosDashboard";
import Pedidos from "./views/pedidos/Pedidos";
import ConsultaPedidos from "./views/pedidos/ConsultaPedidos";
import NoExiste from "./views/404";
import VentaBalcon from "./views/puntodeventa/venta-balcon";
import PuntoDeVenta from "./views/puntodeventa/punto-de-venta";
import TomaDeInventario from "./views/inventario/toma-de-inventario";

const ProtectedLayout: React.FC = () => {
  const { auth, isLoading } = useAuth();
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box>
      <Sidebar />
      <Box
        ml={isLargerThan768 ? ["60px", "60px", "60px"] : 0}
        mb={0}
        p={0}
        transition="all 0.3s"
      >
        <Outlet />
      </Box>
    </Box>
  );
};

function App() {
  return (
    <SwitchProvider>
      <ChakraProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedLayout />}>
                <Route path="/venta-balcon" element={<VentaBalcon />} />
                <Route path="/punto-de-venta" element={<PuntoDeVenta />} />
                <Route path="/consulta-de-ventas" element={<ResumenVentas />} />
                <Route path="/inventario" element={<GestionInventario />} />
                <Route path="/toma-de-inventario" element={<TomaDeInventario />} />
                <Route path="/dashboard" element={<VentasDashboard />} />
                <Route path="/presupuestos" element={<Presupuestos />} />
                <Route
                  path="/consulta-de-presupuestos"
                  element={<ConsultaPresupuestos />}
                />
                <Route path="/ruteamientos" element={<Ruteamientos />} />
                <Route path="/rutas" element={<Rutas />} />
                <Route
                  path="/rutas-dashboard"
                  element={<RuteamientosDashboard />}
                />
                <Route path="/registrar-pedido" element={<Pedidos />} />
                <Route
                  path="/consultar-pedidos"
                  element={<ConsultaPedidos />}
                />
              </Route>
              <Route
                path="/"
                element={<Navigate to="/punto-de-venta" replace />}
              />
              <Route path="/404" element={<NoExiste />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ChakraProvider>
    </SwitchProvider>
  );
}

export default App;
