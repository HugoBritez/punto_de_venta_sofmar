import { useState } from "react";
import { useGetCuentasBancarias } from "../hooks/useBancosService"
import { filtrarCuentasBancarias } from "../utils/filtrarCuentasBancarias";
import { formatCurrency } from "@/shared/utils/formatCurrency";

export const ConsultaCuentasBancarias = () => {
    const [estadoProp, setEstadoProp] = useState<number | undefined>(undefined);
    const [monedaProp, setMonedaProp] = useState<number | undefined>(undefined);
    const { 
        data: cuentasBancarias, 
        isLoading: isLoadingCuentasBancarias,
        error: errorCuentasBancarias,
        refetch: refetchCuentasBancarias
    } = useGetCuentasBancarias(estadoProp, monedaProp);
    const [busqueda, setBusqueda] = useState<string | undefined>(undefined);

    const bancosFiltrados = filtrarCuentasBancarias(cuentasBancarias || [], busqueda);

    // Componente de estado de carga
    const LoadingState = () => (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Cargando cuentas bancarias...</p>
        </div>
    );

    // Componente de estado de error
    const ErrorState = () => (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar datos</h3>
            <p className="text-gray-600 text-center mb-4">
                {errorCuentasBancarias?.message || 'Ocurrió un error inesperado'}
            </p>
            <button 
                onClick={() => refetchCuentasBancarias()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                Intentar de nuevo
            </button>
        </div>
    );

    // Componente de estado vacío
    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron cuentas</h3>
            <p className="text-gray-600 text-center">
                {busqueda 
                    ? `No hay cuentas bancarias que coincidan con "${busqueda}"`
                    : 'No hay cuentas bancarias disponibles'
                }
            </p>
        </div>
    );

    return (
        <div className="flex flex-col gap-2 w-full bg-blue-200 ">
            <div className="flex flex-row gap-2 p-2 w-full border">
                <label htmlFor="busqueda" className="flex flex-col gap-2 w-1/3">
                    <p className="text-sm font-bold">Buscar</p>
                    <input type="text" className="border border-gray-300 rounded-md p-2" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </label>
                <div className="flex flex-row gap-2 p-2 border bg-yellow-300 w-1/3 items-center justify-around">
                    <label htmlFor="moneda1" className="flex flex-row gap-2 items-center">
                        <p className="text-sm font-bold">Cta. Dolar</p>
                        <input type="checkbox" className="border border-gray-300 rounded-md p-2" checked={monedaProp === 2} onChange={(e) => setMonedaProp(e.target.checked ? 2 : undefined)} />
                    </label>
                    <label htmlFor="moneda1" className="flex flex-row gap-2 items-center">
                        <p className="text-sm font-bold">Cta. Guaraní</p>
                        <input type="checkbox" className="border border-gray-300 rounded-md p-2" checked={monedaProp === 1} onChange={(e) => setMonedaProp(e.target.checked ? 1 : undefined)} />
                    </label>
                    <label htmlFor="moneda1" className="flex flex-row gap-2 items-center">
                        <p className="text-sm font-bold">Todos</p>
                        <input type="checkbox" className="border border-gray-300 rounded-md p-2" checked={monedaProp === undefined} onChange={(e) => setMonedaProp(e.target.checked ? undefined : 2)} />
                    </label>
                </div>
                <div className="flex flex-row gap-2 p-2 border bg-yellow-300">
                    <label htmlFor="moneda1" className="flex flex-row gap-2 items-center">
                        <p className="text-sm font-bold">Cta. Desactivada</p>
                        <input type="checkbox" className="border border-gray-300 rounded-md p-2" checked={estadoProp === 0} onChange={(e) => setEstadoProp(e.target.checked ? 0 : undefined)} />
                    </label>
                </div>
            </div>
            
            <div className="flex flex-row gap-2 p-2">
                {isLoadingCuentasBancarias ? (
                    <LoadingState />
                ) : errorCuentasBancarias ? (
                    <ErrorState />
                ) : bancosFiltrados.length === 0 ? (
                    <EmptyState />
                ) : (
                    <table className="w-full border-collapse border border-gray-300 bg-white">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2 text-left">Codigo</th>
                                <th className="border border-gray-300 p-2 text-left">Desc Banco</th>
                                <th className="border border-gray-300 p-2 text-left">Descripcion</th>
                                <th className="border border-gray-300 p-2 text-left">Titular</th>
                                <th className="border border-gray-300 p-2 text-left">Mneda</th>
                                <th className="border border-gray-300 p-2 text-left">Saldo Cta.</th>
                                <th className="border border-gray-300 p-2 text-left">Titulo Cuenta C.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bancosFiltrados.map((cuenta, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 p-2">{cuenta.codigo || '-'}</td>
                                    <td className="border border-gray-300 p-2">{cuenta.bancoDescripcion || '-'}</td>
                                    <td className="border border-gray-300 p-2">{cuenta.descripcion || '-'}</td>
                                    <td className="border border-gray-300 p-2">{cuenta.titularDescripcion || '-'}</td>
                                    <td className="border border-gray-300 p-2">{cuenta.monedaDescripcion || '-'}</td>
                                    <td className="border border-gray-300 p-2">{formatCurrency(cuenta.saldo) || '-'}</td>
                                    <td className="border border-gray-300 p-2"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
        </div>
    )
}