import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonProgressBar,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, refresh, home, checkmarkCircle, closeCircle } from 'ionicons/icons';
import { QuizService } from '../services/quiz.service';
import { Question, QuizResults } from '../models/question.model';

@Component({
  selector: 'app-quiz',
  templateUrl: 'quiz.page.html',
  styleUrls: ['quiz.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonProgressBar,
    IonButtons,
  ],
})
export class QuizPage implements OnInit {
  private router = inject(Router);
  private quizService = inject(QuizService);

  question: Question | null = null;
  currentIndex = 0;
  totalQuestions = 0;
  selectedOption: string | null = null;
  isAnswered = false;
  isCorrect = false;
  explanation = '';
  showResults = false;
  results: QuizResults | null = null;
  loading = true;

  constructor() {
    addIcons({ arrowBack, refresh, home, checkmarkCircle, closeCircle });
  }

  ngOnInit() {
    this.quizService.loadQuestions().subscribe({
      next: (questions) => {
        this.quizService.init(questions);
        this.startQuiz();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private startQuiz() {
    this.showResults = false;
    this.currentIndex = this.quizService.getCurrentIndex();
    this.totalQuestions = this.quizService.getTotalQuestions();
    this.loadQuestion();
  }

  private loadQuestion() {
    this.question = this.quizService.getCurrentQuestion();
    this.currentIndex = this.quizService.getCurrentIndex();
    this.selectedOption = null;
    this.isAnswered = false;
    this.isCorrect = false;
    this.explanation = '';
  }

  selectOption(optionId: string) {
    if (this.isAnswered) return;

    this.selectedOption = optionId;
    const result = this.quizService.selectAnswer(optionId);
    this.isCorrect = result.correct;
    this.explanation = result.explanation;
    this.isAnswered = true;
  }

  next() {
    const hasMore = this.quizService.nextQuestion();
    if (hasMore) {
      this.loadQuestion();
    } else {
      this.results = this.quizService.getResults();
      this.showResults = true;
    }
  }

  restart() {
    this.quizService.restart();
    this.startQuiz();
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
