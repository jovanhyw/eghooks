# Just a simple repo to test webhooks

This is a simple backend to receive webhook requests.

Two endpoints here
- GET /webhook
- POST /webhook

GET endpoint is used to authenticate the connection between the webhook provider and the webhook consumer. Ideally the webhook provider will fire a challenge token verification to the consumer, hence this GET endpoint will receive the token and return it back.

POST endpoint will be used to listen to webhook event triggers. It computes a HMAC based on the payload received and will verify the computed hash against the one received in the headers webhook signature.

## Installing

NodeJS and NPM is required for running this server. Clone this repository to your desired directory.

```zsh
cd eghooks

# installing node dependencies
npm install
```

Rename the `.env.example` file to `.env` and retrieve the shared secret from your webhook provider. Replace the `WEBHOOK_SECRET` value in the `.env` file
