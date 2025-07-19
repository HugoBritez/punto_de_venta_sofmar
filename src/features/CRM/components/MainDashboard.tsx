import React, { useMemo } from 'react';
import { useAuth } from '@/services/AuthContext';
import { 
  useTareas, 
  useContactos
} from '../hooks/useCRM';
import { 
  TrendingUpIcon, 
  BriefcaseIcon,
  DollarSignIcon,
  CheckCircleIcon,

  BarChart3Icon,
  PieChartIcon,
  ActivityIcon,
  TargetIcon,
  AwardIcon
} from 'lucide-react';
import { OportunidadViewModel } from '../types/oportunidades.type';
// Agregar importaciones para Chart.js
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Registrar los componentes necesarios
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

type MainDashboardProps = {
  oportunidades?: OportunidadViewModel[];
};

export const MainDashboard: React.FC<MainDashboardProps> = ({
  oportunidades: oportunidadesProp,
}) => {
  const auth = useAuth();
  const operador = Number(auth.auth?.userId);
  const esAdmin = auth.auth?.rol === 7;

  // Si se pasan props, úsalos, si no, usa los hooks internos
 

  // Hooks para obtener datos
  const oportunidades = oportunidadesProp;
  const { data: tareas } = useTareas();
  const { data: contactos } = useContactos(operador, esAdmin);

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG'
    }).format(amount);
  };

  // Función para obtener el texto del estado de oportunidad
  const getEstadoOportunidadText = (estado: number): string => {
    switch (estado) {
      case 1: return 'En Planeación';
      case 2: return 'En Negociación';
      case 3: return 'Lograda';
      case 4: return 'Fallada';
      default: return 'Desconocido';
    }
  };

  // Función para obtener el texto del estado de tarea
  const getEstadoTareaText = (estado: number): string => {
    switch (estado) {
      case 0: return 'Pendiente';
      case 1: return 'En Progreso';
      case 2: return 'Completada';
      default: return 'Desconocido';
    }
  };
  
  // Función para obtener el texto del tipo de tarea
  const getTipoTareaText = (tipoTarea: number): string => {
    switch (tipoTarea) {
      case 1: return 'Llamada';
      case 2: return 'Reunión';
      case 3: return 'Email';
      case 4: return 'Seguimiento';
      case 5: return 'Propuesta';
      default: return 'Otro';
    }
  };

  // Cálculos de estadísticas usando useMemo para optimización
  const estadisticas = useMemo(() => {
    if (!oportunidades || !tareas || !contactos) {
      return {
        totalOportunidades: 0,
        oportunidadesLogradas: 0,
        oportunidadesEnNegociacion: 0,
        valorTotalNegociacion: 0,
        valorLogrado: 0,
        tasaExito: 0,
        totalTareas: 0,
        tareasCompletadas: 0,
        tareasPendientes: 0,
        tareasEnProgreso: 0,
        totalContactos: 0,
        contactosClientes: 0,
        contactosProspectos: 0,
        promedioTareasPorOportunidad: 0,
        oportunidadesPorEstado: {},
        tareasPorEstado: {},
        tareasPorTipo: {},
        valorPorEstado: {}
      };
    }

    const totalOportunidades = oportunidades.length;
    const oportunidadesLogradas = oportunidades.filter(op => op.estado === 3).length;
    const oportunidadesEnNegociacion = oportunidades.filter(op => op.estado === 2).length;
    const valorTotalNegociacion = oportunidades.reduce((sum, op) => sum + op.valorNegociacion, 0);
    const valorLogrado = oportunidades
      .filter(op => op.estado === 3)
      .reduce((sum, op) => sum + op.valorNegociacion, 0);
    const tasaExito = totalOportunidades > 0 ? (oportunidadesLogradas / totalOportunidades) * 100 : 0;

    const totalTareas = tareas.length;
    const tareasCompletadas = tareas.filter(t => t.estado === 2).length;
    const tareasPendientes = tareas.filter(t => t.estado === 0).length;
    const tareasEnProgreso = tareas.filter(t => t.estado === 1).length;

    const totalContactos = contactos.length;
    const contactosClientes = contactos.filter(c => c.esCliente === 1).length;
    const contactosProspectos = contactos.filter(c => c.esCliente === 0).length;

    const promedioTareasPorOportunidad = totalOportunidades > 0 ? totalTareas / totalOportunidades : 0;

    // Distribución por estados
    const oportunidadesPorEstado = oportunidades.reduce((acc, op) => {
      const estado = getEstadoOportunidadText(op.estado);
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tareasPorEstado = tareas.reduce((acc, t) => {
      const estado = getEstadoTareaText(t.estado);
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tareasPorTipo = tareas.reduce((acc, t) => {
      const tipo = getTipoTareaText(t.tipoTarea);
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const valorPorEstado = oportunidades.reduce((acc, op) => {
      const estado = getEstadoOportunidadText(op.estado);
      acc[estado] = (acc[estado] || 0) + op.valorNegociacion;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOportunidades,
      oportunidadesLogradas,
      oportunidadesEnNegociacion,
      valorTotalNegociacion,
      valorLogrado,
      tasaExito,
      totalTareas,
      tareasCompletadas,
      tareasPendientes,
      tareasEnProgreso,
      totalContactos,
      contactosClientes,
      contactosProspectos,
      promedioTareasPorOportunidad,
      oportunidadesPorEstado,
      tareasPorEstado,
      tareasPorTipo,
      valorPorEstado
    };
  }, [oportunidades, tareas, contactos]);


  // Configuración del gráfico de dona para oportunidades por estado
  const chartDataOportunidades = useMemo(() => {
    const estados = Object.keys(estadisticas.oportunidadesPorEstado);
    const valores = Object.values(estadisticas.oportunidadesPorEstado);
    
    const colores = [
      'rgba(59, 130, 246, 0.8)',   // Azul
      'rgba(245, 158, 11, 0.8)',   // Amarillo
      'rgba(34, 197, 94, 0.8)',    // Verde
      'rgba(239, 68, 68, 0.8)',    // Rojo
      'rgba(156, 163, 175, 0.8)',  // Gris
    ];

    return {
      labels: estados,
      datasets: [
        {
          data: valores,
          backgroundColor: colores.slice(0, estados.length),
          borderColor: colores.slice(0, estados.length).map(color => color.replace('0.8', '1')),
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  }, [estadisticas.oportunidadesPorEstado]);

  // Configuración del gráfico de líneas para valor por estado
  const chartDataValor = useMemo(() => {
    const estados = Object.keys(estadisticas.valorPorEstado);
    const valores = Object.values(estadisticas.valorPorEstado);
    
    return {
      labels: estados,
      datasets: [
        {
          label: 'Valor por Estado (PYG)',
          data: valores,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [estadisticas.valorPorEstado]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || context.raw;
            if (context.dataset.label?.includes('Valor')) {
              return `${label}: ${formatCurrency(value)}`;
            }
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Valor de Oportunidades por Estado',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="max-w-7xl ">


        {/* Tarjetas de métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Oportunidades */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Oportunidades</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.totalOportunidades}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUpIcon className="w-4 h-4" />
                  {estadisticas.oportunidadesLogradas} logradas
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BriefcaseIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Valor de Negociación */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(estadisticas.valorTotalNegociacion)}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <DollarSignIcon className="w-4 h-4" />
                  {formatCurrency(estadisticas.valorLogrado)} logrado
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSignIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Tasa de Éxito */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.tasaExito.toFixed(1)}%</p>
                <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                  <TargetIcon className="w-4 h-4" />
                  {estadisticas.oportunidadesEnNegociacion} en negociación
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AwardIcon className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Tareas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tareas</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.totalTareas}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <CheckCircleIcon className="w-4 h-4" />
                  {estadisticas.tareasCompletadas} completadas
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <ActivityIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos y estadísticas detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Dona - Oportunidades por Estado */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-600" />
              Distribución de Oportunidades por Estado
            </h3>
            <div className="h-64">
              <Doughnut data={chartDataOportunidades} options={chartOptions} />
            </div>
          </div>

          {/* Gráfico de Líneas - Valor por Estado */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3Icon className="w-5 h-5 text-green-600" />
              Valor de Oportunidades por Estado
            </h3>
            <div className="h-64">
              <Line data={chartDataValor} options={lineChartOptions} />
            </div>
          </div>
        </div>

        {/* Estadísticas adicionales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribución de Tareas por Estado */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-purple-600" />
              Tareas por Estado
            </h3>
            <div className="space-y-3">
              {Object.entries(estadisticas.tareasPorEstado).map(([estado, cantidad]) => (
                <div key={estado} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{estado}</span>
                    <span className="text-sm font-bold text-gray-900">{cantidad}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${estadisticas.totalTareas > 0 ? (cantidad / estadisticas.totalTareas) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribución de Tareas por Tipo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TargetIcon className="w-5 h-5 text-orange-600" />
              Tareas por Tipo
            </h3>
            <div className="space-y-3">
              {Object.entries(estadisticas.tareasPorTipo).map(([tipo, cantidad]) => (
                <div key={tipo} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm font-medium text-gray-700">{tipo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{cantidad}</span>
                    <span className="text-xs text-gray-500">
                      ({((cantidad / estadisticas.totalTareas) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};