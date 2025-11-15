import { motion } from 'framer-motion';
import { NarrowDownCard } from './NarrowDownCard';
import type { NameCardData } from '../../types/narrowDown';

interface CardStackProps {
  cards: NameCardData[];
  onFlipCard: (numbering: number) => void;
  onHoverCard: (numbering: number, isHovered: boolean) => void;
  onTypingComplete: (numbering: number) => void;
  onToggleOpinion: (numbering: number) => void;
  strongOpinion: string | null;
}

/**
 * 卡片堆叠容器
 * 遵循 design_system.md: 温暖明亮风格
 */
export function CardStack({ cards, onFlipCard, onHoverCard, onTypingComplete, onToggleOpinion, strongOpinion }: CardStackProps) {
  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">🃏</div>
          <p className="text-lg">等待名字卡片生成...</p>
        </div>
      </div>
    );
  }

  // 按 ranking 排序（如果有ranking信息）
  const sortedCards = [...cards].sort((a, b) => {
    if (a.ranking && b.ranking) {
      return a.ranking - b.ranking; // ranking 1 在最前
    }
    return a.numbering - b.numbering;
  });

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 网格布局：3列（桌面），2列（平板），1列（移动） */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {sortedCards.map((card) => (
          <motion.div
            key={card.numbering}
            layout // Framer Motion 自动处理位置变化动画
            className="w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <NarrowDownCard
              card={card}
              onFlip={() => onFlipCard(card.numbering)}
              onHover={(isHovered) => onHoverCard(card.numbering, isHovered)}
              onTypingComplete={onTypingComplete}
              onToggleOpinion={onToggleOpinion}
              strongOpinion={strongOpinion}
            />
          </motion.div>
        ))}
      </div>

      {/* 底部提示 */}
      <motion.div
        className="mt-8 text-center text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p>💡 Hover over cards to see details • Click to flip and view evaluation</p>
      </motion.div>
    </div>
  );
}


