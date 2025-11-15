/**
 * 费用计算工具
 * 根据 token 使用量计算预估费用
 */

// 模型价格表（每 1K tokens 的价格，单位：美元）
// 来源：OpenRouter 定价页面
const MODEL_PRICES = {
  // Anthropic Claude
  'anthropic/claude-3.5-sonnet': { prompt: 0.003, completion: 0.015 },
  'anthropic/claude-4.5-sonnet': { prompt: 0.003, completion: 0.015 },
  
  // Google Gemini
  'google/gemini-2.5-pro': { prompt: 0.001, completion: 0.005 },
  'google/gemini-pro': { prompt: 0.000125, completion: 0.000375 },
  
  // OpenAI GPT
  'openai/gpt-4': { prompt: 0.03, completion: 0.06 },
  'openai/gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
  'openai/gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
  
  // 默认价格（如果模型不在列表中）
  'default': { prompt: 0.003, completion: 0.015 },
};

/**
 * 计算费用
 * @param {object} usage - Token 使用情况
 * @param {string} model - 模型名称
 * @returns {number|null} 预估费用（美元）
 */
export function calculateCost(usage, model) {
  if (!usage || !usage.prompt_tokens || !usage.completion_tokens) {
    return null;
  }
  
  // 获取模型价格
  const prices = MODEL_PRICES[model] || MODEL_PRICES['default'];
  
  const cost = (
    (usage.prompt_tokens / 1000) * prices.prompt +
    (usage.completion_tokens / 1000) * prices.completion
  );
  
  return cost;
}

/**
 * 格式化费用显示
 * @param {number|null} cost - 费用
 * @returns {string} 格式化后的费用字符串
 */
export function formatCost(cost) {
  if (cost === null || cost === undefined) {
    return 'N/A';
  }
  
  if (cost < 0.0001) {
    return '< $0.0001';
  }
  
  return `$${cost.toFixed(4)}`;
}

