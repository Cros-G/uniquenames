import React from 'react';
import { motion } from 'framer-motion';

interface StrategySectionProps {
  strategy: string;
}

/**
 * Strategy Section Component - Displays AI's naming strategy
 */
export function StrategySection({ strategy }: StrategySectionProps) {
  if (!strategy) return null;

  return (
    <motion.div
      className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm border-l-4 border-purple-500"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-3">
        🎯 Naming Strategy
      </h3>
      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {strategy}
      </p>
    </motion.div>
  );
}

