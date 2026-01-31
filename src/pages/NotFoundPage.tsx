import { Link } from 'react-router-dom';
import { Home, FileQuestion } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="text-center">
        <FileQuestion className="mx-auto h-24 w-24 text-gray-400" />
        <h1 className="mt-6 text-4xl font-bold text-gray-900 dark:text-white">404</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          페이지를 찾을 수 없습니다
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button icon={<Home className="w-4 h-4" />}>
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
