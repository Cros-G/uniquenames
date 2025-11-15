import { motion } from 'framer-motion';
import type { NameCardData } from '../../types/narrowDown';
import { TypewriterName } from './TypewriterName';

interface NarrowDownCardProps {
  card: NameCardData;
  onFlip: () => void;
  onHover: (isHovered: boolean) => void;
  onTypingComplete?: (numbering: number) => void;
  onToggleOpinion?: (numbering: number) => void;
  strongOpinion?: string | null;
}

/**
 * Narrow Down 名字卡片组件
 * 遵循 design_system.md: 温暖明亮风格 + 3D翻转
 */
export function NarrowDownCard({
  card,
  onFlip,
  onHover,
  onTypingComplete,
  onToggleOpinion,
  strongOpinion,
}: NarrowDownCardProps) {
  const { isFlipped, isHovered, ranking, hasTyped, isOpinionExpanded } = card;

  return (
    <motion.div
      className="relative w-full h-[480px] cursor-pointer hover:-translate-y-2 hover:scale-[1.03] transition-transform duration-200"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onFlip}
    >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.68, -0.55, 0.265, 1.55] }}
        >
          <div
            className="relative z-10 h-full"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* 正面：故事 */}
            <div
              className="absolute w-full h-full backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
            <div 
              className={`
                h-full flex flex-col min-h-0 bg-white rounded-xl border-2 shadow-lg
                transition-all duration-200
                ${ranking === 1
                  ? 'border-yellow-400'
                  : card.storyTitle 
                    ? 'border-pink-300' 
                    : 'border-gray-200'}
              `}
              style={ranking === 1 ? {
                boxShadow: '0 0 30px rgba(251, 191, 36, 0.4)'
              } : card.storyTitle ? { 
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)' 
              } : undefined}
            >
              {/* Why it's the BEST? 标签（仅第一名） */}
              {ranking === 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleOpinion?.(card.numbering);
                  }}
                  className="absolute top-4 left-4 px-3 py-1.5 
                             bg-gradient-to-r from-yellow-400 to-amber-500
                             hover:from-yellow-500 hover:to-amber-600
                             text-white text-xs font-bold rounded-full
                             shadow-md hover:shadow-lg
                             flex items-center gap-1.5
                             transition-all duration-200"
                >
                  <span>⭐</span>
                  <span>Why it's the BEST?</span>
                  <span className="text-[10px]">{isOpinionExpanded ? '▲' : '▼'}</span>
                </button>
              )}

              {/* 排名标记 */}
              {ranking && (
                <div className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center
                                bg-gradient-to-br from-pink-500 to-purple-600 rounded-full
                                text-white font-bold text-lg shadow-md">
                  #{ranking}
                </div>
              )}

              {/* 内容区 - 使用 flex 布局 */}
              <div className="flex-1 flex flex-col p-8 overflow-hidden min-h-0">
                {/* 名字 - 打字效果或静态显示 */}
                <div className="mb-4 flex-shrink-0">
                  {!hasTyped ? (
                    <TypewriterName
                      name={card.name}
                      speed={80}
                      onComplete={() => onTypingComplete?.(card.numbering)}
                    />
                  ) : (
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 
                                   bg-clip-text text-transparent">
                      {card.name}
                    </h3>
                  )}
                </div>

                {/* 分析状态或故事 */}
                {card.currentDimension ? (
                  <div className="text-sm text-gray-600 italic flex-shrink-0">
                    Analyzing {card.currentDimension}...
                  </div>
                ) : card.storyTitle ? (
                  <>
                    {/* 故事标题 - 固定不滚动 */}
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex-shrink-0">
                      {card.storyTitle}
                    </h4>
                    
                    {/* 故事内容 - 可滚动 */}
                    <div 
                      className="flex-1 overflow-y-auto pr-2 text-base text-gray-700 leading-relaxed min-h-0"
                      onClick={(e) => e.stopPropagation()}
                      onWheel={(e) => {
                        e.currentTarget.scrollTop += e.deltaY;
                        e.stopPropagation();
                      }}
                    >
                      {card.story}
                    </div>
                    
                    {/* AI's Strong Opinion 对话气泡（底部固定） */}
                    {ranking === 1 && isOpinionExpanded && strongOpinion && (
                      <motion.div
                        className="flex-shrink-0 mt-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="relative">
                          {/* 三角尖角（指向左上角标签） */}
                          <div className="absolute -top-2 left-8 w-4 h-4 
                                          bg-yellow-50 border-l-2 border-t-2 border-yellow-300 
                                          transform rotate-45 z-0" />
                          
                          {/* 气泡主体 */}
                          <div className="relative z-10 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 shadow-md">
                            <div className="flex items-start gap-2">
                              <span className="text-xl flex-shrink-0">💬</span>
                              <div className="flex-1">
                                <h5 className="font-bold text-yellow-800 text-sm mb-1">
                                  AI's Strong Opinion
                                </h5>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {strongOpinion}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📝</div>
                      <p className="text-sm">Waiting for story...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* 背面：评估详情 */}
            <div
              className="absolute w-full h-full backface-hidden"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="h-full flex flex-col p-8 bg-gradient-to-br from-purple-50 to-pink-50 
                             rounded-xl border-2 border-purple-200 shadow-lg">
                {/* 标题 - 固定 */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex-shrink-0">
                  {card.name} - Evaluation
                </h3>
                
                {/* 评估详情 - 可滚动 */}
                <div 
                  className="flex-1 overflow-y-auto pr-2"
                  onClick={(e) => e.stopPropagation()}
                >
                {card.evaluation ? (
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-purple-700 mb-2">
                        Context-Independent Criteria
                      </h4>
                      <div className="space-y-2 text-xs">
                        {Object.entries(card.evaluation.context_independent_criteria).map(([key, value]) => (
                          <div key={key} className="bg-white/70 p-2 rounded">
                            <div className="font-medium capitalize text-gray-800">
                              {key.replace(/_/g, ' ')}
                            </div>
                            <div className="text-green-600">✓ {value.Benefit}</div>
                            <div className="text-orange-600">⚠ {value.Risks}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-pink-700 mb-2">
                        Context-Dependent Criteria
                      </h4>
                      <div className="space-y-2 text-xs">
                        {Object.entries(card.evaluation.context_dependent_criteria).map(([key, value]) => (
                          <div key={key} className="bg-white/70 p-2 rounded">
                            <div className="font-medium capitalize text-gray-800">
                              {key.replace(/_/g, ' ')}
                            </div>
                            <div className="text-green-600">✓ {value['Positive Fit']}</div>
                            <div className="text-orange-600">⚠ {value['Negative Fit']}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center flex-1 text-gray-400">
                    <p>No evaluation data</p>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
    </motion.div>
  );
}


