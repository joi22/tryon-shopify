# Architecture Decisions

## Core Principle
**Keep everything simple and clean. Never overcomplicate. Only build what's essential.**

## Database
- **Decision**: Two Vercel Postgres databases
  - Development: `banana-tryon-dev`
  - Production: `banana-tryon-prod`

## Hosting
- **Decision**: Vercel
  - Automatic deployments from Git
  - Built-in preview environments
  - Seamless integration with database

## Billing
- **Decision**: Managed Pricing
  - Configure in Partner Dashboard, not code
  - Shopify handles all billing complexity

## Virtual Try-On Feature

### Extension-Based Architecture
- **Theme App Extension**: App block for product page button
- **Admin UI Extension**: Checkbox in product admin to enable/disable
- **Product Metafields**: Store try-on enabled setting per product

### API Integration
- **Google Vertex AI**: Virtual try-on processing
- **Server-side calls**: Keep API keys secure
- **Usage tracking**: Database table for API call limits

### User Flow
1. Merchant enables try-on for specific products via admin
2. Button appears on enabled product pages
3. Customer uploads/captures photo
4. Backend processes with Vertex AI
5. Result displayed in modal