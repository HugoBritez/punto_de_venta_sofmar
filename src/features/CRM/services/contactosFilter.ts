// necesitamos filtrar los contactos, hay 3 variables posibles:
// contacto general: pueden ser vistos por todos los usuarios
// contacto no general: solo pueden ser vistos por el usuario que lo creo
// filtro de admin: puede ver todo, incluido los contactos no generales

import { ContactoCRM } from "../types/contactos.type";

export const contactosFilter = (contactos: ContactoCRM[], esAdmin: boolean, operador: number): ContactoCRM[] => {
    const contactosFiltrados = contactos.filter((contacto)=> {
        if(esAdmin){
            return true;
        }
        if(contacto.general === 1){
            return true;
        }
        if(contacto.general === 0 && contacto.operador === operador){
            return true;
        }   
        return false;
    })
    return contactosFiltrados;
}
