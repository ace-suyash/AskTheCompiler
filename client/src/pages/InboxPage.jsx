import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function InboxPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const { data } = await api.get('/messages');
        setConversations(data.conversations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, []);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-white mb-1">Messages</h1>
      <p className="text-sm text-gray-500 mb-4">
        Conversations auto-expire after 24 hours — use this for quick clarifications, not long-term chat.
      </p>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-16 bg-gray-800" />)}
        </div>
      ) : conversations.length === 0 ? (
        <div className="card text-center py-12 text-gray-500 text-sm">
          No active conversations. Visit a user's profile and click "Message" to start one.
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => (
            <Link
              key={conv.user._id}
              to={`/messages/${conv.user._id}`}
              className="card flex items-center gap-3 hover:border-gray-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {conv.user.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200">{conv.user.username}</p>
                <p className="text-xs text-gray-500 truncate">
                  {conv.lastMessageWasMine && <span className="text-gray-600">You: </span>}
                  {conv.lastMessage}
                </p>
              </div>
              <span className="text-xs text-gray-600 shrink-0">
                {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
