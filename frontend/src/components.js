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
  Square
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-css';
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

// Sidebar Component
export const Sidebar = ({ 
  conversations, 
  currentConversation, 
  onSelectConversation, 
  onNewChat, 
  darkMode, 
  toggleDarkMode,
  sidebarOpen,
  setSidebarOpen 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:relative z-30 w-72 h-full ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
      {/* Header */}
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              AI Chat
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>
        
        <button
          onClick={onNewChat}
          className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'} transition-colors`}
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
            className={`w-full pl-9 pr-3 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => {
              onSelectConversation(conversation);
              setSidebarOpen(false);
            }}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              currentConversation?.id === conversation.id
                ? darkMode 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-50 text-purple-900 border border-purple-200'
                : darkMode
                  ? 'hover:bg-gray-800 text-gray-300'
                  : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex items-start space-x-3">
              <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{conversation.title}</p>
                <p className={`text-xs truncate mt-1 ${
                  currentConversation?.id === conversation.id
                    ? darkMode ? 'text-purple-200' : 'text-purple-600'
                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {conversation.lastMessage}
                </p>
                <p className={`text-xs mt-1 ${
                  currentConversation?.id === conversation.id
                    ? darkMode ? 'text-purple-200' : 'text-purple-600'
                    : darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {conversation.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Settings */}
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

// Message Component
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

  const CodeBlock = ({ language, children }) => {
    useEffect(() => {
      Prism.highlightAll();
    }, [children]);

    return (
      <div className="relative group">
        <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
          <button
            onClick={() => copyToClipboard(children)}
            className={`p-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'} transition-colors`}
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
        <pre className={`language-${language}`}>
          <code className={`language-${language}`}>{children}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className={`flex space-x-4 p-6 ${isUser ? (darkMode ? 'bg-gray-800' : 'bg-gray-50') : ''}`}>
      <div className="flex-shrink-0">
        <img
          src={message.avatar}
          alt={isUser ? 'User' : 'Assistant'}
          className="w-8 h-8 rounded-full object-cover"
        />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {message.timestamp}
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
                  <code className={`${darkMode ? 'bg-gray-700 text-purple-300' : 'bg-gray-100 text-purple-600'} px-1 py-0.5 rounded text-sm`} {...props}>
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
              className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
              title="Copy message"
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
  );
};

// Chat Input Component
export const ChatInput = ({ onSendMessage, darkMode, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
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
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} p-4`}>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className={`relative rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'} focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent`}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message AI Assistant..."
            disabled={disabled}
            className={`w-full px-4 py-3 pr-24 border-0 bg-transparent resize-none focus:outline-none ${
              darkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
            } min-h-[24px] max-h-[200px]`}
            rows={1}
          />
          <div className="absolute right-2 bottom-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : darkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className={`p-2 rounded-lg transition-colors ${
                message.trim() && !disabled
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : darkMode
                    ? 'bg-gray-700 text-gray-500'
                    : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} text-center`}>
          AI can make mistakes. Consider checking important information.
        </div>
      </form>
    </div>
  );
};

// Main Chat Area Component
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
      <div className={`flex-1 flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="max-w-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto">
            <Sparkles className={`w-full h-full ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to AI Chat</h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Start a conversation with our AI assistant. Ask questions, get help with coding, writing, analysis, and more.
            </p>
          </div>
          <div className={`grid grid-cols-2 gap-3 text-sm`}>
            <div className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <Code className={`w-5 h-5 mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className="font-medium">Code Help</div>
              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                Debug, review, and write code
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <FileText className={`w-5 h-5 mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <div className="font-medium">Writing</div>
              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                Create and edit content
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <ImageIcon className={`w-5 h-5 mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <div className="font-medium">Analysis</div>
              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                Analyze data and images
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <MessageSquare className={`w-5 h-5 mb-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              <div className="font-medium">Chat</div>
              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                Have conversations
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {conversation.title}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}>
            <Edit3 className="w-4 h-4" />
          </button>
          <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {conversation.messages.map((message) => (
          <Message key={message.id} message={message} darkMode={darkMode} />
        ))}
        
        {isTyping && (
          <div className={`flex space-x-4 p-6`}>
            <div className="flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1631882456892-54a30e92fe4f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxyb2JvdCUyMGF2YXRhcnxlbnwwfHx8fDE3NTIzMTY5NDh8MA&ixlib=rb-4.1.0&q=85"
                alt="Assistant"
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  AI Assistant
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-500' : 'bg-gray-400'} animate-pulse`}></div>
                <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-500' : 'bg-gray-400'} animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
                <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-500' : 'bg-gray-400'} animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
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
  const [conversations, setConversations] = useState(mockConversations);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (conversation) => {
    setCurrentConversation(conversation);
  };

  const generateAIResponse = (userMessage) => {
    // Mock AI responses based on keywords
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('react') || lowerMessage.includes('javascript') || lowerMessage.includes('frontend')) {
      return "I'd be happy to help with React and frontend development! Here are some key concepts:\n\n## Modern React Patterns\n\n```jsx\n// Custom Hook Example\nconst useCounter = (initialValue = 0) => {\n  const [count, setCount] = useState(initialValue);\n  \n  const increment = useCallback(() => {\n    setCount(c => c + 1);\n  }, []);\n  \n  const decrement = useCallback(() => {\n    setCount(c => c - 1);\n  }, []);\n  \n  return { count, increment, decrement };\n};\n```\n\n**Key Benefits:**\n- Reusable logic\n- Clean component code\n- Easy testing\n\nWhat specific React topic would you like to explore further?";
    } else if (lowerMessage.includes('python') || lowerMessage.includes('data') || lowerMessage.includes('pandas')) {
      return "Python is excellent for data analysis! Here's a quick example:\n\n```python\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n# Create sample data\ndata = {\n    'Name': ['Alice', 'Bob', 'Charlie'],\n    'Age': [25, 30, 35],\n    'Salary': [50000, 60000, 70000]\n}\n\ndf = pd.DataFrame(data)\n\n# Basic analysis\nprint(df.describe())\nprint(df.groupby('Age')['Salary'].mean())\n\n# Visualization\ndf.plot(x='Age', y='Salary', kind='scatter')\nplt.show()\n```\n\nWhat kind of data analysis are you working on?";
    } else if (lowerMessage.includes('ai') || lowerMessage.includes('machine learning') || lowerMessage.includes('ml')) {
      return "AI and Machine Learning are fascinating fields! Here's an overview:\n\n## Key Areas:\n\n### 1. **Supervised Learning**\n- Classification (predicting categories)\n- Regression (predicting numbers)\n- Examples: Image recognition, price prediction\n\n### 2. **Unsupervised Learning**\n- Clustering (grouping similar data)\n- Dimensionality reduction\n- Examples: Customer segmentation, data compression\n\n### 3. **Deep Learning**\n```python\nimport tensorflow as tf\n\nmodel = tf.keras.Sequential([\n    tf.keras.layers.Dense(128, activation='relu'),\n    tf.keras.layers.Dropout(0.2),\n    tf.keras.layers.Dense(10, activation='softmax')\n])\n\nmodel.compile(optimizer='adam',\n              loss='sparse_categorical_crossentropy',\n              metrics=['accuracy'])\n```\n\nWhat specific AI topic interests you most?";
    } else {
      return `That's an interesting question about "${userMessage}"! I'd be happy to help you explore this topic further.\n\nHere are some ways I can assist:\n\n• **Detailed explanations** - I can break down complex concepts\n• **Code examples** - Practical implementations in various languages\n• **Best practices** - Industry-standard approaches\n• **Troubleshooting** - Help debug issues\n• **Learning resources** - Suggest tutorials and documentation\n\nCould you provide more specific details about what you'd like to know? For example:\n- What's your experience level with this topic?\n- Are you working on a particular project?\n- What specific aspect would you like to focus on?\n\nThe more context you provide, the better I can tailor my response to your needs!`;
    }
  };

  const handleSendMessage = async (message) => {
    setIsTyping(true);

    // Create or update conversation
    let updatedConversation;
    
    if (currentConversation) {
      // Add to existing conversation
      const userMessage = {
        id: currentConversation.messages.length + 1,
        role: 'user',
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHx1c2VyJTIwYXZhdGFyfGVufDB8fHx8MTc1MjMxNjk1N3ww&ixlib=rb-4.1.0&q=85"
      };

      updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, userMessage],
        lastMessage: message,
        timestamp: 'Just now'
      };
    } else {
      // Create new conversation
      const newId = conversations.length + 1;
      updatedConversation = {
        id: newId,
        title: message.length > 50 ? message.substring(0, 50) + '...' : message,
        lastMessage: message,
        timestamp: 'Just now',
        messages: [{
          id: 1,
          role: 'user',
          content: message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHx1c2VyJTIwYXZhdGFyfGVufDB8fHx8MTc1MjMxNjk1N3ww&ixlib=rb-4.1.0&q=85"
        }]
      };
    }

    // Update current conversation
    setCurrentConversation(updatedConversation);

    // Update conversations list
    if (currentConversation) {
      setConversations(conversations.map(conv => 
        conv.id === currentConversation.id ? updatedConversation : conv
      ));
    } else {
      setConversations([updatedConversation, ...conversations]);
    }

    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate AI response
    const aiResponse = generateAIResponse(message);
    const assistantMessage = {
      id: updatedConversation.messages.length + 1,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: "https://images.unsplash.com/photo-1631882456892-54a30e92fe4f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxyb2JvdCUyMGF2YXRhcnxlbnwwfHx8fDE3NTIzMTY5NDh8MA&ixlib=rb-4.1.0&q=85"
    };

    const finalConversation = {
      ...updatedConversation,
      messages: [...updatedConversation.messages, assistantMessage],
      lastMessage: aiResponse.substring(0, 100) + '...'
    };

    setCurrentConversation(finalConversation);
    setConversations(prevConversations => {
      if (currentConversation) {
        return prevConversations.map(conv => 
          conv.id === currentConversation.id ? finalConversation : conv
        );
      } else {
        return [finalConversation, ...prevConversations.slice(1)];
      }
    });

    setIsTyping(false);
  };

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={`h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-white'} transition-colors duration-200`}>
      {/* Overlay for mobile */}
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