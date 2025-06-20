export interface PermisoMenu {
    menu_id: number;
    menu_grupo: number;
    menu_orden: number;
    menu_descripcion: string;
    acceso: number;
    crear: number;
    editar: number;
  }
  
  export interface Usuario {
    op_codigo: number;
    op_nombre: string;
    op_sucursal: number;
    op_autorizar: number;
    op_ver_utilidad: number;
    op_ver_proveedor: number;
    op_aplicar_descuento: number;
    op_movimiento: number;
    or_rol: number;
    permisos_menu: PermisoMenu[];
  }
  
  export interface LoginResponse {
    token: string;
    usuario: Usuario[];
  }