import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class GeocodeService {
  constructor(private http: HttpClient) {}

  geocode(query: string): Observable<any> {
    return this.http.get<any>(`${environment.baseURL}/geocode?q=${encodeURIComponent(query)}`)
    .pipe(
      map((response) => response.data)
    );
  }

  reverseGeocode(lat: number, lng: number): Observable<any> {
    return this.http.get<any>(`${environment.baseURL}/reverse-geocode?lat=${lat}&lng=${lng}`)
    .pipe(
      map((response) => response.data)
    );
  }
}