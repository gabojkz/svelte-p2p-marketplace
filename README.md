# ⚡ AuthFlow - SvelteKit Authentication Starter

A production-ready authentication starter with **SvelteKit**, **Better Auth**, **PostgreSQL**, **Podman**, **Supabase**, and **Cloudflare Pages** deployment.

## 🎯 Use as Template

Create a new app from this starter:

```bash
# Option 1: Use the create script
cd sveltekit-auth-app
./create-app.sh my-new-app

# Option 2: Manual copy
cp -r sveltekit-auth-app my-new-app
cd my-new-app
rm -rf .git node_modules .svelte-kit
npm install
```

## 🚀 Features

- **🔐 Better Auth** - Modern authentication with JSDoc types
- **🐘 PostgreSQL** - Battle-tested relational database
- **🐳 Podman** - Container-based local development
- **☁️ Supabase** - Managed PostgreSQL for production
- **⚡ Cloudflare Pages** - Edge deployment with Workers
- **🎨 Beautiful UI** - Modern dark theme with smooth animations

## 📋 Prerequisites

- Node.js 20+
- Podman (for local development)
- Supabase account (for production database)
- Cloudflare account (for deployment)

## 🏃 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Local Development with Podman

Start the PostgreSQL database:

```bash
npm run podman:up
```

This starts:
- PostgreSQL on `localhost:5433`
- Adminer (DB admin UI) on `localhost:8080`

### 3. Configure Environment

Create a `.env` file:

```env
# Local development (Podman PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/auth_db"
BETTER_AUTH_SECRET="your-super-secret-key-generate-with-openssl-rand-base64-32"
```

### 4. Run Database Migrations

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` 🎉

## 🗄️ Production Setup with Supabase

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **Project Settings** → **Database** → **Connection string**
3. Copy the **URI** connection string (use Transaction pooler for serverless)

### 2. Configure Production Database

Run migrations against Supabase:

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" npm run db:push
```

### 3. Set Cloudflare Secrets

```bash
wrangler secret put DATABASE_URL
wrangler secret put BETTER_AUTH_SECRET
```

## ☁️ Deploy to Cloudflare Pages

### Build & Deploy

```bash
npm run build
npm run deploy
```

Or connect your GitHub repo to Cloudflare Pages for automatic deployments.

### Cloudflare Pages Settings

- **Build command**: `npm run build`
- **Build output directory**: `.svelte-kit/cloudflare`
- **Node.js version**: `20`

## 📁 Project Structure

```
├── src/
│   ├── lib/
│   │   ├── server/
│   │   │   ├── auth.js       # Better Auth configuration
│   │   │   ├── db.js         # Database connection
│   │   │   └── schema.js     # Drizzle schema
│   │   └── auth-client.js    # Client-side auth
│   ├── routes/
│   │   ├── api/auth/[...all]/  # Auth API endpoints
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── dashboard/        # Protected dashboard
│   │   └── +page.svelte      # Landing page
│   ├── hooks.server.js       # Session handling
│   └── app.d.ts              # Type definitions
├── podman-compose.yaml       # Local database setup
├── wrangler.toml             # Cloudflare configuration
├── drizzle.config.js         # Drizzle ORM config
├── create-app.sh             # Template scaffolding script
└── init.sql                  # Database initialization
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run podman:up` | Start local PostgreSQL |
| `npm run podman:down` | Stop local PostgreSQL |
| `npm run podman:logs` | View container logs |
| `npm run db:generate` | Generate migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run deploy` | Deploy to Cloudflare |

## 🔒 Authentication Features

- Email/Password registration and login
- Secure session management
- Protected routes with server-side checks
- JSDoc type annotations

## 🎨 Customization

### Adding OAuth Providers

Update `src/lib/server/auth.js`:

```javascript
import { betterAuth } from 'better-auth';

export function createAuth(databaseUrl, baseUrl) {
  return betterAuth({
    // ... existing config
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      },
    },
  });
}
```

### Email Verification

Enable in auth config:

```javascript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
  sendVerificationEmail: async ({ user, url }) => {
    // Send email via Resend, SendGrid, etc.
  }
}
```

## 📚 Resources

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
- [Supabase Docs](https://supabase.com/docs)

## 📄 License

MIT License - feel free to use this starter for your projects!



Todos
- Auth
    - [ ] Add OAuth providers (Google, GitHub)
    - [ ] Enable email verification
    - [ ] Set up password reset
    - [ ] Add two-factor authentication
