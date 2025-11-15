import { motion } from 'framer-motion';

interface GenerateStatusProps {
  phase: string;
  message: string;
}

// 状态配置（英文）
const statusConfig: Record<string, { title: string; explanation: string; icon: string }> = {
  analyzing: {
    title: 'Analyzing context...',
    explanation: 'Understanding your naming needs and preferences',
    icon: '🧠',
  },
  strategizing: {
    title: 'Creating strategy...',
    explanation: 'Developing a customized naming approach',
    icon: '📝',
  },
  generating: {
    title: 'Generating names...',
    explanation: 'Crafting unique names based on your context',
    icon: '✨',
  },
  revealing: {
    title: 'Ready to reveal!',
    explanation: 'Your personalized names are ready',
    icon: '🎉',
  },
  done: {
    title: 'Done!',
    explanation: 'All names generated and ready for your review',
    icon: '🎉',
  },
};

/**
 * Generate 状态展示组件
 * 参考 NarrowDownStatus，保持视觉一致性
 */
export function GenerateStatus({ phase, message }: GenerateStatusProps) {
  const config = statusConfig[phase] || {
    title: message,
    explanation: 'Processing...',
    icon: '⏳',
  };

  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      key={phase} // 阶段变化时重新触发动画
    >
      <div className="flex items-center gap-4">
        {/* 图标 */}
        <motion.div
          className="text-4xl flex-shrink-0"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {config.icon}
        </motion.div>
        
        {/* 状态文字 */}
        <div className="flex-1">
          <motion.h3
            className="text-lg font-semibold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {config.title}
          </motion.h3>
          
          <motion.p
            className="text-sm text-gray-600 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {config.explanation}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

