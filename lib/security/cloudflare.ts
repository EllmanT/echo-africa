/**
 * When Cloudflare proxies the site, Vercel sees Cloudflare's IP as the visitor and the real visitor
 * arrives in `cf-connecting-ip`. That header is only believable when the connection itself came from
 * Cloudflare, otherwise anyone who reaches Vercel directly could write any IP into it and dodge rate limits.
 *
 * Ranges: https://www.cloudflare.com/ips-v4 and https://www.cloudflare.com/ips-v6 (checked 2026-10-18).
 * They change rarely; re-check them quarterly (see docs/security/SETUP_GUIDE.md).
 */

const V4_RANGES = [
  "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22", "141.101.64.0/18", "108.162.192.0/18",
  "190.93.240.0/20", "188.114.96.0/20", "197.234.240.0/22", "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13",
  "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
];
const V6_RANGES = ["2400:cb00::/32", "2606:4700::/32", "2803:f800::/32", "2405:b500::/32", "2405:8100::/32", "2a06:98c0::/29", "2c0f:f248::/32"];

function v4ToInt(ip: string): number | null {
  const p = ip.split(".");
  if (p.length !== 4) return null;
  let n = 0;
  for (const part of p) {
    if (!/^\d{1,3}$/.test(part) || Number(part) > 255) return null;
    n = n * 256 + Number(part);
  }
  return n;
}

function v6ToBigInt(ip: string): bigint | null {
  const clean = ip.split("%")[0].toLowerCase();
  if (!/^[0-9a-f:]+$/.test(clean)) return null;
  const halves = clean.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? head.length !== 8 : missing < 0) return null;
  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill("0"), ...tail];
  if (groups.length !== 8) return null;
  let n = BigInt(0);
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    n = (n << BigInt(16)) | BigInt(parseInt(g, 16));
  }
  return n;
}

const V4 = V4_RANGES.map((c) => {
  const [base, bits] = c.split("/");
  return { base: v4ToInt(base)!, bits: Number(bits) };
});
const V6 = V6_RANGES.map((c) => {
  const [base, bits] = c.split("/");
  return { base: v6ToBigInt(base)!, bits: Number(bits) };
});

export function isCloudflareIp(ip: string | null | undefined): boolean {
  if (!ip) return false;
  const value = ip.trim();
  if (value.includes(":")) {
    const n = v6ToBigInt(value);
    if (n === null) return false;
    return V6.some(({ base, bits }) => n >> BigInt(128 - bits) === base >> BigInt(128 - bits));
  }
  const n = v4ToInt(value);
  if (n === null) return false;
  return V4.some(({ base, bits }) => Math.floor(n / 2 ** (32 - bits)) === Math.floor(base / 2 ** (32 - bits)));
}
