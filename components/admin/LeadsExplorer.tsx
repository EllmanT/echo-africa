"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa6";

import { StatusBadge, TierBadge } from "./Badge";
import { LEAD_STATUSES } from "@/lib/leads/types";
import type { AdminLead } from "@/lib/admin/leads";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";

const formatDate = (d?: Date | string) =>
  d ? new Date(d).toLocaleDateString("en-ZW", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

const TIER_OPTIONS = ["priority", "qualified", "nurture"];

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) =>
  value ? (
    <div className="border-b border-black/[0.06] py-2.5">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  ) : null;

const LeadDrawer = ({ lead, onClose, onSaved }: { lead: AdminLead; onClose: () => void; onSaved: (l: AdminLead) => void }) => {
  const [status, setStatus] = useState(lead.status);
  const [internalNotes, setInternalNotes] = useState(lead.internalNotes ?? "");
  const [tags, setTags] = useState((lead.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    const res = await fetch(`/api/admin/leads/${lead._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, internalNotes, tags: tagList }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      onSaved({ ...lead, status, internalNotes, tags: tagList });
    }
  };

  const waMessage = `Hi ${lead.name?.split(" ")[0] ?? "there"}, it's Tapiwa from Eka. Thanks for your request about ${lead.businessName}.`;
  const waHref = `https://wa.me/${(lead.whatsapp ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`;
  const mailtoHref = `mailto:${lead.email}?subject=${encodeURIComponent(`Re: ${lead.businessName}`)}&body=${encodeURIComponent(`Hi ${lead.name?.split(" ")[0] ?? "there"},\n\n`)}`;

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[92vw] max-w-lg overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <SheetTitle className="font-display text-xl font-bold tracking-tight">{lead.businessName}</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">{lead.name}</SheetDescription>
          </div>
          <div className="flex gap-2">
            <TierBadge tier={lead.tier} />
            <StatusBadge status={lead.status} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/10 px-4 py-2 text-sm font-medium text-[#128C4A]"
          >
            <FaWhatsapp /> WhatsApp
          </a>
          <a href={mailtoHref} className="inline-flex items-center gap-2 rounded-full bg-black/[0.05] px-4 py-2 text-sm font-medium">
            Email
          </a>
        </div>

        <dl className="mt-6">
          <DetailRow label="Email" value={lead.email} />
          <DetailRow label="WhatsApp" value={lead.whatsapp} />
          <DetailRow label="Needs" value={(lead.services ?? []).join(", ")} />
          <DetailRow label="What they do" value={lead.businessDescription} />
          <DetailRow label="Current website" value={lead.website} />
          <DetailRow label="Role" value={lead.role} />
          <DetailRow label="Main goal" value={lead.goal} />
          <DetailRow label="Timing" value={lead.timing} />
          <DetailRow label="Budget" value={lead.budget} />
          <DetailRow label="Notes from the lead" value={lead.notes} />
          <DetailRow label="Score" value={lead.score !== undefined ? `${lead.score} / 100` : undefined} />
          <DetailRow label="Source page" value={lead.source} />
          <DetailRow label="Received" value={formatDate(lead.createdAt)} />
          <DetailRow
            label="Emails sent"
            value={
              lead.emailsSent?.length
                ? lead.emailsSent.map((e) => `${e.type} (${formatDate(e.at)}${e.ok ? "" : ", failed"})`).join(", ")
                : "None yet"
            }
          />
          <DetailRow label="Unsubscribed" value={lead.unsubscribed ? "Yes" : undefined} />
        </dl>

        <div className="mt-6">
          <label className="text-sm font-semibold" htmlFor="lead-status">
            Status
          </label>
          <select
            id="lead-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="mt-2 h-11 w-full rounded-xl border border-black/[0.12] bg-white px-3 text-sm capitalize"
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("-", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold" htmlFor="lead-tags">
            Tags (comma separated)
          </label>
          <input
            id="lead-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="warm, referral"
            className="mt-2 h-11 w-full rounded-xl border border-black/[0.12] bg-white px-3 text-sm"
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold" htmlFor="lead-notes">
            Internal notes <span className="font-normal text-muted-foreground">(only you see this)</span>
          </label>
          <textarea
            id="lead-notes"
            rows={4}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/[0.12] bg-white p-3 text-sm"
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="h-10 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-purple disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {saved && <span className="text-sm text-muted-foreground">Saved</span>}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const LeadsExplorer = ({ leads: initialLeads }: { leads: AdminLead[] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState(initialLeads);
  const [openId, setOpenId] = useState<string | null>(searchParams.get("open"));

  useEffect(() => setLeads(initialLeads), [initialLeads]);

  const openLead = useMemo(() => leads.find((l) => l._id === openId) ?? null, [leads, openId]);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/admin/leads?${params.toString()}`);
  };

  return (
    <div>
      <form className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground">Tier</label>
          <select
            defaultValue={searchParams.get("tier") ?? ""}
            onChange={(e) => setFilter("tier", e.target.value)}
            className="mt-1 h-10 rounded-lg border border-black/[0.12] bg-white px-3 text-sm capitalize"
          >
            <option value="">All</option>
            {TIER_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground">Status</label>
          <select
            defaultValue={searchParams.get("status") ?? ""}
            onChange={(e) => setFilter("status", e.target.value)}
            className="mt-1 h-10 rounded-lg border border-black/[0.12] bg-white px-3 text-sm capitalize"
          >
            <option value="">All</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("-", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="block text-xs font-semibold text-muted-foreground">Search</label>
          <input
            defaultValue={searchParams.get("q") ?? ""}
            onBlur={(e) => setFilter("q", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setFilter("q", e.currentTarget.value)}
            placeholder="Name, business or email"
            className="mt-1 h-10 w-full rounded-lg border border-black/[0.12] bg-white px-3 text-sm"
          />
        </div>
        <a
          href={`/api/admin/leads/export?${searchParams.toString()}`}
          className="h-10 rounded-full border border-black/[0.12] bg-white px-4 text-sm font-medium leading-10 transition-colors hover:border-purple/40 hover:text-purple"
        >
          Export CSV
        </a>
      </form>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-black/[0.08] bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/[0.08] text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Business</th>
              <th className="px-5 py-3 font-medium">Needs</th>
              <th className="px-5 py-3 font-medium">Tier</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Budget</th>
              <th className="px-5 py-3 font-medium">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.06]">
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                  No leads match this filter.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr
                key={lead._id}
                onClick={() => setOpenId(lead._id)}
                className="cursor-pointer transition-colors hover:bg-black/[0.02]"
              >
                <td className="px-5 py-3">
                  <p className="font-medium">{lead.businessName ?? "-"}</p>
                  <p className="text-xs text-muted-foreground">{lead.name}</p>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{(lead.services ?? []).join(", ") || "-"}</td>
                <td className="px-5 py-3">
                  <TierBadge tier={lead.tier} />
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-5 py-3 text-muted-foreground">{lead.budget ?? "-"}</td>
                <td className="px-5 py-3 text-muted-foreground">{formatDate(lead.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openLead && (
        <LeadDrawer
          lead={openLead}
          onClose={() => setOpenId(null)}
          onSaved={(updated) => setLeads((prev) => prev.map((l) => (l._id === updated._id ? updated : l)))}
        />
      )}
    </div>
  );
};

export default LeadsExplorer;
