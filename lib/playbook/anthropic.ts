// Thin wrapper around the Anthropic Messages API. No SDK dependency: this is
// a handful of fetch calls, and pulling in @anthropic-ai/sdk for this alone
// isn't worth the extra weight.

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";

export type AnthropicContentBlock =
  | { type: "text"; text: string; citations?: { url: string; title?: string }[] }
  | { type: "server_tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "web_search_tool_result"; tool_use_id: string; content: Array<{ type: string; url?: string; title?: string }> }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> };

export type AnthropicMessage = {
  id: string;
  content: AnthropicContentBlock[];
  stop_reason: string;
};

async function callAnthropic(body: Record<string, unknown>): Promise<AnthropicMessage> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not configured");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: MODEL, ...body }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Anthropic API error ${res.status}: ${text.slice(0, 500)}`);
  }

  return res.json();
}

/** A research turn: lets Claude use the hosted web_search tool, up to maxSearches times. */
export async function research(prompt: string, maxSearches = 4): Promise<AnthropicMessage> {
  return callAnthropic({
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: maxSearches }],
  });
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
    if (block.type === "web_search_tool_result") {
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
  inputSchema: Record<string, unknown>
): Promise<T> {
  const message = await callAnthropic({
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
    tools: [{ name: toolName, description: `Submit the ${toolName} result.`, input_schema: inputSchema }],
    tool_choice: { type: "tool", name: toolName },
  });

  const toolUse = message.content.find(
    (b): b is Extract<AnthropicContentBlock, { type: "tool_use" }> => b.type === "tool_use" && b.name === toolName
  );
  if (!toolUse) throw new Error("Claude did not return the expected structured output");
  return toolUse.input as T;
}
