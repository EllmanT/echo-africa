// Generates several Playbook articles in a row against the database in .env.local.
// The scheduled GitHub Actions job does this once deployed; this is for filling the
// Playbook up front. Run with: npm run backfill -- 8

import fs from "node:fs";
import path from "node:path";

// Load .env.local by hand: this script runs outside Next's own env loading.
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

async function main() {
  const { generateArticle } = await import("../lib/playbook/generate");
  const count = Math.max(1, Number(process.argv[2]) || 1);

  for (let i = 1; i <= count; i++) {
    const started = Date.now();
    console.log(`\n[${i}/${count}] generating...`);
    const result = await generateArticle("backfill");
    const seconds = Math.round((Date.now() - started) / 1000);
    const cost = result.costUsd !== undefined ? ` cost $${result.costUsd.toFixed(4)}` : "";
    const month =
      result.monthSpentUsd !== undefined ? ` (month so far $${result.monthSpentUsd.toFixed(3)} of $${(result.monthBudgetUsd ?? 0).toFixed(2)})` : "";
    console.log(`[${i}/${count}] ${result.status} in ${seconds}s${cost}${month}`, result.slug ?? "", result.error ?? "");
    if (result.status === "skipped") break;
    if (result.reasons?.length) console.log("  hard reasons:", result.reasons);
    if (result.flags?.length) console.log("  flags:", result.flags);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
