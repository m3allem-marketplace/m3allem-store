import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Item, ShopInfo } from '../../../shared/models/item.model';
import { ApiService } from '../../../core/services/api.service';

// ─── Supporting Interfaces ────────────────────────────────────────────────────

export interface ShopWithProducts {
  shopId: string;
  nameAr: string;
  address: string;
  rating: number;
  deliveryTime: string;
  products: Item[];
}

export interface CategoryShops {
  categoryEnglish: string;
  categoryArabic: string;
  shops: ShopWithProducts[];
}

export interface CartItem {
  item: Item;
  quantity: number;
}

export interface OrderPayload {
  items: CartItem[];
  shippingAddress: string;
  paymentMethod: string;
}

export interface OrderReceipt {
  orderId: string;
  totalAmount: number;
  estimatedDelivery: string;
  status: 'confirmed' | 'pending';
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class EcommerceService {
  private productsCache$: Observable<Item[]> | null = null;
  private shopsCache$: Observable<CategoryShops[]> | null = null;

  // ── Cart State ───────────────────────────────────────────────────────────────
  cartItems$ = new BehaviorSubject<CartItem[]>([]);
  cart$      = this.cartItems$.asObservable();
  cartCount$ = this.cart$.pipe(
    map(items => items.reduce((sum, i) => sum + i.quantity, 0))
  );

  constructor(private api: ApiService) {}

  // ── Product Fetching ─────────────────────────────────────────────────────────

  getProducts(search?: string, category?: string): Observable<Item[]> {
    if (this.productsCache$) {
      return this.productsCache$;
    }

    let endpoint = '/products/store';
    this.productsCache$ = this.api.get<any[]>(endpoint).pipe(
      map(categories => {
        const products: Item[] = [];
        (categories || []).forEach(cat => {
          const categoryName = cat.categoryId || cat.name || '';
          const mappedCategory = this.standardizeCategory(categoryName);
          
          if (cat.products && Array.isArray(cat.products)) {
            cat.products.forEach((p: any) => {
              p.category = mappedCategory;
              products.push(this.mapItem(p));
            });
          }
        });
        return products;
      }),
      shareReplay(1)
    );

    return this.productsCache$;
  }

  getProductById(id: string): Observable<Item> {
    return this.getProducts().pipe(
      map(products => {
        const found = products.find(p => p._id === id);
        if (!found) {
          throw new Error('Product not found');
        }
        return found;
      })
    );
  }

  getShopsByCategory(): Observable<CategoryShops[]> {
    if (this.shopsCache$) {
      return this.shopsCache$;
    }

    this.shopsCache$ = this.api.get<any[]>('/products/store').pipe(
      map(categories => {
        const result: CategoryShops[] = [];
        (categories || []).forEach(cat => {
          const categoryName = cat.categoryId || cat.name || '';
          const mappedCategory = this.standardizeCategory(categoryName);
          const arabicCategory = this.getCategoryArabicName(mappedCategory);

          const shopMap = new Map<string, ShopWithProducts>();

          if (cat.products && Array.isArray(cat.products)) {
            cat.products.forEach((p: any) => {
              const shopData = p.shop;
              if (!shopData) return;

              const shopId = shopData.shop_id || shopData.shopId || p.owner || 'unknown';
              if (!shopMap.has(shopId)) {
                shopMap.set(shopId, {
                  shopId,
                  nameAr: shopData.name_ar || shopData.nameAr || 'محل غير معروف',
                  address: shopData.address || '',
                  rating: shopData.rating || 0,
                  deliveryTime: shopData.delivery_time || shopData.deliveryTime || '',
                  products: []
                });
              }

              p.category = mappedCategory;
              shopMap.get(shopId)!.products.push(this.mapItem(p));
            });
          }

          if (shopMap.size > 0) {
            result.push({
              categoryEnglish: mappedCategory,
              categoryArabic: arabicCategory,
              shops: Array.from(shopMap.values())
            });
          }
        });
        return result;
      }),
      shareReplay(1)
    );

    return this.shopsCache$;
  }

  private getCategoryArabicName(english: string): string {
    const map: { [key: string]: string } = {
      'Plumbing': 'سباكة', 'Carpentry': 'نجارة', 'Ceramics': 'سيراميك',
      'Painting': 'دهانات', 'Electrical': 'كهربا', 'HVAC': 'تكييف', 'Cleaning': 'تنظيف',
    };
    return map[english] || english;
  }

  private standardizeCategory(catName: string): string {
    const lower = catName.toLowerCase();
    if (lower.includes('plumb') || lower.includes('سباكة')) return 'Plumbing';
    if (lower.includes('carpenter') || lower.includes('نجارة') || lower.includes('خشب')) return 'Carpentry';
    if (lower.includes('ceramic') || lower.includes('سيراميك') || lower.includes('بلاط')) return 'Ceramics';
    if (lower.includes('paint') || lower.includes('دهان') || lower.includes('معجون')) return 'Painting';
    if (lower.includes('elect') || lower.includes('كهرب')) return 'Electrical';
    if (lower.includes('hvac') || lower.includes('تكييف') || lower.includes('هواء')) return 'HVAC';
    if (lower.includes('clean') || lower.includes('تنظيف')) return 'Cleaning';
    return catName;
  }

  private mapItem(backendItem: any): Item {
    const shopData = backendItem.shop;
    const shop: ShopInfo | undefined = shopData ? {
      shopId: shopData.shop_id || shopData.shopId || '',
      nameAr: shopData.name_ar || shopData.nameAr || '',
      address: shopData.address || '',
      rating: shopData.rating || 0,
      deliveryTime: shopData.delivery_time || shopData.deliveryTime || '',
    } : undefined;

    return {
      _id: backendItem._id || backendItem.id || '',
      supplierId: backendItem.supplierId || '',
      title: backendItem.title || backendItem.name || '',
      description: backendItem.description || '',
      price: Number(backendItem.price) || 0,
      stockQuantity: backendItem.stockQuantity !== undefined 
        ? backendItem.stockQuantity 
        : (backendItem.quantity !== undefined ? backendItem.quantity : 10),
      category: backendItem.category || 'Tools',
      subCategory: backendItem.sub_category || backendItem.subCategory || '',
      brand: backendItem.brand || '',
      currency: backendItem.currency || 'EGP',
      unit: backendItem.unit || '',
      imageUrl: backendItem.imageUrl || '',
      shop,
      status: backendItem.status || 'active',
      createdAt: backendItem.createdAt || new Date().toISOString()
    };
  }

  // ── Cart Management ──────────────────────────────────────────────────────────

  addToCart(item: Item, quantity = 1): void {
    const current = this.cartItems$.getValue();
    const idx = current.findIndex(ci => ci.item._id === item._id);
    if (idx !== -1) {
      this.cartItems$.next(
        current.map((ci, i) => i === idx ? { ...ci, quantity: ci.quantity + quantity } : ci)
      );
    } else {
      this.cartItems$.next([...current, { item, quantity }]);
    }
  }

  removeFromCart(itemId: string): void {
    this.cartItems$.next(this.cartItems$.getValue().filter(ci => ci.item._id !== itemId));
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) { this.removeFromCart(itemId); return; }
    this.cartItems$.next(
      this.cartItems$.getValue().map(ci => ci.item._id === itemId ? { ...ci, quantity } : ci)
    );
  }

  clearCart(): void { this.cartItems$.next([]); }

  getCartTotal(): number {
    return this.cartItems$.getValue().reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  }

  getCartItemsSnapshot(): CartItem[] {
    return this.cartItems$.getValue();
  }

  // ── Checkout ─────────────────────────────────────────────────────────────────

  /**
   * API بتاخد منتج واحد في كل request
   * فبنبعت request لكل item في الكارت وبنستنى كلهم مع forkJoin
   * وبعدين بنرجع receipt من أول order
   */
  placeOrder(orderPayload: OrderPayload): Observable<OrderReceipt> {
    const { items, shippingAddress } = orderPayload;

    const requests = items.map(ci =>
      this.api.post<OrderReceipt>('/orders', {
        customerName: shippingAddress,
        productId:    ci.item._id,
        quantity:     ci.quantity,
      })
    );

    return forkJoin(requests).pipe(
      map(receipts => receipts[0]) // نرجع الـ receipt الأول
    );
  }
}