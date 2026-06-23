import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { App } from './app';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { SupplierDashboardModule } from './features/supplier-dashboard/supplier-dashboard.module';

import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

@NgModule({
  declarations: [
    App
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    ReactiveFormsModule,
    SupplierDashboardModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideHttpClient(
      withInterceptorsFromDi()
    ),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule {}