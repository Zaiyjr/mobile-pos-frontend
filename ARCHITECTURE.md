# Frontend Architecture

The frontend is a React and TypeScript application organized around product features. Pages and components call feature actions or stores; only feature API adapters call the shared HTTP client.

## Feature layout

```text
src/
  App.tsx                         # Route composition
  features/
    auth/                         # Login API, session storage, guard and login UI
    catalog/                      # Products, categories, brands and catalog state
    pos/                          # Cart, checkout, receipts and sales history
    orders/                       # Order history and reporting API
    admin/                        # User management and admin pages
  shared/
    api/client.ts                 # Axios instance, auth header and error helpers
  components/ui/                  # Shared primitive UI components
  layouts/                        # Role-specific app layouts
```

## Data flow

```text
Page/component → feature store or action → feature API adapter → shared API client
```

- Zustand stores own client-side state and delegate server work to feature services.
- Page components do not import Axios or construct endpoint URLs.
- Auth storage owns token and user persistence; the shared client reads the token through that boundary.
- API responses and state use explicit TypeScript types. API failures become visible error state; production pages do not substitute sample catalog data.
- `src/shared/api/client.ts` is the only place that configures the base URL, auth header, and common API error extraction.

## Verification

```sh
npm run build
npm run lint
npm test
```

Tests cover route protection, cart updates, receipt rendering, and failed catalog loading.
