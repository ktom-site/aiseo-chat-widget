"use client";

// src/ChatWidget.tsx
import { useEffect, useMemo, useRef, useState } from "react";

// src/hours.ts
var DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
function isAfterHours(hours, date = /* @__PURE__ */ new Date()) {
  if (!hours) return false;
  const dayKey = DAY_KEYS[date.getDay()];
  const window2 = hours[dayKey];
  if (!window2 || window2 === "closed") return true;
  const match = window2.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
  if (!match) return false;
  const [, oh, om, ch, cm] = match;
  const now = date.getHours() * 60 + date.getMinutes();
  const open = Number(oh) * 60 + Number(om);
  const close = Number(ch) * 60 + Number(cm);
  return now < open || now >= close;
}
function greetingForTime(date = /* @__PURE__ */ new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// src/styles.ts
var WIDGET_STYLES = `
/* \u2500\u2500 Launcher \u2500\u2500 */
.aiseo-cw-launcher {
  position: fixed;
  bottom: var(--aiseo-cw-offset-y, 1.5rem);
  right: var(--aiseo-cw-offset-x, 1.5rem);
  left: auto;
  z-index: 50;
  width: var(--aiseo-cw-launcher-size, 3.5rem);
  height: var(--aiseo-cw-launcher-size, 3.5rem);
  border-radius: 9999px;
  background: var(--aiseo-cw-brand, var(--color-brand, #c1272d));
  color: var(--aiseo-cw-brand-fg, #ffffff);
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 20px color-mix(in srgb, var(--aiseo-cw-brand, var(--color-brand, #c1272d)) 35%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 200ms, box-shadow 200ms;
}
.aiseo-cw-launcher:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 28px color-mix(in srgb, var(--aiseo-cw-brand, var(--color-brand, #c1272d)) 45%, transparent);
}
.aiseo-cw-launcher svg { width: 1.5rem; height: 1.5rem; }
.aiseo-cw-launcher--left { right: auto; left: var(--aiseo-cw-offset-x, 1.5rem); }
.aiseo-cw-launcher--sm { --aiseo-cw-launcher-size: 3rem; }
.aiseo-cw-launcher--sm svg { width: 1.25rem; height: 1.25rem; }
.aiseo-cw-launcher--lg { --aiseo-cw-launcher-size: 4rem; }
.aiseo-cw-launcher--lg svg { width: 1.75rem; height: 1.75rem; }

/* Pulse ring */
.aiseo-cw-launcher--pulse::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 9999px;
  border: 2px solid var(--aiseo-cw-brand, var(--color-brand, #c1272d));
  animation: aiseoCwPulseRing 2s ease-out infinite;
}
@keyframes aiseoCwPulseRing {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.45); opacity: 0; }
}

/* \u2500\u2500 Panel \u2500\u2500 */
.aiseo-cw-panel {
  position: fixed;
  bottom: calc(var(--aiseo-cw-offset-y, 1.5rem) + var(--aiseo-cw-launcher-size, 3.5rem) + 0.75rem);
  right: var(--aiseo-cw-offset-x, 1.5rem);
  left: auto;
  z-index: 50;
  width: min(var(--aiseo-cw-panel-width, 24rem), calc(100vw - 2rem));
  max-height: calc(100vh - 7rem);
  background: #fff;
  border-radius: var(--aiseo-cw-radius, 1rem);
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0f172a;
  animation: aiseoCwSlideIn 250ms ease-out;
}
.aiseo-cw-panel--left { right: auto; left: var(--aiseo-cw-offset-x, 1.5rem); }
@keyframes aiseoCwSlideIn {
  0% { opacity: 0; transform: translateY(12px) scale(0.96); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* \u2500\u2500 Header \u2500\u2500 */
.aiseo-cw-header {
  background: var(--aiseo-cw-brand, var(--color-brand, #c1272d));
  color: var(--aiseo-cw-brand-fg, #ffffff);
  padding: 0.875rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.aiseo-cw-header--gradient {
  background: linear-gradient(135deg, var(--aiseo-cw-brand, var(--color-brand, #c1272d)), color-mix(in srgb, var(--aiseo-cw-brand, var(--color-brand, #c1272d)) 75%, black));
}
.aiseo-cw-avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.aiseo-cw-avatar svg { width: 1.25rem; height: 1.25rem; }
.aiseo-cw-title { font-weight: 600; font-size: 0.875rem; line-height: 1.2; margin: 0; }
.aiseo-cw-status { font-size: 0.75rem; opacity: 0.85; margin: 0.125rem 0 0; }

.aiseo-cw-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #fafafa;
}

.aiseo-cw-msg { display: flex; max-width: 85%; }
.aiseo-cw-msg-user { align-self: flex-end; }
.aiseo-cw-msg-bot { align-self: flex-start; }
.aiseo-cw-bubble {
  padding: 0.625rem 0.875rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  line-height: 1.45;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.aiseo-cw-msg-user .aiseo-cw-bubble {
  background: var(--aiseo-cw-brand, var(--color-brand, #c1272d));
  color: var(--aiseo-cw-brand-fg, #ffffff);
  border-bottom-right-radius: 0.25rem;
}
.aiseo-cw-msg-bot .aiseo-cw-bubble {
  background: #f1f5f9;
  color: #1e293b;
  border-bottom-left-radius: 0.25rem;
}

.aiseo-cw-typing { display: inline-flex; gap: 0.25rem; padding: 0.5rem 0; }
.aiseo-cw-typing span {
  width: 0.5rem; height: 0.5rem; border-radius: 9999px; background: #94a3b8;
  animation: aiseoCwBounce 1.2s infinite ease-in-out;
}
.aiseo-cw-typing span:nth-child(2) { animation-delay: 0.15s; }
.aiseo-cw-typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes aiseoCwBounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40% { transform: translateY(-4px); opacity: 1; }
}

.aiseo-cw-quick {
  padding: 0 1rem 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
.aiseo-cw-quick button {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #1e293b;
  cursor: pointer;
  transition: background 120ms;
}
.aiseo-cw-quick button:hover { background: #f1f5f9; }

.aiseo-cw-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fafafa;
  border-top: 1px solid #f1f5f9;
}
.aiseo-cw-actions button {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: opacity 120ms;
}
.aiseo-cw-actions .aiseo-cw-cta-primary {
  background: var(--aiseo-cw-accent, var(--color-brand-accent, #c9a35e));
  color: var(--aiseo-cw-accent-fg, #1a1414);
}
.aiseo-cw-actions .aiseo-cw-cta-secondary {
  background: #fff;
  color: var(--aiseo-cw-brand, var(--color-brand, #c1272d));
  border-color: var(--aiseo-cw-brand, var(--color-brand, #c1272d));
}
.aiseo-cw-actions button:hover { opacity: 0.92; }

.aiseo-cw-input {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}
.aiseo-cw-input input,
.aiseo-cw-input textarea {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #f8fafc;
  outline: none;
  font-family: inherit;
}
.aiseo-cw-input input:focus,
.aiseo-cw-input textarea:focus {
  border-color: var(--aiseo-cw-brand, var(--color-brand, #c1272d));
  background: #fff;
}
.aiseo-cw-send {
  padding: 0.5rem 0.75rem;
  background: var(--aiseo-cw-brand, var(--color-brand, #c1272d));
  color: var(--aiseo-cw-brand-fg, #ffffff);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}
.aiseo-cw-send:disabled { opacity: 0.4; cursor: not-allowed; }
.aiseo-cw-send svg { width: 1rem; height: 1rem; display: block; }

.aiseo-cw-form {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  background: #fff;
}
.aiseo-cw-form-title { font-weight: 700; font-size: 1rem; margin: 0 0 0.25rem; }
.aiseo-cw-form-sub { font-size: 0.8125rem; color: #64748b; margin: 0 0 0.5rem; }
.aiseo-cw-field { display: flex; flex-direction: column; gap: 0.25rem; }
.aiseo-cw-label { font-size: 0.75rem; font-weight: 600; color: #334155; }
.aiseo-cw-field input, .aiseo-cw-field select, .aiseo-cw-field textarea {
  padding: 0.5rem 0.75rem; font-size: 0.875rem;
  border: 1px solid #e2e8f0; border-radius: 0.5rem;
  background: #fff; outline: none; font-family: inherit;
}
.aiseo-cw-field input:focus, .aiseo-cw-field select:focus, .aiseo-cw-field textarea:focus {
  border-color: var(--aiseo-cw-brand, var(--color-brand, #c1272d));
}
.aiseo-cw-form button[type="submit"] {
  margin-top: 0.5rem; padding: 0.625rem;
  background: var(--aiseo-cw-brand, var(--color-brand, #c1272d));
  color: var(--aiseo-cw-brand-fg, #ffffff);
  border: none; border-radius: 0.5rem;
  font-weight: 600; cursor: pointer;
}
.aiseo-cw-form button[type="submit"]:disabled { opacity: 0.5; }
.aiseo-cw-back {
  align-self: flex-start; background: none; border: none; color: #64748b;
  font-size: 0.75rem; cursor: pointer; padding: 0; margin-bottom: 0.25rem;
}
.aiseo-cw-error { color: #b91c1c; font-size: 0.75rem; }
.aiseo-cw-success {
  padding: 1.5rem 1rem; text-align: center;
}
.aiseo-cw-success-icon {
  width: 3rem; height: 3rem; margin: 0 auto 0.75rem; border-radius: 9999px;
  background: var(--aiseo-cw-accent, var(--color-brand-accent, #c9a35e));
  display: flex; align-items: center; justify-content: center;
}
.aiseo-cw-success-icon svg { width: 1.5rem; height: 1.5rem; color: #1a1414; }
.aiseo-cw-success h3 { font-size: 1.125rem; font-weight: 700; margin: 0 0 0.25rem; }
.aiseo-cw-success p { font-size: 0.875rem; color: #64748b; margin: 0 0 1rem; }

/* \u2500\u2500 Powered-by footer \u2500\u2500 */
.aiseo-cw-powered {
  text-align: center;
  padding: 0.375rem 1rem;
  font-size: 0.625rem;
  color: #94a3b8;
  border-top: 1px solid #f1f5f9;
  letter-spacing: 0.02em;
}
`.trim();

// src/ChatWidget.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var BOOKING_INTENT_RE = /\b(schedule|book|appointment|estimate|callback|send a tech|call me back|talk to (someone|a human))\b/i;
function ChatWidget({
  business,
  chatEndpoint = "/api/chat",
  leadEndpoint = "/api/chat-lead",
  initialMessage,
  config = {}
}) {
  const {
    position = "bottom-right",
    launcherSize = "md",
    panelWidth = 24,
    borderRadius = 1,
    pulseOnLoad = true,
    headerGradient = true,
    poweredByText,
    autoOpenDelay = 0
  } = config;
  const isLeft = position === "bottom-left";
  const afterHours = useMemo(
    () => isAfterHours(business.contact.hoursStructured),
    [business.contact.hoursStructured]
  );
  const greetingText = initialMessage ?? (afterHours ? `Hi! Thanks for reaching out to ${business.name}. We're closed right now, but I can answer questions or grab your details so we'll reach out first thing.` : `Hi! I'm the ${business.name} assistant. Ask me about services, pricing, or schedule a free estimate.`);
  const initialMessages = useMemo(
    () => [{ role: "assistant", content: greetingText }],
    [greetingText]
  );
  const quickReplies = useMemo(() => {
    const base = ["What services do you offer?", "How much for a panel upgrade?"];
    if (business.contact.emergencyAvailable) base.push("I have an emergency");
    base.push("Schedule a free estimate");
    return base;
  }, [business.contact.emergencyAvailable]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("chat");
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showCaptureCta, setShowCaptureCta] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);
  async function send(text) {
    if (!text.trim() || sending) return;
    if (text.toLowerCase().includes("schedule") || text.toLowerCase().includes("estimate")) {
      setShowCaptureCta(true);
    }
    const userMsg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) })
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      const reply = data.reply ?? `Sorry, I'm having trouble. Please call ${business.contact.phone}.`;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (BOOKING_INTENT_RE.test(reply) || BOOKING_INTENT_RE.test(text)) {
        setShowCaptureCta(true);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `Sorry, I'm having trouble right now. Please call ${business.contact.phone}.`
      }]);
    } finally {
      setSending(false);
    }
  }
  function reset() {
    setMessages(initialMessages);
    setMode("chat");
    setShowCaptureCta(false);
    setInput("");
  }
  useEffect(() => {
    if (autoOpenDelay > 0 && !open) {
      const t = setTimeout(() => setOpen(true), autoOpenDelay);
      return () => clearTimeout(t);
    }
  }, [autoOpenDelay]);
  const cssVars = {
    "--aiseo-cw-panel-width": `${panelWidth}rem`,
    "--aiseo-cw-radius": `${borderRadius}rem`
  };
  const launcherCls = [
    "aiseo-cw-launcher",
    isLeft && "aiseo-cw-launcher--left",
    launcherSize !== "md" && `aiseo-cw-launcher--${launcherSize}`,
    pulseOnLoad && !open && "aiseo-cw-launcher--pulse"
  ].filter(Boolean).join(" ");
  const panelCls = [
    "aiseo-cw-panel",
    isLeft && "aiseo-cw-panel--left"
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: WIDGET_STYLES } }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: launcherCls,
        "aria-label": open ? "Close chat" : "Open chat",
        onClick: () => setOpen((o) => !o),
        children: open ? /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) }) : /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) })
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: panelCls, role: "dialog", "aria-label": `${business.name} chat`, style: cssVars, children: [
      /* @__PURE__ */ jsxs("header", { className: `aiseo-cw-header${headerGradient ? " aiseo-cw-header--gradient" : ""}`, children: [
        /* @__PURE__ */ jsx("div", { className: "aiseo-cw-avatar", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z", clipRule: "evenodd" }) }) }),
        /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ jsx("p", { className: "aiseo-cw-title", children: business.name }),
          /* @__PURE__ */ jsx("p", { className: "aiseo-cw-status", children: afterHours ? "Closed \u2014 we'll reply soon" : "Typically replies instantly" })
        ] })
      ] }),
      mode === "chat" && /* @__PURE__ */ jsx(
        ChatBody,
        {
          messages,
          sending,
          quickReplies: messages.length === 1 ? quickReplies : [],
          onQuick: (q) => {
            if (q === "Schedule a free estimate") setMode("capture");
            else send(q);
          },
          bottomRef
        }
      ),
      mode === "chat" && showCaptureCta && /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-actions", children: [
        /* @__PURE__ */ jsx("button", { className: "aiseo-cw-cta-primary", onClick: () => setMode("capture"), children: "Schedule estimate" }),
        /* @__PURE__ */ jsxs("a", { className: "aiseo-cw-cta-secondary", href: `tel:${business.contact.phoneTel}`, role: "button", children: [
          "Call ",
          business.contact.phone
        ] })
      ] }),
      mode === "chat" && /* @__PURE__ */ jsxs(
        "form",
        {
          className: "aiseo-cw-input",
          onSubmit: (e) => {
            e.preventDefault();
            send(input);
          },
          children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: input,
                onChange: (e) => setInput(e.target.value),
                placeholder: "Type a message\u2026",
                "aria-label": "Type a message",
                disabled: sending
              }
            ),
            /* @__PURE__ */ jsx("button", { type: "submit", className: "aiseo-cw-send", disabled: !input.trim() || sending, children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" }) }) })
          ]
        }
      ),
      mode === "capture" && /* @__PURE__ */ jsx(
        CaptureForm,
        {
          business,
          conversation: messages,
          endpoint: leadEndpoint,
          onBack: () => setMode("chat"),
          onSubmitted: () => setMode("submitted")
        }
      ),
      mode === "submitted" && /* @__PURE__ */ jsx(SuccessPanel, { business, onReset: reset, afterHours }),
      poweredByText && /* @__PURE__ */ jsx("div", { className: "aiseo-cw-powered", children: poweredByText })
    ] })
  ] });
}
function ChatBody({
  messages,
  sending,
  quickReplies,
  onQuick,
  bottomRef
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-body", children: [
      messages.map((m, i) => /* @__PURE__ */ jsx("div", { className: `aiseo-cw-msg ${m.role === "user" ? "aiseo-cw-msg-user" : "aiseo-cw-msg-bot"}`, children: /* @__PURE__ */ jsx("div", { className: "aiseo-cw-bubble", children: m.content }) }, i)),
      sending && /* @__PURE__ */ jsx("div", { className: "aiseo-cw-msg aiseo-cw-msg-bot", children: /* @__PURE__ */ jsx("div", { className: "aiseo-cw-bubble", children: /* @__PURE__ */ jsxs("span", { className: "aiseo-cw-typing", children: [
        /* @__PURE__ */ jsx("span", {}),
        /* @__PURE__ */ jsx("span", {}),
        /* @__PURE__ */ jsx("span", {})
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { ref: bottomRef })
    ] }),
    quickReplies.length > 0 && /* @__PURE__ */ jsx("div", { className: "aiseo-cw-quick", children: quickReplies.map((q) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onQuick(q), children: q }, q)) })
  ] });
}
function CaptureForm({
  business,
  conversation,
  endpoint,
  onBack,
  onSubmitted
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState(business.services?.[0]?.title ?? "General electrical");
  const [urgency, setUrgency] = useState("this-week");
  const [zip, setZip] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        serviceType,
        urgency,
        zip: zip.trim() || void 0,
        note: note.trim() || void 0,
        pageUrl: typeof window !== "undefined" ? window.location.href : void 0,
        capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
        conversation
      };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      onSubmitted();
    } catch {
      setError("Could not submit. Please call " + business.contact.phone + " directly.");
    } finally {
      setSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxs("form", { className: "aiseo-cw-form", onSubmit, children: [
    /* @__PURE__ */ jsx("button", { type: "button", className: "aiseo-cw-back", onClick: onBack, children: "\u2190 Back to chat" }),
    /* @__PURE__ */ jsx("h3", { className: "aiseo-cw-form-title", children: "Get a free estimate" }),
    /* @__PURE__ */ jsx("p", { className: "aiseo-cw-form-sub", children: "We'll reach out to set up a time. No spam, ever." }),
    /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-field", children: [
      /* @__PURE__ */ jsx("label", { className: "aiseo-cw-label", htmlFor: "aiseo-cw-name", children: "Your name *" }),
      /* @__PURE__ */ jsx("input", { id: "aiseo-cw-name", type: "text", value: name, onChange: (e) => setName(e.target.value), required: true })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-field", children: [
      /* @__PURE__ */ jsx("label", { className: "aiseo-cw-label", htmlFor: "aiseo-cw-phone", children: "Phone *" }),
      /* @__PURE__ */ jsx("input", { id: "aiseo-cw-phone", type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), required: true })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-field", children: [
      /* @__PURE__ */ jsx("label", { className: "aiseo-cw-label", htmlFor: "aiseo-cw-service", children: "Service needed" }),
      /* @__PURE__ */ jsxs("select", { id: "aiseo-cw-service", value: serviceType, onChange: (e) => setServiceType(e.target.value), children: [
        (business.services ?? []).map((s) => /* @__PURE__ */ jsx("option", { value: s.title, children: s.title }, s.slug ?? s.title)),
        /* @__PURE__ */ jsx("option", { value: "Other / Not sure", children: "Other / Not sure" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-field", children: [
      /* @__PURE__ */ jsx("label", { className: "aiseo-cw-label", htmlFor: "aiseo-cw-urgency", children: "When do you need it?" }),
      /* @__PURE__ */ jsxs("select", { id: "aiseo-cw-urgency", value: urgency, onChange: (e) => setUrgency(e.target.value), children: [
        business.contact.emergencyAvailable && /* @__PURE__ */ jsx("option", { value: "emergency", children: "Emergency \u2014 ASAP" }),
        /* @__PURE__ */ jsx("option", { value: "today", children: "Today / this evening" }),
        /* @__PURE__ */ jsx("option", { value: "this-week", children: "This week" }),
        /* @__PURE__ */ jsx("option", { value: "flexible", children: "Flexible / just exploring" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-field", children: [
      /* @__PURE__ */ jsx("label", { className: "aiseo-cw-label", htmlFor: "aiseo-cw-zip", children: "ZIP (optional)" }),
      /* @__PURE__ */ jsx("input", { id: "aiseo-cw-zip", type: "text", inputMode: "numeric", pattern: "\\d{5}", value: zip, onChange: (e) => setZip(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-field", children: [
      /* @__PURE__ */ jsx("label", { className: "aiseo-cw-label", htmlFor: "aiseo-cw-note", children: "Anything else? (optional)" }),
      /* @__PURE__ */ jsx("textarea", { id: "aiseo-cw-note", rows: 2, value: note, onChange: (e) => setNote(e.target.value) })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "aiseo-cw-error", children: error }),
    /* @__PURE__ */ jsx("button", { type: "submit", disabled: submitting, children: submitting ? "Sending\u2026" : "Send request" })
  ] });
}
function SuccessPanel({
  business,
  afterHours,
  onReset
}) {
  return /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-success", children: [
    /* @__PURE__ */ jsx("div", { className: "aiseo-cw-success-icon", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" }) }) }),
    /* @__PURE__ */ jsx("h3", { children: "Thanks! We got it." }),
    /* @__PURE__ */ jsx("p", { children: afterHours ? `We're closed right now \u2014 we'll reach out first thing in the morning. For active hazards, call ${business.contact.phone}.` : `We'll text or call you within 1 business hour.` }),
    /* @__PURE__ */ jsx("button", { className: "aiseo-cw-cta-secondary", type: "button", onClick: onReset, style: { padding: "0.5rem 1rem", borderRadius: "0.5rem", cursor: "pointer" }, children: "Send another message" })
  ] });
}
export {
  ChatWidget,
  greetingForTime,
  isAfterHours
};
//# sourceMappingURL=index.js.map