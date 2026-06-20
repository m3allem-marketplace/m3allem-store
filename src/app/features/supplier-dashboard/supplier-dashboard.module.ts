import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { InventoryComponent } from './pages/inventory/inventory.component';

@NgModule({
  declarations: [
    InventoryComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule
  ],
  exports: [
    InventoryComponent
  ]
})
export class SupplierDashboardModule {}
