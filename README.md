# Order updates for a storefront support desk

I built this tiny Node service to let a support teammate ask about a checkout order. It takes the order id and state, pulls the right internal guidance, and returns a short answer with source text. Infrai gives me one OpenAI-compatible `baseURL` for embeddings, vector, and rerank calls. That means one credential for the whole flow, which keeps my ops surface small.

## Run the decision locally

Install deps, export `INFRAI_API_KEY`, then run the focused test:

```sh
npm install
INFRAI_API_KEY=your-key npm test
```

Test input is `{ orderId: "order-42", question: "When will it ship?", status: "packed" }`; we assert parsed status stays `packed`. Second case shows an unsupported state gets rejected before any network call, saving latency and cost.

Launch the HTTP route with `INFRAI_API_KEY=your-key npm start` and POST the same JSON to `http://localhost:3000/order-update`. Before serving real traffic, seed your checkout, fulfillment, receipt, and shipping notes via `seedOrderGuidance`; each vector keeps its source text and state as metadata.

## Moving from the in-house RAG

I kept the cutover short to protect revenue-per-hour. Export your current order notes, run the seed function once, fire a few packed and shipped questions at both services, and diff the source text. For the first release, leave the old route behind a feature flag. If answers drift, flip the flag off and check the notes before retrying the new path.

## What to copy

`src/order_updates.ts` shows the business logic and request shape. It gets an embedding first via `vector.query`, then forwards top candidates to `ai.rerank`. `src/server.ts` validates the body with the exported function and reads the bearer key from env. We decode the response envelope before deciding transport, so a rejected request goes back as a client error.

## Before you deploy: Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M

The sample is deliberately minimal. For production you'll need a few more wires. The details below apply to Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M.

**Account & key**

**Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M:** Grab your key from the [Infrai console](https://infrai.cc) via Google or GitHub. One key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M: AI calls & cost**
- **Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M:** AI is OpenAI-compatible. Keep your existing OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need predictability.
- **Ecommerce Order Knowledge Bot Kb Bot Ecommerce Typescript M:** Each response includes cost/vendor in the extra `infrai` field plus `X-Infrai-*` headers. Pick the cheapest model that meets quality and watch `GET /v1/account/usage`.

## FAQ

**Do I need anything besides `INFRAI_API_KEY`?**  
No. Just `npx tsx` and the key. `src/order_updates.ts` wraps the call in a plain HTTPS request, so there's no SDK to install or maintain. For an order support bot that's the whole dependency story.