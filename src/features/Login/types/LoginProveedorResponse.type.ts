export interface LoginProveedor {
    proCodigo: number;
    proRazon: string;
}

export interface LoginProveedorResponse {
    proveedor: LoginProveedor;
    token: string;
    proEsAdmin: number;
}