// Blocks `npm run deploy` (vercel --prod) unless you are on a clean, pushed `main`.
// Why: `vercel --prod` ships whatever is checked out locally, so running it from `development`
// silently replaced Production with unreviewed work. Normal releases = merge to main and push;
// Vercel then deploys Production from Git by itself.
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { encoding: "utf8" }).trim();
const fail = (msg) => {
  console.error(`\n  Deploy blocked: ${msg}\n`);
  process.exit(1);
};

const branch = run("git branch --show-current");
if (branch !== "main") fail(`you are on "${branch}". Production deploys only from "main" (merge, push, and Vercel deploys it).`);
if (run("git status --porcelain")) fail("you have uncommitted changes.");
run("git fetch origin main --quiet");
if (run("git rev-parse HEAD") !== run("git rev-parse origin/main")) fail("local main is not the same as origin/main. Push or pull first.");
console.log("main is clean and matches origin/main. Deploying.");
