// src/features/CRM/services/crmApi.ts
    
import api from "@/config/axios";
import { ContactoCRM, CrearContactoCRM, ActualizarContactoCRM } from "../types/contactos.type";
import { OportunidadCRM, CrearOportunidadCRM, ActualizarOportunidadCRM, OportunidadViewModel, EstadoCRM } from "../types/oportunidades.type";
import { TareaCRM, CrearTareaCRM, ActualizarTareaCRM, TipoTareaCRM } from "../types/tareas.type";
import { AgendamientoCRM, CreateAgendamientoCRMDTO, UpdateAgendamientoCRM } from "../types/agendamientos.type";
import { CreateRecordatorioCRMDTO, RecordatorioViewModel, UpdateRecordatorioCRMDTO } from "../types/recordatorios.type";
import { ColaboradorDTO, ColaboradoresDTO } from "../types/colaboradores.type";

// --- Contactos ---
export const crmApi = {
  // Contactos
  getContactos: async (): Promise<ContactoCRM[]> => {
    const { data } = await api.get("/crm/contactos");
    return data.body;
  },
  getContactoById: async (id: number): Promise<ContactoCRM> => {
    const { data } = await api.get(`/crm/contactos/${id}`);
    return data.body;
  },
  crearContacto: async (contacto: CrearContactoCRM): Promise<ContactoCRM> => {
    const { data } = await api.post("/crm/contactos", contacto);
    console.log("response al crear el contacto", data);
    return data.body;
  },
  actualizarContacto: async (contacto: ActualizarContactoCRM): Promise<ContactoCRM> => {
    const { data } = await api.put("/crm/contactos", contacto);
    return data.body;
  },

  // --- Oportunidades ---
  getOportunidades: async (
    fechaDesde?: Date,
    fechaHasta?: Date,
  ): Promise<OportunidadViewModel[]> => {
    // Convertir fechas al formato ISO que C# puede parsear correctamente
    const params: any = {};
    
    if (fechaDesde) {
      // Para fechaDesde, establecer la hora a 00:00:00
      const fechaDesdeISO = new Date(fechaDesde);
      fechaDesdeISO.setHours(0, 0, 0, 0);
      params.fechaDesde = fechaDesdeISO.toISOString();
    }
    
    if (fechaHasta) {
      // Para fechaHasta, establecer la hora a 23:59:59 para incluir todo el día
      const fechaHastaISO = new Date(fechaHasta);
      fechaHastaISO.setHours(23, 59, 59, 999);
      params.fechaHasta = fechaHastaISO.toISOString();
    }

    const { data } = await api.get("/crm/oportunidades", { params });
    return data.body;
  },
  getOportunidadById: async (id: number): Promise<OportunidadCRM> => {
    const { data } = await api.get(`/crm/oportunidades/${id}`);
    return data.body;
  },
  getOportunidadesByCliente: async (cliente: number): Promise<OportunidadViewModel[]> => {
    const { data } = await api.get(`/crm/oportunidades/cliente/${cliente}`);
    return data.body;
  },
  getOportunidadesByOperador: async (operador: number): Promise<OportunidadViewModel[]> => {
    const { data } = await api.get(`/crm/oportunidades/operador/${operador}`);
    return data.body;
  },
  crearOportunidad: async (oportunidad: CrearOportunidadCRM): Promise<OportunidadCRM> => {
    const { data } = await api.post("/crm/oportunidades", oportunidad);
    return data.body;
  },
  actualizarOportunidad: async (oportunidad: ActualizarOportunidadCRM): Promise<OportunidadCRM> => {
    const { data } = await api.put("/crm/oportunidades", oportunidad);
    return data.body;
  },

  // --- Tareas ---
  getTareas: async (): Promise<TareaCRM[]> => {
    const { data } = await api.get("/crm/tareas");
    return data.body;
  },
  getTareaById: async (id: number): Promise<TareaCRM> => {
    const { data } = await api.get(`/crm/tareas/${id}`);
    return data.body;
  },
  getTareasByOportunidad: async (oportunidad: number): Promise<TareaCRM[]> => {
    const { data } = await api.get(`/crm/tareas/oportunidad/${oportunidad}`);
    return data.body;
  },
  getTareasByOperador: async (operador: number): Promise<TareaCRM[]> => {
    const { data } = await api.get(`/crm/tareas/operador/${operador}`);
    return data.body;
  },
  crearTarea: async (tarea: CrearTareaCRM): Promise<TareaCRM> => {
    const { data } = await api.post("/crm/tareas", tarea);
    return data.body;
  },
  actualizarTarea: async (tarea: ActualizarTareaCRM): Promise<TareaCRM> => {
    const { data } = await api.put("/crm/tareas", tarea);
    return data.body;
  },

  getTareasByContacto: async (contacto: number): Promise<TareaCRM[]> => {
    const { data } = await api.get(`/crm/tareas/contacto/${contacto}`);
    return data.body;
  },

  getTiposTareas: async (): Promise<TipoTareaCRM[]> => {
    const { data } = await api.get("/crm/tipos-tareas");
    return data.body;
  },

    getEstados: async (): Promise<EstadoCRM[]> => {
    const { data } = await api.get(`/crm/estados`);
    return data.body;
  },

  cambiarNombre: async (codigo: string, descripcion: string): Promise<EstadoCRM> => {
    const { data } = await api.put(`/crm/estados/${codigo}`, {
      descripcion: descripcion
    });
    return data.body;
  },

  // --- Agendamientos ---

  getAgendamientos: async (): Promise<AgendamientoCRM[]> => {
    const { data} = await api.get("/crm/agendamientos");
    return data.body;
  },

  getAgendamientoById: async (id: number): Promise<AgendamientoCRM> => {
    const { data } = await api.get(`/crm/agendamientos/${id}`);
    return data.body;
  },

  getAgendamientosByDoctor: async (doctor: number): Promise<AgendamientoCRM[]> => {
    const { data } = await api.get(`/crm/agendamientos/doctor/${doctor}`);
    return data.body;
  },

  getAgendamientosByOperador: async (operador: number): Promise<AgendamientoCRM[]> => {
    const { data } = await api.get(`/crm/agendamientos/operador/${operador}`);
    return data.body;
  },

  crearAgendamiento: async (agendamiento: CreateAgendamientoCRMDTO): Promise<AgendamientoCRM> => {
    const { data } = await api.post("/crm/agendamientos", agendamiento);
    return data.body;
  },

  actualizarAgendamiento: async (agendamiento: UpdateAgendamientoCRM): Promise<AgendamientoCRM> => {
    const { data } = await api.put("/crm/agendamientos", agendamiento);
    return data.body;
  },


  // --- Recordatorios ---

  getRecordatorios: async (): Promise<RecordatorioViewModel[]> => {
    const { data } = await api.get("/crm/recordatorios");
    return data.body;
  },

  getRecordatorioById: async (id: number): Promise<RecordatorioViewModel> => {
    const { data } = await api.get(`/crm/recordatorios/${id}`);
    return data.body;
  },

  crearRecordatorio: async (recordatorio: CreateRecordatorioCRMDTO): Promise<RecordatorioViewModel> => {
    const { data } = await api.post("/crm/recordatorios", recordatorio);
    return data.body;
  },

  actualizarRecordatorio: async (recordatorio: UpdateRecordatorioCRMDTO): Promise<RecordatorioViewModel> => {
    const { data } = await api.put("/crm/recordatorios", recordatorio);
    return data.body;
  },

  // --- Colaboradores ---

  crearColaboradores: async (colaboradores: ColaboradoresDTO) => {
    const { data} = await api.post("/crm/colaboradores", colaboradores);
    return data.body;
  },

  upadteColaborador : async (colaborador: ColaboradorDTO)=> {
    const { data } = await api.put("/crm/colaboradores", colaborador);
    return data.body;
  }

};

export default crmApi;