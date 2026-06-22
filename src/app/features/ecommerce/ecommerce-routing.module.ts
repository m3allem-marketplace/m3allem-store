import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StorefrontComponent } from './pages/storefront/storefront.component';
import { ItemDetailComponent } from './pages/item-detail/item-detail.component';

const routes: Routes = [
  { path: 'storefront', component: StorefrontComponent },
  { path: 'item-detail/:id', component: ItemDetailComponent },
  { path: '', redirectTo: 'storefront', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EcommerceRoutingModule { }
