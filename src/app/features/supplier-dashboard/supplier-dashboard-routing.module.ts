import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { SubmitItemComponent } from './pages/submit-item/submit-item.component';

const routes: Routes = [
  { path: '', redirectTo: 'inventory', pathMatch: 'full' },
  { path: 'inventory', component: InventoryComponent },
  { path: 'submit-item', component: SubmitItemComponent },
  { path: 'submit-item/:itemId', component: SubmitItemComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SupplierDashboardRoutingModule { }
