# @aiseo/chat-widget

Reusable hybrid chat widget for electrician customer sites.

- AI conversation by default (Claude API) — answers service/pricing questions
- Detects booking intent and surfaces a structured lead-capture form
- Lead form submits to Resend; emails the configured recipient
- After-hours aware (reads `business.contact.hoursStructured`)
- Inherits brand colors from CSS variables — zero JS theming

## Install

In your site's `package.json`:

```json
{
  "dependencies": {
    "@aiseo/chat-widget": "github:ktom-site/aiseo-chat-widget#v0.1.0",
    "resend": "^4.0.0"
  }
}
```

## Wire it up

### 1. Render the widget in your layout

```tsx
// app/layout.tsx
import { ChatWidget } from '@aiseo/chat-widget';
import { business } from '@/data/business';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <ChatWidget business={business} />
      </body>
    </html>
  );
}
```

### 2. Add the two API routes

```ts
// app/api/chat/route.ts
import { createChatHandler } from '@aiseo/chat-widget/api';
import { business } from '@/data/business';

export const POST = createChatHandler({ business });
```

```ts
// app/api/chat-lead/route.ts
import { createChatLeadHandler } from '@aiseo/chat-widget/api';
import { business } from '@/data/business';

export const POST = createChatLeadHandler({ business });
```

### 3. Set env vars in Vercel

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | No (falls back to keyword replies) | AI conversation |
| `RESEND_API_KEY` | No (falls back to console.log) | Lead email delivery |
| `LEAD_RECIPIENT_EMAIL` | No (falls back to `business.contact.email`) | Where leads go. Comma-separated for multiple. |
| `LEAD_FROM_EMAIL` | No (defaults to `onboarding@resend.dev`) | Sender address. Use a verified domain in Resend. |

### 4. (Optional) Theme it

Add to your `app/globals.css`:

```css
:root {
  --color-brand: #c1272d;
  --color-brand-accent: #c9a35e;
}
```

The widget reads these. No need to import any CSS file.

## Business data shape

Minimal `business` object the widget consumes:

```ts
{
  name: 'Sunbelt Electric, Inc.',
  contact: {
    phone: '480-248-8205',
    phoneTel: '+14802488205',
    email: 'support@sunbeltelectric.com',
    hoursStructured: { mon: '08:00-16:00', tue: '08:00-16:00', /* … */ sun: 'closed' },
    emergencyAvailable: true,
  },
  services: [{ slug: 'panel', title: 'Panel upgrades' }, /* … */],
  pricing: [{ name: 'Diagnostic', price: '$79' }, /* … */],
  serviceArea: ['Phoenix', 'Scottsdale', /* … */],
}
```

See `BusinessForChat` type for the full shape.

## Local development (workspace)

The widget lives in a pnpm workspace at `/Users/kamaltom/workspaces/custom-sites/`. Sample sites consume it via `workspace:*` resolution; published deploys use the GitHub URL dependency.

```bash
cd /Users/kamaltom/workspaces/custom-sites
pnpm install
pnpm --filter @aiseo/chat-widget dev      # tsup watch
pnpm --filter electrician-sample-6 dev    # site dev server
```

## Release

```bash
cd packages/chat-widget
npm version patch   # or minor/major
pnpm build          # produces dist/
git add -A && git commit -m "release: vX.Y.Z"
git tag vX.Y.Z
git push --tags
```

Then bump consumers' `package.json` to point at `#vX.Y.Z`.
