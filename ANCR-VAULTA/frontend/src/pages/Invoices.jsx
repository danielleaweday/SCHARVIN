import { useEffect, useState } from "react";
import api, { formatMoney, formatDate } from "@/lib/api";
import { PageHeader, GlassCard, SectionHeader, KPICard, StatusPill } from "@/components/primitives";
import { Plus, Send, X } from "lucide-react";
import { toast } from "sonner";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ client_name: "", client_email: "", amount: "", due_date: "", notes: "" });

  const load = () => api.get("/invoices").then((r) => setInvoices(r.data));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/invoices", {
        client_name: form.client_name,
        client_email: form.client_email,
        amount: parseFloat(form.amount),
        due_date: form.due_date,
        notes: form.notes,
        line_items: [{ description: form.notes || "Services", qty: 1, rate: parseFloat(form.amount), total: parseFloat(form.amount) }],
      });
      toast.success("Invoice created");
      setShowCreate(false);
      setForm({ client_name: "", client_email: "", amount: "", due_date: "", notes: "" });
      load();
    } catch (e) {
      toast.error("Failed to create invoice");
    }
  };

  const paid = invoices.filter((i) => i.status === "Paid").reduce((a, b) => a + b.amount, 0);
  const pending = invoices.filter((i) => i.status === "Pending").reduce((a, b) => a + b.amount, 0);
  const late = invoices.filter((i) => i.status === "Late").reduce((a, b) => a + b.amount, 0);
  const recurring = invoices.filter((i) => i.status === "Recurring").length;

  return (
    <div className="space-y-8" data-testid="invoices-page">
      <PageHeader
        kicker="Invoice Center"
        title={<>Send. Track. <span className="gradient-text">Get paid.</span></>}
        subtitle="Create invoices, send them to clients, and track paid, pending, late, and recurring payments — all in one command deck."
        right={
          <button
            onClick={() => setShowCreate(true)}
            data-testid="invoices-new-btn"
            className="gradient-border rounded-lg"
          >
            <div className="px-4 py-2 rounded-lg bg-[#0a0a0a] hover:bg-[#111] flex items-center gap-2 text-[12px] font-medium">
              <Plus size={13} /> New Invoice
            </div>
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Paid" value={paid} accent="green" compact testid="invoices-kpi-paid" />
        <KPICard label="Pending" value={pending} accent="orange" compact testid="invoices-kpi-pending" />
        <KPICard label="Late" value={late} accent="orange" compact />
        <KPICard label="Recurring" value={String(recurring)} accent="violet" />
      </div>

      <GlassCard testid="invoices-list">
        <SectionHeader kicker="Ledger" title="All Invoices" />
        <div className="overflow-x-auto">
          <table className="w-full exec-table">
            <thead>
              <tr><th>Invoice #</th><th>Client</th><th>Due</th><th>Status</th><th className="text-right">Amount</th><th></th></tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="text-white/60 font-mono-tab text-[11.5px]">{inv.invoice_number}</td>
                  <td>
                    <div className="font-medium">{inv.client_name}</div>
                    <div className="text-[10.5px] text-white/40">{inv.client_email}</div>
                  </td>
                  <td className="text-white/60">{formatDate(inv.due_date)}</td>
                  <td><StatusPill status={inv.status} /></td>
                  <td className="text-right font-medium">{formatMoney(inv.amount)}</td>
                  <td className="text-right">
                    <button className="text-white/40 hover:text-white p-1" title="Send reminder">
                      <Send size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6" onClick={() => setShowCreate(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md glass-strong p-8 relative" data-testid="invoice-create-modal">
            <button onClick={() => setShowCreate(false)} className="absolute top-4 right-4 text-white/40 hover:text-white"><X size={16} /></button>
            <div className="eyebrow mb-2">New Invoice</div>
            <h3 className="font-display text-2xl mb-6">Create invoice</h3>
            <form onSubmit={create} className="space-y-3">
              <Field label="Client Name"><input required value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className="modal-input" data-testid="invoice-client-name" /></Field>
              <Field label="Client Email"><input type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} className="modal-input" data-testid="invoice-client-email" /></Field>
              <Field label="Amount (USD)"><input required type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="modal-input" data-testid="invoice-amount" /></Field>
              <Field label="Due Date"><input required type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="modal-input" data-testid="invoice-due-date" /></Field>
              <Field label="Description"><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="modal-input" /></Field>
              <button type="submit" data-testid="invoice-submit-btn" className="w-full gradient-border rounded-lg mt-2">
                <div className="px-4 py-3 rounded-lg bg-[#0a0a0a] hover:bg-[#111] text-[13px] font-semibold">Create Invoice</div>
              </button>
            </form>
            <style>{`
              .modal-input {
                width: 100%;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 8px; padding: 9px 12px;
                color: #fff; font-size: 13px; outline: none;
              }
              .modal-input:focus { border-color: rgba(0,240,255,0.5); }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-[0.22em] uppercase text-white/45 font-semibold mb-1.5">{label}</div>
      {children}
    </label>
  );
}
