// Curated local image pool, not a live search: the owner declined an
// Unsplash/Pexels API key, so the automated pipeline cannot browse the web
// for a fresh photo on every run. Instead each pillar has a small set of
// pre-downloaded HD photos (see public/images/playbook and ATTRIBUTION.md).
// The picker cycles through a pillar's set so consecutive posts in the same
// pillar don't repeat the same cover immediately.

const POOL: Record<string, string[]> = {
  "get-online": ["/images/playbook/get-online-1.jpg", "/images/playbook/get-online-2.jpg"],
  "speed-seo": ["/images/playbook/speed-seo-1.jpg", "/images/playbook/speed-seo-2.jpg"],
  "ai-automation": ["/images/playbook/ai-automation-1.jpg"],
  "news-translated": ["/images/playbook/news-translated-1.jpg", "/images/playbook/news-translated-2.jpg"],
  "case-teardown": ["/images/playbook/case-teardown-1.jpg", "/images/playbook/case-teardown-2.jpg"],
  "tools-tips": ["/images/playbook/tools-tips-1.jpg", "/images/playbook/tools-tips-2.jpg"],
};

const ALL_IMAGES = Object.values(POOL).flat();

export function pickCoverImage(pillarKey: string, recentImagesUsed: string[]): string {
  const options = POOL[pillarKey] ?? ALL_IMAGES;
  const fresh = options.filter((img) => !recentImagesUsed.includes(img));
  const from = fresh.length ? fresh : options;
  return from[Math.floor(Math.random() * from.length)];
}
