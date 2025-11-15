import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNarrowDownStore } from '../store/useNarrowDownStore';
import { streamNarrowDown } from '../services/narrowDownAPI';
import { getSelectedModel } from '../components/SettingsPanel';
import { NarrowDownInput } from '../components/narrow/NarrowDownInput';
import { NarrowDownStatus } from '../components/narrow/NarrowDownStatus';
import { CardStack } from '../components/narrow/CardStack';

/**
 * Narrow Down 主页面
 * 遵循 design_system.md: 温暖明亮风格
 */
export function NarrowDownPage() {
  const navigate = useNavigate();
  
  const {
    phase,
    userInput,
    names,
    contextAnalysis,
    cards,
    rankingList,
    strongOpinion,
    error,
    showOverLimit,
    maxNames,
    actualCount,
    setPhase,
    setUserInput,
    setNames,
    setContextAnalysis,
    addNameCard,
    updateCardDimension,
    updateCardEvaluation,
    setRankingList,
    setStrongOpinion,
    updateCardStory,
    flipCard,
    setCardHovered,
    markAsTyped,
    toggleOpinion,
    setError,
    setOverLimitWarning,
    reset,
  } = useNarrowDownStore();

  const handleSubmit = (input: string) => {
    console.log('🎯 [NarrowDownPage] 提交请求');
    
    reset();
    setUserInput(input);
    setPhase('tracking');
    
    const selectedModel = getSelectedModel();

    streamNarrowDown(input, selectedModel, {
      onTracking: (data) => {
        console.log('✅ 提取到名字:', data.names);
        setNames(data.names);
        setPhase('analyzing');
      },
      
      onTrackingError: (data) => {
        console.error('❌ 名字超限:', data.error);
        const match = data.error.match(/最多 (\d+) 个，实际 (\d+) 个/);
        if (match) {
          setOverLimitWarning(parseInt(match[1]), parseInt(match[2]));
        } else {
          setError(data.error);
        }
        setPhase('idle');
      },
      
      onIsolateComplete: (data) => {
        console.log('✅ 上下文分析完成');
        setContextAnalysis(data.contextAnalysis);
        data.nameCandidates.forEach((candidate) => {
          addNameCard(candidate);
        });
        setPhase('researching');
      },
      
      onInformationProgress: (data) => {
        console.log(`📊 分析进度: ${data.name} - ${data.dimension}`);
        updateCardDimension(data.numbering, data.dimension);
      },
      
      onInformationComplete: (data) => {
        console.log(`✅ 完成评估: ${data.name}`);
        updateCardEvaluation(data.numbering, data.evaluation);
      },
      
      onDecideComplete: (data) => {
        console.log('✅ 排名决策完成');
        setRankingList(data.rankingList);
        setStrongOpinion(data.strongOpinion);
        setPhase('crafting');
      },
      
      onStoryProgress: (data) => {
        console.log(`📝 生成故事: ${data.name}`);
      },
      
      onStoryComplete: (data) => {
        console.log(`✅ 故事完成: ${data.name}`);
        updateCardStory(data.numbering, data);
      },
      
      onComplete: () => {
        console.log('🎉 Narrow Down 流程完成');
        setPhase('done');
      },
      
      onError: (error) => {
        console.error('❌ 错误:', error);
        setError(error.message);
        setPhase('idle');
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* 头部 */}
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
            Narrow Down
          </h1>
          
          <button
            onClick={() => navigate('/app/records')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 
                       border border-gray-200 hover:border-gray-300 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-medium">Records</span>
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 左侧：输入区（4列，约33%） */}
          <div className="lg:col-span-4">
            <NarrowDownInput
              onSubmit={handleSubmit}
              isLoading={phase !== 'idle'}
              showOverLimit={showOverLimit}
              maxNames={maxNames}
              actualCount={actualCount}
            />
          </div>

          {/* 右侧：展示区（8列，约67%） */}
          <div className="lg:col-span-8 space-y-6">
            {/* 上部分：AI状态（20%高度） */}
            {phase !== 'idle' && (
              <NarrowDownStatus
                phase={phase}
                message={getStatusMessage(phase)}
              />
            )}

            {/* 下部分：卡片展示区（80%高度） */}
            <div className="min-h-[600px]">
              {phase === 'idle' && !error && (
                <motion.div
                  className="flex items-center justify-center h-full bg-white rounded-xl 
                             border border-gray-200 shadow-sm p-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-xl text-gray-700">
                      Enter your naming context to begin
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      We'll help you analyze and rank your name candidates
                    </p>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  className="p-6 bg-red-50 border-2 border-red-200 rounded-xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h3 className="text-lg font-semibold text-red-700 mb-2">
                    Error
                  </h3>
                  <p className="text-red-600">{error}</p>
                </motion.div>
              )}

              {cards.length > 0 && (
                <CardStack
                  cards={cards}
                  onFlipCard={flipCard}
                  onHoverCard={setCardHovered}
                  onTypingComplete={markAsTyped}
                  onToggleOpinion={toggleOpinion}
                  strongOpinion={strongOpinion}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 状态消息映射
function getStatusMessage(phase: string): string {
  const messages: Record<string, string> = {
    tracking: 'Tracking names...',
    analyzing: 'Context analyzing...',
    researching: 'Doing research...',
    deciding: 'Deciding...',
    crafting: 'Crafting stories...',
  };
  return messages[phase] || 'Processing...';
}

