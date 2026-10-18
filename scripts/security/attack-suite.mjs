// Repeatable attack tests for eka.dev. Run ONLY against a test deployment with its own test database.
//
//   BASE_URL=http://localhost:3060 TEST_MONGODB_URI="mongodb+srv://..." TEST_DB=eka_test \
//   ADMIN_PW="..." node scripts/security/attack-suite.mjs
//
// Safety: refuses to run against eka.dev, and refuses a database whose name does not contain "test".
// Every test prints PASS or FAIL with the evidence; the exit code is the number of failures.

import { MongoClient, ObjectId } from "mongodb";

const BASE = (process.env.BASE_URL ?? "").replace(/\/$/, "");
const URI = process.env.TEST_MONGODB_URI;
const DBN = process.env.TEST_DB ?? "eka_test";
const ADMIN_PW = process.env.ADMIN_PW;

if (!BASE || !URI) throw new Error("Set BASE_URL and TEST_MONGODB_URI");
if (/(^|\.)eka\.dev/.test(new URL(BASE).host)) throw new Error("Refusing to attack the production domain");
if (!/test/i.test(DBN)) throw new Error('Refusing: TEST_DB must contain "test"');

const client = new MongoClient(URI);
await client.connect();
const db = client.db(DBN);

let failures = 0;
const results = [];
function check(id, name, ok, evidence = "") {
  if (!ok) failures++;
  results.push({ id, name, ok, evidence });
  console.log(`${ok ? "PASS" : "FAIL"}  ${id}  ${name}${evidence ? `  [${evidence}]` : ""}`);
}

let ipCounter = 10;
const nextIp = () => `198.51.100.${++ipCounter}`;
async function call(path, { method = "GET", body, headers = {}, cookie, ip = nextIp(), raw } = {}) {
  const res = await fetch(BASE + path, {
    method,
    redirect: "manual",
    headers: {
      ...(body !== undefined || raw !== undefined ? { "Content-Type": "application/json" } : {}),
      "x-vercel-forwarded-for": ip,
      "x-forwarded-for": ip, // older builds read this header instead
      ...(process.env.VERCEL_BYPASS_TOKEN ? { "x-vercel-protection-bypass": process.env.VERCEL_BYPASS_TOKEN } : {}),
      ...(cookie ? { cookie } : {}),
      ...headers,
    },
    body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, headers: res.headers, text, json };
}

const complete = (over = {}, data = {}) => ({
  stage: "complete",
  source: "attack-suite",
  elapsedMs: 9000,
  company: "",
  turnstileToken: "suite-token",
  data: {
    services: ["website"],
    name: "Test Person",
    email: "suite+base@example.com",
    whatsapp: "+263771234567",
    businessName: "Test Co",
    businessDescription: "",
    website: "",
    role: "owner",
    goal: "more-customers",
    timing: "asap",
    budget: "500-1000",
    notes: "",
    ...data,
  },
  ...over,
});
const partial = (data = {}, over = {}) => ({
  stage: "partial",
  source: "attack-suite",
  data: { services: ["website"], name: "Victim", email: "victim@example.com", whatsapp: "+263771110000", ...data },
  ...over,
});

// ---------------------------------------------------------------- headers
{
  const r = await call("/");
  const h = r.headers;
  check("H1", "Security headers present on the homepage",
    h.get("strict-transport-security") && h.get("x-frame-options") === "DENY" && h.get("x-content-type-options") === "nosniff" &&
      h.get("referrer-policy") && h.get("permissions-policy") && h.get("content-security-policy-report-only"),
    `HSTS=${!!h.get("strict-transport-security")} XFO=${h.get("x-frame-options")} CSP-RO=${!!h.get("content-security-policy-report-only")}`);
  check("H2", "X-Powered-By is not advertised", !h.get("x-powered-by"), String(h.get("x-powered-by")));
  const api = await call("/api/events", { method: "POST", body: {} });
  check("H3", "API responses are not cacheable", /no-store/.test(api.headers.get("cache-control") ?? ""), api.headers.get("cache-control"));
}

// ---------------------------------------------------------------- auth surface
{
  const adminGets = ["/api/admin/leads/export", "/api/admin/jobruns", "/api/admin/posts", "/api/admin/projects", "/api/admin/faqs", "/api/admin/calendar"];
  const bypass = { "x-middleware-subrequest": "middleware:middleware:middleware:middleware:middleware" };
  let bad = [];
  for (const p of adminGets) {
    for (const hdrs of [{}, bypass]) {
      const r = await call(p, { headers: hdrs });
      if (r.status !== 401) bad.push(`${p} -> ${r.status}`);
    }
  }
  check("A1", "Every admin GET route rejects anonymous callers, with and without the middleware-bypass header", bad.length === 0, bad.join("; "));

  const writes = [["POST", "/api/admin/playbook/generate"], ["PUT", "/api/admin/settings"], ["POST", "/api/admin/posts"], ["DELETE", "/api/admin/posts/x"], ["PATCH", "/api/admin/leads/x"]];
  bad = [];
  for (const [m, p] of writes) {
    const r = await call(p, { method: m, body: {}, headers: bypass });
    if (r.status !== 401) bad.push(`${m} ${p} -> ${r.status}`);
  }
  check("A2", "Admin write routes (incl. the paid article generator) reject anonymous callers", bad.length === 0, bad.join("; "));

  const pg = await call("/admin/leads", { headers: bypass });
  check("A3", "Admin page redirects anonymous visitors to login even with the bypass header", pg.status >= 300 && pg.status < 400 && /\/admin\/login/.test(pg.headers.get("location") ?? ""), `${pg.status} ${pg.headers.get("location")}`);

  for (const p of ["/api/cron/nurture", "/api/cron/playbook"]) {
    const bad2 = [];
    for (const auth of [undefined, "Bearer undefined", "Bearer ", "Bearer wrong-secret-value-123"]) {
      const r = await call(p, { method: "POST", headers: auth ? { authorization: auth } : {} });
      if (r.status !== 401) bad2.push(`${auth} -> ${r.status}`);
    }
    check("A4", `Cron endpoint ${p} rejects missing and guessable secrets`, bad2.length === 0, bad2.join("; "));
  }
}

// ---------------------------------------------------------------- input handling
{
  const r1 = await call("/api/leads", { method: "POST", raw: "x".repeat(60000) });
  check("I1", "Oversized body is refused", r1.status === 400, String(r1.status));
  const r2 = await call("/api/leads", { method: "POST", raw: "{not json" });
  check("I2", "Malformed JSON is refused", r2.status === 400, String(r2.status));
  const inj = [
    partial({}, { leadId: { $ne: null } }),
    partial({ email: { $gt: "" } }),
    partial({ services: { $ne: 1 } }),
    partial({ name: { $regex: ".*" } }),
  ];
  const codes = [];
  for (const body of inj) codes.push((await call("/api/leads", { method: "POST", body })).status);
  check("I3", "NoSQL operator payloads are rejected by validation", codes.every((c) => c === 400), codes.join(","));
}

// ---------------------------------------------------------------- lead integrity (IDOR / mass assignment)
{
  const email = `victim+${Date.now()}@example.com`;
  const v = await call("/api/leads", { method: "POST", body: partial({ email }) });
  const ref = v.json?.leadId;
  check("L1", "Partial lead returns a signed reference, not a bare database id", typeof ref === "string" && ref.includes("."), String(ref).slice(0, 40));
  const bareId = String(ref).split(".")[0];

  const a1 = await call("/api/leads", { method: "POST", body: partial({ name: "ATTACKER", email: `attacker+${Date.now()}@example.com` }, { leadId: bareId }) });
  let victimDoc = await db.collection("leads").findOne({ _id: new ObjectId(bareId) });
  check("L2", "A bare lead id (as seen in email links) cannot overwrite another lead", victimDoc?.name === "Victim" && a1.json?.leadId?.split(".")[0] !== bareId, `victim.name=${victimDoc?.name}`);

  const a2 = await call("/api/leads", { method: "POST", body: partial({ name: "ATTACKER2", email: `attacker2+${Date.now()}@example.com` }, { leadId: `${bareId}.${"0".repeat(24)}` }) });
  victimDoc = await db.collection("leads").findOne({ _id: new ObjectId(bareId) });
  check("L3", "A forged signature cannot overwrite another lead", victimDoc?.name === "Victim" && a2.json?.leadId?.split(".")[0] !== bareId, `victim.name=${victimDoc?.name}`);

  const ok = await call("/api/leads", { method: "POST", body: partial({ name: "Victim Updated", email }, { leadId: ref }) });
  victimDoc = await db.collection("leads").findOne({ _id: new ObjectId(bareId) });
  check("L4", "The genuine signed reference still updates its own lead", victimDoc?.name === "Victim Updated" && ok.json?.leadId?.split(".")[0] === bareId, `name=${victimDoc?.name}`);

  const m = await call("/api/leads", {
    method: "POST",
    body: partial({ email: `mass+${Date.now()}@example.com`, status: "won", tier: "priority", score: 999, unsubscribed: true, emailsSent: [{ type: "x" }], _id: "64b7f0c2a1b2c3d4e5f60718" }),
  });
  const md = await db.collection("leads").findOne({ _id: new ObjectId(String(m.json?.leadId).split(".")[0]) });
  check("L5", "Extra fields (status, tier, score, _id...) are ignored", md && md.status === "partial" && md.score === undefined && md.tier === undefined && !md.unsubscribed && !md.emailsSent, JSON.stringify({ status: md?.status, score: md?.score, tier: md?.tier }));

  const bot = await call("/api/leads", { method: "POST", body: complete({ company: "I am a bot" }) });
  check("L6", "Honeypot submissions are silently dropped (no lead stored)", bot.json?.leadId === null, JSON.stringify(bot.json));
}

// ---------------------------------------------------------------- bot check (only when the target has Turnstile configured)
if (process.env.EXPECT_TURNSTILE) {
  const mode = process.env.EXPECT_TURNSTILE; // "pass" = Cloudflare always-pass test secret, "fail" = always-fail test secret
  const noTok = await call("/api/leads", { method: "POST", body: { ...complete({}, { email: `ts+none+${Date.now()}@example.com` }), turnstileToken: undefined } });
  check("T1", "Final lead submit without a Turnstile token is refused", noTok.status === 400, String(noTok.status));
  const huge = await call("/api/leads", { method: "POST", body: { ...complete({}, { email: `ts+huge+${Date.now()}@example.com` }), turnstileToken: "x".repeat(5000) } });
  check("T2", "Oversized Turnstile token is refused", huge.status === 400, String(huge.status));
  const tok = await call("/api/leads", { method: "POST", body: complete({}, { email: `ts+tok+${Date.now()}@example.com` }) });
  check("T3", mode === "pass" ? "A token Cloudflare accepts lets the lead through" : "A token Cloudflare rejects is refused", mode === "pass" ? tok.status === 200 && tok.json?.ok : tok.status === 400, String(tok.status));
  const part = await call("/api/leads", { method: "POST", body: partial({ email: `ts+partial+${Date.now()}@example.com` }) });
  check("T4", "Partial saves do not need a token (no email, no cost)", part.status === 200, String(part.status));
}

// ---------------------------------------------------------------- stored XSS / CSV injection
let adminCookie = "";
if (ADMIN_PW) {
  const login = await call("/api/admin/login", { method: "POST", body: { password: ADMIN_PW } });
  const setCookie = login.headers.get("set-cookie") ?? "";
  adminCookie = setCookie.split(";")[0];
  check("S1", "Admin login works and issues an HttpOnly, SameSite cookie", login.status === 200 && /HttpOnly/i.test(setCookie) && /SameSite=lax/i.test(setCookie), `${login.status} flags=${setCookie.split(";").slice(1).join(";").trim()}`);

  const evil = complete({}, { email: `xss+${Date.now()}@example.com`, name: "=HYPERLINK(\"http://evil.example\",\"click\")", businessName: "<img src=x onerror=alert(1)>", notes: "+cmd|' /C calc'!A0" });
  const sub = await call("/api/leads", { method: "POST", body: evil });
  check("S2", "Hostile lead text is accepted and stored (we sanitise on output, not input)", sub.status === 200 && sub.json?.ok, JSON.stringify(sub.json)?.slice(0, 120));

  const csv = await call("/api/admin/leads/export", { cookie: adminCookie });
  const row = csv.text.split("\n").find((l) => l.includes("HYPERLINK"));
  check("S3", "CSV export neutralises formula injection (cells start with ' )", !!row && !/(^|,)"?=HYPERLINK/.test(row) && /'=HYPERLINK/.test(row) && /'\+cmd/.test(row), row?.slice(0, 80));

  const page = await call("/admin/leads", { cookie: adminCookie });
  check("S4", "Admin leads page renders hostile text escaped (no live <img onerror>)", page.status === 200 && !/<img[^>]+onerror/i.test(page.text), `status=${page.status}`);

  const xs = await call("/api/admin/settings", { method: "PUT", cookie: adminCookie, headers: { origin: "https://evil.example" }, body: {} });
  check("S5", "A cross-site origin cannot use an admin session to write (CSRF)", xs.status === 403, String(xs.status));

  // MDX: hostile content must be rejected on save, and blocked on render even if planted straight in the database.
  const hostile = [
    "Hello {process.env.SESSION_SECRET} {1+1}",
    "<script>window.__pwn=1</script>",
    '<iframe src="https://evil.example"></iframe>',
    "[x](javascript:alert(1))",
  ].join("\n\n");
  const slug = `suite-mdx-${Date.now()}`;
  const mk = await call("/api/admin/posts", {
    method: "POST", cookie: adminCookie,
    body: { slug, title: "MDX probe", description: "probe", date: "2026-10-18", tags: [], published: true, content: hostile },
  });
  check("M1", "Saving an article containing <script>/<iframe> is rejected (400)", mk.status === 400, `${mk.status} ${mk.json?.error ?? ""}`);

  const planted = `suite-planted-${Date.now()}`;
  await db.collection("posts").insertOne({ slug: planted, title: "Planted", description: "planted", date: "2026-10-18", tags: [], published: true, source: "manual", content: hostile, createdAt: new Date(), updatedAt: new Date() });
  const pubPage = await call(`/playbook/${planted}`);
  // Only inspect the server-rendered HTML, not the flight payload (which may quote the source as an escaped string).
  const html = pubPage.text.split("self.__next_f")[0];
  const leakedTag = /<iframe|<script>\s*window\.__pwn/i.test(html);
  const jsUrl = /href="javascript:/i.test(pubPage.text);
  check("M2", "Planted <script>/<iframe> and javascript: links do not reach the public page", pubPage.status === 200 && !leakedTag && !jsUrl, `page=${pubPage.status} tag=${leakedTag} jsurl=${jsUrl}`);
  await db.collection("posts").deleteOne({ slug: planted });
} else {
  console.log("SKIP  S1-S5, M1  (set ADMIN_PW to run the authenticated tests)");
}

// ---------------------------------------------------------------- abuse and DoS (run last: they trip limits)
{
  const ip = "203.0.113.77";
  const codes = [];
  for (let i = 0; i < 26; i++) codes.push((await call("/api/leads", { method: "POST", ip, body: partial({ email: `flood${i}+${Date.now()}@example.com` }) })).status);
  const okCount = codes.filter((c) => c === 200).length;
  const limited = codes.filter((c) => c === 429).length;
  check("D1", "Lead endpoint rate-limits one IP (limit 20/hour)", okCount <= 20 && limited >= 5, `200s=${okCount} 429s=${limited}`);

  const spoofCodes = [];
  for (let i = 0; i < 25; i++) spoofCodes.push((await call("/api/leads", { method: "POST", ip: nextIp(), body: partial({ email: `rot${i}+${Date.now()}@example.com` }) })).status);
  check("D2", "Rotating spoofed IPs still gets through (expected on non-Vercel hosts; Vercel overwrites the header). Informational", true, `200s=${spoofCodes.filter((c) => c === 200).length}`);

  const ipL = "203.0.113.88";
  const loginCodes = [];
  for (let i = 0; i < 12; i++) loginCodes.push((await call("/api/admin/login", { method: "POST", ip: ipL, body: { password: `wrong-${i}` } })).status);
  check("D3", "Admin login locks one IP out after 8 failures", loginCodes.slice(0, 8).every((c) => c === 401) && loginCodes.slice(9).every((c) => c === 429), loginCodes.join(","));

  const rot = [];
  for (let i = 0; i < 50; i++) rot.push((await call("/api/admin/login", { method: "POST", ip: nextIp(), body: { password: `wrong-rot-${i}` } })).status);
  check("D4", "Brute force across rotating IPs is stopped by the global login ceiling (40 / 15 min)", rot.slice(-5).every((c) => c === 429) && rot.filter((c) => c === 401).length <= 40, `401s=${rot.filter((c) => c === 401).length} 429s=${rot.filter((c) => c === 429).length}`);

  const events = [];
  for (let i = 0; i < 5; i++) events.push((await call("/api/events", { method: "POST", raw: "x".repeat(5000) })).status);
  check("D5", "Analytics endpoint ignores oversized payloads without erroring", events.every((c) => c === 204), events.join(","));

  const audits = await db.collection("adminAudit").countDocuments({ ok: false });
  check("D6", "Failed logins are written to the adminAudit trail", audits > 0, `failed=${audits}`);
}

// ---------------------------------------------------------------- cleanup
await db.collection("rateLimits").deleteMany({});
await client.close();
console.log(`\n${results.length - failures}/${results.length} passed, ${failures} failed`);
process.exit(failures);
