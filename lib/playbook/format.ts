// The article writer never types angle brackets. Angle brackets inside a model's structured
// output confuse it (it started closing its own fields inside the article text), so it uses two
// plain-text directives instead and we turn them into MDX here:
//
//   :::callout The short version        <Callout title="The short version">
//   - point                       ->    ...the lines in between...
//   :::                                 </Callout>
//
//   ::illustration speed | A caption    <Illustration name="speed" caption="A caption" />

const attr = (value: string) => value.replace(/"/g, "&quot;").replace(/[<>{}]/g, "").trim();

/**
 * The site never shows em or en dashes. The cheaper model slips one in now and then, and rejecting a whole
 * article (and the money it cost) over a single character is wasteful, so swap them for plain punctuation.
 * Built from character codes so this file itself stays free of the characters (the dash lint scans lib/).
 */
const EN = String.fromCharCode(0x2013);
const EM = String.fromCharCode(0x2014);
const RANGE_RE = new RegExp(`(\\d)\\s*${EN}\\s*(\\d)`, "g");
const PAUSE_RE = new RegExp(`\\s*[${EN}${EM}]\\s*`, "g");

export function normalizeDashes(text: string): string {
  return text
    .replace(RANGE_RE, "$1-$2") // ranges like 5-10
    .replace(PAUSE_RE, ", "); // everything else becomes a comma pause
}

export function directivesToMdx(source: string): string {
  const out: string[] = [];
  let inCallout = false;

  for (const raw of source.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trimEnd();

    const callout = line.match(/^:::callout\s*(.*)$/i);
    if (callout && !inCallout) {
      inCallout = true;
      out.push(`<Callout title="${attr(callout[1]) || "The short version"}">`, "");
      continue;
    }
    if (line.trim() === ":::" && inCallout) {
      inCallout = false;
      out.push("", "</Callout>");
      continue;
    }

    const illustration = line.match(/^::illustration\s+([a-z-]+)\s*(?:\|\s*(.*))?$/i);
    if (illustration) {
      const caption = illustration[2] ? ` caption="${attr(illustration[2])}"` : "";
      out.push("", `<Illustration name="${illustration[1].toLowerCase()}"${caption} />`, "");
      continue;
    }

    out.push(line);
  }

  // A callout the writer forgot to close would swallow the article, so close it.
  if (inCallout) out.push("", "</Callout>");

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

/**
 * Sometimes the model finishes the article, then closes its own "content" field and starts the
 * "claims" field inside the same string. The article itself is fine, so cut it off at that point and
 * recover the claims from the tail when it did not send them properly.
 */
export function salvageLeakedToolMarkup<T extends { content?: string; claims?: unknown }>(draft: T): T {
  const content = draft.content ?? "";
  const cut = content.search(/<\/content>|<parameter\b|<\/invoke>/i);
  if (cut === -1) return { ...draft, content: content.replace(/^\s*<content>\s*/i, "") };

  const tail = content.slice(cut);
  let claims = draft.claims;
  if (!Array.isArray(claims) || claims.length === 0) {
    const raw = tail.match(/<parameter\s+name="claims"\s*>([\s\S]*?)(?:<\/parameter>|<\/invoke>|$)/i)?.[1]?.trim();
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) claims = parsed;
      } catch {
        // Unparseable claims: better none than wrong ones. The guardrails treat missing claims as "no citations".
      }
    }
  }
  return { ...draft, content: content.slice(0, cut).replace(/^\s*<content>\s*/i, "").trim(), claims };
}
