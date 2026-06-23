import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export type JobStatus =
  | 'available'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export interface ChecklistItem {
  task: string;
  completed: boolean;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  clientName: string;
  clientPhone: string;
  address: string;
  scheduledDate: string;
  estimatedHours: number;
  payAmount: number;
  status: JobStatus;
  workerId?: string;
  checklist: ChecklistItem[];
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  private readonly API_BASE = '/api';

  private mockJobs: Job[] = [
    {
      _id: 'j1',
      title: 'AC Unit Repair',
      description: 'Diagnose and fix residential AC',
      clientName: 'Ahmed Hassan',
      clientPhone: '01012345678',
      address: '12 Nasr City, Cairo',
      scheduledDate: '2026-06-20',
      estimatedHours: 3,
      payAmount: 350,
      status: 'available',
      checklist: [
        { task: 'Inspect filters', completed: false },
        { task: 'Check refrigerant', completed: false }
      ],
      createdAt: new Date().toISOString()
    },
    {
      _id: 'j2',
      title: 'Electrical Panel Check',
      description: 'Full safety inspection',
      clientName: 'Sara Khalil',
      clientPhone: '01098765432',
      address: '5 Maadi, Cairo',
      scheduledDate: '2026-06-21',
      estimatedHours: 2,
      payAmount: 200,
      status: 'in-progress',
      workerId: 'w1',
      checklist: [
        { task: 'Test circuits', completed: true }
      ],
      createdAt: new Date().toISOString()
    }
  ];

  constructor(private http: HttpClient) {}

  // Mock Phase
  getAvailableGigs(): Observable<Job[]> {
    return of(
      this.mockJobs.filter(job => job.status === 'available')
    );
  }

  getActiveContracts(workerId: string): Observable<Job[]> {
    return of(
      this.mockJobs.filter(
        job =>
          job.workerId === workerId &&
          job.status === 'in-progress'
      )
    );
  }

  getJobById(jobId: string): Observable<Job> {
    const job = this.mockJobs.find(j => j._id === jobId)!;
    return of(job);
  }

 updateJobStatus(
  jobId: string,
  status: JobStatus
): Observable<Job> {
  const job = this.mockJobs.find(j => j._id === jobId)!;

  job.status = status;

  if (status === 'in-progress' && !job.workerId) {
    job.workerId = 'w1';
  }

  return of(job);
}

  // API Phase 
  /*
  getAvailableGigs(): Observable<Job[]> {
    return this.http.get<Job[]>(
      `${this.API_BASE}/jobs?status=available`
    );
  }

  getActiveContracts(workerId: string): Observable<Job[]> {
    return this.http.get<Job[]>(
      `${this.API_BASE}/jobs?workerId=${workerId}&status=in-progress`
    );
  }

  getJobById(jobId: string): Observable<Job> {
    return this.http.get<Job>(
      `${this.API_BASE}/jobs/${jobId}`
    );
  }

  updateJobStatus(
    jobId: string,
    status: JobStatus
  ): Observable<Job> {
    return this.http.put<Job>(
      `${this.API_BASE}/jobs/${jobId}/status`,
      { status }
    );
  }
  */
}