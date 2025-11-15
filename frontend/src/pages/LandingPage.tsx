import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

/**
 * Landing Page - Development version
 * 生产环境会由静态 landing_page/index.html 替代
 */
export function LandingPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'generate' | 'narrowdown'>('generate');
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const targetPath = activeTab === 'generate' ? '/app/generate' : '/app/narrow-down';
    const params = new URLSearchParams({ context: input.trim() });
    navigate(`${targetPath}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            uniquenames.net
          </div>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                {/* 已登录：显示用户菜单 */}
                <button
                  onClick={() => navigate('/app/records')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors
                             flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Records</span>
                </button>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {user.email || 'User'}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* 未登录：显示登录按钮 */}
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600
                             hover:from-pink-600 hover:to-purple-700
                             text-white rounded-lg font-medium transition-all duration-200"
                >
                  Login
                </button>
              </>
            )}
            
            <button
              onClick={() => navigate('/platform')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Platform
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-4">
            Discover THE unique{' '}
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              name
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 text-center mb-12">
            We make the journey to unique names simple, joyful, and deeply personal.
          </p>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-lg shadow-md p-1">
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'generate'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Generate
              </button>
              <button
                onClick={() => setActiveTab('narrowdown')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'narrowdown'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Narrow Down
              </button>
            </div>
          </div>

          {/* Input Form */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <form onSubmit={handleSubmit}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeTab === 'generate'
                    ? 'Tell us about your naming needs...'
                    : 'Share your name list and tell us what factors matter most in your decision...'
                }
                className="w-full h-40 p-4 border-2 border-gray-200 rounded-lg resize-none
                           focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100
                           transition-all text-lg"
              />
              
              <motion.button
                type="submit"
                disabled={!input.trim()}
                whileHover={{ scale: input.trim() ? 1.02 : 1 }}
                whileTap={{ scale: input.trim() ? 0.98 : 1 }}
                className="w-full mt-4 py-4 bg-gradient-to-r from-pink-500 to-purple-600
                           hover:from-pink-600 hover:to-purple-700
                           text-white text-lg font-semibold rounded-lg
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all shadow-lg"
              >
                {activeTab === 'generate' ? 'Generate Names' : 'Start Analysis'} →
              </motion.button>
            </form>

            {/* Tips */}
            <div className="mt-6 text-sm text-gray-600">
              <p className="font-medium mb-2">💡 Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                {activeTab === 'generate' ? (
                  <>
                    <li>Share your values, inspirations, or themes</li>
                    <li>Mention any preferences or constraints</li>
                    <li>The more context, the better the results</li>
                  </>
                ) : (
                  <>
                    <li>List all name candidates (one per line or comma-separated)</li>
                    <li>Share your thoughts, concerns, or preferences</li>
                    <li>Provide context about the naming decision</li>
                  </>
                )}
              </ul>
            </div>
          </motion.div>

          {/* Quick Links */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Or jump directly to:</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/app/generate')}
                className="px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg
                           text-gray-700 hover:text-gray-900 transition-all"
              >
                Generate Page
              </button>
              <button
                onClick={() => navigate('/app/narrow-down')}
                className="px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg
                           text-gray-700 hover:text-gray-900 transition-all"
              >
                Narrow Down Page
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer Note */}
      <div className="fixed bottom-4 right-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 text-sm">
        <p className="text-yellow-800">
          📝 <strong>Dev Mode:</strong> 生产环境会显示静态 Landing Page
        </p>
      </div>
    </div>
  );
}

