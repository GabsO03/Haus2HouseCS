import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'auth-register-page',
  standalone: false,
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
  public userForm: FormGroup;
  public isLoading: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { 
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  onSignin():void{
    if ( this.userForm.invalid ){
      this.userForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const password = this.userForm.get('password')?.value;
    
    this.authService.signIn(this.userForm.value).subscribe({
      next: user => {
        this.authService.login(user.email, password).subscribe({
          next: user => {
            this.router.navigate(['/helper']);
          },
          error: () => {
            this.userForm.reset();
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.userForm.reset();
        this.isLoading = false;
      }
    });

  }
  
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('password_confirmation')?.value
      ? null
      : { mismatch: true };
  }

  getErrorMessage(field: string): string {
    const control = this.userForm.get(field);
    
    if (!control?.touched || !control?.errors) return '';

    switch (field) {
      case 'name':
        if (control.errors['required']) return 'El nombre es obligatorio';
        if (control.errors['minlength']) return 'El nombre debe tener al menos 2 caracteres';
        break;
      case 'email':
        if (control.errors['required']) return 'El correo es obligatorio';
        if (control.errors['email']) return 'Ingresa un correo válido';
        break;
      case 'telefono':
        if (control.errors['required']) return 'El teléfono es obligatorio';
        if (control.errors['pattern']) return 'Ingresa un número de 10 a 12 dígitos';
        break;
      case 'direccion':
        if (control.errors['required']) return 'La dirección es obligatoria';
        if (control.errors['minlength']) return 'La dirección debe tener al menos 5 caracteres';
        break;
      case 'password':
        if (control.errors['required']) return 'La contraseña es obligatoria';
        if (control.errors['minlength']) return 'La contraseña debe tener al menos 8 caracteres';
        break;
      case 'password_confirmation':
        if (control.errors['required']) return 'La confirmación de contraseña es obligatoria';
        break;
    }

    if (this.userForm.errors?.['mismatch'] && field === 'password_confirmation') {
      return 'Las contraseñas no coinciden';
    }

    return '';
  }




}
