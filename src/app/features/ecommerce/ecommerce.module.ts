import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { EcommerceRoutingModule } from './ecommerce-routing.module';
import { StorefrontComponent } from './pages/storefront/storefront.component';
import { ItemDetailComponent } from './pages/item-detail/item-detail.component';
import { CartDrawerComponent } from './pages/storefront/cart-drawer/cart-drawer.component';

@NgModule({
  declarations: [
    StorefrontComponent,
    ItemDetailComponent,
    CartDrawerComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    EcommerceRoutingModule
  ]
})
export class EcommerceModule { }