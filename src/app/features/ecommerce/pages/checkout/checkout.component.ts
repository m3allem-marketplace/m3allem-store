import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EcommerceService, CartItem, OrderReceipt } from '../../services/ecommerce.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: false
})
export class CheckoutComponent implements OnInit, OnDestroy {

  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  isLoading  = false;
  hasError   = false;
  showModal  = false;
  orderReceipt: OrderReceipt | null = null;

  readonly DELIVERY_FEE = 50;

  private cartSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private ecommerceService: EcommerceService,
    private router: Router
  ) {}

ngOnInit(): void {
  this.cartSub = this.ecommerceService.cart$.subscribe(items => {
    this.cartItems = items;
  });

  const items = this.ecommerceService.getCartItemsSnapshot();

  if (items.length === 0) {
    this.router.navigate(['/ecommerce/storefront']);
    return;
  }

  this.checkoutForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    address: ['', [Validators.required, Validators.minLength(10)]],
    city: ['', Validators.required],
    paymentMethod: ['cash', Validators.required],
  });
}

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  }

  get grandTotal(): number {
    return this.subtotal + this.DELIVERY_FEE;
  }

  isInvalid(field: string): boolean {
    const ctrl = this.checkoutForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  getError(field: string): string {
    const ctrl = this.checkoutForm.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required'])   return 'هذا الحقل مطلوب';
    if (ctrl.errors['minlength'])  return `الحد الأدنى ${ctrl.errors['minlength'].requiredLength} أحرف`;
    if (ctrl.errors['pattern'])    return 'رقم الهاتف يجب أن يكون 11 رقماً';
    return '';
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.hasError  = false;

    const { fullName, phone, address, city, paymentMethod } = this.checkoutForm.value;

    const payload = {
      items:           this.cartItems,
      shippingAddress: `${fullName} — ${phone} — ${address}، ${city}`,
      paymentMethod,
    };

    this.ecommerceService.placeOrder(payload).subscribe({
      next: receipt => {
        this.isLoading   = false;
        this.orderReceipt = receipt;
        this.ecommerceService.clearCart();
        this.showModal   = true;
      },
      error: () => {
        this.isLoading = false;
        this.hasError  = true;
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.router.navigate(['/ecommerce/storefront']);
  }

  goBack(): void {
    this.router.navigate(['/ecommerce/storefront']);
  }
}