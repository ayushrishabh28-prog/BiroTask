'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { answer, type Knowledge } from '@/lib/bots';

type ChatMessage = {
  role: 'bot' | 'user';
  text: string;
  source?: string;
};

export function TemplateChat({
  businessName,
  knowledge,
  businessId,
}: {
  businessName: string;
  knowledge: Knowledge;
  businessId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: `Hi! I’m the ${businessName} assistant. Ask me about our hours, services, or common questions.`,
    },
  ]);

  const suggestions = [
    'What are your opening hours?',
    knowledge.rules[0]?.trigger,
    knowledge.rules[1]?.trigger,
  ].filter((value, index, list): value is string => Boolean(value) && list.indexOf(value) === index).slice(0, 3);

  const [sending, setSending] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  async function send(rawQuestion: string) {
    const value = rawQuestion.trim();
    if (!value || sending) return;
    setSending(true);
    setMessages((current) => [...current, { role: 'user', text: value }]);
    setQuestion('');
    let reply;
    if (businessId) {
      try {
        const response = await fetch('/api/public-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId, question: value }),
        });
        const result = await response.json() as { text?: string; source?: string; error?: string };
        if (!response.ok || !result.text) throw new Error(result.error || 'Could not reach the trained bot.');
        reply = { text: result.text, source: result.source };
      } catch (cause) {
        reply = { text: cause instanceof Error ? cause.message : 'Could not reach the trained bot.', source: 'BotFoundry workspace' };
      }
    } else {
      reply = answer(knowledge, value);
    }
    setMessages((current) => [
      ...current,
      { role: 'bot', text: reply.text, source: reply.source },
    ]);
    setSending(false);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    send(question);
  }

  return (
    <aside className="demo-chat" aria-label={`${businessName} chatbot`}>
      {open && (
        <section className="demo-chat-window" role="dialog" aria-label={`Chat with ${businessName}`}>
          <header>
            <span className="demo-chat-avatar"><Bot size={20} /></span>
            <div>
              <strong>{businessName}</strong>
              <small><span /> Online · Demo assistant</small>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chatbot"><X size={19} /></button>
          </header>
          <div className="demo-chat-history" aria-live="polite" aria-busy={sending} ref={historyRef}>
            {messages.map((message, index) => (
              <div className={`demo-chat-message ${message.role}`} key={`${message.role}-${index}`}>
                <p>{message.text}</p>
                {message.source && <small>{message.source}</small>}
              </div>
            ))}
          </div>
          {messages.length === 1 && (
            <div className="demo-chat-suggestions">
              {suggestions.map((suggestion) => (
                <button key={suggestion} onClick={() => send(suggestion)}>{suggestion}</button>
              ))}
            </div>
          )}
          <form onSubmit={submit}>
            <input
              aria-label="Message the business chatbot"
              maxLength={500}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Type a question…"
              value={question}
            />
            <button aria-label="Send message" disabled={sending || !question.trim()}><Send size={17} /></button>
          </form>
          <footer>{businessId ? 'Using your latest BotFoundry training' : 'Demo chatbot powered by BotFoundry'}</footer>
        </section>
      )}
      <button
        className="demo-chat-launcher"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={21} /> : <MessageCircle size={21} />}
        <span>{open ? 'Close chat' : 'Chat with us'}</span>
      </button>
      {!open && <span className="demo-chat-caption">This is where your customer chatbot lives</span>}
    </aside>
  );
}
