import React from 'react';
import { motion } from 'framer-motion';
import { TRANSLATIONS } from '../lib/constants';

interface WelcomeSequenceProps {
  onQuickAction: (action: string) => void;
  language: 'no' | 'en';
}

export function WelcomeSequence({ onQuickAction, language }: WelcomeSequenceProps) {
  const t = TRANSLATIONS[language];
  
  return (
    <section className="space-y-3 pb-6">
      {t.welcomeMessages.map((txt, i) => (
        <motion.div
          key={i}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.2, duration: 0.3 }}
          className="rounded-lg bg-gray-50 px-4 py-4 text-sm text-gray-800"
          style={{ lineHeight: '1.5' }}
        >
          {txt}
        </motion.div>
      ))}

      {/* Hurtigvalg-knapper */}
      <motion.div 
        className="grid gap-3 pt-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        {t.quickActions.map((label) => (
          <button
            key={label}
            onClick={() => onQuickAction(label)}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-[1.02]"
          >
            {label}
          </button>
        ))}
      </motion.div>
    </section>
  );
}