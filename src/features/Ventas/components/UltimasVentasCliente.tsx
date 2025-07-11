import Modal from "@/ui/modal/Modal";
import { useGetUltimasVentas } from "../core/hooks/useGetUltimasVentas";
import { useGetDetallesVentas } from "../core/services/detalleVentasApi";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

interface UltimasVentasClienteProps {
    cliente?: number;
    isOpen: boolean;
    onClose: () => void;
}

// Componente de loading reutilizable
const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <span className="text-sm text-gray-600">Cargando ventas...</span>
        </div>
    </div>
);

// Componente para mostrar estado vacío
const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium">No hay ventas registradas</p>
        <p className="text-sm">Este cliente no tiene ventas en el período seleccionado</p>
    </div>
);

// Componente para mostrar detalles de venta
const DetallesVentaModal = ({ ventaId, isOpen, onClose }: { ventaId: number | null; isOpen: boolean; onClose: () => void }) => {
    const { data: detalles, isLoading, error } = useGetDetallesVentas(ventaId);

    if (!isOpen || !ventaId) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Detalles de Venta #${ventaId}`}
            maxWidth="max-w-4xl"
        >
            <div className="p-6">
                {isLoading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-8 text-red-500">
                        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-lg font-medium">Error al cargar los detalles</p>
                        <p className="text-sm">Por favor, intenta nuevamente</p>
                    </div>
                ) : !detalles || detalles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                        <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-lg font-medium">No hay detalles disponibles</p>
                        <p className="text-sm">Esta venta no tiene artículos registrados</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Artículo
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Descripción
                                    </th>
                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Cantidad
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Precio
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Descuento
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {detalles.map((detalle) => (
                                    <tr key={detalle.det_codigo} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-3 py-2 text-sm text-gray-900 border-b">
                                            <div>
                                                <div className="font-medium">{detalle.codbarra}</div>
                                                <div className="text-xs text-gray-500">#{detalle.art_codigo}</div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border-b">
                                            <div>
                                                <div>{detalle.descripcion}</div>
                                                {detalle.descripcion_editada && (
                                                    <div className="text-xs text-blue-600 italic">
                                                        "{detalle.descripcion_editada}"
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border-b text-center">
                                            <div>
                                                <div className="font-medium">{detalle.cantidad}</div>
                                                {detalle.unidad_medida && (
                                                    <div className="text-xs text-gray-500">{detalle.unidad_medida}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border-b text-right">
                                            <div>
                                                <div className="font-medium">{detalle.precio}</div>
                                                {detalle.kilos && (
                                                    <div className="text-xs text-gray-500">{detalle.kilos} kg</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border-b text-right">
                                            {detalle.descuento}
                                        </td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 border-b text-right">
                                            {detalle.precio_number * parseFloat(detalle.cantidad.replace(/\./g, '')) - detalle.descuento_number}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Modal>
    );
};

// Función para formatear fecha
const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
        return dateString;
    }
};

// Función para obtener el color del estado
const getEstadoColor = (estado: number): string => {
    switch (estado) {
        case 0: return "bg-red-100 text-red-800";
        case 1: return "bg-green-100 text-green-800";
        case 2: return "bg-yellow-100 text-yellow-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

export const UltimasVentasCliente = ({cliente, isOpen, onClose}: UltimasVentasClienteProps) => {
    const {data: ultimasVentas, isLoading, error} = useGetUltimasVentas(cliente);
    const [detallesVentaId, setDetallesVentaId] = useState<number | null>(null);

    console.log("cliente", cliente)

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Últimas Ventas del Cliente"
                maxWidth="max-w-[1400px]"
            >
                <div className="p-6">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center p-8 text-red-500">
                            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="text-lg font-medium">Error al cargar las ventas</p>
                            <p className="text-sm">Por favor, intenta nuevamente</p>
                        </div>
                    ) : !ultimasVentas || ultimasVentas.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Código
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Fecha
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Factura
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Total
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Saldo
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Descuento
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Condición
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Vendedor
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Sucursal
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {ultimasVentas.map((venta) => (
                                        <tr key={venta.codigo} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                {venta.codigo}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                {formatDate(venta.fecha)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                {venta.factura || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b text-right">
                                                {venta.total}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 border-b text-right">
                                                {venta.saldo}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 border-b text-right">
                                                {venta.descuento}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                {venta.condicion || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                {venta.vendedor || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm border-b">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(venta.estado)}`}>
                                                    {venta.estado_desc || 'Sin estado'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                {venta.sucursal || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm border-b">
                                                <button
                                                    onClick={() => setDetallesVentaId(venta.codigo)}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Ver
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Modal>

            <DetallesVentaModal
                ventaId={detallesVentaId}
                isOpen={!!detallesVentaId}
                onClose={() => setDetallesVentaId(null)}
            />
        </>
    );
};