import api from "@/config/axios";

interface FileResponse {
    fileName: string;  // Cambié 'name' por 'fileName' para que coincida con el backend
    path: string;
    size: number;
    contentType: string;  // Cambié 'type' por 'contentType'
    lastModified: string;  // Cambié 'uploadedAt' por 'lastModified'
}

interface UploadResponse {
    path: string;
    fileName: string;
    size: number;
}

export const crmFilesApi = {
    getFiles: async (folder: string = "crm"): Promise<FileResponse[]> => {
        const response = await api.get(`crm/files?folder=${folder}`);
        console.log(response.data);
        return response.data.body;  // El backend devuelve directamente el array
    },

    getFile: async (path: string): Promise<Blob> => {
            const response = await api.get(`crm/files/${path}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    uploadFile: async (
        file: File,
        folder: string = "crm"
    ): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append("file", file);
        // No necesitas appendear folder porque ya está en el query parameter
        
        const response = await api.post(`crm/files?folder=${folder}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / (progressEvent.total || 0)
                );
                console.log(`Progreso: ${percentCompleted}%`);
            }
        });
        return response.data;  // El backend devuelve directamente el objeto
    },

    deleteFile: async (path: string): Promise<boolean> => {
        const response = await api.delete(`crm/files/${path}`);
        return response.status === 204;
    }
};