import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { CynaiahLogoLarge, PoweredByAncr } from "@/components/cynaiah/Brand";
import { TID } from "@/constants/testIds";
import { Loader2, ArrowRight } from "lucide-react";

const DEMO_EMAIL = "student@cynaiah.demo";
const DEMO_PASSWORD = "Cynaiah2026!";

const HERO_IMAGE =
    "https://images.pexels.com/photos/10395639/pexels-photo-10395639.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400";

export default function Login() {
    const nav = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e?.preventDefault();
        setBusy(true);
        try {
            await login(email, password);
            toast.success("Welcome to CYNAIAH.");
            nav("/", { replace: true });
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Login failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-[1fr_540px] bg-[#030303] text-white overflow-hidden">
            {/* Cinematic side */}
            <div className="relative hidden lg:block overflow-hidden">
                <img
                    src={HERO_IMAGE}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-45"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#030303] via-[#030303]/70 to-transparent" />
                <div className="cyn-hero-glow animate-beam-drift" />
                <div className="relative h-full flex flex-col justify-between p-12 xl:p-16">
                    <div className="flex items-center justify-between">
                        <PoweredByAncr />
                        <span className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                            An ANCR Ecosystem School
                        </span>
                    </div>

                    <div className="max-w-xl animate-fade-up">
                        <div className="text-[11px] tracking-[0.36em] uppercase text-white/50">
                            School of Film, Visual Storytelling & Emerging Media
                        </div>
                        <h2 className="mt-4 font-heading text-4xl xl:text-6xl font-light tracking-tight leading-[1.05]">
                            Where story becomes
                            <br />
                            <span className="cyn-text-gradient">moving image</span>.
                        </h2>
                        <p className="mt-5 text-white/60 text-base leading-relaxed max-w-lg">
                            CYNAIAH is the film, visual-production, animation, CGI, and
                            emerging-media environment inside the ANCR ecosystem — where
                            traditional craft meets AI-assisted cinematography.
                        </p>
                    </div>

                    <div className="text-[10px] tracking-[0.32em] uppercase text-white/35">
                        Vision · Story · Impact
                    </div>
                </div>
            </div>

            {/* Form side */}
            <div className="relative flex items-center justify-center p-8 sm:p-12 border-l border-white/[0.05] bg-[#050506]">
                <div className="cyn-hero-glow opacity-40 -z-0" />
                <div className="w-full max-w-md relative">
                    <div className="flex justify-center mb-8">
                        <CynaiahLogoLarge className="w-56" />
                    </div>

                    <div className="text-center">
                        <div className="text-[10px] uppercase tracking-[0.32em] text-white/40">
                            Sign in to CYNAIAH
                        </div>
                        <h1 className="font-heading text-3xl font-light mt-2 tracking-tight">
                            Continue your work.
                        </h1>
                    </div>

                    <form onSubmit={submit} className="mt-8 space-y-4">
                        <div>
                            <label className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                                Email
                            </label>
                            <input
                                data-testid={TID.loginEmail}
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@studio.com"
                                className="mt-2 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cynaiah-cyan/60"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                                Password
                            </label>
                            <input
                                data-testid={TID.loginPassword}
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="mt-2 w-full rounded-md bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cynaiah-cyan/60"
                            />
                        </div>

                        <button
                            data-testid={TID.loginSubmit}
                            type="submit"
                            disabled={busy}
                            className="cyn-btn-primary w-full rounded-md px-5 py-3 text-sm font-medium tracking-wide flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
                            {busy ? "Signing in…" : "Sign in"}
                            {!busy && <ArrowRight size={15} />}
                        </button>

                        <button
                            type="button"
                            data-testid={TID.demoFillBtn}
                            onClick={() => {
                                setEmail(DEMO_EMAIL);
                                setPassword(DEMO_PASSWORD);
                                setTimeout(() => submit(), 100);
                            }}
                            className="cyn-btn-ghost w-full rounded-md px-5 py-3 text-sm font-medium tracking-wide"
                        >
                            Enter as demo student — Aria Okafor
                        </button>
                    </form>

                    <div className="mt-8 flex items-center justify-between text-[12px] text-white/50">
                        <span>
                            New to CYNAIAH?{" "}
                            <Link
                                data-testid={TID.switchToRegister}
                                to="/auth/register"
                                className="text-white hover:text-cynaiah-cyan transition-colors"
                            >
                                Create a creator account
                            </Link>
                        </span>
                    </div>

                    <div className="mt-10 pt-6 border-t border-white/[0.06] text-[10px] uppercase tracking-[0.24em] text-white/35 text-center">
                        Temporary auth — will be replaced by ANCRID single sign-on
                    </div>
                </div>
            </div>
        </div>
    );
}
