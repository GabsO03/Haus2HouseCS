import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { ListPageComponent } from './pages/list-page/list-page.component';
import { PaymentMethodComponent } from './pages/payment-method/payment-method.component';
import { ClientGuard } from '../auth/guards/client.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { EditProfilePageComponent } from './pages/edit-profile-page/edit-profile-page.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    children: [
      { path:'profile', component: ProfilePageComponent, canActivate: [ClientGuard], },
      { path:'profile/edit', component: EditProfilePageComponent, canActivate: [ClientGuard], },
      { path:'list', component: ListPageComponent, canActivate: [AdminGuard], },
      { path:'payment-method', component: PaymentMethodComponent, canActivate: [ClientGuard], },
      { path:':id', component: ProfilePageComponent },
      { path: '**', redirectTo: 'list' }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
