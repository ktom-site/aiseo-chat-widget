import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { BusinessForChat } from '../types';
import { isAfterHours } from '../hours';

const ChatMsgSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

const LeadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(7).max(40),
  serviceType: z.string().trim().max(120).optional(),
  urgency: z.enum(['emergency', 'today', 'this-week', 'flexible']).optional(),
  zip: z.string().trim().max(15).optional(),
  email: z.string().email().optional(),
  note: z.string().trim().max(2000).optional(),
  pageUrl: z.string().trim().max(500).optional(),
  capturedAt: z.string(),
  conversation: z.array(ChatMsgSchema).max(60).optional(),
});

export type CreateChatLeadHandlerOpts = {
  business: BusinessForChat;
  /** Override the recipient. Defaults to env LEAD_RECIPIENT_EMAIL, falling back to business.contact.email. */
  recipient?: string | string[];
  /** Override the from address. Defaults to env LEAD_FROM_EMAIL, falling back to "leads@<domain>" or "onboarding@resend.dev". */
  from?: string;
  /** Override the email subject. Defaults to a smart subject based on urgency. */
  subjectFn?: (lead: z.infer<typeof LeadSchema>) => string;
};

export function createChatLeadHandler(opts: CreateChatLeadHandlerOpts) {
  const business = opts.business;

  return async function POST(req: Request) {
    let lead: z.infer<typeof LeadSchema>;
    try {
      lead = LeadSchema.parse(await req.json());
    } catch (err) {
      return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const recipient = opts.recipient
      ?? splitList(process.env.LEAD_RECIPIENT_EMAIL)
      ?? business.contact.email;
    const from = opts.from
      ?? process.env.LEAD_FROM_EMAIL
      ?? 'onboarding@resend.dev';

    const afterHours = isAfterHours(business.contact.hoursStructured);
    const subject = opts.subjectFn
      ? opts.subjectFn(lead)
      : defaultSubject(lead, business, afterHours);

    const html = renderHtml(lead, business, afterHours);
    const text = renderText(lead, business);

    if (!apiKey) {
      console.log('[chat-widget] RESEND_API_KEY not set — lead captured but not emailed:', JSON.stringify({ subject, recipient, lead }));
      return NextResponse.json({ ok: true, delivered: false });
    }

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);
      const result = await resend.emails.send({
        from,
        to: Array.isArray(recipient) ? recipient : [recipient],
        subject,
        html,
        text,
        replyTo: lead.email,
      });
      if (result.error) {
        console.error('[chat-widget] resend error', result.error);
        return NextResponse.json({ ok: true, delivered: false });
      }
      return NextResponse.json({ ok: true, delivered: true });
    } catch (err) {
      console.error('[chat-widget] send error', err);
      return NextResponse.json({ ok: true, delivered: false });
    }
  };
}

function splitList(v: string | undefined): string[] | undefined {
  if (!v) return undefined;
  const parts = v.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : undefined;
}

function defaultSubject(lead: z.infer<typeof LeadSchema>, business: BusinessForChat, afterHours: boolean): string {
  const tag = lead.urgency === 'emergency'
    ? '🚨 EMERGENCY'
    : lead.urgency === 'today'
      ? '⚡ Today'
      : afterHours
        ? '🌙 After-hours'
        : 'New lead';
  return `[${business.name}] ${tag} — ${lead.name} (${lead.phone})`;
}

function renderHtml(lead: z.infer<typeof LeadSchema>, business: BusinessForChat, afterHours: boolean): string {
  const rows: Array<[string, string | undefined]> = [
    ['Name', lead.name],
    ['Phone', `<a href="tel:${escapeAttr(lead.phone)}">${escapeHtml(lead.phone)}</a>`],
    ['Email', lead.email ? `<a href="mailto:${escapeAttr(lead.email)}">${escapeHtml(lead.email)}</a>` : undefined],
    ['Service', lead.serviceType],
    ['Urgency', lead.urgency],
    ['ZIP', lead.zip],
    ['Notes', lead.note ? escapeHtml(lead.note).replace(/\n/g, '<br>') : undefined],
    ['Page URL', lead.pageUrl ? `<a href="${escapeAttr(lead.pageUrl)}">${escapeHtml(lead.pageUrl)}</a>` : undefined],
    ['Captured', new Date(lead.capturedAt).toLocaleString('en-US')],
    ['Status', afterHours ? 'After-hours' : 'Business hours'],
  ];

  const tableRows = rows
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">${k}</td><td style="padding:6px 12px;color:#0f172a;">${v}</td></tr>`)
    .join('');

  const convo = (lead.conversation ?? [])
    .map((m) => `<p style="margin:4px 0;font-size:13px;"><strong style="color:${m.role === 'user' ? '#c1272d' : '#64748b'};">${m.role === 'user' ? 'Customer' : 'Bot'}:</strong> ${escapeHtml(m.content)}</p>`)
    .join('');

  return `
<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:system-ui,sans-serif;">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#1a1414;color:#fff;padding:16px 20px;">
      <h2 style="margin:0;font-size:16px;font-weight:700;">New chat lead — ${escapeHtml(business.name)}</h2>
      <p style="margin:4px 0 0;font-size:12px;opacity:0.7;">Captured via website chat widget</p>
    </div>
    <table style="width:100%;border-collapse:collapse;">${tableRows}</table>
    ${convo ? `<div style="padding:12px 20px;border-top:1px solid #e2e8f0;background:#fafafa;"><p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Conversation transcript</p>${convo}</div>` : ''}
  </div>
</body></html>`.trim();
}

function renderText(lead: z.infer<typeof LeadSchema>, business: BusinessForChat): string {
  const lines = [
    `New chat lead — ${business.name}`,
    '',
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : '',
    lead.serviceType ? `Service: ${lead.serviceType}` : '',
    lead.urgency ? `Urgency: ${lead.urgency}` : '',
    lead.zip ? `ZIP: ${lead.zip}` : '',
    lead.note ? `Notes: ${lead.note}` : '',
    lead.pageUrl ? `Page: ${lead.pageUrl}` : '',
    `Captured: ${new Date(lead.capturedAt).toLocaleString('en-US')}`,
  ];
  if (lead.conversation && lead.conversation.length) {
    lines.push('', 'Conversation:');
    for (const m of lead.conversation) {
      lines.push(`  ${m.role === 'user' ? 'Customer' : 'Bot'}: ${m.content}`);
    }
  }
  return lines.filter(Boolean).join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escapeAttr(s: string): string {
  return escapeHtml(s);
}
