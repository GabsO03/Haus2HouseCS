import { Client } from "../../client/interfaces/client.interface";
import { Worker } from "../../worker/interfaces/worker.interface";
import { ServicesTypes } from "./servicesTypes.interface";

export interface Service {
    client_id:         string;
    worker_id:         string;
    service_type_id:   number;
    description:       string;
    specifications:    string;
    request_time:      Date;
    start_time:        Date;
    duration_hours:    null;
    end_time:          Date;
    client_location:   string;
    worker_location:   null;
    status:            string;
    total_amount:      number;
    payment_method:    'card' | 'cash';
    payment_status:    'pendiente' | 'pagado' | 'emitido';
    payment_stripe_id: null;
    client_rating:     null;
    worker_rating:     null;
    client_comments:   null;
    worker_comments:   null;
    incident_report:   null;
    id:                string;
    updated_at:        Date;
    created_at:        Date;
    client:            Client;
    service_type:      ServicesTypes;
    worker:            Worker;
}
