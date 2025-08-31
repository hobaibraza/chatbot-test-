import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';

interface PushBannerProps {
  message: string;
  type?: 'info' | 'warning' | 'success';
  onDismiss: () => void;
}

export function PushBanner({ message, type = 'info', onDismiss }: PushBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const bgColor = {
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-orange-50 border-orange-200',
    success: 'bg-green-50 border-green-200'
  }[type];

  const textColor = {
    info: 'text-blue-800',
    warning: 'text-orange-800', 
    success: 'text-green-800'
  }[type];

  const iconColor = {
    info: 'text-blue-600',
    warning: 'text-orange-600',
    success: 'text-green-600'
  }[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`border-l-4 ${bgColor} p-3 mb-3 rounded-r-lg`}
        >
          <div className="flex items-start space-x-2">
            <Info className={`${iconColor} mt-0.5`} size={16} />
            <div className="flex-1">
              <p className={`text-sm ${textColor}`}>{message}</p>
            </div>
            <button
              onClick={handleDismiss}
              className={`${iconColor} hover:opacity-70 transition-opacity duration-200`}
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}