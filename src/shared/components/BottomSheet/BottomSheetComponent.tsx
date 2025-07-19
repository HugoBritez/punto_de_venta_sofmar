import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface BottomSheetComponentProps {
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    snapPoints?: number[]; // Porcentajes de altura (ej: [25, 50, 90])
    initialSnapPoint?: number; // Índice del snap point inicial
    showBackdrop?: boolean;
    backdropBlur?: boolean;
    className?: string;
}

export const BottomSheetComponent = ({ 
    children, 
    isOpen, 
    onClose, 
    snapPoints = [25, 50, 90],
    initialSnapPoint = 1,
    showBackdrop = true,
    backdropBlur = true,
    className = ""
}: BottomSheetComponentProps) => {
    const [currentSnapPoint, setCurrentSnapPoint] = useState(initialSnapPoint);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const sheetRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const currentY = useRef(0);

    // Gestión de gestos táctiles
    const handleTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
        currentY.current = startY.current;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        
        currentY.current = e.touches[0].clientY;
        const deltaY = currentY.current - startY.current;
        setDragOffset(deltaY);
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;
        
        setIsDragging(false);
        const deltaY = currentY.current - startY.current;
        
        // Determinar el snap point más cercano
        const threshold = 50; // píxeles para cambiar snap point
        
        if (deltaY > threshold && currentSnapPoint > 0) {
            // Arrastrar hacia abajo - snap point anterior
            setCurrentSnapPoint(currentSnapPoint - 1);
        } else if (deltaY < -threshold && currentSnapPoint < snapPoints.length - 1) {
            // Arrastrar hacia arriba - snap point siguiente
            setCurrentSnapPoint(currentSnapPoint + 1);
        } else if (deltaY > 100) {
            // Arrastrar mucho hacia abajo - cerrar
            onClose();
        }
        
        setDragOffset(0);
    };

    // Gestión de teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Resetear snap point cuando se abre
    useEffect(() => {
        if (isOpen) {
            setCurrentSnapPoint(initialSnapPoint);
            setDragOffset(0);
        }
    }, [isOpen, initialSnapPoint]);

    if (!isOpen) return null;

    const currentHeight = snapPoints[currentSnapPoint];
    const transformY = isDragging ? dragOffset : 0;

    const backdropClasses = `
        fixed inset-0 bg-black/40 transition-opacity duration-300
        ${backdropBlur ? 'backdrop-blur-sm' : ''}
        ${isOpen ? 'opacity-100' : 'opacity-0'}
    `;

    const sheetClasses = `
        fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl
        transition-all duration-300 ease-out
        ${isDragging ? 'transition-none' : ''}
        ${className}
    `;

    const dragHandleClasses = `
        w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 mt-3
        transition-colors duration-200
        ${isDragging ? 'bg-gray-400' : ''}
    `;

    return createPortal(
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            {showBackdrop && (
                <div 
                    className={backdropClasses}
                    onClick={onClose}
                />
            )}
            
            {/* Bottom Sheet */}
            <div
                ref={sheetRef}
                className={sheetClasses}
                style={{
                    height: `${currentHeight}vh`,
                    transform: `translateY(${transformY}px)`,
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Drag Handle */}
                <div className="flex justify-center">
                    <div className={dragHandleClasses} />
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};