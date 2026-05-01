export const WIDGET_STYLES = `
/* ── Launcher ── */
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

/* ── Panel ── */
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

/* ── Header ── */
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

/* ── Powered-by footer ── */
.aiseo-cw-powered {
  text-align: center;
  padding: 0.375rem 1rem;
  font-size: 0.625rem;
  color: #94a3b8;
  border-top: 1px solid #f1f5f9;
  letter-spacing: 0.02em;
}
`.trim();
