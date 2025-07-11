import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import logoSofmar from '@/assets/logos/logo_sofmar.png';
import { useLoginProveedores } from '../hooks/useLogin';

export const ProveedorLogin = () => {
    const [email, setEmail] = useState('');
    const [ruc, setRuc] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [formErrors, setFormErrors] = useState<{email?: string, ruc?: string}>({});
    const [generalError, setGeneralError] = useState<string | null>(null);

    const { mutate: loginProveedor, isPending, isSuccess, error } = useLoginProveedores();

    const navigate = useNavigate();

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    React.useEffect(() => {
        if (isSuccess) {
            navigate('/consulta-ventas-proveedores');
        }
    }, [isSuccess, navigate]);

    // Manejar errores del servidor
    React.useEffect(() => {
        if (error) {
            const errorMessage = getErrorMessage(error);
            setGeneralError(errorMessage);
            // Limpiar errores de formulario cuando hay un error general
            setFormErrors({});
        }
    }, [error]);

    // Función para obtener mensaje de error específico
    const getErrorMessage = (error: any): string => {
        if (error?.response?.status === 401) {
            return 'Credenciales incorrectas. Verifique su email y RUC.';
        }
        if (error?.response?.status === 404) {
            return 'Proveedor no encontrado. Verifique sus datos.';
        }
        if (error?.response?.status === 500) {
            return 'Proveedor no encontrado. Verifique sus datos.';
        }
        if (error?.message?.includes('Network Error')) {
            return 'Proveedor no encontrado. Verifique sus datos.';
        }
        return 'Error al iniciar sesión. Intente nuevamente.';
    };

    // Validar formulario
    const validateForm = (): boolean => {
        const errors: {email?: string, ruc?: string} = {};
        
        if (!email.trim()) {
            errors.email = 'El email es requerido';
        }
        
        if (!ruc.trim()) {
            errors.ruc = 'El RUC es requerido';
        } else if (!/^\d{4,15}$/.test(ruc.replace(/\D/g, ''))) {
            errors.ruc = 'Ingrese un RUC válido (4-15 dígitos)';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Limpiar errores cuando el usuario empiece a escribir
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (formErrors.email) {
            setFormErrors(prev => ({ ...prev, email: undefined }));
        }
        if (generalError) {
            setGeneralError(null);
        }
    };

    const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRuc(e.target.value);
        if (formErrors.ruc) {
            setFormErrors(prev => ({ ...prev, ruc: undefined }));
        }
        if (generalError) {
            setGeneralError(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Limpiar errores previos
        setGeneralError(null);
        
        // Validar formulario
        if (!validateForm()) {
            return;
        }
        
        loginProveedor({email, ruc});
    };

    // Componente de mensaje de error
    const ErrorMessage = ({ message }: { message: string }) => (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-red-700">{message}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full h-screen flex items-center justify-center bg-slate-100">
            <div className={`
                flex rounded-md shadow-md bg-white
                ${isMobile ? 'w-full h-full flex-col' : 'w-1/2 h-[70%] flex-row'}
            `}>
                <div 
                    className={`
                        bg-cover bg-center bg-no-repeat
                        ${isMobile ? 'w-full h-[40%]' : 'w-1/2 h-full'}
                        ${isMobile ? 'bg-bottom' : 'bg-center'}
                    `}
                    style={{ backgroundImage: `url(/proveedores.jpg)` }}
                />

                {/* Panel de formulario */}
                <div className={`
                    flex flex-col justify-center items-center
                    ${isMobile ? 'w-full h-[60%] px-2 gap-2 rounded-t-[50px]' : 'w-1/2 h-full p-8 gap-6'}
                `}>
                    {/* Logo */}
                    <img 
                        src={logoSofmar} 
                        alt="Logo Sofmar" 
                        className={isMobile ? 'w-[150px]' : 'w-[250px]'}
                    />

                    {/* Título */}
                    <h1 className={`font-bold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                        Iniciar Sesión como Proveedor
                    </h1>
                    
                    <p className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>
                        Ingrese sus credenciales de proveedor
                    </p>

                    {/* Mensaje de error general */}
                    {generalError && <ErrorMessage message={generalError} />}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        {/* Campo Email */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Email"
                                value={email}
                                onChange={handleEmailChange}
                                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    formErrors.email 
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                        : 'border-gray-300'
                                }`}
                                required
                            />
                            {formErrors.email && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                            )}
                        </div>

                        {/* Campo RUC */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="RUC"
                                value={ruc}
                                onChange={handleRucChange}
                                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    formErrors.ruc 
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                        : 'border-gray-300'
                                }`}
                                required
                            />
                            {formErrors.ruc && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.ruc}</p>
                            )}
                        </div>

                        {/* Botón de envío */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Iniciando sesión...
                                </div>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>

                    {/* Enlace para cambiar a login de usuario */}
                    <p className={`text-center ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 mt-4`}>
                        ¿No eres proveedor?{' '}
                        <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium">
                            Inicia sesión como usuario
                        </Link>
                    </p>

                    {/* Información de contacto */}
                    <div className="text-center mt-4">
                        <p className={`font-bold ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                            Celular: 0971 271 288
                        </p>
                        <p className={`font-bold ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                            E-Mail: administracion@sofmarsistemas.net
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};