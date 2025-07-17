
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import crmApi from "../services/crmApi";
import { contactosFilter } from "../services/contactosFilter";
import { oportunidadesFilter } from "../services/oportunidadesFilter";

// --- Contactos ---
export const useContactos = (operador: number, esAdmin: boolean) => {
  return useQuery({
    queryKey: ["contactos"],
    queryFn: crmApi.getContactos,
    select: (data) => contactosFilter(data, esAdmin, operador),
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
