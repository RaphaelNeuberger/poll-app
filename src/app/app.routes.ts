import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'PollApp – Surveys',
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./shared/components/create-poll-modal/create-poll-modal.component').then((m) => m.CreatePollModalComponent),
    title: 'PollApp – New Survey',
  },
  {
    path: 'poll/:id',
    loadComponent: () =>
      import('./features/poll-detail/poll-detail.component').then(
        (m) => m.PollDetailComponent
      ),
    title: 'PollApp – Survey Detail',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
