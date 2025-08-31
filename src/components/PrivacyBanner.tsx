import { X } from "lucide-react";
import { motion } from "framer-motion";
import { TRANSLATIONS } from "../lib/constants";
import { useState, useEffect } from "react";

interface PrivacyBannerProps {
  language: 'no' | 'en';
}

export function PrivacyBanner({ language }: PrivacyBannerProps) {
  const t = TRANSLATIONS[language];
  
  // Vis alltid når chat åpnes eller ny samtale startes
  const [visible, setVisible] = useState(true);

  // Listen for chat reset events to show banner again
  useEffect(() => {
    const handleChatReset = () => {
      setVisible(true);
    };

    window.addEventListener('chat-reset', handleChatReset);
    return () => window.removeEventListener('chat-reset', handleChatReset);
  }, []);

  const dismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-sky-50 border-t border-sky-200 text-[10px] text-gray-600 px-3 py-2 flex items-start space-x-2"
    >
      <p className="flex-1" style={{ lineHeight: '1.4' }}>
        {t.privacyText.split(t.privacyLink)[0]}
        <a
          href="https://ambitious-pitch-929149.framer.app/personvernerkl%C3%A6ring"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-sky-600 hover:text-sky-800"
        >
          {t.privacyLink}
        </a>
        {t.privacyText.split(t.privacyLink)[1]}
      </p>

      {/* Lukk-ikon */}
      <button
        onClick={dismiss}
        aria-label={language === 'no' ? 'Lukk personvern-melding' : 'Close privacy notice'}
        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 flex-shrink-0"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}