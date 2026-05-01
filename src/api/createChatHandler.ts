import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { BusinessForChat } from '../types';
import { buildSystemPrompt } from '../systemPrompt';
import { isAfterHours } from '../hours';

const ReqSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).min(1).max(40),
});

export type CreateChatHandlerOpts = {
  business: BusinessForChat;
  /** Anthropic model. Defaults to claude-haiku-4-5-20251001. */
  model?: string;
  /** Max tokens per reply. Defaults to 220. */
  maxTokens?: number;
};

export function createChatHandler(opts: CreateChatHandlerOpts) {
  const business = opts.business;
  const model = opts.model ?? 'claude-haiku-4-5-20251001';
  const maxTokens = opts.maxTokens ?? 220;

  return async function POST(req: Request) {
    let body: z.infer<typeof ReqSchema>;
    try {
      body = ReqSchema.parse(await req.json());
    } catch {
      return NextResponse.json({ reply: `Sorry, something went wrong. Please call ${business.contact.phone}.` }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const afterHours = isAfterHours(business.contact.hoursStructured);

    if (!apiKey) {
      return NextResponse.json({ reply: fallbackReply(body.messages[body.messages.length - 1]?.content ?? '', business) });
    }

    const systemPrompt = buildSystemPrompt(business, { afterHours });

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: body.messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) {
        return NextResponse.json({ reply: fallbackReply(body.messages[body.messages.length - 1]?.content ?? '', business) });
      }
      const data = await res.json();
      const reply: string = data?.content?.[0]?.text || fallbackReply(body.messages[body.messages.length - 1]?.content ?? '', business);
      return NextResponse.json({ reply });
    } catch {
      return NextResponse.json({ reply: fallbackReply(body.messages[body.messages.length - 1]?.content ?? '', business) });
    }
  };
}

function fallbackReply(lastUserText: string, business: BusinessForChat): string {
  const t = lastUserText.toLowerCase();
  const phone = business.contact.phone;
  const services = business.services?.map((s) => s.shortTitle ?? s.title).join(', ') ?? 'electrical work';

  if (/emergency|spark|smoke|burning/.test(t)) {
    return `For an active electrical hazard, please call us right now at ${phone}.`;
  }
  if (/service|offer|do you/.test(t)) {
    return `We handle ${services}. Want to schedule a free estimate? Tap **Schedule estimate** below.`;
  }
  if (/price|cost|how much|panel|upgrade/.test(t)) {
    return `Pricing depends on the scope. We'd give you a free written estimate — tap **Schedule estimate** below or call ${phone}.`;
  }
  if (/schedule|estimate|book|appointment/.test(t)) {
    return `Happy to help! Tap **Schedule estimate** below and we'll reach out, or call ${phone} now.`;
  }
  return `Thanks for reaching out! For a quick answer or quote, please call ${phone} or tap **Schedule estimate** below.`;
}
