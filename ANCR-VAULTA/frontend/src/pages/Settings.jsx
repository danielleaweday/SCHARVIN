import { useAuth } from "@/context/AuthContext";
import { PageHeader, GlassCard, SectionHeader } from "@/components/primitives";
import { Check } from "lucide-react";

const PERMISSIONS = {
  Student:      ["View income", "Track expenses", "View royalties", "Apply for scholarships"],
  Faculty:      ["View income", "Track expenses", "Manage teaching invoices", "Publish reports"],
  Artist:       ["Full financial access", "Sign contracts", "Manage invoices", "Access AIAH advisor"],
  Manager:      ["Client financial view", "Approve budgets", "Track royalties", "Manage tour budgets"],
  Accountant:   ["Access tax center", "Export reports", "Manage deductions", "Filing prep"],
  Attorney:     ["Contracts library", "E-sign management", "Compliance oversight"],
  Publisher:    ["Publishing catalog", "Royalty statements", "Registration status"],
  Institution:  ["Scholarship management", "Award history", "Compliance reports"],
  Employer:     ["Payroll access", "1099 management", "Contractor payments"],
  Administrator:["Full system access", "User management", "Permission control", "Audit logs"],
};

export default function Settings() {
  const { user, logout } = useAuth();
  const perms = PERMISSIONS[user?.role] || PERMISSIONS.Artist;

  return (
    <div className="space-y-8" data-testid="settings-page">
      <PageHeader
        kicker="Settings"
        title={<>Your Vaulta <span className="gradient-text">preferences.</span></>}
        subtitle="Profile, permissions, security, and preferences for your creator financial operating system."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <GlassCard testid="settings-profile">
          <SectionHeader kicker="Profile" title="Account" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full gradient-bar flex items-center justify-center text-[22px] font-bold text-black">
              {user?.name?.[0] || "V"}
            </div>
            <div>
              <div className="font-display text-xl">{user?.name}</div>
              <div className="text-[11px] tracking-[0.22em] uppercase text-white/50 mt-0.5">{user?.role}</div>
              <div className="text-[12px] text-white/60 mt-1">{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} className="w-full py-2.5 rounded-lg border border-white/10 hover:bg-white/[0.04] text-[12px] font-medium" data-testid="settings-signout">
            Sign Out
          </button>
        </GlassCard>

        <GlassCard testid="settings-permissions">
          <SectionHeader kicker="Access Control" title={`${user?.role} Permissions`} />
          <div className="space-y-2">
            {perms.map((p) => (
              <div key={p} className="flex items-center gap-2 p-2 rounded-md bg-white/[0.02] border border-white/[0.05]">
                <Check size={12} className="text-emerald-400" />
                <span className="text-[12.5px]">{p}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg gradient-border">
            <div className="text-[10px] tracking-[0.22em] uppercase text-white/45">Role Info</div>
            <div className="text-[12px] text-white/70 mt-1">
              Vaulta supports granular permissions across all ten creator ecosystem roles.
              Contact your administrator to modify access.
            </div>
          </div>
        </GlassCard>

        <GlassCard testid="settings-security">
          <SectionHeader kicker="Security" title="Session & Encryption" />
          <div className="space-y-3">
            <SecurityRow label="Two-Factor Authentication" status="Enabled" />
            <SecurityRow label="Vault Encryption" status="AES-256" />
            <SecurityRow label="Session Timeout" status="24 hours" />
            <SecurityRow label="Login Alerts" status="Enabled" />
            <SecurityRow label="Passport Sync (ANCRID)" status="Verified L3" />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function SecurityRow({ label, status }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-md border border-white/[0.05] bg-white/[0.02]">
      <span className="text-[12.5px]">{label}</span>
      <span className="text-[11px] text-emerald-400 tracking-[0.14em] uppercase">{status}</span>
    </div>
  );
}
