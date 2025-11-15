import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterNameProps {
  name: string;
  speed?: number; // 每个字母的延迟（毫秒）
  onComplete?: () => void;
}

/**
 * 铅笔打字效果组件
 * 名字从铅笔笔尖逐字写出
 */
export function TypewriterName({ name, speed = 80, onComplete }: TypewriterNameProps) {
  const [typedLength, setTypedLength] = useState(0);
  const [showPencil, setShowPencil] = useState(true);

  // 打字效果
  useEffect(() => {
    if (typedLength < name.length) {
      const timer = setTimeout(() => {
        setTypedLength((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (typedLength === name.length) {
      // 写完后等待300ms，然后隐藏铅笔
      const timer = setTimeout(() => {
        setShowPencil(false);
        onComplete?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [typedLength, name.length, speed, onComplete]);

  const displayedText = name.substring(0, typedLength);

  return (
    <div className="flex items-center">
      {/* 已显示的文字 */}
      <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 
                     bg-clip-text text-transparent">
        {displayedText}
      </h3>
      
      {/* 铅笔图标 */}
      {showPencil && (
        <motion.span
          className="text-2xl ml-1 inline-block"
          animate={{
            x: [0, 3, 0],
            rotate: [0, -8, 8, 0],
          }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ✏️
        </motion.span>
      )}
      
      {/* 光标闪烁效果（可选） */}
      {typedLength < name.length && (
        <motion.span
          className="inline-block w-0.5 h-8 bg-pink-500 ml-1"
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
          }}
        />
      )}
    </div>
  );
}


