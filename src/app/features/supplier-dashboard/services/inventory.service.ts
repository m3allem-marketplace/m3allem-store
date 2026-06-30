import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Item } from '../../../shared/models/item.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private api: ApiService) { }

  getInventory(supplierId: string): Observable<Item[]> {
    // In Swagger, GET /api/products returns the products for the logged-in supplier.
    // The query param can still be appended if needed, but we call the correct endpoint '/products'.
    return this.api.get<any[]>('/products').pipe(
      map(items => (items || []).map(item => this.mapItem(item)))
    );
  }

  getItemById(itemId: string): Observable<Item> {
    return this.api.get<any>(`/products/${itemId}`).pipe(
      map(item => this.mapItem(item))
    );
  }

  createItem(item: Partial<Item>): Observable<Item> {
    const payload = this.mapOutgoingItem(item);
    return this.api.post<any>('/products', payload).pipe(
      map(res => this.mapItem(res))
    );
  }

  updateItem(itemId: string, item: Partial<Item>): Observable<Item> {
    const payload = this.mapOutgoingItem(item);
    return this.api.put<any>(`/products/${itemId}`, payload).pipe(
      map(res => this.mapItem(res))
    );
  }

  deleteItem(itemId: string): Observable<void> {
    return this.api.delete<void>(`/products/${itemId}`);
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
        : (backendItem.quantity !== undefined ? backendItem.quantity : 10),
      category: backendItem.category || 'Tools',
      imageUrl: backendItem.imageUrl || '',
      status: backendItem.status || 'active',
      createdAt: backendItem.createdAt || new Date().toISOString()
    };
  }

  private mapOutgoingItem(item: Partial<Item>): any {
    return {
      name: item.title, // Map frontend title to backend name
      description: item.description,
      price: item.price,
      stockQuantity: item.stockQuantity,
      category: item.category,
      imageUrl: item.imageUrl,
      status: item.status
    };
  }
}
