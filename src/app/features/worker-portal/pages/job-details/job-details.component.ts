import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkerService, JobStatus } from '../../services/worker.service';

@Component({
  selector: 'app-job-details',
  standalone: false,
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit {

  jobId!: string;
  job: any = null;

  isLoading = true;
  isUpdating = false;
  errorMessage: string | null = null;

  showConfirmPopup = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.jobId = params['id'];
      this.fetchJobDetails();
    });
  }

  fetchJobDetails(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.workerService.getJobById(this.jobId).subscribe({
      next: (data) => {
        this.job = data;

        if (this.job?.checklist) {
          this.job.checklist = this.job.checklist.map((task: any) => {
            return typeof task === 'string'
              ? {
                  task,
                  completed: false
                }
              : task;
          });
        }

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage =
          'عذراً، فشل تحميل تفاصيل الوظيفة. يرجى المحاولة مرة أخرى.';
        this.isLoading = false;
      }
    });
  }

  toggleTask(index: number): void {
    if (!this.job) return;

    if (this.job.status.toLowerCase() === 'completed') {
      return;
    }

    this.job.checklist[index].completed =
      !this.job.checklist[index].completed;
  }

  onActionClick(): void {
    if (!this.job) return;

    const currentStatus = this.job.status.toLowerCase();

    if (currentStatus === 'available') {
      this.updateJobStatus('in-progress');
      return;
    }

    if (
      currentStatus === 'in-progress' ||
      currentStatus === 'inprogress'
    ) {
      this.showConfirmPopup = true;
    }
  }

  confirmCompletion(): void {
    this.showConfirmPopup = false;
    this.updateJobStatus('completed');
  }

  closePopup(): void {
    this.showConfirmPopup = false;
  }

  updateJobStatus(newStatus: JobStatus): void {
    this.isUpdating = true;
    this.errorMessage = null;

    this.workerService.updateJobStatus(
      this.jobId,
      newStatus
    ).subscribe({
      next: (updatedJob) => {
        this.job = updatedJob;
        this.isUpdating = false;
      },
      error: () => {
        this.isUpdating = false;
        this.errorMessage =
          'حدث خطأ أثناء تحديث حالة الوظيفة، يرجى المحاولة مرة أخرى.';
      }
    });
  }

  backToDashboard(): void {
    this.router.navigate(['/worker-portal/portal-home']);
  }
}