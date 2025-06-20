import { useQuery } from '@tanstack/react-query';
import { getDepositos } from '../../api/depositosApi';
import type { GetDepositoDTO, DepositoViewModel } from '../../types/depositos';

export const depositosKey = {
    all: ['depositos'] as const,
    lists: () => [...depositosKey.all, 'list'] as const,
    list: (params: GetDepositoDTO) => [...depositosKey.lists(), params] as const,
    details: () => [...depositosKey.all, 'detail'] as const,
    detail: (id: number) => [...depositosKey.details(), id] as const,
};

export const useDepositos = (params: GetDepositoDTO = {}) => {
    return useQuery<DepositoViewModel[]>({
        queryKey: depositosKey.list(params),
        queryFn: () => getDepositos(params),
        enabled: true,
        refetchOnWindowFocus: false,
    });
}