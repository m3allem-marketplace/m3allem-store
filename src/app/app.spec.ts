import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { describe, beforeEach, it, expect } from 'vitest';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([])
      ],
      declarations: [
        App
      ],
    })
    .overrideComponent(App, {
      set: {
        template: '<h1>Hello, {{ title() }}</h1>',
        templateUrl: undefined,
        styleUrl: undefined,
        styles: []
      }
    })
    .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, m3allem-ecommerce');
  });
});

