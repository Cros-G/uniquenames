import React from 'react';
import { motion } from 'framer-motion';

interface WindButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

/**
 * "吹一阵风"按钮 - 揭示所有卡片
 */
export function WindButton({ onClick, disabled = false }: WindButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="px-8 py-4 rounded-lg font-medium text-lg
                 bg-gradient-to-r from-pink-500 to-purple-600
                 hover:from-pink-600 hover:to-purple-700
                 text-white
                 disabled:opacity-50 disabled:cursor-not-allowed
                 shadow-md hover:shadow-lg
                 transition-all duration-200"
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span className="flex items-center space-x-2">
        <span>🌬️</span>
        <span>吹一阵风</span>
      </span>
    </motion.button>
  );
}

