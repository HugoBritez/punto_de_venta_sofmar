
export const esAdmin = (rol?: number): boolean => {
    return rol === 7;
}

export const esSupervisor = (rol?: number): boolean => {
    return rol === 11;
}

export const esVendedor = (rol?: number): boolean => {
    return rol === 5;
}

