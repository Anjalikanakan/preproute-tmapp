export interface User {
  id: string;
  name?: string;
  email?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface Subject {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

export interface SubTopic {
  id: string;
  name: string;
  topic_id: string;
}

export interface Test {
  id: string;
  name: string;
  subject: string;
  subject_id?: string;
  topics: string[];
  topic_ids?: string[];
  sub_topics?: string[];
  sub_topic_ids?: string[];
  type?: string;
  status: 'draft' | 'live' | 'scheduled' | null;
  scheduled_date?: string;
  difficulty?: string;
  correct_marks?: number;
  wrong_marks?: number;
  unattempt_marks?: number;
  total_time?: number;
  total_marks?: number;
  total_questions?: number;
  questions?: string[];
  created_at: string;
}

export interface TestFormData {
  name: string;
  type: string;
  subject: string;
  topics: string[];
  sub_topics: string[];
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: string;
  total_time: number;
  total_marks: number;
  total_questions: number;
  status: null | 'draft' | 'live' | 'scheduled';
}

export interface Question {
  id?: string;
  type: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: string;
  explanation?: string;
  difficulty?: string;
  subject?: string;
  subject_id?: string;
  topic_id?: string;
  sub_topic_id?: string;
  media_url?: string;
  test_id?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
