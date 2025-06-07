import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'change-password-modal',
  standalone: false,
  templateUrl: './change-password-modal.component.html',
  styles: ``
})
export class ChangePasswordModalComponent implements OnInit {
  @Input() userId!: string;
  public passwordForm: FormGroup;
  public loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService
  ) {
    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required, Validators.minLength(8)]],
      new_password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&-])[A-Za-z\d@$!%*#?&-]{8,}$/)]],
      new_password_confirmation: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    if (!this.userId) {
      this.alertService.error('No se pudo cargar el usuario');
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('new_password')?.value;
    const confirmPassword = form.get('new_password_confirmation')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.loading = true;

    const passwordData = {
      current_password: this.passwordForm.value.current_password,
      new_password: this.passwordForm.value.new_password,
      new_password_confirmation: this.passwordForm.value.new_password_confirmation
    };

    // console.log(passwordData);

    this.authService.changePassword(passwordData).subscribe({
      next: (response) => {
        if (response.data) {
          this.alertService.success('Contraseña cambiada con éxito');
          console.log('Se cambió la contraseña');
          this.passwordForm.reset();
          this.loading = false;
          this.closeModal();
        } else {
          this.alertService.error('La contraseña actual es incorrecta');
        }
      },
      error: (err) => {
        this.alertService.error('Error al cambiar la contraseña');
        this.passwordForm.reset();
        this.loading = false;
      }
    });
  }

  closeModal(): void {
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  isValidField(field: string): boolean {
    const control = this.passwordForm.get(field);
    return !!control?.errors && control.touched;
  }

  getFieldError(field: string): string | null {
    const control = this.passwordForm.get(field);
    if (!control?.errors) return null;

    const errors = control.errors;
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'minlength':
          return `Mínimo ${errors[key].requiredLength} caracteres`;
        case 'pattern':
          return 'La contraseña debe tener al menos 8 caracteres, letras, números y un carácter especial (@, $, !, %, *, #, ?, &, -)';
        case 'mismatch': // Asegúrate de que este error se aplique a new_password_confirmation
          return 'Las contraseñas no coinciden';
      }
    }
    return null;
  }
}