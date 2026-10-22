# Fufu backend

Express 5, TypeScript, PostgreSQL, Prisma 7 backend for a Rwanda food-ordering application. All API routes are prefixed with `/api/v1`; `GET /health` checks database connectivity.

## Run

1. Copy `.env.example` to `.env` and set a PostgreSQL URL plus strong, distinct token secrets.
2. Set `PINDO_API_TOKEN` to your Pindo API token (get one at https://app.pindo.io → Settings → API Tokens). Phone OTP verification will return HTTP 503 until this is set.
3. Run `npm install`, `npm run db:deploy`, `npm run db:generate`, and `npm run db:seed`.
4. Start development with `npm run dev`; production is `npm run build && npm start`.

Useful checks: `npm run typecheck`, `npm test`, `npx prisma validate`, and `npx prisma migrate status`.

## API and roles

Public routes cover categories, products, and combos. Customer routes include `/auth`, `/addresses`, `/cart`, `/orders`, and `/payments`. Administrative management is under `/admin`; kitchen operations are under `/kitchen`; riders use `/rider`. Bearer access tokens are short lived. Refresh tokens are stored only as hashes and rotate on `/auth/refresh`.

Registration always creates a `CUSTOMER`. To bootstrap an administrator, create a normal account and promote it directly through a protected operations process/database console; there are deliberately no public administrator credentials or promotion route.

## Payments

Cash and pickup payments remain pending until staff collection. Flutterwave initialization and webhook idempotency boundaries are present, but online payment completion is deliberately disabled until `FLUTTERWAVE_SECRET_KEY` and `FLUTTERWAVE_WEBHOOK_SECRET` are configured and the provider transaction-verification call is implemented/tested against the current sandbox API. The webhook never trusts a browser redirect.

## Order safety

Checkout derives prices from database records, records immutable item snapshots, decrements finished-product stock in a serializable transaction, and increments a valid promotion atomically. Delivery requires an owned address; pickup does not. Cancelling after acceptance/preparation is denied. Product data is archived through status rather than deletion.
