import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// 可用的AI模型列表
const AVAILABLE_MODELS = [
  {
    id: 'openai/gpt-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    description: '最新的GPT-5模型',
  },
  {
    id: 'anthropic/claude-4.5-sonnet',
    name: 'Claude 4.5 Sonnet',
    provider: 'Anthropic',
    description: '平衡性能和速度的Claude模型',
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 pro',
    provider: 'Google',
    description: 'Google最新的Gemini模型',
  },
];

const STORAGE_KEY = 'uniquenames_selected_model';

/**
 * 设置面板组件 - 允许用户配置AI模型
 */
export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [selectedModel, setSelectedModel] = useState<string>(
    AVAILABLE_MODELS[1].id // 默认 Claude
  );

  // 从 localStorage 加载设置
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSelectedModel(saved);
    }
  }, []);

  // 保存设置
  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, selectedModel);
    // 触发自定义事件，让其他组件知道模型已更改
    window.dispatchEvent(new CustomEvent('modelChanged', { detail: selectedModel }));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-2xl bg-card-bg rounded-lg shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-purple-900/50 to-violet-900/50 p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-accent flex items-center gap-2">
                ⚙️ 设置
              </h2>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 内容 */}
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                🤖 AI 模型选择
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                选择用于生成名字的AI模型。不同模型有不同的特点和风格。
              </p>

              <div className="space-y-3">
                {AVAILABLE_MODELS.map((model) => (
                  <label
                    key={model.id}
                    className={`
                      flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${
                        selectedModel === model.id
                          ? 'border-accent bg-accent/10'
                          : 'border-gray-700 hover:border-gray-600 bg-dark-bg/30'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="model"
                      value={model.id}
                      checked={selectedModel === model.id}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="mt-1 mr-3 text-accent focus:ring-accent"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-text-primary">
                          {model.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-900/50 text-purple-300">
                          {model.provider}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {model.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 提示信息 */}
            <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <p className="text-sm text-blue-300">
                💡 提示：更改模型后，新的生成请求将使用所选模型。已有的审计记录不会改变。
              </p>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-600 text-text-secondary 
                       hover:text-text-primary hover:border-gray-500 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600
                       hover:from-purple-700 hover:to-violet-700 font-semibold
                       transition-all shadow-lg"
            >
              保存设置
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * 获取当前选中的模型
 */
export function getSelectedModel(): string {
  return localStorage.getItem(STORAGE_KEY) || AVAILABLE_MODELS[1].id;
}

