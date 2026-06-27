// Anthropic doesn't expose an embeddings endpoint, so this uses Voyage AI —
// the provider Anthropic itself recommends for embeddings. If you'd rather
// standardize on something else (OpenAI embeddings, a local model), swap
// the implementation here; nothing else in the app needs to change as long
// as embedText keeps returning a same-length number[] and you update the
// `dimensions` on underpinEmailEmbeddings in schema.ts to match.

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
// TODO: confirm this model's actual output dimension against Voyage's docs
// and make sure it matches `dimensions` on underpinEmailEmbeddings in
// schema.ts — I can't hit Voyage's API from this sandbox to verify it, and
// a mismatch will fail at insert time, not silently.
const VOYAGE_MODEL = "voyage-3.5-lite";

export function isEmbeddingConfigured(): boolean {
  return Boolean(VOYAGE_API_KEY);
}

export async function embedText(text: string): Promise<number[]> {
  if (!VOYAGE_API_KEY) {
    throw new Error(
      "VOYAGE_API_KEY is not set — vector search is disabled until it is. See .env.example.",
    );
  }
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text.slice(0, 8000),
      model: VOYAGE_MODEL,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Voyage embeddings request failed: ${res.status} ${body}`);
  }
  const json = (await res.json()) as { data: { embedding: number[] }[] };
  const embedding = json.data[0]?.embedding;
  if (!embedding) throw new Error("Voyage returned no embedding");
  return embedding;
}
