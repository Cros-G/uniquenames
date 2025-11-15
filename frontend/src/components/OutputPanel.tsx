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
 * Output Panel Component - Right side output area
 * Integrates all output-related components
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
          <p className="text-xl">Enter your needs on the left to start creating names</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <ErrorDisplay 
          error={error} 
          onDismiss={onDismissError}
        />
      )}

      {/* Thinking State */}
      {phase === 'analyzing' && !analysis && (
        <ThinkingState message="Analyzing your needs in depth..." />
      )}

      {phase === 'strategizing' && !strategy && (
        <ThinkingState message="Creating naming strategy..." />
      )}

      {phase === 'generating' && (
        <ThinkingState message="Crafting names..." />
      )}

      {phase === 'selecting' && (
        <ThinkingState message="AI is selecting the best names..." />
      )}

      {/* Analysis Results */}
      <AnalysisSection analysis={analysis} />

      {/* Strategy */}
      <StrategySection strategy={strategy} />

      {/* Name Cards Grid */}
      {nameCards.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold text-accent mb-4">
            ✨ Name Proposals
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

          {/* Wind Button */}
          {hasUnrevealedCards && phase === 'revealing' && (
            <div className="flex justify-center">
              <WindButton onClick={onRevealAll} />
            </div>
          )}
        </div>
      )}

      {/* AI Recommendation */}
      {allRevealed && preferred && (
        <PreferredReveal preferred={preferred} />
      )}
    </div>
  );
}

