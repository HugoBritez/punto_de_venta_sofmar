import { VentaDTO, DetalleVentaTabla } from "../types/sharedDTO.type";
import { useEffect, useState } from "react";
import { Articulo } from "@/ui/articulos/types/articulo.type";
import { Deposito } from "@/ui/buscador_articulos/types/articulo";
import { agregarItemVentaRapida, eliminarItemVenta, actualizarCantidadItemVenta, actualizarDescripcionItemVenta, actualizarPrecioUnitarioItemVenta } from "../core/services/ventasService";
import { ListaPrecios, Sucursal } from "@/types/shared_interfaces";
import { useOperadoresStore } from "@/stores/operadoresStore";
import { useToast } from "@chakra-ui/react";
import { ShoppingBag, ArchiveX, ArrowUp, Trash2, Loader2 } from "lucide-react";
import { SideMenu } from "@/ui/mobile/sidemenu/SideMenu";
import { BuscadorArticulos } from "@/ui/mobile/buscardor_articulos/BuscadorArticulos";
import { useSucursalesStore } from "@/stores/sucursalesStore";
import { useDepositosStore } from "@/stores/depositosStore";
import { useListaPreciosStore } from "@/stores/listaPreciosStore";
import { useVentaRapidaConfigStore } from "../stores/ventaRapidaConfigStore";
import { formatCurrency } from "../core/utils/formatCurrency";
import { BottomSheet } from "@/ui/mobile/BottomSheet/BottomSheet";
import { useCrearVenta } from "@/shared/hooks/mutations/ventas/crearVenta";
import { mapDetalleVentaDTOToDetalleVenta, mapVentaDTOToVenta } from "../core/utils/mappers";
import { calcularTotales } from "../core/utils/calcularTotales";
import { useClientePorDefecto } from "@/shared/hooks/querys/useConfiguraciones";

interface TipoRenderizacion {
    tipo: "tabla" | "lista"
}

const VentaRapida = () => {
    const { 
        sucursalSeleccionada: sucursalGuardada, 
        depositoSeleccionado: depositoGuardado,
        listaPrecioSeleccionada: listaPrecioGuardada,
        tipoRenderizacion: tipoRenderizacionGuardado,
        tipoVenta: tipoVentaGuardado,
        setSucursalSeleccionada: setSucursalGuardada,
        setDepositoSeleccionado: setDepositoGuardado,
        setListaPrecioSeleccionada: setListaPrecioGuardada,
        setTipoRenderizacion: setTipoRenderizacionGuardado,
        setTipoVenta: setTipoVentaGuardado
    } = useVentaRapidaConfigStore();


    const { data: clientePorDefecto } = useClientePorDefecto();

    const [ventaDTO, setVentaDTO] = useState<VentaDTO>(
        {
            ve_codigo: 0,
            ve_fecha: new Date().toISOString(),
            ve_operador: 0,
            ve_deposito: 0,
            ve_moneda: 1,
            ve_factura: "",
            ve_credito: 0,
            ve_saldo: 0,
            ve_devolucion: 0,
            ve_procesado: 0,
            ve_descuento: 0,
            ve_cuotas: 0,
            ve_cantCuotas: 0,
            ve_obs: "Venta desde dispositivo móvil",
            ve_vendedor: 0,
            ve_sucursal: 0,
            ve_metodo: 0,
            ve_aplicar_a: 0,
            ve_retencion: 0,
            ve_timbrado: "",
            ve_codeudor: 1,
            ve_pedido: 0,
            ve_hora: new Date().toLocaleTimeString(),
            ve_userpc: "",
            ve_situacion: 0,
            ve_chofer: 0,
            ve_cdc: "",
            ve_qr: "",
            ve_km_actual: 0,
            ve_vehiculo: 0,
            ve_desc_trabajo: "",
            ve_kilometraje: 0,
            ve_mecanico: 0,
            ve_servicio: 0,
            ve_siniestro: 0,
            ve_cliente: 0,
            ve_total: 0,
            ve_vencimiento: new Date(0).toISOString(),
            ve_estado: 1,
            ve_caja_definicion: undefined,
            ve_conf_operacion: undefined,
        }
    );

    const [detalleVenta, setDetalleVenta] = useState<DetalleVentaTabla[]>([]);
    const [, setImprimirFactura] = useState<boolean>(tipoVentaGuardado === 1);
    const [precioSeleccionado, setPrecioSeleccionado] = useState<ListaPrecios | null>();
    const [depositoSeleccionado, setDepositoSeleccionado] = useState<Deposito | null>();
    const [, setCantidad] = useState<number>();
    const [descuento, setDescuento] = useState<number>();
    const [bonificacion, setBonificacion] = useState<number>();
    const [precioUnitario, setPrecioUnitario] = useState<number>();
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState<Sucursal>();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [tipoRenderizacion, setTipoRenderizacionLocal] = useState<TipoRenderizacion>({ 
        tipo: tipoRenderizacionGuardado 
    });
    const [editingItem, setEditingItem] = useState<number | null>(null);

    const { sucursales, fetchSucursales } = useSucursalesStore();
    const { depositos, fetchDepositos } = useDepositosStore();
    const { listaPrecios, fetchListaPrecios } = useListaPreciosStore();

    const vendedorPorDefecto = sessionStorage.getItem("user_id");
    const vendedorNombrePorDefecto = sessionStorage.getItem("user_name");

    const { getOperadorPorCodInterno, vendedorSeleccionado } = useOperadoresStore();
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const toast = useToast();

    const { mutate: crearVenta, isPending } = useCrearVenta();

    const handleAgregarItem = (articulo: Articulo) => {
        const resultado = agregarItemVentaRapida(detalleVenta, {
            articulo,
            cantidad: articulo.cantidad || 1,
            precioSeleccionado: precioSeleccionado!,
            depositoSeleccionado: depositoSeleccionado!,
            sucursalSeleccionada: sucursalSeleccionada!,
            vendedorSeleccionado: vendedorSeleccionado!,
            precioUnitario,
            descuento,
            bonificacion,
        });

        if (!resultado.ok) {
            toast({
                title: "Error",
                description: resultado.error,
                status: "info",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setDetalleVenta(resultado.detalleVenta!);
        setCantidad(1);
        setPrecioUnitario(0);
        setDescuento(0);
        setBonificacion(0);
    }

    useEffect(() => {
        fetchSucursales();
        fetchDepositos();
        fetchListaPrecios();
    }, []);

    useEffect(() => {
        if (clientePorDefecto && clientePorDefecto.valor) {
            const valorCliente = clientePorDefecto.valor;
            const clienteId = parseInt(valorCliente);

            if (!isNaN(clienteId)) {
                setVentaDTO(prevState => ({
                    ...prevState,
                    ve_cliente: clienteId
                }));
            } else {
                console.error('El valor del cliente por defecto no es un número válido:', valorCliente);
            }
        }
        if (vendedorSeleccionado) {
            setVentaDTO(prevState => ({
                ...prevState,
                ve_vendedor: vendedorSeleccionado.op_codigo,
                ve_operador: vendedorSeleccionado.op_codigo
            }));
        }
        if (sucursalSeleccionada) {
            setVentaDTO(prevState => ({
                ...prevState,
                ve_sucursal: sucursalSeleccionada.id
            }));
        }
        if (depositoSeleccionado) {
            setVentaDTO(prevState => ({
                ...prevState,
                ve_deposito: depositoSeleccionado.dep_codigo
            }));
        }
        if (vendedorNombrePorDefecto) {
            setVentaDTO(prevState => ({
                ...prevState,
                ve_userpc: `Dispositivo de ${vendedorNombrePorDefecto}`
            }));
        }

    }, [clientePorDefecto, vendedorSeleccionado, sucursalSeleccionada, depositoSeleccionado]);

    useEffect(() => {
        if (sucursales.length > 0) {
            if (sucursalGuardada) {
                const sucursal = sucursales.find(s => s.id === sucursalGuardada);
                setSucursalSeleccionada(sucursal || sucursales[0]);
            } else {
                setSucursalSeleccionada(sucursales[0]);
            }
        }
    }, [sucursales, sucursalGuardada]);

    useEffect(() => {
        if (depositos.length > 0) {
            if (depositoGuardado) {
                const deposito = depositos.find(d => d.dep_codigo === depositoGuardado);
                setDepositoSeleccionado(deposito || depositos[0]);
            } else {
                setDepositoSeleccionado(depositos[0]);
            }
        }
    }, [depositos, depositoGuardado]);

    useEffect(() => {
        if (listaPrecios.length > 0) {
            if (listaPrecioGuardada) {
                const listaPrecio = listaPrecios.find(lp => lp.lp_codigo === listaPrecioGuardada);
                setPrecioSeleccionado(listaPrecio || listaPrecios[0]);
            } else {
                setPrecioSeleccionado(listaPrecios[0]);
            }
        }
    }, [listaPrecios, listaPrecioGuardada]);

    useEffect(()=>{
        setVentaDTO(prevState => ({
            ...prevState,
            ve_total: calcularTotales(detalleVenta).total
        }));
    }, [calcularTotales(detalleVenta).total]);

    useEffect(() => {
        getOperadorPorCodInterno(parseInt(vendedorPorDefecto ?? "0"));
    }, [vendedorPorDefecto]);

    useEffect(() => {
        setTipoRenderizacionLocal({ tipo: tipoRenderizacionGuardado });
    }, [tipoRenderizacionGuardado]);

    useEffect(() => {
        setImprimirFactura(tipoVentaGuardado === 1);
    }, [tipoVentaGuardado]);



    const renderArticulos = () => {
        if (detalleVenta.length === 0) {
            return (
                <div className="flex flex-col gap-2 w-full h-full justify-center items-center">
                    <ArchiveX className="w-10 h-10 text-gray-500" />
                    <p className="text-gray-500 text-xl font-bold">No hay artículos en la venta</p>
                </div>
            );
        }

        if (tipoRenderizacion.tipo === "tabla") {
            return (
                <div className="overflow-x-auto  w-full h-full">
                    <table className="min-w-full bg-white rounded-md shadow">
                        <thead>
                            <tr className="bg-blue-600 text-white">
                                <th className="py-2 px-4 text-left text-sm">Código</th>
                                <th className="py-2 px-4 text-left text-sm">Descripción</th>
                                <th className="py-2 px-4 text-left text-sm">Cantidad</th>
                                <th className="py-2 px-4 text-left text-sm">Precio</th>
                                <th className="py-2 px-4 text-left text-sm">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detalleVenta.map((item) => (
                                <tr key={item.cod_barras} className="border [&>td]:border-gray-200 [&>td]:border hover:bg-blue-50">
                                    <td className="py-2 px-4 text-xs">{item.cod_barras}</td>
                                    <td className="py-2 px-4 text-xs">{item.descripcion}</td>
                                    <td className="py-2 px-4 text-sm">{item.deve_cantidad || 1}</td>
                                    <td className="py-2 px-4 text-sm">{formatCurrency(item.deve_precio || 0)}</td>
                                    <td className="py-2 px-4 text-sm">{formatCurrency(item.subtotal || 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Vista tipo lista
        return (
            <div className="flex flex-col gap-2 w-full h-full p-2">
                {detalleVenta.map((item, index) => (
                    <div
                        key={item.cod_barras}
                        className={`flex flex-col bg-slate-50 rounded-lg shadow-xs border border-gray-200 transition-all duration-300 ease-in-out ${editingItem === index ? 'p-3' : 'p-2'
                            }`}
                    >
                        {editingItem !== index ? (
                            <div
                                className="flex flex-row items-center justify-between"
                                onClick={() => setEditingItem(index)}
                            >
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="text-gray-600 text-xs truncate">{item.cod_barras}</p>
                                    <p className="font-medium text-sm text-gray-800 truncate">{item.descripcion}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right min-w-[60px]">
                                        <p className="font-medium text-slate-500 text-sm">{item.deve_cantidad || 1}  x {formatCurrency(item.deve_precio || 0)}</p>
                                    </div>
                                    <div className="text-right min-w-[80px]">
                                        <p className="text-xs text-gray-500">Subtotal</p>
                                        <p className="font-medium text-sm">{formatCurrency(item.subtotal || item.deve_precio || 0)}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="flex flex-col"
                                onClick={() => setEditingItem(null)}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-600 text-xs truncate">{item.cod_barras}</p>
                                    <input
                                        type="text"
                                        className="w-full bg-white rounded-md p-1.5 border border-gray-300 text-sm mt-1"
                                        value={item.descripcion}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                            const resultado = actualizarDescripcionItemVenta(detalleVenta, index, e.target.value);
                                            if (resultado.ok) {
                                                setDetalleVenta(resultado.detalleVenta!);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-4 mt-3">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-500">Cantidad:</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const nuevaCantidad = Math.max(1, item.deve_cantidad - 1);
                                                const resultado = actualizarCantidadItemVenta(detalleVenta, index, nuevaCantidad);
                                                if (resultado.ok) {
                                                    setDetalleVenta(resultado.detalleVenta!);
                                                }
                                            }}
                                            className="bg-gray-200 text-gray-600 rounded-md p-1 hover:bg-gray-300"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            className="w-12 text-center bg-white rounded-md p-1 border border-gray-300 text-sm"
                                            value={item.deve_cantidad}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                const nuevaCantidad = Math.max(1, parseInt(e.target.value) || 1);
                                                const resultado = actualizarCantidadItemVenta(detalleVenta, index, nuevaCantidad);
                                                if (resultado.ok) {
                                                    setDetalleVenta(resultado.detalleVenta!);
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const nuevaCantidad = item.deve_cantidad + 1;
                                                const resultado = actualizarCantidadItemVenta(detalleVenta, index, nuevaCantidad);
                                                if (resultado.ok) {
                                                    setDetalleVenta(resultado.detalleVenta!);
                                                }
                                            }}
                                            className="bg-gray-200 text-gray-600 rounded-md p-1 hover:bg-gray-300"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-500">Precio:</span>
                                        <input
                                            type="number"
                                            className="w-20 text-center bg-white rounded-md p-1 border border-gray-300 text-sm"
                                            value={item.deve_precio}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                const resultado = actualizarPrecioUnitarioItemVenta(detalleVenta, index, parseFloat(e.target.value) || 0);
                                                if (resultado.ok) {
                                                    setDetalleVenta(resultado.detalleVenta!);
                                                }
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const resultado = eliminarItemVenta(detalleVenta, index);
                                            if (resultado.ok) {
                                                setDetalleVenta(resultado.detalleVenta!);
                                                setEditingItem(null);
                                            }
                                        }}
                                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const handleSucursalChange = (sucursalId: number) => {
        const sucursal = sucursales.find(s => s.id === sucursalId);
        if (sucursal) {
            setSucursalSeleccionada(sucursal);
            setSucursalGuardada(sucursalId);
        }
    };

    const handleDepositoChange = (depositoId: number) => {
        const deposito = depositos.find(d => d.dep_codigo === depositoId);
        if (deposito) {
            setDepositoSeleccionado(deposito);
            setDepositoGuardado(depositoId);
        }
    };

    const handleListaPrecioChange = (listaPrecioId: number) => {
        const listaPrecio = listaPrecios.find(lp => lp.lp_codigo === listaPrecioId);
        if (listaPrecio) {
            setPrecioSeleccionado(listaPrecio);
            setListaPrecioGuardada(listaPrecioId);
        }
    };

    const handleTipoRenderizacionChange = (tipo: "tabla" | "lista") => {
        setTipoRenderizacionLocal({ tipo });
        setTipoRenderizacionGuardado(tipo);
    };

    const handleTipoVentaChange = (tipo: number) => {
        setImprimirFactura(tipo === 1);
        setTipoVentaGuardado(tipo);
    };

    const handleLimpiarTodo = () => {
        setDetalleVenta([]);
        setIsBottomSheetOpen(false);
        setIsMenuOpen(false);
        setEditingItem(null);
    }
    
    const handleProcesarVenta = async () => {
        console.log('Procesando venta...');

        const ahora = new Date();
        const ventaActualizada = {
            ...ventaDTO,
            ve_fecha: ahora.toISOString(),
            ve_hora: ahora.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: false 
            })
        };

        const venta = mapVentaDTOToVenta(ventaActualizada);
        const detalle = detalleVenta.map(mapDetalleVentaDTOToDetalleVenta);
        console.log('venta', venta);
        console.log('detalle', detalle);
        
        crearVenta(
            { venta, detalle },
            {
                onSuccess: (data) => {
                    console.log('Venta creada exitosamente:', data);
                    toast({
                        title: 'Venta creada correctamente',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                    });
                    handleLimpiarTodo();
                    setIsBottomSheetOpen(false);
                },
                onError: (error) => {
                    console.error('Error al crear venta:', error);
                    toast({
                        title: 'Error al crear la venta',
                        description: 'Ocurrió un error al procesar la venta',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                    });
                }
            }
        );
    }

    const handleCancelarVenta = () => {
        handleLimpiarTodo();
        setIsBottomSheetOpen(false);
    }

    return (
        <div className="flex flex-col bg-slate-200 w-full h-screen p-1 gap-2">
            <div className="flex flex-row bg-blue-500 rounded-md p-2 items-center justify-between">
                <div className="flex items-center">
                    <ShoppingBag className="w-6 h-6 text-white mr-2" />
                    <p className="text-white font-bold text-lg">Venta Móvil</p>
                </div>
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="p-2 text-white hover:bg-blue-600 rounded-md transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
            <BuscadorArticulos
                deposito={depositoSeleccionado?.dep_codigo}
                stock={true}
                moneda={1}
                onSeleccionarArticulo={handleAgregarItem}
            />
            <div className="flex flex-col w-full h-[80%] bg-white gap-2 rounded-md">
                {renderArticulos()}
            </div>

            <button
                className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                onClick={() => setIsBottomSheetOpen(true)}
            >
                <ArrowUp />
                Ver totales
            </button>
            <SideMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            >
                <div className="flex flex-col w-full h-full bg-white gap-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="text-xl font-bold text-gray-800">Filtros y Opciones</h2>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="sucursal" className="text-gray-500 font-bold">Sucursal</label>
                            <select 
                                className="bg-gray-100 rounded-md p-2 border border-gray-300" 
                                name="sucursal" 
                                id="sucursal" 
                                value={sucursalSeleccionada?.id || ""}
                                onChange={(e) => handleSucursalChange(parseInt(e.target.value))}
                            >
                                {sucursales.map((sucursal) => (
                                    <option key={sucursal.id} value={sucursal.id}>
                                        {sucursal.descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label htmlFor="deposito" className="text-gray-500 font-bold">Depósito</label>
                            <select 
                                className="bg-gray-100 rounded-md p-2 border border-gray-300" 
                                name="deposito" 
                                id="deposito" 
                                value={depositoSeleccionado?.dep_codigo || ""}
                                onChange={(e) => handleDepositoChange(parseInt(e.target.value))}
                            >
                                {depositos.map((deposito) => (
                                    <option key={deposito.dep_codigo} value={deposito.dep_codigo}>
                                        {deposito.dep_descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label htmlFor="listaPrecio" className="text-gray-500 font-bold">Lista de Precios</label>
                            <select 
                                className="bg-gray-100 rounded-md p-2 border border-gray-300" 
                                name="listaPrecio" 
                                id="listaPrecio" 
                                value={precioSeleccionado?.lp_codigo || ""}
                                onChange={(e) => handleListaPrecioChange(parseInt(e.target.value))}
                            >
                                {listaPrecios.map((listaPrecio) => (
                                    <option key={listaPrecio.lp_codigo} value={listaPrecio.lp_codigo}>
                                        {listaPrecio.lp_descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label htmlFor="vendedor" className="text-gray-500 font-bold">Vendedor</label>
                            <input 
                                className="bg-gray-100 rounded-md p-2 border border-gray-300" 
                                type="text" 
                                readOnly 
                                value={vendedorSeleccionado?.op_nombre} 
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label htmlFor="tipoVenta" className="text-gray-500 font-bold">Tipo de venta</label>
                            <select 
                                className="bg-gray-100 rounded-md p-2 border border-gray-300" 
                                name="tipoVenta" 
                                id="tipoVenta" 
                                value={tipoVentaGuardado}
                                onChange={(e) => handleTipoVentaChange(parseInt(e.target.value))}
                            >
                                <option value={1}>Ticket</option>
                            </select>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label htmlFor="tipoRenderizacion" className="text-gray-500 font-bold">Tipo de renderización</label>
                            <select
                                className="bg-gray-100 rounded-md p-2 border border-gray-300"
                                name="tipoRenderizacion"
                                id="tipoRenderizacion"
                                value={tipoRenderizacion.tipo}
                                onChange={(e) => handleTipoRenderizacionChange(e.target.value as "tabla" | "lista")}
                            >
                                <option value="tabla">Tabla</option>
                                <option value="lista">Lista</option>
                            </select>
                        </div>
                    </div>
                </div>
            </SideMenu>
            <BottomSheet isVisible={isBottomSheetOpen} onClose={() => {
                setIsBottomSheetOpen(false);
            }}>
                <div className="flex flex-col gap-4 p-4">
                    <h2 className="text-xl font-bold text-gray-800">Totales</h2>

                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">
                                {formatCurrency(calcularTotales(detalleVenta).total)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Descuentos:</span>
                            <span className="font-medium text-red-600">
                                -{formatCurrency(calcularTotales(detalleVenta).totalDescuentos)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Bonificaciones:</span>
                            <span className="font-medium text-green-600">
                                -{formatCurrency(calcularTotales(detalleVenta).totalDescuentos)}
                            </span>
                        </div>

                        <div className="border-t pt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-800">Total:</span>
                                <span className="text-lg font-bold text-blue-600">
                                    {formatCurrency(
                                        calcularTotales(detalleVenta).totalAPagar
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Artículos:</span>
                            <span>{detalleVenta.length}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                        <button
                            className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors font-medium"
                            onClick={handleProcesarVenta}
                        >
                            {isPending ? <div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</div> : 'Procesar Venta'}
                        </button>

                        <button
                            className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition-colors"
                            onClick={handleCancelarVenta}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </BottomSheet>

        </div>
    )
}

export default VentaRapida;