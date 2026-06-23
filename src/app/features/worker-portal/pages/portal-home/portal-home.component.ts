import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { WorkerService, Job } from '../../services/worker.service';

@Component({
  selector: 'app-portal-home',
  templateUrl: './portal-home.component.html',
  styleUrls: ['./portal-home.component.css'],
  standalone: false
})
export class PortalHomeComponent implements OnInit {

  isLoading = true;

  availableGigs: Job[] = [];
  activeContracts: Job[] = [];

  workerId = 'w1';

  constructor(
    private workerService: WorkerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      gigs: this.workerService.getAvailableGigs(),
      contracts: this.workerService.getActiveContracts(this.workerId)
    }).subscribe({
      next: ({ gigs, contracts }) => {
        this.availableGigs = gigs;
        this.activeContracts = contracts;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  navigateToJobDetails(jobId: string): void {
    this.router.navigate(['/worker-portal/job-details', jobId]);
  }
}