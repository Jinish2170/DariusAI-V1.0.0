import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Settings, 
  Moon, 
  Sun, 
  User, 
  Bot, 
  Edit3, 
  Trash2, 
  Copy, 
  ChevronDown,
  Menu,
  X,
  Search,
  Sparkles,
  Code,
  FileText,
  Image as ImageIcon,
  Mic,
  Square,
  MoreVertical,
  Download,
  Share,
  BookOpen,
  Zap,
  Brain,
  Cpu,
  Globe,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Volume2,
  Pause,
  Play
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
  },

  async updateConversationTitle(conversationId, title) {
    try {
      await axios.put(`${API}/conversations/${conversationId}/title`, { title });
      return true;
    } catch (error) {
      console.error('Error updating conversation title:', error);
      return false;
    }
  }
};

// Premium Gradient Button Component
const GradientButton = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, ...props }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-md hover:shadow-lg',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl',
    ghost: 'bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${className}
        rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        relative overflow-hidden group
      `}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    </button>
  );
};

// Glassmorphism Card Component
const GlassCard = ({ children, className = '', hover = true, ...props }) => {
  return (
    <div
      className={`
        bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20
        ${hover ? 'hover:bg-white/20 hover:border-white/30 transition-all duration-300' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Premium Sidebar Component
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getLastMessage = (conversation) => {
    if (conversation.messages && conversation.messages.length > 0) {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      return lastMessage.content.length > 60 
        ? lastMessage.content.substring(0, 60) + '...'
        : lastMessage.content;
    }
    return 'No messages';
  };

  const handleDeleteConversation = async (e, conversationId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await onDeleteConversation(conversationId);
    }
  };

  return (
    <div className={`
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 transition-all duration-500 ease-out
      fixed lg:relative z-30 w-80 h-full
      ${darkMode 
        ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-b from-white via-gray-50 to-white'
      }
      border-r ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}
      flex flex-col backdrop-blur-xl
    `}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-full opacity-20 ${darkMode ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20' : 'bg-gradient-to-br from-purple-100 to-blue-100'}`} />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-l from-purple-500/10 to-transparent rounded-full animate-pulse" />
        <div className="absolute bottom-20 left-0 w-40 h-40 bg-gradient-to-r from-blue-500/10 to-transparent rounded-full animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <h1 className={`text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
                Grok AI
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Premium Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
          >
            <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>
        
        <GradientButton
          onClick={onNewChat}
          className="w-full justify-center space-x-2"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Conversation</span>
          <Sparkles className="w-4 h-4 ml-1" />
        </GradientButton>
      </div>

      {/* Premium Search */}
      <div className="relative z-10 p-6">
        <div className={`
          relative rounded-2xl transition-all duration-300
          ${isSearchFocused 
            ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 shadow-lg scale-105' 
            : 'bg-white/10 hover:bg-white/20'
          }
          backdrop-blur-sm border ${isSearchFocused ? 'border-purple-500/50' : 'border-white/20'}
        `}>
          <Search className={`absolute left-4 top-3.5 w-5 h-5 transition-colors duration-300 ${
            isSearchFocused 
              ? 'text-purple-400' 
              : darkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`
              w-full pl-12 pr-4 py-3 bg-transparent rounded-2xl
              ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}
              focus:outline-none transition-all duration-300
            `}
          />
          {isSearchFocused && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse" />
          )}
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 relative z-10">
        {filteredConversations.length === 0 ? (
          <GlassCard className="p-8 text-center" hover={false}>
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No conversations yet
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Start your first conversation with our AI
            </p>
          </GlassCard>
        ) : (
          filteredConversations.map((conversation, index) => (
            <GlassCard
              key={conversation.id}
              className={`
                p-4 cursor-pointer transition-all duration-300 group
                ${currentConversation?.id === conversation.id
                  ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 border-purple-500/50 shadow-lg scale-105'
                  : 'hover:scale-102 hover:shadow-xl'
                }
                transform animate-fadeInUp
              `}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => {
                onSelectConversation(conversation);
                setSidebarOpen(false);
              }}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${currentConversation?.id === conversation.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700'
                  }
                  shadow-lg transition-all duration-300 group-hover:scale-110
                `}>
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate mb-1 ${
                    currentConversation?.id === conversation.id
                      ? 'text-white'
                      : darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {conversation.title}
                  </p>
                  <p className={`text-xs truncate mb-2 ${
                    currentConversation?.id === conversation.id
                      ? 'text-purple-100'
                      : darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {getLastMessage(conversation)}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${
                      currentConversation?.id === conversation.id
                        ? 'text-purple-200'
                        : darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {formatTimestamp(conversation.updated_at)}
                    </p>
                    <button
                      onClick={(e) => handleDeleteConversation(e, conversation.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-all duration-300"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Premium Footer */}
      <div className="relative z-10 p-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <GradientButton
            onClick={toggleDarkMode}
            variant="ghost"
            size="sm"
            className="p-3"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </GradientButton>
          <GradientButton variant="ghost" size="sm" className="p-3">
            <Settings className="w-5 h-5" />
          </GradientButton>
          <GradientButton variant="ghost" size="sm" className="p-3">
            <User className="w-5 h-5" />
          </GradientButton>
        </div>
        <div className={`mt-4 text-center text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Powered by Gemini AI
        </div>
      </div>
    </div>
  );
};

// Premium Message Component
export const Message = ({ message, darkMode, onRegenerate, onRate }) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
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

  const PremiumCodeBlock = ({ language, children }) => {
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
        <div className="absolute top-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
            {language}
          </span>
          <GradientButton
            onClick={copyCode}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </GradientButton>
        </div>
        <pre className={`language-${language} rounded-2xl overflow-hidden shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          <code className={`language-${language}`}>{children}</code>
        </pre>
      </div>
    );
  };

  return (
    <div 
      className={`
        group transition-all duration-500 hover:bg-white/5 rounded-3xl
        ${isUser ? (darkMode ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20' : 'bg-gradient-to-r from-purple-50 to-blue-50') : ''}
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex space-x-6 p-8">
        <div className="flex-shrink-0">
          <div className={`
            w-12 h-12 rounded-2xl overflow-hidden shadow-lg ring-2 transition-all duration-300 group-hover:scale-110
            ${isUser 
              ? 'ring-purple-500/50 bg-gradient-to-r from-purple-600 to-blue-600' 
              : 'ring-blue-500/50 bg-gradient-to-r from-blue-600 to-cyan-600'
            }
          `}>
            {message.avatar ? (
              <img
                src={message.avatar}
                alt={isUser ? 'User' : 'Assistant'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {isUser ? <User className="w-6 h-6 text-white" /> : <Brain className="w-6 h-6 text-white" />}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {isUser ? 'You' : 'Grok AI'}
              </span>
              {!isUser && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Online
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatTimestamp(message.timestamp)}
              </span>
              {showActions && !isUser && (
                <div className="flex items-center space-x-1 animate-fadeIn">
                  <GradientButton
                    onClick={() => setIsPlaying(!isPlaying)}
                    variant="ghost"
                    size="sm"
                    className="p-2"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </GradientButton>
                  <GradientButton
                    onClick={() => onRate?.(message.id, 'up')}
                    variant="ghost"
                    size="sm"
                    className="p-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </GradientButton>
                  <GradientButton
                    onClick={() => onRate?.(message.id, 'down')}
                    variant="ghost"
                    size="sm"
                    className="p-2"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </GradientButton>
                </div>
              )}
            </div>
          </div>
          
          <div className={`prose prose-lg max-w-none ${darkMode ? 'prose-invert' : ''} leading-relaxed`}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  
                  return !inline && match ? (
                    <PremiumCodeBlock language={language}>
                      {String(children).replace(/\n$/, '')}
                    </PremiumCodeBlock>
                  ) : (
                    <code className={`
                      ${darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'} 
                      px-2 py-1 rounded-lg text-sm font-mono border
                      ${darkMode ? 'border-purple-700/50' : 'border-purple-200'}
                    `} {...props}>
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
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center space-x-3">
                <GradientButton
                  onClick={() => copyToClipboard(message.content)}
                  variant="ghost"
                  size="sm"
                  className="space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </GradientButton>
                <GradientButton
                  onClick={() => onRegenerate?.(message.id)}
                  variant="ghost"
                  size="sm"
                  className="space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Regenerate</span>
                </GradientButton>
                <GradientButton
                  variant="ghost"
                  size="sm"
                  className="space-x-2"
                >
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </GradientButton>
              </div>
              {copied && (
                <div className="flex items-center space-x-2 text-green-500 animate-fadeIn">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Copied to clipboard!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Premium Chat Input Component
export const ChatInput = ({ onSendMessage, darkMode, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
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
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const quickPrompts = [
    { icon: Code, text: "Help me code", prompt: "I need help with coding. Can you assist me?" },
    { icon: FileText, text: "Write content", prompt: "Help me write professional content" },
    { icon: Brain, text: "Explain concept", prompt: "Explain a complex concept in simple terms" },
    { icon: Zap, text: "Quick answer", prompt: "Give me a quick and accurate answer" }
  ];

  return (
    <div className={`
      border-t backdrop-blur-xl transition-all duration-500
      ${darkMode 
        ? 'border-gray-700/50 bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80' 
        : 'border-gray-200/50 bg-gradient-to-r from-white/80 via-gray-50/80 to-white/80'
      }
    `}>
      {/* Quick Prompts */}
      <div className="px-8 pt-6">
        <div className="flex items-center space-x-3 mb-4 overflow-x-auto">
          {quickPrompts.map((prompt, index) => (
            <GradientButton
              key={index}
              onClick={() => {
                setMessage(prompt.prompt);
                textareaRef.current?.focus();
              }}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 space-x-2"
            >
              <prompt.icon className="w-4 h-4" />
              <span>{prompt.text}</span>
            </GradientButton>
          ))}
        </div>
      </div>

      {/* Main Input Area */}
      <div className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className={`
            relative rounded-3xl transition-all duration-300 transform
            ${isFocused 
              ? 'scale-105 shadow-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50' 
              : 'shadow-xl bg-white/10 border-white/20 hover:bg-white/20'
            }
            backdrop-blur-xl border
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            {/* Animated Background */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <div className={`
                absolute inset-0 opacity-30 transition-opacity duration-300
                ${isFocused ? 'opacity-50' : 'opacity-0'}
                bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20
              `} />
            </div>

            <div className="relative flex items-end space-x-4 p-6">
              {/* Attachment Button */}
              <GradientButton
                type="button"
                variant="ghost"
                size="sm"
                className="p-3 flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
              </GradientButton>

              {/* Text Input */}
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                  placeholder="Ask Grok anything..."
                  disabled={disabled}
                  className={`
                    w-full border-0 bg-transparent resize-none focus:outline-none
                    ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}
                    text-lg leading-relaxed min-h-[60px] max-h-[200px]
                  `}
                  rows={1}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <GradientButton
                  type="button"
                  onClick={() => setIsRecording(!isRecording)}
                  variant={isRecording ? "danger" : "ghost"}
                  size="sm"
                  className="p-3"
                >
                  {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </GradientButton>
                
                <GradientButton
                  type="submit"
                  disabled={!message.trim() || disabled}
                  className={`p-3 transition-all duration-300 ${
                    message.trim() && !disabled 
                      ? 'scale-110 shadow-lg' 
                      : 'scale-100'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </GradientButton>
              </div>
            </div>
          </div>
          
          {/* Footer Info */}
          <div className={`mt-4 text-center space-y-2`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="inline-flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Grok can make mistakes. Verify important information.</span>
              </span>
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Press Enter to send • Shift+Enter for new line
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Premium Welcome Screen
const WelcomeScreen = ({ darkMode, onQuickStart }) => {
  const features = [
    {
      icon: Brain,
      title: "Advanced Reasoning",
      description: "Complex problem solving with multi-step analysis",
      gradient: "from-purple-500 to-blue-500"
    },
    {
      icon: Code,
      title: "Code Generation",
      description: "Write, debug, and optimize code in any language",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: FileText,
      title: "Content Creation",
      description: "Generate articles, essays, and creative writing",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Instant Answers",
      description: "Get quick, accurate responses to any question",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const quickStarters = [
    "Explain quantum computing in simple terms",
    "Write a Python function to sort a list",
    "Create a marketing strategy for a startup",
    "Help me debug this JavaScript code"
  ];

  return (
    <div className={`
      flex-1 flex flex-col items-center justify-center p-8
      ${darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20' 
        : 'bg-gradient-to-br from-white via-purple-50 to-blue-50'
      }
      relative overflow-hidden
    `}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Grok AI
              </h1>
              <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Premium Intelligence Engine
              </p>
            </div>
          </div>
          
          <p className={`text-2xl leading-relaxed max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Experience the future of AI conversation with 
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold"> advanced reasoning</span>,
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-semibold"> creative thinking</span>, and
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-semibold"> unlimited possibilities</span>.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <GlassCard 
              key={index} 
              className="p-6 text-center space-y-4 group hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>

        {/* Quick Starters */}
        <div className="space-y-6">
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Try asking about...
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {quickStarters.map((prompt, index) => (
              <GlassCard
                key={index}
                className="p-4 cursor-pointer group hover:scale-105 transition-all duration-300"
                onClick={() => onQuickStart(prompt)}
              >
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-purple-500 group-hover:animate-spin" />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} group-hover:text-purple-600 transition-colors`}>
                    {prompt}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              99.9%
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Accuracy Rate
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              24/7
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Available
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ∞
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Possibilities
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Premium Chat Area Component
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

  const handleQuickStart = (prompt) => {
    onSendMessage(prompt);
  };

  const handleRegenerate = (messageId) => {
    console.log('Regenerating message:', messageId);
    // Implement regeneration logic
  };

  const handleRate = (messageId, rating) => {
    console.log('Rating message:', messageId, rating);
    // Implement rating logic
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col">
        <WelcomeScreen darkMode={darkMode} onQuickStart={handleQuickStart} />
        <ChatInput 
          onSendMessage={onSendMessage} 
          darkMode={darkMode} 
          disabled={isTyping}
        />
      </div>
    );
  }

  return (
    <div className={`
      flex-1 flex flex-col
      ${darkMode 
        ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-b from-white via-gray-50 to-white'
      }
    `}>
      {/* Premium Header */}
      <div className={`
        px-8 py-6 border-b backdrop-blur-xl
        ${darkMode 
          ? 'border-gray-700/50 bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80' 
          : 'border-gray-200/50 bg-gradient-to-r from-white/80 via-gray-50/80 to-white/80'
        }
        flex items-center justify-between
      `}>
        <div className="flex items-center space-x-4">
          <GradientButton
            onClick={() => setSidebarOpen(true)}
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
          >
            <Menu className="w-5 h-5" />
          </GradientButton>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {conversation.title}
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {conversation.messages?.length || 0} messages
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <GradientButton variant="ghost" size="sm" className="space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </GradientButton>
          <GradientButton variant="ghost" size="sm" className="space-x-2">
            <Share className="w-4 h-4" />
            <span>Share</span>
          </GradientButton>
          <GradientButton variant="ghost" size="sm" className="p-2">
            <MoreVertical className="w-4 h-4" />
          </GradientButton>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {conversation.messages?.map((message, index) => (
            <Message 
              key={message.id || index} 
              message={message} 
              darkMode={darkMode}
              onRegenerate={handleRegenerate}
              onRate={handleRate}
            />
          ))}
          
          {isTyping && (
            <div className="p-8">
              <div className="flex space-x-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Grok AI
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Thinking...
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-bounce" />
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-bounce delay-150" />
                    <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
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

// Main Premium Chat App Component
export const ChatApp = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode for premium feel
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
      <div className={`
        h-screen flex items-center justify-center
        ${darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20' 
          : 'bg-gradient-to-br from-white via-purple-50 to-blue-50'
        }
      `}>
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Initializing Grok AI
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Preparing your premium AI experience...
            </p>
          </div>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-150" />
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce delay-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex transition-all duration-500 ${darkMode ? 'dark' : ''}`}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-20 transition-all duration-300"
          onClick={handleOverlayClick}
        />
      )}
      
      {/* Premium Sidebar */}
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