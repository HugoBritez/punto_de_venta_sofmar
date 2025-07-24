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
  autorizadoPor?: number | null;
}

export interface OportunidadViewModel extends OportunidadCRM {
  clienteRuc: string;
  clienteNombre : string;
  operadorNombre: string;
  estadoDescripcion: string;
  colaboradores: ColaboradorViewModel[];
  autorizadoPorNombre?: string;
  autorizadoPorCargo?: string;
}

interface ColaboradorViewModel {
  codigo: number;
  colaborador: number;
  nombre: string
  proyecto: number;
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
  colaboradores?: number[];
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
  autorizadoPor?: number | null;
  colaboradores?: number[];
}


export interface EstadoCRM {
  id: number;
  descripcion: string;
}