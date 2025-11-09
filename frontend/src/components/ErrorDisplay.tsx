import React from 'react';
import { motion } from 'framer-motion';

interface ErrorDisplayProps {
  error: string;
  onDismiss?: () => void;
}

/**
 * 错误显示组件
 */
export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  return (
    <motion.div
      className="p-4 bg-red-900/50 border border-red-500 rounded-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">❌</div>
          <div>
            <h4 className="text-lg font-semibold text-red-300 mb-1">
              出错了
            </h4>
            <p className="text-red-200">{error}</p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-300 hover:text-red-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}

