import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage = { sender: 'user', text: input };
    setMessages([...messages, newMessage]);

    const response = await fetch('https://friendly-eureka-p97q44vjwq7269jw-8000.app.github.dev/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: input }),
    });

    const data = await response.json();
    const botMessage = { sender: 'bot', text: data.response };
    setMessages([...messages, newMessage, botMessage]);
    setInput('');
  };

  return (
    <div className="App">
      <div className="chat-container">
        {messages.length === 0 && (
          <div className="home-page">
            <img src="/ui_logo.png" alt="School Logo" className="school-logo" />
            <p className="description">The University of Ibadan AI Assistant is an AI-powered chatbot designed to help students, faculty, and staff efficiently access university-related information. Ask me anything about UI! </p>
          </div>
        )}
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`message-container ${message.sender}`}>
              <img
                src={message.sender === 'user' ? '/profile-logo.svg' : '/ui_logo.png'}
                alt={message.sender}
                className="avatar"
              />
              <div className={`message ${message.sender}`}>
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="input-box"
          />
          <button onClick={sendMessage}>
            <img src="/send-icon.svg" alt="Send" className="send-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;