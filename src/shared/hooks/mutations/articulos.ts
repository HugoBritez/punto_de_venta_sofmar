import { crearArticulo } from "@/shared/api/articulosApi"
import { ArticuloDTO} from "@/shared/types/articulos"
import { useMutation } from "@tanstack/react-query"


export const useCrearArticulo  = () => {
    return useMutation({
        mutationFn: (data: {articulo: ArticuloDTO}) => crearArticulo(data.articulo),
        onError: (error) => {
            console.error('Error al crear articulo:', error)
        }
    })
}