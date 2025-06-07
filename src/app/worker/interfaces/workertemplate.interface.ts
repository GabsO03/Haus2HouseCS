import { Availability } from "./worker.interface";

export interface WorkerTemplate {
    nombre: string;
    email: string;
    telefono?: string | null;
    direccion?: string | null;
    lat: number | null;
    lng: number | null;
    password?: string | null;
    dni: string;
    services_id: number[];
    horario_semanal?: Availability[] | null;
    bio?: string | null;
    active?: boolean;
    profile_photo?: string | null;
  }