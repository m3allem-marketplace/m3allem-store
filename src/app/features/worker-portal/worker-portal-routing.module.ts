import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PortalHomeComponent } from './pages/portal-home/portal-home.component';
import { JobDetailsComponent } from './pages/job-details/job-details.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'portal-home',
    pathMatch: 'full'
  },
  {
    path: 'portal-home',
    component: PortalHomeComponent
  },
  {
    path: 'job-details/:id',
    component: JobDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkerPortalRoutingModule {}