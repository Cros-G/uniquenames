/**
 * 名字卡片类型
 */
export interface NameCard {
  name: string;
  reason: string;
}

/**
 * AI 推荐的名字
 */
export interface PreferredName {
  preferred_name: string;
  preferred_reason: string;
}

/**
 * 流程阶段
 */
export type Phase = 
  | 'idle'          // 初始状态
  | 'analyzing'     // 正在分析
  | 'strategizing'  // 正在制定策略
  | 'generating'    // 正在生成名字
  | 'selecting'     // AI正在挑选
  | 'revealing'     // 等待用户揭示
  | 'done';         // 全部完成

/**
 * 命名状态
 */
export interface NamingState {
  // 当前阶段
  phase: Phase;
  
  // AI 分析
  analysis: string;
  
  // 命名策略
  strategy: string;
  
  // 名字卡片列表
  nameCards: NameCard[];
  
  // AI 推荐的名字
  preferred: PreferredName | null;
  
  // 已揭示的卡片索引集合
  revealedCards: Set<number>;
  
  // 是否所有卡片都已揭示
  allRevealed: boolean;
  
  // 是否正在加载
  isLoading: boolean;
  
  // 错误信息
  error: string | null;
}

/**
 * 命名操作
 */
export interface NamingActions {
  // 设置阶段
  setPhase: (phase: Phase) => void;
  
  // 设置分析
  setAnalysis: (analysis: string) => void;
  
  // 设置策略
  setStrategy: (strategy: string) => void;
  
  // 添加名字卡片
  addNameCard: (card: NameCard) => void;
  
  // 设置推荐名字
  setPreferred: (preferred: PreferredName) => void;
  
  // 揭示单张卡片
  revealCard: (index: number) => void;
  
  // 揭示所有卡片（吹一阵风）
  revealAll: () => void;
  
  // 重置状态
  reset: () => void;
  
  // 设置错误
  setError: (error: string | null) => void;
}

/**
 * 完整的 Store 类型
 */
export type NamingStore = NamingState & NamingActions;

