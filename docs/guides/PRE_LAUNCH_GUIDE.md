# Pre-Launch Guide for VenueManager

Complete these steps before going live at **venuemanager.pro**.

---

## Table of Contents

1. [Generate PNG Icons](#1-generate-png-icons-from-svg)
2. [Create OG Image](#2-create-og-image-social-media-preview)
3. [Set Environment Variables](#3-set-environment-variables-on-vercel)
4. [Enable Vercel Analytics](#4-enable-vercel-analytics)
5. [Configure Custom Domain](#5-configure-custom-domain)
6. [Google Search Console](#6-google-search-console-optional)
7. [Final Checklist](#7-final-deployment-checklist)

---

## 1. Generate PNG Icons from SVG

The SVG icon is at `/public/icon.svg`. You need to generate PNG versions for PWA support.

### Option A: Online Tool (Easiest)

1. Go to https://realfavicongenerator.net/
2. Upload `/public/icon.svg`
3. Configure settings (use blue #2563eb as theme color)
4. Download the generated package
5. Extract icons to `/public/icons/`
6. Move `apple-touch-icon.png` to `/public/`

### Option B: Using Sharp (Node.js)

```bash
# Install sharp
npm install sharp --save-dev
```

Create a script at `scripts/generate-icons.js`:

```javascript
const sharp = require('sharp');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  for (const size of sizes) {
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Apple touch icon
  await sharp(inputSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');
}

generateIcons();
```

Run the script:

```bash
node scripts/generate-icons.js
```

### Required Icon Files

After generation, you should have:

```
public/
├── apple-touch-icon.png (180x180)
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
```

---

## 2. Create OG Image (Social Media Preview)

This image appears when your site is shared on social media.

### Specifications

- **Size:** 1200 x 630 pixels
- **Format:** PNG or JPG
- **Save as:** `/public/og-image.png`

### Design Guidelines

- Use brand color: Blue #2563eb
- Include the VenueManager logo/icon
- Add tagline: "Master Your Venue Operations"
- Keep text large and readable (it appears small in previews)
- Leave padding around edges

### Suggested Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│      🏢  VenueManager                               │
│                                                     │
│      Master Your Venue Operations                   │
│                                                     │
│      Streamline vendor coordination,                │
│      track budgets in real-time, and                │
│      let AI handle vendor outreach.                 │
│                                                     │
│                          [venuemanager.pro]         │
└─────────────────────────────────────────────────────┘
```

### Design Tools

- **Figma** (free): https://figma.com
- **Canva**: https://canva.com
- **OG Image Generator**: https://og-image.vercel.app/

---

## 3. Set Environment Variables on Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required Variables

```env
# ============================================
# APP CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_URL=https://venuemanager.pro

# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# STRIPE (Payment Processing)
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_YEARLY=price_xxx

# ============================================
# AI FEATURES (Anthropic Claude)
# ============================================
ANTHROPIC_API_KEY=sk-ant-api03-xxx
CLAUDE_MODEL=claude-sonnet-4-20250514

# ============================================
# EMAIL (Resend)
# ============================================
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@venuemanager.pro
RESEND_FROM_NAME=VenueManager
RESEND_WEBHOOK_SECRET=whsec_xxx

# ============================================
# FEATURE FLAGS
# ============================================
ENABLE_AI_AGENT=true
ENABLE_NL_EVENT_CREATION=true
ENABLE_REAL_TIME_UPDATES=false

# ============================================
# AGENT CONFIGURATION
# ============================================
AGENT_MAX_RETRIES=3
AGENT_TIMEOUT_HOURS=72
AGENT_FOLLOWUP_DELAY_HOURS=24
ENABLE_AGENT_AUTO_APPROVAL=false

# ============================================
# CRON JOBS
# ============================================
CRON_SECRET=your-random-secret-string-here
```

### Environment Scopes

Set variables for all environments:
- ✅ Production
- ✅ Preview
- ✅ Development

### Security Notes

- Never commit `.env.local` to git
- Use different API keys for production vs development
- Rotate secrets periodically

---

## 4. Enable Vercel Analytics

### Enable Web Analytics

1. Go to https://vercel.com/dashboard
2. Select your **venuemanager** project
3. Click the **Analytics** tab in the top navigation
4. Click **Enable Analytics**
5. Choose your plan (Hobby is free for small projects)

### Enable Speed Insights

1. In the same project, click **Speed Insights** tab
2. Click **Enable Speed Insights**

### Verify Installation

The app already includes the required components in `app/layout.tsx`:

```tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

// In the body:
<Analytics />
<SpeedInsights />
```

Data will start appearing after your first deployment and some traffic.

---

## 5. Configure Custom Domain

### Add Domain in Vercel

1. Go to **Vercel → Project → Settings → Domains**
2. Add `venuemanager.pro`
3. Add `www.venuemanager.pro` (set to redirect to apex domain)

### Configure DNS Records

At your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.), add:

```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
TTL: 3600 (or Auto)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

### SSL Certificate

- Vercel automatically provisions SSL certificates
- Wait 5-10 minutes after DNS propagation
- Check status in Vercel Domains settings

### Verify

After DNS propagates (can take up to 48 hours, usually minutes):
- https://venuemanager.pro should load your app
- https://www.venuemanager.pro should redirect to apex

---

## 6. Google Search Console (Optional)

Recommended for SEO monitoring and sitemap submission.

### Setup

1. Go to https://search.google.com/search-console
2. Click **Add Property**
3. Choose **URL prefix**
4. Enter `https://venuemanager.pro`

### Verification

Choose **HTML tag** method and copy the verification code.

Update `app/layout.tsx` metadata:

```typescript
export const metadata: Metadata = {
  // ... existing metadata
  verification: {
    google: "your-google-verification-code-here",
  },
};
```

Deploy the change, then click **Verify** in Search Console.

### Submit Sitemap

1. In Search Console, go to **Sitemaps** (left sidebar)
2. Enter: `sitemap.xml`
3. Click **Submit**

Your sitemap is automatically generated at: `https://venuemanager.pro/sitemap.xml`

---

## 7. Final Deployment Checklist

### Assets

- [ ] PNG icons generated in `/public/icons/`
- [ ] `apple-touch-icon.png` in `/public/`
- [ ] `og-image.png` created (1200x630)

### Vercel Configuration

- [ ] All environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active (green lock)
- [ ] Vercel Analytics enabled
- [ ] Speed Insights enabled

### Functionality Testing

- [ ] Signup flow works
- [ ] Login flow works
- [ ] Password reset works
- [ ] Create venue works
- [ ] Create event works
- [ ] Vendor management works
- [ ] AI event creation works (if enabled)
- [ ] AI vendor communication works (if enabled)
- [ ] Payment/subscription works (if enabled)
- [ ] Email delivery works

### Security Verification

- [ ] RLS policies working (users only see their data)
- [ ] Rate limiting working (test with rapid requests)
- [ ] Security headers present (check with securityheaders.com)
- [ ] No sensitive data in client-side code

### SEO Verification

- [ ] Title and meta description appear correctly
- [ ] OG image shows in social media debuggers:
  - Facebook: https://developers.facebook.com/tools/debug/
  - Twitter: https://cards-dev.twitter.com/validator
  - LinkedIn: https://www.linkedin.com/post-inspector/
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] robots.txt accessible at `/robots.txt`

---

## Quick Deploy Commands

```bash
# Stage all changes
git add .

# Commit
git commit -m "Pre-launch: Add icons, OG image, finalize configuration"

# Push to deploy
git push origin main
```

---

## Post-Launch

After going live:

1. **Monitor Analytics** - Check Vercel Analytics for traffic and errors
2. **Monitor Errors** - Consider adding Sentry for error tracking
3. **Backup Database** - Set up Supabase automatic backups
4. **Monitor Costs** - Watch Supabase, Vercel, Stripe, and API usage
5. **Gather Feedback** - Add a feedback mechanism for early users

---

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Stripe Docs:** https://stripe.com/docs

---

*Last updated: January 2025*
