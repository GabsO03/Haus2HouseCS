// file-upload.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private baseURL = environment.baseURL; // Ajusta la URL de tu backend (por ejemplo, Laravel)

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<string> {
    // Crea un FormData para enviar el archivo al backend
    const formData = new FormData();
    formData.append('profile_photo', file);
 
    // Envía la solicitud al endpoint de tu backend
    return this.http
      .post(`${this.baseURL}/upload-profile-photo`, formData, { responseType: 'text' })
      .pipe(
        map((fileName: string) => {
          fileName = JSON.parse(fileName);
          // Construye la URL completa para acceder a la imagen
          return fileName;
        })
      );
  }
}