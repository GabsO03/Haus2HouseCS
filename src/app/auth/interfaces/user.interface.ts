export interface User {
    id:                string;
    nombre:            string;
    email:             string;
    email_verified_at: null;
    password:          string;
    rol:               string;
    profile_photo:     null;
    telefono:          null;
    direccion:         null;
    latitude:          number | null;
    longitude:         number | null;
    created_at:        Date;
    updated_at:        Date;
}