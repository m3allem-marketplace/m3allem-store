import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'supplier-dashboard',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/supplier-dashboard/supplier-dashboard.module')
        .then(m => m.SupplierDashboardModule)
  },
  {
    path: 'worker-portal',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/worker-portal/worker-portal.module')
        .then(m => m.WorkerPortalModule)
  },
  {
    path: 'ecommerce',
    loadChildren: () =>
      import('./features/ecommerce/ecommerce.module')
        .then(m => m.EcommerceModule)
  },
  { path: '', redirectTo: 'ecommerce', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
