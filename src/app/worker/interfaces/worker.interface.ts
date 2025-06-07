import { User } from "../../auth/interfaces/user.interface";

export interface Worker {
  id:               string;
  dni:              string;
  user_id:          string;
  bio:              string;
  services_id:      string;
  horario_semanal:  string;
  disponibilidad:   string;
  rating:           string;
  cantidad_ratings: number;
  active:           number;
  created_at:       Date;
  updated_at:       Date;
  user:             User;
}

export interface Availability {
  dia: number;
  horas: ( string | null )[];
}

export interface WorkerResponse {
  worker: Worker;
  comments: ClientComment[];
}

export interface ClientComment {
  client_id: string;
  client_name: string;
  client_pfp: string;
  client_rating: number;
  client_comments: string;
  service_id: string;
  created_at: string;
}