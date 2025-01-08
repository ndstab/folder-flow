import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Bot, User, Loader2, FolderOpen } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  files?: { name: string; type: string }[];
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! You can send messages or drop folders here.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = async (fileList: FileList) => {
    const files: { name: string; type: string }[] = Array.from(fileList).map(file => ({
      name: file.name,
      type: file.type || 'folder'
    }));

    if (files.length > 0) {
      const userMessage = {
        id: Date.now(),
        text: `Uploaded ${files.length} file(s)`,
        sender: 'user' as const,
        files
      };
      setMessages(prev => [...prev, userMessage]);

      setIsTyping(true);
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: `Received ${files.length} file(s). Here's what I found:`,
          sender: 'bot' as const
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    setIsTyping(true);
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: "Thanks for your message! This is a demo response from the chatbot.",
        sender: 'bot' as const
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="text-white h-6 w-6" />
            <h1 className="text-xl font-semibold text-white">AI Assistant</h1>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              webkitdirectory=""
              directory=""
              multiple
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <FolderOpen className="h-5 w-5" />
              <span>Choose Folder</span>
            </button>
          </div>
        </div>

        <div 
          className={`h-[600px] overflow-y-auto p-4 space-y-4 relative ${
            isDragging ? 'bg-indigo-50' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 bg-indigo-50 bg-opacity-90 flex items-center justify-center">
              <div className="text-center">
                <FolderOpen className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-indigo-600">Drop folder here</p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.sender === 'bot'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-indigo-600 text-white'
                } p-4 rounded-2xl ${
                  message.sender === 'bot' ? 'rounded-tl-none' : 'rounded-tr-none'
                } animate-fade-in`}
              >
                {message.sender === 'bot' ? (
                  <Bot className="h-6 w-6 flex-shrink-0" />
                ) : (
                  <User className="h-6 w-6 flex-shrink-0" />
                )}
                <div>
                  <p className="leading-relaxed">{message.text}</p>
                  {message.files && (
                    <div className="mt-2 space-y-1">
                      {message.files.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm opacity-90">
                          <FolderOpen className="h-4 w-4" />
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none animate-fade-in flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-gray-600">Typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message or drop a folder..."
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
            >
              <SendHorizontal className="h-5 w-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;