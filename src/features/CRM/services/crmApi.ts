// src/features/CRM/services/crmApi.ts
    
import api from "@/config/axios";
import { ContactoCRM, CrearContactoCRM, ActualizarContactoCRM } from "../types/contactos.type";
import { OportunidadCRM, CrearOportunidadCRM, ActualizarOportunidadCRM, OportunidadViewModel } from "../types/oportunidades.type";
import { TareaCRM, CrearTareaCRM, ActualizarTareaCRM, TipoTareaCRM } from "../types/tareas.type";

// --- Contactos ---
export const crmApi = {
  // Contactos
  getContactos: async (): Promise<ContactoCRM[]> => {
    const { data } = await api.get("/crm/contactos");
    console.log(data);
    return data.body;
  },
  getContactoById: async (id: number): Promise<ContactoCRM> => {
    const { data } = await api.get(`/crm/contactos/${id}`);
    return data.body;
  },
  crearContacto: async (contacto: CrearContactoCRM): Promise<ContactoCRM> => {
    const { data } = await api.post("/crm/contactos", contacto);
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
};

export default crmApi;