import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * JwtInterceptor
 *
 * Reads the Bearer token directly from localStorage under the key 'token'
 * and attaches it as an Authorization header to every outgoing HTTP request.
 *
 * Registration: already provided via HTTP_INTERCEPTORS in CoreModule.
 * Do NOT add it again in AppModule to avoid duplicate requests.
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Read token directly from localStorage as required
    const token = localStorage.getItem('token');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}
