import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InputPanelProps {
  onSubmit: (context: string) => void;
  isLoading: boolean;
}

/**
 * 输入面板组件 - 左侧用户输入区域
 */
export function InputPanel({ onSubmit, isLoading }: InputPanelProps) {
  const [context, setContext] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔘 [InputPanel] 表单提交被触发');
    console.log('📝 [InputPanel] context 值:', context);
    console.log('✅ [InputPanel] context.trim():', context.trim());
    
    if (context.trim()) {
      console.log('✅ [InputPanel] 调用 onSubmit 回调');
      onSubmit(context.trim());
    } else {
      console.log('⚠️ [InputPanel] context 为空，不调用 onSubmit');
    }
  };

  return (
    <motion.div
      className="w-full md:w-1/3 p-6 bg-card-bg rounded-lg shadow-lg"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-accent mb-4">
        告诉我你的需求
      </h2>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          disabled={isLoading}
          placeholder="例如：给我的咖啡店起个温暖又有创意的名字..."
          className="w-full h-64 p-4 bg-dark-bg border border-gray-700 rounded-lg 
                     text-text-primary placeholder-text-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     resize-none"
        />
        
        <motion.button
          type="submit"
          disabled={isLoading || !context.trim()}
          className="w-full mt-4 py-3 px-6 rounded-lg font-semibold
                     bg-gradient-to-r from-purple-600 to-violet-600
                     hover:from-purple-700 hover:to-violet-700
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
        >
          {isLoading ? '正在思考中...' : '开始生成'}
        </motion.button>
      </form>
      
      <div className="mt-6 text-sm text-text-secondary">
        <p>💡 提示：</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>描述你的产品、服务或品牌特点</li>
          <li>说明你希望的风格和调性</li>
          <li>提及目标受众或使用场景</li>
        </ul>
      </div>
    </motion.div>
  );
}

