import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Poll } from '../../../core/models/poll.model';
@Component({
  selector: 'app-poll-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poll-card.component.html',
  styleUrl: './poll-card.component.scss',
})
export class PollCardComponent {
  @Input({ required: true }) poll!: Poll;
  @Input() isActive = true;
  @Output() cardClicked = new EventEmitter<Poll>();
  /** Ignores clicks on past polls so they stay non-interactive. */
  handleClick(): void {
    if (this.isActive) {
      this.cardClicked.emit(this.poll);
    }
  }
  /** Sums up vote counts across all options. */
  getTotalVotes(): number {
    return this.poll.options.reduce((sum, opt) => sum + opt.vote_count, 0);
  }
  /** Rounds up to the nearest day so "Ending today" shows for anything under 24 h. */
  getEndsInText(): string {
    if (!this.poll.deadline) return '';
    const diff = new Date(this.poll.deadline).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Ending today';
    return `Ends in ${days} ${days === 1 ? 'Day' : 'Days'}`;
  }
}
