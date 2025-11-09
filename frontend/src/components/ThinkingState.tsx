import React from 'react';
import { motion } from 'framer-motion';

/**
 * 思考状态组件 - 显示 AI 正在思考的动画
 */
export function ThinkingState({ message }: { message: string }) {
  return (
    <motion.div
      className="flex items-center space-x-3 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-accent rounded-full"
            animate={{
              y: [-4, 4, -4],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      <span className="text-text-secondary">{message}</span>
    </motion.div>
  );
}

