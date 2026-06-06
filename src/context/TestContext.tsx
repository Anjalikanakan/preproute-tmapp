import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Test, Question } from '../types';

interface TestContextType {
  currentTest: Test | null;
  questions: Question[];
  setCurrentTest: (test: Test | null) => void;
  setQuestions: (questions: Question[]) => void;
  clearTestContext: () => void;
}

const TestContext = createContext<TestContextType | null>(null);

export const TestProvider = ({ children }: { children: ReactNode }) => {
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const clearTestContext = () => {
    setCurrentTest(null);
    setQuestions([]);
  };

  return (
    <TestContext.Provider value={{ currentTest, questions, setCurrentTest, setQuestions, clearTestContext }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTestContext = () => {
  const ctx = useContext(TestContext);
  if (!ctx) throw new Error('useTestContext must be used within TestProvider');
  return ctx;
};
