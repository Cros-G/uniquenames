import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/platform/Sidebar';
import { PromptEditor } from '../components/platform/PromptEditor';

interface Prompt {
  id: number;
  name: string;
  version: string;
  tag: string;
  content: string;
  default_model: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

/**
 * 提示词管理页面
 */
export function PromptManagePage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');

  // 加载提示词列表
  const loadPrompts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/prompts');
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error('加载提示词失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 激活提示词
  const handleActivate = async (id: number, tag: string) => {
    try {
      await fetch(`/api/admin/prompts/${id}/activate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag }),
      });
      loadPrompts();
    } catch (error) {
      console.error('激活失败:', error);
    }
  };

  // 删除提示词
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此提示词吗？')) return;
    
    try {
      await fetch(`/api/admin/prompts/${id}`, { method: 'DELETE' });
      loadPrompts();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败：' + (error as Error).message);
    }
  };

  // 打开编辑器
  const handleEdit = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setEditorMode('edit');
    setIsEditorOpen(true);
  };

  // 打开新建编辑器
  const handleCreate = () => {
    setSelectedPrompt(null);
    setEditorMode('create');
    setIsEditorOpen(true);
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  // 按标签分组
  const groupedPrompts = prompts.reduce((acc, prompt) => {
    if (!acc[prompt.tag]) {
      acc[prompt.tag] = [];
    }
    acc[prompt.tag].push(prompt);
    return acc;
  }, {} as Record<string, Prompt[]>);

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        {/* 页面头部 */}
        <div className="p-8 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">📝 提示词管理</h1>
              <p className="text-text-secondary">管理和版本控制所有AI提示词模板</p>
            </div>
            <motion.button
              onClick={handleCreate}
              className="px-6 py-3 bg-accent hover:bg-purple-700 rounded-lg font-semibold
                         shadow-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              + 新建提示词
            </motion.button>
          </div>
        </div>

        {/* 提示词列表 */}
        <div className="p-8">
          {loading ? (
            <div className="text-center text-text-secondary py-12">加载中...</div>
          ) : Object.keys(groupedPrompts).length === 0 ? (
            <div className="text-center text-text-secondary py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-xl">还没有提示词，点击「新建提示词」开始</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedPrompts).map(([tag, tagPrompts]) => (
                <div key={tag}>
                  <h2 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
                    <span className="px-3 py-1 bg-accent/20 rounded-full text-sm">
                      {tag}
                    </span>
                    <span className="text-text-secondary text-sm">
                      ({tagPrompts.length} 个版本)
                    </span>
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {tagPrompts.map((prompt) => (
                      <motion.div
                        key={prompt.id}
                        className={`
                          p-6 rounded-lg border-2 transition-all
                          ${prompt.is_active 
                            ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20' 
                            : 'border-gray-700 bg-card-bg'}
                        `}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-text-primary mb-1">
                              {prompt.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-text-secondary">
                                v{prompt.version}
                              </span>
                              {prompt.is_active && (
                                <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                                  ✓ 激活中
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {!prompt.is_active && (
                              <button
                                onClick={() => handleActivate(prompt.id, prompt.tag)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm
                                         transition-colors"
                                title="设为激活版本"
                              >
                                激活
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(prompt)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm
                                       transition-colors"
                              title="编辑"
                            >
                              编辑
                            </button>
                            {!prompt.is_active && (
                              <button
                                onClick={() => handleDelete(prompt.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm
                                         transition-colors"
                                title="删除"
                              >
                                删除
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-text-secondary mb-2">
                          <span>模型: </span>
                          <span className="text-text-primary">
                            {prompt.default_model || '未指定'}
                          </span>
                        </div>
                        
                        <div className="text-xs text-text-secondary">
                          创建于: {new Date(prompt.created_at).toLocaleString('zh-CN')}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 提示词编辑器Modal */}
      <PromptEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        prompt={selectedPrompt}
        mode={editorMode}
        onSave={() => {
          loadPrompts();
          setIsEditorOpen(false);
        }}
      />
    </div>
  );
}

