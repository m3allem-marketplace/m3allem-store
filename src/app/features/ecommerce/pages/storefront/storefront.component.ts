import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EcommerceService } from '../../services/ecommerce.service';
import { Item } from '../../../../shared/models/item.model';

@Component({
  selector: 'app-storefront',
  templateUrl: './storefront.component.html',
  styleUrls: ['./storefront.component.css'],
  standalone: false
})
export class StorefrontComponent implements OnInit {
  allProducts: Item[] = [];
  filteredProducts: Item[] = [];
  isLoading = false;
  isCartOpen = false;

  searchControl = new FormControl('');

  categories = ['الكل', 'أدوات', 'معدات', 'قطع غيار', 'عُدد'];
  selectedCategory = 'الكل';

  private categoryMapping: { [key: string]: string } = {
    'الكل': 'All',
    'أدوات': 'Tools',
    'معدات': 'Equipment',
    'قطع غيار': 'Spare Parts',
    'عُدد': 'Hardware'
  };

  cartCount$: Observable<number>;

  constructor(
    private ecommerceService: EcommerceService,
    private router: Router
  ) {
    this.cartCount$ = this.ecommerceService.cartCount$;
  }

  ngOnInit(): void {
    this.loadProducts();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.ecommerceService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.isLoading = false;
      }
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  applyFilters(): void {
    const searchTerm = (this.searchControl.value || '').trim().toLowerCase();
    const activeCategoryEnglish = this.categoryMapping[this.selectedCategory] || 'All';

    this.filteredProducts = this.allProducts.filter(product => {
      const matchesSearch = !searchTerm ||
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm);

      const matchesCategory = activeCategoryEnglish === 'All' || product.category === activeCategoryEnglish;

      return matchesSearch && matchesCategory;
    });
  }

  addToCart(event: Event, item: Item): void {
    event.stopPropagation();
    if (item.stockQuantity > 0) {
      this.ecommerceService.addToCart(item);
      this.openCart();
    }
  }


  goToDetail(id: string): void {
    this.router.navigate(['/ecommerce/item-detail', id]);
  }

  // ── Cart Drawer ───────────────────────────────────────────────────────────────

  openCart(): void {
    this.isCartOpen = true;
  }

  closeCart(): void {
    this.isCartOpen = false;
  }

  goToCheckout(): void {
    this.isCartOpen = false;
    this.router.navigate(['/ecommerce/checkout']);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  getStockBadgeText(quantity: number): string {
    if (quantity === 0) return 'نفد من المخزن';
    if (quantity < 5)   return `كمية محدودة (متبقي ${quantity})`;
    return 'متوفر';
  }

  getStockBadgeClass(quantity: number): string {
    if (quantity === 0) return 'badge-out-of-stock';
    if (quantity < 5)   return 'badge-low-stock';
    return 'badge-in-stock';
  }

  getCategoryArabic(category: string): string {
    const reverseMapping: { [key: string]: string } = {
      'Tools': 'أدوات',
      'Equipment': 'معدات',
      'Spare Parts': 'قطع غيار',
      'Hardware': 'عُدد'
    };
    return reverseMapping[category] || category;
  }
}