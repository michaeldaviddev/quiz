import { Routes } from '@angular/router';
import { QuizExitGuard } from './guards/quiz-exit.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'quiz',
    loadComponent: () => import('./quiz/quiz.page').then((m) => m.QuizPage),
    canDeactivate: [QuizExitGuard],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
