import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicioRoutingModule } from './servicio-routing.module';
import { ServicesListPageComponent } from './pages/services-list-page/services-list-page.component';
import { ServiceDetailPageComponent } from './pages/service-detail-page/service-detail-page.component';
import { StatusPipe } from './pipes/status.pipe';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ServiceRequestPageComponent } from './pages/service-request-page/service-request-page.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValorarServicioModalComponent } from './componentes/valorar-servicio-modal/valorar-servicio-modal.component';
import { ServicesHistoryPageComponent } from './pages/services-history-page/services-history-page.component';


@NgModule({
  declarations: [
    ServicesListPageComponent,
    ServicesHistoryPageComponent,
    ServiceDetailPageComponent,
    StatusPipe,
    LayoutPageComponent,
    ServiceRequestPageComponent,
    ValorarServicioModalComponent,
    DateFormatPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ServicioRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    ServicesListPageComponent,
  ]
})
export class ServicioModule { }
