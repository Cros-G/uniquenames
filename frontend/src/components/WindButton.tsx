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
      className="px-8 py-4 rounded-full font-semibold text-lg
                 bg-gradient-to-r from-cyan-500 to-blue-500
                 hover:from-cyan-600 hover:to-blue-600
                 disabled:opacity-50 disabled:cursor-not-allowed
                 shadow-lg shadow-cyan-500/50
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

