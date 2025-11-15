import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

/**
 * Auth Callback Page
 * 处理 OAuth 和 Magic Link 的回调
 */
export function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // 从 URL 读取 session
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (data.session) {
        console.log('✅ [AuthCallback] 认证成功');
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        
        // TODO: 迁移匿名历史（Phase 6 实现）
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        throw new Error('No session found');
      }
    } catch (err) {
      console.error('❌ [AuthCallback] 认证失败:', err);
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Authentication failed');
      
      // 3秒后跳转到登录页
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 
                    flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {status === 'processing' && (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authenticating...
            </h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              className="text-6xl mb-4"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              ✅
            </motion.div>
            <h2 className="text-xl font-semibold text-green-600 mb-2">
              Success!
            </h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600
                         text-white font-medium rounded-lg
                         hover:from-pink-600 hover:to-purple-700
                         transition-all duration-200"
            >
              Back to Login
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

