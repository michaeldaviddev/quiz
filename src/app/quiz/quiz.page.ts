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
  selectedOptions: string[] = [];
  isAnswered = false;
  isCorrect = false;
  explanation = '';
  correctAnswerIds: string[] = [];
  showResults = false;
  results: QuizResults | null = null;
  loading = true;

  constructor() {
    addIcons({ arrowBack, refresh, home, checkmarkCircle, closeCircle });
  }

  ngOnInit() {
    this.quizService.loadQuestions().subscribe({
      next: (questions) => {
        // Filtro temporal para pruebas: solo cargar preguntas con respuesta multiple
        // this.quizService.init(questions.filter((q) => this.quizService.isMultipleAnswer(q)));
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
    this.selectedOptions = [];
    this.isAnswered = false;
    this.isCorrect = false;
    this.explanation = '';
    this.correctAnswerIds = this.question ? this.quizService.getCorrectAnswerIds(this.question) : [];
  }

  selectOption(optionId: string) {
    const question = this.question;
    if (!question) return;

    if (this.quizService.isMultipleAnswer(question)) {
      this.selectedOptions = this.selectedOptions.includes(optionId)
        ? this.selectedOptions.filter((id) => id !== optionId)
        : [...this.selectedOptions, optionId];

      const requiredAnswers = this.quizService.getCorrectAnswerIds(question).length;
      const isReady = this.selectedOptions.length >= requiredAnswers;

      if (isReady) {
        const result = this.quizService.selectAnswer(question.question_number, this.selectedOptions);
        this.isAnswered = true;
        this.isCorrect = result.correct;
        this.explanation = result.explanation;
      } else {
        this.isAnswered = false;
        this.isCorrect = false;
        this.explanation = '';
      }
      return;
    }

    if (this.isAnswered) return;

    this.selectedOptions = [optionId];
    const result = this.quizService.selectAnswer(question.question_number, [optionId]);
    this.isAnswered = true;
    this.isCorrect = result.correct;
    this.explanation = result.explanation;
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
