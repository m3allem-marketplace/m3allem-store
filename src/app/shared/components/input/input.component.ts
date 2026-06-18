import { Component, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  standalone: false
})
export class InputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() errorMessage: string = '';

  value: any = '';
  isDisabled = false;
  isFocused = false;

  onChange = (value: any) => {};
  onTouched = () => {};

  constructor(@Optional() @Self() public controlDir: NgControl) {
    if (this.controlDir) {
      this.controlDir.valueAccessor = this;
    }
  }

  get isInvalid(): boolean {
    return !!(this.controlDir && this.controlDir.invalid && this.controlDir.touched);
  }

  get isValid(): boolean {
    return !!(this.controlDir && this.controlDir.valid && this.controlDir.touched && this.value);
  }

  writeValue(value: any): void {
    this.value = value !== undefined && value !== null ? value : '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  handleInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }

  handleBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  handleFocus(): void {
    this.isFocused = true;
  }
}
