import React from 'react';
import { motion } from 'framer-motion';
import type { PreferredName } from '../types/naming';

interface PreferredRevealProps {
  preferred: PreferredName;
}

/**
 * AI Preferred Name Reveal Component
 * After all cards are revealed, displays AI's final recommendation
 */
export function PreferredReveal({ preferred }: PreferredRevealProps) {
  return (
    <motion.div
      className="mt-8 p-6 bg-gradient-to-r from-pink-50 to-purple-50 
                 rounded-xl border-2 border-pink-300 shadow-md"
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
        <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          AI's Final Recommendation
        </h3>
      </div>
      
      <div className="pl-12">
        <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-3">
          {preferred.preferred_name}
        </p>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {preferred.preferred_reason}
        </p>
      </div>
    </motion.div>
  );
}

