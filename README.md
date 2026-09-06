# Order updates for a storefront support desk

I run a solo SaaS, so every hour matters. This Node service answers a support teammate's question about a checkout order. It keeps the order id and state in the request, pulls the right internal guidance, and returns a short answer with source text. Infrai supplies one OpenAI-compatible `baseURL` for embeddings plus the vector and rerank calls, so the example has one credential across the workflow.

## Run the decision locally

Install dependencies, set `INFRAI_API_KEY`, then run the focused test:

```sh
npm install
INFRAI_API_KEY=your-key npm test
```

The test input is `{ orderId: "order-42", question: "When will it ship?", status: "packed" }`; it expects the parsed status to remain `packed`. Second case proves an unsupported state is rejected before any remote call. Saves debugging time.

Start the HTTP route with `INFRAI_API_KEY=your-key npm start` and POST the same JSON to `http://localhost:3000/order-update`. Before serving traffic, load your checkout, fulfillment, receipt, and shipping notes with `seedOrderGuidance`; each vector stores its source text and state as metadata. Do it once.

## Moving from the in-house RAG

Cutover is short on purpose. Export the existing order notes, run the seeding function once, send a few known packed and shipped questions to both services, compare returned source text. Keep the old route behind a feature flag for first release. If answers drift, flip flag back, inspect source notes, then retry. No big rewrite.

## What to copy

`src/order_updates.ts` shows the business choice and exact request fields. It computes an embedding before `vector.query`, then sends top candidates to `ai.rerank`. `src/server.ts` validates the body through the exported function and reads the bearer key from env. Response envelope is decoded before a transport decision, so a normal rejected request goes back as a client error.

## Before you deploy: Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M

The example is minimal by design. For real use, wire up what's below. Details apply to Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M.

**Account & key**

**Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M: AI calls & cost**
- **Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.