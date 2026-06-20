import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { InventoryService } from '../../services/inventory.service';
import { Item } from '../../../../shared/models/item.model';

@Component({
  selector: 'app-inventory',
  standalone: false,
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  items: Item[] = [];
  isLoading: boolean = false;
  supplierId: string | null = null;

  editingItemId: string | null = null;
  editForm: Partial<Item> = {};

  constructor(
    private authService: AuthService,
    private inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.supplierId = user._id;
        this.loadInventory();
      }
    });
  }

  loadInventory(): void {
    if (!this.supplierId) return;
    this.isLoading = true;
    this.inventoryService.getInventory(this.supplierId).subscribe({
      next: (res) => {
        this.items = res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  startEdit(item: Item): void {
    this.editingItemId = item._id;
    this.editForm = { ...item };
  }

  cancelEdit(): void {
    this.editingItemId = null;
    this.editForm = {};
  }

  saveEdit(): void {
    if (!this.editingItemId) return;

    this.inventoryService.updateItem(this.editingItemId, this.editForm).subscribe({
      next: (updatedItem) => {
        const index = this.items.findIndex(i => i._id === this.editingItemId);
        if (index > -1) {
          this.items[index] = { ...this.items[index], ...updatedItem };
        }
        this.editingItemId = null;
        this.editForm = {};
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  deleteItem(item: Item): void {
    if (window.confirm('Are you sure you want to delete this item?')) {
      this.inventoryService.deleteItem(item._id).subscribe(() => {
        this.items = this.items.filter(i => i._id !== item._id);
      });
    }
  }
}
