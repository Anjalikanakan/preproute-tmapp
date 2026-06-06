import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { TestProvider } from './context/TestContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateTestPage from './pages/CreateTestPage';
import AddQuestionsPage from './pages/AddQuestionsPage';
import PreviewPublishPage from './pages/PreviewPublishPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TestProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>
            } />
            <Route path="/test/create" element={
              <ProtectedRoute><Layout><CreateTestPage /></Layout></ProtectedRoute>
            } />
            <Route path="/test/:id/edit" element={
              <ProtectedRoute><Layout><CreateTestPage /></Layout></ProtectedRoute>
            } />
            <Route path="/test/:id/questions" element={
              <ProtectedRoute><Layout><AddQuestionsPage /></Layout></ProtectedRoute>
            } />
            <Route path="/test/:id/preview" element={
              <ProtectedRoute><Layout><PreviewPublishPage /></Layout></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </TestProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
