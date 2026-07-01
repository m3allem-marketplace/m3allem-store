import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { EcommerceService, CartItem, OrderReceipt } from '../../services/ecommerce.service';

// City → approximate WGS-84 coordinates map (fallback when Geolocation is denied)
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'القاهرة':     { lat: 30.0444,  lng: 31.2357 },
  'الجيزة':     { lat: 30.0131,  lng: 31.2089 },
  'الإسكندرية': { lat: 31.2001,  lng: 29.9187 },
  'المنصورة':   { lat: 31.0409,  lng: 31.3785 },
  'طنطا':       { lat: 30.7865,  lng: 30.9997 },
  'أسيوط':      { lat: 27.1783,  lng: 31.1859 },
  'الأقصر':     { lat: 25.6872,  lng: 32.6396 },
  'أسوان':      { lat: 24.0889,  lng: 32.8998 },
};

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: false
})
export class CheckoutComponent implements OnInit, OnDestroy {

  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  isLoading    = false;
  hasError     = false;
  /** Human-readable error shown in the error banner */
  errorMessage = '';
  showModal    = false;
  orderReceipt: OrderReceipt | null = null;

  /** Captured coordinates – populated by Geolocation API or fallback city map */
  private latitude  = 0;
  private longitude = 0;

  readonly DELIVERY_FEE = 50;

  private cartSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private ecommerceService: EcommerceService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.checkoutForm = this.fb.group({
      fullName:      ['', [Validators.required, Validators.minLength(3)]],
      phone:         ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      address:       ['', [Validators.required, Validators.minLength(10)]],
      city:          ['', Validators.required],
      paymentMethod: ['cash', Validators.required],
    });

    // Update coordinates whenever the city selection changes
    this.checkoutForm.get('city')!.valueChanges.subscribe((city: string) => {
      this.updateCoordinates(city);
    });

    this.cartSub = this.ecommerceService.cart$.subscribe(items => {
      this.cartItems = items;
    });

    const items = this.ecommerceService.getCartItemsSnapshot();
    if (items.length === 0) {
      this.router.navigate(['/ecommerce/storefront']);
      return;
    }

    // Try to get precise location via browser Geolocation API
    this.requestGeolocation();
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  // ── Computed ──────────────────────────────────────────────────────────────────

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
    if (ctrl.errors['required'])  return 'هذا الحقل مطلوب';
    if (ctrl.errors['minlength']) return `الحد الأدنى ${ctrl.errors['minlength'].requiredLength} أحرف`;
    if (ctrl.errors['pattern'])   return 'رقم الهاتف يجب أن يكون 11 رقماً';
    return '';
  }

  // ── Form Submission ───────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isLoading    = true;
    this.hasError     = false;
    this.errorMessage = '';

    const { fullName, phone, address, city, paymentMethod } = this.checkoutForm.value;

    // If coordinates are still 0,0 (geolocation denied), fall back to city map
    if (this.latitude === 0 && this.longitude === 0 && city) {
      const coords = CITY_COORDS[city];
      if (coords) {
        this.latitude  = coords.lat;
        this.longitude = coords.lng;
      }
    }

    const payload = {
      items:        this.cartItems,
      customerName: fullName,
      location:     `${address}، ${city}`,
      latitude:     this.latitude,
      longitude:    this.longitude,
      paymentMethod,
    };

    this.ecommerceService.placeOrder(payload).subscribe({
      next: receipt => {
        this.isLoading    = false;           // ✅ stop spinner on success
        this.orderReceipt = receipt;
        this.ecommerceService.clearCart();   // ✅ clear cart state (201 success)
        this.showModal    = true;            // ✅ show confirmation modal
        this.cdr.detectChanges();            // ✅ force view update immediately
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading    = false;           // ✅ stop spinner on error
        this.hasError     = true;
        this.errorMessage = this.resolveErrorMessage(err);
        this.cdr.detectChanges();            // ✅ force view update — shows banner, hides spinner
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

  // ── Private Helpers ───────────────────────────────────────────────────────────

  /**
   * Maps HTTP error status codes to Arabic user-friendly messages.
   *
   * 4xx → client-side / validation errors  (the user can fix something)
   * 5xx → server-side errors               (retry later)
   * status 0 → network/connectivity error
   */
  private resolveErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.';
    }
    if (err.status === 400) {
      return 'بيانات الطلب غير صحيحة. يرجى مراجعة الحقول والمحاولة مجدداً.';
    }
    if (err.status === 401 || err.status === 403) {
      return 'انتهت جلستك أو لا تملك صلاحية إتمام الطلب. يرجى تسجيل الدخول مجدداً.';
    }
    if (err.status === 404) {
      return 'أحد المنتجات في طلبك لم يعد متاحاً. يرجى تحديث سلة التسوق.';
    }
    if (err.status === 409) {
      return 'كمية المنتج المطلوبة غير متوفرة في المخزون.';
    }
    if (err.status >= 400 && err.status < 500) {
      // Generic 4xx
      return 'حدث خطأ في البيانات المُرسلة. يرجى التحقق من المعلومات وإعادة المحاولة.';
    }
    if (err.status >= 500) {
      // 5xx server errors
      return 'خدمة الطلبات غير متاحة حالياً. نعمل على حل المشكلة — يرجى المحاولة لاحقاً.';
    }
    return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
  }

  /**
   * Attempts to get the device's precise GPS coordinates.
   * Falls back gracefully if the user denies permission — coordinates stay 0,0
   * and will be resolved from the city map on form submit.
   */
  private requestGeolocation(): void {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      pos => {
        this.latitude  = pos.coords.latitude;
        this.longitude = pos.coords.longitude;
      },
      _err => {
        // Permission denied or unavailable — city-map fallback handles this
      },
      { timeout: 8000, maximumAge: 60_000 }
    );
  }

  /**
   * Immediately resolves city-based coordinates when the user changes the city
   * dropdown, so coordinates are ready even before geolocation resolves.
   */
  private updateCoordinates(city: string): void {
    if (!city) return;
    // Only override if GPS coordinates haven't been captured yet
    if (this.latitude === 0 && this.longitude === 0) {
      const coords = CITY_COORDS[city];
      if (coords) {
        this.latitude  = coords.lat;
        this.longitude = coords.lng;
      }
    }
  }
}