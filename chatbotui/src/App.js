import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
    setInput('');
    setIsTyping(true);

    setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: '...' }]);

    try {
      const response = await fetch('https://friendly-eureka-p97q44vjwq7269jw-8000.app.github.dev/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      });

      const data = await response.json();
      const fullBotMessage = data.response.replace(/\n/g, '<br/>'); // Preserve line breaks

      setMessages((prevMessages) => {
        return prevMessages.map((msg) =>
          msg.text === "..." ? { sender: "bot", text: fullBotMessage } : msg
        );
      });
    } catch (error) {
      console.error('Error fetching chatbot response:', error);
      setMessages((prevMessages) => prevMessages.filter(msg => msg.text !== '...'));
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Oops! Something went wrong. Try again later.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="App">
      <header className="chat-header">
        <img src="/ui_logo.png" alt="UI Logo" className="ui-logo" />
        <h1>UI Info Assistant</h1>
      </header>

      <div className="chat-container">
        {messages.length === 0 && (
          <div className="home-page">
            <img src="/ui_logo.png" alt="School Logo" className="school-logo" />
            <p className="description">
              The University of Ibadan information Assistant is an AI-powered chatbot designed to help students, faculty, and staff efficiently access university-related information. Ask me anything about UI!
            </p>
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
              <div className={`message ${message.sender}`} dangerouslySetInnerHTML={{ __html: message.text }} />
            </div>
          ))}
          {isTyping && <div className="typing-indicator">UI AI Assistant is typing...</div>}
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