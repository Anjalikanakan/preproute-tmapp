import api from './client';
import type { AuthResponse, ApiResponse, Subject, Topic, SubTopic, Test, TestFormData, Question } from '../types';

// Auth
export const login = (userId: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { userId, password });

// Subjects
export const getSubjects = () =>
  api.get<ApiResponse<Subject[]>>('/subjects');

// Topics
export const getTopicsBySubject = (subjectId: string) =>
  api.get<ApiResponse<Topic[]>>(`/topics/subject/${subjectId}`);

// Sub-topics
export const getSubTopicsByTopic = (topicId: string) =>
  api.get<ApiResponse<SubTopic[]>>(`/sub-topics/topic/${topicId}`);

export const getSubTopicsByTopics = (topicIds: string[]) =>
  api.post<ApiResponse<SubTopic[]>>('/sub-topics/multi-topics', { topicIds });

// Tests
export const getAllTests = () =>
  api.get<ApiResponse<Test[]>>('/tests');

export const getTestById = (id: string) =>
  api.get<ApiResponse<Test>>(`/tests/${id}`);

export const createTest = (data: Partial<TestFormData>) =>
  api.post<ApiResponse<Test>>('/tests', data);

export const updateTest = (id: string, data: Partial<TestFormData> & { questions?: string[]; status?: string }) =>
  api.put<ApiResponse<Test>>(`/tests/${id}`, data);

export const deleteTest = (id: string) =>
  api.delete<ApiResponse<null>>(`/tests/${id}`);

// Questions
export const bulkCreateQuestions = (questions: Question[]) =>
  api.post<ApiResponse<Question[]>>('/questions/bulk', { questions });

export const fetchBulkQuestions = (question_ids: string[]) =>
  api.post<ApiResponse<Question[]>>('/questions/fetchBulk', { question_ids });

export const publishTest = (id: string, status: string) =>
  api.put<ApiResponse<Test>>(`/tests/${id}`, { status});
