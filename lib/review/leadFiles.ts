import { Binary, ObjectId } from "mongodb";

import { requireDb } from "@/lib/db/mongodb";

/** Vercel refuses request bodies over 4.5MB, so 4MB is the most a visitor's file can be and still reach us. */
export const MAX_STORED_FILE_BYTES = 4 * 1024 * 1024;

export type StoredFileKind = "pdf" | "docx";

const TYPES: Record<StoredFileKind, { mime: string; ext: string }> = {
  pdf: { mime: "application/pdf", ext: "pdf" },
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext: "docx" },
};

/** Decides what a file really is from its bytes. The browser's claimed type and the file name are never trusted. */
export function sniffFileKind(bytes: Uint8Array): StoredFileKind | null {
  const starts = (sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts([0x25, 0x50, 0x44, 0x46])) return "pdf";
  if (starts([0x50, 0x4b, 0x03, 0x04])) {
    // A Word file is a zip that contains word/document.xml. Any other zip is refused.
    return Buffer.from(bytes).includes("word/document.xml", 0, "latin1") ? "docx" : null;
  }
  return null;
}

/** Keeps a file name harmless for storage and for the Content-Disposition header. */
export function safeFileName(name: string, kind: StoredFileKind): string {
  const base = name.replace(/\.[a-z0-9]{1,5}$/i, "").replace(/[^\w .-]/g, "_").replace(/\s+/g, " ").trim().slice(0, 80) || "document";
  return `${base}.${TYPES[kind].ext}`;
}

export type SavedFile = { fileName: string; size: number };

/** Stores the visitor's original file in Mongo, one per lead, and marks the lead so the admin can find it. */
export async function saveLeadFile(leadId: string, original: { name: string; bytes: Uint8Array }): Promise<SavedFile | "exists" | "invalid"> {
  const kind = sniffFileKind(original.bytes);
  if (!kind || original.bytes.byteLength === 0 || original.bytes.byteLength > MAX_STORED_FILE_BYTES) return "invalid";
  const db = await requireDb();
  const _id = new ObjectId(leadId);
  const fileName = safeFileName(original.name, kind);
  try {
    await db.collection("leadFiles").insertOne({
      _id: _id as never, // one file per lead: the lead id is the key, so a second upload cannot overwrite the first
      fileName,
      mime: TYPES[kind].mime,
      size: original.bytes.byteLength,
      data: new Binary(new Uint8Array(original.bytes)),
      createdAt: new Date(),
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return "exists";
    throw error;
  }
  await db.collection("leads").updateOne({ _id }, { $set: { fileName, fileSize: original.bytes.byteLength, updatedAt: new Date() } });
  return { fileName, size: original.bytes.byteLength };
}

export async function getLeadFile(leadId: string): Promise<{ fileName: string; mime: string; data: Buffer } | null> {
  if (!ObjectId.isValid(leadId)) return null;
  const db = await requireDb();
  const doc = await db.collection("leadFiles").findOne({ _id: new ObjectId(leadId) as never });
  if (!doc) return null;
  return { fileName: String(doc.fileName), mime: String(doc.mime), data: Buffer.from((doc.data as Binary).buffer) };
}
