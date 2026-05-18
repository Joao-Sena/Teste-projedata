import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/users/users.routes').then(m => m.usersRoutes)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
