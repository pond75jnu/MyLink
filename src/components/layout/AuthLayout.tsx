import { Outlet, Link } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-lg">
              <span className="text-xl font-bold">S</span>
            </div>
            <span className="text-3xl font-bold text-white">SmartLink</span>
          </Link>
          <p className="mt-2 text-sm text-white/80">
            AI 기반 지능형 링크 큐레이션 서비스
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
          <Outlet />
        </div>

        <p className="mt-6 text-center text-sm text-white/70">
          © {new Date().getFullYear()} SmartLink. All rights reserved.
        </p>
      </div>
    </div>
  );
}
