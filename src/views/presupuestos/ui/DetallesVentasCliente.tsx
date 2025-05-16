import { Box,  IconButton, Heading, Flex } from "@chakra-ui/react";
import { Cliente } from "@/shared/types/shared_interfaces";
import { api_url } from "@/utils";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface VentaCliente {
  codigo: number;
  fecha: string;
  factura: string;
  total: number;
  saldo: number;
  descuento: number;
  estado: number;
  estado_desc: string;
  condicion: string;
  vendedor: string;
}

interface DetalleVentaCliente {
  det_codigo: number;
  codbarra: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  descuento: number;
  lote: string;
}

 export const DetallesVentasCliente = ({
  cliente,
  onClose,
}: {
  cliente: Cliente;
  onClose: () => void;
  isOpen: boolean;
}) => {
  const [ventas, setVentas] = useState<VentaCliente[]>([]);
  const [detalleVenta, setDetalleVenta] = useState<DetalleVentaCliente[]>([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<number | null>(
    null
  );
  const toast = useToast();

  const fetchVentasCliente = async () => {
    try {
      const response = await axios.post(`${api_url}venta/consultas`, {
        cliente: cliente.cli_codigo,
        estadoVenta: 3,
      });
      setVentas(response.data.body);
    } catch (error) {
      toast({
        title: "Error al cargar las ventas",
        description: "No se pudieron cargar las ventas del cliente",
        status: "error",
        duration: 3000,
      });
    }
  };

  const fetchDetalleVenta = async (codigo: number) => {
    try {
      const response = await axios.get(
        `${api_url}venta/detalles?cod=${codigo}`
      );
      setDetalleVenta(response.data.body);
    } catch (error) {
      toast({
        title: "Error al cargar el detalle",
        description: "No se pudo cargar el detalle de la venta",
        status: "error",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchVentasCliente();
  }, [cliente]);

  const setColor = (estado: number) => {
    if (estado === 2) return "bg-pink-200"; // anulado
    return "bg-white";
  };

  return (
    <Box h="full" p={4} display="flex" flexDirection="column" gap={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Últimas ventas de {cliente.cli_razon}</Heading>
        <IconButton
          aria-label="Cerrar"
          icon={<X />}
          onClick={onClose}
          variant="ghost"
        />
      </Flex>

      <Box flex={1} overflow="auto">
        <Box mb={4} maxH="50%" overflow="auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr className="[&>th]:p-2 text-left">
                <th>Código</th>
                <th>Fecha</th>
                <th>Factura</th>
                <th>Total</th>
                <th>Saldo</th>
                <th>Descuento</th>
                <th>Condición</th>
                <th>Vendedor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr
                  key={venta.codigo}
                  className={`${setColor(
                    venta.estado
                  )} hover:bg-gray-50 cursor-pointer ${
                    ventaSeleccionada === venta.codigo ? "bg-blue-100" : ""
                  }`}
                  onClick={() => {
                    setVentaSeleccionada(venta.codigo);
                    fetchDetalleVenta(venta.codigo);
                  }}
                >
                  <td className="p-2">{venta.codigo}</td>
                  <td className="p-2">{venta.fecha}</td>
                  <td className="p-2">{venta.factura}</td>
                  <td className="p-2 text-right">
                    {venta.total.toLocaleString("es-PY")}
                  </td>
                  <td className="p-2 text-right">
                    {venta.saldo.toLocaleString("es-PY")}
                  </td>
                  <td className="p-2 text-right">
                    {venta.descuento.toLocaleString("es-PY")}
                  </td>
                  <td className="p-2">{venta.condicion}</td>
                  <td className="p-2">{venta.vendedor}</td>
                  <td className="p-2">{venta.estado_desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        {ventaSeleccionada && (
          <Box>
            <Heading size="sm" mb={2}>
              Detalle de la venta
            </Heading>
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr className="[&>th]:p-2 text-left">
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Descuento</th>
                  <th>Subtotal</th>
                  <th>Lote</th>
                </tr>
              </thead>
              <tbody>
                {detalleVenta.map((detalle) => (
                  <tr key={detalle.det_codigo} className="hover:bg-gray-50">
                    <td className="p-2">{detalle.codbarra}</td>
                    <td className="p-2">{detalle.descripcion}</td>
                    <td className="p-2 text-right">{detalle.cantidad}</td>
                    <td className="p-2 text-right">
                      {detalle.precio.toLocaleString("es-PY")}
                    </td>
                    <td className="p-2 text-right">{detalle.descuento}%</td>
                    <td className="p-2 text-right">
                      {(
                        detalle.precio *
                        detalle.cantidad *
                        (1 - detalle.descuento / 100)
                      ).toLocaleString("es-PY")}
                    </td>
                    <td className="p-2">{detalle.lote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Box>
    </Box>
  );
};
