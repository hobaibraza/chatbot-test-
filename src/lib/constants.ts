// Webhook configuration
export const WEBHOOK_URL =
  import.meta.env.VITE_WEBHOOK_URL ??
  "https://skyon.app.n8n.cloud/webhook/bf169e1d-8a6e-4ad6-9521-d89e7e60b4a4/chat";

// Chat configuration
export const CHAT_CONFIG = {
  maxMessages: 100,
  typingDelay: 1000,
  animationDuration: 0.3,
};

// Language configuration
export const LANGUAGES = {
  no: {
    code: 'no',
    name: 'Norsk',
    flag: '🇳🇴'
  },
  en: {
    code: 'en', 
    name: 'English',
    flag: '🇺🇸'
  }
};

// Translations
export const TRANSLATIONS = {
  no: {
    // UI Elements
    settings: 'Innstillinger',
    language: 'Språk',
    closeChat: 'Lukk chat',
    openChat: 'Åpne chat',
    startOver: 'Start på nytt',
    clearHistory: 'Slett chatloggen',
    downloadTranscript: 'Last ned samtale',
    sendMessage: 'Send melding',
    typeMessage: 'Skriv din melding...',
    charactersLeft: 'tegn',
    messageTooLong: 'For lang melding',
    approachingLimit: 'Nærmer seg grensen',
    poweredBy: 'Powered by',
    startListening: 'Start tale-gjenkjenning',
    stopListening: 'Stopp lytting',
    listening: 'Lytter...',
    microphoneError: 'Mikrofon-feil',
    
    // Welcome messages
    welcomeMessages: [
      "Hei og velkommen – Jeg er Skyon-boten",
      "Hva kan jeg hjelpe deg med i dag?",
      "Still spørsmålet ditt nedenfor eller klikk på en av knappene.",
      "Kan jeg ikke hjelpe deg, setter jeg deg i kontakt med et menneske 👷‍♂️"
    ],
    
    // Quick actions
    quickActions: [
      "Ofte stilte spørsmål",
      "Dine personopplysninger – GDPR"
    ],
    
    // Quick replies
    quickReplies: [
      "Renovering", 
      "Prisoverslag", 
      "Finn ledig tid", 
      "Kontakt menneske"
    ],
    
    // Privacy
    privacyText: "Ved å fortsette samtykker du til vår personvernerklæring. Meldingene dine sendes til OpenAI for behandling – unngå sensitive personopplysninger.",
    privacyLink: "personvernerklæring",
    
    // Error messages
    errorMessage: 'Beklager, det oppstod en feil. Prøv igjen senere.',
    processingError: 'Beklager, jeg kunne ikke behandle forespørselen din.'
  },
  
  en: {
    // UI Elements
    settings: 'Settings',
    language: 'Language',
    closeChat: 'Close chat',
    openChat: 'Open chat',
    startOver: 'Start over',
    clearHistory: 'Clear chat history',
    downloadTranscript: 'Download conversation',
    sendMessage: 'Send message',
    typeMessage: 'Type your message...',
    charactersLeft: 'characters',
    messageTooLong: 'Message too long',
    approachingLimit: 'Approaching limit',
    poweredBy: 'Powered by',
    startListening: 'Start speech recognition',
    stopListening: 'Stop listening',
    listening: 'Listening...',
    microphoneError: 'Microphone error',
    
    // Welcome messages
    welcomeMessages: [
      "Hello and welcome – I'm the Skyon bot",
      "How can I help you today?",
      "Ask your question below or click one of the buttons.",
      "If I can't help you, I'll connect you with a human 👷‍♂️"
    ],
    
    // Quick actions
    quickActions: [
      "Frequently asked questions",
      "Your personal data – GDPR"
    ],
    
    // Quick replies
    quickReplies: [
      "Renovation", 
      "Price estimate", 
      "Find available time", 
      "Contact human"
    ],
    
    // Privacy
    privacyText: "By continuing you agree to our privacy policy. Your messages are sent to OpenAI for processing – avoid sensitive personal information.",
    privacyLink: "privacy policy",
    
    // Error messages
    errorMessage: 'Sorry, an error occurred. Please try again later.',
    processingError: 'Sorry, I could not process your request.'
  }
};
// Quick action buttons