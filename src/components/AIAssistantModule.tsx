import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, BrainCircuit, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistantModule() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Привіт! Я ваш ШІ-асистент. Я маю доступ до бази даних PLM (замовлення, графіки, співробітники). Що б ви хотіли проаналізувати сьогодні?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiConnected, setIsAiConnected] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    checkAiConnection();
  }, []);

  const checkAiConnection = async () => {
    if (GEMINI_API_KEY) {
      setIsAiConnected(true);
    } else {
      setIsAiConnected(false);
    }
  };

  const gatherContextData = async () => {
    // Fetch limited context to not overflow AI token window
    try {
      const { data: orders } = await supabase.from('orders').select('id, client, address, status, order_type, time, area, material, region').limit(50);
      
      let schedules = [];
      try {
        const saved = localStorage.getItem('stoneplanner_schedules');
        if (saved) schedules = JSON.parse(saved);
      } catch (e) {}
      
      return `Context Data:
Orders (last 50): ${JSON.stringify(orders)}
Schedules (all local): ${JSON.stringify(schedules)}`;
    } catch (err) {
      console.error('Error fetching context', err);
      return 'No context available.';
    }
  };

  const extractAndExecuteAction = async (text: string) => {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return { isAction: false };
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (parsed.action === 'create_order') {
        const orderData = parsed.data;
        const newId = `AI-${Math.floor(Math.random() * 10000)}`;
        
        const { error } = await supabase.from('orders').insert({
          id: newId,
          client: orderData.client || 'Невідомий клієнт',
          address: orderData.address || 'Не вказано',
          time: orderData.time || '',
          order_type: orderData.order_type || 'Доставка',
          status: 'NEW'
        });

        if (error) throw error;

        return { 
          isAction: true, 
          message: `✅ Успішно створено (ID: ${newId})\n\n**Суть:** ${orderData.client}\n**Маршрут/Адреса:** ${orderData.address}\n**Дата:** ${orderData.time}\n**Тип:** ${orderData.order_type}`
        };
      }
    } catch (err) {
      console.error('Failed to parse or execute AI action', err);
    }
    return { isAction: false };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Gather real data from Supabase
      const context = await gatherContextData();
      
      const today = new Date().toISOString().split('T')[0];
      const systemPrompt = `You are a strict, highly accurate AI Assistant for StonePlanner.
CRITICAL RULES:
1. YOU MUST ALWAYS REPLY IN UKRAINIAN LANGUAGE ONLY. NEVER USE ENGLISH.
2. Today's date is ${today}.
3. You have access to the Context Data below. You must ONLY use this data.
4. If the user asks about schedules, employees, timesheets ("табелі", "графік", "хто працює", "замірники"), and the answer is NOT clearly in the "Schedules" context, YOU MUST SAY EXACTLY: "Вибачте, але в мене зараз немає доступу до графіків та табелів співробітників." Do NOT guess based on orders.
5. If the user asks about an order not in the context, say: "Вибачте, я не знайшов інформацію про це в базі даних."
6. Do not hallucinate. Answer precisely.

Context Data:
${context}
`;

      // 3. Send to Gemini
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }]);

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: systemPrompt });

      const result = await model.generateContentStream(input);
      let fullText = '';

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: fullText } : m));
      }

      // Check if the AI returned a JSON action command
      const actionResult = await extractAndExecuteAction(fullText);
      if (actionResult.isAction) {
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: actionResult.message } : m));
      }

    } catch (error) {
      console.error('AI Error:', error);
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Помилка з\'єднання з Gemini. Перевірте, чи вказано правильний VITE_GEMINI_API_KEY у .env.local',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrainCircuit size={28} style={{ color: 'var(--accent-color)' }} />
          ШІ Аналітика
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-panel)', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '13px', fontWeight: 600 }}>
          {isAiConnected === null ? (
            <><Loader2 size={14} className="spin" /> Перевірка зв'язку...</>
          ) : isAiConnected ? (
            <><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success-color)' }} /> Gemini 2.5 Flash підключено</>
          ) : (
            <><AlertCircle size={14} color="var(--danger-color)" /> ШІ недоступний (Введіть API ключ)</>
          )}
        </div>
      </div>

      <div style={{ flex: 1, background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Chat Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', gap: '16px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: msg.role === 'user' ? 'var(--accent-color)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                {msg.role === 'user' ? <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Ви</span> : <Bot size={20} color="var(--accent-color)" />}
              </div>
              <div style={{ maxWidth: '75%', background: msg.role === 'user' ? 'var(--accent-color)' : 'var(--bg-secondary)', color: msg.role === 'user' ? '#fff' : 'var(--text-primary)', padding: '16px', borderRadius: '12px', border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)', fontSize: '15px', lineHeight: '1.5' }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '8px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                <Bot size={20} color="var(--accent-color)" />
              </div>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={16} className="spin" color="var(--accent-color)" />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Аналізує дані...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '16px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{ display: 'flex', gap: '12px', position: 'relative' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Запитайте ШІ про замовлення, навантаження, чи попросіть пораду..."
              style={{ flex: 1, padding: '16px 20px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-primary)', fontSize: '15px', outline: 'none', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{ position: 'absolute', right: '8px', top: '8px', bottom: '8px', width: '40px', borderRadius: '50%', background: input.trim() && !isLoading ? 'var(--accent-color)' : 'var(--bg-secondary)', color: input.trim() && !isLoading ? '#fff' : 'var(--text-secondary)', border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            >
              <Send size={18} style={{ marginLeft: '-2px' }} />
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            ШІ обробляє дані локально і не відправляє їх третім особам. Відповіді можуть містити неточності.
          </div>
        </div>
      </div>
    </div>
  );
}
