import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  isVisible: boolean;
  onHide?: () => void;
  autoHideDelay?: number;
}

export function TypingIndicator({ 
  isVisible, 
  onHide, 
  autoHideDelay = 5000 
}: TypingIndicatorProps) {
  const [shouldShow, setShouldShow] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
      
      // Auto-hide after delay if no activity
      const timer = setTimeout(() => {
        setShouldShow(false);
        onHide?.();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [isVisible, autoHideDelay, onHide]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-end space-x-3 mb-6"
        >
          {/* Bot Avatar */}
          <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
            <Bot className="text-gray-600" size={16} />
          </div>
          
          {/* Typing bubble */}
          <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
            <div className="flex items-center space-x-1">
              {/* Animated dots */}
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{
                    y: [0, -4, 0],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
              
              {/* Typing text */}
              <motion.span
                className="ml-2 text-xs text-gray-500"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Skriver...
              </motion.span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}