import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Settings, Download, RotateCcw, Trash2, Bot, Construction, Send, Mic, Globe, ArrowLeft, ArrowRight, ChevronDown, Square } from 'lucide-react';
import { PrivacyBanner } from './PrivacyBanner';
import { WelcomeSequence } from './WelcomeSequence';
import { PushBanner } from './PushBanner';
import { MessageBubble } from './MessageBubble';
import { ComposerField } from './ComposerField';
import { TypingIndicator } from './TypingIndicator';
import { SkeletonMessage } from './SkeletonMessage';
import { WEBHOOK_URL, LANGUAGES, TRANSLATIONS } from '../lib/constants';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'message' | 'pushGreeting';
  isDelivered?: boolean;
  isRead?: boolean;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preprocessing function for common queries
function preProcess(userInput: string): string {
  const lower = userInput.toLowerCase();
  if (lower.includes("åpningstider")) return "Hva er åpningstidene deres?";
  if (lower.match(/(?:faq|ofte stilte)/)) return "FAQ";
  if (lower.includes("kontakt") && lower.includes("menneske")) return "Jeg vil snakke med en person";
  return userInput;
}


function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'settings'>('chat');
  const [pushBanner, setPushBanner] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [language, setLanguage] = useState<'no' | 'en'>(() => {
    return (localStorage.getItem('skyon-language') as 'no' | 'en') || 'no';
  });
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(Math.random().toString(36).substring(7));
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Get current translations
  const t = TRANSLATIONS[language];
  const quickReplies = t.quickReplies;

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll detection with debouncing for performance
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      // Clear previous timeout
      clearTimeout(timeoutId);
      
      // Debounce scroll event (wait 100ms after last scroll)
      timeoutId = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        
        // Show button if user scrolled up more than 100px from bottom
        // and there's enough content to scroll
        const shouldShow = distanceFromBottom > 100 && scrollHeight > clientHeight;
        setShowScrollButton(shouldShow);
      }, 100);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [messages]);
  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'no' ? 'no-NO' : 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setInputValue(prev => prev + finalTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        setIsListening(false);
        const errorMessages = {
          'not-allowed': language === 'no' ? 'Mikrofon-tilgang nektet' : 'Microphone access denied',
          'no-speech': language === 'no' ? 'Ingen tale oppdaget' : 'No speech detected',
          'audio-capture': language === 'no' ? 'Mikrofon ikke tilgjengelig' : 'Microphone not available',
          'network': language === 'no' ? 'Nettverksfeil' : 'Network error'
        };
        setSpeechError(errorMessages[event.error as keyof typeof errorMessages] || 
          (language === 'no' ? 'Tale-gjenkjenning feilet' : 'Speech recognition failed'));
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  // Send first visit event when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      sendFirstVisitEvent();
    }
  }, [isOpen]);

  const sendFirstVisitEvent = async () => {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'firstVisit',
          sessionId: sessionId.current
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.type === 'pushGreeting' && data.output) {
          setPushBanner(data.output);
        }
      }
    } catch (error) {
      console.error('Error sending first visit event:', error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsSending(true);

    // Hide welcome sequence when first message is sent
    setShowWelcome(false);
    setShowQuickReplies(false);

    // Preprocess the message
    const processedMessage = preProcess(message);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Show typing indicator
    setShowTyping(true);
    
    // Brief delay to show sending state
    await new Promise(resolve => setTimeout(resolve, 200));
    try {
      console.log('Sending to webhook:', WEBHOOK_URL);
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId: sessionId.current,
          chatInput: processedMessage,
          language: language
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle push greeting
        if (data.type === 'pushGreeting' && data.pushMessage) {
          setPushBanner(data.pushMessage);
        }

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.output || t.processingError,
          isUser: false,
          timestamp: new Date(),
          isDelivered: true,
          isRead: true
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t.errorMessage,
        isUser: false,
        timestamp: new Date(),
        isDelivered: true,
        isRead: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsSending(false);
      setShowTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
    setShowQuickReplies(false);
  };

  const handleStopGenerating = () => {
    setIsGenerating(false);
    setShowTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleQuickActionFromBubble = (action: string) => {
    sendMessage(action);
  };

  const resetChat = async () => {
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset',
          sessionId: sessionId.current
        })
      });
    } catch (error) {
      console.error('Error resetting chat:', error);
    }
    
    setMessages([]);
    setShowWelcome(true);
    setPushBanner(null);
    setShowQuickReplies(false);
    setShowTyping(false);
    setIsGenerating(false);
    sessionId.current = Math.random().toString(36).substring(7);
    setCurrentView('chat');
    // Force privacy banner to show again when starting new conversation
    window.dispatchEvent(new Event('chat-reset'));
  };

  const clearHistory = () => {
    setMessages([]);
    setShowWelcome(true);
    setPushBanner(null);
    setShowQuickReplies(false);
    setShowTyping(false);
    setIsGenerating(false);
    setShowDeleteConfirm(false);
    setCurrentView('chat');
    // Force privacy banner to show again when clearing history
    window.dispatchEvent(new Event('chat-reset'));
  };

  const downloadTranscript = () => {
    const transcript = messages.map(msg => 
      `${msg.isUser ? 'Du' : 'Skyon AI'} (${msg.timestamp.toLocaleTimeString()}): ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skyon-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setCurrentView('chat');
  };

  const changeLanguage = (newLanguage: 'no' | 'en') => {
    setLanguage(newLanguage);
    localStorage.setItem('skyon-language', newLanguage);
    setCurrentView('chat');
    
    // Reset chat to apply new language
    setMessages([]);
    setShowWelcome(true);
    setPushBanner(null);
    setShowTyping(false);
    setIsGenerating(false);
    setShowQuickReplies(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl w-[340px] h-[590px] max-h-[85vh] flex flex-col border border-gray-200 max-w-[calc(100vw-24px)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-blue-800 text-white px-4 py-3 rounded-t-xl relative">
          <div className="flex items-center space-x-2">
            {currentView === 'settings' && (
              <button
                onClick={() => setCurrentView('chat')}
                className="p-1 hover:bg-blue-700 rounded transition-colors duration-200 mr-2"
                aria-label="Tilbake til chat"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            {currentView === 'chat' && (
              <div className="bg-blue-700 p-1 rounded-full">
                <Bot size={20} />
              </div>
            )}
            <span className="font-semibold">
              {currentView === 'settings' ? t.settings : 'Skyon AI'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {currentView === 'chat' && (
              <button
                onClick={() => setCurrentView('settings')}
                className="p-1 hover:bg-blue-700 rounded transition-colors duration-200"
                aria-label={t.settings}
              >
                <Settings size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-700 rounded transition-colors duration-200"
              aria-label={t.closeChat}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {currentView === 'settings' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 bg-gray-50 overflow-y-auto"
            >
              <div className="p-4 space-y-6">
                {/* Generelle innstillinger */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h3 className="text-lg font-bold text-gray-900">Generelle innstillinger</h3>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">Grunnleggende konfigurasjon for chatboten</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Språkvalg */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">Språk</label>
                      <div className="grid gap-3">
                        {Object.values(LANGUAGES).map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code as 'no' | 'en')}
                            className={`flex items-center justify-between w-full px-4 py-3 text-sm rounded-lg border transition-all duration-200 hover:shadow-sm ${
                              language === lang.code
                                ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{lang.flag}</span>
                              <span className="font-semibold">{lang.name}</span>
                            </div>
                            {language === lang.code && (
                              <div className="w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat-handlinger */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <h3 className="text-lg font-bold text-gray-900">Chat-handlinger</h3>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">Administrer samtalehistorikk og innstillinger</p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Start Over Button */}
                    <button
                      onClick={resetChat}
                      className="w-full flex items-center justify-between px-4 py-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg transition-all duration-200 group hover:shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                          <RotateCcw className="text-blue-600" size={16} />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{t.startOver}</div>
                          <div className="text-xs text-gray-500">Begynn en ny samtale</div>
                        </div>
                      </div>
                      <ArrowRight className="text-gray-400 group-hover:text-blue-600 transition-colors duration-200" size={16} />
                    </button>

                    {/* Clear History Button */}
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center justify-between px-4 py-4 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg transition-all duration-200 group hover:shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-200">
                          <Trash2 className="text-red-600" size={16} />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{t.clearHistory}</div>
                          <div className="text-xs text-red-600">⚠️ Permanent handling</div>
                        </div>
                      </div>
                      <ArrowRight className="text-gray-400 group-hover:text-red-600 transition-colors duration-200" size={16} />
                    </button>

                    {/* Download Transcript Button */}
                    <button
                      onClick={downloadTranscript}
                      className="w-full flex items-center justify-between px-4 py-4 bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 rounded-lg transition-all duration-200 group hover:shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
                          <Download className="text-green-600" size={16} />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{t.downloadTranscript}</div>
                          <div className="text-xs text-gray-500">Last ned som tekstfil</div>
                        </div>
                      </div>
                      <ArrowRight className="text-gray-400 group-hover:text-green-600 transition-colors duration-200" size={16} />
                    </button>
                  </div>
                </div>

                {/* Personvern og sikkerhet */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h3 className="text-lg font-bold text-gray-900">Personvern og sikkerhet</h3>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">Innstillinger for datahåndtering og personvern</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Settings className="text-green-600" size={16} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">GDPR-kompatibel</div>
                          <div className="text-xs text-gray-600">Alle data behandles i henhold til GDPR</div>
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="text-sm text-gray-800 leading-relaxed">
                        <strong>Databehandling:</strong> Meldingene dine sendes til OpenAI for behandling. 
                        Unngå å dele sensitive personopplysninger som personnummer, bankkonto eller passord.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Om appen */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <h3 className="text-lg font-bold text-gray-900">Om appen</h3>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">Informasjon om Skyon AI Chat</p>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Bot className="text-purple-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 mb-1">Skyon AI Chat</div>
                      <div className="text-sm text-gray-600 mb-2">Versjon 1.0.0</div>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        Din intelligente assistent for alle spørsmål om bygg og konstruksjon. 
                        Utviklet av Skyon for å gi deg rask og nøyaktig hjelp.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        {currentView === 'chat' && (
          <>
            <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-3 space-y-3 relative"
          >
          {/* Push Banner */}
          {pushBanner && (
            <PushBanner 
              message={pushBanner}
              type="info"
              onDismiss={() => setPushBanner(null)}
            />
          )}

          {/* Welcome Sequence */}
          {showWelcome && messages.length === 0 && (
            <WelcomeSequence onQuickAction={handleQuickAction} language={language} />
          )}

          {/* Quick Reply Chips */}
          <AnimatePresence>
            {showQuickReplies && messages.length === 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <p className="text-xs text-gray-500 mb-2">
                  {language === 'no' ? 'Eller velg et tema:' : 'Or choose a topic:'}
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleQuickReply(reply)}
                      className="flex-shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-xs font-medium border border-blue-200 transition-all duration-200 hover:scale-105"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Messages */}
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onQuickAction={handleQuickActionFromBubble}
                language={language}
              />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {showTyping && (
            <TypingIndicator 
              isVisible={showTyping}
              onHide={() => setShowTyping(false)}
            />
          )}

          {/* Skeleton messages while loading */}
          {isLoading && !showTyping && (
            <SkeletonMessage lines={2} />
          )}

          <div ref={messagesEndRef} />
        </div>

          </>
        )}

        {/* Privacy Banner - placed above input */}
        {isOpen && currentView === 'chat' && <PrivacyBanner language={language} />}

        {/* Scroll to Bottom Button - Above Input */}
        {currentView === 'chat' && (
          <AnimatePresence>
            {showScrollButton && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex justify-center px-4 pb-2"
              >
                <motion.button
                  onClick={scrollToBottom}
                  className="w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl border border-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label={language === 'no' ? 'Scroll til bunnen' : 'Scroll to bottom'}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronDown 
                    size={16} 
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200" 
                  />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Footer with "Powered by Skyon" */}
        {currentView === 'chat' && (
          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
          <p className="text-[10px] text-center text-gray-400">
            {t.poweredBy}{' '}
            <a 
              href="https://www.skyonai.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Skyon
            </a>
          </p>
          </div>
        )}

        {/* Composer Field */}
        {currentView === 'chat' && (
          <ComposerField
            value={inputValue}
            onChange={setInputValue}
            onSubmit={sendMessage}
            isLoading={isLoading}
            isGenerating={isGenerating}
            onStopGenerating={handleStopGenerating}
            language={language}
            maxLength={300}
          />
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="text-red-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Slett chatloggen</h3>
                  <p className="text-sm text-gray-500">Denne handlingen kan ikke angres</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                Er du sikker på at du vil slette hele samtalehistorikken? 
                Alle meldinger vil bli permanent fjernet.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors duration-200"
                >
                  Avbryt
                </button>
                <button
                  onClick={clearHistory}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors duration-200"
                >
                  Slett alt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatInterface;