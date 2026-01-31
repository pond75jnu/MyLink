import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './stores';
import { ProtectedRoute } from './components/auth';
import { MainLayout, AuthLayout } from './components/layout';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  LinksPage,
  AddLinkPage,
  FavoritesPage,
  ArchivePage,
  CategoryPage,
  SettingsPage,
  AdminPage,
  NotFoundPage,
} from './pages';

function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 인증 레이아웃 (로그인, 회원가입) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* 메인 레이아웃 (보호된 라우트) */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/links/new" element={<AddLinkPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
