import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNamingStore } from '../store/useNamingStore';
import { streamGenerateNames } from '../services/streamingAPI';
import { InputPanel } from '../components/InputPanel';
import { OutputPanel } from '../components/OutputPanel';
import { SettingsPanel, getSelectedModel } from '../components/SettingsPanel';

/**
 * 前台主页 - 用户生成名字
 */
export function HomePage() {
  const navigate = useNavigate();
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
    reset,
    setError,
    setPhase,
  } = useNamingStore();

  const handleSubmit = (context: string) => {
    console.log('🎯 [HomePage] 用户点击了提交按钮');
    console.log('📝 [HomePage] 用户输入:', context);
    
    const selectedModel = getSelectedModel();
    console.log('🤖 [HomePage] 使用模型:', selectedModel);
    
    reset();
    setPhase('analyzing');
    
    console.log('🚀 [HomePage] 开始调用 streamGenerateNames...');

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
    nameCards.forEach((_, index) => {
      setTimeout(() => {
        revealCard(index);
      }, index * 100);
    });
  };

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

          {/* 管理后台按钮 */}
          <motion.button
            onClick={() => navigate('/platform')}
            className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded-lg 
                       flex items-center gap-2 transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="font-semibold">管理后台</span>
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
    </div>
  );
}
