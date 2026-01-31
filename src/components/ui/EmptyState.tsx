import { memo, type ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const defaultIcon = <Inbox className="w-12 h-12 text-gray-400" />;

const EmptyState = memo(function EmptyState({
  icon = defaultIcon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description ? (
        <p className="text-sm text-gray-500 text-center max-w-sm mb-4">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
});

export { EmptyState };
export type { EmptyStateProps };
