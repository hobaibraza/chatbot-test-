import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

interface SkeletonMessageProps {
  lines?: number;
}

export function SkeletonMessage({ lines = 3 }: SkeletonMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start space-x-3 mb-6"
    >
      {/* Bot Avatar */}
      <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
        <Bot className="text-gray-600" size={16} />
      </div>
      
      {/* Skeleton content */}
      <div className="flex-1 max-w-[680px]">
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, index) => (
              <motion.div
                key={index}
                className="h-4 bg-gray-200 rounded animate-pulse"
                style={{
                  width: index === lines - 1 ? '60%' : '100%'
                }}
                animate={{
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.1
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Skeleton timestamp */}
        <motion.div
          className="h-3 w-12 bg-gray-200 rounded mt-1 ml-1 animate-pulse"
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
      </div>
    </motion.div>
  );
}