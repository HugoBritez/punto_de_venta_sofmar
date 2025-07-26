import { useGetDetallesVentas } from "@/features/Ventas/core/services/detalleVentasApi";
import { useGetDeuda, useUltimoCobro } from "@/shared/hooks/querys/useClientes";
import { usePedidosDetalle, usePedidosPorCliente } from "@/shared/hooks/querys/usePedidos";
import { useUltimasVentasPorCliente } from "@/shared/hooks/querys/useVentas"
import { VentaViewModel } from "@/shared/types/venta";
import { Pedido } from "@/views/pedidos/FormularioPedidos/types/shared.type";
import { useState } from "react";

// Utilidad para formatear fecha
const formatDate = (date: string) => {
    if (!date) return "";
    
    try {
        const dateObj = new Date(date);
        
        // Si la fecha es válida, formatearla
        if (!isNaN(dateObj.getTime())) {
            return dateObj.toLocaleDateString("es-PY");
        }
        
        // Si no es válida, mostrar la fecha original
        return date;
    } catch (error) {
        // En caso de error, mostrar la fecha original
        return date;
    }
};

// Utilidad para formatear deuda en guaraníes
const formatDeuda = (amount: number) => {
    if (amount === undefined || amount === null) return "0";
    return amount.toLocaleString('es-PY', {
        style: 'currency',
        currency: 'PYG',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

export const HistorialClienteTab = ({ clienteRuc }: { clienteRuc: string }) => {
    const { data: ultimasVentas, isLoading: isLoadingUltimasVentas } = useUltimasVentasPorCliente(clienteRuc);
    const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaViewModel | null>(null);
    const { data: detalleVentas } = useGetDetallesVentas(ventaSeleccionada?.codigo || null);
    const { data: deuda, isLoading: isLoadingDeuda } = useGetDeuda(clienteRuc);

    const { data: ultimosPedidos, isLoading: isLoadingUltimosPedidos } = usePedidosPorCliente(clienteRuc);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
    const { data: detallePedidos } = usePedidosDetalle(pedidoSeleccionado?.pedido_id || 0);

    const { data: ultimoCobro, isLoading: isLoadingUltimoCobro } = useUltimoCobro(clienteRuc);

    return (
        <div className="space-y-6">
            {/* Resumen */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Fecha de último pago</div>
                    {isLoadingUltimoCobro ? (
                        <div className="h-6 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : ultimoCobro ? (
                        <div className="font-semibold">{ultimoCobro.monto}</div>
                    ) : (
                        <div className="text-gray-500">-</div>
                    )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded">
                    <div className="text-sm text-gray-600">Deuda Actual</div>
                    {isLoadingDeuda ? (
                        <div className="h-6 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : deuda !== undefined && deuda !== null ? (
                        <div className={`font-semibold ${deuda > 0 ? "text-red-600" : "text-green-600"}`}>
                            {formatDeuda(deuda)}
                        </div>
                    ) : (
                        <div className="text-gray-500">-</div>
                    )}
                </div>
            </div>

            {/* Ventas */}
            <div>
                <h3 className="font-medium mb-3">Ventas</h3>
                {isLoadingUltimasVentas ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                        ))}
                    </div>
                ) : ultimasVentas?.length === 0 ? (
                    <div className="text-gray-500 text-sm">Sin ventas</div>
                ) : (
                    <div className="space-y-2">
                        {ultimasVentas?.map((venta) => (
                            <div
                                key={venta.codigo}
                                className="border rounded p-3 cursor-pointer hover:bg-gray-50"
                                onClick={() => setVentaSeleccionada(ventaSeleccionada?.codigo === venta.codigo ? null : venta)}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">{formatDate(venta.fecha)}</div>
                                        <div className="text-sm text-gray-600">#{venta.codigo}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{venta.total}</div>
                                        <div className="text-sm text-gray-600">{venta.vendedor}</div>
                                    </div>
                                </div>
                                
                                {ventaSeleccionada?.codigo === venta.codigo && detalleVentas && (
                                    <div className="mt-3 pt-3 border-t">
                                        <div className="text-sm font-medium mb-2">Detalle:</div>
                                        <div className="space-y-1">
                                            {detalleVentas.map((det: any) => (
                                                <div key={det.det_codigo} className="flex justify-between text-sm">
                                                    <span>{det.descripcion}</span>
                                                    <span>{det.cantidad} x {det.precio}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pedidos */}
            <div>
                <h3 className="font-medium mb-3">Pedidos</h3>
                {isLoadingUltimosPedidos ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                        ))}
                    </div>
                ) : ultimosPedidos?.length === 0 ? (
                    <div className="text-gray-500 text-sm">Sin pedidos</div>
                ) : (
                    <div className="space-y-2">
                        {ultimosPedidos?.map((pedido) => (
                            <div
                                key={pedido.pedido_id}
                                className="border rounded p-3 cursor-pointer hover:bg-gray-50"
                                onClick={() => setPedidoSeleccionado(pedidoSeleccionado?.pedido_id === pedido.pedido_id ? null : pedido)}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">{formatDate(pedido.fecha)}</div>
                                        <div className="text-sm text-gray-600">#{pedido.pedido_id}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{pedido.total}</div>
                                        <div className="text-sm text-gray-600">{pedido.vendedor}</div>
                                    </div>
                                </div>
                                
                                {pedidoSeleccionado?.pedido_id === pedido.pedido_id && detallePedidos && (
                                    <div className="mt-3 pt-3 border-t">
                                        <div className="text-sm font-medium mb-2">Detalle:</div>
                                        <div className="space-y-1">
                                            {detallePedidos.map((det: any) => (
                                                <div key={det.det_codigo} className="flex justify-between text-sm">
                                                    <span>{det.descripcion}</span>
                                                    <span>{det.cantidad} x {det.precio}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};