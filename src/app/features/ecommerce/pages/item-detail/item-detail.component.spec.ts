// @vitest-environment jsdom
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EcommerceService } from '../../services/ecommerce.service';
import { ItemDetailComponent } from './item-detail.component';

@Component({ selector: 'app-header', template: '' })
class HeaderStubComponent {
  @Input() selectedCategory = 'الكل';
  @Input() searchControl: any = null;
}

@Component({ selector: 'app-cart-drawer', template: '' })
class CartDrawerStubComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() checkoutClicked = new EventEmitter<void>();
}

@Component({ selector: 'app-button', template: '' })
class ButtonStubComponent {
  @Input() label = '';
  @Input() variant = 'primary';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();
}

@Component({ selector: 'app-spinner', template: '' })
class SpinnerStubComponent {
  @Input() size = 'md';
  @Input() color = '';
}

describe('ItemDetailComponent', () => {
  let fixture: ComponentFixture<ItemDetailComponent>;
  let component: ItemDetailComponent;
  let router: { navigate: ReturnType<typeof vi.fn> };
  let cartDrawer: CartDrawerStubComponent;

  beforeEach(async () => {
    router = { navigate: vi.fn() };

    const ecommerceService = {
      getProductById: vi.fn().mockReturnValue(of({
        _id: '123',
        title: 'Test Product',
        description: 'Test description',
        price: 100,
        stockQuantity: 5,
        category: 'Tools',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        supplierId: 'supplier-1'
      })),
      addToCart: vi.fn(),
      cart$: of([])
    };

    await TestBed.configureTestingModule({
      declarations: [
        ItemDetailComponent,
        HeaderStubComponent,
        CartDrawerStubComponent,
        ButtonStubComponent,
        SpinnerStubComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({ id: '123' }) } },
        { provide: Router, useValue: router },
        { provide: EcommerceService, useValue: ecommerceService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    cartDrawer = fixture.debugElement.query(By.directive(CartDrawerStubComponent)).componentInstance;
  });

  it('navigates to checkout when the cart drawer emits checkoutClicked', () => {
    cartDrawer.checkoutClicked.emit();

    expect(router.navigate).toHaveBeenCalledWith(['/ecommerce/checkout']);
  });
});
