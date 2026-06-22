import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { WorkerPortalRoutingModule } from './worker-portal-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { PortalHomeComponent } from './pages/portal-home/portal-home.component';
import { JobDetailsComponent } from './pages/job-details/job-details.component';

@NgModule({
  declarations: [
    PortalHomeComponent,
    JobDetailsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WorkerPortalRoutingModule,
    SharedModule
  ]
})
export class WorkerPortalModule {}