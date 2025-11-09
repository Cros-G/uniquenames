import React from 'react';
import { motion } from 'framer-motion';

interface AnalysisSectionProps {
  analysis: string;
}

/**
 * 分析区域组件 - 显示 AI 对需求的分析
 */
export function AnalysisSection({ analysis }: AnalysisSectionProps) {
  if (!analysis) return null;

  return (
    <motion.div
      className="mb-6 p-4 bg-card-bg rounded-lg border-l-4 border-accent"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-accent mb-2">
        📊 需求分析
      </h3>
      <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
        {analysis}
      </p>
    </motion.div>
  );
}

