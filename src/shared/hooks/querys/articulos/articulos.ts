import { getLotesArticulo } from "@/shared/api/articulosApi"
import { useQuery } from "@tanstack/react-query"

export const useGetLotesArticulo = (articuloId: number)=> {
  return useQuery({
    queryKey: ['lotes-articulo', articuloId],
    queryFn: () => getLotesArticulo(articuloId),
    enabled: !!articuloId
  })
}
