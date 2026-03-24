import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PollService } from '../../core/services/poll.service';
import { Poll, PollOption } from '../../core/models/poll.model';
@Component({
  selector: 'app-poll-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poll-detail.component.html',
  styleUrl: './poll-detail.component.scss',
})
export class PollDetailComponent implements OnInit, OnDestroy {
  poll = signal<Poll | null>(null);
  hasVoted = signal(false);
  votedOptionId = signal<string | null>(null);
  isVoting = signal(false);

  private unsubscribeRealtime: (() => void) | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    protected readonly pollService: PollService
  ) {}

  async ngOnInit(): Promise<void> {
    const pollId = this.route.snapshot.paramMap.get('id');
    if (!pollId) {
      this.router.navigate(['/']);
      return;
    }
    await this.loadPollData(pollId);
    await this.checkVoteStatus(pollId);
    this.subscribeToUpdates(pollId);
  }

  ngOnDestroy(): void {
    this.unsubscribeRealtime?.();
  }
  /** Sum of all vote counts across options. */
  getTotalVotes(): number {
    return this.poll()?.options.reduce((sum, opt) => sum + opt.vote_count, 0) ?? 0;
  }
  /** Returns 0 if no votes yet to avoid division by zero. */
  getOptionPercentage(option: PollOption): number {
    const total = this.getTotalVotes();
    if (total === 0) return 0;
    return Math.round((option.vote_count / total) * 100);
  }
  /** Guards against double-voting, then delegates to the service. */
  async castVote(optionId: string): Promise<void> {
    if (this.hasVoted() || this.isVoting()) return;
    this.isVoting.set(true);
    const pollId = this.poll()?.id ?? '';
    const success = await this.pollService.vote(pollId, optionId);
    if (success) {
      this.hasVoted.set(true);
      this.votedOptionId.set(optionId);
      await this.loadPollData(pollId);
    }
    this.isVoting.set(false);
  }
  /** Navigates back to the home screen. */
  goBack(): void {
    this.router.navigate(['/']);
  }
  /** Converts a zero-based index to A, B, C, D... for display. */
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
  /** True when the deadline has passed, used to disable voting. */
  isPollPast(): boolean {
    const deadline = this.poll()?.deadline;
    if (!deadline) return false;
    return new Date(deadline) <= new Date();
  }
  /** Formats the deadline date for the detail view header. */
  getDeadlineText(): string {
    const deadline = this.poll()?.deadline;
    if (!deadline) return 'No deadline';
    return new Date(deadline).toLocaleDateString('de-DE', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }
  /** Reloads all polls and picks the one matching the current route ID. */
  private async loadPollData(pollId: string): Promise<void> {
    await this.pollService.loadPolls();
    const found = this.pollService.polls().find((p) => p.id === pollId) ?? null;
    this.poll.set(found);
  }
  /** Restores the voted state on page load so returning users see their choice. */
  private async checkVoteStatus(pollId: string): Promise<void> {
    const voted = await this.pollService.hasVoted(pollId);
    this.hasVoted.set(voted);
    if (voted) {
      const optionId = await this.pollService.getVotedOption(pollId);
      this.votedOptionId.set(optionId);
    }
  }
  /** Wires up realtime updates so results refresh without a page reload. */
  private subscribeToUpdates(pollId: string): void {
    this.unsubscribeRealtime = this.pollService.subscribeToVotes(pollId, async () => {
      await this.loadPollData(pollId);
    });
  }
}