export type HoursStructured = {
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
};

export type BusinessForChat = {
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
  services?: Array<{ slug?: string; title: string; shortTitle?: string }>;
  pricing?: Array<{ name: string; price: string; description?: string }>;
  /** Predefined issue tags shown in the booking flow. Grouped by service slug. */
  bookingIssues?: Record<string, BookingIssue[]>;
};

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type LeadCapture = {
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
export type BookingIssue = {
  label: string;
  serviceSlug?: string;
};

/** A selectable time window */
export type BookingTimeSlot = {
  date: string;       // e.g. "Fri, May 1"
  dateISO: string;    // e.g. "2026-05-01"
  startTime: string;  // e.g. "8:00 AM"
  endTime: string;    // e.g. "12:00 PM"
  label: string;      // e.g. "Fri, May 1, 8:00 AM - 12:00 PM"
};

/** Full booking submission payload */
export type BookingData = {
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

export type WidgetMode = 'chat' | 'capture' | 'submitted';

export type WidgetPosition = 'bottom-right' | 'bottom-left';
export type LauncherSize = 'sm' | 'md' | 'lg';

/** Branding configuration for the widget */
export type WidgetBranding = {
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
};

/** A greeting bubble shown above the bottom bar when collapsed */
export type WidgetGreeting = {
  /** Title line, e.g. "Welcome to Voltz Electric" */
  title: string;
  /** Subtitle line, e.g. "I'm here if you have any questions or need help!" */
  subtitle: string;
  /** Delay in ms before showing the greeting bubble. Defaults to 2000. */
  delay?: number;
  /** Allow user to dismiss the greeting. Defaults to true. */
  dismissable?: boolean;
};

export type WidgetConfig = {
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
