export interface OportunidadCRM {
  codigo: number;
  cliente: number;
  titulo?: string;
  descripcion?: string;
  valorNegociacion: number;
  fechaInicio: Date;
  fechaFin?: Date;
  operador: number;
  estado: number;
  general: number;
}

export interface OportunidadViewModel extends OportunidadCRM {
  clienteNombre : string;
  operadorNombre: string;
  estadoDescripcion: string;
}

// Tipo para crear una nueva oportunidad (sin el código que se genera automáticamente)
export interface CrearOportunidadCRM {
  cliente: number;
  titulo?: string;
  descripcion?: string;
  valorNegociacion: number;
  fechaInicio: Date;
  fechaFin?: Date;
  operador: number;
  estado: number;
  general: number;
}

// Tipo para actualizar una oportunidad (todos los campos opcionales)
export interface ActualizarOportunidadCRM {
  codigo: number;
  cliente?: number;
  titulo?: string;
  descripcion?: string;
  valorNegociacion?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  operador?: number;
  estado?: number;
  general?: number;
}


export interface EstadoCRM {
  id: string;
  descripcions: string;
}