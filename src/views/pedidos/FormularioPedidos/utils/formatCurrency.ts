export const formatCurrency = (amount: number, moneda: string) => {
  const currencySymbol: { [key: string]: string } = {
    USD: "$",
    PYG: "₲",
  };

  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: moneda === "PYG" ? 0 : 2,
    maximumFractionDigits: moneda === "PYG" ? 0 : 2,
  })
    .format(amount)
    .replace(/\s/g, "")
    .replace(moneda, currencySymbol[moneda]);
};