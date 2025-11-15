import React from 'react';
import { motion } from 'framer-motion';

interface AnalysisSectionProps {
  analysis: string;
}

/**
 * Analysis Section Component - Displays AI's analysis of requirements
 */
export function AnalysisSection({ analysis }: AnalysisSectionProps) {
  if (!analysis) return null;

  return (
    <motion.div
      className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm border-l-4 border-pink-500"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-3">
        📊 Analysis
      </h3>
      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {analysis}
      </p>
    </motion.div>
  );
}

