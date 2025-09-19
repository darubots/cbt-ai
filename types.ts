
export type UserRole = 'Admin' | 'Siswa';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  password?: string; // For Admin
  nisn?: string;     // For Siswa
}

export interface Question {
  mata_pelajaran: string;
  soal: string;
  kunci_jawaban?: string;
}

export interface ExamSettings {
  startTime: string;
  endTime: string;
  subject: string;
}

export interface StudentAnswer {
  question: Question;
  answer: string;
}

export interface StudentResult {
  studentName: string;
  studentNisn: string;
  score: number;
  submissionTime: string;
  answers: StudentAnswer[];
}
