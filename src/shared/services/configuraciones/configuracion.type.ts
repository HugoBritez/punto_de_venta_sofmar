export interface Configuracion {
    error: boolean;
    status: number;
    body: Array<{
        id: number;
        descripcion: string;
        valor: string;
    }>;
}