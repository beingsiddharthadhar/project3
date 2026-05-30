/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Bot, User, CornerDownLeft, Volume2, Mic, ArrowRight, ShoppingBag } from 'lucide-react';
import { MenuItem } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  recommendedItems?: {
    restaurantId: string;
    restaurantName: string;
    itemId: string;
    itemName: string;
    price: number;
    reason: string;
  }[];
  suggestedAction?: string;
}

interface AIAssistantProps {
  onAddSuggestedToCart: (restaurantId: string, item: Partial<MenuItem>) => void;
  userDietary: string;
  userBudget: number;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export default function AIAssistant({ 
  onAddSuggestedToCart, 
  userDietary, 
  userBudget, 
  initialPrompt, 
  onClearInitialPrompt 
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Merhaba! Assalamu Alaikum! I am **SmartBite AI**, your elite UAE food-tech concierge. 🇦🇪\n\nHow can I delicious-ify your day? I can craft dynamic combos, locate vegan options, or instantly queue local fast food under budget (e.g. delicious items under AED 40!). Try asking:\n\n* **'I want a spicy chicken burger under AED 40 near me'**\n* **'Recommend healthy dinner combos for family'**\n* **'Find vegetarian spots in Dubai Marina'**",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Quick prompt presets
  const presets = [
    "Order spicy chicken burger under AED 40",
    "Suggest healthy dinner options",
    "Find vegetarian restaurants nearby",
    "Explain my loyalty point rewards"
  ];

  // Auto-fill and send on initial prompt triggers
  useEffect(() => {
    if (initialPrompt) {
      handleSendPrompt(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      // Compile standard chat history
      const compiledHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: compiledHistory.slice(-6), // Send last 6 messages
          userPreferences: {
            dietary: userDietary,
            max_budget: userBudget
          }
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error status');
      }

      const data = await response.json();

      const aiMsg: Message = {
        id: `msg-${Date.now()}-ai`,
        sender: 'assistant',
        text: data.textMessage || 'I apologize, something went wrong formatting the menu context.',
        timestamp: new Date(),
        recommendedItems: data.recommendedItems,
        suggestedAction: data.suggestedAction
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat AI failure:', err);
      // Fallback
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-ai-err`,
        sender: 'assistant',
        text: 'I ran into a connection glitch while processing our food-tech server. Please check your credentials or retry! I can suggest a local Arabic Mezze combo or spicy burger in the meantime.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Simulate voice recognitions
      setTimeout(() => {
        setInputMessage("I want a spicy chicken burger under AED 40 near me");
        setIsListening(false);
      }, 2500);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="brand-gradient px-6 py-4 flex items-center justify-between text-white shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold font-display text-base leading-tight">SmartBite Conversational AI</h3>
            <p className="text-[10px] text-orange-100 font-mono tracking-wide">ACTIVE AUTONOMOUS ORDER CONCIERGE</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono uppercase bg-white/10 px-2 py-0.5 rounded-md text-orange-50 font-bold">GEMINI FLASH 3.5</span>
        </div>
      </div>

      {/* Messages Stage */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/40">
        {messages.map((m) => {
          const isAi = m.sender === 'assistant';
          return (
            <div key={m.id} className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}>
              {isAi && (
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              
              <div className="max-w-[85%] flex flex-col gap-1.5">
                {/* Text Bubble */}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isAi 
                    ? 'bg-white text-zinc-900 rounded-tl-none border border-zinc-150/50' 
                    : 'brand-gradient text-white rounded-tr-none'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>

                {/* Structured Interactive Custom Recommended Items Card */}
                {isAi && m.recommendedItems && m.recommendedItems.length > 0 && (
                  <div className="mt-2.5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200/60 p-4 shadow-sm">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-orange-850 tracking-wide uppercase mb-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
                      SmartBite Order Match Found
                    </div>
                    {m.recommendedItems.map((rec, rIdx) => (
                      <div key={rIdx} className="bg-white/80 rounded-lg p-3 border border-orange-100/40 mb-2 last:mb-0">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h4 className="text-xs font-bold text-zinc-950 font-display">{rec.itemName}</h4>
                            <p className="text-[10px] text-zinc-400">from {rec.restaurantName}</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-orange-700 bg-orange-100/50 px-2 py-0.5 rounded">
                            AED {rec.price}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 italic mb-2">"{rec.reason}"</p>
                        <button
                          id={`btn-add-rec-${rec.itemId}`}
                          onClick={() => onAddSuggestedToCart(rec.restaurantId, {
                            id: rec.itemId,
                            name: rec.itemName,
                            price: rec.price,
                            calories: 620,
                            category: rec.itemName.toLowerCase().includes('burger') ? 'Burgers' : 'Arabic'
                          })}
                          className="w-full brand-gradient hover:brand-gradient-hover text-white text-xs font-bold py-1.5 px-3 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Add Suggeestion To Cart & Checkout
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <span className={`text-[10px] text-zinc-400 font-mono ${isAi ? 'text-left' : 'text-right'}`}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-sm font-bold text-xs uppercase font-display">
                  Me
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-colors shadow-sm">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-white border border-zinc-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs font-medium text-zinc-400 font-mono tracking-wide ml-1.5">SmartBite AI thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Preset Suggestions Quick Row */}
      <div className="px-6 py-2 bg-zinc-100/50 border-t border-zinc-100 flex gap-2 overflow-x-auto whitespace-nowrap">
        {presets.map((pr, pIdx) => (
          <button
            key={pIdx}
            id={`preset-prompt-${pIdx}`}
            onClick={() => handleSendPrompt(pr)}
            className="px-3 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-full text-xs font-semibold font-display text-zinc-700 transition-all flex items-center gap-1 shrink-0 shadow-sm"
          >
            {pr} <ArrowRight className="w-3 h-3 text-zinc-400" />
          </button>
        ))}
      </div>

      {/* Bottom Panel controls */}
      <div className="p-4 bg-white border-t border-zinc-100">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(inputMessage);
          }}
          className="flex items-center gap-2"
        >
          {/* Micro Voice Simulation */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'bg-zinc-100 text-zinc-650 hover:bg-zinc-200'
            }`}
            title="Simulate Voice Input"
          >
            <Mic className="w-4 h-4" />
          </button>

          <div className="flex-1 relative flex items-center">
            <input
              id="ai-chatbot-input"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isListening ? "Listening simulated speech..." : "Message SmartBite AI Assistant (e.g. delicious items under AED 40)..."}
              disabled={loading}
              className="w-full text-sm font-sans pl-4 pr-10 py-3 bg-zinc-50 hover:bg-zinc-100 focus:bg-white rounded-xl border border-zinc-200 focus:border-orange-500 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className={`absolute right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                inputMessage.trim() && !loading 
                  ? 'bg-orange-600 text-white' 
                  : 'text-zinc-300 pointer-events-none'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
        {isListening && (
          <div className="mt-2 text-[10px] text-center font-mono text-rose-500 font-bold tracking-widest animate-pulse">
            🔊 VOICE CAPTURING ACTIVE: OVERRIDING INPUT WITH AED 40 BURGER DEMAND
          </div>
        )}
      </div>
    </div>
  );
}
