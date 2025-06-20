import { useQuery } from '@tanstack/react-query';
import { getMonedas } from '../../api/monedasApi';


export const monedasKey = {
    all: ['monedas'] as const,
    lists: () => [...monedasKey.all, 'list'] as const,
    list: () => [...monedasKey.lists()] as const,
    details: () => [...monedasKey.all, 'detail'] as const,
    detail: (id: number) => [...monedasKey.details(), id] as const,
};

export const useMonedas = () => {
    return useQuery({
        queryKey: monedasKey.list(),
        queryFn: () => getMonedas(),
        enabled: true,
        refetchOnWindowFocus: false,
    })
}
