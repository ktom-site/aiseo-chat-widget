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
/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   AISEO Chat Widget \u2014 Scorpion-style layout
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

/* \u2500\u2500 Bottom Bar (collapsed state) \u2500\u2500 */
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
  gap: 0.125rem;
  padding: 0.5rem 1.125rem;
  background: var(--aiseo-cw-primary, #3b82f6);
  color: var(--aiseo-cw-primary-fg, #ffffff);
  border: none;
  cursor: pointer;
  font-size: 0.6875rem;
  font-weight: 600;
  font-family: inherit;
  transition: filter 150ms;
  text-decoration: none;
}
.aiseo-cw-bar-tab:hover { filter: brightness(1.1); }
.aiseo-cw-bar-tab svg { width: 1.25rem; height: 1.25rem; }
.aiseo-cw-bar-tab--connect {
  background: var(--aiseo-cw-primary, #3b82f6);
  flex-direction: row;
  gap: 0.375rem;
  font-size: 0.8125rem;
  padding: 0.5rem 1rem;
}
.aiseo-cw-bar-tab--connect svg { width: 1.375rem; height: 1.375rem; }

/* \u2500\u2500 Greeting Bubble \u2500\u2500 */
.aiseo-cw-greeting {
  position: fixed;
  bottom: 3.5rem;
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

/* \u2500\u2500 Panel (expanded state) \u2500\u2500 */
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

/* \u2500\u2500 Home View (action cards) \u2500\u2500 */
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

/* \u2500\u2500 AI Chat Section (inside home view) \u2500\u2500 */
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

/* \u2500\u2500 Panel Footer \u2500\u2500 */
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

/* \u2500\u2500 Chat View \u2500\u2500 */
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
  font-family: inherit;
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

/* \u2500\u2500 Lead Capture Form \u2500\u2500 */
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

/* \u2500\u2500 Success \u2500\u2500 */
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

/* \u2500\u2500 Powered-by footer \u2500\u2500 */
.aiseo-cw-powered {
  text-align: center;
  padding: 0.375rem 1rem;
  font-size: 0.625rem;
  color: #94a3b8;
  border-top: 1px solid #f1f5f9;
  letter-spacing: 0.02em;
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   BOOKING FLOW
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

.aiseo-cw-booking {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Booking header bar \u2014 logo + company name + close */
.aiseo-cw-booking-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--aiseo-cw-primary, #3b82f6);
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
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
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
  gap: 0.25rem;
  padding: 0.625rem 0.75rem;
  min-width: 5rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #fff;
  color: #475569;
  font-size: 0.6875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 150ms, background 150ms;
  flex-shrink: 0;
}
.aiseo-cw-booking-service svg { width: 1.75rem; height: 1.75rem; color: var(--aiseo-cw-primary, #3b82f6); }
.aiseo-cw-booking-service.active {
  border-color: var(--aiseo-cw-primary, #3b82f6);
  background: #eff6ff;
}
.aiseo-cw-booking-service:hover { border-color: var(--aiseo-cw-primary, #3b82f6); }

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
  padding: 0.5rem 0.875rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 150ms;
}
.aiseo-cw-booking-tag:hover {
  border-color: var(--aiseo-cw-primary, #3b82f6);
  background: #eff6ff;
}
.aiseo-cw-booking-tag.active {
  border-color: var(--aiseo-cw-primary, #3b82f6);
  background: var(--aiseo-cw-primary, #3b82f6);
  color: var(--aiseo-cw-primary-fg, #ffffff);
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
  background: var(--aiseo-cw-primary, #3b82f6);
  color: var(--aiseo-cw-primary-fg, #ffffff);
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: filter 150ms;
}
.aiseo-cw-booking-continue:hover { filter: brightness(1.08); }
.aiseo-cw-booking-continue:disabled { opacity: 0.4; cursor: not-allowed; }
`.trim();

// src/ChatWidget.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var BOOKING_INTENT_RE = /\b(schedule|book|appointment|estimate|callback|send a tech|call me back|talk to (someone|a human))\b/i;
var PhoneIcon = () => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" }) });
var ChatIcon = () => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) });
var AiIcon = () => /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "currentColor", style: { width: "1.375rem", height: "1.375rem" }, children: [
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10", opacity: "0.2" }),
  /* @__PURE__ */ jsx("text", { x: "12", y: "16", textAnchor: "middle", fontSize: "10", fontWeight: "700", fill: "currentColor", children: "AI" })
] });
var CloseIcon = () => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) });
var SendIcon = () => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" }) });
var BoltIcon = () => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z", clipRule: "evenodd" }) });
var CalendarIcon = () => /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
  /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }),
  /* @__PURE__ */ jsx("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
  /* @__PURE__ */ jsx("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
  /* @__PURE__ */ jsx("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
] });
var LocationIcon = () => /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" }),
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "10", r: "3" })
] });
var DEFAULT_ELECTRICAL_ISSUES = [
  { label: "Outlet Not Working" },
  { label: "Light Fixture Not Working" },
  { label: "Light Switch Not Working" },
  { label: "Light Fixture Flickering" },
  { label: "Ceiling Fan Not Working" },
  { label: "Breaker Tripping" },
  { label: "Breaker Making Noise" },
  { label: "Breaker Overheating" },
  { label: "Panel Upgrade Needed" },
  { label: "EV Charger Installation" },
  { label: "Generator Installation" },
  { label: "Whole Home Rewiring" },
  { label: "Outdoor/Landscape Lighting" },
  { label: "Smoke Detector Install" },
  { label: "Other" }
];
function generateTimeSlots(hours, count = 6) {
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const slots = [];
  const now = /* @__PURE__ */ new Date();
  const d = new Date(now);
  if (now.getHours() >= 12) d.setDate(d.getDate() + 1);
  let daysChecked = 0;
  while (slots.length < count && daysChecked < 30) {
    const key = dayKeys[d.getDay()];
    const h = hours?.[key];
    if (h && h !== "closed") {
      const [open, close] = h.split("-");
      const openH = parseInt(open.split(":")[0], 10);
      const closeH = parseInt(close.split(":")[0], 10);
      const dateStr = `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`;
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (openH < 12 && closeH > openH) {
        const endH = Math.min(12, closeH);
        slots.push({
          date: dateStr,
          dateISO: iso,
          startTime: formatHour(openH),
          endTime: formatHour(endH),
          label: `${dateStr}, ${formatHour(openH)} - ${formatHour(endH)}`
        });
      }
      if (closeH > 12) {
        const startH = Math.max(12, openH);
        slots.push({
          date: dateStr,
          dateISO: iso,
          startTime: formatHour(startH),
          endTime: formatHour(closeH),
          label: `${dateStr}, ${formatHour(startH)} - ${formatHour(closeH)}`
        });
      }
    }
    d.setDate(d.getDate() + 1);
    daysChecked++;
  }
  return slots;
}
function formatHour(h) {
  if (h === 0 || h === 24) return "12:00 AM";
  if (h === 12) return "12:00 PM";
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
}
function ChatWidget({
  business,
  chatEndpoint = "/api/chat",
  leadEndpoint = "/api/chat-lead",
  initialMessage,
  config = {}
}) {
  const {
    branding = {},
    greeting,
    panelHeading = "How can we help?",
    callLabel = "Call Me",
    emailLabel = "Email Us",
    chatLabel = "Chat with Us",
    chatPlaceholder = "Chat with us\u2014just start typing.",
    poweredByText,
    panelWidth = 24,
    bookLabel = "Book Online",
    bookingEndpoint = "/api/booking"
  } = config;
  const {
    logoUrl,
    logoAlt = business.name,
    primaryColor = "#3b82f6",
    secondaryColor,
    primaryFg = "#ffffff",
    accentColor
  } = branding;
  const derivedSecondary = secondaryColor || darkenHex(primaryColor, 0.35);
  const derivedAccent = accentColor || primaryColor;
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
  const [panelOpen, setPanelOpen] = useState(false);
  const [view, setView] = useState("home");
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [homeInput, setHomeInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showCaptureCta, setShowCaptureCta] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => {
    if (greeting && !panelOpen) {
      const delay = greeting.delay ?? 2e3;
      const t = setTimeout(() => setShowGreeting(true), delay);
      return () => clearTimeout(t);
    }
    if (panelOpen) setShowGreeting(false);
  }, [greeting, panelOpen]);
  useEffect(() => {
    const handler = () => {
      setPanelOpen(true);
      setView("booking");
    };
    window.addEventListener("aiseo-cw-open-booking", handler);
    return () => window.removeEventListener("aiseo-cw-open-booking", handler);
  }, []);
  useEffect(() => {
    if (panelOpen && view === "chat") bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, panelOpen, view]);
  async function send(text) {
    if (!text.trim() || sending) return;
    if (text.toLowerCase().includes("schedule") || text.toLowerCase().includes("estimate")) {
      setShowCaptureCta(true);
    }
    const userMsg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setHomeInput("");
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
    setView("home");
    setShowCaptureCta(false);
    setInput("");
    setHomeInput("");
  }
  function openPanel(targetView) {
    setPanelOpen(true);
    if (targetView) setView(targetView);
  }
  const cssVars = {
    "--aiseo-cw-primary": primaryColor,
    "--aiseo-cw-primary-fg": primaryFg,
    "--aiseo-cw-secondary": derivedSecondary,
    "--aiseo-cw-accent": derivedAccent,
    "--aiseo-cw-panel-width": `${panelWidth}rem`
  };
  return /* @__PURE__ */ jsxs("div", { style: cssVars, children: [
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: WIDGET_STYLES } }),
    !panelOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
      showGreeting && greeting && /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-greeting", children: [
        /* @__PURE__ */ jsx("p", { className: "aiseo-cw-greeting-title", children: greeting.title }),
        /* @__PURE__ */ jsx("p", { className: "aiseo-cw-greeting-sub", children: greeting.subtitle }),
        greeting.dismissable !== false && /* @__PURE__ */ jsx("button", { className: "aiseo-cw-greeting-close", onClick: () => setShowGreeting(false), "aria-label": "Dismiss", children: "\xD7" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-bar", children: [
        /* @__PURE__ */ jsxs("button", { className: "aiseo-cw-bar-tab aiseo-cw-bar-tab--connect", onClick: () => openPanel("home"), children: [
          /* @__PURE__ */ jsx(AiIcon, {}),
          "Connect"
        ] }),
        /* @__PURE__ */ jsxs("a", { className: "aiseo-cw-bar-tab", href: `tel:${business.contact.phoneTel}`, children: [
          /* @__PURE__ */ jsx(PhoneIcon, {}),
          "Call"
        ] }),
        /* @__PURE__ */ jsxs("button", { className: "aiseo-cw-bar-tab", onClick: () => openPanel("booking"), children: [
          /* @__PURE__ */ jsx(CalendarIcon, {}),
          "Book"
        ] }),
        /* @__PURE__ */ jsxs("button", { className: "aiseo-cw-bar-tab", onClick: () => openPanel("chat"), children: [
          /* @__PURE__ */ jsx(ChatIcon, {}),
          "Chat"
        ] })
      ] })
    ] }),
    panelOpen && /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-panel", role: "dialog", "aria-label": `${business.name} chat`, children: [
      /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-panel-header", children: [
        logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: logoAlt, className: "aiseo-cw-panel-logo" }) : /* @__PURE__ */ jsx("span", { style: { fontWeight: 700, fontSize: "1.125rem" }, children: business.name }),
        /* @__PURE__ */ jsx("div", { className: "aiseo-cw-panel-controls", children: /* @__PURE__ */ jsx("button", { className: "aiseo-cw-panel-btn", onClick: () => {
          setPanelOpen(false);
          setView("home");
        }, "aria-label": "Close", children: /* @__PURE__ */ jsx(CloseIcon, {}) }) })
      ] }),
      view === "home" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-home", children: [
          /* @__PURE__ */ jsx("h2", { className: "aiseo-cw-home-heading", children: panelHeading }),
          /* @__PURE__ */ jsxs("button", { className: "aiseo-cw-card-full aiseo-cw-card-full--book", onClick: () => setView("booking"), children: [
            /* @__PURE__ */ jsx(CalendarIcon, {}),
            bookLabel
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-card-row", children: [
            /* @__PURE__ */ jsxs("a", { className: "aiseo-cw-card-half aiseo-cw-card-half--email", href: `tel:${business.contact.phoneTel}`, children: [
              /* @__PURE__ */ jsx(PhoneIcon, {}),
              callLabel
            ] }),
            /* @__PURE__ */ jsxs("button", { className: "aiseo-cw-card-half aiseo-cw-card-half--chat", onClick: () => setView("chat"), children: [
              /* @__PURE__ */ jsx(ChatIcon, {}),
              chatLabel
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-ai-section", children: [
            /* @__PURE__ */ jsxs("p", { className: "aiseo-cw-ai-label", children: [
              "Chat with ",
              business.name,
              " ",
              /* @__PURE__ */ jsx("span", { className: "aiseo-cw-ai-badge", children: "AI" })
            ] }),
            /* @__PURE__ */ jsxs("form", { className: "aiseo-cw-ai-input-wrap", onSubmit: (e) => {
              e.preventDefault();
              if (homeInput.trim()) {
                send(homeInput);
                setView("chat");
              }
            }, children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: homeInput,
                  onChange: (e) => setHomeInput(e.target.value),
                  placeholder: chatPlaceholder
                }
              ),
              /* @__PURE__ */ jsx("button", { type: "submit", className: "aiseo-cw-ai-send", "aria-label": "Send", children: /* @__PURE__ */ jsx(SendIcon, {}) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-panel-footer", children: [
          /* @__PURE__ */ jsx("button", { "aria-label": "Menu", onClick: () => setView("capture"), children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", d: "M4 6h16M4 12h16M4 18h16" }) }) }),
          poweredByText && /* @__PURE__ */ jsx("span", { style: { fontSize: "0.625rem", color: "#94a3b8" }, children: poweredByText })
        ] })
      ] }),
      view === "chat" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-chat-header", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              style: { background: "none", border: "none", color: "inherit", cursor: "pointer", padding: "0.25rem" },
              onClick: () => setView("home"),
              "aria-label": "Back",
              children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", style: { width: "1.25rem", height: "1.25rem" }, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19l-7-7 7-7" }) })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "aiseo-cw-chat-avatar", children: /* @__PURE__ */ jsx(BoltIcon, {}) }),
          /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ jsx("p", { className: "aiseo-cw-chat-title", children: business.name }),
            /* @__PURE__ */ jsx("p", { className: "aiseo-cw-chat-status", children: afterHours ? "Closed \u2014 we'll reply soon" : "Typically replies instantly" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          ChatBody,
          {
            messages,
            sending,
            quickReplies: messages.length === 1 ? quickReplies : [],
            onQuick: (q) => {
              if (q === "Schedule a free estimate") setView("capture");
              else send(q);
            },
            bottomRef
          }
        ),
        showCaptureCta && /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-actions", children: [
          /* @__PURE__ */ jsx("button", { className: "aiseo-cw-cta-primary", onClick: () => setView("capture"), children: "Schedule estimate" }),
          /* @__PURE__ */ jsxs("a", { className: "aiseo-cw-cta-secondary", href: `tel:${business.contact.phoneTel}`, role: "button", children: [
            "Call ",
            business.contact.phone
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
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
              /* @__PURE__ */ jsx("button", { type: "submit", className: "aiseo-cw-send", disabled: !input.trim() || sending, children: /* @__PURE__ */ jsx(SendIcon, {}) })
            ]
          }
        )
      ] }),
      view === "booking" && /* @__PURE__ */ jsx(
        BookingFlow,
        {
          business,
          endpoint: bookingEndpoint,
          logoUrl,
          logoAlt,
          onBack: () => setView("home"),
          onSubmitted: () => setView("submitted")
        }
      ),
      view === "capture" && /* @__PURE__ */ jsx(
        CaptureForm,
        {
          business,
          conversation: messages,
          endpoint: leadEndpoint,
          onBack: () => setView("chat"),
          onSubmitted: () => setView("submitted")
        }
      ),
      view === "submitted" && /* @__PURE__ */ jsx(SuccessPanel, { business, onReset: reset, afterHours })
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
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "aiseo-cw-cta-secondary",
        type: "button",
        onClick: onReset,
        style: { padding: "0.5rem 1.25rem", borderRadius: "0.5rem", cursor: "pointer", border: `1px solid var(--aiseo-cw-primary, #3b82f6)`, background: "#fff", color: "var(--aiseo-cw-primary, #3b82f6)", fontWeight: 600, fontFamily: "inherit" },
        children: "Send another message"
      }
    )
  ] });
}
function BookingFlow({
  business,
  endpoint,
  logoUrl,
  logoAlt,
  onBack,
  onSubmitted
}) {
  const [step, setStep] = useState("issue");
  const [selectedService, setSelectedService] = useState(business.services?.[0]?.title ?? "General Electrical");
  const [selectedIssue, setSelectedIssue] = useState("");
  const [otherDescription, setOtherDescription] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotMode, setSlotMode] = useState("first");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [consentContact, setConsentContact] = useState(false);
  const [consentSms, setConsentSms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isOther = selectedIssue === "Other";
  const issues = business.bookingIssues?.[selectedService] ?? DEFAULT_ELECTRICAL_ISSUES;
  const timeSlots = useMemo(
    () => generateTimeSlots(business.contact.hoursStructured, 8),
    [business.contact.hoursStructured]
  );
  const displayedSlots = slotMode === "first" ? timeSlots.slice(0, 4) : timeSlots;
  async function onSubmit() {
    setError(null);
    if (!firstName.trim() || !phone.trim() || !email.trim() || !zip.trim()) {
      setError("First name, phone, email, and ZIP code are required.");
      return;
    }
    if (!consentContact) {
      setError("Please agree to be contacted.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        serviceType: selectedService,
        issue: isOther ? `Other: ${otherDescription.trim()}` : selectedIssue,
        timeSlot: selectedSlot,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        zip: zip.trim(),
        consentContact,
        consentSms,
        pageUrl: typeof window !== "undefined" ? window.location.href : void 0,
        capturedAt: (/* @__PURE__ */ new Date()).toISOString()
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
  const stepBack = () => {
    if (step === "summary") setStep("contact");
    else if (step === "contact") setStep("timeslot");
    else if (step === "timeslot") setStep("issue");
    else onBack();
  };
  return /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-booking", children: [
    /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-booking-header", children: [
      logoUrl ? /* @__PURE__ */ jsx("img", { src: logoUrl, alt: logoAlt ?? business.name, className: "aiseo-cw-booking-logo" }) : /* @__PURE__ */ jsx("span", { className: "aiseo-cw-booking-header-title", children: business.name }),
      /* @__PURE__ */ jsx("span", { className: "aiseo-cw-booking-header-sub", children: "Book Online Now!" }),
      /* @__PURE__ */ jsx("button", { className: "aiseo-cw-booking-close", onClick: onBack, "aria-label": "Close", children: /* @__PURE__ */ jsx(CloseIcon, {}) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-booking-progress", children: [
      step !== "issue" && /* @__PURE__ */ jsx("button", { className: "aiseo-cw-booking-progress-back", onClick: stepBack, "aria-label": "Back", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", style: { width: "1rem", height: "1rem" }, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19l-7-7 7-7" }) }) }),
      /* @__PURE__ */ jsx("div", { className: "aiseo-cw-booking-dots", children: ["issue", "timeslot", "contact", "summary"].map((s, i) => /* @__PURE__ */ jsx("div", { className: `aiseo-cw-booking-dot ${step === s ? "active" : ""} ${["issue", "timeslot", "contact", "summary"].indexOf(step) > i ? "done" : ""}` }, s)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-booking-body", children: [
      step === "issue" && /* @__PURE__ */ jsxs(Fragment, { children: [
        (business.services?.length ?? 0) > 1 && /* @__PURE__ */ jsx("div", { className: "aiseo-cw-booking-services", children: business.services.map((s) => /* @__PURE__ */ jsxs(
          "button",
          {
            className: `aiseo-cw-booking-service ${selectedService === s.title ? "active" : ""}`,
            onClick: () => {
              setSelectedService(s.title);
              setSelectedIssue("");
            },
            children: [
              /* @__PURE__ */ jsx(BoltIcon, {}),
              /* @__PURE__ */ jsx("span", { children: s.shortTitle ?? s.title })
            ]
          },
          s.slug ?? s.title
        )) }),
        /* @__PURE__ */ jsx("h3", { className: "aiseo-cw-booking-step-title", children: "What type of service can we help you with today?" }),
        /* @__PURE__ */ jsx("div", { className: "aiseo-cw-booking-issues", children: issues.map((issue) => /* @__PURE__ */ jsx(
          "button",
          {
            className: `aiseo-cw-booking-tag ${selectedIssue === issue.label ? "active" : ""}`,
            onClick: () => {
              setSelectedIssue(issue.label);
              if (issue.label !== "Other") setOtherDescription("");
            },
            children: issue.label
          },
          issue.label
        )) }),
        isOther && /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-field", style: { marginTop: "0.75rem" }, children: [
          /* @__PURE__ */ jsx("label", { className: "aiseo-cw-label", children: "Please describe your issue *" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              rows: 3,
              value: otherDescription,
              onChange: (e) => setOtherDescription(e.target.value),
              placeholder: "Describe the electrical issue you're experiencing\u2026",
              required: true,
              style: { resize: "vertical" }
            }
          )
        ] })
      ] }),
      step === "timeslot" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-booking-chip", children: [
          /* @__PURE__ */ jsx(BoltIcon, {}),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: selectedService }),
            /* @__PURE__ */ jsx("span", { className: "aiseo-cw-booking-chip-sub", children: isOther ? `Other: ${otherDescription}` : selectedIssue })
          ] }),
          /* @__PURE__ */ jsx("button", { className: "aiseo-cw-booking-edit", onClick: () => setStep("issue"), "aria-label": "Edit", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", style: { width: "0.875rem", height: "0.875rem" }, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }) })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "aiseo-cw-booking-step-title", children: "When do you need us?" }),
        /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-booking-slot-tabs", children: [
          /* @__PURE__ */ jsx("button", { className: slotMode === "first" ? "active" : "", onClick: () => setSlotMode("first"), children: "First Available" }),
          /* @__PURE__ */ jsx("button", { className: slotMode === "all" ? "active" : "", onClick: () => setSlotMode("all"), children: "All Appointments" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "aiseo-cw-booking-slots", children: displayedSlots.map((slot) => /* @__PURE__ */ jsxs("label", { className: `aiseo-cw-booking-slot ${selectedSlot?.label === slot.label ? "active" : ""}`, children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "radio",
              name: "timeslot",
              checked: selectedSlot?.label === slot.label,
              onChange: () => setSelectedSlot(slot)
            }
          ),
          /* @__PURE__ */ jsx(CalendarIcon, {}),
          /* @__PURE__ */ jsx("span", { children: slot.label })
        ] }, slot.label)) })
      ] }),
      step === "contact" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-booking-chip", children: [
          /* @__PURE__ */ jsx(BoltIcon, {}),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: isOther ? `Other: ${otherDescription}` : selectedIssue }),
            /* @__PURE__ */ jsxs("span", { className: "aiseo-cw-booking-chip-sub", children: [
              /* @__PURE__ */ jsx(CalendarIcon, {}),
              " ",
              selectedSlot?.label
            ] }),
            business.contact.address && /* @__PURE__ */ jsxs("span", { className: "aiseo-cw-booking-chip-sub", children: [
              /* @__PURE__ */ jsx(LocationIcon, {}),
              " ",
              business.contact.address.city,
              ", ",
              business.contact.address.state
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "aiseo-cw-booking-step-title", children: "How should we reach you?" }),
        /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-booking-form-grid", children: [
          /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-field", children: [
            /* @__PURE__ */ jsx("label", { className: "aiseo-cw-label", children: "First Name *" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: firstName, onChange: (e) => setFirstName(e.target.value), placeholder: "John", required: true })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-field", children: [
            /* @__PURE__ */ jsx("label", { className: "aiseo-cw-label", children: "Last Name" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: lastName, onChange: (e) => setLastName(e.target.value), placeholder: "Doe" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-field", children: [
            /* @__PURE__ */ jsx("label", { className: "aiseo-cw-label", children: "Phone *" }),
            /* @__PURE__ */ jsx("input", { type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "(123) 456-7890", required: true })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-field", children: [
            /* @__PURE__ */ jsx("label", { className: "aiseo-cw-label", children: "Email *" }),
            /* @__PURE__ */ jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", required: true })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-field", style: { marginTop: "0.5rem" }, children: [
          /* @__PURE__ */ jsx("label", { className: "aiseo-cw-label", children: "ZIP Code *" }),
          /* @__PURE__ */ jsx("input", { type: "text", inputMode: "numeric", pattern: "\\d{5}", value: zip, onChange: (e) => setZip(e.target.value), placeholder: "77001", required: true })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "aiseo-cw-booking-consent", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: consentContact, onChange: (e) => setConsentContact(e.target.checked) }),
          /* @__PURE__ */ jsx("span", { children: "I am the owner of this property and I agree to be contacted for my service request, promotions and marketing purposes. *" })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "aiseo-cw-booking-consent", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: consentSms, onChange: (e) => setConsentSms(e.target.checked) }),
          /* @__PURE__ */ jsx("span", { children: "Receive text messages about appointment" })
        ] })
      ] }),
      step === "summary" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "aiseo-cw-booking-summary-label", children: "SUMMARY" }),
        /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-booking-chip", children: [
          /* @__PURE__ */ jsx(BoltIcon, {}),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: selectedService }),
            /* @__PURE__ */ jsx("span", { className: "aiseo-cw-booking-chip-sub", children: isOther ? `Other: ${otherDescription}` : selectedIssue })
          ] }),
          /* @__PURE__ */ jsx("button", { className: "aiseo-cw-booking-edit", onClick: () => setStep("issue"), "aria-label": "Edit", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", style: { width: "0.875rem", height: "0.875rem" }, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-booking-summary-detail", children: [
          /* @__PURE__ */ jsx(CalendarIcon, {}),
          /* @__PURE__ */ jsx("span", { children: selectedSlot?.label })
        ] }),
        business.contact.address && /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-booking-summary-detail", children: [
          /* @__PURE__ */ jsx(LocationIcon, {}),
          /* @__PURE__ */ jsxs("span", { children: [
            business.contact.address.city,
            ", ",
            business.contact.address.state
          ] })
        ] }),
        /* @__PURE__ */ jsx("hr", { className: "aiseo-cw-booking-divider" }),
        /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-booking-summary-contact", children: [
          /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsxs("strong", { children: [
            firstName,
            " ",
            lastName
          ] }) }),
          /* @__PURE__ */ jsx("p", { children: phone }),
          /* @__PURE__ */ jsx("p", { children: email }),
          /* @__PURE__ */ jsxs("p", { children: [
            "ZIP: ",
            zip
          ] })
        ] })
      ] })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "aiseo-cw-error", style: { padding: "0 1rem" }, children: error }),
    /* @__PURE__ */ jsxs("div", { className: "aiseo-cw-booking-footer", children: [
      business.contact.emergencyAvailable && /* @__PURE__ */ jsxs("a", { className: "aiseo-cw-booking-emergency", href: `tel:${business.contact.phoneTel}`, children: [
        /* @__PURE__ */ jsx(PhoneIcon, {}),
        " Emergency"
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "aiseo-cw-booking-continue",
          disabled: step === "issue" && (!selectedIssue || isOther && !otherDescription.trim()) || step === "timeslot" && !selectedSlot || step === "contact" && (!firstName.trim() || !phone.trim() || !email.trim() || !zip.trim() || !consentContact) || submitting,
          onClick: () => {
            if (step === "issue") setStep("timeslot");
            else if (step === "timeslot") setStep("contact");
            else if (step === "contact") setStep("summary");
            else if (step === "summary") onSubmit();
          },
          children: step === "summary" ? submitting ? "Booking\u2026" : "Confirm Booking" : "Continue Booking"
        }
      )
    ] })
  ] });
}
function darkenHex(hex, factor) {
  const h = hex.replace("#", "");
  const r = Math.max(0, Math.round(parseInt(h.slice(0, 2), 16) * (1 - factor)));
  const g = Math.max(0, Math.round(parseInt(h.slice(2, 4), 16) * (1 - factor)));
  const b = Math.max(0, Math.round(parseInt(h.slice(4, 6), 16) * (1 - factor)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
export {
  ChatWidget,
  greetingForTime,
  isAfterHours
};
//# sourceMappingURL=index.js.map