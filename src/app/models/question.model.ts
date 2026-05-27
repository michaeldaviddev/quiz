export interface Option {
  id: string;
  text: string;
}

export interface Question {
  question_number: number;
  question: string;
  options: Option[];
  domain: string;
  correct_answer: string;
  explanation: string;
}

export interface DomainScore {
  domain: string;
  correct: number;
  total: number;
}

export interface QuizResults {
  overall: {
    correct: number;
    total: number;
    percentage: number;
  };
  domains: DomainScore[];
}
