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
    @if (showSuccessOverlay()) {
      <div class="success-overlay" (click)="closeSuccessOverlay()">
        <div class="success-overlay__box" (click)="$event.stopPropagation()">
          <div class="success-overlay__row">
            <p class="success-overlay__text">Your survey was created successfully!</p>
            <button class="success-overlay__close" type="button" (click)="closeSuccessOverlay()" aria-label="Close">
              <img src="close.png" alt="close" style="width:24px;height:24px;">
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './app.scss',
})
export class App {
  readonly isLightPage = signal(false);
  readonly showModal = signal(false);
  readonly showSuccessOverlay = signal(false);
  private createdPollId: string | null = null;

  constructor(private readonly router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      this.isLightPage.set(e.urlAfterRedirects.startsWith('/poll/'));
    });
  }

  onPollCreated(pollId: string): void {
    this.showModal.set(false);
    this.createdPollId = pollId;
    this.showSuccessOverlay.set(true);
  }

  closeSuccessOverlay(): void {
    this.showSuccessOverlay.set(false);
    if (this.createdPollId) {
      this.router.navigate(['/poll', this.createdPollId]);
    }
  }
}
