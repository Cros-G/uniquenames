import { create } from 'zustand';
import type {
  NarrowDownStore,
  NarrowDownPhase,
  ContextAnalysis,
  NameCardData,
  NameEvaluation,
  RankingInfo,
  NameStory,
} from '../types/narrowDown';

/**
 * Narrow Down 全局状态管理
 */
export const useNarrowDownStore = create<NarrowDownStore>((set, get) => ({
  // 初始状态
  phase: 'idle',
  userInput: '',
  names: [],
  contextAnalysis: null,
  cards: [],
  rankingList: [],
  strongOpinion: null,
  currentStep: '',
  error: null,
  showOverLimit: false,
  maxNames: 5,
  actualCount: 0,

  // Actions
  setPhase: (phase: NarrowDownPhase) => set({ phase }),

  setUserInput: (input: string) => set({ userInput: input }),

  setNames: (names: string[]) => set({ names }),

  setContextAnalysis: (analysis: ContextAnalysis) => 
    set({ contextAnalysis: analysis }),

  addNameCard: (card) => 
    set((state) => ({
      cards: [...state.cards, {
        ...card,
        isFlipped: false,
        isHovered: false,
        hasTyped: false,
        isOpinionExpanded: false,
      }],
    })),

  updateCardDimension: (numbering: number, dimension: string) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.numbering === numbering
          ? { ...card, currentDimension: dimension }
          : card
      ),
    })),

  updateCardEvaluation: (numbering: number, evaluation: NameEvaluation) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.numbering === numbering
          ? { ...card, evaluation, currentDimension: undefined }
          : card
      ),
    })),

  setRankingList: (rankings: RankingInfo[]) => 
    set((state) => ({
      rankingList: rankings,
      // 更新每个卡片的排名信息
      cards: state.cards.map((card) => {
        const rankingInfo = rankings?.find((r) => r.numbering === card.numbering);
        return rankingInfo
          ? {
              ...card,
              ranking: rankingInfo.ranking,
              reasonOfRanking: rankingInfo.reason_of_ranking,
            }
          : card;
      }),
    })),

  setStrongOpinion: (opinion: string) => set({ strongOpinion: opinion }),

  updateCardStory: (numbering: number, story: NameStory) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.numbering === numbering
          ? {
              ...card,
              storyTitle: story.story_title,
              story: story.story,
            }
          : card
      ),
    })),

  flipCard: (numbering: number) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.numbering === numbering
          ? { ...card, isFlipped: !card.isFlipped }
          : card
      ),
    })),

  setCardHovered: (numbering: number, isHovered: boolean) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.numbering === numbering
          ? { ...card, isHovered }
          : card
      ),
    })),

  markAsTyped: (numbering: number) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.numbering === numbering
          ? { ...card, hasTyped: true }
          : card
      ),
    })),

  toggleOpinion: (numbering: number) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.numbering === numbering
          ? { ...card, isOpinionExpanded: !card.isOpinionExpanded }
          : card
      ),
    })),

  setError: (error: string | null) => set({ error }),

  setOverLimitWarning: (maxNames: number, actualCount: number) =>
    set({
      showOverLimit: true,
      maxNames,
      actualCount,
      error: `名字数量超过限制。最多 ${maxNames} 个，实际 ${actualCount} 个`,
    }),

  reset: () =>
    set({
      phase: 'idle',
      userInput: '',
      names: [],
      contextAnalysis: null,
      cards: [],
      rankingList: [],
      strongOpinion: null,
      currentStep: '',
      error: null,
      showOverLimit: false,
      maxNames: 5,
      actualCount: 0,
    }),
}));


