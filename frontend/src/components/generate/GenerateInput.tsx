import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GenerateInputProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
  initialValue?: string; // 新增：支持 URL 参数预填充
}

/**
 * Generate 输入组件
 * 参考 NarrowDownInput，保持视觉一致性
 */
export function GenerateInput({
  onSubmit,
  isLoading,
  initialValue = '',
}: GenerateInputProps) {
  const [input, setInput] = useState('');

  // 监听 initialValue 变化，自动填充
  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
    }
  }, [initialValue]);

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
          Tell us your needs
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Describe your naming needs, preferences, or inspiration..."
              className={`
                w-full h-64 p-4 
                bg-white border-2 rounded-lg
                text-base text-gray-900 placeholder-gray-400
                focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                disabled:opacity-50 disabled:cursor-not-allowed
                resize-none transition-all duration-200
                leading-relaxed
                border-gray-200
              `}
            />
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
            {isLoading ? 'Generating...' : 'Generate Names'}
          </motion.button>
        </form>
        
        <div className="mt-6 text-sm text-gray-600">
          <p className="font-medium mb-2">💡 Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Share your values, inspirations, or themes</li>
            <li>Mention any preferences or constraints</li>
            <li>The more context, the better the results</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

