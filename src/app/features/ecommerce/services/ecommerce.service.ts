import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Item } from '../../../shared/models/item.model';

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

  private readonly API_BASE = '/api';

  // ── Mock Data (Phase 1 — replace with ApiService after rebase) ──────────────
  private mockItems: Item[] = [
    {
      _id: '1',
      supplierId: 's1',
      title: 'Drill Bit Set',
      description: 'Professional grade',
      price: 149.99,
      stockQuantity: 50,
      category: 'Tools',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      supplierId: 's1',
      title: 'Hydraulic Jack',
      description: '3-ton capacity',
      price: 299.99,
      stockQuantity: 12,
      category: 'Equipment',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '3',
      supplierId: 's2',
      title: 'Spark Plug Set',
      description: 'NGK compatible',
      price: 49.99,
      stockQuantity: 200,
      category: 'Spare Parts',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ];

  // ── Cart State ───────────────────────────────────────────────────────────────

  private cartItems$ = new BehaviorSubject<CartItem[]>([]);

  /** Full cart as an observable — components subscribe, never hold local state. */
  cart$ = this.cartItems$.asObservable();

  /** Total number of individual units in the cart. */
  cartCount$ = this.cart$.pipe(
    map(items => items.reduce((sum, i) => sum + i.quantity, 0))
  );

  constructor(private http: HttpClient) {}

  // ── Product Fetching ─────────────────────────────────────────────────────────

  /**
   * Returns all products, optionally filtered by search term and/or category.
   * Phase 1: uses mock data. Phase 2: replace `of(...)` block with the
   * commented-out HttpClient call below.
   */
  getProducts(search?: string, category?: string): Observable<Item[]> {
    // ── Phase 2 (uncomment after rebase) ──────────────────────────────────────
    // let params = new HttpParams();
    // if (search)   params = params.set('search', search);
    // if (category) params = params.set('category', category);
    // return this.http.get<Item[]>(`${this.API_BASE}/items`, { params });

    // ── Phase 1: mock filtering ───────────────────────────────────────────────
    let results = [...this.mockItems];

    if (search) {
      const term = search.toLowerCase();
      results = results.filter(
        item =>
          item.title.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
      );
    }

    if (category) {
      results = results.filter(item => item.category === category);
    }

    return of(results);
  }

  /**
   * Returns a single product by its ID.
   * Phase 1: finds in mock data. Phase 2: replace with HTTP call.
   */
  getProductById(id: string): Observable<Item> {
    // ── Phase 2 (uncomment after rebase) ──────────────────────────────────────
    // return this.http.get<Item>(`${this.API_BASE}/items/${id}`);

    // ── Phase 1: mock lookup ──────────────────────────────────────────────────
    const found = this.mockItems.find(item => item._id === id);
    if (!found) {
      throw new Error(`Item with id "${id}" not found.`);
    }
    return of(found);
  }

  // ── Cart Management ──────────────────────────────────────────────────────────

  /**
   * Adds an item to the cart.
   * If the item already exists, increments its quantity instead of duplicating.
   */
  addToCart(item: Item, quantity = 1): void {
    const current = this.cartItems$.getValue();
    const existingIndex = current.findIndex(ci => ci.item._id === item._id);

    if (existingIndex !== -1) {
      // Item already in cart — increment quantity
      const updated = current.map((ci, idx) =>
        idx === existingIndex
          ? { ...ci, quantity: ci.quantity + quantity }
          : ci
      );
      this.cartItems$.next(updated);
    } else {
      // New item — append to cart
      this.cartItems$.next([...current, { item, quantity }]);
    }
  }

  /** Removes an item from the cart entirely, regardless of quantity. */
  removeFromCart(itemId: string): void {
    const updated = this.cartItems$.getValue().filter(
      ci => ci.item._id !== itemId
    );
    this.cartItems$.next(updated);
  }

  /**
   * Sets the quantity of a cart item to an exact value.
   * Passing quantity ≤ 0 removes the item from the cart.
   */
  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    const updated = this.cartItems$.getValue().map(ci =>
      ci.item._id === itemId ? { ...ci, quantity } : ci
    );
    this.cartItems$.next(updated);
  }

  /** Empties the cart completely. */
  clearCart(): void {
    this.cartItems$.next([]);
  }

  /** Returns the sum of (price × quantity) for all cart items. */
  getCartTotal(): number {
    return this.cartItems$
      .getValue()
      .reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  }

  // ── Checkout ─────────────────────────────────────────────────────────────────

  /**
   * Sends the order to the backend and returns the receipt.
   * The caller is responsible for calling clearCart() on success.
   */
  placeOrder(orderPayload: OrderPayload): Observable<OrderReceipt> {
    return this.http.post<OrderReceipt>(`${this.API_BASE}/orders`, orderPayload);
  }
}