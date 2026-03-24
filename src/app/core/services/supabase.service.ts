import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }
  /** Returns the shared client instance created from environment config. */
  getClient(): SupabaseClient {
    return this.client;
  }
}
