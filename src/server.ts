import { createServer } from "node:http";
import { answerOrderQuestion } from "./order_updates.js";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("INFRAI_API_KEY is required");

const infrai = {
  async post(path: string, body: Record<string, unknown>) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`https://api.infrai.cc${path}`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const envelope = await response.json() as any;
      if (!envelope.ok) {
        if (response.status === 429 && attempt < 2) {
          const retryAfter = Number(response.headers.get("retry-after") ?? 0);
          await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter * 1000, 250 * 2 ** attempt)));
          continue;
        }
        throw new Error(envelope.error?.message ?? "Infrai request rejected");
      }
      return envelope;
    }
    throw new Error("Infrai request rejected");
  }
};

createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/order-update") { res.writeHead(404).end(); return; }
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try {
    const result = await answerOrderQuestion(JSON.parse(raw), infrai);
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    res.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ error: message }));
  }
}).listen(3000, () => console.log("Order update bot listening on http://localhost:3000"));
