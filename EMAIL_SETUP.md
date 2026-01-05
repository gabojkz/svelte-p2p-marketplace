# Email Service Setup Guide

This guide explains how to set up email services for sending confirmation and password reset emails.

## Recommended Services

### 1. **Resend** (Recommended) ⭐
- **Best for**: Modern applications, serverless/edge functions
- **Free tier**: 100 emails/day, 3,000 emails/month
- **Pricing**: $20/month for 50,000 emails
- **Why choose**: Best developer experience, modern API, works great with Cloudflare Workers
- **Setup**: https://resend.com

### 2. **Postmark**
- **Best for**: High deliverability requirements
- **Free tier**: 100 emails/month
- **Pricing**: $15/month for 10,000 emails
- **Why choose**: Best deliverability rates (99% inbox delivery), excellent for transactional emails
- **Setup**: https://postmarkapp.com

### 3. **SendGrid**
- **Best for**: Established businesses, high volume
- **Free tier**: 100 emails/day forever
- **Pricing**: $19.95/month for 50,000 emails
- **Why choose**: Reliable, established service, good analytics
- **Setup**: https://sendgrid.com

### 4. **Mailgun**
- **Best for**: Developers, transactional emails
- **Free tier**: 5,000 emails/month for 3 months, then 1,000/month
- **Pricing**: $35/month for 50,000 emails
- **Why choose**: Good API, flexible pricing
- **Setup**: https://www.mailgun.com

## Quick Setup (Resend - Recommended)

### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email

### Step 2: Get API Key
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Give it a name (e.g., "Marketto Production")
4. Copy the API key (starts with `re_`)

### Step 3: Add Domain (Required for Production)
1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Add your domain (e.g., `yourdomain.com`)
4. Add the DNS records to your domain provider:
   - SPF record
   - DKIM record
   - DMARC record (optional but recommended)
5. Wait for verification (usually takes a few minutes)

### Step 4: Configure Environment Variables

Add to your `.env` file (or Cloudflare Pages environment variables):

```bash
# Email Provider (resend, sendgrid, or postmark)
EMAIL_PROVIDER=resend

# Resend API Key
RESEND_API_KEY=re_your_api_key_here

# Email Configuration
FROM_EMAIL=noreply@yourdomain.com  # Must be verified domain in Resend
FROM_NAME=Marketto

# Optional: Enable email verification
REQUIRE_EMAIL_VERIFICATION=false  # Set to true to require email verification
```

### Step 5: Deploy

For Cloudflare Pages:
1. Go to your Cloudflare Pages project
2. Settings → Environment Variables
3. Add the variables above
4. Redeploy

## Alternative Setup (SendGrid)

### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com
2. Sign up for free account
3. Verify your email

### Step 2: Create API Key
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Give it a name and select "Full Access" or "Restricted Access" (Mail Send permission)
4. Copy the API key

### Step 3: Verify Sender
1. Go to Settings → Sender Authentication
2. Verify a Single Sender or Domain
3. Follow the verification steps

### Step 4: Environment Variables

```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Marketto
```

## Alternative Setup (Postmark)

### Step 1: Create Postmark Account
1. Go to https://postmarkapp.com
2. Sign up for free account
3. Verify your email

### Step 2: Create Server
1. Go to Servers
2. Click "Add Server"
3. Give it a name
4. Copy the Server API Token

### Step 3: Verify Domain
1. Go to Sender Signatures
2. Add your domain
3. Add DNS records
4. Wait for verification

### Step 4: Environment Variables

```bash
EMAIL_PROVIDER=postmark
POSTMARK_SERVER_TOKEN=your_server_token_here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Marketto
```

## Testing

### Development Testing

In development mode, if email sending fails, the reset link will be logged to the console:

```bash
# Start dev server
npm run dev

# Try forgot password
# Check console for: "Password reset link (fallback): ..."
```

### Production Testing

1. Use the forgot password feature
2. Check your email inbox
3. If not received, check spam folder
4. Verify DNS records are correct (for Resend/SendGrid/Postmark)

## Email Templates

The email templates are defined in `src/lib/server/email.js`. You can customize:
- `sendVerificationEmail()` - Email verification template
- `sendPasswordResetEmail()` - Password reset template

Both templates use inline CSS for maximum email client compatibility.

## Troubleshooting

### Emails not sending

1. **Check API key**: Make sure the API key is correct and has proper permissions
2. **Check domain verification**: For production, you must verify your domain
3. **Check FROM_EMAIL**: Must match a verified domain or sender
4. **Check logs**: Look for error messages in Cloudflare Workers logs
5. **Check spam folder**: Emails might be going to spam

### Common Errors

- `RESEND_API_KEY environment variable is not set`
  - Solution: Add the API key to environment variables

- `Invalid API key`
  - Solution: Regenerate the API key and update environment variables

- `Domain not verified`
  - Solution: Verify your domain in the email service dashboard

## Security Best Practices

1. **Never commit API keys**: Always use environment variables
2. **Use domain verification**: Required for production
3. **Set expiration times**: Reset links expire in 1 hour (already configured)
4. **Rate limiting**: Consider adding rate limiting to prevent abuse
5. **Monitor usage**: Set up alerts for unusual email activity

## Cost Comparison

| Service | Free Tier | Paid (50k emails/month) |
|---------|-----------|-------------------------|
| Resend | 3,000/month | $20 |
| Postmark | 100/month | $15 |
| SendGrid | 3,000/month | $19.95 |
| Mailgun | 1,000/month | $35 |

## Recommendation

For this project, I recommend **Resend** because:
- ✅ Best developer experience
- ✅ Works great with serverless/edge functions (Cloudflare Workers)
- ✅ Modern API
- ✅ Good free tier
- ✅ Easy setup
- ✅ Great documentation

Start with Resend's free tier, and upgrade when you need more volume.

