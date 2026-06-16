
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuthStore } from '../store/authStore.js';

const POLL_INTERVAL_MS = 8000;

export default function ConversationPage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuthStore();

  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const fetchConversation = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await api.get(`/messages/${userId}`);
      setOtherUser(data.otherUser);
      setMessages(data.messages);
    } catch (err) {
      setError('Could not load conversation.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversation(true);

    // Poll for new messages
    pollRef.current = setInterval(() => fetchConversation(false), POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setSending(true);
    setError('');
    try {
      const { data } = await api.post(`/messages/${userId}`, { content: input.trim() });
      setMessages(prev => [...prev, data.message]);
      setInput('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="card animate-pulse h-96 bg-gray-800 max-w-2xl" />;
  }

  return (
    <div className="max-w-2xl flex flex-col h-[calc(100vh-7rem)]">

      {/* Header */}
      <div className="card flex items-center gap-3 mb-3 shrink-0">
        <Link to="/messages" className="text-gray-400 hover:text-white text-sm">← Inbox</Link>
        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
          {otherUser?.username?.[0]?.toUpperCase()}
        </div>
        <Link to={`/users/${userId}`} className="text-sm font-medium text-gray-200 hover:text-brand-500">
          {otherUser?.username}
        </Link>
        <span className="ml-auto text-xs text-gray-600">Messages expire after 24h</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto card space-y-2 mb-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-8">
            No messages yet. Say hello to clarify your doubt!
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = String(msg.sender._id || msg.sender) === String(currentUser._id);
            return (
              <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  isMine ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-200'
                }`}>
                  {msg.content}
                  <div className={`text-[10px] mt-1 ${isMine ? 'text-brand-200' : 'text-gray-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
      <form onSubmit={handleSend} className="flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          maxLength={1000}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm
                     text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
        <button type="submit" disabled={sending || !input.trim()} className="btn-primary text-sm disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}
