import { VentaDTO, DetalleVentaTabla } from "../types/sharedDTO.type";
import { useEffect, useState } from "react";
import { Articulo } from "@/ui/articulos/types/articulo.type";
import { Deposito } from "@/ui/buscador_articulos/types/articulo";
import { agregarItemVentaRapida, eliminarItemVenta, actualizarCantidadItemVenta, actualizarDescripcionItemVenta, actualizarPrecioUnitarioItemVenta } from "../core/services/ventasService";
import { ListaPrecios, Sucursal } from "@/types/shared_interfaces";
import { useOperadoresStore } from "@/stores/operadoresStore";
import { useToast } from "@chakra-ui/react";
import { ShoppingBag, ArchiveX, ArrowUp, Trash2 } from "lucide-react";
import { SideMenu } from "@/ui/mobile/sidemenu/SideMenu";
import { BuscadorArticulos } from "@/ui/mobile/buscardor_articulos/BuscadorArticulos";
import { useConfiguraciones } from "@/services/configuraciones/configuracionesHook";
import { useSucursalesStore } from "@/stores/sucursalesStore";
import { useDepositosStore } from "@/stores/depositosStore";
import { useListaPreciosStore } from "@/stores/listaPreciosStore";
import { formatCurrency } from "../core/utils/formatCurrency";

interface TipoRenderizacion {
    tipo: "tabla" | "lista"
}

const VentaRapida = () => {
    const [, setVentaDTO] = useState<VentaDTO>(
        {
            ve_codigo: 0,
            ve_fecha: "",
            ve_operador: 0,
            ve_deposito: 0,
            ve_moneda: 0,
            ve_factura: "",
            ve_credito: 0,
            ve_saldo: 0,
            ve_devolucion: 0,
            ve_procesado: 0,
            ve_descuento: 0,
            ve_cuotas: 0,
            ve_cantCuotas: 0,
            ve_obs: "",
            ve_vendedor: 0,
            ve_sucursal: 0,
            ve_metodo: 0,
            ve_aplicar_a: 0,
            ve_retencion: 0,
            ve_timbrado: "",
            ve_codeudor: 0,
            ve_pedido: 0,
            ve_hora: "",
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
        }
    );
    const [detalleVenta, setDetalleVenta] = useState<DetalleVentaTabla[]>([]);
    const [, setImprimirFactura] = useState<boolean>(false);
    const [precioSeleccionado, setPrecioSeleccionado] = useState<ListaPrecios | null>();
    const [depositoSeleccionado, setDepositoSeleccionado] = useState<Deposito | null>();
    const [cantidad, setCantidad] = useState<number>();
    const [descuento, setDescuento] = useState<number>();
    const [bonificacion, setBonificacion] = useState<number>();
    const [precioUnitario, setPrecioUnitario] = useState<number>();
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState<Sucursal>();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [tipoRenderizacion, setTipoRenderizacion] = useState<TipoRenderizacion>(() => {
        const tipo = localStorage.getItem("tipoRenderizacion");
        if (tipo === "tabla" || tipo === "lista") {
            return { tipo: tipo as "tabla" | "lista" };
        }
        return { tipo: "tabla" }; // valor por defecto
    });
    const [editingItem, setEditingItem] = useState<number | null>(null);

    const { sucursales, fetchSucursales } = useSucursalesStore();
    const { depositos, fetchDepositos } = useDepositosStore();
    const { listaPrecios, fetchListaPrecios } = useListaPreciosStore();

    const vendedorPorDefecto = sessionStorage.getItem("user_id");
    const { clientePorDefecto } = useConfiguraciones();

    const { getOperadorPorCodInterno, vendedorSeleccionado } = useOperadoresStore();

    const toast = useToast();

    const handleAgregarItem = (articulo: Articulo, cantidad: number, precioUnitario?: number, descuento?: number, bonificacion?: number) => {
        const resultado = agregarItemVentaRapida(detalleVenta, {
            articulo,
            cantidad,
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
        if (clientePorDefecto) {
            setVentaDTO(prevState => ({
                ...prevState,
                ve_cliente: clientePorDefecto.valor
            }));
        }
        if (vendedorSeleccionado) {
            setVentaDTO(prevState => ({
                ...prevState,
                ve_vendedor: vendedorSeleccionado.op_codigo
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


    }, [clientePorDefecto, vendedorSeleccionado, sucursalSeleccionada, depositoSeleccionado]);


    useEffect(() => {
        if (sucursales) {
            setSucursalSeleccionada(sucursales[0]);
        }
    }, [sucursales]);

    useEffect(() => {
        if (depositos) {
            setDepositoSeleccionado(depositos[0]);
        }
    }, [depositos]);

    useEffect(() => {
        if (listaPrecios) {
            setPrecioSeleccionado(listaPrecios[0]);
        }
    }, [listaPrecios]);
    //Effect para setear datos por defecto
    useEffect(() => {
        getOperadorPorCodInterno(parseInt(vendedorPorDefecto ?? "0"));
    }, [vendedorPorDefecto]);

    useEffect(() => {
        if (tipoRenderizacion.tipo === "tabla") {
            console.log('guardando en localstorage tabla')
            localStorage.setItem("tipoRenderizacion", "tabla");
        } else {
            console.log('guardando en localstorage lista')
            localStorage.setItem("tipoRenderizacion", "lista");
        }
    }, [tipoRenderizacion]);

    useEffect(() => {
        const tipoRenderizacion = localStorage.getItem("tipoRenderizacion");
        console.log('recuperando de localstorage', tipoRenderizacion)
        if (tipoRenderizacion === "tabla") {
            setTipoRenderizacion({ tipo: "tabla" });
        } else {
            setTipoRenderizacion({ tipo: "lista" });
        }
    }, []);


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
                                    <td className="py-2 px-4 text-sm">{item.deve_cantidad}</td>
                                    <td className="py-2 px-4 text-sm">{item.deve_precio}</td>
                                    <td className="py-2 px-4 text-sm">{item.subtotal}</td>
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
                onSeleccionarArticulo={(articulo) => {
                    handleAgregarItem(
                        articulo,
                        cantidad!,
                        precioUnitario!,
                        descuento!,
                        bonificacion!
                    );
                }}
            />
            <div className="flex flex-col w-full h-[80%] bg-white gap-2 rounded-md">
                {renderArticulos()}
            </div>

            <button
                className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                onClick={() => {/* TODO: Implementar lógica del bottom sheet */ }}
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
                            <select className="bg-gray-100 rounded-md p-2 border border-gray-300" name="sucursal" id="sucursal" onChange={(e) => {
                                const sucursal = sucursales.find((sucursal) => sucursal.id === parseInt(e.target.value));
                                setSucursalSeleccionada(sucursal);
                            }}>
                                {
                                    sucursales.map((sucursal) => (
                                        <option key={sucursal.id} value={sucursal.id}>{sucursal.descripcion}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="deposito" className="text-gray-500 font-bold">Deposito</label>
                            <select className="bg-gray-100 rounded-md p-2 border border-gray-300" name="deposito" id="deposito" onChange={(e) => {
                                const deposito = depositos.find((deposito) => deposito.dep_codigo === parseInt(e.target.value));
                                setDepositoSeleccionado(deposito);
                            }}>
                                {
                                    depositos.map((deposito) => (
                                        <option key={deposito.dep_codigo} value={deposito.dep_codigo}>{deposito.dep_descripcion}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="listaPrecio" className="text-gray-500 font-bold">Lista de Precios</label>
                            <select className="bg-gray-100 rounded-md p-2 border border-gray-300" name="listaPrecio" id="listaPrecio" onChange={(e) => {
                                const listaPrecio = listaPrecios.find((listaPrecio) => listaPrecio.lp_codigo === parseInt(e.target.value));
                                setPrecioSeleccionado(listaPrecio);
                            }}>
                                {
                                    listaPrecios.map((listaPrecio) => (
                                        <option key={listaPrecio.lp_codigo} value={listaPrecio.lp_codigo}>{listaPrecio.lp_descripcion}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="vendedor" className="text-gray-500 font-bold">Vendedor</label>
                            <input className="bg-gray-100 rounded-md p-2 border border-gray-300" type="text" readOnly value={vendedorSeleccionado?.op_nombre} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="tipoVenta" className="text-gray-500 font-bold">Tipo de venta</label>
                            <select className="bg-gray-100 rounded-md p-2 border border-gray-300" name="tipoVenta" id="tipoVenta" onChange={(e) => {
                                setImprimirFactura(parseInt(e.target.value) === 1);
                            }}>
                                <option value="1">Factura</option>
                                <option value="2">Ticket</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="tipoRenderizacion" className="text-gray-500 font-bold">Tipo de renderización</label>
                            <select
                                className="bg-gray-100 rounded-md p-2 border border-gray-300"
                                name="tipoRenderizacion"
                                id="tipoRenderizacion"
                                value={tipoRenderizacion.tipo}
                                onChange={(e) => {
                                    setTipoRenderizacion({ tipo: e.target.value as "tabla" | "lista" });
                                }}
                            >
                                <option value="tabla">Tabla</option>
                                <option value="lista">Lista</option>
                            </select>
                        </div>

                    </div>
                </div>
            </SideMenu>

        </div>
    )
}

export default VentaRapida;