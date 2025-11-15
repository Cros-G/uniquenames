import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNamingStore } from '../store/useNamingStore';
import { streamGenerateNames } from '../services/streamingAPI';
import { getSelectedModel } from '../components/SettingsPanel';
import { GenerateInput } from '../components/generate/GenerateInput';
import { GenerateStatus } from '../components/generate/GenerateStatus';
import { OutputPanel } from '../components/OutputPanel';
import { motion } from 'framer-motion';

/**
 * Generate Page - Name generation functionality
 * Follows NarrowDownPage structure for visual consistency
 */
export function GeneratePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const {
    phase,
    analysis,
    strategy,
    nameCards,
    preferred,
    revealedCards,
    allRevealed,
    error,
    setAnalysis,
    setStrategy,
    addNameCard,
    setPreferred,
    revealCard,
    reset,
    setError,
    setPhase,
  } = useNamingStore();

  // Read initial context from URL parameters
  const initialContext = searchParams.get('context') || '';

  const handleSubmit = (context: string) => {
    console.log('🎯 [GeneratePage] User submitted');
    console.log('📝 [GeneratePage] User input:', context);
    
    const selectedModel = getSelectedModel();
    console.log('🤖 [GeneratePage] Using model:', selectedModel);
    
    reset();
    setPhase('analyzing');
    
    console.log('🚀 [GeneratePage] Starting streamGenerateNames...');

    streamGenerateNames(context, selectedModel, {
      onAnalysis: (text) => {
        setAnalysis(text);
      },
      onStrategy: (text) => {
        setStrategy(text);
      },
      onNameCard: (card) => {
        addNameCard(card);
      },
      onPreferred: (pref) => {
        setPreferred(pref);
        setPhase('revealing');
      },
      onComplete: () => {
        console.log('✅ Streaming complete');
      },
      onError: (error) => {
        setError(error.message);
        console.error('❌ Error:', error);
      },
    });
  };

  const handleRevealAll = () => {
    nameCards.forEach((_, index) => {
      setTimeout(() => {
        revealCard(index);
      }, index * 100);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header - Same style as NarrowDownPage */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Home</span>
          </button>
          
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-pink-500 to-purple-600 
                         bg-clip-text text-transparent">
            Generate Names
          </h1>
          
          <div className="w-24" />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Input Area (4 columns, ~33%) */}
          <div className="lg:col-span-4">
            <GenerateInput
              onSubmit={handleSubmit}
              isLoading={phase !== 'idle' && phase !== 'done'}
              initialValue={initialContext}
            />
          </div>

          {/* Right: Display Area (8 columns, ~67%) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Status Area (20% height) */}
            {phase !== 'idle' && phase !== 'done' && (
              <GenerateStatus
                phase={phase}
                message={getStatusMessage(phase)}
              />
            )}

            {/* Result Display Area (80% height) */}
            <div className="min-h-[600px]">
              {phase === 'idle' && !error && (
                <motion.div
                  className="flex items-center justify-center h-full bg-white rounded-xl 
                             border border-gray-200 shadow-sm p-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-xl text-gray-700">
                      Enter your naming needs to begin
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      We'll create unique, meaningful names just for you
                    </p>
                  </div>
                </motion.div>
              )}

              {(phase !== 'idle' || error) && (
                <OutputPanel
                  phase={phase}
                  analysis={analysis}
                  strategy={strategy}
                  nameCards={nameCards}
                  preferred={preferred}
                  revealedCards={revealedCards}
                  allRevealed={allRevealed}
                  error={error}
                  onRevealCard={revealCard}
                  onRevealAll={handleRevealAll}
                  onDismissError={() => setError(null)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Status message mapping
function getStatusMessage(phase: string): string {
  const messages: Record<string, string> = {
    analyzing: 'Analyzing context...',
    strategizing: 'Creating strategy...',
    generating: 'Generating names...',
    revealing: 'Ready to reveal!',
  };
  return messages[phase] || 'Processing...';
}

