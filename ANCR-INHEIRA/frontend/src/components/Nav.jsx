import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { NAV } from '@/constants/testIds';
import { LogOut, User } from 'lucide-react';
import { InheiraMark } from '@/components/BrandLogos';
import EcosystemMenu from '@/components/EcosystemMenu';

export default function Nav() {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();
    const onLanding = loc.pathname === '/';

    const doLogout = async () => {
        await logout();
        nav('/');
    };

    return (
        <header className="sticky top-0 z-40 border-b border-white/5 glass">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
                <Link to="/" data-testid={NAV.logo} className="flex items-center gap-3 group">
                    <InheiraMark className="h-14 md:h-16 w-auto transition-transform group-hover:scale-105" />
                </Link>

                <nav className="hidden md:flex items-center gap-8 font-mono-metadata text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {user ? (
                        <>
                            <Link to="/dashboard" data-testid={NAV.dashboardLink} className="hover:text-white transition-colors">Home</Link>
                            <Link to="/writing-rooms" data-testid="nav-writing-rooms-link" className="hover:text-white transition-colors">Rooms</Link>
                            <Link to="/sessions" data-testid={NAV.sessionsLink} className="hover:text-white transition-colors">Sessions</Link>
                            <Link to="/profile" data-testid={NAV.profileLink} className="hover:text-white transition-colors">Profile</Link>
                            <EcosystemMenu />
                        </>
                    ) : (
                        <>
                            <a href="#features" className="hover:text-white transition-colors">Features</a>
                            <a href="#how" className="hover:text-white transition-colors">How it works</a>
                            <a href="#users" className="hover:text-white transition-colors">Built for</a>
                        </>
                    )}
                </nav>

                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <Link to="/profile" className="hidden sm:flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors">
                                {user.picture ? (
                                    <img src={user.picture} alt="" className="w-7 h-7 rounded-full border border-zinc-700" />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                        <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    </div>
                                )}
                                <span className="hidden md:inline">{user.name}</span>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={doLogout}
                                data-testid={NAV.signOut}
                                aria-label="Sign out"
                                className="text-zinc-400 hover:text-white hover:bg-zinc-900"
                            >
                                <LogOut className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                            </Button>
                        </>
                    ) : (
                        <>
                            {onLanding && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => nav('/auth')}
                                    data-testid={NAV.signIn}
                                    className="text-zinc-400 hover:text-white hover:bg-zinc-900"
                                >
                                    Sign in
                                </Button>
                            )}
                            <Button
                                size="sm"
                                onClick={() => nav('/auth?mode=register')}
                                data-testid={NAV.signUp}
                                className="bg-white text-zinc-950 hover:bg-zinc-200 font-semibold"
                            >
                                Begin Creating
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
