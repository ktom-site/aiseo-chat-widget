// src/api/createChatHandler.ts
import { NextResponse } from "next/server";
import { z } from "zod";

// src/systemPrompt.ts
function buildSystemPrompt(business, opts) {
  const services = (business.services ?? []).map((s) => `- ${s.title}`).join("\n") || "- General electrical work";
  const pricing = (business.pricing ?? []).map((p) => `- ${p.name}: ${p.price}${p.description ? ` (${p.description})` : ""}`).join("\n") || "- Pricing varies by job; we provide free estimates on most work.";
  const area = (business.serviceArea ?? []).slice(0, 30).join(", ") || business.contact.address?.city || "the local area";
  const emergencyLine = business.contact.emergencyAvailable ? "Emergency service is available \u2014 for active hazards (sparks, smoke, dead panel), tell the user to call now." : "";
  const closedLine = opts.afterHours ? "The shop is currently CLOSED. Set expectation that a human will reply during business hours, but capture their info now." : "The shop is OPEN right now. Encourage the user to call or schedule a free estimate.";
  return [
    `You are the friendly virtual assistant for ${business.name}, a licensed electrician.`,
    business.shortDescription ? `About: ${business.shortDescription}` : "",
    "",
    "BUSINESS FACTS:",
    `- Phone: ${business.contact.phone}`,
    `- Email: ${business.contact.email}`,
    business.contact.address ? `- Location: ${business.contact.address.city}, ${business.contact.address.state}` : "",
    `- Service area: ${area}`,
    "",
    "SERVICES:",
    services,
    "",
    'PRICING (always say "starting from" or "typically" \u2014 never quote a fixed final price):',
    pricing,
    "",
    "YOUR ROLE:",
    "- Answer questions about services, rough pricing, and availability.",
    "- Be friendly, helpful, professional. Keep replies to 2-3 short sentences.",
    "- Always offer to either (a) call the phone number or (b) schedule a free estimate.",
    "- If the user asks for a price, give a rough range and recommend a free estimate.",
    "- If the user mentions an emergency, sparks, smoke, or burning smell, tell them to call NOW.",
    '- If the user signals booking intent ("schedule", "book", "estimate", "appointment", "callback", "send a tech"), end your reply with: "Want me to grab your details so we can reach out? Just tap **Schedule estimate** below."',
    "- Never make up information not provided here. If unsure, point to the phone number.",
    "",
    `STATUS: ${closedLine}`,
    emergencyLine
  ].filter(Boolean).join("\n");
}

// src/hours.ts
var DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
function isAfterHours(hours, date = /* @__PURE__ */ new Date()) {
  if (!hours) return false;
  const dayKey = DAY_KEYS[date.getDay()];
  const window = hours[dayKey];
  if (!window || window === "closed") return true;
  const match = window.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
  if (!match) return false;
  const [, oh, om, ch, cm] = match;
  const now = date.getHours() * 60 + date.getMinutes();
  const open = Number(oh) * 60 + Number(om);
  const close = Number(ch) * 60 + Number(cm);
  return now < open || now >= close;
}

// src/api/createChatHandler.ts
var ReqSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string()
  })).min(1).max(40)
});
function createChatHandler(opts) {
  const business = opts.business;
  const model = opts.model ?? "claude-haiku-4-5-20251001";
  const maxTokens = opts.maxTokens ?? 220;
  return async function POST(req) {
    let body;
    try {
      body = ReqSchema.parse(await req.json());
    } catch {
      return NextResponse.json({ reply: `Sorry, something went wrong. Please call ${business.contact.phone}.` }, { status: 400 });
    }
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const afterHours = isAfterHours(business.contact.hoursStructured);
    if (!apiKey) {
      return NextResponse.json({ reply: fallbackReply(body.messages[body.messages.length - 1]?.content ?? "", business) });
    }
    const systemPrompt = buildSystemPrompt(business, { afterHours });
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: body.messages.filter((m) => m.role === "user" || m.role === "assistant").map((m) => ({ role: m.role, content: m.content }))
        })
      });
      if (!res.ok) {
        return NextResponse.json({ reply: fallbackReply(body.messages[body.messages.length - 1]?.content ?? "", business) });
      }
      const data = await res.json();
      const reply = data?.content?.[0]?.text || fallbackReply(body.messages[body.messages.length - 1]?.content ?? "", business);
      return NextResponse.json({ reply });
    } catch {
      return NextResponse.json({ reply: fallbackReply(body.messages[body.messages.length - 1]?.content ?? "", business) });
    }
  };
}
function fallbackReply(lastUserText, business) {
  const t = lastUserText.toLowerCase();
  const phone = business.contact.phone;
  const services = business.services?.map((s) => s.shortTitle ?? s.title).join(", ") ?? "electrical work";
  if (/emergency|spark|smoke|burning/.test(t)) {
    return `For an active electrical hazard, please call us right now at ${phone}.`;
  }
  if (/service|offer|do you/.test(t)) {
    return `We handle ${services}. Want to schedule a free estimate? Tap **Schedule estimate** below.`;
  }
  if (/price|cost|how much|panel|upgrade/.test(t)) {
    return `Pricing depends on the scope. We'd give you a free written estimate \u2014 tap **Schedule estimate** below or call ${phone}.`;
  }
  if (/schedule|estimate|book|appointment/.test(t)) {
    return `Happy to help! Tap **Schedule estimate** below and we'll reach out, or call ${phone} now.`;
  }
  return `Thanks for reaching out! For a quick answer or quote, please call ${phone} or tap **Schedule estimate** below.`;
}

// src/api/createChatLeadHandler.ts
import { NextResponse as NextResponse2 } from "next/server";
import { z as z2 } from "zod";
var ChatMsgSchema = z2.object({
  role: z2.enum(["user", "assistant", "system"]),
  content: z2.string()
});
var LeadSchema = z2.object({
  name: z2.string().trim().min(1).max(120),
  phone: z2.string().trim().min(7).max(40),
  serviceType: z2.string().trim().max(120).optional(),
  urgency: z2.enum(["emergency", "today", "this-week", "flexible"]).optional(),
  zip: z2.string().trim().max(15).optional(),
  email: z2.string().email().optional(),
  note: z2.string().trim().max(2e3).optional(),
  pageUrl: z2.string().trim().max(500).optional(),
  capturedAt: z2.string(),
  conversation: z2.array(ChatMsgSchema).max(60).optional()
});
function createChatLeadHandler(opts) {
  const business = opts.business;
  return async function POST(req) {
    let lead;
    try {
      lead = LeadSchema.parse(await req.json());
    } catch (err) {
      return NextResponse2.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }
    const apiKey = process.env.RESEND_API_KEY;
    const recipient = opts.recipient ?? splitList(process.env.LEAD_RECIPIENT_EMAIL) ?? business.contact.email;
    const from = opts.from ?? process.env.LEAD_FROM_EMAIL ?? "onboarding@resend.dev";
    const afterHours = isAfterHours(business.contact.hoursStructured);
    const subject = opts.subjectFn ? opts.subjectFn(lead) : defaultSubject(lead, business, afterHours);
    const html = renderHtml(lead, business, afterHours);
    const text = renderText(lead, business);
    if (!apiKey) {
      console.log("[chat-widget] RESEND_API_KEY not set \u2014 lead captured but not emailed:", JSON.stringify({ subject, recipient, lead }));
      return NextResponse2.json({ ok: true, delivered: false });
    }
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const result = await resend.emails.send({
        from,
        to: Array.isArray(recipient) ? recipient : [recipient],
        subject,
        html,
        text,
        replyTo: lead.email
      });
      if (result.error) {
        console.error("[chat-widget] resend error", result.error);
        return NextResponse2.json({ ok: true, delivered: false });
      }
      return NextResponse2.json({ ok: true, delivered: true });
    } catch (err) {
      console.error("[chat-widget] send error", err);
      return NextResponse2.json({ ok: true, delivered: false });
    }
  };
}
function splitList(v) {
  if (!v) return void 0;
  const parts = v.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : void 0;
}
function defaultSubject(lead, business, afterHours) {
  const tag = lead.urgency === "emergency" ? "\u{1F6A8} EMERGENCY" : lead.urgency === "today" ? "\u26A1 Today" : afterHours ? "\u{1F319} After-hours" : "New lead";
  return `[${business.name}] ${tag} \u2014 ${lead.name} (${lead.phone})`;
}
function renderHtml(lead, business, afterHours) {
  const rows = [
    ["Name", lead.name],
    ["Phone", `<a href="tel:${escapeAttr(lead.phone)}">${escapeHtml(lead.phone)}</a>`],
    ["Email", lead.email ? `<a href="mailto:${escapeAttr(lead.email)}">${escapeHtml(lead.email)}</a>` : void 0],
    ["Service", lead.serviceType],
    ["Urgency", lead.urgency],
    ["ZIP", lead.zip],
    ["Notes", lead.note ? escapeHtml(lead.note).replace(/\n/g, "<br>") : void 0],
    ["Page URL", lead.pageUrl ? `<a href="${escapeAttr(lead.pageUrl)}">${escapeHtml(lead.pageUrl)}</a>` : void 0],
    ["Captured", new Date(lead.capturedAt).toLocaleString("en-US")],
    ["Status", afterHours ? "After-hours" : "Business hours"]
  ];
  const tableRows = rows.filter(([, v]) => v !== void 0 && v !== "").map(([k, v]) => `<tr><td style="padding:6px 12px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">${k}</td><td style="padding:6px 12px;color:#0f172a;">${v}</td></tr>`).join("");
  const convo = (lead.conversation ?? []).map((m) => `<p style="margin:4px 0;font-size:13px;"><strong style="color:${m.role === "user" ? "#c1272d" : "#64748b"};">${m.role === "user" ? "Customer" : "Bot"}:</strong> ${escapeHtml(m.content)}</p>`).join("");
  return `
<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:system-ui,sans-serif;">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#1a1414;color:#fff;padding:16px 20px;">
      <h2 style="margin:0;font-size:16px;font-weight:700;">New chat lead \u2014 ${escapeHtml(business.name)}</h2>
      <p style="margin:4px 0 0;font-size:12px;opacity:0.7;">Captured via website chat widget</p>
    </div>
    <table style="width:100%;border-collapse:collapse;">${tableRows}</table>
    ${convo ? `<div style="padding:12px 20px;border-top:1px solid #e2e8f0;background:#fafafa;"><p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Conversation transcript</p>${convo}</div>` : ""}
  </div>
</body></html>`.trim();
}
function renderText(lead, business) {
  const lines = [
    `New chat lead \u2014 ${business.name}`,
    "",
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : "",
    lead.serviceType ? `Service: ${lead.serviceType}` : "",
    lead.urgency ? `Urgency: ${lead.urgency}` : "",
    lead.zip ? `ZIP: ${lead.zip}` : "",
    lead.note ? `Notes: ${lead.note}` : "",
    lead.pageUrl ? `Page: ${lead.pageUrl}` : "",
    `Captured: ${new Date(lead.capturedAt).toLocaleString("en-US")}`
  ];
  if (lead.conversation && lead.conversation.length) {
    lines.push("", "Conversation:");
    for (const m of lead.conversation) {
      lines.push(`  ${m.role === "user" ? "Customer" : "Bot"}: ${m.content}`);
    }
  }
  return lines.filter(Boolean).join("\n");
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escapeAttr(s) {
  return escapeHtml(s);
}
export {
  createChatHandler,
  createChatLeadHandler
};
//# sourceMappingURL=index.js.map