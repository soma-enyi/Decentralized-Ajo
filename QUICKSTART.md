# Quick Start Guide - Stellar Ajo

Get Stellar Ajo running in 5 minutes!

## Installation (2 minutes)

```bash
# 1. Clone and install
git clone <repo-url>
cd stellar-ajo
pnpm install

# 2. Setup environment
cp .env.example .env.local

# 3. Create database
pnpm prisma migrate dev

# 4. Start the app
pnpm dev
```

Open http://localhost:3000 in your browser. That's it!

## First Run (3 minutes)

### 1. Create an Account
- Click "Get Started"
- Fill in registration form
- Use password: `TestPassword123!` (must have uppercase, lowercase, number)
- Click "Sign Up"

### 2. Create a Circle
- Click "Create Circle" button
- Fill in details:
  - **Name**: "My First Circle"
  - **Contribution**: 100 XLM
  - **Frequency**: 7 days
  - **Rounds**: 12
- Click "Create Circle"

### 3. Make a Contribution
- Go to your circle
- Enter contribution amount (e.g., 100)
- Click "Contribute"
- See transaction in history

### 4. Connect Wallet (Optional)
- Install [Freighter wallet](https://www.freighter.app/)
- Click "Connect Wallet"
- Select account in Freighter
- Click "Connect"

## Database Access

View your data with Prisma Studio:

```bash
pnpm prisma studio
```

Opens http://localhost:5555 - browse all tables!

## Testing API Endpoints

### Register & Login
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "firstName": "Test"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

## Project Structure

```
├── app/                  # Next.js pages and API routes
├── components/           # React components
├── contracts/            # Soroban smart contract
├── lib/                  # Utilities (auth, Stellar, wallet)
├── prisma/              # Database schema
└── public/              # Static files
```

## Key Files

- **Frontend Entry**: `app/page.tsx` - Home/Dashboard
- **API Routes**: `app/api/` - Backend endpoints
- **Database**: `prisma/schema.prisma` - Data models
- **Smart Contract**: `contracts/ajo-circle/src/lib.rs` - Blockchain logic
- **Config**: `lib/stellar-config.ts` - Stellar setup

## Common Tasks

### Reset Database
```bash
pnpm prisma migrate reset
```

### View Database
```bash
pnpm prisma studio
```

### Deploy Contract
See `DEPLOYMENT.md` for smart contract deployment

### Update Schema
```bash
# Edit prisma/schema.prisma
# Then run:
pnpm prisma migrate dev
```

## Features Checklist

- ✅ User authentication (email/password)
- ✅ Circle creation
- ✅ Member management
- ✅ Contributions tracking
- ✅ Dashboard & statistics
- 🔄 Wallet integration (Freighter ready)
- 📋 Governance voting (coming soon)
- 💰 Smart contract payouts (ready for deployment)

## Troubleshooting

**Port already in use?**
```bash
PORT=3001 pnpm dev
```

**Database error?**
```bash
pnpm prisma migrate reset
```

**Module not found?**
```bash
pnpm install
pnpm prisma generate
```

## Next Steps

1. **Customize**: Edit colors in `app/globals.css`
2. **Add Features**: Create new API routes in `app/api/`
3. **Deploy Contract**: Follow `DEPLOYMENT.md`
4. **Go Live**: Deploy to Vercel (see `DEPLOYMENT.md`)

## Documentation

- **Full Setup**: See `README.md`
- **Development**: See `DEVELOPMENT.md`
- **Deployment**: See `DEPLOYMENT.md`
- **API Docs**: See `README.md#api-documentation`

## Support

- Check GitHub issues
- Read documentation files
- Review code comments
- Open new issue with details

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           Frontend (Next.js)                 │
│  Dashboard, Forms, Wallet Connection        │
└──────────────┬──────────────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────────────┐
│           API Routes (Node.js)               │
│  Auth, Circles, Contributions, Governance   │
└──────────────┬──────────────────────────────┘
               │ SQL
┌──────────────▼──────────────────────────────┐
│      Database (SQLite/PostgreSQL)            │
│  Users, Circles, Members, Transactions      │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│    Smart Contract (Soroban on Stellar)      │
│   Fund Escrow, Payouts, Penalties           │
└─────────────────────────────────────────────┘
```

## Demo Credentials

**Email**: test@example.com  
**Password**: TestPassword123!

Use these to quickly explore features without setting up a new account.

---

**Ready to go!** 🚀

Start with `pnpm dev` and check out http://localhost:3000
