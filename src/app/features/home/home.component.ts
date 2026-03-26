import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PollService } from '../../core/services/poll.service';
import { Poll, PollTab } from '../../core/models/poll.model';
import { PollCardComponent } from '../../shared/components/poll-card/poll-card.component';
import { UrgentPollsComponent } from '../../shared/components/urgent-polls/urgent-polls.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PollCardComponent, UrgentPollsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  readonly activeTab = signal<PollTab>('active');
  readonly selectedCategory = signal<string | null>(null);
  readonly showCategoryMenu = signal(false);
  readonly categories = ['Team Activities', 'Health & Wellness', 'Gaming & Entertainment', 'Education & Learning', 'Lifestyle & Preferences', 'Technology & Innovation'];
  readonly isIllustrationHovered = signal(false);
  readonly isCtaHovered = signal(false);

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
  /** Navigates to the create survey page. */
  openCreateModal(): void {
    this.router.navigate(['/create']);
  }
  /** Navigates to the detail page of the given poll. */
  navigateToPoll(poll: Poll): void {
    this.router.navigate(['/poll', poll.id]);
  }
}
