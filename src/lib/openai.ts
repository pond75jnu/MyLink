import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function createChatCompletion(
  messages: ChatMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<ChatCompletionResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다. VITE_OPENAI_API_KEY 환경변수를 확인하세요.');
  }

  try {
    const response = await axios.post<ChatCompletionResponse>(
      OPENAI_API_URL,
      {
        model: options?.model ?? 'gpt-4o',
        messages,
        max_completion_tokens: options?.maxTokens ?? 1000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as { error?: { message?: string; type?: string; code?: string } };
      const errorMessage = errorData?.error?.message || error.message;
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API 오류: ${errorMessage}`);
    }
    throw error;
  }
}
