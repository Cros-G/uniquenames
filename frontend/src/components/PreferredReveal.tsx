import React from 'react';
import { motion } from 'framer-motion';
import type { PreferredName } from '../types/naming';

interface PreferredRevealProps {
  preferred: PreferredName;
}

/**
 * AI 推荐名字展示组件
 * 在所有卡片揭示后，显示 AI 的最终推荐
 */
export function PreferredReveal({ preferred }: PreferredRevealProps) {
  return (
    <motion.div
      className="mt-8 p-6 bg-gradient-to-r from-purple-900/50 to-violet-900/50 
                 rounded-lg border-2 border-accent"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      <div className="flex items-center mb-4">
        <motion.div
          className="text-3xl mr-3"
          animate={{ rotate: [0, 10, -10, 10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          ⭐
        </motion.div>
        <h3 className="text-2xl font-bold text-accent">
          AI 的最终推荐
        </h3>
      </div>
      
      <div className="pl-12">
        <p className="text-3xl font-bold text-text-primary mb-3">
          {preferred.preferred_name}
        </p>
        <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
          {preferred.preferred_reason}
        </p>
      </div>
    </motion.div>
  );
}

