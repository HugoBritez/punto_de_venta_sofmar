import { useState } from "react";
import { direccionesApi } from "../services/direccionesApi";
import {
  ItemsPorDireccion,
  ItemsPorDireccionDTO,
  UbicacionDTO,
} from "../types/ubicaciones.type";


export const useItemsPorDireccion = () => {
  const [itemsPorDireccion, setItemsPorDireccion] = useState<
    ItemsPorDireccion[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCrearItemsPorDireccion, setErrorCrearItemsPorDireccion] =
    useState<string | null>(null);
  const [loadingCrearItemsPorDireccion, setLoadingCrearItemsPorDireccion] =
    useState(false);
  const [errorEliminarItemsPorDireccion, setErrorEliminarItemsPorDireccion] =
    useState<string | null>(null);
  const [loadingEliminarItemsPorDireccion, setLoadingEliminarItemsPorDireccion] =
    useState(false);


  const obtenerItemsPorDireccion = async (
    rango?: UbicacionDTO,
    busqueda?: string
  ) => {
    try {
      setLoading(true);
      const response = await direccionesApi.obtenerItemsPorDireccion(
        rango,
        busqueda
      );
      setItemsPorDireccion(response);
      setLoading(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al obtener los items por direccion"
      );
      setLoading(false);
    }
  };

  const crearItemsPorDireccion = async (datos: ItemsPorDireccionDTO) => {
    try {
      if(!datos) {
        setErrorCrearItemsPorDireccion("No hay datos para crear");
        return;
      }
      if(datos.rango.d_calle_inicial ===  ''){
        setErrorCrearItemsPorDireccion("La calle inicial es requerida");
        return;
      }
      if(datos.rango.d_calle_final ===  ''){
        setErrorCrearItemsPorDireccion("La calle final es requerida");
        return;
      }
      if(datos.rango.d_predio_inicial ===  0){
        setErrorCrearItemsPorDireccion("El predio inicial es requerido");
        return;
      }
      if(datos.rango.d_predio_final ===  0){
        setErrorCrearItemsPorDireccion("El predio final es requerido");
        return;
      }
      if(datos.rango.d_piso_inicial ===  0){
        setErrorCrearItemsPorDireccion("El piso inicial es requerido");
        return;
      }
      if(datos.rango.d_piso_final ===  0){
        setErrorCrearItemsPorDireccion("El piso final es requerido");
        return;
      }
      if(datos.rango.d_direccion_inicial ===  0){
        setErrorCrearItemsPorDireccion("La direccion inicial es requerida");
        return;
      }
      if(datos.rango.d_direccion_final ===  0){
        setErrorCrearItemsPorDireccion("La direccion final es requerida");
        return;
      }
      if (datos.rango.d_calle_inicial > datos.rango.d_calle_final) {
        setErrorCrearItemsPorDireccion("La calle inicial no puede ser mayor que la final");
        return;
      }
      if (datos.rango.d_predio_inicial > datos.rango.d_predio_final) {
        setErrorCrearItemsPorDireccion("El predio inicial no puede ser mayor que el final");
        return;
      }
      if (datos.rango.d_piso_inicial > datos.rango.d_piso_final) {
        setErrorCrearItemsPorDireccion("El piso inicial no puede ser mayor que el final");
        return;
      }
      if (datos.rango.d_direccion_inicial > datos.rango.d_direccion_final) {
        setErrorCrearItemsPorDireccion("La direccion inicial no puede ser mayor que la final");
        return;
      } 
      setLoadingCrearItemsPorDireccion(true);
      const response = await direccionesApi.crearItemsPorDireccion(datos);
      setItemsPorDireccion(response);
      setLoadingCrearItemsPorDireccion(false);
    } catch (error) {
      setErrorCrearItemsPorDireccion(
        error instanceof Error
          ? error.message
          : "Error al crear los items por direccion"
      );
      setLoadingCrearItemsPorDireccion(false);
    }
  };

  const eliminarItemsPorDireccion = async (rango: Omit<UbicacionDTO, 'd_tipo_direccion' | 'd_estado'>, articulo: number) => {
    try {
      if(!rango || rango.d_calle_inicial === '' || rango.d_calle_final === '' ) {
        setErrorEliminarItemsPorDireccion("No hay rango de direcciones para eliminar");
        return;
      }
      setLoadingEliminarItemsPorDireccion(true);
      console.log('rango en hook', rango);
      const response = await direccionesApi.eliminarItemsPorDireccion(rango, articulo);
      setItemsPorDireccion(response);
      setLoadingEliminarItemsPorDireccion(false);
    } catch (error) {
      setErrorEliminarItemsPorDireccion(
        error instanceof Error
          ? error.message
          : "Error al eliminar los items por direccion"
      );
      setLoadingEliminarItemsPorDireccion(false);
    }
  };

  return {
    itemsPorDireccion,
    loading,
    error,
    errorCrearItemsPorDireccion,
    loadingCrearItemsPorDireccion,
    obtenerItemsPorDireccion,
    crearItemsPorDireccion,
    eliminarItemsPorDireccion,
    errorEliminarItemsPorDireccion,
    loadingEliminarItemsPorDireccion,
  };
};
