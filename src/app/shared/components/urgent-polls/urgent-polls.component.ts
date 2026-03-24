import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Poll } from '../../../core/models/poll.model';
@Component({
  selector: 'app-urgent-polls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './urgent-polls.component.html',
  styleUrl: './urgent-polls.component.scss',
})
export class UrgentPollsComponent {
  @Input({ required: true }) polls!: Poll[];
  @Output() pollSelected = new EventEmitter<Poll>();
  /** Forwards the selected poll to the parent via event emitter. */
  selectPoll(poll: Poll): void {
    this.pollSelected.emit(poll);
  }
  /** Rounds up to full days; shows "Ending today" for anything under 24 h. */
  getEndsInText(deadline: string): string {
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Ending today';
    return `Ends in ${days} ${days === 1 ? 'Day' : 'Days'}`;
  }
}
