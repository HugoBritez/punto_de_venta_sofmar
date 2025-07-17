import Modal from "@/ui/modal/Modal";
import { useGetVentasConFiltros } from "../core/hooks/useGetVentasConFiltros";
import {  useGetDetalleVentasProveedor } from "../core/services/detalleVentasApi";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

interface UltimasVentasProps {
    isOpen: boolean;
    onClose: () => void;
    fechaDesde?: string;
    fechaHasta?: string;
    proveedorSeleccionado?: number;
    articuloSeleccionado?: number;
    clienteSeleccionado?: number;
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
        <p className="text-sm">No se encontraron ventas con los filtros aplicados</p>
    </div>
);

// Función para formatear montos como guaraníes
const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toLocaleString('es-PY', { 
        style: 'currency', 
        currency: 'PYG', 
        minimumFractionDigits: 0 
    });
};

// Componente de tarjeta para móviles
const VentaCard = ({ venta, onVerDetalles }: { venta: any; onVerDetalles: (id: number) => void }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">#{venta.codigoVenta}</h3>
                <p className="text-sm text-gray-600">{formatDate(venta.fecha)}</p>
            </div>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(venta.estado)}`}>
                {venta.estado || 'Sin estado'}
            </span>
        </div>
        
        <div className="space-y-2 mb-4">
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Cliente:</span>
                <span className="text-sm text-gray-900">{venta.cliente}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">RUC:</span>
                <span className="text-sm text-gray-900">{venta.clienteRuc}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Total:</span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(venta.total)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Saldo:</span>
                <span className="text-sm text-gray-900">{formatCurrency(venta.saldo)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Factura:</span>
                <span className="text-sm text-gray-900">{venta.factura || '-'}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Vendedor:</span>
                <span className="text-sm text-gray-900">{venta.vendedor || '-'}</span>
            </div>
        </div>
        
        <div className="flex justify-end">
            <button
                onClick={() => onVerDetalles(venta.codigoVenta)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver Detalles
            </button>
        </div>
    </div>
);

// Componente para mostrar detalles de venta (responsive)
const DetallesVentaModal = ({ ventaId, isOpen, onClose, proveedor }: { ventaId: number | null; isOpen: boolean; onClose: () => void, proveedor: number }) => {
    const { data: detalles, isLoading, error } = useGetDetalleVentasProveedor(proveedor, ventaId!);

    if (!isOpen || !ventaId || !proveedor) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Detalles de Venta #${ventaId}`}
            maxWidth="max-w-4xl"
        >
            <div className="p-4 sm:p-6">
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
                    <div className="space-y-4">
                        {/* Vista de tarjetas para móviles */}
                        <div className="block lg:hidden">
                            {detalles.map((detalle) => (
                                <div key={detalle.det_codigo} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{detalle.codbarra}</h4>
                                            <p className="text-xs text-gray-500">#{detalle.art_codigo}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(detalle.precio_number * parseFloat(detalle.cantidad.replace(/\./g, '')) - detalle.descuento_number)}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Descripción:</span>
                                            <span className="text-gray-900">{detalle.descripcion}</span>
                                        </div>
                                        {detalle.descripcion_editada && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Desc. Editada:</span>
                                                <span className="text-blue-600 italic text-xs">"{detalle.descripcion_editada}"</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Cantidad:</span>
                                            <span className="text-gray-900">{detalle.cantidad} {detalle.unidad_medida && `(${detalle.unidad_medida})`}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Precio:</span>
                                            <span className="text-gray-900">{formatCurrency(detalle.precio_number)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Descuento:</span>
                                            <span className="text-gray-900">{formatCurrency(detalle.descuento_number)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Vista de tabla para desktop */}
                        <div className="hidden lg:block overflow-x-auto">
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
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 border-b text-right">
                                                <div>
                                                    <div className="font-medium">{formatCurrency(detalle.precio_number)}</div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 border-b text-right">
                                                {formatCurrency(detalle.descuento_number)}
                                            </td>
                                            <td className="px-3 py-2 text-sm font-medium text-gray-900 border-b text-right">
                                                {formatCurrency(detalle.precio_number * parseFloat(detalle.cantidad.replace(/\./g, '')) - detalle.descuento_number)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
const getEstadoColor = (estado: string): string => {
    switch (estado) {
        case 'Anulado': return "bg-red-100 text-red-800";
        case 'Activo': return "bg-green-100 text-green-800";
        case 'Pendiente': return "bg-yellow-100 text-yellow-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

export const UltimasVentas = ({
    isOpen, 
    onClose, 
    fechaDesde, 
    fechaHasta, 
    proveedorSeleccionado, 
    articuloSeleccionado,
    clienteSeleccionado
}: UltimasVentasProps) => {
    const filtros = {
        fechaDesde,
        fechaHasta,
        proveedorSeleccionado,
        articuloSeleccionado,
        cliente: clienteSeleccionado
    };
    
    const { data: ventas, isLoading, error } = useGetVentasConFiltros(filtros);
    const [detallesVentaId, setDetallesVentaId] = useState<number | null>(null);

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Consulta de Ventas"
                maxWidth="max-w-[1800px]"
            >
                <div className="space-y-4">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center p-4 sm:p-8 text-red-500">
                            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="text-lg font-medium">Error al cargar las ventas</p>
                            <p className="text-sm">Por favor, intenta nuevamente</p>
                        </div>
                    ) : !ventas || ventas.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="space-y-4">
                            {/* Vista de tarjetas para móviles y tablets */}
                            <div className="block lg:hidden">
                                {ventas.map((venta) => (
                                    <VentaCard 
                                        key={venta.codigoVenta} 
                                        venta={venta} 
                                        onVerDetalles={setDetallesVentaId}
                                    />
                                ))}
                            </div>

                            {/* Vista de tabla para desktop */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Código
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Cliente
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
                                        {ventas.map((venta) => (
                                            <tr key={venta.codigoVenta} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                    {venta.codigoVenta}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                    <div>
                                                        <div className="font-medium">{venta.cliente}</div>
                                                        <div className="text-xs text-gray-500">{venta.clienteRuc}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                    {formatDate(venta.fecha)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                    {venta.factura || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b text-right">
                                                    {formatCurrency(venta.total)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 border-b text-right">
                                                    {formatCurrency(venta.saldo)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 border-b text-right">
                                                    {formatCurrency(venta.descuento)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                    {venta.condicion || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                    {venta.vendedor || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm border-b">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(venta.estado)}`}>
                                                        {venta.estado || 'Sin estado'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                    {venta.sucursal || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm border-b">
                                                    <button
                                                        onClick={() => setDetallesVentaId(venta.codigoVenta)}
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
                        </div>
                    )}
                </div>
            </Modal>

            <DetallesVentaModal
                ventaId={detallesVentaId}
                isOpen={!!detallesVentaId}
                onClose={() => setDetallesVentaId(null)}
                proveedor={proveedorSeleccionado!}
            />
        </>
    );
};