import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CreatePollModalComponent } from './shared/components/create-poll-modal/create-poll-modal.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CreatePollModalComponent],
  template: `
    <header class="app-nav" [class.app-nav--light]="isLightPage()">
      <div class="app-nav__inner">
        <a class="app-nav__logo" routerLink="/" aria-label="PollApp home">
          <img [src]="isLightPage() ? 'logo_dark.svg' : 'logo.svg'" alt="Poll App" class="app-nav__logo-img" width="119" height="50">
        </a>
        @if (isLightPage()) {
          <button class="app-nav__create-btn" type="button" (click)="showModal.set(true)">Create survey</button>
        }
      </div>
    </header>
    <router-outlet></router-outlet>
    @if (showModal()) {
      <app-create-poll-modal
        (closed)="showModal.set(false)"
        (pollCreated)="onPollCreated($event)"
      ></app-create-poll-modal>
    }
  `,
  styleUrl: './app.scss',
})
export class App {
  readonly isLightPage = signal(false);
  readonly showModal = signal(false);

  constructor(private readonly router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      this.isLightPage.set(e.urlAfterRedirects.startsWith('/poll/'));
    });
  }

  onPollCreated(pollId: string): void {
    this.showModal.set(false);
    this.router.navigate(['/poll', pollId]);
  }
}
