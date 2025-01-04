import { useState, useEffect, useRef } from 'react';

interface TypewriterOptions {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

export const useTypewriter = ({ 
  text, 
  speed = 50,
  onComplete 
}: TypewriterOptions) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    completedRef.current = false;
    
    const startTyping = async () => {
      if (!isMounted) return;
      
      // 重置状态
      setDisplayText('');
      setIsTyping(true);
      setIsComplete(false);

      if (!text) {
        setIsTyping(false);
        return;
      }

      // 等待前一个动画完全结束
      await new Promise(resolve => setTimeout(resolve, 50));

      // 逐字显示文本
      for (let i = 0; i <= text.length; i++) {
        if (!isMounted) break;
        
        await new Promise(resolve => setTimeout(resolve, speed));
        
        if (isMounted) {
          setDisplayText(text.substring(0, i));
          
          if (i === text.length && !completedRef.current) {
            completedRef.current = true;
            setIsTyping(false);
            setIsComplete(true);
          }
        }
      }
    };

    startTyping();

    return () => {
      isMounted = false;
    };
  }, [text, speed]);

  // 使用单独的 effect 处理完成回调
  useEffect(() => {
    if (isComplete && completedRef.current) {
      const timeoutId = setTimeout(() => {
        onComplete?.();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isComplete, onComplete]);

  return { displayText, isTyping };
}; 