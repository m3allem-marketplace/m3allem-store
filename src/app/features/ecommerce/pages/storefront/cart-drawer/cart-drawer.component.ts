import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EcommerceService, CartItem } from '../../../services/ecommerce.service';

@Component({
  selector: 'app-cart-drawer',
  templateUrl: './cart-drawer.component.html',
  styleUrls: ['./cart-drawer.component.css'],
  standalone: false
})
export class CartDrawerComponent implements OnInit {

  @Input() isOpen: boolean = false;
  @Output() closed = new EventEmitter<void>();
  @Output() checkoutClicked = new EventEmitter<void>();

  cart$!: Observable<CartItem[]>;

  constructor(private ecommerceService: EcommerceService, private router: Router) {}

  ngOnInit(): void {
    this.cart$ = this.ecommerceService.cart$;
  }

  getTotal(items: CartItem[]): number {
    return this.ecommerceService.getCartTotal();
  }

  increment(cartItem: CartItem): void {
    this.ecommerceService.updateQuantity(cartItem.item._id, cartItem.quantity + 1);
  }

  decrement(cartItem: CartItem): void {
    this.ecommerceService.updateQuantity(cartItem.item._id, cartItem.quantity - 1);
  }

  remove(cartItem: CartItem): void {
    this.ecommerceService.removeFromCart(cartItem.item._id);
  }

  close(): void {
    this.closed.emit();
  }

  onCheckout(): void {
    this.checkoutClicked.emit();
  }

  browseProducts(): void {
    this.router.navigate(['/ecommerce/storefront']);
    this.close();
  }
}