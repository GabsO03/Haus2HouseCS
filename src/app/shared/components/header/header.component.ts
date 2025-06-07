import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { FlowbiteService } from '../../../services/flowbite.service';
import { initFlowbite } from 'flowbite';
import { delay } from 'rxjs';
import { User } from '../../../auth/interfaces/user.interface';
import { Router } from '@angular/router';
import { fail } from 'assert';
import Swal from 'sweetalert2';

@Component({
  selector: 'shared-header',
  standalone: false,
  templateUrl: './header.component.html',
})
export class HeaderComponent { // implements OnDestroy {

  public user?:User;
  public profileUrl?:string;
  public isWorker?:boolean;
  public isAdmin?:boolean = false;

  constructor(
    private authService: AuthService,
    private flowbiteService: FlowbiteService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.flowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });

    setTimeout(() => {
      this.user = this.authService.currentUser;
      this.setProfileUrl();
    }, 800);
    
  }

  setProfileUrl () : void {
    const rol = this.user?.rol;
    if (rol === 'worker') {
      this.profileUrl = 'helper/profile'
      this.isWorker = true;
      return;
    } else if(rol === 'client') {
      this.profileUrl = 'customer/profile';
      this.isWorker = false;
    } else {
      this.isWorker = false;
      this.isAdmin = true;
    }

  }

  onLogout(): void {
    Swal.fire({
      title: `Cerrar sesión`,
      text: `¿Estás seguro de que quieres cerrar sesión?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6A64F1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡Adios!',
      cancelButtonText: 'No, cancelar',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal2-confirm btn my-bg-teal text-white font-semibold py-2 px-4 rounded-md',
        cancelButton: 'swal2-cancel btn bg-red-500 text-white font-semibold py-2 px-4 rounded-md'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  openChangePasswordModal(): void {
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

}
