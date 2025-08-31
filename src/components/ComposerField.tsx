import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, X, Mic, Square, MoreHorizontal, Camera } from 'lucide-react';

interface ComposerFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  onAttachment?: (file: File) => void;
  isLoading: boolean;
  isGenerating?: boolean;
  onStopGenerating?: () => void;
  language: 'no' | 'en';
  maxLength?: number;
}

export function ComposerField({
  value,
  onChange,
  onSubmit,
  onAttachment,
  isLoading,
  isGenerating = false,
  onStopGenerating,
  language,
  maxLength = 300
}: ComposerFieldProps) {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const t = {
    no: {
      typeMessage: 'Skriv din melding...',
      charactersLeft: 'tegn',
      messageTooLong: 'For lang melding',
      approachingLimit: 'Nærmer seg grensen',
      sendMessage: 'Send melding',
      attachFile: 'Legg ved fil',
      stopGenerating: 'Stopp generering',
      startListening: 'Start tale-gjenkjenning',
      stopListening: 'Stopp lytting'
    },
    en: {
      typeMessage: 'Type your message...',
      charactersLeft: 'characters',
      messageTooLong: 'Message too long',
      approachingLimit: 'Approaching limit',
      sendMessage: 'Send message',
      attachFile: 'Attach file',
      stopGenerating: 'Stop generating',
      startListening: 'Start speech recognition',
      stopListening: 'Stop listening'
    }
  }[language];


  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 144) + 'px'; // ~6 lines
    }
  }, [value]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter = new line (default behavior)
        return;
      } else if (e.metaKey || e.ctrlKey) {
        // Cmd/Ctrl+Enter = send
        e.preventDefault();
        handleSubmit();
      } else {
        // Regular Enter = send (prevent default to avoid new line)
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (!value.trim() || isLoading || value.length > maxLength) return;
    onSubmit(value);
    setAttachedFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });
    
    setAttachedFiles(prev => [...prev, ...validFiles]);
    if (onAttachment && validFiles.length > 0) {
      validFiles.forEach(file => onAttachment(file));
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowMenu(false);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMenuAction = (action: 'file' | 'camera') => {
    if (action === 'file') {
      fileInputRef.current?.click();
    } else if (action === 'camera') {
      // Camera functionality would be implemented here
      console.log('Camera action');
    }
    setShowMenu(false);
  };

  const getProgressColor = () => {
    if (value.length > maxLength) return 'bg-red-500';
    if (value.length > maxLength * 0.8) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const getProgressText = () => {
    if (value.length > maxLength) return t.messageTooLong;
    if (value.length > maxLength * 0.8) return t.approachingLimit;
    return '';
  };

  return (
    <div className="border-t border-gray-100 bg-white">
      {/* Character count and progress */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">
            {value.length}/{maxLength} {t.charactersLeft}
          </span>
          <span className={`text-xs ${
            value.length > maxLength ? 'text-red-500' : 
            value.length > maxLength * 0.8 ? 'text-orange-500' : 'text-gray-400'
          }`}>
            {getProgressText()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <motion.div 
            className={`h-1 rounded-full transition-all duration-200 ${getProgressColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((value.length / maxLength) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Attached files */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-2"
          >
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-gray-700 truncate max-w-32">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="px-4 pb-4">
        <div className="flex items-end space-x-2">
          {/* Textarea with integrated menu button */}
          <div className="flex-1 relative">
            <div className="relative flex items-stretch">
              {/* Menu button integrated as leading icon */}
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                disabled={isLoading}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Flere alternativer"
              >
                <MoreHorizontal size={16} />
              </button>

              {/* Popover menu */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[160px] z-50"
                  >
                    <button
                      onClick={() => handleMenuAction('file')}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Paperclip size={16} className="text-gray-500" />
                      <span>Last opp fil</span>
                    </button>
                    <button
                      onClick={() => handleMenuAction('camera')}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Camera size={16} className="text-gray-500" />
                      <span>Ta bilde</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.typeMessage}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 resize-none min-h-[52px] max-h-[144px] shadow-sm transition-all duration-200 hover:border-gray-400 focus:bg-white overflow-y-auto"
              disabled={isLoading}
              rows={1}
              style={{ lineHeight: '1.5' }}
            />
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Voice input button */}
          <button
            type="button"
            disabled={isLoading}
            className={`w-[52px] h-[52px] flex items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse shadow-md hover:bg-red-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 shadow-sm'
            }`}
            title={isListening ? t.stopListening : t.startListening}
          >
            <Mic size={18} />
          </button>

          {/* Send/Stop button */}
          {isGenerating ? (
            <motion.button
              type="button"
              onClick={onStopGenerating}
              className="w-[52px] h-[52px] flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 shadow-md"
              title={t.stopGenerating}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Square size={18} />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !value.trim() || value.length > maxLength}
              className="w-[52px] h-[52px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              title={t.sendMessage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send size={18} />
            </motion.button>
          )}
        </div>

      </div>
    </div>
  );
}