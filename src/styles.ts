export const WIDGET_STYLES = `
/* ═══════════════════════════════════════════
   AISEO Chat Widget — Scorpion-style layout
   ═══════════════════════════════════════════ */

/* ── Bottom Bar (collapsed state) ── */
.aiseo-cw-bar {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  border-top-left-radius: 0.5rem;
  overflow: hidden;
  box-shadow: -2px -2px 12px rgba(0,0,0,0.15);
}
.aiseo-cw-bar-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.875rem 1.625rem;
  background: var(--aiseo-cw-primary, #3b82f6);
  color: var(--aiseo-cw-primary-fg, #ffffff);
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  transition: filter 150ms;
  text-decoration: none;
}
.aiseo-cw-bar-tab:hover { filter: brightness(1.1); }
.aiseo-cw-bar-tab svg { width: 1.625rem; height: 1.625rem; }
.aiseo-cw-bar-tab--connect {
  background: var(--aiseo-cw-primary, #3b82f6);
  flex-direction: row;
  gap: 0.5rem;
  font-size: 1rem;
  padding: 0.875rem 1.5rem;
}
.aiseo-cw-bar-tab--connect svg { width: 1.75rem; height: 1.75rem; }

/* ── Greeting Bubble ── */
.aiseo-cw-greeting {
  position: fixed;
  bottom: 5rem;
  right: 0.75rem;
  z-index: 9998;
  background: #fff;
  border: 2px solid var(--aiseo-cw-primary, #3b82f6);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  max-width: 22rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  animation: aiseoCwFadeUp 400ms ease-out;
}
.aiseo-cw-greeting::after {
  content: '';
  position: absolute;
  bottom: -8px;
  right: 1.5rem;
  width: 14px;
  height: 14px;
  background: #fff;
  border-right: 2px solid var(--aiseo-cw-primary, #3b82f6);
  border-bottom: 2px solid var(--aiseo-cw-primary, #3b82f6);
  transform: rotate(45deg);
}
.aiseo-cw-greeting-title {
  font-weight: 700;
  font-size: 0.875rem;
  color: #0f172a;
  margin: 0 0 0.125rem;
}
.aiseo-cw-greeting-sub {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}
.aiseo-cw-greeting-close {
  position: absolute;
  top: 0.375rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.125rem;
  line-height: 1;
  padding: 0.125rem;
}
.aiseo-cw-greeting-close:hover { color: #475569; }

@keyframes aiseoCwFadeUp {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* ── Panel (expanded state) ── */
.aiseo-cw-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 10000;
  width: min(24rem, 100vw);
  max-height: 100vh;
  max-height: 100dvh;
  background: #f8fafc;
  border-top-left-radius: 1rem;
  box-shadow: -4px -2px 30px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0f172a;
  animation: aiseoCwSlideUp 300ms ease-out;
}
@keyframes aiseoCwSlideUp {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Panel Header (logo + close) */
.aiseo-cw-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}
.aiseo-cw-panel-logo {
  height: 2.5rem;
  width: auto;
  max-width: 10rem;
  object-fit: contain;
}
.aiseo-cw-panel-controls {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.aiseo-cw-panel-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 120ms;
}
.aiseo-cw-panel-btn:hover { background: #e2e8f0; }
.aiseo-cw-panel-btn svg { width: 1rem; height: 1rem; }

/* ── Home View (action cards) ── */
.aiseo-cw-home {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1rem;
}
.aiseo-cw-home-heading {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1rem;
}
.aiseo-cw-card-full {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  width: 100%;
  padding: 1.25rem 1rem;
  border-radius: 0.625rem;
  border: 2px solid var(--aiseo-cw-primary, #3b82f6);
  background: var(--aiseo-cw-primary, #3b82f6);
  color: var(--aiseo-cw-primary-fg, #ffffff);
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: filter 150ms, transform 150ms;
  margin-bottom: 0.625rem;
}
.aiseo-cw-card-full:hover { filter: brightness(1.08); transform: translateY(-1px); }
.aiseo-cw-card-full svg { width: 2rem; height: 2rem; opacity: 0.7; }

.aiseo-cw-card-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
  margin-bottom: 1.25rem;
}
.aiseo-cw-card-half {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 1rem 0.5rem;
  border-radius: 0.625rem;
  border: 2px solid var(--aiseo-cw-primary, #3b82f6);
  font-size: 0.875rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: filter 150ms, transform 150ms;
}
.aiseo-cw-card-half:hover { filter: brightness(1.08); transform: translateY(-1px); }
.aiseo-cw-card-half svg { width: 1.75rem; height: 1.75rem; opacity: 0.7; }
.aiseo-cw-card-half--email {
  background: var(--aiseo-cw-primary, #3b82f6);
  color: var(--aiseo-cw-primary-fg, #ffffff);
}
.aiseo-cw-card-half--chat {
  background: var(--aiseo-cw-secondary, #1e3a5f);
  color: var(--aiseo-cw-primary-fg, #ffffff);
  border-color: var(--aiseo-cw-secondary, #1e3a5f);
}

/* ── AI Chat Section (inside home view) ── */
.aiseo-cw-ai-section {
  margin-bottom: 0.75rem;
}
.aiseo-cw-ai-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.aiseo-cw-ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--aiseo-cw-accent, var(--aiseo-cw-primary, #3b82f6));
}
.aiseo-cw-ai-input-wrap {
  display: flex;
  gap: 0.5rem;
  border: 2px solid var(--aiseo-cw-primary, #3b82f6);
  border-radius: 2rem;
  padding: 0.375rem 0.5rem 0.375rem 1rem;
  background: #fff;
  align-items: center;
}
.aiseo-cw-ai-input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.875rem;
  font-family: inherit;
  color: #0f172a;
}
.aiseo-cw-ai-input-wrap input::placeholder { color: #94a3b8; }
.aiseo-cw-ai-send {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  border: none;
  background: #e2e8f0;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 120ms;
  flex-shrink: 0;
}
.aiseo-cw-ai-send:hover { background: #cbd5e1; }
.aiseo-cw-ai-send svg { width: 1rem; height: 1rem; }

/* ── Panel Footer ── */
.aiseo-cw-panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}
.aiseo-cw-panel-footer button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
}
.aiseo-cw-panel-footer svg { width: 1.25rem; height: 1.25rem; }

/* ── Chat View ── */
.aiseo-cw-chat-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--aiseo-cw-primary, #3b82f6);
  color: var(--aiseo-cw-primary-fg, #ffffff);
}
.aiseo-cw-chat-avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.aiseo-cw-chat-avatar svg { width: 1.25rem; height: 1.25rem; }
.aiseo-cw-chat-title { font-weight: 600; font-size: 0.875rem; line-height: 1.2; margin: 0; }
.aiseo-cw-chat-status { font-size: 0.75rem; opacity: 0.85; margin: 0.125rem 0 0; }

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
  background: var(--aiseo-cw-primary, #3b82f6);
  color: var(--aiseo-cw-primary-fg, #ffffff);
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

/* ── Starter menu (first-turn intent buckets + topic chips) ── */
.aiseo-cw-starter {
  padding: 0 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}
.aiseo-cw-starter-banner {
  font-size: 0.8125rem;
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  line-height: 1.35;
}
.aiseo-cw-starter-intents {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.aiseo-cw-starter-intent {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 2.75rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.625rem;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #0f172a;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  text-align: left;
  transition: all 180ms ease;
}
.aiseo-cw-starter-intent:hover {
  border-color: var(--aiseo-cw-primary, #3b82f6);
  background: #f8fbff;
}
.aiseo-cw-starter-intent svg { width: 1.125rem; height: 1.125rem; flex-shrink: 0; color: var(--aiseo-cw-primary, #3b82f6); }
.aiseo-cw-starter-intent-label { flex: 1; }
.aiseo-cw-starter-intent-chevron { color: #94a3b8; width: 1rem; height: 1rem; flex-shrink: 0; }
.aiseo-cw-starter-intent--emergency {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
}
.aiseo-cw-starter-intent--emergency:hover {
  border-color: #ef4444;
  background: #fee2e2;
}
.aiseo-cw-starter-intent--emergency svg,
.aiseo-cw-starter-intent--emergency .aiseo-cw-starter-intent-chevron { color: #dc2626; }

.aiseo-cw-starter-divider {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.25rem 0 0;
}
.aiseo-cw-starter-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
.aiseo-cw-starter-topic {
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 180ms ease;
}
.aiseo-cw-starter-topic:hover {
  border-color: #93c5fd;
  background: #f0f7ff;
  color: #1e40af;
}

.aiseo-cw-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fafafa;
  border-top: 1px solid #f1f5f9;
}
.aiseo-cw-actions button, .aiseo-cw-actions a {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: opacity 120ms;
  text-align: center;
  text-decoration: none;
  font-family: inherit;
}
.aiseo-cw-actions .aiseo-cw-cta-primary {
  background: var(--aiseo-cw-accent, var(--aiseo-cw-primary, #3b82f6));
  color: var(--aiseo-cw-primary-fg, #ffffff);
}
.aiseo-cw-actions .aiseo-cw-cta-secondary {
  background: #fff;
  color: var(--aiseo-cw-primary, #3b82f6);
  border-color: var(--aiseo-cw-primary, #3b82f6);
}
.aiseo-cw-actions button:hover, .aiseo-cw-actions a:hover { opacity: 0.92; }

.aiseo-cw-input {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}
.aiseo-cw-input input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #f8fafc;
  outline: none;
  font-family: inherit;
}
.aiseo-cw-input input:focus {
  border-color: var(--aiseo-cw-primary, #3b82f6);
  background: #fff;
}
.aiseo-cw-send {
  padding: 0.5rem 0.75rem;
  background: var(--aiseo-cw-primary, #3b82f6);
  color: var(--aiseo-cw-primary-fg, #ffffff);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}
.aiseo-cw-send:disabled { opacity: 0.4; cursor: not-allowed; }
.aiseo-cw-send svg { width: 1rem; height: 1rem; display: block; }

/* ── Lead Capture Form ── */
.aiseo-cw-form {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  background: #fff;
  overflow-y: auto;
  flex: 1;
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
  border-color: var(--aiseo-cw-primary, #3b82f6);
}
.aiseo-cw-form button[type="submit"] {
  margin-top: 0.5rem; padding: 0.625rem;
  background: var(--aiseo-cw-primary, #3b82f6);
  color: var(--aiseo-cw-primary-fg, #ffffff);
  border: none; border-radius: 0.5rem;
  font-weight: 600; cursor: pointer; font-family: inherit;
}
.aiseo-cw-form button[type="submit"]:disabled { opacity: 0.5; }
.aiseo-cw-back {
  align-self: flex-start; background: none; border: none; color: #64748b;
  font-size: 0.75rem; cursor: pointer; padding: 0; margin-bottom: 0.25rem; font-family: inherit;
}
.aiseo-cw-error { color: #b91c1c; font-size: 0.75rem; }

/* ── Success ── */
.aiseo-cw-success {
  padding: 2rem 1rem; text-align: center; flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.aiseo-cw-success-icon {
  width: 3.5rem; height: 3.5rem; margin: 0 auto 1rem; border-radius: 9999px;
  background: #22c55e;
  display: flex; align-items: center; justify-content: center;
}
.aiseo-cw-success-icon svg { width: 1.75rem; height: 1.75rem; color: #fff; }
.aiseo-cw-success h3 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.375rem; }
.aiseo-cw-success p { font-size: 0.875rem; color: #64748b; margin: 0 0 1.25rem; }

/* ── Powered-by footer ── */
.aiseo-cw-powered {
  text-align: center;
  padding: 0.375rem 1rem;
  font-size: 0.625rem;
  color: #94a3b8;
  border-top: 1px solid #f1f5f9;
  letter-spacing: 0.02em;
}

/* ═══════════════════════════════════════════
   BOOKING FLOW
   ═══════════════════════════════════════════ */

.aiseo-cw-booking {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Booking header bar — logo + company name + close */
.aiseo-cw-booking-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--aiseo-cw-primary, #3b82f6), color-mix(in srgb, var(--aiseo-cw-primary, #3b82f6) 85%, #000));
  color: var(--aiseo-cw-primary-fg, #ffffff);
}
.aiseo-cw-booking-logo {
  height: 2rem;
  width: auto;
  max-width: 8rem;
  object-fit: contain;
}
.aiseo-cw-booking-header-title {
  font-weight: 700;
  font-size: 1rem;
}
.aiseo-cw-booking-header-sub {
  font-size: 0.8125rem;
  font-weight: 500;
  opacity: 0.85;
  margin-left: auto;
}
.aiseo-cw-booking-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
}
.aiseo-cw-booking-close svg { width: 1.125rem; height: 1.125rem; }

/* Progress dots */
.aiseo-cw-booking-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #fafbff;
  border-bottom: 1px solid #eef2f7;
}
.aiseo-cw-booking-progress-back {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
}
.aiseo-cw-booking-progress-back:hover { color: #0f172a; }
.aiseo-cw-booking-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex: 1;
}
.aiseo-cw-booking-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: #e2e8f0;
  transition: background 200ms;
}
.aiseo-cw-booking-dot.active {
  background: var(--aiseo-cw-primary, #3b82f6);
  width: 1.5rem;
  border-radius: 0.25rem;
}
.aiseo-cw-booking-dot.done {
  background: var(--aiseo-cw-primary, #3b82f6);
}

/* Scrollable body */
.aiseo-cw-booking-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #fff;
}

/* Service selector row */
.aiseo-cw-booking-services {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}
.aiseo-cw-booking-service {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.75rem 0.75rem;
  min-width: 5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #f8fafc;
  color: #475569;
  font-size: 0.6875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 200ms ease;
  flex-shrink: 0;
}
.aiseo-cw-booking-service svg { width: 1.75rem; height: 1.75rem; color: #60a5fa; transition: color 200ms; }
.aiseo-cw-booking-service.active {
  border-color: var(--aiseo-cw-primary, #3b82f6);
  background: #eff6ff;
  color: var(--aiseo-cw-primary, #3b82f6);
  box-shadow: 0 0 0 1px var(--aiseo-cw-primary, #3b82f6);
}
.aiseo-cw-booking-service.active svg { color: var(--aiseo-cw-primary, #3b82f6); }
.aiseo-cw-booking-service:hover { border-color: #93c5fd; background: #f0f7ff; }

/* Step title */
.aiseo-cw-booking-step-title {
  font-size: 1.125rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.75rem;
}

/* Issue tags */
.aiseo-cw-booking-issues {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.aiseo-cw-booking-tag {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #334155;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 200ms ease;
}
.aiseo-cw-booking-tag:hover {
  border-color: #93c5fd;
  background: #f0f7ff;
  color: #1e40af;
}
.aiseo-cw-booking-tag.active {
  border-color: var(--aiseo-cw-primary, #3b82f6);
  background: var(--aiseo-cw-primary, #3b82f6);
  color: var(--aiseo-cw-primary-fg, #ffffff);
  box-shadow: 0 2px 8px rgba(59,130,246,0.25);
}

/* Summary chip */
.aiseo-cw-booking-chip {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  background: #fafafa;
  position: relative;
}
.aiseo-cw-booking-chip svg:first-child { width: 2.5rem; height: 2.5rem; color: var(--aiseo-cw-primary, #3b82f6); flex-shrink: 0; }
.aiseo-cw-booking-chip strong { font-size: 0.9375rem; display: block; }
.aiseo-cw-booking-chip-sub {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}
.aiseo-cw-booking-chip-sub svg { width: 0.875rem; height: 0.875rem; }
.aiseo-cw-booking-edit {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
}
.aiseo-cw-booking-edit:hover { color: #475569; }

/* Time slot tabs */
.aiseo-cw-booking-slot-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1rem;
}
.aiseo-cw-booking-slot-tabs button {
  padding: 0.625rem;
  background: #fff;
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  color: #475569;
  transition: background 150ms, color 150ms;
}
.aiseo-cw-booking-slot-tabs button:first-child { border-right: 1px solid #e2e8f0; }
.aiseo-cw-booking-slot-tabs button.active {
  background: var(--aiseo-cw-primary, #3b82f6);
  color: var(--aiseo-cw-primary-fg, #ffffff);
}

/* Time slots */
.aiseo-cw-booking-slots {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.aiseo-cw-booking-slot {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
  transition: border-color 150ms, background 150ms;
  background: #fff;
}
.aiseo-cw-booking-slot:hover { border-color: var(--aiseo-cw-primary, #3b82f6); }
.aiseo-cw-booking-slot.active {
  border-color: var(--aiseo-cw-primary, #3b82f6);
  background: #eff6ff;
}
.aiseo-cw-booking-slot input { display: none; }
.aiseo-cw-booking-slot::before {
  content: '';
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid #cbd5e1;
  border-radius: 9999px;
  flex-shrink: 0;
  transition: all 150ms;
}
.aiseo-cw-booking-slot.active::before {
  border-color: var(--aiseo-cw-primary, #3b82f6);
  background: var(--aiseo-cw-primary, #3b82f6);
  box-shadow: inset 0 0 0 3px #fff;
}
.aiseo-cw-booking-slot svg { width: 1rem; height: 1rem; color: #94a3b8; }

/* Contact form grid */
.aiseo-cw-booking-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
}

/* Consent checkboxes */
.aiseo-cw-booking-consent {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #475569;
  margin-top: 0.625rem;
  cursor: pointer;
  line-height: 1.4;
}
.aiseo-cw-booking-consent input { margin-top: 0.125rem; flex-shrink: 0; }

/* Summary detail row */
.aiseo-cw-booking-summary-label {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}
.aiseo-cw-booking-summary-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #334155;
  margin-bottom: 0.5rem;
}
.aiseo-cw-booking-summary-detail svg { width: 1rem; height: 1rem; color: #64748b; }
.aiseo-cw-booking-divider {
  border: none;
  border-top: 1px dashed #e2e8f0;
  margin: 0.75rem 0;
}
.aiseo-cw-booking-summary-contact {
  font-size: 0.875rem;
  color: #334155;
}
.aiseo-cw-booking-summary-contact p { margin: 0.25rem 0; }
.aiseo-cw-booking-summary-contact strong { font-size: 1rem; }

/* Footer bar (Emergency + Continue) */
.aiseo-cw-booking-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}
.aiseo-cw-booking-emergency {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--aiseo-cw-primary, #3b82f6);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}
.aiseo-cw-booking-emergency svg { width: 1rem; height: 1rem; }
.aiseo-cw-booking-emergency:hover { opacity: 0.8; }
.aiseo-cw-booking-continue {
  padding: 0.625rem 1.5rem;
  background: var(--aiseo-cw-accent, var(--aiseo-cw-primary, #3b82f6));
  color: var(--aiseo-cw-accent-fg, var(--aiseo-cw-primary-fg, #ffffff));
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: filter 150ms, box-shadow 150ms;
  box-shadow: 0 2px 8px rgba(245,158,11,0.3);
}
.aiseo-cw-booking-continue:hover { filter: brightness(1.08); box-shadow: 0 4px 12px rgba(245,158,11,0.35); }
.aiseo-cw-booking-continue:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
`.trim();
