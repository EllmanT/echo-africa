import { describe, expect, it } from "vitest";

import { isPublicHttpUrl } from "./safeUrl";

describe("isPublicHttpUrl", () => {
  it("allows ordinary public sites", () => {
    for (const u of ["https://techzim.co.zw/a?b=1", "http://example.com", "https://www.potraz.gov.zw/x"]) expect(isPublicHttpUrl(u)).toBe(true);
  });
  it("blocks loopback, private, link-local and metadata addresses", () => {
    for (const u of ["http://localhost:3000", "http://127.0.0.1", "http://10.0.0.5", "http://192.168.1.1", "http://172.16.0.1", "http://169.254.169.254/latest/meta-data", "http://0.0.0.0", "http://100.64.0.1"])
      expect(isPublicHttpUrl(u)).toBe(false);
  });
  it("blocks IP tricks, IPv6, credentials and odd schemes", () => {
    for (const u of ["http://2130706433", "http://0x7f000001", "http://[::1]/", "http://[fd00::1]/", "http://user:pw@example.com", "file:///etc/passwd", "ftp://example.com", "gopher://example.com", "not a url", "http://intranet", "http://thing.internal"])
      expect(isPublicHttpUrl(u)).toBe(false);
  });
});
