import React from 'react';
import { motion } from 'framer-motion';
import type { Phase, NameCard as NameCardType, PreferredName } from '../types/naming';
import { ThinkingState } from './ThinkingState';
import { AnalysisSection } from './AnalysisSection';
import { StrategySection } from './StrategySection';
import { NameCard } from './NameCard';
import { WindButton } from './WindButton';
import { PreferredReveal } from './PreferredReveal';
import { ErrorDisplay } from './ErrorDisplay';

interface OutputPanelProps {
  phase: Phase;
  analysis: string;
  strategy: string;
  nameCards: NameCardType[];
  preferred: PreferredName | null;
  revealedCards: Set<number>;
  allRevealed: boolean;
  error: string | null;
  onRevealCard: (index: number) => void;
  onRevealAll: () => void;
  onDismissError: () => void;
}

/**
 * 输出面板组件 - 右侧输出区域
 * 整合所有输出相关的组件
 */
export function OutputPanel({
  phase,
  analysis,
  strategy,
  nameCards,
  preferred,
  revealedCards,
  allRevealed,
  error,
  onRevealCard,
  onRevealAll,
  onDismissError,
}: OutputPanelProps) {
  const hasUnrevealedCards = nameCards.length > 0 && !allRevealed;

  if (phase === 'idle') {
    return (
      <motion.div 
        className="h-full flex items-center justify-center text-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <p className="text-xl">在左侧输入您的需求，开始创作名字</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 错误显示 */}
      {error && (
        <ErrorDisplay 
          error={error} 
          onDismiss={onDismissError}
        />
      )}

      {/* 思考状态 */}
      {phase === 'analyzing' && !analysis && (
        <ThinkingState message="正在深入分析您的需求..." />
      )}

      {phase === 'strategizing' && !strategy && (
        <ThinkingState message="正在制定命名策略..." />
      )}

      {phase === 'generating' && (
        <ThinkingState message="正在创作名字..." />
      )}

      {phase === 'selecting' && (
        <ThinkingState message="AI 正在挑选最佳名字..." />
      )}

      {/* 分析结果 */}
      <AnalysisSection analysis={analysis} />

      {/* 策略 */}
      <StrategySection strategy={strategy} />

      {/* 名字卡片网格 */}
      {nameCards.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold text-accent mb-4">
            ✨ 名字方案
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {nameCards.map((card, index) => (
              <NameCard
                key={index}
                name={card.name}
                reason={card.reason}
                index={index}
                isRevealed={revealedCards.has(index)}
                isPreferred={preferred?.preferred_name === card.name}
                onClick={() => onRevealCard(index)}
              />
            ))}
          </div>

          {/* 吹一阵风按钮 */}
          {hasUnrevealedCards && phase === 'revealing' && (
            <div className="flex justify-center">
              <WindButton onClick={onRevealAll} />
            </div>
          )}
        </div>
      )}

      {/* AI 推荐展示 */}
      {allRevealed && preferred && (
        <PreferredReveal preferred={preferred} />
      )}
    </div>
  );
}

