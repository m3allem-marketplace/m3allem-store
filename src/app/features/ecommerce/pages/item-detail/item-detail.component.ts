import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EcommerceService } from '../../services/ecommerce.service';
import { Item } from '../../../../shared/models/item.model';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.css'],
  standalone: false
})
export class ItemDetailComponent implements OnInit, OnDestroy {
  product: Item | null = null;
  isLoading = false;
  hasError = false;
  quantity = 1;
  showToast = false;
  isCartOpen = false;

  selectedCategory = 'الكل';
  searchControl = new FormControl('');

  private toastTimer: any = null;

  private categoryMapping: { [key: string]: string } = {
    'Tools':       'أدوات',
    'Equipment':   'معدات',
    'Spare Parts': 'قطع غيار',
    'Hardware':    'عُدد',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ecommerceService: EcommerceService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.hasError = false;

    try {
      this.ecommerceService.getProductById(id).pipe(
        timeout(15000),
        catchError(err => {
          console.error('Error loading product detail:', err);
          this.hasError = true;
          this.isLoading = false;
          return of(null);
        })
      ).subscribe({
        next: (product) => {
          if (product) {
            this.product = product;
            this.quantity = 1;
          } else {
            this.hasError = true;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Subscription error loading product detail:', err);
          this.hasError = true;
          this.isLoading = false;
        }
      });
    } catch (e) {
      console.error('Sync error in loadProduct:', e);
      this.hasError = true;
      this.isLoading = false;
    }
  }

  increment(): void {
    if (this.product && this.quantity < this.product.stockQuantity) {
      this.quantity++;
    }
  }

  decrement(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product || this.product.stockQuantity === 0) return;
    this.ecommerceService.addToCart(this.product, this.quantity);
    this.triggerToast();
  }

  triggerToast(): void {
    this.showToast = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.showToast = false;
    }, 2000);
  }

  goBack(): void {
    this.router.navigate(['/ecommerce/storefront']);
  }

  getCategoryArabic(category: string): string {
    return this.categoryMapping[category] || category;
  }

  getStockBadgeText(quantity: number): string {
    if (quantity === 0)  return 'نفد من المخزن';
    if (quantity < 5)    return `كمية محدودة — متبقي ${quantity} فقط`;
    return 'متوفر في المخزن';
  }

  getStockBadgeClass(quantity: number): string {
    if (quantity === 0) return 'badge-out-of-stock';
    if (quantity < 5)   return 'badge-low-stock';
    return 'badge-in-stock';
  }

  formatPrice(price: number): string {
    return price.toLocaleString('ar-EG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  openCart(): void {
    this.isCartOpen = true;
  }

  closeCart(): void {
    this.isCartOpen = false;
  }
}