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
      className="w-full md:w-1/3 p-6 bg-white rounded-xl border border-gray-200 shadow-md"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        告诉我你的需求
      </h2>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          disabled={isLoading}
          placeholder="例如：给我的咖啡店起个温暖又有创意的名字..."
          className="w-full h-64 p-4 bg-white border-2 border-gray-200 rounded-lg 
                     text-gray-900 placeholder-gray-400
                     focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                     disabled:opacity-50 disabled:cursor-not-allowed
                     resize-none transition-all duration-200"
        />
        
        <motion.button
          type="submit"
          disabled={isLoading || !context.trim()}
          className="w-full mt-4 py-3 px-6 rounded-lg font-medium
                     bg-gradient-to-r from-pink-500 to-purple-600
                     hover:from-pink-600 hover:to-purple-700
                     text-white shadow-md hover:shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
        >
          {isLoading ? '正在思考中...' : '开始生成'}
        </motion.button>
      </form>
      
      <div className="mt-6 text-sm text-gray-600">
        <p className="font-medium">💡 提示：</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>描述你的产品、服务或品牌特点</li>
          <li>说明你希望的风格和调性</li>
          <li>提及目标受众或使用场景</li>
        </ul>
      </div>
    </motion.div>
  );
}

