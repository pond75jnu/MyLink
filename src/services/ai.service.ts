import { createChatCompletion, type ChatMessage } from '../lib/openai';
import type { PageData } from './scraper.service';

export interface LinkAnalysis {
  title: string;
  summary: string;
  keywords: string[];
  categorySuggestion: string;
  contentType: string;
}

const ALLOWED_CATEGORIES = [
  '기술', '개발', '프로그래밍', '뉴스', '엔터테인먼트', '음악', '게임',
  '교육', '강의', '쇼핑', '블로그', '문서', '레퍼런스', '커뮤니티',
  '금융', '건강', '여행', '음식', '스포츠', '과학', '예술', '기타'
];



const SYSTEM_PROMPT = `당신은 웹 링크 콘텐츠를 분석하는 AI 어시스턴트입니다.
제공된 정보를 분석하여 다음 4가지 정보를 JSON 형식으로 반환하세요.

## 분석 우선순위
1. 메타태그 정보 (title, description, keywords) - 가장 신뢰할 수 있는 출처
2. 유튜브 영상인 경우 영상 제목과 채널명
3. 페이지 본문 콘텐츠
4. URL 패턴 (도메인, 경로)

## 출력 형식 (반드시 이 4가지만 포함)
1. title: 콘텐츠의 핵심을 담은 간결한 제목 (한국어, 50자 이내)
2. summary: 콘텐츠 요약 (한국어, 2-3문장)
3. keywords: 관련 키워드 배열 (한국어, 3-5개)
4. categorySuggestion: 추천 카테고리. 반드시 다음 중 하나: ${ALLOWED_CATEGORIES.join(', ')}

## 규칙
- keywords 중 하나는 반드시 위 카테고리 목록 중 하나여야 합니다
- categorySuggestion은 반드시 keywords에 포함된 값이어야 하며, summary와 가장 밀접한 키워드를 선택하세요
- 유튜브 영상인 경우 영상 내용의 주제를 카테고리로 선택하세요 (예: 프로그래밍 튜토리얼 → "프로그래밍")
- 메타 키워드가 있으면 이를 참고하여 keywords 생성

반드시 다음 JSON 형식으로만 응답하세요 (코드블록 없이 순수 JSON만):
{
  "title": "제목",
  "summary": "요약",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "categorySuggestion": "카테고리"
}`;

function buildUserMessage(pageData: PageData): string {
  const parts: string[] = [];
  
  parts.push(`## URL\n${pageData.url}`);
  
  parts.push(`\n## 메타 정보`);
  parts.push(`- 제목: ${pageData.title}`);
  if (pageData.description) {
    parts.push(`- 설명: ${pageData.description}`);
  }
  if (pageData.siteName) {
    parts.push(`- 사이트명: ${pageData.siteName}`);
  }
  if (pageData.metaKeywords && pageData.metaKeywords.length > 0) {
    parts.push(`- 메타 키워드: ${pageData.metaKeywords.join(', ')}`);
  }
  
  if (pageData.video) {
    parts.push(`\n## 유튜브 영상 정보`);
    parts.push(`- 영상 제목: ${pageData.video.title}`);
    parts.push(`- 채널명: ${pageData.video.channel}`);
  }
  
  if (pageData.content) {
    parts.push(`\n## 페이지 본문 (발췌)\n${pageData.content.slice(0, 2000)}`);
  }
  
  return parts.join('\n');
}

export async function analyzeLink(
  url: string,
  pageDataOrContent?: PageData | string
): Promise<LinkAnalysis> {
  let userMessage: string;
  
  if (typeof pageDataOrContent === 'string') {
    userMessage = `다음 URL과 페이지 콘텐츠를 분석해주세요:\n\nURL: ${url}\n\n페이지 콘텐츠:\n${pageDataOrContent.slice(0, 3000)}`;
  } else if (pageDataOrContent) {
    userMessage = buildUserMessage(pageDataOrContent);
  } else {
    userMessage = `다음 URL을 분석해주세요:\n\nURL: ${url}`;
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ];

  const isVideo = typeof pageDataOrContent === 'object' && pageDataOrContent?.video;

  try {
    const response = await createChatCompletion(messages, {
      model: 'gpt-4o-mini',
      maxTokens: 500,
    });

    console.log('OpenAI 응답:', JSON.stringify(response, null, 2));
    
    const choice = response.choices[0];
    const content = choice?.message?.content;
    
    if (!content) {
      console.error('AI 응답 구조:', response);
      throw new Error('AI 응답이 비어있습니다.');
    }

    let jsonString = content;
    
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1].trim();
    }

    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('AI 응답 원본:', content);
      throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.');
    }

    const parsed = JSON.parse(jsonMatch[0]) as LinkAnalysis;

    const keywords = Array.isArray(parsed.keywords) ? parsed.keywords : [];
    const summary = parsed.summary || '';
    
    let categorySuggestion = parsed.categorySuggestion;
    
    if (!ALLOWED_CATEGORIES.includes(categorySuggestion)) {
      const categoryKeywords = keywords.filter(k => ALLOWED_CATEGORIES.includes(k));
      
      if (categoryKeywords.length > 0) {
        const summaryLower = summary.toLowerCase();
        let bestMatch = categoryKeywords[0];
        let bestScore = 0;
        
        for (const keyword of categoryKeywords) {
          const score = summaryLower.includes(keyword.toLowerCase()) ? 2 : 0;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = keyword;
          }
        }
        categorySuggestion = bestMatch;
      } else {
        categorySuggestion = '기타';
      }
    }

    const contentType = isVideo ? 'video' : (parsed.contentType || 'article');

    return {
      title: parsed.title || url,
      summary,
      keywords,
      categorySuggestion,
      contentType,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('AI 응답 파싱 실패: 유효하지 않은 JSON 형식');
    }
    throw error;
  }
}
