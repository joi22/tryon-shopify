# Claude Code Context

## Project Overview
Shopify app for virtual try-on functionality. Built with Remix, Shopify Polaris, and Prisma.

## Core Principles
- **Simplicity first** - Keep everything simple and clean
- **Never overcomplicate** - Only build what's essential
- **Use platform features** - Leverage Shopify/Vercel built-ins
- **Follow conventions** - Standard Shopify app patterns

## Key Commands
```bash
npm run dev          # Start local development
npm run lint         # Check code quality
npm run build        # Build for production
npm run shopify      # Shopify CLI commands
```

## Important Resources
- **Always use Shopify MCP** for Admin API, Functions, Liquid
- **Always use Vercel MCP** for deployment, hosting, database
- Only use web search as last resort

## Project Structure
```
app/              # Remix routes and components
  routes/         # Page routes and API endpoints
  shopify.server/ # Shopify utilities
extensions/       # Shopify app extensions
prisma/          # Database schema and migrations
```

## Database Strategy
- **Two Vercel Postgres databases** (no SQLite/Postgres mixing)
  - Development: `banana-tryon-dev`
  - Production: `banana-tryon-prod`
- Use environment variables to switch between them
- Both are real Postgres for consistency
- Use Prisma for all database operations

## Hosting
- **Vercel** for all environments
- Automatic deployments from Git
- Preview deployments for branches

## Billing
- **Managed Pricing** via Partner Dashboard
- No billing code in the app
- Shopify handles all complexity

## API Integration Pattern
- Track usage limits in database per merchant/plan
- Check limits before external API calls
- Show usage in app UI
- Reset counters monthly

## Deployment Process
1. Work on `main` branch (solo developer)
2. Test locally with dev database
3. Push to GitHub
4. Vercel auto-deploys preview
5. Test preview deployment
6. Promote to production

## Pre-deployment Checklist
```
- [ ] Run npm run lint
- [ ] Test all features locally
- [ ] Environment variables set in Vercel
- [ ] Database migrations ready
- [ ] Shopify app URLs updated
```

## Code Standards
- Use Shopify Polaris components for UI
- Follow existing file patterns
- One responsibility per file
- Colocate related code
- Clear, descriptive naming
- No premature abstractions
- No clever code

## Common Patterns
- Authentication: Use shopify.authenticate
- API calls: Use authenticated GraphQL client
- Error handling: Show user-friendly messages
- Loading states: Use Polaris skeletons

## Virtual Try-On Implementation

### Extension Structure
- **Theme App Extension**: `extensions/banana-try-on-theme-extension/`
  - App block for product page button
  - Modal UI using native HTML `<dialog>` element
  - Client-side JavaScript for camera/upload functionality
  - **Design Philosophy**: Minimal CSS following Shopify patterns
    - BEM-like naming convention (`.virtual-tryon__element`)
    - Native HTML elements for better accessibility
    - Buttons use theme classes: `button`, `btn`, `product-form__submit`
    - All colors, fonts, spacing inherited from parent theme
    - Only structural CSS for layout, no visual styling
    - Follows Shopify's responsive breakpoints (750px)

- **Admin UI Extension**: `extensions/virtual-tryon-admin/`
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
- Environment variables:
  - `GOOGLE_CLOUD_PROJECT_ID`
  - `GOOGLE_CLOUD_REGION`
  - `GOOGLE_CLOUD_CREDENTIALS` (JSON string)

### Usage Tracking Pattern
```
1. Check merchant plan and usage before API call
2. Make Vertex AI request
3. Log usage to TryonUsage table
4. Return result or error if limit exceeded
```

## Notes
- Billing: Plans configured in Partner Dashboard only
- Webhooks: Handled by Shopify Remix adapter
- Sessions: Stored in Prisma database
- Extensions: Use Shopify CLI to generate and test
- Always maintain alignment with ARCHITECTURE.md