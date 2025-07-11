import api from "@/config/axios";

export const fetchDepositos = async () => {
  const response = await api.get("depositos/");
  return response.data.body;
};

export const fetchSucursales = async () => {
  const response = await api.get("sucursales/listar");
  return response.data.body;
};

export const fetchUbicaciones = async () => {
  const response = await api.get("ubicaciones/");
  return response.data.body;
};

export const fetchSubUbicaciones = async () => {
  const response = await api.get("sububicaciones/");
  return response.data.body;
};