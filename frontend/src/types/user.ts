/**
 * 用户相关类型定义
 */

export interface Activity {
  id: number;
  sessionId: string;
  type: 'generation' | 'narrow_down';
  timestamp: string;
  userInput: string;
  steps: ActivityStep[];
  totalTokens: number;
  totalCost: number;
  totalDuration: number;
  namesCount: number;
  success: boolean;
}

export interface ActivityStep {
  stepName: string;
  model: string;
  tokensPrompt: number;
  tokensCompletion: number;
  tokensTotal: number;
  costUsd: number;
  durationMs: number;
}

export interface UserStats {
  generation: {
    count: number;
    total_tokens: number;
    total_cost: number;
    total_duration: number;
  };
  narrow_down: {
    count: number;
    total_tokens: number;
    total_cost: number;
    total_duration: number;
  };
}

export interface UserHistoryResponse {
  activities: Activity[];
  total: number;
  limit: number;
  offset: number;
}

