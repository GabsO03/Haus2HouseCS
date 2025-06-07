import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewWorkerPageComponent } from './pages/new-worker-page/new-worker-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { SchedulePageComponent } from './pages/schedule-page/schedule-page.component';
import { ListPageComponent } from './pages/list-page/list-page.component';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page.component';
import { AdminGuard } from '../auth/guards/admin.guard';
import { WorkerGuard } from '../auth/guards/worker.guard';
import { ScheduleEditPageComponent } from './pages/schedule-edit-page/schedule-edit-page.component';
import { EditWorkerPageComponent } from './pages/edit-worker-page/edit-worker-page.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    children: [
      { path: 'new-helper', component: NewWorkerPageComponent, canActivate: [AdminGuard], },
      { path: 'profile/edit', component: EditWorkerPageComponent, canActivate: [WorkerGuard], },
      { path: 'profile', component: ProfilePageComponent, canActivate: [WorkerGuard], },
      { path: 'list', component: ListPageComponent, canActivate: [AdminGuard]},
      { path: 'schedule', component: SchedulePageComponent,},
      { path: 'schedule/edit', component: ScheduleEditPageComponent, canActivate: [WorkerGuard],},
      { path: 'schedule/:id', component: SchedulePageComponent,},
      { path: 'calendar', component: CalendarPageComponent, canActivate: [WorkerGuard],},
      { path: ':id', component: ProfilePageComponent},
      { path: '**', redirectTo:'list'},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkerRoutingModule { }
