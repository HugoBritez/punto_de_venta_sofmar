import { useState, useRef } from 'react';
import { useCrmFiles } from '../hooks/useCRMFiles';
import { Trash2, FileText, Upload, Eye, X, AlertCircle, Plus } from 'lucide-react';
import { DeleteFileConfirmModal } from './DeleteFileConfirmModal';

interface ArchivoItemProps {
    file: {
        path: string;
        fileName: string;
        size: number;
        contentType: string;
        lastModified: string;
    };
    onPreview: (file: any) => void;
}

const ArchivoItem = ({ file, onPreview }: ArchivoItemProps) => {
    const { getFile } = useCrmFiles();
    const { data: fileBlob, isLoading: isLoadingFile } = getFile(file.path);
    
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFileIcon = (contentType: string) => {
        if (contentType.startsWith('image/')) return '🖼️';
        if (contentType.includes('pdf')) return '📄';
        if (contentType.includes('word') || contentType.includes('document')) return '📝';
        if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '';
        return '📁';
    };

    const isImage = file.contentType.startsWith('image/');
    const imageUrl = fileBlob ? URL.createObjectURL(fileBlob) : null;

    return (
        <div 
            className="group relative p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-200 hover:border-blue-300 cursor-pointer"
            onClick={() => onPreview(file)}
        >
            {/* Indicador de vista previa */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                    <Eye className="h-4 w-4" />
                </div>
            </div>

            {/* Contenido del archivo */}
            <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                    {isImage && imageUrl ? (
                        <div className="relative">
                            <img 
                                src={imageUrl} 
                                alt={file.fileName}
                                className="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                                loading='lazy'
                            />
                            {isLoadingFile && (
                                <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-32 w-32 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-4xl">{getFileIcon(file.contentType)}</span>
                        </div>
                    )}
                </div>
                
                <div className="w-full text-center space-y-2">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight truncate">
                        {file.fileName}
                    </p>
                    <div className="flex flex-col items-center text-xs text-gray-500 space-y-1">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{formatDate(file.lastModified)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modal de vista previa
const PreviewModal = ({ 
    file, 
    isOpen, 
    onClose, 
    onDelete 
}: { 
    file: any; 
    isOpen: boolean; 
    onClose: () => void; 
    onDelete: (path: string) => void;
}) => {
    const { getFile } = useCrmFiles();
    const { data: fileBlob, isLoading } = getFile(file?.path);
    
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isImage = file?.contentType?.startsWith('image/');
    const imageUrl = fileBlob ? URL.createObjectURL(fileBlob) : null;

    if (!isOpen || !file) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header del modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {file.fileName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {formatFileSize(file.size)} • {formatDate(file.lastModified)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onDelete(file.path)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar archivo"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Cerrar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Contenido del modal */}
                <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : isImage && imageUrl ? (
                        <div className="flex justify-center">
                            <img 
                                src={imageUrl} 
                                alt={file.fileName}
                                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm"
                                loading='lazy'
                            />
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📄</div>
                            <p className="text-lg font-medium text-gray-700 mb-2">
                                Vista previa no disponible
                            </p>
                            <p className="text-gray-500">
                                Este tipo de archivo no puede ser previsualizado
                            </p>
                            <button
                                onClick={() => {
                                    // Implementar descarga
                                    console.log('Descargar archivo:', file.path);
                                }}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Descargar archivo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Modal de upload compacto
const UploadModal = ({ 
    isOpen, 
    onClose, 
    onFileSelect, 
    isUploading, 
    uploadProgress,
    uploadError,
    canUploadImage,
    imageCount,
    maxImages
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onFileSelect: (file: File) => void; 
    isUploading: boolean;
    uploadProgress?: number;
    uploadError?: string | null;
    canUploadImage: boolean;
    imageCount: number;
    maxImages: number;
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            onFileSelect(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelect(files[0]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Subir archivo</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Información sobre límite de imágenes */}
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-800">Imágenes: {imageCount}/{maxImages}</span>
                            {!canUploadImage && (
                                <span className="text-red-600 font-medium">Límite alcanzado</span>
                            )}
                        </div>
                    </div>

                    {/* Mostrar error si existe */}
                    {uploadError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <p className="text-sm text-red-800">{uploadError}</p>
                            </div>
                        </div>
                    )}

                    <div
                        className={`p-8 border-2 border-dashed rounded-xl text-center transition-all duration-200 ${
                            isDragOver 
                                ? 'border-blue-400 bg-blue-50' 
                                : 'border-gray-300 hover:border-gray-400'
                        } ${isUploading ? 'opacity-75 pointer-events-none' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {isUploading && uploadProgress !== undefined && (
                            <div className="absolute inset-0 bg-white/90 rounded-xl flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
                                    <p className="text-sm font-medium text-gray-700">Subiendo...</p>
                                    <p className="text-xs text-gray-500">{uploadProgress}%</p>
                                </div>
                            </div>
                        )}
                        
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 mb-2">
                            Arrastra archivos aquí o{' '}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-blue-600 hover:text-blue-500 font-medium"
                            >
                                selecciona un archivo
                            </button>
                        </p>
                        <p className="text-xs text-gray-500">
                            PNG, JPG, PDF, DOC hasta 100MB
                        </p>
                        {!canUploadImage && (
                            <p className="text-xs text-red-500 mt-2">
                                ⚠️ No se pueden subir más imágenes
                            </p>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileInput}
                        accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                    />
                </div>
            </div>
        </div>
    );
};

export const ArchivosTab = ({proyecto}:{proyecto:string}) => {
    const { getFiles, uploadFile, deleteFile } = useCrmFiles();
    
    const { data: files = [], isLoading, error } = getFiles(proyecto);
    const { mutate: uploadFileMutation, isPending: isUploading } = uploadFile;
    const { mutate: deleteFileMutation, isPending: isDeleting } = deleteFile;

    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [previewFile, setPreviewFile] = useState<any>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [deleteModalState, setDeleteModalState] = useState<{
        isOpen: boolean;
        filePath: string;
        fileName: string;
    }>({
        isOpen: false,
        filePath: '',
        fileName: ''
    });

    // Contar imágenes existentes
    const imageFiles = files.filter(file => file.contentType.startsWith('image/'));
    const imageCount = imageFiles.length;
    const maxImages = 10;
    const canUploadImage = imageCount < maxImages;

    const handleFileUpload = (file: File) => {
        // Validar si es una imagen y si se puede subir
        if (file.type.startsWith('image/') && !canUploadImage) {
            setUploadError(`No se pueden subir más de ${maxImages} imágenes por proyecto. Actualmente tienes ${imageCount} imágenes.`);
            return;
        }

        setUploadError(null);
        setUploadProgress(0);
        uploadFileMutation({ file, folder: `crm/${proyecto}` });
        setIsUploadModalOpen(false);
        
        // Simular progreso
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);
    };

    const handleOpenUploadModal = () => {
        setUploadError(null);
        setIsUploadModalOpen(true);
    };

    const handleFileDelete = (path: string, fileName: string) => {
        setDeleteModalState({
            isOpen: true,
            filePath: path,
            fileName: fileName
        });
    };

    const confirmDelete = () => {
        deleteFileMutation(`${deleteModalState.filePath}`);
        setDeleteModalState({ isOpen: false, filePath: deleteModalState.filePath, fileName: deleteModalState.fileName });
        setIsPreviewOpen(false);
        setPreviewFile(null);
    };

    const closeDeleteModal = () => {
        setDeleteModalState({ isOpen: false, filePath: '', fileName: '' });
    };

    const handleFilePreview = (file: any) => {
        setPreviewFile(file);
        setIsPreviewOpen(true);
    };

    const closePreview = () => {
        setIsPreviewOpen(false);
        setPreviewFile(null);
    };

    if (error) {
        return (
            <div className="p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <p className="text-red-600 font-medium">Error al cargar los archivos</p>
                <p className="text-gray-500 text-sm mt-2">Intenta recargar la página</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Archivos</h3>
                <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">
                        {files.length} archivo{files.length !== 1 ? 's' : ''}
                        {imageCount > 0 && (
                            <span className="ml-2 text-blue-600">
                                ({imageCount}/{maxImages} imágenes)
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleOpenUploadModal}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
                            !canUploadImage 
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        disabled={!canUploadImage}
                        title={!canUploadImage ? `Límite de ${maxImages} imágenes alcanzado` : 'Subir archivo'}
                    >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">Subir archivo</span>
                    </button>
                </div>
            </div>

            {/* Mostrar advertencia si se alcanzó el límite de imágenes */}
            {!canUploadImage && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                            Has alcanzado el límite de {maxImages} imágenes para este proyecto. 
                            Elimina algunas imágenes antes de subir nuevas.
                        </p>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Cargando archivos...</p>
                </div>
            ) : files.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-400">No hay archivos</p>
                    <p className="text-sm text-gray-400 mt-1 mb-4">Sube tu primer archivo para comenzar</p>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">Subir archivo</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6 overflow-y-auto max-h-[500px]">
                    {files.map((file) => (
                        <ArchivoItem
                            key={file.path}
                            file={file}
                            onPreview={handleFilePreview}
                        />
                    ))}
                </div>
            )}

            {/* Modales */}
            <PreviewModal
                file={previewFile}
                isOpen={isPreviewOpen}
                onClose={closePreview}
                onDelete={(path) => handleFileDelete(path, previewFile?.fileName || '')}
            />
            
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setUploadError(null);
                }}
                onFileSelect={handleFileUpload}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                uploadError={uploadError}
                canUploadImage={canUploadImage}
                imageCount={imageCount}
                maxImages={maxImages}
            />

            <DeleteFileConfirmModal
                isOpen={deleteModalState.isOpen}
                onClose={closeDeleteModal}
                onDelete={confirmDelete}
                fileName={deleteModalState.fileName}
                isLoading={isDeleting}
            />
        </div>
    );
};