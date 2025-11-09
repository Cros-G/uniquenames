import React from 'react';
import { motion } from 'framer-motion';

interface StrategySectionProps {
  strategy: string;
}

/**
 * 策略区域组件 - 显示 AI 的命名策略
 */
export function StrategySection({ strategy }: StrategySectionProps) {
  if (!strategy) return null;

  return (
    <motion.div
      className="mb-6 p-4 bg-card-bg rounded-lg border-l-4 border-purple-500"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-purple-400 mb-2">
        🎯 命名策略
      </h3>
      <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
        {strategy}
      </p>
    </motion.div>
  );
}

