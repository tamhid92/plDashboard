import { useState, useEffect, useRef } from 'react'
import './App.css'

const BASE_URL = 'http://localhost:8001'; // Point to our new backend

function App() {
  const [enabled, setEnabled] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history: [] })
      });

      const data = await response.json();

      const assistantMsg = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        debug: data.debug
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to backend.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!enabled) {
    return (
      <div className="landing-container">
        <div className="landing-card">
          <h1>Premier League Analytics AI</h1>
          <p>This proof-of-concept allows you to chat with your EPL data.</p>
          <button className="enable-btn" onClick={() => setEnabled(true)}>
            Enable Chat Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="logo">⚽ EPL AI Dashboard</div>
        <button className="disable-btn" onClick={() => setEnabled(false)}>Disable Chat</button>
      </header>

      <div className="messages-area" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="empty-state">
            <p>Ask anything about Teams, Players, Fixtures, or Results.</p>
            <div className="examples">
              <span onClick={() => setInput("Who is top of the league?")}>"Who is top of the league?"</span>
              <span onClick={() => setInput("Show me the top 5 scorers")}>"Top 5 scorers"</span>
              <span onClick={() => setInput("When is Liverpool's next match?")}>"Liverpool fixtures"</span>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}>
            <div className="avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
            <div className="content">
              <div className="bubble">
                {msg.content.split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="sources">
                  <details>
                    <summary>Sources ({msg.sources.length})</summary>
                    <div className="sources-list">
                      {msg.sources.map((s, i) => (
                        <div key={i} className="source-item">
                          <span className="source-endpoint">{s.endpoint}</span>
                          <span className="source-rows">{s.rows_used} rows</span>
                          <span className="source-note">{s.notes}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="avatar">🤖</div>
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <div className="input-area">
        <textarea
          placeholder="Ask a question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
          ➤
        </button>
      </div>
    </div>
  )
}

export default App
