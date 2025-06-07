import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicesListPageComponent } from './pages/services-list-page/services-list-page.component';
import { ServiceDetailPageComponent } from './pages/service-detail-page/service-detail-page.component';
import { ServiceRequestPageComponent } from './pages/service-request-page/service-request-page.component';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ServicesHistoryPageComponent } from './pages/services-history-page/services-history-page.component';
import { ClientGuard } from '../auth/guards/client.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    children: [
      { path: 'request', component: ServiceRequestPageComponent, canActivate: [ClientGuard], },
      { path: 'list', component: ServicesListPageComponent},
      { path: 'history', component: ServicesHistoryPageComponent},
      { path: ':id', component: ServiceDetailPageComponent},
      { path: '**', redirectTo:'list'},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicioRoutingModule { }
