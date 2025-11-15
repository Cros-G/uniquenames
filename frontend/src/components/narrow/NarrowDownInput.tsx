import { useState } from 'react';
import { motion } from 'framer-motion';

interface NarrowDownInputProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
  showOverLimit: boolean;
  maxNames: number;
  actualCount: number;
}

/**
 * Narrow Down 输入组件
 * 遵循 design_system.md: 温暖明亮风格
 */
export function NarrowDownInput({
  onSubmit,
  isLoading,
  showOverLimit,
  maxNames,
  actualCount,
}: NarrowDownInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
    }
  };

  return (
    <div className="w-full p-6">
      <motion.div
        className="bg-white rounded-xl border border-gray-200 shadow-md p-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Tell us your context
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="List your name candidates and share your thoughts..."
              className={`
                w-full h-64 p-4 
                bg-white border-2 rounded-lg
                text-base text-gray-900 placeholder-gray-400
                focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                disabled:opacity-50 disabled:cursor-not-allowed
                resize-none transition-all duration-200
                leading-relaxed
                ${showOverLimit ? 'border-red-400' : 'border-gray-200'}
              `}
            />
            
            {/* 超限警告 */}
            {showOverLimit && (
              <motion.div
                className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ 名字数量超过限制
                </p>
                <p className="text-xs text-red-500 mt-1">
                  最多 {maxNames} 个，实际 {actualCount} 个。请减少名字数量。
                </p>
              </motion.div>
            )}
          </div>
          
          <motion.button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-full mt-4 py-3 px-6 rounded-lg font-medium
                       bg-gradient-to-r from-pink-500 to-purple-600
                       hover:from-pink-600 hover:to-purple-700
                       text-white shadow-md hover:shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? 'Processing...' : 'Start Analysis'}
          </motion.button>
        </form>
        
        <div className="mt-6 text-sm text-gray-600">
          <p className="font-medium mb-2">💡 Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>List all name candidates (one per line or comma-separated)</li>
            <li>Share your thoughts, concerns, or preferences</li>
            <li>Provide context about the naming decision</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

