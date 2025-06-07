import { User } from "../../auth/interfaces/user.interface";

export interface Client {
    id:                 string;
    user_id:            string;
    stripe_customer_id: string;
    rating:             string;
    cantidad_ratings:   number;
    created_at:         Date;
    updated_at:         Date;
    user:               User;
}

export interface ClientResponse {
  client: Client;
  comments: WorkerComment[];
}

export interface WorkerComment {
  worker_id: string;
  worker_name: string;
  worker_pfp: string;
  worker_rating: number;
  worker_comments: string;
  service_id: string;
  created_at: string;
}