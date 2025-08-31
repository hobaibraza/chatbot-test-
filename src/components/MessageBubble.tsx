import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, User, Bot, MoreHorizontal, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    isDelivered?: boolean;
    isRead?: boolean;
  };
  onQuickAction?: (action: string) => void;
  language: 'no' | 'en';
}

const CodeBlock = ({ children, className, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (match) {
    return (
      <div className="relative group">
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          title="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <SyntaxHighlighter
          style={oneLight}
          language={language}
          PreTag="div"
          className="rounded-lg !mt-0 !mb-0"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  );
};

export function MessageBubble({ message, onQuickAction, language }: MessageBubbleProps) {
  const [showQuickActions, setShowQuickActions] = useState(false);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('nb-NO', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Oslo'
    }).format(date);
  };

  const quickActions = language === 'no' 
    ? ['Forklar mer', 'Gi eksempel', 'Fortsett']
    : ['Explain more', 'Give example', 'Continue'];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ 
        duration: message.isUser ? 0.4 : 0.3,
        type: "spring",
        stiffness: message.isUser ? 300 : 200,
        damping: message.isUser ? 20 : 15
      }}
      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div className={`flex items-end space-x-3 max-w-[680px] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1 ${
          message.isUser 
            ? 'bg-blue-600' 
            : 'bg-gray-100 border border-gray-200'
        }`}>
          {message.isUser ? (
            <User className="text-white" size={16} />
          ) : (
            <Bot className="text-gray-600" size={16} />
          )}
        </div>
        
        <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'}`}>
          {/* Message bubble */}
          <div
            className={`px-4 py-3 rounded-2xl max-w-full ${
              message.isUser
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
            }`}
            style={{ wordBreak: 'break-word' }}
          >
            {message.isUser ? (
              <p className="text-sm leading-relaxed" style={{ lineHeight: '1.6' }}>
                {message.text}
              </p>
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: CodeBlock,
                    p: ({ children }) => (
                      <p className="text-sm leading-relaxed mb-2 last:mb-0" style={{ lineHeight: '1.6' }}>
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 text-sm mb-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 text-sm mb-2">
                        {children}
                      </ol>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-lg font-semibold mb-2 text-gray-900">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-semibold mb-2 text-gray-900">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold mb-1 text-gray-900">
                        {children}
                      </h3>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-2">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Timestamp and status */}
          <div className={`flex items-center space-x-2 mt-1 px-1 ${
            message.isUser ? 'flex-row-reverse space-x-reverse' : ''
          }`}>
            <span className="text-xs text-gray-500">
              {formatTime(message.timestamp)}
            </span>
            
            {/* Delivery status for user messages */}
            {message.isUser && (
              <div className="flex space-x-1">
                {message.isDelivered && (
                  <div className={`w-3 h-3 rounded-full ${
                    message.isRead ? 'bg-blue-500' : 'bg-gray-400'
                  }`} title={message.isRead ? 'Lest' : 'Levert'}>
                    <Check size={8} className="text-white m-0.5" />
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
}