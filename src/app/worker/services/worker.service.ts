import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, delay, map, Observable, of, tap } from 'rxjs';
import { Availability, Worker, WorkerResponse } from '../interfaces/worker.interface';
import { User } from '../../auth/interfaces/user.interface';
import { WorkerTemplate } from '../interfaces/workertemplate.interface';
import { Service } from '../../servicio/interfaces/service.interface';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  private baseURL: string = environment.baseURL!;

  constructor(private httpClient: HttpClient) { }

  getWorkers(): Observable<Worker[]> {
    return this.httpClient.get<any>(`${this.baseURL}/workers`)
    .pipe(
      map(response => response.data)
    );
  }

  filterWorkers(query: string): Observable<Worker[]> {
    return this.httpClient.get<any>(`${this.baseURL}/workers/filter?q=${encodeURIComponent(query)}`)
      .pipe(
      map(response => response.data)
    );
  }

  getWorkerById(id: string): Observable<WorkerResponse> {
    return this.httpClient.get<any>(`${this.baseURL}/workers/${id}`)
      .pipe(
        catchError(error => of(undefined)),
        map(response => response.data)
      );
  }

  createWorker(worker: WorkerTemplate): Observable<Worker> {
    return this.httpClient.post<any>(`${this.baseURL}/workers`, worker)
    .pipe(
      map(response => response.data)
    );
  }

  updateWorkerProfile(workerData: WorkerTemplate): Observable<Worker> {
    const userId = localStorage.getItem('token');
    return this.httpClient.put<any>(`${this.baseURL}/workers/${userId}/profile`, workerData)
      .pipe(
        map(response => response.data)
      );
  }

  updateWorkerSchedule(workerId: string, disponibilidad: { horario_semanal: Availability[] }): Observable<Worker> {
    return this.httpClient.put<any>(`${this.baseURL}/workers/${workerId}/schedule`, disponibilidad )
      .pipe(
        map(response => response.data)
      );
  }

  toggleWorkerActivo(workerId: string): Observable<Worker> {
    return this.httpClient.get<any>(`${this.baseURL}/workers/${workerId}/toggleActive`)
      .pipe(
        map(response => response.data)
      );
  }

  getWorkerHorario(workerId: string): Observable<Availability[]> {
    return this.httpClient.get<any>(`${this.baseURL}/workers/${workerId}/schedule`)
      .pipe(
        catchError(error => of(undefined)),
        map(response => JSON.parse(response.data))
      );
  }

  deleteWorker(id: string): Observable<void> {
    return this.httpClient.delete<any>(`${this.baseURL}/workers/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

}