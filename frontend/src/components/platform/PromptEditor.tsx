import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Prompt {
  id?: number;
  name: string;
  version: string;
  tag: string;
  content: string;
  default_model: string | null;
  is_active?: number;
}

interface PromptEditorProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  mode: 'create' | 'edit';
  onSave: () => void;
}

/**
 * 提示词编辑器组件
 */
export function PromptEditor({ isOpen, onClose, prompt, mode, onSave }: PromptEditorProps) {
  const [formData, setFormData] = useState<Prompt>({
    name: '',
    version: '1.0',
    tag: 'generation',
    content: '',
    default_model: 'anthropic/claude-3.5-sonnet',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 当 prompt 改变时更新表单
  useEffect(() => {
    if (prompt && mode === 'edit') {
      setFormData({
        name: prompt.name,
        version: prompt.version,
        tag: prompt.tag,
        content: prompt.content,
        default_model: prompt.default_model,
      });
    } else {
      // 重置表单
      setFormData({
        name: '',
        version: '1.0',
        tag: 'generation',
        content: '',
        default_model: 'anthropic/claude-4.5-sonnet',
      });
    }
    setError('');
  }, [prompt, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (mode === 'create') {
        // 创建新提示词
        const response = await fetch('/api/admin/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '创建失败');
        }

        console.log('✅ 创建成功');
      } else {
        // 更新提示词
        const response = await fetch(`/api/admin/prompts/${prompt?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '更新失败');
        }

        console.log('✅ 更新成功');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
      setError((error as Error).message);
    } finally {
      setSaving(false);
    }
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
          className="w-full max-w-4xl max-h-[90vh] bg-card-bg rounded-lg shadow-2xl overflow-hidden flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-purple-900/50 to-violet-900/50 p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-accent">
                {mode === 'create' ? '📝 新建提示词' : '✏️ 编辑提示词'}
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

          {/* 表单内容 */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
                ❌ {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {/* 名称 */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-dark-bg border border-gray-700 rounded-lg
                           text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="例如：Name Generation Prompt"
                />
              </div>

              {/* 版本 */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  版本 *
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-dark-bg border border-gray-700 rounded-lg
                           text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="例如：1.0"
                />
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  标签 *
                </label>
                <select
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-dark-bg border border-gray-700 rounded-lg
                           text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="generation">generation</option>
                  <option value="selection">selection</option>
                  <option value="other">other</option>
                </select>
              </div>

              {/* 默认模型 */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  默认模型
                </label>
                <select
                  value={formData.default_model || ''}
                  onChange={(e) => setFormData({ ...formData, default_model: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-bg border border-gray-700 rounded-lg
                           text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="anthropic/claude-4.5-sonnet">Claude 4.5 Sonnet</option>
                  <option value="openai/gpt-5">GPT-5</option>
                  <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
                </select>
              </div>
            </div>

            {/* 内容 */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                提示词内容 *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={16}
                className="w-full px-4 py-2 bg-dark-bg border border-gray-700 rounded-lg
                         text-text-primary focus:outline-none focus:ring-2 focus:ring-accent
                         font-mono text-sm resize-none"
                placeholder="输入完整的提示词内容..."
              />
              <div className="mt-2 text-xs text-text-secondary">
                {formData.content.length} 字符
              </div>
            </div>

            {/* 提示 */}
            <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <p className="text-sm text-blue-300">
                💡 提示：
                {mode === 'create' 
                  ? '新建的提示词默认不会激活，需要手动激活才能生效。'
                  : '修改提示词内容后，如果该版本已激活，将立即影响用户生成结果。'}
              </p>
            </div>

            {/* 底部按钮 */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-6 py-2 rounded-lg border border-gray-600 text-text-secondary 
                         hover:text-text-primary hover:border-gray-500 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600
                         hover:from-purple-700 hover:to-violet-700 font-semibold
                         transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


