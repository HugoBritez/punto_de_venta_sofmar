// ... imports ...
import * as XLSX from "xlsx";

/**
 * Genera un archivo Excel a partir de un array de objetos genéricos.
 * @param data Array de objetos a exportar.
 * @param fileName Nombre del archivo a generar (sin extensión).
 * @param sheetName Nombre de la hoja dentro del archivo.
 */
export const exportarDatosAExcel = <T extends Record<string, any>>(
    data: T[],
    fileName: string = "Reporte",
    sheetName: string = "Datos"
) => {
    if (!data || data.length === 0) {
        console.warn("No hay datos para exportar.");
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    const firstRow = data[0];
    if (!firstRow) {
        console.warn("No hay datos para exportar.");
        return;
    }

    const keys = Object.keys(firstRow) as (keyof T)[];

    ws["!cols"] = keys.map((key) => ({
        wch: Math.max(
            String(key).length,
            ...data.map((row) => String(row[key] ?? "").length)
        ) + 2,
    }));

    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const fecha = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `${fileName}_${fecha}.xlsx`);
};
