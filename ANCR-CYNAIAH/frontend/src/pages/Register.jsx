import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { CynaiahLogoLarge } from "@/components/cynaiah/Brand";
import { TID } from "@/constants/testIds";
import { ROLES } from "@/lib/constants";
import { Loader2, ArrowRight } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Register() {
    const nav = useNavigate();
    const { register } = useAuth();
    const [form, setForm] = useState({
        email: "",
        name: "",
        password: "",
        role: "student",
    });
    const [busy, setBusy] = useState(false);

    const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target?.value ?? e }));

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            await register(form);
            toast.success("Account created. Welcome to CYNAIAH.");
            nav("/", { replace: true });
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Registration failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#030303] p-8 relative overflow-hidden">
            <div className="cyn-hero-glow opacity-50 animate-beam-drift" />
            <div className="relative w-full max-w-md glass rounded-2xl p-8">
                <div className="flex justify-center mb-6">
                    <CynaiahLogoLarge className="w-48" />
                </div>
                <div className="text-center">
                    <div className="text-[10px] uppercase tracking-[0.32em] text-white/40">
                        Create a creator account
                    </div>
                    <h1 className="font-heading text-3xl font-light mt-2">
                        Join CYNAIAH.
                    </h1>
                </div>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div>
                        <label className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                            Full name
                        </label>
                        <input
                            data-testid={TID.registerName}
                            required
                            value={form.name}
                            onChange={change("name")}
                            className="mt-2 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cynaiah-cyan/60"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                            Email
                        </label>
                        <input
                            data-testid={TID.registerEmail}
                            type="email"
                            required
                            value={form.email}
                            onChange={change("email")}
                            className="mt-2 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                            Password
                        </label>
                        <input
                            data-testid={TID.registerPassword}
                            type="password"
                            required
                            minLength={6}
                            value={form.password}
                            onChange={change("password")}
                            className="mt-2 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white focus:outline-none focus:border-cynaiah-cyan/60"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                            Role
                        </label>
                        <Select
                            value={form.role}
                            onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
                        >
                            <SelectTrigger
                                data-testid={TID.registerRole}
                                className="mt-2 bg-white/[0.03] border-white/[0.08] text-white h-12"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0C] border-white/10 text-white">
                                {ROLES.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <button
                        data-testid={TID.registerSubmit}
                        disabled={busy}
                        className="cyn-btn-primary w-full rounded-md px-5 py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {busy ? <Loader2 size={16} className="animate-spin" /> : null}
                        {busy ? "Creating…" : "Create account"}
                        {!busy && <ArrowRight size={15} />}
                    </button>
                </form>

                <div className="mt-6 text-center text-[12px] text-white/50">
                    Already a member?{" "}
                    <Link
                        data-testid={TID.switchToLogin}
                        to="/auth/login"
                        className="text-white hover:text-cynaiah-cyan"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
