import { NextResponse } from 'next/server';
import { z } from 'zod';

type HoursStructured = {
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
};
type BusinessForChat = {
    name: string;
    shortDescription?: string;
    contact: {
        phone: string;
        phoneTel: string;
        email: string;
        address?: {
            street?: string;
            city: string;
            state: string;
            zip?: string;
        };
        hoursStructured?: HoursStructured;
        emergencyAvailable?: boolean;
    };
    serviceArea?: string[];
    services?: Array<{
        slug?: string;
        title: string;
        shortTitle?: string;
    }>;
    pricing?: Array<{
        name: string;
        price: string;
        description?: string;
    }>;
};

type CreateChatHandlerOpts = {
    business: BusinessForChat;
    /** Anthropic model. Defaults to claude-haiku-4-5-20251001. */
    model?: string;
    /** Max tokens per reply. Defaults to 220. */
    maxTokens?: number;
};
declare function createChatHandler(opts: CreateChatHandlerOpts): (req: Request) => Promise<NextResponse<{
    reply: string;
}>>;

declare const LeadSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    serviceType: z.ZodOptional<z.ZodString>;
    urgency: z.ZodOptional<z.ZodEnum<["emergency", "today", "this-week", "flexible"]>>;
    zip: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    note: z.ZodOptional<z.ZodString>;
    pageUrl: z.ZodOptional<z.ZodString>;
    capturedAt: z.ZodString;
    conversation: z.ZodOptional<z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["user", "assistant", "system"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        role: "user" | "assistant" | "system";
        content: string;
    }, {
        role: "user" | "assistant" | "system";
        content: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    capturedAt: string;
    serviceType?: string | undefined;
    urgency?: "emergency" | "today" | "this-week" | "flexible" | undefined;
    zip?: string | undefined;
    email?: string | undefined;
    note?: string | undefined;
    pageUrl?: string | undefined;
    conversation?: {
        role: "user" | "assistant" | "system";
        content: string;
    }[] | undefined;
}, {
    name: string;
    phone: string;
    capturedAt: string;
    serviceType?: string | undefined;
    urgency?: "emergency" | "today" | "this-week" | "flexible" | undefined;
    zip?: string | undefined;
    email?: string | undefined;
    note?: string | undefined;
    pageUrl?: string | undefined;
    conversation?: {
        role: "user" | "assistant" | "system";
        content: string;
    }[] | undefined;
}>;
type CreateChatLeadHandlerOpts = {
    business: BusinessForChat;
    /** Override the recipient. Defaults to env LEAD_RECIPIENT_EMAIL, falling back to business.contact.email. */
    recipient?: string | string[];
    /** Override the from address. Defaults to env LEAD_FROM_EMAIL, falling back to "leads@<domain>" or "onboarding@resend.dev". */
    from?: string;
    /** Override the email subject. Defaults to a smart subject based on urgency. */
    subjectFn?: (lead: z.infer<typeof LeadSchema>) => string;
};
declare function createChatLeadHandler(opts: CreateChatLeadHandlerOpts): (req: Request) => Promise<NextResponse<{
    ok: boolean;
    error: string;
}> | NextResponse<{
    ok: boolean;
    delivered: boolean;
}>>;

export { type CreateChatHandlerOpts, type CreateChatLeadHandlerOpts, createChatHandler, createChatLeadHandler };
