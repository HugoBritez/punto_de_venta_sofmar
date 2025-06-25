import { useNavigate } from "react-router-dom";
import { Tooltip } from "../ToolTip"

interface FormButtonsProps {
    onClickExcel: () => void;
    onClickPDF: () => void;
    onClickLimpiar: () => void;
    isLoading?: {
        excel?: boolean;
        pdf?: boolean;
        limpiar?: boolean;
    };
}

export const FormButtons = ({ 
    onClickExcel, 
    onClickPDF, 
    onClickLimpiar, 
    isLoading = {} 
}: FormButtonsProps) => {
    const navigate = useNavigate()
    return (
        <div className="flex gap-2">
            <Tooltip content="Importar a Excel" position="bottom">
                <button 
                    className="rounded-md p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={onClickExcel}
                    disabled={isLoading.excel}
                >
                    {isLoading.excel ? (
                        <div className="w-10 h-10 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <img src="/excel-icon.svg" alt="Excel" className="w-10 h-10" />
                    )}
                </button>
            </Tooltip>
            <Tooltip content="Exportar a PDF" position="bottom">
                <button 
                    className="rounded-md p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={onClickPDF}
                    disabled={isLoading.pdf}
                >
                    {isLoading.pdf ? (
                        <div className="w-10 h-10 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <img src="/pdf-icon.svg" alt="PDF" className="w-10 h-10" />
                    )}
                </button>
            </Tooltip>
            <Tooltip content="Limpiar filtros" position="bottom">
                <button 
                    className="rounded-md p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={onClickLimpiar}
                    disabled={isLoading.limpiar}
                >
                    {isLoading.limpiar ? (
                        <div className="w-10 h-10 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <img src="/close-icon.svg" alt="Limpiar" className="w-10 h-10" />
                    )}
                </button>
            </Tooltip>
            <Tooltip content="Volver a la página principal" position="bottom">
                <button className="rounded-md p-2 hover:bg-gray-100" onClick={()=> {
                    navigate("/home")
                }}>
                    <img src="/home-icon.svg" alt="Clean" className="w-10 h-10" />
                </button>
            </Tooltip>
        </div>
    )
}