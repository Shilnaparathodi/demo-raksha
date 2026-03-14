import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import VoiceButton from './VoiceButton';
import './AIChatbotRequestForm.css';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// The prompt instructions for the Gemini Model
const SYSTEM_INSTRUCTION = `You are Raksha AI, an empathetic emergency response bot for Kerala.
Your strict goal is to gather EXACTLY 5 pieces of information from the user:
1. type (e.g., medical, food, rescue, shelter)
2. location (specific city/district/town in Kerala)
3. people (number of people needing help)
4. urgency (number from 1 to 5, where 5 is critical/life-threatening)
5. name (the caller's name)

Instructions for conversation:
- Ask ONE short, very concise question at a time. Do not overwhelm the user.
- Start the conversation by asking how you can help or what their emergency is.
- Be highly empathetic. If they express a highly urgent situation, adapt your tone to match the seriousness.
- Never repeat a question you've already asked. Keep track of what you know.
- Never list the requirements out like a form. Keep it conversational.
- If you don't have something, ask clearly for it. Avoid confirming unless necessary. 

CRITICAL - JSON OUTPUT:
- Once you have confidently collected ALL 5 pieces of information from the user during the chat, you MUST append a raw JSON block at the very end of your final response.
- Format it STRICTLY like this:
JSON_PAYLOAD: {"type": "medical", "location": "Kochi", "people": 3, "urgency": 5, "name": "Rahul", "description": "summarize the emergency here"}
- ONLY output JSON_PAYLOAD when all 5 fields are completely satisfied.`;

const AIChatbotRequestForm = ({ onSubmit }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState('greeting'); // 'greeting', 'active', 'completed'
  const [apiKeyMissing, setApiKeyMissing] = useState(!API_KEY);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatSessionRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial welcome and setup Gemini Chat Session
  useEffect(() => {
    resetChat();
  }, []);

  const resetChat = () => {
    if (apiKeyMissing) {
      setMessages([{
        id: 1,
        sender: 'bot',
        text: '⚠️ ERROR: Gemini API key is missing. Please add REACT_APP_GEMINI_API_KEY to your frontend/.env file and restart the system.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setConversationState('completed');
      return;
    }

    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: '🌟 Hello! I\'m Raksha AI, your disaster assistant. How can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setConversationState('active');

    if (genAI) {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
      });
      chatSessionRef.current = model.startChat({
        history: [],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 250,
        },
      });
    }
  };

  const addMessage = (sender, text) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || apiKeyMissing || conversationState === 'completed' || isTyping) return;

    const userMessage = inputValue;
    addMessage('user', userMessage);
    setInputValue('');
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessage(userMessage);
      const responseText = result.response.text();
      
      // Check if JSON payload is returned signifying the end
      if (responseText.includes('JSON_PAYLOAD:')) {
        const parts = responseText.split('JSON_PAYLOAD:');
        const conversationalText = parts[0].trim();
        const jsonText = parts[1].trim();
        
        if (conversationalText) {
          addMessage('bot', conversationalText);
        }

        try {
          const finalData = JSON.parse(jsonText);
          
          // Submit the data instantly
          const finalRequest = {
            type: finalData.type || 'unknown',
            description: finalData.description || 'Emergency reported via Raksha AI',
            location: finalData.location || 'Unknown',
            district: finalData.location || '',
            lat: 10.5, // Center default
            lng: 76.5,
            urgency: finalData.urgency || 3,
            people: finalData.people || 1,
            name: finalData.name || 'Anonymous'
          };
          onSubmit(finalRequest);

          // Give a final response based on urgency
          setTimeout(() => {
             const urgencyResponse = finalData.urgency >= 4 
               ? `🚨 CRITICAL ALERT: Thank you ${finalData.name}. Emergency services have been immediately dispatched to ${finalData.location}.` 
               : `✅ Thank you ${finalData.name}. Your request for ${finalData.people} people in ${finalData.location} is submitted securely. Help will be there soon.`;
             addMessage('bot', urgencyResponse);
             setConversationState('completed');
             
             // Reset after delay
             setTimeout(() => {
               setConversationState('active');
               resetChat();
             }, 8000);
          }, 1000);

        } catch (e) {
             console.error('Failed to parse JSON payload', e);
             addMessage('bot', '⚠️ Received the info, but encountered a system error dispatching it. Please try the manual form above.');
             setConversationState('completed');
        }

      } else {
         // Normal conversational response from Gemini
         addMessage('bot', responseText);
      }
    } catch (err) {
      console.error('Gemini API Error:', err);
      addMessage('bot', `⚠️ AI Connection Error: ${err.message || 'Please check your API key validity or network connection.'}`);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceTranscript = (text) => {
    setInputValue(text);
    // Voice auto-submit happens here 
    setTimeout(() => {
      document.querySelector('.send-btn')?.click();
    }, 500);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-header-info">
          <span className="chatbot-avatar">🧠</span>
          <div>
            <h3>Raksha AI Assistant</h3>
            <p className="chatbot-status">
              <span className={`status-dot ${apiKeyMissing ? 'offline' : 'online'}`}></span> 
              {apiKeyMissing ? 'API Key Missing' : 'Powered by Google Gemini'}
            </p>
          </div>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message-wrapper ${message.sender}`}>
            <div className="message-avatar">
              {message.sender === 'bot' ? '🧠' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-bubble">{message.text}</div>
              <div className="message-timestamp">{message.timestamp}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message-wrapper bot">
            <div className="message-avatar">🧠</div>
            <div className="typing-indicator"><span></span><span></span><span></span></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={apiKeyMissing ? "Cannot type without API key..." : "Type your message..."}
          disabled={conversationState === 'completed' || apiKeyMissing || isTyping}
        />
        <button 
          className="send-btn" 
          onClick={handleSendMessage} 
          disabled={!inputValue.trim() || conversationState === 'completed' || apiKeyMissing || isTyping}
        >
          Send
        </button>
      </div>

      <VoiceButton onTranscript={handleVoiceTranscript} />

      {conversationState === 'completed' && !apiKeyMissing && (
        <div className="chatbot-success">✓ Request Processed</div>
      )}
    </div>
  );
};

export default AIChatbotRequestForm;
