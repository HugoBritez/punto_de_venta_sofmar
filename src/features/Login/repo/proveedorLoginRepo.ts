import api from "@/config/axios";

export const proveedorLoginRepo = async (email: string, ruc: string)=> {
    const response = await api.post(`auth/proveedor/`, {
        email,
        ruc
    })
    console.log("response", response)
    return response.data.body
}