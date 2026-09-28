// Thin wrapper around the Anthropic Messages API. No SDK dependency: this is
// a handful of fetch calls, and pulling in @anthropic-ai/sdk for this alone
// isn't worth the extra weight.
//
// Cost control lives here: the cheapest current model does the work, every call
// reports its real token usage into a CostMeter, and the caller can stop when a
// monthly budget is used up (see lib/playbook/budget.ts).

const API_URL = "https://api.anthropic.com/v1/messages";

/** Claude Haiku 4.5: the cheapest current model. Override with PLAYBOOK_MODEL if you ever want to trade cost for quality. */
export const PLAYBOOK_MODEL = process.env.PLAYBOOK_MODEL || "claude-haiku-4-5-20251001";

/** USD per million tokens. Unknown models fall back to the Haiku 4.5 price, so a typo never hides spend. */
const PRICE_PER_MTOK: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 1, output: 5 },
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-sonnet-5": { input: 3, output: 15 },
};
/** Anthropic's hosted web search is billed per search, on top of tokens. */
const WEB_SEARCH_USD = 0.01;

export type Usage = {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  server_tool_use?: { web_search_requests?: number };
};

/** Adds up what one article run really cost. */
export class CostMeter {
  usd = 0;
  inputTokens = 0;
  outputTokens = 0;
  searches = 0;

  add(model: string, usage: Usage | undefined) {
    if (!usage) return;
    const price = PRICE_PER_MTOK[model] ?? PRICE_PER_MTOK["claude-haiku-4-5-20251001"];
    const input =
      (usage.input_tokens ?? 0) +
      (usage.cache_creation_input_tokens ?? 0) * 1.25 +
      (usage.cache_read_input_tokens ?? 0) * 0.1;
    const output = usage.output_tokens ?? 0;
    const searches = usage.server_tool_use?.web_search_requests ?? 0;

    this.inputTokens += usage.input_tokens ?? 0;
    this.outputTokens += output;
    this.searches += searches;
    this.usd += (input * price.input + output * price.output) / 1_000_000 + searches * WEB_SEARCH_USD;
  }
}

export type AnthropicContentBlock =
  | { type: "text"; text: string; citations?: { url: string; title?: string }[] }
  | { type: "server_tool_use"; id: string; name: string; input: Record<string, unknown> }
  // `content` is a list of results, or a single error object when the search itself failed.
  | {
      type: "web_search_tool_result";
      tool_use_id: string;
      content: Array<{ type: string; url?: string; title?: string }> | { type: string; error_code?: string };
    }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> };

export type AnthropicMessage = {
  id: string;
  content: AnthropicContentBlock[];
  stop_reason: string;
  usage?: Usage;
};

async function callAnthropic(body: Record<string, unknown>, meter?: CostMeter): Promise<AnthropicMessage> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not configured");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: PLAYBOOK_MODEL, ...body }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Anthropic API error ${res.status}: ${text.slice(0, 500)}`);
  }

  const message = (await res.json()) as AnthropicMessage;
  meter?.add(PLAYBOOK_MODEL, message.usage);
  return message;
}

/** A research turn: lets Claude use the hosted web_search tool, up to maxSearches times (each search costs about a cent). */
export async function research(prompt: string, maxSearches = 2, meter?: CostMeter): Promise<AnthropicMessage> {
  return callAnthropic(
    {
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: maxSearches }],
    },
    meter
  );
}

/** Extracts the plain research summary text (all text blocks, concatenated) from a research() result. */
export function extractResearchText(message: AnthropicMessage): string {
  return message.content
    .filter((b): b is Extract<AnthropicContentBlock, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("\n\n");
}

/** Every URL the research step actually saw, so the writer can only cite real sources. */
export function extractSearchedUrls(message: AnthropicMessage): string[] {
  const urls = new Set<string>();
  for (const block of message.content) {
    // A failed search returns an error object instead of a list: skip it, the summary text may still be usable.
    if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
      for (const item of block.content) {
        if (item.url) urls.add(item.url);
      }
    }
    if (block.type === "text" && block.citations) {
      for (const c of block.citations) urls.add(c.url);
    }
  }
  return Array.from(urls);
}

/** A structured-output turn: forces a single tool call matching inputSchema, so the reply is guaranteed valid JSON. */
export async function generateStructured<T>(
  prompt: string,
  toolName: string,
  inputSchema: Record<string, unknown>,
  meter?: CostMeter
): Promise<T> {
  const message = await callAnthropic(
    {
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
      tools: [{ name: toolName, description: `Submit the ${toolName} result.`, input_schema: inputSchema }],
      tool_choice: { type: "tool", name: toolName },
    },
    meter
  );

  const toolUse = message.content.find(
    (b): b is Extract<AnthropicContentBlock, { type: "tool_use" }> => b.type === "tool_use" && b.name === toolName
  );
  if (!toolUse) throw new Error("Claude did not return the expected structured output");
  return toolUse.input as T;
}
