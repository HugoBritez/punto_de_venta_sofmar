
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import crmApi from "../services/crmApi";
import { contactosFilter } from "../services/contactosFilter";
import { oportunidadesFilter } from "../services/oportunidadesFilter";
import { ContactoCRM } from "../types/contactos.type";

// --- Contactos ---
export const useContactos = (operador: number, esAdmin: boolean) => {
  return useQuery<ContactoCRM[]>({
    queryKey: ["contactos"],
    queryFn: crmApi.getContactos,
    select: (data: ContactoCRM[]) => contactosFilter(data, esAdmin, operador),
  });
};

export const useContactoById = (id: number) => {
  return useQuery({
    queryKey: ["contacto", id],
    queryFn: () => crmApi.getContactoById(id),
    enabled: !!id,
  });
};

export const useCrearContacto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: crmApi.crearContacto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactos"] });
    },
  });
};

export const useActualizarContacto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: crmApi.actualizarContacto,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contactos"] });
      queryClient.invalidateQueries({ queryKey: ["contacto", data.codigo] });
    },
  });
};

// --- Oportunidades ---
export const useOportunidades = (esAdmin: boolean, operador: number, fechaDesde?: Date, fechaHasta?: Date) => {
  return useQuery({
    queryKey: ["oportunidades", fechaDesde?.toISOString(), fechaHasta?.toISOString()],
    queryFn: () => crmApi.getOportunidades(fechaDesde, fechaHasta),
    select: (data) => oportunidadesFilter(data, esAdmin, operador),
  });
};


export const useOportunidadesArchivadas = (esAdmin: boolean, operador: number, fechaDesde?: Date, fechaHasta?: Date) => {
  return useQuery({
    queryKey: ["oportunidadesArchivadas", fechaDesde?.toISOString(), fechaHasta?.toISOString()],
    queryFn: ()=>crmApi.getOportunidadesArchivadas(fechaDesde, fechaHasta),
    select: (data) => oportunidadesFilter(data, esAdmin, operador)
  })
}

export const useOportunidadById = (id: number) => {
  return useQuery({
    queryKey: ["oportunidad", id],
    queryFn: () => crmApi.getOportunidadById(id),
    enabled: !!id,
  });
};

export const useOportunidadesByCliente = (cliente: number) => {
  return useQuery({
    queryKey: ["oportunidades", "cliente", cliente],
    queryFn: () => crmApi.getOportunidadesByCliente(cliente),
    enabled: !!cliente,
  });
};

export const useOportunidadesByOperador = (operador: number) => {
  return useQuery({
    queryKey: ["oportunidades", "operador", operador],
    queryFn: () => crmApi.getOportunidadesByOperador(operador),
    enabled: !!operador,
  });
};

export const useCrearOportunidad = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: crmApi.crearOportunidad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oportunidades"] });
    },
  });
};

export const useActualizarOportunidad = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: crmApi.actualizarOportunidad,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["oportunidades"] });
      queryClient.invalidateQueries({ queryKey: ["oportunidadesArchivadas"] });
      queryClient.invalidateQueries({ queryKey: ["oportunidad", data.codigo] });
    },
  });
};

// --- Tareas ---
export const useTareas = () => {
  return useQuery({
    queryKey: ["tareas"],
    queryFn: crmApi.getTareas,
  });
};

export const useTareaById = (id: number) => {
  return useQuery({
    queryKey: ["tarea", id],
    queryFn: () => crmApi.getTareaById(id),
    enabled: !!id,
  });
};

export const useTareasByOportunidad = (oportunidad: number) => {
  return useQuery({
    queryKey: ["tareas", "oportunidad", oportunidad],
    queryFn: () => crmApi.getTareasByOportunidad(oportunidad),
    enabled: !!oportunidad,
  });
};

export const useTareasByOperador = (operador: number) => {
  return useQuery({
    queryKey: ["tareas", "operador", operador],
    queryFn: () => crmApi.getTareasByOperador(operador),
    enabled: !!operador,
  });
};

export const useCrearTarea = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: crmApi.crearTarea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tareas"] });
    },
  });
};

export const useActualizarTarea = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: crmApi.actualizarTarea,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tareas"] });
      queryClient.invalidateQueries({ queryKey: ["tarea", data.codigo] });
    },
  });
};

export const useTareasByContacto = (contacto: number) => {
  return useQuery({
    queryKey: ["tareas", "contacto", contacto],
    queryFn: () => crmApi.getTareasByContacto(contacto),
    enabled: !!contacto,
  });
};

export const useTiposTareas = () => {
  return useQuery({
    queryKey: ["tipos-tareas"],
    queryFn: crmApi.getTiposTareas,
  });
};

// --- Estados ---
export const useEstados = () => {
  return useQuery({
    queryKey: ["estadosCRM"],
    queryFn: crmApi.getEstados,
  });
};

export const useCambiarNombre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codigo, descripcion }: { codigo: number; descripcion: string }) =>
      crmApi.cambiarNombre(codigo, descripcion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estadosCRM", "estados-tablero"] });
    },
  });
};


export const useAgendamientos = () => {
  return useQuery({
    queryKey: ["agendamientos"],
    queryFn: crmApi.getAgendamientos,
  });
};

export const useAgendamientoById = (id: number) => {
  return useQuery({
    queryKey: ["agendamiento", id],
    queryFn: () => crmApi.getAgendamientoById(id),
    enabled: !!id,
    });
};

export const useAgendamientosByDoctor = (doctor: number) => {
  return useQuery({
    queryKey: ["agendamientos", "doctor", doctor],
    queryFn: () => crmApi.getAgendamientosByDoctor(doctor),
    enabled: !!doctor,
  });
};

export const useAgendamientosByOperador = (operador: number) => {
  return useQuery({
    queryKey: ["agendamientos", "operador", operador],
    queryFn: () => crmApi.getAgendamientosByOperador(operador),
    enabled: !!operador,
  });
};

export const useCrearAgendamiento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crmApi.crearAgendamiento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamientos"] });
    },
  });
};

export const useActualizarAgendamiento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crmApi.actualizarAgendamiento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamientos"] });
    },
  });
};


// --- Recordatorios ---

export const useRecordatorios = () => {
  return useQuery({
    queryKey: ["recordatorios"],
    queryFn: crmApi.getRecordatorios,
  });
};

export const useRecordatorioById = (id: number) => {
  return useQuery({
    queryKey: ["recordatorio", id],
    queryFn: () => crmApi.getRecordatorioById(id),
    enabled: !!id,
  });
};

export const useCrearRecordatorio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crmApi.crearRecordatorio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recordatorios"] });
    },
  });
};

export const useActualizarRecordatorio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crmApi.actualizarRecordatorio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recordatorios"] });
    },
  });
};