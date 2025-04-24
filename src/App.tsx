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
import Sidebar from "./modules/NavBar";
import ResumenVentas from "./views/ventas/ResumenVentas";
import GestionInventario from "./views/inventario/gestionInventario";
import VentasDashboard from "./views/dashboards/SalesDashboard";
import Presupuestos from "./views/presupuestos/Presupuestos";
import { SwitchProvider } from "./services/SwitchContext";
import ConsultaPresupuestos from "./views/presupuestos/ConsultaPresupuesto";
import Rutas from "./views/ruteamientos/Rutas";
import RuteamientosDashboard from "./views/ruteamientos/RuteamientosDashboard";
import Pedidos from "./views/pedidos/Pedidos";
import ConsultaPedidos from "./views/pedidos/ConsultaPedidos";
import NoExiste from "./views/404";
import CobrosDiarios from "./views/cobros/CobrosDiarios";
import VentaRapida from "./views/puntodeventa/VentaRapida";
import InformeVentas from "./views/ventas/informeVentas";
import RuteamientoPedidos from "./views/entregas/ruteamientopedidos";
import Entregas from "./views/entregas/entregas";
import InformeEntregas from "./views/entregas/informeEntregas";
import Home from "./views/home/home";
import InventarioScanner from "./views/scanner/ScannerInventario";
import TomaDeInventario from "./views/inventario/TomaDeInventario";
import ConsultaArticulos from "./views/inventario/consulta-de-articulos";
import AutorizacionAjusteStock from "./views/inventario/autorizacion-ajuste-stock";
import PreparacionPedido from "./views/entregas/preparacionPedido";
import VerificacionPedidos from "./views/entregas/VerificacionPedidos";
import VentaBalconNuevo from "./views/puntodeventa/VentaBalcon";
import ModeloTicket from "./views/facturacion/ModeloTicket";
import ModeloFactura from "./views/facturacion/ModeloFactura";
import PuntoDeVentaNuevo from "./views/puntodeventa/PuntoDeVenta";
import FormularioPresupuestos from "./views/presupuestos/FormularioPresupuestos";
import Configuraciones from "./views/configuraciones/Configuraciones";
import FacturaSend from "./views/playground/FacturaSendTesting";
import FormularioArticulo from "./views/articulos/components/FormularioArticulo";
import FormularioControl from "./views/compras/control_ingreso/components/FormularioControl";
import PlanificacionRuteamientos from "./views/ruteamientos/new_ruteamiento/PlanificacionRuteamientos";
import VerificadorControl from "./views/compras/control_ingreso/components/VerificadorControl";
import ConsultaPedidosFaltantes from "./views/entregas/ConsultaPedidosFaltantes";
import GestionDirecciones from "./views/direcciones/GestionDirecciones";
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
    <Box bg={isLargerThan768 ? "gray.100" : "white"}>
      <Sidebar />
      <Box
        ml={isLargerThan768 ? ["80px", "80px", "70px"] : 0}
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
                <Route
                  path="/consulta-de-articulos"
                  element={<ConsultaArticulos />}
                />
                <Route
                  path="/autorizacion-ajuste-stock"
                  element={<AutorizacionAjusteStock />}
                />
                <Route path="/home" element={<Home />} />
                <Route
                  path="/ruteamiento-de-pedidos"
                  element={<RuteamientoPedidos />}
                />
                <Route path="/entrega-de-pedidos" element={<Entregas />} />
                <Route
                  path="/ticket"
                  element={<ModeloTicket />}
                />
                <Route
                  path="/factura"
                  element={<ModeloFactura />}
                />
                <Route
                  path="/preparacion-de-pedido"
                  element={<PreparacionPedido />}
                />
                <Route
                  path="/informe-de-entregas"
                  element={<InformeEntregas />}
                />
                <Route path="/cobros" element={<CobrosDiarios />} />
                <Route
                  path="/venta-balcon-nuevo"
                  element={<VentaBalconNuevo />}
                />
                <Route path="/punto-de-venta-nuevo" element={<PuntoDeVentaNuevo />} />


                <Route path="/venta-rapida" element={<VentaRapida />} />

                <Route path="/consulta-de-ventas" element={<ResumenVentas />} />
                <Route path="/informe-de-ventas" element={<InformeVentas />} />
                <Route path="/inventario" element={<GestionInventario />} />
                <Route
                  path="/inventario-scanner"
                  element={<InventarioScanner />}
                />
                {/* <Route
                  path="/toma-de-inventario"
                  element={<TomaDeInventario />}
                /> */}
                <Route
                  path="/toma-de-inventario"
                  element={<TomaDeInventario />}
                />
                <Route path="/dashboard" element={<VentasDashboard />} />
                <Route path="/presupuestos" element={<Presupuestos />} />
                <Route path="/presupuestos-nuevo" element={<FormularioPresupuestos />} />
                <Route
                  path="/consulta-de-presupuestos"
                  element={<ConsultaPresupuestos />}
                />
                <Route path="/ruteamientos" element={<PlanificacionRuteamientos />} />
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
                <Route
                  path="/verificacion-de-pedidos"
                  element={<VerificacionPedidos />}
                />
                <Route path="/configuraciones" element={<Configuraciones />} />
                <Route path="/formulario-articulos" element={<FormularioArticulo />} />
                <Route path="/control-ingreso" element={<FormularioControl />} />
                <Route path="/verificador-ingresos" element={<VerificadorControl />} />
                <Route path="/consulta-pedidos-faltantes" element={<ConsultaPedidosFaltantes />} />
                <Route path="/gestion-direcciones" element={<GestionDirecciones />} />
              </Route>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/404" element={<NoExiste />} />
              <Route path="/playground" element={<FacturaSend />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ChakraProvider>
    </SwitchProvider>
  );
}

export default App;
