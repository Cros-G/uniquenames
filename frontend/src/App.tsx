import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNamingStore } from './store/useNamingStore';
import { streamGenerateNames } from './services/streamingAPI';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { AuditPanel } from './components/AuditPanel';
import { SettingsPanel, getSelectedModel } from './components/SettingsPanel';

function App() {
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const {
    phase,
    analysis,
    strategy,
    nameCards,
    preferred,
    revealedCards,
    allRevealed,
    error,
    setAnalysis,
    setStrategy,
    addNameCard,
    setPreferred,
    revealCard,
    revealAll,
    reset,
    setError,
    setPhase,
  } = useNamingStore();

  const handleSubmit = (context: string) => {
    console.log('🎯 [App] 用户点击了提交按钮');
    console.log('📝 [App] 用户输入:', context);
    
    // 获取选中的模型
    const selectedModel = getSelectedModel();
    console.log('🤖 [App] 使用模型:', selectedModel);
    
    // 重置状态
    reset();
    setPhase('analyzing');
    
    console.log('🚀 [App] 开始调用 streamGenerateNames...');

    // 发起流式请求
    streamGenerateNames(context, selectedModel, {
      onAnalysis: (text) => {
        setAnalysis(text);
      },
      onStrategy: (text) => {
        setStrategy(text);
      },
      onNameCard: (card) => {
        addNameCard(card);
      },
      onPreferred: (pref) => {
        setPreferred(pref);
        setPhase('revealing');
      },
      onComplete: () => {
        console.log('✅ 流式输出完成');
      },
      onError: (error) => {
        setError(error.message);
        console.error('❌ 错误:', error);
      },
    });
  };

  const handleRevealAll = () => {
    // 逐个揭示卡片，带延迟效果
    nameCards.forEach((_, index) => {
      setTimeout(() => {
        revealCard(index);
      }, index * 100);
    });
  };

  // 检测是否有未揭示的卡片
  const hasUnrevealedCards = nameCards.length > 0 && !allRevealed;

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary">
      {/* 头部 */}
      <div className="relative">
        {/* 标题 */}
        <motion.h1 
          className="text-5xl font-bold text-center py-12 bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          ✨ AI 起名工具
        </motion.h1>
        
        {/* 右上角按钮组 */}
        <div className="absolute top-6 right-6 flex gap-3">
          {/* 设置按钮 */}
          <motion.button
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg 
                       flex items-center gap-2 transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold">设置</span>
          </motion.button>

          {/* 审计按钮 */}
          <motion.button
            onClick={() => setIsAuditOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg 
                       flex items-center gap-2 transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-semibold">审计</span>
          </motion.button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 左侧：输入面板 */}
          <InputPanel 
            onSubmit={handleSubmit} 
            isLoading={phase !== 'idle' && phase !== 'done'}
          />

          {/* 右侧：输出面板 */}
          <div className="flex-1">
            <OutputPanel
              phase={phase}
              analysis={analysis}
              strategy={strategy}
              nameCards={nameCards}
              preferred={preferred}
              revealedCards={revealedCards}
              allRevealed={allRevealed}
              error={error}
              onRevealCard={revealCard}
              onRevealAll={handleRevealAll}
              onDismissError={() => setError(null)}
            />
          </div>
        </div>
      </div>
      
      {/* 设置面板 */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* 审计面板 */}
      <AuditPanel isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
    </div>
  );
}

export default App;

