// Fails when an em dash or en dash appears in public copy or AI prompt files.
// The owner does not want these characters anywhere on the site.
import fs from "node:fs";
import path from "node:path";

const roots = ["app", "components", "data", "content", "lib"];
const exts = new Set([".ts", ".tsx", ".mdx", ".md", ".json"]);
const bad = /[–—]/;
const hits = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (exts.has(path.extname(entry.name)) && !entry.name.endsWith(".test.ts")) {
      fs.readFileSync(full, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (bad.test(line)) hits.push(`${full}:${i + 1}: ${line.trim().slice(0, 110)}`);
        });
    }
  }
}

roots.filter((r) => fs.existsSync(r)).forEach(walk);

if (hits.length) {
  console.error(`Found ${hits.length} em/en dash occurrence(s):\n` + hits.join("\n"));
  process.exit(1);
}
console.log("No em/en dashes found.");
