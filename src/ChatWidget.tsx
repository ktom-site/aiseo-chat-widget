'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { BusinessForChat, ChatMessage, LeadCapture, WidgetConfig, WidgetMode } from './types';
import { isAfterHours } from './hours';
import { WIDGET_STYLES } from './styles';

const BOOKING_INTENT_RE = /\b(schedule|book|appointment|estimate|callback|send a tech|call me back|talk to (someone|a human))\b/i;

export type ChatWidgetProps = {
  business: BusinessForChat;
  /** Endpoint for the AI conversation. Defaults to `/api/chat`. */
  chatEndpoint?: string;
  /** Endpoint for lead-capture form submission. Defaults to `/api/chat-lead`. */
  leadEndpoint?: string;
  /** Override greeting message shown when widget is opened. */
  initialMessage?: string;
  /** Widget appearance and behavior configuration. */
  config?: WidgetConfig;
};

export function ChatWidget({
  business,
  chatEndpoint = '/api/chat',
  leadEndpoint = '/api/chat-lead',
  initialMessage,
  config = {},
}: ChatWidgetProps) {
  const {
    position = 'bottom-right',
    launcherSize = 'md',
    panelWidth = 24,
    borderRadius = 1,
    pulseOnLoad = true,
    headerGradient = true,
    poweredByText,
    autoOpenDelay = 0,
  } = config;

  const isLeft = position === 'bottom-left';
  const afterHours = useMemo(
    () => isAfterHours(business.contact.hoursStructured),
    [business.contact.hoursStructured]
  );

  const greetingText = initialMessage ?? (afterHours
    ? `Hi! Thanks for reaching out to ${business.name}. We're closed right now, but I can answer questions or grab your details so we'll reach out first thing.`
    : `Hi! I'm the ${business.name} assistant. Ask me about services, pricing, or schedule a free estimate.`
  );

  const initialMessages: ChatMessage[] = useMemo(
    () => [{ role: 'assistant', content: greetingText }],
    [greetingText]
  );

  const quickReplies = useMemo(() => {
    const base = ['What services do you offer?', 'How much for a panel upgrade?'];
    if (business.contact.emergencyAvailable) base.push('I have an emergency');
    base.push('Schedule a free estimate');
    return base;
  }, [business.contact.emergencyAvailable]);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<WidgetMode>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showCaptureCta, setShowCaptureCta] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, open]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    if (text.toLowerCase().includes('schedule') || text.toLowerCase().includes('estimate')) {
      setShowCaptureCta(true);
    }
    const userMsg: ChatMessage = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setSending(true);
    try {
      const res = await fetch(chatEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      const reply: string = data.reply ?? `Sorry, I'm having trouble. Please call ${business.contact.phone}.`;
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      if (BOOKING_INTENT_RE.test(reply) || BOOKING_INTENT_RE.test(text)) {
        setShowCaptureCta(true);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `Sorry, I'm having trouble right now. Please call ${business.contact.phone}.`,
      }]);
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setMessages(initialMessages);
    setMode('chat');
    setShowCaptureCta(false);
    setInput('');
  }

  /* ── auto-open timer ── */
  useEffect(() => {
    if (autoOpenDelay > 0 && !open) {
      const t = setTimeout(() => setOpen(true), autoOpenDelay);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenDelay]);

  const cssVars = {
    '--aiseo-cw-panel-width': `${panelWidth}rem`,
    '--aiseo-cw-radius': `${borderRadius}rem`,
  } as React.CSSProperties;

  const launcherCls = [
    'aiseo-cw-launcher',
    isLeft && 'aiseo-cw-launcher--left',
    launcherSize !== 'md' && `aiseo-cw-launcher--${launcherSize}`,
    pulseOnLoad && !open && 'aiseo-cw-launcher--pulse',
  ].filter(Boolean).join(' ');

  const panelCls = [
    'aiseo-cw-panel',
    isLeft && 'aiseo-cw-panel--left',
  ].filter(Boolean).join(' ');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: WIDGET_STYLES }} />

      <button
        type="button"
        className={launcherCls}
        aria-label={open ? 'Close chat' : 'Open chat'}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {open && (
        <div className={panelCls} role="dialog" aria-label={`${business.name} chat`} style={cssVars}>
          <header className={`aiseo-cw-header${headerGradient ? ' aiseo-cw-header--gradient' : ''}`}>
            <div className="aiseo-cw-avatar">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p className="aiseo-cw-title">{business.name}</p>
              <p className="aiseo-cw-status">
                {afterHours ? "Closed — we'll reply soon" : 'Typically replies instantly'}
              </p>
            </div>
          </header>

          {mode === 'chat' && (
            <ChatBody
              messages={messages}
              sending={sending}
              quickReplies={messages.length === 1 ? quickReplies : []}
              onQuick={(q) => {
                if (q === 'Schedule a free estimate') setMode('capture');
                else send(q);
              }}
              bottomRef={bottomRef}
            />
          )}

          {mode === 'chat' && showCaptureCta && (
            <div className="aiseo-cw-actions">
              <button className="aiseo-cw-cta-primary" onClick={() => setMode('capture')}>
                Schedule estimate
              </button>
              <a className="aiseo-cw-cta-secondary" href={`tel:${business.contact.phoneTel}`} role="button">
                Call {business.contact.phone}
              </a>
            </div>
          )}

          {mode === 'chat' && (
            <form
              className="aiseo-cw-input"
              onSubmit={(e) => { e.preventDefault(); send(input); }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                aria-label="Type a message"
                disabled={sending}
              />
              <button type="submit" className="aiseo-cw-send" disabled={!input.trim() || sending}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          )}

          {mode === 'capture' && (
            <CaptureForm
              business={business}
              conversation={messages}
              endpoint={leadEndpoint}
              onBack={() => setMode('chat')}
              onSubmitted={() => setMode('submitted')}
            />
          )}

          {mode === 'submitted' && (
            <SuccessPanel business={business} onReset={reset} afterHours={afterHours} />
          )}

          {poweredByText && (
            <div className="aiseo-cw-powered">{poweredByText}</div>
          )}
        </div>
      )}
    </>
  );
}

function ChatBody({
  messages,
  sending,
  quickReplies,
  onQuick,
  bottomRef,
}: {
  messages: ChatMessage[];
  sending: boolean;
  quickReplies: string[];
  onQuick: (q: string) => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <div className="aiseo-cw-body">
        {messages.map((m, i) => (
          <div key={i} className={`aiseo-cw-msg ${m.role === 'user' ? 'aiseo-cw-msg-user' : 'aiseo-cw-msg-bot'}`}>
            <div className="aiseo-cw-bubble">{m.content}</div>
          </div>
        ))}
        {sending && (
          <div className="aiseo-cw-msg aiseo-cw-msg-bot">
            <div className="aiseo-cw-bubble">
              <span className="aiseo-cw-typing"><span /><span /><span /></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {quickReplies.length > 0 && (
        <div className="aiseo-cw-quick">
          {quickReplies.map((q) => (
            <button key={q} type="button" onClick={() => onQuick(q)}>{q}</button>
          ))}
        </div>
      )}
    </>
  );
}

function CaptureForm({
  business,
  conversation,
  endpoint,
  onBack,
  onSubmitted,
}: {
  business: BusinessForChat;
  conversation: ChatMessage[];
  endpoint: string;
  onBack: () => void;
  onSubmitted: () => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState(business.services?.[0]?.title ?? 'General electrical');
  const [urgency, setUrgency] = useState<LeadCapture['urgency']>('this-week');
  const [zip, setZip] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone are required.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: LeadCapture = {
        name: name.trim(),
        phone: phone.trim(),
        serviceType,
        urgency,
        zip: zip.trim() || undefined,
        note: note.trim() || undefined,
        pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        capturedAt: new Date().toISOString(),
        conversation,
      };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      onSubmitted();
    } catch {
      setError('Could not submit. Please call ' + business.contact.phone + ' directly.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="aiseo-cw-form" onSubmit={onSubmit}>
      <button type="button" className="aiseo-cw-back" onClick={onBack}>← Back to chat</button>
      <h3 className="aiseo-cw-form-title">Get a free estimate</h3>
      <p className="aiseo-cw-form-sub">We'll reach out to set up a time. No spam, ever.</p>

      <div className="aiseo-cw-field">
        <label className="aiseo-cw-label" htmlFor="aiseo-cw-name">Your name *</label>
        <input id="aiseo-cw-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="aiseo-cw-field">
        <label className="aiseo-cw-label" htmlFor="aiseo-cw-phone">Phone *</label>
        <input id="aiseo-cw-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div className="aiseo-cw-field">
        <label className="aiseo-cw-label" htmlFor="aiseo-cw-service">Service needed</label>
        <select id="aiseo-cw-service" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
          {(business.services ?? []).map((s) => (
            <option key={s.slug ?? s.title} value={s.title}>{s.title}</option>
          ))}
          <option value="Other / Not sure">Other / Not sure</option>
        </select>
      </div>
      <div className="aiseo-cw-field">
        <label className="aiseo-cw-label" htmlFor="aiseo-cw-urgency">When do you need it?</label>
        <select id="aiseo-cw-urgency" value={urgency} onChange={(e) => setUrgency(e.target.value as LeadCapture['urgency'])}>
          {business.contact.emergencyAvailable && <option value="emergency">Emergency — ASAP</option>}
          <option value="today">Today / this evening</option>
          <option value="this-week">This week</option>
          <option value="flexible">Flexible / just exploring</option>
        </select>
      </div>
      <div className="aiseo-cw-field">
        <label className="aiseo-cw-label" htmlFor="aiseo-cw-zip">ZIP (optional)</label>
        <input id="aiseo-cw-zip" type="text" inputMode="numeric" pattern="\d{5}" value={zip} onChange={(e) => setZip(e.target.value)} />
      </div>
      <div className="aiseo-cw-field">
        <label className="aiseo-cw-label" htmlFor="aiseo-cw-note">Anything else? (optional)</label>
        <textarea id="aiseo-cw-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {error && <p className="aiseo-cw-error">{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Sending…' : 'Send request'}
      </button>
    </form>
  );
}

function SuccessPanel({
  business,
  afterHours,
  onReset,
}: {
  business: BusinessForChat;
  afterHours: boolean;
  onReset: () => void;
}) {
  return (
    <div className="aiseo-cw-success">
      <div className="aiseo-cw-success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3>Thanks! We got it.</h3>
      <p>
        {afterHours
          ? `We're closed right now — we'll reach out first thing in the morning. For active hazards, call ${business.contact.phone}.`
          : `We'll text or call you within 1 business hour.`}
      </p>
      <button className="aiseo-cw-cta-secondary" type="button" onClick={onReset} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
        Send another message
      </button>
    </div>
  );
}
