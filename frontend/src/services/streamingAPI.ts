import type { NameCard, PreferredName } from '../types/naming';

/**
 * SSE 流式响应回调
 */
export interface StreamCallbacks {
  onAnalysis?: (text: string) => void;
  onStrategy?: (text: string) => void;
  onNameCard?: (card: NameCard) => void;
  onPreferred?: (preferred: PreferredName) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 解析AI返回的JSON内容
 * AI会返回包含 ```json ``` 的内容，需要提取并解析
 */
function parseAIResponse(fullContent: string): {
  analysis?: string;
  strategy?: string;
  names?: NameCard[];
  preferred?: PreferredName;
} | null {
  try {
    // 提取 JSON 块（移除 markdown 代码块标记）
    const jsonMatch = fullContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      return null;
    }

    const jsonStr = jsonMatch[1];
    const parsed = JSON.parse(jsonStr);
    
    return parsed;
  } catch {
    return null;
  }
}

/**
 * 流式生成名字
 * 使用 Server-Sent Events (SSE) 接收流式数据
 */
export function streamGenerateNames(
  context: string,
  model: string,
  callbacks: StreamCallbacks
): () => void {
  console.log('📡 [StreamAPI] streamGenerateNames 被调用');
  console.log('📝 [StreamAPI] context:', context);
  console.log('🤖 [StreamAPI] model:', model);
  
  let buffer = '';
  let hasEmittedAnalysis = false;
  let hasEmittedStrategy = false;
  let emittedNameCount = 0;
  let hasEmittedPreferred = false;

  console.log('🌐 [StreamAPI] 准备发送 POST 请求到 /api/generate-names');

  // 创建 POST 请求
  fetch('/api/generate-names', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ context, model }),
  })
    .then(async (response) => {
      console.log('✅ [StreamAPI] 收到响应:', response.status, response.statusText);
      console.log('📋 [StreamAPI] Content-Type:', response.headers.get('content-type'));
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate names');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        console.error('❌ [StreamAPI] 没有 response body!');
        throw new Error('No response body');
      }

      console.log('📖 [StreamAPI] 开始读取流式数据...');
      let readCount = 0;

      // 读取流式数据
      while (true) {
        readCount++;
        console.log(`🔄 [StreamAPI] 第 ${readCount} 次读取...`);
        
        const { done, value } = await reader.read();
        
        console.log(`📦 [StreamAPI] 读取结果 - done: ${done}, value 长度: ${value?.length || 0}`);
        
        if (done) {
          console.log('✅ [StreamAPI] 流读取完成');
          break;
        }

        // 解码数据
        const chunk = decoder.decode(value, { stream: true });
        console.log('📝 [StreamAPI] 解码后的 chunk:', chunk.substring(0, 100) + '...');
        
        const lines = chunk.split('\n');
        console.log(`📋 [StreamAPI] 分割成 ${lines.length} 行`);

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            console.log('💬 [StreamAPI] 找到 data 行:', line.substring(0, 50) + '...');
            const data = line.slice(6); // 移除 'data: ' 前缀

            if (data === '[DONE]') {
              callbacks.onComplete?.();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.content) {
                buffer += parsed.content;

                // 尝试解析完整的 JSON 响应
                const result = parseAIResponse(buffer);

                if (result) {
                  // 发送 analysis（只发一次）
                  if (result.analysis && !hasEmittedAnalysis) {
                    callbacks.onAnalysis?.(result.analysis);
                    hasEmittedAnalysis = true;
                  }

                  // 发送 strategy（只发一次）
                  if (result.strategy && !hasEmittedStrategy) {
                    callbacks.onStrategy?.(result.strategy);
                    hasEmittedStrategy = true;
                  }

                  // 发送新的 names
                  if (result.names) {
                    const newNames = result.names.slice(emittedNameCount);
                    newNames.forEach((name) => {
                      callbacks.onNameCard?.(name);
                    });
                    emittedNameCount = result.names.length;
                  }

                  // 发送 preferred（只发一次）
                  if (result.preferred && !hasEmittedPreferred) {
                    callbacks.onPreferred?.(result.preferred);
                    hasEmittedPreferred = true;
                  }
                }
              }

              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              // 忽略解析错误，继续累积 buffer
            }
          }
        }
      }
    })
    .catch((error) => {
      console.error('❌ [StreamAPI] Fetch 错误:', error);
      console.error('❌ [StreamAPI] 错误详情:', error.message);
      callbacks.onError?.(error);
    });

  // 返回取消函数（虽然 fetch 不太好取消，但提供接口）
  return () => {
    // TODO: 实现真正的取消逻辑（可能需要 AbortController）
  };
}

