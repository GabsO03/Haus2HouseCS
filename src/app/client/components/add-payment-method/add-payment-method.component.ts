import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment.prod';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'client-add-payment-method',
  standalone: false,
  templateUrl: './add-payment-method.component.html',
  styles: ``
})
export class AddPaymentMethodComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cardElement') cardElementRef!: ElementRef;
  paymentForm: FormGroup = new FormGroup({});
  stripe: Stripe | null = null;
  card: StripeCardElement | null = null;
  cardError: string | null = null;
  loading = false;
  isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit(): Promise<void> {
    this.paymentForm = this.fb.group({});
    console.log('ngOnInit ejecutado');
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) {
      console.log('No es entorno de navegador, saliendo de ngAfterViewInit');
      return;
    }

    try {
      console.log('Cargando Stripe...');
      this.stripe = await loadStripe(environment.stripePublicKey!);
      if (!this.stripe) {
        this.cardError = 'Clave pública de Stripe no válida o no inicializada';
        console.error('Stripe no se inicializó correctamente');
        return;
      }

      console.log('Creando elemento de tarjeta Stripe...');
      const elements = this.stripe.elements();
      this.card = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#374151',
            '::placeholder': { color: '#9CA3AF' },
            lineHeight: '1.5',
          },
          invalid: { color: '#EF4444' },
        },
      });

      // Verificar si el elemento existe antes de montar
      setTimeout(() => {
        console.log('Verificando #card-element en el DOM:', document.getElementById('card-element'));
        if (this.cardElementRef?.nativeElement && this.card) {
          console.log('Montando elemento de tarjeta en #card-element');
          this.card.mount(this.cardElementRef.nativeElement);
        } else {
          this.cardError = 'No se pudo encontrar el elemento de tarjeta en el DOM';
          console.error('No se pudo encontrar #card-element o card no está inicializado', {
            cardElement: this.cardElementRef?.nativeElement,
            card: this.card,
          });
        }
      }, 1000); // Aumentado a 1000ms para mayor seguridad
    } catch (err) {
      console.error('Error en ngAfterViewInit:', err);
      this.cardError = 'Error al inicializar Stripe';
    }
  }

  ngOnDestroy(): void {
    if (this.card) {
      console.log('Desmontando elemento Stripe');
      this.card.unmount();
      this.card = null;
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.isBrowser || !this.stripe || !this.card || !this.cardElementRef?.nativeElement) {
      console.error('Stripe, Card o card-element no están inicializados:', {
        stripe: this.stripe,
        card: this.card,
        cardElement: this.cardElementRef?.nativeElement,
      });
      this.cardError = 'Stripe no está inicializado correctamente o el elemento de tarjeta no está disponible';
      this.loading = false;
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el cliente (token no disponible)');
      this.cardError = 'No se encontró el cliente';
      this.loading = false;
      return;
    }

    try {
      console.log('Intentando crear token con Stripe...');
      const result = await this.stripe.createToken(this.card);
      console.log('Resultado de createToken:', result);

      if (result.error) {
        console.log('Error al crear token:', result.error);
        this.cardError = result.error.message || 'Error al procesar la tarjeta';
        this.loading = false;
        return;
      }

      if (result.token) {
        console.log('Token creado exitosamente:', result.token.id);
        this.clientService.addPaymentMethod(token, result.token.id).subscribe({
          next: (response) => {
            console.log('Respuesta del backend:', response);
            location.reload();
          },
          error: (err) => {
            console.error('Error del backend:', err);
            this.cardError = err.error?.message || 'Error al añadir el método de pago';
            this.loading = false;
          },
        });
      } else {
        console.warn('No se recibió un token de Stripe');
        this.cardError = 'No se pudo generar el token de la tarjeta';
        this.loading = false;
      }
    } catch (err) {
      console.error('Excepción capturada en createToken:', err);
      this.cardError = 'Error al procesar la tarjeta: ' + err;
      this.loading = false;
    }
  }
}