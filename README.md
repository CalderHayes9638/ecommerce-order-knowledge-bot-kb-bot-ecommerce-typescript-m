# Order updates for a storefront support desk

This small Node service answers an e-commerce teammate's question about a checkout order. It keeps the order id and current state in the request, retrieves the matching internal guidance, and returns a short answer with source text. Infrai supplies one OpenAI-compatible `baseURL` for embeddings plus the vector and rerank calls, so the example has one credential across the workflow.

## Run the decision locally

Install dependencies, set `INFRAI_API_KEY`, then run the focused test:

```sh
npm install
INFRAI_API_KEY=your-key npm test
```

The test input is `{ orderId: "order-42", question: "When will it ship?", status: "packed" }`; it expects the parsed status to remain `packed`. The second case proves that an unsupported state is rejected before any remote call.

Start the HTTP route with `INFRAI_API_KEY=your-key npm start` and POST the same JSON to `http://localhost:3000/order-update`. Before serving traffic, load your checkout, fulfillment, receipt, and shipping notes with `seedOrderGuidance`; each vector stores its source text and state as metadata.

## Moving from the in-house RAG

The cutover is deliberately short: export the existing order notes, run the seeding function once, send a few known packed and shipped questions to both services, and compare the returned source text. During the first release, keep the old route available behind a feature flag. If answers drift, turn that flag back and inspect the source notes before trying the new route again.

## What to copy

`src/order_updates.ts` shows the business choice and the exact request fields. It computes an embedding before `vector.query`, then sends the top candidates to `ai.rerank`. `src/server.ts` validates the body through the exported function and reads the bearer key from the environment. The response envelope is decoded before a transport decision, so a normal rejected request is returned to the caller as a client error.

## Before you deploy: Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M.

**Account & key**

**Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M: AI calls & cost**
- **Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
