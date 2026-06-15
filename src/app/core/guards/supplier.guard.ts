import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SupplierGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (user && user.role === 'supplier') {
          return true;
        }
        
        // Redirect unauthorized users to login or storefront
        return this.router.createUrlTree(['/ecommerce/storefront']);
      })
    );
  }
}
