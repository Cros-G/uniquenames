import { motion } from 'framer-motion';

interface NarrowDownStatusProps {
  phase: string;
  message: string;
}

// 状态配置（英文）
const statusConfig: Record<string, { title: string; explanation: string; icon: string }> = {
  tracking: {
    title: 'Tracking names...',
    explanation: 'Identifying all name candidates from your input',
    icon: '🔍',
  },
  analyzing: {
    title: 'Context analyzing...',
    explanation: 'Analyzing naming context and your attitude toward each name',
    icon: '🧠',
  },
  researching: {
    title: 'Doing research...',
    explanation: 'Evaluating each name across 6 key dimensions',
    icon: '📚',
  },
  deciding: {
    title: 'Deciding...',
    explanation: 'Synthesizing all information to rank the names',
    icon: '⚖️',
  },
  crafting: {
    title: 'Crafting stories...',
    explanation: 'Creating personalized narratives for each name',
    icon: '✍️',
  },
  done: {
    title: 'Done!',
    explanation: 'All stories crafted and ready for your review',
    icon: '🎉',
  },
};

/**
 * Narrow Down 状态展示组件
 * 遵循 design_system.md: 温暖明亮风格
 */
export function NarrowDownStatus({ phase, message }: NarrowDownStatusProps) {
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


