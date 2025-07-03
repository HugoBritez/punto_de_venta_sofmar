export const formatCurrency = (amount: number, moneda: string = "PYG") => {
    return new Intl.NumberFormat("es-PY", {
      style: "decimal",
      minimumFractionDigits: moneda === "PYG" ? 0 : 2,
      maximumFractionDigits: moneda === "PYG" ? 0 : 2,
    }).format(amount);
  };