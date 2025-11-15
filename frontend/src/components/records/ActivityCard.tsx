import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Activity } from '../../types/user';
import { StepDetails } from './StepDetails';

interface ActivityCardProps {
  activity: Activity;
}

/**
 * 活动卡片组件
 * 遵循 design_system.md: 温暖明亮风格
 */
export function ActivityCard({ activity }: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const typeConfig = {
    generation: {
      icon: '🎨',
      label: 'Generate',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
    },
    narrow_down: {
      icon: '🎯',
      label: 'Narrow Down',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  };
  
  const config = typeConfig[activity.type];
  const timestamp = new Date(activity.timestamp);

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg 
                 transition-all duration-200 overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      {/* 顶部彩色条 */}
      <div className={`h-1 bg-gradient-to-r ${config.color}`} />
      
      <div className="p-6">
        {/* 标题行 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{config.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {config.label}
              </h3>
              <p className="text-sm text-gray-500">
                {formatTimestamp(timestamp)}
              </p>
            </div>
          </div>
          
          {/* 成功/失败标志 */}
          {!activity.success && (
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
              Failed
            </span>
          )}
        </div>
        
        {/* 用户输入（截断） */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 line-clamp-2">
            {activity.userInput}
          </p>
        </div>
        
        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">💬</span>
            <div>
              <p className="text-xs text-gray-500">Steps</p>
              <p className="text-sm font-semibold text-gray-900">
                {activity.steps.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-purple-500">📊</span>
            <div>
              <p className="text-xs text-gray-500">Tokens</p>
              <p className="text-sm font-semibold text-purple-600">
                {activity.totalTokens.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-green-500">💰</span>
            <div>
              <p className="text-xs text-gray-500">Cost</p>
              <p className="text-sm font-semibold text-green-600">
                {activity.totalCost > 0 ? `$${activity.totalCost.toFixed(4)}` : 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-blue-500">⏱️</span>
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-semibold text-blue-600">
                {(activity.totalDuration / 1000).toFixed(1)}s
              </p>
            </div>
          </div>
        </div>
        
        {/* 名字数量（如果有） */}
        {activity.namesCount > 0 && (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <span className="text-yellow-500">✨</span>
            <span className="text-gray-700">
              {activity.namesCount} {activity.type === 'generation' ? 'names generated' : 'names analyzed'}
            </span>
          </div>
        )}
        
        {/* 展开/折叠按钮 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 
                     flex items-center justify-center gap-2 transition-colors"
        >
          <span>{isExpanded ? 'Hide' : 'Show'} Details</span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ▼
          </motion.span>
        </button>
        
        {/* 步骤详情 */}
        <StepDetails steps={activity.steps} isExpanded={isExpanded} />
      </div>
    </motion.div>
  );
}

/**
 * 格式化时间戳
 */
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

