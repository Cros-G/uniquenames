import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'generation' | 'narrow_down';
}

/**
 * 登录提示弹窗
 * 当匿名用户超过使用限制时显示
 * 遵循 design_system.md: 温暖友好的引导
 */
export function LoginPrompt({ isOpen, onClose, type }: LoginPromptProps) {
  const navigate = useNavigate();

  const typeLabels = {
    generation: 'name generation',
    narrow_down: 'name analysis',
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <motion.div
                className="text-6xl text-center mb-4"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 0.6 }}
              >
                🎉
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center mb-3
                             bg-gradient-to-r from-pink-500 to-purple-600 
                             bg-clip-text text-transparent">
                You've tried our {typeLabels[type]}!
              </h2>

              {/* Message */}
              <p className="text-center text-gray-700 mb-6 leading-relaxed">
                You've reached the free trial limit. Sign in to unlock unlimited access and save your history!
              </p>

              {/* Benefits */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  ✨ Sign in to unlock:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-pink-500">✓</span>
                    <span>Unlimited name generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Unlimited analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Activity history tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Cross-device sync</span>
                  </li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <motion.button
                  onClick={handleLogin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-600
                             hover:from-pink-600 hover:to-purple-700 hover:shadow-lg
                             text-white font-medium rounded-lg
                             transition-all duration-200"
                >
                  Sign In Now
                </motion.button>

                <button
                  onClick={onClose}
                  className="w-full py-3 px-6 bg-white border border-gray-300 rounded-lg
                             hover:bg-gray-50
                             text-gray-700 font-medium
                             transition-all duration-200"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

