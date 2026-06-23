import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Item } from '../../../shared/models/item.model';
import { ApiService } from '../../../core/services/api.service';

// ─── Supporting Interfaces ────────────────────────────────────────────────────

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

  // ── Cart State ───────────────────────────────────────────────────────────────
  cartItems$ = new BehaviorSubject<CartItem[]>([]);
  cart$      = this.cartItems$.asObservable();
  cartCount$ = this.cart$.pipe(
    map(items => items.reduce((sum, i) => sum + i.quantity, 0))
  );

  constructor(private api: ApiService) {}

  // ── Product Fetching ─────────────────────────────────────────────────────────

  getProducts(search?: string, category?: string): Observable<Item[]> {
    let endpoint = '/products';
    const params: string[] = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (search)   params.push(`search=${encodeURIComponent(search)}`);
    if (params.length) endpoint += '?' + params.join('&');
    return this.api.get<any[]>(endpoint).pipe(
      map(products => (products || []).map(p => this.mapItem(p)))
    );
  }

  getProductById(id: string): Observable<Item> {
    return this.api.get<any>(`/products/${id}`).pipe(
      map(product => this.mapItem(product))
    );
  }

  private mapItem(backendItem: any): Item {
    return {
      _id: backendItem._id || backendItem.id || '',
      supplierId: backendItem.supplierId || '',
      title: backendItem.title || backendItem.name || '',
      description: backendItem.description || '',
      price: Number(backendItem.price) || 0,
      stockQuantity: backendItem.stockQuantity !== undefined 
        ? backendItem.stockQuantity 
        : (backendItem.quantity !== undefined ? backendItem.quantity : 10), // default to 10 if not provided
      category: backendItem.category || 'Tools',
      imageUrl: backendItem.imageUrl || '',
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