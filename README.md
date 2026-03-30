# Shemt

**Shemt** is a modern, premium SaaS analytics platform designed to track events, monitor revenue, and deliver AI-powered insights across multiple workspaces and projects.

## 🚀 Key Features

- **Multi-Project Analytics:** Create isolated workspaces to track individual projects, managing unique `public_api_key`s, user sessions, and custom conversion events natively.
- **AI-Powered Insights:** Features an interactive dashboard assistant built on GPT-4o and Supabase Edge Functions. It can auto-generate daily trends based on your real-time Postgres metrics or answer specific questions about your data.
- **Real-Time Notification Engine:** Completely automated, event-driven notification dispatch system with UI categorizations for Onboarding, Billing actions, and daily AI Insights, polling instantaneously via Supabase Realtime subscriptions.
- **Automated Subscription Billing:** Integrated Paystack Pro upgrades with automated webhook listeners (`subscription.create`, `subscription.disable`) seamlessly downgrading or upgrading accounts behind the scenes.
- **Premium User Experience:** Built with high-end, smooth animations using Framer Motion, gorgeous dark mode theming, and accessible Radix UI primitives.

## 🛠 Tech Stack

**Frontend Ecosystem:**
* **React 18** + **Vite** (Lightning fast HMR)
* **TypeScript** (Strict mode)
* **TailwindCSS** + **Shadcn/UI** (Flexible, accessible UI components)
* **Framer Motion** (Complex overlay animations and page transitions)
* **Lucide React** (Consistent icon sets)

**Backend as a Service (BaaS):**
* **Supabase Auth** (Secure email/password handling)
* **Supabase Postgres Database** (Relational data, Row Level Security)
* **Supabase Edge Functions** (Serverless Deno logic for AI and Webhooks)
* **Supabase Realtime** (Websocket data sync)

**Integrations:**
* **Paystack API** (Nigerian/African payment gating)
* **OpenAI API** (Under the hood of the Edge Functions)

## 🏁 Getting Started

### Prerequisites
* Node.js 18+
* A [Supabase](https://supabase.com) account & project
* A [Paystack](https://paystack.com) account

### Environment Variables
Duplicate the `.env.local.example` or create a `.env.local` file in your root directory and add the following keys:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

*(For backend Edge Functions, the generic Supabase CLI `.env` is required containing `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, and `OPENAI_API_KEY`)*

### Database Setup
Before the app can function, you must establish the database schemas, policies, and views. 
Navigate to `supabase/schema.sql` and execute the raw SQL directly inside your Supabase Dashboard SQL Editor. This will instantly build the `users`, `projects`, `events`, and `notifications` tables, alongside the `metrics_summary` view.

### Installation
```bash
# Install all dependencies
npm install

# Start the local development server
npm run dev
```

## 🔐 Security & RLS
Shemt is built with a heavy emphasis on zero-trust UI. Almost all security logic relies entirely on Postgres **Row Level Security (RLS)**. No user can read, query, or delete an event, project, or notification that doesn't explicitly belong to their `auth.uid()`, preventing cross-account data leakage at the database layer.