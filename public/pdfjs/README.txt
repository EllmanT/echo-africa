Pre-built PDF reader (pdfjs-dist 5.4.149, legacy build, Apache-2.0), loaded on demand by lib/review/extractDocument.ts.
Webpack cannot bundle it inside Next, so it is served as a static file. To upgrade: npm i -D pdfjs-dist@x.y.z, then copy legacy/build/pdf.min.mjs and pdf.worker.min.mjs here.
