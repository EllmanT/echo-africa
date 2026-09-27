import { getDb, requireDb } from "@/lib/db/mongodb";
import { DEFAULT_PILLARS, DEFAULT_REGION_WEIGHTS, type Pillar, type Region } from "./pillars";

export type CalendarConfig = {
  pillars: Pillar[];
  regionWeights: Record<Region, number>;
};

const DOC_ID = "content-calendar";

export async function getCalendarConfig(): Promise<CalendarConfig> {
  const db = await getDb();
  const doc = await db?.collection("contentCalendar").findOne({ _id: DOC_ID as never });
  if (doc && Array.isArray(doc.pillars) && doc.pillars.length) {
    return { pillars: doc.pillars, regionWeights: doc.regionWeights ?? DEFAULT_REGION_WEIGHTS };
  }
  return { pillars: DEFAULT_PILLARS, regionWeights: DEFAULT_REGION_WEIGHTS };
}

export async function saveCalendarConfig(config: CalendarConfig): Promise<void> {
  const db = await requireDb();
  await db
    .collection("contentCalendar")
    .updateOne({ _id: DOC_ID as never }, { $set: { ...config, updatedAt: new Date() } }, { upsert: true });
}

function weightedPick<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((sum, i) => sum + Math.max(i.weight, 0), 0);
  if (total <= 0) return items[Math.floor(Math.random() * items.length)];
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= Math.max(item.weight, 0);
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

/** Picks a pillar and region for the next article, avoiding an immediate repeat of the last pillar when possible. */
export async function pickSlotContext(lastPillarKey?: string): Promise<{ pillar: Pillar; region: Region }> {
  const config = await getCalendarConfig();
  const candidates = config.pillars.length > 1 ? config.pillars.filter((p) => p.key !== lastPillarKey) : config.pillars;
  const pillar = weightedPick(candidates.length ? candidates : config.pillars);

  const regionEntries = Object.entries(config.regionWeights) as [Region, number][];
  const region = weightedPick(regionEntries.map(([key, weight]) => ({ key, weight }))).key;

  return { pillar, region };
}
