import React from 'react';
import { motion } from 'framer-motion';

interface NameCardProps {
  name: string;
  reason: string;
  index: number;
  isRevealed: boolean;
  isPreferred: boolean;
  onClick: () => void;
}

/**
 * 名字卡片组件 - 核心组件
 * 实现模糊->清晰的渐进式揭示效果
 */
export function NameCard({
  name,
  reason,
  index,
  isRevealed,
  isPreferred,
  onClick,
}: NameCardProps) {
  return (
    <motion.div
      className={`
        relative p-6 rounded-lg cursor-pointer
        transition-all duration-300
        ${isPreferred && isRevealed 
          ? 'border-4 border-accent shadow-lg shadow-accent/50' 
          : 'border border-gray-700'}
        ${isRevealed ? 'bg-card-bg' : 'bg-gradient-to-br from-gray-800 to-gray-900'}
      `}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1, // 逐个出现效果
      }}
      whileHover={isRevealed ? {} : { scale: 1.02 }}
      onClick={isRevealed ? undefined : onClick}
      style={{
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* 闪光动画（仅在被选中且揭示时显示） */}
      {isPreferred && isRevealed && (
        <motion.div
          className="absolute inset-0 rounded-lg opacity-50"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.4), transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* 卡片内容 */}
      <div
        className={`
          relative z-10 transition-all duration-500
          ${isRevealed ? '' : 'blur-lg opacity-30 select-none'}
        `}
      >
        <h4 className="text-2xl font-bold text-accent mb-3">
          {name}
        </h4>
        <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
          {reason}
        </p>
      </div>

      {/* 未揭示状态提示 */}
      {!isRevealed && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <motion.div
              className="text-4xl mb-2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.div>
            <p className="text-text-secondary text-sm">点击揭示</p>
          </div>
        </motion.div>
      )}

      {/* AI 之选标记 */}
      {isPreferred && isRevealed && (
        <motion.div
          className="absolute top-2 right-2 px-3 py-1 bg-accent rounded-full text-sm font-semibold"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          ✨ AI 之选
        </motion.div>
      )}
    </motion.div>
  );
}

