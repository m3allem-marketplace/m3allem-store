import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
  standalone: false
})
export class ButtonComponent {
  @Input() label: string = 'Submit';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() isLoading: boolean = false;
  @Input() disabled: boolean = false;

  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.isLoading && !this.disabled) {
      this.clicked.emit();
    }
  }
}
