import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/auth.store';
import { useLinkStore } from '../stores/link.store';
import { useCategoryStore } from '../stores/category.store';
import * as linkService from '../services/link.service';
import * as categoryService from '../services/category.service';
import { analyzeLink } from '../services/ai.service';
import { fetchPageContent } from '../services/scraper.service';
import type { LinkAnalysis } from '../services/ai.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';

const addLinkSchema = z.object({
  url: z.string().url('유효한 URL을 입력해주세요'),
  customTitle: z.string().min(1, '주제를 입력해주세요').max(200, '주제는 200자 이내로 입력해주세요'),
  category: z.string().min(1, '카테고리를 입력해주세요').max(100, '카테고리는 100자 이내로 입력해주세요'),
  customMemo: z.string().min(1, '메모를 입력해주세요').max(1000, '메모는 1000자 이내로 입력해주세요'),
});

type AddLinkFormData = z.infer<typeof addLinkSchema>;

export function AddLinkPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addLink } = useLinkStore();
  const { setCategories } = useCategoryStore();

  const [analysis, setAnalysis] = useState<LinkAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<AddLinkFormData>({
    resolver: zodResolver(addLinkSchema),
    defaultValues: {
      url: '',
      customTitle: '',
      category: '',
      customMemo: '',
    },
  });

  const url = watch('url');
  const canAnalyze = url && z.string().url().safeParse(url).success;

  useEffect(() => {
    const loadCategories = async () => {
      if (!user?.id) return;
      const result = await categoryService.getCategories(user.id);
      if (result.success && result.data) {
        setCategories(result.data);
      }
    };
    loadCategories();
  }, [user?.id, setCategories]);

  useEffect(() => {
    if (analysis) {
      const currentTitle = getValues('customTitle');
      const currentMemo = getValues('customMemo');
      const currentCategory = getValues('category');

      if (!currentTitle) {
        setValue('customTitle', analysis.title);
      }

      if (!currentMemo) {
        setValue('customMemo', analysis.summary);
      }

      if (!currentCategory) {
        setValue('category', analysis.categorySuggestion);
      }
    }
  }, [analysis, setValue, getValues]);

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;

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
  }, [canAnalyze, url]);

  const handleFormSubmit = async (data: AddLinkFormData) => {
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      const result = await linkService.createLink(user.id, {
        url: data.url,
        customTitle: data.customTitle,
        category: data.category,
        customMemo: data.customMemo,
      });

      if (result.success && result.data) {
        let linkData = result.data;

        if (analysis) {
          linkData = {
            ...linkData,
            customTitle: data.customTitle,
            customMemo: data.customMemo,
            aiTitle: analysis.title,
            aiSummary: analysis.summary,
            aiKeywords: analysis.keywords,
            aiCategorySuggestion: analysis.categorySuggestion,
            contentType: analysis.contentType,
            isAnalyzed: true,
          };
        }

        addLink(linkData);
        toast.success('링크가 추가되었습니다.');
        navigate('/links');
      } else {
        toast.error(result.error?.message || '링크 추가에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/links')}
        >
          돌아가기
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          링크 추가
        </h1>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="URL"
                  placeholder="https://example.com/article"
                  {...register('url')}
                  error={errors.url?.message}
                  required
                />
              </div>
              <div className="pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  icon={isAnalyzing ? <Spinner size="sm" /> : <Sparkles className="w-4 h-4" />}
                  disabled={!canAnalyze || isAnalyzing}
                  onClick={handleAnalyze}
                >
                  AI 분석
                </Button>
              </div>
            </div>
          </div>

          {analysisError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">
              {analysisError}
            </div>
          )}

          {analysis && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-medium">
                <Sparkles className="w-4 h-4" />
                AI 분석 결과
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">제목:</span>{' '}
                  <span className="text-gray-900 dark:text-gray-100">{analysis.title}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">요약:</span>{' '}
                  <span className="text-gray-900 dark:text-gray-100">{analysis.summary}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-gray-500 dark:text-gray-400">키워드:</span>
                  {analysis.keywords.map((keyword, i) => (
                    <Badge key={i} size="sm" color="indigo">
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">추천 카테고리:</span>{' '}
                  <Badge size="sm" color="purple">{analysis.categorySuggestion}</Badge>
                </div>
              </div>
            </div>
          )}

          <Input
            label="주제"
            placeholder="링크의 주제를 입력하세요"
            {...register('customTitle')}
            error={errors.customTitle?.message}
            helperText="AI 분석 시 자동으로 입력됩니다 (필수)"
            required
          />

          <Input
            label="카테고리"
            placeholder="카테고리를 입력하세요"
            {...register('category')}
            error={errors.category?.message}
            helperText="AI 분석 시 자동으로 입력됩니다 (필수)"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              메모 <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              rows={3}
              placeholder="개인 메모를 입력하세요"
              required
              {...register('customMemo')}
            />
            {errors.customMemo?.message ? (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.customMemo?.message}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">AI 분석 시 요약 내용이 자동으로 입력됩니다 (필수)</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="ghost" onClick={() => navigate('/links')}>
              취소
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              icon={<Check className="w-4 h-4" />}
            >
              저장
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
