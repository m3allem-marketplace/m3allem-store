import { Component } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App { 
  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        console.log('NavigationStart:', event.url);
      }
      if (event instanceof NavigationEnd) {
        console.log('NavigationEnd:', event.url);
      }
      if (event instanceof NavigationCancel) {
        console.warn('NavigationCancel:', event.url, event.reason);
      }
      if (event instanceof NavigationError) {
        console.error('NavigationError:', event.url, event.error);
      }
    });
  }
}

