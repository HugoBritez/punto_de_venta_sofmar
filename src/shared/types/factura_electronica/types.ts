interface ClienteFS {
  contribuyente: boolean;
  ruc?: string | null;
  razonSocial: string;
  nombreFantasia?: string | null;
  tipoOperacion?: number; //1= B2B, 2= B2C, 3= B2G, 4= B2F Se debe enviar 3=B2G solo si tiene datos de licitacion de la DNCP, caso contrario enviar como 1=B2B*
  direccion?: string | null;
  numeroCasa?: string | null;
  departamento?: number | null;
  departamentoDescripcion?: string | null;
  distrito?: number | null;
  distritoDescripcion?: string | null;
  ciudad?: number | null;
  ciudadDescripcion?: string | null;
  pais: string; //'PRY'
  paisDescripcion: string; //'Paraguay'
  tipoContribuyente?: number; //1=Persona fisica, 2=Persona juridica
  documentoTipo?: number | null;
  documentoNumero?: string | null;
  telefono?: string | null;
  celular?: string | null;
  email?: string | null;
  codigo: number | string;
}

interface UsuarioFS {
  documentoTipo: number;
  documentoNumero: string;
  nombre: string;
  cargo: string;
}

interface FacturaFS {
  presencia: number;
  // Indicador de presencia
  //1= Operación presencial
  //2= Operación electrónica
  //3= Operación telemarketing
  //4= Venta a domicilio
  //5= Operación bancaria
  //6= Operación cíclica
  //9= Otro
  fechaEnvio?: string | null;
}

interface CondicionEntregaFS {
  tipo: number; // 1- Efectivo, 2- Cheque, 3- Tarjeta de credito, 4- Tarjeta de debito
  monto: string;
  moneda: string;
  monedaDescripcion?: string;
  cambio?: number;
  infoTarjeta?: InfoTarjetaFS;
  infoCheque?: InfoChequeFS;
}

interface InfoTarjetaFS {
  tipo: number; // 1-Visa, 2-Mastercard, 3-American Express, 4-Maestro, 5-Panal, 6-Cabal, 99- otro
  tipoDescripcion?: string;
  numero?: string;
  titular?: string;
  ruc?: string;
  razonSocial?: string;
  medioPago: number; //1-POS, 2-Pago Electronico, 9- Otro
}

interface InfoChequeFS {
  numeroCheque: string;
  banco: string;
}

interface InfoCuotasFS {
  moneda: string;
  monto: number;
  vencimiento?: string;
}

interface CondicionCreditoFS {
  tipo: number; //1- Plazo, 2- Cuota
  plazo?: string;
  cuotas?: number;
  montoEntrega?: number;
  infoCuotas?: InfoCuotasFS[];
}

interface CondicionFS {
  tipo: number; // 1-contado 2-credito
  entregas: CondicionEntregaFS[];
  credito?: CondicionCreditoFS | null;
}

interface ItemFS {
  codigo: number;
  descripcion: string;
  observacion?: string;
  partidaArancelaria?: string;
  unidadMedida: number;
  cantidad: number;
  precioUnitario: number;
  cambio?: number;
  descuento?: number;
  anticipo?: number;
  pais?: string;
  paisDescripcion?: string;
  ivaTipo: number; // 1- Gravado IVA, 2- Exonerado 3- Exento, 4- Gravado parcial
  ivaBase: number;
  iva: number; // 0, 5 o 10
  lote?: string;
  vencimiento?: string;
}

 export interface FacturaSendResponse {
  tipoDocumento: number;
  establecimiento: string | number;
  punto: string | number;
  numero: string | number;
  descripcion?: string;
  observacion?: string;
  fecha: string;
  tipoEmision?: number;
  tipoTransaccion?: number;
  tipoImpuesto: number; //1=IVA. 2=ISC. 3=Renta. 4=Ninguno. 5=IVA - Renta
  moneda?: string;
  condicionAnticipo?: number | null;
  condicionTipoCambio?: number | null;
  cambio?: number | null;
  cliente: ClienteFS;
  usuario: UsuarioFS;
  factura: FacturaFS;
  condicion: CondicionFS;
  items: ItemFS[];
  cdc?: string;
}

export interface DatosFacturaElectronica {
  c_codigo: number;
  c_desc_nombre: string;
  c_desc_fantasia: string;
  c_ruc: string;
  c_direccion: string;
  c_telefono: string;
  c_ciudad: number;
  c_sucursal: number;
  c_correo: string;
  c_descr_establecimiento: string;
  c_dato_establecimiento: string;
  parametros: ParametrosFacturaElectronica[];
}

export interface ParametrosFacturaElectronica {
  api_key: string;
  api_url_crear: string;
  api_url_cancelar: string;
  api_url_eliminar: string;
  api_url_inutilizar: string;
}
