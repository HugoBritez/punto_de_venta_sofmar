interface Operador {
    opCodigo: number;
    opNombre: string;
    opDocumento: string;
    opDireccion: string;
    opTelefono: string;
    opEmail: string;
    opFechaIngreso: string;
    opDescuento: number;
    opFechaNacimiento: string;
    opObservacion: string;
    opEstado: number;
    opUsuario: string;
    opSucursal: number;
    opFechaAlta: string;
    opArea: number;
    opComision: number;
    opNumVen: number;
    opMovimiento: number;
    opTipoVendedor: number;
    opVendedorActividad: number;
    opAutorizar: number;
    opDiaCambClave: number;
    opFechaCambioClave: string;
    opVerUtilidad: number;
    opCantidadTurno: number;
    opModificarFecha: number;
    opGraficos: number;
    opAplicarDescuento: number;
    opDescuentoAplicar: number;
    opVerProveedor: number;
    opContrasena: string;
    opUti: number;
    opTipoOperador: number;
    opCliente: number;
  }
  
  interface Zona {
    codigo: number;
    descripcion: string;
    observacion: string;
    estado: number;
    proveedores: string[];
  }
  
  interface Proveedor {
    codigo: number;
    razon: string;
    nombreComun: string;
    ruc: string;
    direccion: string;
    telefono: string;
    mail: string;
    observacion: string;
    moneda: number;
    zonaId: number;
    estado: number;
    paisExtranjero: string;
    plazo: number;
    credito: number;
    tipoNac: number;
    supervisor: string;
    telefonoSupervisor: string;
    vendedor: string;
    telefonoVendedor: string;
    aplicarGasto: number;
    plan: number;
    tipoDoc: number;
    zona: Zona;
  }
  
  interface Cliente {
    codigo: number;
    interno: string;
    razon: string;
    ruc: string;
    ci: string;
    ciudad: number;
    moneda: number;
    barrio: string;
    dir: string;
    tel: string;
    credito: number;
    limiteCredito?: number;
    vendedor: number;
    cobrador: number;
    referencias: string;
    estado: number;
    fechaAd: string;
    descripcion: string;
    condicion: number;
    tipo: number;
    grupo: number;
    plazo: number;
    zona: number;
    llamada: string;
    proxLlamada: string;
    respuesta: string;
    fecNac: string;
    exentas: number;
    mail: string;
    agente: number;
    contrato: number;
    nombreCod: string;
    docCod: string;
    telefCod: string;
    dirCod: string;
    obsDeuda: string;
    moroso: number;
    agenteRetentor: number;
    consultar: number;
    plan: number;
    fechaPago: string;
    departamento: number;
    gerente: string;
    gerTelefono: string;
    gerTelefono2: string;
    gerPagina: string;
    gerMail: string;
    permitirDesc: number;
    calcMora: number;
    bloquearVendedor: number;
    sexo: number;
    tipoDoc: number;
    repetirRuc: number;
    acuerdo: number;
  }
  interface Persona {
    codigo?: number;
    codigoInterno?: string;
    razonSocial?: string;
    nombreFantasia?: string;
    ruc?: string;
    ci?: string;
    tipoDocumento: number;
    departamento: number;
    ciudad?: number;
    direccion?: string;
    barrio?: string;
    zona: number;
    moneda?: number;
    observacion?: string;
    email?: string;
    telefono?: string;
    estado: number;
    fechaCreacion?: string;
    fechaModificacion?: string;
  }
  
  export interface CrearPersonaDTO {
    persona: Persona;
    operador?: Operador;
    proveedor: Proveedor;
    cliente: Cliente;
    tipo: number[]; // [0, 1]
    precios: number[]; // id de los precios asociados al cliente(el back se encarga del resto)
  }


  export interface PersonaViewModel
{
    id: number;
    razonSocial: string;
    codigoInterno: string;
    nombreFantasia: string;
    ruc: string;
    direccion: string;
    telefono: string;
    email: string;
    barrio: string;
    tipo: string;
}


  