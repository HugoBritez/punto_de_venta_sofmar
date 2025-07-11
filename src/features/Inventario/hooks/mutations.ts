import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { anularInventario, cerrarInventario, autorizarInventario, createInventario, revertirInventario } from "../api/inventariosApi";
import { createItem } from "../api/itemsApi";

export const useCreateInventario = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    
    return useMutation({
        mutationFn: createInventario,
        onSuccess: () => {
            toast({
                title: "Inventario creado",
                description: "El inventario se ha creado correctamente",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries({ queryKey: ["inventarios"] });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "No se pudo crear el inventario",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            console.error("Error al crear inventario:", error);
        }
    });
}

export const useAnularInventario = () => {    
    const queryClient = useQueryClient();
    const toast = useToast();
    
    return useMutation({
        mutationFn: anularInventario,
        onSuccess: () => {
            toast({
                title: "Inventario anulado",
                description: "El inventario se ha anulado correctamente",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries({ queryKey: ["inventarios"] });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "No se pudo anular el inventario",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            console.error("Error al anular inventario:", error);
        }
    });
}

export const useAutorizarInventario = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    
    return useMutation({
        mutationFn: autorizarInventario,
        onSuccess: () => {
            toast({
                title: "Inventario autorizado",
                description: "El inventario se ha autorizado correctamente",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries({ queryKey: ["inventarios"] });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "No se pudo autorizar el inventario",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            console.error("Error al autorizar inventario:", error);
        }
    });
}

export const useCerrarInventario = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    
    return useMutation({
        mutationFn: cerrarInventario,
        onSuccess: () => {
            toast({
                title: "Inventario cerrado",
                description: "El inventario se ha cerrado correctamente",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries({ queryKey: ["inventarios"] });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "No se pudo cerrar el inventario",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            console.error("Error al cerrar inventario:", error);
        }
    });
}

export const useRevertirInventario = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    
    return useMutation({
        mutationFn: revertirInventario,
        onSuccess: () => {
            toast({
                title: "Inventario revertido",
                description: "El inventario se ha revertido correctamente",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries({ queryKey: ["inventarios"] });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "No se pudo revertir el inventario",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            console.error("Error al revertir inventario:", error);
        }
    });
}

export const useCreateItem = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    
    return useMutation({
        mutationFn: createItem,
        onSuccess: () => {
            toast({
                title: "Item creado",
                description: "El item se ha creado correctamente",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries({ queryKey: ["items"] });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "No se pudo crear el item",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            console.error("Error al crear item:", error);
        }
    });
}