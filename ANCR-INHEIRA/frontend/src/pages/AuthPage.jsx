import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AUTH_UI } from '@/constants/testIds';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import { InheiraMark, AncrMark } from '@/components/BrandLogos';

export default function AuthPage() {
    const [params] = useSearchParams();
    const [tab, setTab] = useState(params.get('mode') === 'register' ? 'register' : 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const nav = useNavigate();

    const handleGoogle = () => {
        // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
        const redirectUrl = window.location.origin + '/dashboard';
        window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErr('');
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back');
            nav('/dashboard');
        } catch (e) {
            setErr(e?.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErr('');
        setLoading(true);
        try {
            await register(email, password, name);
            toast.success('RightPrint created');
            nav('/profile');
        } catch (e) {
            setErr(e?.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 grid md:grid-cols-2">
            {/* Left brand panel */}
            <div className="hidden md:flex relative border-r border-zinc-900 p-12 flex-col justify-between overflow-hidden">
                <Link to="/" className="flex items-center gap-2">
                    <InheiraMark className="h-12 w-auto" />
                </Link>
                <div className="relative z-10">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-6">
                        / Product Vision 1.0
                    </div>
                    <h1 className="font-display font-black text-5xl lg:text-6xl tracking-tighter leading-[0.95] text-white">
                        Where creativity<br />
                        becomes<br />
                        <span className="bg-gradient-to-r from-sky-200 via-indigo-100 to-violet-200 bg-clip-text text-transparent">legacy.</span>
                    </h1>
                    <p className="mt-8 max-w-md text-zinc-500 leading-relaxed">
                        Every creator owns one permanent RightPrint™. Every contribution becomes part of a lasting creative record.
                    </p>
                </div>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-700 flex items-center gap-3">
                    <span>Powered by</span>
                    <AncrMark className="h-6 w-auto opacity-80" />
                </div>
            </div>

            {/* Right auth form */}
            <div className="flex items-center justify-center p-6 md:p-16">
                <div className="w-full max-w-md">
                    <Link to="/" className="md:hidden flex items-center gap-2 mb-10">
                        <InheiraMark className="h-10 w-auto" />
                    </Link>

                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-4">
                        {tab === 'login' ? '/ SIGN IN' : '/ CREATE YOUR RIGHTPRINT'}
                    </div>
                    <h2 className="font-display font-bold text-4xl tracking-tighter text-white mb-2">
                        {tab === 'login' ? 'Welcome back.' : 'Your legacy begins here.'}
                    </h2>
                    <p className="text-zinc-500 text-sm mb-8">
                        {tab === 'login' ? 'Sign in to your INHEIRA™ workspace.' : 'One permanent identity across every session, every creation, every deal.'}
                    </p>

                    <Button
                        onClick={handleGoogle}
                        data-testid={AUTH_UI.googleBtn}
                        variant="outline"
                        className="w-full border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white text-zinc-200 h-11 mb-4"
                    >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </Button>

                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-zinc-900" />
                        <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">or</span>
                        <div className="flex-1 h-px bg-zinc-900" />
                    </div>

                    <Tabs value={tab} onValueChange={setTab}>
                        <TabsList className="grid grid-cols-2 bg-zinc-900 border border-zinc-800">
                            <TabsTrigger value="login" data-testid={AUTH_UI.tabLogin} className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Sign in</TabsTrigger>
                            <TabsTrigger value="register" data-testid={AUTH_UI.tabRegister} className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Register</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login" className="mt-6">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">Email</Label>
                                    <Input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        data-testid={AUTH_UI.emailInput}
                                        className="mt-2 bg-zinc-900 border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400"
                                        placeholder="you@studio.com"
                                    />
                                </div>
                                <div>
                                    <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">Password</Label>
                                    <Input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        data-testid={AUTH_UI.passwordInput}
                                        className="mt-2 bg-zinc-900 border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {err && <div data-testid={AUTH_UI.errorMsg} className="text-sm text-red-400 font-mono-metadata">{err}</div>}
                                <Button type="submit" data-testid={AUTH_UI.submitLogin} disabled={loading} className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-semibold h-11">
                                    {loading ? 'Signing in…' : 'Sign in'}
                                    <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register" className="mt-6">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">Full name</Label>
                                    <Input
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        data-testid={AUTH_UI.nameInput}
                                        className="mt-2 bg-zinc-900 border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400"
                                        placeholder="Your professional name"
                                    />
                                </div>
                                <div>
                                    <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">Email</Label>
                                    <Input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        data-testid={AUTH_UI.emailInput}
                                        className="mt-2 bg-zinc-900 border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400"
                                        placeholder="you@studio.com"
                                    />
                                </div>
                                <div>
                                    <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">Password</Label>
                                    <Input
                                        type="password"
                                        required
                                        minLength={8}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        data-testid={AUTH_UI.passwordInput}
                                        className="mt-2 bg-zinc-900 border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400"
                                        placeholder="Min 8 characters"
                                    />
                                </div>
                                {err && <div data-testid={AUTH_UI.errorMsg} className="text-sm text-red-400 font-mono-metadata">{err}</div>}
                                <Button type="submit" data-testid={AUTH_UI.submitRegister} disabled={loading} className="w-full bg-indigo-400 hover:bg-indigo-500 text-zinc-950 font-bold h-11 shadow-[0_0_20px_rgba(139, 92, 246,0.2)]">
                                    {loading ? 'Creating your RightPrint…' : 'Create your RightPrint'}
                                    <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
