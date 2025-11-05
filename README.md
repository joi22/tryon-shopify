# Banana Try-On App
<!-- Deployment: v1.0.1 - Auto-deploy test -->

A Shopify app that enables virtual try-on functionality for products using Google Vertex AI.

## Overview

This app allows merchants to enable virtual try-on features for their products. Customers can upload a photo or use their camera to virtually try on products directly from the product page.

## Tech Stack

- **Framework**: Remix (Shopify template)
- **UI**: Shopify Polaris
- **Database**: PostgreSQL (via Vercel Postgres)
- **ORM**: Prisma
- **Hosting**: Vercel
- **AI**: Google Vertex AI (Virtual Try-On Model)
- **Extensions**: Theme App Extension + Admin UI Extension

## Quick Start

### Prerequisites

- Shopify Partner account
- Vercel account
- GitHub account
- Google Cloud Platform account (for Vertex AI)
- Node.js 18+ and npm

### Initial Setup

1. **Clone the repository**
```bash
git clone https://github.com/t3t5uo/banana-try-on-app.git
cd banana-try-on-app
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your values
```

3. **Run database migrations**
```bash
npx prisma migrate dev
npx prisma generate
```

4. **Start development server**
```bash
npm run dev
```

### Store Setup After Installation

#### 1. Add the Virtual Try-On Button to Your Theme

The app includes a theme extension that adds the try-on button to product pages. You need to add this to your theme:

1. Go to **Online Store > Themes** in your Shopify admin
2. Click **Customize** on your active theme
3. Navigate to a **Product page** template
4. In the product information section, click **Add block**
5. Select **Virtual Try-On** from the Apps section
6. Position the button where you want it (e.g., below Add to Cart)
7. Configure the button settings:
   - Button Text (default: "Try It On")
   - Modal Title (default: "Virtual Try-On")
   - Upload Instructions
8. Click **Save** to publish your changes

#### 2. Virtual Try-On is Enabled by Default

- **All products have try-on enabled automatically** - no configuration needed
- The metafield definition is created automatically on first app use
- To disable try-on for specific products:
  - Go to the product admin page
  - Find the "Virtual Try-On" block
  - Uncheck "Enable virtual try-on for this product"
  - Save the product

#### 3. Manage Products in Bulk (Optional)

- Visit the app dashboard to see all products
- Toggle try-on on/off for multiple products at once
- Products show as "Enabled" by default unless explicitly disabled

## Project Structure

```
banana-try-on-app/
├── app/                          # Remix application
│   ├── routes/                   # App routes
│   │   ├── app._index.jsx       # App home page
│   │   ├── api.tryon.jsx        # Virtual try-on API endpoint (to be implemented)
│   │   └── webhooks.*.jsx       # Webhook handlers
│   └── shopify.server.js        # Shopify configuration
├── extensions/
│   ├── banana-try-on-theme-extension/    # Theme extension (storefront button)
│   └── banana-try-on-admin-block/        # Admin extension (product toggle)
├── prisma/
│   └── schema.prisma             # Database schema
├── public/                       # Static assets
├── shopify.app.toml             # Shopify app configuration
└── vercel.json                  # Vercel configuration
```

## Database Schema

### Session
Stores Shopify session data for authentication.

### TryonUsage
Tracks virtual try-on usage for rate limiting:
- `shop` - Store domain
- `productId` - Product being tried on
- `customerId` - Optional customer ID
- `createdAt` - Timestamp
- `success` - Whether try-on succeeded
- `errorMessage` - Error details if failed

## Environment Variables

Required environment variables:

### Shopify Configuration
- `SHOPIFY_API_KEY` - Your app's API key from Partner Dashboard
- `SHOPIFY_API_SECRET` - Your app's API secret
- `SHOPIFY_APP_URL` - Your Vercel app URL (e.g., https://banana-try-on-app.vercel.app)
- `SCOPES` - Required scopes (default: write_products)

### Database Configuration (Auto-configured by Vercel)
- `DATABASE_DATABASE_URL` - Direct database URL
- `DATABASE_POSTGRES_URL` - Postgres connection URL
- `DATABASE_PRISMA_DATABASE_URL` - Prisma Accelerate URL

### Google Cloud Configuration (Optional - for Vertex AI)
- `GOOGLE_CLOUD_PROJECT_ID` - Your GCP project ID
- `GOOGLE_CLOUD_REGION` - Region for Vertex AI (e.g., us-central1)
- `GOOGLE_CLOUD_CREDENTIALS` - Service account JSON as a string

## Development

### Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run Shopify CLI
npm run shopify

# Deploy app configuration
npm run deploy

# Open Prisma Studio
npx prisma studio
```

### Testing Extensions

```bash
# Test theme extension
npm run shopify app dev

# Preview in your development store
```

## Deployment

### Vercel Setup

1. **Connect GitHub repository to Vercel**
   - Import project from GitHub
   - Environment variables are configured via CLI

2. **Database Setup**
   - Two Vercel Postgres databases:
     - `banana-try-on-dev` (development)
     - `banana-try-on-prod` (production)

3. **Automatic Deployments**
   - Push to `main` branch triggers deployment
   - Preview deployments for pull requests

**Production URL**: https://banana-try-on-app.vercel.app

### Shopify App Configuration

1. Update `shopify.app.toml` with your app URL:
```toml
application_url = "https://banana-try-on-app.vercel.app"
```

2. Deploy configuration:
```bash
npm run shopify app deploy
```

## Virtual Try-On Implementation Plan

### Extension Structure
- **Theme App Extension**: `extensions/banana-try-on-theme-extension/`
  - App block for product page button
  - Modal UI for try-on experience
  - Client-side JavaScript for camera/upload

- **Admin UI Extension**: `extensions/banana-try-on-admin-block/`
  - Target: `admin.product-details.block.render`
  - Toggle to enable/disable per product
  - Updates product metafield

### Metafield Configuration
- Namespace: `app--banana-tryon`
- Key: `enabled`
- Type: `boolean`
- Access: Storefront API

### Google Vertex AI Setup
- Region: `us-central1` (or preferred region)
- Model: `virtual-try-on-preview-08-04`
- Auth: Service account with JSON key
- Environment variables needed

### Usage Tracking Pattern
1. Check merchant plan and usage before API call
2. Make Vertex AI request
3. Log usage to TryonUsage table
4. Return result or error if limit exceeded

## Security Notes

- Never commit `.env` files or service account JSON files
- Use environment variables for all secrets
- Service account JSON should be stored as a string in env vars
- Keep `shopify-tryon-*.json` files in `.gitignore`

## Troubleshooting

### Deployment Issues
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify database connection strings

### Database Connection
- Check `DATABASE_PRISMA_DATABASE_URL` is set correctly
- Ensure Vercel Postgres databases are active
- Run `vercel env pull` to sync latest variables

### Extension Not Showing
- Run `npm run deploy` to push latest extension code
- Check extension is activated in Partner Dashboard
- Clear browser cache and reload

## Next Steps

- [ ] Implement admin block toggle functionality
- [ ] Build theme extension UI components
- [ ] Integrate Google Vertex AI API
- [ ] Add usage tracking and limits
- [ ] Implement billing integration
- [ ] Add analytics dashboard

## License

Private - All rights reserved