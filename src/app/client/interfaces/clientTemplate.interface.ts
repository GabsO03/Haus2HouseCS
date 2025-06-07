export interface ClientTemplate {
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  profile_photo: string | null;
  lat: number | null;
  lng: number | null;
}