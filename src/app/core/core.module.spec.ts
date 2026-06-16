import { TestBed } from '@angular/core/testing';
import { CoreModule } from './core.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { vi, describe, it, expect } from 'vitest';

// Mock AuthService since it is not yet implemented (TASK-E1-02)
vi.mock('./services/auth.service', () => {
  return {
    AuthService: class {
      getJwtToken() { return null; }
    }
  };
});

describe('CoreModule', () => {
  it('should be created and register JwtInterceptor', () => {
    TestBed.configureTestingModule({
      imports: [CoreModule]
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
