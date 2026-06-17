import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputComponent } from './components/input/input.component';

@NgModule({
  declarations: [
    InputComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    InputComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class SharedModule { }
