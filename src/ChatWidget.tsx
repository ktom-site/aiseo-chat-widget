'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { BusinessForChat, ChatMessage, LeadCapture, BookingData, BookingIssue, BookingTimeSlot, WidgetConfig, WidgetMode } from './types';
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

/* ───────── Icons ───────── */
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const AiIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '1.375rem', height: '1.375rem' }}>
    <circle cx="12" cy="12" r="10" opacity="0.2" />
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor">AI</text>
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);
const BoltIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
  </svg>
);

type PanelView = 'home' | 'chat' | 'capture' | 'submitted' | 'booking';

/* ───────── Booking icons ───────── */
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/* ───────── Default electrician issues ───────── */
const DEFAULT_ELECTRICAL_ISSUES: BookingIssue[] = [
  { label: 'Outlet Not Working' },
  { label: 'Light Fixture Not Working' },
  { label: 'Light Switch Not Working' },
  { label: 'Light Fixture Flickering' },
  { label: 'Ceiling Fan Not Working' },
  { label: 'Breaker Tripping' },
  { label: 'Breaker Making Noise' },
  { label: 'Breaker Overheating' },
  { label: 'Panel Upgrade Needed' },
  { label: 'EV Charger Installation' },
  { label: 'Generator Installation' },
  { label: 'Whole Home Rewiring' },
  { label: 'Outdoor/Landscape Lighting' },
  { label: 'Smoke Detector Install' },
  { label: 'Other' },
];

/** Generate time slots for the next N business days based on hours */
function generateTimeSlots(hours?: Record<string, string>, count = 6): BookingTimeSlot[] {
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const slots: BookingTimeSlot[] = [];
  const now = new Date();
  const d = new Date(now);
  // Start from tomorrow if it's after noon
  if (now.getHours() >= 12) d.setDate(d.getDate() + 1);

  let daysChecked = 0;
  while (slots.length < count && daysChecked < 30) {
    const key = dayKeys[d.getDay()];
    const h = hours?.[key];
    if (h && h !== 'closed') {
      const [open, close] = h.split('-');
      const openH = parseInt(open.split(':')[0], 10);
      const closeH = parseInt(close.split(':')[0], 10);
      const dateStr = `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`;
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      // Morning slot
      if (openH < 12 && closeH > openH) {
        const endH = Math.min(12, closeH);
        slots.push({
          date: dateStr,
          dateISO: iso,
          startTime: formatHour(openH),
          endTime: formatHour(endH),
          label: `${dateStr}, ${formatHour(openH)} - ${formatHour(endH)}`,
        });
      }
      // Afternoon slot
      if (closeH > 12) {
        const startH = Math.max(12, openH);
        slots.push({
          date: dateStr,
          dateISO: iso,
          startTime: formatHour(startH),
          endTime: formatHour(closeH),
          label: `${dateStr}, ${formatHour(startH)} - ${formatHour(closeH)}`,
        });
      }
    }
    d.setDate(d.getDate() + 1);
    daysChecked++;
  }
  return slots;
}

function formatHour(h: number): string {
  if (h === 0 || h === 24) return '12:00 AM';
  if (h === 12) return '12:00 PM';
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
}

export function ChatWidget({
  business,
  chatEndpoint = '/api/chat',
  leadEndpoint = '/api/chat-lead',
  initialMessage,
  config = {},
}: ChatWidgetProps) {
  const {
    branding = {},
    greeting,
    panelHeading = 'How can we help?',
    callLabel = 'Call Me',
    emailLabel = 'Email Us',
    chatLabel = 'Chat with Us',
    chatPlaceholder = 'Chat with us—just start typing.',
    poweredByText,
    panelWidth = 24,
    bookLabel = 'Book Online',
    bookingEndpoint = '/api/booking',
  } = config;

  const {
    logoUrl,
    logoAlt = business.name,
    primaryColor = '#3b82f6',
    secondaryColor,
    primaryFg = '#ffffff',
    accentColor,
  } = branding;

  const derivedSecondary = secondaryColor || darkenHex(primaryColor, 0.35);
  const derivedAccent = accentColor || primaryColor;

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

  const [panelOpen, setPanelOpen] = useState(false);
  const [view, setView] = useState<PanelView>('home');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [homeInput, setHomeInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showCaptureCta, setShowCaptureCta] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Greeting bubble timer
  useEffect(() => {
    if (greeting && !panelOpen) {
      const delay = greeting.delay ?? 2000;
      const t = setTimeout(() => setShowGreeting(true), delay);
      return () => clearTimeout(t);
    }
    if (panelOpen) setShowGreeting(false);
  }, [greeting, panelOpen]);

  // Listen for external "open booking" event (e.g. from Navbar button)
  useEffect(() => {
    const handler = () => { setPanelOpen(true); setView('booking'); };
    window.addEventListener('aiseo-cw-open-booking', handler);
    return () => window.removeEventListener('aiseo-cw-open-booking', handler);
  }, []);

  useEffect(() => {
    if (panelOpen && view === 'chat') bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, panelOpen, view]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    if (text.toLowerCase().includes('schedule') || text.toLowerCase().includes('estimate')) {
      setShowCaptureCta(true);
    }
    const userMsg: ChatMessage = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setHomeInput('');
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
    setView('home');
    setShowCaptureCta(false);
    setInput('');
    setHomeInput('');
  }

  function openPanel(targetView?: PanelView) {
    setPanelOpen(true);
    if (targetView) setView(targetView);
  }

  const cssVars = {
    '--aiseo-cw-primary': primaryColor,
    '--aiseo-cw-primary-fg': primaryFg,
    '--aiseo-cw-secondary': derivedSecondary,
    '--aiseo-cw-accent': derivedAccent,
    '--aiseo-cw-panel-width': `${panelWidth}rem`,
  } as React.CSSProperties;

  return (
    <div style={cssVars}>
      <style dangerouslySetInnerHTML={{ __html: WIDGET_STYLES }} />

      {/* ── Collapsed: Bottom Bar + Greeting ── */}
      {!panelOpen && (
        <>
          {/* Greeting bubble */}
          {showGreeting && greeting && (
            <div className="aiseo-cw-greeting">
              <p className="aiseo-cw-greeting-title">{greeting.title}</p>
              <p className="aiseo-cw-greeting-sub">{greeting.subtitle}</p>
              {greeting.dismissable !== false && (
                <button className="aiseo-cw-greeting-close" onClick={() => setShowGreeting(false)} aria-label="Dismiss">&times;</button>
              )}
            </div>
          )}

          {/* Bottom bar */}
          <div className="aiseo-cw-bar">
            <button className="aiseo-cw-bar-tab aiseo-cw-bar-tab--connect" onClick={() => openPanel('home')}>
              <AiIcon />
              Connect
            </button>
            <a className="aiseo-cw-bar-tab" href={`tel:${business.contact.phoneTel}`}>
              <PhoneIcon />
              Call
            </a>
            <button className="aiseo-cw-bar-tab" onClick={() => openPanel('booking')}>
              <CalendarIcon />
              Book
            </button>
            <button className="aiseo-cw-bar-tab" onClick={() => openPanel('chat')}>
              <ChatIcon />
              Chat
            </button>
          </div>
        </>
      )}

      {/* ── Expanded: Panel ── */}
      {panelOpen && (
        <div className="aiseo-cw-panel" role="dialog" aria-label={`${business.name} chat`}>
          {/* Panel Header */}
          <div className="aiseo-cw-panel-header">
            {logoUrl ? (
              <img src={logoUrl} alt={logoAlt} className="aiseo-cw-panel-logo" />
            ) : (
              <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{business.name}</span>
            )}
            <div className="aiseo-cw-panel-controls">
              <button className="aiseo-cw-panel-btn" onClick={() => { setPanelOpen(false); setView('home'); }} aria-label="Close">
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Home View */}
          {view === 'home' && (
            <>
              <div className="aiseo-cw-home">
                <h2 className="aiseo-cw-home-heading">{panelHeading}</h2>

                {/* Book Online — full width, prominent */}
                <button className="aiseo-cw-card-full aiseo-cw-card-full--book" onClick={() => setView('booking')}>
                  <CalendarIcon />
                  {bookLabel}
                </button>

                {/* Call + Chat — side by side */}
                <div className="aiseo-cw-card-row">
                  <a className="aiseo-cw-card-half aiseo-cw-card-half--email" href={`tel:${business.contact.phoneTel}`}>
                    <PhoneIcon />
                    {callLabel}
                  </a>
                  <button className="aiseo-cw-card-half aiseo-cw-card-half--chat" onClick={() => setView('chat')}>
                    <ChatIcon />
                    {chatLabel}
                  </button>
                </div>

                {/* AI Chat input */}
                <div className="aiseo-cw-ai-section">
                  <p className="aiseo-cw-ai-label">
                    Chat with {business.name} <span className="aiseo-cw-ai-badge">AI</span>
                  </p>
                  <form className="aiseo-cw-ai-input-wrap" onSubmit={(e) => {
                    e.preventDefault();
                    if (homeInput.trim()) {
                      send(homeInput);
                      setView('chat');
                    }
                  }}>
                    <input
                      type="text"
                      value={homeInput}
                      onChange={(e) => setHomeInput(e.target.value)}
                      placeholder={chatPlaceholder}
                    />
                    <button type="submit" className="aiseo-cw-ai-send" aria-label="Send">
                      <SendIcon />
                    </button>
                  </form>
                </div>
              </div>

              {/* Footer */}
              <div className="aiseo-cw-panel-footer">
                <button aria-label="Menu" onClick={() => setView('capture')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                {poweredByText && <span style={{ fontSize: '0.625rem', color: '#94a3b8' }}>{poweredByText}</span>}
              </div>
            </>
          )}

          {/* Chat View */}
          {view === 'chat' && (
            <>
              <div className="aiseo-cw-chat-header">
                <button
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.25rem' }}
                  onClick={() => setView('home')}
                  aria-label="Back"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '1.25rem', height: '1.25rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="aiseo-cw-chat-avatar">
                  <BoltIcon />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="aiseo-cw-chat-title">{business.name}</p>
                  <p className="aiseo-cw-chat-status">
                    {afterHours ? "Closed — we'll reply soon" : 'Typically replies instantly'}
                  </p>
                </div>
              </div>

              <ChatBody
                messages={messages}
                sending={sending}
                quickReplies={messages.length === 1 ? quickReplies : []}
                onQuick={(q) => {
                  if (q === 'Schedule a free estimate') setView('capture');
                  else send(q);
                }}
                bottomRef={bottomRef}
              />

              {showCaptureCta && (
                <div className="aiseo-cw-actions">
                  <button className="aiseo-cw-cta-primary" onClick={() => setView('capture')}>
                    Schedule estimate
                  </button>
                  <a className="aiseo-cw-cta-secondary" href={`tel:${business.contact.phoneTel}`} role="button">
                    Call {business.contact.phone}
                  </a>
                </div>
              )}

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
                  <SendIcon />
                </button>
              </form>
            </>
          )}

          {/* Booking Flow */}
          {view === 'booking' && (
            <BookingFlow
              business={business}
              endpoint={bookingEndpoint}
              logoUrl={logoUrl}
              logoAlt={logoAlt}
              onBack={() => setView('home')}
              onSubmitted={() => setView('submitted')}
            />
          )}

          {/* Capture Form */}
          {view === 'capture' && (
            <CaptureForm
              business={business}
              conversation={messages}
              endpoint={leadEndpoint}
              onBack={() => setView('chat')}
              onSubmitted={() => setView('submitted')}
            />
          )}

          {/* Success */}
          {view === 'submitted' && (
            <SuccessPanel business={business} onReset={reset} afterHours={afterHours} />
          )}
        </div>
      )}
    </div>
  );
}

/* ───────── Sub-components ───────── */

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
      <button type="button" className="aiseo-cw-back" onClick={onBack}>&larr; Back to chat</button>
      <h3 className="aiseo-cw-form-title">Get a free estimate</h3>
      <p className="aiseo-cw-form-sub">We&apos;ll reach out to set up a time. No spam, ever.</p>

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
          {business.contact.emergencyAvailable && <option value="emergency">Emergency &mdash; ASAP</option>}
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
      <button
        className="aiseo-cw-cta-secondary"
        type="button"
        onClick={onReset}
        style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', border: `1px solid var(--aiseo-cw-primary, #3b82f6)`, background: '#fff', color: 'var(--aiseo-cw-primary, #3b82f6)', fontWeight: 600, fontFamily: 'inherit' }}
      >
        Send another message
      </button>
    </div>
  );
}

/* ───────── Booking Flow ───────── */

type BookingStep = 'issue' | 'timeslot' | 'contact' | 'summary';

function BookingFlow({
  business,
  endpoint,
  logoUrl,
  logoAlt,
  onBack,
  onSubmitted,
}: {
  business: BusinessForChat;
  endpoint: string;
  logoUrl?: string;
  logoAlt?: string;
  onBack: () => void;
  onSubmitted: () => void;
}) {
  const [step, setStep] = useState<BookingStep>('issue');
  const [selectedService, setSelectedService] = useState(business.services?.[0]?.title ?? 'General Electrical');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [otherDescription, setOtherDescription] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<BookingTimeSlot | null>(null);
  const [slotMode, setSlotMode] = useState<'first' | 'all'>('first');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [consentContact, setConsentContact] = useState(false);
  const [consentSms, setConsentSms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOther = selectedIssue === 'Other';

  const issues = business.bookingIssues?.[selectedService] ?? DEFAULT_ELECTRICAL_ISSUES;
  const timeSlots = useMemo(
    () => generateTimeSlots(business.contact.hoursStructured as Record<string, string> | undefined, 8),
    [business.contact.hoursStructured]
  );
  const displayedSlots = slotMode === 'first' ? timeSlots.slice(0, 4) : timeSlots;

  async function onSubmit() {
    setError(null);
    if (!firstName.trim() || !phone.trim() || !email.trim() || !zip.trim()) {
      setError('First name, phone, email, and ZIP code are required.');
      return;
    }
    if (!consentContact) {
      setError('Please agree to be contacted.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: BookingData = {
        serviceType: selectedService,
        issue: isOther ? `Other: ${otherDescription.trim()}` : selectedIssue,
        timeSlot: selectedSlot!,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        zip: zip.trim(),
        consentContact,
        consentSms,
        pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        capturedAt: new Date().toISOString(),
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

  const stepBack = () => {
    if (step === 'summary') setStep('contact');
    else if (step === 'contact') setStep('timeslot');
    else if (step === 'timeslot') setStep('issue');
    else onBack();
  };

  return (
    <div className="aiseo-cw-booking">
      {/* Booking Header — logo + company name */}
      <div className="aiseo-cw-booking-header">
        {logoUrl ? (
          <img src={logoUrl} alt={logoAlt ?? business.name} className="aiseo-cw-booking-logo" />
        ) : (
          <span className="aiseo-cw-booking-header-title">{business.name}</span>
        )}
        <span className="aiseo-cw-booking-header-sub">Book Online Now!</span>
        <button className="aiseo-cw-booking-close" onClick={onBack} aria-label="Close">
          <CloseIcon />
        </button>
      </div>

      {/* Progress bar with back button */}
      <div className="aiseo-cw-booking-progress">
        {step !== 'issue' && (
          <button className="aiseo-cw-booking-progress-back" onClick={stepBack} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '1rem', height: '1rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="aiseo-cw-booking-dots">
          {(['issue', 'timeslot', 'contact', 'summary'] as BookingStep[]).map((s, i) => (
            <div key={s} className={`aiseo-cw-booking-dot ${step === s ? 'active' : ''} ${(['issue', 'timeslot', 'contact', 'summary'].indexOf(step) > i) ? 'done' : ''}`} />
          ))}
        </div>
      </div>

      <div className="aiseo-cw-booking-body">
        {/* Step 1: Issue Selection */}
        {step === 'issue' && (
          <>
            {/* Service selector */}
            {(business.services?.length ?? 0) > 1 && (
              <div className="aiseo-cw-booking-services">
                {business.services!.map((s) => (
                  <button
                    key={s.slug ?? s.title}
                    className={`aiseo-cw-booking-service ${selectedService === s.title ? 'active' : ''}`}
                    onClick={() => { setSelectedService(s.title); setSelectedIssue(''); }}
                  >
                    <BoltIcon />
                    <span>{s.shortTitle ?? s.title}</span>
                  </button>
                ))}
              </div>
            )}

            <h3 className="aiseo-cw-booking-step-title">What type of service can we help you with today?</h3>
            <div className="aiseo-cw-booking-issues">
              {issues.map((issue) => (
                <button
                  key={issue.label}
                  className={`aiseo-cw-booking-tag ${selectedIssue === issue.label ? 'active' : ''}`}
                  onClick={() => { setSelectedIssue(issue.label); if (issue.label !== 'Other') setOtherDescription(''); }}
                >
                  {issue.label}
                </button>
              ))}
            </div>

            {/* Description field when "Other" is selected */}
            {isOther && (
              <div className="aiseo-cw-field" style={{ marginTop: '0.75rem' }}>
                <label className="aiseo-cw-label">Please describe your issue *</label>
                <textarea
                  rows={3}
                  value={otherDescription}
                  onChange={(e) => setOtherDescription(e.target.value)}
                  placeholder="Describe the electrical issue you're experiencing…"
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>
            )}
          </>
        )}

        {/* Step 2: Time Slot Selection */}
        {step === 'timeslot' && (
          <>
            {/* Summary chip */}
            <div className="aiseo-cw-booking-chip">
              <BoltIcon />
              <div>
                <strong>{selectedService}</strong>
                <span className="aiseo-cw-booking-chip-sub">{isOther ? `Other: ${otherDescription}` : selectedIssue}</span>
              </div>
              <button className="aiseo-cw-booking-edit" onClick={() => setStep('issue')} aria-label="Edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '0.875rem', height: '0.875rem' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>

            <h3 className="aiseo-cw-booking-step-title">When do you need us?</h3>

            <div className="aiseo-cw-booking-slot-tabs">
              <button className={slotMode === 'first' ? 'active' : ''} onClick={() => setSlotMode('first')}>First Available</button>
              <button className={slotMode === 'all' ? 'active' : ''} onClick={() => setSlotMode('all')}>All Appointments</button>
            </div>

            <div className="aiseo-cw-booking-slots">
              {displayedSlots.map((slot) => (
                <label key={slot.label} className={`aiseo-cw-booking-slot ${selectedSlot?.label === slot.label ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="timeslot"
                    checked={selectedSlot?.label === slot.label}
                    onChange={() => setSelectedSlot(slot)}
                  />
                  <CalendarIcon />
                  <span>{slot.label}</span>
                </label>
              ))}
            </div>
          </>
        )}

        {/* Step 3: Contact Info */}
        {step === 'contact' && (
          <>
            {/* Summary chip */}
            <div className="aiseo-cw-booking-chip">
              <BoltIcon />
              <div>
                <strong>{isOther ? `Other: ${otherDescription}` : selectedIssue}</strong>
                <span className="aiseo-cw-booking-chip-sub">
                  <CalendarIcon /> {selectedSlot?.label}
                </span>
                {business.contact.address && (
                  <span className="aiseo-cw-booking-chip-sub">
                    <LocationIcon /> {business.contact.address.city}, {business.contact.address.state}
                  </span>
                )}
              </div>
            </div>

            <h3 className="aiseo-cw-booking-step-title">How should we reach you?</h3>

            <div className="aiseo-cw-booking-form-grid">
              <div className="aiseo-cw-field">
                <label className="aiseo-cw-label">First Name *</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" required />
              </div>
              <div className="aiseo-cw-field">
                <label className="aiseo-cw-label">Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
              </div>
              <div className="aiseo-cw-field">
                <label className="aiseo-cw-label">Phone *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(123) 456-7890" required />
              </div>
              <div className="aiseo-cw-field">
                <label className="aiseo-cw-label">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
            </div>

            <div className="aiseo-cw-field" style={{ marginTop: '0.5rem' }}>
              <label className="aiseo-cw-label">ZIP Code *</label>
              <input type="text" inputMode="numeric" pattern="\d{5}" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="77001" required />
            </div>

            <label className="aiseo-cw-booking-consent">
              <input type="checkbox" checked={consentContact} onChange={(e) => setConsentContact(e.target.checked)} />
              <span>I am the owner of this property and I agree to be contacted for my service request, promotions and marketing purposes. *</span>
            </label>
            <label className="aiseo-cw-booking-consent">
              <input type="checkbox" checked={consentSms} onChange={(e) => setConsentSms(e.target.checked)} />
              <span>Receive text messages about appointment</span>
            </label>
          </>
        )}

        {/* Step 4: Summary */}
        {step === 'summary' && (
          <>
            <div className="aiseo-cw-booking-summary-label">SUMMARY</div>
            <div className="aiseo-cw-booking-chip">
              <BoltIcon />
              <div>
                <strong>{selectedService}</strong>
                <span className="aiseo-cw-booking-chip-sub">{isOther ? `Other: ${otherDescription}` : selectedIssue}</span>
              </div>
              <button className="aiseo-cw-booking-edit" onClick={() => setStep('issue')} aria-label="Edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '0.875rem', height: '0.875rem' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            <div className="aiseo-cw-booking-summary-detail">
              <CalendarIcon />
              <span>{selectedSlot?.label}</span>
            </div>
            {business.contact.address && (
              <div className="aiseo-cw-booking-summary-detail">
                <LocationIcon />
                <span>{business.contact.address.city}, {business.contact.address.state}</span>
              </div>
            )}
            <hr className="aiseo-cw-booking-divider" />
            <div className="aiseo-cw-booking-summary-contact">
              <p><strong>{firstName} {lastName}</strong></p>
              <p>{phone}</p>
              <p>{email}</p>
              <p>ZIP: {zip}</p>
            </div>
          </>
        )}
      </div>

      {error && <p className="aiseo-cw-error" style={{ padding: '0 1rem' }}>{error}</p>}

      {/* Footer bar */}
      <div className="aiseo-cw-booking-footer">
        {business.contact.emergencyAvailable && (
          <a className="aiseo-cw-booking-emergency" href={`tel:${business.contact.phoneTel}`}>
            <PhoneIcon /> Emergency
          </a>
        )}
        <button
          className="aiseo-cw-booking-continue"
          disabled={
            (step === 'issue' && (!selectedIssue || (isOther && !otherDescription.trim()))) ||
            (step === 'timeslot' && !selectedSlot) ||
            (step === 'contact' && (!firstName.trim() || !phone.trim() || !email.trim() || !zip.trim() || !consentContact)) ||
            submitting
          }
          onClick={() => {
            if (step === 'issue') setStep('timeslot');
            else if (step === 'timeslot') setStep('contact');
            else if (step === 'contact') setStep('summary');
            else if (step === 'summary') onSubmit();
          }}
        >
          {step === 'summary' ? (submitting ? 'Booking…' : 'Confirm Booking') : 'Continue Booking'}
        </button>
      </div>
    </div>
  );
}

/* ───────── Helpers ───────── */

/** Darken a hex color by a factor (0–1). */
function darkenHex(hex: string, factor: number): string {
  const h = hex.replace('#', '');
  const r = Math.max(0, Math.round(parseInt(h.slice(0, 2), 16) * (1 - factor)));
  const g = Math.max(0, Math.round(parseInt(h.slice(2, 4), 16) * (1 - factor)));
  const b = Math.max(0, Math.round(parseInt(h.slice(4, 6), 16) * (1 - factor)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
