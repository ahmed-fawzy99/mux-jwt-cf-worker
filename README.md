# MUX Decoder

A Cloudflare Worker that securely signs JWT tokens for MUX video playback.

## Overview

This worker provides a secure endpoint for generating signed JWTs for authorized MUX video playback. It handles both production and testing environments, ensuring proper authentication before generating tokens.

## Features

- Secure token generation for MUX video playback
- Environment-specific signing keys (production/testing)
- Client authentication via secret key
- 1-hour token expiration by default

## API

### POST `/get-token`

Generates a signed JWT token for MUX video playback.

#### Headers

- `X-Client-Secret`: Authentication key (required)
- `X-Environment`: Either "production" or "testing" (required)

#### Request Body

```json
{
  "playbackId": "YOUR_MUX_PLAYBACK_ID"
}
```

#### Response

Success:
```json
{
  "token": "SIGNED_JWT_TOKEN"
}
```

Error:
```json
{
  "error": "Error message"
}
```

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables in Cloudflare:
   - `CLIENT_SECRET`: Authentication key for clients
   - `MUX_SIGNING_KEY_ID_PROD`: MUX signing key ID for production
   - `MUX_SIGNING_KEY_SECRET_PROD`: MUX signing key secret for production
   - `MUX_SIGNING_KEY_ID_TEST`: MUX signing key ID for testing
   - `MUX_SIGNING_KEY_SECRET_TEST`: MUX signing key secret for testing

## Development

```bash
npm run dev
```

## Deployment

```bash
npm run deploy
```

## Technologies

- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Hono](https://hono.dev/) - Lightweight web framework
- [@tsndr/cloudflare-worker-jwt](https://github.com/tsndr/cloudflare-worker-jwt) - JWT implementation for Cloudflare Workers