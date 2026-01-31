import { memo } from 'react';

interface LinkSkeletonProps {
  viewMode?: 'grid' | 'list';
}

const LinkSkeleton = memo(function LinkSkeleton({ viewMode = 'grid' }: LinkSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
          <div className="h-6 w-12 bg-gray-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
});

export { LinkSkeleton };
export type { LinkSkeletonProps };
