import { useAuth } from "@/context/AuthContext";
import { PageHeader, Section, TagPill } from "@/components/Bits";

const ECOSYSTEM = [
  ["ANCRID™", "Identity, verification, permissions"],
  ["ANCRA™", "Academic transcripts & faculty endorsements"],
  ["ANCRLAB™", "Creative labs — projects & collaborations"],
  ["ANCRSync™", "Sync/licensing opportunities & placements"],
  ["COHEIR™", "Industry endorsements & reputation"],
  ["INHEIRA™", "Publishing & rights administration"],
  ["Vaulta™", "Creator Passport™ & verified credentials"],
  ["ANCRMEDIA™", "Music, video and media releases"],
  ["ANCRD™", "Booking, touring & travel readiness"],
];

export default function Settings() {
  const { user } = useAuth();
  return (
    <div data-testid="settings-page">
      <PageHeader
        eyebrow="Settings · ANCRID™ Identity"
        title={<>{user?.full_name}</>}
        subtitle="Your identity is managed centrally by ANCRID™. Every module in the ecosystem consumes this record."
      />
      <Section className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="ANCRID" value={user?.ancrid} />
          <Field label="Email" value={user?.email} />
          <Field label="Role" value={(user?.role || "").replace("_", " ")} />
          <Field label="Discipline" value={user?.discipline || "—"} />
          <Field label="Institution" value={user?.institution || "—"} />
          <Field label="Country" value={user?.country || "—"} />
        </div>

        <div className="mt-16">
          <div className="label-eyebrow mb-6">Connected Ecosystem Services</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ECOSYSTEM.map(([name, desc]) => (
              <div key={name} className="border hair p-6 bg-[#050505] flex flex-col justify-between">
                <div>
                  <div className="font-display text-2xl">{name}</div>
                  <p className="text-white/50 text-sm mt-2 leading-relaxed">{desc}</p>
                </div>
                <div className="mt-4"><TagPill>Verified · Connected</TagPill></div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="border hair p-6 bg-[#050505]">
      <div className="label-eyebrow mb-2">{label}</div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}
