import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientRoutingModule } from './client-routing.module';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { RouterModule } from '@angular/router';
import { ListPageComponent } from './pages/list-page/list-page.component';
import { SharedModule } from '../shared/shared.module';
import { PaymentMethodComponent } from './pages/payment-method/payment-method.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AddPaymentMethodComponent } from './components/add-payment-method/add-payment-method.component';
import { EditProfilePageComponent } from './pages/edit-profile-page/edit-profile-page.component';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { UserPfpPipe } from './pipes/user-pfp.pipe';

@NgModule({
  declarations: [
    ProfilePageComponent,
    LayoutPageComponent,
    ListPageComponent,
    PaymentMethodComponent,
    AddPaymentMethodComponent,
    EditProfilePageComponent,
    DateFormatPipe,
    UserPfpPipe
  ],
  imports: [
    CommonModule,
    RouterModule,
    ClientRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class ClientModule { }
