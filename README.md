# Beacon Point

A two-sided digital signage marketplace SaaS platform.

## Monorepo Structure

- `/apps/web-dashboard` – Next.js dashboard for advertisers, screen owners, admin
- `/apps/screen-player` – Lightweight ad playback client for physical screens
- `/packages/ui` – Shared React UI components, theme
- `/packages/database` – Prisma schema, migrations
- `/packages/api` – Shared API types, validation
- `/services/ad-distribution` – Ad scheduling, distribution, player sync
- `/services/marketplace` – Screen listings, search, booking logic
- `/infra/terraform` – Infrastructure as code
- `/infra/scripts` – DevOps, deployment scripts

## Tech Stack

- Next.js (App Router), React, TypeScript, Material UI
- Node.js, Express, Prisma ORM, PostgreSQL
- Stripe, AWS S3 or Cloudflare R2

## Quick Start

1. `npm install`
2. `npm run dev`

Runs in GitHub Codespaces with minimal setup.
