// import { useState, useEffect } from 'react';

// export const useCommandPalette = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       // Abrir con Ctrl + K o Cmd + K
//       if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
//         e.preventDefault();
//         setIsOpen(true);
//       }
//       // Cerrar con Escape
//       if (e.key === 'Escape') {
//         setIsOpen(false);
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, []);

//   return {
//     isOpen,
//     open: () => setIsOpen(true),
//     close: () => setIsOpen(false),
//     toggle: () => setIsOpen(prev => !prev)
//   };
// }; 