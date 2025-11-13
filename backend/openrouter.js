import OpenAI from 'openai';

/**
 * OpenRouter API 客户端
 * 使用 OpenAI SDK（OpenRouter 兼容 OpenAI 格式）
 */
export class OpenRouterClient {
  constructor(apiKey, model = 'anthropic/claude-3.5-sonnet') {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = apiKey;
    this.model = model;
    
    // 创建 OpenAI 客户端，指向 OpenRouter
    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/uniquenames-net',
        'X-Title': 'AI Naming Tool',
      },
    });
  }

  /**
   * 生成名字（流式输出）
   * @param {string} prompt - 完整的提示词
   * @returns {AsyncGenerator} 流式响应（返回 {content, usage}）
   */
  async *generateNames(prompt) {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: true,
      });

      let lastUsage = null;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield { content, usage: null };
        }
        
        // 捕获 usage 信息（通常在最后一个 chunk）
        if (chunk.usage) {
          lastUsage = chunk.usage;
        }
      }
      
      // 返回最终的 usage 信息
      if (lastUsage) {
        yield { content: null, usage: lastUsage };
      }
    } catch (error) {
      throw new Error(`OpenRouter API error: ${error.message}`);
    }
  }

  /**
   * 生成名字（非流式）- 用于测试
   * @param {string} prompt - 完整的提示词
   * @returns {Promise<string>} 完整的响应
   */
  async generateNamesSync(prompt) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: false,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      throw new Error(`OpenRouter API error: ${error.message}`);
    }
  }
}

