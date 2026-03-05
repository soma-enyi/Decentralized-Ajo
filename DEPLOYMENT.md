# Stellar Ajo - Deployment Guide

This guide covers deploying Stellar Ajo to production environments.

## Prerequisites

- Stellar Network account with XLM funds
- Vercel account for hosting
- GitHub account for code repository
- Domain name (optional but recommended)

## Step 1: Prepare the Smart Contract

### Build the Soroban Contract

```bash
# Navigate to contracts directory
cd contracts/ajo-circle

# Build the contract
cargo build --target wasm32-unknown-unknown --release

# Output location:
# target/wasm32-unknown-unknown/release/ajo_circle.wasm
```

### Deploy to Stellar Network

#### Option A: Using Stellar CLI

1. Install Stellar CLI:
```bash
curl https://stellar.org/install | bash
```

2. Create a keypair (save in secure location):
```bash
stellar keys generate deployer
```

3. Fund the account with testnet XLM:
```bash
curl https://friendbot.stellar.org?addr=<PUBLIC_KEY>
```

4. Deploy the contract to testnet:
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/ajo_circle.wasm \
  --source deployer \
  --network testnet
```

This will output the contract address. Save this value.

#### Option B: Using JavaScript SDK

Create a deployment script `scripts/deploy-contract.js`:

```javascript
import * as StellarSdk from 'stellar-sdk';
import * as fs from 'fs';

const network = StellarSdk.Networks.TESTNET_NETWORK_PASSPHRASE;
const rpcUrl = 'https://soroban-testnet.stellar.org';
const server = new StellarSdk.SorobanRpc.Server(rpcUrl);

// Load contract WASM
const wasmBuf = fs.readFileSync('./contracts/ajo-circle/target/wasm32-unknown-unknown/release/ajo_circle.wasm');

// Deploy logic here
// See: https://developers.stellar.org/docs/smart-contracts/guides/deploying-contracts
```

## Step 2: Configure Environment Variables

### Create Vercel Environment Variables

Set these in your Vercel project settings:

```
NEXT_PUBLIC_STELLAR_NETWORK=mainnet
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon.stellar.org
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=Public Global Stellar Network ; September 2015
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban.stellar.org
NEXT_PUBLIC_AJO_CONTRACT_ADDRESS=<your-contract-address>

DATABASE_URL=<your-postgresql-connection-string>
JWT_SECRET=<generate-secure-random-string>
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

### Generate Secure JWT Secret

```bash
# Generate a cryptographically secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Setup

For production, use PostgreSQL instead of SQLite:

1. Create PostgreSQL database (e.g., with Vercel Postgres, AWS RDS, or Supabase)
2. Set DATABASE_URL to your connection string
3. Run migrations:

```bash
pnpm prisma migrate deploy
```

## Step 3: Deploy to Vercel

### Option A: GitHub Integration (Recommended)

1. Push code to GitHub:
```bash
git add .
git commit -m "Production deployment"
git push origin main
```

2. Connect repository to Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your GitHub repository
   - Configure project settings
   - Add environment variables
   - Deploy!

### Option B: Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Step 4: Configure Custom Domain

1. In Vercel dashboard:
   - Go to Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. Update NEXT_PUBLIC_API_URL:
   - Set in Vercel environment variables
   - Example: `https://ajo.example.com/api`

## Step 5: Set Up Monitoring

### Error Tracking (Sentry)

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project
3. Add to environment variables:
```
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
```

4. Integrate with code:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Analytics

Already configured with Vercel Analytics. Monitor in Vercel dashboard.

## Step 6: Security Hardening

### API Security

1. Enable rate limiting:
```typescript
// Add to API routes
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
  const { success } = await rateLimit(request);
  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }
  // ... rest of handler
}
```

2. Add CORS headers:
```typescript
const headers = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_API_URL,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
};
```

3. Validate all inputs with Zod or similar

### Database Security

1. Use minimum required privileges for DB user
2. Enable SSL connections
3. Set up regular automated backups
4. Enable query logging for auditing

### Smart Contract Security

1. Have contract audited by professional firm before mainnet
2. Use timelock for contract upgrades
3. Implement emergency pause mechanism
4. Monitor contract events for suspicious activity

## Step 7: Test Production Deployment

1. Run smoke tests:
```bash
pnpm run test:smoke
```

2. Verify endpoints:
```bash
curl https://your-domain.com/api/health
```

3. Test payment flows:
   - Create test circle
   - Make contributions
   - Process payouts

4. Verify wallet integration:
   - Connect Freighter wallet
   - Sign transactions
   - Confirm blockchain records

## Step 8: Go Live Checklist

- [ ] Smart contract deployed and tested on mainnet
- [ ] Database backed up and configured
- [ ] All environment variables set in Vercel
- [ ] Domain configured and SSL active
- [ ] Monitoring and alerting configured
- [ ] Error tracking enabled
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Support email configured

## Step 9: Post-Deployment

### Monitoring

Check metrics regularly:
- Application performance (Vercel Analytics)
- Error rates (Sentry)
- Database performance (Query logs)
- Smart contract events (Stellar Explorer)

### Maintenance

- Update dependencies monthly
- Review and rotate secrets quarterly
- Monitor blockchain for contract events
- Review logs for suspicious activity

### Scaling

If needed, upgrade:
- Vercel plan for higher limits
- PostgreSQL instance for more connections
- Add CDN for static assets
- Implement caching strategy

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection string format
# postgresql://user:password@host:port/database
```

### Smart Contract Deployment Failures

1. Verify contract builds locally
2. Check XLM balance in deployer account
3. Ensure network is accessible
4. Review deployment logs for specific errors

### Vercel Deployment Issues

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Ensure Node.js version compatibility
4. Clear build cache and retry

### Wallet Integration Issues

1. Verify Freighter extension is installed
2. Check wallet is on correct network
3. Ensure account has XLM for fees
4. Verify contract address is correct

## Rollback Procedure

If critical issues occur:

1. Revert to previous version:
```bash
vercel rollback
```

2. Check logs for root cause
3. Fix issue
4. Deploy again:
```bash
vercel --prod
```

## Support

For deployment issues:
- Check [Stellar documentation](https://developers.stellar.org/)
- Review [Vercel docs](https://vercel.com/docs)
- Open issue on GitHub
- Contact support team

---

**Last Updated**: March 2026
