import React, { useState } from 'react';
import './VoiceButton.css';

const VoiceButton = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;      // Stop after one sentence
    recognition.interimResults = false;   // Final results only
    recognition.lang = 'en-IN';           // Indian English
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);           // Send text to parent
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error', event.error);
      let message = 'Voice recognition error.';
      switch (event.error) {
        case 'no-speech': message = 'No speech detected. Please try again.'; break;
        case 'audio-capture': message = 'No microphone found. Check your device.'; break;
        case 'not-allowed': message = 'Microphone permission denied. Please allow access.'; break;
        default: message = 'Voice recognition failed.';
      }
      setError(message);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      setError('Could not start voice recognition.');
      setIsListening(false);
    }
  };

  return (
    <div className="voice-button-container">
      <button
        type="button"
        className={`voice-button ${isListening ? 'listening' : ''}`}
        onClick={startListening}
        disabled={isListening}
        title={isListening ? 'Listening...' : 'Click and speak'}
      >
        <span className="mic-icon">{isListening ? '🔴' : '🎤'}</span>
        <span className="voice-text">
          {isListening ? 'Listening...' : ''}
        </span>
      </button>
      {error && <div className="voice-error">{error}</div>}
    </div>
  );
};

export default VoiceButton;
