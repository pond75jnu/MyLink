import { useState, useCallback, lazy, Suspense } from 'react';
import type { CreateLinkInput } from '../../types';
import type { Category } from '../../types/category';
import type { Tag } from '../../types/tag';
import type { LinkAnalysis } from '../../services/ai.service';
import { analyzeLink } from '../../services/ai.service';
import { fetchPageContent } from '../../services/scraper.service';
import { Modal, Spinner } from '../ui';

const LinkForm = lazy(() =>
  import('./LinkForm').then((m) => ({ default: m.LinkForm }))
);

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  tags: Tag[];
  onSubmit: (data: CreateLinkInput, analysis?: LinkAnalysis) => Promise<void>;
}

function AddLinkModal({
  isOpen,
  onClose,
  categories,
  tags,
  onSubmit,
}: AddLinkModalProps) {
  const [analysis, setAnalysis] = useState<LinkAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (url: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const pageData = await fetchPageContent(url);
      const result = await analyzeLink(url, pageData);
      setAnalysis(result);
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : 'AI 분석에 실패했습니다.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleSubmit = async (data: CreateLinkInput) => {
    await onSubmit(data, analysis ?? undefined);
    handleClose();
  };

  const handleClose = () => {
    setAnalysis(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="링크 추가" size="lg">
      <Suspense fallback={<div className="flex justify-center py-8"><Spinner /></div>}>
        <LinkForm
          mode="create"
          categories={categories}
          tags={tags}
          analysis={analysis}
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAnalyze}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </Suspense>
      {analysisError ? (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {analysisError}
        </div>
      ) : null}
    </Modal>
  );
}

export { AddLinkModal };
export type { AddLinkModalProps };
