import { useDepositos } from "@/shared/hooks/querys/useDepositos";
import { useSucursales } from "@/shared/hooks/querys/useSucursales";
import { ArticuloBusqueda } from "@/shared/types/articulos";
import { DepositoViewModel } from "@/shared/types/depositos";
import { MetodoPago } from "@/shared/types/metodoPago";
import { Moneda } from "@/shared/types/moneda";
import { SucursalViewModel } from "@/shared/types/sucursal";
import { DetalleVenta, Venta } from "@/shared/types/venta"
import { useEffect, useMemo, useRef, useState } from "react"
import { AgregarArticuloData } from "../types/shared";
// import { useConfiguracionImperionPorDefectoVentaRapida } from "@/shared/hooks/querys/useConfiguraciones";
import { ClienteViewModel } from "@/ui/clientes/types/cliente.type";
import { useMonedas } from "@/shared/hooks/querys/useMonedas";
import { useMetodosPago } from "@/shared/hooks/querys/useMetodosPago";
import { useListaDePrecios } from "@/shared/hooks/querys/useListaDePrecios";
import { useArticuloPorCodigo } from "@/shared/hooks/querys/articulos/useArticuloBusqueda";
import { ListaPrecio } from "@/shared/types/listaPrecio";
import { ShoppingCartIcon, Check, X, Plus, Settings, ArrowUp, ArchiveX, Trash2 } from "lucide-react";
import { useClientePorDefecto } from "@/shared/hooks/querys/useClientes";
import { agregarItemVenta, eliminarItemVenta } from "../core/services/ventaService";
import BuscadorClientesMobile from "@/ui/clientes/BuscardorClientesMobile";
import { ArticulosComponentMobile } from "@/ui/articulos/ArticulosComponentMobile";
import { adaptarArticuloABusqueda } from "../core/utils/adaper";
import { useUltimaVentaId } from "@/shared/hooks/querys/useVentas";
import { calcularTotales } from "../core/utils/calcularTotales";
import { usePuntoDeVentaMobileStore } from "../stores/puntoDeVentaStore";
import { useCrearVenta } from "@/shared/hooks/mutations/ventas/crearVenta";
import { useToast } from "@chakra-ui/react";
import { createRoot } from "react-dom/client";
import ModeloNotaComun from "@/views/facturacion/ModeloNotaComun";
import ModeloFacturaNuevo from "@/views/facturacion/ModeloFacturaNuevo";
import ModeloTicket from "@/views/facturacion/ModeloTicket";
import { useFacturacion } from "@/shared/hooks/querys/useFacturacion";
import { DatosFacturacion } from "@/shared/api/facturasApi";
import { actualizarUltimaFactura } from "../core/utils/actualizarUltimaFactura";
import { useVerificarCajaAbierta } from "@/shared/hooks/querys/useCaja";
import { useUsuarioPorId } from "@/shared/hooks/querys/useUsuarios";
import { FacturaSendService } from "@/shared/facturaSend/service";
import { useFacturaSendNotification } from "@/shared/facturaSend/FSNotification";
import { formatCurrency } from "../core/utils/formatCurrency";

type TipoDocumentoFinal = "FACTURA" | "TICKET" | "NOTA INTERNA"

export const PuntoDeVentaRefactored = () => {
    const user_id = sessionStorage.getItem("user_id")
    const user = sessionStorage.getItem("user_name");

    // Usar el store de configuración del punto de venta móvil
    const {
        sucursalSeleccionada: sucursalIdGuardada,
        depositoSeleccionado: depositoIdGuardado,
        listaPrecioSeleccionada: listaPrecioIdGuardada,
        monedaSeleccionada: monedaIdGuardada,
        condicion: condicionGuardada,
        setSucursalSeleccionada: setSucursalStore,
        setDepositoSeleccionado: setDepositoStore,
        setListaPrecioSeleccionada: setListaPrecioStore,
        setMonedaSeleccionada: setMonedaStore,
        setTipoDocumento: setTipoDocumentoStore,
        setCondicion: setCondicionStore
    } = usePuntoDeVentaMobileStore();

    const [ventaDTO, setVentaDTO] = useState<Venta>({
        codigo: 0,
        cliente: 0,
        operador: Number(user_id),
        deposito: 0,
        moneda: 0,
        fecha: new Date(),
        factura: "",
        credito: condicionGuardada, // Usar la condición guardada
        saldo: 0,
        total: 0,
        vencimiento: new Date('0001-01-01'),
        estado: 1,
        devolucion: 0,
        procesado: 0,
        descuento: 0,
        cuotas: 0,
        cantCuotas: 0,
        obs: "",
        vendedor: Number(user_id),
        sucursal: 0,
        metodo: 0,
        aplicarA: 0,
        retencion: 0,
        timbrado: "",
        codeudor: 1,
        pedido: 0,
        hora: new Date().toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" }),
        userPc: "Dispositivo Móvil de " + user,
        situacion: 0,
        chofer: 0,
        cdc: "",
        qr: "",
        kmActual: 0,
        vehiculo: 0,
        descTrabajo: "",
        kilometraje: 0,
        servicio: 0,
        siniestro: "",
        mecanico: 0,
        cajaDefinicion: undefined,
        confOperacion: undefined,
    })
    const [detalleVenta, setDetalleVenta] = useState<DetalleVenta[]>([]);


    const { showError, clearError, ErrorNotificationComponent, hasError } = useFacturaSendNotification();

    const { data: Sucursales } = useSucursales(
        { operador: Number(user_id) }
    )

    const { data: Monedas } = useMonedas()

    const { data: MetodosPago } = useMetodosPago()

    const { data: ListaPrecios } = useListaDePrecios()

    const { data: clientePorDefecto } = useClientePorDefecto()

    // const { data: tipoDocumentoVentaRapida } = useConfiguracionImperionPorDefectoVentaRapida();

    const { data: ultimaVentaId } = useUltimaVentaId();

    const { data: cajero } = useUsuarioPorId(Number(user_id))

    const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteViewModel | null>(null)
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState<SucursalViewModel | null>(null)
    const [depositoSeleccionado, setDepositoSeleccionado] = useState<DepositoViewModel | null>(null)
    const [monedaSeleccionada, setMonedaSeleccionada] = useState<Moneda | null>(null);
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<MetodoPago | null>(null);
    const [listaPrecioSeleccionada, setListaPrecioSeleccionada] = useState<ListaPrecio | null>(null)
    const [articuloSeleccionado, setArticuloSeleccionado] = useState<ArticuloBusqueda | null>(null)


    const [agregarArticuloData, setAgregarArticuloData] = useState<AgregarArticuloData>({
        cantidad: 0,
        precio: 0,
        descuento: 0,
        bonificacion: "No",
    })


    const [isBuscadorClientesOpen, setIsBuscadorClientesOpen] = useState<boolean>(false)
    const [isBuscadorArticulosOpen, setIsBuscadorArticulosOpen] = useState<boolean>(false)
    const [impresionFinal, setImpresionFinal] = useState<TipoDocumentoFinal>("FACTURA")

    const [busquedaCodigoBarrasParam, setBusquedaCodigoBarrasParam] = useState<{
        codigoBarra?: string,
        stock?: boolean
    }>({
        codigoBarra: undefined,
        stock: true
    })

    const { data: articuloPorCodigo } = useArticuloPorCodigo(
        busquedaCodigoBarrasParam.codigoBarra || "",
        depositoSeleccionado?.dep_codigo || 0,
        busquedaCodigoBarrasParam.stock || true
    )

    const searchTimeOutRef = useRef<NodeJS.Timeout | null>(null);

    // Estados para la UI
    const [busquedaCliente, setBusquedaCliente] = useState<string>("");
    const [descuentoArticulo, setDescuentoArticulo] = useState<number>(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

    // Refs para focus
    const clienteRef = useRef<HTMLInputElement>(null);
    const vendedorRef = useRef<HTMLInputElement>(null);
    const articuloCodigoRef = useRef<HTMLInputElement>(null);
    const cantidadRef = useRef<HTMLInputElement>(null);
    const bonificacionRef = useRef<HTMLInputElement>(null);
    const precioRef = useRef<HTMLInputElement>(null);
    const descuentoRef = useRef<HTMLInputElement>(null);

    const { data: Depositos } = useDepositos()

    const { data: cajaAbierta } = useVerificarCajaAbierta(monedaSeleccionada?.moCodigo || 0, Number(user_id));

    const { mutate: crearVenta, isPending } = useCrearVenta();

    // Agregar estado para mensajes
    const [mensajeArticulo, setMensajeArticulo] = useState<string>("");

    const [articuloSeleccionadoParaEliminar, setArticuloSeleccionadoParaEliminar] = useState<number | null>(null);

    // Estados para el bottom sheet de finalización
    const [montoEntregado, setMontoEntregado] = useState<number>(0);
    const [montoEntregadoDolar, setMontoEntregadoDolar] = useState<number>(0);
    const [, setMontoEntregadoReal] = useState<number>(0);
    const [, setMontoEntregadoPeso] = useState<number>(0);
    const [cantidadCuotas, setCantidadCuotas] = useState<number>(1);
    const [entregaInicial, setEntregaInicial] = useState<number>(0);
    const [fechaVencimiento, setFechaVencimiento] = useState<string>("");


    // Calcular totales usando useMemo para evitar recálculos innecesarios
    const totales = useMemo(() => {
        return calcularTotales(detalleVenta, montoEntregado);
    }, [detalleVenta, montoEntregado]);

    // Actualizar el total de la venta solo cuando cambie el detalle de venta
    useEffect(() => {
        setVentaDTO(prev => ({
            ...prev,
            total: totales.totalAPagar
        }));
    }, [detalleVenta]); // Solo depende del detalle de venta, no de totales
    


    const calcularMontoEntregado = (monto: number, moneda: string) => {
        switch (moneda) {
            case "GS":
                setMontoEntregado(monto);
                break;
            case "USD":
                setMontoEntregadoDolar(monto);
                break;
            case "BRL":
                setMontoEntregadoReal(monto);
                break;
            case "ARS":
                setMontoEntregadoPeso(monto);
                break;
        }
    };

    const handleBuscarArticuloPorCodigo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const busqueda = e.target.value;

        if (searchTimeOutRef.current) {
            clearTimeout(searchTimeOutRef.current);
        }
        if (busqueda.length === 0) {
            setBusquedaCodigoBarrasParam({
                codigoBarra: undefined,
                stock: true
            });
            setArticuloSeleccionado(null);
            setMensajeArticulo(""); // Limpiar mensaje
            return;
        }
        else {
            setBusquedaCodigoBarrasParam({
                codigoBarra: busqueda,
                stock: true
            });
        }

        searchTimeOutRef.current = setTimeout(() => {
            if (articuloPorCodigo) {
                setArticuloSeleccionado(articuloPorCodigo)
                setMensajeArticulo(""); // Limpiar mensaje
            } else if (articuloPorCodigo === null) {
                setArticuloSeleccionado(null);
                setMensajeArticulo("No se encontró el artículo con este código de barras");
            }
        }, 300);
    }


    
    useEffect(() => {
        if (Depositos) {
            // Usar el depósito guardado o el primero disponible
            const depositoInicial = depositoIdGuardado 
                ? Depositos.find(d => d.dep_codigo === depositoIdGuardado) 
                : Depositos[0];
            setDepositoSeleccionado(depositoInicial || null);
        }
        if (Sucursales) {
            // Usar la sucursal guardada o la primera disponible
            const sucursalInicial = sucursalIdGuardada 
                ? Sucursales.find(s => s.id === sucursalIdGuardada) 
                : Sucursales[0];
            setSucursalSeleccionada(sucursalInicial || null);
        }
        if (Monedas) {
            // Usar la moneda guardada o la primera disponible
            const monedaInicial = monedaIdGuardada 
                ? Monedas.find(m => m.moCodigo === monedaIdGuardada) 
                : Monedas[0];
            setMonedaSeleccionada(monedaInicial || null);
        }
        if (MetodosPago) {
            setMetodoPagoSeleccionado(MetodosPago[0])
        }
        if (ListaPrecios) {
            // Usar la lista de precios guardada o la primera disponible
            const listaPrecioInicial = listaPrecioIdGuardada 
                ? ListaPrecios.find(lp => lp.lpCodigo === listaPrecioIdGuardada) 
                : ListaPrecios[0];
            setListaPrecioSeleccionada(listaPrecioInicial || null);
        }
        if (clientePorDefecto) {
            setClienteSeleccionado(clientePorDefecto)
        }
    }, [Depositos, Sucursales, Monedas, MetodosPago, ListaPrecios, clientePorDefecto, 
        depositoIdGuardado, sucursalIdGuardada, monedaIdGuardada, listaPrecioIdGuardada])

    useEffect(() => {
        setVentaDTO(prevVentaDTO => {
            let updatedVentaDTO = { ...prevVentaDTO };
            if (depositoSeleccionado) {
                updatedVentaDTO.deposito = depositoSeleccionado.dep_codigo;
                // Guardar en el store
                setDepositoStore(depositoSeleccionado.dep_codigo);
            }
            if (sucursalSeleccionada) {
                updatedVentaDTO.sucursal = sucursalSeleccionada.id;
                // Guardar en el store
                setSucursalStore(sucursalSeleccionada.id);
            }
            if (monedaSeleccionada) {
                updatedVentaDTO.moneda = monedaSeleccionada.moCodigo;
                // Guardar en el store
                setMonedaStore(monedaSeleccionada.moCodigo);
            }
            if (metodoPagoSeleccionado) {
                updatedVentaDTO.metodo = metodoPagoSeleccionado.id;
            }
            if (clienteSeleccionado) {
                updatedVentaDTO.cliente = clienteSeleccionado.cli_codigo;
            }
            if(cajaAbierta && cajaAbierta?.length > 0){
                updatedVentaDTO.cajaDefinicion = cajaAbierta?.[0]?.definicion;
            }
            
            return updatedVentaDTO;
        });
    }, [depositoSeleccionado, sucursalSeleccionada, monedaSeleccionada, metodoPagoSeleccionado, clienteSeleccionado, setDepositoStore, setSucursalStore, setMonedaStore])

    // Agregar estos efectos para sincronizar con el store
    useEffect(() => {
        setTipoDocumentoStore(impresionFinal);
    }, [impresionFinal, setTipoDocumentoStore]);

    useEffect(() => {
        setCondicionStore(ventaDTO.credito);
    }, [ventaDTO.credito, setCondicionStore]);

    // Handlers para teclas
    const handleClienteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && busquedaCliente) {
            vendedorRef.current?.focus();
        } else if (e.key === "Enter" && (busquedaCliente === "" || busquedaCliente === null)) {
            setIsBuscadorClientesOpen(true);
        }
    };

    // const handleVendedorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    //     if (e.key === "Enter") {
    //         articuloCodigoRef.current?.focus();
    //     }
    // };

    const handleArticuloKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (!busquedaCodigoBarrasParam.codigoBarra || busquedaCodigoBarrasParam.codigoBarra.trim() === "") {
                setIsBuscadorArticulosOpen(true);
            } else {
                cantidadRef.current?.focus();
            }
        }
    };

    const handleCantidadKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            bonificacionRef.current?.focus();
        }
    };

    // const handleBonificacionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    //     if (e.key === "Enter") {
    //         descuentoRef.current?.focus();
    //     }
    // };

    const handleDescuentoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            precioRef.current?.focus();
        }
    };

    const handlePrecioKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && articuloSeleccionado) {
            articuloCodigoRef.current?.focus();
        }
    };

    const handleAgregarArticulo = () => {
        if (!articuloSeleccionado) {
            return;
        }

        if (agregarArticuloData.cantidad === undefined || agregarArticuloData.cantidad === null || agregarArticuloData.cantidad === 0) {
            return;
        }

        const result = agregarItemVenta(detalleVenta, {
            articulo: articuloSeleccionado,
            cantidad: agregarArticuloData.cantidad,
            precioSeleccionado: listaPrecioSeleccionada!,
            depositoSeleccionado: depositoSeleccionado!,
            sucursalSeleccionada: sucursalSeleccionada!,
            monedaSeleccionada: monedaSeleccionada!,
            precioUnitario: agregarArticuloData.precio,
            descuento: agregarArticuloData.descuento,
            bonificacion: agregarArticuloData.bonificacion === "Si" ? 1 : 0,
            vendedorSeleccionado: {
                op_codigo: Number(user_id),
                op_nombre: user || ""
            }
        })

        if (result.ok) {
            setArticuloSeleccionado(null);
            setAgregarArticuloData({
                cantidad: 0,
                precio: 0,
                descuento: 0,
                bonificacion: "No"
            });
            setDetalleVenta(result.detalleVenta || [])
        }
    }

    const handleEliminarArticulo = (index: number) => {
        const result = eliminarItemVenta(detalleVenta, index);
        if (result.ok) {
            setDetalleVenta(result.detalleVenta || []);
            setArticuloSeleccionadoParaEliminar(null);
        }
    }

    const handleArticuloClick = (index: number) => {
        setArticuloSeleccionadoParaEliminar(
            articuloSeleccionadoParaEliminar === index ? null : index
        );
    }

    const toast = useToast();

    const imprimirFacturaComponente = async (
        ventaId: number,
        accion: "print" | "download" | "b64" = "print"
      ) => {
        const facturaDiv = document.createElement("div");
        facturaDiv.style.display = "none";
        document.body.appendChild(facturaDiv);
    
        const root = createRoot(facturaDiv);
        root.render(
          <ModeloFacturaNuevo
            id_venta={ventaId}
            monto_entregado={montoEntregado || 0}
            monto_recibido={montoEntregado || 0}
            vuelto={totales.totalDevuelto}
            onImprimir={true}
            accion={accion}
          />
        );
    
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(facturaDiv);
        }, 2000);
      };
    
      const imprimirNotaComponente = async (
        ventaId: number,
        accion: "print" | "download" | "b64" = "print"
      ) => {
        const notaDiv = document.createElement("div");
        notaDiv.style.display = "none";
        document.body.appendChild(notaDiv);
    
        const root = createRoot(notaDiv);
        root.render(
          <ModeloNotaComun
            id_venta={ventaId}
            monto_entregado={montoEntregado || 0}
            monto_recibido={montoEntregado || 0}
            vuelto={totales.totalDevuelto}
            onImprimir={true}
            accion={accion}
          />
        );
    
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(notaDiv);
        }, 2000);
      };
    
      const imprimirTicketComponente = async (
        ventaId: number,
        accion: "print" | "download" | "b64" = "print"
      ) => {
        // Componente oculto que solo se usa para generar el PDF
        const ticketDiv = document.createElement("div");
        ticketDiv.style.display = "none";
        document.body.appendChild(ticketDiv);
    
        const root = createRoot(ticketDiv);
        root.render(
          <ModeloTicket
            id_venta={ventaId}
            monto_entregado={montoEntregado || 0}
            monto_recibido={montoEntregado || 0}
            vuelto={totales.totalDevuelto}
            onImprimir={true}
            accion={accion}
          />
        );
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(ticketDiv);
        }, 2000);
      };
    

    const handleCancelarVenta = () => {
        setDetalleVenta([])
        setArticuloSeleccionado(null)
        setArticuloSeleccionadoParaEliminar(null)
        setAgregarArticuloData({
            cantidad: 0,
            precio: 0,
            descuento: 0,
            bonificacion: "No"
        })
    }

    const handleFinalizarVenta = async () => {
        if(cajaAbierta?.length === 0){
            toast({
                title: "Error",
                description: "No hay caja abierta",
                status: "error",
                duration: 3000,
            });
            return;
        }
        if(ventaDTO.credito === 1 && ventaDTO.cantCuotas === 0 || ventaDTO.credito === 0 && ventaDTO.vencimiento === null){
            toast({
                title: "Error",
                description: "Debe seleccionar la fecha de vencimiento o la cantidad de cuotas",
                status: "error",
                duration: 3000,
            });
            return;
        }
        if(!clienteSeleccionado){
            toast({
                title: "Error",
                description: "Debe seleccionar un cliente",
                status: "error",
                duration: 3000,
            });
            return;
        }
        if(!monedaSeleccionada){
            toast({
                title: "Error",
                description: "Debe seleccionar una moneda",
                status: "error",
                duration: 3000,
            });
            return;
        }
        if(!cajero){
            toast({
                title: "Error",
                description: "Debe seleccionar un cajero",
                status: "error",
                duration: 3000,
            });
            return;
        }

        // Solo proceder con facturación electrónica si es FACTURA
        if(impresionFinal === "FACTURA"){
            // Validar que existan datos de facturación
            if(!datosFacturacionData || datosFacturacionData.length === 0 || !datosFacturacionData[0]){
                toast({
                    title: "Error",
                    description: "No hay datos de facturación disponibles",
                    status: "error",
                    duration: 3000,
                });
                return;
            }

            try {
                // 1. Primero intentar facturación electrónica
                const resultadoFactura = 
                    await FacturaSendService.vender(
                        ventaDTO,
                        detalleVenta,
                        clienteSeleccionado,
                        monedaSeleccionada,
                        cajero,
                        datosFacturacionData[0], // Usar directamente el primer elemento
                        totales.totalAPagar,
                        entregaInicial
                    );

                // 2. Verificar si hubo error en la facturación electrónica
                if (resultadoFactura.error) {
                    showError(resultadoFactura.error);
                }

                // 3. Proceder con la venta (con o sin facturación electrónica)
                crearVenta({
                    venta: resultadoFactura.venta,
                    detalle: detalleVenta 
                }, {
                    onSuccess: (data) => {
                        // Limpiar el error si existe
                        if (hasError) {
                            clearError();
                        }
                        
                        const mensaje = resultadoFactura.error 
                            ? "Venta realizada correctamente (sin facturación electrónica)"
                            : "Venta realizada correctamente con facturación electrónica";
                        
                        toast({
                            title: "Éxito",
                            description: mensaje,
                            status: "success",
                            duration: 3000,
                        });

                        setIsBottomSheetOpen(false);
                        handleCancelarVenta();

                        const imprimirDocumentos = async () => {
                            if (impresionFinal === "FACTURA") {
                                await imprimirFacturaComponente(data.codigo, "download");
                            } else if (impresionFinal === "TICKET") {
                                await imprimirTicketComponente(data.codigo, "download");
                            } else if (impresionFinal === "NOTA INTERNA") {
                                await imprimirNotaComponente(data.codigo, "download");
                            }
                        };

                        imprimirDocumentos();

                        // Actualizar última factura
                        actualizarUltimaFactura(
                            Number(datosFacturacionData?.[0]?.d_Nro_Secuencia) + 1,
                            datosFacturacionData?.[0]?.d_Codigo || 0
                        );

                    },
                    onError: (error) => {
                        console.error("Error al crear venta después de facturación:", error);
                        toast({
                            title: "Error",
                            description: "La facturación fue exitosa pero hubo un problema al crear la venta",
                            status: "error",
                            duration: 5000,
                        });
                        showError(error.message);
                    }
                });

            } catch (facturaError) {
                console.error("Error en facturación electrónica:", facturaError);
                
                // Si falla la facturación, preguntar al usuario si quiere continuar
                const continuarSinFactura = window.confirm(
                    "No se pudo procesar la facturación electrónica. ¿Desea continuar con la venta sin facturación electrónica?"
                );

                if (continuarSinFactura) {
                    // Proceder con venta normal sin facturación electrónica
                    crearVenta({
                        venta: ventaDTO,
                        detalle: detalleVenta
                    }, {
                        onSuccess: (data) => {
                            toast({
                                title: "Éxito",
                                description: "Venta realizada correctamente (sin facturación electrónica)",
                                status: "success",
                                duration: 3000,
                            });

                            setIsBottomSheetOpen(false);
                            handleCancelarVenta();

                            const imprimirDocumentos = async () => {
                                if (impresionFinal === "FACTURA") {
                                    await imprimirFacturaComponente(data.codigo, "download");
                                } else if (impresionFinal === "TICKET") {
                                    await imprimirTicketComponente(data.codigo, "download");
                                } else if (impresionFinal === "NOTA INTERNA") {
                                    await imprimirNotaComponente(data.codigo, "download");
                                }
                            };

                            imprimirDocumentos();
                        }
                    });
                } else {
                    showError(facturaError as string);
                }
            }
        } else {
            // Si no es FACTURA, proceder directamente con la venta
            crearVenta({
                venta: ventaDTO,
                detalle: detalleVenta
            }, {
                onSuccess: (data) => {
                    toast({
                        title: "Éxito",
                        description: "Venta realizada correctamente",
                        status: "success",
                        duration: 3000,
                    });

                    setIsBottomSheetOpen(false);
                    handleCancelarVenta();

                    const imprimirDocumentos = async () => {
                        if (impresionFinal === "TICKET") {
                            await imprimirTicketComponente(data.codigo, "download");
                        } else if (impresionFinal === "NOTA INTERNA") {
                            await imprimirNotaComponente(data.codigo, "download");
                        }
                    };

                    imprimirDocumentos();
                }
            });
        }
    };

    const renderArticulos = () => {
        if (detalleVenta.length === 0) {
            return (
                <div className="flex flex-col gap-2 w-full h-full justify-center items-center p-4">
                    <ArchiveX className="w-10 h-10 text-gray-500" />
                    <p className="text-gray-500 text-xl font-bold">No hay artículos en la venta</p>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-2 w-full h-full p-2 overflow-y-auto">
                {detalleVenta.map((item, index) => (
                    <div
                        key={index}
                        className={`flex flex-col bg-slate-50 rounded-lg shadow-xs border border-gray-200 p-3 transition-all duration-200 ${
                            articuloSeleccionadoParaEliminar === index 
                                ? 'ring-2 ring-red-200 bg-red-50' 
                                : 'hover:bg-slate-100'
                        }`}
                        onClick={() => handleArticuloClick(index)}
                    >
                        <div className="flex flex-row items-center justify-between mb-2">
                            <div className="flex-1 min-w-0 mr-4">
                                <p className="text-gray-600 text-xs truncate">{item.codigoBarra}</p>
                                <p className="font-medium text-sm text-gray-800 truncate">{item.descripcion}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right min-w-[60px]">
                                    <p className="font-medium text-slate-500 text-sm">{item.deveCantidad} x {item.devePrecio}</p>
                                </div>
                                <div className="text-right min-w-[80px]">
                                    <p className="text-xs text-gray-500">Subtotal</p>
                                    <p className="font-medium text-sm">{item.subtotal}</p>
                                </div>
                                {articuloSeleccionadoParaEliminar === index && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEliminarArticulo(index);
                                        }}
                                        className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors shadow-md"
                                        title="Eliminar artículo"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-row gap-2 text-xs text-gray-500">
                            <span>Desc: {item.deveDescuento}</span>
                            <span>|</span>
                            <span>Bonif: {item.deveBonificacion}</span>
                            <span>|</span>
                            <span>Exentas: {item.deveExentas}</span>
                            <span>|</span>
                            <span>5%: {item.deveCinco}</span>
                            <span>|</span>
                            <span>10%: {item.deveDiez}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Estados para el timbrado
    const [datosFacturacion, setDatosFacturacion] = useState<DatosFacturacion | null>(null);
    const [timbradoSeleccionado, setTimbradoSeleccionado] = useState<string>("");
    const [isSelectorTimbradoOpen, setIsSelectorTimbradoOpen] = useState<boolean>(false);

    // Hook para obtener datos de facturación
    const { data: datosFacturacionData, isLoading: isLoadingFacturacion } = useFacturacion(
        Number(user_id),
        sucursalSeleccionada?.id || 0
    );

    // Obtener timbrados únicos
    const timbradosUnicos = useMemo(() => {
        if (!datosFacturacionData) return [];
        const timbrados = new Map<string, DatosFacturacion>();
        datosFacturacionData.forEach(dato => {
            if (!timbrados.has(dato.d_Nrotimbrado)) {
                timbrados.set(dato.d_Nrotimbrado, dato);
            }
        });
        return Array.from(timbrados.values());
    }, [datosFacturacionData]);

    // Efecto para cargar datos de facturación iniciales
    useEffect(() => {
        if (datosFacturacionData && datosFacturacionData.length > 0) {
            const primerDato = datosFacturacionData[0];
            setDatosFacturacion(primerDato);
            setTimbradoSeleccionado(primerDato.d_Nrotimbrado);
            
            // Generar número de factura inicial
            const numeroFactura = `${primerDato.d_Establecimiento?.toString().padStart(3, "0")}-${primerDato.d_P_Emision?.toString().padStart(3, "0")}-${(primerDato.d_Nro_Secuencia + 1)?.toString().padStart(7, "0")}`;
            
            // Actualizar el DTO de venta con el timbrado y factura
            setVentaDTO(prev => ({
                ...prev,
                timbrado: primerDato.d_Nrotimbrado,
                factura: numeroFactura
            }));
        }
    }, [datosFacturacionData]);

    // Función para manejar cambio de timbrado
    const handleTimbradoChange = (nuevosDatos: DatosFacturacion) => {
        setDatosFacturacion(nuevosDatos);
        setTimbradoSeleccionado(nuevosDatos.d_Nrotimbrado);
        
        // Generar número de factura
        const numeroFactura = `${nuevosDatos.d_Establecimiento?.toString().padStart(3, "0")}-${nuevosDatos.d_P_Emision?.toString().padStart(3, "0")}-${(nuevosDatos.d_Nro_Secuencia + 1)?.toString().padStart(7, "0")}`;
        
        // Actualizar el DTO de venta
        setVentaDTO(prev => ({
            ...prev,
            timbrado: nuevosDatos.d_Nrotimbrado,
            factura: numeroFactura
        }));
    };

    // Función para manejar cambio de número de factura
    const handleNumeroFacturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!datosFacturacion) return;
        
        const value = e.target.value.replace(/\D/g, "");
        const nuevosDatos = {
            ...datosFacturacion,
            d_Nro_Secuencia: value ? parseInt(value) - 1 : 0
        };
        
        // Generar nuevo número de factura
        const numeroFactura = `${nuevosDatos.d_Establecimiento?.toString().padStart(3, "0")}-${nuevosDatos.d_P_Emision?.toString().padStart(3, "0")}-${(nuevosDatos.d_Nro_Secuencia + 1)?.toString().padStart(7, "0")}`;
        
        setDatosFacturacion(nuevosDatos);
        setTimbradoSeleccionado(nuevosDatos.d_Nrotimbrado);
        
        // Actualizar el DTO de venta
        setVentaDTO(prev => ({
            ...prev,
            timbrado: nuevosDatos.d_Nrotimbrado,
            factura: numeroFactura
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Renderizar el componente de notificación de errores */}
            <ErrorNotificationComponent />
            
            <div className="flex flex-col bg-slate-200 w-full h-screen p-1 gap-2">
                {/* Header */}
                <div className="flex flex-row bg-blue-500 rounded-md p-2 items-center justify-between">
                    <div className="flex items-center">
                        <ShoppingCartIcon className="w-6 h-6 text-white mr-2" />
                        <p className="text-white font-bold text-lg">Punto de Venta</p>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2 text-white hover:bg-blue-600 rounded-md transition-colors"
                    >
                        <Settings className="w-6 h-6" />
                    </button>
                </div>

                {/* Contenedor principal con scroll */}
                <div className="flex flex-col gap-2 flex-1 overflow-y-auto pb-20">
                    {/* Información básica de la venta */}
                    <div className="flex flex-col gap-2 bg-white rounded-md p-3">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-600">Fecha</label>
                                <input
                                    type="date"
                                    className="rounded-md p-2 border border-gray-300 text-sm"
                                    value={ventaDTO.fecha.toISOString().split("T")[0]}
                                    onChange={(e) => setVentaDTO({ ...ventaDTO, fecha: new Date(e.target.value) })}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-600">Cajero</label>
                                <input
                                    type="text"
                                    className="rounded-md p-2 border border-gray-300 text-sm"
                                    value={user || ""}
                                    readOnly
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-600">Código de Venta</label>
                                <input
                                    type="text"
                                    className="rounded-md p-2 border border-gray-300 text-sm"
                                    value={ultimaVentaId || ""}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-600">Cliente</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    ref={clienteRef}
                                    className="rounded-md p-2 border border-gray-300 text-sm flex-1"
                                    placeholder="Buscar cliente..."
                                    value={busquedaCliente}
                                    onChange={(e) => setBusquedaCliente(e.target.value)}
                                    onKeyDown={handleClienteKeyDown}
                                />
                                <button
                                    onClick={() => setIsBuscadorClientesOpen(true)}
                                    className="bg-blue-500 text-white px-3 rounded-md text-sm"
                                >
                                    Buscar
                                </button>
                            </div>
                            <input
                                type="text"
                                className="rounded-md p-2 border border-gray-300 text-sm bg-gray-50"
                                value={
                                    clienteSeleccionado
                                        ? clienteSeleccionado.cli_razon
                                        : "No se ha seleccionado ningún cliente"
                                }
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Sección de artículos */}
                    <div className="flex flex-col gap-2 bg-white rounded-md p-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-600">Artículo</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    ref={articuloCodigoRef}
                                    className="rounded-md p-2 border border-gray-300 text-sm flex-1"
                                    placeholder="Código de barras..."
                                    value={busquedaCodigoBarrasParam.codigoBarra || ""}
                                    onChange={handleBuscarArticuloPorCodigo}
                                    onKeyDown={handleArticuloKeyDown}
                                />
                                <button
                                    onClick={() => setIsBuscadorArticulosOpen(true)}
                                    className="bg-blue-500 text-white px-3 rounded-md text-sm"
                                >
                                    Buscar
                                </button>
                            </div>
                            <input
                                type="text"
                                className={`rounded-md p-2 border text-sm ${
                                    mensajeArticulo 
                                        ? "border-red-300 bg-red-50" 
                                        : "border-gray-300 bg-gray-50"
                                }`}
                                value={
                                    articuloSeleccionado 
                                        ? articuloSeleccionado.descripcion 
                                        : mensajeArticulo || "Descripción del artículo"
                                }
                                readOnly
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-600">Cantidad</label>
                                <input
                                    type="number"
                                    ref={cantidadRef}
                                    className="rounded-md p-2 border border-gray-300 text-sm"
                                    value={agregarArticuloData.cantidad}
                                    onChange={(e) => setAgregarArticuloData({ ...agregarArticuloData, cantidad: Number(e.target.value) })}
                                    onKeyDown={handleCantidadKeyDown}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-600">Precio</label>
                                <input
                                    type="number"
                                    ref={precioRef}
                                    className="rounded-md p-2 border border-gray-300 text-sm"
                                    value={agregarArticuloData.precio}
                                    onChange={(e) => setAgregarArticuloData({ ...agregarArticuloData, precio: Number(e.target.value) })}
                                    onKeyDown={handlePrecioKeyDown}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-600">Bonificación</label>
                                <select
                                    className="rounded-md p-2 border border-gray-300 text-sm"
                                    value={agregarArticuloData.bonificacion}
                                    onChange={(e) => setAgregarArticuloData({
                                        ...agregarArticuloData,
                                        bonificacion: e.target.value as "Si" | "No"
                                    })}
                                >
                                    <option value="Si">Si</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-600">Descuento</label>
                                <input
                                    type="number"
                                    ref={descuentoRef}
                                    className="rounded-md p-2 border border-gray-300 text-sm"
                                    value={descuentoArticulo}
                                    onChange={(e) => setDescuentoArticulo(Number(e.target.value))}
                                    onKeyDown={handleDescuentoKeyDown}
                                />
                            </div>
                        </div>

                        <button
                            className="w-full bg-blue-500 text-white rounded-md p-3 flex flex-row gap-2 items-center justify-center"
                            onClick={() => handleAgregarArticulo()}
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Agregar Artículo</span>
                        </button>
                    </div>

                    {/* Lista de artículos */}
                    <div className="flex flex-col w-full bg-white rounded-md overflow-hidden min-h-[300px]">
                        <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-sm font-bold text-gray-700">Artículos de la Venta ({detalleVenta.length})</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-[250px]">
                            {renderArticulos()}
                        </div>
                    </div>
                </div>

                {/* Botón para ver totales - Fixed en la parte inferior */}
                <div className="fixed bottom-0 left-0 right-0 p-2 bg-slate-200 border-t border-gray-300 z-40">
                    <button
                        className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        onClick={() => setIsBottomSheetOpen(true)}
                    >
                        <ArrowUp />
                        Ver totales y finalizar venta
                    </button>
                </div>

                {/* Side Menu para configuración */}
                <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isMenuOpen ? 'block' : 'hidden'}`}>
                    <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg">
                        <div className="flex flex-col w-full h-full bg-white gap-4 p-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h2 className="text-xl font-bold text-gray-800">Configuración</h2>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-4 overflow-y-auto">
                                <div className="flex flex-col gap-2">
                                    <label className="text-gray-500 font-bold">Sucursal</label>
                                    <select
                                        className="bg-gray-100 rounded-md p-2 border border-gray-300"
                                        value={sucursalSeleccionada?.id || ""}
                                        onChange={(e) => {
                                            const sucursal = Sucursales?.find(sucursal => sucursal.id === Number(e.target.value)) || null;
                                            setSucursalSeleccionada(sucursal);
                                            // Guardar en el store
                                            setSucursalStore(Number(e.target.value));
                                        }} 
                                    >
                                        {Sucursales?.map((sucursal) => (
                                            <option key={sucursal.id} value={sucursal.id}>
                                                {sucursal.descripcion}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-gray-500 font-bold">Depósito</label>
                                    <select
                                        className="bg-gray-100 rounded-md p-2 border border-gray-300"
                                        value={depositoSeleccionado?.dep_codigo || ""}
                                        onChange={(e) => {
                                            const deposito = Depositos?.find(deposito => deposito.dep_codigo === Number(e.target.value)) || null;
                                            setDepositoSeleccionado(deposito);
                                            // Guardar en el store
                                            setDepositoStore(Number(e.target.value));
                                        }} 
                                    >
                                        {Depositos?.map((deposito) => (
                                            <option key={deposito.dep_codigo} value={deposito.dep_codigo}>
                                                {deposito.dep_descripcion}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-gray-500 font-bold">Lista de Precios</label>
                                    <select
                                        className="bg-gray-100 rounded-md p-2 border border-gray-300"
                                        value={listaPrecioSeleccionada?.lpCodigo || ""}
                                        onChange={(e) => {
                                            const listaPrecio = ListaPrecios?.find(listaPrecio => listaPrecio.lpCodigo === Number(e.target.value)) || null;
                                            setListaPrecioSeleccionada(listaPrecio);
                                            // Guardar en el store
                                            setListaPrecioStore(Number(e.target.value));
                                        }} 
                                    >
                                        {ListaPrecios?.map((listaPrecio) => (
                                            <option key={listaPrecio.lpCodigo} value={listaPrecio.lpCodigo}>
                                                {listaPrecio.lpDescripcion}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-gray-500 font-bold">Moneda</label>
                                    <select
                                        className="bg-gray-100 rounded-md p-2 border border-gray-300"
                                        value={monedaSeleccionada?.moCodigo || ""}
                                        onChange={(e) => {
                                            const moneda = Monedas?.find(moneda => moneda.moCodigo === Number(e.target.value)) || null;
                                            setMonedaSeleccionada(moneda);
                                            // Guardar en el store
                                            setMonedaStore(Number(e.target.value));
                                        }} 
                                    >
                                        {Monedas?.map((moneda) => (
                                            <option key={moneda.moCodigo} value={moneda.moCodigo}>
                                                {moneda.moDescripcion}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-gray-500 font-bold">Método de Pago</label>
                                    <select
                                        className="bg-gray-100 rounded-md p-2 border border-gray-300"
                                        value={metodoPagoSeleccionado?.id || ""}
                                        onChange={(e) => setMetodoPagoSeleccionado(MetodosPago?.find(metodo => metodo.id === Number(e.target.value)) || null)} 
                                    >
                                        {MetodosPago?.map((metodo) => (
                                            <option key={metodo.id} value={metodo.id}>
                                                {metodo.descripcion}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                
{/* 
                                <div className="flex flex-col gap-2">
                                    <label className="text-gray-500 font-bold">Condición</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={ventaDTO.credito === 0}
                                                onChange={() => setVentaDTO({ ...ventaDTO, credito: 0 })}
                                            />
                                            <span>Contado</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={ventaDTO.credito === 1}
                                                onChange={() => setVentaDTO({ ...ventaDTO, credito: 1 })}
                                            />
                                            <span>Crédito</span>
                                        </label>
                                    </div>
                                </div> */}

                                <div className="flex flex-col gap-2">
                                    <label className="text-gray-500 font-bold">Observaciones</label>
                                    <textarea
                                        className="bg-gray-100 rounded-md p-2 border border-gray-300 h-20"
                                        value={ventaDTO.obs}
                                    />
                                </div>

                                {/* Selector de Timbrado - Solo mostrar si es FACTURA */}
                                {impresionFinal === "FACTURA" && (
                                    <div className="flex flex-col gap-3 bg-blue-50 p-3 rounded-md">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-gray-700">Datos de Facturación</h3>
                                            <button
                                                onClick={() => setIsSelectorTimbradoOpen(true)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Configurar
                                            </button>
                                        </div>
                                        
                                        {datosFacturacion ? (
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Timbrado:</span>
                                                    <span className="font-medium">{datosFacturacion.d_Nrotimbrado}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Número:</span>
                                                    <span className="font-medium">
                                                        {datosFacturacion.d_Establecimiento?.toString().padStart(3, "0")}-
                                                        {datosFacturacion.d_P_Emision?.toString().padStart(3, "0")}-
                                                        {(datosFacturacion.d_Nro_Secuencia + 1)?.toString().padStart(7, "0")}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Vencimiento:</span>
                                                    <span className="font-medium">{datosFacturacion.d_Fecha_Vence}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-500">
                                                {isLoadingFacturacion ? "Cargando..." : "No hay datos de facturación"}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Sheet para totales y finalización */}
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isBottomSheetOpen ? 'block' : 'hidden'}`}>
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg max-h-[90%] overflow-y-auto">
                    <div className="flex flex-col gap-4 p-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h2 className="text-xl font-bold text-gray-800">Finalizar Venta</h2>
                            <button
                                onClick={() => setIsBottomSheetOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                                <label className="text-gray-500 font-bold">Condición de Venta</label>
                                <div className="flex gap-4 justify-center">
                                    <label className="flex  items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={ventaDTO.credito === 0}
                                            onChange={() => setVentaDTO({ ...ventaDTO, credito: 0 })}
                                        />
                                        <span>Contado</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={ventaDTO.credito === 1}
                                            onChange={() => setVentaDTO({ ...ventaDTO, credito: 1 })}
                                        />
                                        <span>Crédito</span>
                                    </label>
                                </div>
                            </div>
                        <div className="flex flex-col gap-2">
                                <label className="text-gray-500 font-bold">Tipo de Documento</label>
                                <div className="flex flex-row gap-2 items-center justify-center">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="tipoDocumento"
                                            checked={impresionFinal === "FACTURA"}
                                            onChange={() => setImpresionFinal("FACTURA")}
                                        />
                                        <span>Factura</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="tipoDocumento"
                                            checked={impresionFinal === "TICKET"}
                                            onChange={() => setImpresionFinal("TICKET")}
                                        />
                                        <span>Ticket</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="tipoDocumento"
                                            checked={impresionFinal === "NOTA INTERNA"}
                                            onChange={() => setImpresionFinal("NOTA INTERNA")}
                                        />
                                        <span>Nota Interna</span>
                                    </label>
                                </div>
                            </div>

                        {/* Datos de Facturación - Solo mostrar si es FACTURA */}
                        {impresionFinal === "FACTURA" && (
                            <div className="flex flex-col gap-3 bg-blue-50 p-3 rounded-md">
                                <h3 className="font-bold text-gray-700 text-center">Datos de Facturación</h3>
                                
                                {datosFacturacion ? (
                                    <div className="space-y-3">
                                        {/* Timbrado */}
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Timbrado:</span>
                                            <span className="text-sm font-bold text-blue-600">{datosFacturacion.d_Nrotimbrado}</span>
                                        </div>

                                        {/* Número de Factura */}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium text-gray-600">Número de Factura:</span>
                                            <div className="flex items-center justify-center gap-1 bg-white p-3 rounded border">
                                                <span className="text-lg font-mono font-bold text-gray-800">
                                                    {datosFacturacion.d_Establecimiento?.toString().padStart(3, "0")}
                                                </span>
                                                <span className="text-gray-500">-</span>
                                                <span className="text-lg font-mono font-bold text-gray-800">
                                                    {datosFacturacion.d_P_Emision?.toString().padStart(3, "0")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-red-600 py-4">
                                        <p className="font-medium">⚠️ Datos de facturación no disponibles</p>
                                        <p className="text-sm mt-1">Configure los datos de facturación antes de continuar</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Campos de Crédito */}
                        {ventaDTO.credito === 1 && (
                            <div className="flex flex-col gap-3 bg-blue-50 p-3 rounded-md">
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div className="text-center">
                                        <p className="font-bold text-gray-600">Límite Crédito</p>
                                        <p className="bg-white p-1 rounded font-bold">
                                            {clienteSeleccionado?.cli_limitecredito || 0}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-gray-600">Deuda Actual</p>
                                        <p className="bg-white p-1 rounded font-bold text-red-600">
                                            {clienteSeleccionado?.deuda_actual || 0}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-gray-600">Crédito Disponible</p>
                                        <p className="bg-white p-1 rounded font-bold text-green-600">
                                            {clienteSeleccionado?.credito_disponible || 0}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-bold">Cantidad Cuotas</label>
                                        <input
                                            type="number"
                                            className="border rounded p-2 text-sm"
                                            value={cantidadCuotas}
                                            onChange={(e) => setCantidadCuotas(Number(e.target.value))}
                                            disabled={!clienteSeleccionado?.cli_limitecredito}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-bold">Entrega Inicial</label>
                                        <input
                                            type="number"
                                            className="border rounded p-2 text-sm"
                                            value={entregaInicial}
                                            onChange={(e) => setEntregaInicial(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-bold">Vencimiento</label>
                                    <input
                                        type="date"
                                        className="border rounded p-2 text-sm"
                                        value={fechaVencimiento}
                                        onChange={(e) => setFechaVencimiento(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Método de Pago */}
                        <div className="flex flex-col gap-2">
                            <p className="font-bold text-gray-700">Método de Pago</p>
                            <select
                                className="border rounded p-2 text-sm"
                                value={metodoPagoSeleccionado?.id || ""}
                                disabled={true}
                                onChange={(e) => setMetodoPagoSeleccionado(
                                    MetodosPago?.find(metodo => metodo.id === Number(e.target.value)) || null
                                )}
                            >
                                {MetodosPago?.map((metodo) => (
                                    <option key={metodo.id} value={metodo.id}>
                                        {metodo.descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Totales */}
                        <div className="flex flex-col gap-3 bg-gray-50 p-3 rounded-md">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Exentas:</span>
                                    <span className="font-medium">{formatCurrency(totales.totalExentas, "PYG")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total 5%:</span>
                                    <span className="font-medium">{formatCurrency(totales.totalCinco, "PYG")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total 10%:</span>
                                    <span className="font-medium">{formatCurrency(totales.totalDiez, "PYG")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Factura:</span>
                                    <span className="font-medium">{formatCurrency(totales.totalAPagar, "PYG")}</span>
                                </div>
                            </div>

                            <div className="border-t pt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800">Total a pagar:</span>
                                    <span className="text-lg font-bold text-blue-600">{formatCurrency(totales.totalAPagar, "PYG")}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>Artículos:</span>
                                <span>{detalleVenta.length}</span>
                            </div>
                        </div>

                        {/* Montos Entregados */}
                        <div className="flex flex-col gap-3">
                            <p className="font-bold text-gray-700">Montos Entregados</p>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-bold">Monto GS:</label>
                                    <input
                                        type="number"
                                        className="border rounded p-2 text-sm bg-black text-green-500 border-green-500 font-bold"
                                        value={montoEntregado || ""}
                                        onChange={(e) => calcularMontoEntregado(Number(e.target.value), "GS")}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-bold">Monto USD:</label>
                                    <input
                                        type="number"
                                        className="border rounded p-2 text-sm bg-black text-green-500 border-green-500 font-bold"
                                        value={montoEntregadoDolar || ""}
                                        onChange={(e) => calcularMontoEntregado(Number(e.target.value), "USD")}
                                        placeholder="0"
                                    />
                                </div>
                                {/* <div className="flex flex-col gap-1">
                                    <label className="text-sm font-bold">Monto BRL:</label>
                                    <input
                                        type="number"
                                        className="border rounded p-2 text-sm bg-black text-green-500 border-green-500 font-bold"
                                        value={montoEntregadoReal || ""}
                                        onChange={(e) => calcularMontoEntregado(Number(e.target.value), "BRL")}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-bold">Monto ARS:</label>
                                    <input
                                        type="number"
                                        className="border rounded p-2 text-sm bg-black text-green-500 border-green-500 font-bold"
                                        value={montoEntregadoPeso || ""}
                                        onChange={(e) => calcularMontoEntregado(Number(e.target.value), "ARS")}
                                        placeholder="0"
                                    />
                                </div> */}
                            </div>

                            {/* Cambio */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-bold text-green-600">Cambio GS:</label>
                                <input
                                    type="text"
                                    className="border rounded p-2 text-sm bg-black text-green-500 border-green-500 font-bold"
                                        value={montoEntregado > totales.totalAPagar ? formatCurrency(montoEntregado - totales.totalAPagar, "PYG") : "0"}
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col gap-2 mt-4">
                            <button
                                className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                onClick={handleFinalizarVenta}
                                disabled={
                                    isPending || 
                                    (impresionFinal === "FACTURA" && !datosFacturacion) ||
                                    detalleVenta.length === 0
                                }
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Check className="w-5 h-5" />
                                    {isPending ? "Finalizando..." : "Finalizar Venta"}
                                </div>
                            </button>

                            <button
                                className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors font-medium"
                                onClick={() => setIsBottomSheetOpen(false)}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <X className="w-5 h-5" />
                                    Cancelar Venta
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para Selector de Timbrado */}
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isSelectorTimbradoOpen ? 'block' : 'hidden'}`}>
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg max-h-[90%] overflow-y-auto">
                    <div className="flex flex-col gap-4 p-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h2 className="text-xl font-bold text-gray-800">Configurar Timbrado</h2>
                            <button
                                onClick={() => setIsSelectorTimbradoOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {isLoadingFacturacion ? (
                            <div className="flex items-center justify-center p-8">
                                <p>Cargando datos de facturación...</p>
                            </div>
                        ) : !datosFacturacionData || datosFacturacionData.length === 0 ? (
                            <div className="flex items-center justify-center p-8">
                                <p className="text-red-600">No hay datos de facturación disponibles</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Selector de Timbrado */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-700">Timbrado</label>
                                    <select
                                        className="border rounded-md p-3 text-sm"
                                        value={timbradoSeleccionado}
                                        onChange={(e) => {
                                            const timbradoElegido = e.target.value;
                                            const datosSeleccionados = datosFacturacionData?.find(
                                                dato => dato.d_Nrotimbrado === timbradoElegido
                                            );
                                            if (datosSeleccionados) {
                                                handleTimbradoChange(datosSeleccionados);
                                            }
                                        }}
                                    >
                                        {timbradosUnicos.map((dato, index) => (
                                            <option key={index} value={dato.d_Nrotimbrado}>
                                                {dato.d_Nrotimbrado} - {dato.d_Descripcion}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Número de Factura */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-700">Número de Factura</label>
                                    <div className="flex gap-2 items-center">
                                        {/* Establecimiento - Solo lectura */}
                                        <input
                                            type="text"
                                            className="border rounded-md p-3 text-center text-sm flex-1"
                                            maxLength={3}
                                            value={datosFacturacion?.d_Establecimiento?.toString().padStart(3, "0") || ""}
                                            readOnly
                                            placeholder="000"
                                        />
                                        <span className="text-gray-500">-</span>
                                        
                                        {/* Punto de Emisión - Solo lectura */}
                                        <input
                                            type="text"
                                            className="border rounded-md p-3 text-center text-sm flex-1"
                                            maxLength={3}
                                            value={datosFacturacion?.d_P_Emision?.toString().padStart(3, "0") || ""}
                                            readOnly
                                            placeholder="000"
                                        />
                                        <span className="text-gray-500">-</span>
                                        
                                        {/* Número Secuencial - EDITABLE */}
                                        <input
                                            type="text"
                                            className="border rounded-md p-3 text-center text-sm flex-1 bg-white"
                                            maxLength={7}
                                            value={datosFacturacion ? (datosFacturacion.d_Nro_Secuencia + 1).toString().padStart(7, "0") : ""}
                                            onChange={handleNumeroFacturaChange}
                                            placeholder="0000000"
                                        />
                                    </div>
                                </div>

                                {/* Información adicional */}
                                {datosFacturacion && (
                                    <div className="bg-gray-50 p-3 rounded-md space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Rango:</span>
                                            <span className="font-medium">
                                                {datosFacturacion.d_NroDesde} - {datosFacturacion.d_NroHasta}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Vencimiento:</span>
                                            <span className="font-medium">{datosFacturacion.d_Fecha_Vence}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Descripción:</span>
                                            <span className="font-medium">{datosFacturacion.d_Descripcion}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Botones de acción */}
                                <div className="flex gap-2 mt-4">
                                    <button
                                        className="flex-1 bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors font-medium"
                                        onClick={() => setIsSelectorTimbradoOpen(false)}
                                    >
                                        Confirmar
                                    </button>
                                    <button
                                        className="flex-1 bg-gray-500 text-white py-3 rounded-md hover:bg-gray-600 transition-colors font-medium"
                                        onClick={() => setIsSelectorTimbradoOpen(false)}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <BuscadorClientesMobile
        isOpen={isBuscadorClientesOpen}
        setIsOpen={setIsBuscadorClientesOpen}
        onSelect={(cliente: ClienteViewModel) => {
          setClienteSeleccionado(cliente);
          setBusquedaCliente(cliente.cli_interno.toString());
          vendedorRef.current?.focus();
        }}
      />
      <ArticulosComponentMobile
        isOpen={isBuscadorArticulosOpen}
        setIsOpen={setIsBuscadorArticulosOpen}
        onSelect={(articulo) => {
          setArticuloSeleccionado(adaptarArticuloABusqueda(articulo));
          cantidadRef.current?.focus();
          setAgregarArticuloData({
            cantidad: 1,
            precio: articulo.precio_venta_guaranies,
            descuento: 0,
            bonificacion: "No"
          })
        }}
        depositoInicial={depositoSeleccionado?.dep_codigo}
      />
        </div>
    )
}