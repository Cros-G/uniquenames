/**
 * Narrow Down 功能的类型定义
 */

/**
 * 流程阶段
 */
export type NarrowDownPhase = 
  | 'idle'          // 初始状态
  | 'tracking'      // 正在提取名字
  | 'analyzing'     // 正在分析上下文
  | 'researching'   // 正在研究名字信息
  | 'deciding'      // 正在决策排名
  | 'crafting'      // 正在创作故事
  | 'done';         // 完成

/**
 * 上下文分析
 */
export interface ContextAnalysis {
  implicit_motives_concerns: string;
  explicit_constraints_conditions: string;
}

/**
 * 名字评估 - 独立于上下文的标准
 */
export interface ContextIndependentCriteria {
  perceptual_fluency: {
    Benefit: string;
    Risks: string;
  };
  uniqueness: {
    Benefit: string;
    Risks: string;
  };
  longevity_scalability: {
    Benefit: string;
    Risks: string;
  };
}

/**
 * 名字评估 - 依赖上下文的标准
 */
export interface ContextDependentCriteria {
  conbination_harmony: {
    'Positive Fit': string;
    'Negative Fit': string;
  };
  ecosystem_portfolio_fit: {
    'Positive Fit': string;
    'Negative Fit': string;
  };
  cultural_contextual_fit: {
    'Positive Fit': string;
    'Negative Fit': string;
  };
}

/**
 * 完整的名字评估
 */
export interface NameEvaluation {
  context_independent_criteria: ContextIndependentCriteria;
  context_dependent_criteria: ContextDependentCriteria;
}

/**
 * 排名信息
 */
export interface RankingInfo {
  numbering: number;
  name: string;
  ranking: number;
  reason_of_ranking: string;
}

/**
 * 名字故事
 */
export interface NameStory {
  name: string;
  numbering: number;
  story_title: string;
  story: string;
}

/**
 * 名字卡片完整数据
 */
export interface NameCardData {
  numbering: number;
  name: string;
  
  // 步骤2获得
  certainty?: string;
  attachment?: string;
  
  // 步骤3获得
  evaluation?: NameEvaluation;
  currentDimension?: string; // 当前分析的维度
  
  // 步骤4获得
  ranking?: number;
  reasonOfRanking?: string;
  
  // 步骤5获得
  storyTitle?: string;
  story?: string;
  
  // UI状态
  isFlipped: boolean;  // 是否翻转到背面
  isHovered: boolean;  // 是否被hover
  hasTyped: boolean;   // 是否已完成打字动效
  isOpinionExpanded: boolean; // AI意见是否展开（仅第一名）
}

/**
 * Narrow Down 状态
 */
export interface NarrowDownState {
  // 当前阶段
  phase: NarrowDownPhase;
  
  // 用户输入
  userInput: string;
  
  // 名字列表
  names: string[];
  
  // 上下文分析
  contextAnalysis: ContextAnalysis | null;
  
  // 名字卡片数据
  cards: NameCardData[];
  
  // 排名列表
  rankingList: RankingInfo[];
  
  // AI的强烈意见
  strongOpinion: string | null;
  
  // 当前步骤描述
  currentStep: string;
  
  // 错误信息
  error: string | null;
  
  // 是否显示超限警告
  showOverLimit: boolean;
  maxNames: number;
  actualCount: number;
}

/**
 * Narrow Down 操作
 */
export interface NarrowDownActions {
  // 设置阶段
  setPhase: (phase: NarrowDownPhase) => void;
  
  // 设置用户输入
  setUserInput: (input: string) => void;
  
  // 步骤1结果
  setNames: (names: string[]) => void;
  
  // 步骤2结果
  setContextAnalysis: (analysis: ContextAnalysis) => void;
  addNameCard: (card: Omit<NameCardData, 'isFlipped' | 'isHovered'>) => void;
  
  // 步骤3进度和结果
  updateCardDimension: (numbering: number, dimension: string) => void;
  updateCardEvaluation: (numbering: number, evaluation: NameEvaluation) => void;
  
  // 步骤4结果
  setRankingList: (rankings: RankingInfo[]) => void;
  setStrongOpinion: (opinion: string) => void;
  
  // 步骤5结果
  updateCardStory: (numbering: number, story: NameStory) => void;
  
  // 卡片交互
  flipCard: (numbering: number) => void;
  setCardHovered: (numbering: number, isHovered: boolean) => void;
  markAsTyped: (numbering: number) => void;
  toggleOpinion: (numbering: number) => void;
  
  // 错误处理
  setError: (error: string | null) => void;
  setOverLimitWarning: (maxNames: number, actualCount: number) => void;
  
  // 重置
  reset: () => void;
}

/**
 * 完整的 Store 类型
 */
export type NarrowDownStore = NarrowDownState & NarrowDownActions;


