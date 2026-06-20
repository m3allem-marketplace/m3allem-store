import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { SupplierGuard } from './core/guards/supplier.guard';

const routes: Routes = [
  {
    path: 'ecommerce',
    loadChildren: () => import('./features/ecommerce/ecommerce.module').then(m => m.EcommerceModule)
  },
  {
    path: 'supplier-dashboard',
    canActivate: [AuthGuard, SupplierGuard],
    loadChildren: () => import('./features/supplier-dashboard/supplier-dashboard.module').then(m => m.SupplierDashboardModule)
  },
  {
    path: 'worker-portal',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/worker-portal/worker-portal.module').then(m => m.WorkerPortalModule)
  },
  { path: 'auth', children: [] },
  { path: '', redirectTo: 'ecommerce', pathMatch: 'full' },
  { path: '**', redirectTo: 'ecommerce' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
