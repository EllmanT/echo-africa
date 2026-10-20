/**
 * Reads a PDF or Word file in the visitor's own browser and returns its text, so the review does not wait on an
 * upload and the server never has to parse an untrusted document. The original is sent separately, after the
 * review, to /api/review/file. The heavy libraries are imported on demand, so nobody pays for them until they
 * actually pick a file.
 */

/** 4MB, not 5: the original is kept too, and Vercel refuses request bodies over 4.5MB. */
export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;
/** What is kept of a long document: about 2k tokens, plenty to find the process and its pain points. */
export const MAX_DOCUMENT_CHARS = 8000;
const MAX_PDF_PAGES = 40;

export type ExtractedDocument = { name: string; text: string; truncated: boolean; words: number };

export class DocumentError extends Error {}

type Kind = "pdf" | "docx";

/** Decides the type from the first bytes, not the file name, so a renamed file cannot slip through. */
async function sniff(file: File): Promise<Kind> {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const startsWith = (sig: number[]) => sig.every((b, i) => head[i] === b);
  if (startsWith([0x25, 0x50, 0x44, 0x46])) return "pdf"; // %PDF
  if (startsWith([0x50, 0x4b, 0x03, 0x04])) return "docx"; // PK zip container (checked again when opened)
  if (startsWith([0xd0, 0xcf, 0x11, 0xe0])) throw new DocumentError("That looks like an old .doc file. Save it as .docx or PDF and try again.");
  throw new DocumentError("Please choose a PDF or Word (.docx) file.");
}

/** Tidies extracted text and keeps it inside the size budget. */
export function shapeText(raw: string): { text: string; truncated: boolean } {
  const text = raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (text.length <= MAX_DOCUMENT_CHARS) return { text, truncated: false };
  return { text: text.slice(0, MAX_DOCUMENT_CHARS).replace(/\s+\S*$/, ""), truncated: true };
}

const PDFJS_URL: string = "/pdfjs/pdf.min.mjs";

type PdfJs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: { data: Uint8Array; isEvalSupported: boolean }) => {
    promise: Promise<{
      numPages: number;
      getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: Array<{ str?: string; hasEOL?: boolean }> }> }>;
      destroy: () => Promise<void>;
    }>;
  };
};

async function readPdf(file: File): Promise<string> {
  // Served from /public as a static file: webpack cannot bundle pdf.js's ES build inside Next (see public/pdfjs/README.txt).
  const pdfjs = (await import(/* webpackIgnore: true */ PDFJS_URL)) as PdfJs;
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false }).promise;
  try {
    const parts: string[] = [];
    let chars = 0;
    for (let i = 1; i <= Math.min(doc.numPages, MAX_PDF_PAGES) && chars < MAX_DOCUMENT_CHARS * 2; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const line = content.items.map((it) => ("str" in it ? it.str + ("hasEOL" in it && it.hasEOL ? "\n" : " ") : "")).join("");
      parts.push(line);
      chars += line.length;
    }
    return parts.join("\n\n");
  } finally {
    void doc.destroy();
  }
}

async function readDocx(file: File): Promise<string> {
  const mammoth = (await import("mammoth/mammoth.browser")) as unknown as {
    extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
  };
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

/** Throws a DocumentError with a plain sentence the visitor can act on. */
export async function extractDocument(file: File): Promise<ExtractedDocument> {
  if (file.size === 0) throw new DocumentError("That file is empty.");
  if (file.size > MAX_DOCUMENT_BYTES) throw new DocumentError("That file is over 4MB. Try a shorter version or paste the key part instead.");
  const kind = await sniff(file);
  let raw: string;
  try {
    raw = kind === "pdf" ? await readPdf(file) : await readDocx(file);
  } catch (error) {
    if (error instanceof DocumentError) throw error;
    console.warn("[review-doc] could not read", kind, error);
    throw new DocumentError(kind === "pdf" ? "We could not open that PDF. It may be protected. Try another copy or paste the text." : "We could not open that Word file. Try saving it as .docx again, or paste the text.");
  }
  const { text, truncated } = shapeText(raw);
  if (text.length < 40) {
    throw new DocumentError(kind === "pdf" ? "That PDF has no readable text, it may be a scan. Paste the key steps instead." : "That file has almost no text. Paste the key steps instead.");
  }
  return { name: file.name.slice(0, 120), text, truncated, words: text.split(/\s+/).length };
}
