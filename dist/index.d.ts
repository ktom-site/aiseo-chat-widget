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
    /** Predefined issue tags shown in the booking flow. Grouped by service slug. */
    bookingIssues?: Record<string, BookingIssue[]>;
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
/** A predefined issue tag within a service category */
type BookingIssue = {
    label: string;
    serviceSlug?: string;
};
/** A selectable time window */
type BookingTimeSlot = {
    date: string;
    dateISO: string;
    startTime: string;
    endTime: string;
    label: string;
};
/** Full booking submission payload */
type BookingData = {
    serviceType: string;
    issue: string;
    timeSlot: BookingTimeSlot;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    zip?: string;
    consentContact: boolean;
    consentSms: boolean;
    pageUrl?: string;
    capturedAt: string;
};
type WidgetMode = 'chat' | 'capture' | 'submitted';
type WidgetPosition = 'bottom-right' | 'bottom-left';
type LauncherSize = 'sm' | 'md' | 'lg';
/** Branding configuration for the widget */
type WidgetBranding = {
    /** URL to a logo image displayed in the panel header. */
    logoUrl?: string;
    /** Alt text for the logo image. */
    logoAlt?: string;
    /** Primary brand color (hex). Used for bottom bar, action cards, send button, etc. */
    primaryColor?: string;
    /** Secondary/darker shade for the "Chat with Us" card. Auto-derived if omitted. */
    secondaryColor?: string;
    /** Foreground (text) color on primary backgrounds. Defaults to '#ffffff'. */
    primaryFg?: string;
    /** Accent color for highlights (AI badge, links). Defaults to primaryColor. */
    accentColor?: string;
    /** Color of the launcher (bottom bar / mobile bubble). Auto-derived from primaryColor with luminance contrast for any site bg. Override to force a specific shade. */
    launcherColor?: string;
    /** Ring/halo color around the launcher to ensure contrast. Defaults to white. */
    launcherRing?: string;
};
/** A greeting bubble shown above the bottom bar when collapsed */
type WidgetGreeting = {
    /** Title line, e.g. "Welcome to Voltz Electric" */
    title: string;
    /** Subtitle line, e.g. "I'm here if you have any questions or need help!" */
    subtitle: string;
    /** Delay in ms before showing the greeting bubble. Defaults to 2000. */
    delay?: number;
    /** Allow user to dismiss the greeting. Defaults to true. */
    dismissable?: boolean;
};
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
    /** Custom branding (logo, colors). */
    branding?: WidgetBranding;
    /** Greeting bubble shown above the bottom bar when collapsed. */
    greeting?: WidgetGreeting;
    /** Heading text shown in the expanded panel. Defaults to "How can we help?" */
    panelHeading?: string;
    /** Label for the Call action card. Defaults to "Call Me". */
    callLabel?: string;
    /** Label for the Email action card. Defaults to "Email Us". */
    emailLabel?: string;
    /** Label for the Chat action card. Defaults to "Chat with Us". */
    chatLabel?: string;
    /** Placeholder text for the chat input. Defaults to "Chat with us—just start typing." */
    chatPlaceholder?: string;
    /** Label for the Book Online action card. Defaults to "Book Online". */
    bookLabel?: string;
    /** Endpoint for booking form submission. Defaults to `/api/booking`. */
    bookingEndpoint?: string;
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

export { type BookingData, type BookingIssue, type BookingTimeSlot, type BusinessForChat, type ChatMessage, type ChatRole, ChatWidget, type ChatWidgetProps, type HoursStructured, type LauncherSize, type LeadCapture, type WidgetBranding, type WidgetConfig, type WidgetGreeting, type WidgetMode, type WidgetPosition, greetingForTime, isAfterHours };
