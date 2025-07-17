export interface TareaCRM {
  codigo: number;
  titulo?: string;
  descripcion?: string;
  resultado?: string;
  fecha: Date;
  oportunidad: number;
  tipoTarea: number;
  fechaLimite?: Date;
  estado: number;
}

// Tipo para crear una nueva tarea (sin el código que se genera automáticamente)
export interface CrearTareaCRM {
  titulo?: string;
  descripcion?: string;
  resultado?: string;
  fecha: Date;
  oportunidad: number;
  tipoTarea: number;
  fechaLimite?: Date;
  estado: number;
}

// Tipo para actualizar una tarea (todos los campos opcionales, pero requiere el código)
export interface ActualizarTareaCRM {
  codigo: number;
  titulo?: string;
  descripcion?: string;
  resultado?: string;
  fecha?: Date;
  oportunidad?: number;
  tipoTarea?: number;
  fechaLimite?: Date;
  estado?: number;
}

export interface TipoTareaCRM {
  codigo: number;
  descripcion: string;
}