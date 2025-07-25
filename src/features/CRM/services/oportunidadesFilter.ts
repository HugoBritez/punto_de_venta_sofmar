import { OportunidadViewModel } from "../types/oportunidades.type";

export const oportunidadesFilter = (oportunidades: OportunidadViewModel[], esAdmin: boolean, operador: number): OportunidadViewModel[] => {
    const oportunidadesFiltradas = oportunidades.filter((oportunidad)=> {
        if(esAdmin){
            return true;
        }
        if(oportunidad.general === 1){
            return true;
        }
        if(oportunidad.general ===0 && oportunidad.operador === operador && oportunidad.colaboradores.some(colaborador => colaborador.codigo === operador)){
            return true;
        }

        return false;
    })

    return oportunidadesFiltradas;
}