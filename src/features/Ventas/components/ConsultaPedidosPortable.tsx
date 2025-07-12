import Modal from "@/ui/modal/Modal";
import { usePedidosProveedor, usePedidosDetalle } from "@/shared/hooks/querys/usePedidos";
import { PedidoProveedor, PedidoDetalle } from "@/shared/types/pedidos";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { useMonedas } from "@/shared/hooks/querys/useMonedas";
import { Vendedor } from "@/shared/components/ModalVendedores/types/vendedor.type";
import { Moneda } from "@/shared/types/moneda";
import ModalVendedores from "@/shared/components/ModalVendedores/ModalVendedores";
import { ModalVendedoresMobile } from "@/shared/components/ModalVendedores/ModalVendedoresMovile";
import { ArticulosComponent } from "@/ui/articulos/ArticulosComponent";
import { ArticulosComponentMobile } from "@/ui/articulos/ArticulosComponentMobile";
import { Articulo } from "@/ui/articulos/types/articulo.type";

interface ConsultaPedidosPortableProps {
    isOpen: boolean;
    onClose: () => void;
    fechaDesde?: string;
    fechaHasta?: string;
    proveedorSeleccionado?: number;
    clienteSeleccionado?: number;
}

// Componente de loading reutilizable
const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <span className="text-sm text-gray-600">Cargando pedidos...</span>
        </div>
    </div>
);

// Componente para mostrar estado vacío
const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium">No hay pedidos registrados</p>
        <p className="text-sm">No se encontraron pedidos con los filtros aplicados</p>
    </div>
);

// Componente de tarjeta para móviles
const PedidoCard = ({ pedido, onVerDetalles }: { pedido: PedidoProveedor; onVerDetalles: (id: number) => void }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">#{pedido.pedidoId}</h3>
                <p className="text-sm text-gray-600">{formatDate(pedido.fecha)}</p>
            </div>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(pedido.estado)}`}>
                {pedido.estado || 'Sin estado'}
            </span>
        </div>

        <div className="space-y-2 mb-4">
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Cliente:</span>
                <span className="text-sm text-gray-900">{pedido.cliente}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">RUC:</span>
                <span className="text-sm text-gray-900">{pedido.clienteRuc}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Proveedor:</span>
                <span className="text-sm text-gray-900">{pedido.proveedor}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Total:</span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(pedido.total)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Total Items:</span>
                <span className="text-sm text-gray-900">{pedido.totalItems}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Vendedor:</span>
                <span className="text-sm text-gray-900">{pedido.vendedor || '-'}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Operador:</span>
                <span className="text-sm text-gray-900">{pedido.operador || '-'}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Factura:</span>
                <span className="text-sm text-gray-900">{pedido.factura || '-'}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Condición:</span>
                <span className="text-sm text-gray-900">{pedido.condicion || '-'}</span>
            </div>
        </div>
        
        <div className="flex justify-end">
            <button
                onClick={() => onVerDetalles(pedido.pedidoId)}
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

// Componente para mostrar detalles de pedido (responsive)
const DetallesPedidoModal = ({ pedidoId, isOpen, onClose }: { pedidoId: number | null; isOpen: boolean; onClose: () => void }) => {
    const { data: detalles, isLoading, error } = usePedidosDetalle(pedidoId || 0);

    if (!isOpen || !pedidoId) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Detalles de Pedido #${pedidoId}`}
            maxWidth="max-w-7xl"
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
                        <p className="text-sm">Este pedido no tiene artículos registrados</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Vista de tarjetas para móviles */}
                        <div className="block lg:hidden">
                            {detalles.map((detalle: PedidoDetalle) => (
                                <div key={detalle.det_codigo} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">#{detalle.det_codigo}</h4>
                                            <p className="text-xs text-gray-500">Artículo</p>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(detalle.precio * detalle.cantidad)}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Descripción:</span>
                                            <span className="text-gray-900">{detalle.descripcion}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Cantidad:</span>
                                            <span className="text-gray-900">{detalle.cantidad}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Precio:</span>
                                            <span className="text-gray-900">{detalle.precio}</span>
                                        </div>
                                        {detalle.descuento && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Descuento:</span>
                                                <span className="text-gray-900">{detalle.descuento}</span>
                                            </div>
                                        )}
                                        {detalle.bonificacion && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Bonificación:</span>
                                                <span className="text-gray-900">{detalle.bonificacion}</span>
                                            </div>
                                        )}
                                        {detalle.lote && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Lote:</span>
                                                <span className="text-gray-900">{detalle.lote}</span>
                                            </div>
                                        )}
                                        {detalle.obs && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Observaciones:</span>
                                                <span className="text-blue-600 italic text-xs">"{detalle.obs}"</span>
                                            </div>
                                        )}
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
                                            Descripción
                                        </th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Cantidad
                                        </th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Ult. Costo
                                        </th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Precio de Venta
                                        </th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            % Utilidad
                                        </th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Descuento
                                        </th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Total
                                        </th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                            Lote
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {detalles.map((detalle: PedidoDetalle) => (
                                        <tr key={detalle.det_codigo} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-3 py-2 text-sm text-gray-900 border-b">
                                                <div>
                                                    <div>{detalle.descripcion}</div>
                                                    {detalle.obs && (
                                                        <div className="text-xs text-blue-600 italic">
                                                            "{detalle.obs}"
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 border-b text-center">
                                                {detalle.cantidad}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 border-b text-right">
                                                {detalle.costo.toLocaleString('es-PY', { style: 'currency', currency: 'PYG' }) || '-'}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 border-b text-right">
                                                {detalle.precio.toLocaleString('es-PY', { style: 'currency', currency: 'PYG' }) || '-'}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 border-b text-right">
                                                {detalle.porcentaje_utilidad.toFixed(2) + '%' || '-'}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 border-b text-right">
                                                {detalle.descuento || '-'}
                                            </td>
                                            <td className="px-3 py-2 text-sm font-medium text-gray-900 border-b text-right">
                                                {formatCurrency(detalle.precio * detalle.cantidad)}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 border-b text-center">
                                                {detalle.lote || '-'}
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

// Función para formatear moneda
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-PY', {
        style: 'currency',
        currency: 'PYG'
    }).format(amount);
};

// Función para obtener el color del estado
const getEstadoColor = (estado: string): string => {
    switch (estado) {
        case 'Anulado': return "bg-red-100 text-red-800";
        case 'Activo': return "bg-green-100 text-green-800";
        case 'Pendiente': return "bg-yellow-100 text-yellow-800";
        case 'Entregado': return "bg-blue-100 text-blue-800";
        case 'En Proceso': return "bg-orange-100 text-orange-800";
        default: return "bg-gray-100 text-gray-800";
    }
};

export const ConsultaPedidosPortable = ({
    isOpen, 
    onClose, 
    fechaDesde, 
    fechaHasta, 
    proveedorSeleccionado,
    clienteSeleccionado
}: ConsultaPedidosPortableProps) => {
    const [nroPedido, setNroPedido] = useState<number | null>(null);
    const [vendedorSeleccionado, setVendedorSeleccionado] = useState<Vendedor | null>(null);
    const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo | null>(null);
    const [monedaSeleccionada, setMonedaSeleccionada] = useState<Moneda | null>(null);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState<number  | null>(null);
    const [isOpenModalVendedores, setIsOpenModalVendedores] = useState<boolean>(false);
    const [isOpenModalArticulos, setIsOpenModalArticulos] = useState<boolean>(false);

    // Agregar logs para debuggear
    console.log('ConsultaPedidosPortable - articuloSeleccionado:', articuloSeleccionado);
    console.log('ConsultaPedidosPortable - articuloSeleccionado?.id_articulo:', articuloSeleccionado?.id_articulo);

    const { data: pedidos, isLoading, error } = usePedidosProveedor(
        fechaDesde || '', 
        fechaHasta || '', 
        proveedorSeleccionado || 0, 
        clienteSeleccionado,
        nroPedido || undefined,
        vendedorSeleccionado?.op_codigo || undefined,
        articuloSeleccionado?.id_articulo || undefined,
        monedaSeleccionada?.moCodigo || undefined,
        estadoSeleccionado || undefined
    );
    const [detallesPedidoId, setDetallesPedidoId] = useState<number | null>(null);

    const { data: monedas } = useMonedas();

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Consulta de Pedidos"
                maxWidth="max-w-[1800px]"
            >
                <div className="space-y-4">
                    <div className="flex flex-col lg:flex-row p-2 bg-blue-200 rounded-md gap-2">
                        <div className="flex flex-col gap-2 w-full lg:w-auto">
                             <label htmlFor="nroPedido" className="text-sm lg:text-md font-bold text-gray-800">Nro. Pedido</label>
                             <input type="number" id="nroPedido" className="border border-gray-300 rounded-md p-2 text-sm" value={nroPedido || ''} onChange={(e) => setNroPedido(Number(e.target.value))} />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                             <label htmlFor="vendedor" className="text-sm lg:text-md font-bold text-gray-800">Vendedor</label>
                             <div className="relative">
                                 <input 
                                     type="text" 
                                     id="vendedor" 
                                     className="border border-gray-300 rounded-md p-2 pr-10 w-full text-sm" 
                                     value={vendedorSeleccionado?.op_nombre || ''} 
                                     onClick={() => setIsOpenModalVendedores(true)}
                                     readOnly
                                 />
                                 {vendedorSeleccionado && (
                                     <button
                                         type="button"
                                         onClick={() => setVendedorSeleccionado(null)}
                                         className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-150"
                                         title="Eliminar vendedor"
                                     >
                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                         </svg>
                                     </button>
                                 )}
                             </div>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                             <label htmlFor="articulo" className="text-sm lg:text-md font-bold text-gray-800">Articulo</label>
                             <div className="relative">
                                 <input 
                                     type="text" 
                                     id="articulo" 
                                     className="border border-gray-300 rounded-md p-2 pr-10 w-full text-sm" 
                                     value={articuloSeleccionado?.descripcion || ''} 
                                     onClick={() => setIsOpenModalArticulos(true)}
                                     readOnly
                                 />
                                 {articuloSeleccionado && (
                                     <button
                                         type="button"
                                         onClick={() => setArticuloSeleccionado(null)}
                                         className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-150"
                                         title="Eliminar artículo"
                                     >
                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                         </svg>
                                     </button>
                                 )}
                             </div>
                        </div>
                        <div className="flex flex-col gap-2 w-full lg:w-auto">
                             <label htmlFor="moneda" className="text-sm lg:text-md font-bold text-gray-800">Moneda</label>
                             <select id="moneda" className="border border-gray-300 rounded-md p-2 text-sm" value={monedaSeleccionada?.moCodigo || ''} onChange={(e) => setMonedaSeleccionada(monedas?.find((moneda) => moneda.moCodigo === Number(e.target.value)) || null)}>
                                {monedas?.map((moneda) => (
                                    <option key={moneda.moCodigo} value={moneda.moCodigo}>{moneda.moDescripcion}</option>
                                ))}
                             </select>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-2 px-4 py-2 items-start lg:items-center bg-white rounded-md border border-blue-500">
                            <div className="flex flex-row gap-2 items-center">
                                <input type="radio" name="pendientes" id="pendientes" checked={estadoSeleccionado === 1} onChange={() => setEstadoSeleccionado(1)} />
                                <label htmlFor="pendientes" className="text-sm lg:text-md font-bold text-gray-800">Pendientes</label>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <input type="radio" name="pendientes" id="pendientes" checked={estadoSeleccionado === 2} onChange={() => setEstadoSeleccionado(2)} />
                                <label htmlFor="pendientes" className="text-sm lg:text-md font-bold text-gray-800">Procesados</label>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <input type="radio" name="pendientes" id="pendientes" checked={estadoSeleccionado === null} onChange={() => setEstadoSeleccionado(null)} />
                                <label htmlFor="pendientes" className="text-sm lg:text-md font-bold text-gray-800">Todos</label>
                            </div>
                        </div>
                    </div>
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center p-4 sm:p-8 text-red-500">
                            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="text-lg font-medium">Error al cargar los pedidos</p>
                            <p className="text-sm">Por favor, intenta nuevamente</p>
                        </div>
                    ) : !pedidos || pedidos.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="space-y-4">
                            {/* Vista de tarjetas para móviles y tablets */}
                            <div className="block lg:hidden">
                                {pedidos.map((pedido: PedidoProveedor) => (
                                    <PedidoCard 
                                        key={pedido.pedidoId} 
                                        pedido={pedido} 
                                        onVerDetalles={setDetallesPedidoId}
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
                                                Vendedor
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Condición
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Estado
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {pedidos.map((pedido: PedidoProveedor) => (
                                            <tr key={pedido.pedidoId} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                    {pedido.pedidoId}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                    <div>
                                                        <div className="font-medium">{pedido.cliente}</div>
                                                        <div className="text-xs text-gray-500">{pedido.clienteRuc}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                    {formatDate(pedido.fecha)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                    {pedido.factura || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b text-right">
                                                    {formatCurrency(pedido.total)}
                                                </td>

                                                <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                    {pedido.vendedor || '-'}
                                                </td>
  
                                                <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                    {pedido.condicion || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm border-b">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(pedido.estado)}`}>
                                                        {pedido.estado || 'Sin estado'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm border-b">
                                                    <button
                                                        onClick={() => setDetallesPedidoId(pedido.pedidoId)}
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
            <DetallesPedidoModal
                pedidoId={detallesPedidoId}
                isOpen={!!detallesPedidoId}
                onClose={() => setDetallesPedidoId(null)}
            />
            {/* Componente de vendedores responsive */}
            <div className="hidden lg:block">
                <ModalVendedores
                    isOpen={isOpenModalVendedores}
                    setIsOpen={setIsOpenModalVendedores}
                    onSelect={(vendedor) => {
                        setVendedorSeleccionado(vendedor);
                        setIsOpenModalVendedores(false);
                    }}
                />
            </div>
            <div className="block lg:hidden">
                <ModalVendedoresMobile
                    isOpen={isOpenModalVendedores}
                    setIsOpen={setIsOpenModalVendedores}
                    onSelect={(vendedor) => {
                        setVendedorSeleccionado(vendedor);
                        setIsOpenModalVendedores(false);
                    }}
                />
            </div>
            {/* Componente de artículos responsive */}
            <div className="hidden lg:block">
                <ArticulosComponent
                    isOpen={isOpenModalArticulos}
                    setIsOpen={setIsOpenModalArticulos}
                    onSelect={(articulo) => {
                        setArticuloSeleccionado(articulo);
                        setIsOpenModalArticulos(false);
                    }}
                    proveedorInicial={proveedorSeleccionado}
                />
            </div>
            <div className="block lg:hidden">
                <ArticulosComponentMobile
                    isOpen={isOpenModalArticulos}
                    setIsOpen={setIsOpenModalArticulos}
                    onSelect={(articulo) => {
                        setArticuloSeleccionado(articulo);
                        setIsOpenModalArticulos(false);
                    }}
                    proveedorInicial={proveedorSeleccionado}
                />
            </div>
        </>
    );
};
