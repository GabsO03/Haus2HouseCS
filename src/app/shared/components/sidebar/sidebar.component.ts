import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'shared-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styles: ``
})
export class SidebarComponent implements OnInit {
  public userRole!:string;
  public sidebarItems!:{
    label: string,
    icon: string,
    url: string
  }[];

  constructor(
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.userRole = this.authService.decrypt(localStorage.getItem('r')!);
    this.sidebarItems = [];

    if (this.userRole == 'client') {
      this.sidebarItems.push({ label: 'Solicitar Servicio', icon: 'fa-plus-square', url: './services/request' });
    }
    if (this.userRole != 'admin') {
      this.sidebarItems.push({ label: 'Servicios ' + (this.userRole == 'worker' ? 'Asignados' : 'Solicitados'), icon: 'fa-receipt', url: './services/list' });
      this.sidebarItems.push({ label: 'Historial de servicios', icon: 'fa-history', url: './services/history' });
    }
    if (this.userRole == 'admin') {
      this.sidebarItems.push({ label: 'Ver Trabajadores', icon: 'fa-users', url: './helper/list' });
      this.sidebarItems.push({ label: 'Añadir trabajador', icon: 'fa-user-plus', url: './helper/new-helper' });
      this.sidebarItems.push({ label: 'Servicios Vigentes', icon: 'fa-receipt', url: './services/list' });
      this.sidebarItems.push({ label: 'Servicios Pasados', icon: 'fa-receipt', url: './services/history' });
    }

  }
}
//TODO: Una tabla de notificaciones