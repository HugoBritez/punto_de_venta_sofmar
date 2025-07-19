import { useQuery } from "@tanstack/react-query";
import { doctoresRepository } from "../../api/doctoresRepository";

export const useGetDoctores = () => {
    return useQuery({
        queryKey: ["doctores"],
        queryFn: doctoresRepository.getDoctores,
    });
};

export const useGetDoctorById = (id: number) => {
    return useQuery({
        queryKey: ["doctor", id],
        queryFn: () => doctoresRepository.getDoctorById(id),
        enabled: !!id,
        refetchOnWindowFocus: false
    });
};