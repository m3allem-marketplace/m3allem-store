import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { EcommerceRoutingModule } from './ecommerce-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { StorefrontComponent } from './pages/storefront/storefront.component';
import { ItemDetailComponent } from './pages/item-detail/item-detail.component';
import { CartDrawerComponent } from './pages/storefront/cart-drawer/cart-drawer.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrderConfirmationModalComponent } from './pages/checkout/order-confirmation-modal/order-confirmation-modal.component';

@NgModule({
  declarations: [
    StorefrontComponent,
    ItemDetailComponent,
    CartDrawerComponent,
    CheckoutComponent,
    OrderConfirmationModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EcommerceRoutingModule,
    SharedModule
  ]
})
export class EcommerceModule {}