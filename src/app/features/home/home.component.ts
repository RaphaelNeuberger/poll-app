import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PollService } from '../../core/services/poll.service';
import { Poll, PollTab } from '../../core/models/poll.model';
import { PollCardComponent } from '../../shared/components/poll-card/poll-card.component';
import { UrgentPollsComponent } from '../../shared/components/urgent-polls/urgent-polls.component';
import { CreatePollModalComponent } from '../../shared/components/create-poll-modal/create-poll-modal.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PollCardComponent, UrgentPollsComponent, CreatePollModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  readonly activeTab = signal<PollTab>('active');
  readonly selectedCategory = signal<string | null>(null);
  readonly showCategoryMenu = signal(false);
  readonly categories = ['Team Activities', 'Health & Wellness', 'Gaming & Entertainment', 'Education & Learning', 'Lifestyle & Preferences', 'Technology & Innovation'];
  readonly showCreateModal = signal(false);
  readonly isIllustrationHovered = signal(false);
  readonly showSuccessOverlay = signal(false);
  createdPollId: string | null = null;

  constructor(
    readonly pollService: PollService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.pollService.loadPolls();
  }
  /** Combines the active/past tab with the optional category filter. */
  getDisplayedPolls(): Poll[] {
    const polls = this.activeTab() === 'active'
      ? this.pollService.getActivePolls()
      : this.pollService.getPastPolls();
    const cat = this.selectedCategory();
    if (!cat) return polls;
    return polls.filter(p => p.category === cat);
  }

  /** Toggles the category dropdown open/closed. */
  toggleCategoryMenu(): void {
    this.showCategoryMenu.set(!this.showCategoryMenu());
  }

  /** Applies the category filter and closes the dropdown. */
  selectCategory(cat: string | null): void {
    this.selectedCategory.set(cat);
    this.showCategoryMenu.set(false);
  }
  /** Switches between active and past survey tabs. */
  switchTab(tab: PollTab): void {
    this.activeTab.set(tab);
  }
  /** Opens the create survey modal. */
  openCreateModal(): void {
    this.showCreateModal.set(true);
  }
  /** Closes the create survey modal without saving. */
  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }
  /** Shows the success overlay once a poll has been saved. */
  onPollCreated(pollId: string): void {
    this.createdPollId = pollId;
    this.showCreateModal.set(false);
    this.showSuccessOverlay.set(true);
  }
  /** Closes the overlay and navigates directly to the new poll. */
  closeSuccessOverlay(): void {
    this.showSuccessOverlay.set(false);
    if (this.createdPollId) {
      this.router.navigate(['/poll', this.createdPollId]);
    }
  }
  /** Navigates to the detail page of the given poll. */
  navigateToPoll(poll: Poll): void {
    this.router.navigate(['/poll', poll.id]);
  }
}
