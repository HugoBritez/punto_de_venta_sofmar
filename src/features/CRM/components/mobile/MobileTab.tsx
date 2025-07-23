import { useState } from "react"
import { BarChart3, List } from "lucide-react"
import { MainDashboard } from "../MainDashboard"
import { OportunidadViewModel } from "../../types/oportunidades.type"
import { MobileKanbanList } from "./MobileKanbanList"

interface MobileTabProps {
    oportunidades?: OportunidadViewModel[]
    onOportunidadClick?: (oportunidad: OportunidadViewModel) => void
    onOportunidadMove?: (oportunidadId: number, nuevoEstado: number, autorizadoPor: number) => void
}

export const MobileTab = ({ 
    oportunidades = [],
    onOportunidadClick,
    onOportunidadMove 
}: MobileTabProps) => {
    const [activeTab, setActiveTab] = useState<'lista' | 'resumen'>('lista')

    const tabs = [
        {
            id: 'lista' as const,
            label: 'Lista',
            icon: List,
            description: 'Vista de lista con filtros'
        },
        {
            id: 'resumen' as const,
            label: 'Resumen',
            icon: BarChart3,
            description: 'Estadísticas y métricas'
        }
    ]

    const renderContent = () => {
        switch (activeTab) {
            case 'lista':
                return (
                    <MobileKanbanList 
                        oportunidades={oportunidades}
                        onOportunidadClick={onOportunidadClick || (() => {})}
                        onOportunidadMove={onOportunidadMove || (() => {})}
                    />
                )
            
            case 'resumen':
                return <MainDashboard oportunidades={oportunidades} />
            default:
                return null
        }
    }

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contenido */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                {renderContent()}
            </div>
        </div>
    )
}