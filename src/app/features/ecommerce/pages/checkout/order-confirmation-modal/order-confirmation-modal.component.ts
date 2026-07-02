import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { OrderReceipt, CartItem } from '../../../services/ecommerce.service';

@Component({
  selector: 'app-order-confirmation-modal',
  templateUrl: './order-confirmation-modal.component.html',
  styleUrls: ['./order-confirmation-modal.component.css'],
  standalone: false
})
export class OrderConfirmationModalComponent {
  @Input() receipt!: OrderReceipt;
  @Input() cartItems: CartItem[] = [];
  @Input() grandTotal = 0;
  @Output() closed = new EventEmitter<void>();

  close(): void { this.closed.emit(); }
}