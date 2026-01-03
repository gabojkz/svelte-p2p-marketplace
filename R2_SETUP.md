# Cloudflare R2 Setup Guide

This guide explains how to set up Cloudflare R2 for storing listing images.

## Prerequisites

1. A Cloudflare account
2. An R2 bucket created in your Cloudflare dashboard

## Step 1: Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** in the sidebar
3. Click **Create bucket**
4. Name your bucket (e.g., `svelte-p2p-market`)
5. Choose a location (optional)
6. Click **Create bucket**

## Step 2: Configure Public Access (Optional but Recommended)

For public image access, you have two options:

### Option A: Custom Domain (Recommended)

1. In your R2 bucket settings, go to **Settings** > **Public Access**
2. Click **Connect Domain**
3. Add a custom domain (e.g., `images.yourdomain.com`)
4. Follow the DNS setup instructions
5. Set `R2_PUBLIC_URL` environment variable to your custom domain

### Option B: R2 Public URL

1. In your R2 bucket settings, enable **Public Access**
2. Note your Account ID (found in R2 dashboard URL or Workers dashboard)
3. Your public URL format will be: `https://<account-id>.r2.cloudflarestorage.com/<bucket-name>`
4. Set `R2_PUBLIC_URL` environment variable to this URL

## Step 3: Configure Wrangler

Update `wrangler.toml` with your bucket name:

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "svelte-p2p-market"
preview_bucket_name = "svelte-p2p-market-preview"
```

## Step 4: Set Environment Variables

### For Cloudflare Pages/Workers (Production)

Set these in your Cloudflare Pages/Workers dashboard:

- `R2_PUBLIC_URL`: Your public R2 URL (custom domain or R2 public URL)
- `R2_ACCOUNT_ID`: Your Cloudflare Account ID (optional, for R2 public URLs)
- `R2_BUCKET_NAME`: Your bucket name (optional, defaults to "svelte-p2p-market")

The `R2_BUCKET` binding is automatically available in the Workers/Pages environment.

### For Local Development

Create a `.env` file (or add to existing):

```env
R2_PUBLIC_URL=https://your-custom-domain.com
# Or
R2_PUBLIC_URL=https://your-account-id.r2.cloudflarestorage.com/your-bucket-name
R2_ACCOUNT_ID=your-account-id
R2_BUCKET_NAME=svelte-p2p-market
```

**Note:** For local development, you may need to use Cloudflare Workers local development or mock the R2 bucket. The R2 bucket binding is only available in the Cloudflare Workers/Pages runtime.

## Step 5: Deploy

1. Push your code to your repository
2. Deploy to Cloudflare Pages:
   ```bash
   npm run deploy
   ```

Or use Cloudflare Dashboard:
1. Go to **Pages** in Cloudflare Dashboard
2. Connect your repository
3. Build settings will use `wrangler.toml` automatically

## File Structure in R2

Images are stored with the following structure:

```
listings/
  └── {listingId}/
      ├── full-{timestamp}-{random}.{ext}
      └── thumb-{timestamp}-{random}.{ext}
```

Example:
```
listings/
  └── 123/
      ├── full-1704067200000-abc123.jpg
      └── thumb-1704067200000-abc123.jpg
```

## Testing

1. Create a new listing with images
2. Check your R2 bucket to verify files are uploaded
3. Verify images display correctly on the listing page

## Troubleshooting

### Images not uploading

- Check that `R2_BUCKET` is properly bound in `wrangler.toml`
- Verify bucket name matches in Cloudflare dashboard
- Check Cloudflare Workers/Pages logs for errors

### Images not displaying

- Verify `R2_PUBLIC_URL` is set correctly
- Check that public access is enabled on your bucket
- Verify CORS settings if accessing from different domains

### Local development issues

- R2 bindings are only available in Cloudflare Workers/Pages runtime
- For local testing, you may need to use `wrangler dev` or mock the R2 bucket
- Consider using Cloudflare Workers local development mode

## Security Considerations

1. **Access Control**: Ensure your R2 bucket has appropriate access controls
2. **CORS**: Configure CORS if accessing images from different domains
3. **File Validation**: The API validates file types and sizes before upload
4. **Authentication**: Only authenticated users can upload images to their own listings

## Cost

Cloudflare R2 pricing:
- **Storage**: $0.015 per GB/month
- **Class A Operations** (writes): $4.50 per million
- **Class B Operations** (reads): $0.36 per million
- **Egress**: Free (unlike S3)

See [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/) for details.
