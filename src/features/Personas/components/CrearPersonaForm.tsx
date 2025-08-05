import type React from "react"
import type { CrearPersonaDTO } from "../../../shared/types/personas"
import { useCrearPersona } from "../../../shared/hooks/mutations/personal/crearPersonal"
import { useGetCiudades } from "../../../shared/hooks/querys/useCiudades"
import { useGetDepartamento } from "../../../shared/hooks/querys/useDepartamentos"
import { useMonedas } from "../../../shared/hooks/querys/useMonedas"
import { useZonas } from "../../../shared/hooks/querys/useZonas"
import { useEffect, useState, useRef } from "react"
import { procedencias } from "../utils/procedencias"
import { useGetTipoDocumento } from "../../../shared/hooks/querys/useTipoDocumento"
import { Autocomplete } from "../../../shared/components/Autocomplete/AutocompleteComponent"
import Tabs from "./tabs"
import { useGetGruposDeClientes } from "../../../shared/hooks/querys/useGruposDeCLientes"
import { useListaDePrecios } from "../../../shared/hooks/querys/useListaDePrecios"
import type { ListaPrecio } from "../../../shared/types/listaPrecio"
import ModalVendedores from "./ModalVendedores"
import type { UsuarioViewModel } from "../../../shared/types/operador"
import type { GrupoCliente } from "../../../shared/api/grupoClienteRepository"
import { useGetTipoPlazo } from "../../../shared/hooks/querys/useTipoPlazo"
import type { TipoPlazo } from "../../../shared/api/tipoPlazoRepository"
import { UsuarioRepository } from "../../../shared/api/usuarioRepository"
import { useGetUltimoCodigoInterno } from "../../../shared/hooks/querys/usePersonas"
import type { Ciudad } from "../../../shared/types/ciudad"
import type { Zona } from "../../../shared/types/zona"
import { useToast } from "@chakra-ui/react"

type TipoPersona = "operador" | "proveedor" | "cliente"

interface CrearPersonaFormProps {
    personaAEditar?: CrearPersonaDTO
}

const CrearPersonaForm = ({ personaAEditar }: CrearPersonaFormProps) => {
    const [tiposSeleccionados, setTiposSeleccionados] = useState<TipoPersona[]>([])
    const [activeTab, setActiveTab] = useState('datos-generales');

    const [isBuscadorCobradorOpen, setIsBuscadorCobradorOpen] = useState(false)
    const [selectedCobrador, setSelectedCobrador] = useState<UsuarioViewModel | null>(null)

    const [isBuscadorAgentesOpen, setIsBuscadorAgentesOpen] = useState(false)
    const [selectedAgente, setSelectedAgente] = useState<UsuarioViewModel | null>(null)

    const [isBuscadorVendedoresOpen, setIsBuscadorVendedoresOpen] = useState(false)
    const [selectedVendedor, setSelectedVendedor] = useState<UsuarioViewModel | null>(null)

    const [personaDTO, setPersonaDTO] = useState<CrearPersonaDTO>({
        persona: {
            codigo: 0,
            codigoInterno: "",
            razonSocial: "",
            nombreFantasia: "",
            ruc: "",
            ci: "",
            tipoDocumento: 0,
            departamento: 0,
            ciudad: 0,
            direccion: "",
            barrio: "",
            zona: 0,
            moneda: 0,
            observacion: "",
            email: "",
            telefono: "",
            estado: 1,
            fechaCreacion: new Date().toISOString(),
            fechaModificacion: new Date().toISOString(),
        },
        // operador: {
        //     opCodigo: 0,
        //     opNombre: "",
        //     opDocumento: "",
        //     opDireccion: "",
        //     opTelefono: "",
        //     opEmail: "",
        //     opFechaIngreso: new Date().toISOString().split("T")[0],
        //     opObservacion: "",
        //     opEstado: 1,
        //     opUsuario: "",
        //     opSucursal: 0,
        //     opFechaAlta: new Date().toISOString().split("T")[0],
        //     opArea: 0,
        //     opComision: 0,
        //     opNumVen: 0,
        //     opMovimiento: 0,
        //     opTipoVendedor: 0,
        //     opVendedorActividad: 0,
        //     opAutorizar: 0,
        //     opDiaCambClave: 0,
        //     opFechaCambioClave: new Date().toISOString().split("T")[0],
        //     opVerUtilidad: 0,
        //     opCantidadTurno: 0,
        //     opModificarFecha: 0,
        //     opGraficos: 0,
        //     opAplicarDescuento: 0,
        //     opDescuentoAplicar: 0,
        //     opVerProveedor: 0,
        //     opContrasena: "",
        //     opUti: 0,
        //     opTipoOperador: 0,
        //     opCliente: 0,
        //     opDescuento: 0,
        //     opFechaNacimiento: new Date().toISOString().split("T")[0],
        // },
        proveedor: {
            codigo: 0,
            razon: "",
            nombreComun: "",
            ruc: "",
            direccion: "",
            telefono: "",
            mail: "",
            observacion: "",
            moneda: 0,
            zonaId: 0,
            estado: 1,
            paisExtranjero: "",
            plazo: 0,
            credito: 0,
            tipoNac: 0,
            supervisor: "",
            telefonoSupervisor: "",
            vendedor: "",
            telefonoVendedor: "",
            aplicarGasto: 0,
            plan: 0,
            tipoDoc: 0,
            zona: {
                codigo: 0,
                descripcion: "",
                observacion: "",
                estado: 1,
                proveedores: [],
            },
        },
        cliente: {
            codigo: 0,
            interno: "",
            razon: "",
            ruc: "",
            ci: "",
            ciudad: 0,
            moneda: 0,
            barrio: "",
            dir: "",
            tel: "",
            credito: 0,
            limiteCredito: undefined,
            vendedor: 0,
            cobrador: 0,
            referencias: "",
            estado: 1,
            fechaAd: new Date().toISOString(),
            descripcion: "",
            condicion: 0,
            tipo: 0,
            grupo: 1,
            plazo: 0,
            zona: 0,
            llamada: new Date().toISOString(),
            proxLlamada: new Date().toISOString(),  
            respuesta: "",
            fecNac: new Date().toISOString(),
            exentas: 0,
            mail: "",
            agente: 0,
            contrato: 0,
            nombreCod: "",
            docCod: "",
            obsDeuda: "",
            moroso: 0,
            agenteRetentor: 0,
            consultar: 0,
            plan: 0,
            fechaPago: new Date().toISOString(),
            departamento: 0,
            gerente: "",
            gerTelefono: "",
            gerTelefono2: "",
            gerPagina: "",
            gerMail: "",
            permitirDesc: 0,
            calcMora: 0,
            bloquearVendedor: 0,
            sexo: 0,
            tipoDoc: 0,
            repetirRuc: 0,
            acuerdo: 0,
            dirCod: "",
            telefCod: "",
        },
        tipo: [],
        precios: [],
    })

    const { data: Monedas } = useMonedas()
    const { data: Zonas, isError: isErrorZonas, isLoading: isLoadingZonas } = useZonas()
    const { data: Ciudades, isLoading: isLoadingCiudades, isError: isErrorCiudades } = useGetCiudades()
    const { data: Departamentos } = useGetDepartamento()
    const { data: TiposDocumentos } = useGetTipoDocumento();
    const personaMutation = useCrearPersona()
    const { data: GruposClientes } = useGetGruposDeClientes();
    const { data: ListaDePrecios } = useListaDePrecios();
    const { data: tipoPlazoList } = useGetTipoPlazo();
    const { data: ultimoCodigoInterno } = useGetUltimoCodigoInterno();
    const toast = useToast()

    const [listaDePreciosSeleccionados, setListaDePreciosSeleccionados] = useState<ListaPrecio[]>([])

    const formRef = useRef<HTMLDivElement>(null);

    // Primero, agregamos un nuevo estado para controlar el enfoque
    const [focusTarget, setFocusTarget] = useState<{ tabId: string, position: 'first' | 'last' } | null>(null);

    // Función helper para convertir fechas a formato string para inputs
    const formatDateForInput = (date: Date | string | undefined): string => {
        if (!date) return '';
        
        if (date instanceof Date) {
            return date.toISOString().split("T")[0];
        }
        
        if (typeof date === 'string') {
            // Si ya es un string en formato YYYY-MM-DD, devolverlo tal como está
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return date;
            }
            // Si es un string ISO, convertirlo a Date y luego a YYYY-MM-DD
            const dateObj = new Date(date);
            if (!isNaN(dateObj.getTime())) {
                return dateObj.toISOString().split("T")[0];
            }
        }
        
        return '';
    };

    // Función helper para convertir Date a string ISO para el backend
    const formatDateForBackend = (date: Date | string | undefined): string => {
        if (!date) return new Date().toISOString();
        
        if (date instanceof Date) {
            return date.toISOString();
        }
        
        if (typeof date === 'string') {
            // Si ya es un string ISO, devolverlo tal como está
            if (date.includes('T') || date.includes('Z')) {
                return date;
            }
            // Si es YYYY-MM-DD, convertirlo a ISO
            const dateObj = new Date(date);
            if (!isNaN(dateObj.getTime())) {
                return dateObj.toISOString();
            }
        }
        
        return new Date().toISOString();
    };

    const cargarOperadores = async (person: CrearPersonaDTO) => {
        try {

            // Cargar cada operador de forma independiente para manejar errores individualmente
            const vendedorPromise = person.cliente?.vendedor
                ? UsuarioRepository.GetUsuarioById(person.cliente.vendedor)
                    .catch(() => null)
                : Promise.resolve(null);

            const cobradorPromise = person.cliente?.cobrador
                ? UsuarioRepository.GetUsuarioById(person.cliente.cobrador)
                    .catch(() => null)
                : Promise.resolve(null);

            const agentePromise = person.cliente?.agente
                ? UsuarioRepository.GetUsuarioById(person.cliente.agente)
                    .catch(() => null)
                : Promise.resolve(null);

            // Esperar todas las promesas   
            const [vendedorData, cobradorData, agenteData] = await Promise.all([
                vendedorPromise,
                cobradorPromise,
                agentePromise
            ]);

            // Actualizar los estados solo si hay datos
            if (vendedorData) {
                setSelectedVendedor(vendedorData);
            }
            if (cobradorData) {
                setSelectedCobrador(cobradorData);
            }
            if (agenteData) {
                setSelectedAgente(agenteData);
            }
        } catch (error) {
            toast({
                title: 'Error al cargar los operadores',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'bottom'
            });
        }
    }

    useEffect(() => {
        if (ultimoCodigoInterno) {
            setPersonaDTO({
                ...personaDTO,
                persona: { ...personaDTO.persona, codigoInterno: ultimoCodigoInterno.toString() },
                cliente: { ...personaDTO.cliente, interno: ultimoCodigoInterno.toString() }
            })
        }
    }, [ultimoCodigoInterno])

    // Separar los efectos para mejor control
    useEffect(() => {
        if (personaAEditar) {
            setPersonaDTO({
                persona: {
                    codigo: personaAEditar.persona.codigo,
                    codigoInterno: personaAEditar.persona.codigoInterno,
                    razonSocial: personaAEditar.persona.razonSocial,
                    nombreFantasia: personaAEditar.persona.nombreFantasia,
                    ruc: personaAEditar.persona.ruc,
                    ci: personaAEditar.persona.ci,
                    tipoDocumento: personaAEditar.persona.tipoDocumento,
                    departamento: personaAEditar.persona.departamento,
                    ciudad: personaAEditar.persona.ciudad,
                    direccion: personaAEditar.persona.direccion,
                    barrio: personaAEditar.persona.barrio,
                    zona: personaAEditar.persona.zona,
                    moneda: personaAEditar.persona.moneda,
                    observacion: personaAEditar.persona.observacion,
                    email: personaAEditar.persona.email,
                    telefono: personaAEditar.persona.telefono,
                    estado: personaAEditar.persona.estado,
                    fechaCreacion: personaAEditar.persona.fechaCreacion,
                    fechaModificacion: personaAEditar.persona.fechaModificacion,
                },
                // operador: {
                //     opCodigo: personaAEditar.operador.opCodigo,
                //     opNombre: personaAEditar.operador.opNombre,
                //     opDocumento: personaAEditar.operador.opDocumento || "",
                //     opDireccion: personaAEditar.operador.opDireccion || "",
                //     opTelefono: personaAEditar.operador.opTelefono || "",
                //     opEmail: personaAEditar.operador.opEmail || "",
                //     opFechaIngreso: personaAEditar.operador.opFechaIngreso || new Date().toISOString().split("T")[0],
                //     opObservacion: personaAEditar.operador.opObservacion || "",
                //     opEstado: personaAEditar.operador.opEstado || 1,
                //     opUsuario: personaAEditar.operador.opUsuario || "",
                //     opSucursal: personaAEditar.operador.opSucursal || 0,
                //     opFechaAlta: personaAEditar.operador.opFechaAlta || new Date().toISOString().split("T")[0],
                //     opArea: personaAEditar.operador.opArea || 0,
                //     opComision: personaAEditar.operador.opComision || 0,
                //     opNumVen: personaAEditar.operador.opNumVen || 0,
                //     opMovimiento: personaAEditar.operador.opMovimiento || 0,
                //     opTipoVendedor: personaAEditar.operador.opTipoVendedor || 0,
                //     opVendedorActividad: personaAEditar.operador.opVendedorActividad || 0,
                //     opAutorizar: personaAEditar.operador.opAutorizar || 0,
                //     opDiaCambClave: personaAEditar.operador.opDiaCambClave || 0,
                //     opFechaCambioClave: personaAEditar.operador.opFechaCambioClave || new Date().toISOString().split("T")[0],
                //     opVerUtilidad: personaAEditar.operador.opVerUtilidad || 0,
                //     opCantidadTurno: personaAEditar.operador.opCantidadTurno || 0,
                //     opModificarFecha: personaAEditar.operador.opModificarFecha || 0,
                //     opGraficos: personaAEditar.operador.opGraficos || 0,
                //     opAplicarDescuento: personaAEditar.operador.opAplicarDescuento || 0,
                //     opDescuentoAplicar: personaAEditar.operador.opDescuentoAplicar || 0,
                //     opVerProveedor: personaAEditar.operador.opVerProveedor || 0,
                //     opContrasena: personaAEditar.operador.opContrasena || "",
                //     opUti: personaAEditar.operador.opUti || 0,
                //     opTipoOperador: personaAEditar.operador.opTipoOperador || 0,
                //     opCliente: personaAEditar.operador.opCliente || 0,
                //     opDescuento: personaAEditar.operador.opDescuento || 0,
                //     opFechaNacimiento: personaAEditar.operador.opFechaNacimiento || new Date().toISOString().split("T")[0],
                // },
                proveedor: {
                    codigo: personaAEditar.proveedor?.codigo || 0,
                    razon: personaAEditar.proveedor?.razon || "",
                    nombreComun: personaAEditar.proveedor?.nombreComun || "",
                    ruc: personaAEditar.proveedor?.ruc || "",
                    direccion: personaAEditar.proveedor?.direccion || "",
                    telefono: personaAEditar.proveedor?.telefono || "",
                    mail: personaAEditar.proveedor?.mail || "",
                    observacion: personaAEditar.proveedor?.observacion || "",
                    moneda: personaAEditar.proveedor?.moneda || 0,
                    zonaId: personaAEditar.proveedor?.zonaId || 0,
                    estado: personaAEditar.proveedor?.estado || 1,
                    paisExtranjero: personaAEditar.proveedor?.paisExtranjero || "",
                    plazo: personaAEditar.proveedor?.plazo || 0,
                    credito: personaAEditar.proveedor?.credito || 0,
                    tipoNac: personaAEditar.proveedor?.tipoNac || 0,
                    supervisor: personaAEditar.proveedor?.supervisor || "",
                    telefonoSupervisor: personaAEditar.proveedor?.telefonoSupervisor || "",
                    vendedor: personaAEditar.proveedor?.vendedor || "",
                    telefonoVendedor: personaAEditar.proveedor?.telefonoVendedor || "",
                    aplicarGasto: personaAEditar.proveedor?.aplicarGasto || 0,
                    plan: personaAEditar.proveedor?.plan || 0,
                    tipoDoc: personaAEditar.proveedor?.tipoDoc || 0,
                    zona: {
                        codigo: personaAEditar.proveedor?.zona?.codigo || 0,
                        descripcion: personaAEditar.proveedor?.zona?.descripcion || "",
                        observacion: personaAEditar.proveedor?.zona?.observacion || "",
                        estado: personaAEditar.proveedor?.zona?.estado || 1,
                        proveedores: personaAEditar.proveedor?.zona?.proveedores || [],
                    },
                },
                cliente: {
                    codigo: personaAEditar.cliente?.codigo || 0,
                    interno: personaAEditar.cliente?.interno || "",
                    razon: personaAEditar.cliente?.razon || "",
                    ruc: personaAEditar.cliente?.ruc || "",
                    ci: personaAEditar.cliente?.ci || "",
                    ciudad: personaAEditar.cliente?.ciudad || 0,
                    moneda: personaAEditar.cliente?.moneda || 0,
                    barrio: personaAEditar.cliente?.barrio || "",
                    dir: personaAEditar.cliente?.dir || "",
                    tel: personaAEditar.cliente?.tel || "",
                    credito: personaAEditar.cliente?.credito || 0,
                    limiteCredito: personaAEditar.cliente?.limiteCredito || 0,
                    vendedor: personaAEditar.cliente?.vendedor || 0,
                    cobrador: personaAEditar.cliente?.cobrador || 0,
                    referencias: personaAEditar.cliente?.referencias || "",
                    estado: personaAEditar.cliente?.estado || 1,
                    fechaAd: personaAEditar.cliente?.fechaAd || new Date().toISOString(),
                    descripcion: personaAEditar.cliente?.descripcion || "",
                    condicion: personaAEditar.cliente?.condicion || 0,
                    tipo: personaAEditar.cliente?.tipo || 0,
                    grupo: personaAEditar.cliente?.grupo || 1,
                    plazo: personaAEditar.cliente?.plazo || 0,
                    zona: personaAEditar.cliente?.zona || 0,
                    llamada: personaAEditar.cliente?.llamada || new Date().toISOString(),
                    proxLlamada: personaAEditar.cliente?.proxLlamada || new Date().toISOString(),
                    respuesta: personaAEditar.cliente?.respuesta || "",
                    fecNac: personaAEditar.cliente?.fecNac || new Date().toISOString(),
                    exentas: personaAEditar.cliente?.exentas || 0,
                    mail: personaAEditar.cliente?.mail || "",
                    agente: personaAEditar.cliente?.agente || 0,
                    contrato: personaAEditar.cliente?.contrato || 0,
                    nombreCod: personaAEditar.cliente?.nombreCod || "",
                    docCod: personaAEditar.cliente?.docCod || "",
                    obsDeuda: personaAEditar.cliente?.obsDeuda || "",
                    moroso: personaAEditar.cliente?.moroso || 0,
                    agenteRetentor: personaAEditar.cliente?.agenteRetentor || 0,
                    consultar: personaAEditar.cliente?.consultar || 0,
                    plan: personaAEditar.cliente?.plan || 0,
                    fechaPago: personaAEditar.cliente?.fechaPago || new Date().toISOString(),
                    departamento: personaAEditar.cliente?.departamento || 0,
                    gerente: personaAEditar.cliente?.gerente || "",
                    gerTelefono: personaAEditar.cliente?.gerTelefono || "",
                    gerTelefono2: personaAEditar.cliente?.gerTelefono2 || "",
                    gerPagina: personaAEditar.cliente?.gerPagina || "",
                    gerMail: personaAEditar.cliente?.gerMail || "",
                    permitirDesc: personaAEditar.cliente?.permitirDesc || 0,
                    calcMora: personaAEditar.cliente?.calcMora || 0,
                    bloquearVendedor: personaAEditar.cliente?.bloquearVendedor || 0,
                    sexo: personaAEditar.cliente?.sexo || 0,
                    tipoDoc: personaAEditar.cliente?.tipoDoc || 0,
                    repetirRuc: personaAEditar.cliente?.repetirRuc || 0,
                    acuerdo: personaAEditar.cliente?.acuerdo || 0,
                    dirCod: personaAEditar.cliente?.dirCod || "",
                    telefCod: personaAEditar.cliente?.telefCod || "",
                },
                tipo: personaAEditar.tipo || [],
                precios: personaAEditar.precios || [],
            });

            if (personaAEditar.proveedor != null && personaAEditar.cliente != null) {
                handleTipoChange("cliente", true);
                handleTipoChange("proveedor", true);
            }

            else if (personaAEditar.cliente != null) {
                handleTipoChange("cliente", true);
            }

            else if (personaAEditar.proveedor != null) {
                handleTipoChange("proveedor", true);
            }
        }
    }, [personaAEditar]);

    // Efecto separado para cargar operadores
    useEffect(() => {
        if (personaAEditar?.cliente) {
            cargarOperadores(personaAEditar);
        }
    }, [personaAEditar?.cliente]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const tipos = tiposSeleccionados.map(tipo => {
            if (tipo === "operador") return 2
            if (tipo === "proveedor") return 1
            if (tipo === "cliente") return 0
            return 0
        })

        // Convertir las fechas a formato ISO antes de enviar
        const dto = {
            ...personaDTO,
            tipo: tipos,
            cliente: {
                ...personaDTO.cliente,
                fechaAd: formatDateForBackend(personaDTO.cliente.fechaAd),
                llamada: formatDateForBackend(personaDTO.cliente.llamada),
                proxLlamada: formatDateForBackend(personaDTO.cliente.proxLlamada),
                fecNac: formatDateForBackend(personaDTO.cliente.fecNac),
                fechaPago: formatDateForBackend(personaDTO.cliente.fechaPago),
            },
                persona: {
                ...personaDTO.persona,
                fechaCreacion: formatDateForBackend(personaDTO.persona.fechaCreacion),
                fechaModificacion: formatDateForBackend(personaDTO.persona.fechaModificacion),
            }
        }

        console.log("Enviando datos de Persona:", dto)

        try {
            const response = await personaMutation.mutateAsync(dto)
            console.log("Respuesta:", response)
            toast({
                title: 'Persona creada exitosamente',
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'bottom'
            });
            handleVaciarCampos()
        } catch (err) {
            console.error("Error al crear persona", err)
            toast({
                title: 'Error al crear la persona',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'bottom'
            });
        }
    }

    const handleTipoChange = (tipo: TipoPersona, checked: boolean) => {
        if (checked) {
            setTiposSeleccionados((prev) => [...prev, tipo])
        } else {
            setTiposSeleccionados((prev) => prev.filter((t) => t !== tipo))
        }
    }

    const updatePersona = (field: string, value: any) => {
        setPersonaDTO((prev) => {
            return {
                ...prev,
                persona: {
                    ...prev.persona,
                    [field]: value,
                },
            }
        })
    }

    const updateProveedor = (field: string, value: any) => {
        setPersonaDTO((prev) => ({
            ...prev,
            proveedor: {
                ...prev.proveedor,
                [field]: value,
            },
        }))
    }

    const updateCliente = (field: string, value: any) => {
        setPersonaDTO((prev) => ({
            ...prev,
            cliente: {
                ...prev.cliente,
                [field]: value,
            },
        }))
    }

    const updatePrecios = (precio: ListaPrecio) => {
        // Verificar si el precio ya está en la lista para evitar duplicados
        const precioYaExiste = personaDTO.precios.includes(precio.lpCodigo);
        
        if (!precioYaExiste) {
            setPersonaDTO((prev) => ({
                ...prev,
                precios: [...prev.precios, precio.lpCodigo],
            }))
            setListaDePreciosSeleccionados((prev) => [...prev, precio])
        }
    }

    useEffect(() => {
        if (selectedVendedor) {
            updateCliente('vendedor', selectedVendedor.op_codigo)
        }
        if (selectedAgente) {
            updateCliente('agente', selectedAgente.op_codigo)
        }
        if (selectedCobrador) {
            updateCliente('cobrador', selectedCobrador.op_codigo)
        }
    }, [selectedVendedor, selectedAgente, selectedCobrador])


    const handleSelectVendedor = (vendedor: UsuarioViewModel) => {
        setSelectedVendedor(vendedor);
        setIsBuscadorVendedoresOpen(false);
        // Mover al siguiente campo después de seleccionar
        const focusableElements = document.querySelectorAll(
            'input:not([disabled]):not([type="hidden"]), ' +
            'select:not([disabled]), ' +
            'textarea:not([disabled]), ' +
            '[data-autocomplete] input:not([disabled])'
        );
        const focusableArray = Array.from(focusableElements);
        const currentIndex = focusableArray.findIndex(el => (el as HTMLElement).id === 'vendedor');
        if (currentIndex !== -1 && currentIndex + 1 < focusableArray.length) {
            const nextElement = focusableArray[currentIndex + 1] as HTMLElement;
            nextElement.focus();
            if (nextElement instanceof HTMLSelectElement) {
                nextElement.click();
            }
        }
    }

    const handleSelectedAgente = (agente: UsuarioViewModel) => {
        setSelectedAgente(agente);
        setIsBuscadorAgentesOpen(false);
        // Mover al siguiente campo después de seleccionar
        const focusableElements = document.querySelectorAll(
            'input:not([disabled]):not([type="hidden"]), ' +
            'select:not([disabled]), ' +
            'textarea:not([disabled]), ' +
            '[data-autocomplete] input:not([disabled])'
        );
        const focusableArray = Array.from(focusableElements);
        const currentIndex = focusableArray.findIndex(el => (el as HTMLElement).id === 'agente');
        if (currentIndex !== -1 && currentIndex + 1 < focusableArray.length) {
            const nextElement = focusableArray[currentIndex + 1] as HTMLElement;
            nextElement.focus();
            if (nextElement instanceof HTMLSelectElement) {
                nextElement.click();
            }
        }
    }

    const handleSelectedCobrador = (cobrador: UsuarioViewModel) => {
        setSelectedCobrador(cobrador);
        setIsBuscadorCobradorOpen(false);
        // Mover al siguiente campo después de seleccionar
        const focusableElements = document.querySelectorAll(
            'input:not([disabled]):not([type="hidden"]), ' +
            'select:not([disabled]), ' +
            'textarea:not([disabled]), ' +
            '[data-autocomplete] input:not([disabled])'
        );
        const focusableArray = Array.from(focusableElements);
        const currentIndex = focusableArray.findIndex(el => (el as HTMLElement).id === 'cobrador');
        if (currentIndex !== -1 && currentIndex + 1 < focusableArray.length) {
            const nextElement = focusableArray[currentIndex + 1] as HTMLElement;
            nextElement.focus();
            if (nextElement instanceof HTMLSelectElement) {
                nextElement.click();
            }
        }
    }

    const isOperadorSelected = tiposSeleccionados.includes("operador")
    const isProveedorSelected = tiposSeleccionados.includes("proveedor")
    const isClienteSelected = tiposSeleccionados.includes("cliente")


    const handleEnterDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            // Si estamos en el campo de observaciones
            if ((e.target as HTMLInputElement).id === 'observacion') {
                if (isClienteSelected) {
                    setActiveTab('datos-cliente');
                    setFocusTarget({ tabId: 'datos-cliente', position: 'first' });
                } else if (isProveedorSelected) {
                    setActiveTab('datos-proveedor');
                    setFocusTarget({ tabId: 'datos-proveedor', position: 'first' });
                }
                return;
            }

            // Si estamos en un campo que abre modal (agente, vendedor, cobrador)
            const modalFields = ['agente', 'vendedor', 'cobrador'];
            if (modalFields.includes((e.target as HTMLInputElement).id)) {
                switch ((e.target as HTMLInputElement).id) {
                    case 'agente':
                        setIsBuscadorAgentesOpen(true);
                        break;
                    case 'vendedor':
                        setIsBuscadorVendedoresOpen(true);
                        break;
                    case 'cobrador':
                        setIsBuscadorCobradorOpen(true);
                        break;
                }
                return;
            }

            // Obtener todos los inputs, selects y textareas que no estén deshabilitados
            const focusableElements = document.querySelectorAll(
                'input:not([disabled]):not([type="hidden"]), ' +
                'select:not([disabled]), ' +
                'textarea:not([disabled]), ' +
                '[data-autocomplete] input:not([disabled])'
            );

            const focusableArray = Array.from(focusableElements);
            const currentIndex = focusableArray.indexOf(e.target as HTMLElement);
            const direction = e.shiftKey ? -1 : 1;
            const nextIndex = currentIndex + direction;

            // Si estamos en el último elemento y no es shift+enter, cambiar al siguiente tab
            if (nextIndex >= focusableArray.length && !e.shiftKey) {
                const currentTab = activeTab;
                const tabs = [
                    { id: 'datos-persona', enabled: true },
                    { id: 'datos-cliente', enabled: isClienteSelected },
                    { id: 'datos-proveedor', enabled: isProveedorSelected }
                ];

                const currentTabIndex = tabs.findIndex(tab => tab.id === currentTab);
                const nextTab = tabs.slice(currentTabIndex + 1).find(tab => tab.enabled);

                if (nextTab) {
                    setActiveTab(nextTab.id);
                    setFocusTarget({ tabId: nextTab.id, position: 'first' });
                }
                return;
            }

            // Si estamos en el primer elemento y es shift+enter, cambiar al tab anterior
            if (nextIndex < 0 && e.shiftKey) {
                const currentTab = activeTab;
                const tabs = [
                    { id: 'datos-persona', enabled: true },
                    { id: 'datos-cliente', enabled: isClienteSelected },
                    { id: 'datos-proveedor', enabled: isProveedorSelected }
                ];

                const currentTabIndex = tabs.findIndex(tab => tab.id === currentTab);
                const previousTab = tabs.slice(0, currentTabIndex).reverse().find(tab => tab.enabled);

                if (previousTab) {
                    setActiveTab(previousTab.id);
                    setFocusTarget({ tabId: previousTab.id, position: 'last' });
                }
                return;
            }

            // Navegación normal dentro del mismo tab
            if (nextIndex >= 0 && nextIndex < focusableArray.length) {
                const nextElement = focusableArray[nextIndex] as HTMLElement;
                nextElement.focus();
                if (nextElement instanceof HTMLSelectElement) {
                    nextElement.click();
                }
            }
        }
    };

    // Agregamos un useEffect para manejar el enfoque después del cambio de tab
    useEffect(() => {
        if (focusTarget) {
            const { tabId, position } = focusTarget;
            const focusableElements = document.querySelectorAll(
                `#${tabId} input:not([disabled]):not([type="hidden"]), ` +
                `#${tabId} select:not([disabled]), ` +
                `#${tabId} textarea:not([disabled])`
            );

            if (focusableElements.length > 0) {
                const targetElement = position === 'first'
                    ? focusableElements[0]
                    : focusableElements[focusableElements.length - 1];

                if (targetElement instanceof HTMLElement) {
                    targetElement.focus();
                    if (targetElement instanceof HTMLSelectElement) {
                        targetElement.click();
                    }
                }
            }

            // Limpiar el target después de enfocar
            setFocusTarget(null);
        }
    }, [focusTarget, activeTab]);

    const handleVaciarCampos = () => {
        setPersonaDTO(
            {
                persona: {
                    codigo: 0,
                    codigoInterno: "",
                    razonSocial: "",
                    nombreFantasia: "",
                    ruc: "",
                    ci: "",
                    tipoDocumento: 0,
                    departamento: 0,
                    ciudad: 0,
                    direccion: "",
                    barrio: "",
                    zona: 0,
                    moneda: 0,
                    observacion: "",
                    email: "",
                    telefono: "",
                    estado: 1,
                    fechaCreacion: new Date().toISOString(),
                    fechaModificacion: new Date().toISOString(),
                },
                operador: {
                    opCodigo: 0,
                    opNombre: "",
                    opDocumento: "",
                    opDireccion: "",
                    opTelefono: "",
                    opEmail: "",
                    opFechaIngreso: new Date().toISOString(),
                    opObservacion: "",
                    opEstado: 1,
                    opUsuario: "",
                    opSucursal: 0,
                    opFechaAlta: new Date().toISOString(),
                    opArea: 0,
                    opComision: 0,
                    opNumVen: 0,
                    opMovimiento: 0,
                    opTipoVendedor: 0,
                    opVendedorActividad: 0,
                    opAutorizar: 0,
                    opDiaCambClave: 0,
                    opFechaCambioClave: new Date().toISOString(),
                    opVerUtilidad: 0,
                    opCantidadTurno: 0,
                    opModificarFecha: 0,
                    opGraficos: 0,
                    opAplicarDescuento: 0,
                    opDescuentoAplicar: 0,
                    opVerProveedor: 0,
                    opContrasena: "",
                    opUti: 0,
                    opTipoOperador: 0,
                    opCliente: 0,
                    opDescuento: 0,
                    opFechaNacimiento: new Date().toISOString() ,
                },
                proveedor: {
                    codigo: 0,
                    razon: "",
                    nombreComun: "",
                    ruc: "",
                    direccion: "",
                    telefono: "",
                    mail: "",
                    observacion: "",
                    moneda: 0,
                    zonaId: 0,
                    estado: 1,
                    paisExtranjero: "",
                    plazo: 0,
                    credito: 0,
                    tipoNac: 0,
                    supervisor: "",
                    telefonoSupervisor: "",
                    vendedor: "",
                    telefonoVendedor: "",
                    aplicarGasto: 0,
                    plan: 0,
                    tipoDoc: 0,
                },
                cliente: {
                    codigo: 0,
                    interno: "",
                    razon: "",
                    ruc: "",
                    ci: "",
                    ciudad: 0,
                    moneda: 0,
                    barrio: "",
                    dir: "",
                    tel: "",
                    credito: 0,
                    limiteCredito: undefined,
                    vendedor: 0,
                    cobrador: 0,
                    referencias: "",
                    estado: 1,
                    fechaAd: new Date().toISOString(),
                    descripcion: "",
                    condicion: 0,
                    tipo: 0,
                    grupo: 1,
                    plazo: 0,
                    zona: 0,
                    llamada: new Date().toISOString(),
                    proxLlamada: new Date().toISOString(),
                    respuesta: "",
                    fecNac: new Date().toISOString(),
                    exentas: 0,
                    mail: "",
                    agente: 0,
                    contrato: 0,
                    nombreCod: "",
                    docCod: "",
                    obsDeuda: "",
                    moroso: 0,
                    agenteRetentor: 0,
                    consultar: 0,
                    plan: 0,
                    fechaPago: new Date().toISOString(),
                    departamento: 0,
                    gerente: "",
                    gerTelefono: "",
                    gerTelefono2: "",
                    gerPagina: "",
                    gerMail: "",
                    permitirDesc: 0,
                    calcMora: 0,
                    bloquearVendedor: 0,
                    sexo: 0,
                    tipoDoc: 0,
                    repetirRuc: 0,
                    acuerdo: 0,
                    dirCod: "",
                    telefCod: "",
                },
                tipo: [],
                precios: [],
            }
        )
        setSelectedVendedor(null)
        setSelectedAgente(null)
        setSelectedCobrador(null)
        setListaDePreciosSeleccionados([])
    }


    const handleEditarRazonSocial = (e: React.ChangeEvent<HTMLInputElement>) => {
        updatePersona("razonSocial", e.target.value)
        updatePersona("nombreFantasia", e.target.value)
        updateProveedor("razon", e.target.value)
        updateProveedor("nombreComun", e.target.value)
        updateCliente("razon", e.target.value)
        updateCliente("descripcion", e.target.value)
    }

    const handleEditarDocumento = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        const esRuc = personaDTO.persona.tipoDocumento === 1;

        // Remover cualquier caracter que no sea número
        const soloNumeros = valor.replace(/\D/g, '');

        if (esRuc) {
            let rucFormateado = soloNumeros;

            // Si ya tiene 7 dígitos, agregar el guion
            if (soloNumeros.length === 7) {
                rucFormateado = soloNumeros + '-';
            }
            // Si tiene 8 dígitos, formatear como RUC de persona física
            else if (soloNumeros.length === 8) {
                rucFormateado = soloNumeros.slice(0, 7) + '-' + soloNumeros.slice(7, 8);
            }
            // Si tiene más de 8 dígitos, formatear como RUC de persona jurídica
            else if (soloNumeros.length > 8) {
                rucFormateado = soloNumeros.slice(0, 8) + '-' + soloNumeros.slice(8, 9);
            }

            // Actualizar RUC con formato
            updatePersona("ruc", rucFormateado);
            updateProveedor("ruc", rucFormateado);
            updateCliente("ruc", rucFormateado);

            // Para CI, tomamos los primeros 8 dígitos si es RUC de persona jurídica
            const ciSinVerificador = soloNumeros.length > 8
                ? soloNumeros.slice(0, 8)  // Si es RUC de persona jurídica, tomamos 8 dígitos
                : soloNumeros.slice(0, 7); // Si es RUC de persona física, tomamos 7 dígitos
            updatePersona("ci", ciSinVerificador);
            updateCliente("ci", ciSinVerificador);
        } else {
            // Si no es RUC, validar longitud máxima para CI
            const ciFormateado = soloNumeros.slice(0, 8);

            // Para CI, tomamos los primeros 8 dígitos
            const ciSinVerificador = ciFormateado;
            updatePersona("ci", ciSinVerificador);
            updatePersona("ruc", ciFormateado);
            updateProveedor("ruc", ciFormateado);
            updateCliente("ci", ciSinVerificador);
            updateCliente("ruc", ciFormateado);
        }
    }

    const tabs = [
        {
            id: 'datos-generales',
            label: 'Datos Generales',
            content: (
                <div className="p-4 flex flex-col gap-4 sm:flex-row sm:gap-4">
                    {/* todo lo comun entre proveedores y clientes */}
                    <div className="flex flex-col gap2">
                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                            <div>
                                <label htmlFor="codigoInterno" className="block text-sm font-medium text-gray-700 mb-1">
                                    Codigo interno *
                                </label>
                                <input
                                    type="text"
                                    id="razon"
                                    disabled={!isClienteSelected}
                                    required={isClienteSelected}
                                    value={personaDTO.cliente.interno}
                                    onKeyDown={handleEnterDown}
                                    onChange={(e) => {
                                        updatePersona("codigoInterno", e.target.value)
                                        updateCliente("interno", e.target.value)
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="razon" className="block text-xs font-medium text-gray-700 mb-1">
                                    Nombre de fantasia (Razón Social) *
                                </label>
                                <input
                                    type="text"
                                    id="razon"
                                    disabled={!isProveedorSelected && !isClienteSelected}
                                    required={isProveedorSelected || isClienteSelected}
                                    value={personaDTO.persona.razonSocial}
                                    onKeyDown={handleEnterDown}
                                    onChange={(e) => {
                                        handleEditarRazonSocial(e)
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                                Razón Social Fiscal *
                            </label>
                            <input
                                type="text"
                                id="descripcion"
                                disabled={!isProveedorSelected && !isClienteSelected}
                                required={isProveedorSelected || isClienteSelected}
                                value={personaDTO.persona.nombreFantasia}
                                onChange={(e) => {
                                    updatePersona("nombreFantasia", e.target.value)
                                    updateCliente("descripcion", e.target.value)
                                    updateProveedor("nombreComun", e.target.value)
                                }}
                                onKeyDown={handleEnterDown}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                            <div>
                                <label htmlFor="tipoDoc" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo Doc
                                </label>
                                <select
                                    id="tipoDoc"
                                    disabled={!isProveedorSelected && !isClienteSelected}
                                    required={isProveedorSelected || isClienteSelected}
                                    value={personaDTO.persona.tipoDocumento}
                                    onChange={(e) => {
                                        updatePersona("tipoDocumento", Number.parseInt(e.target.value))
                                        updateCliente("tipoDoc", Number.parseInt(e.target.value))
                                        updateProveedor("tipoDoc", Number.parseInt(e.target.value))
                                    }}
                                    onKeyDown={handleEnterDown}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value={0}>Seleccionar doc</option>
                                    {TiposDocumentos?.map((tipo) => (
                                        <option key={tipo.id} value={tipo.id}>
                                            {tipo.descripcion}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="ruc" className="block text-sm font-medium text-gray-700 mb-1">
                                    RUC *
                                </label>
                                <input
                                    type="text"
                                    id="ruc"
                                    disabled={!isProveedorSelected && !isClienteSelected || personaDTO.persona.tipoDocumento !== 1}
                                    required={isProveedorSelected || isClienteSelected}
                                    value={personaDTO.persona.ruc}
                                    onChange={handleEditarDocumento}
                                    placeholder="00000000-0"
                                    maxLength={11}
                                    title="El RUC debe tener 7 u 8 dígitos seguidos de un guion y un dígito verificador"
                                    onKeyDown={handleEnterDown}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="ci" className="block text-sm font-medium text-gray-700 mb-1">
                                    CI *
                                </label>
                                <input
                                    type="text"
                                    id="ci"
                                    value={personaDTO.persona.ci}
                                    disabled={!isProveedorSelected && !isClienteSelected || personaDTO.persona.tipoDocumento === 0}
                                    required={isProveedorSelected || isClienteSelected}
                                    placeholder="Cédula de identidad"
                                    onChange={handleEditarDocumento}
                                    maxLength={8}
                                    title="La cédula debe tener 7 u 8 dígitos"
                                    onKeyDown={handleEnterDown}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col flex-1">

                            <div className="flex flex-row gap-2">
                                <input type="checkbox" id="repetirRuc" value={personaDTO.cliente.repetirRuc} disabled={!isClienteSelected} name="repetirRuc" onChange={() => {
                                    updateCliente("repetirRuc", personaDTO.cliente.repetirRuc === 1 ? 0 : 1)
                                }} className="disabled:opacity-50 disabled:cursor-not-allowed" onKeyDown={handleEnterDown} />
                                <label htmlFor="repetirRuc" className="text-md font-bold">Repetir RUC</label>
                            </div>
                            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1 ">
                                Dirección *
                            </label>
                            <input
                                type="text"
                                id="direccion"
                                disabled={!isProveedorSelected && !isClienteSelected}
                                required={isProveedorSelected || isClienteSelected}
                                placeholder="Dirección del proveedor"
                                value={personaDTO.persona.direccion}
                                onChange={(e) => {
                                    updatePersona("direccion", e.target.value)
                                    updateProveedor("direccion", e.target.value)
                                    updateCliente("dir", e.target.value)
                                }}
                                onKeyDown={handleEnterDown}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1 ">
                                Email *
                            </label>
                            <input
                                type="text"
                                id="email"
                                disabled={!isProveedorSelected && !isClienteSelected}
                                required={isProveedorSelected || isClienteSelected}
                                placeholder="Email"
                                value={personaDTO.persona.email}
                                onChange={(e) => {
                                    updatePersona("email", e.target.value)
                                    updateCliente("mail", e.target.value)
                                    updateProveedor("mail", e.target.value)
                                }}
                                onKeyDown={handleEnterDown}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">

                            <div className="flex flex-col flex-1">
                                <label htmlFor="barrio" className="block text-sm font-medium text-gray-700 mb-1">
                                    Barrio *
                                </label>
                                <input
                                    type="text"
                                    id="barrio"
                                    disabled={!isClienteSelected}
                                    required={isClienteSelected}
                                    placeholder="Barrio del cliente"
                                    value={personaDTO.persona.barrio}
                                    onChange={(e) => {
                                        updateCliente("barrio", e.target.value)
                                        updatePersona("barrio", e.target.value)
                                    }}
                                    onKeyDown={handleEnterDown}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefono *
                                </label>
                                <input
                                    type="text"
                                    id="telefono"
                                    disabled={!isProveedorSelected && !isClienteSelected}
                                    required={isProveedorSelected || isClienteSelected}
                                    placeholder="Teléfono del proveedor o cliente"
                                    value={personaDTO.persona.telefono}
                                    onChange={(e) => {
                                        updatePersona("telefono", e.target.value)
                                        updateCliente("tel", e.target.value)
                                        updateProveedor("telefono", e.target.value)
                                    }}
                                    onKeyDown={handleEnterDown}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div className="flex flex-row gap-2 w-full">
                            <div className="flex flex-col flex-1">
                                <label htmlFor="fecNac" className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Nacimiento
                                </label>
                                <input
                                    type="date"
                                    id="fecNac"
                                    disabled={!isClienteSelected}
                                    required={isClienteSelected}
                                    value={formatDateForInput(personaDTO.cliente.fecNac)}
                                    onChange={(e) => updateCliente("fecNac", e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString())}
                                    onKeyDown={handleEnterDown}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label htmlFor="fecNac" className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Admision
                                </label>
                                <input
                                    type="date"
                                    id="fechaAd"
                                    disabled={!isClienteSelected}
                                    required={isClienteSelected}
                                    value={formatDateForInput(personaDTO.cliente.fechaAd)}
                                    onChange={(e) => updateCliente("fechaAd", e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString())}
                                    onKeyDown={handleEnterDown}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <div>
                            <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-1">
                                Departamento *
                            </label>
                            <select
                                id="departamento"
                                disabled={!isProveedorSelected && !isClienteSelected}
                                required={isProveedorSelected || isClienteSelected}
                                value={personaDTO.persona.departamento}
                                onChange={(e) => {
                                    updatePersona("departamento", Number.parseInt(e.target.value))
                                    updateCliente("departamento", Number.parseInt(e.target.value))
                                }}
                                onKeyDown={handleEnterDown}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value={0}>Seleccionar departamento</option>
                                {Departamentos?.map((depto: any) => (
                                    <option key={depto.id} value={depto.id}>
                                        {depto.descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Autocomplete<Ciudad>
                                data={Ciudades || []}
                                value={Ciudades?.find(ciudad => ciudad.id === personaDTO.persona.ciudad) || null}
                                onChange={(ciudad) => {
                                    updatePersona("ciudad", ciudad?.id ?? 0)
                                    updateCliente("ciudad", ciudad?.id ?? 0)
                                    updateProveedor("ciudad", ciudad?.id ?? 0)
                                }}
                                displayField="descripcion"
                                searchFields={["descripcion", "id"]}
                                additionalFields={[
                                    { field: "id", label: "Codigo" },
                                    { field: "descripcion", label: "Ciudad" }
                                ]}
                                label="Ciudad *"
                                isLoading={isLoadingCiudades}
                                isError={isErrorCiudades}
                                errorMessage="Error al cargar las ciudades"
                                disabled={isLoadingCiudades}
                            />
                        </div>
                        <div className="flex flex-row gap-2 w-full">
                            <Autocomplete<Zona>
                                data={Zonas || []}
                                value={Zonas?.find(zona => zona.codigo === personaDTO.persona.zona) || null}
                                onChange={(zona) => {
                                    updatePersona("zona", zona?.codigo ?? 1)
                                    updateCliente("zona", zona?.codigo ?? 1)
                                    updateProveedor("zonaId", zona?.codigo ?? 1)
                                }}
                                displayField="descripcion"
                                searchFields={["descripcion", "codigo"]}
                                additionalFields={[
                                    { field: "codigo", label: "Codigo" },
                                    { field: "descripcion", label: "Zona" }
                                ]}
                                label="Zona *"
                                isLoading={isLoadingCiudades}
                                isError={isErrorCiudades}
                                errorMessage="Error al cargar las zonas"
                                disabled={isLoadingCiudades}
                            />
                        </div>
                        <div className="flex flex-row gap-2 w-full">
                            <div className="flex flex-col flex-1">
                                <label htmlFor="clienteMoneda" className="block text-sm font-medium text-gray-700 mb-1">
                                    Moneda *
                                </label>
                                <select
                                    id="clienteMoneda"
                                    disabled={!isProveedorSelected && !isClienteSelected}
                                    required={isProveedorSelected || isClienteSelected}
                                    value={personaDTO.persona.moneda}
                                    onChange={(e) => {
                                        updatePersona("moneda", Number.parseInt(e.target.value))
                                        updateCliente("moneda", Number.parseInt(e.target.value))
                                        updateProveedor("moneda", Number.parseInt(e.target.value))
                                    }}
                                    onKeyDown={handleEnterDown}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={0}>Seleccionar moneda</option>
                                    {Monedas?.map((moneda: any) => (
                                        <option key={moneda.moCodigo} value={moneda.moCodigo}>
                                            {moneda.moDescripcion}
                                        </option>
                                    ))}

                                </select>
                            </div>
                            <div className="flex flex-col flex-1">
                                <label htmlFor="plazo" className="block text-sm font-medium text-gray-700 mb-1">
                                    Plazo *
                                </label>
                                <select
                                    id="tipoPlazo"
                                    disabled={!isProveedorSelected && !isClienteSelected}
                                    required={isProveedorSelected || isClienteSelected}
                                    value={personaDTO.cliente.plazo}
                                    onChange={(e) => {
                                        updateCliente("plazo", Number.parseInt(e.target.value))
                                    }}
                                    onKeyDown={handleEnterDown}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={0}>Seleccionar plazo</option>
                                    {tipoPlazoList?.map((plazo: TipoPlazo) => (
                                        <option key={plazo.codigo} value={plazo.codigo}>
                                            {plazo.descripcion}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 w-full">
                            <label htmlFor="observacion" className="block text-md font-bold text-gray-700 mb-1">
                                Observaciones
                            </label>
                            <textarea
                                id="observacion"
                                value={personaDTO.persona.observacion}
                                onChange={(e) => updatePersona("observacion", e.target.value)}
                                onKeyDown={handleEnterDown}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                            />
                        </div>

                    </div>

                </div>
            )
        },
        {
            id: 'datos-cliente',
            label: 'Datos Cliente',
            disabled: !isClienteSelected,
            content: (
                <div className="p-4 flex flex-col gap-4 bg-gray-100 sm:flex-row sm:gap-4">
                    <div className="flex flex-col gap w-full">
                        <div className="flex flex-col flex-1 relative">
                            <label htmlFor="agente" className="block text-sm font-medium text-gray-700 mb-1">
                                Agente de ventas *
                            </label>
                            <input
                                type="text"
                                id="agente"
                                disabled={!isClienteSelected}
                                value={selectedAgente?.op_nombre ?? ""}
                                onClick={() => setIsBuscadorAgentesOpen(true)}
                                onFocus={() => setIsBuscadorAgentesOpen(true)}
                                placeholder="Agente de ventas asignado al cliente"
                                onKeyDown={handleEnterDown}
                                className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {selectedAgente && isClienteSelected && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedAgente(null)}
                                    className="absolute right-4 top-[34px] text-gray-400 hover:text-red-500"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col flex-1 relative">
                            <label htmlFor="vendedor" className="block text-sm font-medium text-gray-700 mb-1">
                                Vendedor asignado al cliente *
                            </label>
                            <input
                                type="text"
                                id="vendedor"
                                disabled={!isClienteSelected}
                                value={selectedVendedor?.op_nombre ?? ""}
                                placeholder="Vendedor asignado al cliente"
                                onClick={() => setIsBuscadorVendedoresOpen(true)}
                                onFocus={() => setIsBuscadorVendedoresOpen(true)}
                                className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {selectedVendedor && isClienteSelected && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedVendedor(null)}
                                    className="absolute right-2 top-[34px] text-gray-400 hover:text-red-500"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col flex-1 relative">
                            <label htmlFor="cobrador" className="block text-sm font-medium text-gray-700 mb-1">
                                Cobrador asignado al cliente *
                            </label>
                            <input
                                type="text"
                                id="cobrador"
                                disabled={!isClienteSelected}
                                value={selectedCobrador?.op_nombre ?? ""}
                                onClick={() => setIsBuscadorCobradorOpen(true)}
                                placeholder="Cobrador asignado al cliente"
                                onFocus={() => setIsBuscadorCobradorOpen(true)}
                                className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {selectedCobrador && isClienteSelected && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedCobrador(null)}
                                    className="absolute right-2 top-[34px] text-gray-400 hover:text-red-500"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <div>
                            <label htmlFor="condicion" className="block text-sm font-medium text-gray-700 mb-1">
                                Condición de venta *
                            </label>
                            <div className="flex flex-row gap-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2">
                                <input
                                    type="radio"
                                    id="contado"
                                    name="condicion"
                                    checked={personaDTO.cliente.condicion === 0}
                                    disabled={!isClienteSelected}
                                    onChange={() => updateCliente("condicion", 0)}
                                    onKeyDown={handleEnterDown}

                                />
                                <label htmlFor="contado">Contado</label>
                                <input
                                    type="radio"
                                    id="credito"
                                    name="condicion"
                                    checked={personaDTO.cliente.condicion === 1}
                                    disabled={!isClienteSelected}
                                    onChange={() => updateCliente("condicion", 1)}
                                    onKeyDown={handleEnterDown}
                                />
                                <label htmlFor="credito">Crédito</label>
                                <input
                                    type="radio"
                                    id="inhabilitado"
                                    name="condicion"
                                    checked={personaDTO.cliente.condicion === 2}
                                    disabled={!isClienteSelected}
                                    onChange={() => updateCliente("condicion", 2)}
                                    onKeyDown={handleEnterDown}
                                />
                                <label htmlFor="inhabilitado">Inhabilitado</label>
                            </div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <input type="checkbox" id="consultar" name="consultar" disabled={!isClienteSelected} onChange={() => {
                                updateCliente("consultar", personaDTO.cliente.consultar === 1 ? 0 : 1)
                            }} value={personaDTO.cliente.consultar} onKeyDown={handleEnterDown} />
                            <label htmlFor="consultar">Consultar en administracion</label>
                        </div>
                        <div className="flex flex-row gap-2">
                            <input type="checkbox" id="exentas" name="exentas" disabled={!isClienteSelected} onChange={() => {
                                updateCliente("exentas", personaDTO.cliente.exentas === 1 ? 0 : 1)
                            }} value={personaDTO.cliente.exentas} onKeyDown={handleEnterDown} />
                            <label htmlFor="exentas">Cliente exentas</label>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="flex flex-row gap-2 items-center">
                                <input type="checkbox" id="credito" value={personaDTO.cliente.credito} disabled={!isClienteSelected} name="credito" onChange={() => {
                                    updateCliente("credito", personaDTO.cliente.credito === 1 ? 0 : 1)
                                }} className="disabled:opacity-50 disabled:cursor-not-allowed" onKeyDown={handleEnterDown} />
                                <label htmlFor="credito" className="text-md font-bold">Credito</label>
                            </div>
                            <div>
                                <label htmlFor="limitecredito" className="block text-sm font-medium text-gray-700 mb-1">Limite de credito *</label>
                                <input type="number" id="limitecredito" name="limitecredito" value={personaDTO.cliente.limiteCredito} disabled={!isClienteSelected} onKeyDown={handleEnterDown}
                                    onChange={(e) => {
                                        updateCliente("limiteCredito", Number.parseInt(e.target.value))
                                    }} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" />
                            </div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <input type="checkbox" id="acuerdo" value={personaDTO.cliente.acuerdo} disabled={!isClienteSelected} name="acuerdo" onChange={() => {
                                updateCliente("acuerdo", personaDTO.cliente.acuerdo === 1 ? 0 : 1)
                            }} className="disabled:opacity-50 disabled:cursor-not-allowed" onKeyDown={handleEnterDown} />
                            <label htmlFor="acuerdo">Acuerdo comercial</label>
                        </div>
                        <div className="flex flex-col flex-1">
                            <label htmlFor="clienteMoneda" className="block text-sm font-medium text-gray-700 mb-1">
                                Grupo
                            </label>
                            <select
                                id="clienteGrupo"
                                disabled={!isClienteSelected}
                                required={isClienteSelected}
                                value={personaDTO.cliente.grupo}
                                onChange={(e) => {
                                    updateCliente("grupo", Number.parseInt(e.target.value))
                                }}
                                onKeyDown={handleEnterDown}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value={0}>Seleccionar grupo</option>
                                {GruposClientes?.map((grupo: GrupoCliente) => (
                                    <option key={grupo.id} value={grupo.id}>
                                        {grupo.descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-4 w-full">
                            <label htmlFor="referencias" className="block text-md font-bold text-gray-700 mb-1">
                                Referencias de cliente
                            </label>
                            <textarea
                                id="referencias"
                                rows={3}
                                disabled={!isClienteSelected}
                                value={personaDTO.cliente.referencias || ""}
                                onKeyDown={handleEnterDown}
                                onChange={(e) => updateCliente("referencias", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex flex-col border border-gray-300 p-2 rounded-md bg-blue-100">
                            <p className="font-semibold text-slate-800 text-sm ">Datos del Codeudor</p>
                            <label htmlFor="nombreCodeudor" className="font-bold text-sm">Nombre</label>
                            <input type="text" name="nombreCodeudor" id="nombreCodeudor" disabled={!isClienteSelected} value={personaDTO.cliente.nombreCod} onChange={(e) => updateCliente('nombreCod', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" onKeyDown={handleEnterDown} />
                            <label htmlFor="documentoCodeudor" className="font-bold text-sm">Documento</label>
                            <input type="text" name="documentoCodeudor" id="documentoCodeudor" disabled={!isClienteSelected} value={personaDTO.cliente.docCod} onChange={(e) => updateCliente('docCod', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" onKeyDown={handleEnterDown} />
                            <label htmlFor="telefonoCodeudor" className="font-bold text-sm">Telefono</label>
                            <input type="text" name="telefonoCodeudor" id="telefonoCodeudor" disabled={!isClienteSelected} value={personaDTO.cliente.telefCod} onChange={(e) => updateCliente('telefCod', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" onKeyDown={handleEnterDown} />
                            <label htmlFor="direccionCodeudor" className="font-bold text-sm">Direccion</label>
                            <input type="text" name="direccionCodeudor" id="direccionCodeudor" disabled={!isClienteSelected} value={personaDTO.cliente.dirCod} onChange={(e) => updateCliente('dirCod', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" onKeyDown={handleEnterDown} />
                        </div>
                        <div className="flex flex-col border-2 border-gray-300 relative p-2 rounded-md bg-blue-100 ">
                            <p className="font-semibold text-slate-800 text-sm ">Datos Adicionales de la Empresa</p>
                            <label htmlFor="nombreGerente" className="font-bold text-sm">Nombre del Gerente</label>
                            <input type="text" name="nombreGerente" id="nombreGerente" disabled={!isClienteSelected} value={personaDTO.cliente.gerente} onChange={(e) => updateCliente('gerente', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" onKeyDown={handleEnterDown} />

                            <label htmlFor="telefonoGerente" className="font-bold text-sm">Linea Telefonica</label>
                            <input onKeyDown={handleEnterDown} type="text" name="telefonoGerente" id="telefonoGerente" disabled={!isClienteSelected} value={personaDTO.cliente.gerTelefono2} onChange={(e) => updateCliente('gerTelefono2', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" />
                            <input onKeyDown={handleEnterDown} type="text" name="telefonoGerente2" id="telefonoGerente2" disabled={!isClienteSelected} value={personaDTO.cliente.gerTelefono} onChange={(e) => updateCliente('gerTelefono', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mt-2" />
                            <label htmlFor="paginaWeb" className="font-bold text-sm">Pagina Web</label>
                            <input onKeyDown={handleEnterDown} type="text" name="paginaWeb" id="paginaWeb" disabled={!isClienteSelected} value={personaDTO.cliente.gerPagina} onChange={(e) => updateCliente('gerPagina', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" />
                            <label htmlFor="gerMail" className="font-bold text-sm">E-mail</label>
                            <input onKeyDown={handleEnterDown} type="text" name="gerMail" id="gerMail" disabled={!isClienteSelected} value={personaDTO.cliente.gerMail} onChange={(e) => updateCliente('gerMail', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" />
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <label htmlFor="sexo" className="font-bold text-sm">Sexo </label>
                            <select onKeyDown={handleEnterDown} name="sexo" id="sexo" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isClienteSelected} value={personaDTO.cliente.sexo} onChange={(e) => updateCliente("sexo", Number.parseInt(e.target.value))}>
                                <option value="M" selected={personaDTO.cliente.sexo === 1} onChange={() => updateCliente("sexo", 0)}>Masculino</option>
                                <option value="F" selected={personaDTO.cliente.sexo === 2} onChange={() => updateCliente("sexo", 1)}>Femenino</option>
                                <option value="NA" selected={personaDTO.cliente.sexo === 3} onChange={() => updateCliente("sexo", 2)}>N/A</option>
                            </select>

                        </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex flex-row gap-2">
                            <input type="checkbox" id="retentor" name="retentor" disabled={!isClienteSelected} onChange={() => {
                                updateCliente("retentor", personaDTO.cliente.agenteRetentor === 1 ? 0 : 1)
                            }} value={personaDTO.cliente.agenteRetentor} onKeyDown={handleEnterDown} />
                            <label htmlFor="retentor">Agente retentor</label>
                        </div>
                        <div className="flex flex-row gap-2">
                            <input type="checkbox" id="permitirDescuentos" name="permitirDescuentos" disabled={!isClienteSelected} onChange={() => {
                                updateCliente("permitirDescuentos", personaDTO.cliente.permitirDesc === 1 ? 0 : 1)
                            }} value={personaDTO.cliente.permitirDesc} onKeyDown={handleEnterDown} />
                            <label htmlFor="permitirDescuentos">Permitir descuentos</label>
                        </div>
                        <div className="flex flex-row gap-2">
                            <input type="checkbox" id="calcMora" name="calcMora" disabled={!isClienteSelected} onChange={() => {
                                updateCliente("calcMora", personaDTO.cliente.calcMora === 1 ? 0 : 1)
                            }} value={personaDTO.cliente.calcMora} onKeyDown={handleEnterDown} />
                            <label htmlFor="calcMora">No calcular interes por mora</label>
                        </div>
                        <div className="flex flex-row gap-2">
                            <input type="checkbox" id="bloquearVendedor" name="bloquearVendedor" disabled={!isClienteSelected} onChange={() => {
                                updateCliente("bloquearVendedor", personaDTO.cliente.bloquearVendedor === 1 ? 0 : 1)
                            }} value={personaDTO.cliente.bloquearVendedor} onKeyDown={handleEnterDown} />
                            <label htmlFor="bloquearVendedor">Bloquear Vendedor en Balcon</label>
                        </div>
                        <div className="flex flex-col gap-2 p-2 justify-center w-full items-center">
                            <p className="text-md font-bold">Lista de precios para cliente *</p>
                            <Autocomplete<ListaPrecio>
                                label=""
                                data={ListaDePrecios || []}
                                value={null} // Siempre null para permitir múltiples selecciones
                                onChange={(option: ListaPrecio | null) => {
                                    if (option) {
                                        updatePrecios(option)
                                    }
                                }}
                                isLoading={isLoadingZonas}
                                isError={isErrorZonas}
                                errorMessage={isErrorZonas ? "Error al cargar los precios" : ""}
                                placeholder="Seleccionar precio"
                                allowCustomValue={true}
                                containerRef={formRef as React.RefObject<HTMLElement>}
                                displayField="lpDescripcion"
                                searchFields={["lpDescripcion", "lpCodigo"]}
                                additionalFields={[
                                    { field: "lpCodigo", label: "Codigo" },
                                    { field: "lpDescripcion", label: "Lista de precios" }
                                ]}
                            />

                            <table className="w-full table-auto border-collapse border border-blue-500 bg-white">
                                <thead>
                                    <tr className="bg-blue-600 text-white">
                                        <th>Codigo</th>
                                        <th>Descripcion</th>
                                        <th>Porcentaje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listaDePreciosSeleccionados?.map((listaPrecio) => (
                                        <tr key={listaPrecio.lpCodigo} className="border border-blue-500">
                                            <td className="px-4 py-2 text-center">{listaPrecio.lpCodigo}</td>
                                            <td className="px-4 py-2 text-left">{listaPrecio.lpDescripcion}</td>
                                            <td className="px-4 py-2 text-center">{listaPrecio.lpPorcentaje}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'datos-proveedor',
            label: 'Datos Proveedor',
            disabled: !isProveedorSelected,
            content: (
                <div className="p-4 flex flex-col gap-4 bg-gray-100" >
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap w-full">
                            <div>
                                <label htmlFor="tipoNac" className="block text-sm font-medium text-gray-700 mb-1">
                                    Procedencia:
                                </label>
                                <select
                                    id="tipoNac"
                                    value={personaDTO.proveedor.tipoNac}
                                    disabled={!isProveedorSelected}
                                    onChange={(e) => updateProveedor("tipoNac", Number.parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value={-1}>Seleccionar procedencia</option>
                                    {procedencias?.map((procedencia) => (
                                        <option key={procedencia.id} value={procedencia.valor}>
                                            {procedencia.descripcion}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="credito" className="block text-sm font-medium text-gray-700 mb-1">
                                    Compra a credito
                                </label>
                                <div className="flex flex-row gap-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <input
                                        type="radio"
                                        id="contado"
                                        name="credito"
                                        value={personaDTO.proveedor.credito}
                                        checked={personaDTO.proveedor.credito === 1}
                                        disabled={!isProveedorSelected}
                                        onChange={() => updateProveedor("credito", 1)}
                                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <label htmlFor="contado">Si</label>
                                    <input
                                        type="radio"
                                        id="contado"
                                        name="credito"
                                        value={personaDTO.proveedor.credito}
                                        checked={personaDTO.proveedor.credito === 0}
                                        disabled={!isProveedorSelected}
                                        onChange={() => updateProveedor("credito", 0)}
                                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <label htmlFor="inhabilitado">No</label>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <input type="checkbox" id="aplicarGasto" name="aplicarGasto" onChange={() => {
                                    updateProveedor("aplicarGasto", personaDTO.proveedor.aplicarGasto === 1 ? 0 : 1)
                                }} className="disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isProveedorSelected} value={personaDTO.proveedor.aplicarGasto} />
                                <label htmlFor="consultar">Aplicar proveedor a gasto</label>
                            </div>
                            <div>
                                <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-1">
                                    Supervisor
                                </label>
                                <input
                                    type="text"
                                    disabled={!isProveedorSelected}
                                    id="supervisor"
                                    value={personaDTO.proveedor.supervisor}
                                    onChange={(e) => updateProveedor("supervisor", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="telefonoSupervisor" className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono Supervisor
                                </label>
                                <input
                                    type="tel"
                                    disabled={!isProveedorSelected}
                                    id="telefonoSupervisor"
                                    value={personaDTO.proveedor.telefonoSupervisor}
                                    onChange={(e) => updateProveedor("telefonoSupervisor", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="vendedor" className="block text-sm font-medium text-gray-700 mb-1">
                                    Vendedor
                                </label>
                                <input
                                    type="text"
                                    disabled={!isProveedorSelected}
                                    id="vendedor"
                                    value={personaDTO.proveedor.vendedor}
                                    onChange={(e) => updateProveedor("vendedor", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="telefonoVendedor" className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono Vendedor
                                </label>
                                <input
                                    type="tel"
                                    id="telefonoVendedor"
                                    disabled={!isProveedorSelected}
                                    value={personaDTO.proveedor.telefonoVendedor}
                                    onChange={(e) => updateProveedor("telefonoVendedor", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div ref={formRef}>
            <div className="max-w-7xl mx-auto  bg-white">
                <div className="bg-white overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-200 px-6 py-4 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Persona</h1>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Selector de Tipos */}
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Tipo de Persona</h3>
                            <div className="flex flex-wrap gap-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        disabled
                                        checked={isOperadorSelected}
                                        onChange={(e) => handleTipoChange("operador", e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Operador</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={isProveedorSelected}
                                        onChange={(e) => handleTipoChange("proveedor", e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Proveedor</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={isClienteSelected}
                                        onChange={(e) => handleTipoChange("cliente", e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Cliente</span>
                                </label>
                            </div>
                            {tiposSeleccionados.length === 0 && (
                                <p className="mt-2 text-sm text-gray-500">Selecciona al menos un tipo de persona para continuar</p>
                            )}
                        </div>
                        <Tabs
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />
                        {/* Formulario de cliente/operador*/}

                        {/* Form Actions */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-4">
                            <button
                                type="button"
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={() => handleVaciarCampos()}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={personaMutation.isPending || tiposSeleccionados.length === 0}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                            >
                                {personaMutation.isPending ? "Guardando..." : "Guardar Persona"}
                            </button>
                        </div>
                    </form>
                </div>
                <ModalVendedores
                    isOpen={isBuscadorVendedoresOpen}
                    onSelect={(vendedor: any) => handleSelectVendedor(vendedor)}
                    setIsOpen={setIsBuscadorVendedoresOpen}
                />
                <ModalVendedores
                    isOpen={isBuscadorAgentesOpen}
                    onSelect={(agente: any) => handleSelectedAgente(agente)}
                    setIsOpen={setIsBuscadorVendedoresOpen}
                />
                <ModalVendedores
                    isOpen={isBuscadorCobradorOpen}
                    onSelect={(cobrador: any) => handleSelectedCobrador(cobrador)}
                    setIsOpen={setIsBuscadorCobradorOpen}
                />
            </div>
        </div>
    )
}

export default CrearPersonaForm
