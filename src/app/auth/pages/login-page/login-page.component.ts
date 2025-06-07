import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'auth-login-page',
  standalone: false,
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {

  public userForm: FormGroup;
  public fail = false;
  public loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { 
    this.userForm = this.fb.group({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  onLogin():void{
    if ( this.userForm.invalid ){
      this.userForm.markAllAsTouched();
      return;
    }


    this.loading = true;
    this.authService.login(this.userForm.get('email')?.value, this.userForm.get('password')?.value)
    .subscribe( user => {
      if (!user) {
        this.fail = true;
        this.loading = false;
      }
      else {
        const ruta = user.rol == 'admin' ? '/helper' : '/services';
        this.router.navigate([ruta]);
      }
    })

    this.userForm.reset();

  }

}
