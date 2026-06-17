import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';

import Navbar from './components/layout/Navbar.jsx';
import Sidebar from './components/layout/Sidebar.jsx';


import HomePage from './pages/HomePage.jsx';
import QuestionDetailPage from './pages/QuestionDetailPage.jsx';
import AskQuestionPage from './pages/AskQuestionPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VerifyOtpPage from './pages/VerifyOtpPage.jsx'; 
import ProfilePage from './pages/ProfilePage.jsx';
import InboxPage from './pages/InboxPage.jsx';
import ConversationPage from './pages/ConversationPage.jsx';

// loading and verifying login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// main layout
const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-950">
    <Navbar />
    <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
      <main className="flex-1 min-w-0">{children}</main>
      <Sidebar />
    </div>
  </div>
);

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // verify on every page change
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />  

        {/* Main app layout */}
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/questions/:id" element={<MainLayout><QuestionDetailPage /></MainLayout>} />
        <Route path="/users/:id" element={<MainLayout><ProfilePage /></MainLayout>} />

        {/* Only users can ask */}
        <Route
          path="/ask"
          element={
            <ProtectedRoute>
              <MainLayout><AskQuestionPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MainLayout><InboxPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:userId"
          element={
            <ProtectedRoute>
              <MainLayout><ConversationPage /></MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
