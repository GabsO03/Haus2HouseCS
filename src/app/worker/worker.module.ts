import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkerRoutingModule } from './worker-routing.module';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { SchedulePageComponent } from './pages/schedule-page/schedule-page.component';
import { SchedulePipe } from './pipes/schedule.pipe';
import { NewWorkerPageComponent } from './pages/new-worker-page/new-worker-page.component';
import { ListPageComponent } from './pages/list-page/list-page.component';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ServicioModule } from '../servicio/servicio.module';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page.component';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { ScheduleEditPageComponent } from './pages/schedule-edit-page/schedule-edit-page.component';
import { EditWorkerPageComponent } from './pages/edit-worker-page/edit-worker-page.component';
import { UserPfpPipe } from './pipes/user-pfp.pipe';


@NgModule({
  declarations: [
    ProfilePageComponent,
    SchedulePageComponent,
    SchedulePipe,
    NewWorkerPageComponent,
    ListPageComponent,
    LayoutPageComponent,
    CalendarPageComponent,
    DateFormatPipe,
    UserPfpPipe,
    ScheduleEditPageComponent,
    EditWorkerPageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    WorkerRoutingModule,
    ReactiveFormsModule,
    ServicioModule
  ]
})
export class WorkerModule { }
