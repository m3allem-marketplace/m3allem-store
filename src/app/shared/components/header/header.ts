import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EcommerceService } from '../../../features/ecommerce/services/ecommerce.service';

export interface CategoryCard {
  label: string;
  english: string;
  paths: string[];
  imageUrl: string;
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  standalone: false
})
export class HeaderComponent implements OnInit {
  @Input() selectedCategory = 'الكل';
  @Input() searchControl = new FormControl('');
  
  @Output() categorySelected = new EventEmitter<string>();
  @Output() cartOpened = new EventEmitter<void>();
  
  cartCount$: Observable<number>;

  categoryCards: CategoryCard[] = [
    {
      label: 'سباكة', english: 'Plumbing', color: '#60a5fa', bgColor: 'rgba(96, 165, 250, 0.1)',
      imageUrl: '/assets/images/categories/plumbing.jpg',
      paths: ['M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z']
    },
    {
      label: 'نجارة', english: 'Carpentry', color: '#fbbf24', bgColor: 'rgba(251, 191, 36, 0.1)',
      imageUrl: '/assets/images/categories/carpentry.jpg',
      paths: [
        'm15 12-8.5 8.5c-.83.83-2.17.83-3 0v0a2.12 2.12 0 0 1 0-3L12 9',
        'm18 15 4-4',
        'm21.5 11.5-1.914-1.914A2 2 0 0 0 18.172 9v0a2 2 0 0 1-2-1.828l-.07-.586a2 2 0 0 0-1.564-1.739l-1.076-.241a1 1 0 0 0-1.08.43l-.307.46a1 1 0 0 0 .537 1.51l.73.243a2 2 0 0 1 1.197 2.795l-.15.3'
      ]
    },
    {
      label: 'سيراميك', english: 'Ceramics', color: '#2dd4bf', bgColor: 'rgba(45, 212, 191, 0.1)',
      imageUrl: '/assets/images/categories/ceramics.jpg',
      paths: ['M3 3h7v7H3V3z', 'M14 3h7v7h-7V3z', 'M14 14h7v7h-7v-7z', 'M3 14h7v7H3v-7z']
    },
    {
      label: 'دهانات', english: 'Painting', color: '#a78bfa', bgColor: 'rgba(167, 139, 250, 0.1)',
      imageUrl: '/assets/images/categories/painting.jpg',
      paths: [
        'm9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08',
        'M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1 1 2.48 1 3.5 1 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-2.5-2z'
      ]
    },
    {
      label: 'كهربا', english: 'Electrical', color: '#fb923c', bgColor: 'rgba(251, 146, 60, 0.1)',
      imageUrl: '/assets/images/categories/electrical.jpg',
      paths: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z']
    },
    {
      label: 'تكييف', english: 'HVAC', color: '#38bdf8', bgColor: 'rgba(56, 189, 248, 0.1)',
      imageUrl: '/assets/images/categories/airconditioning.jpg',
      paths: [
        'M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2',
        'M9.6 4.6A2 2 0 1 1 11 8H2',
        'M12.6 19.4A2 2 0 1 0 14 16H2'
      ]
    },
    {
      label: 'تنظيف', english: 'Cleaning', color: '#4ade80', bgColor: 'rgba(74, 222, 128, 0.1)',
      imageUrl: '/assets/images/categories/cleaning.jpg',
      paths: [
        'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09z',
        'M18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456z'
      ]
    },
  ];

  constructor(
    private ecommerceService: EcommerceService,
    private router: Router
  ) {
    this.cartCount$ = this.ecommerceService.cartCount$;
  }

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchVal => {
      const val = (searchVal || '').trim();
      const currentUrl = this.router.url;
      if (!currentUrl.includes('storefront') && currentUrl !== '/' && val) {
        this.router.navigate(['/ecommerce/storefront'], { queryParams: { search: val } });
      }
    });
  }

  selectCategory(category: string): void {
    const currentUrl = this.router.url;
    if (!currentUrl.includes('storefront') && currentUrl !== '/') {
      this.router.navigate(['/ecommerce/storefront'], { queryParams: { category } });
    } else {
      this.selectedCategory = category;
      this.categorySelected.emit(category);
    }
  }

  openCart(): void {
    this.cartOpened.emit();
  }
}
