import { create } from 'zustand';
import type { NamingStore, Phase, NameCard, PreferredName } from '../types/naming';

/**
 * 全局命名状态管理
 * 使用 Zustand 实现简洁的状态管理
 */
export const useNamingStore = create<NamingStore>((set, get) => ({
  // 初始状态
  phase: 'idle',
  analysis: '',
  strategy: '',
  nameCards: [],
  preferred: null,
  revealedCards: new Set(),
  allRevealed: false,
  isLoading: false,
  error: null,

  // Actions
  setPhase: (phase: Phase) => set({ phase }),

  setAnalysis: (analysis: string) => 
    set({ analysis, phase: 'analyzing' }),

  setStrategy: (strategy: string) => 
    set({ strategy, phase: 'strategizing' }),

  addNameCard: (card: NameCard) => 
    set((state) => ({
      nameCards: [...state.nameCards, card],
      phase: 'generating',
    })),

  setPreferred: (preferred: PreferredName) => 
    set({ preferred, phase: 'selecting' }),

  revealCard: (index: number) => 
    set((state) => {
      const newRevealed = new Set(state.revealedCards);
      newRevealed.add(index);
      
      const allRevealed = newRevealed.size === state.nameCards.length;
      
      return {
        revealedCards: newRevealed,
        allRevealed,
        phase: allRevealed ? 'done' : state.phase,
      };
    }),

  revealAll: () => 
    set((state) => {
      const allIndexes = Array.from({ length: state.nameCards.length }, (_, i) => i);
      return {
        revealedCards: new Set(allIndexes),
        allRevealed: true,
        phase: 'done',
      };
    }),

  reset: () => 
    set({
      phase: 'idle',
      analysis: '',
      strategy: '',
      nameCards: [],
      preferred: null,
      revealedCards: new Set(),
      allRevealed: false,
      isLoading: false,
      error: null,
    }),

  setError: (error: string | null) => 
    set({ error, isLoading: false }),
}));

