import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-submit-item',
  standalone: false,
  templateUrl: './submit-item.component.html',
  styleUrls: ['./submit-item.component.css']
})
export class SubmitItemComponent implements OnInit {
  itemForm!: FormGroup;
  isEditMode = false;
  itemId: string | null = null;
  isSubmitting = false;
  isLoadingItem = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      price: [null, [Validators.required, Validators.min(0)]],
      stockQuantity: [null, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      imageUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      status: ['active', [Validators.required]]
    });

    this.itemId = this.route.snapshot.paramMap.get('itemId');
    if (this.itemId) {
      this.isEditMode = true;
      this.loadItem(this.itemId);
    }
  }

  private loadItem(itemId: string): void {
    this.isLoadingItem = true;
    this.errorMessage = '';
    this.inventoryService.getItemById(itemId).subscribe({
      next: (item) => {
        this.itemForm.patchValue({
          title: item.title,
          description: item.description,
          price: item.price,
          stockQuantity: item.stockQuantity,
          category: item.category,
          imageUrl: item.imageUrl || '',
          status: item.status
        });
        this.isLoadingItem = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load item data.';
        this.isLoadingItem = false;
      }
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.itemForm.value;

    if (this.isEditMode && this.itemId) {
      this.inventoryService.updateItem(this.itemId, formValue).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['../inventory'], { relativeTo: this.route });
        },
        error: () => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to update item. Please try again.';
        }
      });
    } else {
      this.inventoryService.createItem(formValue).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['../inventory'], { relativeTo: this.route });
        },
        error: () => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to create item. Please try again.';
        }
      });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.itemForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'This field is required.';
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} characters required.`;
    if (control.errors['min']) return `Value must be at least ${control.errors['min'].min}.`;
    if (control.errors['pattern']) return 'Please enter a valid URL.';

    return '';
  }
}
