export interface ServiceTemplate {
  client_id: string;
  service_type_id: number;
  description: string;
  specifications: string;
  request_time: string;
  start_time: string;
  end_time: string;
  client_location: string;
  total_amount: number;
  payment_method: 'card' | 'cash';
}