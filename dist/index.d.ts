import * as react from 'react';

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
type ChatRole = 'user' | 'assistant' | 'system';
type ChatMessage = {
    role: ChatRole;
    content: string;
};
type LeadCapture = {
    name: string;
    phone: string;
    serviceType?: string;
    urgency?: 'emergency' | 'today' | 'this-week' | 'flexible';
    zip?: string;
    email?: string;
    note?: string;
    pageUrl?: string;
    capturedAt: string;
    conversation?: ChatMessage[];
};
type WidgetMode = 'chat' | 'capture' | 'submitted';
type WidgetPosition = 'bottom-right' | 'bottom-left';
type LauncherSize = 'sm' | 'md' | 'lg';
type WidgetConfig = {
    /** Position of the launcher and panel. Defaults to 'bottom-right'. */
    position?: WidgetPosition;
    /** Size of the launcher button. Defaults to 'md'. */
    launcherSize?: LauncherSize;
    /** Panel width in rem. Defaults to 24. */
    panelWidth?: number;
    /** Panel border-radius in rem. Defaults to 1. */
    borderRadius?: number;
    /** Show a pulse animation on the launcher to attract attention. Defaults to true. */
    pulseOnLoad?: boolean;
    /** Apply a gradient to the header instead of a flat color. Defaults to true. */
    headerGradient?: boolean;
    /** Show a "Powered by" link at the bottom of the panel. */
    poweredByText?: string;
    /** Custom greeting delay in ms before the widget auto-opens. 0 = never auto-open. Defaults to 0. */
    autoOpenDelay?: number;
};

type ChatWidgetProps = {
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
declare function ChatWidget({ business, chatEndpoint, leadEndpoint, initialMessage, config, }: ChatWidgetProps): react.JSX.Element;

declare function isAfterHours(hours: HoursStructured | undefined, date?: Date): boolean;
declare function greetingForTime(date?: Date): string;

export { type BusinessForChat, type ChatMessage, type ChatRole, ChatWidget, type ChatWidgetProps, type HoursStructured, type LauncherSize, type LeadCapture, type WidgetConfig, type WidgetMode, type WidgetPosition, greetingForTime, isAfterHours };
