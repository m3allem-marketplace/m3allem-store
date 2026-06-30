import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // We need RouterModule because of routerLink in header
import { ButtonComponent } from './components/button/button.component';
import { InputComponent } from './components/input/input.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { HeaderComponent } from './components/header/header';

@NgModule({
  declarations: [ButtonComponent, InputComponent, SpinnerComponent, HeaderComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  exports: [
    ButtonComponent,
    InputComponent,
    SpinnerComponent,
    HeaderComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class SharedModule {}
