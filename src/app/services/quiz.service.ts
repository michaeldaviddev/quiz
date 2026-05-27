import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Question, QuizResults, DomainScore } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private http = inject(HttpClient);

  private allQuestions: Question[] = [];
  private shuffledQuestions: Question[] = [];
  private currentIndex = 0;
  private answers = new Map<number, string>();

  loaded = false;

  loadQuestions() {
    return this.http.get<Question[]>('assets/questions.json');
  }

  init(questions: Question[]) {
    this.allQuestions = questions;
    this.shuffleQuestions();
    this.loaded = true;
  }

  private shuffleQuestions() {
    this.shuffledQuestions = [...this.allQuestions];
    for (let i = this.shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledQuestions[i], this.shuffledQuestions[j]] = [
        this.shuffledQuestions[j],
        this.shuffledQuestions[i],
      ];
    }
    this.currentIndex = 0;
    this.answers.clear();
  }

  getCurrentQuestion(): Question | null {
    if (this.currentIndex >= this.shuffledQuestions.length) return null;
    return this.shuffledQuestions[this.currentIndex];
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getTotalQuestions(): number {
    return this.shuffledQuestions.length;
  }

  selectAnswer(optionId: string): { correct: boolean; explanation: string } {
    const question = this.getCurrentQuestion();
    if (!question) return { correct: false, explanation: '' };

    this.answers.set(question.question_number, optionId);
    const correct = optionId === question.correct_answer;
    return { correct, explanation: question.explanation };
  }

  hasAnswered(questionNumber: number): boolean {
    return this.answers.has(questionNumber);
  }

  getSelectedAnswer(questionNumber: number): string | undefined {
    return this.answers.get(questionNumber);
  }

  nextQuestion(): boolean {
    this.currentIndex++;
    return this.currentIndex < this.shuffledQuestions.length;
  }

  getResults(): QuizResults {
    let correct = 0;
    const domainMap = new Map<string, { correct: number; total: number }>();

    for (const question of this.shuffledQuestions) {
      const selected = this.answers.get(question.question_number);
      const isCorrect = selected === question.correct_answer;

      if (isCorrect) correct++;

      const domain = question.domain;
      if (!domainMap.has(domain)) {
        domainMap.set(domain, { correct: 0, total: 0 });
      }
      const d = domainMap.get(domain)!;
      d.total++;
      if (isCorrect) d.correct++;
    }

    const domains: DomainScore[] = Array.from(domainMap.entries()).map(
      ([domain, score]) => ({
        domain,
        correct: score.correct,
        total: score.total,
      })
    );

    const total = this.shuffledQuestions.length;

    return {
      overall: {
        correct,
        total,
        percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
      },
      domains,
    };
  }

  restart() {
    this.shuffleQuestions();
  }
}
