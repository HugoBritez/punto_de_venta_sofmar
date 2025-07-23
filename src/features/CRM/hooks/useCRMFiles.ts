import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmFilesApi } from '../services/crmFilesApi';

export const useCrmFiles = () => {
    const queryClient = useQueryClient();

    const getFiles = (subPath: string = "") => useQuery({
        queryKey: ['crm-files', subPath],
        queryFn: () => {
            // Construir la ruta completa sin duplicar 'crm'
            const folder = subPath ? `crm/${subPath}` : 'crm';
            return crmFilesApi.getFiles(folder);
        },
        enabled: true
    });

    const getFile = (path: string) => useQuery({
        queryKey: ['crm-file', path],
        queryFn: () => crmFilesApi.getFile(path),
        enabled: !!path && path !== 'undefined', // Solo ejecutar si path existe y no es 'undefined'
        staleTime: 5 * 60 * 1000, // 5 minutos
    });

    const uploadFile = useMutation({
        mutationFn: ({ file, folder = "crm" }: { file: File; folder?: string }) => 
            crmFilesApi.uploadFile(file, folder),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crm-files'] });
            queryClient.invalidateQueries({ queryKey: ['crm-file'] });
        }
    });

    const deleteFile = useMutation({
        mutationFn: (path: string) => crmFilesApi.deleteFile(path), // Usar el path directamente
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crm-files'] });
            queryClient.invalidateQueries({ queryKey: ['crm-file'] });
        }
    });

    return {
        getFiles,
        getFile,
        uploadFile,
        deleteFile
    };
};