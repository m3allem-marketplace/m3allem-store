import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { SupplierGuard } from './core/guards/supplier.guard';

const routes: Routes = [
  { path: 'auth/login', children: [] },
  { path: 'ecommerce/storefront', children: [] },
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
    loadChildren: () => import('./features/worker-portal/worker-portal.module').then(m => m.WorkerPortalModule)
  },
  {
    path: '',
    redirectTo: 'ecommerce',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'ecommerce'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
