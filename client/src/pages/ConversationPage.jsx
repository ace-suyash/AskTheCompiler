
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

  {/* return block to be added */}
}
