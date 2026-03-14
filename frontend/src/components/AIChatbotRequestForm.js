import React, { useState, useRef, useEffect } from 'react';
import nlp from 'compromise';
import './AIChatbotRequestForm.css';

// Extend compromise with number plugin
import compromiseNumbers from 'compromise-numbers';
nlp.extend(compromiseNumbers);

const AIChatbotRequestForm = ({ onSubmit }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState('greeting');
  const [extractedData, setExtractedData] = useState({
    type: null,
    location: null,
    people: null,
    urgency: 3,
    name: null,
    description: null
  });
  const [context, setContext] = useState({
    lastIntent: null,
    needsClarification: [],
    conversationHistory: []
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Comprehensive Kerala Location Database
  const keralaLocations = {
    // Thiruvananthapuram District
    'thiruvananthapuram': { 
      name: 'Thiruvananthapuram', 
      district: 'Thiruvananthapuram',
      aliases: ['trivandrum', 'tvm', 't\'puram', 'ananthapuri'],
      lat: 8.5241, lng: 76.9366,
      nearby: ['kollam', 'neyyattinkara', 'attingal']
    },
    'neyyattinkara': { name: 'Neyyattinkara', district: 'Thiruvananthapuram', aliases: [], lat: 8.3983, lng: 77.0815 },
    'attingal': { name: 'Attingal', district: 'Thiruvananthapuram', aliases: [], lat: 8.6969, lng: 76.8252 },
    'varkala': { name: 'Varkala', district: 'Thiruvananthapuram', aliases: ['varkala'], lat: 8.7379, lng: 76.7173 },
    
    // Kollam District
    'kollam': { 
      name: 'Kollam', 
      district: 'Kollam',
      aliases: ['quilon', 'kollam'],
      lat: 8.8932, lng: 76.6141,
      nearby: ['thiruvananthapuram', 'pathanamthitta', 'alappuzha']
    },
    'karunagappally': { name: 'Karunagappally', district: 'Kollam', aliases: [], lat: 9.0069, lng: 76.5366 },
    'kottarakkara': { name: 'Kottarakkara', district: 'Kollam', aliases: [], lat: 8.9889, lng: 76.7658 },
    'punalur': { name: 'Punalur', district: 'Kollam', aliases: [], lat: 9.0197, lng: 76.9256 },
    
    // Pathanamthitta District
    'pathanamthitta': { 
      name: 'Pathanamthitta', 
      district: 'Pathanamthitta',
      aliases: ['pathanamthitta', 'pathanamthitta'],
      lat: 9.2648, lng: 76.7870,
      nearby: ['kollam', 'alappuzha', 'kottayam', 'idukki']
    },
    'adoor': { name: 'Adoor', district: 'Pathanamthitta', aliases: [], lat: 9.1569, lng: 76.7319 },
    'thiruvalla': { name: 'Thiruvalla', district: 'Pathanamthitta', aliases: ['thiruvalla'], lat: 9.3833, lng: 76.5667 },
    'kozhencherry': { name: 'Kozhencherry', district: 'Pathanamthitta', aliases: [], lat: 9.3349, lng: 76.7105 },
    'mallappally': { name: 'Mallappally', district: 'Pathanamthitta', aliases: [], lat: 9.4464, lng: 76.6567 },
    'ranni': { name: 'Ranni', district: 'Pathanamthitta', aliases: [], lat: 9.3645, lng: 76.8219 },
    
    // Alappuzha District
    'alappuzha': { 
      name: 'Alappuzha', 
      district: 'Alappuzha',
      aliases: ['alleppey', 'alappey', 'alappuzha'],
      lat: 9.4981, lng: 76.3388,
      nearby: ['kottayam', 'pathanamthitta', 'kollam']
    },
    'cherthala': { name: 'Cherthala', district: 'Alappuzha', aliases: [], lat: 9.6854, lng: 76.3355 },
    'kayamkulam': { name: 'Kayamkulam', district: 'Alappuzha', aliases: [], lat: 9.1722, lng: 76.5092 },
    'chengannur': { name: 'Chengannur', district: 'Alappuzha', aliases: [], lat: 9.3231, lng: 76.6151 },
    'mavelikkara': { name: 'Mavelikkara', district: 'Alappuzha', aliases: [], lat: 9.2564, lng: 76.5431 },
    'haripad': { name: 'Haripad', district: 'Alappuzha', aliases: [], lat: 9.2889, lng: 76.4583 },
    'ambalappuzha': { name: 'Ambalappuzha', district: 'Alappuzha', aliases: [], lat: 9.3833, lng: 76.3667 },
    
    // Kottayam District
    'kottayam': { 
      name: 'Kottayam', 
      district: 'Kottayam',
      aliases: ['kottayam', 'ktm'],
      lat: 9.5916, lng: 76.5222,
      nearby: ['alappuzha', 'pathanamthitta', 'idukki', 'ernakulam']
    },
    'changanassery': { name: 'Changanassery', district: 'Kottayam', aliases: [], lat: 9.4426, lng: 76.5436 },
    'palai': { name: 'Palai', district: 'Kottayam', aliases: ['pala'], lat: 9.7123, lng: 76.6860 },
    'vaikom': { name: 'Vaikom', district: 'Kottayam', aliases: [], lat: 9.7486, lng: 76.3964 },
    'erattupetta': { name: 'Erattupetta', district: 'Kottayam', aliases: [], lat: 9.6889, lng: 76.7778 },
    'kanjirappally': { name: 'Kanjirappally', district: 'Kottayam', aliases: [], lat: 9.5639, lng: 76.8056 },
    'ponkunnam': { name: 'Ponkunnam', district: 'Kottayam', aliases: [], lat: 9.5556, lng: 76.7778 },
    
    // Idukki District
    'idukki': { 
      name: 'Idukki', 
      district: 'Idukki',
      aliases: ['idukki'],
      lat: 9.8499, lng: 76.9666,
      nearby: ['kottayam', 'ernakulam', 'pathanamthitta']
    },
    'munnar': { name: 'Munnar', district: 'Idukki', aliases: [], lat: 10.0889, lng: 77.0595 },
    'thodupuzha': { name: 'Thodupuzha', district: 'Idukki', aliases: [], lat: 9.8976, lng: 76.7157 },
    'adimali': { name: 'Adimali', district: 'Idukki', aliases: [], lat: 10.0139, lng: 76.9556 },
    'kattappana': { name: 'Kattappana', district: 'Idukki', aliases: [], lat: 9.7556, lng: 77.1156 },
    'nedumkandam': { name: 'Nedumkandam', district: 'Idukki', aliases: [], lat: 9.8361, lng: 77.1656 },
    
    // Ernakulam District
    'ernakulam': { 
      name: 'Ernakulam', 
      district: 'Ernakulam',
      aliases: ['kochi', 'cochin', 'ekm', 'ernakulam'],
      lat: 9.9816, lng: 76.2999,
      nearby: ['thrissur', 'kottayam', 'idukki', 'alappuzha']
    },
    'kochi': { name: 'Kochi', district: 'Ernakulam', aliases: ['cochin'], lat: 9.9312, lng: 76.2673 },
    'aluva': { name: 'Aluva', district: 'Ernakulam', aliases: ['alwaye'], lat: 10.1075, lng: 76.3514 },
    'perumbavoor': { name: 'Perumbavoor', district: 'Ernakulam', aliases: [], lat: 10.1069, lng: 76.4761 },
    'angamaly': { name: 'Angamaly', district: 'Ernakulam', aliases: [], lat: 10.1956, lng: 76.3878 },
    'kothamangalam': { name: 'Kothamangalam', district: 'Ernakulam', aliases: [], lat: 10.0625, lng: 76.6269 },
    'muvattupuzha': { name: 'Muvattupuzha', district: 'Ernakulam', aliases: [], lat: 9.9792, lng: 76.5736 },
    'thripunithura': { name: 'Thripunithura', district: 'Ernakulam', aliases: [], lat: 9.9525, lng: 76.3500 },
    'kalamassery': { name: 'Kalamassery', district: 'Ernakulam', aliases: [], lat: 10.0589, lng: 76.3083 },
    'edappally': { name: 'Edappally', district: 'Ernakulam', aliases: [], lat: 10.0269, lng: 76.3083 },
    'kakkanad': { name: 'Kakkanad', district: 'Ernakulam', aliases: [], lat: 10.0169, lng: 76.3433 },
    'fort kochi': { name: 'Fort Kochi', district: 'Ernakulam', aliases: [], lat: 9.9658, lng: 76.2422 },
    'mattancherry': { name: 'Mattancherry', district: 'Ernakulam', aliases: [], lat: 9.9583, lng: 76.2583 },
    
    // Thrissur District
    'thrissur': { 
      name: 'Thrissur', 
      district: 'Thrissur',
      aliases: ['trichur', 'thrissur', 'tcr'],
      lat: 10.5276, lng: 76.2144,
      nearby: ['ernakulam', 'palakkad', 'malappuram']
    },
    'chalakkudy': { name: 'Chalakkudy', district: 'Thrissur', aliases: ['chalakkudy'], lat: 10.3056, lng: 76.3278 },
    'kodungallur': { name: 'Kodungallur', district: 'Thrissur', aliases: [], lat: 10.2208, lng: 76.2153 },
    'iriyani': { name: 'Iriyani', district: 'Thrissur', aliases: [], lat: 10.4750, lng: 76.2208 },
    'kunnamkulam': { name: 'Kunnamkulam', district: 'Thrissur', aliases: [], lat: 10.6472, lng: 76.0778 },
    'guruvayur': { name: 'Guruvayur', district: 'Thrissur', aliases: ['guruvayoor'], lat: 10.5944, lng: 76.0403 },
    'wadakkancherry': { name: 'Wadakkancherry', district: 'Thrissur', aliases: [], lat: 10.6667, lng: 76.2500 },
    'thalappilly': { name: 'Thalappilly', district: 'Thrissur', aliases: [], lat: 10.7333, lng: 76.1167 },
    
    // Palakkad District
    'palakkad': { 
      name: 'Palakkad', 
      district: 'Palakkad',
      aliases: ['palghat', 'palakkad', 'pg'],
      lat: 10.7867, lng: 76.6548,
      nearby: ['thrissur', 'malappuram', 'coimbatore']
    },
    'mannarkkad': { name: 'Mannarkkad', district: 'Palakkad', aliases: [], lat: 10.9917, lng: 76.4583 },
    'ottapalam': { name: 'Ottapalam', district: 'Palakkad', aliases: [], lat: 10.7736, lng: 76.3764 },
    'shoranur': { name: 'Shoranur', district: 'Palakkad', aliases: [], lat: 10.7639, lng: 76.2694 },
    'chittur': { name: 'Chittur', district: 'Palakkad', aliases: [], lat: 10.6917, lng: 76.7333 },
    'alathur': { name: 'Alathur', district: 'Palakkad', aliases: [], lat: 10.6444, lng: 76.5333 },
    'kollengode': { name: 'Kollengode', district: 'Palakkad', aliases: [], lat: 10.6139, lng: 76.6917 },
    'nemmara': { name: 'Nemmara', district: 'Palakkad', aliases: [], lat: 10.5944, lng: 76.5917 },
    
    // Malappuram District
    'malappuram': { 
      name: 'Malappuram', 
      district: 'Malappuram',
      aliases: ['malappuram', 'mlp'],
      lat: 11.0732, lng: 76.0761,
      nearby: ['kozhikode', 'palakkad', 'thrissur', 'wayanad']
    },
    'manjeri': { name: 'Manjeri', district: 'Malappuram', aliases: [], lat: 11.1194, lng: 76.1194 },
    'perinthalmanna': { name: 'Perinthalmanna', district: 'Malappuram', aliases: [], lat: 10.9764, lng: 76.2264 },
    'pookkottur': { name: 'Pookkottur', district: 'Malappuram', aliases: [], lat: 11.0833, lng: 76.0333 },
    'tirur': { name: 'Tirur', district: 'Malappuram', aliases: [], lat: 10.9167, lng: 75.9167 },
    'pomani': { name: 'Pomani', district: 'Malappuram', aliases: [], lat: 10.7667, lng: 75.9167 },
    'kottakkal': { name: 'Kottakkal', district: 'Malappuram', aliases: [], lat: 10.9944, lng: 76.1250 },
    'kondotty': { name: 'Kondotty', district: 'Malappuram', aliases: [], lat: 11.1458, lng: 75.9583 },
    'valanchery': { name: 'Valanchery', district: 'Malappuram', aliases: [], lat: 10.8833, lng: 76.0667 },
    
    // Kozhikode District
    'kozhikode': { 
      name: 'Kozhikode', 
      district: 'Kozhikode',
      aliases: ['calicut', 'kozhikode', 'clt'],
      lat: 11.2588, lng: 75.7804,
      nearby: ['malappuram', 'wayanad', 'kannur']
    },
    'vadakara': { name: 'Vadakara', district: 'Kozhikode', aliases: [], lat: 11.6083, lng: 75.5917 },
    'koyilandy': { name: 'Koyilandy', district: 'Kozhikode', aliases: [], lat: 11.4417, lng: 75.6917 },
    'mukkam': { name: 'Mukkam', district: 'Kozhikode', aliases: [], lat: 11.3194, lng: 75.9944 },
    'ramanattukara': { name: 'Ramanattukara', district: 'Kozhikode', aliases: [], lat: 11.2333, lng: 75.8500 },
    'feroke': { name: 'Feroke', district: 'Kozhikode', aliases: [], lat: 11.1833, lng: 75.8333 },
    'kallachi': { name: 'Kallachi', district: 'Kozhikode', aliases: [], lat: 11.5667, lng: 75.6333 },
    'perambra': { name: 'Perambra', district: 'Kozhikode', aliases: [], lat: 11.5583, lng: 75.7583 },
    
    // Wayanad District
    'wayanad': { 
      name: 'Wayanad', 
      district: 'Wayanad',
      aliases: ['wayanad', 'wynaad'],
      lat: 11.6854, lng: 76.1320,
      nearby: ['kozhikode', 'kannur', 'malappuram', 'mysore']
    },
    'kalpetta': { name: 'Kalpetta', district: 'Wayanad', aliases: [], lat: 11.6108, lng: 76.0792 },
    'sulthan bathery': { name: 'Sulthan Bathery', district: 'Wayanad', aliases: [], lat: 11.6653, lng: 76.2625 },
    'mananthavady': { name: 'Mananthavady', district: 'Wayanad', aliases: [], lat: 11.8042, lng: 76.0000 },
    'vythiri': { name: 'Vythiri', district: 'Wayanad', aliases: [], lat: 11.5500, lng: 76.0333 },
    'panamaram': { name: 'Panamaram', district: 'Wayanad', aliases: [], lat: 11.7333, lng: 76.0667 },
    
    // Kannur District
    'kannur': { 
      name: 'Kannur', 
      district: 'Kannur',
      aliases: ['cannanore', 'kannur'],
      lat: 11.8745, lng: 75.3704,
      nearby: ['kozhikode', 'wayanad', 'kasaragod']
    },
    'thallassery': { name: 'Thallassery', district: 'Kannur', aliases: ['tellicherry'], lat: 11.7500, lng: 75.4833 },
    'payyanur': { name: 'Payyanur', district: 'Kannur', aliases: [], lat: 12.1028, lng: 75.2028 },
    'kuthuparamba': { name: 'Kuthuparamba', district: 'Kannur', aliases: [], lat: 11.8333, lng: 75.5667 },
    'irikkur': { name: 'Irikkur', district: 'Kannur', aliases: [], lat: 11.9667, lng: 75.5333 },
    'pannur': { name: 'Pannur', district: 'Kannur', aliases: [], lat: 11.7500, lng: 75.6000 },
    'peravoor': { name: 'Peravoor', district: 'Kannur', aliases: [], lat: 11.8833, lng: 75.7333 },
    'payyannur': { name: 'Payyannur', district: 'Kannur', aliases: [], lat: 12.1000, lng: 75.2000 },
    'taliparamba': { name: 'Taliparamba', district: 'Kannur', aliases: [], lat: 12.0500, lng: 75.3500 },
    
    // Kasaragod District
    'kasaragod': { 
      name: 'Kasaragod', 
      district: 'Kasaragod',
      aliases: ['kasargod', 'kasaragod'],
      lat: 12.4996, lng: 74.9869,
      nearby: ['kannur', 'mangalore']
    },
    'kanhangad': { name: 'Kanhangad', district: 'Kasaragod', aliases: [], lat: 12.3500, lng: 75.0833 },
    'neriyamangalam': { name: 'Neriyamangalam', district: 'Kasaragod', aliases: [], lat: 12.5167, lng: 75.0167 },
    'hosdurg': { name: 'Hosdurg', district: 'Kasaragod', aliases: [], lat: 12.3000, lng: 75.0833 },
    'vellarikundu': { name: 'Vellarikundu', district: 'Kasaragod', aliases: [], lat: 12.3500, lng: 75.2833 },
    'manjeshwar': { name: 'Manjeshwar', district: 'Kasaragod', aliases: [], lat: 12.7167, lng: 74.8833 },
    'kumbla': { name: 'Kumbla', district: 'Kasaragod', aliases: [], lat: 12.6000, lng: 74.9333 }
  };

  // Knowledge base for disaster types
  const disasterTypes = {
    food: {
      keywords: ['food', 'eat', 'meal', 'hungry', 'rations', 'provisions', 'starving', 'hunger'],
      responses: ['food assistance', 'food supplies', 'meals']
    },
    medical: {
      keywords: ['medical', 'doctor', 'hospital', 'medicine', 'injured', 'sick', 'health', 'ambulance', 'wound', 'bleeding', 'heart', 'pain'],
      responses: ['medical help', 'healthcare assistance', 'medical attention']
    },
    rescue: {
      keywords: ['rescue', 'trapped', 'stuck', 'save', 'stranded', 'can\'t move', 'help out', 'caught'],
      responses: ['rescue operations', 'extraction', 'rescue team']
    },
    shelter: {
      keywords: ['shelter', 'house', 'home', 'roof', 'accommodation', 'place to stay', 'homeless', 'damaged'],
      responses: ['shelter assistance', 'temporary housing']
    },
    water: {
      keywords: ['water', 'drink', 'thirsty', 'thirst', 'dehydrated', 'drinking water'],
      responses: ['clean water', 'drinking water supplies']
    }
  };

  // Greeting responses
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      sender: 'bot',
      text: '🌟 Hello! I\'m Raksha AI, your intelligent disaster assistance bot. I can understand natural language and help you report emergencies even without internet. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMessage]);
  }, []);

  // Advanced intent detection using NLP
  const detectIntent = (text) => {
    const doc = nlp(text.toLowerCase());
    
    // Check for greetings
    if (greetings.some(g => text.toLowerCase().includes(g))) {
      return { intent: 'greeting', confidence: 0.9 };
    }

    // Check for thanks
    if (text.toLowerCase().includes('thank')) {
      return { intent: 'thanks', confidence: 0.9 };
    }

    // Check for help requests
    if (text.toLowerCase().includes('help') || text.toLowerCase().includes('need')) {
      return { intent: 'need_help', confidence: 0.8 };
    }

    return { intent: 'unknown', confidence: 0.3 };
  };

  // Extract information using compromise NLP
  const extractInfo = (text) => {
    const doc = nlp(text.toLowerCase());
    const info = {
      type: null,
      location: null,
      people: null,
      urgency: 3,
      description: text,
      emergencyKeywords: []
    };

    // Extract numbers (people count)
    const numbers = doc.numbers().get();
    if (numbers.length > 0) {
      // Look for numbers near people-related words
      const sentences = doc.sentences().json();
      for (let sentence of sentences) {
        if (sentence.text.includes('people') || sentence.text.includes('person') || 
            sentence.text.includes('family') || sentence.text.includes('us') ||
            sentence.text.includes('we')) {
          info.people = numbers[0];
          break;
        }
      }
    }

    // Advanced type detection with context
    for (let [type, data] of Object.entries(disasterTypes)) {
      for (let keyword of data.keywords) {
        if (doc.has(keyword)) {
          info.type = type;
          info.emergencyKeywords.push(keyword);
          break;
        }
      }
    }

    // Enhanced location detection
    let foundLocation = null;
    for (let [key, data] of Object.entries(keralaLocations)) {
      // Check exact match
      if (doc.has(key)) {
        foundLocation = {
          name: data.name,
          district: data.district,
          lat: data.lat,
          lng: data.lng
        };
        break;
      }
      // Check aliases
      for (let alias of data.aliases) {
        if (doc.has(alias)) {
          foundLocation = {
            name: data.name,
            district: data.district,
            lat: data.lat,
            lng: data.lng
          };
          break;
        }
      }
      if (foundLocation) break;
    }

    // Also check for district names
    if (!foundLocation) {
      for (let [key, data] of Object.entries(keralaLocations)) {
        if (data.district && doc.has(data.district.toLowerCase())) {
          foundLocation = {
            name: data.district,
            district: data.district,
            lat: data.lat,
            lng: data.lng
          };
          break;
        }
      }
    }

    if (foundLocation) {
      info.location = foundLocation.name;
      info.district = foundLocation.district;
      info.lat = foundLocation.lat;
      info.lng = foundLocation.lng;
    }

    // Advanced urgency detection
    const urgencyPhrases = {
      5: ['critical', 'dying', 'heart attack', 'bleeding heavily', 'unconscious', 'emergency'],
      4: ['serious', 'severe', 'urgent', 'immediate', 'bad', 'worst'],
      3: ['need', 'require', 'want'],
      2: ['minor', 'small', 'little'],
      1: ['question', 'inquiry', 'info']
    };

    for (let [level, phrases] of Object.entries(urgencyPhrases)) {
      for (let phrase of phrases) {
        if (doc.has(phrase)) {
          info.urgency = parseInt(level);
          break;
        }
      }
    }

    return info;
  };

  const validateLocation = (text) => {
    const lowerText = text.toLowerCase();
    
    // Check if it's a known location
    for (let [key, data] of Object.entries(keralaLocations)) {
      if (lowerText.includes(key) || data.aliases.some(a => lowerText.includes(a))) {
        return {
          valid: true,
          location: data.name,
          district: data.district,
          lat: data.lat,
          lng: data.lng,
          exact: true
        };
      }
    }
    
    // Check if it might be a misspelling (simple Levenshtein distance could be added)
    // For now, return suggestions
    return {
      valid: false,
      suggestions: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Alappuzha'].slice(0, 3)
    };
  };

  const addMessage = (sender, text) => {
    const newMessage = {
      id: messages.length + 1,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const botTyping = (callback) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    addMessage('user', userMessage);
    setInputValue('');

    // Detect intent
    const intent = detectIntent(userMessage);
    const extractedInfo = extractInfo(userMessage);

    botTyping(() => {
      // Handle different intents
      if (intent.intent === 'greeting') {
        addMessage('bot', 'Hello! I\'m here to help with emergencies. What kind of assistance do you need? (food, medical, rescue, shelter, or water)');
        setConversationState('awaiting_initial');
      }
      else if (intent.intent === 'thanks') {
        addMessage('bot', 'You\'re welcome! Stay safe. Is there anything else you need help with?');
        setConversationState('awaiting_initial');
      }
      else if (conversationState === 'awaiting_initial' || intent.intent === 'need_help') {
        // Update extracted data
        setExtractedData(prev => ({
          ...prev,
          ...extractedInfo
        }));

        // Check what's missing
        const missing = [];
        if (!extractedInfo.type) missing.push('type of help');
        if (!extractedInfo.location) missing.push('location');
        if (!extractedInfo.people) missing.push('number of people');

        if (missing.length === 0) {
          // All information present
          const urgencyWord = extractedInfo.urgency === 5 ? 'CRITICAL' :
                              extractedInfo.urgency === 4 ? 'URGENT' :
                              extractedInfo.urgency === 3 ? 'normal' : 'low';
          
          addMessage('bot', `I understand you need ${extractedInfo.type} help for ${extractedInfo.people} people in ${extractedInfo.location}. This seems ${urgencyWord}. Is this correct? (yes/no)`);
          setConversationState('awaiting_confirmation');
        } else if (missing.length === 1) {
          // Ask for missing field naturally
          if (!extractedInfo.type) {
            addMessage('bot', 'What kind of help do you need? (food, medical, rescue, shelter, or water)');
          } else if (!extractedInfo.location) {
            addMessage('bot', 'Which location in Kerala are you in? (e.g., Kochi, Alappuzha, Thrissur)');
          } else if (!extractedInfo.people) {
            addMessage('bot', 'How many people need assistance?');
          }
          setConversationState('awaiting_additional_info');
        } else {
          // Multiple missing - ask generally
          addMessage('bot', 'I need some information to help you. Could you tell me what help you need, where you are, and how many people are affected?');
          setConversationState('awaiting_additional_info');
        }

        // Validate Location if provided
        if (extractedInfo.location) {
          const locationCheck = validateLocation(userMessage);
          if (!locationCheck.valid && locationCheck.suggestions) {
            addMessage('bot', `I didn't recognize that location. Did you mean one of these: ${locationCheck.suggestions.join(', ')}?`);
            setConversationState('awaiting_additional_info');
            return;
          }
        }
      }
      else if (conversationState === 'awaiting_additional_info') {
        // Update with new info
        setExtractedData(prev => ({
          ...prev,
          ...extractedInfo
        }));

        // Check if we have all info now
        if (extractedData.type && extractedData.location && extractedData.people) {
          const urgencyWord = extractedData.urgency === 5 ? 'CRITICAL' :
                              extractedData.urgency === 4 ? 'URGENT' :
                              extractedData.urgency === 3 ? 'normal' : 'low';
          
          addMessage('bot', `Great! So you need ${extractedData.type} help for ${extractedData.people} people in ${extractedData.location}. This seems ${urgencyWord}. Is this correct?`);
          setConversationState('awaiting_confirmation');
        } else {
          // Still missing something - ask specifically
          if (!extractedData.type) {
            addMessage('bot', 'Please tell me what kind of help you need: food, medical, rescue, shelter, or water?');
          } else if (!extractedData.location) {
            addMessage('bot', 'Which city or area in Kerala?');
          } else if (!extractedData.people) {
            addMessage('bot', 'How many people need assistance?');
          }
        }

        // Validate Location if updated
        if (!extractedData.location && extractedInfo.location) {
          const locationCheck = validateLocation(userMessage);
          if (!locationCheck.valid && locationCheck.suggestions) {
            addMessage('bot', `I didn't recognize that location. Did you mean one of these: ${locationCheck.suggestions.join(', ')}?`);
            return;
          }
        }
      }
      else if (conversationState === 'awaiting_confirmation') {
        if (userMessage.toLowerCase().includes('yes')) {
          addMessage('bot', 'Thank you. What is your name?');
          setConversationState('awaiting_name');
        } else {
          addMessage('bot', 'I apologize. Let\'s start over. Please tell me your emergency details again.');
          setConversationState('awaiting_initial');
        }
      }
      else if (conversationState === 'awaiting_name') {
        setExtractedData(prev => ({ ...prev, name: userMessage }));

        // Submit the request
        const finalRequest = {
          type: extractedData.type || 'unknown',
          description: extractedData.description || userMessage,
          location: extractedData.location || 'Unknown',
          district: extractedData.district || '',
          lat: extractedData.lat || 10.5, // Default Kerala center
          lng: extractedData.lng || 76.5,
          urgency: extractedData.urgency || 3,
          people: extractedData.people || 1,
          name: userMessage
        };

        onSubmit(finalRequest);

        // Personalized response based on urgency
        let responseMessage = '';
        if (extractedData.urgency === 5) {
          responseMessage = `🚨 CRITICAL ALERT: Thank you ${userMessage}! Emergency services have been notified with highest priority. Help is on the way immediately! Stay on the line.`;
        } else if (extractedData.urgency === 4) {
          responseMessage = `⚠️ Thank you ${userMessage}! Your URGENT request has been submitted. Response teams are being dispatched.`;
        } else {
          responseMessage = `✅ Thank you ${userMessage}! Your request has been submitted. Help will arrive soon. Stay safe.`;
        }

        addMessage('bot', responseMessage);
        setConversationState('completed');

        // Reset after 8 seconds
        setTimeout(() => {
          setMessages([
            {
              id: Date.now(),
              sender: 'bot',
              text: '🌟 Hello again! I\'m Raksha AI. Need help with another emergency?',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setExtractedData({
            type: null,
            location: null,
            people: null,
            urgency: 3,
            name: null,
            description: null
          });
          setConversationState('greeting');
        }, 8000);
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-header-info">
          <span className="chatbot-avatar">🧠</span>
          <div>
            <h3>Raksha AI Assistant</h3>
            <p className="chatbot-status">
              <span className="status-dot offline"></span>
              Offline AI Mode • 100% Private
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
              <div className="message-bubble">
                {message.text}
              </div>
              <div className="message-timestamp">{message.timestamp}</div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message-wrapper bot">
            <div className="message-avatar">🧠</div>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
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
          placeholder="Type naturally - I understand plain English..."
          disabled={conversationState === 'completed'}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || conversationState === 'completed'}
        >
          Send
        </button>
      </div>
      
      <div className="chatbot-footer">
        <span>🧠 AI running offline • No internet needed</span>
        <span>✨ Understands natural language</span>
      </div>
      
      {conversationState === 'completed' && (
        <div className="chatbot-success">
          ✓ Request Submitted Successfully
        </div>
      )}
    </div>
  );
};

export default AIChatbotRequestForm;
