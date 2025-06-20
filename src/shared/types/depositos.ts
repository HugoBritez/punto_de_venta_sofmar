export interface GetDepositoDTO {
    sucursal?: number;
    usuario?: number;
    descripcion?: string;
}


export  interface DepositoViewModel {
    dep_codigo: number;
    dep_descripcion: string;
    dep_principal: number;
}

