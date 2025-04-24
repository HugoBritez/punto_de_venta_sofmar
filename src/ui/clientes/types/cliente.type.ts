export interface Cliente {
    cli_codigo : number;
    cli_razon: string;
    cli_descripcion: string;
    cli_ruc: string;
    cli_interno: number;
    cli_ciudad_descripcion: string;
    dep_descripcion: string;
    cli_limitecredito: number;
    deuda_actual: number;
    credito_disponible: number;
    vendedor_cliente: number;
    cli_dir: string;
    cli_tel: string;
    cli_mail: string;
    cli_ci: string;
    estado: number;
}