import { useState } from "react";
import { useConsultarMovimientosBancarios } from "../hooks/useBancosService";
import Modal from "@/ui/modal/Modal";
import { ConsultaCuentasBancarias } from "./ConsultaCuentasBancarias";

interface ConsultaFilters {
    fechaInicio: string;
    fechaFin: string;
    estado: number;
    cheque: string | undefined;
    codigoCuenta: number | undefined;
    tipoFecha: number;
    guardarCobroTarjeta: number | undefined;
    chequeTransferencia: number | undefined
}

export const ConsultaMovimientoCuentasBancarias = () => {
    const hoy = new Date();
    const haceUnMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
    const [filters, setFilters] = useState<ConsultaFilters>({
        fechaInicio: haceUnMes.toISOString().split('T')[0],
        fechaFin: hoy.toISOString().split('T')[0],
        estado: 1,
        cheque: undefined,
        codigoCuenta: undefined,
        tipoFecha: 1,
        guardarCobroTarjeta: undefined,
        chequeTransferencia: undefined
    })

    const [isOpenCuentasModal, setIsOpenCuentasModal] = useState<boolean>(false);


    const { data: movimientos, isLoading: isLoadingMovimientos } = useConsultarMovimientosBancarios(filters.fechaInicio, filters.fechaFin, filters.estado, filters.codigoCuenta, filters.cheque, filters.tipoFecha, filters.guardarCobroTarjeta, filters.chequeTransferencia)

    return (
        <div className="flex flex-col gap-2 w-full min-h-screen p-0 md:p-2">
            {/* Versión Desktop - Filtros Originales */}
            <div className="hidden lg:flex flex-col gap-2 w-full bg-blue-200 rounded-md p-2 border">
                <div className="flex flex-row gap-2">
                    <div className="flex flex-row gap-2 bg-orange-200 border rounded-md p-2">
                        <label htmlFor="fechaEmision" className="flex flex-row gap-2 items-center">
                            <input type="radio" name="tipoFecha" value={1} onChange={() => setFilters({ ...filters, tipoFecha: 1 })} checked={filters.tipoFecha === 1} />
                            <p className="text-sm font-bold">Fecha de Emisión</p>
                        </label>
                        <label htmlFor="fechaEmision" className="flex flex-row gap-2 items-center">
                            <input type="radio" name="tipoFecha" value={2} onChange={() => setFilters({ ...filters, tipoFecha: 2 })} checked={filters.tipoFecha === 2} />
                            <p className="text-sm font-bold">Fecha de Deb/Cr.</p>
                        </label>
                        <label htmlFor="fechaEmision" className="flex flex-row gap-2 items-center">
                            <input type="radio" name="tipoFecha" value={3} onChange={() => setFilters({ ...filters, tipoFecha: 3 })} checked={filters.tipoFecha === 3} />
                            <p className="text-sm font-bold">Fecha de Pago/Depósito</p>
                        </label>
                    </div>
                    <div className="flex flex-row gap-2 bg-orange-200 border rounded-md p-2">
                        <label htmlFor="fechaEmision" className="flex flex-row gap-2 items-center">
                            <input type="radio" name="tipoFecha" value={1} onChange={() => setFilters({ ...filters, estado: 1 })} checked={filters.estado === 1} />
                            <p className="text-sm font-bold">Confirmado</p>
                        </label>
                        <label htmlFor="fechaEmision" className="flex flex-row gap-2 items-center">
                            <input type="radio" name="tipoFecha" value={2} onChange={() => setFilters({ ...filters, estado: 0 })} checked={filters.estado === 0} />
                            <p className="text-sm font-bold">Diferido</p>
                        </label>
                        <label htmlFor="fechaEmision" className="flex flex-row gap-2 items-center">
                            <input type="radio" name="tipoFecha" value={3} onChange={() => setFilters({ ...filters, estado: 2 })} checked={filters.estado === 2} />
                            <p className="text-sm font-bold">Todos</p>
                        </label>
                    </div>
                    <div>
                        <label htmlFor="numeroCheque" className="flex flex-row gap-2 items-center">
                            <p className="text-sm font-bold">Ingrese Número de Cheque</p>
                            <input type="text" name="numeroCheque" className="w-full border rounded-md p-2 bg-gray-100" onChange={(e) => setFilters({ ...filters, cheque: e.target.value })}/>
                        </label>
                    </div>
                </div>
                <div className="flex flex-row gap-2">
                    <label htmlFor="fechas" className="flex flex-row gap-2 items-center">
                        <p className="text-sm font-bold">Fechas</p>
                        <input type="date" name="fechaInicio" className="w-full border rounded-md p-2 bg-gray-100" onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })} value={filters.fechaInicio}/>
                        <input type="date" name="fechaFin" className="w-full border rounded-md p-2 bg-gray-100" onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })} value={filters.fechaFin}/>
                    </label>
                    <div className="flex flex-row gap-2 bg-orange-200 border rounded-md p-2">
                        <label htmlFor="fechaEmision" className="flex flex-row gap-2 items-center">
                            <input type="radio" name="tipoFecha" value={1} onChange={() => setFilters({ ...filters, estado: 0 })} checked={filters.estado === 0} />
                            <p className="text-sm font-bold">Anulados</p>
                        </label>
                        <label htmlFor="fechaEmision" className="flex flex-row gap-2 items-center">
                            <input type="radio" name="tipoFecha" value={2} onChange={() => setFilters({ ...filters, estado: 1 })} checked={filters.estado === 1} />
                            <p className="text-sm font-bold">Activos</p>
                        </label>
                        <label htmlFor="fechaEmision" className="flex flex-row gap-2 items-center">
                            <input type="radio" name="tipoFecha" value={3} onChange={() => setFilters({ ...filters, estado: 2 })} checked={filters.estado === 2} />
                            <p className="text-sm font-bold">Todos</p>
                        </label>
                    </div>
                    <label htmlFor="saldoFecha" className="flex flex-row gap-2 items-center">
                        <p className="text-sm font-bold whitespace-nowrap">Saldo por fecha de movimiento</p>
                        <input type="checkbox" name="saldoFecha" className="w-full border rounded-md p-2 bg-gray-100" />
                    </label>
                    <label htmlFor="saldoFecha" className="flex flex-row gap-2 items-center">
                        <p className="text-sm font-bold whitespace-nowrap">Cheque pendiente Ap.</p>
                        <input type="checkbox" name="saldoFecha" className="w-full border rounded-md p-2 bg-gray-100" />
                    </label>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white rounded-md border">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Cuenta</label>
                        <div className="flex gap-2">
                            <input type="number" name="cuentaId" placeholder="Código" className="w-1/3 border rounded-md p-2 bg-gray-100"  onClick={() => setIsOpenCuentasModal(true)}/>
                            <input type="text" readOnly name="cuentaNombre" placeholder="Nombre" className="flex-1 border rounded-md p-2 bg-gray-100" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Banco</label>
                        <input type="text" readOnly name="banco" placeholder="Nombre del banco" className="w-full border rounded-md p-2 bg-gray-100" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Moneda</label>
                        <input type="text" readOnly name="moneda" placeholder="Tipo de moneda" className="w-full border rounded-md p-2 bg-gray-100" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Buscar Prov.</label>
                        <input type="text" name="proveedor" placeholder="Buscar proveedor..." className="w-full border rounded-md p-2 bg-gray-100" onClick={() => {}}/>
                    </div>
                </div>
            </div>

            {/* Versión Móvil Ultra Pro - Filtros */}
            <div className="lg:hidden bg-blue-200 rounded-md p-2 border space-y-2">
                {/* Primera fila: Tipo de fecha y Estado */}
                <div className="flex flex-col gap-2">
                    <div className="bg-orange-200 border rounded-md p-2">
                        <div className="text-xs font-bold text-gray-700 mb-2">Tipo de Fecha</div>
                        <div className="flex flex-wrap gap-2">
                            <label className="flex items-center gap-1">
                                <input type="radio" name="tipoFecha" value={1} onChange={() => setFilters({ ...filters, tipoFecha: 1 })} checked={filters.tipoFecha === 1} />
                                <span className="text-xs font-bold">Emisión</span>
                            </label>
                            <label className="flex items-center gap-1">
                                <input type="radio" name="tipoFecha" value={2} onChange={() => setFilters({ ...filters, tipoFecha: 2 })} checked={filters.tipoFecha === 2} />
                                <span className="text-xs font-bold">Deb/Cr</span>
                            </label>
                            <label className="flex items-center gap-1">
                                <input type="radio" name="tipoFecha" value={3} onChange={() => setFilters({ ...filters, tipoFecha: 3 })} checked={filters.tipoFecha === 3} />
                                <span className="text-xs font-bold">Pago/Dep</span>
                            </label>
                        </div>
                    </div>
                    
                    <div className="bg-orange-200 border rounded-md p-2">
                        <div className="text-xs font-bold text-gray-700 mb-2">Estado</div>
                        <div className="flex flex-wrap gap-2">
                            <label className="flex items-center gap-1">
                                <input type="radio" name="estado" value={1} onChange={() => setFilters({ ...filters, estado: 1 })} checked={filters.estado === 1} />
                                <span className="text-xs font-bold">Confirmado</span>
                            </label>
                            <label className="flex items-center gap-1">
                                <input type="radio" name="estado" value={0} onChange={() => setFilters({ ...filters, estado: 0 })} checked={filters.estado === 0} />
                                <span className="text-xs font-bold">Diferido</span>
                            </label>
                            <label className="flex items-center gap-1">
                                <input type="radio" name="estado" value={2} onChange={() => setFilters({ ...filters, estado: 2 })} checked={filters.estado === 2} />
                                <span className="text-xs font-bold">Todos</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Segunda fila: Fechas y Cheque */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <label className="flex items-center gap-1 flex-1">
                            <span className="text-xs font-bold">Fechas</span>
                            <input type="date" name="fechaInicio" className="flex-1 text-xs border rounded px-2 py-1 bg-gray-100" onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })} value={filters.fechaInicio}/>
                            <input type="date" name="fechaFin" className="flex-1 text-xs border rounded px-2 py-1 bg-gray-100" onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })} value={filters.fechaFin}/>
                        </label>
                    </div>
                    
                    <div className="flex gap-2">
                        <label className="flex items-center gap-1 flex-1">
                            <span className="text-xs font-bold">Cheque</span>
                            <input type="text" name="numeroCheque" className="flex-1 text-xs border rounded px-2 py-1 bg-gray-100" onChange={(e) => setFilters({ ...filters, cheque: e.target.value })} placeholder="Nro. Cheque"/>
                        </label>
                    </div>
                </div>

                {/* Tercera fila: Opciones adicionales */}
                <div className="bg-orange-200 border rounded-md p-2">
                    <div className="text-xs font-bold text-gray-700 mb-2">Opciones</div>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-1">
                            <input type="radio" name="estadoAnulados" value={0} onChange={() => setFilters({ ...filters, estado: 0 })} checked={filters.estado === 0} />
                            <span className="text-xs font-bold">Anulados</span>
                        </label>
                        <label className="flex items-center gap-1">
                            <input type="radio" name="estadoActivos" value={1} onChange={() => setFilters({ ...filters, estado: 1 })} checked={filters.estado === 1} />
                            <span className="text-xs font-bold">Activos</span>
                        </label>
                        <label className="flex items-center gap-1">
                            <input type="radio" name="estadoTodos" value={2} onChange={() => setFilters({ ...filters, estado: 2 })} checked={filters.estado === 2} />
                            <span className="text-xs font-bold">Todos</span>
                        </label>
                        <label className="flex items-center gap-1">
                            <input type="checkbox" name="saldoFecha" className="text-blue-600" />
                            <span className="text-xs font-bold">Saldo por fecha</span>
                        </label>
                        <label className="flex items-center gap-1">
                            <input type="checkbox" name="chequePendiente" className="text-blue-600" />
                            <span className="text-xs font-bold">Cheque pendiente</span>
                        </label>
                    </div>
                </div>

                {/* Cuarta fila: Información de cuenta */}
                <div className="border bg-white rounded-md p-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold">Cuenta</label>
                            <div className="flex gap-1">
                                <input type="number" name="cuentaId" placeholder="Código" className="w-1/3 text-xs border rounded px-2 py-1 bg-gray-100" />
                                <input type="text" readOnly name="cuentaNombre" placeholder="Nombre" className="flex-1 text-xs border rounded px-2 py-1 bg-gray-100" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold">Banco</label>
                                <input type="text" readOnly name="banco" placeholder="Banco" className="w-full text-xs border rounded px-2 py-1 bg-gray-100" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold">Moneda</label>
                                <input type="text" readOnly name="moneda" placeholder="Moneda" className="w-full text-xs border rounded px-2 py-1 bg-gray-100" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold">Buscar Prov.</label>
                            <input type="text" name="proveedor" placeholder="Proveedor" className="w-full text-xs border rounded px-2 py-1 bg-gray-100" onClick={() => {}}/>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Versión Desktop - Tabla */}
            <div className="hidden lg:block w-full bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cod. Mov.</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha Mov.</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha Venc.</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">F. Conciliacion</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo Mov.</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cuenta</th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-700">Debito</th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-700">Credito</th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-700">Saldo</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">A la orden/ Concepto</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nro. Cheq/Doc</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-700">Conciliado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoadingMovimientos ? (
                                <tr>
                                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <span className="ml-2">Cargando movimientos...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : movimientos && movimientos.length > 0 ? (
                                movimientos.map((movimiento, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-900">{movimiento.mcCodigoMovimiento || '-'}</td>
                                        <td className="px-4 py-3 text-gray-900">{movimiento.mcFecha || '-'}</td>
                                        <td className="px-4 py-3 text-gray-900">{movimiento.mcVencimiento || '-'}</td>
                                        <td className="px-4 py-3 text-gray-900">{movimiento.mcFechaConciliado || '-'}</td>
                                        <td className="px-4 py-3 text-gray-900">{movimiento.tmDescripcion || '-'}</td>
                                        <td className="px-4 py-3 text-gray-900">{movimiento.cbDescripcion || '-'}</td>
                                        <td className="px-4 py-3 text-right text-gray-900">
                                            {movimiento.mcDebito ? `$${movimiento.mcDebito.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-900">
                                            {movimiento.mcHaber ? `$${movimiento.mcHaber.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                                            {movimiento.mcDebito || movimiento.mcHaber ? 
                                                `$${((movimiento.mcDebito || 0) - (movimiento.mcHaber || 0)).toLocaleString()}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-900">{movimiento.mcOrden || '-'}</td>
                                        <td className="px-4 py-3 text-gray-900">{movimiento.mcNumero || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                movimiento.mcConciliado === 1
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {movimiento.mcConciliado === 1 ? 'Sí' : 'No'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                                        No se encontraron movimientos con los filtros seleccionados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Versión Móvil Ultra Pro - Tarjetas */}
            <div className="lg:hidden">
                {isLoadingMovimientos ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="text-gray-600 font-medium">Cargando movimientos...</span>
                        </div>
                    </div>
                ) : movimientos && movimientos.length > 0 ? (
                    <div className="space-y-4 p-4">
                        {movimientos.map((movimiento, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                {/* Header de la tarjeta */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-700">#{movimiento.mcCodigoMovimiento || 'N/A'}</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                movimiento.mcConciliado === 1
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-orange-100 text-orange-800'
                                            }`}>
                                                {movimiento.mcConciliado === 1 ? '✓ Conciliado' : '⏳ Pendiente'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-gray-900">
                                                {movimiento.mcDebito || movimiento.mcHaber ? 
                                                    `$${((movimiento.mcDebito || 0) - (movimiento.mcHaber || 0)).toLocaleString()}` : '-'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {movimiento.mcFecha ? new Date(movimiento.mcFecha).toLocaleDateString('es-ES') : '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contenido de la tarjeta */}
                                <div className="p-4 space-y-3">
                                    {/* Tipo de movimiento y cuenta */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Tipo Movimiento</div>
                                            <div className="text-sm font-medium text-gray-900">{movimiento.tmDescripcion || '-'}</div>
                                        </div>
                                        <div className="flex-1 text-right">
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Cuenta</div>
                                            <div className="text-sm font-medium text-gray-900">{movimiento.cbDescripcion || '-'}</div>
                                        </div>
                                    </div>

                                    {/* Fechas */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Vencimiento</div>
                                            <div className="text-sm text-gray-900">
                                                {movimiento.mcVencimiento ? new Date(movimiento.mcVencimiento).toLocaleDateString('es-ES') : '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Conciliación</div>
                                            <div className="text-sm text-gray-900">
                                                {movimiento.mcFechaConciliado ? new Date(movimiento.mcFechaConciliado).toLocaleDateString('es-ES') : '-'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Montos */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-red-50 rounded-lg p-3">
                                            <div className="text-xs text-red-600 uppercase tracking-wide font-medium">Débito</div>
                                            <div className="text-lg font-bold text-red-700">
                                                {movimiento.mcDebito ? `$${movimiento.mcDebito.toLocaleString()}` : '-'}
                                            </div>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-3">
                                            <div className="text-xs text-green-600 uppercase tracking-wide font-medium">Crédito</div>
                                            <div className="text-lg font-bold text-green-700">
                                                {movimiento.mcHaber ? `$${movimiento.mcHaber.toLocaleString()}` : '-'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Concepto y número */}
                                    <div className="space-y-2">
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Concepto</div>
                                            <div className="text-sm text-gray-900 font-medium">{movimiento.mcOrden || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">Nro. Cheque/Doc</div>
                                            <div className="text-sm text-gray-900">{movimiento.mcNumero || '-'}</div>
                                        </div>
                                    </div>

                                    {/* Botón de acción */}
                                    <div className="pt-2">
                                        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                            Ver Detalles
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay movimientos</h3>
                        <p className="text-gray-500 text-center">No se encontraron movimientos con los filtros seleccionados</p>
                    </div>
                )}
            </div>
            <Modal isOpen={isOpenCuentasModal} onClose={() => setIsOpenCuentasModal(false)} title="Cuentas Bancarias" maxWidth="max-w-7xl" backgroundColor="bg-blue-200">
                <ConsultaCuentasBancarias/>
            </Modal>
        </div>
    )
}


