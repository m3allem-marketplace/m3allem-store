import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Item } from '../../../shared/models/item.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private api: ApiService) { }

  getInventory(supplierId: string): Observable<Item[]> {
    return this.api.get<Item[]>(`/inventory?supplierId=${supplierId}`);
  }

  getItemById(itemId: string): Observable<Item> {
    return this.api.get<Item>(`/inventory/${itemId}`);
  }

  createItem(item: Partial<Item>): Observable<Item> {
    return this.api.post<Item>('/inventory', item);
  }

  updateItem(itemId: string, item: Partial<Item>): Observable<Item> {
    return this.api.put<Item>(`/inventory/${itemId}`, item);
  }

  deleteItem(itemId: string): Observable<void> {
    return this.api.delete<void>(`/inventory/${itemId}`);
  }
}
