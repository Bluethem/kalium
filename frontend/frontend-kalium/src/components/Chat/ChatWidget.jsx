import React, { useState, useRef, useEffect } from 'react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: '¡Hola! Soy tu asistente de Kalium. ¿En qué puedo ayudarte hoy?', 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [typingDots, setTypingDots] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Animación de puntos "..." mientras el bot está escribiendo
  useEffect(() => {
    const hasTyping = messages.some(m => m.isTyping);
    if (!hasTyping) {
      setTypingDots(0);
      return;
    }
    const id = setInterval(() => {
      setTypingDots((d) => (d + 1) % 4);
    }, 400);
    return () => clearInterval(id);
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Agregar mensaje del usuario
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Mostrar mensaje de "escribiendo..."
    const typingMessage = {
      id: messages.length + 2,
      text: 'Escribiendo...',
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true
    };
    
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Llamar al backend para obtener la respuesta de Gemini
      const pageContext = `URL: ${window.location.href}\nPath: ${window.location.pathname}\nTitle: ${document.title}`;
      const response = await fetch('http://localhost:8080/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputMessage, context: pageContext })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data?.response ?? 'Sin respuesta del asistente.';
      
      // Reemplazar el mensaje de "escribiendo..." con la respuesta real
      setMessages(prev => {
        const newMessages = [...prev];
        const typingIndex = newMessages.findIndex(msg => msg.isTyping);
        if (typingIndex !== -1) {
          newMessages[typingIndex] = {
            id: newMessages[typingIndex].id,
            text: responseText,
            sender: 'bot',
            timestamp: new Date()
          };
        }
        return newMessages;
      });
    } catch (error) {
      console.error('Error al obtener respuesta del asistente:', error);
      
      // Reemplazar el mensaje de "escribiendo..." con un mensaje de error
      setMessages(prev => {
        const newMessages = [...prev];
        const typingIndex = newMessages.findIndex(msg => msg.isTyping);
        if (typingIndex !== -1) {
          newMessages[typingIndex] = {
            id: newMessages[typingIndex].id,
            text: 'Lo siento, hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.',
            sender: 'bot',
            timestamp: new Date()
          };
        }
        return newMessages;
      });
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Renderiza todos los mensajes; el de "escribiendo" muestra puntos animados

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen ? (
        <div className="w-80 h-[500px] bg-white dark:bg-gray-800 rounded-t-lg shadow-xl flex flex-col border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div 
            className="bg-[#2cab5b] text-white px-4 py-3 rounded-t-lg flex justify-between items-center cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
              <span className="font-semibold">Asistente de Kalium</span>
            </div>
            <button className="text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === 'user' 
                      ? 'bg-[#2cab5b] text-white rounded-br-none' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.isTyping ? `Escribiendo${'.'.repeat(typingDots)}` : message.text}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#2cab5b] bg-white dark:bg-gray-700 dark:text-white"
              />
              <button 
                type="submit"
                className="bg-[#2cab5b] text-white px-4 py-2 rounded-r-lg hover:bg-opacity-90 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#2cab5b] text-white rounded-full p-4 shadow-lg hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105 focus:outline-none"
          aria-label="Abrir chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
