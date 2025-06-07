import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServicesTypes } from '../interfaces/servicesTypes.interface';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Service } from '../interfaces/service.interface';
import { ServiceTemplate } from '../interfaces/service-template'
import { response } from 'express';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {

  private baseURL: string = environment.baseURL!;

  constructor(private httpClient: HttpClient) { }

  get servicesTypes(): Observable<ServicesTypes[]> {
    return this.httpClient.get<any>(`${this.baseURL}/services/types`)
    .pipe(
      map(response => response.data)
    );
  }

  pendingServices(): Observable<Service[]> {
    const token = localStorage.getItem('token');
    return this.httpClient.get<any>(`${this.baseURL}/services/${token}/pending`)
    .pipe(
      map(response => response.data)
    );
  }

  serviceHistory(): Observable<Service[]> {
    const token = localStorage.getItem('token');
    return this.httpClient.get<any>(`${this.baseURL}/services/${token}/history`)
    .pipe(
      map(response => response.data)
    );
  }

  confirmCashPayment(serviceId: string, userRole: string): Observable<Service> {
    const status = userRole == 'client' ? 'emitido' : 'pagado';
    console.log(`${this.baseURL}/services/${serviceId}/confirm-payment`);
    return this.httpClient.put<any>(`${this.baseURL}/services/${serviceId}/confirm-payment`, { status: status })
      .pipe(
        tap(response => console.log(response)),
        map(response => response.data)
      );
  }

  getService(servicioId: string): Observable<Service | null > {
    return this.httpClient.get<any>(`${this.baseURL}/services/${servicioId}`)
    .pipe(
      map(response => response.data),
      catchError((error) => of(null))
    );
  }

  updateServiceStatus(servicioId: string, status: string): Observable<Service> {
    return this.httpClient.put<any>(`${this.baseURL}/services/${servicioId}/estado`, { status })
      .pipe(
        map(response => response.data)
      );
  }

  requestService(serviceData: ServiceTemplate): Observable<Service> {
    return this.httpClient.post<any>(`${this.baseURL}/services`, serviceData)
      .pipe(
        map(response => response.data)
      );
  }

  rateService(servicioId: string, ratingData: { user_id: string, user_rating: number, user_comments: string}): Observable<Service> {
    console.log(ratingData);
    return this.httpClient.put<any>(`${this.baseURL}/services/${servicioId}/valorar`, ratingData)
      .pipe(
        map(response => response.data)
      );
  }



}
