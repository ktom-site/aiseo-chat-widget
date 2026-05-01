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

export type WidgetMode = 'chat' | 'capture' | 'submitted';

export type WidgetPosition = 'bottom-right' | 'bottom-left';
export type LauncherSize = 'sm' | 'md' | 'lg';

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
};
