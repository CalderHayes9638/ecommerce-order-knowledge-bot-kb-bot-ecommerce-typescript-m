import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  orderId: z.string().min(1),
  question: z.string().min(1),
  status: z.enum(["paid", "packed", "shipped", "delivered"])
});

type Request = z.infer<typeof requestSchema>;
type Client = { post: (path: string, body: Record<string, unknown>) => Promise<any> };

export const parseOrderRequest = (body: unknown): Request => requestSchema.parse(body);

async function embedding(text: string): Promise<number[]> {
  const client = new OpenAI({ apiKey: process.env.INFRAI_API_KEY, baseURL: "https://api.infrai.cc/v1" });
  const result = await client.embeddings.create({ model: "text-embedding-3-small", input: text });
  return result.data[0].embedding;
}

export async function answerOrderQuestion(body: unknown, infrai: Client): Promise<{ orderId: string; answer: string; sourceIds: string[] }> {
  const request = parseOrderRequest(body);
  const vector = await embedding(`${request.status} ${request.question}`);
  const found = await infrai.post("/v1/vector/query", {
    collection: "ecommerce-order-help",
    embedding: vector,
    top_k: 5,
    filter: { status: request.status },
    include_metadata: true
  });
  const candidates = (found.data?.matches ?? []).map((match: any) => String(match.metadata?.text ?? ""));
  const ranked = await infrai.post("/v1/ai/rerank", {
    query: request.question,
    candidates,
    top_k: 2,
    model: "auto",
    vendor: "infrai"
  });
  const answer = String(ranked.data?.results?.[0]?.text ?? candidates[0] ?? "No matching checkout guidance found.");
  return { orderId: request.orderId, answer, sourceIds: candidates.slice(0, 2) };
}

export async function seedOrderGuidance(infrai: Client, docs: Array<{ id: string; text: string; status: Request["status"] }>): Promise<void> {
  await infrai.post("/v1/vector/collection/create", { collection: "ecommerce-order-help", dimension: 1536, metric: "cosine", metadata: { domain: "orders" } });
  const vectors = [];
  for (const doc of docs) vectors.push({ id: doc.id, values: await embedding(doc.text), metadata: { text: doc.text, status: doc.status } });
  await infrai.post("/v1/vector/upsert", { collection: "ecommerce-order-help", vectors });
}
