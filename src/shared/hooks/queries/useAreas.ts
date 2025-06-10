import { useQuery } from "@tanstack/react-query";
import { getAreas } from "@/repos/areasRepository";

export const useAreas = () => {
    return useQuery({
        queryKey: ['areas'],
                  queryFn: ()=> getAreas(),
                  enabled: true,
                  refetchOnWindowFocus: false
    });
}