import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { App } from './app';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { SupplierDashboardModule } from './features/supplier-dashboard/supplier-dashboard.module';

// JwtInterceptor is registered once in CoreModule — no duplicate needed here

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

    // JwtInterceptor is provided via CoreModule → no re-registration needed
  ],
  bootstrap: [App]
})
export class AppModule {}