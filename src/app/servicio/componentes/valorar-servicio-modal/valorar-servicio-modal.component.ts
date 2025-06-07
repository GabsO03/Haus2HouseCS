import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServicioService } from '../../services/servicio.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Service } from '../../interfaces/service.interface';

@Component({
  selector: 'servicio-valorar-servicio-modal',
  standalone: false,
  templateUrl: './valorar-servicio-modal.component.html',
  styles: ``
})
export class ValorarServicioModalComponent implements OnInit {

  public rating: number = 0; // Puntuación seleccionada (1-5)
  public comments: string = ''; // Comentario opcional

  @Input()
  servicioId!: string; // ID del servicio a calificar

  constructor(
    private servicioService: ServicioService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    if (!this.servicioId) {
      this.alertService.error('No se pudo cargar el servicio para calificar');
    }
  }

  // Método para seleccionar una puntuación
  selectRating(value: number): void {
    this.rating = value;
  }

  // Método para enviar la calificación
  submitRating(): void {
    if (!this.servicioId) {
      this.alertService.error('Datos incompletos para enviar la calificación');
      return;
    }

    if (this.rating < 1 || this.rating > 5) {
      this.alertService.error('Por favor selecciona una puntuación entre 1 y 5');
      return;
    }

    const userId = localStorage.getItem('token')!;

    const ratingData: { user_id: string, user_rating: number, user_comments: string } = {
      user_id: userId,
      user_comments: this.comments,
      user_rating: this.rating
    };

    this.servicioService.rateService(this.servicioId, ratingData).subscribe({
      next: (service: Service) => {
        this.alertService.success('Calificación enviada con éxito');
        this.closeModal();
      },
      error: (err) => {
        this.alertService.error(err.error.message || 'Error al enviar la calificación');
      }
    });
  }

  // Método para cerrar el modal
  closeModal(): void {
    const modal = document.getElementById('valorarServicioModal');
    if (modal) {
      modal.classList.add('hidden');
    }
    setTimeout(() => {
      location.reload();
    }, 2000);
  }
}