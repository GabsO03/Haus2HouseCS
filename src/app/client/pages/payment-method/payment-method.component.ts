import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
  selector: 'client-payment-method',
  standalone: false,
  templateUrl: './payment-method.component.html',
  styles: ``
})

export class PaymentMethodComponent implements OnInit {
  public add_payment_method: boolean = false;
  public paymentMethods: any[] = [];
  public hasPaymentMethod: boolean = false;
  public loading: boolean = false;

  constructor(
    private clientService: ClientService
  ) {}

  async ngOnInit(): Promise<void> {
    this.loading = true;
    // Cargar los métodos de pago
    const token = localStorage.getItem('token');
    if (token) {
      this.clientService.getPaymentMethods(token).subscribe(methods => {
        this.paymentMethods = methods;
        this.hasPaymentMethod = methods.length > 0;
        this.loading = false;
      }, error => {
        console.error('Error al cargar métodos de pago:', error);
        this.loading = false;
      });
    }
  }

  change_payment_method() {
    this.add_payment_method = true;
  }

  deletePaymentMethod() {
    Swal.fire({
      title: '¿Eliminar método de pago?',
      text: '¿Estás seguro de que quieres eliminar este método de pago?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6A64F1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'No, mantener',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal2-confirm btn my-bg-teal text-white font-semibold py-2 px-4 rounded-md',
        cancelButton: 'swal2-cancel btn bg-red-500 text-white font-semibold py-2 px-4 rounded-md'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        if (token) {
          this.clientService.deletePaymentMethod(token).subscribe({
            next: (response) => {
              console.log('Método de pago eliminado:', response);
              Swal.fire({
              title: '¡Cancelado!',
              text: 'El servicio ha sido cancelado correctamente',
              icon: 'success',
              confirmButtonColor: '#6A64F1',
              customClass: {
                confirmButton: 'swal2-confirm btn my-bg-teal text-white font-semibold py-2 px-4 rounded-md'
              }
            });
            setTimeout(() => {
              location.reload();
            }, 1000);
            },
            error: (err) => {
              console.error('Error al eliminar método de pago:', err);
            }
          });
        }
      }
    });
  }

}