import { describe, expect, it } from "vitest";

import { leadConfirmationEmail, ownerNotificationEmail } from "./templates";
import type { LeadInput } from "@/lib/leads/schema";

const lead: LeadInput = {
  services: ["website"],
  name: "Tendai Moyo",
  email: "tendai@example.co.zw",
  whatsapp: "+263771234567",
  businessName: "Moyo <b>Motors</b>",
  businessDescription: "Used cars in Harare",
  website: "",
  role: "owner",
  goal: "more-customers",
  timing: "asap",
  budget: "1000-2500",
  notes: "<script>alert(1)</script>",
};

describe("lead emails", () => {
  it("sends qualified leads the booking link and checklist, with no em dashes", () => {
    const mail = leadConfirmationEmail(lead, "qualified");
    expect(mail.to).toBe("tendai@example.co.zw");
    expect(mail.subject).toContain("Tendai");
    expect(mail.html).toContain("cal.com/tapiwa-muranda-midm4h");
    expect(mail.html).toContain("/resources/launch-checklist");
    expect(mail.html + mail.text).not.toMatch(/[–—]/);
  });

  it("sends nurture leads an honest note and free resources, not a booking link", () => {
    const mail = leadConfirmationEmail(lead, "nurture");
    expect(mail.html).not.toContain("cal.com");
    expect(mail.html).toContain("/playbook");
    expect(mail.text).toContain("not the right fit");
    expect(mail.html + mail.text).not.toMatch(/[–—]/);
  });

  it("escapes user input in the owner notification", () => {
    const mail = ownerNotificationEmail(lead, "qualified", 74);
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).not.toContain("<b>Motors</b>");
    expect(mail.html).toContain("&lt;script&gt;");
    expect(mail.subject).toContain("[QUALIFIED]");
  });

  it("builds a WhatsApp reply link from the lead's number", () => {
    const mail = ownerNotificationEmail(lead, "priority", 90);
    expect(mail.text).toContain("https://wa.me/263771234567");
    expect(mail.subject).toContain("[PRIORITY]");
  });
});
