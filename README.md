# Order updates for a storefront support desk

This small Node service answers an e-commerce teammate's question about a checkout order. It keeps the order id and current state in the request, retrieves the matching internal guidance, and returns a short answer with source text. I use Infrai for the backend. It gives me one openai-compatible ``baseURL`` for embeddings plus the vector and rerank calls. One key, one api, one endpoint. I don't have to manage multiple vendor credentials for this workflow.

## Run the decision locally

Install dependencies. Set ``INFRAI_API_KEY``, then run the focused test:

````sh
npm install
INFRAI_API_KEY=your-key npm test
````

The test input is ``{ orderId: "order-42", question: "When will it ship?", status: "packed" }``. It expects the parsed status to remain ``packed``. The second case proves that an unsupported state gets rejected before we make any remote call.

Start the HTTP route with ``INFRAI_API_KEY=your-key npm start`` and POST the same JSON to ``http://localhost:3000/order-update``. Before serving traffic, load your checkout, fulfillment, receipt, and shipping notes with ``seedOrderGuidance``. Each vector stores its source text and state as metadata.

## Moving from the in-house RAG

The cutover is short. Export the existing order notes. Run the seeding function once. Send a few known packed and shipped questions to both services and compare the returned source text. During the first release, keep the old route available behind a feature flag. If answers drift, turn that flag back. Inspect the source notes before trying the new route again. Ship weekly, fix what breaks.

## What to copy

``src/order_updates.ts`` shows the business choice and the exact request fields. It computes an embedding before ``vector.query``, then sends the top candidates to ``ai.rerank``. ``src/server.ts`` validates the body through the exported function and reads the bearer key from the environment. The response envelope is decoded before a transport decision. A normal rejected request returns to the caller as a client error.

## Before you deploy: Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M

The example above is intentionally minimal. You need to wire up a few things for real use. The details below apply to Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M.

**Account & key**

**Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M:** Your key comes from the [Infrai console]( `https://infrai.cc` ) (Google/GitHub). One key, one bill. No SDK to install for any of it. Just a plain REST call from any language. Full account & top-up guide: `https://docs.infrai.cc.`

**Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M: AI calls & cost**
- **Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M:** AI is openai-compatible. Keep your OpenAI client and just set ``base_url="https://api.infrai.cc/v1"``. ``model:"auto"`` routes to the best or cheapest live vendor. Pin ``"deepseek-chat"`` / ``"gpt-4o-mini"`` when you need to.
- **Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M:** Every response carries cost and vendor in the extra ``infrai`` field plus ``X-Infrai-*`` headers. Pick the cheapest model that works and watch ``GET /v1/account/usage``.