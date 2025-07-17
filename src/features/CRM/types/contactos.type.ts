export interface ContactoCRMModel {
  codigo: number;
  nombre?: string;
  eMail?: string;
  telefono?: string;
  ruc?: string;
  notas?: string;
  empresa?: string;
  cargo?: string;
  fechaContacto: Date;
  esCliente: number;
  departamento: number;
  ciudad: number;
  zona: number;
  direccion?: string;
  estado: number;
  general: number;
  operador: number;
  }

export interface ContactoCRM extends ContactoCRMModel {
  departamentoDescripcion: string;
  ciudadDescripcion: string;
  zonaDescripcion: string;
  operadorNombre: string;
}

// Tipo para crear un nuevo contacto (sin el código que se genera automáticamente)
export interface CrearContactoCRM {
  nombre?: string;
  eMail?: string;
  telefono?: string;
  ruc?: string;
  notas?: string;
  empresa?: string;
  cargo?: string;
  fechaContacto: Date;
  esCliente: number;
  departamento: number;
  ciudad: number;
  zona: number;
  direccion?: string;
  estado: number;
  general: number;
  operador: number;
}

// Tipo para actualizar un contacto (todos los campos opcionales)
export interface ActualizarContactoCRM {
  codigo: number;
  nombre?: string;
  eMail?: string;
  telefono?: string;
  ruc?: string;
  notas?: string;
  empresa?: string;
  cargo?: string;
  fechaContacto?: Date;
  esCliente?: number;
  departamento?: number;
  ciudad?: number;
  zona?: number;
  direccion?: string;
  estado?: number;
  general: number;
  operador: number;
}
