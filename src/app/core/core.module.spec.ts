import { TestBed } from '@angular/core/testing';
import { CoreModule } from './core.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { AuthService } from './services/auth.service';
import { describe, it, expect } from 'vitest';

describe('CoreModule', () => {
  it('should be created and register JwtInterceptor', () => {
    const mockAuthService = {
      getJwtToken: () => null
    };

    TestBed.configureTestingModule({
      imports: [CoreModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    const interceptors = TestBed.inject(HTTP_INTERCEPTORS);
    const hasJwtInterceptor = interceptors.some(interceptor => interceptor instanceof JwtInterceptor);
    expect(hasJwtInterceptor).toBe(true);
  });

  it('should throw an error if CoreModule is imported twice', () => {
    expect(() => {
      const parentModule = new CoreModule(null as any);
      new CoreModule(parentModule);
    }).toThrowError('CoreModule already loaded. Import only in AppModule.');
  });
});
