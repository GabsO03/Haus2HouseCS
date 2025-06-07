import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'haus2house';
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Importa y ejecuta initFlowbite solo en el navegador
      import('flowbite').then((module) => {
        module.initFlowbite();
      }).catch(err => {
        console.error('Error al inicializar Flowbite:', err);
      });
    }
  }
}
