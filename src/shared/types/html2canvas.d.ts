declare module 'html2canvas' {
    export interface Options {
        scale?: number;
        allowTaint?: boolean;
        backgroundColor?: string;
        canvas?: HTMLCanvasElement;
        foreignObjectRendering?: boolean;
        logging?: boolean;
        imageTimeout?: number;
        ignoreElements?: (element: Element) => boolean;
        onclone?: (document: Document) => void;
        proxy?: string;
        removeContainer?: boolean;
        useCORS?: boolean;
        windowWidth?: number;
        windowHeight?: number;
        scrollX?: number;  // Agregado
        scrollY?: number;  // Por si lo necesitas
        width?: number;    // Agregado
        height?: number;   // Por si lo necesitas
    }

    export default function html2canvas(element: HTMLElement, options?: Options): Promise<HTMLCanvasElement>;
}