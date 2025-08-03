export interface CreateAnswerDto {
  text: string;
}

export interface CreateQuestionDto {
  text: string;
  difficulty: Difficulty;
  correctAnswerIndex: number;
  subjectId: number;
  answersList: CreateAnswerDto[];
}



export enum Difficulty {
  Easy = 0,
  Medium = 1,
  Hard = 2
}

export interface Subject {
  id: number;
  name: string;
}