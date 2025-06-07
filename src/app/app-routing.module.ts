import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404PageComponent } from './shared/pages/error404-page/error404-page.component';
import { AlreadyLoggedService } from './auth/guards/alreadyLogged.guard';
import { AuthGuard } from './auth/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    canActivate: [ AlreadyLoggedService ],
    canMatch: [ AlreadyLoggedService ]
  },
  {
    path: 'services',
    loadChildren: () => import('./servicio/servicio.module').then(m => m.ServicioModule),
    canActivate: [ AuthGuard ],
    canMatch: [ AuthGuard ],
  },
  {
    path: 'helper',
    loadChildren: () => import('./worker/worker.module').then(m => m.WorkerModule),
    canActivate: [ AuthGuard ],
    canMatch: [ AuthGuard ],
  },
  {
    path: 'customer',
    loadChildren: () => import('./client/client.module').then(m => m.ClientModule),
    canActivate: [ AuthGuard ],
    canMatch: [ AuthGuard ],
  },
    {
    path: '404',
    component: Error404PageComponent,
  },
  {
    path: '',
    redirectTo: 'services',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '404',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
