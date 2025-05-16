export const formatCurrency = (value: number): string => {
  // Redondear a entero
  const roundedValue = Math.round(value);
  
  // Convertir a string y agregar separador de miles
  return roundedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
