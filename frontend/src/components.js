import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Settings, 
  Moon, 
  Sun, 
  User, 
  Bot, 
  Trash2, 
  Copy, 
  Menu,
  X,
  Search,
  Sparkles,
  Check,
  RotateCcw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import axios from 'axios';

// API Configuration
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

// API Functions
const api = {
  async getConversations() {
    try {
      const response = await axios.get(`${API}/conversations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  async getConversation(conversationId) {
    try {
      const response = await axios.get(`${API}/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  },

  async sendMessage(conversationId, message, title = null) {
    try {
      const response = await axios.post(`${API}/chat/send`, {
        conversation_id: conversationId,
        message,
        title
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async deleteConversation(conversationId) {
    try {
      await axios.delete(`${API}/conversations/${conversationId}`);
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }
};

// Clean Sidebar Component
export const Sidebar = ({ 
  conversations, 
  currentConversation, 
  onSelectConversation, 
  onNewChat, 
  onDeleteConversation,
  darkMode, 
  toggleDarkMode,
  sidebarOpen,
  setSidebarOpen 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getLastMessage = (conversation) => {
    if (conversation.messages && conversation.messages.length > 0) {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      return lastMessage.content.length > 50 
        ? lastMessage.content.substring(0, 50) + '...'
        : lastMessage.content;
    }
    return 'No messages';
  };

  const handleDeleteConversation = async (e, conversationId) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      await onDeleteConversation(conversationId);
    }
  };

  return (
    <div className={`
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 transition-transform duration-300
      fixed lg:relative z-30 w-80 h-full
      ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
      border-r flex flex-col
    `}>
      {/* Header */}
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                dariusAI
              </h1>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className={`absolute left-3 top-2.5 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`
              w-full pl-9 pr-3 py-2 rounded-lg border
              ${darkMode 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              } 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            `}
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filteredConversations.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  onSelectConversation(conversation);
                  setSidebarOpen(false);
                }}
                className={`
                  p-3 rounded-lg cursor-pointer transition-colors group
                  ${currentConversation?.id === conversation.id
                    ? darkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-50 text-blue-900 border border-blue-200'
                    : darkMode
                      ? 'hover:bg-gray-800 text-gray-300'
                      : 'hover:bg-gray-50 text-gray-700'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate mb-1">
                      {conversation.title}
                    </p>
                    <p className={`text-xs truncate mb-1 ${
                      currentConversation?.id === conversation.id
                        ? darkMode ? 'text-blue-200' : 'text-blue-600'
                        : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {getLastMessage(conversation)}
                    </p>
                    <p className={`text-xs ${
                      currentConversation?.id === conversation.id
                        ? darkMode ? 'text-blue-200' : 'text-blue-600'
                        : darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {formatTimestamp(conversation.updated_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}>
            <Settings className="w-5 h-5" />
          </button>
          <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}>
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Clean Message Component
export const Message = ({ message, darkMode }) => {
  const [copied, setCopied] = useState(false);
  
  const isUser = message.role === 'user';
  
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      if (typeof timestamp === 'string' && timestamp.includes(':') && !timestamp.includes('T')) {
        return timestamp;
      }
      
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;
      
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return timestamp;
    }
  };

  const CodeBlock = ({ language, children }) => {
    const [codeCopied, setCodeCopied] = useState(false);

    useEffect(() => {
      Prism.highlightAll();
    }, [children]);

    const copyCode = async () => {
      await copyToClipboard(children);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    };

    return (
      <div className="relative group my-4">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={copyCode}
            className={`p-1 rounded text-xs ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
          >
            {codeCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        <pre className={`language-${language} rounded-lg overflow-x-auto`}>
          <code className={`language-${language}`}>{children}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${isUser ? (darkMode ? 'bg-gray-800' : 'bg-gray-50') : ''}`}>
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser 
                ? 'bg-blue-600' 
                : 'bg-green-600'
            }`}>
              {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {isUser ? 'You' : 'dariusAI'}
              </span>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
            
            <div className={`prose max-w-none ${darkMode ? 'prose-invert' : ''}`}>
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    
                    return !inline && match ? (
                      <CodeBlock language={language}>
                        {String(children).replace(/\n$/, '')}
                      </CodeBlock>
                    ) : (
                      <code className={`${darkMode ? 'bg-gray-700 text-green-300' : 'bg-gray-100 text-green-700'} px-1 py-0.5 rounded text-sm`} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            
            {!isUser && (
              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => copyToClipboard(message.content)}
                  className={`p-1 rounded text-sm ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                >
                  <Copy className="w-4 h-4" />
                </button>
                {copied && (
                  <span className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Copied!
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Clean Chat Input Component
export const ChatInput = ({ onSendMessage, darkMode, disabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      textareaRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} p-4`}>
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className={`flex items-end space-x-3 p-3 rounded-lg border ${
            darkMode 
              ? 'border-gray-600 bg-gray-800' 
              : 'border-gray-300 bg-white'
          } focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent`}>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message dariusAI..."
              disabled={disabled}
              className={`
                flex-1 border-0 bg-transparent resize-none focus:outline-none
                ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}
                min-h-[20px] max-h-[100px]
              `}
              rows={1}
            />
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className={`
                p-2 rounded-lg transition-colors
                ${message.trim() && !disabled
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-500'
                    : 'bg-gray-200 text-gray-400'
                }
              `}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
        <div className={`mt-2 text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          dariusAI can make mistakes. Consider checking important information.
        </div>
      </div>
    </div>
  );
};

// Clean Welcome Screen
const WelcomeScreen = ({ darkMode }) => {
  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-600 rounded-2xl flex items-center justify-center">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome to dariusAI
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Your intelligent AI assistant powered by advanced language models
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Code Help
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Get help with programming, debugging, and code reviews
            </p>
          </div>
          <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Writing
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Create content, essays, and improve your writing
            </p>
          </div>
          <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Analysis
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Analyze data, documents, and complex problems
            </p>
          </div>
          <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Chat
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Have natural conversations about any topic
            </p>
          </div>
        </div>

        <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Start a conversation by typing a message below
        </div>
      </div>
    </div>
  );
};

// Clean Chat Area Component
export const ChatArea = ({ 
  conversation, 
  darkMode, 
  onSendMessage, 
  isTyping,
  sidebarOpen,
  setSidebarOpen 
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, isTyping]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col">
        <WelcomeScreen darkMode={darkMode} />
        <ChatInput 
          onSendMessage={onSendMessage} 
          darkMode={darkMode} 
          disabled={isTyping}
        />
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <h1 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {conversation.title}
          </h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {conversation.messages?.map((message, index) => (
          <Message 
            key={message.id || index} 
            message={message} 
            darkMode={darkMode}
          />
        ))}
        
        {isTyping && (
          <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="max-w-4xl mx-auto px-6 py-6">
              <div className="flex space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      dariusAI
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput 
        onSendMessage={onSendMessage} 
        darkMode={darkMode} 
        disabled={isTyping}
      />
    </div>
  );
};

// Main Chat App Component
export const ChatApp = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const convs = await api.getConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    setSidebarOpen(false);
  };

  const handleSelectConversation = async (conversation) => {
    try {
      const fullConversation = await api.getConversation(conversation.id);
      setCurrentConversation(fullConversation);
    } catch (error) {
      console.error('Error loading conversation:', error);
      setCurrentConversation(conversation);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      const success = await api.deleteConversation(conversationId);
      if (success) {
        setConversations(conversations.filter(conv => conv.id !== conversationId));
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleSendMessage = async (message) => {
    setIsTyping(true);

    try {
      const response = await api.sendMessage(
        currentConversation?.id, 
        message,
        currentConversation ? null : message.substring(0, 50)
      );

      if (currentConversation) {
        const updatedConversation = {
          ...currentConversation,
          messages: [
            ...currentConversation.messages,
            response.user_message,
            response.ai_message
          ],
          updated_at: new Date().toISOString()
        };
        setCurrentConversation(updatedConversation);
        
        setConversations(conversations.map(conv => 
          conv.id === currentConversation.id 
            ? { ...conv, updated_at: updatedConversation.updated_at }
            : conv
        ));
      } else {
        const newConversation = await api.getConversation(response.conversation_id);
        setCurrentConversation(newConversation);
        setConversations([newConversation, ...conversations]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-blue-600 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Loading dariusAI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={handleOverlayClick}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConversation={currentConversation}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Chat Area */}
      <ChatArea
        conversation={currentConversation}
        darkMode={darkMode}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
    </div>
  );
};