export type BodyReadResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413 | 415; error: string };

export type TextBodyResult = { ok: true; text: string } | { ok: false; status: 400 | 413; error: string };

async function readTextWithinLimit(request: Request, maxBytes: number): Promise<{ text: string } | { status: 400 | 413; error: string }> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBytes) return { status: 413, error: "Request body is too large." };
  if (!request.body) return { text: "" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return { status: 413, error: "Request body is too large." };
      }
      chunks.push(value);
    }
  } catch {
    return { status: 400, error: "Could not read request body." };
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { text: new TextDecoder().decode(bytes) };
}

export async function readTextBody(request: Request, maxBytes: number): Promise<TextBodyResult> {
  const result = await readTextWithinLimit(request, maxBytes);
  return "text" in result ? { ok: true, text: result.text } : { ok: false, ...result };
}

export async function readJsonBody(request: Request, maxBytes = 16_384): Promise<BodyReadResult> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return { ok: false, status: 415, error: "Content-Type must be application/json." };
  }
  const result = await readTextWithinLimit(request, maxBytes);
  if (!("text" in result)) return { ok: false, ...result };
  try {
    return { ok: true, value: JSON.parse(result.text) as unknown };
  } catch {
    return { ok: false, status: 400, error: "Request body must be valid JSON." };
  }
}

export async function readUrlEncodedBody(request: Request, maxBytes = 16_384): Promise<BodyReadResult> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/x-www-form-urlencoded") {
    return { ok: false, status: 415, error: "Form must use URL-encoded fields." };
  }
  const result = await readTextWithinLimit(request, maxBytes);
  if (!("text" in result)) return { ok: false, ...result };
  return { ok: true, value: Object.fromEntries(new URLSearchParams(result.text)) };
}
