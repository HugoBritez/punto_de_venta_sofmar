import { create } from "zustand";
import axios from "axios";
import { api_url } from "../utils";

interface HeaderConfig {
  ancho: string;
  alto: string;
}

interface FacturaConfig {
  tipo_factura: string;
  desc_establecimiento: string;
  dato_establecimiento: string;
  ancho_pag: string;
  alto_pag: string;
  items_p_factura: string;
  cantidad_copias: string;
}

interface NotaConfig {
  header: {
    ancho: string;
    alto: string;
  };
  footer: {
    ancho: string;
    alto: string;
  };
}

interface ConfiguracionesWebStore {
  // Estados separados para cada tipo de configuración
  headerConfig: HeaderConfig | null;
  facturaConfig: FacturaConfig | null;
  notaConfig: NotaConfig | null;
  loading: boolean;
  error: string | null;

  // Acciones
  configuracionesHeaderFactura: () => Promise<void>;
  ajustesFactura: () => Promise<void>;
  configuracionesNotaComun: () => Promise<void>;
  setHeaderConfig: (config: HeaderConfig) => void;
  setFacturaConfig: (config: FacturaConfig) => void;
  setNotaConfig: (config: NotaConfig) => void;
  guardarConfiguracionesHeaderFactura: (datos: HeaderConfig) => Promise<any>;
  guardarAjustesFactura: (datos: FacturaConfig) => Promise<any>;
  guardarConfiguracionesNotaComun: (datos: NotaConfig) => Promise<any>;
}

const configuracionesWebStore = create<ConfiguracionesWebStore>((set) => ({
  headerConfig: null,
  facturaConfig: null,
  notaConfig: null,
  loading: true,
  error: null,

  configuracionesHeaderFactura: async () => {
    try {
      const response = await axios.get(
        `${api_url}configuraciones-web/fotos-factura`
      );
      console.log("Configuraciones cargadas correctamente", response.data);
      if (response.data?.body?.body) {
        set({
          headerConfig: {
            ancho: response.data.body.body.ancho || "120",
            alto: response.data.body.body.alto || "50",
          },
        });
      }
    } catch (error) {
      set({ error: error as string });
    }
  },

  ajustesFactura: async () => {
    try {
      const response = await axios.get(`${api_url}configuraciones-web/factura`);
      if (response.data?.body?.body) {
        const config = response.data.body.body;
        set({
          facturaConfig: {
            tipo_factura: config.tipo_factura || "",
            desc_establecimiento: config.desc_establecimiento || "",
            dato_establecimiento: config.dato_establecimiento || "",
            ancho_pag: config.ancho_pag || "500",
            alto_pag: config.alto_pag || "800",
            items_p_factura: config.items_p_factura || "10",
            cantidad_copias: config.cantidad_copias || "1",
          },
        });
      }
    } catch (error) {
      set({ error: error as string });
    }
  },

  configuracionesNotaComun: async () => {
    try {
      const response = await axios.get(
        `${api_url}configuraciones-web/fotos-nota-comun`
      );
      if (response.data?.body?.body) {
        set({
          notaConfig: {
            header: {
              ancho: response.data.body.body.header?.ancho || "550",
              alto: response.data.body.body.header?.alto || "80",
            },
            footer: {
              ancho: response.data.body.body.footer?.ancho || "550",
              alto: response.data.body.body.footer?.alto || "60",
            },
          },
        });
      }
    } catch (error) {
      set({ error: error as string });
    }
  },

  setHeaderConfig: (config: HeaderConfig) => {
    set({ headerConfig: config });
  },

  setFacturaConfig: (config: FacturaConfig) => {
    set({ facturaConfig: config });
  },

  setNotaConfig: (config: NotaConfig) => {
    set({ notaConfig: config });
  },

  guardarConfiguracionesHeaderFactura: async (datos: HeaderConfig) => {
    try {
      const response = await axios.post(
        `${api_url}configuraciones-web/fotos-factura`,
        datos
      );
      if (response.data?.body?.success) {
        set({ headerConfig: datos });
      }
      return response;
    } catch (error) {
      set({ error: error as string });
      throw error;
    }
  },

  guardarAjustesFactura: async (datos: FacturaConfig) => {
    try {
      const response = await axios.post(
        `${api_url}configuraciones-web/factura`,
        datos
      );
      console.log("Respuesta de ajustes de factura", response.data);
      if (response.data?.body?.success) {
        set({ facturaConfig: datos });
      }
      return response;
    } catch (error) {
      set({ error: error as string });
      throw error;
    }
  },

  guardarConfiguracionesNotaComun: async (datos: NotaConfig) => {
    try {
      const response = await axios.post(
        `${api_url}configuraciones-web/nota-comun`,
        datos
      );
      if (response.data?.body?.success) {
        set({ notaConfig: datos });
      }
      return response;
    } catch (error) {
      set({ error: error as string });
      throw error;
    }
  },
}));

export default configuracionesWebStore;
