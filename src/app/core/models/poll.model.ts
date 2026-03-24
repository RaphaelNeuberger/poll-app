/** Represents a single answer option for a poll. */
export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  vote_count: number;
}
export interface Poll {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  created_at: string;
  is_active: boolean;
  category: string | null;
  options: PollOption[];
}
export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  voter_identifier: string;
  created_at: string;
}
export interface CreatePollData {
  title: string;
  description: string | null;
  deadline: string | null;
  options: string[];
  category: string | null;
}
export type PollTab = 'active' | 'past';
export const SOON_ENDING_HOURS = 48;
