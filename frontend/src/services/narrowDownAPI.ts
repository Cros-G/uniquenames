import type {
  ContextAnalysis,
  NameCardData,
  NameEvaluation,
  RankingInfo,
  NameStory,
} from '../types/narrowDown';
import { getUserId } from '../utils/userAuth';

/**
 * Narrow Down SSE 回调接口
 */
export interface NarrowDownCallbacks {
  onTracking?: (data: { names: string[]; count: number }) => void;
  onTrackingError?: (data: { error: string }) => void;
  onIsolateComplete?: (data: {
    contextAnalysis: ContextAnalysis;
    nameCandidates: Array<{ numbering: number; name: string; certainty: string; attachment: string }>;
  }) => void;
  onInformationProgress?: (data: { numbering: number; name: string; dimension: string }) => void;
  onInformationComplete?: (data: { numbering: number; name: string; evaluation: NameEvaluation }) => void;
  onDecideComplete?: (data: { rankingList: RankingInfo[]; strongOpinion: string }) => void;
  onStoryProgress?: (data: { numbering: number; name: string }) => void;
  onStoryComplete?: (data: NameStory) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 调用 Narrow Down 流程
 */
export async function streamNarrowDown(
  userInput: string,
  model: string,
  callbacks: NarrowDownCallbacks
): Promise<() => void> {
  console.log('📡 [NarrowDownAPI] 开始 Narrow Down 流程');
  console.log('📝 [NarrowDownAPI] 用户输入长度:', userInput.length);
  console.log('🤖 [NarrowDownAPI] 使用模型:', model);

  const userId = await getUserId();
  console.log('👤 [NarrowDownAPI] User ID:', userId);

  fetch('/api/narrow-down/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    },
    body: JSON.stringify({ user_input: userInput, model }),
  })
    .then(async (response) => {
      console.log('✅ [NarrowDownAPI] 连接建立:', response.status);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      console.log('📖 [NarrowDownAPI] 开始读取SSE流...');

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('✅ [NarrowDownAPI] 流读取完成');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        let currentEvent = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const data = line.slice(6);

            try {
              const parsed = JSON.parse(data);
              console.log(`📨 [NarrowDownAPI] 事件: ${currentEvent}`, parsed);

              // 根据事件类型分发
              switch (currentEvent) {
                case 'tracking':
                  callbacks.onTracking?.(parsed);
                  break;
                case 'tracking_error':
                  callbacks.onTrackingError?.(parsed);
                  break;
                case 'analyzing':
                  // 中间状态：显示 analyzing 状态
                  console.log('📊 [NarrowDownAPI] 进入 analyzing 阶段');
                  break;
                case 'isolate_complete':
                  callbacks.onIsolateComplete?.(parsed);
                  break;
                case 'researching':
                  // 中间状态：显示 researching 状态
                  console.log('🔬 [NarrowDownAPI] 进入 researching 阶段');
                  break;
                case 'information_progress':
                  callbacks.onInformationProgress?.(parsed);
                  break;
                case 'information_complete':
                  callbacks.onInformationComplete?.(parsed);
                  break;
                case 'deciding':
                  // 中间状态：显示 deciding 状态
                  console.log('⚖️ [NarrowDownAPI] 进入 deciding 阶段');
                  break;
                case 'decide_complete':
                  callbacks.onDecideComplete?.(parsed);
                  break;
                case 'crafting':
                  // 中间状态：显示 crafting 状态
                  console.log('✍️ [NarrowDownAPI] 进入 crafting 阶段');
                  break;
                case 'story_progress':
                  callbacks.onStoryProgress?.(parsed);
                  break;
                case 'story_complete':
                  callbacks.onStoryComplete?.(parsed);
                  break;
                case 'done':
                  callbacks.onComplete?.();
                  return;
                case 'error':
                  throw new Error(parsed.error);
              }

              currentEvent = ''; // 重置
            } catch (e) {
              // 忽略解析错误
              console.warn('⚠️ [NarrowDownAPI] 解析错误:', e);
            }
          }
        }
      }
    })
    .catch((error) => {
      console.error('❌ [NarrowDownAPI] 错误:', error);
      callbacks.onError?.(error);
    });

  // 返回取消函数
  return () => {
    console.log('🛑 [NarrowDownAPI] 取消请求');
  };
}



