import { Injectable, signal } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Poll, PollOption, CreatePollData, SOON_ENDING_HOURS } from '../models/poll.model';
@Injectable({ providedIn: 'root' })
export class PollService {
  readonly polls = signal<Poll[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  private readonly supabase: SupabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }
  /** Fetches all polls with their options from Supabase. */
  async loadPolls(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    const { data, error } = await this.supabase
      .from('polls')
      .select('*, options(*)')
      .order('created_at', { ascending: false });

    if (error) {
      this.error.set(error.message);
    } else {
      this.polls.set(data as Poll[]);
    }

    this.isLoading.set(false);
  }
  /** Active polls are those not yet past their deadline. */
  getActivePolls(): Poll[] {
    return this.polls().filter((poll) => this.isPollActive(poll));
  }
  /** Polls that are either inactive or past their deadline. */
  getPastPolls(): Poll[] {
    return this.polls().filter((poll) => !this.isPollActive(poll));
  }
  /** Polls ending within the next 48 hours, sorted by deadline. */
  getUrgentPolls(): Poll[] {
    const now = new Date();
    const threshold = new Date(now.getTime() + SOON_ENDING_HOURS * 60 * 60 * 1000);
    return this.getActivePolls()
      .filter((poll) => poll.deadline !== null && new Date(poll.deadline) <= threshold)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  }
  /** Creates a poll and inserts all answer options in one flow. */
  async createPoll(data: CreatePollData): Promise<Poll | null> {
    const pollResult = await this.supabase
      .from('polls')
      .insert({ title: data.title, description: data.description, deadline: data.deadline, is_active: true, category: data.category })
      .select()
      .single();

    if (pollResult.error) {
      this.error.set(pollResult.error.message);
      return null;
    }

    const poll = pollResult.data as Poll;
    await this.insertOptions(poll.id, data.options);
    await this.loadPolls();
    return poll;
  }
  /** Bulk-inserts all answer options for a newly created poll. */
  private async insertOptions(pollId: string, options: string[]): Promise<void> {
    const rows = options.map((text) => ({ poll_id: pollId, text, vote_count: 0 }));
    await this.supabase.from('options').insert(rows);
  }
  /** Inserts the vote record and increments the option count via RPC. */
  async vote(pollId: string, optionId: string): Promise<boolean> {
    const voterId = this.getVoterId();
    const { error: voteError } = await this.supabase
      .from('votes')
      .insert({ poll_id: pollId, option_id: optionId, voter_identifier: voterId });

    if (voteError) return false;

    await this.supabase.rpc('increment_vote_count', { option_id_param: optionId });
    await this.loadPolls();
    return true;
  }
  /** Checks by voter ID (stored in localStorage) whether this user already voted. */
  async hasVoted(pollId: string): Promise<boolean> {
    const voterId = this.getVoterId();
    const { data } = await this.supabase
      .from('votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('voter_identifier', voterId)
      .maybeSingle();

    return data !== null;
  }
  /** Returns the option ID the user voted for, or null if not voted yet. */
  async getVotedOption(pollId: string): Promise<string | null> {
    const voterId = this.getVoterId();
    const { data } = await this.supabase
      .from('votes')
      .select('option_id')
      .eq('poll_id', pollId)
      .eq('voter_identifier', voterId)
      .maybeSingle();

    return data?.option_id ?? null;
  }
  /** Subscribes to live vote inserts via Supabase Realtime. Returns an unsubscribe function. */
  subscribeToVotes(pollId: string, onUpdate: () => void): () => void {
    const channel = this.supabase
      .channel('votes-' + pollId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes', filter: 'poll_id=eq.' + pollId }, onUpdate)
      .subscribe();

    return () => this.supabase.removeChannel(channel);
  }
  /** A poll without a deadline stays active indefinitely. */
  private isPollActive(poll: Poll): boolean {
    if (!poll.is_active) return false;
    if (!poll.deadline) return true;
    return new Date(poll.deadline) > new Date();
  }
  /** Lazily creates and persists a UUID in localStorage to identify anonymous voters. */
  private getVoterId(): string {
    const KEY = 'poll_voter_id';
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  }
}
