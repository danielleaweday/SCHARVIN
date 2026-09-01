import { useEffect, useState, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Loader2, LogOut, Search, Download, Mail, CalendarClock, CheckCircle2,
  RefreshCw, Database, Users2,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuth";
import { api } from "../lib/api";
import { Seo } from "../components/Seo";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

const INSTITUTION_TYPES = ["University", "Foundation", "Investor", "Employer", "Government", "Nonprofit", "Other"];
const STATUS_COLORS = {
  New: "#2e7bff", Contacted: "#eab308", "Meeting Scheduled": "#a855f7",
  "Proposal Sent": "#f97316", Closed: "#10b981",
};
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—");

export default function AdminInquiries() {
  const { user, ready, logout, authApi } = useAdminAuth();
  const [data, setData] = useState({ inquiries: [], total: 0, byStatus: {}, statuses: [], sheetsEnabled: false });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: "all", institutionType: "all", date_from: "", date_to: "" });
  const [selected, setSelected] = useState(null);
  const [schedulingUrl, setSchedulingUrl] = useState("");

  const buildParams = useCallback((extra = {}) => {
    const p = {};
    if (filters.search) p.search = filters.search;
    if (filters.status !== "all") p.status = filters.status;
    if (filters.institutionType !== "all") p.institutionType = filters.institutionType;
    if (filters.date_from) p.date_from = filters.date_from;
    if (filters.date_to) p.date_to = filters.date_to;
    return { ...p, ...extra };
  }, [filters]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await authApi.get("/admin/inquiries", { params: buildParams() });
      setData(data);
    } catch (e) {
      if (e?.response?.status === 401) logout();
      else toast.error("Failed to load inquiries.");
    } finally { setLoading(false); }
  }, [buildParams]); // eslint-disable-line

  useEffect(() => { api.get("/config").then((r) => setSchedulingUrl(r.data?.schedulingUrl || "")).catch(() => {}); }, []);
  useEffect(() => { if (ready && user) { const t = setTimeout(load, 250); return () => clearTimeout(t); } }, [filters, ready, user]); // eslint-disable-line

  if (ready && !user) return <Navigate to="/admin/login" replace />;
  if (!ready) return <div className="grid min-h-screen place-items-center bg-ccdp-black text-ccdp-cream"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const exportCsv = async (all) => {
    try {
      const params = all ? {} : buildParams();
      const res = await authApi.get("/admin/inquiries/export", { params, responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url; a.download = `ccdp-inquiries-${today()}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success(all ? "Exported all inquiries." : "Exported filtered results.");
    } catch { toast.error("Export failed."); }
  };

  const patch = async (id, updates) => {
    try {
      const { data: updated } = await authApi.patch(`/admin/inquiries/${id}`, updates);
      setData((d) => ({ ...d, inquiries: d.inquiries.map((i) => (i.id === id ? updated : i)) }));
      setSelected((s) => (s && s.id === id ? updated : s));
      return updated;
    } catch { toast.error("Update failed."); }
  };

  return (
    <div className="min-h-screen bg-ccdp-black text-ccdp-cream" data-testid="admin-dashboard">
      <Seo title="Institutional Inquiries" noindex />
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ccdp-black/95">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-ccdp-gradient px-3 py-1.5 font-display text-sm font-extrabold text-white">CCDP CRM</span>
            <nav className="hidden items-center gap-3 text-sm sm:flex">
              <Link to="/admin/inquiries" className="font-semibold text-ccdp-white">Inquiries</Link>
              <Link to="/admin/waitlist" className="text-ccdp-cream/60 hover:text-ccdp-white">Shop Waitlist</Link>
              <Link to="/admin/orders" className="text-ccdp-cream/60 hover:text-ccdp-white">Orders</Link>
              <Link to="/admin/inventory" className="text-ccdp-cream/60 hover:text-ccdp-white">Inventory</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] sm:inline-flex ${data.sheetsEnabled ? "border-emerald-500/40 text-emerald-300" : "border-white/15 text-ccdp-cream/45"}`}>
              <Database className="h-3 w-3" /> Sheets {data.sheetsEnabled ? "synced" : "off"}
            </span>
            <span className="text-sm text-ccdp-cream/70">{user?.name}</span>
            <Button data-testid="admin-logout-btn" onClick={logout} variant="ghost" size="sm" aria-label="Sign out" className="text-ccdp-cream/70 hover:text-ccdp-white">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-8 md:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <div className="rounded-xl border border-white/10 bg-ccdp-charcoal/50 p-4">
            <p className="text-xs text-ccdp-cream/50">Total leads</p>
            <p className="mt-1 font-display text-2xl font-bold text-ccdp-white" data-testid="stat-total">{data.total}</p>
          </div>
          {data.statuses.map((s) => (
            <div key={s} className="rounded-xl border border-white/10 bg-ccdp-charcoal/50 p-4">
              <p className="flex items-center gap-1.5 text-xs text-ccdp-cream/50">
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[s] }} />{s}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-ccdp-white">{data.byStatus[s] ?? 0}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-ccdp-charcoal/40 p-4">
          <div className="min-w-[220px] flex-1">
            <Label className="text-[11px] text-ccdp-cream/50">Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ccdp-cream/40" />
              <Input data-testid="admin-search" placeholder="Organization, name or email"
                value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="border-white/15 bg-white/5 pl-9 text-ccdp-cream" />
            </div>
          </div>
          <div>
            <Label className="text-[11px] text-ccdp-cream/50">Status</Label>
            <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
              <SelectTrigger data-testid="filter-status" className="mt-1 w-[160px] border-white/15 bg-white/5 text-ccdp-cream"><SelectValue /></SelectTrigger>
              <SelectContent className="border-white/10 bg-ccdp-charcoal text-ccdp-cream">
                <SelectItem value="all">All statuses</SelectItem>
                {data.statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] text-ccdp-cream/50">Institution</Label>
            <Select value={filters.institutionType} onValueChange={(v) => setFilters((f) => ({ ...f, institutionType: v }))}>
              <SelectTrigger data-testid="filter-institution" className="mt-1 w-[150px] border-white/15 bg-white/5 text-ccdp-cream"><SelectValue /></SelectTrigger>
              <SelectContent className="border-white/10 bg-ccdp-charcoal text-ccdp-cream">
                <SelectItem value="all">All types</SelectItem>
                {INSTITUTION_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] text-ccdp-cream/50">From</Label>
            <Input type="date" data-testid="filter-from" value={filters.date_from} onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
              className="mt-1 w-[150px] border-white/15 bg-white/5 text-ccdp-cream" />
          </div>
          <div>
            <Label className="text-[11px] text-ccdp-cream/50">To</Label>
            <Input type="date" data-testid="filter-to" value={filters.date_to} onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
              className="mt-1 w-[150px] border-white/15 bg-white/5 text-ccdp-cream" />
          </div>
          <Button onClick={load} variant="outline" size="icon" aria-label="Refresh" className="border-white/15 bg-transparent text-ccdp-cream" title="Refresh"><RefreshCw className="h-4 w-4" /></Button>
          <Button data-testid="export-filtered-btn" onClick={() => exportCsv(false)} variant="outline" className="border-white/15 bg-transparent text-ccdp-cream"><Download className="mr-2 h-4 w-4" /> Export filtered</Button>
          <Button data-testid="export-all-btn" onClick={() => exportCsv(true)} className="bg-ccdp-gradient text-white"><Download className="mr-2 h-4 w-4" /> Export all</Button>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-ccdp-cream/45">
                <th className="px-4 py-3">Date</th><th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Contact</th><th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Interest</th><th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned</th><th className="px-4 py-3">Follow up</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-ccdp-cream/50"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
              ) : data.inquiries.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-ccdp-cream/50">No inquiries match these filters yet.</td></tr>
              ) : data.inquiries.map((i) => (
                <tr key={i.id} data-testid={`inquiry-row-${i.id}`}
                  onClick={() => setSelected(i)}
                  className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-ccdp-cream/60">{fmt(i.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-ccdp-white">{i.organization}</td>
                  <td className="px-4 py-3">{i.firstName} {i.lastName}<div className="text-[11px] text-ccdp-cream/45">{i.jobTitle}</div></td>
                  <td className="px-4 py-3 text-ccdp-cream/70">{i.organizationType}</td>
                  <td className="px-4 py-3 text-ccdp-cream/70">{i.areaOfInterest}{i.requestedDeck && <span className="ml-1 text-[10px] text-ccdp-purple">• deck</span>}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]"
                      style={{ background: `${STATUS_COLORS[i.status] || "#666"}22`, color: STATUS_COLORS[i.status] || "#aaa" }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLORS[i.status] || "#aaa" }} />{i.status || "New"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ccdp-cream/70">{i.assignedTo || "—"}</td>
                  <td className="px-4 py-3 text-ccdp-cream/60">{fmt(i.nextFollowUpDate)}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <a href={`mailto:${i.email}`} title="Email" data-testid={`email-${i.id}`}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-ccdp-cream/70 hover:text-ccdp-white"><Mail className="h-3.5 w-3.5" /></a>
                      {schedulingUrl && (
                        <a href={schedulingUrl} target="_blank" rel="noopener noreferrer" title="Open scheduler"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-ccdp-cream/70 hover:text-ccdp-white"><CalendarClock className="h-3.5 w-3.5" /></a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Detail / edit dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent data-testid="inquiry-detail" className="max-h-[92vh] overflow-y-auto border-white/10 bg-ccdp-charcoal text-ccdp-cream sm:max-w-[620px]">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-ccdp-white">{selected.organization}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div><span className="text-ccdp-cream/45">Contact</span><div>{selected.firstName} {selected.lastName}</div></div>
                <div><span className="text-ccdp-cream/45">Job title</span><div>{selected.jobTitle}</div></div>
                <div><span className="text-ccdp-cream/45">Email</span><div><a className="text-ccdp-blue hover:underline" href={`mailto:${selected.email}`}>{selected.email}</a></div></div>
                <div><span className="text-ccdp-cream/45">Phone</span><div>{selected.phone || "—"}</div></div>
                <div><span className="text-ccdp-cream/45">Institution type</span><div>{selected.organizationType}</div></div>
                <div><span className="text-ccdp-cream/45">Interest</span><div>{selected.areaOfInterest}</div></div>
                <div className="col-span-2"><span className="text-ccdp-cream/45">Website</span><div>{selected.website || "—"}</div></div>
                <div className="col-span-2"><span className="text-ccdp-cream/45">Message</span><div className="mt-1 rounded-lg border border-white/10 bg-white/5 p-3 text-ccdp-cream/80">{selected.message}</div></div>
              </div>

              <div className="mt-3 space-y-3 border-t border-white/10 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] text-ccdp-cream/50">Status</Label>
                    <Select value={selected.status || "New"} onValueChange={(v) => patch(selected.id, { status: v })}>
                      <SelectTrigger data-testid="detail-status" className="mt-1 border-white/15 bg-white/5 text-ccdp-cream"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-white/10 bg-ccdp-charcoal text-ccdp-cream">
                        {data.statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] text-ccdp-cream/50">Assigned team member</Label>
                    <Input data-testid="detail-assigned" defaultValue={selected.assignedTo || ""}
                      onBlur={(e) => e.target.value !== (selected.assignedTo || "") && patch(selected.id, { assignedTo: e.target.value })}
                      className="mt-1 border-white/15 bg-white/5 text-ccdp-cream" />
                  </div>
                  <div>
                    <Label className="text-[11px] text-ccdp-cream/50">Last contacted</Label>
                    <Input type="date" data-testid="detail-last" defaultValue={(selected.lastContactedDate || "").slice(0, 10)}
                      onChange={(e) => patch(selected.id, { lastContactedDate: e.target.value })}
                      className="mt-1 border-white/15 bg-white/5 text-ccdp-cream" />
                  </div>
                  <div>
                    <Label className="text-[11px] text-ccdp-cream/50">Next follow up</Label>
                    <Input type="date" data-testid="detail-next" defaultValue={(selected.nextFollowUpDate || "").slice(0, 10)}
                      onChange={(e) => patch(selected.id, { nextFollowUpDate: e.target.value })}
                      className="mt-1 border-white/15 bg-white/5 text-ccdp-cream" />
                  </div>
                </div>
                <div>
                  <Label className="text-[11px] text-ccdp-cream/50">Internal notes</Label>
                  <Textarea data-testid="detail-notes" rows={3} defaultValue={selected.internalNotes || ""}
                    onBlur={(e) => e.target.value !== (selected.internalNotes || "") && patch(selected.id, { internalNotes: e.target.value })}
                    className="mt-1 border-white/15 bg-white/5 text-ccdp-cream" placeholder="Log calls, context, next steps…" />
                </div>
                <Button data-testid="mark-followup-btn"
                  onClick={() => patch(selected.id, { lastContactedDate: today(), nextFollowUpDate: "" })}
                  className="w-full rounded-full bg-ccdp-gradient text-white">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Mark follow-up complete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
