import React, { useEffect, useState, useRef, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Conversation, Message } from '../types/chat';
import SidebarConversationItem from '../components/SidebarConversationItem';
import TrackerDashboard from '../components/TrackerDashboard';

const Chat: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTracker, setShowTracker] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) fetchMessages(activeConvId);
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/api/chat/history');
      setConversations(res.data.conversations || []);
      if (res.data.conversations?.length && !activeConvId) {
        setActiveConvId(res.data.conversations[0]._id);
      }
    } catch (err) {
      setError('Failed to load conversations');
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await axios.get(`/api/chat/history?convId=${convId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      setMessages([]);
    }
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/chat/send', {
        conversationId: activeConvId,
        message: input,
      });
      setMessages(res.data.messages || []);
      setInput('');
      if (res.data.conversationId && res.data.conversationId !== activeConvId) {
        setActiveConvId(res.data.conversationId);
        fetchConversations();
      }
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConvId(convId);
  };

  const handleRenameConversation = async (convId: string, newTitle: string) => {
    try {
      await axios.post('/api/chat/rename', { conversationId: convId, title: newTitle });
      setConversations((prev: Conversation[]) => prev.map((c: Conversation) => c._id === convId ? { ...c, title: newTitle } : c));
    } catch (err) {
      setError('Failed to rename conversation');
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      await axios.post('/api/chat/delete', { conversationId: convId });
      setConversations((prev: Conversation[]) => prev.filter((c: Conversation) => c._id !== convId));
      if (activeConvId === convId) {
        // If deleted active, switch to first or clear
        const next = conversations.find((c: Conversation) => c._id !== convId);
        setActiveConvId(next?._id || null);
        setMessages([]);
      }
    } catch (err) {
      setError('Failed to delete conversation');
    }
  };

  const handleNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <span className="font-bold text-lg">ChatGPT Clone</span>
        <div className="flex items-center gap-4">
          <span>{user?.email}</span>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
      {/* Main area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100 h-full p-4 flex flex-col">
          <button
            className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
            onClick={handleNewConversation}
          >
            + New Chat
          </button>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv: Conversation) => (
              <SidebarConversationItem
                key={conv._id}
                conversation={conv}
                isActive={conv._id === activeConvId}
                onSelect={() => handleSelectConversation(conv._id)}
                onRename={async (newTitle: string) => {
                  await handleRenameConversation(conv._id, newTitle);
                }}
                onDelete={async () => {
                  await handleDeleteConversation(conv._id);
                }}
              />
            ))}
          </div>
          <button
            className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded"
            onClick={() => setShowTracker(true)}
          >
            My Tracker
          </button>
        </aside>
        {/* Main content: Chat or Tracker */}
        <main className="flex-1 flex flex-col">
          {showTracker ? (
            <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-gray-800">
              <TrackerDashboard />
              <div className="mt-4 flex justify-end">
                <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded" onClick={() => setShowTracker(false)}>
                  Back to Chat
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-gray-800">
                {messages.length === 0 && <div className="text-gray-400 text-center mt-10">No messages yet.</div>}
                {messages.map((msg: Message) => (
                  <div
                    key={msg._id}
                    className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-lg px-4 py-2 rounded shadow ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100'}`}>
                      <span className="block text-xs text-gray-500 mb-1">{msg.role === 'user' ? 'You' : 'AI'}</span>
                      <span>{msg.content}</span>
                      <span className="block text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
                {loading && <div className="text-center text-gray-500">AI is typing...</div>}
                {error && <div className="text-center text-red-500 mt-2">{error}</div>}
              </div>
              <form className="p-4 flex gap-2 border-t" onSubmit={handleSend}>
                <input
                  className="flex-1 border rounded p-2"
                  placeholder="Type your message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={loading}
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                  disabled={loading || !input.trim()}
                  type="submit"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Chat;
